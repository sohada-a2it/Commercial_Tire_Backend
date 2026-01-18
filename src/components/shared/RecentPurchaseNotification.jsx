"use client";

import React, { useState, useEffect } from "react";
import { X, ShoppingCart, Eye } from "lucide-react";
import { useNavigate } from "@/lib/navigation";
import { useCart } from "@/context/CartContext";

const RecentPurchaseNotification = ({ products = [] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!products || products.length === 0) return;

    let cycleTimeout;

    const showNotification = (index) => {
      setCurrentProduct(products[index]);
      setIsVisible(true);
      setIsAnimating(true);

      // Hide after 30 seconds
      setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);

        // Wait 30 seconds before showing next notification
        cycleTimeout = setTimeout(() => {
          const nextIndex = (index + 1) % products.length;
          setCurrentIndex(nextIndex);
          showNotification(nextIndex);
        }, 2000); // 3 seconds gap
      }, 30000); // Show for 30 seconds
    };

    // Show first notification after 3 seconds
    const initialTimer = setTimeout(() => {
      showNotification(0);
    }, 3000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(cycleTimeout);
    };
  }, [products]);

  const handleClose = () => {
    setIsVisible(false);
    setIsAnimating(false);
  };

  const handleSeeDetails = () => {
    if (currentProduct?.id) {
      navigate(`/product/${currentProduct.id}`);
    }
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;

    const priceStr = currentProduct.offerPrice || currentProduct.price || "0";
    const priceNum = parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;

    addToCart({
      id: currentProduct.id,
      name: currentProduct.name,
      price: priceNum,
      offerPrice: currentProduct.offerPrice,
      quantity: 1,
      image: currentProduct.image,
      category: currentProduct.category || "General",
      moq: 50,
      moqUnit: "units",
    });

    // Optional: Show a brief success indicator or close the popup
    // setIsVisible(false);
  };

  const getRandomLocation = () => {
    const locations = [
      "New York, USA",
      "London, UK",
      "Tokyo, Japan",
      "Paris, France",
      "Dubai, UAE",
      "Singapore",
      "Sydney, Australia",
      "Toronto, Canada",
      "Berlin, Germany",
      "Seoul, South Korea",
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  if (!currentProduct) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 transition-all duration-500 ease-in-out ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-sm overflow-hidden border border-gray-200 animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-1 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">
            Someone purchased
          </span>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-2">
          <div className="flex items-start gap-3 mb-0">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <img
                src={currentProduct.image}
                alt={currentProduct.name}
                className="w-16 h-16 object-contain rounded border border-gray-200"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                {currentProduct.name}
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                In {getRandomLocation()}
              </p>
              {/* Price */}
                   {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSeeDetails}
              className="flex-1 flex items-center justify-center gap-1  border-b-teal-500 hover:text-red-600 text-teal-600 text-xs font-medium  px-3 rounded transition-colors"
            >
              See Details
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1  border-b-teal-500 hover:text-red-500 text-teal-600 text-xs font-medium px-3 rounded transition-colors"
            >
              Add to Cart
            </button>
          </div>
            </div>
          </div>

     
        </div>

        {/* Footer indicator */}
        <div className="h-1 bg-gray-200 relative overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-yellow-400 to-yellow-500 absolute left-0 top-0 ${
              isAnimating ? 'animate-progress' : ''
            }`}
            style={{ width: isAnimating ? '100%' : '0%' }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        .animate-progress {
          animation: progress 30s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default RecentPurchaseNotification;
