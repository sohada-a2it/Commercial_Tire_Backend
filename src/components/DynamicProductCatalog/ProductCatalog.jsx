"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "@/lib/navigation";
import SearchSuggestion from "../Search/SearchSuggestion.jsx";
import dataService from "@/services/dataService";
import { CategoryCardSkeleton, ProductCardSkeleton } from "../shared/SkeletonLoader";
import ProductCard from "../Product/ProductCard"; // You'll need to create this component

const ProductCatalog = ({ isHomePage = false }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const categorySlug = params?.category;

  // Fetch categories or products based on URL
  useEffect(() => {
    if (categorySlug) {
      // We're on a category page - fetch products for this category
      fetchCategoryAndProducts();
    } else {
      // We're on the main catalog page - fetch all categories
      fetchCategories();
    }
  }, [categorySlug]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await dataService.getCategories();
      setCategories(data);
      setCurrentCategory(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load product categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryAndProducts = async () => {
  try {
    setLoading(true);
    console.log("Category slug:", categorySlug);
    
    // প্রথমে সব ক্যাটাগরি ফেচ করুন
    const allCategories = await dataService.getCategories();
    console.log("All categories:", allCategories);
    
    // স্লাগ দ্বারা ক্যাটাগরি ম্যাচ করুন
    const matchedCategory = allCategories.find(
      cat => nameToSlug(cat.name) === categorySlug
    );
    
    console.log("Matched category:", matchedCategory);
    
    if (matchedCategory) {
      setCurrentCategory(matchedCategory);
      
      // আপডেটেড মেথড ব্যবহার করুন - ক্যাটাগরি আইডি দ্বারা
      const result = await dataService.getProductsByCategoryId(matchedCategory.id);
      console.log("Products result:", result);
      
      // প্রোডাক্ট সেট করুন (result.products হচ্ছে array)
      const productsList = result.products || [];
      console.log("Products count:", productsList.length);
      
      setProducts(productsList);
      
      // যদি কোনো প্রোডাক্ট না থাকে
      if (productsList.length === 0) {
        console.log("No products found for this category");
      }
    } else {
      setError("Category not found");
    }
  } catch (err) {
    console.error("Error fetching category products:", err);
    setError("Failed to load products. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  const nameToSlug = (name) => {
    return String(name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const resolveImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string") return image.trim();
    if (typeof image === "object") {
      return String(image.url || image.optimizedUrl || image.secure_url || image.src || "").trim();
    }
    return "";
  };

  const getCategoryImage = (category) => {
    return (
      resolveImageUrl(category?.image) ||
      "/assets/placeholder.png"
    );
  };

  const handleCategoryClick = (category) => {
    const categorySlug = nameToSlug(category.name);
    navigate(`/products/c/${categorySlug}/`);
  };

  const handleBackToCategories = () => {
    navigate('/products');
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setSearchLoading(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const results = await dataService.searchProducts(query, { page: 1, limit: 5 });
        setSearchSuggestions(results);
        setShowSuggestions(true);
      } catch (_error) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearchLoading(false);
      }
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`/product/${suggestion.id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Render products page for specific category
  if (categorySlug && !loading && currentCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Back Button */}
          <button
            onClick={handleBackToCategories}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors duration-300 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>

          {/* Category Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              {currentCategory.icon && (
                <div className="text-4xl">{currentCategory.icon}</div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {currentCategory.name}
              </h1>
            </div>
            {currentCategory.description && (
              <p className="text-gray-600 text-lg">{currentCategory.description}</p>
            )}
            <div className="w-20 h-1 bg-amber-500 mt-3 rounded-full"></div>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
              <p className="text-gray-500">No products available in this category yet.</p>
              <button
                onClick={handleBackToCategories}
                className="mt-6 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all duration-300"
              >
                Browse Other Categories
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {isHomePage && (
            <div className="max-w-2xl mx-auto mb-10">
              <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          )}
          
          <div className="text-center mb-10">
            <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-3 animate-pulse"></div>
            <div className="w-20 h-1 bg-gray-200 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render categories grid (main catalog page)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Product Categories
          </h1>
          <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-3">Browse our collection by category</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const categoryImage = getCategoryImage(category);
            const subcategoryCount = category.subcategories?.length || 0;

            return (
              <div
                key={category.id}
                id={nameToSlug(category.name)}
                onClick={() => handleCategoryClick(category)}
                className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100"
              >
                {/* Category Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-50 to-gray-100">
                  <img
                    src={categoryImage}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {category.icon && (
                    <div className="absolute top-3 right-3 text-3xl drop-shadow-lg">
                      {category.icon}
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors duration-300 mb-2">
                    {category.name}
                  </h3>
                  
                  {subcategoryCount > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {category.subcategories?.slice(0, 3).map((sub, idx) => (
                        <span
                          key={sub.id}
                          className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {subcategoryCount > 3 && (
                        <span className="text-xs text-amber-600 font-medium">
                          +{subcategoryCount - 3} more
                        </span>
                      )}
                    </div>
                  )} 
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Found</h3>
            <p className="text-gray-500">Please check back later for our product categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;