import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}

