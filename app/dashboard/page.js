"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { getAllUsers } from "@/services/userService";
import { getAllInquiries, getAllInvoices, getMyInquiries, getMyInvoices } from "@/services/orderFlowService";
import { ClipboardList, FileText, LayoutDashboard, Package, Users } from "lucide-react";
import toast from "react-hot-toast";

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const titleByRole = {
  admin: "Admin Dashboard",
  moderator: "Moderator Dashboard",
  customer: "Customer Dashboard",
};

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (role === "admin") {
          const [usersResult, inquiriesResult, invoicesResult] = await Promise.all([
            getAllUsers({ limit: 200, role: "customer" }),
            getAllInquiries(),
            getAllInvoices(),
          ]);

          setUsers(usersResult.users || []);
          setInquiries(inquiriesResult.inquiries || []);
          setInvoices(invoicesResult.invoices || []);
        } else if (role === "moderator") {
          const [inquiriesResult, invoicesResult] = await Promise.all([
            getAllInquiries(),
            getAllInvoices(),
          ]);

          setUsers([]);
          setInquiries(inquiriesResult.inquiries || []);
          setInvoices(invoicesResult.invoices || []);
        } else {
          const [myInquiriesResult, myInvoicesResult] = await Promise.all([
            getMyInquiries(),
            getMyInvoices(),
          ]);

          setUsers([]);
          setInquiries(myInquiriesResult.inquiries || []);
          setInvoices(myInvoicesResult.invoices || []);
        }
      } catch (error) {
        toast.error(error.message || "Failed to load dashboard overview");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [role]);

  const salesTotal = useMemo(
    () => invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
    [invoices]
  );

  const recentInquiries = useMemo(
    () => [...inquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [inquiries]
  );

  const recentInvoices = useMemo(
    () => [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [invoices]
  );

  const recentUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [users]
  );

  const statCards = useMemo(() => {
    if (role === "admin") {
      return [
        { icon: Users, label: "Customer List", value: String(users.length), color: "bg-blue-500" },
        { icon: ClipboardList, label: "Inquiry List", value: String(inquiries.length), color: "bg-orange-500" },
        { icon: FileText, label: "Invoice List", value: String(invoices.length), color: "bg-green-500" },
        { icon: LayoutDashboard, label: "Sell List", value: formatCurrency(salesTotal), color: "bg-yellow-500" },
      ];
    }

    if (role === "moderator") {
      return [
        { icon: ClipboardList, label: "Inquiry List", value: String(inquiries.length), color: "bg-orange-500" },
        { icon: FileText, label: "Invoice List", value: String(invoices.length), color: "bg-green-500" },
        {
          icon: LayoutDashboard,
          label: "Sell List",
          value: formatCurrency(salesTotal),
          color: "bg-yellow-500",
        },
        {
          icon: Package,
          label: "Open Inquiries",
          value: String(inquiries.filter((item) => item.status === "in_process").length),
          color: "bg-blue-500",
        },
      ];
    }

    return [
      { icon: ClipboardList, label: "My Inquiry List", value: String(inquiries.length), color: "bg-orange-500" },
      { icon: FileText, label: "My Invoice List", value: String(invoices.length), color: "bg-green-500" },
      {
        icon: LayoutDashboard,
        label: "My Sell List",
        value: formatCurrency(invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)),
        color: "bg-yellow-500",
      },
      {
        icon: Package,
        label: "Pending Inquiries",
        value: String(inquiries.filter((item) => item.status === "in_process").length),
        color: "bg-blue-500",
      },
    ];
  }, [role, users.length, inquiries, invoices, salesTotal]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{titleByRole[role] || "Dashboard"}</h1>
          <p className="text-gray-600 mt-1">Personal overview based on your role</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? "..." : stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{role === "customer" ? "My Inquiry List" : "Inquiry List"}</h2>
              <Link href={role === "customer" ? "/dashboard/my-inquiries" : "/dashboard/inquiries"} className="text-sm font-medium text-teal-700 hover:text-teal-900">
                View all
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : recentInquiries.length === 0 ? (
              <p className="text-gray-600">No inquiries yet.</p>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="rounded-lg border border-gray-200 px-4 py-3">
                    <div className="font-semibold text-gray-900">{inquiry.inquiryNumber}</div>
                    <div className="text-sm text-gray-600">{inquiry.customer?.name || "N/A"} • {new Date(inquiry.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{role === "customer" ? "My Invoice List" : "Invoice List"}</h2>
              <Link href={role === "customer" ? "/dashboard/my-invoices" : "/dashboard/invoices"} className="text-sm font-medium text-teal-700 hover:text-teal-900">
                View all
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : recentInvoices.length === 0 ? (
              <p className="text-gray-600">No invoices yet.</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-lg border border-gray-200 px-4 py-3">
                    <div className="font-semibold text-gray-900">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-gray-600">{formatCurrency(invoice.total)} • {new Date(invoice.createdAt || invoice.issuedAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {role === "admin" ? (
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">User List</h2>
              <Link href="/dashboard/users" className="text-sm font-medium text-teal-700 hover:text-teal-900">
                View all users
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : recentUsers.length === 0 ? (
              <p className="text-gray-600">No users found.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {recentUsers.map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 px-4 py-3">
                    <div className="font-semibold text-gray-900">{item.fullName || "N/A"}</div>
                    <div className="text-sm text-gray-600">{item.email || "N/A"}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
