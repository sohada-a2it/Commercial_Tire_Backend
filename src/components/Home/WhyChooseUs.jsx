"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  DollarSign,
  Users,
  Zap,
  ArrowRight,
  Shield,
  Clock,
  Award,
} from "lucide-react";
import { Link } from "@/lib/navigation";

const WhyChooseUs = () => {
  const [activeCard, setActiveCard] = useState(0);
  const [counts, setCounts] = useState({
    clients: 0,
    countries: 0,
    orders: 0,
    delivery: 0,
  });
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Simple counter function
  const startCounter = () => {
    if (hasAnimated) return;
    setHasAnimated(true);
    
    // Target values
    const targets = {
      clients: 500,
      countries: 50,
      orders: 10000,
      delivery: 99,
    };
    
    // Duration in milliseconds
    const duration = 2000;
    const startTime = Date.now();
    
    const updateCounters = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setCounts({
        clients: Math.floor(targets.clients * progress),
        countries: Math.floor(targets.countries * progress),
        orders: Math.floor(targets.orders * progress),
        delivery: Math.floor(targets.delivery * progress),
      });
      
      if (progress < 1) {
        requestAnimationFrame(updateCounters);
      } else {
        // Ensure final exact values
        setCounts({
          clients: targets.clients,
          countries: targets.countries,
          orders: targets.orders,
          delivery: targets.delivery,
        });
      }
    };
    
    requestAnimationFrame(updateCounters);
  };

  // Intersection Observer to detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            startCounter();
          }
        });
      },
      { threshold: 0.3, triggerOnce: true }
    );
    
    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }
    
    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, [hasAnimated]);

  // Auto-rotate active card
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 4);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const reasons = [
    {
      icon: DollarSign,
      title: "Competitive Pricing",
      description:
        "Market-leading rates with transparent pricing and no hidden fees.",
      highlight: "Save up to 25%",
      metric: "25%",
      metricLabel: "Average Savings",
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description:
        "All products certified to meet international quality standards.",
      highlight: "ISO 9001:2024",
      metric: "100%",
      metricLabel: "Quality Guarantee",
    },
    {
      icon: Zap,
      title: "Fast Turnaround",
      description:
        "Streamlined processes ensuring rapid order fulfillment and delivery.",
      highlight: "Same-day dispatch",
      metric: "24h",
      metricLabel: "Avg Processing",
    },
    {
      icon: Users,
      title: "Expert Support",
      description:
        "Dedicated account managers with deep industry expertise.",
      highlight: "8+ years exp.",
      metric: "24/7",
      metricLabel: "Customer Support",
    },
  ];

  return (
    <section
      id="why-choose-us"
      ref={sectionRef}
      className="py-16 bg-white relative overflow-hidden"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/20 via-transparent to-transparent"></div>
      
      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Choose{" "}
            <span className="text-teal-600">Asian Import & Export</span>
          </h2>
          
          <div className="w-16 h-0.5 bg-teal-600 mx-auto mb-3"></div>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            Built on a foundation of trust, quality, and exceptional service delivery
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="group transition-all duration-500"
              onMouseEnter={() => setActiveCard(index)}
            >
              <div
                className={`relative bg-white rounded-lg p-5 border transition-all duration-300 h-full
                  ${
                    activeCard === index
                      ? "border-teal-300 shadow-md shadow-teal-100/50"
                      : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300
                    ${
                      activeCard === index
                        ? "bg-teal-600 shadow-md shadow-teal-200"
                        : "bg-gray-100 group-hover:bg-teal-50"
                    }
                  `}
                >
                  <reason.icon
                    size={22}
                    className={`transition-all duration-300 ${
                      activeCard === index
                        ? "text-white"
                        : "text-teal-600 group-hover:text-teal-700"
                    }`}
                  />
                </div>

                {/* Highlight Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold transition-all duration-300
                      ${
                        activeCard === index
                          ? "bg-teal-600 text-white"
                          : "bg-teal-50 text-teal-700"
                      }
                    `}
                  >
                    {reason.highlight}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 mb-1.5">
                  {reason.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-xs leading-relaxed mb-3">
                  {reason.description}
                </p>

                {/* Metric */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-teal-600">
                      {reason.metric}
                    </span>
                    <span className="text-xs text-gray-500">
                      {reason.metricLabel}
                    </span>
                  </div>
                </div>

                {/* Active Indicator Line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-b-lg transition-all duration-300 ${
                    activeCard === index ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section - Now with guaranteed working counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Users size={24} className="text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-0.5">
              {counts.clients.toLocaleString()}+
            </div>
            <div className="text-xs text-gray-600">Happy Clients</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Shield size={24} className="text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-0.5">
              {counts.countries.toLocaleString()}+
            </div>
            <div className="text-xs text-gray-600">Countries Served</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <CheckCircle size={24} className="text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-0.5">
              {counts.orders.toLocaleString()}+
            </div>
            <div className="text-xs text-gray-600">Orders Completed</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Clock size={24} className="text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-0.5">
              {counts.delivery}%
            </div>
            <div className="text-xs text-gray-600">On-Time Delivery</div>
          </div>
        </div>

        {/* CTA Section */}
        <div>
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-center">
            <div className="max-w-2xl mx-auto">
              <Award size={32} className="text-teal-400 mx-auto mb-3" />
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                Ready to Partner With Us?
              </h3>
              
              <p className="text-gray-300 text-sm mb-6">
                Join 500+ businesses that trust us for their import and export needs
              </p>
              
              <Link to="/contact" className="inline-block">
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md text-sm">
                  <span className="flex items-center justify-center">
                    Get Started Today
                    <ArrowRight size={16} className="ml-2" />
                  </span>
                </button>
              </Link>
              
              <div className="flex justify-center gap-5 mt-5 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-teal-400" />
                  <span className="text-xs text-gray-400">Secure Transactions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-teal-400" />
                  <span className="text-xs text-gray-400">100% Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-teal-400" />
                  <span className="text-xs text-gray-400">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;