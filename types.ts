export type PaymentStatus = "pending" | "deposit_paid" | "paid" | "overdue" | "waived";
export type GalleryStatus = "draft" | "locked" | "unlocked" | "expired";
export type ShootStatus = "scheduled" | "uploaded" | "delivered" | "archived";

export type FireTimestamp =
  | Date
  | string
  | number
  | {
      seconds: number;
      nanoseconds?: number;
    }
  | null
  | undefined;

export type Client = {
  id: string;
  fullName: string;
  fullNameLower: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  paymentStatus: PaymentStatus;
  linkedPropertyIds: string[];
  shootDates: string[];
  uploadedGalleryIds: string[];
  thumbnailPath?: string;
  lastShootDate?: string;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
};

export type Property = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  sortZip: string;
  sortState: string;
  sortCity: string;
  clientId: string;
  clientName?: string;
  shootDate: string;
  notes: string;
  coverImagePath?: string;
  galleryStatus: GalleryStatus;
  paymentStatus: PaymentStatus;
  revenueCents: number;
  galleryId?: string;
  accessLocked: boolean;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
};

export type Photo = {
  id: string;
  galleryId: string;
  fileName: string;
  storagePath: string;
  previewStoragePath?: string;
  width?: number;
  height?: number;
  sizeBytes: number;
  contentType: string;
  favorite: boolean;
  downloadCount: number;
  uploadedAt?: FireTimestamp;
};

export type Gallery = {
  id: string;
  title: string;
  clientId: string;
  clientName?: string;
  propertyId: string;
  propertyAddress?: string;
  token: string;
  tokenExpiresAt?: FireTimestamp;
  status: GalleryStatus;
  paymentRequired: boolean;
  amountCents: number;
  depositCents: number;
  isPaid: boolean;
  downloadEnabled: boolean;
  watermarkEnabled: boolean;
  photoCount: number;
  coverPhotoPath?: string;
  stripeCheckoutSessionId?: string;
  paidAt?: FireTimestamp;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
};

export type Transaction = {
  id: string;
  galleryId: string;
  clientId?: string;
  propertyId?: string;
  amountCents: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  customerEmail?: string;
  createdAt?: FireTimestamp;
};

export type AdminSettings = {
  brandName: string;
  accentLabel: string;
  logoUrl?: string;
  defaultWatermark: boolean;
  defaultDownloadEnabled: boolean;
  defaultGalleryExpirationDays: number;
  sessionTimeoutHours: number;
  stripePublishableConfigured: boolean;
  emailFrom: string;
  emailProvider: "resend" | "smtp" | "none";
};

export type DashboardStats = {
  totalClients: number;
  totalProperties: number;
  totalGalleries: number;
  revenueCollectedCents: number;
  pendingPaymentsCents: number;
  recentUploads: Gallery[];
  upcomingShoots: Property[];
  recentTransactions: Transaction[];
};
