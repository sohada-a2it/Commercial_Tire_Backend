// app/components/ProductDetailsNew.jsx
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
} from "react-icons/fa";
import { ShoppingCart, Download, ExternalLink, Share2, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import dataService from "@/services/dataService";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/structuredData";
import { ProductDetailsPageSkeleton } from "@/components/shared/RouteSkeletons";

// Parse price helper
const parsePrice = (priceStr) => {
  if (!priceStr) return null;
  const cleaned = (priceStr + "").replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
};

// Star rating component
const StarRating = ({ rating = 0, size = "sm" }) => {
  const sizeClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className={`${sizeClass} text-amber-400`} />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className={`${sizeClass} text-amber-400`} />);
    } else {
      stars.push(<FaRegStar key={i} className={`${sizeClass} text-amber-400`} />);
    }
  }
  return <div className="flex gap-0.5">{stars}</div>;
};

// Tire Type Badge Component
const TireTypeBadge = ({ tireType }) => {
  const types = {
    steer: { label: "Steer Tire", color: "bg-blue-100 text-blue-800 border-blue-200" },
    drive: { label: "Drive Tire", color: "bg-green-100 text-green-800 border-green-200" },
    trailer: { label: "Trailer Tire", color: "bg-purple-100 text-purple-800 border-purple-200" },
    "all-position": { label: "All-Position Tire", color: "bg-teal-100 text-teal-800 border-teal-200" },
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

// Spec Table Row Component
const SpecTableRow = ({ label, value, unit = "" }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="col-span-1 font-medium text-gray-600 flex items-center gap-2">
        {label}
      </div>
      <div className="col-span-2 text-gray-800 font-medium">
        {value} {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
};

// Info Card Component
const InfoCard = ({ icon: Icon, title, value, color = "teal" }) => {
  const colorClasses = {
    teal: "bg-teal-50 border-teal-200",
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    orange: "bg-orange-50 border-orange-200",
    purple: "bg-purple-50 border-purple-200",
  };
  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 text-${color}-600`} />
        <span className="text-xs text-gray-500 uppercase tracking-wide">{title}</span>
      </div>
      <p className="text-lg font-bold text-gray-800">{value || "—"}</p>
    </div>
  );
};

// Tab Component
const TabButton = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap ${
      active
        ? "text-teal-600 border-b-2 border-teal-600"
        : "text-gray-500 hover:text-teal-600 border-b-2 border-transparent"
    }`}
  >
    {icon && <span className="text-base">{icon}</span>}
    <span className="text-sm md:text-base">{children}</span>
  </button>
);

// Pricing Tier Table
const PricingTierTable = ({ tiers }) => {
  if (!tiers || tiers.length === 0) return null;
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity Range</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Note</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, idx) => (
            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-800">
                {tier.minQuantity !== undefined && (
                  <>
                    {tier.minQuantity} {tier.maxQuantity ? `- ${tier.maxQuantity}` : "+"} pcs
                  </>
                )}
                {tier.minWeight !== undefined && (
                  <>
                    {tier.minWeight}g - {tier.maxWeight}g
                  </>
                )}
              </td>
              <td className="py-3 px-4 text-right font-bold text-teal-700">
                {tier.pricePerTire || tier.pricePerKg || tier.pricePerTon || tier.pricePerUnit}
              </td>
              <td className="py-3 px-4 text-gray-500 text-sm">
                {tier.note || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Component
const ProductDetailsNew = () => {
  const { id: routeId } = useParams();
  const pathname = usePathname();
  const runtimePathMatch = String(pathname || "").match(/^\/product\/([^/]+)\/?$/i);
  const id = String(routeId || runtimePathMatch?.[1] || "");
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specifications");
  const [showLightbox, setShowLightbox] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [expandedPricing, setExpandedPricing] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch product data
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const loadProduct = async () => {
      try {
        const foundProduct = await dataService.getProductById(id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedImage(foundProduct.image?.url || foundProduct.image);
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (product?.categoryName && product?.subcategoryName) {
      const loadRelated = async () => {
        try {
          const response = await dataService.getProductsBySubcategory(
            product.categoryName,
            product.subcategoryName,
            { page: 1, limit: 12 }
          );
          const related = Array.isArray(response?.products) ? response.products : [];
          const filtered = related.filter(p => p.id !== product.id).slice(0, 6);
          setRecommendedProducts(filtered);
          setAllProducts(related);
        } catch (err) {
          console.error("Error loading related:", err);
        }
      };
      loadRelated();
    }
  }, [product?.categoryName, product?.subcategoryName, product?.id]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/products");
    }
  };

  const handleAddToCart = () => {
    const priceNum = parsePrice(product.offerPrice || product.price || "0");
    
    let moqValue = 1;
    let moqUnit = "piece";
    if (product.keyAttributes?.MOQ) {
      const moqStr = product.keyAttributes.MOQ.toString();
      const moqMatch = moqStr.match(/(\d+)\s*([a-zA-Z]+)?/);
      if (moqMatch) {
        moqValue = parseInt(moqMatch[1]);
        moqUnit = moqMatch[2] || "piece";
      }
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: priceNum,
      offerPrice: product.offerPrice,
      quantity: quantity,
      image: product.image?.url || product.image,
      category: product.categoryName || "General",
      moq: moqValue,
      moqUnit: moqUnit,
      pricingTiers: product.pricingTiers || [],
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Add wishlist logic here
  };

  if (loading) return <ProductDetailsPageSkeleton />;
  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          Browse Products
        </button>
      </div>
    </div>
  );

  // Extract tire data
  const tireSpecs = product.tireSpecs || {};
  const tireType = product.tireType;
  const vehicleTypes = product.vehicleType || product.vehicleTypesList || [];
  const applications = product.application || product.applicationsList || [];
  const reviews = product.userReviews || [];
  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews 
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
    : product.rating || 0;

  // Generate structured data
  const productSchema = generateProductSchema(product, product.categoryName, "");
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: product.categoryName || "Category", url: `/products?category=${product.categoryName}` },
    { name: product.name, url: `/product/${product.id}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-6 group transition-colors"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-sm" />
            <span className="text-sm">Back to Products</span>
          </button>

          {/* Main Product Section - Modern Card Design */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
              
              {/* Left Column - Images Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div 
                  className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => setShowLightbox(true)}
                >
                  <img
                    src={selectedImage || product.image?.url || product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all flex items-center justify-center">
                    <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all transform scale-0 group-hover:scale-100 shadow-lg">
                      <FaPlus className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                </div>
                
                {/* Thumbnails Row */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  <div
                    onClick={() => setSelectedImage(product.image?.url || product.image)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedImage === (product.image?.url || product.image)
                        ? "border-teal-500 shadow-md"
                        : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"
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
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedImage === (typeof img === 'string' ? img : img?.url)
                          ? "border-teal-500 shadow-md"
                          : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={typeof img === 'string' ? img : img?.url}
                        alt={`Thumbnail ${idx + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-5">
                {/* Tire Type Badge & Wishlist */}
                <div className="flex items-center justify-between">
                  {tireType && <TireTypeBadge tireType={tireType} />}
                  <button
                    onClick={handleWishlist}
                    className={`p-2 rounded-full transition-all ${
                      isWishlisted 
                        ? "text-red-500 bg-red-50" 
                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Product Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Brand & Pattern Chips */}
                <div className="flex flex-wrap gap-2">
                  {product.brand && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                      <FaCertificate className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-700">Brand: <span className="font-semibold text-teal-700">{product.brand}</span></span>
                    </span>
                  )}
                  {product.pattern && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                      <FaRoad className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-700">Pattern: <span className="font-semibold text-teal-700">{product.pattern}</span></span>
                    </span>
                  )}
                  {product.sku && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                      <span className="text-gray-500">SKU:</span>
                      <span className="font-mono text-xs text-gray-700">{product.sku}</span>
                    </span>
                  )}
                </div>

                {/* Price Section */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                  {product.offerPrice ? (
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl md:text-4xl font-bold text-red-600">{product.offerPrice}</span>
                      <span className="text-lg line-through text-gray-400">{product.price}</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                        SALE
                      </span>
                    </div>
                  ) : product.price ? (
                    <span className="text-3xl md:text-4xl font-bold text-teal-700">{product.price}</span>
                  ) : (
                    <span className="text-lg text-gray-500">Contact us for pricing</span>
                  )}
                  {product.priceSource && (
                    <p className="text-xs text-gray-400 mt-1">Source: {product.priceSource}</p>
                  )}
                </div>

                {/* Key Specs Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard icon={FaRuler} title="Tire Size" value={tireSpecs.size} color="teal" />
                  <InfoCard icon={FaTachometerAlt} title="Load Index" value={tireSpecs.loadIndex} color="blue" />
                  <InfoCard icon={FaTruck} title="Speed Rating" value={tireSpecs.speedRating} color="green" />
                  <InfoCard icon={FaWeightHanging} title="Ply Rating" value={tireSpecs.plyRating ? `${tireSpecs.plyRating} PR` : null} color="orange" />
                </div>

                {/* Vehicle & Application Tags */}
                {(vehicleTypes.length > 0 || applications.length > 0) && (
                  <div className="space-y-3 pt-2">
                    {vehicleTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <FaTruck className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Vehicle Type:</span>
                        {vehicleTypes.map((vt, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                            {vt}
                          </span>
                        ))}
                      </div>
                    )}
                    {applications.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <FaChartLine className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Application:</span>
                        {applications.map((app, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                            {app}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Rating */}
                {hasReviews && (
                  <div className="flex items-center gap-3 py-2">
                    <StarRating rating={avgRating} size="sm" />
                    <span className="text-sm text-gray-500">
                      ({reviews.length} verified reviews)
                    </span>
                  </div>
                )}

                {/* Short Description */}
                {product.shortDescription && (
                  <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-teal-200 pl-3">
                    {product.shortDescription}
                  </p>
                )}

                {/* Quantity & Actions */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">Quantity:</span>
                    <div className="flex items-center gap-3 border rounded-lg bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
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
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button className="bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
                      <FaEnvelope className="w-4 h-4" />
                      Get Quote
                    </button>
                  </div>

                  {/* Contact Options */}
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 border border-green-500 text-green-600 py-2 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-sm">
                      <FaWhatsapp className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button className="flex-1 border border-teal-500 text-teal-600 py-2 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-sm">
                      <FaPhone className="w-4 h-4" />
                      Call Us
                    </button>
                  </div>
                </div>

                {/* Shipping & Warranty Info */}
                <div className="flex flex-wrap gap-4 pt-3 text-xs text-gray-500 border-t border-gray-100">
                  {product.shipping && (
                    <div className="flex items-center gap-1">
                      <FaTruck className="w-3 h-3" />
                      <span>{product.shipping}</span>
                    </div>
                  )}
                  {product.packagingAndDelivery?.delivery && (
                    <div className="flex items-center gap-1">
                      <FaCheckCircle className="w-3 h-3 text-green-500" />
                      <span>Delivery: {product.packagingAndDelivery.delivery}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs Section - Modern Design */}
            <div className="border-t border-gray-200 bg-gray-50">
              {/* Tab Navigation */}
              <div className="flex overflow-x-auto border-b border-gray-200 px-6 scrollbar-thin">
                <TabButton
                  active={activeTab === "specifications"}
                  onClick={() => setActiveTab("specifications")}
                  icon="⚙️"
                >
                  Specifications
                </TabButton>
                <TabButton
                  active={activeTab === "pricing"}
                  onClick={() => setActiveTab("pricing")}
                  icon="💰"
                >
                  Pricing & MOQ
                </TabButton>
                <TabButton
                  active={activeTab === "resources"}
                  onClick={() => setActiveTab("resources")}
                  icon="📄"
                >
                  Resources
                </TabButton>
                <TabButton
                  active={activeTab === "reviews"}
                  onClick={() => setActiveTab("reviews")}
                  icon="⭐"
                >
                  Reviews ({reviews.length})
                </TabButton>
              </div>

              {/* Tab Content */}
              <div className="p-6 md:p-8">
                {/* Specifications Tab - TABLE VIEW */}
                {activeTab === "specifications" && (
                  <div className="space-y-8">
                    {/* Tire Classification Cards */}
                    {(tireType || vehicleTypes.length > 0 || applications.length > 0) && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                          Tire Classification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {tireType && (
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tire Type</p>
                              <p className="font-bold text-teal-700 text-lg">
                                {tireType === "steer" ? "Steer Tire" :
                                 tireType === "drive" ? "Drive Tire" :
                                 tireType === "trailer" ? "Trailer Tire" :
                                 tireType === "all-position" ? "All-Position Tire" :
                                 tireType === "off-road" ? "Off-Road Tire" :
                                 tireType === "mining" ? "Mining Tire" : tireType}
                              </p>
                            </div>
                          )}
                          {vehicleTypes.length > 0 && (
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vehicle Type</p>
                              <div className="flex flex-wrap gap-1">
                                {vehicleTypes.map((vt, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                    {vt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {applications.length > 0 && (
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Application</p>
                              <div className="flex flex-wrap gap-1">
                                {applications.map((app, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                    {app}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Technical Specifications Table */}
                    {Object.keys(tireSpecs).filter(k => tireSpecs[k] && k !== 'weightUnit').length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                          Technical Specifications
                        </h3>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="divide-y divide-gray-100">
                            <SpecTableRow label="Tire Size" value={tireSpecs.size} />
                            <SpecTableRow label="Load Index" value={tireSpecs.loadIndex} />
                            <SpecTableRow label="Speed Rating" value={tireSpecs.speedRating} />
                            <SpecTableRow label="Tread Pattern" value={tireSpecs.treadPattern} />
                            <SpecTableRow label="Ply Rating" value={tireSpecs.plyRating} unit="PR" />
                            <SpecTableRow label="Load Range" value={tireSpecs.loadRange} />
                            <SpecTableRow label="Construction" value={
                              tireSpecs.constructionType === "TL" ? "Tubeless" :
                              tireSpecs.constructionType === "TT" ? "Tube Type" :
                              tireSpecs.constructionType
                            } />
                            <SpecTableRow label="Standard Rim" value={tireSpecs.stdRim} unit="inch" />
                            <SpecTableRow label="Overall Diameter" value={tireSpecs.overallDiameter} />
                            <SpecTableRow label="Section Width" value={tireSpecs.sectionWidth} />
                            <SpecTableRow label="Tread Depth" value={tireSpecs.treadDepth} />
                            <SpecTableRow label="Static Load Radius" value={tireSpecs.staticLoadRadius} unit="inch" />
                            <SpecTableRow label="Revolutions per km" value={tireSpecs.revsPerKm} />
                            <SpecTableRow label="Max Load (Single)" value={tireSpecs.maxLoad || tireSpecs.singleMaxLoad} />
                            <SpecTableRow label="Max Pressure (Single)" value={tireSpecs.maxInflation || tireSpecs.singleMaxPressure} unit="psi" />
                            <SpecTableRow label="Max Load (Dual)" value={tireSpecs.dualMaxLoad} />
                            <SpecTableRow label="Max Pressure (Dual)" value={tireSpecs.dualMaxPressure} unit="psi" />
                            <SpecTableRow label="Tire Weight" value={tireSpecs.weight} unit={tireSpecs.weightUnit || "lbs"} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Key Attributes Table */}
                    {product.keyAttributes && Object.keys(product.keyAttributes).filter(k => 
                      product.keyAttributes[k] && !['MOQ', 'Pattern'].includes(k)
                    ).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                          Key Features
                        </h3>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="divide-y divide-gray-100">
                            {Object.entries(product.keyAttributes).map(([key, value]) => {
                              if (!value || key === 'MOQ' || key === 'Pattern') return null;
                              return (
                                <div key={key} className="grid grid-cols-3 py-3 px-4 hover:bg-gray-50">
                                  <div className="col-span-1 font-medium text-gray-600">{key}</div>
                                  <div className="col-span-2 text-gray-800">{value}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full Description */}
                    {product.description && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                          Product Description
                        </h3>
                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Tab */}
                {activeTab === "pricing" && (
                  <div className="space-y-6">
                    {/* Base Price Card */}
                    <div className="bg-gradient-to-r from-teal-50 to-white rounded-xl p-6 border border-teal-100">
                      <h3 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                        Base Price
                      </h3>
                      {product.offerPrice ? (
                        <div>
                          <p className="text-4xl font-bold text-red-600">{product.offerPrice}</p>
                          <p className="text-lg line-through text-gray-400 mt-1">{product.price}</p>
                        </div>
                      ) : product.price ? (
                        <p className="text-4xl font-bold text-teal-700">{product.price}</p>
                      ) : (
                        <p className="text-gray-500">Contact our sales team for best pricing</p>
                      )}
                    </div>

                    {/* Volume Pricing Table */}
                    {product.pricingTiers && product.pricingTiers.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-800 text-white px-5 py-3">
                          <h3 className="font-bold flex items-center gap-2">
                            <span>📦</span> Volume Pricing Tiers
                          </h3>
                        </div>
                        <div className="p-4">
                          <PricingTierTable tiers={expandedPricing ? product.pricingTiers : product.pricingTiers.slice(0, 4)} />
                          {product.pricingTiers.length > 4 && (
                            <button
                              onClick={() => setExpandedPricing(!expandedPricing)}
                              className="text-teal-600 text-sm font-medium hover:underline mt-4 flex items-center gap-1"
                            >
                              {expandedPricing ? "Show Less ↑" : `Show ${product.pricingTiers.length - 4} More Tiers ↓`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* MOQ Card */}
                    {product.keyAttributes?.MOQ && (
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">📋</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-800">Minimum Order Quantity (MOQ)</h3>
                            <p className="text-2xl font-bold text-blue-700">{product.keyAttributes.MOQ}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Customization Options */}
                    {product.customizationOptions && product.customizationOptions.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <span>🎨</span> Customization Options
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.customizationOptions.map((opt, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Resources Tab */}
                {activeTab === "resources" && (
                  <div className="space-y-6">
                    {(product.resources?.brochure?.url || product.resources?.datasheet?.url || product.resources?.warrantyDoc?.url) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.resources?.brochure?.url && (
                          <a
                            href={product.resources.brochure.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"
                          >
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                              <FaFilePdf className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">Product Brochure</p>
                              <p className="text-xs text-gray-400">Download PDF document</p>
                            </div>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                          </a>
                        )}
                        {product.resources?.datasheet?.url && (
                          <a
                            href={product.resources.datasheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"
                          >
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <FaFilePdf className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">Technical Datasheet</p>
                              <p className="text-xs text-gray-400">Complete technical specifications</p>
                            </div>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                          </a>
                        )}
                        {product.resources?.warrantyDoc?.url && (
                          <a
                            href={product.resources.warrantyDoc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"
                          >
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                              <FaShieldAlt className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">Warranty Information</p>
                              <p className="text-xs text-gray-400">Warranty terms and conditions</p>
                            </div>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaFilePdf className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No downloadable resources available</p>
                        <p className="text-sm text-gray-400 mt-1">Contact us for technical documentation</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {hasReviews ? (
                      <>
                        {/* Rating Summary Card */}
                        <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-6 text-center border border-amber-100">
                          <div className="text-5xl font-bold text-amber-600 mb-2">
                            {avgRating.toFixed(1)}
                          </div>
                          <StarRating rating={avgRating} size="sm" />
                          <p className="text-sm text-gray-500 mt-2">
                            Based on {reviews.length} customer reviews
                          </p>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-4">
                          {reviews.map((review, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommended Products Section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">You May Also Like</h2>
                <button 
                  onClick={() => navigate(`/products?category=${product.categoryName}`)}
                  className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  View All <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {recommendedProducts.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/product/${rec.id}`)}
                    className="bg-white rounded-xl p-3 cursor-pointer hover:shadow-xl transition-all border border-gray-100 group"
                  >
                    <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2">
                      <img
                        src={rec.image?.url || rec.image}
                        alt={rec.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-800 truncate">{rec.name}</p>
                    {rec.tireSpecs?.size && (
                      <p className="text-xs text-gray-500 mt-0.5">{rec.tireSpecs.size}</p>
                    )}
                    <p className="text-xs font-bold text-teal-700 mt-1">
                      {rec.offerPrice || rec.price || "Contact"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div onClick={(e) => e.stopPropagation()} className="relative">
            <img
              src={selectedImage || product.image?.url || product.image}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailsNew;