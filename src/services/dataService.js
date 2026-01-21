/**
 * Centralized Data Service
 * Provides cached access to categories.json to prevent multiple fetches
 */

class DataService {
  constructor() {
    this.cache = {
      categories: null,
      timestamp: null,
    };
    this.fetchPromise = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Get all categories with caching
   * @returns {Promise<Array>} Categories data
   */
  async getCategories() {
    // Return cached data if valid
    if (this.isCacheValid()) {
      return this.cache.categories;
    }

    // If already fetching, return the existing promise
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    // Fetch new data
    this.fetchPromise = this.fetchCategories();
    
    try {
      const data = await this.fetchPromise;
      this.cache.categories = data;
      this.cache.timestamp = Date.now();
      return data;
    } finally {
      this.fetchPromise = null;
    }
  }

  /**
   * Fetch categories from server
   * @private
   */
  async fetchCategories() {
    try {
      const response = await fetch("/categories.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Check if cache is still valid
   * @private
   */
  isCacheValid() {
    if (!this.cache.categories || !this.cache.timestamp) {
      return false;
    }
    const age = Date.now() - this.cache.timestamp;
    return age < this.CACHE_DURATION;
  }

  /**
   * Get all products from all categories
   * @returns {Promise<Array>} Flattened array of all products
   */
  async getAllProducts() {
    const categories = await this.getCategories();
    const products = [];
    
    categories.forEach((category) => {
      category.subcategories?.forEach((subcategory) => {
        subcategory.products?.forEach((product) => {
          products.push({
            ...product,
            categoryName: category.name,
            categoryIcon: category.icon,
            subcategoryName: subcategory.name,
          });
        });
      });
    });
    
    return products;
  }

  /**
   * Get a specific product by ID
   * @param {string|number} productId 
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  async getProductById(productId) {
    const categories = await this.getCategories();
    
    for (const category of categories) {
      for (const subcategory of category.subcategories || []) {
        const product = subcategory.products?.find(
          (p) => String(p.id) === String(productId)
        );
        if (product) {
          return {
            ...product,
            categoryName: category.name,
            categoryIcon: category.icon,
            subcategoryName: subcategory.name,
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Get products by category
   * @param {string} categoryName 
   * @returns {Promise<Array>} Array of products in the category
   */
  async getProductsByCategory(categoryName) {
    const categories = await this.getCategories();
    const category = categories.find((cat) => cat.name === categoryName);
    
    if (!category) return [];
    
    const products = [];
    category.subcategories?.forEach((subcategory) => {
      subcategory.products?.forEach((product) => {
        products.push({
          ...product,
          categoryName: category.name,
          categoryIcon: category.icon,
          subcategoryName: subcategory.name,
        });
      });
    });
    
    return products;
  }

  /**
   * Get products by subcategory
   * @param {string} categoryName 
   * @param {string} subcategoryName 
   * @returns {Promise<Array>} Array of products in the subcategory
   */
  async getProductsBySubcategory(categoryName, subcategoryName) {
    const categories = await this.getCategories();
    const category = categories.find((cat) => cat.name === categoryName);
    
    if (!category) return [];
    
    const subcategory = category.subcategories?.find(
      (sub) => sub.name === subcategoryName
    );
    
    if (!subcategory) return [];
    
    return (subcategory.products || []).map((product) => ({
      ...product,
      categoryName: category.name,
      categoryIcon: category.icon,
      subcategoryName: subcategory.name,
    }));
  }

  /**
   * Search products by query
   * @param {string} query 
   * @returns {Promise<Array>} Array of matching products
   */
  async searchProducts(query) {
    const products = await this.getAllProducts();
    const searchTerm = query.toLowerCase();
    
    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.categoryName?.toLowerCase().includes(searchTerm) ||
        product.subcategoryName?.toLowerCase().includes(searchTerm) ||
        Object.values(product.keyAttributes || {}).some((attr) =>
          String(attr).toLowerCase().includes(searchTerm)
        )
      );
    });
  }

  /**
   * Get category by name
   * @param {string} categoryName 
   * @returns {Promise<Object|null>} Category object or null
   */
  async getCategoryByName(categoryName) {
    const categories = await this.getCategories();
    return categories.find((cat) => cat.name === categoryName) || null;
  }

  /**
   * Get subcategory by names
   * @param {string} categoryName 
   * @param {string} subcategoryName 
   * @returns {Promise<Object|null>} Subcategory object or null
   */
  async getSubcategoryByName(categoryName, subcategoryName) {
    const category = await this.getCategoryByName(categoryName);
    if (!category) return null;
    
    return (
      category.subcategories?.find((sub) => sub.name === subcategoryName) || null
    );
  }

  /**
   * Clear cache (useful for forcing refresh)
   */
  clearCache() {
    this.cache = {
      categories: null,
      timestamp: null,
    };
  }

  /**
   * Preload data (call this on app initialization)
   */
  async preload() {
    try {
      await this.getCategories();
      console.log('✓ Categories data preloaded');
    } catch (error) {
      console.error('Failed to preload categories:', error);
    }
  }
}

// Create singleton instance
const dataService = new DataService();

// Export singleton
export default dataService;

// Also export the class for testing
export { DataService };
