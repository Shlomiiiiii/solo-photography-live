"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, Mail, Phone, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ClientForm } from "@/components/forms/client-form";
import { SignedImage } from "@/components/media/signed-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageSkeleton } from "@/components/ui/skeleton";
import { deleteClient, subscribeClients } from "@/lib/firebase/firestore";
import type { Client } from "@/lib/types";
import { formatDate, initials } from "@/lib/utils";

export function ClientsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeClients((nextClients) => {
      setClients(nextClients);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setModalOpen(true);
      router.replace("/clients");
    }
  }, [router, searchParams]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((client) => `${client.fullName} ${client.email} ${client.phone}`.toLowerCase().includes(needle));
  }, [clients, query]);

  async function remove(client: Client) {
    const ok = window.confirm(`Delete ${client.fullName}? This does not delete linked properties or galleries.`);
    if (!ok) return;
    await deleteClient(client.id);
    toast.success("Client deleted");
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/35">Client management</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Clients A-Z</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Every contact, linked property, shoot date, payment state, and gallery delivery in one quiet workspace.</p>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <Input className="pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients" />
        </div>
      </section>

      {loading ? <PageSkeleton /> : null}
      {!loading && !filtered.length ? <EmptyState title="No clients found" body="Create a client to begin attaching properties, shoots, galleries, and payments." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((client, index) => (
          <motion.div key={client.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
            <Card className="group overflow-hidden transition hover:border-white/20 hover:bg-white/[0.075]">
              <Link href={`/clients/${client.id}`} className="block">
                <div className="relative h-36">
                  {client.thumbnailPath ? (
                    <SignedImage path={client.thumbnailPath} alt={client.fullName} className="h-full w-full" />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-white/12 to-white/[0.03] text-2xl font-semibold text-white/60">
                      {initials(client.fullName)}
                    </div>
                  )}
                </div>
              </Link>
              <div className="grid gap-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/clients/${client.id}`} className="truncate text-lg font-semibold text-white transition hover:text-champagne">
                      {client.fullName}
                    </Link>
                    <p className="mt-1 truncate text-sm text-white/45">{client.email}</p>
                  </div>
                  <Badge status={client.paymentStatus} />
                </div>

                <div className="grid gap-2 text-sm text-white/52">
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="h-4 w-4 text-white/30" />
                    {client.email}
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Phone className="h-4 w-4 text-white/30" />
                    {client.phone || "No phone"}
                  </p>
                  <p className="text-xs text-white/35">Last shoot: {formatDate(client.lastShootDate)}</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit client"
                    onClick={() => {
                      setEditing(client);
                      setModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="danger" aria-label="Delete client" onClick={() => remove(client)}>
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
        aria-label="Add client"
        onClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Modal open={modalOpen} title={editing ? "Edit client" : "New client"} onClose={() => setModalOpen(false)}>
        <ClientForm
          client={editing}
          onSaved={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}

