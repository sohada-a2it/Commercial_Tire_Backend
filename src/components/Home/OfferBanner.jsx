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
    // Calculate target date (350 days from now)
    const calculateTimeLeft = () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 350);

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
        {/* Background Image */}
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/banner2.png')",
              backgroundPosition: "center",
            }}
          />
        </div>

        {/* Limited Time Offer and Countdown - Bottom Section */}
        <div className="mt-8 md:mt-12 text-center">
          {/* Limited Time Offer Label */}
          <div className="mb-6">
            <span className="text-gray-800 font-semibold text-xl md:text-2xl tracking-wider uppercase">
              LIMITED TIME OFFER!
            </span>
          </div>

          {/* Countdown Timer */}
          <div className="flex gap-3 md:gap-6 justify-center">
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full w-20 h-20 md:w-28 md:h-28 flex items-center justify-center shadow-lg border-4 border-gray-200">
                <span className="text-3xl md:text-5xl font-bold text-gray-800">
                  {timeLeft.days}
                </span>
              </div>
              <span className="text-sm md:text-base font-medium text-gray-700 mt-2 uppercase">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full w-20 h-20 md:w-28 md:h-28 flex items-center justify-center shadow-lg border-4 border-gray-200">
                <span className="text-3xl md:text-5xl font-bold text-gray-800">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
              </div>
              <span className="text-sm md:text-base font-medium text-gray-700 mt-2 uppercase">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full w-20 h-20 md:w-28 md:h-28 flex items-center justify-center shadow-lg border-4 border-gray-200">
                <span className="text-3xl md:text-5xl font-bold text-gray-800">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
              </div>
              <span className="text-sm md:text-base font-medium text-gray-700 mt-2 uppercase">
                Mins
              </span>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full w-20 h-20 md:w-28 md:h-28 flex items-center justify-center shadow-lg border-4 border-gray-200">
                <span className="text-3xl md:text-5xl font-bold text-gray-800">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
              <span className="text-sm md:text-base font-medium text-gray-700 mt-2 uppercase">
                Secs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;
