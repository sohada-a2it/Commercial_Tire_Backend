"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <p className="text-gray-600 mt-2">Moderator product management controls will appear here.</p>
      </div>
    </DashboardLayout>
  );
}
