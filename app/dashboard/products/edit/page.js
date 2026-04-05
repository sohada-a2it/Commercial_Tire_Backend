"use client";

import { useSearchParams } from "next/navigation";
import ProductEditorPage from "@/components/Dashboard/ProductEditorPage";

export default function EditProductStaticPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") || "";

  return <ProductEditorPage mode="edit" productId={productId} />;
}
