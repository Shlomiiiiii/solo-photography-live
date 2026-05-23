"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, ExternalLink, GalleryHorizontal, Lock, Plus, Search, Trash2, Unlock } from "lucide-react";
import { toast } from "sonner";
import { GalleryForm } from "@/components/forms/gallery-form";
import { SignedImage } from "@/components/media/signed-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageSkeleton } from "@/components/ui/skeleton";
import { deleteGallery, subscribeGalleries } from "@/lib/firebase/firestore";
import type { Gallery } from "@/lib/types";
import { formatCurrency, getBaseUrl } from "@/lib/utils";

export function GalleriesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeGalleries((items) => {
      setGalleries(items);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setModalOpen(true);
      router.replace("/galleries");
    }
  }, [router, searchParams]);

  const filtered = useMemo(() => {
    const property = searchParams.get("property");
    const needle = query.trim().toLowerCase();
    return galleries
      .filter((gallery) => (property ? gallery.propertyId === property : true))
      .filter((gallery) => {
        if (!needle) return true;
        return `${gallery.title} ${gallery.clientName} ${gallery.propertyAddress}`.toLowerCase().includes(needle);
      });
  }, [galleries, query, searchParams]);

  async function remove(gallery: Gallery) {
    const ok = window.confirm(`Delete ${gallery.title}? Storage files are not deleted automatically.`);
    if (!ok) return;
    await deleteGallery(gallery.id);
    toast.success("Gallery deleted");
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/35">Gallery management</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Payment-gated delivery</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Upload photos, generate tokenized links, gate downloads behind Stripe, and track client access.</p>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <Input className="pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search galleries" />
        </div>
      </section>

      {loading ? <PageSkeleton /> : null}
      {!loading && !filtered.length ? <EmptyState title="No galleries found" body="Create a gallery, assign it to a client and property, then upload photos." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((gallery, index) => {
          const shareUrl = `${getBaseUrl()}/g/${gallery.token}`;
          return (
            <motion.div key={gallery.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
              <Card className="group overflow-hidden transition hover:border-white/20 hover:bg-white/[0.075]">
                <Link href={`/galleries/${gallery.id}`} className="block">
                  <div className="relative h-44">
                    {gallery.coverPhotoPath ? (
                      <SignedImage path={gallery.coverPhotoPath} alt={gallery.title} className="h-full w-full" />
                    ) : (
                      <div className="grid h-full place-items-center bg-gradient-to-br from-white/12 to-white/[0.03] text-white/45">
                        <GalleryHorizontal className="h-8 w-8" />
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs text-white/75 backdrop-blur-xl">
                      {gallery.photoCount} photos
                    </span>
                  </div>
                </Link>
                <div className="grid gap-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/galleries/${gallery.id}`} className="truncate text-lg font-semibold text-white transition hover:text-champagne">
                        {gallery.title}
                      </Link>
                      <p className="mt-1 truncate text-sm text-white/45">{gallery.propertyAddress || gallery.clientName}</p>
                      <p className="mt-1 text-xs text-white/35">{formatCurrency(gallery.amountCents)} unlock</p>
                    </div>
                    {gallery.status === "unlocked" ? <Unlock className="h-5 w-5 text-success" /> : <Lock className="h-5 w-5 text-warning" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge status={gallery.status} />
                    <Badge status={gallery.isPaid ? "paid" : "pending"} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" aria-label="Copy share link" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Link href={shareUrl} target="_blank">
                      <Button size="icon" variant="ghost" aria-label="Open share link">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button size="icon" variant="danger" aria-label="Delete gallery" onClick={() => remove(gallery)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <Button
        className="fixed bottom-5 right-5 z-30 h-14 w-14 rounded-3xl shadow-glow"
        size="icon"
        variant="primary"
        aria-label="Add gallery"
        onClick={() => setModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Modal open={modalOpen} title="New gallery" onClose={() => setModalOpen(false)}>
        <GalleryForm defaultPropertyId={searchParams.get("property")} onSaved={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

