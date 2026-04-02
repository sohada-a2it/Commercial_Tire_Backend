"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";

export default function CreateInvoicePage() {
  const { userProfile } = useAuth();
  const isAdmin = normalizeRole(userProfile?.role) === "admin";

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Invoice</h1>
        <p className="text-gray-600 mt-2">
          {isAdmin
            ? "Admin invoice creation module can be implemented here."
            : "Only admin can create invoices."}
        </p>
      </div>
    </DashboardLayout>
  );
}
