"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function MyInvoicesPage() {
  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">My Invoices</h1>
        <p className="text-gray-600 mt-2">Customer invoices will appear here.</p>
      </div>
    </DashboardLayout>
  );
}
