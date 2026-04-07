import SubcategoryPageClient from "./SubcategoryPageClient";

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

export default function SubcategoryPage() {
  return <SubcategoryPageClient />;
}
