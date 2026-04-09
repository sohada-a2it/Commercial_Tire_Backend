import ProductDetailsContent from "@/components/DynamicProductCatalog/ProductDetails";
import { Suspense } from "react";
import { ProductDetailsPageSkeleton } from "@/components/shared/RouteSkeletons";

export const metadata = {
  title: "Product | Asian Import Export",
  description: "View product details from our live catalog.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProductRuntimePage() {
  return (
    <Suspense fallback={<ProductDetailsPageSkeleton />}>
      <ProductDetailsContent />
    </Suspense>
  );
}