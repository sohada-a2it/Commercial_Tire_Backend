"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { 
  getAllInquiries, 
  deleteInquiry, 
  updateInquiryStatus,
  getInquiryStats 
} from "@/services/inquiries";
import { 
  CalendarDays, 
  Eye, 
  Trash2, 
  X, 
  Mail, 
  ShoppingBag,
  CheckCircle,
  Clock,
  Send,
  Filter,
  Search
} from "lucide-react";
import toast from "react-hot-toast";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  read: "bg-blue-100 text-blue-800",
  replied: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const statusLabel = {
  pending: "Pending",
  read: "Read",
  replied: "Replied",
  closed: "Closed",
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

export default function InquiriesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = role === "admin" || role === "moderator";
  const isAdmin = role === "admin";
  
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeInquiry, setActiveInquiry] = useState(null);
  
  // Filters
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedInquiries, setSelectedInquiries] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [inquiriesData, statsData] = await Promise.all([
        getAllInquiries({ type: filterType, status: filterStatus, search: searchTerm }),
        getInquiryStats()
      ]);
      setInquiries(inquiriesData.data || []);
      setStats(statsData.data);
    } catch (error) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      refreshData();
    }
  }, [isStaff, filterType, filterStatus, searchTerm]);

  // Time filter logic
  const filteredByTime = useMemo(() => {
    let list = [...inquiries];
    
    if (timeFilter === "year") {
      list = list.filter((inquiry) => 
        new Date(inquiry.createdAt).getFullYear() === Number(selectedYear)
      );
    } else if (timeFilter === "month") {
      list = list.filter((inquiry) => {
        const createdAt = new Date(inquiry.createdAt);
        return (
          createdAt.getFullYear() === Number(selectedYear) && 
          createdAt.getMonth() + 1 === Number(selectedMonth)
        );
      });
    }
    
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [inquiries, timeFilter, selectedYear, selectedMonth]);

  const handleDelete = async (inquiry) => {
    if (!confirm(`Delete inquiry from ${inquiry.customerInfo?.name}?`)) return;
    
    try {
      await deleteInquiry(inquiry._id);
      toast.success("Inquiry deleted");
      refreshData();
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedInquiries.length} inquiries?`)) return;
    
    try {
      await bulkDeleteInquiries(selectedInquiries);
      toast.success(`${selectedInquiries.length} inquiries deleted`);
      setSelectedInquiries([]);
      setBulkMode(false);
      refreshData();
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateInquiryStatus(id, status);
      toast.success(`Status updated to ${statusLabel[status]}`);
      refreshData();
      if (activeInquiry && activeInquiry._id === id) {
        setActiveInquiry({ ...activeInquiry, status });
      }
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const toggleSelect = (id) => {
    setSelectedInquiries(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2020; year--) years.push(year);
    return years;
  }, []);

  if (!isStaff) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">All Inquiries</h1>
          <p className="mt-2 text-slate-600">Only admin/moderator can access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80">Staff dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Customer Inquiries</h1>
              <p className="mt-3 text-sm text-slate-200">
                Manage all general and product inquiries from customers.
              </p>
            </div>
            
            {stats && (
              <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                <div>
                  <div className="text-slate-300">Total</div>
                  <div className="text-lg font-semibold">{stats.total?.general + stats.total?.product || 0}</div>
                </div>
                <div>
                  <div className="text-slate-300">Pending</div>
                  <div className="text-lg font-semibold">{stats.pending?.general + stats.pending?.product || 0}</div>
                </div>
                <div>
                  <div className="text-slate-300">New this week</div>
                  <div className="text-lg font-semibold">{stats.newThisWeek || 0}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                <option value="all">All Types</option>
                <option value="general">📧 General</option>
                <option value="product">🛒 Product</option>
              </select>
              
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="read">👁️ Read</option>
                <option value="replied">✅ Replied</option>
                <option value="closed">🔒 Closed</option>
              </select>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm w-64"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {bulkMode && selectedInquiries.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600"
                >
                  Delete ({selectedInquiries.length})
                </button>
              )}
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium"
              >
                {bulkMode ? "Cancel" : "Select"}
              </button>
            </div>
          </div>
          
          {/* Time Filter */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
            >
              <option value="all">All Time</option>
              <option value="year">Filter by Year</option>
              <option value="month">Filter by Month</option>
            </select>
            
            {(timeFilter === "year" || timeFilter === "month") && (
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
              >
                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            )}
            
            {timeFilter === "month" && (
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
              >
                {monthOptions.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2"><Mail className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-slate-600">General Inquiries</p>
                  <p className="text-2xl font-bold">{stats.total.general}</p>
                  <p className="text-xs text-slate-500">{stats.pending.general} pending</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-100 p-2"><ShoppingBag className="h-5 w-5 text-orange-600" /></div>
                <div>
                  <p className="text-sm text-slate-600">Product Inquiries</p>
                  <p className="text-2xl font-bold">{stats.total.product}</p>
                  <p className="text-xs text-slate-500">{stats.pending.product} pending</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inquiries List */}
        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-center">Loading inquiries...</div>
        ) : filteredByTime.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-slate-500">No inquiries found.</div>
        ) : (
          <div className="space-y-3">
            {filteredByTime.map((inquiry) => (
              <div key={inquiry._id} className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {bulkMode && (
                      <input
                        type="checkbox"
                        checked={selectedInquiries.includes(inquiry._id)}
                        onChange={() => toggleSelect(inquiry._id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                    )}
                    
                    {/* Type Badge */}
                    <div className={`flex-shrink-0 rounded-xl p-2 ${
                      inquiry.type === "product" ? "bg-orange-100" : "bg-blue-100"
                    }`}>
                      {inquiry.type === "product" ? (
                        <ShoppingBag className={`h-5 w-5 ${inquiry.type === "product" ? "text-orange-600" : "text-blue-600"}`} />
                      ) : (
                        <Mail className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          inquiry.type === "product" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {inquiry.type === "product" ? "Product Inquiry" : "General Inquiry"}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[inquiry.status]}`}>
                          {statusLabel[inquiry.status]}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-slate-900">{inquiry.customerInfo.name}</h3>
                      <p className="text-sm text-slate-600">{inquiry.customerInfo.email}</p>
                      {inquiry.customerInfo.phone && (
                        <p className="text-xs text-slate-500">{inquiry.customerInfo.phone}</p>
                      )}
                      
                      {/* Product specific info */}
                      {inquiry.type === "product" && inquiry.productInfo?.productName && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded">
                          Product: {inquiry.productInfo.productName} 
                          {inquiry.productInfo.quantity && ` | Qty: ${inquiry.productInfo.quantity}`}
                          {inquiry.productInfo.urgentRequirement && " | 🚨 Urgent"}
                        </div>
                      )}
                      
                      <p className="mt-2 text-sm text-slate-700 line-clamp-2">{inquiry.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(inquiry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveInquiry(inquiry)}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(inquiry)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {activeInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    activeInquiry.type === "product" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {activeInquiry.type === "product" ? "Product Inquiry" : "General Inquiry"}
                  </span>
                  <p className="mt-2 text-sm text-slate-500">Submitted {new Date(activeInquiry.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setActiveInquiry(null)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left Column - Customer Info */}
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="font-semibold text-slate-900">Customer Information</h3>
                      <div className="mt-3 space-y-2 text-sm">
                        <p><strong>Name:</strong> {activeInquiry.customerInfo.name}</p>
                        <p><strong>Email:</strong> {activeInquiry.customerInfo.email}</p>
                        <p><strong>Phone:</strong> {activeInquiry.customerInfo.phone || "N/A"}</p>
                        {activeInquiry.customerInfo.company && (
                          <p><strong>Company:</strong> {activeInquiry.customerInfo.company}</p>
                        )}
                        {activeInquiry.customerInfo.address && (
                          <p><strong>Address:</strong> {activeInquiry.customerInfo.address}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="font-semibold text-slate-900">Message</h3>
                      <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{activeInquiry.message}</p>
                    </div>
                  </div>
                  
                  {/* Right Column - Product Info & Actions */}
                  <div className="space-y-5">
                    {activeInquiry.type === "product" && activeInquiry.productInfo && (
                      <div className="rounded-2xl bg-orange-50 p-5 border border-orange-200">
                        <h3 className="font-semibold text-orange-800">Product Details</h3>
                        <div className="mt-3 space-y-2 text-sm">
                          <p><strong>Product:</strong> {activeInquiry.productInfo.productName || "N/A"}</p>
                          <p><strong>Model:</strong> {activeInquiry.productInfo.model || "N/A"}</p>
                          <p><strong>Quantity:</strong> {activeInquiry.productInfo.quantity || "N/A"}</p>
                          <p><strong>Delivery Location:</strong> {activeInquiry.productInfo.deliveryLocation || "N/A"}</p>
                          <p><strong>Shipping Term:</strong> {activeInquiry.productInfo.shippingTerm || "N/A"}</p>
                          <p><strong>Urgent:</strong> {activeInquiry.productInfo.urgentRequirement ? "Yes 🚨" : "No"}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="rounded-2xl bg-slate-900 p-5 text-white">
                      <h3 className="font-semibold">Update Status</h3>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {["pending", "read", "replied", "closed"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(activeInquiry._id, status)}
                            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                              activeInquiry.status === status
                                ? "bg-teal-500 text-white"
                                : "bg-white/10 hover:bg-white/20"
                            }`}
                          >
                            {statusLabel[status]}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <button
                          onClick={() => handleDelete(activeInquiry)}
                          className="w-full rounded-xl bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                        >
                          Delete Inquiry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}