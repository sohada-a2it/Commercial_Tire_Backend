"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { config } from "@/config/site";

export default function DashboardSettingsPage() {
  const { userProfile, updateUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    whatsappNumber: "",
    businessType: "",
    country: "",
  });

  // Verify customer role
  useEffect(() => {
    if (userProfile) {
      const role = normalizeRole(userProfile?.role);
      if (role !== "customer") {
        router.replace("/dashboard");
      } else {
        // Populate form with current user data
        setFormData({
          fullName: userProfile?.fullName || "",
          companyName: userProfile?.companyName || "",
          whatsappNumber: userProfile?.whatsappNumber || "",
          businessType: userProfile?.businessType || "Other",
          country: userProfile?.country || "",
        });
      }
    }
  }, [userProfile, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setErrorMessage("An error occurred while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  const isGoogleLogin = userProfile?.provider === "google";
  const hasAllGoogleFields =
    userProfile?.whatsappNumber &&
    userProfile?.businessType &&
    userProfile?.country;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile information and account settings
          </p>
        </div>

        {/* Google Login Alert - Only show if incomplete */}
        {isGoogleLogin && !hasAllGoogleFields && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">
                Complete Your Profile
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                You signed in with Google. Please provide your WhatsApp number,
                business type, and country to complete your profile. This
                information helps us better serve your business needs.
              </p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={userProfile?.email || ""}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter your company name"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              WhatsApp Number{" "}
              {isGoogleLogin && !formData.whatsappNumber && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter your WhatsApp number (e.g., +1234567890)"
              required={isGoogleLogin && !formData.whatsappNumber}
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Business Type{" "}
              {isGoogleLogin && !formData.businessType && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required={isGoogleLogin && !formData.businessType}
            >
              <option value="">Select business type</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="Wholeseller">Wholeseller</option>
              <option value="Retailer">Retailer</option>
              <option value="REGULAR USER">Regular User</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country{" "}
              {isGoogleLogin && !formData.country && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter your country"
              required={isGoogleLogin && !formData.country}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>

        {/* Profile Information Section */}
        <div className="border-t pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="text-lg font-semibold text-gray-800">Customer</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Sign-in Method</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">
                {userProfile?.provider === "google" ? "Google" : "Email"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="text-lg font-semibold text-gray-800">
                {userProfile?.createdAt
                  ? new Date(userProfile.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold text-gray-800">
                {userProfile?.updatedAt
                  ? new Date(userProfile.updatedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
