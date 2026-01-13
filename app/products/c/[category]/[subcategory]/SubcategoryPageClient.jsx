"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useNavigate } from "@/lib/navigation";
import ProductList from "@/components/DynamicProductCatalog/ProductList";
import SearchSuggestion from "@/components/Search/SearchSuggestion.jsx";
import ClientSideMetadata from "@/components/shared/ClientSideMetadata";

const SubcategoryPageClient = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedTireType, setSelectedTireType] = useState(null);
  const [showTireTypeDropdown, setShowTireTypeDropdown] = useState(false);

  // Refs for click outside detection
  const brandDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const tireTypeDropdownRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target)
      ) {
        setShowBrandDropdown(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setShowSortDropdown(false);
      }
      if (
        tireTypeDropdownRef.current &&
        !tireTypeDropdownRef.current.contains(event.target)
      ) {
        setShowTireTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/categories.json");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Convert URL slugs back to names
        const categoryName = decodeURIComponent(params.category).replace(
          /-/g,
          " "
        );
        const subcategoryName = decodeURIComponent(params.subcategory).replace(
          /-/g,
          " "
        );

        // Find the matching category and subcategory
        const foundCategory = data.find(
          (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (!foundCategory) {
          throw new Error("Category not found");
        }

        const foundSubcategory = foundCategory.subcategories?.find(
          (sub) => sub.name.toLowerCase() === subcategoryName.toLowerCase()
        );

        if (!foundSubcategory) {
          throw new Error("Subcategory not found");
        }

        setCategory(foundCategory);
        setSubcategory(foundSubcategory);

        // Set all products for search
        const products =
          foundSubcategory.products?.map((product) => ({
            ...product,
            category: foundCategory.name,
            subcategory: foundSubcategory.name,
          })) || [];
        setAllProducts(products);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (params.category && params.subcategory) {
      fetchData();
    }
  }, [params.category, params.subcategory]);

  // Update search suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase();
      const results = allProducts
        .filter((product) => {
          const productText = `
          ${product.name} 
          ${product.keyAttributes?.["Brand"] || ""} 
          ${product.keyAttributes?.Size || ""}
        `.toLowerCase();

          return productText.includes(query);
        })
        .slice(0, 5);

      setSearchSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allProducts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setShowBrandDropdown(false);
  };

  const toggleBrandDropdown = () => {
    setShowBrandDropdown(!showBrandDropdown);
  };

  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    setShowSortDropdown(false);
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  const handleTireTypeSelect = (tireType) => {
    setSelectedTireType(tireType);
    setShowTireTypeDropdown(false);
  };

  const toggleTireTypeDropdown = () => {
    setShowTireTypeDropdown(!showTireTypeDropdown);
  };

  // Check if current subcategory is Truck Tires
  const isTruckTires = subcategory?.name?.toLowerCase() === "truck tires";

  // Get unique brands from current subcategory products
  const getUniqueBrands = () => {
    if (!subcategory || !subcategory.products) return [];

    const brands = [
      ...new Set(
        subcategory.products
          .map((product) => product.keyAttributes?.["Brand"])
          .filter((brand) => brand)
      ),
    ];

    return brands.sort();
  };

  const uniqueBrands = getUniqueBrands();

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
            onClick={() => navigate("/products")}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Dynamic SEO Metadata */}
      <ClientSideMetadata
        title={`${subcategory?.name || "Products"} - ${
          category?.name || ""
        } | Asian Import Export`}
        description={`Browse ${subcategory?.products?.length || 0} ${
          subcategory?.name?.toLowerCase() || "products"
        } from ${
          category?.name || "our catalog"
        }. Wholesale prices, international shipping, quality guaranteed.`}
        canonical={`/products/c/${params.category}/${params.subcategory}`}
      />

      <div className="px-4 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center text-sm text-gray-600">
            <button
              onClick={() => navigate("/products")}
              className="hover:text-teal-600 transition-colors"
            >
              Products
            </button>
            <span className="mx-2">/</span>
            <span className="text-teal-600 font-medium">{category?.name}</span>
            <span className="mx-2">/</span>
            <span className="text-teal-600 font-medium">
              {subcategory?.name}
            </span>
          </nav>
        </div>

        {/* Search Bar Section */}
        <div className="mb-8 text-center relative">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Search in {subcategory?.name}
          </h2>
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto relative"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
                onFocus={() =>
                  searchQuery.length > 1 && setShowSuggestions(true)
                }
                className="w-full px-6 py-4 pr-12 border border-gray-300 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm text-teal-800"
              />
              <button
                type="submit"
                className="absolute right-2 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>

            <SearchSuggestion
              suggestions={searchSuggestions}
              onSuggestionClick={handleSuggestionClick}
              searchQuery={searchQuery}
              isVisible={showSuggestions}
            />
          </form>
        </div>

        {/* Category Header with Brand Filter and Sort */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-teal-800 flex items-center">
                <span className="mr-3 text-3xl">{category?.icon}</span>
                {subcategory?.name}
              </h1>
            </div>

            <div className="flex flex-row gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Sort by Price Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-0" ref={sortDropdownRef}>
              <button
                onClick={toggleSortDropdown}
                className="w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-3 border border-teal-200 bg-teal-50 text-teal-800 rounded-md hover:bg-teal-200 transition-colors text-sm sm:text-base sm:min-w-[180px]"
              >
                <span className="truncate sm:truncate-none">
                  {sortBy === "price-low-high" 
                    ? "Low to High"
                    : sortBy === "price-high-low"
                    ? "High to Low"
                    : "Sort by Price"}
                </span>
                <svg
                  className={`ml-1 sm:ml-0 h-4 w-4 flex-shrink-0 transition-transform ${
                    showSortDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showSortDropdown && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-56 bg-white rounded-sm shadow-lg z-10 border border-gray-200 overflow-hidden">
                  <div
                    className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 font-medium"
                    onClick={() => handleSortSelect("")}
                  >
                    Default
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900"
                    onClick={() => handleSortSelect("price-low-high")}
                  >
                    Low to High
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900"
                    onClick={() => handleSortSelect("price-high-low")}
                  >
                    High to Low
                  </div>
                </div>
              )}
            </div>

            {/* Tire Type Filter Dropdown - Only for Truck Tires */}
            {isTruckTires && (
              <div className="relative flex-1 sm:flex-initial min-w-0" ref={tireTypeDropdownRef}>
                <button
                  onClick={toggleTireTypeDropdown}
                  className="w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-md hover:bg-teal-200 transition-colors text-sm sm:text-base sm:min-w-[150px]"
                >
                  <span className="truncate sm:truncate-none">{selectedTireType || "Tire Type"}</span>
                  <svg
                    className={`ml-1 sm:ml-0 h-4 w-4 flex-shrink-0 transition-transform ${
                      showTireTypeDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showTireTypeDropdown && (
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-48 bg-white rounded-sm shadow-lg z-10 border border-gray-200 overflow-hidden">
                    <div
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 font-medium"
                      onClick={() => handleTireTypeSelect(null)}
                    >
                      All Types
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900"
                      onClick={() => handleTireTypeSelect("Drive")}
                    >
                      Drive
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900"
                      onClick={() => handleTireTypeSelect("Steer")}
                    >
                      Steer
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900"
                      onClick={() => handleTireTypeSelect("Trailer")}
                    >
                      Trailer
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Brand Filter Dropdown */}
            {uniqueBrands.length > 0 && (
              <div className="relative flex-1 sm:flex-initial min-w-0" ref={brandDropdownRef}>
                <button
                  onClick={toggleBrandDropdown}
                  className="w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-md hover:bg-teal-200 transition-colors text-sm sm:text-base sm:min-w-[150px]"
                >
                  <span className="truncate sm:truncate-none">{selectedBrand || "All Brands"}</span>
                  <svg
                    className={`ml-1 sm:ml-2 h-4 w-4 flex-shrink-0 transition-transform ${
                      showBrandDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showBrandDropdown && (
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-48 bg-white rounded-sm shadow-lg z-10 border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                    <div
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 font-medium"
                      onClick={() => handleBrandSelect(null)}
                    >
                      All Brands
                    </div>
                    {uniqueBrands.map((brand) => (
                      <div
                        key={brand}
                        className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900"
                        onClick={() => handleBrandSelect(brand)}
                      >
                        {brand}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Products List */}
        <ProductList
          category={category}
          subcategory={subcategory}
          selectedBrand={selectedBrand}
          selectedTireType={selectedTireType}
          sortBy={sortBy}
          isHomePage={false}
        />
      </div>
    </div>
  );
};

export default SubcategoryPageClient;
