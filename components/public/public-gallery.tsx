"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, Lock, Maximize2, ShieldCheck, Sparkles, X } from "lucide-react";
import { CheckoutButton } from "@/components/public/checkout-button";
import { Button } from "@/components/ui/button";
import type { PublicGalleryPayload, PublicGalleryPhoto } from "@/lib/server/galleries";
import { formatCurrency, formatDate } from "@/lib/utils";

export function PublicGallery({ payload, success }: { payload: PublicGalleryPayload; success?: boolean }) {
  const { gallery, photos, unlocked, expired } = payload;
  const [active, setActive] = useState<PublicGalleryPhoto | null>(null);

  const hero = photos[0];
  const subtitle = useMemo(() => {
    if (expired) return "This secure gallery link has expired.";
    if (unlocked) return "Your full-resolution gallery is unlocked.";
    return "Preview images are locked until payment is complete.";
  }, [expired, unlocked]);

  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="relative flex min-h-[76vh] items-end overflow-hidden px-4 pb-8 pt-24 sm:px-8">
        {hero ? (
          <Image
            src={hero.signedUrl}
            alt={gallery.title}
            fill
            priority
            sizes="100vw"
            className={unlocked ? "object-cover opacity-55" : "object-cover opacity-45 blur-md scale-105"}
          />
        ) : (
          <div className="absolute inset-0 bg-luxury-radial" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/35" />
        <div className="relative z-10 w-full max-w-6xl">
          <p className="text-sm uppercase tracking-[0.3em] text-champagne/70">Solo Photography NY</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.03em] text-white sm:text-7xl">{gallery.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">{subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {unlocked ? (
              <span className="inline-flex h-12 items-center gap-2 rounded-2xl border border-success/30 bg-success/10 px-4 text-sm font-medium text-success">
                <ShieldCheck className="h-4 w-4" />
                Unlocked
              </span>
            ) : (
              <CheckoutButton token={gallery.token} label={`Unlock for ${formatCurrency(gallery.amountCents)}`} />
            )}
            {gallery.depositCents > 0 && !unlocked && !expired ? <CheckoutButton token={gallery.token} mode="deposit" label={`Pay deposit ${formatCurrency(gallery.depositCents)}`} /> : null}
            <span className="inline-flex h-12 items-center rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white/60">{photos.length} photos</span>
            <span className="inline-flex h-12 items-center rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white/60">Expires {formatDate(gallery.tokenExpiresAt, "never")}</span>
          </div>
        </div>
      </section>

      {success ? (
        <motion.div className="mx-auto -mt-8 mb-8 max-w-6xl px-4 sm:px-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-success/30 bg-success/10 p-4 text-success">
            <CheckCircle2 className="h-5 w-5" />
            Payment confirmed. Your gallery will refresh unlocked automatically after Stripe finishes processing the webhook.
          </div>
        </motion.div>
      ) : null}

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-8">
        {!unlocked && !expired ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                  <Lock className="h-5 w-5 text-warning" />
                </span>
                <div>
                  <p className="font-medium text-white">Payment-gated full-resolution delivery</p>
                  <p className="mt-1 text-sm text-white/50">Photos remain private until Stripe confirms payment.</p>
                </div>
              </div>
              <CheckoutButton token={gallery.token} label="Proceed to payment" />
            </div>
          </div>
        ) : null}

        {expired ? (
          <div className="rounded-[1.75rem] border border-danger/30 bg-danger/10 p-6 text-danger">This gallery link has expired. Contact Solo Photography NY for a renewed delivery link.</div>
        ) : null}

        <div className="masonry">
          {photos.map((photo) => (
            <motion.div key={photo.id} className="mb-4 break-inside-avoid overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.055]" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button className="relative block h-72 w-full" onClick={() => setActive(photo)}>
                <Image
                  src={photo.signedUrl}
                  alt={photo.fileName}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  className={unlocked ? "object-cover" : "object-cover blur-sm scale-105"}
                />
                {!unlocked ? (
                  <div className="absolute inset-0 grid place-items-center bg-black/20">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-black/55 backdrop-blur-xl">
                      <Lock className="h-5 w-5" />
                    </span>
                  </div>
                ) : (
                  <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-2xl bg-black/45 backdrop-blur-xl">
                    <Maximize2 className="h-4 w-4" />
                  </span>
                )}
                {!unlocked && gallery.watermarkEnabled ? <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1 text-xs text-white/70 backdrop-blur-xl">Solo Photography NY</span> : null}
              </button>
              <div className="flex items-center justify-between p-3">
                <p className="truncate text-sm text-white/55">{photo.fileName}</p>
                {unlocked && gallery.downloadEnabled ? (
                  <a href={`/api/gallery/${gallery.token}/download/${photo.id}`} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink transition hover:bg-champagne" aria-label={`Download ${photo.fileName}`}>
                    <Download className="h-4 w-4" />
                  </a>
                ) : (
                  <Sparkles className="h-4 w-4 text-white/35" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {active ? (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/92 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button className="absolute right-4 top-4" size="icon" variant="secondary" onClick={() => setActive(null)} aria-label="Close viewer">
              <X className="h-5 w-5" />
            </Button>
            <div className="relative h-[82vh] w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04]">
              <Image src={active.signedUrl} alt={active.fileName} fill sizes="100vw" className={unlocked ? "object-contain" : "object-contain blur-sm scale-105"} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

