"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  FaCheck, 
  FaHandshake, 
  FaLightbulb, 
  FaGlobe, 
  FaChartLine, 
  FaFileAlt,
  FaShip,
  FaBox,
  FaBuilding,
  FaUserTie,
  FaTrophy,
  FaUsers,
  FaRocket,
  FaShieldAlt,
  FaClock,
  FaLeaf,
  FaAward,
  FaEye
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const Highlight = ({ children }) => (
  <span className="relative inline-block">
    <span className="absolute inset-0 -skew-x-6 bg-gradient-to-r from-teal-500/20 via-teal-600/20 to-amber-500/20 rounded-md" />
    <span className="relative font-semibold text-teal-700 px-1">
      {children}
    </span>
  </span>
);

const StatCard = ({ number, label, suffix = "", icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="group"
  >
    <div className="relative text-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-300">
      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-amber-500 rounded-lg flex items-center justify-center mx-auto mb-3">
        <Icon className="text-white text-base" />
      </div>
      <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-amber-600 bg-clip-text text-transparent mb-0.5">
        {number}{suffix}
      </div>
      <div className="text-gray-500 text-xs">{label}</div>
    </div>
  </motion.div>
);

const ValueCard = ({ title, desc, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="group"
  >
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="text-white text-lg" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function AboutUs() {
  return (
    <div className="min-h-screen w-full bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-12">

        {/* Hero Section */}
        <section className="relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                ESTABLISHED 2017
              </span>
              <MdVerified className="text-teal-500 text-xs" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              About <span className="text-teal-600">Asian Import & Export</span>
            </h1>

            <div className="flex justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-teal-500 rounded-full"></div>
              <div className="w-6 h-0.5 bg-amber-500 rounded-full"></div>
            </div>

            <p className="text-gray-600 max-w-3xl mx-auto text-sm leading-relaxed">
              Asian Import and Export Co., LTD supplies high-quality food products worldwide — 
              while treating our team like family and supporting the communities we serve.
            </p>
          </motion.div>
        </section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard number="10" label="Years Experience" suffix="+" icon={FaTrophy} delay={0.1} />
          <StatCard number="50" label="Countries Served" suffix="+" icon={FaGlobe} delay={0.2} />
          <StatCard number="5000" label="Products" suffix="+" icon={FaBox} delay={0.3} />
          <StatCard number="99.8" label="Satisfaction Rate" suffix="%" icon={FaUsers} delay={0.4} />
        </motion.section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Our Story */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">Our Story</h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/5">
                  <div className="relative rounded-lg overflow-hidden shadow-sm">
                    <img
                      src="/assets/certificate.webp"
                      alt="Certification"
                      className="w-full object-cover"
                    />
                  </div>
                </div>

                <div className="lg:w-3/5 space-y-3">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Founded in 2013, we grew from a local trading company into a global supplier delivering premium food-grade products.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We distribute across Asia, America, Australia, Europe, South Africa, CIS, and the Middle East.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Our logistics partners ensure top-tier shipping, safety, and temperature-controlled transport globally.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Committed to sustainability, we prioritize eco-friendly sourcing and community support.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Trade Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-teal-600 to-amber-600 rounded-xl p-4 text-white">
                <h3 className="text-base font-bold mb-1">Trade Performance & Analytics</h3>
                <p className="text-teal-100 text-xs">Comprehensive trade data and shipment history</p>
              </div>

              {/* Trade Trends Image */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Detailed Trade Analysis</h4>
                    <p className="text-gray-500 text-xs">Shipment history and market insights</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-white text-sm" />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-2">
                  <Image
                    src="/assets/trand.webp"
                    alt="Trade Trends Chart"
                    width={1200}
                    height={600}
                    className="w-full h-auto rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <FaClock className="text-teal-500 text-xs" />
                    Real-time tracking
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-teal-600 font-medium">LIVE DATA</span>
                  </div>
                </div>
              </div>

              {/* Trade Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <FaShip className="text-white text-sm" />
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">EXPORT</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">54</div>
                  <div className="text-gray-500 text-xs mt-0.5">Shipments</div>
                  <div className="text-gray-700 text-sm font-medium mt-1">$6.69M Value</div>
                </div>

                <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <FaBox className="text-white text-sm" />
                    </div>
                    <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">IMPORT</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">17</div>
                  <div className="text-gray-500 text-xs mt-0.5">Shipments</div>
                  <div className="text-gray-700 text-sm font-medium mt-1">$427.5K Value</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                      <FaFileAlt className="text-white text-sm" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded">DATA</span>
                  </div>
                  <div className="space-y-2">
                    <Link 
                      href="https://importkey.com/i/asian-import-export-co-ltd" 
                      target="_blank"
                      className="flex items-center justify-between w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-xs hover:bg-amber-50 transition"
                    >
                      <span>ImportKey</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                    <Link 
                      href="https://www.trademo.com/companies/asian-import-export-company/16730345" 
                      target="_blank"
                      className="flex items-center justify-between w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-xs hover:bg-teal-50 transition"
                    >
                      <span>Trademo</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900">Our Products</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  "Raw Jute & Jute Goods",
                  "Genuine Leathers",
                  "Agro Commodities",
                  "Terracotta Tiles",
                  "Plastic Scrap/Flakes",
                  "Food Products"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-teal-50 transition">
                    <div className="w-1 h-1 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-700 text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-5">
            {/* Leadership */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-900">Leadership</h2>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 rounded-lg overflow-hidden border-2 border-teal-100 shadow-sm">
                  <img 
                    src="/assets/leader.webp" 
                    alt="Sewkumar Singh"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-base font-bold text-teal-700 mt-3">Sewkumar Singh</h3>
                <p className="text-gray-500 text-xs mb-2">Managing Director</p>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">
                  Over a decade of experience in international trade.
                </p>
                
                <Link 
                  href="https://www.dnb.com/business-directory/company-profiles.asian_import__export_company_limited.5e1c2886b6ec1d7bf335ba958abe0232.html" 
                  target="_blank"
                  className="w-full px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition text-center"
                >
                  View Registration
                </Link>
              </div>
            </motion.div>

            {/* Global Reach */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-900">Global Reach</h2>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Asia","America","Australia","Europe",
                  "South Africa","CIS","Middle East","East Europe"
                ].map((region, i) => (
                  <div key={i} className="flex items-center gap-1.5 p-1.5 rounded bg-gray-50">
                    <FaGlobe size={10} className="text-teal-500" />
                    <span className="text-gray-600 text-xs">{region}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mission & Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                    <FaRocket className="text-teal-600 text-xs" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Mission</h3>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed pl-8">
                  To process, market, and export high-quality commodities while maintaining sustainable business practices.
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FaEye className="text-amber-600 text-xs" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Vision</h3>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed pl-8">
                  To be a leading global exporter maintaining international quality and safety standards.
                </p>
              </div>
            </motion.div>

            {/* Sustainability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-4 text-center text-white"
            >
              <FaLeaf className="text-xl mx-auto mb-1" />
              <p className="text-sm font-semibold">Eco-Friendly Commitment</p>
              <p className="text-teal-100 text-xs mt-0.5">100% Sustainable Sourcing</p>
            </motion.div>
          </div>
        </div>

        {/* Values Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-1.5 bg-teal-50 px-3 py-1 rounded-full mb-4">
            <FaShieldAlt className="text-teal-500 text-xs" />
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Core Principles</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Values</h2>
          <div className="flex justify-center gap-1.5 mb-5">
            <div className="w-12 h-0.5 bg-teal-500 rounded-full"></div>
            <div className="w-6 h-0.5 bg-amber-500 rounded-full"></div>
          </div>
          <p className="text-gray-500 text-sm mb-8 max-w-2xl mx-auto">
            The principles that define our culture and drive our success
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ValueCard 
              title="Quality Excellence" 
              desc="Highest standards in all products & services with rigorous quality control" 
              icon={FaCheck}
              color="from-teal-500 to-teal-600"
              delay={0.7}
            />
            <ValueCard 
              title="Integrity First" 
              desc="We build lasting trust through honesty, transparency, and ethical practices" 
              icon={FaHandshake}
              color="from-blue-500 to-cyan-600"
              delay={0.8}
            />
            <ValueCard 
              title="Innovation Driven" 
              desc="Continuously improving processes through technology and creative solutions" 
              icon={FaLightbulb}
              color="from-amber-500 to-orange-600"
              delay={0.9}
            />
          </div>
        </motion.section>

        {/* Verification Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gray-900 rounded-xl p-6 text-white"
        >
          <h3 className="text-lg font-bold text-center mb-1">Company Verification</h3>
          <p className="text-gray-400 text-xs text-center mb-5">Verified business credentials and trade data</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="https://www.dnb.com/business-directory/company-profiles.asian_import__export_company_limited.5e1c2886b6ec1d7bf335ba958abe0232.html" 
              target="_blank"
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 flex flex-col items-center text-center transition"
            >
              <FaBuilding className="text-teal-300 text-xl mb-2" />
              <h4 className="text-sm font-bold mb-0.5">D&B Directory</h4>
              <p className="text-gray-400 text-xs">Company registration</p>
            </Link>
            
            <Link 
              href="https://importkey.com/i/asian-import-export-co-ltd" 
              target="_blank"
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 flex flex-col items-center text-center transition"
            >
              <FaChartLine className="text-amber-300 text-xl mb-2" />
              <h4 className="text-sm font-bold mb-0.5">ImportKey</h4>
              <p className="text-gray-400 text-xs">Shipment tracking</p>
            </Link>
            
            <Link 
              href="https://www.trademo.com/companies/asian-import-export-company/16730345" 
              target="_blank"
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 flex flex-col items-center text-center transition"
            >
              <FaGlobe className="text-teal-300 text-xl mb-2" />
              <h4 className="text-sm font-bold mb-0.5">Trademo</h4>
              <p className="text-gray-400 text-xs">Trade intelligence</p>
            </Link>
          </div>
        </motion.section>

      </div>
    </div>
  );
}