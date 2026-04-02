"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  MapPin,
} from "lucide-react";
import { config } from "@/config/site";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
} from "@/config/firebase";
import { auth } from "@/config/firebase";

export default function DashboardSettingsPage() {
  const { userProfile, updateUserProfile, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    whatsappNumber: "",
    businessType: "",
    country: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
          address: {
            street: userProfile?.address?.street || "",
            city: userProfile?.address?.city || "",
            state: userProfile?.address?.state || "",
            postalCode: userProfile?.address?.postalCode || "",
            country: userProfile?.address?.country || "",
          },
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

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
    setErrorMessage("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
  };

  const handleSubmitProfile = async (e) => {
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

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // Validation
    if (!passwordData.currentPassword) {
      setErrorMessage("Current password is required");
      setLoading(false);
      return;
    }

    if (!passwordData.newPassword) {
      setErrorMessage("New password is required");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (!auth.currentUser) {
        setErrorMessage("User not authenticated");
        setLoading(false);
        return;
      }

      // Re-authenticate user with current password
      await signInWithEmailAndPassword(auth, user.email, passwordData.currentPassword);

      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword);

      setSuccessMessage("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Password change error:", error);
      if (error.code === "auth/wrong-password") {
        setErrorMessage("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("New password is too weak");
      } else {
        setErrorMessage(error.message || "Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  const isGoogleLogin = userProfile?.provider === "google";
  const hasAllGoogleFields =
    userProfile?.whatsappNumber &&
    userProfile?.businessType &&
    userProfile?.country;

  const tabs = [
    { id: "profile", label: "Personal Info", icon: UserIcon },
    { id: "address", label: "Address", icon: MapPin },
    ...(isGoogleLogin === false ? [{ id: "password", label: "Password", icon: Lock }] : []),
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Settings & Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your profile and security settings</p>
        </div>

        {/* Google Login Alert */}
        {isGoogleLogin && !hasAllGoogleFields && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-5 rounded-xl flex gap-3 shadow-sm">
            <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-800 text-lg">Complete Your Profile</h3>
              <p className="text-sm text-blue-700 mt-1">
                You signed in with Google. Please provide your WhatsApp number, business type,
                and country to complete your profile.
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-5 rounded-xl flex gap-3 shadow-sm">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 font-semibold text-lg">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-5 rounded-xl flex gap-3 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-semibold text-lg">{errorMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl shadow-lg p-1.5 border border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-teal-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Personal Information</h2>
                <p className="text-gray-600 mt-2">Update your personal details</p>
              </div>
              <form onSubmit={handleSubmitProfile} className="space-y-7">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Email</label>
                  <input
                    type="email"
                    value={userProfile?.email || ""}
                    readOnly
                    className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed font-medium"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium">Email cannot be changed</p>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400"
                    placeholder="Enter your company name"
                  />
                </div>

                {/* Grid: WhatsApp and Business Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      WhatsApp Number
                      {isGoogleLogin && !formData.whatsappNumber && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400"
                      placeholder="+1234567890"
                      required={isGoogleLogin && !formData.whatsappNumber}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Business Type
                      {isGoogleLogin && !formData.businessType && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium cursor-pointer"
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
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Country
                    {isGoogleLogin && !formData.country && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400"
                    placeholder="Enter your country"
                    required={isGoogleLogin && !formData.country}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-10 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Personal Info"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === "address" && (
            <div className="p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Delivery Address</h2>
                <p className="text-gray-600 mt-2">Add or update your delivery address</p>
              </div>
              <form onSubmit={handleSubmitProfile} className="space-y-7">
                {/* Street Address */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400"
                    placeholder="123 Main Street"
                  />
                </div>

                {/* Grid: City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.address.city}
                      onChange={handleAddressChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.address.state}
                      onChange={handleAddressChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400"
                      placeholder="NY"
                    />
                  </div>
                </div>

                {/* Grid: Postal Code and Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.address.postalCode}
                      onChange={handleAddressChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400"
                      placeholder="10001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.address.country}
                      onChange={handleAddressChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400"
                      placeholder="United States"
                    />
                  </div>
                </div>

                {/* Address Preview */}
                {(formData.address.street ||
                  formData.address.city ||
                  formData.address.state ||
                  formData.address.postalCode ||
                  formData.address.country) && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-teal-200 mt-8">
                    <p className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" /> Address Preview:
                    </p>
                    <p className="text-gray-700 font-medium leading-relaxed text-lg">
                      {formData.address.street && <div>{formData.address.street}</div>}
                      {(formData.address.city ||
                        formData.address.state ||
                        formData.address.postalCode) && (
                        <div>
                          {[formData.address.city, formData.address.state, formData.address.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                      {formData.address.country && <div>{formData.address.country}</div>}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-10 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Address"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab - Only for email users */}
          {activeTab === "password" && isGoogleLogin === false && (
            <div className="p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Change Password</h2>
                <p className="text-gray-600 mt-2">Keep your account secure by using a strong password</p>
              </div>

              <form onSubmit={handleSubmitPassword} className="space-y-7 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400 pr-12"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-3.5 text-gray-500 hover:text-teal-600 transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400 pr-12"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-3.5 text-gray-500 hover:text-teal-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">At least 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 bg-white hover:border-teal-300 text-gray-800 font-medium placeholder-gray-400 pr-12"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3.5 text-gray-500 hover:text-teal-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200 mt-8">
                  <p className="text-sm font-bold text-blue-900 mb-3">Password Requirements:</p>
                  <ul className="text-sm text-blue-800 space-y-2 font-medium">
                    <li className="flex items-center gap-2">✓ At least 6 characters long</li>
                    <li className="flex items-center gap-2">✓ Mix of letters, numbers, and symbols recommended</li>
                    <li className="flex items-center gap-2">✓ Avoid using personal information</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-10 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Account Information Card */}
        <div className="mt-10 bg-white rounded-xl shadow-xl border border-gray-100 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-teal-50 via-teal-100 to-cyan-50 p-8 rounded-xl border-2 border-teal-300 shadow-lg hover:shadow-xl transition-all">
              <p className="text-sm text-teal-700 font-bold uppercase tracking-wider mb-2">
                Account Type
              </p>
              <p className="text-3xl font-bold text-teal-700">Customer</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 p-8 rounded-xl border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all">
              <p className="text-sm text-blue-700 font-bold uppercase tracking-wider mb-2">
                Sign-in Method
              </p>
              <p className="text-3xl font-bold text-blue-700 capitalize">
                {userProfile?.provider === "google" ? "Google" : "Email"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50 p-8 rounded-xl border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all">
              <p className="text-sm text-purple-700 font-bold uppercase tracking-wider mb-2">
                Account Created
              </p>
              <p className="text-3xl font-bold text-purple-700">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 p-8 rounded-xl border-2 border-orange-300 shadow-lg hover:shadow-xl transition-all">
              <p className="text-sm text-orange-700 font-bold uppercase tracking-wider mb-2">
                Last Updated
              </p>
              <p className="text-3xl font-bold text-orange-700">
                {userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
