"use client";

// pages/SearchResults.jsx
import React, { useState, useEffect, Suspense, useRef } from "react";
import { useLocation, useNavigate } from "@/lib/navigation";
import ProductList from "../DynamicProductCatalog/ProductList";
import SearchSuggestion from "./SearchSuggestion.jsx";

const SearchResultsContent = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedTireType, setSelectedTireType] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showTireTypeDropdown, setShowTireTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const brandDropdownRef = useRef(null);
  const tireTypeDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) {
        setShowBrandDropdown(false);
      }
      if (tireTypeDropdownRef.current && !tireTypeDropdownRef.current.contains(event.target)) {
        setShowTireTypeDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("q") || "";
    setSearchQuery(query);
    setInputValue(query);

    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [location.search]);

  // Fetch categories once for suggestions
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/categories.json");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const performSearch = async (query) => {
    try {
      setLoading(true);
      const response = await fetch("/categories.json");
      const categories = await response.json();

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

      // Simple search algorithm - you can enhance this as needed
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

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique brands from search results
  const getUniqueBrands = () => {
    if (!searchResults || searchResults.length === 0) return [];
    const brands = [
      ...new Set(
        searchResults
          .map((product) => product.keyAttributes?.["Brand"])
          .filter((brand) => brand)
      ),
    ];
    return brands.sort();
  };

  const uniqueBrands = getUniqueBrands();

  // Check if results contain truck tires
  const hasTruckTires = searchResults.some(
    (product) => product.subcategory?.toLowerCase() === "truck tires"
  );

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setShowBrandDropdown(false);
  };

  const handleTireTypeSelect = (tireType) => {
    setSelectedTireType(tireType);
    setShowTireTypeDropdown(false);
  };

  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    setShowSortDropdown(false);
  };

  const handleNewSearch = (e) => {
    e.preventDefault();
    const newQuery = inputValue.trim();

    if (newQuery) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);

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
    setInputValue("");
    navigate(`/product/${suggestion.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-800">Searching products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleNewSearch} className="max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleSearchInputChange}
                onFocus={() => inputValue && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search products, brands, categories..."
                className="w-full px-6 py-4 pr-12 border border-gray-300 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm text-teal-800"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
              
              {/* Search Suggestions */}
              <SearchSuggestion
                suggestions={searchSuggestions}
                onSuggestionClick={handleSuggestionClick}
                searchQuery={inputValue}
                isVisible={showSuggestions}
              />
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-teal-800">
                Search Results
              </h1>
              <p className="text-gray-600 mt-2">
                Found {searchResults.length} product(s) for "{searchQuery}"
              </p>
            </div>

            {/* Filters Section - Same layout as product page */}
            {searchResults.length > 0 && (
              <div className="flex flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                {/* Sort by Price Dropdown */}
                <div className="relative flex-1 sm:flex-initial min-w-0" ref={sortDropdownRef}>
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
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

                {/* Tire Type Filter Dropdown - Only if truck tires in results */}
                {hasTruckTires && (
                  <div className="relative flex-1 sm:flex-initial min-w-0" ref={tireTypeDropdownRef}>
                    <button
                      onClick={() => setShowTireTypeDropdown(!showTireTypeDropdown)}
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
                          onClick={() => handleTireTypeSelect("")}
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
                      onClick={() => setShowBrandDropdown(!showBrandDropdown)}
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
                      <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-48 bg-white rounded-sm shadow-lg z-10 border border-gray-200 max-h-64 overflow-y-auto">
                        <div
                          className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 font-medium"
                          onClick={() => handleBrandSelect("")}
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
            )}
          </div>

          {searchResults.length > 0 ? (
            <>
              {/* Create a mock subcategory object for ProductList */}
              <ProductList
                category={{ name: "Search Results" }}
                subcategory={{
                  name: `Results for "${searchQuery}"`,
                  products: searchResults,
                }}
                selectedBrand={selectedBrand}
                selectedTireType={selectedTireType}
                sortBy={sortBy}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-4">🔍</div>
              <h3 className="text-xl text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">
                Try different keywords or browse our categories
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SearchResults = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="loading loading-spinner loading-lg"></div></div>}>
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchResults;
