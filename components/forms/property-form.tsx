"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { subscribeClients, upsertProperty } from "@/lib/firebase/firestore";
import type { Client, GalleryStatus, PaymentStatus, Property } from "@/lib/types";

const galleryStatuses: GalleryStatus[] = ["draft", "locked", "unlocked", "expired"];
const paymentStatuses: PaymentStatus[] = ["pending", "deposit_paid", "paid", "overdue", "waived"];

export function PropertyForm({
  property,
  defaultClientId,
  onSaved
}: {
  property?: Property | null;
  defaultClientId?: string | null;
  onSaved?: (id: string) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    address: property?.address ?? "",
    city: property?.city ?? "",
    state: property?.state ?? "NY",
    zip: property?.zip ?? "",
    clientId: property?.clientId ?? defaultClientId ?? "",
    shootDate: property?.shootDate ?? "",
    notes: property?.notes ?? "",
    galleryStatus: property?.galleryStatus ?? "draft",
    paymentStatus: property?.paymentStatus ?? "pending",
    revenueCents: String(property?.revenueCents ?? 0)
  });

  useEffect(() => subscribeClients(setClients), []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = clients.find((item) => item.id === form.clientId);
    setLoading(true);
    try {
      const id = await upsertProperty({
        id: property?.id,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        clientId: form.clientId,
        clientName: client?.fullName ?? property?.clientName ?? "",
        shootDate: form.shootDate,
        notes: form.notes,
        galleryStatus: form.galleryStatus as GalleryStatus,
        paymentStatus: form.paymentStatus as PaymentStatus,
        revenueCents: Number(form.revenueCents || 0)
      });
      toast.success(property ? "Property updated" : "Property created");
      onSaved?.(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save property");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <Field label="Property address">
        <Input value={form.address} onChange={(event) => update("address", event.target.value)} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City">
          <Input value={form.city} onChange={(event) => update("city", event.target.value)} required />
        </Field>
        <Field label="State">
          <Input value={form.state} maxLength={2} onChange={(event) => update("state", event.target.value.toUpperCase())} required />
        </Field>
        <Field label="ZIP">
          <Input value={form.zip} onChange={(event) => update("zip", event.target.value)} required />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client linked">
          <select
            className="luxury-focus h-11 rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm text-white"
            value={form.clientId}
            onChange={(event) => update("clientId", event.target.value)}
            required
          >
            <option value="" className="bg-charcoal">Choose client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id} className="bg-charcoal">
                {client.fullName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Shoot date">
          <Input type="date" value={form.shootDate} onChange={(event) => update("shootDate", event.target.value)} />
        </Field>
        <Field label="Gallery status">
          <select
            className="luxury-focus h-11 rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm text-white"
            value={form.galleryStatus}
            onChange={(event) => update("galleryStatus", event.target.value as GalleryStatus)}
          >
            {galleryStatuses.map((status) => (
              <option key={status} value={status} className="bg-charcoal">
                {status}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payment status">
          <select
            className="luxury-focus h-11 rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm text-white"
            value={form.paymentStatus}
            onChange={(event) => update("paymentStatus", event.target.value as PaymentStatus)}
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status} className="bg-charcoal">
                {status}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Revenue generated (cents)">
        <Input inputMode="numeric" value={form.revenueCents} onChange={(event) => update("revenueCents", event.target.value.replace(/\D/g, ""))} />
      </Field>
      <Field label="Property notes">
        <Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={loading}>
          {property ? "Save property" : "Create property"}
        </Button>
      </div>
    </form>
  );
}

