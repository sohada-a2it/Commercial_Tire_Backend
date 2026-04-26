// app/featured/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Star, 
  ShoppingBag, 
  Clock,
  Tag,
  Eye,
  Sparkles,
  Award,
  Truck,
  Shield,
  Zap,
  ArrowRight,
  Gem,
  BadgeCheck,
  Flame,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

// Optimized Image Component with proper loading
const OptimizedImage = ({ src, alt, className }) => {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || imgError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <ShoppingBag className="w-12 h-12 text-gray-300" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-500 ${isLoading ? 'scale-105 opacity-0' : 'scale-100 opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setImgError(true);
        }}
      />
    </div>
  );
};

// Premium Compact Product Card Component
const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productId = product._id || product.id;
  const discount = product.offerPrice 
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <Link 
       href={`/product?id=${productId}`} 
      className="group block h-full"
    >
      <div 
        className="relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-200 h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - Compact */}
        <div className="relative overflow-hidden bg-gray-100 h-48">
          <OptimizedImage 
            src={product.image?.url} 
            alt={product.name}
            className="w-full h-full"
          />
          
          {/* Featured Badge - Compact */}
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-md">
              <Gem className="w-3 h-3" />
              <span>Featured</span>
            </div>
          </div>
          
          {/* Discount Badge - Compact */}
          {discount > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-md flex items-center gap-0.5">
                <Flame className="w-3 h-3" />
                {discount}%
              </div>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button 
            className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md transition-all duration-300 hover:scale-110"
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
              toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
            }}
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
          
          {/* Quick View Overlay - Compact */}
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <div 
              className="bg-white rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-600 flex items-center gap-1.5 transition-transform duration-300 shadow-lg"
              style={{ transform: isHovered ? 'translateY(0)' : 'translateY(0.5rem)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </div>
          </div>
        </div>
        
        {/* Product Info - Compact */}
        <div className="p-3">
          {/* Category */}
          <div className="mb-1.5">
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
              {product.categoryName || "Uncategorized"}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Brand */}
          {product.brand && (
            <div className="flex items-center gap-1 mb-2">
              <BadgeCheck className="w-3 h-3 text-blue-500" />
              <p className="text-xs text-gray-500">
                {product.brand}
              </p>
            </div>
          )}
          
          {/* Price - Compact */}
          <div className="flex items-baseline gap-2 mt-1">
            {product.offerPrice ? (
              <>
                <span className="text-lg font-bold text-amber-600">
                  ${product.offerPrice}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-amber-600">
                ${product.price}
              </span>
            )}
          </div>
          
          {/* Quick Actions - Compact */}
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Truck className="w-3 h-3" />
              <span>Free Ship</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
              <span>Warranty</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Sparkles className="w-3 h-3" />
              <span>Premium</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// "View More" Card Component
const ViewMoreCard = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-amber-100 h-full flex flex-col items-center justify-center cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="text-center p-6">
        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
          <ArrowRight className="w-6 h-6 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">View All</h3>
        <p className="text-xs text-gray-500 mb-3">Explore collection</p>
        <div className="inline-flex items-center gap-1 text-amber-600 font-semibold text-xs group-hover:gap-2 transition-all">
          <span>Discover</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

const FeaturedProductsPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

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

  // Handle responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerPage(1);
      else if (width < 768) setItemsPerPage(2);
      else if (width < 1024) setItemsPerPage(3);
      else setItemsPerPage(4);
    };
    
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(featuredProducts.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentProducts = featuredProducts.slice(startIndex, startIndex + itemsPerPage);
  const showViewMoreCard = currentPage === 0 && featuredProducts.length > itemsPerPage;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading Skeleton - Compact
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded-lg mx-auto mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded-lg mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-3">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if no products
  if (!loading && featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Premium Header Section - Compact */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/30 via-transparent to-amber-50/30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-amber-600 tracking-wide uppercase">Premium Selection</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Featured Collection
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Handpicked premium products just for you
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-gray-700">{featuredProducts.length} Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Grid - 4 items max with view more */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {currentProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
          {showViewMoreCard && <ViewMoreCard onClick={() => window.location.href = '/products'} />}
        </div>

        {/* Pagination Controls - Compact */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                currentPage === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 shadow-sm border border-gray-200'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx;
                } else if (currentPage < 3) {
                  pageNum = idx;
                } else if (currentPage > totalPages - 3) {
                  pageNum = totalPages - 5 + idx;
                } else {
                  pageNum = currentPage - 2 + idx;
                }
                
                if (pageNum < 0 || pageNum >= totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-medium text-sm transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                currentPage === totalPages - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 shadow-sm border border-gray-200'
              }`}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Premium Trust Badges - Compact */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                <Truck className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-xs">Free Delivery</p>
                <p className="text-xs text-gray-500">$50+ orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-xs">Secure Payment</p>
                <p className="text-xs text-gray-500">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-xs">24/7 Support</p>
                <p className="text-xs text-gray-500">Always here</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-purple-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-xs">Premium Quality</p>
                <p className="text-xs text-gray-500">Best materials</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            fontSize: '13px',
            padding: '8px 12px',
          },
        }} 
      />
    </div>
  );
};

export default FeaturedProductsPage;