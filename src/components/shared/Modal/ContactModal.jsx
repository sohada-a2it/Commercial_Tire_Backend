"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { config } from "@/config/site";

const ContactModal = ({ isOpen, onClose, tyreModel, moq }) => {
  // Parse MOQ to get the minimum quantity value and unit
  const parseMOQ = () => {
    if (!moq) return { minQuantity: 50, unit: "pieces" }; // Default fallback

    // Extract numbers and text from MOQ string (e.g., "50 tires", "3 MT", "35 Tons")
    const match = moq.match(/(\d+)\s*(.*)/);
    if (match) {
      return {
        minQuantity: parseInt(match[1], 10),
        unit: match[2].toLowerCase() || "pieces",
      };
    }

    return { minQuantity: 50, unit: "pieces" }; // Default fallback
  };

  const { minQuantity, unit } = parseMOQ();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    quantity: minQuantity,
    message: "",
    model: tyreModel || "",
    shippingTerm: "FOB", // default value
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);

    // Allow empty input while typing
    if (!value) {
      setFormData((prev) => ({ ...prev, quantity: "" }));
      return;
    }

    // If user enters less than MOQ → show toast only
    if (value < minQuantity) {
      toast.error(`Minimum order quantity is ${minQuantity} ${unit}`);
    }

    // Always update value (do NOT restrict typing)
    setFormData((prev) => ({ ...prev, quantity: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch(
        `${config.email.backendUrl}/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            moq: moq || "50 pieces",
            type: "product_inquiry",
            shippingTerm: formData.shippingTerm,
          }),
        }
      );

      if (response.ok) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          address: "",
          quantity: minQuantity, // Reset to dynamic minQuantity
          message: "",
          model: tyreModel || "",
        });
        setTimeout(() => {
          onClose();
          setStatus("");
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend error:", errorData);
        setStatus("error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full shadow-xl">
        {" "}
        {/* Changed to white background */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-teal-800">Contact Supplier</h2>{" "}
          {/* Changed to teal color */}
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-teal-800 text-xl font-bold transition-colors" /* Teal hover */
          >
            &times;
          </button>
        </div>
        {status === "success" ? (
          <div className="p-2 bg-green-100 text-green-700 rounded mb-3 text-sm">
            {" "}
            {/* Light green success */}
            Message sent successfully!
          </div>
        ) : status === "error" ? (
          <div className="p-2 bg-red-100 text-red-700 rounded mb-3 text-sm">
            {" "}
            {/* Light red error */}
            Failed to send message. Please try again.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="model"
              value={formData.model}
              readOnly
              className="w-full p-2 text-sm bg-gray-100 text-gray-700 rounded border border-gray-300 focus:border-teal-500 focus:outline-none cursor-not-allowed opacity-70" /* Gray background, teal focus */
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
                className="w-full p-2 text-sm bg-white text-gray-800 rounded border border-gray-300 focus:border-teal-500 focus:outline-none" /* White background, teal focus */
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full p-2 text-sm bg-white text-gray-800 rounded border border-gray-300 focus:border-teal-500 focus:outline-none" /* White background, teal focus */
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                required
                className="w-full p-2 text-sm bg-white text-gray-800 rounded border border-gray-300 focus:border-teal-500 focus:outline-none" /* White background, teal focus */
              />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company (optional)"
                className="w-full p-2 text-sm bg-white text-gray-800 rounded border border-gray-300 focus:border-teal-500 focus:outline-none" /* White background, teal focus */
              />
            </div>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              required
              className="w-full p-2 text-sm bg-white text-gray-800 rounded border border-gray-300 focus:border-teal-500 focus:outline-none" /* White background, teal focus */
            />

            <div>
              <label
                htmlFor="shippingTerm"
                className="text-sm text-teal-700 font-medium"
              >
                Shipping Terms:
              </label>
              <select
                name="shippingTerm"
                id="shippingTerm"
                value={formData.shippingTerm}
                onChange={handleChange}
                className="w-full p-2 text-sm bg-white text-gray-800 rounded border border-gray-300 focus:border-teal-500 focus:outline-none"
              >
                <option value="FOB">FOB</option>
                <option value="CIF">CIF</option>
                <option value="DDP">DDP</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="quantity"
                className="text-sm text-teal-700 font-medium"
              >
                {" "}
                {/* Teal color */}
                Quantity (min {minQuantity} {unit}):
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                placeholder={`Minimum order quantity is ${minQuantity} ${unit}`}
                value={formData.quantity}
                onChange={handleQuantityChange}
                className="w-full p-2 text-sm bg-white text-gray-800 rounded border border-gray-300 focus:border-teal-500 focus:outline-none"
              />
            </div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              rows="3"
              className="w-full p-2 text-sm bg-white text-gray-800 rounded border border-gray-300 focus:border-teal-500 focus:outline-none" /* White background, teal focus */
            ></textarea>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors" /* Gray buttons */
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "sending"}
                className="px-3 py-1.5 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-400 transition-colors" /* Teal buttons */
              >
                {status === "sending" ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
