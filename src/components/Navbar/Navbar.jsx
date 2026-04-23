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
  // Dashboard page এ navbar দেখাবে না
  if (pathname?.startsWith("/dashboard")) return null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();

  const profileDropdownRef = useRef(null);

  // Click outside close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  const getLinkClasses = (path) =>
    `relative text-sm font-medium transition-all duration-300 ${
      location.pathname === path
        ? "text-amber-400"
        : "text-white/70 hover:text-white"
    }`;

  const getMobileLinkClasses = (path) =>
    `block text-sm font-medium px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-white/10 text-amber-400"
        : "text-white/80 hover:bg-white/10"
    }`;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Image
              src="/double.png"
              alt="logo"
              width={180}
              height={80}
              className="h-12 w-15 object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {[
              { name: "Home", path: "/" },
              { name: "Products List", path: "/productList" },
              { name: "About Us", path: "/aboutUs" },
              { name: "Blog", path: "/blog" },
              { name: "Contact", path: "/contact" },
              { name: "Tire Finder", path: "/tire-finder" },
            ].map((item) => (
              <Link key={item.path} to={item.path} className={getLinkClasses(item.path)}>
                {item.name}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] transition-all duration-300 bg-gradient-to-r from-amber-400 to-orange-500 ${
                    location.pathname === item.path ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {/* CTA Button */}
            <Link to="/findDealer">
              <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium shadow-md hover:scale-105 transition">
                Find a Dealer
              </div>
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/10 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt=""
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <span className="text-sm text-white/90 max-w-[100px] truncate">
                    {userProfile?.fullName || user.displayName || user.email?.split('@')[0]}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 text-white transition ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-white font-semibold">
                        {userProfile?.fullName || user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-white/50">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
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
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white"
          >
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-xl px-4 py-4 space-y-2 border-t border-white/10">
            {[
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
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
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthDrawer
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;