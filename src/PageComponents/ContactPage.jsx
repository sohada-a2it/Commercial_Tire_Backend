"use client";

import React, { useEffect, useState } from "react";
import WebsiteLogo from "../components/shared/WebsiteLogo";
import { useNavigate } from "@/lib/navigation";
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaBuilding, FaUser, FaComment } from "react-icons/fa";
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

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({
          name: "",
          company: "",
          email: user?.email || "",
          phone: "",
          message: "",
        });
      } else {
        toast.error("Failed to send message. Please try again.");
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
    { icon: FaMapMarkerAlt, title: "Location", details: ["406 East Huntington Drive", "Suite 200", "Monrovia", "CA 91016"], color: "text-amber-600" },
    { icon: FaPhone, title: "Phone", details: ["+1 437-900-3996"], link: "tel:+14379003996", color: "text-amber-600" },
    { icon: FaEnvelope, title: "Email", details: ["info@asianimportexport.com"], link: "mailto:info@asianimportexport.com", color: "text-amber-600" },
    { icon: FaClock, title: "Business Hours", details: ["Mon-Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"], color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="px-4 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="group flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-6 transition-all duration-300"
        >
          <div className="bg-gray-100 group-hover:bg-amber-50 p-1.5 rounded-full shadow-sm transition-all">
            <FaArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-sm font-medium">Back</span>
        </button> 

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Contact Information */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 h-full transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Get In Touch</h2>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className="flex items-start group">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-amber-100 transition-all duration-300 group-hover:scale-110">
                      <info.icon className="text-amber-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">
                        {info.title}
                      </h3>
                      {info.details.map((detail, i) => (
                        info.link ? (
                          <a 
                            key={i} 
                            href={info.link} 
                            className="text-gray-600 text-sm hover:text-amber-600 transition-colors block"
                          >
                            {detail}
                          </a>
                        ) : (
                          <p key={i} className="text-gray-600 text-sm">
                            {detail}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full">✓ ISO Certified</span>
                  <span className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full">✓ 24/7 Support</span>
                  <span className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full">✓ Global Shipping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Send a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Your Name <span className="text-red-500">*</span>
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
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400 transition-all"
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
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400 transition-all"
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
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400 transition-all"
                    />
                  </div>
                  {user?.email && (
                    <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                      Using your registered email
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
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaComment className="absolute left-3 top-3 text-gray-400 text-sm" />
                    <textarea
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about your requirements..."
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send Message
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div> 
      </div>
    </div>
  );
};

export default ContactPage;