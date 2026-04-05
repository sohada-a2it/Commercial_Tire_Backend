"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { getMyInquiries } from "@/services/orderFlowService";
import toast from "react-hot-toast";

const statusLabel = {
  in_process: "In Process",
  invoice_sent: "Invoice Sent",
  cancelled: "Cancelled",
};

export default function MyInquiriesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await getMyInquiries();
      setInquiries(data.inquiries || []);
    } catch (error) {
      toast.error(error.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">My Inquiries</h1>
        <p className="text-gray-600 mt-2">
          Full order history from checkout appears here. Admin will contact you and send invoice.
        </p>

        {role !== "customer" ? (
          <p className="mt-6 text-gray-600">Use this page as customer to review your inquiries.</p>
        ) : loading ? (
          <p className="mt-6 text-gray-600">Loading inquiries...</p>
        ) : inquiries.length === 0 ? (
          <p className="mt-6 text-gray-600">No inquiries yet. Place an order from checkout.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{inquiry.inquiryNumber}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(inquiry.createdAt).toLocaleString()} | Status: {statusLabel[inquiry.status] || inquiry.status}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">${Number(inquiry.total || 0).toFixed(2)}</p>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white border rounded-md p-3">
                    <p className="font-semibold text-gray-800 mb-2">Customer Details</p>
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
                    <p className="font-semibold text-gray-800 mb-2">Order Info</p>
                    <p className="text-gray-700">Payment Method: {inquiry.paymentMethod}</p>
                    <p className="text-gray-700">Subtotal: ${Number(inquiry.subtotal || 0).toFixed(2)}</p>
                    <p className="text-gray-700">Total: ${Number(inquiry.total || 0).toFixed(2)}</p>
                    {inquiry.linkedInvoice && (
                      <p className="text-emerald-700 mt-1 font-medium">Invoice has been generated for this inquiry.</p>
                    )}
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
    </DashboardLayout>
  );
}
