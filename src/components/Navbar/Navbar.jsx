"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { ShoppingBag, User, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "@/lib/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/Auth/AuthModal";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount, toggleCart } = useCart();
  const { user, userProfile, logout } = useAuth();
  const productsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

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
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProductsOpen || isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProductsOpen, isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

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
        <div className="hidden lg:flex items-center space-x-4">
          {/* Profile/Login Section */}
          {user ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-white hover:text-amber-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center overflow-hidden border-2 border-white/30">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <span className="text-sm font-medium max-w-[100px] truncate">
                  {userProfile?.fullName || user.displayName || "User"}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.fullName || user.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 text-white hover:text-amber-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/50 flex items-center justify-center border-2 border-white/30">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Sign In</span>
            </button>
          )}

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

              {/* Mobile Profile/Login */}
              {user ? (
                <div className="border-t border-teal-700 mt-2 pt-2">
                  <div className="flex items-center gap-3 px-4 py-2 text-white">
                    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {userProfile?.fullName || user.displayName}
                      </p>
                      <p className="text-xs text-teal-200 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-300 hover:bg-teal-700 transition-colors rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-white hover:bg-teal-700 rounded-md transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;