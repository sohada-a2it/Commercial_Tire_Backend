"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User, LogOut, HomeIcon } from "lucide-react";
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
    <div className="flex min-h-screen bg-slate-100 text-slate-900 overflow-hidden lg:pl-72">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} role={role} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm z-30">
          <div className="flex items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-slate-600 hover:text-teal-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.18em]">
                  Dashboard workspace
                </p>
                
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-300 hover:text-teal-700 hover:shadow-sm transition-all"
              >
                <HomeIcon className="w-4 h-4" /> Home
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-red-300 hover:text-red-600 hover:shadow-sm transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
