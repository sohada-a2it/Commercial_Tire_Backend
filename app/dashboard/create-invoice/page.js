"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { createInvoice, getAllInquiries } from "@/services/orderFlowService";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedInquiryId = searchParams.get("inquiryId");
  const { userProfile } = useAuth();
  const isAdmin = normalizeRole(userProfile?.role) === "admin";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState("");
  const [notes, setNotes] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [editableItems, setEditableItems] = useState([]);

  useEffect(() => {
    const loadInquiries = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getAllInquiries();
        const ready = (data.inquiries || []).filter(
          (inquiry) => inquiry.status === "quote_accepted" && !inquiry.linkedInvoice
        );
        setInquiries(ready);

        const defaultId = requestedInquiryId && ready.some((i) => i.id === requestedInquiryId)
          ? requestedInquiryId
          : ready[0]?.id || "";
        setSelectedInquiryId(defaultId);
      } catch (error) {
        toast.error(error.message || "Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, [isAdmin, requestedInquiryId]);

  const selectedInquiry = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === selectedInquiryId) || null,
    [inquiries, selectedInquiryId]
  );

  useEffect(() => {
    if (!selectedInquiry) {
      setEditableItems([]);
      setPaidAmount(0);
      return;
    }

    setEditableItems(
      (selectedInquiry.items || []).map((item) => ({
        productId: item.productId || "",
        name: item.name,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        image: item.image || "",
      }))
    );
    setPaidAmount(Number(selectedInquiry.payment?.paidAmount || 0));
    setNotes("");
  }, [selectedInquiry]);

  const total = useMemo(
    () =>
      editableItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
        0
      ),
    [editableItems]
  );

  const updateItem = (index, key, value) => {
    setEditableItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: key === "quantity" || key === "unitPrice" ? Number(value || 0) : value,
            }
          : item
      )
    );
  };

  const onGenerateInvoice = async () => {
    if (!selectedInquiry) {
      toast.error("Please select an inquiry");
      return;
    }

    if (editableItems.length === 0) {
      toast.error("At least one invoice item is required");
      return;
    }

    try {
      setSaving(true);
      await createInvoice({
        inquiryId: selectedInquiry.id,
        items: editableItems,
        paidAmount: Number(paidAmount || 0),
        notes,
      });
      toast.success("Invoice created successfully");
      router.push("/dashboard/my-invoices");
    } catch (error) {
      toast.error(error.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Invoice</h1>

        {!isAdmin ? (
          <p className="text-gray-600 mt-2">Only admin can create invoices.</p>
        ) : loading ? (
          <p className="text-gray-600 mt-4">Loading accepted inquiries...</p>
        ) : inquiries.length === 0 ? (
          <p className="text-gray-600 mt-4">No quote-accepted inquiries available for invoicing.</p>
        ) : (
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Inquiry</label>
              <select
                value={selectedInquiryId}
                onChange={(e) => setSelectedInquiryId(e.target.value)}
                className="w-full md:w-[420px] px-3 py-2 border rounded-md bg-white text-gray-900"
              >
                {inquiries.map((inquiry) => (
                  <option key={inquiry.id} value={inquiry.id}>
                    {inquiry.inquiryNumber} - {inquiry.customer?.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedInquiry && (
              <>
                <div className="p-4 rounded-md bg-gray-50 border">
                  <p className="font-medium text-gray-900">Customer: {selectedInquiry.customer?.name}</p>
                  <p className="text-gray-600">{selectedInquiry.customer?.email}</p>
                  <p className="text-gray-600">Quote: ${Number(selectedInquiry.quote?.amount || 0).toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  {editableItems.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        className="px-3 py-2 border rounded-md bg-white text-gray-900"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className="px-3 py-2 border rounded-md bg-white text-gray-900"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                        className="px-3 py-2 border rounded-md bg-white text-gray-900"
                      />
                      <div className="px-3 py-2 border rounded-md bg-gray-100 text-gray-900">
                        ${(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value || 0))}
                      className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                      placeholder="Payment terms, shipping notes, etc."
                    />
                  </div>
                </div>

                <div className="p-4 rounded-md bg-teal-50 border border-teal-200 flex flex-wrap justify-between gap-3">
                  <p className="font-semibold text-teal-900">Invoice Total: ${total.toFixed(2)}</p>
                  <p className="font-semibold text-teal-900">
                    Balance Due: ${Math.max(total - Number(paidAmount || 0), 0).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={onGenerateInvoice}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "Generating..." : "Generate Invoice"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
