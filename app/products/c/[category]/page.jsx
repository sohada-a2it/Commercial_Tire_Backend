import { Suspense } from "react";
import ProductCatalog from "@/components/DynamicProductCatalog/ProductCatalog";
import { CatalogPageSkeleton } from "@/components/shared/RouteSkeletons";
import { generateCategoryMetadata, getAllCategories, nameToSlug } from "@/lib/seoMetadata";

// Generate metadata for category pages
export async function generateMetadata({ params }) {
  // Await params in Next.js 15+
  const resolvedParams = await Promise.resolve(params);
  const metadata = await generateCategoryMetadata(resolvedParams.category);

  if (!metadata) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
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

// This function is required for static export
export async function generateStaticParams() {
  try {
    const categories = await getAllCategories();

    const params = [];

    // Generate params for all categories and subcategories
    categories.forEach((category) => {
      params.push({
        category: nameToSlug(category.name),
      });

      if (category.subcategories) {
        category.subcategories.forEach((subcategory) => {
          params.push({
            category: nameToSlug(subcategory.name),
          });
        });
      }
    });

    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default function ProductsCategoryPage() {
  return (
    <Suspense fallback={<CatalogPageSkeleton />}>
      <ProductCatalog />
    </Suspense>
  );
}
