"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { deleteProduct, fetchProducts, addToFeatured, removeFromFeatured } from "@/services/catalogService";
import { ImagePlus, Loader2, Pencil, Plus, RefreshCw, Trash2, Star, StarOff, Filter, X } from "lucide-react";
import toast from "react-hot-toast";

const PAGE_SIZE = 20;

const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

// Helper function to get tire type label
const getTireTypeLabel = (type) => {
  const labels = {
    'steer': 'Steer',
    'drive': 'Drive',
    'trailer': 'Trailer',
    'all-position': 'All Position',
    'off-road': 'Off-Road',
    'mining': 'Mining'
  };
  return labels[type] || type;
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = useMemo(() => ["admin", "moderator"].includes(role), [role]);
  const isAdmin = useMemo(() => role === "admin", [role]);

  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState({});
  
  // Filter states
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubcategory, setFilterSubcategory] = useState("all");
  const [filterPattern, setFilterPattern] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterTireType, setFilterTireType] = useState("");
  const [filterVehicleType, setFilterVehicleType] = useState("");
  const [filterApplication, setFilterApplication] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: PAGE_SIZE, 
    total: 0, 
    totalPages: 1, 
    hasNextPage: false, 
    hasPrevPage: false 
  });
  
  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({ 
    categories: [], 
    subcategories: [], 
    categoryMap: {}, 
    brands: [], 
    patterns: [],
    tireTypes: [],
    vehicleTypes: [],
    applications: [],
    tireSizes: []
  });
  
  // UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Refs for initial load tracking
  const didInitialLoad = useRef(false);
  const didHydrateFromUrl = useRef(false);
  const skipNextPageReset = useRef(false);
  const searchDebounced = useDebouncedValue(search, 300);

  // Build return URL for edit page
  const buildReturnUrl = () => {
    const params = new URLSearchParams();

    if (page > 1) params.set("page", String(page));
    if (search) params.set("search", search);
    if (filterCategory !== "all") params.set("category", filterCategory);
    if (filterSubcategory !== "all") params.set("subcategory", filterSubcategory);
    if (filterPattern !== "all") params.set("pattern", filterPattern);
    if (filterBrand !== "all") params.set("brand", filterBrand);
    if (filterTireType) params.set("tireType", filterTireType);
    if (filterVehicleType) params.set("vehicleType", filterVehicleType);
    if (filterApplication) params.set("application", filterApplication);
    if (sortBy !== "newest") params.set("sort", sortBy);

    const query = params.toString();
    return query ? `/dashboard/products?${query}` : "/dashboard/products";
  };

  const buildEditUrl = (routeId) => {
    const returnUrl = buildReturnUrl();
    return `/dashboard/products/edit?productId=${encodeURIComponent(routeId)}&returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  // Hydrate filters from URL on mount
  useEffect(() => {
    if (didHydrateFromUrl.current) return;

    const urlPage = searchParams.get("page");
    const urlSearch = searchParams.get("search");
    const urlCategory = searchParams.get("category");
    const urlSubcategory = searchParams.get("subcategory");
    const urlPattern = searchParams.get("pattern");
    const urlBrand = searchParams.get("brand");
    const urlSort = searchParams.get("sort");
    const urlTireType = searchParams.get("tireType");
    const urlVehicleType = searchParams.get("vehicleType");
    const urlApplication = searchParams.get("application");

    const hasAnyParams = Boolean(urlPage || urlSearch || urlCategory || urlSubcategory || 
      urlPattern || urlBrand || urlSort || urlTireType || urlVehicleType || urlApplication);

    if (hasAnyParams) {
      skipNextPageReset.current = true;
    }

    if (urlPage) setPage(Number(urlPage) || 1);
    if (urlSearch) setSearch(urlSearch);
    if (urlCategory) setFilterCategory(urlCategory);
    if (urlSubcategory) setFilterSubcategory(urlSubcategory);
    if (urlPattern) setFilterPattern(urlPattern);
    if (urlBrand) setFilterBrand(urlBrand);
    if (urlSort) setSortBy(urlSort);
    if (urlTireType) setFilterTireType(urlTireType);
    if (urlVehicleType) setFilterVehicleType(urlVehicleType);
    if (urlApplication) setFilterApplication(urlApplication);
    
    if (hasAnyParams && (urlTireType || urlVehicleType || urlApplication)) {
      setShowAdvancedFilters(true);
    }

    didHydrateFromUrl.current = true;
  }, [searchParams]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (!didHydrateFromUrl.current) return;
    if (skipNextPageReset.current) {
      skipNextPageReset.current = false;
      return;
    }
    setPage(1);
  }, [searchDebounced, filterCategory, filterSubcategory, filterPattern, filterBrand, 
      filterTireType, filterVehicleType, filterApplication, sortBy]);

  // Load products from API
  const loadData = async (targetPage = page) => {
    setLoading(true);

    const params = {
      page: targetPage,
      limit: PAGE_SIZE,
      sort: sortBy,
      search: searchDebounced || undefined,
      category: filterCategory !== "all" ? filterCategory : undefined,
      subcategory: filterSubcategory !== "all" ? filterSubcategory : undefined,
      pattern: filterPattern !== "all" ? filterPattern : undefined,
      brand: filterBrand !== "all" ? filterBrand : undefined,
      tireType: filterTireType || undefined,
      vehicleType: filterVehicleType || undefined,
      application: filterApplication || undefined,
    };

    // Remove undefined values
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    const result = await fetchProducts(params);

    if (result.success) {
      setProducts(result.products || []);
      setPagination(result.pagination || { 
        page: targetPage, 
        limit: PAGE_SIZE, 
        total: 0, 
        totalPages: 1, 
        hasNextPage: false, 
        hasPrevPage: false 
      });
      setFilterOptions(result.filters || { 
        categories: [], 
        subcategories: [], 
        categoryMap: {}, 
        brands: [], 
        patterns: [],
        tireTypes: [],
        vehicleTypes: [],
        applications: [],
        tireSizes: []
      });
    } else {
      toast.error(result.message || "Failed to load products");
    }

    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    if (!isStaff) return;
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;
    loadData(1);
  }, [isStaff]);

  // Reload when dependencies change
  useEffect(() => {
    if (!isStaff || !didInitialLoad.current) return;
    loadData(page);
  }, [page, searchDebounced, filterCategory, filterSubcategory, filterPattern, 
      filterBrand, filterTireType, filterVehicleType, filterApplication, sortBy]);

  // Handle featured toggle
  const handleToggleFeatured = async (product) => {
    if (!isAdmin) {
      toast.error("Only admin can manage featured products");
      return;
    }

    setFeaturedLoading(prev => ({ ...prev, [product.id]: true }));

    try {
      if (product.isFeatured) {
        const result = await removeFromFeatured(product.id);
        if (result.success) {
          toast.success(`${product.name} removed from featured`);
          setProducts(prev => prev.map(p => 
            p.id === product.id ? { ...p, isFeatured: false } : p
          ));
        } else {
          toast.error(result.message || "Failed to remove from featured");
        }
      } else {
        const result = await addToFeatured(product.id, {
          order: 0,
          addedBy: userProfile?.email || "admin"
        });
        if (result.success) {
          toast.success(`${product.name} added to featured`);
          setProducts(prev => prev.map(p => 
            p.id === product.id ? { ...p, isFeatured: true } : p
          ));
        } else if (result.message?.includes("already featured")) {
          toast.error("Product is already featured");
        } else {
          toast.error(result.message || "Failed to add to featured");
        }
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setFeaturedLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Handle delete
  const handleDelete = async (productId) => {
    const target = products.find((item) => String(item.id) === String(productId));
    if (!target) {
      toast.error("Select a product to delete");
      return;
    }

    if (!confirm(`Delete "${target.name}"? This action cannot be undone.`)) return;

    const result = await deleteProduct(target.id);
    if (!result.success) {
      toast.error(result.message || "Failed to delete product");
      return;
    }

    toast.success("Product deleted successfully");
    await loadData(page);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setFilterCategory("all");
    setFilterSubcategory("all");
    setFilterPattern("all");
    setFilterBrand("all");
    setFilterTireType("");
    setFilterVehicleType("");
    setFilterApplication("");
    setSortBy("newest");
    setPage(1);
    setShowAdvancedFilters(false);
  };

  // Check if any filter is active
  const hasActiveFilters = search || filterCategory !== "all" || filterSubcategory !== "all" || 
    filterPattern !== "all" || filterBrand !== "all" || filterTireType || 
    filterVehicleType || filterApplication;

  // Prepare select options
  const categoryOptions = useMemo(() => ["all", ...(filterOptions.categories || [])], [filterOptions.categories]);
  
  const subcategoryOptions = useMemo(() => {
    if (filterCategory === "all") return ["all"];
    const categoryMap = filterOptions.categoryMap || {};
    const subcats = categoryMap[filterCategory] || [];
    return ["all", ...subcats];
  }, [filterCategory, filterOptions.categoryMap]);
  
  const brandOptions = useMemo(() => ["all", ...(filterOptions.brands || [])], [filterOptions.brands]);
  const patternOptions = useMemo(() => ["all", ...(filterOptions.patterns || [])], [filterOptions.patterns]);
  const tireTypeOptions = useMemo(() => ["", ...(filterOptions.tireTypes || [])], [filterOptions.tireTypes]);
  const vehicleTypeOptions = useMemo(() => ["", ...(filterOptions.vehicleTypes || [])], [filterOptions.vehicleTypes]);
  const applicationOptions = useMemo(() => ["", ...(filterOptions.applications || [])], [filterOptions.applications]);

  if (!isStaff) {
    return (
      <DashboardLayout>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-600 mt-2">Staff access is required to manage products.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-500 mt-1">Manage tires, vehicle parts, and accessories</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                router.push(`/dashboard/products/create?returnUrl=${encodeURIComponent(buildReturnUrl())}`);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
            <button 
              onClick={() => loadData(page)} 
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters} 
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          {/* Basic Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 min-w-[200px] rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubcategory("all");
                setFilterPattern("all");
              }}
              className="w-[200px] rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
            >
              {categoryOptions.map((value) => (
                <option key={value} value={value}>
                  {value === "all" ? "All Categories" : value}
                </option>
              ))}
            </select>
            <select 
              value={filterSubcategory} 
              onChange={(e) => setFilterSubcategory(e.target.value)} 
              disabled={filterCategory === "all"}
              className={`w-[200px] rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 ${
                filterCategory === "all" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {subcategoryOptions.map((value) => (
                <option key={value} value={value}>
                  {value === "all" ? "All Subcategories" : value}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? "Hide Advanced" : "Show Advanced"}
            </button>
          </div>

          {/* Advanced Tire Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl">
              <select
                value={filterTireType}
                onChange={(e) => setFilterTireType(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                <option value="">All Tire Types</option>
                {tireTypeOptions.filter(t => t).map(type => (
                  <option key={type} value={type}>{getTireTypeLabel(type)}</option>
                ))}
              </select>
              
              <select
                value={filterVehicleType}
                onChange={(e) => setFilterVehicleType(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                <option value="">All Vehicle Types</option>
                {vehicleTypeOptions.filter(v => v).map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
              
              <select
                value={filterApplication}
                onChange={(e) => setFilterApplication(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                <option value="">All Applications</option>
                {applicationOptions.filter(a => a).map(app => (
                  <option key={app} value={app}>{app.replace('-', ' ').toUpperCase()}</option>
                ))}
              </select>
              
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                {brandOptions.map((value) => (
                  <option key={value} value={value}>
                    {value === "all" ? "All Brands" : value}
                  </option>
                ))}
              </select>

              <select
                value={filterPattern}
                onChange={(e) => setFilterPattern(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                {patternOptions.map((value) => (
                  <option key={value} value={value}>
                    {value === "all" ? "All Patterns" : value}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="name-asc">Sort: Name A-Z</option>
                <option value="name-desc">Sort: Name Z-A</option>
                <option value="brand-asc">Sort: Brand A-Z</option>
                <option value="brand-desc">Sort: Brand Z-A</option>
              </select>
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Total: <strong className="text-gray-900">{pagination.total || 0}</strong> products
              {hasActiveFilters && <span className="ml-2 text-teal-600">(filtered)</span>}
            </div>
            <div className="text-sm text-gray-500">{PAGE_SIZE} per page</div>
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="grid gap-4 sm:hidden">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 p-8 bg-white text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 p-8 bg-white text-center text-gray-500">
              No products found. Try adjusting your filters.
            </div>
          ) : (
            products.map((product) => {
              const routeId = product.sourceId || product.id;
              return (
                <div key={product.id} className={`rounded-2xl border p-4 shadow-sm ${
                  product.isFeatured ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {product.image?.url ? (
                        <img src={product.image.url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <ImagePlus className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate font-semibold text-gray-900">{product.name}</div>
                        {product.isFeatured && <Star className="h-4 w-4 flex-shrink-0 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <div className="truncate text-xs text-gray-500">{product.slug}</div>
                      <div className="mt-2 text-sm text-gray-600">{product.categoryName} / {product.subcategoryName}</div>
                      {product.tireType && (
                        <div className="mt-1 inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                          {getTireTypeLabel(product.tireType)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={buildEditUrl(routeId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          disabled={featuredLoading[product.id]}
                          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs transition-colors ${
                            product.isFeatured 
                              ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {featuredLoading[product.id] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : product.isFeatured ? (
                            <StarOff className="h-3.5 w-3.5" />
                          ) : (
                            <Star className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tire Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No products found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const routeId = product.sourceId || product.id;
                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${
                      product.isFeatured ? 'bg-yellow-50/30' : 'bg-white'
                    }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {product.image?.url ? (
                              <img src={product.image.url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <ImagePlus className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{product.categoryName}</div>
                        <div className="text-xs text-gray-400">{product.subcategoryName}</div>
                      </td>
                      <td className="px-4 py-3">
                        {product.tireType && (
                          <span className="inline-flex rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700">
                            {getTireTypeLabel(product.tireType)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{product.brand || "-"}</td>
                      <td className="px-4 py-3">
                        {product.offerPrice ? (
                          <div>
                            <div className="font-semibold text-teal-600">{product.offerPrice}</div>
                            <div className="text-xs text-gray-400 line-through">{product.price}</div>
                          </div>
                        ) : (
                          <div className="font-semibold text-gray-900">{product.price || "-"}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.isFeatured ? (
                          <Star className="mx-auto h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="mx-auto h-4 w-4 text-gray-300" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={buildEditUrl(routeId)}
                            className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleToggleFeatured(product)}
                                disabled={featuredLoading[product.id]}
                                className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                                title={product.isFeatured ? "Remove from featured" : "Add to featured"}
                              >
                                {featuredLoading[product.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : product.isFeatured ? (
                                  <StarOff className="h-4 w-4" />
                                ) : (
                                  <Star className="h-4 w-4" />
                                )}
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id)} 
                                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100">
          <div className="text-sm text-gray-600">
            Page <strong className="text-gray-900">{pagination.page || 1}</strong> of{" "}
            <strong className="text-gray-900">{pagination.totalPages || 1}</strong>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}