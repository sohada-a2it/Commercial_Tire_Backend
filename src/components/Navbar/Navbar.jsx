"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { ShoppingBag } from "lucide-react";
import { Link, useNavigate, useLocation } from "@/lib/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount, toggleCart } = useCart();
  const productsDropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProducts = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  // Close products dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setIsProductsOpen(false);
      }
    };

    if (isProductsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProductsOpen]);

  // Product categories
  const productCategories = [
    {
      name: "Vehicle Parts & Accessories",
      categorySlug: "Vehicle-Parts-and-Accessories",
      items: [
        "Truck Tires",
        "Golf Cart",
        "Rim",
        "Electric Bike",
      ],
    },
    {
      name: "Frozen Fish",
      categorySlug: "Frozen-Fish",
      items: ["Eel", "Crab", "Shrimp", "Tilapia"],
    },
    {
      name: "Metals & Metal Products",
      categorySlug: "Metals-and-Metal-Products",
      items: ["Copper Scrap", "Cathode Copper", "Aluminum Metal"],
    },
    {
      name: "Dry Food",
      categorySlug: "Dry-Food",
      items: ["Rice", "Sugar", "Nuts"],
    },
    {
      name: "Agriculture",
      categorySlug: "Agriculture",
      items: ["Fresh Potatoes", "Fresh Onion"],
    },
    {
      name: "Wood Products",
      categorySlug: "Wood-Products",
      items: ["Wood Pellets"],
    },
  ];

  // Helper function to convert name to URL slug
  const nameToSlug = (name) => {
    return name.replace(/\s+/g, '-');
  };

  const handleProductClick = (categorySlug, subcategoryName) => {
    const subcategorySlug = nameToSlug(subcategoryName);
    const path = `/products/c/${categorySlug}/${subcategorySlug}`;
    console.log('Navigating to:', path, 'from category:', categorySlug, 'item:', subcategoryName);
    navigate(path);
    setIsProductsOpen(false);
    setIsMenuOpen(false);
  };

  const handleViewAllProducts = () => {
    navigate("/products");
    setIsProductsOpen(false);
    setIsMenuOpen(false);
  };

  // active link classes
  const getLinkClasses = (path) =>
    `text-white font-medium py-2 border-b-2 transition-colors ${
      location.pathname === path
        ? "text-amber-300 border-amber-300"
        : "hover:text-amber-200 border-transparent hover:border-amber-200"
    }`;

  const getMobileLinkClasses = (path) =>
    `text-white font-medium py-3 px-4 rounded-md transition-colors ${
      location.pathname === path
        ? "bg-teal-700 text-amber-300"
        : "hover:bg-teal-700"
    }`;

  return (
    <nav className="bg-gradient-to-r from-teal-800 to-teal-600 shadow-lg px-4 py-2 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Asian Import and Export"
              width={150}
              height={64}
              className="h-10 md:h-16 w-auto"
            />
            <div className="ml-1 text-white">
              <p className="font-semibold md:text-lg text-sm">ASIAN IMPORT & EXPORT Co. LTD</p>
              <p className="md:text-sm text-xs text-yellow-500 ">Manufacturer & Wholesaler</p>
            </div>
          </Link>
        </div>
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-7">
          <Link to="/" className={getLinkClasses("/")}>
            Home
          </Link>

          <div className="relative" ref={productsDropdownRef}>
            <button
              onClick={toggleProducts}
              className={`font-medium flex items-center py-2 border-b-2 ${
                location.pathname === "/products"
                  ? "text-amber-300 border-amber-300"
                  : "text-white hover:text-amber-300 border-transparent hover:border-amber-300"
              }`}
            >
              Products
              <FaChevronDown className="ml-1 text-sm" />
            </button>

            {isProductsOpen && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white shadow-2xl rounded-lg p-4 w-[700px] max-w-[90vw] z-20 border border-teal-200">
                <div className="flex gap-3 flex-wrap">
                  {/* Vehicle Parts */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-teal-800 pb-1 mb-2 border-b border-teal-200">
                      Vehicle Parts
                    </h3>
                    <div className="space-y-0.5">
                      {productCategories[0].items.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleProductClick(productCategories[0].categorySlug, item)}
                          className="block w-full text-left py-1 px-2 hover:bg-teal-50 rounded text-xs text-gray-700"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seafood */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-teal-800 pb-1 mb-2 border-b border-teal-200">
                      Seafood
                    </h3>
                    <div className="space-y-0.5">
                      {productCategories[1].items.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleProductClick(productCategories[1].categorySlug, item)}
                          className="block w-full text-left py-1 px-2 hover:bg-teal-50 rounded text-xs text-gray-700"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Metals */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-teal-800 pb-1 mb-2 border-b border-teal-200">
                      Metals
                    </h3>
                    <div className="space-y-0.5">
                      {productCategories[2].items.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleProductClick(productCategories[2].categorySlug, item)}
                          className="block w-full text-left py-1 px-2 hover:bg-teal-50 rounded text-xs text-gray-700"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dry Food */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-teal-800 pb-1 mb-2 border-b border-teal-200">
                      Dry Food
                    </h3>
                    <div className="space-y-0.5">
                      {productCategories[3].items.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleProductClick(productCategories[3].categorySlug, item)}
                          className="block w-full text-left py-1 px-2 hover:bg-amber-50 rounded text-xs text-gray-700"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Agriculture */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-teal-800 pb-1 mb-2 border-b border-teal-200">
                      Agriculture
                    </h3>
                    <div className="space-y-0.5">
                      {productCategories[4].items.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleProductClick(productCategories[4].categorySlug, item)}
                          className="block w-full text-left py-1 px-2 hover:bg-teal-50 rounded text-xs text-gray-700"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wood */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-teal-800 pb-1 mb-2 border-b border-teal-200">
                      Wood
                    </h3>
                    <div className="space-y-0.5">
                      {productCategories[5].items.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleProductClick(productCategories[5].categorySlug, item)}
                          className="block w-full text-left py-1 px-2 hover:bg-amber-50 rounded text-xs text-gray-700"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View All Products */}
                <div className="mt-4 pt-3 border-t border-teal-200">
                  <button
                    onClick={handleViewAllProducts}
                    className="block w-full py-1.5 px-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium rounded text-xs text-center hover:from-teal-700 hover:to-teal-800"
                  >
                    View All Products
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link to="/aboutUs" className={getLinkClasses("/aboutUs")}>
            About Us
          </Link>
          <Link to="/contact" className={getLinkClasses("/contact")}>
            Contact
          </Link>
          
          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="relative text-white hover:text-amber-300 transition-colors py-2 border-b-2 border-transparent hover:border-amber-300"
          >
            <div className="flex items-center gap-1">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">Cart</span>
              {getCartItemCount() > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {getCartItemCount()}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Right side text */}
        <div className="hidden lg:flex items-center space-x-2">
          <div className="text-white text-sm border-l border-teal-500 pl-4">
            <div className="font-medium">Import & Export Experts</div>
            <div className="text-teal-200 text-xs">Since 2017</div>
          </div>
        </div>
        

        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <button
            className="text-white p-2 rounded-lg hover:bg-teal-700"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden pointer-events-auto"
            style={{ top: '72px', zIndex: 30 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(false);
            }}
          />
          
          {/* Menu Content */}
          <div 
            className="lg:hidden mt-4 py-4 border-t border-teal-700 bg-teal-800 rounded-lg relative pointer-events-auto" 
            style={{ zIndex: 40 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-1 px-4">
              <Link
                to="/"
                className={getMobileLinkClasses("/")}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                to="/products"
                className={getMobileLinkClasses("/products")}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>

              <button
                onClick={() => {
                  toggleCart();
                  setIsMenuOpen(false);
                }}
                className="relative text-white hover:text-amber-300 transition-colors py-3 px-4 rounded-md hover:bg-teal-700 text-left"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-medium">Cart</span>
                  {getCartItemCount() > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </div>
              </button>

              <Link
                to="/aboutUs"
                className={getMobileLinkClasses("/aboutUs")}
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className={getMobileLinkClasses("/contact")}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;