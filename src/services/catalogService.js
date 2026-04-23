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
  
  // Tire-specific filters - ✅ সঠিক ফিল্ড নাম ব্যবহার করুন
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
  
  // ✅ প্রোডাক্টের tireSpecs নরমালাইজ করুন
  const normalizedProducts = (data.products || []).map(product => ({
    ...product,
    tireSpecs: Array.isArray(product.tireSpecs) ? product.tireSpecs : 
               (product.tireSpecs ? [product.tireSpecs] : []),
    mainTireSize: Array.isArray(product.tireSpecs) && product.tireSpecs.length > 0 
                  ? product.tireSpecs[0].size 
                  : null
  }));
  
  return {
    success: true,
    products: normalizedProducts,
    pagination: data.pagination || {
      page: Number(filters.page || 1),
      limit: Number(filters.limit || 20),
      total: normalizedProducts.length,
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
// services/catalogService.js
// ==================== PRODUCT DETAILS SERVICES ====================
// নিচের সমস্ত ফাংশন আপনার বিদ্যমান catalogService.js ফাইলের শেষে যোগ করুন

/**
 * Get complete product details for public view
 * @param {string} productId - Product ID or Source ID
 * @param {Object} options - Optional parameters
 * @param {boolean} options.includeRelated - Include related products (default: true)
 * @param {number} options.limit - Number of related products (default: 6)
 * @returns {Promise<Object>} Product details with specifications, features, reviews, etc.
 */
export const fetchProductDetails = async (productId, options = {}) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const { includeRelated = true, limit = 6 } = options;
  const params = new URLSearchParams();
  params.append('includeRelated', includeRelated);
  params.append('limit', limit);

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products/${productId}/details?${params.toString()}`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    product: data.product,
    relatedProducts: data.relatedProducts || [],
    similarBySize: data.similarBySize || []
  };
};

/**
 * Get product quick view data for modals
 * @param {string} productId - Product ID or Source ID
 * @returns {Promise<Object>} Quick view product data
 */ 
/**
 * Get product quick view data for modals
 * @param {string} productId - Product ID or Source ID
 * @returns {Promise<Object>} Quick view product data
 */ 
export const fetchProductQuickView = async (productId) => {
  if (!productId) throw new Error("Product ID is required");

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products/${productId}/quick-view`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  const product = data.product;
  
  // ✅ সঠিকভাবে tireSpecs থেকে ডাটা নেওয়া
  const tireSpecsArray = Array.isArray(product?.tireSpecs) ? product.tireSpecs : [];
  const firstSpec = tireSpecsArray.length > 0 ? tireSpecsArray[0] : {};
  
  return {
    success: true,
    product: {
      id: product.id,
      sourceId: product.sourceId,
      name: product.name,
      brand: product.brand,
      pattern: product.pattern,
      modelNumber: product.modelNumber,
      price: product.price,
      offerPrice: product.offerPrice,
      discountPercentage: product.discountPercentage || calculateDiscount(product.price, product.offerPrice),
      image: product.image,
      shortDescription: product.shortDescription,
      // ✅ tireSpecs থেকে সঠিকভাবে নেওয়া
      tireSize: firstSpec.size || null,
      loadIndex: firstSpec.loadIndex || null,
      speedRating: firstSpec.speedRating || null,
      treadDepth: firstSpec.treadDepth || null,
      plyRating: firstSpec.plyRating || null,
      loadRange: firstSpec.loadRange || null,
      constructionType: firstSpec.constructionType || null,
      availableSizes: tireSpecsArray.length,
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
      inStock: product.isActive !== false,
      isNewArrival: product.isNewArrival || false,
      isBestSeller: product.isBestSeller || false,
      isFeatured: product.isFeatured || false
    }
  };
};

/**
 * Get product technical specifications table
 * @param {string} productId - Product ID or Source ID
 * @returns {Promise<Object>} Grouped specifications
 */
export const fetchProductSpecifications = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products/${productId}/specs`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    product: data.product,
    specifications: data.specifications || {},
    rawSpecs: data.rawSpecs || {}
  };
};

/**
 * Get product reviews with pagination
 * @param {string} productId - Product ID or Source ID
 * @param {Object} options - Pagination and filter options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {number} options.rating - Filter by rating (1-5)
 * @returns {Promise<Object>} Reviews with statistics
 */
export const fetchProductReviews = async (productId, options = {}) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const { page = 1, limit = 10, rating } = options;
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (rating) params.append('rating', rating);

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products/${productId}/reviews?${params.toString()}`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    reviews: data.reviews || [],
    statistics: data.statistics || { average: 0, total: 0, distribution: {} },
    pagination: data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
  };
};

/**
 * Submit a product review
 * @param {string} productId - Product ID or Source ID
 * @param {Object} reviewData - Review data
 * @param {string} reviewData.username - Reviewer name
 * @param {string} reviewData.location - Reviewer location (optional)
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.title - Review title (optional)
 * @param {string} reviewData.text - Review text
 * @returns {Promise<Object>} Submitted review
 */
export const submitProductReview = async (productId, reviewData) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!reviewData.username || !reviewData.rating || !reviewData.text) {
    throw new Error("Username, rating, and review text are required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products/${productId}/reviews`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(reviewData),
    }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    message: data.message,
    review: data.review
  };
};

/**
 * Get product pricing information
 * @param {string} productId - Product ID or Source ID
 * @param {number} quantity - Requested quantity (default: 1)
 * @returns {Promise<Object>} Pricing details with tier information
 */
export const fetchProductPricing = async (productId, quantity = 1) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const params = new URLSearchParams();
  params.append('quantity', quantity);

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products/${productId}/pricing?${params.toString()}`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    product: data.product,
    pricing: data.pricing,
    allTiers: data.allTiers || []
  };
};

/**
 * Get product SEO metadata
 * @param {string} productId - Product ID or Source ID
 * @returns {Promise<Object>} SEO metadata including structured data
 */
export const fetchProductSEO = async (productId) => {
  if (!productId) throw new Error("Product ID is required");

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products/${productId}/seo`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  // ✅ SEO ডাটাতে tireSize ঠিক করুন
  const seo = data.seo;
  if (seo && seo.title) {
    // backend ইতিমধ্যে ঠিক করে দেবে, তাই আলাদা কিছু করার দরকার নেই
  }
  
  return {
    success: true,
    seo: data.seo
  };
};

// ==================== TIRE FINDER & COMPARISON SERVICES ====================

/**
 * Find tires by criteria (Tire Finder Tool)
 * @param {Object} criteria - Search criteria
 * @param {string} criteria.vehicleType - Vehicle type (truck, bus, etc.)
 * @param {string} criteria.roadType - Road type (highway, mixed, off-road)
 * @param {string} criteria.loadWeight - Load weight (light, medium, heavy)
 * @param {string} criteria.tireSize - Tire size (optional)
 * @param {string} criteria.application - Application type (optional)
 * @returns {Promise<Object>} Recommended tires with reasons
 */
export const findTiresByCriteria = async (criteria = {}) => {
  const params = new URLSearchParams();
  
  if (criteria.vehicleType) params.append('vehicleTypesList', criteria.vehicleType);
  if (criteria.roadType) params.append('roadType', criteria.roadType);
  if (criteria.loadWeight) params.append('loadWeight', criteria.loadWeight);
  if (criteria.tireSize) params.append('tireSize', criteria.tireSize);
  if (criteria.application) params.append('applicationsList', criteria.application);

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/tires/find?${params.toString()}`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    criteria: data.criteria,
    recommendations: data.recommendations || [],
    total: data.total || 0
  };
};

/**
 * Compare multiple tires
 * @param {string[]} productIds - Array of product IDs to compare (2-4 products)
 * @returns {Promise<Object>} Comparison data
 */
export const compareTires = async (productIds) => {
  if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
    throw new Error("At least 2 tire models required for comparison");
  }

  if (productIds.length > 4) {
    throw new Error("Maximum 4 tires can be compared at once");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/tires/compare`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ productIds }),
    }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    comparison: data.comparison || []
  };
};

// ==================== B2B INQUIRY SERVICES ====================

/**
 * Submit B2B inquiry
 * @param {Object} inquiryData - B2B inquiry data
 * @returns {Promise<Object>} Inquiry response
 */
export const submitB2BInquiry = async (inquiryData) => {
  const requiredFields = ['companyName', 'contactPerson', 'email', 'phone', 'items'];
  const missingFields = requiredFields.filter(field => !inquiryData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (!inquiryData.items || inquiryData.items.length === 0) {
    throw new Error("At least one product item is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/inquiries/b2b`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(inquiryData),
    }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    message: data.message,
    inquiryNumber: data.inquiryNumber,
    inquiryId: data.inquiryId
  };
};

// ==================== DEALER LOCATOR SERVICES ====================

/**
 * Find nearby dealers
 * @param {Object} options - Search options
 * @param {number} options.lat - Latitude
 * @param {number} options.lng - Longitude
 * @param {number} options.maxDistance - Maximum distance in meters (default: 50000)
 * @param {string} options.country - Country filter
 * @param {string} options.city - City filter
 * @param {string} options.search - Search term
 * @returns {Promise<Object>} List of dealers
 */
export const findNearbyDealers = async (options = {}) => {
  const params = new URLSearchParams();
  
  if (options.lat) params.append('lat', options.lat);
  if (options.lng) params.append('lng', options.lng);
  if (options.maxDistance) params.append('maxDistance', options.maxDistance);
  if (options.country) params.append('country', options.country);
  if (options.city) params.append('city', options.city);
  if (options.search) params.append('search', options.search);

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/dealers/nearby?${params.toString()}`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    dealers: data.dealers || []
  };
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format price for display
 * @param {string|number} price - Price value
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  const num = parseFloat(String(price || '0').replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
};

/**
 * Calculate discount percentage
 * @param {string} regularPrice - Regular price
 * @param {string} offerPrice - Offer price
 * @returns {number} Discount percentage
 */
export const calculateDiscount = (regularPrice, offerPrice) => {
  const regular = parseFloat(String(regularPrice || '0').replace(/[^0-9.-]/g, ''));
  const offer = parseFloat(String(offerPrice || '0').replace(/[^0-9.-]/g, ''));
  
  if (regular > 0 && offer > 0 && regular > offer) {
    return Math.round(((regular - offer) / regular) * 100);
  }
  return 0;
};

/**
 * Get tire type label
 * @param {string} tireType - Tire type value
 * @returns {string} Human readable label
 */
export const getTireTypeLabel = (tireType) => {
  const labels = {
    'steer': 'Steer Tire',
    'drive': 'Drive Tire',
    'trailer': 'Trailer Tire',
    'all-position': 'All-Position Tire',
    'off-road': 'Off-Road Tire',
    'mining': 'Mining Tire'
  };
  return labels[tireType] || tireType;
};

/**
 * Get application label
 * @param {string} application - Application value
 * @returns {string} Human readable label
 */
export const getApplicationLabel = (application) => {
  const labels = {
    'highway': 'Highway / Long Haul',
    'regional': 'Regional / Distribution',
    'mixed-service': 'Mixed Service',
    'off-road': 'Off-Road',
    'mining': 'Mining',
    'port': 'Port / Container',
    'construction': 'Construction'
  };
  return labels[application] || application;
};

/**
 * Get vehicle type label
 * @param {string} vehicleType - Vehicle type value
 * @returns {string} Human readable label
 */
export const getVehicleTypeLabel = (vehicleType) => {
  const labels = {
    'truck': 'Truck',
    'bus': 'Bus',
    'otr': 'OTR Equipment',
    'industrial': 'Industrial',
    'mining': 'Mining',
    'agricultural': 'Agricultural'
  };
  return labels[vehicleType] || vehicleType;
};

/**
 * Get all available filter options for products
 * @returns {Promise<Object>} Available filter options
 */
export const fetchFilterOptions = async () => {
  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products/filters`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    filters: data.filters || {
      tireTypes: [],
      vehicleTypes: [],
      applications: [],
      brands: [],
      patterns: [],
      tireSizes: []
    }
  };
};

/**
 * Get product breadcrumb navigation
 * @param {string} productId - Product ID or Source ID
 * @returns {Promise<Object>} Breadcrumb data
 */
export const fetchProductBreadcrumb = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/catalog/products/${productId}/breadcrumb`,
    { headers, cache: "no-store" }
  );
  
  const data = await parseResponse(response);
  
  return {
    success: true,
    breadcrumb: data.breadcrumb || []
  };
};
