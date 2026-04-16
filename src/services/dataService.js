/**
 * Centralized Data Service
 * Provides direct catalog access from MongoDB APIs (no client cache)
 */

import config from "@/config/site";

class DataService {
  constructor() {
    this.baseUrl = config.email.backendUrl;
  }

  async getCategories() {
    const response = await fetch(`${this.baseUrl}/api/categories?all=true&isActive=true`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Categories request failed: ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload?.categories) ? payload.categories : [];
  }

  buildQueryString(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
    return params.toString();
  }

  async fetchProducts(filters = {}) {
    const query = this.buildQueryString(filters);
    const response = await fetch(
      `${this.baseUrl}/api/categories/public/products${query ? `?${query}` : ""}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Products request failed: ${response.status}`);
    }

    const payload = await response.json();
    return {
      products: Array.isArray(payload?.products) ? payload.products : [],
      pagination: payload?.pagination || {
        page: Number(filters.page || 1),
        limit: Number(filters.limit || 24),
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      filters: payload?.filters || { brands: [], patterns: [] },
    };
  }

  async getAllProducts(filters = {}) {
    const data = await this.fetchProducts(filters);
    return data.products;
  }

  async getProductById(productId) {
    if (!productId) return null;
    const response = await fetch(
      `${this.baseUrl}/api/categories/public/products/${encodeURIComponent(String(productId))}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return payload?.product || null;
  }

  // আপডেটেড মেথড - ক্যাটাগরি আইডি দ্বারা প্রোডাক্ট ফেচ করে
  async getProductsByCategoryId(categoryId, filters = {}) {
    console.log("Fetching products by category ID:", categoryId);
    
    // প্রথমে ক্যাটাগরির নাম বের করুন
    const categories = await this.getCategories();
    const category = categories.find(cat => cat.id === categoryId || cat._id === categoryId);
    
    if (!category) {
      console.error("Category not found with ID:", categoryId);
      return { products: [], pagination: {} };
    }
    
    console.log("Found category:", category.name);
    
    // ক্যাটাগরির নাম দিয়ে প্রোডাক্ট ফেচ করুন
    return this.fetchProducts({ category: category.name, ...filters });
  }

  // পুরাতন মেথড - ক্যাটাগরি নাম দ্বারা (কম্প্যাটিবিলিটির জন্য রাখলাম)
  async getProductsByCategory(categoryName, filters = {}) {
    console.log("Fetching products by category name:", categoryName);
    const data = await this.fetchProducts({ category: categoryName, ...filters });
    return data;
  }

  async getProductsBySubcategory(categoryName, subcategoryName, filters = {}) {
    return this.fetchProducts({ category: categoryName, subcategory: subcategoryName, ...filters });
  }

  async searchProducts(query, filters = {}) {
    if (!query || !String(query).trim()) return [];
    const data = await this.fetchProducts({ search: query.trim(), ...filters });
    return data.products;
  }

  async getCategoryByName(categoryName) {
    const categories = await this.getCategories();
    return (
      categories.find(
        (cat) => String(cat?.name || "").toLowerCase() === String(categoryName || "").toLowerCase()
      ) || null
    );
  }

  async getCategoryById(categoryId) {
    const categories = await this.getCategories();
    return categories.find(cat => cat.id === categoryId || cat._id === categoryId) || null;
  }

  async getSubcategoryByName(categoryName, subcategoryName) {
    const category = await this.getCategoryByName(categoryName);
    if (!category) return null;

    return (
      category.subcategories?.find(
        (sub) => String(sub?.name || "").toLowerCase() === String(subcategoryName || "").toLowerCase()
      ) || null
    );
  }

  clearCache() {
    // No-op: intentionally disabled client cache.
  }

  async preload() {
    return null;
  }
}

// Create singleton instance
const dataService = new DataService();

// Export singleton
export default dataService;

// Also export the class for testing
export { DataService };