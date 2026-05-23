"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, EyeOff, KeyRound, Mail, Palette, Shield, Timer, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { COLLECTIONS, DEFAULT_SETTINGS } from "@/lib/constants";
import { db } from "@/lib/firebase/client";
import type { AdminSettings } from "@/lib/types";

export function SettingsView() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, COLLECTIONS.settings, "admin")).then((snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...snapshot.data() } as AdminSettings);
      }
      setLoading(false);
    });
  }, []);

  function update<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await setDoc(
        doc(db, COLLECTIONS.settings, "admin"),
        {
          ...settings,
          stripePublishableConfigured: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={save}>
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/35">Settings</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Studio configuration</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Branding, delivery defaults, expiration windows, and integration status for secure production deployment.</p>
        </div>
        <Button type="submit" variant="primary" loading={saving || loading}>
          Save settings
        </Button>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-white/45" />
              <div>
                <h3 className="text-lg font-semibold text-white">Branding</h3>
                <p className="text-sm text-white/45">Visible on admin and client gallery pages.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Brand name">
              <Input value={settings.brandName} onChange={(event) => update("brandName", event.target.value)} />
            </Field>
            <Field label="Accent label">
              <Input value={settings.accentLabel} onChange={(event) => update("accentLabel", event.target.value)} />
            </Field>
            <Field label="Logo URL">
              <Input value={settings.logoUrl ?? ""} onChange={(event) => update("logoUrl", event.target.value)} placeholder="https://..." />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <WandSparkles className="h-5 w-5 text-white/45" />
              <div>
                <h3 className="text-lg font-semibold text-white">Gallery defaults</h3>
                <p className="text-sm text-white/45">Applied when creating new galleries.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <label className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 text-sm text-white/70">
              <span>Watermark locked previews</span>
              <input className="h-5 w-5 accent-white" type="checkbox" checked={settings.defaultWatermark} onChange={(event) => update("defaultWatermark", event.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 text-sm text-white/70">
              <span>Downloads after payment</span>
              <input className="h-5 w-5 accent-white" type="checkbox" checked={settings.defaultDownloadEnabled} onChange={(event) => update("defaultDownloadEnabled", event.target.checked)} />
            </label>
            <Field label="Gallery expiration days">
              <Input type="number" min={1} max={365} value={settings.defaultGalleryExpirationDays} onChange={(event) => update("defaultGalleryExpirationDays", Number(event.target.value))} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-white/45" />
              <div>
                <h3 className="text-lg font-semibold text-white">Stripe keys</h3>
                <p className="text-sm text-white/45">Secrets stay in environment variables, not Firestore.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 text-sm">
              <span className="text-white/60">Publishable key</span>
              <span className="inline-flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "Configured" : "Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 text-sm">
              <span className="text-white/60">Secret key</span>
              <span className="inline-flex items-center gap-2 text-white/45">
                <EyeOff className="h-4 w-4" />
                STRIPE_SECRET_KEY
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.055] p-3 text-sm">
              <span className="text-white/60">Webhook secret</span>
              <span className="inline-flex items-center gap-2 text-white/45">
                <EyeOff className="h-4 w-4" />
                STRIPE_WEBHOOK_SECRET
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-white/45" />
              <div>
                <h3 className="text-lg font-semibold text-white">Email notifications</h3>
                <p className="text-sm text-white/45">Payment confirmations and gallery unlock emails.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="From address">
              <Input value={settings.emailFrom} onChange={(event) => update("emailFrom", event.target.value)} />
            </Field>
            <Field label="Email provider">
              <select
                className="luxury-focus h-11 rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm text-white"
                value={settings.emailProvider}
                onChange={(event) => update("emailProvider", event.target.value as AdminSettings["emailProvider"])}
              >
                <option value="none" className="bg-charcoal">None</option>
                <option value="resend" className="bg-charcoal">Resend</option>
                <option value="smtp" className="bg-charcoal">SMTP adapter</option>
              </select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-white/45" />
              <div>
                <h3 className="text-lg font-semibold text-white">Session timeout</h3>
                <p className="text-sm text-white/45">Admin session cookie duration.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Field label="Session timeout hours">
              <Input type="number" min={1} max={168} value={settings.sessionTimeoutHours} onChange={(event) => update("sessionTimeoutHours", Number(event.target.value))} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-white/45" />
              <div>
                <h3 className="text-lg font-semibold text-white">Security posture</h3>
                <p className="text-sm text-white/45">Admin-only access and private storage delivery.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-white/55">
            <p className="rounded-2xl bg-white/[0.055] p-3">No signup UI or public account creation exists in the app.</p>
            <p className="rounded-2xl bg-white/[0.055] p-3">Admin routes require a verified Firebase session cookie and ADMIN_UID or ADMIN_EMAIL match.</p>
            <p className="rounded-2xl bg-white/[0.055] p-3">Full-resolution storage files are served through short-lived signed URLs only after unlock.</p>
          </CardContent>
        </Card>
      </section>
    </form>
  );
}

