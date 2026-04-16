"use client";

import { useSearchParams } from "next/navigation";
import ProductEditorPage from "@/components/Dashboard/ProductEditorPage";

export default function CreateProductPage() {
  
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "";

  return <ProductEditorPage mode="create" returnUrl={returnUrl} />;
}
