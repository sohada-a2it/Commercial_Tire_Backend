"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import Image from "next/image";

const Banner = () => {
  return (
    <div className="relative w-full min-h-[500px] md:min-h-[500px] flex items-center justify-center overflow-hidden">

      {/* Background Image */}
      <Image
        src="/banner.png"
        alt="Industrial Tire Banner"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark Industrial Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-black/30"></div>

      {/* Subtle Metallic Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.05)_50%,transparent_60%)]"></div>

      {/* Content */}
      <div className="relative z-10 px-4 w-full max-w-5xl text-center">

        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-5 mb-6">

          {/* Logo */}
          <Image
            src="/double.png"
            alt="Logo"
            width={200}
            height={200}
            className="object-contain"
          />

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-wide leading-tight">
            HIGH PERFORMANCE TIRES
            <br />
            <span className="text-amber-500">
              FOR COMMERCIAL USE
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-300 text-sm md:text-lg max-w-2xl tracking-wide">
            Built for strength, endurance, and long-haul performance across global logistics and heavy-duty transportation.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

          {/* Products Button */}
          <Link
            to="/productList"
            className="group relative px-7 py-3 border border-amber-500 text-white font-semibold tracking-wide overflow-hidden transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10">EXPLORE PRODUCTS</span>
            <div className="absolute inset-0 bg-amber-500 opacity-0 group-hover:opacity-100 transition"></div>
          </Link>

          {/* Dealer Button */}
          <Link
            to="/findDealer"
            className="group relative px-7 py-3 bg-amber-500 text-white font-semibold tracking-wide overflow-hidden transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10">FIND DEALER</span>
            <div className="absolute inset-0 bg-amber-500 opacity-0 group-hover:opacity-100 transition"></div>
          </Link>

        </div>

      </div>
    </div>
  );
};

export default Banner;