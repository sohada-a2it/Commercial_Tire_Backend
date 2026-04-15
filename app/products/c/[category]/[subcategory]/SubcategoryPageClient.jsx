"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useNavigate } from "@/lib/navigation";
import ProductList from "@/components/DynamicProductCatalog/ProductList";
import SearchSuggestion from "@/components/Search/SearchSuggestion.jsx";
import ClientSideMetadata from "@/components/shared/ClientSideMetadata";
import CategoryBanner from "@/common/CategoryBanner";
import TruckTireBanner from "@/components/DynamicProductCatalog/TruckTireBanner";
import RecentPurchaseNotification from "@/components/shared/RecentPurchaseNotification";
import dataService from "@/services/dataService";
import { SubcategoryPageSkeleton } from "@/components/shared/RouteSkeletons";

const DESKTOP_PAGE_SIZE = 8;
const MOBILE_PAGE_SIZE = 4;

const getPageSize = () => {
  if (typeof window === "undefined") return DESKTOP_PAGE_SIZE;
  return window.innerWidth < 640 ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
};

const getScrollTopOffset = () => {
  if (typeof window === "undefined") return 60;
  return window.innerWidth < 640 ? 20 : 60;
};

const parsePriceForSort = (priceValue) => {
  if (priceValue === undefined || priceValue === null) return 0;
  const cleaned = String(priceValue).replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sortProductsByPrice = (items, sortMode) => {
  const direction = sortMode === "price-high-low" ? -1 : 1;
  return [...items].sort((left, right) => {
    const leftPrice = parsePriceForSort(left.offerPrice || left.price);
    const rightPrice = parsePriceForSort(right.offerPrice || right.price);

    if (leftPrice !== rightPrice) {
      return direction * (leftPrice - rightPrice);
    }

    return String(left.name || "").localeCompare(String(right.name || ""));
  });
};

const SubcategoryPageClient = () => {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigate = useNavigate();

  const runtimePathMatch = String(pathname || "").match(/^\/products\/c\/([^/]+)\/([^/]+)\/?$/i);
  const categorySlug = String(params?.category || runtimePathMatch?.[1] || "");
  const subcategorySlug = String(params?.subcategory || runtimePathMatch?.[2] || "");

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
  const [popupProducts, setPopupProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [priceSortedProducts, setPriceSortedProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false, total: 0 });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  const isVehicleCategory =
    String(category?.name || "").toLowerCase() ===
    "vehicle parts and accessories";
  const isTruckTiresSubcategory = ["truck tires", "truck tyre", "truck tyres"].includes(
    String(subcategory?.name || "").toLowerCase()
  );

  // Refs for click outside detection
  const brandDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const tireTypeDropdownRef = useRef(null);
  const filterSectionRef = useRef(null); // Ref for scrolling to filter section

  useEffect(() => {
    const updatePageSize = () => {
      setPageSize(getPageSize());
    };

    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  // Initialize filters from URL params on mount and when params change
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const sortParam = searchParams.get('sort');
    const tireTypeParam = searchParams.get('tireType');

    setLoading(true);
    setSelectedBrand(brandParam || null);
    setSortBy(sortParam || "");
    setSelectedTireType(tireTypeParam || null);
    setFiltersInitialized(true);
  }, [searchParams]);

  // Helper function to update URL with current filters
  const updateURLWithFilters = (brand, sort, tireType) => {
    const params = new URLSearchParams();
    
    if (brand) params.set('brand', brand);
    if (sort) params.set('sort', sort);
    if (tireType) params.set('tireType', tireType);

    const queryString = params.toString();
    const newUrl = queryString 
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    
    window.history.replaceState({}, '', newUrl);
  };

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
        const data = await dataService.getCategories();

        // Convert URL slugs back to names
        const categoryName = decodeURIComponent(categorySlug).replace(
          /-/g,
          " "
        );
        const subcategoryName = decodeURIComponent(subcategorySlug).replace(
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
        setSubcategory({ ...foundSubcategory, products: [] });

        const isPriceSort = sortBy === "price-low-high" || sortBy === "price-high-low";

        if (isPriceSort) {
          const productsResponse = await dataService.getProductsBySubcategory(
            foundCategory.name,
            foundSubcategory.name,
            {
              all: true,
              brand: selectedBrand || undefined,
              pattern: selectedTireType || undefined,
              sort: sortBy,
            }
          );

          const mappedProducts = (productsResponse.products || []).map((product) => ({
            ...product,
            category: foundCategory.name,
            subcategory: foundSubcategory.name,
          }));

          const sortedProducts = sortProductsByPrice(mappedProducts, sortBy);
          const firstPageProducts = sortedProducts.slice(0, pageSize);
          const total = sortedProducts.length;
          const totalPages = Math.max(1, Math.ceil(total / pageSize));

          setPriceSortedProducts(sortedProducts);
          setProducts(firstPageProducts);
          setAllProducts(firstPageProducts);
          setPopupProducts(firstPageProducts.slice(0, 10));
          setAvailableBrands(productsResponse.filters?.brands || []);
          setPagination({
            page: 1,
            totalPages,
            hasNextPage: totalPages > 1,
            hasPrevPage: false,
            total,
          });
        } else {
          setPriceSortedProducts([]);
          const productsResponse = await dataService.getProductsBySubcategory(
            foundCategory.name,
            foundSubcategory.name,
            {
              page: 1,
              limit: pageSize,
              brand: selectedBrand || undefined,
              pattern: selectedTireType || undefined,
              sort: sortBy || undefined,
            }
          );

          const pageProducts = (productsResponse.products || []).map((product) => ({
            ...product,
            category: foundCategory.name,
            subcategory: foundSubcategory.name,
          }));

          setProducts(pageProducts);
          setAllProducts(pageProducts);
          setPopupProducts(pageProducts.slice(0, 10));
          setAvailableBrands(productsResponse.filters?.brands || []);
          setPagination({
            page: productsResponse.pagination?.page || 1,
            totalPages: productsResponse.pagination?.totalPages || 1,
            hasNextPage: Boolean(productsResponse.pagination?.hasNextPage),
            hasPrevPage: Boolean(productsResponse.pagination?.hasPrevPage),
            total: productsResponse.pagination?.total || pageProducts.length,
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (!filtersInitialized) {
      return;
    }

    if (categorySlug && subcategorySlug) {
      fetchData();
    }
  }, [categorySlug, subcategorySlug, selectedBrand, selectedTireType, sortBy, pageSize, filtersInitialized]);

  const handlePageChange = async (targetPage) => {
    if (!category || !subcategory) return;
    if (targetPage < 1 || targetPage > Number(pagination.totalPages || 1)) return;

    try {
      setLoading(true);

      const isPriceSort = sortBy === "price-low-high" || sortBy === "price-high-low";
      if (isPriceSort && priceSortedProducts.length > 0) {
        const startIdx = (targetPage - 1) * pageSize;
        const nextProducts = priceSortedProducts.slice(startIdx, startIdx + pageSize);

        setProducts(nextProducts);
        setAllProducts(nextProducts);
        setPopupProducts(nextProducts.slice(0, 10));
        setPagination((prev) => ({
          ...prev,
          page: targetPage,
          hasPrevPage: targetPage > 1,
          hasNextPage: targetPage < Number(prev.totalPages || 1),
        }));

        const sectionTop = filterSectionRef.current
          ? filterSectionRef.current.getBoundingClientRect().top + window.scrollY
          : 0;
        const offset = getScrollTopOffset();
        window.scrollTo({ top: Math.max(0, sectionTop - offset), behavior: "smooth" });
        return;
      }

      const response = await dataService.getProductsBySubcategory(category.name, subcategory.name, {
        page: targetPage,
        limit: pageSize,
        brand: selectedBrand || undefined,
        pattern: selectedTireType || undefined,
        sort: sortBy || undefined,
      });

      const nextProducts = (response.products || []).map((product) => ({
        ...product,
        category: category.name,
        subcategory: subcategory.name,
      }));

      setProducts(nextProducts);
      setAllProducts(nextProducts);
      setPopupProducts(nextProducts.slice(0, 10));
      setPagination({
        page: response.pagination?.page || targetPage,
        totalPages: response.pagination?.totalPages || 1,
        hasNextPage: Boolean(response.pagination?.hasNextPage),
        hasPrevPage: Boolean(response.pagination?.hasPrevPage),
        total: response.pagination?.total || nextProducts.length,
      });

      const sectionTop = filterSectionRef.current
        ? filterSectionRef.current.getBoundingClientRect().top + window.scrollY
        : 0;
      const offset = getScrollTopOffset();
      window.scrollTo({ top: Math.max(0, sectionTop - offset), behavior: "smooth" });
    } catch (err) {
      console.error("Error loading page products:", err);
    } finally {
      setLoading(false);
    }
  };

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
    setLoading(true);
    setSelectedBrand(brand);
    setShowBrandDropdown(false);
    updateURLWithFilters(brand, sortBy, selectedTireType);
  };

  const toggleBrandDropdown = () => {
    setShowBrandDropdown(!showBrandDropdown);
  };

  const handleSortSelect = (sortOption) => {
    setLoading(true);
    setSortBy(sortOption);
    setShowSortDropdown(false);
    updateURLWithFilters(selectedBrand, sortOption, selectedTireType);
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  const handleTireTypeSelect = (tireType) => {
    setLoading(true);
    setSelectedTireType(tireType);
    setShowTireTypeDropdown(false);
    updateURLWithFilters(selectedBrand, sortBy, tireType);
  };

  const toggleTireTypeDropdown = () => {
    setShowTireTypeDropdown(!showTireTypeDropdown);
  };

  // Handler for when user clicks a brand from the banner
  const handleBrandClickFromBanner = (brandName) => {
    // Set the brand filter
    setLoading(true);
    setSelectedBrand(brandName);
    updateURLWithFilters(brandName, sortBy, selectedTireType);
    
    // Scroll to the filter section with smooth animation
    setTimeout(() => {
      if (filterSectionRef.current) {
        filterSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // Check if current subcategory is Truck Tires
  const isTruckTires = isVehicleCategory && isTruckTiresSubcategory;

  // Get unique brands from current subcategory products
  const getUniqueBrands = () => {
    if (availableBrands.length > 0) {
      return [...availableBrands].sort();
    }

    const brands = [...new Set(products.map((product) => product.keyAttributes?.["Brand"]).filter(Boolean))];
    return brands.sort();
  };

  const uniqueBrands = getUniqueBrands();

  if (!filtersInitialized || loading) {
    return <SubcategoryPageSkeleton />;
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
    <div className="min-h-screen bg-gray-50 py-5 sm:py-8">
      {/* Dynamic SEO Metadata */}
      <ClientSideMetadata
        title={`${subcategory?.name || "Products"} - ${
          category?.name || ""
        } | Asian Import Export`}
        description={`Browse ${pagination.total || products.length || 0} ${
          subcategory?.name?.toLowerCase() || "products"
        } from ${
          category?.name || "our catalog"
        }. Wholesale prices, international shipping, quality guaranteed.`}
        canonical={`/products/c/${categorySlug}/${subcategorySlug}`}
      />

      <div className="px-2 sm:px-1 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <nav className="flex items-center text-xs sm:text-sm text-gray-600">
            <button
              onClick={() => navigate("/products")}
              className="hover:text-teal-600 transition-colors"
            >
              Products
            </button>
            <span className="mx-2">/</span>
            <span className="text-teal-600 font-medium">
              {subcategory?.name}
            </span>
          </nav>
        </div>

        {/* Category Banner */}
        {category?.name && products?.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <CategoryBanner 
              category={category.name} 
              products={products} 
            />
          </div>
        )}

        {/* Search Bar Section */}
        <div className="mb-6 sm:mb-8 text-center relative">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
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
                className="w-full px-4 sm:px-6 py-2 md:py-3 pr-12 border border-gray-300 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm text-teal-800 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-2 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-6 md:w-6"
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

        {/* Truck Tire Banner - Only show for Truck Tires subcategory */}
        {isTruckTires && (
          <TruckTireBanner onBrandClick={handleBrandClickFromBanner} />
        )}

        {/* Category Header with Brand Filter and Sort */}
        <div ref={filterSectionRef} className="bg-white rounded-lg shadow-md p-2 sm:p-3 md:p-6 mb-2 mt-3 sm:mt-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 md:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-800 flex items-center">
                <span className="mr-2 sm:mr-3 text-2xl sm:text-3xl">{category?.icon}</span>
                {subcategory?.name}
              </h1>
            </div>

            <div className="flex flex-row gap-2 w-full lg:w-auto">
            {/* Sort by Price Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-0" ref={sortDropdownRef}>
              <button
                onClick={toggleSortDropdown}
                className="w-full flex items-center justify-between px-2 sm:px-1 py-2 sm:py-3 border border-teal-200 bg-teal-50 text-teal-800 rounded-md hover:bg-teal-200 transition-colors text-xs sm:text-base sm:min-w-[180px]"
              >
                <span className="truncate sm:truncate-none text-[11px] md:text-sm">
                  {sortBy === "price-low-high" 
                    ? "Low to High"
                    : sortBy === "price-high-low"
                    ? "High to Low"
                    : "Sort by Price"}
                </span>
                <svg
                  className={`ml-1 sm:ml-0 h-3 w-3 md:h-4 md:w-4 flex-shrink-0 transition-transform ${
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
                <div className="absolute left-0 sm:right-0 sm:left-4 mt-2 w-full sm:w-56 bg-white rounded-sm shadow-lg z-10 border border-gray-200 overflow-hidden">
                  <div
                    className="md:px-4 px-1 py-1 md:py-2 hover:bg-teal-50 cursor-pointer text-teal-900 font-medium text-xs md:text-base"
                    onClick={() => handleSortSelect("")}
                  >
                    Default
                  </div>
                  <div
                    className="md:px-4 px-1 py-1 md:py-2 hover:bg-teal-50 text-teal-900 cursor-pointer  text-xs md:text-base"
                    onClick={() => handleSortSelect("price-low-high")}
                  >
                    Low to High
                  </div>
                  <div
                    className="md:px-4 px-1 py-1 md:py-2 hover:bg-teal-50 cursor-pointer text-teal-900  text-xs md:text-base"
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
                  className="w-full flex items-center justify-between px-2 sm:px-1 py-2 sm:py-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-md hover:bg-teal-200 transition-colors text-xs sm:text-base sm:min-w-[150px]"
                >
                  <span className="truncate sm:truncate-none text-[11px] md:text-sm">{selectedTireType || "Tire Type"}</span>
                  <svg
                    className={`ml-1 sm:ml-0 h-3 w-3 md:h-4 md:w-4 flex-shrink-0 transition-transform ${
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
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 font-medium text-xs md:text-base"
                      onClick={() => handleTireTypeSelect(null)}
                    >
                      All Types
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 text-xs md:text-base"
                      onClick={() => handleTireTypeSelect("Drive")}
                    >
                      Drive
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 text-xs md:text-base"
                      onClick={() => handleTireTypeSelect("Steer")}
                    >
                      Steer
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 text-xs md:text-base"
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
                  className="w-full flex items-center justify-between px-2 sm:px-1 py-2 sm:py-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-md hover:bg-teal-200 transition-colors text-xs sm:text-base sm:min-w-[150px]"
                >
                  <span className="truncate sm:truncate-none text-[11px] md:text-sm">{selectedBrand || "All Brands"}</span>
                  <svg
                    className={`ml-1 sm:ml-2 h-3 w-3 md:h-4 md:w-4 flex-shrink-0 transition-transform ${
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
                      className="px-2 md:px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 font-medium text-xs md:text-base"
                      onClick={() => handleBrandSelect(null)}
                    >
                      All Brands
                    </div>
                    {uniqueBrands.map((brand) => (
                      <div
                        key={brand}
                        className="px-2 md:px-4 py-2 hover:bg-teal-50 cursor-pointer text-teal-900 text-xs md:text-base"
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
          subcategory={{ ...subcategory, products }}
          selectedBrand={selectedBrand}
          selectedTireType={selectedTireType}
          sortBy={sortBy}
          isHomePage={false}
          enableServerPagination={true}
        />

        {pagination.totalPages > 1 && (
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-1 md:gap-2">
            <button
              onClick={() => handlePageChange(Number(pagination.page || 1) - 1)}
              disabled={!pagination.hasPrevPage}
              className="rounded-md border border-gray-300 bg-white px-2.5 sm:px-2 py-1.5 sm:py-1 text-xs sm:text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>

            {Array.from({ length: Number(pagination.totalPages || 1) }, (_, idx) => idx + 1)
              .filter((pageNumber) => {
                const current = Number(pagination.page || 1);
                return pageNumber === 1 || pageNumber === Number(pagination.totalPages || 1) || Math.abs(pageNumber - current) <= 1;
              })
              .map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`rounded-md px-2 md:px-2.5 sm:px-2 md:py-1.5 py-1 text-xs  border ${
                    pageNumber === Number(pagination.page || 1)
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

            <button
              onClick={() => handlePageChange(Number(pagination.page || 1) + 1)}
              disabled={!pagination.hasNextPage}
              className="rounded-md border border-gray-300 bg-white px-2.5 sm:px-2 py-1.5 sm:py-1 text-xs sm:text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Recent Purchase Notification - Show for all subcategories with popup products */}
      {popupProducts && popupProducts.length > 0 && (
        <RecentPurchaseNotification 
          products={popupProducts} 
        />
      )}
    </div>
  );
};

export default SubcategoryPageClient;
