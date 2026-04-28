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
  
  if (pathname?.startsWith("/dashboard")) return null;

  const [showMoreLinks, setShowMoreLinks] = useState(false);
  const [showMoreProducts, setShowMoreProducts] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/aboutUs/" }, 
    { label: "Blog", to: "/blog/" }, 
    { label: "Contact Us", to: "/contact/" }, 
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categories = await dataService.getCategories();
        const formattedCategories = categories.map(cat => ({
          name: cat.name,
          link: `/products/c/${nameToSlug(cat.name)}/`,
          id: cat.id
        }));
        setProductCategories(formattedCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
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

  const nameToSlug = (name) =>
    String(name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

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

  const socialLinks = [
    { icon: <FaFacebookF />, to: "#", label: "Facebook" },
    { icon: <FaInstagram />, to: "#", label: "Instagram" },
    { icon: <FaLinkedinIn />, to: "#", label: "LinkedIn" },
    { icon: <FaYoutube />, to: "#", label: "YouTube" },
    { icon: <FaGlobe />, to: "#", label: "Website" },
  ];

  const trustBadges = [
    { icon: <FaTruck />, text: "Global Shipping" },
    { icon: <FaShieldAlt />, text: "Certified Quality" },
    { icon: <FaClock />, text: "24/7 Support" },
  ];

  const displayedCategories = showMoreProducts ? productCategories : productCategories.slice(0, 4);
  const hasMoreCategories = productCategories.length > 4;

  return (
    <footer className="relative bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
      
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-9">
        
        {/* ✅ UPDATED GRID */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Column 1 */}
          <div className="space-y-4 col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-15 h-10 rounded-lg flex items-center justify-center">
                 <img src="/double.png" alt="Logo" />
              </div>
            </div>
              <div> 
                <p className="text-gray-500 text-xs">Tires Manufacturer</p>
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
                >
                  {social.icon}
                </a>
              ))} 
            </div>
          </div>

          {/* Column 2 */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold text-lg mb-5 pb-2 border-b border-gray-800 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.to}
                    className="text-gray-400 hover:text-amber-500 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold text-lg mb-5 pb-2 border-b border-gray-800 inline-block">
              Our Products
            </h4>

            {loadingCategories ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-gray-800 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <ul className="space-y-4">
                {displayedCategories.map((product, idx) => (
                  <li key={idx}>
                    <Link
                      href={product.link}
                      className="text-gray-400 hover:text-amber-500 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition" />
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 4 */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold text-lg mb-5 pb-2 border-b border-gray-800 inline-block">
              Contact Us
            </h4>
            <div className="space-y-4">
              {contactInfo.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  className="flex items-start gap-3 text-gray-400 hover:text-amber-500 text-sm"
                >
                  {item.icon}
                  <span>{item.text}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-800/50 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Double Coin. All rights reserved.
        </div>
      </div>

      {/* Scroll Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-10 h-10 bg-amber-600 rounded-full text-white"
      >
        ↑
      </button>
    </footer>
  );
}