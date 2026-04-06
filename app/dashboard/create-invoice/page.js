"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { createInvoice, getAllInquiries } from "@/services/orderFlowService";
import { fetchProducts } from "@/services/catalogService";
import { Calculator, Loader2, PackagePlus, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const EMPTY_CUSTOMER = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  notes: "",
  paymentMethod: "bank",
};

const EMPTY_ITEM = {
  productId: "",
  name: "",
  title: "",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  image: "",
};

const BASE_PAYMENT_METHODS = [
  { value: "bank", label: "Bank Transfer" },
  { value: "credit-card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "wire-transfer", label: "Wire Transfer" },
  { value: "mobile-banking", label: "Mobile Banking" },
  { value: "custom", label: "Custom Method" },
];

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const roundCurrency = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const getProductImage = (product) => product?.image?.url || product?.image || product?.thumbnail || "";

const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const buildDraftInvoiceNumber = (inquiry) => {
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const inquirySuffix = String(inquiry?.inquiryNumber || inquiry?.id || "000").replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "000";
  return `INV-${dateStamp}-${inquirySuffix}`;
};

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
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState(BASE_PAYMENT_METHODS);
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");
  const [vatRate, setVatRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [customerDraft, setCustomerDraft] = useState(EMPTY_CUSTOMER);
  const [editableItems, setEditableItems] = useState([]);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [additionalMessages, setAdditionalMessages] = useState("");
  const debouncedSearch = useDebouncedValue(productSearch, 300);

  useEffect(() => {
    const loadInquiries = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getAllInquiries();
        const ready = (data.inquiries || []).filter((inquiry) => !inquiry.linkedInvoice);
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

  const productSubtotal = useMemo(
    () =>
      editableItems.reduce(
        (sum, item) => sum + Math.max(Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0), 0),
        0
      ),
    [editableItems]
  );

  const vatAmount = useMemo(() => roundCurrency((productSubtotal * Number(vatRate || 0)) / 100), [productSubtotal, vatRate]);
  const discountAmount = useMemo(
    () => roundCurrency((productSubtotal * Number(discountRate || 0)) / 100),
    [productSubtotal, discountRate]
  );
  const subtotal = useMemo(
    () => roundCurrency(Math.max(productSubtotal + vatAmount - discountAmount + Number(shippingCost || 0), 0)),
    [productSubtotal, vatAmount, discountAmount, shippingCost]
  );
  const balanceDue = useMemo(() => Math.max(subtotal - Number(paidAmount || 0), 0), [subtotal, paidAmount]);
  const paymentStatus = useMemo(() => {
    if (paidAmount <= 0) return "unpaid";
    if (paidAmount >= subtotal) return "full";
    return "partial";
  }, [paidAmount, subtotal]);
  const selectedPaymentMethod = customerDraft.paymentMethod || "bank";
  const customPaymentMethodOptions = useMemo(
    () => paymentMethodOptions.filter((option) => option.value !== "custom"),
    [paymentMethodOptions]
  );

  useEffect(() => {
    if (!selectedInquiry) {
      setEditableItems([]);
      setCustomerDraft(EMPTY_CUSTOMER);
      setPaidAmount(0);
      setInvoiceNumber("");
      setVatRate(0);
      setDiscountRate(0);
      setShippingCost(0);
      setInvoiceNotes("");
      setExtraNotes("");
      setTermsAndConditions("");
      setAdditionalMessages("");
      return;
    }

    const draftInvoiceNumber = buildDraftInvoiceNumber(selectedInquiry);

    setCustomerDraft({
      name: selectedInquiry.customer?.name || "",
      email: selectedInquiry.customer?.email || "",
      phone: selectedInquiry.customer?.phone || "",
      companyName: selectedInquiry.customer?.companyName || "",
      address: selectedInquiry.customer?.address || "",
      city: selectedInquiry.customer?.city || "",
      state: selectedInquiry.customer?.state || "",
      zipCode: selectedInquiry.customer?.zipCode || "",
      notes: selectedInquiry.customer?.notes || "",
      paymentMethod: selectedInquiry.paymentMethod || "bank",
    });

    setInvoiceNumber(draftInvoiceNumber);

    setEditableItems(
      (selectedInquiry.items || []).map((item) => ({
        productId: item.productId || "",
        name: item.name,
        title: item.title || item.name || "",
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        discount: Number(item.discount || 0),
        image: item.image || "",
      }))
    );
    setPaidAmount(Number(selectedInquiry.payment?.paidAmount || 0));
    setVatRate(0);
    setDiscountRate(0);
    setShippingCost(0);
    setInvoiceNotes("");
    setExtraNotes("");
    setTermsAndConditions("");
    setAdditionalMessages("");
  }, [selectedInquiry]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!isAdmin) {
        return;
      }

      try {
        setProductLoading(true);
        const result = await fetchProducts({ search: debouncedSearch, limit: 8, page: 1, sort: "newest" });
        setProductResults(result.products || []);
      } catch (error) {
        toast.error(error.message || "Failed to load products");
      } finally {
        setProductLoading(false);
      }
    };

    loadProducts();
  }, [debouncedSearch, isAdmin]);

  const updateItem = (index, key, value) => {
    setEditableItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: ["quantity", "unitPrice", "discount"].includes(key) ? Number(value || 0) : value,
            }
          : item
      )
    );
  };

  const addProduct = (product) => {
    if (!product) return;

    const unitPrice = Number(product.offerPrice || product.price || 0);
    const image = getProductImage(product);

    setEditableItems((prev) => {
      const existingIndex = prev.findIndex((item) => String(item.productId) === String(product.id));

      if (existingIndex >= 0) {
        return prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: Number(item.quantity || 0) + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: String(product.id),
          name: product.name || "Product",
          title: product.name || product.title || "",
          quantity: 1,
          unitPrice,
          discount: 0,
          image,
        },
      ];
    });
  };

  const removeItem = (index) => {
    setEditableItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateCustomer = (key, value) => {
    setCustomerDraft((prev) => ({ ...prev, [key]: value }));
  };

  const addCustomPaymentMethod = () => {
    const trimmed = customPaymentMethod.trim();
    if (!trimmed) {
      toast.error("Enter a custom payment method");
      return;
    }

    const normalizedValue = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setPaymentMethodOptions((prev) => {
      if (prev.some((option) => option.value === normalizedValue)) {
        return prev;
      }

      return [...prev.slice(0, -1), { value: normalizedValue, label: trimmed }, prev[prev.length - 1]];
    });
    updateCustomer("paymentMethod", normalizedValue);
    setCustomPaymentMethod("");
  };

  const updatePaymentMethod = (value) => {
    if (value === "custom") {
      updateCustomer("paymentMethod", "");
      return;
    }

    updateCustomer("paymentMethod", value);
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

    if (!invoiceNumber.trim()) {
      toast.error("Invoice number is required");
      return;
    }

    const requiredCustomerFields = ["name", "email", "phone", "address", "city", "state", "zipCode"];
    for (const field of requiredCustomerFields) {
      if (!String(customerDraft[field] || "").trim()) {
        toast.error(`Please fill customer ${field}`);
        return;
      }
    }

    try {
      setSaving(true);
      await createInvoice({
        inquiryId: selectedInquiry.id,
        invoiceNumber: invoiceNumber.trim(),
        items: editableItems,
        customer: {
          ...customerDraft,
          paymentMethod: customerDraft.paymentMethod || "bank",
        },
        paidAmount: Number(paidAmount || 0),
        vatRate: Number(vatRate || 0),
        discountRate: Number(discountRate || 0),
        shippingCost: Number(shippingCost || 0),
        notes: invoiceNotes,
        extraNotes,
        termsAndConditions,
        additionalMessages,
        currency: selectedInquiry.currency || "USD",
      });
      toast.success("Invoice created and sent to customer email");
      router.push("/dashboard/my-invoices");
    } catch (error) {
      toast.error(error.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80">Invoice builder</p>
                <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Create New Invoice</h1>
                <p className="mt-3 text-sm leading-6 text-slate-200 md:text-base">
                  Select an inquiry, add products from the catalog, adjust VAT and discount, and issue a downloadable invoice.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <div className="text-slate-300">Invoice status preview</div>
                <div className="mt-1 text-lg font-semibold capitalize">{paymentStatus}</div>
              </div>
            </div>
          </div>

          {!isAdmin ? (
            <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">Only admin can create invoices.</div>
          ) : loading ? (
            <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">Loading inquiries...</div>
          ) : inquiries.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">No pending inquiries available for invoicing.</div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
              <section className="space-y-6">
                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Select inquiry</h2>
                      <p className="text-sm text-slate-600">The invoice number is auto-filled once an inquiry is selected.</p>
                    </div>
                    <div className="w-full lg:max-w-sm">
                      <label className="mb-1 block text-sm font-medium text-slate-700">Invoice number</label>
                      <input
                        value={invoiceNumber}
                        onChange={(event) => setInvoiceNumber(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Inquiry</label>
                    <select
                      value={selectedInquiryId}
                      onChange={(event) => setSelectedInquiryId(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                    >
                      {inquiries.map((inquiry) => (
                        <option key={inquiry.id} value={inquiry.id}>
                          {inquiry.inquiryNumber} - {inquiry.customer?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedInquiry ? (
                  <>
                    <div className="grid gap-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Inquiry snapshot</p>
                          <h3 className="mt-2 text-2xl font-semibold text-slate-900">{selectedInquiry.inquiryNumber}</h3>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                          <p className="font-medium text-slate-900">{selectedInquiry.customer?.name}</p>
                          <p>{selectedInquiry.customer?.email}</p>
                          <p>{selectedInquiry.customer?.phone}</p>
                          <p>{selectedInquiry.customer?.city}, {selectedInquiry.customer?.state}</p>
                          <p className="mt-2">Inquiry total: {formatCurrency(selectedInquiry.total)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Product search</p>
                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-teal-500">
                          <Search className="h-4 w-4 text-slate-400" />
                          <input
                            value={productSearch}
                            onChange={(event) => setProductSearch(event.target.value)}
                            placeholder="Search existing products"
                            className="w-full bg-transparent text-sm text-slate-900 outline-none"
                          />
                        </label>

                        <div className="max-h-[18rem] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 p-3">
                          {productLoading ? (
                            <div className="flex items-center justify-center py-6 text-teal-600">
                              <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                          ) : productResults.length === 0 ? (
                            <p className="py-6 text-center text-sm text-slate-500">No products found.</p>
                          ) : (
                            productResults.map((product) => {
                              const imageUrl = getProductImage(product);

                              return (
                                <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                                  <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                                    {imageUrl ? (
                                      <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                                        <PackagePlus className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-slate-900">{product.name}</p>
                                    <p className="text-xs text-slate-600">{product.categoryName || "Catalog product"}</p>
                                    <p className="text-xs text-slate-600">Price: {formatCurrency(product.offerPrice || product.price)}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addProduct(product)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                                  >
                                    <Plus className="h-3.5 w-3.5" /> Add
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                            <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-slate-900">Invoice items</h3>
                                  <p className="text-sm text-slate-600">Edit quantities, prices, and discounts for each selected product.</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditableItems((prev) => [...prev, { ...EMPTY_ITEM }])}
                                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <PackagePlus className="h-4 w-4" /> Add blank line
                                </button>
                              </div>

                              <div className="space-y-4">
                                {editableItems.map((item, index) => {
                                  const imageUrl = item.image || "";

                                  return (
                                    <div key={`${item.productId || "item"}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                                        <div className="flex gap-4 xl:w-[260px]">
                                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                            {imageUrl ? (
                                              <img src={imageUrl} alt={item.title || item.name} className="h-full w-full object-cover" />
                                            ) : (
                                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                <PackagePlus className="h-5 w-5" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">{item.title || item.name || "Invoice item"}</p>
                                            <p className="text-sm text-slate-600">{item.name || "Use the search panel to add a product."}</p>
                                            <p className="mt-1 text-sm font-medium text-slate-900">
                                              {formatCurrency(Math.max(Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0), 0))}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="grid flex-1 gap-3 md:grid-cols-4">
                                          <label className="space-y-1 text-sm">
                                            <span className="font-medium text-slate-700">Product name</span>
                                            <input
                                              value={item.name}
                                              onChange={(event) => updateItem(index, "name", event.target.value)}
                                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                            />
                                          </label>
                                          <label className="space-y-1 text-sm">
                                            <span className="font-medium text-slate-700">Title</span>
                                            <input
                                              value={item.title || ""}
                                              onChange={(event) => updateItem(index, "title", event.target.value)}
                                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                            />
                                          </label>
                                          <label className="space-y-1 text-sm">
                                            <span className="font-medium text-slate-700">Qty</span>
                                            <input
                                              type="number"
                                              min="1"
                                              value={item.quantity}
                                              onChange={(event) => updateItem(index, "quantity", event.target.value)}
                                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                            />
                                          </label>
                                          <label className="space-y-1 text-sm">
                                            <span className="font-medium text-slate-700">Unit price</span>
                                            <input
                                              type="number"
                                              min="0"
                                              value={item.unitPrice}
                                              onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                            />
                                          </label>
                                          <label className="space-y-1 text-sm">
                                            <span className="font-medium text-slate-700">Discount</span>
                                            <input
                                              type="number"
                                              min="0"
                                              value={item.discount || 0}
                                              onChange={(event) => updateItem(index, "discount", event.target.value)}
                                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                            />
                                          </label>
                                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900">
                                            Line total: {formatCurrency(Math.max(Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0), 0))}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                                          >
                                            <Trash2 className="h-4 w-4" /> Remove
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                              <div className="flex items-center gap-2 text-slate-900">
                                <Calculator className="h-5 w-5 text-teal-600" />
                                <h3 className="text-lg font-semibold">Calculation</h3>
                              </div>

                              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                  <span>Total product calculation</span>
                                  <span className="font-semibold text-slate-900">{formatCurrency(productSubtotal)}</span>
                                </div>
                                <label className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
                                  <span>VAT %</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={vatRate}
                                    onChange={(event) => setVatRate(Number(event.target.value || 0))}
                                    className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-right text-slate-900 outline-none focus:border-teal-500"
                                  />
                                </label>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                  <span>VAT amount</span>
                                  <span className="font-semibold text-slate-900">{formatCurrency(vatAmount)}</span>
                                </div>
                                <label className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
                                  <span>Discount %</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={discountRate}
                                    onChange={(event) => setDiscountRate(Number(event.target.value || 0))}
                                    className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-right text-slate-900 outline-none focus:border-teal-500"
                                  />
                                </label>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                  <span>Discount amount</span>
                                  <span className="font-semibold text-slate-900">{formatCurrency(discountAmount)}</span>
                                </div>
                                <label className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
                                  <span>Shipping cost</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={shippingCost}
                                    onChange={(event) => setShippingCost(Number(event.target.value || 0))}
                                    className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-right text-slate-900 outline-none focus:border-teal-500"
                                  />
                                </label>
                                <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-4 text-white">
                                  <span className="font-medium">Subtotal</span>
                                  <span className="text-xl font-semibold">{formatCurrency(subtotal)}</span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : null}
                      </section>

                      <aside className="space-y-6">
                        {selectedInquiry ? (
                          <>
                            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                              <h3 className="text-lg font-semibold text-slate-900">Payment details</h3>
                              <div className="mt-4 space-y-3 text-sm text-slate-700">
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                  <span>Total</span>
                                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <label className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
                                  <span>Amount paid</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={paidAmount}
                                    onChange={(event) => setPaidAmount(Number(event.target.value || 0))}
                                    className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-right text-slate-900 outline-none focus:border-teal-500"
                                  />
                                </label>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                  <span>Balance due</span>
                                  <span className="font-semibold text-slate-900">{formatCurrency(balanceDue)}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                  <span>Status</span>
                                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">{paymentStatus}</span>
                                </div>
                              </div>

                              <div className="mt-5 space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Payment method</label>
                                <div className="flex flex-wrap gap-3">
                                  <select
                                    value={selectedPaymentMethod}
                                    onChange={(event) => updatePaymentMethod(event.target.value)}
                                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                                  >
                                    {customPaymentMethodOptions.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                    <option value="custom">Custom Method</option>
                                  </select>
                                  <input
                                    value={customPaymentMethod}
                                    onChange={(event) => setCustomPaymentMethod(event.target.value)}
                                    placeholder="Add new method"
                                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={addCustomPaymentMethod}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                                  >
                                    <Plus className="h-4 w-4" /> Add
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                              <h3 className="text-lg font-semibold text-slate-900">Notes and terms</h3>
                              <div className="mt-4 space-y-4">
                                <label className="block text-sm font-medium text-slate-700">
                                  Customer note
                                  <textarea
                                    rows={3}
                                    value={customerDraft.notes}
                                    onChange={(event) => updateCustomer("notes", event.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                                  />
                                </label>
                                <label className="block text-sm font-medium text-slate-700">
                                  Invoice notes
                                  <textarea
                                    rows={3}
                                    value={invoiceNotes}
                                    onChange={(event) => setInvoiceNotes(event.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                                  />
                                </label>
                                <label className="block text-sm font-medium text-slate-700">
                                  Extra notes
                                  <textarea
                                    rows={3}
                                    value={extraNotes}
                                    onChange={(event) => setExtraNotes(event.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                                  />
                                </label>
                                <label className="block text-sm font-medium text-slate-700">
                                  Terms and conditions
                                  <textarea
                                    rows={4}
                                    value={termsAndConditions}
                                    onChange={(event) => setTermsAndConditions(event.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                                  />
                                </label>
                                <label className="block text-sm font-medium text-slate-700">
                                  Additional messages
                                  <textarea
                                    rows={3}
                                    value={additionalMessages}
                                    onChange={(event) => setAdditionalMessages(event.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                                  />
                                </label>
                              </div>
                            </div>

                            <button
                              onClick={onGenerateInvoice}
                              disabled={saving}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-base font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                              {saving ? "Generating..." : "Generate Invoice"}
                            </button>
                          </>
                        ) : (
                          <div className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                            Select an inquiry to start building the invoice.
                          </div>
                        )}
                      </aside>
                    </div>
                  )}
                </div>
              </DashboardLayout>
            );
          }
}
