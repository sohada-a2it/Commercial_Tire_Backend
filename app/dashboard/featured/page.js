// app/featured/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Star, 
  StarOff, 
  Trash2, 
  ShoppingBag, 
  TrendingUp,
  Clock,
  Tag,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  RefreshCw,
  Filter,
  Pencil
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

// API Functions
const config = {
  email: {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
  }
};

const removeFromFeatured = async (productId) => {
  try {
    const response = await fetch(`${config.email.backendUrl}/api/featured-products/${productId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Remove from featured error:", error);
    return { success: false, message: error.message };
  }
};

const fetchFeaturedProducts = async (limit = 50) => {
  try {
    const response = await fetch(`${config.email.backendUrl}/api/featured-products?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch featured products error:", error);
    return { success: false, message: error.message, products: [] };
  }
};

const FeaturedProductsPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // ProductsPage এর মতো 20 per page
  
  // Filter states
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categoryOptions, setCategoryOptions] = useState(["all"]);

  // Load featured products
  const loadFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchFeaturedProducts();
      
      if (response.success && response.products) {
        setFeaturedProducts(response.products);
        setFilteredProducts(response.products);
        
        // Extract unique categories
        const categories = ["all", ...new Set(response.products.map(p => p.categoryName).filter(Boolean))];
        setCategoryOptions(categories);
      } else if (response.data) {
        setFeaturedProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        setFeaturedProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
      toast.error('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  // Apply filters
  useEffect(() => {
    let filtered = [...featuredProducts];
    
    if (search) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (filterCategory !== "all") {
      filtered = filtered.filter(p => p.categoryName === filterCategory);
    }
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [search, filterCategory, featuredProducts]);

  // Remove from featured
  const handleRemoveFromFeatured = async (productId, productName) => {
    if (processingId === productId) return;
    
    setProcessingId(productId);
    
    try {
      const response = await removeFromFeatured(productId);
      
      if (response.success) {
        toast.success(`${productName} removed from featured!`);
        setFeaturedProducts(prev => prev.filter(p => (p._id || p.id) !== productId));
      } else {
        toast.error(response.message || 'Failed to remove from featured');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to remove from featured');
    } finally {
      setProcessingId(null);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-10 w-64 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-5 w-96 bg-gray-200 rounded-lg mb-8"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
            <p className="text-gray-700 mt-1">Handpicked premium products curated just for you</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => loadFeaturedProducts()} 
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Filters Section - Exactly like ProductsPage */}
        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-nowrap items-center gap-3 overflow-x-auto">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search featured products..."
              className="w-[280px] min-w-[280px] rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
            />
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              className="w-[220px] min-w-[220px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
            >
              {categoryOptions.map((value) => (
                <option key={value} value={value}>{value === "all" ? "All categories" : value}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between -mt-5 -mb-5">
            <div className="text-sm text-gray-700">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{featuredProducts.length}</strong> featured products
            </div>
            <div className="text-sm text-gray-700">{itemsPerPage} products per page</div>
          </div>

          {/* Mobile View - Card style matching ProductsPage */}
          <div className="grid gap-4 sm:hidden">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 p-8 bg-white text-center text-gray-700">
                <StarOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p>No featured products found.</p>
              </div>
            ) : (
              currentProducts.map((product) => {
                const productId = product._id || product.id;
                const isProcessing = processingId === productId;
                
                return (
                  <div key={productId} className={`rounded-2xl border p-4 shadow-sm ${product.isFeatured ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                        {product.image?.url ? (
                          <img src={product.image.url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-600">
                            <ImagePlus className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-gray-900 flex items-center gap-2">
                          {product.name}
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </div>
                        <div className="truncate text-xs text-gray-500">{product.slug}</div>
                        <div className="mt-2 text-sm text-gray-700">{product.categoryName}</div>
                        <div className="mt-1 text-sm font-semibold text-amber-600">
                          {product.offerPrice ? (
                            <div className="flex items-center gap-2">
                              <span>${product.offerPrice}</span>
                              <span className="text-xs text-gray-400 line-through">${product.price}</span>
                            </div>
                          ) : (
                            <span>${product.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/products/edit?productId=${productId}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <button
                          onClick={() => handleRemoveFromFeatured(productId, product.name)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View - Exactly matching ProductsPage style */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 p-12 bg-white text-center">
              <StarOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Featured Products Yet</h3>
              <p className="text-gray-500">Go to Products page and add items to featured collection</p>
            </div>
          ) : (
            <>
              <div className="max-h-[58vh] overflow-auto rounded-xl border border-gray-200 hidden sm:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell">Category</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell">Brand</th>
                      <th className="px-4 py-3 text-left">Price</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product) => {
                      const productId = product._id || product.id;
                      const isProcessing = processingId === productId;
                      
                      return (
                        <tr key={productId} className={`${product.isFeatured ? 'bg-yellow-50/50' : 'bg-white'} border-b border-gray-100 hover:bg-gray-50 transition-colors`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                                {product.image?.url ? (
                                  <img src={product.image.url} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-gray-600">
                                    <ImagePlus className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-gray-900 flex items-center gap-1">
                                  {product.name}
                                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                </div>
                                <div className="truncate text-xs text-gray-500">{product.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 hidden lg:table-cell">
                            {product.categoryName}
                          </td>
                          <td className="px-4 py-3 text-gray-700 hidden lg:table-cell">
                            {product.brand || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {product.offerPrice ? (
                              <div>
                                <span className="font-semibold text-amber-600">${product.offerPrice}</span>
                                <span className="text-xs text-gray-400 line-through ml-2">${product.price}</span>
                              </div>
                            ) : (
                              <span className="font-semibold text-gray-900">${product.price}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {/* <Link
                                href={`/dashboard/products/edit?productId=${productId}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </Link> */}
                              <button
                                onClick={() => handleRemoveFromFeatured(productId, product.name)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                Remove From Featured
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Exactly matching ProductsPage */}
              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <div className="text-sm text-gray-700">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1 || loading}
                    onClick={() => paginate(currentPage - 1)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => paginate(currentPage + 1)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default FeaturedProductsPage;