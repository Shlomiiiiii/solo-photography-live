"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { Download, Maximize2, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { SignedImage } from "@/components/media/signed-image";
import { Button } from "@/components/ui/button";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase/client";
import { deletePhoto } from "@/lib/firebase/firestore";
import type { Photo } from "@/lib/types";
import { fileSize } from "@/lib/utils";

export function PhotoGrid({ galleryId, photos }: { galleryId: string; photos: Photo[] }) {
  const [active, setActive] = useState<Photo | null>(null);

  async function toggleFavorite(photo: Photo) {
    await updateDoc(doc(db, COLLECTIONS.galleries, galleryId, "photos", photo.id), {
      favorite: !photo.favorite
    });
  }

  async function remove(photo: Photo) {
    const ok = window.confirm(`Remove ${photo.fileName}?`);
    if (!ok) return;
    await deletePhoto(galleryId, photo);
    toast.success("Photo removed");
  }

  return (
    <>
      <div className="masonry">
        {photos.map((photo) => (
          <div key={photo.id} className="mb-4 break-inside-avoid overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.055]">
            <button className="relative block h-64 w-full sm:h-72" onClick={() => setActive(photo)} aria-label={`Open ${photo.fileName}`}>
              <SignedImage path={photo.storagePath} alt={photo.fileName} className="h-full w-full" />
              <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-2xl bg-black/45 text-white backdrop-blur-xl">
                <Maximize2 className="h-4 w-4" />
              </span>
            </button>
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{photo.fileName}</p>
                <p className="text-xs text-white/40">{fileSize(photo.sizeBytes)} · {photo.downloadCount ?? 0} downloads</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" aria-label="Favorite image" onClick={() => toggleFavorite(photo)}>
                  <Star className={photo.favorite ? "h-4 w-4 fill-warning text-warning" : "h-4 w-4"} />
                </Button>
                <Button size="icon" variant="danger" aria-label="Delete image" onClick={() => remove(photo)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button className="absolute right-4 top-4" size="icon" variant="secondary" onClick={() => setActive(null)} aria-label="Close image viewer">
              <X className="h-5 w-5" />
            </Button>
            <div className="relative h-[82vh] w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04]">
              <SignedImage path={active.storagePath} alt={active.fileName} className="h-full w-full" imageClassName="object-contain" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-white/65">
              <Download className="h-4 w-4" />
              {active.fileName}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
