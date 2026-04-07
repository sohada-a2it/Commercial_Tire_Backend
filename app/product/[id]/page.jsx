import ProductDetailsContent from "@/components/DynamicProductCatalog/ProductDetails";
import { Suspense } from "react";
import { ProductDetailsPageSkeleton } from "@/components/shared/RouteSkeletons";

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

// Generate static params for all products at build time
export async function generateStaticParams() {
  try {
    const response = await fetch(`${backendUrl}/api/categories/public/products?all=true`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];

    const data = await response.json();
    const products = Array.isArray(data?.products) ? data.products : [];

    return products
      .map((product) => product?.id)
      .filter((id) => id !== undefined && id !== null && id !== "")
      .map((id) => ({ id: String(id) }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Helper function to get product data
async function getProductData(id) {
  try {
    const response = await fetch(`${backendUrl}/api/categories/public/products/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return { product: null, category: "", subcategory: "" };
    }

    const data = await response.json();
    const productData = data?.product || null;
    const categoryName = productData?.categoryName || "";
    const subcategoryName = productData?.subcategoryName || "";

    return {
      product: productData,
      category: categoryName,
      subcategory: subcategoryName,
    };
  } catch (error) {
    console.error("Error loading product:", error);
    return { product: null, category: "", subcategory: "" };
  }
}

// Generate metadata for the product page
export async function generateMetadata({ params }) {
  // Await params in Next.js 15+
  const resolvedParams = await Promise.resolve(params);
  const { product, category, subcategory } = await getProductData(
    resolvedParams.id
  );

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const price = product.offerPrice || product.price || "";
  const brand = product.keyAttributes?.Brand || "Asian Import Export";
  const description =
    product.description ||
    `Buy ${product.name} at competitive prices. ${brand} product available for wholesale and international shipping.`;

  return {
    title: `${product.name} | ${brand} | Asian Import Export`,
    description: description.substring(0, 160),
    keywords: [
      product.name,
      brand,
      category,
      subcategory,
      "wholesale",
      "import export",
      "international shipping",
      ...(product.keyAttributes?.Size ? [product.keyAttributes.Size] : []),
      ...(product.keyAttributes?.Pattern
        ? [product.keyAttributes.Pattern]
        : []),
    ],
    openGraph: {
      title: `${product.name} - ${brand}`,
      description: description.substring(0, 160),
      url: `https://asianimportexport.com/product/${product.id}`,
      siteName: "Asian Import Export Co LTD",
      images: [
        {
          url: product.image || "/og-image.jpg",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - ${brand}`,
      description: description.substring(0, 160),
      images: [product.image || "/og-image.jpg"],
    },
    alternates: {
      canonical: `/product/${product.id}`,
    },
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
