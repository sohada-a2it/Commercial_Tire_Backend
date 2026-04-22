// app/products/[id]/page.jsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "react-icons/fa";
import { ShoppingCart, ExternalLink } from "lucide-react";
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
    steer: { label: "Steer Tire", color: "bg-blue-100 text-blue-800" },
    drive: { label: "Drive Tire", color: "bg-green-100 text-green-800" },
    trailer: { label: "Trailer Tire", color: "bg-purple-100 text-purple-800" },
    "all-position": { label: "All-Position Tire", color: "bg-teal-100 text-teal-800" },
    "off-road": { label: "Off-Road Tire", color: "bg-orange-100 text-orange-800" },
    mining: { label: "Mining Tire", color: "bg-red-100 text-red-800" },
  };
  const type = types[tireType] || { label: tireType, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${type.color}`}>
      {type.label}
    </span>
  );
};

// Spec Table Row
const SpecRow = ({ label, value, unit = "" }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="col-span-1 font-medium text-gray-600">{label}</div>
      <div className="col-span-2 text-gray-800">
        {value} {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
};

// Info Card
const InfoCard = ({ icon: Icon, title, value, color = "teal" }) => {
  const colors = {
    teal: "bg-teal-50 border-teal-200 text-teal-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wide">{title}</span>
      </div>
      <p className="text-lg font-bold">{value || "—"}</p>
    </div>
  );
}; 

// Main Component
export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  // State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [specifications, setSpecifications] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
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
    if (!id) return;

    const loadProductData = async () => {
      setLoading(true);
      try {
        // Load all data in parallel
        const [detailsRes, specsRes, reviewsRes, pricingRes] = await Promise.all([
          fetchProductDetails(id, { includeRelated: true, limit: 6 }),
          fetchProductSpecifications(id),
          fetchProductReviews(id, { page: 1, limit: 10 }),
          fetchProductPricing(id, quantity),
        ]);

        setProduct(detailsRes.product);
        setRelatedProducts(detailsRes.relatedProducts || []);
        setSpecifications(specsRes.specifications || {});
        setReviews(reviewsRes.reviews || []);
        setPricing(pricingRes.pricing);
        setSelectedImage(detailsRes.product?.image?.url || detailsRes.product?.image);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  // Update pricing when quantity changes
  useEffect(() => {
    if (!id || quantity < 1) return;
    const updatePricing = async () => {
      const pricingRes = await fetchProductPricing(id, quantity);
      setPricing(pricingRes.pricing);
    };
    updatePricing();
  }, [quantity, id]);

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
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.username || !reviewForm.text) {
      alert("Please fill in all required fields");
      return;
    }
    setSubmittingReview(true);
    try {
      const result = await submitProductReview(id, reviewForm);
      if (result.success) {
        // Refresh reviews
        const reviewsRes = await fetchProductReviews(id);
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

  const handleRequestQuote = () => {
    router.push(`/inquiry?product=${product.id}&name=${encodeURIComponent(product.name)}`);
  };

  const handleContactDealer = () => {
    router.push("/dealers");
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

  const tireSpecs = product.tireSpecs || product.technicalSpecs || {};
  const tireType = product.tireType || product.tireClassification?.tireType;
  const vehicleType = product.vehicleType || product.tireClassification?.vehicleTypes || [];
  const application = product.application || product.tireClassification?.applications || [];
  const hasResources = product.resources?.brochure?.url || product.resources?.datasheet?.url;
  const discount = calculateDiscount(product.price || pricing?.regularPrice, product.offerPrice || pricing?.offerPrice);
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

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

        {/* ========== 2 COLUMN LAYOUT ========== */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">

            {/* LEFT COLUMN - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div
                className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer group"
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
              <div className="flex gap-3 overflow-x-auto pb-2">
                <div
                  onClick={() => setSelectedImage(product.image?.url || product.image)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === (product.image?.url || product.image)
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
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === (typeof img === 'string' ? img : img?.url)
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
            </div>

            {/* RIGHT COLUMN - Product Info */}
            <div className="space-y-5">
              {/* Tire Type Badge */}
              <div className="flex items-center justify-between">
                {tireType && <TireTypeBadge tireType={tireType} />}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isWishlisted ? (
                    <FaHeart className="w-5 h-5 text-red-500" />
                  ) : (
                    <FaRegHeart className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Model Name */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Category & Model Number */}
              <div className="flex flex-wrap gap-3 text-sm">
                {product.categoryName && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                    <FaCertificate className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Category: <span className="font-medium text-teal-700">{product.categoryName}</span></span>
                  </span>
                )}
                {product.modelNumber && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-gray-500">Model:</span>
                    <span className="font-mono text-sm text-gray-700">{product.modelNumber}</span>
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-teal-500">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {/* Quick Spec Cards */}
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={FaRuler} title="Tire Size" value={tireSpecs.size} color="teal" />
                <InfoCard icon={FaTachometerAlt} title="Load Index" value={tireSpecs.loadIndex} color="blue" />
                <InfoCard icon={FaTruck} title="Speed Rating" value={tireSpecs.speedRating} color="green" />
                <InfoCard icon={FaWeightHanging} title="Ply Rating" value={tireSpecs.plyRating ? `${tireSpecs.plyRating} PR` : null} color="orange" />
              </div>

              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 py-2">
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
                      <span className="text-3xl font-bold text-red-600">{product.offerPrice}</span>
                      <span className="text-lg line-through text-gray-400">{product.price}</span>
                      {discount > 0 && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                          Save {discount}%
                        </span>
                      )}
                    </div>
                    {pricing?.unitPrice && pricing.unitPrice !== parsePrice(product.offerPrice) && (
                      <p className="text-sm text-teal-600 mt-1">
                        Volume pricing: {formatPrice(pricing.unitPrice)}/unit
                      </p>
                    )}
                  </div>
                ) : product.price ? (
                  <div>
                    <span className="text-3xl font-bold text-teal-700">{product.price}</span>
                    {pricing?.unitPrice && pricing.unitPrice !== parsePrice(product.price) && (
                      <p className="text-sm text-teal-600 mt-1">
                        Volume pricing: {formatPrice(pricing.unitPrice)}/unit
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Contact us for best pricing</p>
                )}
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center gap-3 border rounded-lg bg-white">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-0 focus:outline-none focus:ring-0 text-gray-800"
                      min="1"
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleRequestQuote}
                    className="bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <FaEnvelope className="w-4 h-4" />
                    Request Quote
                  </button>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3">
                  <h1 className="text-amber-500">Tags:</h1>
                  {product.tags.slice(0, 5).map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========== TABS SECTION ========== */}
          <div className="border-t border-gray-200 bg-gray-50">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto border-b border-gray-200 px-6">
              {[
                { id: "specs", label: "Technical Specifications", icon: "⚙️" }, 
                { id: "reviews", label: `Reviews (${reviews.length})`, icon: "⭐" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-500 hover:text-teal-600 border-b-2 border-transparent"
                    }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="text-sm md:text-base">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">

              {/* TAB 1: Technical Specifications */}
              {activeTab === "specs" && (
                <div className="space-y-6">
                  {/* Tire Classification */}
                  {(tireType || vehicleType?.length > 0 || application?.length > 0) && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                        Tire Classification
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tireType && (
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tire Type</p>
                            <p className="font-bold text-teal-700 text-lg">
                              {getTireTypeLabel(tireType)}
                            </p>
                          </div>
                        )}
                        {vehicleType?.length > 0 && (
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vehicle Type</p>
                            <div className="flex flex-wrap gap-1">
                              {vehicleType.map((vt, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                  {getVehicleTypeLabel(vt)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {application?.length > 0 && (
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Application</p>
                            <div className="flex flex-wrap gap-1">
                              {application.map((app, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                  {getApplicationLabel(app)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Technical Specs Table */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                      Technical Specifications
                    </h3>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        <SpecRow label="Tire Size" value={tireSpecs.size} />
                        <SpecRow label="Load Index" value={tireSpecs.loadIndex} />
                        <SpecRow label="Speed Rating" value={tireSpecs.speedRating} />
                        <SpecRow label="Tread Pattern" value={tireSpecs.treadPattern || product.pattern} />
                        <SpecRow label="Ply Rating" value={tireSpecs.plyRating} unit="PR" />
                        <SpecRow label="Load Range" value={tireSpecs.loadRange} />
                        <SpecRow label="Construction" value={
                          tireSpecs.constructionType === "TL" ? "Tubeless" :
                            tireSpecs.constructionType === "TT" ? "Tube Type" : tireSpecs.constructionType
                        } />
                        <SpecRow label="Standard Rim" value={tireSpecs.stdRim} />
                        <SpecRow label="Overall Diameter" value={tireSpecs.overallDiameter} />
                        <SpecRow label="Section Width" value={tireSpecs.sectionWidth} />
                        <SpecRow label="Tread Depth" value={tireSpecs.treadDepth} />
                        <SpecRow label="Max Load (Single)" value={tireSpecs.maxLoad || tireSpecs.singleMaxLoad} />
                        <SpecRow label="Max Pressure (Single)" value={tireSpecs.maxInflation || tireSpecs.singleMaxPressure} unit="psi" />
                        <SpecRow label="Max Load (Dual)" value={tireSpecs.dualMaxLoad} />
                        <SpecRow label="Max Pressure (Dual)" value={tireSpecs.dualMaxPressure} unit="psi" />
                        <SpecRow label="Tire Weight" value={tireSpecs.weight} unit={tireSpecs.weightUnit || "lbs"} />
                        <SpecRow label="Revs per km" value={tireSpecs.revsPerKm} />
                      </div>
                    </div>
                  </div>

                  {/* Full Description */}
                  {product.description && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                        Product Description
                      </h3>
                      <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )} 

              {/* TAB 3: Reviews */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    <>
                      {/* Rating Summary */}
                      <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-6 text-center border border-amber-100">
                        <div className="text-5xl font-bold text-amber-600 mb-2">
                          {avgRating.toFixed(1)}
                        </div>
                        <StarRating rating={avgRating} size="lg" />
                        <p className="text-sm text-gray-500 mt-2">
                          Based on {reviews.length} customer reviews
                        </p>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {reviews.map((review, idx) => (
                          <div key={idx} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-gray-800">{review.username || "Anonymous"}</p>
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                              {review.verified && (
                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  <FaCheckCircle className="w-3 h-3" /> Verified
                                </span>
                              )}
                            </div>
                            {review.title && (
                              <p className="font-medium text-gray-800 mb-2">{review.title}</p>
                            )}
                            <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
                            {review.location && (
                              <p className="text-xs text-gray-400 mt-2">📍 {review.location}</p>
                            )}
                            {review.date && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(review.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                      <div className="text-6xl mb-4">⭐</div>
                      <p className="text-lg font-medium text-gray-800">No reviews yet</p>
                      <p className="text-sm text-gray-500 mt-1">Be the first to review this product</p>
                    </div>
                  )}

                  {/* Write Review Form */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Your name *"
                          value={reviewForm.username}
                          onChange={(e) => setReviewForm({ ...reviewForm, username: e.target.value })}
                          className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Your location (optional)"
                          value={reviewForm.location}
                          onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                          className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                          className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                        >
                          {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        placeholder="Your review *"
                        value={reviewForm.text}
                        onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                        rows={4}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
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
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/product/${related.id}`}
                  className="bg-white rounded-xl p-3 hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2">
                    <img
                      src={related.image?.url || related.image}
                      alt={related.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 truncate">{related.name}</p>
                  {related.tireSpecs?.size && (
                    <p className="text-xs text-gray-500 mt-0.5">{related.tireSpecs.size}</p>
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