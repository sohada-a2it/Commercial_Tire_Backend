"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, User, LogOut, HomeIcon } from "lucide-react";
import Sidebar from "./Sidebar";
import Image from "next/image";
import { canAccessDashboardPath, normalizeRole } from "@/config/dashboardRoutes";

const DashboardLayout = ({ children }) => {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const role = normalizeRole(userProfile?.role);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Protect dashboard - redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  React.useEffect(() => {
    if (!user || !pathname) {
      return;
    }

    if (!canAccessDashboardPath(role, pathname)) {
      router.replace("/dashboard");
    }
  }, [pathname, role, router, user]);

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-md z-30">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left - Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-600 hover:text-teal-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Center - Logo for mobile */}
            <div className="lg:hidden">
              <h1 className="text-xl font-bold text-teal-600">Dashboard</h1>
            </div>

            {/* Right - User Profile */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Notifications */}
              {/* <button className="relative text-gray-600 hover:text-teal-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button> */}

              {/* User Dropdown */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">
                    {userProfile?.fullName || user.displayName || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {role}
                  </p>
                </div>
              </div>

              {/* Home Button */}
              <button
                onClick={() => router.push("/")}
                className="text-gray-600 hover:text-teal-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Home"
              >
                <HomeIcon className="w-5 h-5" />
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
