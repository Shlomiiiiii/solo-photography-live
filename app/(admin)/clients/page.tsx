import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientsView } from "@/components/clients/clients-view";
import { PageSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Clients"
};

export default function ClientsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ClientsView />
    </Suspense>
  );
}

