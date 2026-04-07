// SEO Metadata generation utilities - database driven
import { config } from "@/config/site";

const baseUrl = config.site.url;
const siteName = config.site.name;

export async function fetchBackendData(endpoint) {
  try {
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");
    const response = await fetch(`${backendUrl}${endpoint}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

export function nameToSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function slugToName(slug) {
  return decodeURIComponent(slug).replace(/-/g, " ");
}

// Generate metadata for category pages
export async function generateCategoryMetadata(categorySlug) {
  try {
    const catalogData = await fetchBackendData("/api/categories/public/products?all=true");
    const categoriesData = await fetchBackendData("/api/categories?all=true&isActive=true");

    const categories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
    const products = Array.isArray(catalogData?.products) ? catalogData.products : [];

    const categoryName = slugToName(categorySlug);

    // Find main category
    const mainCategory = categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    // Find subcategory if not a main category
    const subcategory = mainCategory
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

    const category = mainCategory || subcategory;
    if (!category) return null;

    // Count products for this category/subcategory
    const productCount = products.filter((product) => {
      const productCategory = String(product?.categoryName || "").toLowerCase();
      const productSubcategory = String(product?.subcategoryName || "").toLowerCase();

      if (mainCategory) {
        return productCategory === mainCategory.name.toLowerCase();
      }
      if (subcategory) {
        return productSubcategory === subcategory.name.toLowerCase();
      }
      return false;
    }).length;

    const title = `${category.name} Products | Wholesale & Export | ${siteName}`;
    const description = `Explore ${productCount}+ high-quality ${category.name.toLowerCase()} products. Wholesale prices, international shipping, bulk orders available. Direct from manufacturer.`;
    const keywords = [
      category.name,
      `${category.name} wholesale`,
      `${category.name} supplier`,
      `${category.name} exporter`,
      `${category.name} bulk`,
      "import export",
      "international shipping",
      "B2B trade",
      "bulk orders",
    ];

    return {
      title,
      description,
      keywords,
      category,
      productCount,
      openGraph: {
        title: `${category.name} - ${siteName}`,
        description,
        url: `${baseUrl}/products/c/${categorySlug}`,
        type: "website",
        siteName,
        images: category.banner
          ? [
              {
                url: category.banner,
                width: 1200,
                height: 630,
                alt: category.name,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${category.name} Products - ${siteName}`,
        description,
        images: category.banner ? [category.banner] : [],
      },
      alternates: {
        canonical: `/products/c/${categorySlug}`,
      },
    };
  } catch (error) {
    console.error("Error generating category metadata:", error);
    return null;
  }
}

// Generate metadata for product pages
export async function generateProductMetadata(productId) {
  try {
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");
    const productData = await fetchBackendData(`/api/categories/public/products/${encodeURIComponent(productId)}`);

    if (!productData?.product) return null;

    const product = productData.product;
    const price = product.offerPrice || product.price || "Contact for price";
    const image = product.image || "/logo.webp";

    const title = `${product.name} | Wholesale ${product.categoryName || "Product"} | ${siteName}`;
    const description = product.description
      ? product.description.substring(0, 160)
      : `High-quality ${product.name} available for wholesale and international shipping. Premium quality at competitive prices.`;

    const keywords = [
      product.name,
      `${product.name} wholesale`,
      `${product.name} supplier`,
      product.categoryName,
      "import export",
      "bulk orders",
      "wholesale",
    ];

    return {
      title,
      description,
      keywords,
      product,
      openGraph: {
        title: `${product.name} - ${siteName}`,
        description,
        url: `${baseUrl}/product/${productId}`,
        type: "website",
        siteName,
        images: [
          {
            url: image.startsWith("http") ? image : `${baseUrl}${image}`,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} - ${siteName}`,
        description,
        images: [image.startsWith("http") ? image : `${baseUrl}${image}`],
      },
      alternates: {
        canonical: `/product/${productId}`,
      },
    };
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return null;
  }
}

// Generate metadata for subcategory pages
export async function generateSubcategoryMetadata(categorySlug, subcategorySlug) {
  try {
    const catalogData = await fetchBackendData("/api/categories/public/products?all=true");
    const categoriesData = await fetchBackendData("/api/categories?all=true&isActive=true");

    const categories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
    const products = Array.isArray(catalogData?.products) ? catalogData.products : [];

    const categoryName = slugToName(categorySlug);
    const subcategoryName = slugToName(subcategorySlug);

    const mainCategory = categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!mainCategory) return null;

    const subcategory = mainCategory.subcategories?.find(
      (sub) => sub.name.toLowerCase() === subcategoryName.toLowerCase()
    );

    if (!subcategory) return null;

    const productCount = products.filter(
      (product) =>
        String(product?.subcategoryName || "").toLowerCase() === subcategoryName.toLowerCase()
    ).length;

    const title = `${subcategory.name} Products | Wholesale Export | ${siteName}`;
    const description = `Browse ${productCount}+ ${subcategory.name.toLowerCase()} products. Premium quality, wholesale prices, international shipping available.`;
    const keywords = [
      subcategory.name,
      `${subcategory.name} wholesale`,
      `${subcategory.name} supplier`,
      categoryName,
      "import export",
      "bulk orders",
      "B2B",
    ];

    return {
      title,
      description,
      keywords,
      subcategory,
      category: mainCategory,
      productCount,
      openGraph: {
        title: `${subcategory.name} - ${siteName}`,
        description,
        url: `${baseUrl}/products/c/${categorySlug}/${subcategorySlug}`,
        type: "website",
        siteName,
      },
      twitter: {
        card: "summary_large_image",
        title: `${subcategory.name} Products - ${siteName}`,
        description,
      },
      alternates: {
        canonical: `/products/c/${categorySlug}/${subcategorySlug}`,
      },
    };
  } catch (error) {
    console.error("Error generating subcategory metadata:", error);
    return null;
  }
}

// Get all categories for static params
export async function getAllCategories() {
  try {
    const data = await fetchBackendData("/api/categories?all=true&isActive=true");
    return Array.isArray(data?.categories) ? data.categories : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Get all products for static params
export async function getAllProducts() {
  try {
    const data = await fetchBackendData("/api/categories/public/products?all=true");
    return Array.isArray(data?.products) ? data.products : [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Get breadcrumb data
export function generateBreadcrumbs(segments) {
  const breadcrumbs = [
    {
      name: "Home",
      url: "/",
    },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      name: slugToName(segment),
      url: currentPath,
    });
  });

  return breadcrumbs;
}
