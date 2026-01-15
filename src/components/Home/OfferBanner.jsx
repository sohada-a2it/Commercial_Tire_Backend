"use client";

import React, { useState, useEffect } from "react";

const OfferBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set target date to 350 days from January 15, 2026
    const targetDate = new Date('2026-01-15');
    targetDate.setDate(targetDate.getDate() + 350);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full bg-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Banner with Countdown Inside */}
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg ">
          {/* Background Image */}
          <img
            src="/assets/banner2.png"
            alt="Offer Banner"
            className="w-full h-full object-fill"
          />

          {/* Limited Time Offer and Countdown - Left Bottom Inside Banner */}
          <div className="absolute bottom-1 left-8 z-10">
            {/* Limited Time Offer Label */}
            <div className="mb-1">
              <span className="text-gray-700 font-semibold text-md md:text-xl tracking-wider uppercase ml-10">
                LIMITED TIME OFFER!
              </span>
            </div>

            {/* Countdown Timer */}
            <div className="flex gap-3 md:gap-4">
              {/* Days */}
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shadow-lg border-2 border-[#f3d1a9]">
                  <span className="text-xl md:text-2xl font-bold text-gray-800">
                    {timeLeft.days}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-800 mt-1 uppercase">
                  Days
                </span>
              </div>

              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shadow-lg border-2 border-[#f3d1a9]">
                  <span className="text-xl md:text-2xl font-bold text-gray-800">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-800 mt-1 uppercase">
                  Hours
                </span>
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shadow-lg border-2 border-[#f3d1a9]">
                  <span className="text-xl md:text-2xl font-bold text-gray-800">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-800 mt-1 uppercase">
                  Mins
                </span>
              </div>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shadow-lg border-2 border-[#f3d1a9]">
                  <span className="text-xl md:text-2xl font-bold text-gray-800">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-800 mt-1 uppercase">
                  Secs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;
