"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { deleteInvoice, downloadInvoicePdf, getAllInvoices } from "@/services/orderFlowService";
import { CalendarDays, Download, Filter, Layers3, Package, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const paymentStatusLabel = {
  due: "Due",
  unpaid: "Unpaid",
  partial: "Partial",
  full: "Full",
  paid: "Full",
};

const paymentStatusStyles = {
  due: "bg-amber-100 text-amber-800",
  unpaid: "bg-rose-100 text-rose-800",
  partial: "bg-orange-100 text-orange-800",
  full: "bg-emerald-100 text-emerald-800",
  paid: "bg-emerald-100 text-emerald-800",
};

const statusPriority = {
  due: 0,
  unpaid: 1,
  partial: 2,
  full: 3,
  paid: 3,
};

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const getImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (typeof image === "object") return image.url || image.src || "";
  return "";
};

const normalizeInvoiceStatus = (status) => {
  const normalized = String(status || "unpaid").trim().toLowerCase();
  return normalized === "paid" ? "full" : normalized;
};

export default function AdminInvoicesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isAdmin = role === "admin";
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState("");

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getAllInvoices();
      setInvoices(data.invoices || []);
    } catch (error) {
      toast.error(error.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadInvoices();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

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

  const handleDelete = async (invoice) => {
    if (!confirm(`Delete invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    try {
      setDeletingId(invoice.id);
      const result = await deleteInvoice(invoice.id);
      toast.success(result.message || "Invoice deleted");
      await loadInvoices();
    } catch (error) {
      toast.error(error.message || "Failed to delete invoice");
    } finally {
      setDeletingId("");
    }
  };

  const filteredInvoices = useMemo(() => {
    const list = invoices.map((invoice) => ({
      ...invoice,
      normalizedStatus: normalizeInvoiceStatus(invoice.paymentStatus),
    }));

    const statusFiltered = statusFilter === "all" ? list : list.filter((invoice) => invoice.normalizedStatus === statusFilter);

    return [...statusFiltered].sort((left, right) => {
      if (sortBy === "status") {
        const diff = (statusPriority[left.normalizedStatus] ?? 99) - (statusPriority[right.normalizedStatus] ?? 99);
        if (diff !== 0) return diff;
      }

      return new Date(right.issuedAt || right.createdAt) - new Date(left.issuedAt || left.createdAt);
    });
  }, [invoices, sortBy, statusFilter]);

  const totalBalance = useMemo(
    () => filteredInvoices.reduce((sum, invoice) => sum + Number(invoice.balanceDue || 0), 0),
    [filteredInvoices]
  );

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Invoice Management</h1>
          <p className="mt-2 text-slate-600">Only admin can access the invoice management route.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80">Admin billing</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Invoices</h1>
              <p className="mt-3 text-sm leading-6 text-slate-200 md:text-base">
                Review every already-sent invoice, sort by payment status, download PDFs, and delete an invoice if needed.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
              <div>
                <div className="text-slate-300">Count</div>
                <div className="text-lg font-semibold">{filteredInvoices.length}</div>
              </div>
              <div>
                <div className="text-slate-300">Balance</div>
                <div className="text-lg font-semibold">{formatCurrency(totalBalance)}</div>
              </div>
              <div>
                <div className="text-slate-300">Ready</div>
                <div className="text-lg font-semibold">PDF</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Filter className="h-5 w-5 text-teal-600" />
              <div>
                <h2 className="text-lg font-semibold">Filter and sort</h2>
                <p className="text-sm text-slate-600">Narrow invoices by payment status or order them by status flow.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500">
                <option value="all">All statuses</option>
                <option value="due">Due</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="full">Full</option>
              </select>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500">
                <option value="newest">Sort: Newest</option>
                <option value="status">Sort: Payment status</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">No invoices found.</div>
        ) : (
          <div className="grid gap-4">
            {filteredInvoices.map((invoice) => {
              const previewItems = (invoice.items || []).slice(0, 3);
              const normalizedStatus = invoice.normalizedStatus;

              return (
                <article key={invoice.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Invoice</p>
                          <h3 className="text-xl font-semibold text-slate-900">{invoice.invoiceNumber}</h3>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusStyles[normalizedStatus] || "bg-slate-100 text-slate-700"}`}>
                          {paymentStatusLabel[normalizedStatus] || normalizedStatus}
                        </span>
                      </div>
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(invoice.issuedAt || invoice.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">Inquiry: {invoice.inquiryId}</p>
                      <p className="text-sm text-slate-600">Payment method: {invoice.customer?.paymentMethod || "bank"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 self-start">
                      <button
                        onClick={() => handleDownloadPdf(invoice)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        <Download className="h-4 w-4" /> PDF
                      </button>
                      <button
                        onClick={() => handleDelete(invoice)}
                        disabled={deletingId === invoice.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" /> {deletingId === invoice.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-5 p-5 lg:grid-cols-[1.35fr_1fr]">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        <Layers3 className="h-4 w-4" /> Items
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {previewItems.map((item, index) => {
                          const imageUrl = getImageUrl(item.image);

                          return (
                            <div key={`${item.productId || "item"}-${index}`} className="flex gap-3 rounded-2xl border border-slate-200 p-3">
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                {imageUrl ? (
                                  <img src={imageUrl} alt={item.title || item.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">{item.title || item.name}</p>
                                <p className="text-xs text-slate-600">Qty {Number(item.quantity || 0)}</p>
                                <p className="text-xs text-slate-600">{formatCurrency(item.lineTotal)}</p>
                              </div>
                            </div>
                          );
                        })}
                        {previewItems.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No item preview.</div>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      <div>
                        <span className="text-slate-500">Customer</span>
                        <p className="font-medium text-slate-900">{invoice.customer?.name}</p>
                        <p>{invoice.customer?.email}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Paid</span>
                        <p className="font-medium text-slate-900">{formatCurrency(invoice.paidAmount)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Balance due</span>
                        <p className="font-medium text-slate-900">{formatCurrency(invoice.balanceDue)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Product subtotal</span>
                        <p className="font-medium text-slate-900">{formatCurrency(invoice.productSubtotal || invoice.subtotal)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
