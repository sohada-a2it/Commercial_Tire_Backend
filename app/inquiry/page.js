// app/inquiry/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { config } from "@/config/site";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaComment,
  FaPaperPlane,
  FaCheckCircle,
  FaInfoCircle,
  FaShoppingCart,
  FaWhatsapp,
  FaPhoneAlt,
  FaBox,
  FaTag,
} from "react-icons/fa";
import { HiClipboardDocumentList } from "react-icons/hi2";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
  </div>
);

const SuccessModal = ({ onClose, productName }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FaCheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Inquiry Sent Successfully!</h3>
      <p className="text-gray-500 mb-4">
        Thank you for your interest in {productName}. Our sales team will get back to you within 24 hours.
      </p>
      <button
        onClick={onClose}
        className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-700 transition"
      >
        Browse More Products
      </button>
    </div>
  </div>
);

export default function InquiryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const productNameParam = searchParams.get("name");
  const productModelParam = searchParams.get("model");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    productName: "",
    productModel: "",
    quantity: "1",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Auto-fill product name and model from URL params
    if (productNameParam || productModelParam) {
      const decodedName = productNameParam ? decodeURIComponent(productNameParam) : "";
      const decodedModel = productModelParam ? decodeURIComponent(productModelParam) : "";
      
      setFormData(prev => ({
        ...prev,
        productName: decodedName,
        productModel: decodedModel,
        message: `Dear Team,

I am interested in purchasing:

Product Name: ${decodedName}
${decodedModel ? `Model: ${decodedModel}` : ''}

Please provide me with:
✓ Best price quote
✓ Stock availability
✓ Delivery information

Thank you.`
      }));
    }
  }, [productNameParam, productModelParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // app/inquiry/page.jsx - handleSubmit function update koro

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setSubmitting(true);
  try {
    const response = await fetch(`${config.email.backendUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "product_inquiry",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || "",
        address: formData.deliveryLocation || "",
        quantity: formData.quantity,
        model: formData.productModel || formData.productName,
        productName: formData.productName,
        deliveryLocation: formData.deliveryLocation,
        urgentRequirement: formData.urgentRequirement || false,
        shippingTerm: formData.shippingTerm || "",
        message: formData.message,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      setShowSuccess(true);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        productName: "",
        productModel: "",
        quantity: "1",
        deliveryLocation: "",
        urgentRequirement: false,
        shippingTerm: "",
        message: "",
      });
    } else {
      throw new Error(result.error || "Failed to send inquiry");
    }
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    alert("Failed to send inquiry. Please try again or contact us directly.");
  } finally {
    setSubmitting(false);
  }
};

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    router.push("/productList");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-amber-500 mb-6 group transition-colors"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-sm" />
          <span className="text-sm">Go Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Request a Quote
          </h1>
          <p className="text-gray-500">
            Fill out the form below and our team will get back to you shortly
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HiClipboardDocumentList className="w-5 h-5" />
              Inquiry Form
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Product Information */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaBox className="text-amber-500" />
                Product Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Product Name
                  </label>
                  <div className="relative">
                    <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      placeholder="e.g., RoadX RXT 2.0"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Model Number
                  </label>
                  <div className="relative">
                    <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      name="productModel"
                      value={formData.productModel}
                      onChange={handleChange}
                      placeholder="e.g., RXT-225"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full md:w-32 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                Your Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 8900"
                        className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
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
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Your Message <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaComment className="absolute left-3 top-3 text-gray-400 text-sm" />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tell us about your requirements..."
                  className={`w-full border ${errors.message ? 'border-red-500' : 'border-gray-200'} rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none`}
                />
              </div>
              {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner />
                  <span>Sending Inquiry...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        {/* <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <FaWhatsapp className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Chat with us on</p>
            <a href="https://wa.me/1234567890" className="text-amber-500 font-semibold text-sm">
              WhatsApp
            </a>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <FaPhoneAlt className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Call us directly</p>
            <a href="tel:+1234567890" className="text-amber-500 font-semibold text-sm">
              +1 (234) 567-8900
            </a>
          </div>
        </div> */}
      </div>

      {showSuccess && (
        <SuccessModal 
          onClose={handleCloseSuccess} 
          productName={formData.productName || "your selected product"} 
        />
      )}
    </div>
  );
}