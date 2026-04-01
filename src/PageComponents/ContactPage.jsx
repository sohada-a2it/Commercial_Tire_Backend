"use client";

import React, { useState } from "react";
import WebsiteLogo from "../components/shared/WebsiteLogo";
import { useNavigate } from "@/lib/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { config } from "@/config/site";

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(
        `${config.email.backendUrl}/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            type: "general_inquiry",
            subject: "General Inquiry from Contact Page",
          }),
        }
      );

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus("error");
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 max-w-7xl mx-auto">
        <button
          onClick={handleGoBack}
          className="flex items-center text-teal-700 hover:text-teal-800 mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <WebsiteLogo className="h-10" />
          </div>
          <p className="text-teal-700 mb-2">
            Manufacturer, Wholesaler and Distributor
          </p>
          <div className="inline-block bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Trusted Alibaba's Supplier
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Contact Information */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-teal-800 mb-6">
                Get In Touch
              </h2>

              <div className="space-y-6 flex-1">
                <div className="flex items-start">
                  <div className="text-teal-600 mr-4 mt-1">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-teal-800 mb-1">
                      Our Location
                    </h3>
                    <p className="text-gray-700">
                      63/16 Soi Chumchon Talat Tha Ruea Khlong Toei
                    </p>
                    <p className="text-gray-700">
                      Khwaeng Khlong Toei, Khet Khlong Toei
                    </p>
                    <p className="text-gray-700">
                      Krung Thep Maha Nakhon 10110, Thailand
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-teal-600 mr-4 mt-1">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-teal-800 mb-1">
                      Phone Number
                    </h3>
                    <p className="text-gray-700">+1 437-900-3996</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-teal-600 mr-4 mt-1">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-teal-800 mb-1">
                      Email Address
                    </h3>
                    <p className="text-gray-700">info@asianimportexport.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-teal-600 mr-4 mt-1">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-teal-800 mb-1">
                      Website
                    </h3>
                    <p className="text-gray-700">asianimportexport.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-teal-800 mb-6">
                Send Us a Message
              </h2>

              <div className="flex-1">
                {submitStatus === "success" && (
                  <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
                    Your message has been sent successfully! We'll get back to
                    you soon.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
                    Failed to send your message. Please try again or contact us
                    directly.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-40 text-gray-800 bg-gray-50"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-teal-800 mb-4">
            Our Location
          </h2>

          <div className="bg-gray-200 h-96 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.223179266149!2d100.5603145759964!3d13.726486397299883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29f3a315d5f5f%3A0xea51cbff758e4d4c!2s63%2F16%20Soi%20Chumchon%20Talat%20Tha%20Ruea%2C%20Khlong%20Toei%2C%20Bangkok%2010110%2C%20Thailand!5e0!3m2!1sen!2sus!4v1690900000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Asian Import & Export Location"
            ></iframe>
          </div>

          <div className="mt-4 p-4 bg-teal-50 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">Directions</h3>
            <p className="text-sm text-gray-700">
              We are located in the heart of Bangkok's commercial district.
              Easily accessible by public transportation or car. Free parking
              available on premises.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
