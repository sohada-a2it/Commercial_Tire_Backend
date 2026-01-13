"use client";

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "@/lib/navigation";
import { useParams } from "next/navigation";
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
import ContainerLoadingCapacity from "./ContainerLoadingCapacity";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/structuredData";

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
  const { id } = useParams();
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

  useEffect(() => {
    // Reset states when ID changes
    setLoading(true);
    setProduct(null);
    setSelectedImage(null);
    setQuantity(1);
    setRecommendedProducts([]);

    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Always load fresh product data based on the current ID
    fetch("/categories.json")
      .then((res) => res.json())
      .then((data) => {
        // Find the product and its category/subcategory info
        let foundProduct = null;
        let foundCategory = null;
        let foundSubcategory = null;

        data.forEach((cat) => {
          cat.subcategories?.forEach((sub) => {
            const product = sub.products?.find(
              (p) => String(p.id) === String(id)
            );
            if (product) {
              foundProduct = {
                ...product,
                categoryName: cat.name,
                subcategoryName: sub.name,
              };
              foundCategory = { name: cat.name, icon: cat.icon };
              foundSubcategory = { name: sub.name };
            }
          });
        });

        // Flatten products for recommendations
        const allProducts = data.flatMap(
          (cat) =>
            cat.subcategories?.flatMap((sub) =>
              (sub.products || []).map((product) => ({
                ...product,
                categoryName: cat.name,
                subcategoryName: sub.name,
              }))
            ) || []
        );

        // Update product state
        setProduct(foundProduct || null);
        setSelectedImage(foundProduct?.image || null);
        setCategoryInfo(foundCategory);
        setSubcategoryInfo(foundSubcategory);

        // Check if product is a tyre
        const tyreCheck =
          foundProduct?.keyAttributes?.["Tire Type"] !== undefined ||
          foundProduct?.keyAttributes?.["Pattern"] !== undefined ||
          foundProduct?.name?.toLowerCase().includes("tire") ||
          foundProduct?.name?.toLowerCase().includes("tyre");
        setIsTyre(tyreCheck);

        // Store all products for recommendations
        setAllProducts(allProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading categories.json:", err);
        setLoading(false);
      });
  }, [id]); // Only depend on id

  // Generate recommendations when product data is available
  useEffect(() => {
    if (product && allProducts.length > 0) {
      const recommendations = scoreAndRecommend(allProducts, product, 6);
      setRecommendedProducts(recommendations);
    }
  }, [product, allProducts]);

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Helper function to convert name to URL slug
  const nameToSlug = (name) => {
    return name.replace(/\s+/g, "-");
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-teal-600"></div>
          <p className="text-lg mt-4 text-gray-800">
            Loading product details...
          </p>
        </div>
      </div>
    );
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
          <div className="mb-6">
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
                      navigate(`/products/c/${categorySlug}/${subcategorySlug}`);
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
              {product.userReviews && (
                <div className="text-sm mt-2 flex items-center gap-2">
                  <span>Customer Reviews:</span>
                  <span className="flex items-center">
                    {renderStars(product.userReviews[0].rating)}
                  </span>
                  <div className="text-sm font-bold text-teal-800">
                    ({(
                        product.userReviews.reduce((sum, review) => sum + review.rating, 0) /
                        product.userReviews.length
                    ).toFixed(1)})
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

                  {/* Conditional Shipping Text */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                    <p className="text-sm text-blue-800 font-medium">
                      {isTyre
                        ? "🚚 DDP from Thailand — No hidden costs. U.S. FET & import taxes included"
                        : "📦 Shipping cost will be calculated based on your area"}
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
            <div className="lg:w-1/4 bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 h-fit">
              <div className="mb-4">
                {/* Updated Price Display */}
                {product.price && product.offerPrice ? (
                  <>
                  <div className="flex items-center justify-center">
                  <div>
                  <p className="text-black text-xl mr-1">Price: </p>
                  </div>
                   
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-2xl text-amber-600">
                        {product.offerPrice}
                      </p>

                      <span className="text-gray-700">-</span>

                      <p className="font-bold text-xl line-through text-gray-500">
                        {product.price}
                      </p>
                    </div>
                  </div>
                  </>
                ) : product.price ? (
                  <>
                    <p className="text-gray-600 text-sm">Price:</p>
                    <p className="font-bold text-2xl text-teal-800">
                      {product.price}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">Price: N/A</p>
                )}
              </div>

              {/* Pricing Tiers Display */}
              {product.pricingTiers && product.pricingTiers.length > 0 && (
                <div className="mb-4 max-h-32 overflow-y-auto">
                  {/* Price by Weight */}
                  {product.pricingTiers[0].minWeight !== undefined && (
                    <>
                      <p className="text-gray-600 text-sm mb-2 font-semibold">
                        Price by Weight:
                      </p>
                      {product.pricingTiers.map((tier, index) => (
                        <p key={index} className="text-gray-700 text-xs mb-1">
                          {tier.minWeight}-{tier.maxWeight}g:{" "}
                          <span className="font-semibold text-teal-700">
                            {tier.pricePerKg}
                          </span>
                        </p>
                      ))}
                      <p className="text-xs text-amber-600 mt-2 font-medium">
                        *Final price varies by actual weight
                      </p>
                    </>
                  )}

                  {/* Volume Pricing by Size */}
                  {product.pricingTiers[0].size &&
                    product.pricingTiers[0].pricePerTon && (
                      <>
                        <p className="text-gray-600 text-sm mb-2 font-semibold">
                          Volume Pricing:
                        </p>
                        {product.pricingTiers.map((tier, index) => (
                          <p key={index} className="text-gray-700 text-xs mb-1">
                            Size({tier.size}) - price(
                            <span className="font-semibold text-teal-700">
                              {tier.pricePerTon}
                            </span>
                            )
                          </p>
                        ))}
                      </>
                    )}

                  {/* Volume Pricing by Quantity (for tires) */}
                  {product.pricingTiers[0].minQuantity !== undefined &&
                    product.pricingTiers[0].pricePerTire && (
                      <>
                        <p className="text-gray-600 text-sm mb-2 font-semibold">
                          Volume Pricing:
                        </p>
                        {product.pricingTiers.map((tier, index) => (
                          <p key={index} className="text-gray-700 text-xs mb-1">
                            {tier.minQuantity}
                            {tier.maxQuantity ? `-${tier.maxQuantity}` : "+"}{" "}
                            tires:{" "}
                            <span className="font-semibold text-teal-700">
                              {tier.pricePerTire}
                            </span>
                          </p>
                        ))}
                      </>
                    )}
                </div>
              )}

              {product.keyAttributes?.MOQ && (
                <p className="text-gray-600 font-bold text-sm mb-4">
                  MOQ: {product.keyAttributes.MOQ}
                </p>
              )}

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="text-teal-700 text-lg mb-2 block text-center underline underline-offset-2 underline-teal-600 font-semibold">
                  Quantity:
                </label>
                <div className="flex items-center justify-between gap-3 mx-5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    <FaMinus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 text-center border border-teal-300 bg-white rounded-md px-3 py-2"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  const priceNum = parsePrice(
                    product.offerPrice || product.price || "0"
                  );

                  // Extract MOQ from product attributes with unit
                  let moqValue = 50;
                  let moqUnit = "units";
                  if (product.keyAttributes && product.keyAttributes.MOQ) {
                    const moqStr = product.keyAttributes.MOQ.toString().trim();
                    // Match number and optional unit (e.g., "100 Tons", "50 tires", "10")
                    const moqMatch = moqStr.match(/(\d+)\s*([a-zA-Z]+)?/);
                    if (moqMatch) {
                      moqValue = parseInt(moqMatch[1]);
                      // If unit is present, use it; otherwise default to "units"
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
                className="w-full border border-cyan-700 hover:bg-teal-600 hover:text-white text-cyan-600 px-6 py-2 rounded-sm transition-all shadow-md hover:shadow-lg mb-3 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
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
                          {product.pricingTiers[0].minWeight !== undefined &&
                            product.pricingTiers.map((tier, index) => (
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
                          {product.pricingTiers[0].minQuantity !== undefined &&
                            product.pricingTiers.map((tier, index) => (
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
                          {product.pricingTiers[0].size &&
                            product.pricingTiers[0].pricePerTon &&
                            product.pricingTiers.map((tier, index) => (
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
