import type { Metadata } from "next";
import { GalleryDetailView } from "@/components/galleries/gallery-detail-view";

export const metadata: Metadata = {
  title: "Gallery"
};

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GalleryDetailView galleryId={id} />;
}
