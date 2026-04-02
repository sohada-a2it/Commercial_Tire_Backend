"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function MyInquiriesPage() {
  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">My Inquiries</h1>
        <p className="text-gray-600 mt-2">Customer inquiries list will appear here.</p>
      </div>
    </DashboardLayout>
  );
}
