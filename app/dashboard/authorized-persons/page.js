"use client";

import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import {
  createAuthorizedPerson,
  deleteAuthorizedPerson,
  getAuthorizedPersons,
  updateAuthorizedPerson,
} from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { Loader2, Trash2, UserCog } from "lucide-react";
import toast from "react-hot-toast";

const defaultForm = {
  fullName: "",
  email: "",
  password: "",
  role: "moderator",
};

export default function AuthorizedPersonsPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editUserId, setEditUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = useMemo(() => role === "admin", [role]);

  const fetchAuthorizedUsers = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await getAuthorizedPersons();
    if (!result.success) {
      toast.error(result.message || "Failed to load authorized persons");
      setUsers([]);
      setLoading(false);
      return;
    }

    setUsers(result.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAuthorizedUsers();
  }, [isAdmin]);

  const resetForm = () => {
    setFormData(defaultForm);
    setEditUserId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.fullName || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    if (!editUserId && !formData.password) {
      toast.error("Password is required for new authorized person");
      return;
    }

    setSaving(true);

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role,
      ...(formData.password ? { password: formData.password } : {}),
    };

    const result = editUserId
      ? await updateAuthorizedPerson(editUserId, payload)
      : await createAuthorizedPerson(payload);

    if (!result.success) {
      toast.error(result.message || "Operation failed");
      setSaving(false);
      return;
    }

    toast.success(editUserId ? "Authorized person updated" : "Authorized person created");
    resetForm();
    await fetchAuthorizedUsers();
    setSaving(false);
  };

  const handleEdit = (selectedUser) => {
    setEditUserId(selectedUser.firebaseUid);
    setFormData({
      fullName: selectedUser.fullName,
      email: selectedUser.email,
      password: "",
      role: selectedUser.role,
    });
  };

  const handleDelete = async (firebaseUid) => {
    if (!confirm("Delete this authorized person?")) {
      return;
    }

    const result = await deleteAuthorizedPerson(firebaseUid);
    if (!result.success) {
      toast.error(result.message || "Failed to delete authorized person");
      return;
    }

    toast.success("Authorized person deleted");
    await fetchAuthorizedUsers();
  };

  return (
    <DashboardLayout>
      {!isAdmin ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-600 mt-2">Only admin can manage authorized persons.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <UserCog className="w-8 h-8 text-teal-600" />
              Authorized Persons
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage admin and moderator accounts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editUserId ? "Update Authorized Person" : "Create Authorized Person"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.fullName}
                onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Full name"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Email"
              />
              <input
                type="password"
                value={formData.password}
                onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={editUserId ? "New password (optional)" : "Password"}
              />
              <select
                value={formData.role}
                onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={saving}
                type="submit"
                className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-70"
              >
                {saving ? "Saving..." : editUserId ? "Update" : "Create"}
              </button>
              {editUserId ? (
                <button
                  onClick={resetForm}
                  type="button"
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-10 text-gray-600">No authorized persons found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{account.fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{account.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                            {account.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(account)}
                              className="px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(account.firebaseUid)}
                              className="p-2 rounded bg-red-50 text-red-700 hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
