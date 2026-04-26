// Footer Component (updated)
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaTruck,
  FaShieldAlt,
  FaClock,
} from "react-icons/fa";
import dataService from "@/services/dataService";

export default function Footer() {
  const pathname = usePathname();
  
  // Dashboard এ Footer দেখাবে না
  if (pathname?.startsWith("/dashboard")) return null;

  const [showMoreLinks, setShowMoreLinks] = useState(false);
  const [showMoreProducts, setShowMoreProducts] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Quick Links
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/aboutUs/" }, 
    { label: "Blog", to: "/blog/" }, 
    { label: "Contact Us", to: "/contact/" }, 
  ];

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categories = await dataService.getCategories();
        // Transform categories to product links format
        const formattedCategories = categories.map(cat => ({
          name: cat.name,
          link: `/products/c/${nameToSlug(cat.name)}/`,
          id: cat.id
        }));
        setProductCategories(formattedCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Fallback to default categories if API fails
        setProductCategories([
          { name: "Truck Tires", link: "/products/truck" },
          { name: "Bus Tires", link: "/products/bus" },
          { name: "OTR Tires", link: "/products/otr" },
          { name: "Industrial Tires", link: "/products/industrial" },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to convert name to slug
  const nameToSlug = (name) =>
    String(name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // Contact Information
  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-amber-500 text-lg" />,
      text: "406 East Huntington Drive, Suite 200, Monrovia, CA 91016",
      link: "https://maps.google.com/?q=63/16+Soi+Chumchon+Talat+Tha+Ruea+Khlong+Toei+Bangkok",
    },
    {
      icon: <FaPhone className="text-amber-500 text-lg" />,
      text: "(666) xxx-xxxx",
      link: "#",
    }, 
    {
      icon: <FaEnvelope className="text-amber-500 text-lg" />,
      text: "info@doublecoin.com",
      link: "mailto:info@doublecoin.com",
    },
  ];

  // Social Links
  const socialLinks = [
    { icon: <FaFacebookF />, to: "https://facebook.com", label: "Facebook" },
    { icon: <FaInstagram />, to: "https://instagram.com", label: "Instagram" },
    { icon: <FaLinkedinIn />, to: "https://linkedin.com", label: "LinkedIn" },
    { icon: <FaYoutube />, to: "https://youtube.com", label: "YouTube" },
    { icon: <FaGlobe />, to: "https://heavydutytires.com", label: "Website" },
  ];

  // Trust Badges
  const trustBadges = [
    { icon: <FaTruck />, text: "Global Shipping" },
    { icon: <FaShieldAlt />, text: "Certified Quality" },
    { icon: <FaClock />, text: "24/7 Support" },
  ];

  // Determine which categories to show
  const displayedCategories = showMoreProducts ? productCategories : productCategories.slice(0, 4);
  const hasMoreCategories = productCategories.length > 4;

  return (
    <footer className="relative bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
      
      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-9">
        
        {/* Top Section - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-15 h-10 rounded-lg flex items-center justify-center">
                 <img src="/double.png" alt="Logo" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Double<span className="text-amber-500">Coin</span></h3>
                <p className="text-gray-500 text-xs">Tires Manufacturer</p>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium commercial vehicle tires for trucks, buses, OTR, and industrial applications. 
              Trusted by fleet operators in 100+ countries.
            </p>   
            <div className="flex gap-3 justify-center">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-900 hover:bg-amber-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))} 
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 pb-2 border-b border-gray-800 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-4">
              {(showMoreLinks ? quickLinks : quickLinks.slice(0, 6)).map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.to}
                    className="text-gray-400 hover:text-amber-500 text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {quickLinks.length > 6 && (
              <button
                onClick={() => setShowMoreLinks(!showMoreLinks)}
                className="mt-4 text-amber-500 hover:text-amber-400 text-sm font-medium transition"
              >
                {showMoreLinks ? "Show Less ↑" : "Show More ↓"}
              </button>
            )}
          </div>

          {/* Column 3: Products - Dynamically loaded categories */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 pb-2 border-b border-gray-800 inline-block">
              Our Products
            </h4>
            
            {loadingCategories ? (
              // Loading skeleton
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-gray-800 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                <ul className="space-y-4">
                  {displayedCategories.map((product, idx) => (
                    <li key={product.id || idx}>
                      <Link
                        href={product.link}
                        className="text-gray-400 hover:text-amber-500 text-sm transition-colors duration-200 flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition" />
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Show More/Less Button */}
                {hasMoreCategories && (
                  <button
                    onClick={() => setShowMoreProducts(!showMoreProducts)}
                    className="mt-4 text-amber-500 hover:text-amber-400 text-sm font-medium transition flex items-center gap-1"
                  >
                    {showMoreProducts ? (
                      <>Show Less ↑</>
                    ) : (
                      <>Show More ↓ ({productCategories.length - 4} more)</>
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 pb-2 border-b border-gray-800 inline-block">
              Contact Us
            </h4>
            <div className="space-y-4">
              {contactInfo.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  target={item.link.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-amber-500 text-sm transition-colors duration-200 group"
                >
                  <span className="mt-0.5">{item.icon}</span>
                  <span className="leading-relaxed">{item.text}</span>
                </a>
              ))}
            </div>
          </div>
        </div> 

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Double Coin. All rights reserved.
            </p>

            {/* Additional Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link href="/privacy" className="text-gray-500 hover:text-amber-500 text-xs transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-amber-500 text-xs transition">
                Terms of Service
              </Link> 
            </div> 
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-10 h-10 bg-amber-600 hover:bg-amber-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </footer>
  );
}