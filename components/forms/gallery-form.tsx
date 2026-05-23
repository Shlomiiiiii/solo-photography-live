"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { createGallery } from "@/lib/firebase/firestore";
import { subscribeClients, subscribeProperties } from "@/lib/firebase/firestore";
import type { Client, Property } from "@/lib/types";

export function GalleryForm({
  defaultPropertyId,
  onSaved
}: {
  defaultPropertyId?: string | null;
  onSaved?: (id: string) => void;
}) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    clientId: "",
    propertyId: defaultPropertyId ?? "",
    paymentRequired: true,
    amountDollars: "450",
    depositDollars: "0",
    downloadEnabled: true,
    watermarkEnabled: true,
    expirationDays: "30"
  });

  useEffect(() => subscribeClients(setClients), []);
  useEffect(() => subscribeProperties(setProperties), []);

  useEffect(() => {
    if (!form.propertyId) return;
    const property = properties.find((item) => item.id === form.propertyId);
    if (property) {
      setForm((current) => ({
        ...current,
        clientId: property.clientId,
        title: current.title || `${property.address} Gallery`
      }));
    }
  }, [form.propertyId, properties]);

  const selectedClient = clients.find((client) => client.id === form.clientId);
  const selectedProperty = properties.find((property) => property.id === form.propertyId);
  const filteredProperties = useMemo(() => {
    return form.clientId ? properties.filter((property) => property.clientId === form.clientId) : properties;
  }, [form.clientId, properties]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const id = await createGallery({
        title: form.title,
        clientId: form.clientId,
        clientName: selectedClient?.fullName ?? "",
        propertyId: form.propertyId,
        propertyAddress: selectedProperty?.address ?? "",
        paymentRequired: form.paymentRequired,
        amountCents: Math.round(Number(form.amountDollars || 0) * 100),
        depositCents: Math.round(Number(form.depositDollars || 0) * 100),
        downloadEnabled: form.downloadEnabled,
        watermarkEnabled: form.watermarkEnabled,
        expirationDays: Number(form.expirationDays || 30)
      });
      toast.success("Gallery created");
      onSaved?.(id);
      router.push(`/galleries/${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create gallery");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <Field label="Gallery title">
        <Input value={form.title} onChange={(event) => update("title", event.target.value)} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Assign client">
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
        <Field label="Assign property">
          <select
            className="luxury-focus h-11 rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm text-white"
            value={form.propertyId}
            onChange={(event) => update("propertyId", event.target.value)}
            required
          >
            <option value="" className="bg-charcoal">Choose property</option>
            {filteredProperties.map((property) => (
              <option key={property.id} value={property.id} className="bg-charcoal">
                {property.address}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Full unlock ($)">
          <Input inputMode="decimal" value={form.amountDollars} onChange={(event) => update("amountDollars", event.target.value)} />
        </Field>
        <Field label="Deposit ($)">
          <Input inputMode="decimal" value={form.depositDollars} onChange={(event) => update("depositDollars", event.target.value)} />
        </Field>
        <Field label="Expires in days">
          <Input inputMode="numeric" value={form.expirationDays} onChange={(event) => update("expirationDays", event.target.value.replace(/\D/g, ""))} />
        </Field>
      </div>
      <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.055] p-4">
        <label className="flex items-center justify-between gap-4 text-sm text-white/75">
          <span>Payment-gated access</span>
          <input className="h-5 w-5 accent-white" type="checkbox" checked={form.paymentRequired} onChange={(event) => update("paymentRequired", event.target.checked)} />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm text-white/75">
          <span>Allow downloads after unlock</span>
          <input className="h-5 w-5 accent-white" type="checkbox" checked={form.downloadEnabled} onChange={(event) => update("downloadEnabled", event.target.checked)} />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm text-white/75">
          <span>Watermark locked previews</span>
          <input className="h-5 w-5 accent-white" type="checkbox" checked={form.watermarkEnabled} onChange={(event) => update("watermarkEnabled", event.target.checked)} />
        </label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={loading}>
          Create gallery
        </Button>
      </div>
    </form>
  );
}

