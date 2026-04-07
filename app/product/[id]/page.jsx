import ProductDetailsContent from "@/components/DynamicProductCatalog/ProductDetails";
import { Suspense } from "react";
import { ProductDetailsPageSkeleton } from "@/components/shared/RouteSkeletons";
import { generateProductMetadata, getAllProducts } from "@/lib/seoMetadata";

// Generate static params for all products at build time
export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products
      .map((product) => product?.id)
      .filter((id) => id !== undefined && id !== null && id !== "")
      .map((id) => ({ id: String(id) }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate metadata for the product page
export async function generateMetadata({ params }) {
  // Await params in Next.js 15+
  const resolvedParams = await Promise.resolve(params);
  const metadata = await generateProductMetadata(resolvedParams.id);

  if (!metadata) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: metadata.openGraph,
    twitter: metadata.twitter,
    alternates: metadata.alternates,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ProductPage() {
  return (
    <Suspense fallback={<ProductDetailsPageSkeleton />}>
      <ProductDetailsContent />
    </Suspense>
  );
}
