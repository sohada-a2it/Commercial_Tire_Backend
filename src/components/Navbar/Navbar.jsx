"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { ShoppingBag, User, LogOut, ChevronDown, LayoutDashboard  } from "lucide-react";
import { Link, useNavigate, useLocation, usePathname } from "@/lib/navigation";
import Image from "next/image"; 
import { useAuth } from "@/context/AuthContext";
import AuthDrawer from "@/components/Auth/AuthModal";
import dataService from "@/services/dataService";

const Navbar = () => {
  const pathname = usePathname();

    if (pathname.startsWith("/dashboard")) return null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); 
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

  // Helper function to convert name to URL slug
  const nameToSlug = (name) => {
    return String(name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const categories = await dataService.getCategories();
        if (!isMounted) return;

        const mapped = categories
          .filter((category) => category?.isActive !== false)
          .map((category) => ({
            name: String(category?.name || "").trim(),
            categorySlug: nameToSlug(category?.name || ""),
            items: Array.isArray(category?.subcategories)
              ? category.subcategories
                  .filter((sub) => sub?.isActive !== false)
                  .map((sub) => String(sub?.name || "").trim())
                  .filter(Boolean)
              : [],
          }))
          .filter((category) => category.name && category.items.length > 0);

        setProductCategories(mapped);
      } catch (_error) {
        if (isMounted) {
          setProductCategories([]);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProductClick = (categorySlug, subcategoryName) => {
    const subcategorySlug = nameToSlug(subcategoryName);
    const path = `/products/c/${categorySlug}/${subcategorySlug}/`;
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
  `text-gray-300 font-medium py-2 border-b-2 transition-all duration-300 ${
    location.pathname === path
      ? "text-amber-400 border-amber-400"
      : "hover:text-amber-300 border-transparent hover:border-amber-300"
  }`;

  const getMobileLinkClasses = (path) =>
    `text-white text-sm font-medium py-2.5 px-3 rounded-md transition-colors ${
      location.pathname === path
        ? "bg-amber-700 text-amber-300"
        : "hover:bg-amber-700"
    }`;

  return (
    <nav className="bg-gray-600 shadow-lg px-2 sm:px-4 py-1.5 sm:py-2 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
  <Image
    src="/logo (2).png"
    alt="Commercial Tire"
    width={200}
    height={100}
    className="h-12 md:h-16 w-auto object-contain"
  />
</Link>
        </div>
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-7">
          <Link to="/" className={getLinkClasses("/")}>
            Home
          </Link> 
          <Link to="/productList" className={getLinkClasses("/productList")}>
            Products List
          </Link> 
          <Link to="/aboutUs" className={getLinkClasses("/aboutUs")}>
            About Us
          </Link>
          <Link to="/blog" className={getLinkClasses("/blog")}>
            Blog
          </Link>
          <Link to="/contact" className={getLinkClasses("/contact")}>
            Contact
          </Link> 
        </div>

        {/* Right side text */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/findDealer"  className={getLinkClasses("/findDealer")} >
            <p className="bg-amber-500 px-3 py-1 rounded-md text-white">Find a Dealer</p>
          </Link> 
          {/* Profile/Login Section */}
          {user ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-white hover:text-amber-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center overflow-hidden border-2 border-white/30">
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
                    onClick={() => {
                      navigate("/dashboard");
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
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
              <div className="w-8 h-8 rounded-full bg-amber-500/50 flex items-center justify-center border-2 border-white/30">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Sign In</span>
            </button>
          )} 
        </div>
        

        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <button
            className="text-white p-1.5 sm:p-2 rounded-lg hover:bg-amber-700"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
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
            className="lg:hidden mt-3 py-3 border-t border-amber-700 bg-amber-800 rounded-lg relative pointer-events-auto max-h-[75vh] overflow-y-auto" 
            style={{ zIndex: 40 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-1 px-3">
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

             

              <Link
                to="/aboutUs"
                className={getMobileLinkClasses("/aboutUs")}
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/blog"
                className={getMobileLinkClasses("/blog")}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
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
                <div className="border-t border-amber-700 mt-2 pt-2">
                  <div className="flex items-center gap-3 px-3 py-2 text-white">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center overflow-hidden">
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
                      <p className="text-xs text-amber-200 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-200 hover:bg-amber-700 transition-colors rounded-md"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-amber-700 transition-colors rounded-md"
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
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-amber-700 rounded-md transition-colors"
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
      <AuthDrawer
  isOpen={authModalOpen}
  onClose={() => setAuthModalOpen(false)}
/>
    </nav>
  );
};

export default Navbar;