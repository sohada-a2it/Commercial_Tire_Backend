import { Suspense } from "react";
import ProductCatalog from "@/components/DynamicProductCatalog/ProductCatalog";
import { CatalogPageSkeleton } from "@/components/shared/RouteSkeletons";

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

const fetchCatalogData = async () => {
  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch(`${backendUrl}/api/categories?all=true&isActive=true`, { next: { revalidate: 300 } }),
      fetch(`${backendUrl}/api/categories/public/products?all=true`, { next: { revalidate: 300 } }),
    ]);

    const categoriesPayload = categoriesResponse.ok ? await categoriesResponse.json() : {};
    const productsPayload = productsResponse.ok ? await productsResponse.json() : {};

    return {
      categories: Array.isArray(categoriesPayload?.categories) ? categoriesPayload.categories : [],
      products: Array.isArray(productsPayload?.products) ? productsPayload.products : [],
    };
  } catch (_error) {
    return { categories: [], products: [] };
  }
};

// Helper function to get category data
async function getCategoryData(categorySlug) {
  try {
    const { categories, products } = await fetchCatalogData();

    const categoryName = decodeURIComponent(categorySlug).replace(/-/g, " ");

    const category = categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    const subcategory = category
      ? null
      : categories
          .find((cat) =>
            cat.subcategories?.some(
              (sub) => sub.name.toLowerCase() === categoryName.toLowerCase()
            )
          )
          ?.subcategories?.find(
            (sub) => sub.name.toLowerCase() === categoryName.toLowerCase()
          );

    const productCount = products.filter((product) => {
      const productCategory = String(product?.categoryName || "").toLowerCase();
      const productSubcategory = String(product?.subcategoryName || "").toLowerCase();

      if (category) {
        return productCategory === category.name.toLowerCase();
      }

      if (subcategory) {
        return productSubcategory === subcategory.name.toLowerCase();
      }

      return false;
    }).length;

    return { category, subcategory, categoryName, productCount };
  } catch (error) {
    console.error("Error loading category:", error);
    return { category: null, subcategory: null, categoryName: "", productCount: 0 };
  }
}

// Generate metadata for category pages
export async function generateMetadata({ params }) {
  // Await params in Next.js 15+
  const resolvedParams = await Promise.resolve(params);
  const { category, subcategory, categoryName, productCount } = await getCategoryData(
    resolvedParams.category
  );

  const itemName = category?.name || subcategory?.name || categoryName;
  const icon = category?.icon || "";
  return {
    title: `${itemName} ${icon} | Browse Products | Asian Import Export`,
    description: `Explore ${productCount}+ ${itemName.toLowerCase()} products. Wholesale prices, international shipping, quality guaranteed. ${
      category ? "Multiple subcategories available." : "Direct factory prices."
    }`,
    keywords: [
      itemName,
      `${itemName} wholesale`,
      `${itemName} supplier`,
      `${itemName} exporter`,
      "import export",
      "international shipping",
      "bulk orders",
      "B2B trade",
    ],
    openGraph: {
      title: `${itemName} - Asian Import Export Co LTD`,
      description: `Browse ${productCount}+ ${itemName.toLowerCase()} products with competitive wholesale prices.`,
      url: `https://asianimportexport.com/products/c/${resolvedParams.category}`,
      siteName: "Asian Import Export Co LTD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${itemName} - Asian Import Export`,
      description: `Browse ${productCount}+ products with competitive prices`,
    },
    alternates: {
      canonical: `/products/c/${resolvedParams.category}`,
    },
  };
}

// This function is required for static export
export async function generateStaticParams() {
  try {
    const { categories } = await fetchCatalogData();

    // Helper function to convert name to URL slug
    const nameToSlug = (name) => {
      return name.replace(/\s+/g, "-");
    };

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
