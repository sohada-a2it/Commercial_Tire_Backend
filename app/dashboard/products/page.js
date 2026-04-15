"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { deleteProduct, fetchProducts } from "@/services/catalogService";
import { ImagePlus, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const VEHICLE_CATEGORY_NAME = "Vehicle Parts and Accessories";
const PAGE_SIZE = 20;

const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useRouter.__INTERNAL_USE_ONLY_BROWSER_API__ ? new URL(typeof window !== "undefined" ? window.location.href : "").searchParams : null;
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = useMemo(() => ["admin", "moderator"].includes(role), [role]);
  const isAdmin = useMemo(() => role === "admin", [role]);

  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubcategory, setFilterSubcategory] = useState("all");
  const [filterPattern, setFilterPattern] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [filterOptions, setFilterOptions] = useState({ categories: [], subcategories: [], categoryMap: {}, brands: [], patterns: [] });
  const [loading, setLoading] = useState(true);

  const didInitialLoad = useRef(false);
  const searchDebounced = useDebouncedValue(search, 300);

  const isVehicleCategorySelected = filterCategory === VEHICLE_CATEGORY_NAME;

  // Helper function to handle edit button click with new tab support
  const handleEditClick = (event, productId, routeId) => {
    const returnUrl = `/dashboard/products?page=${page}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(filterCategory)}&subcategory=${encodeURIComponent(filterSubcategory)}&pattern=${encodeURIComponent(filterPattern)}&brand=${encodeURIComponent(filterBrand)}&sort=${encodeURIComponent(sortBy)}`;
    const editUrl = `/dashboard/products/edit?productId=${routeId}&returnUrl=${encodeURIComponent(returnUrl)}`;

    // Check for modifier keys (Ctrl, Cmd, or middle-click)
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      event.preventDefault();
      window.open(editUrl, "_blank");
    } else if (event.button === 0) {
      // Normal left-click
      event.preventDefault();
      setSelectedId(String(productId));
      router.push(editUrl);
    }
  };

  // Restore state from URL params if coming back from edit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlPage = params.get("page");
    const urlSearch = params.get("search");
    const urlCategory = params.get("category");
    const urlSubcategory = params.get("subcategory");
    const urlPattern = params.get("pattern");
    const urlBrand = params.get("brand");
    const urlSort = params.get("sort");

    if (urlPage) setPage(parseInt(urlPage, 10));
    if (urlSearch) setSearch(decodeURIComponent(urlSearch));
    if (urlCategory) setFilterCategory(decodeURIComponent(urlCategory));
    if (urlSubcategory) setFilterSubcategory(decodeURIComponent(urlSubcategory));
    if (urlPattern) setFilterPattern(decodeURIComponent(urlPattern));
    if (urlBrand) setFilterBrand(decodeURIComponent(urlBrand));
    if (urlSort) setSortBy(decodeURIComponent(urlSort));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchDebounced, filterCategory, filterSubcategory, filterPattern, filterBrand, sortBy]);

  const loadData = async (targetPage = page) => {
    setLoading(true);

    const result = await fetchProducts({
      page: targetPage,
      limit: PAGE_SIZE,
      sort: sortBy,
      search: searchDebounced,
      category: filterCategory === "all" ? "" : filterCategory,
      subcategory: filterSubcategory === "all" ? "" : filterSubcategory,
      pattern: isVehicleCategorySelected && filterPattern !== "all" ? filterPattern : "",
      brand: filterBrand === "all" ? "" : filterBrand,
    });

    if (result.success) {
      setProducts(result.products || []);
      setPagination(result.pagination || { page: targetPage, limit: PAGE_SIZE, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      setFilterOptions(result.filters || { categories: [], subcategories: [], categoryMap: {}, brands: [], patterns: [] });
    } else {
      toast.error(result.message || "Failed to load products");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isStaff) return;
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;
    loadData(1);
  }, [isStaff]);

  useEffect(() => {
    if (!isStaff || !didInitialLoad.current) return;
    loadData(page);
  }, [isStaff, page, searchDebounced, filterCategory, filterSubcategory, filterPattern, filterBrand, sortBy]);

  useEffect(() => {
    if (!isVehicleCategorySelected && filterPattern !== "all") {
      setFilterPattern("all");
    }
  }, [isVehicleCategorySelected, filterPattern]);

  const categoryOptions = useMemo(() => ["all", ...(filterOptions.categories || [])], [filterOptions.categories]);
  
  // Filter subcategories based on selected category
  const subcategoryOptions = useMemo(() => {
    if (filterCategory === "all") {
      return ["all"]; // No subcategories when no category is selected
    }
    const categoryMap = filterOptions.categoryMap || {};
    const subcats = categoryMap[filterCategory] || [];
    return ["all", ...subcats];
  }, [filterCategory, filterOptions.categoryMap]);
  
  const brandOptions = useMemo(() => ["all", ...(filterOptions.brands || [])], [filterOptions.brands]);
  const patternOptions = useMemo(() => ["all", ...(filterOptions.patterns || [])], [filterOptions.patterns]);

  const handleDelete = async (productId) => {
    const target = products.find((item) => String(item.id) === String(productId));
    if (!target) {
      toast.error("Select a product to delete");
      return;
    }

    if (!confirm(`Delete ${target.name}?`)) return;

    const result = await deleteProduct(target.id);
    if (!result.success) {
      toast.error(result.message || "Failed to delete product");
      return;
    }

    toast.success("Product deleted");
    await loadData(page);
  };

  const visibleColSpan = isVehicleCategorySelected ? 6 : 5;

  if (!isStaff) {
    return (
      <DashboardLayout>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Access denied</h1>
          <p className="text-gray-700 mt-2">Staff access is required to manage products.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 [&_input]:border-gray-200 [&_select]:bg-white [&_select]:text-gray-900 [&_select]:border-gray-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-700 mt-1">Fast server-side sorting, filtering, and paging (20 per page).</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                const returnUrl = `/dashboard/products?page=${page}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(filterCategory)}&subcategory=${encodeURIComponent(filterSubcategory)}&pattern=${encodeURIComponent(filterPattern)}&brand=${encodeURIComponent(filterBrand)}&sort=${encodeURIComponent(sortBy)}`;
                router.push(`/dashboard/products/create?returnUrl=${encodeURIComponent(returnUrl)}`);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
            <button onClick={() => loadData(page)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-nowrap items-center gap-3 overflow-x-auto ">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-[280px] min-w-[280px] rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
            />
            <select
              value={filterCategory}
              onChange={(event) => {
                setFilterCategory(event.target.value);
                setFilterSubcategory("all");
                setFilterPattern("all");
              }}
              className="w-[220px] min-w-[220px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
            >
              {categoryOptions.map((value) => (
                <option key={value} value={value}>{value === "all" ? "All categories" : value}</option>
              ))}
            </select>
            <select 
              value={filterSubcategory} 
              onChange={(event) => setFilterSubcategory(event.target.value)} 
              disabled={filterCategory === "all"}
              className={`w-[220px] min-w-[220px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500 ${filterCategory === "all" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {subcategoryOptions.map((value) => (
                <option key={value} value={value}>{value === "all" ? "All subcategories" : value}</option>
              ))}
            </select>
            {isVehicleCategorySelected ? (
              <select value={filterPattern} onChange={(event) => setFilterPattern(event.target.value)} className="w-[220px] min-w-[220px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500">
                {patternOptions.map((value) => (
                  <option key={value} value={value}>{value === "all" ? "All patterns" : value}</option>
                ))}
              </select>
            ) : null}
            <select value={filterBrand} onChange={(event) => setFilterBrand(event.target.value)} className="w-[220px] min-w-[220px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500">
              {brandOptions.map((value) => (
                <option key={value} value={value}>{value === "all" ? "All brands" : value}</option>
              ))}
            </select>

            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-[200px] min-w-[200px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500">
              <option value="newest">Sort: Newest</option>
              <option value="name-asc">Sort: Name A-Z</option>
              <option value="name-desc">Sort: Name Z-A</option>
              <option value="brand-asc">Sort: Brand A-Z</option>
              <option value="brand-desc">Sort: Brand Z-A</option>
            </select>
          </div>

          <div className="flex items-center justify-between -mt-5 -mb-5">
            <div className="text-sm text-gray-700">
              Total: <strong>{pagination.total || 0}</strong>
            </div>
            <div className="text-sm text-gray-700">20 products per page</div>
          </div>

          <div className="grid gap-4 sm:hidden">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 p-4 bg-white text-center text-gray-700">No products found.</div>
            ) : loading ? (
              <div className="rounded-2xl border border-gray-200 p-4 bg-white text-center text-teal-600"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
            ) : (
              products.map((product) => {
                const routeId = product.sourceId || product.id;
                return (
                  <div key={product.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                        {product.image?.url ? <img src={product.image.url} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-gray-600"><ImagePlus className="w-5 h-5" /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-gray-900">{product.name}</div>
                        <div className="truncate text-xs text-gray-500">{product.slug}</div>
                        <div className="mt-2 text-sm text-gray-700">{product.categoryName} / {product.subcategoryName}</div>
                        <div className="mt-1 text-sm text-gray-700">Brand: {product.brand || "-"}</div>
                        {isVehicleCategorySelected ? <div className="mt-1 text-sm text-gray-700">Pattern: {product.pattern || "-"}</div> : null}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm text-gray-900">
                        <span>Price</span>
                        <span className="font-semibold">{product.offerPrice || product.price || "-"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(event) => handleEditClick(event, product.id, routeId)}
                          onMouseUp={(event) => event.button === 1 && handleEditClick(event, product.id, routeId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        {isAdmin ? (
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="max-h-[58vh] overflow-auto rounded-xl border border-gray-200 hidden sm:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Category</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Brand</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  {isVehicleCategorySelected ? <th className="px-4 py-3 text-left hidden xl:table-cell">Pattern</th> : null}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-10 text-center text-teal-600" colSpan={visibleColSpan}><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
                ) : products.length === 0 ? (
                  <tr><td className="px-4 py-8 text-center text-gray-700" colSpan={visibleColSpan}>No products found.</td></tr>
                ) : (
                  products.map((product) => {
                    const active = String(product.id) === String(selectedId);
                    return (
                      <tr key={product.id} className={active ? "bg-teal-50" : "bg-white"}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                              {product.image?.url ? <img src={product.image.url} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-gray-600"><ImagePlus className="w-4 h-4" /></div>}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-gray-900">{product.name}</div>
                              <div className="truncate text-xs text-gray-700">{product.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 hidden lg:table-cell">{product.categoryName} / {product.subcategoryName}</td>
                        <td className="px-4 py-3 text-gray-700 hidden lg:table-cell">{product.brand || "-"}</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">{product.offerPrice || product.price || "-"}</td>
                        {isVehicleCategorySelected ? <td className="px-4 py-3 text-gray-700 hidden xl:table-cell">{product.pattern || "-"}</td> : null}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(event) => handleEditClick(event, product.id, product.sourceId || product.id)}
                              onMouseUp={(event) => event.button === 1 && handleEditClick(event, product.id, product.sourceId || product.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            {isAdmin ? (
                              <button onClick={() => handleDelete(product.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <div className="text-sm text-gray-700">
              Page <strong>{pagination.page || 1}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
