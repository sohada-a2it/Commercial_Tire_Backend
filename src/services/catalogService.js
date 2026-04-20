import { config } from "@/config/site";
import { auth } from "@/config/firebase";
import { getAuthorizedSession } from "@/lib/sessionAuth";

const buildAuthHeaders = async (isJson = true) => {
  const firebaseToken = await auth.currentUser?.getIdToken();
  const authorizedSessionToken = getAuthorizedSession()?.token;
  const token = firebaseToken || authorizedSessionToken;

  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

export const fetchCategories = async () => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/catalog/categories`, { headers, cache: "no-store" });
  const data = await parseResponse(response);
  return { success: true, categories: data.categories || [] };
};

export const fetchCategoriesPaginated = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/categories${params.toString() ? `?${params.toString()}` : ""}`,
    { headers, cache: "no-store" }
  );
  const data = await parseResponse(response);
  return {
    success: true,
    categories: data.categories || [],
    pagination: data.pagination || { page: 1, limit: Number(filters.limit || 20), total: (data.categories || []).length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
  };
};

export const saveCategory = async (payload, categoryId) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/categories${categoryId ? `/${categoryId}` : ""}`,
    {
      method: categoryId ? "PUT" : "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );
  const data = await parseResponse(response);
  return { success: true, category: data.category };
};

export const deleteCategory = async (categoryId) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/catalog/categories/${categoryId}`, {
    method: "DELETE",
    headers,
  });
  const data = await parseResponse(response);
  return { success: true, message: data.message };
};

export const importCatalog = async () => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/catalog/categories/import`, {
    method: "POST",
    headers,
  });
  const data = await parseResponse(response);
  return {
    success: true,
    message: data.message,
    categoryCount: data.categoryCount,
    productCount: data.productCount,
  };
};

// export const fetchProducts = async (filters = {}) => {
//   const params = new URLSearchParams();
//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== "") {
//       params.append(key, String(value));
//     }
//   });

//   const headers = await buildAuthHeaders();
//   const response = await fetch(
//     `${config.email.backendUrl}/api/catalog/products${params.toString() ? `?${params.toString()}` : ""}`,
//     { headers, cache: "no-store" }
//   );
//   const data = await parseResponse(response);
//   return {
//     success: true,
//     products: data.products || [],
//     pagination: data.pagination || { page: 1, limit: Number(filters.limit || 20), total: (data.products || []).length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
//     filters: data.filters || { categories: [], subcategories: [], brands: [], patterns: [] },
//   };
// };

export const fetchProduct = async (productId) => {
  if (!productId) {
    throw new Error("Product id is required for edit view");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/catalog/products/${productId}`, { headers, cache: "no-store" });
  const data = await parseResponse(response);

  if (!data?.product || Array.isArray(data.product)) {
    throw new Error("Invalid product response for edit view");
  }

  return { success: true, product: data.product };
};

export const saveProduct = async (payload, productId) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products${productId ? `/${productId}` : ""}`,
    {
      method: productId ? "PUT" : "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );
  const data = await parseResponse(response);
  return { success: true, product: data.product };
};

export const deleteProduct = async (productId) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/catalog/products/${productId}`, {
    method: "DELETE",
    headers,
  });
  const data = await parseResponse(response);
  return { success: true, message: data.message };
};

export const fetchMedia = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/media${params.toString() ? `?${params.toString()}` : ""}`,
    { headers }
  );
  const data = await parseResponse(response);
  return {
    success: true,
    media: data.media || [],
    pagination: data.pagination || {
      page: Number(filters.page || 1),
      limit: Number(filters.limit || 24),
      total: (data.media || []).length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
};

export const uploadMedia = async (file, extra = {}) => {
  const headers = await buildAuthHeaders(false);
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  });

  const response = await fetch(`${config.email.backendUrl}/api/catalog/media/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await parseResponse(response);
  return { success: true, media: data.media };
};

export const uploadMediaFromUrl = async (imageUrl, extra = {}) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/catalog/media/upload-from-url`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ url: imageUrl, ...extra }),
  });
  const data = await parseResponse(response);
  return { success: true, media: data.media };
};

export const deleteMedia = async (publicId) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/media/${encodeURIComponent(publicId)}`,
    {
      method: "DELETE",
      headers,
    }
  );
  const data = await parseResponse(response);
  return { success: true, message: data.message };
};
// services/catalogService.js

// services/catalogService.js

// Add product to featured
export const addToFeatured = async (productId, options = {}) => {
  try {
    const response = await fetch(`${config.email.backendUrl}/api/featured-products/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Add to featured error:", error);
    return { success: false, message: error.message };
  }
};

// Remove product from featured
export const removeFromFeatured = async (productId) => {
  try {
    const response = await fetch(`${config.email.backendUrl}/api/featured-products/${productId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Remove from featured error:", error);
    return { success: false, message: error.message };
  }
};

// Get all featured products
export const fetchFeaturedProducts = async (limit = 10) => {
  try {
    const response = await fetch(`/api/featured-products?limit=${limit}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};
 

/** 
 * @param {Object} filters - Filter parameters
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20, max: 100)
 * @param {string} filters.sort - Sort option (newest, name-asc, name-desc, brand-asc, brand-desc)
 * @param {string} filters.search - Search term for product name, brand, pattern, etc.
 * @param {string} filters.category - Category name
 * @param {string} filters.subcategory - Subcategory name
 * @param {string} filters.brand - Brand name
 * @param {string} filters.pattern - Tread pattern
 * @param {string} filters.tireType - Tire type (steer, drive, trailer, all-position)
 * @param {string} filters.vehicleType - Vehicle type (truck, bus, etc.)
 * @param {string} filters.application - Application type (highway, mining, mixed-service, off-road)
 * @param {string} filters.tireSize - Tire size (e.g., "12R22.5")
 * @param {boolean} filters.isActive - Active status
 */
export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Pagination
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  // Sorting
  if (filters.sort) params.append('sort', filters.sort);
  
  // Search
  if (filters.search) params.append('search', filters.search);
  
  // Category filters
  if (filters.category) params.append('category', filters.category);
  if (filters.subcategory) params.append('subcategory', filters.subcategory);
  
  // Product attributes
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.pattern) params.append('pattern', filters.pattern);
  
  // Tire-specific filters
  if (filters.tireType) params.append('tireType', filters.tireType);
  if (filters.vehicleType) params.append('vehicleTypesList', filters.vehicleType);
  if (filters.application) params.append('applicationsList', filters.application);
  if (filters.tireSize) params.append('tireSize', filters.tireSize);
  
  // Status
  if (filters.isActive !== undefined && filters.isActive !== null) {
    params.append('isActive', filters.isActive);
  }
  
  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products${params.toString() ? `?${params.toString()}` : ""}`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    products: data.products || [],
    pagination: data.pagination || {
      page: Number(filters.page || 1),
      limit: Number(filters.limit || 20),
      total: data.products?.length || 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    filters: data.filters || {
      categories: [],
      subcategories: [],
      brands: [],
      patterns: [],
      tireTypes: [],
      vehicleTypesLists: [],
      applicationsLists: [],
      tireSizes: [],
      categoryMap: {},
    },
  };
};
