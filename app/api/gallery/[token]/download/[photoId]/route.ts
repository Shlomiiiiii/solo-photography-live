import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { adminDb } from "@/lib/firebase/admin";
import { createSignedReadUrl } from "@/lib/server/storage";
import { getGalleryByToken } from "@/lib/server/galleries";
import { normalizeDate } from "@/lib/utils";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string; photoId: string }> }) {
  const { token, photoId } = await params;
  const gallery = await getGalleryByToken(token);
  if (!gallery) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

  const expiry = normalizeDate(gallery.tokenExpiresAt);
  const expired = Boolean(expiry && expiry.getTime() < Date.now());
  if (expired || !gallery.downloadEnabled || (!gallery.isPaid && gallery.paymentRequired)) {
    return NextResponse.json({ error: "Downloads are locked." }, { status: 403 });
  }

  const photoRef = adminDb.collection(COLLECTIONS.galleries).doc(gallery.id).collection("photos").doc(photoId);
  const photo = await photoRef.get();
  if (!photo.exists) return NextResponse.json({ error: "Photo not found." }, { status: 404 });

  await photoRef.update({
    downloadCount: FieldValue.increment(1)
  });

  const signed = await createSignedReadUrl(photo.data()?.storagePath, 10);
  return NextResponse.redirect(signed.url);
}
