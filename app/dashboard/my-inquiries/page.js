"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { getMyInquiries } from "@/services/orderFlowService";
import { CalendarDays, ChevronRight, Eye, Package, X } from "lucide-react";
import toast from "react-hot-toast";

const statusLabel = {
  in_process: "In Process",
  invoice_sent: "Invoice Sent",
  cancelled: "Cancelled",
};

const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const getImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (typeof image === "object") return image.url || image.src || "";
  return "";
};

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatStatus = (status) => statusLabel[status] || status || "Unknown";

const statusStyles = {
  in_process: "bg-amber-100 text-amber-800",
  invoice_sent: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export default function MyInquiriesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [activeInquiry, setActiveInquiry] = useState(null);

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

  const availableYears = useMemo(() => {
    const values = inquiries
      .map((inquiry) => new Date(inquiry.createdAt).getFullYear())
      .filter((year) => Number.isFinite(year));
    return [...new Set(values)].sort((a, b) => b - a);
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    const list = [...inquiries].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    if (timeFilter === "year") {
      return list.filter((inquiry) => new Date(inquiry.createdAt).getFullYear() === Number(selectedYear));
    }

    if (timeFilter === "month") {
      return list.filter((inquiry) => {
        const createdAt = new Date(inquiry.createdAt);
        return (
          createdAt.getFullYear() === Number(selectedYear) && createdAt.getMonth() + 1 === Number(selectedMonth)
        );
      });
    }

    return list;
  }, [inquiries, timeFilter, selectedYear, selectedMonth]);

  const activeInquiryItems = activeInquiry?.items || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80">Customer Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">My Inquiries</h1>
              <p className="mt-3 text-sm leading-6 text-slate-200 md:text-base">
                Every checkout inquiry is stored here with product previews, totals, and invoice updates.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
              <div>
                <div className="text-slate-300">Total</div>
                <div className="text-lg font-semibold">{inquiries.length}</div>
              </div>
              <div>
                <div className="text-slate-300">Visible</div>
                <div className="text-lg font-semibold">{filteredInquiries.length}</div>
              </div>
              <div>
                <div className="text-slate-300">Invoices</div>
                <div className="text-lg font-semibold">{inquiries.filter((item) => item.linkedInvoice).length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Filter by time</h2>
              <p className="text-sm text-slate-600">Switch between all inquiries, a specific year, or a month.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={timeFilter}
                onChange={(event) => setTimeFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500"
              >
                <option value="all">All</option>
                <option value="year">Year</option>
                <option value="month">Month</option>
              </select>

              {(timeFilter === "year" || timeFilter === "month") && (
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500"
                >
                  {(availableYears.length ? availableYears : [new Date().getFullYear()]).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              )}

              {timeFilter === "month" && (
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500"
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {role !== "customer" ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-600">Use this page as customer to review your inquiries.</p>
          </div>
        ) : loading ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">Loading inquiries...</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">
            No inquiries found for the selected period.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInquiries.map((inquiry) => {
              const previewItems = (inquiry.items || []).slice(0, 3);

              return (
                <article key={inquiry.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-slate-900">{inquiry.inquiryNumber}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[inquiry.status] || "bg-slate-100 text-slate-700"}`}>
                          {formatStatus(inquiry.status)}
                        </span>
                        {inquiry.linkedInvoice ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Invoice generated
                          </span>
                        ) : null}
                      </div>
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(inquiry.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">Payment method: {inquiry.paymentMethod || "bank"}</p>
                    </div>

                    <div className="flex items-center gap-3 self-start rounded-2xl bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total</p>
                        <p className="text-lg font-semibold text-slate-900">{formatCurrency(inquiry.total)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveInquiry(inquiry)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-5 p-5 lg:grid-cols-[1.35fr_1fr]">
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Products</p>
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
                            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                              No product details available.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      <div>
                        <span className="text-slate-500">Customer</span>
                        <p className="font-medium text-slate-900">{inquiry.customer?.name}</p>
                        <p>{inquiry.customer?.email}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Subtotal</span>
                        <p className="font-medium text-slate-900">{formatCurrency(inquiry.subtotal)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Address</span>
                        <p className="font-medium text-slate-900">
                          {inquiry.customer?.city}, {inquiry.customer?.state}
                        </p>
                      </div>
                      {inquiry.customer?.notes ? (
                        <div>
                          <span className="text-slate-500">Note</span>
                          <p className="font-medium text-slate-900">{inquiry.customer.notes}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {activeInquiry ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-teal-600">Inquiry detail</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">{activeInquiry.inquiryNumber}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInquiry(null)}
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
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[activeInquiry.status] || "bg-slate-100 text-slate-700"}`}>
                          {formatStatus(activeInquiry.status)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {new Date(activeInquiry.createdAt).toLocaleString()}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {formatCurrency(activeInquiry.total)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-sm font-semibold text-slate-900">Customer details</p>
                          <div className="mt-3 space-y-1 text-sm text-slate-600">
                            <p>{activeInquiry.customer?.name}</p>
                            <p>{activeInquiry.customer?.email}</p>
                            <p>{activeInquiry.customer?.phone}</p>
                            <p>{activeInquiry.customer?.address}</p>
                            <p>
                              {activeInquiry.customer?.city}, {activeInquiry.customer?.state} {activeInquiry.customer?.zipCode}
                            </p>
                            {activeInquiry.customer?.notes ? <p>Note: {activeInquiry.customer.notes}</p> : null}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-sm font-semibold text-slate-900">Order summary</p>
                          <div className="mt-3 space-y-1 text-sm text-slate-600">
                            <p>Payment method: {activeInquiry.paymentMethod || "bank"}</p>
                            <p>Subtotal: {formatCurrency(activeInquiry.subtotal)}</p>
                            <p>Products: {activeInquiry.items?.length || 0}</p>
                            <p>{activeInquiry.linkedInvoice ? "Invoice generated" : "Invoice pending"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {activeInquiryItems.length > 0 ? (
                      <div className="grid gap-3">
                        {activeInquiryItems.map((item, index) => {
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
                      <div className="mt-4 space-y-3 text-sm text-slate-200">
                        <p>Linked invoice: {activeInquiry.linkedInvoice ? "Yes" : "No"}</p>
                        <p>Contact channel: {activeInquiry.contactChannel || "mixed"}</p>
                        <p>Payment method: {activeInquiry.paymentMethod || "bank"}</p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 p-5">
                      <p className="text-sm font-semibold text-slate-900">Customer note</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {activeInquiry.customer?.notes || "No extra note added by the customer."}
                      </p>
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
