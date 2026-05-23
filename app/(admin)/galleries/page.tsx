import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleriesView } from "@/components/galleries/galleries-view";
import { PageSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Galleries"
};

export default function GalleriesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GalleriesView />
    </Suspense>
  );
}

