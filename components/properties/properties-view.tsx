"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Edit, Lock, Plus, Search, Trash2, Unlock, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { PropertyForm } from "@/components/forms/property-form";
import { SignedImage } from "@/components/media/signed-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageSkeleton } from "@/components/ui/skeleton";
import { deleteProperty, subscribeProperties } from "@/lib/firebase/firestore";
import type { Property } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function PropertiesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Property | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeProperties((items) => {
      setProperties(items);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setModalOpen(true);
      router.replace("/properties");
    }
  }, [router, searchParams]);

  const filtered = useMemo(() => {
    const client = searchParams.get("client");
    const needle = query.trim().toLowerCase();
    return properties
      .filter((property) => (client ? property.clientId === client : true))
      .filter((property) => {
        if (!needle) return true;
        return `${property.address} ${property.city} ${property.state} ${property.zip} ${property.clientName}`.toLowerCase().includes(needle);
      });
  }, [properties, query, searchParams]);

  async function remove(property: Property) {
    const ok = window.confirm(`Delete ${property.address}? Gallery files are not deleted automatically.`);
    if (!ok) return;
    await deleteProperty(property.id);
    toast.success("Property deleted");
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/35">Property management</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Sorted by ZIP, state, city</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Track shoot dates, gallery status, locked access, payment state, and generated revenue.</p>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <Input className="pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search properties" />
        </div>
      </section>

      {loading ? <PageSkeleton /> : null}
      {!loading && !filtered.length ? <EmptyState title="No properties found" body="Add properties and link them to clients before creating payment-gated galleries." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((property, index) => (
          <motion.div key={property.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
            <Card className="group overflow-hidden transition hover:border-white/20 hover:bg-white/[0.075]">
              <Link href={`/properties/${property.id}`} className="block">
                <div className="relative h-40">
                  {property.coverImagePath ? (
                    <SignedImage path={property.coverImagePath} alt={property.address} className="h-full w-full" />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-white/12 to-white/[0.03] text-white/45">
                      <Building2 className="h-8 w-8" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs text-white/75 backdrop-blur-xl">{property.zip}</span>
                </div>
              </Link>
              <div className="grid gap-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/properties/${property.id}`} className="truncate text-lg font-semibold text-white transition hover:text-champagne">
                      {property.address}
                    </Link>
                    <p className="mt-1 truncate text-sm text-white/45">{property.city}, {property.state} {property.zip}</p>
                    <p className="mt-1 truncate text-xs text-white/35">{property.clientName || "Unassigned client"}</p>
                  </div>
                  {property.accessLocked ? <Lock className="h-5 w-5 text-warning" /> : <Unlock className="h-5 w-5 text-success" />}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge status={property.galleryStatus} />
                  <Badge status={property.paymentStatus} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-white/52">
                  <div className="rounded-2xl bg-white/[0.055] p-3">
                    <p className="text-xs text-white/35">Shoot date</p>
                    <p className="mt-1 font-medium text-white">{formatDate(property.shootDate)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.055] p-3">
                    <p className="flex items-center gap-1 text-xs text-white/35">
                      <WalletCards className="h-3.5 w-3.5" />
                      Revenue
                    </p>
                    <p className="mt-1 font-medium text-white">{formatCurrency(property.revenueCents)}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit property"
                    onClick={() => {
                      setEditing(property);
                      setModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="danger" aria-label="Delete property" onClick={() => remove(property)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      <Button
        className="fixed bottom-5 right-5 z-30 h-14 w-14 rounded-3xl shadow-glow"
        size="icon"
        variant="primary"
        aria-label="Add property"
        onClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Modal open={modalOpen} title={editing ? "Edit property" : "New property"} onClose={() => setModalOpen(false)}>
        <PropertyForm
          property={editing}
          defaultClientId={searchParams.get("client")}
          onSaved={(id) => {
            setModalOpen(false);
            setEditing(null);
            if (!editing) router.push(`/properties/${id}`);
          }}
        />
      </Modal>
    </div>
  );
}

