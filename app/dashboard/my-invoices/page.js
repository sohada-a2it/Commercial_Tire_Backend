"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { downloadInvoicePdf, getAllInvoices, getMyInvoices } from "@/services/orderFlowService";
import { CalendarDays, Download, FileText, Filter, Layers3, Package, ReceiptText } from "lucide-react";
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

export default function MyInvoicesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = role === "admin" || role === "moderator";
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80">Billing</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{isStaff ? "Invoice List" : "My Invoices"}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-200 md:text-base">
                {isStaff
                  ? "All invoices are listed here, sortable by payment status and ready for PDF download."
                  : "Your invoices appear here after admin issues them, with a clean download experience."}
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
                <div className="text-slate-300">Download</div>
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
                <p className="text-sm text-slate-600">Narrow invoices by status or order them by payment progression.</p>
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

                    <div className="flex items-center gap-3 self-start rounded-2xl bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total</p>
                        <p className="text-lg font-semibold text-slate-900">{formatCurrency(invoice.total)}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadPdf(invoice)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        <Download className="h-4 w-4" /> PDF
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

                    <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      {isStaff ? (
                        <div>
                          <span className="text-slate-500">Customer</span>
                          <p className="font-medium text-slate-900">{invoice.customer?.name}</p>
                          <p>{invoice.customer?.email}</p>
                        </div>
                      ) : null}
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
                      {invoice.notes ? (
                        <div>
                          <span className="text-slate-500">Notes</span>
                          <p className="font-medium text-slate-900">{invoice.notes}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && filteredInvoices.length > 0 ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
            <FileText className="mr-2 inline-block h-4 w-4 text-teal-600" />
            PDFs are generated from the same invoice record, so customers and staff see the same totals.
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
