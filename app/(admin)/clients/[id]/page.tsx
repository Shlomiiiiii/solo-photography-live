import type { Metadata } from "next";
import { ClientDetailView } from "@/components/clients/client-detail-view";

export const metadata: Metadata = {
  title: "Client Profile"
};

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientDetailView clientId={id} />;
}
