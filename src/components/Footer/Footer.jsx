"use client";

import React, { useState } from "react";
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

export default function Footer() {
  const pathname = usePathname();
  
  // Dashboard এ Footer দেখাবে না
  if (pathname?.startsWith("/dashboard")) return null;

  const [showMoreLinks, setShowMoreLinks] = useState(false);
  const [showMoreProducts, setShowMoreProducts] = useState(false);

  // Quick Links
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" }, 
    { label: "News & Blog", to: "/news" }, 
    { label: "Contact Us", to: "/contact" }, 
  ];

  // Product Categories (Tire specific)
  const productCategories = [
    { name: "Truck Tires", link: "/products/truck" },
    { name: "Bus Tires", link: "/products/bus" },
    { name: "OTR Tires", link: "/products/otr" },
    { name: "Industrial Tires", link: "/products/industrial" }, 
  ];

  // Contact Information
  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-amber-500 text-lg" />,
      text: "63/16 Soi Chumchon Talat Tha Ruea, Khlong Toei, Bangkok 10110, Thailand",
      link: "https://maps.google.com/?q=63/16+Soi+Chumchon+Talat+Tha+Ruea+Khlong+Toei+Bangkok",
    },
    {
      icon: <FaPhone className="text-amber-500 text-lg" />,
      text: "+66 2105 5786",
      link: "tel:+6621055786",
    }, 
    {
      icon: <FaEnvelope className="text-amber-500 text-lg" />,
      text: "info@heavydutytires.com",
      link: "mailto:info@heavydutytires.com",
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

  return (
    <footer className="relative bg-gray-600 border-t border-gray-800">
      
      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-9">
        
        {/* Top Section - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                 <img src="/logo (2).png" alt="" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Commercial<span className="text-amber-500">Tire</span></h3>
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
          </div>

          {/* Column 3: Products */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 pb-2 border-b border-gray-800 inline-block">
              Our Products
            </h4>
            <ul className="space-y-4">
              {(showMoreProducts ? productCategories : productCategories.slice(0, 4)).map((product, idx) => (
                <li key={idx}>
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
              © {new Date().getFullYear()} Commercial Tires. All rights reserved.
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
        className="fixed bottom-1 right-1 w-10 h-10 bg-amber-600 hover:bg-amber-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </footer>
  );
}