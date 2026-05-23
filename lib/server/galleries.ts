import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { adminDb } from "@/lib/firebase/admin";
import { createSignedReadUrl } from "@/lib/server/storage";
import type { Gallery, Photo } from "@/lib/types";
import { normalizeDate } from "@/lib/utils";

export type PublicGalleryPhoto = Photo & {
  signedUrl: string;
  downloadUrl?: string;
};

export type PublicGalleryPayload = {
  gallery: Gallery;
  photos: PublicGalleryPhoto[];
  expired: boolean;
  unlocked: boolean;
};

export async function getGalleryByToken(token: string) {
  const snapshot = await adminDb.collection(COLLECTIONS.galleries).where("token", "==", token).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  } as Gallery;
}

export async function getGalleryPhotos(galleryId: string) {
  const snapshot = await adminDb.collection(COLLECTIONS.galleries).doc(galleryId).collection("photos").orderBy("uploadedAt", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Photo);
}

export async function getPublicGallery(token: string): Promise<PublicGalleryPayload | null> {
  const gallery = await getGalleryByToken(token);
  if (!gallery) return null;

  const expiry = normalizeDate(gallery.tokenExpiresAt);
  const expired = Boolean(expiry && expiry.getTime() < Date.now());
  const unlocked = !expired && (gallery.isPaid || gallery.status === "unlocked" || !gallery.paymentRequired);
  const photos = await getGalleryPhotos(gallery.id);

  const signedPhotos = await Promise.all(
    photos.map(async (photo) => {
      const displayPath = unlocked ? photo.storagePath : photo.previewStoragePath || photo.storagePath;
      const signed = await createSignedReadUrl(displayPath, unlocked ? 20 : 5);
      const download = unlocked && gallery.downloadEnabled ? await createSignedReadUrl(photo.storagePath, 20) : null;
      return {
        ...photo,
        signedUrl: signed.url,
        downloadUrl: download?.url
      };
    })
  );

  return {
    gallery,
    photos: signedPhotos,
    expired,
    unlocked
  };
}

export async function unlockGalleryFromPayment(input: {
  galleryId: string;
  amountCents: number;
  currency: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  customerEmail?: string | null;
}) {
  const galleryRef = adminDb.collection(COLLECTIONS.galleries).doc(input.galleryId);
  const gallerySnapshot = await galleryRef.get();
  if (!gallerySnapshot.exists) return null;

  const gallery = { id: gallerySnapshot.id, ...gallerySnapshot.data() } as Gallery;
  const transactionRef = adminDb.collection(COLLECTIONS.transactions).doc(input.stripeSessionId);

  await adminDb.runTransaction(async (transaction) => {
    transaction.set(
      transactionRef,
      {
        galleryId: input.galleryId,
        clientId: gallery.clientId,
        propertyId: gallery.propertyId,
        amountCents: input.amountCents,
        currency: input.currency,
        status: "paid",
        stripeSessionId: input.stripeSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId ?? "",
        customerEmail: input.customerEmail ?? "",
        createdAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    transaction.update(galleryRef, {
      isPaid: true,
      status: "unlocked",
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      stripeCheckoutSessionId: input.stripeSessionId
    });
    transaction.update(adminDb.collection(COLLECTIONS.properties).doc(gallery.propertyId), {
      accessLocked: false,
      galleryStatus: "unlocked",
      paymentStatus: "paid",
      revenueCents: FieldValue.increment(input.amountCents),
      updatedAt: FieldValue.serverTimestamp()
    });
    transaction.update(adminDb.collection(COLLECTIONS.clients).doc(gallery.clientId), {
      paymentStatus: "paid",
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  return gallery;
}

