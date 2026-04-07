import SubcategoryPageClient from "./SubcategoryPageClient";
import { generateSubcategoryMetadata } from "@/lib/seoMetadata";

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

const fetchCategories = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/categories?all=true&isActive=true`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.categories) ? data.categories : [];
  } catch (_error) {
    return [];
  }
};

// Generate static params for all category/subcategory combinations
export async function generateStaticParams() {
  const categories = await fetchCategories();

  const nameToSlug = (name) => name.replace(/\s+/g, "-");

  const params = [];

  categories.forEach((category) => {
    if (category.subcategories) {
      category.subcategories.forEach((subcategory) => {
        params.push({
          category: nameToSlug(category.name),
          subcategory: nameToSlug(subcategory.name),
        });
      });
    }
  });

  return params;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const metadata = await generateSubcategoryMetadata(
    resolvedParams.category,
    resolvedParams.subcategory
  );

  if (!metadata) {
    return {
      title: "Subcategory Not Found",
      description: "The requested subcategory could not be found.",
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

export default function SubcategoryPage() {
  return <SubcategoryPageClient />;
}
