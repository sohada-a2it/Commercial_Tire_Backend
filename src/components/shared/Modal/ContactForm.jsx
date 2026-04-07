"use client";

import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { config } from "@/config/site";

const ContactForm = ({ product, quantity, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: `I'm interested in purchasing:\n\nBrand: ${product.brand}\nModel: ${product.model}\nSize: ${product.size}\nQuantity: ${quantity} pieces\n\nPlease provide more information about availability and pricing.`,
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

    try {
      const response = await fetch(`${config.email.backendUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity,
          model: product.model,
          address: "",
          shippingTerm: "FOB",
          type: "product_inquiry",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send inquiry");
      }

      setSubmitStatus("success");
      setTimeout(onClose, 2000);
    } catch (_error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-md w-full border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-orange-500">Contact Us</h3>

        {submitStatus === "success" ? (
          <div className="text-green-500 mb-4 text-center py-4">
            Your inquiry has been sent successfully!
          </div>
        ) : submitStatus === "error" ? (
          <div className="text-red-500 mb-4">
            Failed to send your inquiry. Please try again.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Your Name*</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#252525] border border-gray-700 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-[#252525] border border-gray-700 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#252525] border border-gray-700 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#252525] border border-gray-700 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">
                  Additional Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-[#252525] border border-gray-700 rounded px-4 py-2 text-white h-32"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-800"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 rounded text-white hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Inquiry"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
