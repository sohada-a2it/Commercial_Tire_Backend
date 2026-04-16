
// app/featured/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Star, 
  ShoppingBag, 
  TrendingUp,
  Clock,
  Tag,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Award,
  Truck,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';

// API Functions
const config = {
  email: {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
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
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);

  // Load featured products
  const loadFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchFeaturedProducts();
      
      if (response.success && response.products) {
        setFeaturedProducts(response.products);
      } else if (response.data) {
        setFeaturedProducts(response.data);
      } else {
        setFeaturedProducts([]);
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

  // Handle responsive items to show
  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1);
      } else if (window.innerWidth < 768) {
        setItemsToShow(2);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };
    
    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, []);

  const totalPages = Math.ceil(featuredProducts.length / itemsToShow);
  const startIndex = currentIndex * itemsToShow;
  const visibleProducts = featuredProducts.slice(startIndex, startIndex + itemsToShow);

  const nextSlide = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(totalPages - 1);
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <div className="animate-pulse">
              <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-3"></div>
              <div className="h-5 w-72 bg-gray-200 rounded-lg mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-52 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Featured Products</h2>
          <p className="text-gray-500">Check back soon for our premium collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-amber-500" />
                Featured Collection
              </h1>
              <p className="text-gray-500 text-sm mt-1">Handpicked premium products for you</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{featuredProducts.length} Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative group">
          {/* Navigation Buttons */}
          {totalPages > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 text-gray-600 hover:text-amber-600 hover:border-amber-300 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 text-gray-600 hover:text-amber-600 hover:border-amber-300 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Products Grid */}
          <div className="overflow-hidden">
            <div 
              className="transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              <div className="flex">
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                  <div key={pageIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {featuredProducts
                        .slice(pageIndex * itemsToShow, (pageIndex + 1) * itemsToShow)
                        .map((product) => {
                          const productId = product._id || product.id;
                          const discount = product.offerPrice 
                            ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
                            : 0;
                          
                          return (
                            <Link 
                              key={productId}
                              href={`/product/${productId}`}
                              className="group block"
                            >
                              <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-200">
                                {/* Image Container */}
                                <div className="relative overflow-hidden bg-gray-100 h-52">
                                  {product.image?.url ? (
                                    <img 
                                      src={product.image.url} 
                                      alt={product.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ShoppingBag className="w-12 h-12 text-gray-300" />
                                    </div>
                                  )}
                                  
                                  {/* Featured Badge */}
                                  <div className="absolute top-3 left-3">
                                    <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-md">
                                      <Star className="w-3 h-3 fill-white" />
                                      Featured
                                    </div>
                                  </div>
                                  
                                  {/* Discount Badge */}
                                  {discount > 0 && (
                                    <div className="absolute top-3 right-3">
                                      <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
                                        -{discount}%
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Quick View Overlay */}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="bg-white rounded-lg px-4 py-2 text-sm font-semibold text-amber-600 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Product Info */}
                                <div className="p-4">
                                  {/* Category */}
                                  <div className="mb-2">
                                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                                      {product.categoryName || "Uncategorized"}
                                    </span>
                                  </div>
                                  
                                  {/* Title */}
                                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                                    {product.name}
                                  </h3>
                                  
                                  {/* Brand */}
                                  {product.brand && (
                                    <p className="text-xs text-gray-400 mb-2">
                                      {product.brand}
                                    </p>
                                  )}
                                  
                                  {/* Price */}
                                  <div className="flex items-baseline gap-2 mt-2">
                                    {product.offerPrice ? (
                                      <>
                                        <span className="text-xl font-bold text-amber-600">
                                          ${product.offerPrice}
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                          ${product.price}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-xl font-bold text-amber-600">
                                        ${product.price}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Quick Actions */}
                                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                      <Truck className="w-3 h-3" />
                                      <span>Free Shipping</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                      <Shield className="w-3 h-3" />
                                      <span>Warranty</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === index 
                      ? 'w-8 bg-amber-500' 
                      : 'w-1.5 bg-gray-300 hover:bg-amber-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Free Delivery</p>
                <p className="text-xs text-gray-400">On orders $50+</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Secure Payment</p>
                <p className="text-xs text-gray-400">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">24/7 Support</p>
                <p className="text-xs text-gray-400">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Premium Quality</p>
                <p className="text-xs text-gray-400">Best materials</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
};

export default FeaturedProductsPage;