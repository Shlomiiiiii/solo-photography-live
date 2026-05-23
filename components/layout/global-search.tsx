"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, GalleryHorizontal, Search, Users } from "lucide-react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase/client";
import type { Client, Gallery, Property } from "@/lib/types";

type SearchItem = {
  title: string;
  subtitle: string;
  href: string;
  type: "Client" | "Property" | "Gallery";
};

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [queryText, setQueryText] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  useEffect(() => {
    if (!open) return;
    const unsubClients = onSnapshot(query(collection(db, COLLECTIONS.clients), orderBy("fullNameLower", "asc"), limit(60)), (snapshot) => {
      setClients(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Client));
    });
    const unsubProperties = onSnapshot(query(collection(db, COLLECTIONS.properties), orderBy("sortZip", "asc"), limit(60)), (snapshot) => {
      setProperties(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Property));
    });
    const unsubGalleries = onSnapshot(query(collection(db, COLLECTIONS.galleries), orderBy("createdAt", "desc"), limit(60)), (snapshot) => {
      setGalleries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Gallery));
    });
    return () => {
      unsubClients();
      unsubProperties();
      unsubGalleries();
    };
  }, [open]);

  const results = useMemo(() => {
    const haystack: SearchItem[] = [
      ...clients.map((client) => ({
        title: client.fullName,
        subtitle: client.email,
        href: `/clients/${client.id}`,
        type: "Client" as const
      })),
      ...properties.map((property) => ({
        title: property.address,
        subtitle: `${property.city}, ${property.state} ${property.zip}`,
        href: `/properties/${property.id}`,
        type: "Property" as const
      })),
      ...galleries.map((gallery) => ({
        title: gallery.title,
        subtitle: gallery.propertyAddress ?? gallery.clientName ?? "Gallery",
        href: `/galleries/${gallery.id}`,
        type: "Gallery" as const
      }))
    ];

    const needle = queryText.trim().toLowerCase();
    if (!needle) return haystack.slice(0, 10);
    return haystack.filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(needle)).slice(0, 12);
  }, [clients, galleries, properties, queryText]);

  const icons = {
    Client: Users,
    Property: Building2,
    Gallery: GalleryHorizontal
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/70 p-3 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-panel mx-auto mt-20 max-w-2xl overflow-hidden rounded-[1.75rem]"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <Search className="h-5 w-5 text-white/40" />
              <Input autoFocus value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="Search clients, properties, galleries..." className="border-0 bg-transparent px-0" />
            </div>
            <div className="max-h-[60vh] overflow-auto p-2">
              {results.map((item) => {
                const Icon = icons[item.type];
                return (
                  <Link
                    key={`${item.type}-${item.href}`}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-white/10"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">{item.title}</span>
                      <span className="block truncate text-xs text-white/45">{item.type} · {item.subtitle}</span>
                    </span>
                  </Link>
                );
              })}
              {!results.length ? <p className="p-8 text-center text-sm text-white/45">No results found.</p> : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

