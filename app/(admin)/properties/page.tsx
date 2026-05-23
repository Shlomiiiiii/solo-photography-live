import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertiesView } from "@/components/properties/properties-view";
import { PageSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Properties"
};

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PropertiesView />
    </Suspense>
  );
}

