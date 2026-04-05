"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { getAllInquiries } from "@/services/orderFlowService";
import toast from "react-hot-toast";
import Link from "next/link";

const statusLabel = {
  in_process: "In Process",
  invoice_sent: "Invoice Sent",
  cancelled: "Cancelled",
};

export default function InquiriesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = role === "admin" || role === "moderator";
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);

  const refreshInquiries = async () => {
    try {
      setLoading(true);
      const data = await getAllInquiries();
      setInquiries(data.inquiries || []);
    } catch (error) {
      toast.error(error.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      refreshInquiries();
    }
  }, [isStaff]);

  if (!isStaff) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800">All Inquiries</h1>
          <p className="text-gray-600 mt-2">Only admin/moderator can access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800">All Inquiries</h1>
          <p className="text-gray-600 mt-2">
            Every checkout inquiry appears here. Review full order details and send invoice directly.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          {loading ? (
            <p className="text-gray-600">Loading inquiries...</p>
          ) : inquiries.length === 0 ? (
            <p className="text-gray-600">No inquiries yet.</p>
          ) : (
            <div className="space-y-5">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{inquiry.inquiryNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(inquiry.createdAt).toLocaleString()} | Status: {statusLabel[inquiry.status] || inquiry.status}
                      </p>
                    </div>
                    {inquiry.linkedInvoice ? (
                      <span className="px-3 py-1.5 rounded bg-emerald-100 text-emerald-700 text-sm font-medium">
                        Invoice Sent
                      </span>
                    ) : (
                      <Link
                        href={`/dashboard/create-invoice?inquiryId=${inquiry.id}`}
                        className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Create Invoice
                      </Link>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white border rounded-md p-3">
                      <p className="font-semibold text-gray-800 mb-2">Customer</p>
                      <p className="text-gray-700">Name: {inquiry.customer?.name}</p>
                      <p className="text-gray-700">Email: {inquiry.customer?.email}</p>
                      <p className="text-gray-700">Phone: {inquiry.customer?.phone}</p>
                      <p className="text-gray-700">Address: {inquiry.customer?.address}</p>
                      <p className="text-gray-700">
                        {inquiry.customer?.city}, {inquiry.customer?.state} {inquiry.customer?.zipCode}
                      </p>
                      {inquiry.customer?.notes && (
                        <p className="text-gray-700 mt-1">Additional Note: {inquiry.customer.notes}</p>
                      )}
                    </div>
                    <div className="bg-white border rounded-md p-3">
                      <p className="font-semibold text-gray-800 mb-2">Order Summary</p>
                      <p className="text-gray-700">Payment Method: {inquiry.paymentMethod}</p>
                      <p className="text-gray-700">Subtotal: ${Number(inquiry.subtotal || 0).toFixed(2)}</p>
                      <p className="text-gray-700">Total: ${Number(inquiry.total || 0).toFixed(2)}</p>
                      <p className="text-gray-700">Items: {inquiry.items?.length || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm bg-white border rounded-md">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="text-left px-3 py-2 border-b">Product</th>
                          <th className="text-left px-3 py-2 border-b">Title</th>
                          <th className="text-right px-3 py-2 border-b">Qty</th>
                          <th className="text-right px-3 py-2 border-b">Unit Price</th>
                          <th className="text-right px-3 py-2 border-b">Discount</th>
                          <th className="text-right px-3 py-2 border-b">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(inquiry.items || []).map((item, index) => (
                          <tr key={`${item.productId || "item"}-${index}`}>
                            <td className="px-3 py-2 border-b text-gray-700">{item.name}</td>
                            <td className="px-3 py-2 border-b text-gray-700">{item.title || item.name}</td>
                            <td className="px-3 py-2 border-b text-right text-gray-700">{Number(item.quantity || 0)}</td>
                            <td className="px-3 py-2 border-b text-right text-gray-700">
                              ${Number(item.unitPrice || 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 border-b text-right text-gray-700">
                              ${Number(item.discount || 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 border-b text-right text-gray-900 font-medium">
                              ${Number(item.lineTotal || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
