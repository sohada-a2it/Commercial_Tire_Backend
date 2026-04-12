"use client";

import React, { useState, useEffect } from "react";

const OfferBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [prevSeconds, setPrevSeconds] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Set target date to 350 days from January 15, 2026
    const targetDate = new Date('2026-01-15');
    targetDate.setDate(targetDate.getDate() + 350);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const seconds = Math.floor((difference / 1000) % 60);
        
        // Trigger animation when seconds change
        if (seconds !== prevSeconds) {
          setIsAnimating(true);
          setPrevSeconds(seconds);
          setTimeout(() => setIsAnimating(false), 300);
        }

        setTimeLeft({
          weeks: Math.floor(difference / (1000 * 60 * 60 * 24 * 7)),
          days: Math.floor((difference / (1000 * 60 * 60 * 24)) % 7),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: seconds,
        });
      }
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [prevSeconds]);

  return (
    <div className="relative w-full bg-white py-4 md:py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Banner with Countdown Inside */}
        <div className="relative w-full h-[180px] md:h-[420px] overflow-hidden rounded-lg">
          {/* Background Image */}
          <img
            src="/assets/banner4.png"
            alt="Offer Banner"
            className="w-full h-full object-fill"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>

          {/* Countdown Timer - Centered */}
          <div className="absolute inset-0 flex items-center justify-center mr-10">
            <div className="flex gap-3 md:gap-4">
              {/* Weeks */}
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg w-10 h-10 md:w-14 md:h-14 flex items-center justify-center shadow-xl border-2 border-yellow-600 relative overflow-hidden animate-pulse-glow">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute inset-0 shadow-[0_0_10px_rgba(250,204,21,0.65),0_0_20px_rgba(250,204,21,0.4),inset_0_0_10px_rgba(255,255,255,0.2)]"></div>
                  <span className="text-2xl  font-bold text-gray-900 relative z-10">
                    {String(timeLeft.weeks).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs font-bold text-white mt-1  uppercase tracking-wider drop-shadow-lg">
                  WEEKS
                </span>
              </div>

              {/* Days */}
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg w-10 h-10 md:w-14 md:h-14 flex items-center justify-center shadow-xl border-2 border-yellow-600 relative overflow-hidden animate-pulse-glow">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute inset-0 shadow-[0_0_10px_rgba(250,204,21,0.65),0_0_20px_rgba(250,204,21,0.4),inset_0_0_10px_rgba(255,255,255,0.2)]"></div>
                  <span className="text-2xl  font-bold text-gray-900 relative z-10">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs  font-bold text-white mt-1  uppercase tracking-wider drop-shadow-lg">
                  DAYS
                </span>
              </div>

              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg w-10 h-10 md:w-14 md:h-14 flex items-center justify-center shadow-xl border-2 border-yellow-600 relative overflow-hidden animate-pulse-glow">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute inset-0 shadow-[0_0_10px_rgba(250,204,21,0.65),0_0_20px_rgba(250,204,21,0.4),inset_0_0_10px_rgba(255,255,255,0.2)]"></div>
                  <span className="text-2xl  font-bold text-gray-900 relative z-10">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs  font-bold text-white mt-1  uppercase tracking-wider drop-shadow-lg">
                  HOURS
                </span>
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg w-10 h-10 md:w-14 md:h-14 flex items-center justify-center shadow-xl border-2 border-yellow-600 relative overflow-hidden animate-pulse-glow">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute inset-0 shadow-[0_0_10px_rgba(250,204,21,0.65),0_0_20px_rgba(250,204,21,0.4),inset_0_0_10px_rgba(255,255,255,0.2)]"></div>
                  <span className="text-2xl  font-bold text-gray-900 relative z-10">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs  font-bold text-white mt-1  uppercase tracking-wider drop-shadow-lg">
                  MINUTES
                </span>
              </div>

              {/* Seconds - With Animation */}
              <div className="flex flex-col items-center">
                <div className={`bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg w-10 h-10 md:w-14 md:h-14 flex items-center justify-center shadow-xl border-2 border-yellow-600 relative overflow-hidden transition-transform duration-300 animate-pulse-glow ${
                  isAnimating ? 'scale-110' : 'scale-100'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute inset-0 shadow-[0_0_10px_rgba(250,204,21,0.65),0_0_20px_rgba(250,204,21,0.4),inset_0_0_10px_rgba(255,255,255,0.2)]"></div>
                  <span className={`text-2xl  font-bold text-gray-900 relative z-10 transition-all duration-300 ${
                    isAnimating ? 'scale-125' : 'scale-100'
                  }`}>
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs  font-bold text-white mt-1 uppercase tracking-wider drop-shadow-lg">
                  SECONDS
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
