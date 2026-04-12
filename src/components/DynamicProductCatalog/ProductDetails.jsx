"use client";

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "@/lib/navigation";
import { useParams, usePathname } from "next/navigation";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import dataService from "@/services/dataService";
import ContainerLoadingCapacity from "./ContainerLoadingCapacity";
import SearchSuggestion from "../Search/SearchSuggestion.jsx";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/structuredData";
import { ProductDetailsPageSkeleton } from "@/components/shared/RouteSkeletons";

// Helper functions for recommended products
const parsePrice = (priceStr) => {
  if (!priceStr) return null;
  const cleaned = (priceStr + "").replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
};

const scoreAndRecommend = (allProducts, current, limit = 6) => {
  // Determine product type
  const isCurrentTyre =
    current.keyAttributes?.["Tire Type"] !== undefined ||
    current.keyAttributes?.["Pattern"] !== undefined ||
    current.name?.toLowerCase().includes("tire") ||
    current.name?.toLowerCase().includes("tyre");

  // Filter products by type (only show same category)
  const sameTypeProducts = allProducts.filter((product) => {
    const isProductTyre =
      product.keyAttributes?.["Tire Type"] !== undefined ||
      product.keyAttributes?.["Pattern"] !== undefined ||
      product.name?.toLowerCase().includes("tire") ||
      product.name?.toLowerCase().includes("tyre");

    return isProductTyre === isCurrentTyre;
  });

  const curPrice = parsePrice(current.price);
  return sameTypeProducts
    .filter((t) => t.id !== current.id)
    .map((t) => {
      let score = 0;

      // Brand matching
      const currentBrand = current.keyAttributes?.["Brand"] || "";
      const productBrand = t.keyAttributes?.["Brand"] || "";
      if (productBrand.toLowerCase() === currentBrand.toLowerCase())
        score += 50;

      // Category matching (if available)
      if (t.category && current.category && t.category === current.category)
        score += 40;

      // Size matching for tyres
      if (
        isCurrentTyre &&
        t.keyAttributes?.Size &&
        current.keyAttributes?.Size
      ) {
        if (
          t.keyAttributes.Size.toLowerCase() ===
          current.keyAttributes.Size.toLowerCase()
        )
          score += 60;
      }

      // Pattern matching for tyres
      if (
        isCurrentTyre &&
        t.keyAttributes?.Pattern &&
        current.keyAttributes?.Pattern
      ) {
        if (
          t.keyAttributes.Pattern.toLowerCase() ===
          current.keyAttributes.Pattern.toLowerCase()
        )
          score += 40;
      }

      // For food products, match similar categories
      if (!isCurrentTyre && t.subcategory && current.subcategory) {
        if (t.subcategory === current.subcategory) score += 50;
      }

      // Rating consideration
      score += (t.rating || 0) * 4;

      // Price similarity
      const p = parsePrice(t.price);
      if (curPrice && p) {
        const diff = Math.abs(curPrice - p) / curPrice;
        if (diff < 0.1) score += 40;
        else if (diff < 0.25) score += 20;
      }

      // Small random factor to shuffle ties
      score += Math.random() * 2;

      return { product: t, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.product);
};

// Recommended Products Component
const RecommendedProducts = ({ recs = [], ratings, isTyre = false }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = recs.length;

  const intervalRef = useRef(null);
  const CARD_WIDTH = 240; // width of each card including margin
  const VISIBLE_CARDS = 4;

  // Create an infinite loop by duplicating products if needed
  const displayProducts = total > 0 ? [...recs, ...recs, ...recs] : [];

  // Auto slide every 3 seconds
  useEffect(() => {
    if (total > 0) startAutoSlide();
    return () => stopAutoSlide();
  }, [total]);

  const startAutoSlide = () => {
    stopAutoSlide();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        // Reset to 0 when we reach the original array length to create seamless loop
        if (next >= total) {
          return 0;
        }
        return next;
      });
    }, 3000); // Changed to 3 seconds
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const prevSlide = () => {
    stopAutoSlide();
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return total - 1;
      }
      return prev - 1;
    });
    startAutoSlide();
  };

  const nextSlide = () => {
    stopAutoSlide();
    setCurrentIndex((prev) => {
      if (prev >= total - 1) {
        return 0;
      }
      return prev + 1;
    });
    startAutoSlide();
  };

  if (total === 0) {
    return (
      <div className="mt-20 text-center text-gray-400">
        No recommended products available.
      </div>
    );
  }

  const translateX = -currentIndex * CARD_WIDTH;

  return (
    <div className="mt-12 relative max-w-7xl mx-auto">
      <h3 className="text-3xl font-bold text-center text-teal-800 mb-6 border-b-2 border-amber-400 pb-2">
        Recommended {isTyre ? "Tyres" : "Products"}
      </h3>

      {/* Navigation arrows - always show if we have products */}
      {total > 0 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 -translate-y-1/2 bg-teal-600 text-white rounded-full p-2 shadow hover:bg-teal-700 z-10"
            aria-label="Previous"
          >
            &#8592;
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 -translate-y-1/2 bg-teal-600 text-white rounded-full p-2 shadow hover:bg-teal-700 z-10"
            aria-label="Next"
          >
            &#8594;
          </button>
        </>
      )}

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {displayProducts.map((product, idx) => (
            <div
              key={`${product.id}-${idx}`}
              className="min-w-[220px] mr-5 bg-white p-4 rounded-lg flex-shrink-0 cursor-pointer hover:shadow-lg transition border border-teal-100"
            >
              <img
                src={product.image || ""}
                alt={product.name || "Product Image"}
                className="h-28 w-full object-contain mb-4"
                onClick={() => {
                  navigate(`/product/${product.id}`);
                }}
              />
              <div className="text-teal-800 font-bold text-sm truncate">
                {product.name || "Product Name"}
              </div>
              <div className="text-xs text-gray-400 mb-1">
                {product.keyAttributes?.Brand || "Brand"}
              </div>
              <div className="text-xs text-gray-400 mb-1">
                {ratings ? ratings(product.rating || 0) : null}
              </div>

              {/* Show tyre-specific attributes if it's a tyre */}
              {isTyre && product.keyAttributes?.Size && (
                <div className="text-xs text-gray-500 mb-1">
                  Size: {product.keyAttributes.Size}
                </div>
              )}

              {/* Price Section */}
              <div className="mb-2">
                {product.offerPrice ? (
                  <>
                    <div className="text-xs text-gray-400 line-through">
                      {product.price || "Regular Price N/A"}
                    </div>
                    <div className="text-amber-600 font-semibold">
                      {product.offerPrice}
                    </div>
                  </>
                ) : (
                  <div className="text-teal-800 font-semibold">
                    {product.price || "Price N/A"}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  navigate(`/product/${product.id}`);
                }}
                className="w-full border border-teal-600 hover:bg-teal-600 text-teal-600 hover:text-white text-sm font-medium py-1 px-1 rounded transition-all duration-300 text-center mt-2"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main ProductDetails Component
const ProductDetails = () => {
  const { id: routeId } = useParams();
  const pathname = usePathname();
  const runtimePathMatch = String(pathname || "").match(/^\/product\/([^/]+)\/?$/i);
  const id = String(routeId || runtimePathMatch?.[1] || "");
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isTyre, setIsTyre] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("specifications");
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [subcategoryInfo, setSubcategoryInfo] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [expandedSidebarPricing, setExpandedSidebarPricing] = useState(false);
  const [expandedSpecsPricing, setExpandedSpecsPricing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setProduct(null);
      return;
    }

    // Reset states when ID changes
    setLoading(true);
    setProduct(null);
    setSelectedImage(null);
    setQuantity(1);
    setAllProducts([]);
    setRecommendedProducts([]);

    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Load primary product data first so the page can render quickly.
    const loadProductData = async () => {
      try {
        // Get product by ID
        const foundProduct = await dataService.getProductById(id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedImage(foundProduct.image || null);
          setCategoryInfo({ 
            name: foundProduct.categoryName, 
            icon: foundProduct.categoryIcon 
          });
          setSubcategoryInfo({ name: foundProduct.subcategoryName });

          // Check if product is a tyre
          const tyreCheck =
            foundProduct.keyAttributes?.["Tire Type"] !== undefined ||
            foundProduct.keyAttributes?.["Pattern"] !== undefined ||
            foundProduct.name?.toLowerCase().includes("tire") ||
            foundProduct.name?.toLowerCase().includes("tyre");
          setIsTyre(tyreCheck);
        } else {
          setProduct(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading product data:", err);
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]); // Only depend on id

  useEffect(() => {
    if (!product?.categoryName || !product?.subcategoryName) return;

    let isCancelled = false;

    const loadRelatedProducts = async () => {
      try {
        const relatedResponse = await dataService.getProductsBySubcategory(
          product.categoryName,
          product.subcategoryName,
          { page: 1, limit: 24 }
        );

        if (isCancelled) return;
        const relatedProducts = Array.isArray(relatedResponse?.products)
          ? relatedResponse.products
          : [];
        setAllProducts(relatedProducts);
      } catch (_error) {
        if (!isCancelled) {
          setAllProducts([]);
        }
      }
    };

    loadRelatedProducts();

    return () => {
      isCancelled = true;
    };
  }, [product?.categoryName, product?.subcategoryName]);

  // Generate recommendations when product data is available
  useEffect(() => {
    if (product && allProducts.length > 0) {
      const recommendations = scoreAndRecommend(allProducts, product, 6);
      setRecommendedProducts(recommendations);
    }
  }, [product, allProducts]);

  const handleGoBack = () => {
    if (typeof window === "undefined") {
      navigate("/products");
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    const referrer = document.referrer;
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        if (referrerUrl.origin === window.location.origin) {
          const target = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;
          navigate(target || "/products");
          return;
        }
      } catch (_error) {
        // Ignore parsing failures and continue fallback.
      }
    }

    navigate("/products");
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setSearchLoading(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const results = await dataService.searchProducts(query, { page: 1, limit: 5 });
        setSearchSuggestions(results);
        setShowSuggestions(true);
      } catch (_error) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearchLoading(false);
      }
    }, 200);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`/product/${suggestion.id}`);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to convert name to URL slug
  const nameToSlug = (name) => {
    return String(name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i)
        stars.push(<FaStar key={i} className="text-amber-400 inline-block" />);
      else if (rating >= i - 0.5)
        stars.push(
          <FaStarHalfAlt key={i} className="text-amber-400 inline-block" />
        );
      else
        stars.push(
          <FaRegStar key={i} className="text-amber-400 inline-block" />
        );
    }
    return stars;
  };

  if (loading || !product) {
    return <ProductDetailsPageSkeleton />;
  }

  // Generate structured data for SEO
  const productSchema = generateProductSchema(
    product,
    product.categoryName,
    ""
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: product.categoryName || "Category", url: "/products" },
    { name: product.name, url: `/product/${product.id}` },
  ]);

  const reviews = Array.isArray(product?.userReviews) ? product.userReviews : [];
  const hasReviews = reviews.length > 0;
  const averageReviewRating =
    hasReviews
      ? reviews.reduce((sum, review) => sum + Number(review?.rating || 0), 0) / reviews.length
      : 0;

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="w-full bg-gray-50 px-4 lg:px-0">
        <div className="max-w-7xl mx-auto p-6 text-gray-800 rounded-lg">

          {/* Breadcrumb Navigation */}
          <div className="mb-3">
            <nav className="flex items-center text-sm text-gray-600 flex-wrap">
              <button
                onClick={() => navigate("/products")}
                className="hover:text-teal-600 transition-colors"
              >
                Products
              </button>
              {/* {categoryInfo && (
                <>
                  <span className="mx-2">/</span>
                  <button
                    onClick={() => {
                      const categorySlug = nameToSlug(categoryInfo.name);
                      navigate(`/products`);
                    }}
                    className="hover:text-teal-600 transition-colors"
                  >
                    {categoryInfo.name}
                  </button>
                </>
              )} */}
              {subcategoryInfo && categoryInfo && (
                <>
                  <span className="mx-2">/</span>
                  <button
                    onClick={() => {
                      const categorySlug = nameToSlug(categoryInfo.name);
                      const subcategorySlug = nameToSlug(subcategoryInfo.name);
                      navigate(`/products/c/${categorySlug}/${subcategorySlug}/`);
                    }}
                    className="hover:text-teal-600 transition-colors"
                  >
                    {subcategoryInfo.name}
                  </button>
                </>
              )}
              <span className="mx-2">/</span>
              <span className="text-teal-600 font-medium">{product?.name}</span>
            </nav>
          </div>
          {/* Back + Search */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-teal-700 hover:text-teal-800 font-medium transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-md">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search products, brands..."
                  className="w-full px-6 py-2 md:py-3 pr-12 border border-gray-300 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm text-teal-800"
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-teal-600 text-white p-2  rounded-full hover:bg-teal-700 transition-colors"
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
                isVisible={showSuggestions && !searchLoading}
              />
            </form>
          </div>

          <h2 className="text-3xl font-bold mb-12 text-center text-teal-800 hover:text-teal-900 transition-colors duration-300 border-b-2 border-amber-400 pb-2">
            {product.keyAttributes?.["Brand"] || "Product Details"}
          </h2>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Image Gallery */}
            <div className="flex flex-col items-center lg:w-2/5 relative">
              <div className="relative overflow-hidden group w-full max-w-lg cursor-pointer"
                onClick={() => setShowLightbox(true)}
              >
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="w-full h-auto max-h-66 md:max-h-80 object-contain mb-4 transition-transform duration-300 border border-gray-200 rounded-lg"
                />
                {/* Plus Icon Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center mb-4">
                  <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg">
                    <FaPlus className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {/* First thumbnail - main image */}
                <img
                  src={product.image}
                  alt="Main thumbnail"
                  onClick={() => {
                    setSelectedImage(product.image);
                  }}
                  className={`h-16 w-16 object-cover border-2 rounded cursor-pointer ${
                    selectedImage === product.image
                      ? "border-amber-400"
                      : "border-gray-300 opacity-50"
                  }`}
                />
                {/* Additional thumbnails from images array */}
                {(product.images || []).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 2}`}
                    onClick={() => {
                      setSelectedImage(img);
                    }}
                    className={`h-16 w-16 object-cover border-2 rounded cursor-pointer ${
                      selectedImage === img
                        ? "border-amber-400"
                        : "border-gray-300 opacity-50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Center: Product Details */}
            <div className="lg:w-1/2 space-y-2">
              <h1 className="text-2xl font-bold text-teal-800">
                {product.name}
              </h1>
              <p className="text-xl text-yellow-600 mb-2 font-semibold">
                Price: {product?.price || "N/A"}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mt-4">
                {/* Conditionally render attributes based on product type */}
                {product.keyAttributes?.["Load Range"] && (
                  <p>
                    Load Range:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Load Range"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Speed Symbol"] && (
                  <p>
                    Speed Symbol:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Speed Symbol"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Tread Depth"] && (
                  <p>
                    Tread Depth:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Tread Depth"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Tire Type"] && (
                  <p>
                    Tire Type:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Tire Type"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Size"] && (
                  <p>
                    Size:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Size"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Brand"] && (
                  <p>
                    Brand:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Brand"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Fuel Efficiency"] && (
                  <p>
                    Fuel Efficiency:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Fuel Efficiency"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Wet Grip"] && (
                  <p>
                    Wet Grip:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Wet Grip"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Noise Level"] && (
                  <p>
                    Noise Level:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Noise Level"]}
                    </span>
                  </p>
                )}
                {/* For food products */}
                {product.keyAttributes?.["Species"] && (
                  <p>
                    Species:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Species"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Type"] && (
                  <p>
                    Type:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Type"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Quality"] && (
                  <p>
                    Quality:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Quality"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Storage"] && (
                  <p>
                    Storage:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Storage"]}
                    </span>
                  </p>
                )}
                {/* For metals */}
                {product.keyAttributes?.["Purity"] && (
                  <p>
                    Purity:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Purity"]}
                    </span>
                  </p>
                )}
                {product.keyAttributes?.["Grade"] && (
                  <p>
                    Grade:{" "}
                    <span className="text-teal-800 font-medium">
                      {product.keyAttributes["Grade"]}
                    </span>
                  </p>
                )}
              </div>

              {/* Customer Reviews (if available) */}
              {hasReviews && (
                <div className="text-sm mt-2 flex items-center gap-2">
                  <span>Customer Reviews:</span>
                  <span className="flex items-center">
                    {renderStars(reviews[0]?.rating || averageReviewRating)}
                  </span>
                  <div className="text-sm font-bold text-teal-800">
                    ({averageReviewRating.toFixed(1)})
                  </div>
                  
                </div>
              )}

              {/* Product Description */}
              {product.description && (
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold mb-1 text-teal-800 ">
                    Description
                  </h3>
                  <p className="text-gray-700 text-sm">{product.description}</p>
                  <span className="text-sm text-red-500 font-bold -mt-6">
                    {product.categoryName === "Vehicle Parts and Accessories" && " *DOT, ECE Certified"}
                    {product.categoryName === "Frozen Fish" && " *ISO Certified"}
                    {product.categoryName === "Dry Food" && " *ISO Certified"}
                    {product.categoryName === "Agriculture" && " *ISO Certified"}
                    {product.categoryName === "Metals and Metal Products" && " *ISO 9001 Certified"}
                    {product.categoryName === "Wood Products" && " *FSC & EPA Certified"}
                    {!["Vehicle Parts and Accessories", "Frozen Fish", "Dry Food", "Agriculture", "Metals and Metal Products", "Wood Products"].includes(product.categoryName) && " *Quality Certified"}
                  </span>

                  {/* Conditional Shipping Text */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                    <p className="text-sm text-blue-800 font-medium">
                      {isTyre
                        ? "🚚 DDP from Thailand — No hidden costs. U.S. FET & import taxes included"
                        : "📦 Shipping cost will be calculated based on your location"}
                    </p>
                  </div>
                </div>
              )}

              {/* Container Loading Capacity - Only for Vehicle Parts and Accessories */}
              {product.categoryName === "Vehicle Parts and Accessories" && (
                <ContainerLoadingCapacity />
              )}
            </div>

            {/* Right: Purchase Box */}
  {/* Right: Purchase Box - Compact Style */}
<div className="lg:w-1/4 bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 h-fit">
  {/* Price Section - Compact */}
  <div className="mb-2">
    {product.price && product.offerPrice ? (
      <div className="text-center border-b border-teal-200">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
            SALE
          </span>
          <span className="text-xs text-gray-500 line-through">
            {product.price}
          </span>
        </div>
        <div className="text-2xl font-bold text-amber-600 shadow-glow-sm">
          {product.offerPrice}
        </div>
      </div>
    ) : product.price ? (
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-1">Price</div>
        <div className="text-2xl font-bold text-teal-800">
          {product.price}
        </div>
      </div>
    ) : (
      <div className="text-center text-gray-500 text-sm">
        Price available upon request
      </div>
    )}
  </div>

  {/* Volume Pricing - Compact Table */}
  {product.pricingTiers && product.pricingTiers.length > 0 && (
    <div className="mb-4  pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-md font-semibold text-red-500">Volume Pricing<span>↓</span></span>
        <span className="text-xs text-teal-600">Save more</span>
      </div>
      
      <div className="space-y-1.5 pr-1">
        {/* Price by Weight */}
        {product.pricingTiers[0].minWeight !== undefined && (
          <>
            {product.pricingTiers.slice(0, expandedSidebarPricing ? product.pricingTiers.length : 3).map((tier, index) => (
              <div key={index} className="flex items-center justify-between text-xs border-b border-teal-100 ">
                <span className="text-gray-600 font-bold">{tier.minWeight}-{tier.maxWeight}g</span>
                <span className=" text-teal-700 font-bold">{tier.pricePerKg}</span>
              </div>
            ))}
            {product.pricingTiers.length > 3 && (
              <button
                onClick={() => setExpandedSidebarPricing(!expandedSidebarPricing)}
                className="w-full text-xs text-teal-600 hover:text-teal-800 font-medium py-1 flex items-center justify-center gap-1"
              >
                {expandedSidebarPricing ? (
                  <>
                    <span>Show Less</span>
                    <span>↑</span>
                  </>
                ) : (
                  <>
                    <span>Show More ({product.pricingTiers.length - 3} more)</span>
                    <span>↓</span>
                  </>
                )}
              </button>
            )}
          </>
        )}

        {/* Volume Pricing by Size */}
        {product.pricingTiers[0].size && product.pricingTiers[0].pricePerTon && (
          <>
            {product.pricingTiers.slice(0, expandedSidebarPricing ? product.pricingTiers.length : 3).map((tier, index) => (
              <div key={index} className="flex items-center justify-between text-xs border-b border-teal-100 ">
                <span className="text-gray-600 font-bold">Size {tier.size}</span>
                <span className=" text-teal-700 font-bold">{tier.pricePerTon}</span>
              </div>
            ))}
            {product.pricingTiers.length > 3 && (
              <button
                onClick={() => setExpandedSidebarPricing(!expandedSidebarPricing)}
                className="w-full text-xs text-teal-600 hover:text-teal-800 font-medium py-1 flex items-center justify-center gap-1"
              >
                {expandedSidebarPricing ? (
                  <>
                    <span>Show Less</span>
                    <span>↑</span>
                  </>
                ) : (
                  <>
                    <span>Show More ({product.pricingTiers.length - 3} more)</span>
                    <span>↓</span>
                  </>
                )}
              </button>
            )}
          </>
        )}

        {/* Volume Pricing by Quantity */}
        {product.pricingTiers[0].minQuantity !== undefined && (
          <>
            {product.pricingTiers.slice(0, expandedSidebarPricing ? product.pricingTiers.length : 3).map((tier, index) => (
              <div key={index} className="flex items-center justify-between text-xs border-b border-teal-100 ">
                <span className="text-gray-600 font-bold">
                  {tier.minQuantity}
                  {tier.maxQuantity ? `-${tier.maxQuantity}` : '+'}
                </span>
                <span className=" text-teal-700 font-bold">
                  {tier.pricePerTire || tier.pricePerUnit}
                </span>
              </div>
            ))}
            {product.pricingTiers.length > 3 && (
              <button
                onClick={() => setExpandedSidebarPricing(!expandedSidebarPricing)}
                className="w-full text-xs text-teal-600 hover:text-teal-800 font-medium py-1 flex items-center justify-center gap-1"
              >
                {expandedSidebarPricing ? (
                  <>
                    <span>Show Less</span>
                    <span>↑</span>
                  </>
                ) : (
                  <>
                    <span>Show More ({product.pricingTiers.length - 3} more)</span>
                    <span>↓</span>
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )}

  {/* MOQ - Compact */}
  {product.keyAttributes?.MOQ && (
    <div className="mb-4 p-2 bg-blue-50 rounded border border-blue-100">
      <div className="flex items-center justify-between text-xs">
        <span className="text-blue-700 font-medium">MOQ:</span>
        <span className="text-blue-900 font-bold">{product.keyAttributes.MOQ}</span>
      </div>
    </div>
  )}

  {/* Quantity Selector - Compact */}
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">Quantity</span>
      <span className="text-xs text-gray-500">Add {quantity} to cart</span>
    </div>
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Decrease quantity"
      >
        <FaMinus className="w-4 h-4 text-yellow-600" />
      </button>
<input
  type="number"
  value={quantity}
  onChange={(e) =>
    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
  }
  className="w-16 text-center font-semibold border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
  min="1"
/>
      <button
        onClick={() => setQuantity(quantity + 1)}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Increase quantity"
      >
        <FaPlus className="w-4 h-4 text-yellow-600" />
      </button>
    </div>
  </div>

  {/* Add to Cart Button - Compact */}
  <button
    onClick={() => {
      const priceNum = parsePrice(product.offerPrice || product.price || "0");
      
      let moqValue = 50;
      let moqUnit = "units";
      if (product.keyAttributes && product.keyAttributes.MOQ) {
        const moqStr = product.keyAttributes.MOQ.toString().trim();
        const moqMatch = moqStr.match(/(\d+)\s*([a-zA-Z]+)?/);
        if (moqMatch) {
          moqValue = parseInt(moqMatch[1]);
          moqUnit = moqMatch[2] || "units";
        }
      }

      addToCart({
        id: product.id,
        name: product.name,
        price: priceNum,
        offerPrice: product.offerPrice,
        quantity: quantity,
        image: product.image,
        category: product.categoryName || "General",
        moq: moqValue,
        moqUnit: moqUnit,
        pricingTiers: product.pricingTiers || [],
      });
    }}
    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2 shadow hover:shadow-md"
  >
    <ShoppingCart className="w-4 h-4" />
    <span>Add to Cart</span>
  </button>
</div>
          </div>

          {/* Tabbed Interface for Product Details */}
          <div className="mt-12">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("specifications")}
                className={`px-6 py-3 font-semibold transition-colors relative ${
                  activeTab === "specifications"
                    ? "text-teal-600 border-b-2 border-teal-600 text-lg"
                    : "text-gray-600 hover:text-teal-600 text-sm"
                }`}
              >
                ⚙️ Technical Specifications
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`px-6 py-3 font-semibold transition-colors relative ${
                  activeTab === "pricing"
                    ? "text-teal-600 border-b-2 border-teal-600 text-lg"
                    : "text-gray-600 hover:text-teal-600 text-sm"
                }`}
              >
               💲Pricing Options
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-3 font-semibold transition-colors relative ${
                  activeTab === "reviews"
                    ? "text-teal-600 border-b-2 border-teal-600 text-lg"
                    : "text-gray-600 hover:text-teal-600 text-sm"
                }`}
              >
                ⭐ Reviews
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              {/* Technical Specifications Tab */}
              {activeTab === "specifications" && product.keyAttributes && (
                <div>
                  <h3 className="text-3xl font-bold text-teal-800 mb-4">
                    Product Specifications
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(product.keyAttributes).map(([key, value]) => {
                      // Skip supplier-specific fields that will be shown separately
                      const supplierFields = [
                        "Brand",
                        "Manufacturer",
                        "Origin",
                        "Place of Origin",
                        "Packaging",
                        "Package",
                        "Supply Ability",
                        "Shelf Life",
                        "Processing",
                      ];
                      if (supplierFields.includes(key)) return null;

                      if (typeof value === "string" || typeof value === "number") {
                        return (
                          <div
                            key={key}
                            className="bg-gray-50 p-2 rounded-lg border border-teal-100"
                          >
                            <p className="text-gray-600 text-sm mb-1">{key}</p>
                            <p className="text-teal-800 font-medium">{value}</p>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Pricing Options Tab */}
              {activeTab === "pricing" && (
                <div>
                  <h3 className="text-xl font-bold text-teal-800 mb-4">
                    Pricing Details
                  </h3>
                  <div className="space-y-6">
                    {/* Base Price */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-teal-700 mb-2 text-lg">Base Price</h4>
                      {product.price && product.offerPrice ? (
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-2xl font-bold text-amber-600">
                              {product.offerPrice}
                            </p>
                            <p className="text-xl line-through text-gray-500">
                              {product.price}
                            </p>
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {Math.round(
                                ((parsePrice(product.price) - parsePrice(product.offerPrice)) /
                                  parsePrice(product.price)) *
                                  100
                              )}% OFF
                            </span>
                          </div>
                        </div>
                      ) : product.price ? (
                        <p className="text-2xl font-bold text-teal-800">{product.price}</p>
                      ) : (
                        <p className="text-gray-500">Price available upon request</p>
                      )}
                    </div>

                    {/* Volume/Tier Pricing */}
                    {product.pricingTiers && product.pricingTiers.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-teal-700 mb-3">
                          {product.pricingTiers[0].minWeight !== undefined
                            ? "Price by Weight Range"
                            : "Volume Pricing"}
                        </h4>
                        <div className="space-y-2">
                          {product.pricingTiers[0].minWeight !== undefined && (
                            <>
                              {product.pricingTiers.slice(0, expandedSpecsPricing ? product.pricingTiers.length : 3).map((tier, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center bg-white p-3 rounded border border-teal-100"
                                >
                                  <span className="text-gray-700">
                                    {tier.minWeight}g - {tier.maxWeight}g
                                  </span>
                                  <span className="font-semibold text-teal-700">
                                    {tier.pricePerKg}
                                  </span>
                                </div>
                              ))}
                              {product.pricingTiers.length > 3 && (
                                <button
                                  onClick={() => setExpandedSpecsPricing(!expandedSpecsPricing)}
                                  className="w-full text-sm text-teal-600 hover:text-teal-800 font-medium py-2 flex items-center justify-center gap-1 border border-teal-200 rounded hover:bg-teal-50 transition-colors"
                                >
                                  {expandedSpecsPricing ? (
                                    <>
                                      <span>Show Less</span>
                                      <span>↑</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Show {product.pricingTiers.length - 3} More</span>
                                      <span>↓</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                          {product.pricingTiers[0].minQuantity !== undefined && (
                            <>
                              {product.pricingTiers.slice(0, expandedSpecsPricing ? product.pricingTiers.length : 3).map((tier, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"
                                >
                                  <span className="text-gray-700">
                                    {tier.minQuantity}
                                    {tier.maxQuantity ? ` - ${tier.maxQuantity}` : '+'} units
                                  </span>
                                  <span className="font-semibold text-teal-700">
                                    {tier.pricePerTire || tier.pricePerUnit}
                                  </span>
                                </div>
                              ))}
                              {product.pricingTiers.length > 3 && (
                                <button
                                  onClick={() => setExpandedSpecsPricing(!expandedSpecsPricing)}
                                  className="w-full text-sm text-teal-600 hover:text-teal-800 font-medium py-2 flex items-center justify-center gap-1 border border-teal-200 rounded hover:bg-teal-50 transition-colors"
                                >
                                  {expandedSpecsPricing ? (
                                    <>
                                      <span>Show Less</span>
                                      <span>↑</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Show {product.pricingTiers.length - 3} More</span>
                                      <span>↓</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                          {product.pricingTiers[0].size &&
                            product.pricingTiers[0].pricePerTon && (
                            <>
                              {product.pricingTiers.slice(0, expandedSpecsPricing ? product.pricingTiers.length : 3).map((tier, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"
                                >
                                  <span className="text-gray-700">Size: {tier.size}</span>
                                  <span className="font-semibold text-teal-700">
                                    {tier.pricePerTon}
                                  </span>
                                </div>
                              ))}
                              {product.pricingTiers.length > 3 && (
                                <button
                                  onClick={() => setExpandedSpecsPricing(!expandedSpecsPricing)}
                                  className="w-full text-sm text-teal-600 hover:text-teal-800 font-medium py-2 flex items-center justify-center gap-1 border border-teal-200 rounded hover:bg-teal-50 transition-colors"
                                >
                                  {expandedSpecsPricing ? (
                                    <>
                                      <span>Show Less</span>
                                      <span>↑</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Show {product.pricingTiers.length - 3} More</span>
                                      <span>↓</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        {product.pricingTiers[0].minWeight !== undefined && (
                          <p className="text-xs text-amber-600 mt-3 font-medium">
                            *Final price varies by actual weight
                          </p>
                        )}
                      </div>
                    )}

                    {/* MOQ Information */}
                    {product.keyAttributes?.MOQ && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-700 mb-2">
                          Minimum Order Quantity
                        </h4>
                        <p className="text-blue-900 text-lg font-bold">
                          {product.keyAttributes.MOQ}
                        </p>
                      </div>
                    )}

                    {/* Customization Options */}
                    {product.customizationOptions &&
                      product.customizationOptions.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-teal-700 mb-2">
                            Customization Options
                          </h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {product.customizationOptions.map((option, index) => (
                              <li key={index}>{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-3xl font-bold text-teal-800 mb-4">Customer Reviews</h3>
                  {product.userReviews && product.userReviews.length > 0 ? (
                    <div>
                      {/* Overall Rating Summary */}
                      <div className="bg-gray-50 p-3 rounded-lg mb-2">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-teal-800">
                              {(
                                product.userReviews.reduce((sum, review) => sum + review.rating, 0) /
                                product.userReviews.length
                              ).toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center mt-2">
                              {renderStars(
                                product.userReviews.reduce((sum, review) => sum + review.rating, 0) /
                                  product.userReviews.length
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* User Reviews */}
                      <div className="space-y-4">
                        {product.userReviews.map((review, index) => (
                          <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-800">{review.username}</h4>
                                  {review.verified && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                      ✓ Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex">{renderStars(review.rating)}</div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {review.title && (
                              <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                            )}
                            <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : product.rating ? (
                    <div>
                      {/* Overall Rating Summary (fallback when no userReviews but rating exists) */}
                      <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-teal-800">
                              {product.rating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center mt-2">
                              {renderStars(product.rating)}
                            </div>
                            <p className="text-gray-600 mt-2">
                              {product.reviewCount || 0} reviews
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-gray-600 italic">
                          Customer reviews will be displayed here. Contact us for detailed customer feedback and testimonials.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-5xl mb-4">⭐</div>
                      <p className="text-gray-600 mb-2">No reviews yet</p>
                      <p className="text-sm text-gray-500">
                        Be the first to review this product!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="mt-12 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-teal-800 border-b-2 border-amber-400 pb-2">
              Supplier Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.keyAttributes?.["Brand"] && (
                <div>
                  <p className="text-gray-600">Brand Name:</p>
                  <p className="text-teal-800 font-medium">
                    {product.keyAttributes["Brand"]}
                  </p>
                </div>
              )}
              {product.keyAttributes?.Manufacturer && (
                <div>
                  <p className="text-gray-600">Manufacturer:</p>
                  <p className="text-teal-800 font-medium">
                    {product.keyAttributes.Manufacturer}
                  </p>
                </div>
              )}
              {product.keyAttributes?.Origin && (
                <div>
                  <p className="text-gray-600">Origin:</p>
                  <p className="text-teal-800 font-medium">
                    {product.keyAttributes.Origin}
                  </p>
                </div>
              )}
              {product.keyAttributes?.["Place of Origin"] && (
                <div>
                  <p className="text-gray-600">Place of Origin:</p>
                  <p className="text-teal-800 font-medium">
                    {product.keyAttributes["Place of Origin"]}
                  </p>
                </div>
              )}
              {product.keyAttributes?.Packaging && (
                <div>
                  <p className="text-gray-600">Packaging:</p>
                  <p className="text-teal-800 font-medium">
                    {product.keyAttributes.Packaging}
                  </p>
                </div>
              )}
              {product.keyAttributes?.Package && (
                <div>
                  <p className="text-gray-600">Package:</p>
                  <p className="text-teal-800 font-medium">
                    {product.keyAttributes.Package}
                  </p>
                </div>
              )}
              {product.keyAttributes?.["Supply Ability"] && (
                <div>
                  <p className="text-gray-600">Supply Ability:</p>
                  <p className="text-teal-800 font-medium">
                    {product.keyAttributes["Supply Ability"]}
                  </p>
                </div>
              )}
              {product.keyAttributes?.["Shelf Life"] && (
                <div>
                  <p className="text-gray-600">Shelf Life:</p>
                  <p className="text-teal-800 font-medium">
                    {product.keyAttributes["Shelf Life"]}
                  </p>
                </div>
              )}
              {product.keyAttributes?.Processing && (
                <div>
                  <p className="text-gray-600">Processing:</p>
                  <p className="text-teal-800 font-medium">
                    {product.keyAttributes.Processing}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customization Options */}
          {product.customizationOptions &&
            product.customizationOptions.length > 0 && (
              <div className="mt-12 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-teal-800 border-b-2 border-amber-400 pb-2">
                  Customization Options
                </h3>
                <ul className="list-disc list-inside text-gray-700">
                  {product.customizationOptions.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Shipping Information */}
          {product.shipping && (
            <div className="mt-12 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-teal-800 border-b-2 border-amber-400 pb-2">
                Shipping & Delivery
              </h3>
              <p className="text-gray-700">{product.shipping}</p>
              {product.packagingAndDelivery && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Selling Units:</p>
                    <p className="text-teal-800 font-medium">
                      {product.packagingAndDelivery.sellingUnits}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Delivery Time:</p>
                    <p className="text-teal-800 font-medium">
                      {product.packagingAndDelivery.deliveryTime ||
                        "Will vary based on order quantity and region"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommended Products Section */}
          {recommendedProducts.length > 0 && (
            <RecommendedProducts
              recs={recommendedProducts}
              ratings={renderStars}
              isTyre={isTyre}
            />
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            aria-label="Close"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          
          {/* Image */}
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetails;
