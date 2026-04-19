"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, User, Circle, LayoutDashboard, Settings, FileText, BarChart3, ShoppingCart, Users, Truck, Wrench, LogOut } from "lucide-react";
import { normalizeRole, sidebarRoutesByRole } from "@/config/dashboardRoutes";

const Sidebar = ({ isOpen, toggleSidebar, role }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const normalizedRole = normalizeRole(role);
  const menuItems =
    sidebarRoutesByRole[normalizedRole] || sidebarRoutesByRole.customer;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024 && isCollapsed) {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";
  const isSidebarOpen = isOpen || (!isMobile && !isCollapsed);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen ${sidebarWidth} z-50 transform overflow-y-auto bg-gradient-to-b from-slate-950 via-gray-600 to-amber-600 text-slate-100 shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : "translate-x-0"
        } ${isCollapsed && !isMobile ? "hover:w-72" : ""}`}
        style={{ transitionProperty: "width, transform" }}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            {/* Header */}
            <div className={`relative flex items-center justify-between px-4 py-6 border-b border-amber-500/20 transition-all duration-300 ${
              isCollapsed && !isMobile ? "flex-col gap-4" : ""
            }`}>
              <div className={`${isCollapsed && !isMobile ? "text-center" : ""}`}>
                {!isCollapsed || isMobile ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
                      Control Center
                    </p>
                    <h2 className="mt-2 text-xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                      Commercial Tire
                    </h2>
                  </>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">CT</span>
                  </div>
                )}
              </div>
              
              {/* <div className="flex gap-2"> 
                {!isMobile && (
                  <button
                    onClick={toggleCollapse}
                    className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-slate-200 hover:text-white"
                  >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                )}
                 
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="lg:hidden text-slate-100 hover:bg-white/10 p-2 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div> */}
            </div>

            {/* Menu Items */}
            <nav className="px-3 py-6">
              <ul className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-white/15 text-white shadow-lg ring-1 ring-white/20"
                            : "text-slate-200 hover:bg-white/10 hover:text-white"
                        } ${isCollapsed && !isMobile ? "justify-center" : ""}`}
                        onClick={() => {
                          if (isMobile && window.innerWidth < 1024) {
                            toggleSidebar();
                          }
                        }}
                      >
                        <Icon className={`${isCollapsed && !isMobile ? "w-5 h-5" : "w-5 h-5"} transition-all`} />
                        
                        {(!isCollapsed || isMobile) && (
                          <span className="truncate">{item.label}</span>
                        )}
                        
                        {/* Tooltip for collapsed mode */}
                        {isCollapsed && !isMobile && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                            {item.label}
                          </div>
                        )}

                        {/* Active indicator */}
                        {active && (
                          <div className={`absolute inset-y-0 ${isCollapsed && !isMobile ? "left-0" : "right-0"} w-0.5 bg-amber-400 rounded-full`} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Footer */}
          <div className={`px-4 pb-6 ${isCollapsed && !isMobile ? "px-2" : ""}`}>
            <div className={`rounded-xl border border-white/10 bg-white/5 p-3 shadow-inner transition-all duration-300 ${
              isCollapsed && !isMobile ? "text-center" : ""
            }`}>
              {!isCollapsed || isMobile ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">Signed in as</p>
                      <p className="text-sm font-medium text-amber-300 truncate capitalize">{normalizedRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    <span>Active Session</span>
                  </div>
                </>
              ) : (
                <div className="relative group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto cursor-pointer">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                    {normalizedRole}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;