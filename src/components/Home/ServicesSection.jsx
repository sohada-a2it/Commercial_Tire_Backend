"use client";

import React from "react";
import {
  Truck,
  Shield,
  Clock,
  HeadphonesIcon,
  Database,
  MapPin,
  ArrowRight,
} from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: Truck,
      title: "Reliable Delivery",
      description:
        "Fast and secure shipping across NC, SC, TN, and VA with real-time tracking.",
      features: [
        "Same-day processing",
        "Real-time tracking",
        "Insured shipments",
      ],
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description:
        "All products undergo strict quality control before shipment to ensure excellence.",
      features: [
        "Quality inspections",
        "Product certification",
        "Return guarantee",
      ],
    },
    {
      icon: Database,
      title: "Strong Inventory",
      description:
        "Maintain extensive stock levels to ensure product availability when you need it.",
      features: ["Large inventory", "Quick restocking", "Bulk availability"],
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description:
        "Round-the-clock customer service to handle your inquiries and support needs.",
      features: [
        "24/7 availability",
        "Expert assistance",
        "Multiple contact options",
      ],
    },
    {
      icon: HeadphonesIcon,
      title: "Custom Solutions",
      description:
        "Tailored import/export solutions designed to meet your specific business needs.",
      features: ["Custom packaging", "Special requests", "Flexible terms"],
    },
    {
      icon: MapPin,
      title: "Regional Expertise",
      description:
        "Deep knowledge of regional markets and regulations for smooth operations.",
      features: ["Local knowledge", "Regulatory compliance", "Market insights"],
    },
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-teal-50 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 px-4 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
            <span className="text-teal-700 text-xs font-semibold uppercase tracking-wider">Premium Services</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            We go above and<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600"> beyond for you</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Comprehensive import and export solutions designed to streamline your business operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-teal-200"
            >
              {/* Animated gradient background on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-50/0 via-teal-50/0 to-cyan-50/0 group-hover:from-teal-50/50 group-hover:via-teal-50/30 group-hover:to-cyan-50/20 transition-all duration-700"></div>
              
              {/* Icon with pulse effect */}
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-teal-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <service.icon className="text-white" size={24} strokeWidth={1.5} />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                {service.title}
              </h3>
              
              <p className="text-gray-500 text-sm mb-3 leading-relaxed">
                {service.description}
              </p>
              
              <div className="space-y-2.5 mb-2">
                {service.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-center gap-2 text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300"
                    style={{ transitionDelay: `${featureIndex * 50}ms` }}
                  >
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;