import { z } from "zod";

export const clientSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional().default(""),
  email: z.string().email(),
  address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  paymentStatus: z.enum(["pending", "deposit_paid", "paid", "overdue", "waived"]).default("pending")
});

export const propertySchema = z.object({
  address: z.string().min(4),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(3),
  clientId: z.string().min(1),
  clientName: z.string().optional(),
  shootDate: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  galleryStatus: z.enum(["draft", "locked", "unlocked", "expired"]).default("draft"),
  paymentStatus: z.enum(["pending", "deposit_paid", "paid", "overdue", "waived"]).default("pending"),
  revenueCents: z.coerce.number().min(0).default(0)
});

export const gallerySchema = z.object({
  title: z.string().min(2),
  clientId: z.string().min(1),
  clientName: z.string().optional(),
  propertyId: z.string().min(1),
  propertyAddress: z.string().optional(),
  paymentRequired: z.boolean().default(true),
  amountCents: z.coerce.number().min(0).default(45000),
  depositCents: z.coerce.number().min(0).default(0),
  downloadEnabled: z.boolean().default(true),
  watermarkEnabled: z.boolean().default(true),
  expirationDays: z.coerce.number().min(1).max(365).default(30)
});

export const settingsSchema = z.object({
  brandName: z.string().min(2),
  accentLabel: z.string().min(2),
  logoUrl: z.string().url().optional().or(z.literal("")),
  defaultWatermark: z.boolean(),
  defaultDownloadEnabled: z.boolean(),
  defaultGalleryExpirationDays: z.coerce.number().min(1).max(365),
  sessionTimeoutHours: z.coerce.number().min(1).max(168),
  emailFrom: z.string().min(3),
  emailProvider: z.enum(["resend", "smtp", "none"])
});

export const checkoutSchema = z.object({
  token: z.string().min(12),
  mode: z.enum(["full", "deposit"]).default("full")
});

