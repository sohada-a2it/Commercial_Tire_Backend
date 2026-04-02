"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

export default function DashboardSettingsPage() {
  const { userProfile } = useAuth();

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6 space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Profile customization and account settings can be managed here.</p>
        <p className="text-sm text-gray-500">Current role: {userProfile?.role || "customer"}</p>
      </div>
    </DashboardLayout>
  );
}
