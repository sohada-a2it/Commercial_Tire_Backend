"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaTruck,
  FaChartLine,
  FaShieldAlt,
  FaFilePdf,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaCheckCircle,
  FaCertificate,
  FaRuler,
  FaWeightHanging,
  FaTachometerAlt,
  FaRoad,
  FaDownload,
  FaStore,
  FaFileAlt,
  FaShareAlt,
  FaHeart,
  FaRegHeart,
  FaTag,
  FaCalendarAlt,
  FaBox,
  FaCompress,
  FaExpand,
} from "react-icons/fa";
import { ShoppingCart, ExternalLink, Copy, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  fetchProductDetails,
  fetchProductReviews,
  fetchProductPricing,
  fetchProductSpecifications,
  submitProductReview,
  formatPrice,
  calculateDiscount,
  getTireTypeLabel,
  getApplicationLabel,
  getVehicleTypeLabel,
} from "@/services/catalogService";

// Helper function to parse price from string
const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  const num = parseFloat(String(priceStr).replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : num;
};

// Star Rating Component
const StarRating = ({ rating = 0, size = "sm", showNumber = false }) => {
  const sizeClass = size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className={`${sizeClass} text-yellow-400`} />
        ))}
        {hasHalfStar && <FaStarHalfAlt className={`${sizeClass} text-yellow-400`} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className={`${sizeClass} text-yellow-400`} />
        ))}
      </div>
      {showNumber && <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>}
    </div>
  );
};

// Tire Type Badge
const TireTypeBadge = ({ tireType }) => {
  const types = {
    steer: { label: "Steer Tire", color: "bg-blue-100 text-blue-800 border-blue-200" },
    drive: { label: "Drive Tire", color: "bg-green-100 text-green-800 border-green-200" },
    trailer: { label: "Trailer Tire", color: "bg-purple-100 text-purple-800 border-purple-200" },
    "all-position": { label: "All-Position", color: "bg-teal-100 text-teal-800 border-teal-200" },
    "off-road": { label: "Off-Road Tire", color: "bg-orange-100 text-orange-800 border-orange-200" },
    mining: { label: "Mining Tire", color: "bg-red-100 text-red-800 border-red-200" },
  };
  const type = types[tireType] || { label: tireType, color: "bg-gray-100 text-gray-800 border-gray-200" };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${type.color}`}>
      {type.label}
    </span>
  );
};

// Compact Spec Row for Table
const SpecRow = ({ label, value, unit = "" }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="col-span-1 font-medium text-gray-500 text-sm">{label}</div>
      <div className="col-span-2 text-gray-800 text-sm">
        {value} {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
};

// Compact Info Card
const InfoCard = ({ icon: Icon, title, value, suffix = "" }) => {
  if (!value) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-teal-500" />
        <span className="text-xs text-gray-500">{title}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800">
        {value} {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
      </p>
    </div>
  );
};

const normalizeTireSpecs = (specs) => {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return specs.map((spec) => {
      if (typeof spec === "string") return { size: spec };
      if (spec && typeof spec === "object") return spec;
      return {};
    });
  }
  if (typeof specs === "string") {
    return [{ size: specs }];
  }
  if (typeof specs === "object") {
    return [specs];
  }
  return [];
};

// Size Selector Component
const SizeSelector = ({ sizes, selectedSize, onSelect }) => {
  if (!sizes || sizes.length <= 1) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Select Tire Size:</label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(size)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${selectedSize?.size === size.size
              ? "bg-teal-600 text-white border-teal-600 shadow-md"
              : "bg-white text-gray-700 border-gray-300 hover:border-teal-400 hover:bg-teal-50"
              }`}
          >
            {size.size}
            {size.loadRange && <span className="ml-1 text-xs opacity-75">({size.loadRange})</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

// Specifications Table Component
const SpecificationsTable = ({ tireSpecs }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!tireSpecs || tireSpecs.length === 0) return null;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl overflow-hidden border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Size</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Product Code</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Load Range</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Ply</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Load Index</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Speed</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">OD (inch)</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Section Width</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Tread Depth</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Std Rim</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Single Load</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Single Pressure</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Dual Load</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Dual Pressure</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Static Radius</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Revs/Km</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Weight</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Construction</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tireSpecs.map((spec, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2 text-xs font-medium text-gray-800">{spec.size || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.productCode || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.loadRange || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.plyRating || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.loadIndex || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.speedRating || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.overallDiameter || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.sectionWidth || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.treadDepth || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.stdRim || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.singleMaxLoad || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.singleMaxPressure || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.dualMaxLoad || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.dualMaxPressure || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.staticLoadRadius || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.revsPerKm || "—"}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{spec.weight || "—"} {spec.weightUnit}</td>
              <td className="px-3 py-2 text-xs text-gray-600">
                {spec.constructionType === "TL" ? "Tubeless" : spec.constructionType === "TT" ? "Tube Type" : spec.constructionType || "—"}
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => copyToClipboard(spec.size, idx)}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Copy size"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Product Details Component (uses query params)
function ProductDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('id');
  const { addToCart } = useCart();

  // State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specs");
  const [showLightbox, setShowLightbox] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    username: "",
    rating: 5,
    text: "",
    location: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch all product data
  useEffect(() => {
    if (!productId) {
      router.push('/products');
      return;
    }

    const loadProductData = async () => {
      setLoading(true);
      try {
        const detailsRes = await fetchProductDetails(productId, { includeRelated: true, limit: 6 });

        setProduct(detailsRes.product);
        setRelatedProducts(detailsRes.relatedProducts || []);
        setSelectedImage(detailsRes.product?.image?.url || detailsRes.product?.image);

        // Normalize tire specifications and choose the first size by default
        const specs = normalizeTireSpecs(detailsRes.product?.tireSpecs);
        if (specs.length > 0) {
          setSelectedSize(specs[0]);
        } else {
          setSelectedSize(null);
        }

        // Load reviews and pricing
        const [reviewsRes, pricingRes] = await Promise.all([
          fetchProductReviews(productId, { page: 1, limit: 10 }),
          fetchProductPricing(productId, quantity),
        ]);

        setReviews(reviewsRes.reviews || []);
        setPricing(pricingRes.pricing);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [productId, router]);

  // Update pricing when quantity changes
  useEffect(() => {
    if (!productId || quantity < 1) return;
    const updatePricing = async () => {
      const pricingRes = await fetchProductPricing(productId, quantity);
      setPricing(pricingRes.pricing);
    };
    updatePricing();
  }, [quantity, productId]);

  const handleQuantityChange = (delta) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    const priceNum = pricing?.unitPrice || parsePrice(product?.price);
    addToCart({
      id: product.id,
      name: product.name,
      price: priceNum,
      quantity: quantity,
      image: product.image?.url || product.image,
      category: product.categoryName,
      size: selectedSize?.size,
    });
  };
// In your Product Details page, find the handleRequestQuote function and replace it with this:

const handleRequestQuote = () => {
  // Encode all parameters properly
  const productName = encodeURIComponent(product.name);
  const productModel = product.modelNumber ? encodeURIComponent(product.modelNumber) : "";
  const quantityValue = encodeURIComponent(quantity);
  const selectedSizeValue = selectedSize?.size ? encodeURIComponent(selectedSize.size) : "";
  
  // Build URL with all parameters
  let inquiryUrl = `/inquiry?product=${productId}&name=${productName}&quantity=${quantityValue}`;
  
  if (productModel) {
    inquiryUrl += `&model=${productModel}`;
  }
  
  if (selectedSizeValue) {
    inquiryUrl += `&size=${selectedSizeValue}`;
  }
  
  // For debugging - check console to see what's being sent
  console.log("Redirecting to:", inquiryUrl);
  console.log("Product Name:", product.name);
  console.log("Product Model:", product.modelNumber);
  console.log("Quantity:", quantity);
  console.log("Selected Size:", selectedSize?.size);
  
  router.push(inquiryUrl);
};

// Make sure your button section looks like this:
{/* Action Buttons */}
<div className="space-y-2 pt-4">
  <button
    onClick={handleRequestQuote}
    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
  >
    <FaEnvelope />
    Request Quote
  </button>
</div>

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.username || !reviewForm.text) {
      alert("Please fill in all required fields");
      return;
    }
    setSubmittingReview(true);
    try {
      const result = await submitProductReview(productId, reviewForm);
      if (result.success) {
        const reviewsRes = await fetchProductReviews(productId);
        setReviews(reviewsRes.reviews);
        setReviewForm({ username: "", rating: 5, text: "", location: "" });
        alert("Review submitted successfully!");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/products")}
            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const tireSpecs = normalizeTireSpecs(product.tireSpecs);
  const tireType = product.tireType;
  const vehicleType = product.vehicleType || product.vehicleTypesList || [];
  const application = product.application || product.applicationsList || [];
  const discount = calculateDiscount(product.price, product.offerPrice);
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  // Get current selected spec details
  const currentSpec = selectedSize || (tireSpecs.length > 0 ? tireSpecs[0] : {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
      {/* HEADER - Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-500 font-medium transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* MAIN PRODUCT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

          {/* LEFT - IMAGE GALLERY */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden cursor-pointer group border border-gray-200 shadow-lg"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={selectedImage || product.image?.url || product.image}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 p-8"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                <FaExpand className="w-5 h-5 text-amber-500" />
              </div>
              {product.offerPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  -30%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {(product.images?.length > 0 || product.image) && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                <div
                  onClick={() => setSelectedImage(product.image?.url || product.image)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === (product.image?.url || product.image)
                    ? "border-amber-500 shadow-lg scale-105"
                    : "border-gray-200 opacity-50 hover:opacity-100"
                    }`}
                >
                  <img
                    src={product.image?.url || product.image}
                    alt="Main"
                    className="w-full h-full object-cover"
                  />
                </div>
                {(product.images || []).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(typeof img === 'string' ? img : img?.url)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === (typeof img === 'string' ? img : img?.url)
                      ? "border-amber-500 shadow-lg scale-105"
                      : "border-gray-200 opacity-50 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={typeof img === 'string' ? img : img?.url}
                      alt={`View ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - PRODUCT INFO */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              {tireType && <TireTypeBadge tireType={tireType} />}
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>
              {product.modelNumber && (
                <p className="text-sm text-gray-600 font-mono bg-gray-100 inline-block px-3 py-1 rounded-lg">
                  Model: {product.modelNumber}
                </p>
              )}
            </div>

            {/* Description */}
            {product.shortDescription && (
              <p className="text-gray-700 leading-relaxed text-base font-medium">
                {product.shortDescription}
              </p>
            )}

            {/* Brand & Pattern Pills */}
            {(product.brand || product.pattern) && (
              <div className="flex flex-wrap gap-2">
                {product.brand && (
                  <div className="bg-amber-100 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold">
                    {product.brand}
                  </div>
                )}
                {product.pattern && (
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold">
                    {product.pattern}
                  </div>
                )}
              </div>
            )}

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <StarRating rating={avgRating} size="md" showNumber />
                <span className="text-sm text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl p-6 border-2 border-amber-300 shadow-lg">
              <p className="text-gray-600 text-sm mb-2 font-medium">Price</p>
              {product.offerPrice ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-amber-600">{product.offerPrice}</span>
                    <span className="text-lg line-through text-gray-500">{product.price}</span>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm font-bold text-red-600">Save {discount}%</p>
                  )}
                </div>
              ) : product.price ? (
                <span className="text-4xl font-black text-amber-600">{product.price}</span>
              ) : (
                <p className="text-gray-600 text-lg font-semibold">Contact for pricing</p>
              )}
              {pricing?.unitPrice && (
                <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-amber-200">
                  Volume pricing available: {formatPrice(pricing.unitPrice)}/unit
                </p>
              )}
            </div>

            {/* Size Selector */}
            {tireSpecs.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800">Select Size:</label>
                <div className="grid grid-cols-2 gap-2">
                  {tireSpecs.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all border-2 ${selectedSize?.size === size.size
                        ? "bg-amber-500 text-white border-amber-600 shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:border-amber-400 hover:bg-amber-50"
                        }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-gray-800 font-bold">Quantity:</span>
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <FaMinus className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-0 focus:outline-none focus:ring-0 text-gray-800 font-bold text-lg"
                  min="1"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <FaPlus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <button
                onClick={handleRequestQuote}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaEnvelope />
                Request Quote
              </button> 
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {product.tags.slice(0, 5).map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QUICK SPECS */}
        {currentSpec && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-lg mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
              Quick Specifications - {currentSpec.size}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-gray-50 rounded-xl p-4 border border-amber-200">
                <p className="text-xs text-gray-600 font-medium mb-1">Tire Size</p>
                <p className="text-lg font-black text-gray-900">{currentSpec.size}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                <p className="text-xs text-gray-600 font-medium mb-1">Load Index</p>
                <p className="text-lg font-black text-gray-900">{currentSpec.loadIndex || "—"}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                <p className="text-xs text-gray-600 font-medium mb-1">Speed Rating</p>
                <p className="text-lg font-black text-gray-900">{currentSpec.speedRating || "—"}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                <p className="text-xs text-gray-600 font-medium mb-1">Load Range</p>
                <p className="text-lg font-black text-gray-900">{currentSpec.loadRange || "—"}</p>
              </div>
              {currentSpec.plyRating && (
                <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                  <p className="text-xs text-gray-600 font-medium mb-1">Ply Rating</p>
                  <p className="text-lg font-black text-gray-900">{currentSpec.plyRating}</p>
                </div>
              )}
              {currentSpec.weight && (
                <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                  <p className="text-xs text-gray-600 font-medium mb-1">Weight</p>
                  <p className="text-lg font-black text-gray-900">{currentSpec.weight}</p>
                </div>
              )}
              {currentSpec.productCode && (
                <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                  <p className="text-xs text-gray-600 font-medium mb-1">Product Code</p>
                  <p className="text-lg font-black text-gray-900">{currentSpec.productCode}</p>
                </div>
              )}
              {currentSpec.treadDepth && (
                <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                  <p className="text-xs text-gray-600 font-medium mb-1">Tread Depth</p>
                  <p className="text-lg font-black text-gray-900">{currentSpec.treadDepth}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TABS SECTION */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50">
            {[
              { id: "specs", label: "Specifications", icon: "📊" },
              { id: "sizes", label: `All Sizes (${tireSpecs.length})`, icon: "📏" },
              { id: "reviews", label: `Reviews (${reviews.length})`, icon: "⭐" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                  ? "text-amber-600 border-b-4 border-amber-500 bg-white"
                  : "text-gray-600 hover:text-amber-500 border-b-4 border-transparent"
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">

            {/* SPECIFICATIONS TAB */}
            {activeTab === "specs" && (
              <div className="space-y-8">

                {/* Classification */}
                {(tireType || vehicleType?.length > 0 || application?.length > 0) && (
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                      <span className="w-2 h-7 bg-amber-500 rounded-full"></span>
                      Classification
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {tireType && (
                        <div className="bg-gradient-to-br from-amber-50 to-gray-50 rounded-xl p-4 border-2 border-amber-200">
                          <p className="text-xs text-gray-600 font-bold mb-2 uppercase">Tire Type</p>
                          <p className="text-lg font-black text-amber-700">{getTireTypeLabel(tireType)}</p>
                        </div>
                      )}
                      {vehicleType?.length > 0 && (
                        <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                          <p className="text-xs text-gray-600 font-bold mb-2 uppercase">Vehicle Type</p>
                          <div className="space-y-1">
                            {vehicleType.slice(0, 2).map((vt, idx) => (
                              <p key={idx} className="text-sm font-bold text-gray-900">{getVehicleTypeLabel(vt)}</p>
                            ))}
                            {vehicleType.length > 2 && <p className="text-xs text-gray-500">+{vehicleType.length - 2} more</p>}
                          </div>
                        </div>
                      )}
                      {application?.length > 0 && (
                        <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                          <p className="text-xs text-gray-600 font-bold mb-2 uppercase">Application</p>
                          <div className="space-y-1">
                            {application.slice(0, 2).map((app, idx) => (
                              <p key={idx} className="text-sm font-bold text-gray-900">{getApplicationLabel(app)}</p>
                            ))}
                            {application.length > 2 && <p className="text-xs text-gray-500">+{application.length - 2} more</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Detailed Specs */}
                {currentSpec && (
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                      <span className="w-2 h-7 bg-amber-500 rounded-full"></span>
                      Detailed Specifications
                    </h3>
                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        <SpecRow label="Tire Size" value={currentSpec.size} />
                        <SpecRow label="Product Code" value={currentSpec.productCode} />
                        <SpecRow label="Ply Rating" value={currentSpec.plyRating} unit="PR" />
                        <SpecRow label="Load Range" value={currentSpec.loadRange} />
                        <SpecRow label="Load Index" value={currentSpec.loadIndex} />
                        <SpecRow label="Speed Rating" value={currentSpec.speedRating} />
                        <SpecRow label="Overall Diameter" value={currentSpec.overallDiameter} unit="inch" />
                        <SpecRow label="Section Width" value={currentSpec.sectionWidth} unit="inch" />
                        <SpecRow label="Tread Depth" value={currentSpec.treadDepth} unit="32nds" />
                        <SpecRow label="Standard Rim" value={currentSpec.stdRim} />
                        <SpecRow label="Single Max Load" value={currentSpec.singleMaxLoad} />
                        <SpecRow label="Single Max Pressure" value={currentSpec.singleMaxPressure} unit="psi" />
                        <SpecRow label="Dual Max Load" value={currentSpec.dualMaxLoad} />
                        <SpecRow label="Dual Max Pressure" value={currentSpec.dualMaxPressure} unit="psi" />
                        <SpecRow label="Static Load Radius" value={currentSpec.staticLoadRadius} unit="inch" />
                        <SpecRow label="Revs per Km" value={currentSpec.revsPerKm} />
                        <SpecRow label="Weight" value={currentSpec.weight} unit={currentSpec.weightUnit || "lbs"} />
                        <SpecRow label="Construction" value={
                          currentSpec.constructionType === "TL" ? "Tubeless" :
                            currentSpec.constructionType === "TT" ? "Tube Type" :
                              currentSpec.constructionType || "—"
                        } />
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                      <span className="w-2 h-7 bg-amber-500 rounded-full"></span>
                      Description
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Downloads */}
                {(product.resources?.brochure?.url || product.resources?.datasheet?.url) && (
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                      <span className="w-2 h-7 bg-amber-500 rounded-full"></span>
                      Downloads
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {product.resources?.brochure?.url && (
                        <a
                          href={product.resources.brochure.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold transition-all border border-amber-300 shadow-md hover:shadow-lg"
                        >
                          <FaFilePdf className="w-5 h-5" />
                          Download Brochure
                        </a>
                      )}
                      {product.resources?.datasheet?.url && (
                        <a
                          href={product.resources.datasheet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-bold transition-all border border-gray-400 shadow-md hover:shadow-lg"
                        >
                          <FaFilePdf className="w-5 h-5" />
                          Download Datasheet
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ALL SIZES TAB */}
            {activeTab === "sizes" && (
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-2 h-7 bg-amber-500 rounded-full"></span>
                  All Available Sizes
                </h3>
                <SpecificationsTable tireSpecs={tireSpecs} />
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div className="space-y-6">

                {reviews.length > 0 ? (
                  <>
                    {/* Rating Summary */}
                    <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl p-8 border-2 border-amber-300 text-center">
                      <div className="text-5xl font-black text-amber-600 mb-2">{avgRating.toFixed(1)}</div>
                      <StarRating rating={avgRating} size="md" />
                      <p className="text-gray-700 font-bold mt-2">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.map((review, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{review.username || "Anonymous"}</p>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                            {review.verified && (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold">
                                <FaCheckCircle className="w-4 h-4" /> Verified
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 text-base leading-relaxed">{review.text}</p>
                          <div className="flex gap-4 mt-4 text-xs text-gray-600 font-medium">
                            {review.location && <span>📍 {review.location}</span>}
                            {review.date && <span>📅 {new Date(review.date).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="text-6xl mb-4">⭐</div>
                    <p className="text-2xl font-black text-gray-900 mb-1">No reviews yet</p>
                    <p className="text-gray-600 font-medium">Be the first to share your experience</p>
                  </div>
                )}

                {/* Write Review Form */}
                <div className="bg-gradient-to-br from-amber-50 to-gray-50 rounded-2xl p-8 border-2 border-amber-200">
                  <h3 className="text-xl font-black text-gray-900 mb-5">Share Your Experience</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Your name *"
                        value={reviewForm.username}
                        onChange={(e) => setReviewForm({ ...reviewForm, username: e.target.value })}
                        className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-amber-500 font-medium"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Location (optional)"
                        value={reviewForm.location}
                        onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                        className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-amber-500 font-bold bg-white"
                    >
                      {[5, 4, 3, 2, 1].map(r => (
                        <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Your review *"
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                      rows={4}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-amber-500 font-medium resize-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-3.5 rounded-lg text-lg font-black transition-all shadow-lg hover:shadow-xl"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/product?id=${related.id}`}
                  className="bg-white rounded-xl p-3 hover:shadow-2xl transition-all border border-gray-200 group hover:border-amber-300 hover:scale-105 transform"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg overflow-hidden mb-3 border border-gray-200">
                    <img
                      src={related.image?.url || related.image}
                      alt={related.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-2"
                    />
                  </div>
                  <p className="text-xs font-black text-gray-900 truncate">{related.name}</p>
                  {normalizeTireSpecs(related.tireSpecs)[0]?.size && (
                    <p className="text-xs text-gray-600 font-semibold">{normalizeTireSpecs(related.tireSpecs)[0].size}</p>
                  )}
                  <p className="text-sm font-black text-amber-600 mt-2">
                    {related.offerPrice || related.price || "Contact"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-50"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-4xl w-full">
            <img
              src={selectedImage || product.image?.url || product.image}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Main export with Suspense
export default function ProductDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    }>
      <ProductDetailsContent />
    </Suspense>
  );
}