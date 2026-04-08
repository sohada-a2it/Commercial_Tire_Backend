"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Separate component for quantity input to manage local state
const QuantityInput = ({ itemId, quantity, updateQuantity }) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  // Sync with external quantity changes (from +/- buttons)
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleChange = (e) => {
    const value = e.target.value;
    // Allow any input while typing (including empty)
    setInputValue(value);
    
    // Only update cart if valid number
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 1) {
      updateQuantity(itemId, parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue);
    if (isNaN(parsed) || parsed < 1) {
      // Reset to current quantity if invalid
      setInputValue(quantity.toString());
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-16 text-center border rounded-md px-2 py-1 text-sm"
      min="1"
    />
  );
};

const CartSidebar = () => {
  
  const {
    cart,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    canProceedToCheckout,
    calculateItemPrice,
  } = useCart();

  const parsePriceValue = (value) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  };

  const getBaseItemPriceValue = (item) => parsePriceValue(item?.offerPrice || item?.price);

  // Helper function to get price display for an item
  const getPriceDisplay = (item) => {
    const quantity = item.quantity || 1;
    const itemPrice = calculateItemPrice(item);

    // For frozen fish with weight-based pricing - show ranges as info only
    if (
      item.pricingTiers &&
      item.pricingTiers.length > 0 &&
      item.pricingTiers[0].minWeight !== undefined
    ) {
      return {
        type: "weight-range",
        ranges: item.pricingTiers,
        calculatedPrice: itemPrice, // This uses regular price
      };
    }

    // For shrimp and similar - show size-based pricing
    if (
      item.pricingTiers &&
      item.pricingTiers.length > 0 &&
      item.pricingTiers[0].size &&
      item.pricingTiers[0].pricePerTon
    ) {
      return {
        type: "size-range",
        ranges: item.pricingTiers,
        calculatedPrice: itemPrice,
      };
    }

    // For products with pricing tiers (truck tires, metals)
    if (item.pricingTiers && item.pricingTiers.length > 0) {
      if (
        item.pricingTiers[0].pricePerTire !== undefined ||
        item.pricingTiers[0].pricePerUnit !== undefined
      ) {
        // Truck tires
        if (quantity < item.pricingTiers[0].minQuantity) {
          // Using offer price for quantities below first tier
          const basePrice = item.offerPrice || item.price;
          const unitPrice = parsePriceValue(basePrice);
          return {
            type: "offer-price",
            unitPrice: unitPrice,
            total: itemPrice,
          };
        }

        // Find applicable tier
        for (const tier of item.pricingTiers) {
          if (
            quantity >= tier.minQuantity &&
            (tier.maxQuantity === null || quantity <= tier.maxQuantity)
          ) {
            const unitPriceRaw =
              tier.pricePerTire || tier.pricePerUnit || tier.pricePerTon || tier.pricePerKg;
            const numericUnitPrice = parsePriceValue(unitPriceRaw);
            const fallbackUnitPrice = numericUnitPrice > 0 ? numericUnitPrice : getBaseItemPriceValue(item);
            return {
              type: "tiered",
              tierInfo: `${tier.minQuantity}${
                tier.maxQuantity ? `-${tier.maxQuantity}` : "+"
              } ${item.moqUnit || "units"}`,
              unitPrice: unitPriceRaw || fallbackUnitPrice,
              numericUnitPrice: fallbackUnitPrice,
              total: itemPrice,
            };
          }
        }
      } else if (item.pricingTiers[0].pricePerTon !== undefined) {
        // Metals
        if (quantity < item.pricingTiers[0].minQuantity) {
          // Using offer price for quantities below first tier
          const basePrice = item.offerPrice || item.price;
          const unitPrice = parsePriceValue(basePrice);
          return {
            type: "offer-price",
            unitPrice: unitPrice,
            total: itemPrice,
          };
        }

        // Find applicable tier
        for (const tier of item.pricingTiers) {
          if (
            quantity >= tier.minQuantity &&
            (tier.maxQuantity === null || quantity <= tier.maxQuantity)
          ) {
            const unitPriceRaw = tier.pricePerTon || tier.pricePerKg || tier.pricePerUnit;
            const numericUnitPrice = parsePriceValue(unitPriceRaw);
            const fallbackUnitPrice = numericUnitPrice > 0 ? numericUnitPrice : getBaseItemPriceValue(item);
            return {
              type: "tiered",
              tierInfo: `${tier.minQuantity}${
                tier.maxQuantity ? `-${tier.maxQuantity}` : "+"
              } tons`,
              unitPrice: unitPriceRaw || fallbackUnitPrice,
              numericUnitPrice: fallbackUnitPrice,
              total: itemPrice,
            };
          }
        }
      }
    }

    // Default pricing (standard products or those without tiers)
    const basePrice = item.offerPrice || item.price;
    const unitPrice = parsePriceValue(basePrice);

    return {
      type: "standard",
      unitPrice: unitPrice,
      total: itemPrice,
    };
  };

  const validation = canProceedToCheckout();

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={toggleCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-600 to-teal-700 text-white">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              <h2 className="text-xl font-bold">Shopping Cart</h2>
            </div>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="w-16 h-16 mb-4" />
                <p className="text-lg">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs line-clamp-2 mb-1 text-gray-700">
                        {item.name}
                      </h3>

                      {/* Dynamic Price Display */}
                      {(() => {
                        const priceInfo = getPriceDisplay(item);

                        if (priceInfo.type === "weight-range") {
                          // Frozen Fish - Show all price ranges as info + calculated price
                          return (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-teal-700 mb-1">
                                Price varies by weight:
                              </p>
                              {priceInfo.ranges.map((range, idx) => (
                                <p key={idx} className="text-xs text-gray-600">
                                  {range.minWeight}-{range.maxWeight}g:{" "}
                                  {range.pricePerKg}
                                </p>
                              ))}
                              <p className="text-blue-600 font-bold text-sm mb-1">
                                Total = ${priceInfo.calculatedPrice?.toFixed(2)}
                              </p>
                            </div>
                          );
                        } else if (priceInfo.type === "size-range") {
                          // Shrimp and similar - Show all size-based price tiers
                          return (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-teal-700 mb-1">
                                Price varies by size:
                              </p>
                              {priceInfo.ranges.map((tier, idx) => (
                                <p key={idx} className="text-xs text-gray-600">
                                  Size({tier.size}) - price({tier.pricePerTon})
                                </p>
                              ))}
                              <p className="text-blue-600 font-bold text-sm mb-1">
                                Total = ${priceInfo.calculatedPrice?.toFixed(2)}
                              </p>
                            </div>
                          );
                        } else if (priceInfo.type === "tiered") {
                          // Truck Tires or Metals with tiered pricing
                          return (
                            <div className="mb-2">
                              <p className="text-xs text-teal-600 mb-1">
                                Tier: {priceInfo.tierInfo}
                              </p>
                              <p className="text-xs text-gray-600">
                                Unit: {priceInfo.unitPrice}
                              </p>
                              <p className="text-blue-600 font-bold text-sm">
                                Total: ${(priceInfo.numericUnitPrice ?? 0).toFixed(2)} × {item.quantity} =
                                ${Number.isFinite(priceInfo.total) ? priceInfo.total.toFixed(2) : "0.00"}
                              </p>
                            </div>
                          );
                        } else if (priceInfo.type === "offer-price") {
                          // Below minimum tier quantity, using offer price
                          return (
                            <div className="mb-2">
                              <p className="text-xs text-amber-600 mb-1">
                                Offer Price (Below tier minimum)
                              </p>
                              <p className="text-blue-600 font-bold text-sm">
                                Total: ${priceInfo.unitPrice?.toFixed(2)} ×{" "}
                                {item.quantity} = ${Number.isFinite(priceInfo.total) ? priceInfo.total.toFixed(2) : "0.00"}
                              </p>
                            </div>
                          );
                        } else {
                          // Standard pricing
                          return (
                            <p className="text-blue-600 font-bold text-sm mb-2">
                              Total: ${priceInfo.unitPrice?.toFixed(2)} ×{" "}
                              {item.quantity} = ${Number.isFinite(priceInfo.total) ? priceInfo.total.toFixed(2) : "0.00"}
                            </p>
                          );
                        }
                      })()}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 rounded-md bg-teal-600 hover:bg-teal-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <QuantityInput
                          itemId={item.id}
                          quantity={item.quantity}
                          updateQuantity={updateQuantity}
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 rounded-md bg-teal-600 hover:bg-teal-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors self-start"
                      aria-label="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Subtotal and Checkout */}
          {cart.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              {/* Check if cart has frozen fish items */}
              {(() => {
                const hasFrozenFish = cart.some(
                  (item) =>
                    item.pricingTiers &&
                    item.pricingTiers.length > 0 &&
                    item.pricingTiers[0].minWeight !== undefined
                );
                const cartTotal = getCartTotal();

                return (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Subtotal:</span>
                      <span className="text-2xl font-bold text-red-600">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>

                    {hasFrozenFish && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          📦 Your cart contains frozen fish. Final price may
                          vary based on actual weight/size selected.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Validation Message */}
              {!validation.canProceed && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">⚠️</span>
                    <span>{validation.message}</span>
                  </p>
                </div>
              )}

              {/* WhatsApp Contact Button */}
              {validation.showWhatsApp && (
                <button
                  onClick={() => {
                    const whatsappNumber = "14379003996";
                    let message = "";

                    if (
                      validation.categoryMOQ &&
                      validation.currentQuantity < validation.categoryMOQ
                    ) {
                      // User has less than MOQ for a single category
                      const unit = validation.moqUnit || "units";
                      message = encodeURIComponent(
                        `Hello, I would like to place a custom order. I have ${validation.currentQuantity} ${unit} in my cart but the minimum order quantity is ${validation.categoryMOQ} ${unit}.`
                      );
                    } else {
                      // User has multiple categories
                      message = encodeURIComponent(
                        "Hello, I would like to place a custom order with multiple categories."
                      );
                    }

                    window.open(
                      `https://wa.me/${whatsappNumber}?text=${message}`,
                      "_blank"
                    );
                  }}
                  className="w-full mb-3 flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-colors font-semibold shadow-md"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact via WhatsApp for Custom Order
                </button>
              )}

              {validation.canProceed ? (
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="block w-full py-3 px-4 rounded-sm font-semibold text-center bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-sm font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
