"use client";

import { useParams } from "next/navigation";

import { ProductDetailView } from "@/components/inventory/product-detail-view";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  return <ProductDetailView productId={Number.isNaN(id) ? null : id} />;
}
