"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const Highlight = ({ children }) => (
  <span className="relative whitespace-nowrap">
    <span className="absolute inset-0 -skew-x-6 bg-gradient-to-r from-teal-500/30 via-teal-600/30 to-amber-500/30 blur-sm" />
    <span className="relative font-semibold text-teal-100 drop-shadow">
      {children}
    </span>
  </span>
);

const StatCard = ({ number, label, suffix = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center p-6"
  >
    <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-amber-400 bg-clip-text text-transparent mb-2">
      {number}{suffix}
    </div>
    <div className="text-teal-200 font-medium">{label}</div>
  </motion.div>
);

export default function AboutUs() {
  return (
    <div className="min-h-screen w-full bg-teal-950 text-teal-100 py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-20">

        {/* Hero Section */}
        <section className="relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full 
            bg-teal-900 border border-teal-700 shadow-lg shadow-black/30 mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-amber-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-teal-200">
                ESTABLISHED 2017
              </span>
            </div>

            <h1 className="text-5xl font-extrabold md:text-7xl mb-6 text-teal-100">
              About <Highlight>Us</Highlight>
            </h1>

            <p className="text-xl text-teal-200 max-w-4xl mx-auto leading-relaxed">
              Asian Import and Export Co., LTD supplies high-quality food
              products worldwide — while treating our team like family and
              supporting the communities we serve.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-teal-900/40 rounded-3xl p-8 shadow-xl border border-teal-800"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-teal-800">
            <StatCard number="10+" label="Years Experience" />
            <StatCard number="50+" label="Countries Served" />
            <StatCard number="5000+" label="Products" />
            <StatCard number="99.8" label="Satisfaction Rate" suffix="%" />
          </div>
        </motion.section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-teal-900/40 rounded-3xl p-8 shadow-lg border border-teal-800">
              <h2 className="text-4xl font-bold text-teal-100 mb-6">
                Our Story
              </h2>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/5">
                  <div className="relative group">
                    <img
                      src="/assets/certificate.webp"
                      alt="Certification"
                      className="rounded-2xl shadow-lg w-full object-cover transform group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>

                <div className="lg:w-3/5 space-y-6">
                  <p className="text-teal-200 leading-relaxed">
                    Founded in 2013, we grew from a local trading company into
                    a global supplier delivering premium food-grade products.
                  </p>
                  <p className="text-teal-200 leading-relaxed">
                    We distribute across Asia, America, Australia, Europe,
                    South Africa, CIS, and the Middle East.
                  </p>
                  <p className="text-teal-200 leading-relaxed">
                    Our logistics partners ensure top-tier shipping, safety,
                    and temperature-controlled transport globally.
                  </p>
                  <p className="text-teal-200 leading-relaxed">
                    Committed to sustainability, we prioritize eco-friendly
                    sourcing and community support in all our operations.
                  </p>
                  <p className="text-teal-200 leading-relaxed">
                    At Asian Import and Export Co., LTD, we blend tradition
                    with innovation to deliver excellence worldwide.
                  </p>
                </div>
              </div>
            </div>

            {/* Trade Trends - Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-900/50 to-amber-900/30 rounded-3xl p-6 shadow-lg border border-teal-800">
                <h3 className="text-2xl font-bold text-teal-100 mb-2">
                  Trade Performance & Analytics
                </h3>
                <p className="text-teal-300 text-sm">
                  Comprehensive trade data and shipment history
                </p>
              </div>



              {/* Trade Trends Image with Enhanced Design */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-amber-500/10 to-teal-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-teal-900/40 to-amber-900/20 rounded-3xl p-6 shadow-xl border border-teal-800/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-teal-100">Detailed Trade Analysis</h4>
                      <p className="text-teal-300 text-sm">Shipment history and market insights</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-600/30 to-amber-600/30 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Image
                      src="/assets/trand.webp"
                      alt="Trade Trends Chart"
                      width={1200}
                      height={600}
                      className="w-full h-auto rounded-xl shadow-lg border border-teal-500/50 transform group-hover:scale-[1.01] transition duration-300"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-teal-800/50">
                    <p className="text-teal-300 text-sm">
                      Real-time tracking and comprehensive trade analytics
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-amber-300">LIVE DATA</span>
                    </div>
                  </div>
                </div>
              </div>


                            {/* Main Trade Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Exported */}
                <div className="bg-gradient-to-br from-teal-900/40 to-teal-800/20 rounded-2xl p-6 border border-teal-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full">EXPORT</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-400">54</div>
                  <div className="text-teal-200 text-sm mt-1">Shipments</div>
                  <div className="text-teal-300 font-medium mt-2">$6.69M Trade Value</div>
                </div>

                {/* Imported */}
                <div className="bg-gradient-to-br from-teal-900/40 to-teal-800/20 rounded-2xl p-6 border border-teal-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full">IMPORT</span>
                  </div>
                  <div className="text-3xl font-bold text-teal-400">17</div>
                  <div className="text-teal-200 text-sm mt-1">Shipments</div>
                  <div className="text-teal-300 font-medium mt-2">$427.52K Trade Value</div>
                </div>

                {/* Trade Platforms */}
                <div className="bg-gradient-to-br from-amber-900/20 to-teal-900/30 rounded-2xl p-6 border border-teal-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-amber-200 bg-amber-600/10 px-3 py-1 rounded-full">DATA</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-teal-200 text-sm font-medium">Complete Trade Data Available</p>
                    <div className="space-y-2">
                      <Link 
                        href="https://importkey.com/i/asian-import-export-co-ltd" 
                        target="_blank"
                        className="flex items-center justify-between w-full px-4 py-2 bg-gradient-to-r from-amber-600/20 to-amber-700/10 hover:from-amber-600/30 hover:to-amber-700/20 border border-amber-500/30 rounded-lg text-amber-300 transition duration-300 group"
                      >
                        <span className="text-sm font-medium">ImportKey</span>
                        <svg className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                      <Link 
                        href="https://www.trademo.com/companies/asian-import-export-company/16730345" 
                        target="_blank"
                        className="flex items-center justify-between w-full px-4 py-2 bg-gradient-to-r from-teal-600/20 to-teal-700/10 hover:from-teal-600/30 hover:to-teal-700/20 border border-teal-500/30 rounded-lg text-teal-300 transition duration-300 group"
                      >
                        <span className="text-sm font-medium">Trademo</span>
                        <svg className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-teal-900/30 rounded-3xl p-8 shadow-lg border border-teal-800"
            >
              <h3 className="text-2xl font-bold text-teal-100 mb-6">
                Our Products
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Raw Jute & Jute Goods",
                  "Genuine Leathers",
                  "Agro Commodities",
                  "Terracotta Tiles",
                  "Plastic Scrap/Flakes",
                  "Food Products"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-teal-800/50 rounded-xl hover:bg-teal-700/50 transition duration-300">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-teal-200">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* Managing Director */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-teal-900/40 rounded-3xl p-8 shadow-lg border border-teal-800"
            >
              <h2 className="text-3xl font-bold text-teal-100 mb-6">
                Leadership
              </h2>
              
              <div className="flex flex-col items-center text-center">
                <div className="relative w-48 h-48 mb-6 rounded-2xl overflow-hidden border-4 border-amber-500/30 group">
                  <img 
                    src="/assets/leader.webp" 
                    alt="Sewkumar Singh - Managing Director"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-950/60 via-transparent to-transparent"></div>
                  <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">MD</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-amber-300">Sewkumar Singh</h3>
                <p className="text-teal-300 mb-4">Managing Director</p>
                <p className="text-teal-200 text-sm mb-6">
                  With over a decade of experience in international trade, Sewkumar leads our global operations with a focus on quality and customer satisfaction.
                </p>
                
                <Link 
                  href="https://www.dnb.com/business-directory/company-profiles.asian_import__export_company_limited.5e1c2886b6ec1d7bf335ba958abe0232.html" 
                  target="_blank"
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-amber-600 hover:from-teal-500 hover:to-amber-500 rounded-xl font-medium transition duration-300 flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Company Registration
                </Link>
              </div>
            </motion.div>

            {/* Global Reach */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-teal-900/40 rounded-3xl p-8 shadow-lg border border-teal-800"
            >
              <h2 className="text-3xl font-bold text-teal-100 mb-6">
                Global Reach
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {[
                  "Asia","America","Australia","Europe",
                  "South Africa","CIS Countries","Middle East","Eastern Europe"
                ].map((region, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                    className="flex items-center p-4 rounded-xl bg-teal-800/40 border border-teal-700 hover:bg-teal-700/40 transition group"
                  >
                    <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-amber-400 rounded-full mr-4 group-hover:scale-125 transition"></div>
                    <span className="text-teal-200">{region}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-teal-900/40 rounded-3xl p-8 shadow-lg border border-teal-800"
            >
              <h3 className="text-xl font-bold text-teal-100 mb-4">Mission</h3>
              <p className="text-teal-200 leading-relaxed">
                To process, market, and export high-quality commodities while
                maintaining sustainable business practices.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-teal-900/40 rounded-3xl p-8 shadow-lg border border-teal-800"
            >
              <h3 className="text-xl font-bold text-teal-100 mb-4">Vision</h3>
              <p className="text-teal-200 leading-relaxed">
                To be a leading global exporter maintaining international quality
                and safety standards.
              </p>
            </motion.div>

          </div>
        </div>

        {/* Values */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <h2 className="text-5xl font-bold text-teal-100 mb-4">
            Our Values
          </h2>

          <p className="text-xl text-teal-200 mb-12 max-w-2xl mx-auto">
            The principles that define our culture
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality Excellence",
                desc: "Highest standards in all products & services",
                icon: "✓",
                color: "from-teal-400 to-green-400"
              },
              {
                title: "Integrity First",
                desc: "We build trust through honesty & transparency",
                icon: "🤝",
                color: "from-blue-400 to-cyan-400"
              },
              {
                title: "Innovation Driven",
                desc: "Improving processes through technology",
                icon: "💡",
                color: "from-amber-400 to-orange-400"
              },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                className="bg-teal-900/40 rounded-3xl p-8 shadow-lg border border-teal-800 hover:bg-teal-800/40 transition"
              >
                <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${v.color} flex items-center justify-center mb-6 text-2xl text-white`} >
                  {v.icon}
                </div>
                <h3 className="text-2xl font-bold text-teal-100 mb-4">
                  {v.title}
                </h3>
                <p className="text-teal-200">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Verification Links */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="bg-teal-900/40 rounded-3xl p-8 shadow-lg border border-teal-800"
        >
          <h3 className="text-2xl font-bold text-teal-100 mb-6 text-center">
            Company Verification & Tracking
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="https://www.dnb.com/business-directory/company-profiles.asian_import__export_company_limited.5e1c2886b6ec1d7bf335ba958abe0232.html" 
              target="_blank"
              className="bg-gradient-to-br from-teal-800/50 to-amber-900/30 hover:from-teal-700/50 hover:to-amber-800/30 border border-teal-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition duration-300 group"
            >
              <div className="w-16 h-16 bg-teal-700/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-teal-100 mb-2">D&B Business Directory</h4>
              <p className="text-teal-300 text-sm">Official company registration and profile verification</p>
            </Link>
            
            <Link 
              href="https://importkey.com/i/asian-import-export-co-ltd" 
              target="_blank"
              className="bg-gradient-to-br from-teal-800/50 to-amber-900/30 hover:from-teal-700/50 hover:to-amber-800/30 border border-teal-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition duration-300 group"
            >
              <div className="w-16 h-16 bg-teal-700/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-teal-100 mb-2">ImportKey Tracking</h4>
              <p className="text-teal-300 text-sm">Real-time shipment tracking and trade data</p>
            </Link>
            
            <Link 
              href="https://www.trademo.com/companies/asian-import-export-company/16730345" 
              target="_blank"
              className="bg-gradient-to-br from-teal-800/50 to-amber-900/30 hover:from-teal-700/50 hover:to-amber-800/30 border border-teal-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition duration-300 group"
            >
              <div className="w-16 h-16 bg-teal-700/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-teal-100 mb-2">Trademo Company Profile</h4>
              <p className="text-teal-300 text-sm">Complete business intelligence and trade history</p>
            </Link>
          </div>
        </motion.section>

      </div>
    </div>
  );
}