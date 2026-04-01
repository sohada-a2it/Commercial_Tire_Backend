"use client";

import React, { useState } from "react";
import { Link, usePathname } from "@/lib/navigation";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;
  const [showMoreLinks, setShowMoreLinks] = useState(false);
  const [showMoreProducts, setShowMoreProducts] = useState(false);

  const infoLinks = [
    { label: "Contact", to: "/contact" },
    { label: "About Us", to: "/aboutUs" },
    { label: "Shipping & Delivery", to: "/shipping" },
    { label: "Return Policy", to: "/returns" },
    { label: "Privacy Policy", to: "/privacy" },
  ];

  const productCategories = [
    { name: "Vehicle Parts & Accessories", hash: "Vehicle-Parts-and-Accessories" },
    { name: "Metals & Metal Products", hash: "Metals-and-Metal-Products" },
    { name: "Dry Food", hash: "Dry-Food" },
    { name: "Agriculture", hash: "Agriculture" },
    { name: "Frozen Fish", hash: "Frozen-Fish" },
    { name: "Wood Products", hash: "Wood-Products" },
  ];

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-amber-400" />,
      text:
        "63/16 Soi Chumchon Talat Tha Ruea Khlong Toei Khwaeng Khlong Toei, Khet Khlong Toei Krung Thep Maha Nakhon 10110, Thailand",
      link: "#",
    },
    {
      icon: <FaPhone className="text-amber-400" />,
      text: "+14379003996",
      link: "tel:+14379003996",
    },
    {
      icon: <FaEnvelope className="text-amber-400" />,
      text: "info@asianimportexport.com",
      link: "mailto:info@asianimportexport.com",
    },
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, to: "#", color: "hover:text-blue-500" },
    { icon: <FaInstagram />, to: "#", color: "hover:text-pink-500" },
    { icon: <FaTwitter />, to: "#", color: "hover:text-blue-400" },
    { icon: <FaYoutube />, to: "#", color: "hover:text-red-500" },
    { icon: <FaGlobe />, to: "asianimportexport.com", color: "hover:text-teal-400" },
  ];

  return (
    <footer className="bg-gradient-to-b from-teal-900 to-teal-800 text-gray-200 pt-12 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="lg:col-span-2">
          <div className="flex items-center mb-6">

          <img
            src="/logo.png"
            alt="Asian Import and Export"
            className="h-14 mb-0"
          />
          <div className="ml-1 text-white">
              <p className="font-semibold text-lg">ASIAN IMPORT & EXPORT Co. LTD</p>
              <p className="text-sm text-yellow-500 ">Manufacturer & Wholesaler</p>
            </div>
          </div>

          <div className="space-y-3">
            {contactInfo.map((item, index) => (
              <div key={index} className="flex items-center">
                <span className="mr-3 text-lg">{item.icon}</span>
                <a href={item.link} className="hover:text-amber-300">
                  {item.text}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold text-white mb-5 pb-2 border-b border-teal-700">
            Quick Links
          </h4>

          <ul className="space-y-3">
            {(showMoreLinks ? infoLinks : infoLinks.slice(0, 3)).map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="flex items-center hover:text-amber-300">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {infoLinks.length > 3 && (
            <button
              onClick={() => setShowMoreLinks(!showMoreLinks)}
              className="mt-3 text-sm text-amber-400 hover:text-amber-300"
            >
              {showMoreLinks ? "Less −" : "More +"}
            </button>
          )}
        </div>

        {/* Our Products */}
        <div>
          <h4 className="text-xl font-semibold text-white mb-5 pb-2 border-b border-teal-700">
            Our Products
          </h4>

          <ul className="space-y-3">
            {(showMoreProducts
              ? productCategories
              : productCategories.slice(0, 3)
            ).map((category) => (
              <li key={category.name}>
                <Link to={`/#${category.hash}`} className="flex items-center hover:text-amber-300">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>

          {productCategories.length > 3 && (
            <button
              onClick={() => setShowMoreProducts(!showMoreProducts)}
              className="mt-3 text-sm text-amber-400 hover:text-amber-300"
            >
              {showMoreProducts ? "Less −" : "More +"}
            </button>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto mt-5 pt-5 border-t border-teal-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-5 mb-4 md:mb-0">
            {socialLinks.map((social, index) => (
              <a key={index} href={social.to} className={`text-2xl ${social.color}`}>
                {social.icon}
              </a>
            ))}
          </div>

          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Asian Import & Export Co., LTD. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
