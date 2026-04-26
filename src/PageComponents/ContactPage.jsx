"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaBuilding, 
  FaUser, 
  FaComment,
  FaHeadset,
  FaFax,
  FaGlobe,
  FaWhatsapp,
  FaShieldAlt,
  FaRocket,
  FaCheckCircle
} from "react-icons/fa";
import { config } from "@/config/site";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const ContactPage = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    setFormData((prev) => ({
      ...prev,
      email: user.email,
      name: prev.name || userProfile?.fullName || "",
    }));
  }, [user?.email, userProfile?.fullName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const submitEmail = user?.email || formData.email;
    
    const response = await fetch(
      `${config.email.backendUrl}/api/send-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: submitEmail,
          type: "general_inquiry",
          subject: "General Inquiry from Contact Page",
        }),
      }
    );

    // 👇 এখানে পরিবর্তন: response.json() পড়ুন
    const data = await response.json();
    console.log("Response:", data);

    if (response.ok && data.success) {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: userProfile?.fullName || "",
        company: "",
        email: user?.email || "",
        phone: "",
        message: "",
      });
    } else {
      toast.error(data.error || "Failed to send message. Please try again.");
    }
  } catch (error) {
    console.error("Error sending message:", error);
    toast.error("Failed to send message. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const contactInfo = [
    { 
      icon: FaMapMarkerAlt, 
      title: "Visit Us", 
      details: ["406 East Huntington Drive", "Suite 200", "Monrovia, CA 91016"],
      link: "https://maps.google.com/?q=406+East+Huntington+Drive+Monrovia+CA+91016",
      color: "text-amber-600" 
    },
    { 
      icon: FaPhone, 
      title: "Phone", 
      details: ["(666) xxx-xxxx"], 
      link: "#", 
      color: "text-amber-600" 
    },
    { 
      icon: FaHeadset, 
      title: "Toll Free", 
      details: ["(888) xxx-xxxx"], 
      link: "#", 
      color: "text-amber-600" 
    },
    { 
      icon: FaFax, 
      title: "Order Fax", 
      details: ["(888) xxx-xxxx"], 
      color: "#" 
    },
    { 
      icon: FaEnvelope, 
      title: "Email Us", 
      details: ["info@doublecoin.com"], 
      link: "mailto:info@doublecoin.com", 
      color: "text-amber-600" 
    },
    // { 
    //   icon: FaWhatsapp, 
    //   title: "WhatsApp", 
    //   details: ["+1 (437) 900-3996"], 
    //   link: "https://wa.me/14379003996", 
    //   color: "text-green-500" 
    // },
    { 
      icon: FaClock, 
      title: "Business Hours", 
      details: ["Sat-Thu: 9:00 AM - 6:00 PM", "Fri: Closed"],
      color: "text-amber-600" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="px-4 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="group flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-6 transition-all duration-300"
        >
          <div className="bg-white shadow-sm group-hover:bg-amber-50 p-2 rounded-xl border border-gray-100 transition-all">
            <FaArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-4">
            <FaHeadset className="text-amber-500 text-xs" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              We're Here to Help
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Get in <span className="text-amber-600">Touch</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Have questions about our products or need assistance? Our team is ready to help you.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Contact Information - Redesigned */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaGlobe className="text-white" />
                  Contact Information
                </h2>
                <p className="text-amber-100 text-sm mt-1">Reach out to us anytime</p>
              </div>

              <div className="p-6">
                {/* Contact Info Grid - 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contactInfo.map((info, idx) => (
                    <div key={idx} className="flex items-start gap-3 group p-3 rounded-xl hover:bg-gray-50 transition-all duration-300">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                        <info.icon className={`${info.color || 'text-amber-600'} text-base`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          {info.title}
                        </h3>
                        {info.details.map((detail, i) => (
                          info.link ? (
                            <a 
                              key={i} 
                              href={info.link} 
                              target={info.link.startsWith('http') ? "_blank" : undefined}
                              rel={info.link.startsWith('http') ? "noopener noreferrer" : undefined}
                              className="text-gray-700 text-sm hover:text-amber-600 transition-colors block leading-relaxed"
                            >
                              {detail}
                            </a>
                          ) : (
                            <p key={i} className="text-gray-700 text-sm leading-relaxed">
                              {detail}
                            </p>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Preview */}
                <div className="mt-6 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-amber-500 text-xs" />
                    <span className="text-xs font-medium text-gray-600">Map Location</span>
                  </div>
                  <div className="bg-gray-200 rounded-lg h-32 overflow-hidden">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3300.123456789012!2d-118.001234!3d34.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDA3JzI0LjQiTiAxMTjCsDAwJzA0LjQiVw!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Double Coin Location"
                    ></iframe>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-full">
                      <FaCheckCircle className="text-xs" />
                      <span>ISO Certified</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full">
                      <FaHeadset className="text-xs" />
                      <span>24/7 Support</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full">
                      <FaRocket className="text-xs" />
                      <span>Global Shipping</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form - Redesigned */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaComment className="text-white" />
                  Send a Message
                </h2>
                <p className="text-amber-100 text-sm mt-1">Fill out the form below</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder:text-gray-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your Company"
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder:text-gray-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={Boolean(user?.email)}
                      placeholder="hello@company.com"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder:text-gray-400 transition-all"
                    />
                  </div>
                  {user?.email && (
                    <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Using your registered email: {user.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder:text-gray-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaComment className="absolute left-3 top-3 text-gray-400 text-sm" />
                    <textarea
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us about your requirements, questions, or concerns..."
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder:text-gray-400 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <FaComment className="text-white" />
                      Send Message
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400">
                  We'll get back to you within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;