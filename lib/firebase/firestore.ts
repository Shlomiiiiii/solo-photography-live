"use client";

import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint
} from "firebase/firestore";
import { deleteObject, ref, uploadBytes, uploadBytesResumable, type UploadTaskSnapshot } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { COLLECTIONS } from "@/lib/constants";
import { db, storage } from "@/lib/firebase/client";
import { generateToken, slugify } from "@/lib/utils";
import type { Client, Gallery, PaymentStatus, Photo, Property } from "@/lib/types";

function withId<T>(documentId: string, data: DocumentData): T {
  return {
    id: documentId,
    ...data
  } as T;
}

export function subscribeClients(callback: (clients: Client[]) => void) {
  const q = query(collection(db, COLLECTIONS.clients), orderBy("fullNameLower", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => withId<Client>(item.id, item.data())));
  });
}

export async function upsertClient(input: Partial<Client> & Pick<Client, "fullName" | "email">) {
  const payload = {
    fullName: input.fullName,
    fullNameLower: input.fullName.toLowerCase(),
    phone: input.phone ?? "",
    email: input.email,
    address: input.address ?? "",
    notes: input.notes ?? "",
    paymentStatus: input.paymentStatus ?? "pending",
    linkedPropertyIds: input.linkedPropertyIds ?? [],
    shootDates: input.shootDates ?? [],
    uploadedGalleryIds: input.uploadedGalleryIds ?? [],
    thumbnailPath: input.thumbnailPath ?? "",
    lastShootDate: input.lastShootDate ?? "",
    updatedAt: serverTimestamp()
  };

  if (input.id) {
    await updateDoc(doc(db, COLLECTIONS.clients, input.id), payload);
    return input.id;
  }

  const created = await addDoc(collection(db, COLLECTIONS.clients), {
    ...payload,
    createdAt: serverTimestamp()
  });
  return created.id;
}

export async function deleteClient(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.clients, id));
}

export async function getClient(id: string) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.clients, id));
  return snapshot.exists() ? withId<Client>(snapshot.id, snapshot.data()) : null;
}

export function subscribeProperties(callback: (properties: Property[]) => void, clientId?: string) {
  const constraints: QueryConstraint[] = [
    orderBy("sortZip", "asc"),
    orderBy("sortState", "asc"),
    orderBy("sortCity", "asc")
  ];

  if (clientId) constraints.unshift(where("clientId", "==", clientId));

  return onSnapshot(query(collection(db, COLLECTIONS.properties), ...constraints), (snapshot) => {
    callback(snapshot.docs.map((item) => withId<Property>(item.id, item.data())));
  });
}

export async function upsertProperty(input: Partial<Property> & Pick<Property, "address" | "city" | "state" | "zip" | "clientId">) {
  const payload = {
    address: input.address,
    city: input.city,
    state: input.state.toUpperCase(),
    zip: input.zip,
    sortZip: input.zip.padStart(5, "0"),
    sortState: input.state.toUpperCase(),
    sortCity: input.city.toLowerCase(),
    clientId: input.clientId,
    clientName: input.clientName ?? "",
    shootDate: input.shootDate ?? "",
    notes: input.notes ?? "",
    coverImagePath: input.coverImagePath ?? "",
    galleryStatus: input.galleryStatus ?? "draft",
    paymentStatus: input.paymentStatus ?? "pending",
    revenueCents: input.revenueCents ?? 0,
    galleryId: input.galleryId ?? "",
    accessLocked: input.accessLocked ?? true,
    updatedAt: serverTimestamp()
  };

  if (input.id) {
    await updateDoc(doc(db, COLLECTIONS.properties, input.id), payload);
    return input.id;
  }

  const created = await addDoc(collection(db, COLLECTIONS.properties), {
    ...payload,
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(db, COLLECTIONS.clients, input.clientId), {
    linkedPropertyIds: arrayUnion(created.id),
    ...(input.shootDate ? { shootDates: arrayUnion(input.shootDate), lastShootDate: input.shootDate } : {}),
    updatedAt: serverTimestamp()
  });

  return created.id;
}

export async function deleteProperty(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.properties, id));
}

export async function getProperty(id: string) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.properties, id));
  return snapshot.exists() ? withId<Property>(snapshot.id, snapshot.data()) : null;
}

export function subscribeGalleries(callback: (galleries: Gallery[]) => void, propertyId?: string) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (propertyId) constraints.unshift(where("propertyId", "==", propertyId));

  return onSnapshot(query(collection(db, COLLECTIONS.galleries), ...constraints), (snapshot) => {
    callback(snapshot.docs.map((item) => withId<Gallery>(item.id, item.data())));
  });
}

export async function createGallery(input: {
  title: string;
  clientId: string;
  clientName?: string;
  propertyId: string;
  propertyAddress?: string;
  paymentRequired: boolean;
  amountCents: number;
  depositCents: number;
  downloadEnabled: boolean;
  watermarkEnabled: boolean;
  expirationDays: number;
}) {
  const token = generateToken();
  const expires = new Date(Date.now() + input.expirationDays * 24 * 60 * 60 * 1000).toISOString();
  const created = await addDoc(collection(db, COLLECTIONS.galleries), {
    ...input,
    token,
    tokenExpiresAt: expires,
    status: input.paymentRequired ? "locked" : "unlocked",
    isPaid: !input.paymentRequired,
    photoCount: 0,
    coverPhotoPath: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  await updateDoc(doc(db, COLLECTIONS.properties, input.propertyId), {
    galleryId: created.id,
    galleryStatus: input.paymentRequired ? "locked" : "unlocked",
    accessLocked: input.paymentRequired,
    updatedAt: serverTimestamp()
  });

  await updateDoc(doc(db, COLLECTIONS.clients, input.clientId), {
    uploadedGalleryIds: arrayUnion(created.id),
    updatedAt: serverTimestamp()
  });

  return created.id;
}

export async function updateGallery(id: string, input: Partial<Gallery>) {
  await updateDoc(doc(db, COLLECTIONS.galleries, id), {
    ...input,
    updatedAt: serverTimestamp()
  });
}

export async function deleteGallery(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.galleries, id));
}

export function subscribeGalleryPhotos(galleryId: string, callback: (photos: Photo[]) => void) {
  return onSnapshot(
    query(collection(db, COLLECTIONS.galleries, galleryId, "photos"), orderBy("uploadedAt", "desc")),
    (snapshot) => {
      callback(snapshot.docs.map((item) => withId<Photo>(item.id, item.data())));
    }
  );
}

export async function uploadGalleryPhotos(
  gallery: Gallery,
  files: File[],
  onProgress?: (progress: { fileName: string; percent: number; snapshot?: UploadTaskSnapshot }) => void
) {
  const uploaded: string[] = [];
  const uploadedPaths: string[] = [];

  for (const file of files) {
    const compressed = await imageCompression(file, {
      maxSizeMB: 8,
      maxWidthOrHeight: 4800,
      useWebWorker: true,
      initialQuality: 0.92
    });
    const preview = await imageCompression(file, {
      maxSizeMB: 0.7,
      maxWidthOrHeight: 1400,
      useWebWorker: true,
      initialQuality: 0.56
    });
    const photoId = crypto.randomUUID();
    const safeName = `${photoId}-${slugify(file.name.replace(/\.[^/.]+$/, "")) || "photo"}`;
    const storagePath = `galleries/${gallery.id}/photos/${safeName}`;
    const previewStoragePath = `galleries/${gallery.id}/previews/${safeName}`;
    const uploadRef = ref(storage, storagePath);
    const previewRef = ref(storage, previewStoragePath);

    await new Promise<void>((resolve, reject) => {
      const task = uploadBytesResumable(uploadRef, compressed, {
        contentType: compressed.type || file.type || "image/jpeg",
        customMetadata: {
          galleryId: gallery.id,
          clientId: gallery.clientId,
          propertyId: gallery.propertyId,
          originalName: file.name
        }
      });

      task.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress?.({ fileName: file.name, percent, snapshot });
        },
        reject,
        async () => {
          await uploadBytes(previewRef, preview, {
            contentType: preview.type || file.type || "image/jpeg",
            customMetadata: {
              galleryId: gallery.id,
              clientId: gallery.clientId,
              propertyId: gallery.propertyId,
              preview: "true",
              originalName: file.name
            }
          });
          await setDoc(doc(db, COLLECTIONS.galleries, gallery.id, "photos", photoId), {
            galleryId: gallery.id,
            fileName: file.name,
            storagePath,
            previewStoragePath,
            sizeBytes: compressed.size,
            contentType: compressed.type || file.type || "image/jpeg",
            favorite: false,
            downloadCount: 0,
            uploadedAt: serverTimestamp()
          });
          uploaded.push(photoId);
          uploadedPaths.push(storagePath);
          resolve();
        }
      );
    });
  }

  await updateDoc(doc(db, COLLECTIONS.galleries, gallery.id), {
    photoCount: (gallery.photoCount ?? 0) + uploaded.length,
    coverPhotoPath: gallery.coverPhotoPath || uploadedPaths[0] || "",
    updatedAt: serverTimestamp()
  });

  return uploaded;
}

export async function deletePhoto(galleryId: string, photo: Photo) {
  await deleteObject(ref(storage, photo.storagePath));
  if (photo.previewStoragePath) await deleteObject(ref(storage, photo.previewStoragePath));
  await deleteDoc(doc(db, COLLECTIONS.galleries, galleryId, "photos", photo.id));
}

export function subscribeRecentGalleries(callback: (galleries: Gallery[]) => void) {
  return onSnapshot(query(collection(db, COLLECTIONS.galleries), orderBy("createdAt", "desc"), limit(6)), (snapshot) => {
    callback(snapshot.docs.map((item) => withId<Gallery>(item.id, item.data())));
  });
}

export function paymentStatusFromPaid(isPaid: boolean): PaymentStatus {
  return isPaid ? "paid" : "pending";
}
