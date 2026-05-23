import type { Metadata } from "next";
import { PropertyDetailView } from "@/components/properties/property-detail-view";

export const metadata: Metadata = {
  title: "Property"
};

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PropertyDetailView propertyId={id} />;
}
