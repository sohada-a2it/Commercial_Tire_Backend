"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { LayoutDashboard, Users, Package, ShoppingCart } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: "0",
      color: "bg-blue-500",
    },
    {
      icon: Package,
      label: "Products",
      value: "0",
      color: "bg-green-500",
    },
    {
      icon: ShoppingCart,
      label: "Orders",
      value: "0",
      color: "bg-purple-500",
    },
    {
      icon: LayoutDashboard,
      label: "Revenue",
      value: "$0",
      color: "bg-yellow-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="text-gray-600 text-center py-8">
            <p>No recent activity to display</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 transition-colors text-left">
              <Users className="w-6 h-6 text-teal-600 mb-2" />
              <h3 className="font-semibold text-gray-800">View Users</h3>
              <p className="text-sm text-gray-600">Manage user accounts</p>
            </button>
            <button className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 transition-colors text-left">
              <Package className="w-6 h-6 text-teal-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Manage Products</h3>
              <p className="text-sm text-gray-600">Add or edit products</p>
            </button>
            <button className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 transition-colors text-left">
              <ShoppingCart className="w-6 h-6 text-teal-600 mb-2" />
              <h3 className="font-semibold text-gray-800">View Orders</h3>
              <p className="text-sm text-gray-600">Check order status</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
