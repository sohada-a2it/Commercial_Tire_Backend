"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "@/lib/navigation";
import SearchSuggestion from "../Search/SearchSuggestion.jsx";
import dataService from "@/services/dataService";
import { CategoryCardSkeleton, ProductCardSkeleton } from "../shared/SkeletonLoader";
import ProductCard from "../Product/ProductCard";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1605650849871-14b8f5b9c8b5?auto=format&fit=crop&w=1200&q=80";
// (commercial tire / automotive workshop feel)

const ProductCatalog = ({ isHomePage = false }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load More states for CATEGORIES
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(4);

  const navigate = useNavigate();
  const params = useParams();
  const categorySlug = params?.category;

  useEffect(() => {
    if (categorySlug) fetchCategoryAndProducts();
    else fetchCategories();
  }, [categorySlug]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await dataService.getCategories();
      setCategories(data);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);

      const allCategories = await dataService.getCategories();

      const matchedCategory = allCategories.find(
        (c) => nameToSlug(c.name) === categorySlug
      );

      if (!matchedCategory) {
        setError("Category not found");
        return;
      }

      setCurrentCategory(matchedCategory);

      const result = await dataService.getProductsByCategoryId(matchedCategory.id);

      setProducts(result.products || []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const nameToSlug = (name) =>
    String(name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const getImage = (img) => {
    if (!img) return DEFAULT_IMAGE;
    if (typeof img === "string") return img;
    if (typeof img === "object") {
      return img.url || img.secure_url || img.src || DEFAULT_IMAGE;
    }
    return DEFAULT_IMAGE;
  };

  const handleCategoryClick = (cat) => {
    navigate(`/products/c/${nameToSlug(cat.name)}/`);
  };

  const handleBack = () => navigate("/products");

  const handleProductClick = (p) => navigate(`/product?id=${p.id}`);

  // Load More Categories handler
  const handleLoadMoreCategories = () => {
    setVisibleCategoryCount(prev => prev + 4);
  };

  // Show Less Categories handler
  const handleShowLessCategories = () => {
    setVisibleCategoryCount(4);
    const gridElement = document.querySelector('.categories-grid-section');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const displayedCategories = categories.slice(0, visibleCategoryCount);
  const hasMoreCategories = categories.length > visibleCategoryCount;
  const hasVisibleCategories = visibleCategoryCount > 4;

  /* ================= CATEGORY PAGE ================= */
  if (categorySlug && !loading && currentCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Back */}
          <button
            onClick={handleBack}
            className="mb-6 sm:mb-8 text-sm font-medium text-gray-600 hover:text-amber-500 transition flex items-center gap-1 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back to categories
          </button>

          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
              {currentCategory.name}
            </h1>

            <p className="text-gray-500 mt-2 max-w-2xl text-sm sm:text-base">
              {currentCategory.description}
            </p>

            {/* AMBER BRAND LINE */}
            <div className="w-20 sm:w-28 h-[3px] mt-3 sm:mt-4 rounded-full bg-amber-500 shadow-sm" />
          </div>

          {/* PRODUCTS */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className="group cursor-pointer bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  <div className="h-44 xs:h-48 sm:h-52 md:h-56 bg-gray-100 overflow-hidden">
                    <img
                      src={getImage(p.image)}
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      alt={p.name}
                    />
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-800 group-hover:text-amber-500 transition text-sm sm:text-base">
                      {p.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      View details →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24">
              <div className="text-5xl sm:text-6xl mb-4">🛞</div>
              <p className="text-gray-500 text-sm sm:text-base">
                No products available in this tire category
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================= CATEGORY GRID with LOAD MORE ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800">
            Product Categories
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Explore commercial tire & automotive collections
          </p>

          <div className="w-20 sm:w-24 h-[3px] bg-amber-500 mx-auto mt-3 sm:mt-4 rounded-full" />
        </div>

        {/* CATEGORIES GRID */}
        {categories.length > 0 ? (
          <>
            <div className="categories-grid-section grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 md:gap-7 lg:gap-8">
              {displayedCategories.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleCategoryClick(c)}
                  className="group cursor-pointer bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  {/* IMAGE */}
                  <div className="h-40 xs:h-44 sm:h-48 md:h-52 bg-gray-100 overflow-hidden">
                    <img
                      src={getImage(c.image)}
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      alt={c.name}
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-amber-500 transition">
                      {c.name}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Explore tire collection →
                    </p>
                  </div>

                  {/* HOVER ACCENT */}
                  <div className="h-[3px] w-0 group-hover:w-full bg-amber-500 transition-all duration-300" />
                </div>
              ))}
            </div>

            {/* LOAD MORE / SHOW LESS BUTTONS FOR CATEGORIES */}
            {categories.length > 4 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-10 sm:mt-12 md:mt-14">
                {hasMoreCategories && (
                  <button
                    onClick={handleLoadMoreCategories}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    Load More Categories
                  </button>
                )}

                {hasVisibleCategories && (
                  <button
                    onClick={handleShowLessCategories}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full transition-all duration-300 text-sm sm:text-base"
                  >
                    Show Less
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;