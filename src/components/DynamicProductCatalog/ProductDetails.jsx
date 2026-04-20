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
} from "react-icons/fa";
import { ShoppingCart, Download, ExternalLink } from "lucide-react";
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

// Spec Card Component
const SpecCard = ({ label, value, unit = "" }) => {
  if (!value) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-teal-800">
        {value} {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </p>
    </div>
  );
};

// Tab Component
const TabButton = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 font-semibold transition-all relative flex items-center gap-2 ${
      active
        ? "text-teal-600 border-b-2 border-teal-600"
        : "text-gray-600 hover:text-teal-600"
    }`}
  >
    {icon && <span className="text-lg">{icon}</span>}
    <span className="text-sm md:text-base">{children}</span>
  </button>
);

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
        console.log("Loaded product:", foundProduct);
        
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
          // Filter out current product and limit to 6
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

  if (loading) return <ProductDetailsPageSkeleton />;
  if (!product) return <div className="text-center py-20">Product not found</div>;

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

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-6 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Products</span>
          </button>

          {/* Main Product Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              
              {/* Left Column - Images */}
              <div className="space-y-4">
                <div 
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setShowLightbox(true)}
                >
                  <img
                    src={selectedImage || product.image?.url || product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all transform scale-0 group-hover:scale-100">
                      <FaPlus className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                </div>
                
                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <img
                    src={product.image?.url || product.image}
                    alt="Main"
                    onClick={() => setSelectedImage(product.image?.url || product.image)}
                    className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                      selectedImage === (product.image?.url || product.image)
                        ? "border-teal-500"
                        : "border-gray-200 opacity-60 hover:opacity-100"
                    }`}
                  />
                  {(product.images || []).map((img, idx) => (
                    <img
                      key={idx}
                      src={typeof img === 'string' ? img : img?.url}
                      alt={`Thumbnail ${idx + 2}`}
                      onClick={() => setSelectedImage(typeof img === 'string' ? img : img?.url)}
                      className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                        selectedImage === (typeof img === 'string' ? img : img?.url)
                          ? "border-teal-500"
                          : "border-gray-200 opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-5">
                {/* Tire Type Badge */}
                {tireType && (
                  <div>
                    <TireTypeBadge tireType={tireType} />
                  </div>
                )}

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {product.name}
                </h1>

                {/* Brand & Pattern */}
                <div className="flex flex-wrap gap-3 text-sm">
                  {product.brand && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full">
                      Brand: <span className="font-semibold text-teal-700">{product.brand}</span>
                    </span>
                  )}
                  {product.pattern && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full">
                      Pattern: <span className="font-semibold text-teal-700">{product.pattern}</span>
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="border-t border-b border-gray-100 py-4">
                  {product.offerPrice ? (
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-red-600">{product.offerPrice}</span>
                        <span className="text-lg line-through text-gray-400">{product.price}</span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                          SALE
                        </span>
                      </div>
                    </div>
                  ) : product.price ? (
                    <span className="text-3xl font-bold text-teal-700">{product.price}</span>
                  ) : (
                    <span className="text-gray-500">Price on Request</span>
                  )}
                </div>

                {/* Quick Specs Row */}
                <div className="grid grid-cols-2 gap-3">
                  {tireSpecs.size && (
                    <div className="bg-teal-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-teal-600">Tire Size</p>
                      <p className="font-bold text-teal-800">{tireSpecs.size}</p>
                    </div>
                  )}
                  {tireSpecs.loadIndex && (
                    <div className="bg-teal-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-teal-600">Load Index</p>
                      <p className="font-bold text-teal-800">{tireSpecs.loadIndex}</p>
                    </div>
                  )}
                  {tireSpecs.speedRating && (
                    <div className="bg-teal-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-teal-600">Speed Rating</p>
                      <p className="font-bold text-teal-800">{tireSpecs.speedRating}</p>
                    </div>
                  )}
                  {tireSpecs.plyRating && (
                    <div className="bg-teal-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-teal-600">Ply Rating</p>
                      <p className="font-bold text-teal-800">{tireSpecs.plyRating} PR</p>
                    </div>
                  )}
                </div>

                {/* Vehicle & Application Info */}
                {(vehicleTypes.length > 0 || applications.length > 0) && (
                  <div className="space-y-2">
                    {vehicleTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <FaTruck className="text-gray-400" />
                        <span className="text-sm text-gray-600">Vehicle Type:</span>
                        {vehicleTypes.map((vt, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {vt}
                          </span>
                        ))}
                      </div>
                    )}
                    {applications.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <FaChartLine className="text-gray-400" />
                        <span className="text-sm text-gray-600">Application:</span>
                        {applications.map((app, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                            {app}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Rating */}
                {hasReviews && (
                  <div className="flex items-center gap-3">
                    <StarRating rating={avgRating} size="sm" />
                    <span className="text-sm text-gray-500">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                )}

                {/* Short Description */}
                {product.shortDescription && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}

                {/* Quantity & Add to Cart */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700">Quantity:</span>
                    <div className="flex items-center gap-3 border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <FaMinus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-0 focus:outline-none"
                        min="1"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>

                  {/* Inquiry Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 border border-teal-600 text-teal-600 py-2 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2">
                      <FaEnvelope className="w-4 h-4" />
                      Inquiry
                    </button>
                    <button className="flex-1 border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                      <FaWhatsapp className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="border-t border-gray-200">
              {/* Tab Navigation */}
              <div className="flex overflow-x-auto border-b border-gray-200 px-6">
                <TabButton
                  active={activeTab === "specifications"}
                  onClick={() => setActiveTab("specifications")}
                  icon="⚙️"
                >
                  Technical Specifications
                </TabButton>
                <TabButton
                  active={activeTab === "pricing"}
                  onClick={() => setActiveTab("pricing")}
                  icon="💰"
                >
                  Pricing
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
                  Reviews
                </TabButton>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Specifications Tab */}
                {activeTab === "specifications" && (
                  <div className="space-y-6">
                    {/* Tire Classification */}
                    {(tireType || vehicleTypes.length > 0 || applications.length > 0) && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-teal-500 pl-3">
                          Tire Classification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {tireType && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-500 mb-1">Tire Type</p>
                              <p className="font-semibold text-teal-800">
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
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-500 mb-1">Vehicle Type</p>
                              <p className="font-semibold text-teal-800">
                                {vehicleTypes.join(", ")}
                              </p>
                            </div>
                          )}
                          {applications.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-500 mb-1">Application</p>
                              <p className="font-semibold text-teal-800">
                                {applications.join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Technical Specifications */}
                    {Object.keys(tireSpecs).filter(k => tireSpecs[k] && ![
                      'size', 'loadIndex', 'speedRating', 'treadPattern', 'plyRating',
                      'loadRange', 'stdRim', 'overallDiameter', 'sectionWidth', 'treadDepth',
                      'maxLoad', 'maxInflation', 'constructionType'
                    ].includes(k)).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-teal-500 pl-3">
                          Technical Specifications
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <SpecCard label="Tire Size" value={tireSpecs.size} />
                          <SpecCard label="Load Index" value={tireSpecs.loadIndex} />
                          <SpecCard label="Speed Rating" value={tireSpecs.speedRating} />
                          <SpecCard label="Tread Pattern" value={tireSpecs.treadPattern} />
                          <SpecCard label="Ply Rating" value={tireSpecs.plyRating} unit="PR" />
                          <SpecCard label="Load Range" value={tireSpecs.loadRange} />
                          <SpecCard label="Construction" value={
                            tireSpecs.constructionType === "TL" ? "Tubeless" :
                            tireSpecs.constructionType === "TT" ? "Tube Type" :
                            tireSpecs.constructionType
                          } />
                        </div>
                      </div>
                    )}

                    {/* Dimensions */}
                    {(tireSpecs.stdRim || tireSpecs.overallDiameter || tireSpecs.sectionWidth || tireSpecs.treadDepth) && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-teal-500 pl-3">
                          Dimensions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <SpecCard label="Standard Rim" value={tireSpecs.stdRim} unit="inch" />
                          <SpecCard label="Overall Diameter" value={tireSpecs.overallDiameter} />
                          <SpecCard label="Section Width" value={tireSpecs.sectionWidth} />
                          <SpecCard label="Tread Depth" value={tireSpecs.treadDepth} />
                          <SpecCard label="Static Load Radius" value={tireSpecs.staticLoadRadius} unit="inch" />
                          <SpecCard label="Revs per km" value={tireSpecs.revsPerKm} />
                        </div>
                      </div>
                    )}

                    {/* Load & Pressure */}
                    {(tireSpecs.maxLoad || tireSpecs.maxInflation || tireSpecs.singleMaxLoad || tireSpecs.dualMaxLoad) && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-teal-500 pl-3">
                          Load & Pressure Ratings
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <SpecCard label="Max Load (Single)" value={tireSpecs.maxLoad || tireSpecs.singleMaxLoad} />
                          <SpecCard label="Max Pressure (Single)" value={tireSpecs.maxInflation || tireSpecs.singleMaxPressure} unit="psi" />
                          <SpecCard label="Max Load (Dual)" value={tireSpecs.dualMaxLoad} />
                          <SpecCard label="Max Pressure (Dual)" value={tireSpecs.dualMaxPressure} unit="psi" />
                          <SpecCard label="Tire Weight" value={tireSpecs.weight} unit={tireSpecs.weightUnit || "lbs"} />
                        </div>
                      </div>
                    )}

                    {/* Full Description */}
                    {product.description && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-teal-500 pl-3">
                          Product Description
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{product.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Tab */}
                {activeTab === "pricing" && (
                  <div className="space-y-6">
                    {/* Base Price */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold text-teal-800 mb-2">Base Price</h3>
                      {product.offerPrice ? (
                        <div>
                          <p className="text-3xl font-bold text-red-600">{product.offerPrice}</p>
                          <p className="text-lg line-through text-gray-400">{product.price}</p>
                        </div>
                      ) : product.price ? (
                        <p className="text-3xl font-bold text-teal-700">{product.price}</p>
                      ) : (
                        <p className="text-gray-500">Contact us for pricing</p>
                      )}
                    </div>

                    {/* Volume Pricing */}
                    {product.pricingTiers && product.pricingTiers.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-bold text-teal-800 mb-4">Volume Pricing</h3>
                        <div className="space-y-2">
                          {(expandedPricing ? product.pricingTiers : product.pricingTiers.slice(0, 4)).map((tier, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                              <span className="text-gray-700">
                                {tier.minQuantity !== undefined && (
                                  <>Quantity: {tier.minQuantity}{tier.maxQuantity ? ` - ${tier.maxQuantity}` : "+"}</>
                                )}
                                {tier.minWeight !== undefined && (
                                  <>Weight: {tier.minWeight}g - {tier.maxWeight}g</>
                                )}
                                {tier.size && <>Size: {tier.size}</>}
                              </span>
                              <span className="font-bold text-teal-700">
                                {tier.pricePerTire || tier.pricePerKg || tier.pricePerTon || tier.pricePerUnit}
                              </span>
                            </div>
                          ))}
                          {product.pricingTiers.length > 4 && (
                            <button
                              onClick={() => setExpandedPricing(!expandedPricing)}
                              className="text-teal-600 text-sm font-medium hover:underline mt-2"
                            >
                              {expandedPricing ? "Show Less ↑" : `Show ${product.pricingTiers.length - 4} More ↓`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* MOQ */}
                    {product.keyAttributes?.MOQ && (
                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <h3 className="font-bold text-blue-800 mb-2">Minimum Order Quantity</h3>
                        <p className="text-2xl font-bold text-blue-700">{product.keyAttributes.MOQ}</p>
                      </div>
                    )}

                    {/* Customization Options */}
                    {product.customizationOptions && product.customizationOptions.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-bold text-teal-800 mb-3">Customization Options</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {product.customizationOptions.map((opt, idx) => (
                            <li key={idx}>{opt}</li>
                          ))}
                        </ul>
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
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FaFilePdf className="w-8 h-8 text-red-500" />
                            <div>
                              <p className="font-semibold text-gray-800">Product Brochure</p>
                              <p className="text-sm text-gray-500">Download PDF</p>
                            </div>
                            <Download className="w-5 h-5 text-gray-400 ml-auto" />
                          </a>
                        )}
                        {product.resources?.datasheet?.url && (
                          <a
                            href={product.resources.datasheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FaFilePdf className="w-8 h-8 text-blue-500" />
                            <div>
                              <p className="font-semibold text-gray-800">Technical Datasheet</p>
                              <p className="text-sm text-gray-500">Download PDF</p>
                            </div>
                            <Download className="w-5 h-5 text-gray-400 ml-auto" />
                          </a>
                        )}
                        {product.resources?.warrantyDoc?.url && (
                          <a
                            href={product.resources.warrantyDoc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FaShieldAlt className="w-8 h-8 text-green-500" />
                            <div>
                              <p className="font-semibold text-gray-800">Warranty Information</p>
                              <p className="text-sm text-gray-500">Download PDF</p>
                            </div>
                            <Download className="w-5 h-5 text-gray-400 ml-auto" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FaFilePdf className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No resources available for download</p>
                        <p className="text-sm mt-2">Contact us for technical documentation</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {hasReviews ? (
                      <>
                        {/* Rating Summary */}
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                          <div className="text-5xl font-bold text-teal-800 mb-2">
                            {avgRating.toFixed(1)}
                          </div>
                          <StarRating rating={avgRating} size="sm" />
                          <p className="text-sm text-gray-500 mt-2">
                            Based on {reviews.length} reviews
                          </p>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-4">
                          {reviews.map((review, idx) => (
                            <div key={idx} className="bg-white border rounded-lg p-5">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold text-gray-800">{review.username}</p>
                                  <StarRating rating={review.rating} size="sm" />
                                </div>
                                {review.verified && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>
                              {review.title && (
                                <p className="font-medium text-gray-800 mb-2">{review.title}</p>
                              )}
                              <p className="text-gray-600 text-sm">{review.text}</p>
                              {review.date && (
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(review.date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">⭐</div>
                        <p className="text-lg">No reviews yet</p>
                        <p className="text-sm mt-2">Be the first to review this product</p>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {recommendedProducts.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/product/${rec.id}`)}
                    className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all border border-gray-200"
                  >
                    <img
                      src={rec.image?.url || rec.image}
                      alt={rec.name}
                      className="w-full h-24 object-contain mb-2"
                    />
                    <p className="text-xs font-semibold text-gray-800 truncate">{rec.name}</p>
                    {rec.tireSpecs?.size && (
                      <p className="text-xs text-gray-500">{rec.tireSpecs.size}</p>
                    )}
                    <p className="text-xs font-bold text-teal-700 mt-1">
                      {rec.offerPrice || rec.price}
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
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
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
    </>
  );
};

export default ProductDetailsNew;