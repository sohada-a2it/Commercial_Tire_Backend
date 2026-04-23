"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";

const Banner = () => {
  return (
    <div className="relative w-full h-[420px] md:h-[520px] overflow-hidden">

      {/* SLIDER */}
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        loop={true}
        speed={1200}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        className="w-full h-full"
      >

        {/* Slide 1 */}
        <SwiperSlide>
          <div className="relative w-full h-full">

            {/* Background */}
            <Image
              src="/banner.png"
              alt="Industrial Tire Banner"
              fill
              priority
              className="object-cover scale-110 animate-[zoomSlow_10s_ease-in-out_forwards]"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/40"></div>

            {/* Subtle amber glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(245,158,11,0.12),transparent_60%)]"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">

              {/* Logo */}
              <Image
                src="/double.png"
                alt="Logo"
                width={120}
                height={120}
                className="mb-4 opacity-90 animate-fadeUp"
              />

              {/* Heading */}
              <h1 className="text-2xl md:text-5xl font-extrabold text-white leading-tight tracking-tight animate-fadeUp delay-150">
                BUILT FOR
                <br />
                <span className="text-amber-500">
                  EXTREME PERFORMANCE
                </span>
              </h1>

              {/* Divider */}
              <div className="w-16 h-[2px] bg-amber-500 mt-4 mb-4 animate-fadeUp delay-300"></div>

              {/* Description */}
              <p className="text-gray-400 max-w-md text-sm md:text-base animate-fadeUp delay-300">
                Engineered for durability, stability, and long-haul industrial performance.
              </p>

            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div className="relative w-full h-full">

            <Image
              src="/banner.png"
              alt="Industrial Tire Banner"
              fill
              className="object-cover scale-110 animate-[zoomSlow_10s_ease-in-out_forwards]"
            />

            <div className="absolute inset-0 bg-black/80"></div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">

              <h1 className="text-2xl md:text-5xl font-bold text-white animate-fadeUp">
                RELIABLE. DURABLE.
                <br />
                <span className="text-amber-500">
                  POWERFUL
                </span>
              </h1>

            </div>
          </div>
        </SwiperSlide>

      </Swiper>

      {/* 🔥 FLOATING PREMIUM BUTTONS */}
      {/* 🔥 FLOATING BUTTONS (NO BACKGROUND) */}
<div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-20 w-full px-4">

  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">

    {/* PRIMARY BUTTON */}
    <Link
      to="/productList"
      className="relative w-full sm:w-auto text-center px-6 py-3 text-white font-semibold rounded-full overflow-hidden group border border-amber-500"
    >
      <span className="relative z-10">Explore Products</span>

      {/* Liquid fill */}
      <span className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>

      {/* wave shine */}
      <span className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.6),transparent_60%)] group-hover:animate-wave"></span>
    </Link>

    {/* SECONDARY BUTTON */}
    <Link
      to="/findDealer"
      className="relative w-full sm:w-auto text-center px-6 py-3 text-white font-semibold rounded-full overflow-hidden group border border-white/30"
    >
      {/* normal text */}
      <span className="relative z-10 group-hover:opacity-0 transition duration-300">
        Find Dealer
      </span>

      {/* hover text */}
      <span className="absolute inset-0 z-10 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition duration-500">
        Find Dealer
      </span>

      {/* Liquid fill */}
      <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>

      {/* wave */}
      <span className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.7),transparent_60%)] group-hover:animate-wave"></span>
    </Link>

  </div>
</div>

      {/* Animations */}
      <style jsx>{`
      @keyframes wave {
  0% {
    transform: translateY(100%) scaleX(1);
  }
  50% {
    transform: translateY(-10%) scaleX(1.1);
  }
  100% {
    transform: translateY(0%) scaleX(1);
  }
}

.group-hover\:animate-wave {
  animation: wave 0.6s ease forwards;
}
        @keyframes zoomSlow {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(25px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeUp {
          animation: fadeUp 0.9s ease forwards;
        }

        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>

    </div>
  );
};

export default Banner;