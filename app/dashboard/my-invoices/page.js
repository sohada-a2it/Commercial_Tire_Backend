"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { downloadInvoicePdf, getAllInvoices, getMyInvoices } from "@/services/orderFlowService";
import { Download, Eye, FileText, Filter, Package, ReceiptText, X } from "lucide-react";
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
  const [activeInvoice, setActiveInvoice] = useState(null);

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

  const activeInvoiceItems = activeInvoice?.items || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 [color-scheme:light]">
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
              const normalizedStatus = invoice.normalizedStatus;

              return (
                <article key={invoice.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="grid gap-3 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr_1.3fr_0.8fr_0.9fr_0.8fr_0.8fr_auto] lg:items-center">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Invoice ID</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{invoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Customer</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{invoice.customer?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                      <p className="mt-1 text-sm text-slate-700 break-all">{invoice.customer?.email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(invoice.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Date</p>
                      <p className="mt-1 text-sm text-slate-700">{new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Method</p>
                      <p className="mt-1 text-sm text-slate-700 capitalize">{String(invoice.customer?.paymentMethod || "bank").replace("-", " ")}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                      <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusStyles[normalizedStatus] || "bg-slate-100 text-slate-700"}`}>
                        {paymentStatusLabel[normalizedStatus] || normalizedStatus}
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveInvoice(invoice)}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(invoice)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        <Download className="h-4 w-4" /> PDF
                      </button>
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

        {activeInvoice ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-teal-600">Invoice detail</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">{activeInvoice.invoiceNumber}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInvoice(null)}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
                  <section className="space-y-5">
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusStyles[activeInvoice.normalizedStatus] || "bg-slate-100 text-slate-700"}`}>
                          {paymentStatusLabel[activeInvoice.normalizedStatus] || activeInvoice.normalizedStatus}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {new Date(activeInvoice.issuedAt || activeInvoice.createdAt).toLocaleString()}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {formatCurrency(activeInvoice.total)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-sm font-semibold text-slate-900">Customer details</p>
                          <div className="mt-3 space-y-1 text-sm text-slate-600">
                            <p>{activeInvoice.customer?.name}</p>
                            <p>{activeInvoice.customer?.email}</p>
                            <p>{activeInvoice.customer?.phone}</p>
                            <p>{activeInvoice.customer?.address}</p>
                            <p>
                              {activeInvoice.customer?.city}, {activeInvoice.customer?.state} {activeInvoice.customer?.zipCode}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-sm font-semibold text-slate-900">Payment summary</p>
                          <div className="mt-3 space-y-1 text-sm text-slate-600">
                            <p>Payment method: {activeInvoice.customer?.paymentMethod || "bank"}</p>
                            <p>Product subtotal: {formatCurrency(activeInvoice.productSubtotal || activeInvoice.subtotal)}</p>
                            <p>Paid: {formatCurrency(activeInvoice.paidAmount)}</p>
                            <p>Balance due: {formatCurrency(activeInvoice.balanceDue)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {activeInvoiceItems.length > 0 ? (
                      <div className="grid gap-3">
                        {activeInvoiceItems.map((item, index) => {
                          const imageUrl = getImageUrl(item.image);

                          return (
                            <div key={`${item.productId || "item"}-${index}`} className="flex gap-4 rounded-3xl border border-slate-200 p-4">
                              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                {imageUrl ? (
                                  <img src={imageUrl} alt={item.title || item.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-slate-900">{item.title || item.name}</p>
                                    <p className="text-sm text-slate-600">{item.name}</p>
                                  </div>
                                  <p className="font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</p>
                                </div>

                                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-4">
                                  <p>Qty: {Number(item.quantity || 0)}</p>
                                  <p>Unit: {formatCurrency(item.unitPrice)}</p>
                                  <p>Discount: {formatCurrency(item.discount)}</p>
                                  <p className="sm:text-right">Line total: {formatCurrency(item.lineTotal)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>

                  <aside className="space-y-5">
                    <div className="rounded-3xl bg-slate-950 p-5 text-white">
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Quick actions</p>
                      <div className="mt-4 flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(activeInvoice)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
                        >
                          <Download className="h-4 w-4" /> Download PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveInvoice(null)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15"
                        >
                          Close detail
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 p-5">
                      <p className="text-sm font-semibold text-slate-900">Notes</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {activeInvoice.notes || activeInvoice.additionalMessages || activeInvoice.termsAndConditions || "No invoice notes added."}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 p-5">
                      <p className="text-sm font-semibold text-slate-900">Reference</p>
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        <p>Inquiry: {activeInvoice.inquiryId}</p>
                        <p>Invoice number: {activeInvoice.invoiceNumber}</p>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
