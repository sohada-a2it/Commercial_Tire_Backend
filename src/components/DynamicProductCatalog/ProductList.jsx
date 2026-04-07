"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNavigate } from "@/lib/navigation";
import { useCart } from "@/context/CartContext";
import { ArrowUp, ShoppingCart, Eye } from "lucide-react";

// Helper function to parse price strings
const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
};

// Helper function to calculate discount percentage
const calculateDiscount = (originalPrice, offerPrice) => {
  const original = parsePrice(originalPrice);
  const offer = parsePrice(offerPrice);
  if (original <= 0 || offer <= 0) return 0;
  return Math.round(((original - offer) / original) * 100);
};

const ProductList = ({
  category,
  subcategory,
  selectedBrand,
  selectedTireType,
  sortBy = "",
  isHomePage = false,
  enableServerPagination = false,
  hasMore = false,
  onLoadMore = null,
  isLoadingMore = false,
}) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Get category name from the category object
  const categoryName = category?.name || "General";

  // Filter products by selected brand and tire type
  let filteredProducts = subcategory.products || [];

  // Filter by brand
  if (selectedBrand) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        (product.keyAttributes?.["Brand"] || product.brand) === selectedBrand
    );
  }

  // Filter by tire type (for Truck Tires) - using Pattern attribute
  if (selectedTireType) {
    filteredProducts = filteredProducts.filter(
      (product) => product.keyAttributes?.["Pattern"] === selectedTireType
    );
  }

  // Sort products by price if sortBy is specified
  if (sortBy) {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      // Get the effective price (offerPrice if available, otherwise regular price)
      const priceA = parsePrice(a.offerPrice || a.price);
      const priceB = parsePrice(b.offerPrice || b.price);

      if (sortBy === "price-low-high") {
        return priceA - priceB;
      } else if (sortBy === "price-high-low") {
        return priceB - priceA;
      }
      return 0;
    });
  }

  // Handle add to cart
  const handleAddToCart = (product) => {
    const priceStr = product.offerPrice || product.price || "0";
    const priceNum = parsePrice(priceStr);

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
      quantity: 1,
      image: product.image,
      category: categoryName,
      moq: moqValue,
      moqUnit: moqUnit,
      pricingTiers: product.pricingTiers || [],
    });
  };

  // Determine how many products to show initially
  const initialProductsCount = isHomePage ? 3 : 12; // Show 3 on home, 12 on products page
  const displayedProducts = showAllProducts
    ? filteredProducts
    : filteredProducts.slice(0, initialProductsCount);

  // Helper function to convert name to URL slug
  const nameToSlug = (name) => {
    return name.replace(/\s+/g, "-");
  };

  const handleSeeAllClick = () => {
    if (isHomePage) {
      // Navigate to products page with the category selected
      const slug = nameToSlug(categoryName);
      navigate(`/products/c/${slug}`);
    } else {
      // Just expand the list on the products page
      setShowAllProducts(true);
    }
  };
  const handleShowLessClick = () => {
    setShowAllProducts(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md  p-6">
      {displayedProducts && displayedProducts.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => {
              // Get display image - show first image from images array on hover, otherwise main image
              const displayImage = hoveredProduct === product.id && product.images?.[0]
                ? product.images[0]
                : product.image;
              
              return (
              <div
                key={product.id}
                className="border border-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col relative group"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image */}
                <div className="h-48 w-full bg-gray-100 rounded-sm mb-4 flex items-center justify-center overflow-hidden relative">
                  {/* Discount Badge */}
                  {product.offerPrice && product.price && calculateDiscount(product.price, product.offerPrice) > 0 && (() => {
                    const discount = calculateDiscount(product.price, product.offerPrice);
                    let badgeColor = '';
                    
                    if (discount <= 30) {
                      badgeColor = 'bg-blue-500 text-white';
                    }else if (discount <= 40) {
                      badgeColor = 'bg-orange-500 text-white';
                    } else if (discount <= 50) {
                      badgeColor = 'bg-red-500 text-white';
                    } else if (discount <= 80) {
                      badgeColor = 'bg-green-500 text-white';
                    } else {
                      badgeColor = 'bg-black-600 text-white';
                    }
                    
                    return (
                      <div className={`absolute top-2 right-0 ${badgeColor} px-1 py-1 rounded-sm text-[10px] font-bold shadow-lg z-[1]`}>
                        {discount}% OFF
                      </div>
                    );
                  })()}

                  {/* Hover Action Buttons - Slide from left in column */}
                  <div className="absolute -left-16 top-1/2 -translate-y-1/2 group-hover:left-2 flex flex-col gap-2 transition-all duration-300 z-[2]">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-white hover:bg-teal-600 hover:text-white text-teal-600 p-3 rounded-sm shadow-lg transition-colors"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/product/${product.id}`}
                      className="bg-white hover:bg-teal-600 hover:text-white text-teal-600 p-3 rounded-sm shadow-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                  
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="object-contain h-full w-full p-2 transition-all duration-300"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No image available
                    </div>
                  )}
                </div>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 h-14">
                  {product.name || "Unnamed Product"}
                </h3>

                {/* Product Details */}
                <div className="mb-3 space-y-1">
                  {product.keyAttributes?.["MOQ"] && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">MOQ:</span>{" "}
                      {product.keyAttributes["MOQ"]}
                    </p>
                  )}

                  {/* Show size from pricingTiers or keyAttributes */}
                  {(() => {
                    // Check if pricingTiers has size information
                    if (
                      product.pricingTiers &&
                      product.pricingTiers.length > 0
                    ) {
                      const firstTier = product.pricingTiers[0];

                      // Check for minWeight/maxWeight
                      if (firstTier.minWeight && firstTier.maxWeight) {
                        return (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Size:</span>{" "}
                            {firstTier.minWeight}-{firstTier.maxWeight}gm
                          </p>
                        );
                      }

                      // Check for size property
                      if (firstTier.size) {
                        return (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Size:</span>{" "}
                            {firstTier.size}
                          </p>
                        );
                      }
                    }

                    // Fallback to keyAttributes Size
                    if (product.keyAttributes?.Size) {
                      return (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Size:</span>{" "}
                          {product.keyAttributes.Size}
                        </p>
                      );
                    }

                    return null;
                  })()}
                </div>

                {/* Pricing Information */}
                <div className="mt-auto">
                  {product.offerPrice && product.price ? (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-teal-600">
                        {product.offerPrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {product.price}
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        {calculateDiscount(product.price, product.offerPrice)}%
                        OFF
                      </span>
                    </div>
                  ) : product.price ? (
                    <p className="text-lg font-bold text-teal-600 mb-3">
                      {product.price}
                    </p>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* See Details Button */}
                    <Link
                      href={`/product/${product.id}`}
                      className="flex-1 border bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md text-sm font-medium transition-colors text-center"
                    >
                      See Details
                    </Link>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 border border-cyan-700 hover:bg-teal-600 hover:text-white text-cyan-600 py-2 rounded-md text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {/* Show "See All" button if there are more products to show */}
          {!showAllProducts &&
            ((enableServerPagination && hasMore) ||
              (!enableServerPagination && filteredProducts.length > initialProductsCount)) && (
              <div className="mt-8 text-center">
                <button
                  onClick={
                    enableServerPagination && typeof onLoadMore === "function"
                      ? onLoadMore
                      : handleSeeAllClick
                  }
                  disabled={isLoadingMore}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  {isLoadingMore
                    ? "Loading..."
                    : enableServerPagination
                    ? "Load More Products"
                    : isHomePage
                    ? `View All Products →`
                    : `See All Products`}
                </button>
              </div>
            )}
          {/* show less button  */}
          {showAllProducts &&
            !enableServerPagination &&
            filteredProducts.length > initialProductsCount && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleShowLessClick}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-1 mx-auto"
                >
                  Show Less <ArrowUp />
                </button>
              </div>
            )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl text-gray-400 mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No products available
          </h3>
          <p className="text-gray-500">
            {selectedBrand
              ? `There are no ${selectedBrand} products in this category.`
              : "There are currently no products in this category."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
