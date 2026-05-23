"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, Edit, ExternalLink, GalleryHorizontal, Lock, Plus, Unlock, WalletCards } from "lucide-react";
import { PropertyForm } from "@/components/forms/property-form";
import { SignedImage } from "@/components/media/signed-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { PageSkeleton } from "@/components/ui/skeleton";
import { getProperty, subscribeGalleries, subscribeGalleryPhotos } from "@/lib/firebase/firestore";
import type { Gallery, Photo, Property } from "@/lib/types";
import { formatCurrency, formatDate, getBaseUrl } from "@/lib/utils";

export function PropertyDetailView({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getProperty(propertyId).then((value) => {
      setProperty(value);
      setLoading(false);
    });
    const unsubGalleries = subscribeGalleries((items) => setGalleries(items.filter((gallery) => gallery.propertyId === propertyId)));
    return unsubGalleries;
  }, [propertyId]);

  const gallery = galleries[0];

  useEffect(() => {
    if (!gallery?.id) {
      setPhotos([]);
      return;
    }
    return subscribeGalleryPhotos(gallery.id, setPhotos);
  }, [gallery?.id]);

  if (loading) return <PageSkeleton />;
  if (!property) return <EmptyState title="Property not found" body="This property may have been removed." />;

  const shareUrl = gallery ? `${getBaseUrl()}/g/${gallery.token}` : "";

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden">
          <div className="relative h-72">
            {property.coverImagePath || gallery?.coverPhotoPath ? (
              <SignedImage path={property.coverImagePath || gallery?.coverPhotoPath} alt={property.address} className="h-full w-full" />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-white/12 to-white/[0.03] text-white/45">
                <GalleryHorizontal className="h-10 w-10" />
              </div>
            )}
          </div>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/35">{property.zip} · {property.state}</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{property.address}</h2>
                <p className="mt-2 text-sm text-white/52">{property.city}, {property.state} {property.zip}</p>
                <p className="mt-1 text-sm text-white/42">{property.clientName}</p>
              </div>
              {property.accessLocked ? <Lock className="h-6 w-6 text-warning" /> : <Unlock className="h-6 w-6 text-success" />}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge status={property.galleryStatus} />
              <Badge status={property.paymentStatus} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Link href={`/galleries?property=${property.id}&new=1`}>
                <Button>
                  <Plus className="h-4 w-4" />
                  Gallery
                </Button>
              </Link>
              {gallery ? (
                <Link href={`/galleries/${gallery.id}`}>
                  <Button variant="ghost">
                    <GalleryHorizontal className="h-4 w-4" />
                    Manage
                  </Button>
                </Link>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-white/45">Shoot date</p>
              <p className="mt-3 text-xl font-semibold text-white">{formatDate(property.shootDate)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-white/45">Revenue</p>
              <p className="mt-3 text-xl font-semibold text-white">{formatCurrency(property.revenueCents)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-white/45">Gallery photos</p>
              <p className="mt-3 text-xl font-semibold text-white">{photos.length}</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-lg font-semibold text-white">Property notes</h3>
                <p className="text-sm text-white/45">Details for shoot and delivery.</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-white/58">{property.notes || "No notes yet."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-lg font-semibold text-white">Payment-gated access</h3>
                <p className="text-sm text-white/45">Stripe status and secure client link.</p>
              </div>
              <WalletCards className="h-5 w-5 text-white/35" />
            </CardHeader>
            <CardContent className="grid gap-3">
              {gallery ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge status={gallery.status} />
                    <Badge status={gallery.isPaid ? "paid" : "pending"} />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-sm text-white/55">
                    <p className="break-all">{shareUrl}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={shareUrl} target="_blank">
                      <Button variant="primary">
                        <ExternalLink className="h-4 w-4" />
                        Open link
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                      }}
                    >
                      Copy link
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/45">Create a gallery to generate a secure payment-gated link.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold text-white">Uploaded gallery</h3>
            <p className="text-sm text-white/45">Download links become available after payment unlock.</p>
          </div>
        </CardHeader>
        <CardContent>
          {photos.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {photos.slice(0, 8).map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055]">
                  <SignedImage path={photo.storagePath} alt={photo.fileName} className="h-40 w-full" />
                  <div className="flex items-center justify-between p-3">
                    <p className="truncate text-xs text-white/50">{photo.fileName}</p>
                    <Download className="h-4 w-4 text-white/35" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/45">No photos uploaded yet.</p>
          )}
        </CardContent>
      </Card>

      <Modal open={editing} title="Edit property" onClose={() => setEditing(false)}>
        <PropertyForm
          property={property}
          onSaved={() => {
            getProperty(propertyId).then(setProperty);
            setEditing(false);
          }}
        />
      </Modal>
    </div>
  );
}

