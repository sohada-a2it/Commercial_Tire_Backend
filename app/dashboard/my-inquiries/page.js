"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { acceptInquiryQuote, getMyInquiries } from "@/services/orderFlowService";
import toast from "react-hot-toast";

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

  const onAcceptQuote = async (inquiryId) => {
    try {
      await acceptInquiryQuote(inquiryId);
      toast.success("Quote accepted. Admin can now generate your invoice.");
      await loadInquiries();
    } catch (error) {
      toast.error(error.message || "Failed to accept quote");
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">My Inquiries</h1>
        <p className="text-gray-600 mt-2">
          Track your order discussion and accept quotations to proceed to invoice.
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
                      {new Date(inquiry.createdAt).toLocaleString()} | Status: {inquiry.status}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">${Number(inquiry.total || 0).toFixed(2)}</p>
                </div>

                {inquiry.quote?.amount >= 0 && (
                  <div className="mt-3 p-3 rounded-md bg-indigo-50 border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-900">
                      Quoted Amount: ${Number(inquiry.quote.amount).toFixed(2)}
                    </p>
                    {inquiry.quote.notes && (
                      <p className="text-sm text-indigo-800 mt-1">{inquiry.quote.notes}</p>
                    )}
                  </div>
                )}

                {inquiry.status === "quoted" && (
                  <button
                    onClick={() => onAcceptQuote(inquiry.id)}
                    className="mt-3 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Accept Quote
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
