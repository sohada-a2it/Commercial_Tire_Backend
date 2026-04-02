"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function InquiriesPage() {
  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">All Inquiries</h1>
        <p className="text-gray-600 mt-2">Moderator can review all inquiries from this page.</p>
      </div>
    </DashboardLayout>
  );
}
