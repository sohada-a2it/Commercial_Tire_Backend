export const dynamic = "force-static";

import { getAllCategories, getAllProducts, nameToSlug } from "@/lib/seoMetadata";

const fetchCatalog = async () => {
  try {
    const categories = await getAllCategories();
    const products = await getAllProducts();
    return { categories, products };
  } catch (_error) {
    return { categories: [], products: [] };
  }
};

export default async function sitemap() {
  const baseUrl = "https://asianimportexport.com";
  const { categories, products } = await fetchCatalog();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/aboutUs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Category pages
  const categoryPages = categories.flatMap((category) => {
    const pages = [
      {
        url: `${baseUrl}/products/c/${nameToSlug(category.name)}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.85,
      },
    ];

    // Subcategory pages
    if (category.subcategories) {
      category.subcategories.forEach((subcategory) => {
        pages.push({
          url: `${baseUrl}/products/c/${nameToSlug(subcategory.name)}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        });
      });
    }

    return pages;
  });

  // Product pages
  const productPages = products
    .filter((product) => product?.id)
    .map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(product.updatedAt || product.createdAt || new Date()),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

  // Combine all URLs
  return [...staticPages, ...categoryPages, ...productPages];
}
