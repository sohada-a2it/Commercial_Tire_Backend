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

  const handleRequestQuote = () => {
    const productName = encodeURIComponent(product.name);
    const productModel = product.modelNumber ? encodeURIComponent(product.modelNumber) : "";
    router.push(`/inquiry?product=${productId}&name=${productName}&model=${productModel}`);
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/products")}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-6 group transition-colors"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-sm" />
          <span className="text-sm">Back to Products</span>
        </button>

        {/* Main Product Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8">

            {/* LEFT COLUMN - Images */}
            <div className="space-y-4">
              <div
                className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setShowLightbox(true)}
              >
                <img
                  src={selectedImage || product.image?.url || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all transform scale-0 group-hover:scale-100 shadow-lg">
                    <FaPlus className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {(product.images?.length > 0 || product.image) && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <div
                    onClick={() => setSelectedImage(product.image?.url || product.image)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === (product.image?.url || product.image)
                        ? "border-teal-500 shadow-md"
                        : "border-gray-200 opacity-60 hover:opacity-100"
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
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === (typeof img === 'string' ? img : img?.url)
                          ? "border-teal-500 shadow-md"
                          : "border-gray-200 opacity-60 hover:opacity-100"
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

            {/* RIGHT COLUMN - Product Info */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  {tireType && <TireTypeBadge tireType={tireType} />}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  {product.modelNumber && (
                    <p className="text-sm text-gray-500 font-mono">Model: {product.modelNumber}</p>
                  )}
                </div>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <div className="bg-teal-50/30 rounded-lg p-3 border-l-3 border-teal-500">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {/* Brand & Pattern */}
              <div className="flex flex-wrap gap-3 text-sm">
                {product.brand && (
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-gray-500">Brand:</span>
                    <span className="font-medium text-gray-800 ml-1">{product.brand}</span>
                  </div>
                )}
                {product.pattern && (
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-gray-500">Pattern:</span>
                    <span className="font-medium text-gray-800 ml-1">{product.pattern}</span>
                  </div>
                )}
              </div>

              {/* Size Selector (if multiple sizes) */}
              {tireSpecs.length > 1 && (
                <SizeSelector
                  sizes={tireSpecs}
                  selectedSize={selectedSize}
                  onSelect={setSelectedSize}
                />
              )}

              {/* Quick Specs for selected size */}
              {currentSpec && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <InfoCard icon={FaRuler} title="Tire Size" value={currentSpec.size} />
                  <InfoCard icon={FaTachometerAlt} title="Load Index" value={currentSpec.loadIndex} />
                  <InfoCard icon={FaTruck} title="Speed Rating" value={currentSpec.speedRating} />
                  <InfoCard icon={FaTag} title="Load Range" value={currentSpec.loadRange} />
                  <InfoCard icon={FaChartLine} title="Ply Rating" value={currentSpec.plyRating} suffix="PR" />
                  <InfoCard icon={FaWeightHanging} title="Weight" value={currentSpec.weight} suffix={currentSpec.weightUnit || "lbs"} />
                  {currentSpec.productCode && (
                    <InfoCard icon={FaBox} title="Product Code" value={currentSpec.productCode} />
                  )}
                </div>
              )}

              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 py-1">
                  <StarRating rating={avgRating} size="md" showNumber />
                  <span className="text-sm text-gray-500">
                    ({reviews.length} reviews)
                  </span>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gradient-to-r from-teal-50 to-white rounded-xl p-4 border border-teal-100">
                {product.offerPrice ? (
                  <div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-2xl font-bold text-red-600">{product.offerPrice}</span>
                      <span className="text-base line-through text-gray-400">{product.price}</span>
                      {discount > 0 && (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
                          Save {discount}%
                        </span>
                      )}
                    </div>
                    {pricing?.unitPrice && pricing.unitPrice !== parsePrice(product.offerPrice) && (
                      <p className="text-xs text-teal-600 mt-1">
                        Volume pricing: {formatPrice(pricing.unitPrice)}/unit
                      </p>
                    )}
                  </div>
                ) : product.price ? (
                  <div>
                    <span className="text-2xl font-bold text-teal-700">{product.price}</span>
                    {pricing?.unitPrice && pricing.unitPrice !== parsePrice(product.price) && (
                      <p className="text-xs text-teal-600 mt-1">
                        Volume pricing: {formatPrice(pricing.unitPrice)}/unit
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Contact us for best pricing</p>
                )}
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium text-sm">Quantity:</span>
                  <div className="flex items-center gap-3 border rounded-lg bg-white">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors rounded-l-lg"
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-0 focus:outline-none focus:ring-0 text-gray-800 text-sm"
                      min="1"
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors rounded-r-lg"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleRequestQuote}
                    className="bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <FaEnvelope className="w-4 h-4" />
                    Request Quote
                  </button>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {product.tags.slice(0, 5).map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TABS SECTION */}
          <div className="border-t border-gray-200 bg-gray-50">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto border-b border-gray-200 px-6">
              {[
                { id: "specs", label: "Specifications", icon: "📊" },
                { id: "sizes", label: `All Sizes (${tireSpecs.length})`, icon: "📏" },
                { id: "reviews", label: `Reviews (${reviews.length})`, icon: "⭐" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === tab.id
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-500 hover:text-teal-600 border-b-2 border-transparent"
                    }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">

              {/* TAB 1: Technical Specifications */}
              {activeTab === "specs" && (
                <div className="space-y-5">
                  {/* Tire Classification */}
                  {(tireType || vehicleType?.length > 0 || application?.length > 0) && (
                    <div>
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
                        Classification
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {tireType && (
                          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                            <p className="text-xs text-gray-500">Tire Type</p>
                            <p className="font-semibold text-teal-700 text-sm">{getTireTypeLabel(tireType)}</p>
                          </div>
                        )}
                        {vehicleType?.length > 0 && (
                          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                            <p className="text-xs text-gray-500">Vehicle</p>
                            <div className="flex flex-wrap gap-1">
                              {vehicleType.slice(0, 2).map((vt, idx) => (
                                <span key={idx} className="text-xs text-gray-700">{getVehicleTypeLabel(vt)}</span>
                              ))}
                              {vehicleType.length > 2 && <span className="text-xs text-gray-400">+{vehicleType.length - 2}</span>}
                            </div>
                          </div>
                        )}
                        {application?.length > 0 && (
                          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                            <p className="text-xs text-gray-500">Application</p>
                            <div className="flex flex-wrap gap-1">
                              {application.slice(0, 2).map((app, idx) => (
                                <span key={idx} className="text-xs text-gray-700">{getApplicationLabel(app)}</span>
                              ))}
                              {application.length > 2 && <span className="text-xs text-gray-400">+{application.length - 2}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Current Size Detailed Specs */}
                  {currentSpec && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                          <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
                          Specifications for {currentSpec.size}
                        </h3>
                        {tireSpecs.length > 1 && (
                          <button
                            onClick={() => setActiveTab("sizes")}
                            className="text-xs text-teal-600 hover:text-teal-700"
                          >
                            View all sizes →
                          </button>
                        )}
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="divide-y divide-gray-100 ml-6">
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
                          <SpecRow label="Max Load" value={currentSpec.maxLoad} />
                          <SpecRow label="Max Inflation Pressure" value={currentSpec.maxInflation} unit="psi" />
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

                  {/* Full Description */}
                  {product.description && (
                    <div>
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
                        Description
                      </h3>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resources/Downloads */}
                  {(product.resources?.brochure?.url || product.resources?.datasheet?.url) && (
                    <div>
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
                        Downloads
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {product.resources?.brochure?.url && (
                          <a
                            href={product.resources.brochure.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition"
                          >
                            <FaFilePdf className="w-4 h-4 text-red-500" />
                            <span className="text-sm">Brochure</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        )}
                        {product.resources?.datasheet?.url && (
                          <a
                            href={product.resources.datasheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition"
                          >
                            <FaFilePdf className="w-4 h-4 text-red-500" />
                            <span className="text-sm">Data Sheet</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: All Sizes Table */}
              {activeTab === "sizes" && (
                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
                    All Available Sizes
                  </h3>
                  <SpecificationsTable tireSpecs={tireSpecs} />
                </div>
              )}

              {/* TAB 3: Reviews */}
              {activeTab === "reviews" && (
                <div className="space-y-5">
                  {reviews.length > 0 ? (
                    <>
                      <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-4 text-center border border-amber-100">
                        <div className="text-3xl font-bold text-amber-600 mb-1">
                          {avgRating.toFixed(1)}
                        </div>
                        <StarRating rating={avgRating} size="md" />
                        <p className="text-xs text-gray-500 mt-1">
                          Based on {reviews.length} reviews
                        </p>
                      </div>

                      <div className="space-y-3">
                        {reviews.map((review, idx) => (
                          <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{review.username || "Anonymous"}</p>
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                              {review.verified && (
                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  <FaCheckCircle className="w-3 h-3" /> Verified
                                </span>
                              )}
                            </div>
                            {review.title && (
                              <p className="font-medium text-gray-800 text-sm mb-1">{review.title}</p>
                            )}
                            <p className="text-gray-600 text-xs leading-relaxed">{review.text}</p>
                            <div className="flex gap-3 mt-2 text-xs text-gray-400">
                              {review.location && <span>📍 {review.location}</span>}
                              {review.date && <span>📅 {new Date(review.date).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                      <div className="text-4xl mb-2">⭐</div>
                      <p className="font-medium text-gray-800">No reviews yet</p>
                      <p className="text-xs text-gray-500 mt-1">Be the first to review this product</p>
                    </div>
                  )}

                  {/* Write Review Form */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 mt-4">
                    <h3 className="font-bold text-gray-800 mb-3">Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Your name *"
                          value={reviewForm.username}
                          onChange={(e) => setReviewForm({ ...reviewForm, username: e.target.value })}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Location (optional)"
                          value={reviewForm.location}
                          onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                      >
                        {[5, 4, 3, 2, 1].map(r => (
                          <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      <textarea
                        placeholder="Your review *"
                        value={reviewForm.text}
                        onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/products?id=${related.id}`}
                  className="bg-white rounded-xl p-2 hover:shadow-lg transition-all border border-gray-100 group"
                >
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2">
                    <img
                      src={related.image?.url || related.image}
                      alt={related.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 truncate">{related.name}</p>
                  {normalizeTireSpecs(related.tireSpecs)[0]?.size && (
                    <p className="text-xs text-gray-500">{normalizeTireSpecs(related.tireSpecs)[0].size}</p>
                  )}
                  <p className="text-xs font-bold text-teal-700 mt-1">
                    {related.offerPrice || related.price || "Contact"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage || product.image?.url || product.image}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    }>
      <ProductDetailsContent />
    </Suspense>
  );
}