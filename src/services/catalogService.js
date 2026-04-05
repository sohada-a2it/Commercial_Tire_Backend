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

export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products${params.toString() ? `?${params.toString()}` : ""}`,
    { headers, cache: "no-store" }
  );
  const data = await parseResponse(response);
  return {
    success: true,
    products: data.products || [],
    pagination: data.pagination || { page: 1, limit: Number(filters.limit || 20), total: (data.products || []).length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    filters: data.filters || { categories: [], subcategories: [], brands: [], patterns: [] },
  };
};

export const fetchProduct = async (productId) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/catalog/products/${productId}`, { headers, cache: "no-store" });
  const data = await parseResponse(response);
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
  return { success: true, media: data.media || [] };
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