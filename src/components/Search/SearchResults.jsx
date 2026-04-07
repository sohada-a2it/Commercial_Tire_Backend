"use client";

// pages/SearchResults.jsx
import React, { useState, useEffect, Suspense, useRef } from "react";
import { useLocation, useNavigate } from "@/lib/navigation";
import ProductList from "../DynamicProductCatalog/ProductList";
import SearchSuggestion from "./SearchSuggestion.jsx";
import dataService from "@/services/dataService";
import { SearchPageSkeleton } from "@/components/shared/RouteSkeletons";

const SearchResultsContent = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMeta, setSearchMeta] = useState({ total: 0 });
  const [searchInputLoading, setSearchInputLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedTireType, setSelectedTireType] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showTireTypeDropdown, setShowTireTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const brandDropdownRef = useRef(null);
  const tireTypeDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
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
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q") || "";
    const brand = searchParams.get("brand") || "";
    const tireType = searchParams.get("tireType") || "";
    const sort = searchParams.get("sort") || "";
    
    setSearchQuery(query);
    setInputValue(query);
    setSelectedBrand(brand);
    setSelectedTireType(tireType);
    setSortBy(sort);

    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    try {
      setLoading(true);
      const response = await dataService.fetchProducts({
        search: query,
        page: 1,
        limit: 48,
        brand: selectedBrand || undefined,
        pattern: selectedTireType || undefined,
      });

      setSearchResults(response.products || []);
      setSearchMeta({ total: response.pagination?.total || (response.products || []).length });
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
          .map((product) => product.keyAttributes?.["Brand"] || product.brand)
          .filter((brand) => brand)
      ),
    ];
    return brands.sort();
  };

  const uniqueBrands = getUniqueBrands();

  // Check if results contain truck tires
  const hasTruckTires = searchResults.some(
    (product) =>
      String(product.subcategory || product.subcategoryName || "").toLowerCase() === "truck tires"
  );

  // Helper function to update URL with current filters
  const updateURLWithFilters = (brand, sort, tireType) => {
    const params = new URLSearchParams(location.search);
    
    if (brand) {
      params.set('brand', brand);
    } else {
      params.delete('brand');
    }
    
    if (sort) {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    
    if (tireType) {
      params.set('tireType', tireType);
    } else {
      params.delete('tireType');
    }

    const queryString = params.toString();
    const newUrl = queryString 
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    
    window.history.replaceState({}, '', newUrl);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setShowBrandDropdown(false);
    updateURLWithFilters(brand, sortBy, selectedTireType);
  };

  const handleTireTypeSelect = (tireType) => {
    setSelectedTireType(tireType);
    setShowTireTypeDropdown(false);
    updateURLWithFilters(selectedBrand, sortBy, tireType);
  };

  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    setShowSortDropdown(false);
    updateURLWithFilters(selectedBrand, sortOption, selectedTireType);
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
      setSearchInputLoading(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchInputLoading(true);
        const results = await dataService.searchProducts(query, { page: 1, limit: 5 });
        setSearchSuggestions(results);
        setShowSuggestions(true);
      } catch (_error) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearchInputLoading(false);
      }
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    setInputValue("");
    navigate(`/product/${suggestion.id}`);
  };

  if (loading) {
    return <SearchPageSkeleton />;
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
                isVisible={showSuggestions && !searchInputLoading}
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
                Found {searchMeta.total || searchResults.length} product(s) for "{searchQuery}"
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
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchResults;
