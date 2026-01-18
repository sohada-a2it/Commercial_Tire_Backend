"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "@/lib/navigation";
import ProductSubcategory from "./ProductSubcategory";
import ProductList from "./ProductList";
import SearchSuggestion from "../Search/SearchSuggestion.jsx";
import ProductSlider from "./ProductSlider";

const ProductCatalog = ({ isHomePage = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSlideIndex, setMobileSlideIndex] = useState({});
  const intervalRefs = useRef({});

  const navigate = useNavigate();
  const location = useLocation();

  // Handle hash navigation for scrolling to categories
  useEffect(() => {
    if (categories.length === 0) return;

    const hash = location.hash?.replace('#', '');
    if (hash) {
      // Small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash, categories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("/categories.json");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load product categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize mobile slide indices and auto-slide
  useEffect(() => {
    if (categories.length === 0) return;

    // Initialize slide index for each category
    const initialIndices = {};
    categories.forEach((category) => {
      initialIndices[category.id] = 0;
    });
    setMobileSlideIndex(initialIndices);

    // Set up auto-slide for each category
    categories.forEach((category) => {
      if (category.subcategories && category.subcategories.length > 1) {
        intervalRefs.current[category.id] = setInterval(() => {
          setMobileSlideIndex((prev) => {
            const currentIndex = prev[category.id] || 0;
            const nextIndex =
              (currentIndex + 1) % category.subcategories.length;
            return { ...prev, [category.id]: nextIndex };
          });
        }, 3000);
      }
    });

    // Cleanup intervals
    return () => {
      Object.values(intervalRefs.current).forEach((interval) =>
        clearInterval(interval)
      );
      intervalRefs.current = {};
    };
  }, [categories]);

  // Helper function to convert name to URL slug
  const nameToSlug = (name) => {
    return name.replace(/\s+/g, "-");
  };

  const handleSubcategoryClick = (category, subcategory) => {
    const categorySlug = nameToSlug(category.name);
    const subcategorySlug = nameToSlug(subcategory.name);
    navigate(`/products/c/${categorySlug}/${subcategorySlug}`);
  };

  // Search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Flatten all products from all categories and subcategories
    const allProducts = categories.flatMap((category) =>
      (category.subcategories || []).flatMap((subcategory) =>
        (subcategory.products || []).map((product) => ({
          ...product,
          category: category.name,
          subcategory: subcategory.name,
        }))
      )
    );

    // Filter products based on search query
    const results = allProducts.filter((product) => {
      const searchTerms = query.toLowerCase().split(" ");
      const productText = `
        ${product.name} 
        ${product.keyAttributes?.["Brand"] || ""} 
        ${product.keyAttributes?.Size || ""} 
        ${product.keyAttributes?.Pattern || ""}
        ${product.description || ""}
      `.toLowerCase();

      return searchTerms.every((term) => productText.includes(term));
    });

    setSearchSuggestions(results.slice(0, 5)); // Show top 5 suggestions
    setShowSuggestions(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-800">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center p-4 bg-red-50 rounded-lg max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 max-w-7xl mx-auto">
        {/* Search Section */}
        {isHomePage && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-teal-800 mb-4 text-center">
              What are you looking for?
            </h2>
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto relative"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder="Search products, brands, categories..."
                  className="w-full px-6 py-4 pr-12 border border-gray-300 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm text-teal-800"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>

                {/* Search Suggestions */}
                <SearchSuggestion
                  suggestions={searchSuggestions}
                  onSuggestionClick={handleSuggestionClick}
                  searchQuery={searchQuery}
                  isVisible={showSuggestions}
                />
              </div>
            </form>
          </div>
        )}

        <h1 className="text-3xl font-bold text-teal-800 mb-2 mt-14 text-center">
          Product Catalog
        </h1>

        {/* Animated Horizontal Line - Centered */}
        <div className="flex justify-center mb-8 -mt-1">
          <div className="relative h-1 w-1/5 overflow-hidden bg-gray-200 rounded-full">
            <div className="absolute h-full w-1/4 animate-marquee bg-gradient-to-r from-teal-400 via-teal-600 to-teal-400 rounded-full"></div>
          </div>
        </div>

        {/* You can add this style tag globally or in your global CSS */}
        <style jsx global>{`
          @keyframes marquee {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(400%);
            }
          }
          .animate-marquee {
            animation: marquee 3s linear infinite;
          }
        `}</style>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Sidebar - Company Info */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md sticky top-[76px] max-h-[calc(100vh-100px)] overflow-auto">
              {/* Replace the static image with the slider */}
              <div className="h-full">
                <ProductSlider />
              </div>

              <p className="text-gray-600 text-sm p-3 bg-white border-t border-gray-200">
                Browse through our wide range of quality products across
                multiple categories.
              </p>
            </div>
          </div>

          {/* Right Side - Categories Grid */}
          <div className="lg:w-3/4">
            {categories.map((category, categoryIndex) => (
              <div key={category.id} id={nameToSlug(category.name)} className="mb-12 scroll-mt-20">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-800 rounded-t-lg p-4 shadow-lg">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="mr-3 text-3xl">{category.icon}</span>
                    {category.name}
                  </h2>
                </div>

                {/* Subcategories Grid */}
                <div className="bg-white rounded-b-lg shadow-md p-4">
                  {/* Desktop Grid View */}
                  <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {category.subcategories?.map((subcategory) => {
                      // Get the first product image as subcategory representative
                      const representativeImage =
                        subcategory.products?.[0]?.image ||
                        "/assets/placeholder.png";

                      return (
                        <div
                          key={subcategory.id}
                          onClick={() =>
                            handleSubcategoryClick(category, subcategory)
                          }
                          className="group cursor-pointer bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 hover:border-teal-400"
                        >
                          <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-white">
                            <img
                              src={representativeImage}
                              alt={subcategory.name}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <h3 className="text-center font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                            {subcategory.name}
                          </h3>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile Slider View */}
                  <div className="block sm:hidden relative">
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="relative overflow-hidden">
                        {/* Left Arrow */}
                        {category.subcategories.length > 1 && (
                          <button
                            onClick={() => {
                              setMobileSlideIndex((prev) => {
                                const currentIndex = prev[category.id] || 0;
                                const prevIndex =
                                  currentIndex === 0
                                    ? category.subcategories.length - 1
                                    : currentIndex - 1;
                                return { ...prev, [category.id]: prevIndex };
                              });
                              // Restart auto-slide
                              if (intervalRefs.current[category.id]) {
                                clearInterval(intervalRefs.current[category.id]);
                              }
                              intervalRefs.current[category.id] = setInterval(() => {
                                setMobileSlideIndex((prev) => {
                                  const currentIndex = prev[category.id] || 0;
                                  const nextIndex =
                                    (currentIndex + 1) % category.subcategories.length;
                                  return { ...prev, [category.id]: nextIndex };
                                });
                              }, 3000);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 text-teal-600 rounded-full p-2 shadow-lg hover:bg-teal-600 hover:text-white transition-all duration-300"
                            aria-label="Previous"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Right Arrow */}
                        {category.subcategories.length > 1 && (
                          <button
                            onClick={() => {
                              setMobileSlideIndex((prev) => {
                                const currentIndex = prev[category.id] || 0;
                                const nextIndex =
                                  (currentIndex + 1) % category.subcategories.length;
                                return { ...prev, [category.id]: nextIndex };
                              });
                              // Restart auto-slide
                              if (intervalRefs.current[category.id]) {
                                clearInterval(intervalRefs.current[category.id]);
                              }
                              intervalRefs.current[category.id] = setInterval(() => {
                                setMobileSlideIndex((prev) => {
                                  const currentIndex = prev[category.id] || 0;
                                  const nextIndex =
                                    (currentIndex + 1) % category.subcategories.length;
                                  return { ...prev, [category.id]: nextIndex };
                                });
                              }, 3000);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 text-teal-600 rounded-full p-2 shadow-lg hover:bg-teal-600 hover:text-white transition-all duration-300"
                            aria-label="Next"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        )}

                        <div
                          className="transition-transform duration-500 ease-in-out"
                          style={{
                            transform: `translateX(-${(mobileSlideIndex[category.id] || 0) * 100}%)`
                          }}
                        >
                          <div className="flex">
                            {category.subcategories.map((subcategory) => {
                              const representativeImage =
                                subcategory.products?.[0]?.image ||
                                "/assets/placeholder.png";

                              return (
                                <div
                                  key={subcategory.id}
                                  className="w-full flex-shrink-0 px-2"
                                  onClick={() =>
                                    handleSubcategoryClick(category, subcategory)
                                  }
                                >
                                  <div className="group cursor-pointer bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-teal-400">
                                    <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-white">
                                      <img
                                        src={representativeImage}
                                        alt={subcategory.name}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <h3 className="text-center font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                                      {subcategory.name}
                                    </h3>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Indicator Dots */}
                        {category.subcategories.length > 1 && (
                          <div className="flex justify-center gap-2 mt-4">
                            {category.subcategories.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setMobileSlideIndex((prev) => ({
                                    ...prev,
                                    [category.id]: idx
                                  }));
                                  // Restart auto-slide
                                  if (intervalRefs.current[category.id]) {
                                    clearInterval(intervalRefs.current[category.id]);
                                  }
                                  intervalRefs.current[category.id] = setInterval(() => {
                                    setMobileSlideIndex((prev) => {
                                      const currentIndex = prev[category.id] || 0;
                                      const nextIndex =
                                        (currentIndex + 1) % category.subcategories.length;
                                      return { ...prev, [category.id]: nextIndex };
                                    });
                                  }, 3000);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  idx === (mobileSlideIndex[category.id] || 0)
                                    ? "bg-teal-600 w-8"
                                    : "bg-gray-300"
                                }`}
                                aria-label={`Go to ${category.subcategories[idx].name}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
