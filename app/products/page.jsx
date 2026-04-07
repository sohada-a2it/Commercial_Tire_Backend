import { Suspense } from "react";
import ProductCatalog from "@/components/DynamicProductCatalog/ProductCatalog";
import { CatalogPageSkeleton } from "@/components/shared/RouteSkeletons";

export const metadata = {
  title: "All Products | Browse Our Complete Catalog | Asian Import Export",
  description:
    "Browse our complete product catalog including truck tires, vehicle parts, metals, seafood, agriculture products, and wood products. Wholesale prices and international shipping available.",
  keywords: [
    "all products",
    "product catalog",
    "truck tires",
    "vehicle parts",
    "copper scrap",
    "aluminum metal",
    "frozen fish",
    "rice supplier",
    "wholesale products",
    "import export",
  ],
  openGraph: {
    title: "All Products - Asian Import Export Co LTD",
    description:
      "Browse our complete product catalog with competitive wholesale prices and international shipping.",
    url: "https://asianimportexport.com/products",
    siteName: "Asian Import Export Co LTD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products - Asian Import Export",
    description: "Browse our complete catalog with competitive prices",
  },
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<CatalogPageSkeleton />}>
      <ProductCatalog />
    </Suspense>
  );
}
