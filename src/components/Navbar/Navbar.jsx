"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { User, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { Link, useNavigate, useLocation, usePathname } from "@/lib/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import AuthDrawer from "@/components/Auth/AuthModal";

const Navbar = () => {
  const pathname = usePathname(); 
  if (pathname?.startsWith("/dashboard")) return null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();

  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScrollClose = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScrollClose);
    return () => window.removeEventListener("scroll", handleScrollClose);
  }, [isMenuOpen]);

  // Click outside close for mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.lg\\:hidden')) {
        setIsMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  // Check if path is active (supports nested routes)
  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname?.startsWith(`${path}/`);
  };

  const getLinkClasses = (path) =>
    `relative text-sm font-medium transition-all duration-300 ${
      isActivePath(path)
        ? "text-amber-400"
        : "text-white/70 hover:text-white"
    }`;

  const getMobileLinkClasses = (path) =>
    `block text-sm font-medium px-4 py-2.5 rounded-lg transition ${
      isActivePath(path)
        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-l-2 border-amber-500"
        : "text-white/80 hover:bg-white/10"
    }`;

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl" 
          : "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/double.png"
              alt="logo"
              width={180}
              height={80}
              className="h-10 sm:h-12 w-19 object-contain transition-all duration-300"
              priority
            />
          </Link>

          {/* Desktop Menu - Hidden on tablet/mobile */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {[
              { name: "Home", path: "/" },
              { name: "Products List", path: "/productList" },
              { name: "About Us", path: "/aboutUs" },
              { name: "Blog", path: "/blog" },
              { name: "Contact", path: "/contact" },
              { name: "Tire Finder", path: "/tire-finder" },
            ].map((item) => (
              <Link key={item.path} to={item.path} className={`${getLinkClasses(item.path)} group`}>
                {item.name}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] transition-all duration-300 bg-gradient-to-r from-amber-400 to-orange-500 ${
                    isActivePath(item.path) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {/* CTA Button */}
            <Link to="/findDealer">
              <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium shadow-md hover:scale-105 transition duration-300 cursor-pointer whitespace-nowrap">
                Find a Dealer
              </div>
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/10 transition duration-200"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt=""
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>

                  <span className="text-sm text-white/90 max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline-block">
                    {userProfile?.fullName || user.displayName || user.email?.split('@')[0]}
                  </span>

                  <ChevronDown
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-white font-semibold truncate">
                        {userProfile?.fullName || user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors duration-200"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
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
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition duration-200 whitespace-nowrap"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button - Visible on tablet and below */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2 -mr-2 hover:bg-white/10 rounded-lg transition duration-200 z-50 relative"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown - Responsive with smooth animation and scroll behavior */}
        <div 
          ref={mobileMenuRef}
          className={`lg:hidden fixed inset-x-0 top-[65px] sm:top-[73px] bg-black/95 backdrop-blur-xl px-4 py-4 space-y-2 border-t border-white/10 shadow-2xl transition-all duration-300 ease-in-out z-40 ${
            isMenuOpen 
              ? "opacity-100 translate-y-0 visible" 
              : "opacity-0 -translate-y-4 invisible"
          }`}
          style={{
            maxHeight: "calc(100vh - 65px)",
            overflowY: "auto",
          }}
        >
          {[
            { name: "Home", path: "/" },
            { name: "Products List", path: "/productList" },
            { name: "About Us", path: "/aboutUs" },
            { name: "Blog", path: "/blog" },
            { name: "Contact", path: "/contact" },
            { name: "Tire Finder", path: "/tire-finder" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={getMobileLinkClasses(item.path)}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Mobile CTA Button */}
          <Link to="/findDealer" onClick={() => setIsMenuOpen(false)}>
            <div className="px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium shadow-md hover:scale-105 transition duration-300 text-center">
              Find a Dealer
            </div>
          </Link>

          {/* Mobile Auth Section */}
          {user ? (
            <div className="pt-2 border-t border-white/10 mt-2">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg hover:bg-white/10 transition duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt=""
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-white font-semibold">
                      {userProfile?.fullName || user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-white/50 truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-white transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-amber-500/30 space-y-1">
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setIsProfileOpen(false);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 rounded-lg transition duration-200"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalOpen(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium hover:shadow-lg transition duration-200 mt-2"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal - Responsive Drawer */}
      <AuthDrawer
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;