"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, ExternalLink, Lock, ShieldCheck, ToggleLeft, ToggleRight, Unlock } from "lucide-react";
import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { PhotoGrid } from "@/components/galleries/photo-grid";
import { PhotoUploader } from "@/components/galleries/photo-uploader";
import { SignedImage } from "@/components/media/signed-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSkeleton } from "@/components/ui/skeleton";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase/client";
import type { Gallery, Photo } from "@/lib/types";
import { formatCurrency, formatDate, getBaseUrl } from "@/lib/utils";

export function GalleryDetailView({ galleryId }: { galleryId: string }) {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const galleryRef = doc(db, COLLECTIONS.galleries, galleryId);
    getDoc(galleryRef).then((snapshot) => {
      setGallery(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Gallery) : null);
      setLoading(false);
    });
    const unsubGallery = onSnapshot(galleryRef, (snapshot) => {
      if (snapshot.exists()) setGallery({ id: snapshot.id, ...snapshot.data() } as Gallery);
    });
    const unsubPhotos = onSnapshot(query(collection(db, COLLECTIONS.galleries, galleryId, "photos"), orderBy("uploadedAt", "desc")), (snapshot) => {
      setPhotos(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Photo));
    });
    return () => {
      unsubGallery();
      unsubPhotos();
    };
  }, [galleryId]);

  if (loading) return <PageSkeleton />;
  if (!gallery) return <EmptyState title="Gallery not found" body="This gallery may have been removed." />;

  const shareUrl = `${getBaseUrl()}/g/${gallery.token}`;

  async function toggleField(field: "downloadEnabled" | "watermarkEnabled" | "isPaid") {
    if (!gallery) return;
    const next = !gallery[field];
    await updateDoc(doc(db, COLLECTIONS.galleries, gallery.id), {
      [field]: next,
      ...(field === "isPaid" ? { status: next ? "unlocked" : "locked" } : {})
    });
    toast.success("Gallery updated");
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden">
          <div className="relative h-72">
            {gallery.coverPhotoPath ? (
              <SignedImage path={gallery.coverPhotoPath} alt={gallery.title} className="h-full w-full" />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-white/12 to-white/[0.03] text-white/45">
                <ShieldCheck className="h-10 w-10" />
              </div>
            )}
          </div>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/35">Secure gallery</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{gallery.title}</h2>
                <p className="mt-2 text-sm text-white/52">{gallery.propertyAddress || "No property"} · {gallery.clientName || "No client"}</p>
              </div>
              {gallery.status === "unlocked" ? <Unlock className="h-6 w-6 text-success" /> : <Lock className="h-6 w-6 text-warning" />}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge status={gallery.status} />
              <Badge status={gallery.isPaid ? "paid" : "pending"} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-white/45">Unlock price</p>
              <p className="mt-3 text-xl font-semibold text-white">{formatCurrency(gallery.amountCents)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-white/45">Deposit</p>
              <p className="mt-3 text-xl font-semibold text-white">{formatCurrency(gallery.depositCents)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-white/45">Expires</p>
              <p className="mt-3 text-xl font-semibold text-white">{formatDate(gallery.tokenExpiresAt, "Never")}</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-lg font-semibold text-white">Share link</h3>
                <p className="text-sm text-white/45">Tokenized client gallery URL.</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-sm text-white/55">
                <p className="break-all">{shareUrl}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Link href={shareUrl} target="_blank">
                  <Button>
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-lg font-semibold text-white">Permissions</h3>
                <p className="text-sm text-white/45">Control download, watermark, and manual unlock state.</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[
                ["downloadEnabled", "Downloads enabled after payment"],
                ["watermarkEnabled", "Watermark locked previews"],
                ["isPaid", "Manual paid/unlocked state"]
              ].map(([field, label]) => {
                const enabled = Boolean(gallery[field as "downloadEnabled" | "watermarkEnabled" | "isPaid"]);
                return (
                  <button
                    key={field}
                    className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 text-left text-sm text-white/70 transition hover:bg-white/10"
                    onClick={() => toggleField(field as "downloadEnabled" | "watermarkEnabled" | "isPaid")}
                  >
                    <span>{label}</span>
                    {enabled ? <ToggleRight className="h-6 w-6 text-success" /> : <ToggleLeft className="h-6 w-6 text-white/35" />}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold text-white">Upload photos</h3>
            <p className="text-sm text-white/45">Drag and drop multi-photo upload with progress bars.</p>
          </div>
        </CardHeader>
        <CardContent>
          <PhotoUploader gallery={gallery} />
        </CardContent>
      </Card>

      <section>
        {photos.length ? <PhotoGrid galleryId={gallery.id} photos={photos} /> : <EmptyState title="No photos uploaded" body="Upload high-resolution photography to generate the locked preview and downloadable gallery." />}
      </section>
    </div>
  );
}

