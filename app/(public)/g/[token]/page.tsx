import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicGallery } from "@/components/public/public-gallery";
import { getPublicGallery } from "@/lib/server/galleries";

export const metadata: Metadata = {
  title: "Client Gallery",
  robots: {
    index: false,
    follow: false
  }
};

export default async function PublicGalleryPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const [{ token }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const payload = await getPublicGallery(token);
  if (!payload) notFound();

  return <PublicGallery payload={payload} success={resolvedSearchParams.success === "1"} />;
}
