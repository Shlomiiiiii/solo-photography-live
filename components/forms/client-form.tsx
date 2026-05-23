"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { upsertClient } from "@/lib/firebase/firestore";
import type { Client, PaymentStatus } from "@/lib/types";

const statuses: PaymentStatus[] = ["pending", "deposit_paid", "paid", "overdue", "waived"];

export function ClientForm({
  client,
  onSaved
}: {
  client?: Client | null;
  onSaved?: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: client?.fullName ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    address: client?.address ?? "",
    notes: client?.notes ?? "",
    paymentStatus: client?.paymentStatus ?? "pending"
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const id = await upsertClient({
        id: client?.id,
        ...form,
        paymentStatus: form.paymentStatus as PaymentStatus
      });
      toast.success(client ? "Client updated" : "Client created");
      onSaved?.(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save client");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} required />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(event) => update("phone", event.target.value)} />
        </Field>
        <Field label="Payment status">
          <select
            className="luxury-focus h-11 rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm text-white"
            value={form.paymentStatus}
            onChange={(event) => update("paymentStatus", event.target.value as PaymentStatus)}
          >
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-charcoal">
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Address">
        <Input value={form.address} onChange={(event) => update("address", event.target.value)} />
      </Field>
      <Field label="Notes">
        <Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={loading}>
          {client ? "Save client" : "Create client"}
        </Button>
      </div>
    </form>
  );
}

