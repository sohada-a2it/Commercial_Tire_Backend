"use client";

import React, { useState, useEffect, useRef } from "react";

const TruckTireBanner = ({ onBrandClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Brand data with images
  const brands = [
    {
      name: "Bridgestone",
      image: "/assets/truckbanner/bridgestone.webp",
    },
    {
      name: "Double Coin",
      image: "/assets/truckbanner/doublecoin.webp",
    },
    {
      name: "Firestone",
      image: "/assets/truckbanner/firestone.webp",
    },
    {
      name: "Goodyear",
      image: "/assets/truckbanner/goodyear.webp",
    },
    {
      name: "Michelin",
      image: "/assets/truckbanner/michelin.webp",
    },
    {
      name: "Roadlux",
      image: "/assets/truckbanner/roadlux.webp",
    },
  ];

  const VISIBLE_CARDS = 3;
  const CARD_WIDTH = 33.333; // percentage width for each card

  // Auto slide every 3 seconds
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const startAutoSlide = () => {
    stopAutoSlide();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= brands.length) {
          return 0;
        }
        return next;
      });
    }, 3000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const prevSlide = () => {
    stopAutoSlide();
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return brands.length - 1;
      }
      return prev - 1;
    });
    startAutoSlide();
  };

  const nextSlide = () => {
    stopAutoSlide();
    setCurrentIndex((prev) => {
      if (prev >= brands.length - 1) {
        return 0;
      }
      return prev + 1;
    });
    startAutoSlide();
  };

  const handleBrandClick = (brandName) => {
    if (onBrandClick) {
      onBrandClick(brandName);
    }
  };

  // Calculate visible brands for smooth transition
  const getVisibleBrands = () => {
    const visible = [];
    for (let i = 0; i < VISIBLE_CARDS; i++) {
      const index = (currentIndex + i) % brands.length;
      visible.push({ ...brands[index], originalIndex: index });
    }
    return visible;
  };

  const visibleBrands = getVisibleBrands();

  return (
    <div className="mb-4 relative">

      <div className="relative max-w-6xl mx-auto overflow-hidden">
        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-teal-600 rounded-full p-2 shadow-lg hover:bg-teal-600 hover:text-white z-10 transition-all duration-300"
          aria-label="Previous"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-teal-600 rounded-full p-2 shadow-lg hover:bg-teal-600 hover:text-white z-10 transition-all duration-300"
          aria-label="Next"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Slider container */}
        <div className="overflow-hidden rounded-lg">
          <div className="flex gap-4 transition-transform duration-500 ease-in-out">
            {visibleBrands.map((brand, idx) => (
              <div
                key={`${brand.name}-${idx}`}
                className="flex-shrink-0 w-full md:w-1/3"
              >
                <div
                  className="rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative group h-32 md:h-44 "
                  onClick={() => handleBrandClick(brand.name)}
                  style={{
                    backgroundImage: `url(${brand.image})`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Overlay for better button visibility */}


                  {/* Content */}
                  <div className="relative h-full flex items-end justify-end p-2">
                    {/* Shop Now Button */}
                    <button className="bg-transparent border border-teal-200 text-sm text-teal-600 px-3 py-1 rounded-full font-semibold transition-all duration-300 hover:bg-teal-600 hover:text-white hover:border-teal-100 shadow-lg transform group-hover:scale-110 ">
                       Shop Now
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-2 mt-2">
          {brands.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                stopAutoSlide();
                setCurrentIndex(idx);
                startAutoSlide();
              }}
              className={`w-2 h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-teal-600 w-9"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TruckTireBanner;
