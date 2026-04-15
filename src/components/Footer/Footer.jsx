"use client";

import React, { useState } from "react";
import { Link, usePathname, useRouter } from "@/lib/navigation";
import { useData } from "@/context/DataContext";
import { nameToSlug } from "@/lib/seoMetadata";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaVoicemail,
  FaWhatsapp,
} from "react-icons/fa";
import { MdOutlineMarkEmailRead } from "react-icons/md";

const Footer = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;
  const [showMoreLinks, setShowMoreLinks] = useState(false);
  const [showMoreProducts, setShowMoreProducts] = useState(false);
  const { categories } = useData();
  const router = useRouter();

  const infoLinks = [
    { label: "Contact", to: "/contact" },
    { label: "About Us", to: "/aboutUs" },
    { label: "Shipping & Delivery", to: "/shipping" },
    { label: "Return Policy", to: "/returns" },
    { label: "Privacy Policy", to: "/privacy" },
  ];

  const normalizeCategoryHash = (category) => {
    if (!category?.name) return "";
    return nameToSlug(category.name);
  };

  const fallbackProductCategories = [
    { name: "Vehicle Parts & Accessories", hash: normalizeCategoryHash({ name: "Vehicle Parts & Accessories" }) },
    { name: "Metals & Metal Products", hash: normalizeCategoryHash({ name: "Metals & Metal Products" }) },
    { name: "Dry Food", hash: normalizeCategoryHash({ name: "Dry Food" }) },
    { name: "Agriculture", hash: normalizeCategoryHash({ name: "Agriculture" }) },
    { name: "Frozen Fish", hash: normalizeCategoryHash({ name: "Frozen Fish" }) },
    { name: "Wood Products", hash: normalizeCategoryHash({ name: "Wood Products" }) },
  ];

  const productCategories = Array.isArray(categories) && categories.length > 0
    ? categories.map((category) => ({
        name: category?.name || "Unnamed category",
        hash: category?.slug || normalizeCategoryHash(category),
      }))
    : fallbackProductCategories;

  const scrollToCategory = async (hash) => {
    if (!hash) return;
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${hash}`);
    } else {
      await router.push(`/#${hash}`);
    }
  };

  const handleCategoryClick = async (event, hash) => {
    if (!hash) return;
    const shouldScrollInPlace = pathname === "/" || pathname === "";
    if (shouldScrollInPlace) {
      event.preventDefault();
      await scrollToCategory(hash);
    }
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-amber-400" />,
      text:
        "63/16 Soi Chumchon Talat Tha Ruea Khlong Toei Khwaeng Khlong Toei, Khet Khlong Toei Krung Thep Maha Nakhon 10110, Thailand",
      link: "#",
    },
    {
      icon: <FaPhone className="text-amber-400" />,
      text: "+6621055786",
      link: "tel:+6621055786",
    },
    {
      icon: <FaWhatsapp className="text-amber-400" />,
      text: "+14379003996",
      link: "tel:+14379003996",
    },
    {
      icon: <MdOutlineMarkEmailRead className="text-amber-400" />,
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
    <footer className="bg-gradient-to-b from-teal-900 to-teal-800 text-gray-200 pt-8 sm:pt-12 pb-5 sm:pb-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        {/* Company Info */}
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center mb-4 sm:mb-6">

          <img
            src="/logo.png"
            alt="Asian Import and Export"
            className="h-11 sm:h-14 mb-0"
          />
          <div className="ml-1 text-white leading-tight">
              <p className="font-semibold text-sm md:text-base ">ASIAN IMPORT & EXPORT Co. LTD</p>
              <p className="text-xs sm:text-sm text-yellow-500">Manufacturer & Wholesaler</p>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {[contactInfo[0]].map((item, index) => (
              <div key={`contact-top-${index}`} className="flex items-start text-sm sm:text-base">
                <span className="mr-2 sm:mr-3 text-base sm:text-lg mt-0.5">{item.icon}</span>
                <a href={item.link} className="hover:text-amber-300 leading-snug">
                  {item.text}
                </a>
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-4 sm:gap-10 text-sm sm:text-base">
              {contactInfo.slice(1, 3).map((item, index) => (
                <div key={`contact-phone-${index}`} className="flex items-center">
                  <span className="mr-1 text-base sm:text-lg">{item.icon}</span>
                  <a href={item.link} className="hover:text-amber-300">
                    {item.text}
                  </a>
                </div>
              ))}
            </div>

            {contactInfo.slice(3).map((item, index) => (
              <div key={`contact-bottom-${index}`} className="flex items-center text-sm sm:text-base">
                <span className="mr-1 text-base sm:text-lg">{item.icon}</span>
                <a href={item.link} className="hover:text-amber-300">
                  {item.text}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="col-span-1">
          <h4 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-5 pb-2 border-b border-teal-700">
            Quick Links
          </h4>

          <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
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
        <div className="col-span-1">
          <h4 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-5 pb-2 border-b border-teal-700">
            Our Products
          </h4>

          <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            {(showMoreProducts
              ? productCategories
              : productCategories.slice(0, 3)
            ).map((category) => (
              <li key={category.name}>
                <Link
                  to={`/#${category.hash}`}
                  onClick={(event) => handleCategoryClick(event, category.hash)}
                  className="flex items-center hover:text-amber-300"
                >
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
      <div className="max-w-7xl mx-auto mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-teal-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 sm:space-x-5 mb-3 sm:mb-4 md:mb-0">
            {socialLinks.map((social, index) => (
              <a key={index} href={social.to} className={`text-xl sm:text-2xl ${social.color}`}>
                {social.icon}
              </a>
            ))}
          </div>

          <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
            © {new Date().getFullYear()} Asian Import & Export Co., LTD. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
