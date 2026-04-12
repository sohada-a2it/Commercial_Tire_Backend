"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { normalizeRole, sidebarRoutesByRole } from "@/config/dashboardRoutes";

const Sidebar = ({ isOpen, toggleSidebar, role }) => {
  const pathname = usePathname();
  const normalizedRole = normalizeRole(role);
  const menuItems =
    sidebarRoutesByRole[normalizedRole] || sidebarRoutesByRole.customer;

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 z-50 transform overflow-y-auto bg-gradient-to-b from-slate-950 via-teal-950 to-teal-900 text-slate-100 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-6 py-6 border-b border-teal-700/50">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">
                  Control Center
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">Asian Import</h2>
              </div>
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-slate-100 hover:bg-slate-800 p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            {/* Menu Items */}
            <nav className="px-4 pb-8">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-white/10 text-white shadow-lg ring-1 ring-white/10"
                            : "text-slate-200 hover:bg-white/10 hover:text-white"
                        }`}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            toggleSidebar();
                          }
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="px-6 pb-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-inner">
              <p className="font-semibold text-white">Signed in as</p>
              <p className="mt-2 text-sm text-slate-300">{normalizedRole}</p>
              <p className="mt-1 text-xs text-white">Your workspace is fully synchronized.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
