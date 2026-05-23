export const APP_NAME = "Solo Photography NY";

export const ADMIN_ROUTES = [
  "/dashboard",
  "/clients",
  "/properties",
  "/galleries",
  "/payments",
  "/revenue",
  "/settings"
];

export const COLLECTIONS = {
  clients: "clients",
  properties: "properties",
  galleries: "galleries",
  transactions: "transactions",
  settings: "settings"
} as const;

export const DEFAULT_SETTINGS = {
  brandName: APP_NAME,
  accentLabel: "Luxury Real Estate Photography",
  defaultWatermark: true,
  defaultDownloadEnabled: true,
  defaultGalleryExpirationDays: 30,
  sessionTimeoutHours: 72,
  stripePublishableConfigured: false,
  emailFrom: "Solo Photography NY <no-reply@solophotographyny.com>",
  emailProvider: "none"
} as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: "border-warning/30 bg-warning/10 text-warning",
  deposit_paid: "border-champagne/30 bg-champagne/10 text-champagne",
  paid: "border-success/30 bg-success/10 text-success",
  overdue: "border-danger/30 bg-danger/10 text-danger",
  waived: "border-white/20 bg-white/10 text-white",
  draft: "border-white/15 bg-white/8 text-white/70",
  locked: "border-warning/30 bg-warning/10 text-warning",
  unlocked: "border-success/30 bg-success/10 text-success",
  expired: "border-danger/30 bg-danger/10 text-danger"
};

