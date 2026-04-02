"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getAllUsers } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { Loader2, UserCog } from "lucide-react";
import toast from "react-hot-toast";

export default function ModeratorsPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModerators = async () => {
      if (role !== "admin") {
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await getAllUsers({ limit: 200 });
      if (!result.success) {
        toast.error(result.message || "Failed to load moderators");
        setUsers([]);
        setLoading(false);
        return;
      }

      const moderatorUsers = (result.users || [])
        .filter((user) => normalizeRole(user.role) === "moderator")
        .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || "", undefined, { sensitivity: "base" }));

      setUsers(moderatorUsers);
      setLoading(false);
    };

    fetchModerators();
  }, [role]);

  return (
    <DashboardLayout>
      {role !== "admin" ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-600 mt-2">Only admins can access moderator list.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <UserCog className="w-8 h-8 text-teal-600" />
                Moderator A-Z
              </h1>
              <p className="text-gray-600 mt-1">All moderators sorted alphabetically.</p>
            </div>
            <div className="bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md">
              <p className="text-sm font-medium">Total:</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-600">No moderators found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{user.email || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{user.role}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
