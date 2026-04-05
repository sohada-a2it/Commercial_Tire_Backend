"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { deleteProduct, fetchProducts } from "@/services/catalogService";
import { ImagePlus, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const VEHICLE_CATEGORY_NAME = "Vehicle Parts and Accessories";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

export default function ProductsPage() {
  const router = useRouter();
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
  const [loading, setLoading] = useState(true);

  const isVehicleCategorySelected = filterCategory === VEHICLE_CATEGORY_NAME;

  const loadData = async () => {
    setLoading(true);
    const result = await fetchProducts();
    if (result.success) {
      setProducts(result.products || []);
    } else {
      toast.error(result.message || "Failed to load products");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isStaff) loadData();
  }, [isStaff]);

  useEffect(() => {
    if (!isVehicleCategorySelected) {
      setFilterPattern("all");
    }
  }, [isVehicleCategorySelected]);

  const categoryOptions = useMemo(
    () => ["all", ...Array.from(new Set(products.map((product) => String(product.categoryName || "").trim()).filter(Boolean)))],
    [products]
  );

  const subcategoryOptions = useMemo(() => {
    const scoped =
      filterCategory === "all"
        ? products
        : products.filter((product) => normalizeText(product.categoryName) === normalizeText(filterCategory));

    return ["all", ...Array.from(new Set(scoped.map((product) => String(product.subcategoryName || "").trim()).filter(Boolean)))];
  }, [products, filterCategory]);

  const patternOptions = useMemo(() => {
    const scoped = products.filter((product) => normalizeText(product.categoryName) === normalizeText(VEHICLE_CATEGORY_NAME));
    return ["all", ...Array.from(new Set(scoped.map((product) => String(product.pattern || "").trim()).filter(Boolean)))];
  }, [products]);

  const brandOptions = useMemo(
    () => ["all", ...Array.from(new Set(products.map((product) => String(product.brand || "").trim()).filter(Boolean)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = normalizeText(search);
    const next = products.filter((product) => {
      const matchesSearch =
        !query ||
        normalizeText(product.name).includes(query) ||
        normalizeText(product.categoryName).includes(query) ||
        normalizeText(product.subcategoryName).includes(query) ||
        normalizeText(product.slug).includes(query) ||
        normalizeText(product.brand).includes(query) ||
        normalizeText(product.pattern).includes(query);

      const matchesCategory = filterCategory === "all" || normalizeText(product.categoryName) === normalizeText(filterCategory);
      const matchesSubcategory = filterSubcategory === "all" || normalizeText(product.subcategoryName) === normalizeText(filterSubcategory);
      const matchesPattern =
        !isVehicleCategorySelected || filterPattern === "all" || normalizeText(product.pattern) === normalizeText(filterPattern);
      const matchesBrand = filterBrand === "all" || normalizeText(product.brand) === normalizeText(filterBrand);

      return matchesSearch && matchesCategory && matchesSubcategory && matchesPattern && matchesBrand;
    });

    const sorted = [...next];
    if (sortBy === "name-asc") {
      sorted.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    } else if (sortBy === "name-desc") {
      sorted.sort((a, b) => String(b.name || "").localeCompare(String(a.name || "")));
    } else if (sortBy === "brand-asc") {
      sorted.sort((a, b) => String(a.brand || "").localeCompare(String(b.brand || "")));
    } else if (sortBy === "brand-desc") {
      sorted.sort((a, b) => String(b.brand || "").localeCompare(String(a.brand || "")));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return sorted;
  }, [products, search, filterCategory, filterSubcategory, filterPattern, filterBrand, sortBy, isVehicleCategorySelected]);

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
    await loadData();
  };

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
            <p className="text-gray-700 mt-1">Search, sort, and manage products from one list view.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => router.push("/dashboard/products/create")} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50">
              <Plus className="w-4 h-4" /> Add New Product
            </button>
            <button onClick={loadData} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 md:col-span-2 xl:col-span-2"
            />
            <select
              value={filterCategory}
              onChange={(event) => {
                setFilterCategory(event.target.value);
                setFilterSubcategory("all");
                setFilterPattern("all");
              }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
            >
              {categoryOptions.map((value) => (
                <option key={value} value={value}>{value === "all" ? "All categories" : value}</option>
              ))}
            </select>
            <select value={filterSubcategory} onChange={(event) => setFilterSubcategory(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500">
              {subcategoryOptions.map((value) => (
                <option key={value} value={value}>{value === "all" ? "All subcategories" : value}</option>
              ))}
            </select>
            {isVehicleCategorySelected ? (
              <select value={filterPattern} onChange={(event) => setFilterPattern(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500">
                {patternOptions.map((value) => (
                  <option key={value} value={value}>{value === "all" ? "All patterns" : value}</option>
                ))}
              </select>
            ) : null}
            <select value={filterBrand} onChange={(event) => setFilterBrand(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500">
              {brandOptions.map((value) => (
                <option key={value} value={value}>{value === "all" ? "All brands" : value}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end">
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500">
              <option value="newest">Sort: Newest</option>
              <option value="name-asc">Sort: Name A-Z</option>
              <option value="name-desc">Sort: Name Z-A</option>
              <option value="brand-asc">Sort: Brand A-Z</option>
              <option value="brand-desc">Sort: Brand Z-A</option>
            </select>
          </div>

          <div className="max-h-[58vh] overflow-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Brand</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  {isVehicleCategorySelected ? <th className="px-4 py-3 text-left">Pattern</th> : null}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-10 text-center text-teal-600" colSpan={isVehicleCategorySelected ? 6 : 5}><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td className="px-4 py-8 text-center text-gray-700" colSpan={isVehicleCategorySelected ? 6 : 5}>No products found.</td></tr>
                ) : (
                  filteredProducts.map((product) => {
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
                        <td className="px-4 py-3 text-gray-700">{product.categoryName} / {product.subcategoryName}</td>
                        <td className="px-4 py-3 text-gray-700">{product.brand || "-"}</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">{product.offerPrice || product.price || "-"}</td>
                        {isVehicleCategorySelected ? <td className="px-4 py-3 text-gray-700">{product.pattern || "-"}</td> : null}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedId(String(product.id));
                                router.push(`/dashboard/products/${product.id}/edit`);
                              }}
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
        </section>
      </div>
    </DashboardLayout>
  );
}
