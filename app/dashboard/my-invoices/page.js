"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { downloadInvoicePdf, getAllInvoices, getMyInvoices } from "@/services/orderFlowService";
import toast from "react-hot-toast";

export default function MyInvoicesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = role === "admin" || role === "moderator";
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  const handleDownloadPdf = async (invoice) => {
    try {
      const blob = await downloadInvoicePdf(invoice.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber || "invoice"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || "Failed to download PDF");
    }
  };

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = isStaff ? await getAllInvoices() : await getMyInvoices();
        setInvoices(data.invoices || []);
      } catch (error) {
        toast.error(error.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [isStaff]);

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isStaff ? "Invoice List" : "My Invoices"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isStaff
            ? "All generated invoices are listed here."
            : "Your generated invoices appear here after admin issues them."}
        </p>

        {loading ? (
          <p className="mt-6 text-gray-600">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="mt-6 text-gray-600">No invoices found.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700">
                  <th className="text-left px-3 py-3">Invoice</th>
                  {isStaff && <th className="text-left px-3 py-3">Customer</th>}
                  <th className="text-left px-3 py-3">Amount</th>
                  <th className="text-left px-3 py-3">Payment</th>
                  <th className="text-left px-3 py-3">Items</th>
                  <th className="text-left px-3 py-3">Issued</th>
                  <th className="text-left px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b align-top">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-gray-500">Inquiry: {invoice.inquiryId}</p>
                      <p className="text-xs text-gray-500 mt-1">Payment Method: {invoice.customer?.paymentMethod || "bank"}</p>
                    </td>
                    {isStaff && (
                      <td className="px-3 py-3">
                        <p className="text-gray-900">{invoice.customer?.name}</p>
                        <p className="text-gray-500">{invoice.customer?.email}</p>
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <p className="text-gray-900 font-medium">${Number(invoice.total || 0).toFixed(2)}</p>
                      <p className="text-gray-500 text-xs">Paid: ${Number(invoice.paidAmount || 0).toFixed(2)}</p>
                      <p className="text-gray-500 text-xs">Due: ${Number(invoice.balanceDue || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3 min-w-[280px]">
                      <div className="space-y-1">
                        {(invoice.items || []).map((item, index) => (
                          <p key={`${item.productId || "item"}-${index}`} className="text-xs text-gray-700">
                            {item.title || item.name} | Qty: {item.quantity} | Unit: ${Number(item.unitPrice || 0).toFixed(2)} | Discount: ${Number(item.discount || 0).toFixed(2)} | Total: ${Number(item.lineTotal || 0).toFixed(2)}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {new Date(invoice.issuedAt || invoice.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleDownloadPdf(invoice)}
                        className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
