"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, Calendar, Edit, GalleryHorizontal, Mail, Phone, Plus } from "lucide-react";
import { ClientForm } from "@/components/forms/client-form";
import { SignedImage } from "@/components/media/signed-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { PageSkeleton } from "@/components/ui/skeleton";
import { getClient, subscribeGalleries, subscribeProperties } from "@/lib/firebase/firestore";
import type { Client, Gallery, Property } from "@/lib/types";
import { formatDate, initials } from "@/lib/utils";

export function ClientDetailView({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<Client | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getClient(clientId).then((value) => {
      setClient(value);
      setLoading(false);
    });
    const unsubProperties = subscribeProperties((items) => setProperties(items.filter((item) => item.clientId === clientId)));
    const unsubGalleries = subscribeGalleries((items) => setGalleries(items.filter((item) => item.clientId === clientId)));
    return () => {
      unsubProperties();
      unsubGalleries();
    };
  }, [clientId]);

  const shootDates = useMemo(() => {
    return properties.map((property) => property.shootDate).filter(Boolean).sort();
  }, [properties]);

  if (loading) return <PageSkeleton />;
  if (!client) return <EmptyState title="Client not found" body="This client may have been removed." />;

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="overflow-hidden">
          <div className="relative h-64">
            {client.thumbnailPath ? (
              <SignedImage path={client.thumbnailPath} alt={client.fullName} className="h-full w-full" />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-white/12 to-white/[0.03] text-5xl font-semibold text-white/60">{initials(client.fullName)}</div>
            )}
          </div>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/35">Client profile</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{client.fullName}</h2>
                <div className="mt-4 grid gap-2 text-sm text-white/55">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-white/30" />
                    {client.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-white/30" />
                    {client.phone || "No phone"}
                  </p>
                </div>
              </div>
              <Badge status={client.paymentStatus} />
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="primary" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Link href={`/properties?client=${client.id}&new=1`}>
                <Button>
                  <Plus className="h-4 w-4" />
                  Property
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-lg font-semibold text-white">Notes</h3>
                <p className="text-sm text-white/45">{client.address || "No address saved"}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-white/58">{client.notes || "No notes yet."}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <Building2 className="h-5 w-5 text-white/45" />
              <p className="mt-3 text-3xl font-semibold text-white">{properties.length}</p>
              <p className="text-sm text-white/45">Properties</p>
            </Card>
            <Card className="p-5">
              <GalleryHorizontal className="h-5 w-5 text-white/45" />
              <p className="mt-3 text-3xl font-semibold text-white">{galleries.length}</p>
              <p className="text-sm text-white/45">Galleries</p>
            </Card>
            <Card className="p-5">
              <Calendar className="h-5 w-5 text-white/45" />
              <p className="mt-3 text-3xl font-semibold text-white">{shootDates.length}</p>
              <p className="text-sm text-white/45">Shoot dates</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Linked properties</h3>
          </CardHeader>
          <CardContent className="grid gap-2">
            {properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 transition hover:bg-white/10">
                <div>
                  <p className="text-sm font-medium text-white">{property.address}</p>
                  <p className="text-xs text-white/45">{property.city}, {property.state} {property.zip}</p>
                </div>
                <Badge status={property.paymentStatus} />
              </Link>
            ))}
            {!properties.length ? <p className="text-sm text-white/45">No linked properties yet.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Uploaded galleries</h3>
          </CardHeader>
          <CardContent className="grid gap-2">
            {galleries.map((gallery) => (
              <Link key={gallery.id} href={`/galleries/${gallery.id}`} className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 transition hover:bg-white/10">
                <div>
                  <p className="text-sm font-medium text-white">{gallery.title}</p>
                  <p className="text-xs text-white/45">{gallery.photoCount} photos · {formatDate(gallery.createdAt, "No upload date")}</p>
                </div>
                <Badge status={gallery.status} />
              </Link>
            ))}
            {!galleries.length ? <p className="text-sm text-white/45">No galleries uploaded yet.</p> : null}
          </CardContent>
        </Card>
      </section>

      <Modal open={editing} title="Edit client" onClose={() => setEditing(false)}>
        <ClientForm
          client={client}
          onSaved={() => {
            getClient(clientId).then(setClient);
            setEditing(false);
          }}
        />
      </Modal>
    </div>
  );
}

