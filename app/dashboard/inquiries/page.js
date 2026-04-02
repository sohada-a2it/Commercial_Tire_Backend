"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import {
  getAllInquiries,
  markInquiryQuoted,
  updateInquiryStatus,
} from "@/services/orderFlowService";
import toast from "react-hot-toast";
import Link from "next/link";

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "quoted",
  "quote_accepted",
  "invoice_created",
  "closed",
  "cancelled",
];

export default function InquiriesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = role === "admin" || role === "moderator";
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [quoteDrafts, setQuoteDrafts] = useState({});

  const refreshInquiries = async () => {
    try {
      setLoading(true);
      const data = await getAllInquiries();
      const list = data.inquiries || [];
      setInquiries(list);
      setStatusDrafts(
        Object.fromEntries(list.map((inquiry) => [inquiry.id, inquiry.status]))
      );
      setQuoteDrafts(
        Object.fromEntries(
          list.map((inquiry) => [
            inquiry.id,
            {
              amount: inquiry.quote?.amount ?? inquiry.total,
              notes: inquiry.quote?.notes || "",
            },
          ])
        )
      );
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

  const activeInquiries = useMemo(
    () => inquiries.filter((i) => !["closed", "cancelled"].includes(i.status)),
    [inquiries]
  );

  const onSaveStatus = async (inquiryId) => {
    try {
      await updateInquiryStatus(inquiryId, { status: statusDrafts[inquiryId] });
      toast.success("Inquiry status updated");
      await refreshInquiries();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const onMarkQuoted = async (inquiryId) => {
    try {
      const draft = quoteDrafts[inquiryId] || {};
      await markInquiryQuoted(inquiryId, {
        amount: Number(draft.amount || 0),
        notes: draft.notes || "",
      });
      toast.success("Quote saved");
      await refreshInquiries();
    } catch (error) {
      toast.error(error.message || "Failed to save quote");
    }
  };

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
            Order inquiries appear here. Update status, set quote, and create invoice after quote acceptance.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">
          {loading ? (
            <p className="text-gray-600">Loading inquiries...</p>
          ) : activeInquiries.length === 0 ? (
            <p className="text-gray-600">No active inquiries yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700">
                  <th className="text-left px-3 py-3">Inquiry</th>
                  <th className="text-left px-3 py-3">Customer</th>
                  <th className="text-left px-3 py-3">Amount</th>
                  <th className="text-left px-3 py-3">Quote</th>
                  <th className="text-left px-3 py-3">Status</th>
                  <th className="text-left px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b align-top">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-gray-800">{inquiry.inquiryNumber}</p>
                      <p className="text-gray-500">{new Date(inquiry.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-800">{inquiry.customer?.name}</p>
                      <p className="text-gray-500">{inquiry.customer?.email}</p>
                      <p className="text-gray-500">{inquiry.customer?.phone}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900">${Number(inquiry.total || 0).toFixed(2)}</p>
                      <p className="text-gray-500">{inquiry.items?.length || 0} item(s)</p>
                    </td>
                    <td className="px-3 py-3 min-w-[230px] space-y-2">
                      <input
                        type="number"
                        min="0"
                        value={quoteDrafts[inquiry.id]?.amount ?? ""}
                        onChange={(e) =>
                          setQuoteDrafts((prev) => ({
                            ...prev,
                            [inquiry.id]: {
                              ...(prev[inquiry.id] || {}),
                              amount: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                      />
                      <textarea
                        rows={2}
                        value={quoteDrafts[inquiry.id]?.notes || ""}
                        onChange={(e) =>
                          setQuoteDrafts((prev) => ({
                            ...prev,
                            [inquiry.id]: {
                              ...(prev[inquiry.id] || {}),
                              notes: e.target.value,
                            },
                          }))
                        }
                        placeholder="Quote notes"
                        className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                      />
                      <button
                        onClick={() => onMarkQuoted(inquiry.id)}
                        className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Mark Quoted
                      </button>
                    </td>
                    <td className="px-3 py-3 min-w-[180px] space-y-2">
                      <select
                        value={statusDrafts[inquiry.id] || inquiry.status}
                        onChange={(e) =>
                          setStatusDrafts((prev) => ({ ...prev, [inquiry.id]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => onSaveStatus(inquiry.id)}
                        className="px-3 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700"
                      >
                        Save Status
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      {inquiry.status === "quote_accepted" && !inquiry.linkedInvoice ? (
                        <Link
                          href={`/dashboard/create-invoice?inquiryId=${inquiry.id}`}
                          className="inline-block px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Create Invoice
                        </Link>
                      ) : (
                        <span className="text-gray-500">
                          {inquiry.linkedInvoice ? "Invoice created" : "No action"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
