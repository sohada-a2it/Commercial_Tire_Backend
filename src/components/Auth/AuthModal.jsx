"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Building2, Phone, Globe, Eye, EyeOff, Loader2, Truck, Shield, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import toast from "react-hot-toast";

const businessTypeOptions = [
  "Wholesaler",
  "Distributor",
  "Manufacturer",
  "Supplier",
  "Exporter/Importer",
  "Service Provider",
  "Trading Business",
  "Other",
];

const countries = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria",
  "Bangladesh","Belgium","Brazil","Canada","Chile","China","Colombia",
  "Denmark","Egypt","Finland","France","Germany","Greece","Hong Kong",
  "India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan",
  "Jordan","Kenya","Kuwait","Lebanon","Malaysia","Mexico","Morocco",
  "Netherlands","New Zealand","Nigeria","Norway","Pakistan","Philippines",
  "Poland","Portugal","Qatar","Russia","Saudi Arabia","Singapore",
  "South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland",
  "Taiwan","Thailand","Turkey","UAE","UK","USA","Vietnam","Other"
];

const AuthDrawer = ({ isOpen, onClose, redirectAfterAuth }) => {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    companyName: "",
    fullName: "",
    email: "",
    whatsappNumber: "",
    country: "",
    businessType: "",
    customBusinessType: "",
    password: "",
    confirmPassword: "",
  });

  const handleRedirect = (result) => {
    if (redirectAfterAuth) return redirectAfterAuth(result);

    const role = normalizeRole(result?.profile?.role);
    if (role === "admin" || role === "moderator") {
      router.push("/dashboard");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      return toast.error("Fill all fields");
    }

    setLoading(true);
    const res = await signIn(loginData.email, loginData.password);
    setLoading(false);

    if (res.success) {
      toast.success("Login successful");
      onClose();
      handleRedirect(res);
    } else {
      toast.error(res.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const {
      fullName,
      email,
      whatsappNumber,
      country,
      businessType,
      password,
      confirmPassword,
      customBusinessType,
    } = registerData;

    if (!fullName || !email || !whatsappNumber || !country || !businessType || !password || !confirmPassword) {
      return toast.error("Fill all required fields");
    }

    if (businessType === "Other" && !customBusinessType.trim()) {
      return toast.error("Enter business type");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords not match");
    }

    if (password.length < 6) {
      return toast.error("Min 6 characters required");
    }

    setLoading(true);

    const finalBusinessType =
      businessType === "Other" ? customBusinessType : businessType;

    const res = await signUp(email, password, {
      fullName,
      companyName: registerData.companyName,
      whatsappNumber,
      country,
      businessType: finalBusinessType,
    });

    setLoading(false);

    if (res.success) {
      toast.success("Account created");
      onClose();
      handleRedirect(res);
    } else {
      toast.error(res.message || "Registration failed");
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);

    if (res.success) {
      toast.success("Google login success");
      onClose();
      handleRedirect(res);
    } else {
      toast.error(res.message || "Google login failed");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* drawer - responsive width for all devices */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] lg:w-[520px] bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* top accent bar - amber */}
        <div className="h-1 bg-amber-500"></div>

        {/* header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <h2 className="font-bold text-xl text-gray-800 tracking-wide">
              <img className="w-16 sm:w-20 object-contain" src="/double.png" alt="DoubleCoin" />
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              className={`flex-1 py-2.5 rounded-md font-semibold transition-all text-sm sm:text-base ${
                activeTab === "login" 
                  ? "bg-amber-500 text-white shadow-md" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2.5 rounded-md font-semibold transition-all text-sm sm:text-base ${
                activeTab === "register" 
                  ? "bg-amber-500 text-white shadow-md" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {/* LOGIN */}
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-3 pl-10 pr-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Login to Dashboard"}
              </button>
            </form>
          ) : (
            /* REGISTER - responsive spacing */
            <form onSubmit={handleRegister} className="space-y-3 sm:space-y-3.5">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  placeholder="Full Name" 
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  placeholder="Company Name (Optional)" 
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                  value={registerData.companyName}
                  onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  placeholder="Email" 
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  placeholder="WhatsApp Number" 
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                  value={registerData.whatsappNumber}
                  onChange={(e) => setRegisterData({ ...registerData, whatsappNumber: e.target.value })}
                />
              </div>

              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors appearance-none text-sm sm:text-base"
                  value={registerData.country}
                  onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                >
                  <option value="" className="text-gray-400">Select Country</option>
                  {countries.map(c => <option key={c} className="text-gray-800">{c}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</div>
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors appearance-none text-sm sm:text-base"
                  value={registerData.businessType}
                  onChange={(e) => setRegisterData({ ...registerData, businessType: e.target.value })}
                >
                  <option value="" className="text-gray-400">Business Type</option>
                  {businessTypeOptions.map(b => <option key={b} className="text-gray-800">{b}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</div>
              </div>

              {registerData.businessType === "Other" && (
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Custom Business Type"
                    className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                    value={registerData.customBusinessType}
                    onChange={(e) => setRegisterData({ ...registerData, customBusinessType: e.target.value })}
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="Password (min 6 characters)" 
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all mt-4 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Account"}
              </button>
            </form>
          )}

          {/* divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400">OR</span>
            </div>
          </div>

          {/* google button */}
          <button
            onClick={handleGoogle}
            className="w-full border border-gray-300 bg-white p-3 rounded-lg text-gray-700 font-medium flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-amber-500 transition-all text-sm sm:text-base"
            disabled={loading}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#FF6B35" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#E63946" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FF6B35" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#E63946" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="hidden xs:inline">Continue with Google</span>
            <span className="xs:hidden">Google</span>
          </button>

          {/* trust badges - responsive layout */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span>Global Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthDrawer;