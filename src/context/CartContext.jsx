"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  const getTierPriceValue = (tier) =>
    parsePriceValue(
      tier?.pricePerTire ?? tier?.pricePerUnit ?? tier?.pricePerTon ?? tier?.pricePerKg ?? tier?.price
    );

  const getBaseItemPriceValue = (item) => parsePriceValue(item?.offerPrice || item?.price);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("asian-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("asian-cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("asian-cart");
    }
  }, [cart]);

  // Calculate price based on quantity and pricing tiers
  const calculateItemPrice = (item) => {
    const quantity = item.quantity || 1;

    // If product has pricing tiers
    if (item.pricingTiers && item.pricingTiers.length > 0) {
      // For frozen fish (weight-based), use regular price calculation
      if (item.pricingTiers[0].minWeight !== undefined) {
        // Use offerPrice or price for frozen fish
        const basePrice = item.offerPrice || item.price;
        return parsePriceValue(basePrice) * quantity;
      }

      // For truck tires (uses pricePerTire)
      if (
        item.pricingTiers[0].pricePerTire !== undefined ||
        item.pricingTiers[0].pricePerUnit !== undefined
      ) {
        // If quantity is less than the first tier minimum, use offerPrice
        if (quantity < item.pricingTiers[0].minQuantity) {
          const basePrice = item.offerPrice || item.price;
          return parsePriceValue(basePrice) * quantity;
        }

        // Find the applicable tier
        for (const tier of item.pricingTiers) {
          if (
            quantity >= tier.minQuantity &&
            (tier.maxQuantity === null || quantity <= tier.maxQuantity)
          ) {
            const priceNum = getTierPriceValue(tier);
            if (priceNum > 0) {
              return priceNum * quantity;
            }

            return getBaseItemPriceValue(item) * quantity;
          }
        }
      }

      // For metals (ton-based with pricePerTon)
      if (item.pricingTiers[0].pricePerTon !== undefined) {
        // If quantity is less than the first tier minimum, use offerPrice
        if (quantity < item.pricingTiers[0].minQuantity) {
          const basePrice = item.offerPrice || item.price;
          return parsePriceValue(basePrice) * quantity;
        }

        // Find the applicable tier
        for (const tier of item.pricingTiers) {
          if (
            quantity >= tier.minQuantity &&
            (tier.maxQuantity === null || quantity <= tier.maxQuantity)
          ) {
            const priceNum = getTierPriceValue(tier);
            if (priceNum > 0) {
              return priceNum * quantity;
            }

            return getBaseItemPriceValue(item) * quantity;
          }
        }
      }
    }

    // Default: use offerPrice or price
    const basePrice = item.offerPrice || item.price;
    return parsePriceValue(basePrice) * quantity;
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: product.quantity || 1 }];
      }
    });

    // Show toast after state update
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      toast.success("Quantity updated in cart");
    } else {
      toast.success("Added to cart");
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast.success("Removed from cart");
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("asian-cart");
    toast.success("Cart cleared");
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = calculateItemPrice(item);
      return total + (Number.isFinite(itemTotal) ? itemTotal : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartCategories = () => {
    const categories = new Set();
    cart.forEach((item) => {
      if (item.category) {
        categories.add(item.category.toLowerCase());
      }
    });
    return Array.from(categories);
  };

  const getTotalQuantity = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const canProceedToCheckout = () => {
    const categories = getCartCategories();
    const totalQuantity = getTotalQuantity();

    // Check if cart is empty
    if (cart.length === 0) {
      return { canProceed: false, message: "Your cart is empty" };
    }

    // Check if multiple categories exist
    if (categories.length > 1) {
      return {
        canProceed: false,
        message: "Multiple categories detected.",
        showWhatsApp: true,
      };
    }

    // Get the MOQ for the current category (from first item)
    const firstItem = cart[0];
    const categoryMOQ = firstItem?.moq || 50;
    const moqUnit = firstItem?.moqUnit || "units";

    // Check minimum quantity based on category MOQ
    if (totalQuantity < categoryMOQ) {
      const remaining = categoryMOQ - totalQuantity;
      return {
        canProceed: false,
        message: `Minimum order quantity is ${categoryMOQ} ${moqUnit}. You have ${totalQuantity} ${moqUnit} in cart. Please add ${remaining} more ${moqUnit}.`,
        showWhatsApp: true,
        categoryMOQ: categoryMOQ,
        moqUnit: moqUnit,
        currentQuantity: totalQuantity,
      };
    }

    return { canProceed: true };
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        getCartCategories,
        getTotalQuantity,
        canProceedToCheckout,
        isCartOpen,
        toggleCart,
        calculateItemPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
