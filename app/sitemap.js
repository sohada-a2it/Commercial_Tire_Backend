export const dynamic = "force-static";

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

const fetchCatalog = async () => {
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

export default async function sitemap() {
  const baseUrl = "https://asianimportexport.com";
  const { categories, products } = await fetchCatalog();

  // Helper function to convert name to URL slug
  const nameToSlug = (name) => {
    return name.replace(/\s+/g, "-");
  };

  const currentDate = new Date();

  // Static pages
  const routes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/aboutUs`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Add all product pages
  products.forEach((product) => {
    if (product?.id === undefined || product?.id === null || product?.id === "") return;

    routes.push({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // Add category and subcategory pages
  categories.forEach((category) => {
    const categorySlug = nameToSlug(category.name);
    routes.push({
      url: `${baseUrl}/products/c/${categorySlug}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    });

    if (category.subcategories) {
      category.subcategories.forEach((subcategory) => {
        const subcategorySlug = nameToSlug(subcategory.name);
        routes.push({
          url: `${baseUrl}/products/c/${subcategorySlug}`,
          lastModified: currentDate,
          changeFrequency: "daily",
          priority: 0.6,
        });
      });
    }
  });

  return routes;
}
