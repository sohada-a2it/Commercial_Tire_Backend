"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { createInvoice, getAllInquiries } from "@/services/orderFlowService";
import { fetchProduct, fetchProducts } from "@/services/catalogService";
import { Calculator, Loader2, PackagePlus, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCalendar } from "react-icons/fa";

const EMPTY_CUSTOMER = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  address: "",
  city: "",
  zone: "",
  area: "",
  zipCode: "",
  notes: "",
  paymentMethod: "bank",
};

const EMPTY_ITEM = {
  productId: "",
  name: "",
  title: "",
  brand: "",
  pattern: "",
  size: "",
  categoryName: "",
  ply: "",
  pricingTiers: [],
  quantity: 1,
  unitPrice: 0,
  image: "",
};

const EMPTY_INVOICE_META = {
  issueDate: new Date().toISOString().slice(0, 10),
  validityDate: "",
  paymentTerms: "",
  productionTime: "",
  portOfLoading: "",
  deliveryAddress: "",
  incoterms: "",
  bankDetails: "",
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

const toSafeNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeNonNegativeNumber = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;

  const [integerPart = "", decimalPart] = cleaned.split(".");
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "") || "0";
  const normalized = decimalPart !== undefined ? `${normalizedInteger}.${decimalPart}` : normalizedInteger;

  return toSafeNumber(normalized);
};

const normalizePositiveInteger = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
  const numeric = Number(cleaned || 0);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return numeric;
};

const getProductUnitPrice = (product) => {
  const candidates = [
    product?.offerPrice,
    product?.price,
    product?.unitPrice,
    product?.basePrice,
    product?.mrp,
    product?.pricing?.offerPrice,
    product?.pricing?.price,
    product?.pricingTiers?.[0]?.pricePerTire,
    product?.pricingTiers?.[0]?.pricePerTon,
    product?.pricingTiers?.[0]?.price,
  ];
  for (const candidate of candidates) {
    const parsed = toSafeNumber(candidate);
    if (parsed > 0) return parsed;
  }
  return 0;
};

const normalizePricingTiers = (tiers = []) => {
  if (!Array.isArray(tiers)) return [];

  return tiers
    .map((tier) => {
      const minQuantity = Math.max(Math.floor(toSafeNumber(tier?.minQuantity)), 0);
      const maxQuantity = Math.max(Math.floor(toSafeNumber(tier?.maxQuantity)), 0);
      const unitPrice = toSafeNumber(tier?.pricePerTire ?? tier?.pricePerTon ?? tier?.price);
      const size = String(tier?.size || "").trim();

      return {
        minQuantity,
        maxQuantity,
        unitPrice,
        size,
      };
    })
    .filter((tier) => tier.unitPrice > 0)
    .sort((a, b) => a.minQuantity - b.minQuantity);
};

const getSizeOptionsFromTiers = (pricingTiers = []) => {
  if (!Array.isArray(pricingTiers)) return [];

  return [...new Set(
    pricingTiers
      .map((tier) => String(tier?.size || "").trim())
      .filter(Boolean)
  )];
};

const resolveTierUnitPrice = ({ quantity, pricingTiers = [], fallbackPrice = 0 }) => {
  const qty = Math.max(Math.floor(toSafeNumber(quantity)), 0);
  const fallback = toSafeNumber(fallbackPrice);

  if (!Array.isArray(pricingTiers) || pricingTiers.length === 0 || qty <= 0) {
    return fallback;
  }

  const matchingTier = pricingTiers.find((tier) => {
    const min = Math.max(Math.floor(toSafeNumber(tier.minQuantity)), 0);
    const max = Math.max(Math.floor(toSafeNumber(tier.maxQuantity)), 0);

    if (max > 0) {
      return qty >= min && qty <= max;
    }

    return qty >= min;
  });

  return matchingTier ? toSafeNumber(matchingTier.unitPrice) : fallback;
};

const resolveItemUnitPrice = ({ quantity, pricingTiers = [], fallbackPrice = 0, selectedSize = "" }) => {
  const normalizedSize = String(selectedSize || "").trim().toLowerCase();

  if (Array.isArray(pricingTiers) && pricingTiers.length > 0 && normalizedSize) {
    const matchingSizeTier = pricingTiers.find(
      (tier) => String(tier?.size || "").trim().toLowerCase() === normalizedSize
    );

    if (matchingSizeTier?.unitPrice > 0) {
      return toSafeNumber(matchingSizeTier.unitPrice);
    }
  }

  return resolveTierUnitPrice({ quantity, pricingTiers, fallbackPrice });
};

const formatCurrency = (value) => `$${toSafeNumber(value).toFixed(2)}`;

const displayNumericValue = (value) => {
  const numeric = toSafeNumber(value);
  return numeric === 0 ? "" : String(numeric);
};

const roundCurrency = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const getProductImage = (product) => product?.image?.url || product?.image || product?.thumbnail || "";

const isVehicleAccessoryItem = (item) => {
  const categoryText = String(item?.categoryName || item?.category || "").toLowerCase();
  return categoryText.includes("vehicle parts") || categoryText.includes("accessories");
};

const serializeInvoiceMetaToNotes = (meta) => {
  const rows = [
    ["Issue Date", meta.issueDate],
    ["Validity Date", meta.validityDate],
    ["Payment Terms", meta.paymentTerms],
    ["Production Time", meta.productionTime],
    ["Port Of Loading", meta.portOfLoading],
    ["Delivery Address", meta.deliveryAddress],
    ["Incoterms", meta.incoterms],
  ].filter(([, value]) => String(value || "").trim());

  if (rows.length === 0) return "";
  return rows.map(([label, value]) => `${label}: ${String(value).trim()}`).join("\n");
};

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
  const [invoiceMeta, setInvoiceMeta] = useState(EMPTY_INVOICE_META);
  const [editableItems, setEditableItems] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [additionalMessages, setAdditionalMessages] = useState("");
  const validityDateRef = useRef(null);
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
        (sum, item) => sum + Math.max(Number(item.quantity || 0) * Number(item.unitPrice || 0), 0),
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
  const extraPaidAmount = useMemo(() => Math.max(Number(paidAmount || 0) - subtotal, 0), [paidAmount, subtotal]);
  const paymentStatus = useMemo(() => {
    if (paidAmount <= 0) return "unpaid";
    if (paidAmount > subtotal) return "overpaid";
    if (paidAmount === subtotal) return "full";
    return "partial";
  }, [paidAmount, subtotal]);
  const selectedPaymentMethod = customerDraft.paymentMethod || "bank";
  const customPaymentMethodOptions = useMemo(
    () => paymentMethodOptions.filter((option) => option.value !== "custom"),
    [paymentMethodOptions]
  );

  useEffect(() => {
    let cancelled = false;

    if (!selectedInquiry) {
      setEditableItems([]);
      setCustomerDraft(EMPTY_CUSTOMER);
      setPaidAmount(0);
      setInvoiceNumber("");
      setVatRate(0);
      setDiscountRate(0);
      setShippingCost(0);
      setInvoiceMeta(EMPTY_INVOICE_META);
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
      zone: selectedInquiry.customer?.zone || selectedInquiry.customer?.state || "",
      area: selectedInquiry.customer?.area || "",
      zipCode: selectedInquiry.customer?.zipCode || "",
      notes: selectedInquiry.customer?.notes || "",
      paymentMethod: selectedInquiry.paymentMethod || "bank",
    });

    setInvoiceNumber(draftInvoiceNumber);

    const baseItems = (selectedInquiry.items || []).map((item) => ({
      productId: item.productId || "",
      name: item.name,
      title: item.title || item.name || "",
      brand: item.brand || "",
      pattern: item.pattern || "",
      size: item.size || "",
      categoryName: item.categoryName || "",
      ply: item.ply || "",
      pricingTiers: [],
      quantity: normalizePositiveInteger(item.quantity || 1),
      unitPrice: toSafeNumber(item.unitPrice || 0),
      image: item.image || "",
    }));

    setEditableItems(baseItems);

    const enrichItemsFromCatalog = async () => {
      const enrichedItems = await Promise.all(
        baseItems.map(async (item) => {
          if (!item.productId) {
            return item;
          }

          try {
            const data = await fetchProduct(item.productId);
            const product = data?.product;
            if (!product) return item;

            const productTiers = normalizePricingTiers(product.pricingTiers || []);
            const sizeOptions = getSizeOptionsFromTiers(productTiers);
            const fallbackSize = String(product?.keyAttributes?.Size || product?.keyAttributes?.size || "").trim();
            const selectedSize = item.size || sizeOptions[0] || fallbackSize;
            const fallbackUnitPrice = getProductUnitPrice(product) || item.unitPrice;
            const quantity = item.quantity;
            const computedUnitPrice = resolveItemUnitPrice({
              quantity,
              pricingTiers: productTiers,
              fallbackPrice: fallbackUnitPrice,
              selectedSize,
            });

            return {
              ...item,
              brand: product.brand || item.brand || "",
              pattern: product.pattern || item.pattern || "",
              size: selectedSize,
              categoryName: product.categoryName || product.mainCategory || item.categoryName || "",
              ply: item.ply || String(product?.keyAttributes?.ply || ""),
              pricingTiers: productTiers,
              unitPrice: computedUnitPrice > 0 ? computedUnitPrice : item.unitPrice,
            };
          } catch {
            return item;
          }
        })
      );

      if (!cancelled) {
        setEditableItems(enrichedItems);
      }
    };

    enrichItemsFromCatalog();
    setPaidAmount(Number(selectedInquiry.payment?.paidAmount || 0));
    setVatRate(0);
    setDiscountRate(0);
    setShippingCost(0);
    setInvoiceMeta((prev) => ({
      ...EMPTY_INVOICE_META,
      issueDate: prev.issueDate || EMPTY_INVOICE_META.issueDate,
      validityDate: prev.validityDate,
      paymentTerms: prev.paymentTerms,
      productionTime: prev.productionTime,
      portOfLoading: prev.portOfLoading,
      deliveryAddress: prev.deliveryAddress,
      incoterms: prev.incoterms,
      bankDetails: prev.bankDetails,
    }));
    setTermsAndConditions("");
    setAdditionalMessages("");
    return () => {
      cancelled = true;
    };
  }, [selectedInquiry]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!isAdmin) {
        return;
      }

      try {
        setProductLoading(true);
        const result = await fetchProducts({ search: debouncedSearch, limit: 3, page: 1, sort: "newest" });
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
          ? (() => {
              if (key === "quantity") {
                const normalizedQty = normalizePositiveInteger(value);
                const autoUnitPrice = resolveItemUnitPrice({
                  quantity: normalizedQty,
                  pricingTiers: item.pricingTiers,
                  fallbackPrice: item.unitPrice,
                  selectedSize: item.size,
                });

                return {
                  ...item,
                  quantity: normalizedQty,
                  unitPrice: autoUnitPrice,
                };
              }

              if (key === "size") {
                const nextSize = String(value || "");
                const autoUnitPrice = resolveItemUnitPrice({
                  quantity: item.quantity,
                  pricingTiers: item.pricingTiers,
                  fallbackPrice: item.unitPrice,
                  selectedSize: nextSize,
                });

                return {
                  ...item,
                  size: nextSize,
                  unitPrice: autoUnitPrice,
                };
              }

              return {
                ...item,
                [key]: ["unitPrice"].includes(key)
                  ? normalizeNonNegativeNumber(value)
                  : value,
              };
            })()
          : item
      )
    );
  };

  const addProduct = (product) => {
    if (!product) return;

    const productTiers = normalizePricingTiers(product.pricingTiers || []);
    const sizeOptions = getSizeOptionsFromTiers(productTiers);
    const defaultSize = sizeOptions[0] || String(product?.keyAttributes?.Size || product?.keyAttributes?.size || "").trim();
    const unitPrice = resolveItemUnitPrice({
      quantity: 1,
      pricingTiers: productTiers,
      fallbackPrice: getProductUnitPrice(product),
      selectedSize: defaultSize,
    });
    const image = getProductImage(product);

    setEditableItems((prev) => {
      const existingIndex = prev.findIndex((item) => String(item.productId) === String(product.id));

      if (existingIndex >= 0) {
        return prev.map((item, index) =>
          index === existingIndex
            ? (() => {
                const nextQuantity = Number(item.quantity || 0) + 1;
                const nextUnitPrice = resolveItemUnitPrice({
                  quantity: nextQuantity,
                  pricingTiers: item.pricingTiers,
                  fallbackPrice: item.unitPrice,
                  selectedSize: item.size,
                });

                return { ...item, quantity: nextQuantity, unitPrice: nextUnitPrice };
              })()
            : item
        );
      }

      return [
        ...prev,
        {
          productId: String(product.id),
          name: product.name || "Product",
          title: product.name || product.title || "",
          brand: product.brand || "",
          pattern: product.pattern || "",
          size: defaultSize,
          categoryName: product.categoryName || product.mainCategory || "",
          ply: String(product?.keyAttributes?.ply || ""),
          pricingTiers: productTiers,
          quantity: 1,
          unitPrice,
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

  const handleNumericInputChange = (setter) => (event) => {
    setter(normalizeNonNegativeNumber(event.target.value));
  };

  const updateInvoiceMeta = (key, value) => {
    setInvoiceMeta((prev) => ({ ...prev, [key]: value }));
  };

  const uploadItemImage = (index, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateItem(index, "image", typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
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

    if (editableItems.some((item) => Number(item.quantity || 0) <= 0)) {
      toast.error("Each invoice item must have quantity greater than 0");
      return;
    }

    if (!invoiceNumber.trim()) {
      toast.error("Invoice number is required");
      return;
    }

    const requiredCustomerFields = ["name", "email", "phone", "address", "city", "zone", "area"];
    for (const field of requiredCustomerFields) {
      if (!String(customerDraft[field] || "").trim()) {
        toast.error(`Please fill customer ${field}`);
        return;
      }
    }

    try {
      setSaving(true);
      const structuredMeta = serializeInvoiceMetaToNotes(invoiceMeta);
      const composedNotes = structuredMeta;
      const composedTerms = [termsAndConditions, invoiceMeta.bankDetails ? `Bank Details: ${invoiceMeta.bankDetails}` : ""]
        .filter((part) => String(part || "").trim())
        .join("\n\n");
      const composedAdditional = [
        additionalMessages,
        invoiceMeta.incoterms ? `Incoterms: ${invoiceMeta.incoterms}` : "",
      ]
        .filter((part) => String(part || "").trim())
        .join("\n\n");

      await createInvoice({
        inquiryId: selectedInquiry.id,
        invoiceNumber: invoiceNumber.trim(),
        items: editableItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          title: item.title,
          brand: item.brand,
          pattern: item.pattern,
          size: item.size,
          ply: item.ply,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          image: item.image,
          discount: 0,
        })),
        customer: {
          ...customerDraft,
          paymentMethod: customerDraft.paymentMethod || "bank",
        },
        paidAmount: Number(paidAmount || 0),
        vatRate: Number(vatRate || 0),
        discountRate: Number(discountRate || 0),
        shippingCost: Number(shippingCost || 0),
        notes: composedNotes,
        termsAndConditions: composedTerms,
        additionalMessages: composedAdditional,
        currency: selectedInquiry.currency || "USD",
      });
      toast.success("Invoice created and sent to customer email");
      router.push("/dashboard/invoices");
    } catch (error) {
      toast.error(error.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Simple Invoice Form</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">Create New Invoice</h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Fill invoice details, confirm customer information, add products, then generate and send.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="mr-2 text-slate-500">Status:</span>
              <span className="font-semibold capitalize text-slate-900">{paymentStatus}</span>
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
          <div className="space-y-4 sm:space-y-6 [&_input]:bg-white [&_input]:text-slate-900 [&_input]:placeholder:text-slate-400 [&_input]:dark:bg-white [&_input]:dark:text-slate-900 [&_input]:dark:border-slate-300 [&_select]:bg-white [&_select]:text-slate-900 [&_select]:dark:bg-white [&_select]:dark:text-slate-900 [&_select]:dark:border-slate-300 [&_textarea]:bg-white [&_textarea]:text-slate-900 [&_textarea]:placeholder:text-slate-400 [&_textarea]:dark:bg-white [&_textarea]:dark:text-slate-900 [&_textarea]:dark:border-slate-300">
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-200">
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
                  <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Invoice details</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-900">{selectedInquiry.inquiryNumber}</h3>
                        <p className="mt-1 text-sm text-slate-600">Inquiry total: {formatCurrency(selectedInquiry.total)}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1 text-sm">
                            <span className="font-medium text-slate-700">Issue date</span>
                            <input
                              type="date"
                              value={invoiceMeta.issueDate}
                              onChange={(event) => updateInvoiceMeta("issueDate", event.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                            />
                          </label>
                          <label className="space-y-1 text-sm">
                            <span className="font-medium text-slate-700">Validity date </span>
                            <div className="relative">
                              <input
                                ref={validityDateRef}
                                type="date"
                                value={invoiceMeta.validityDate}
                                onChange={(event) => updateInvoiceMeta("validityDate", event.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-slate-900 outline-none focus:border-teal-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = validityDateRef.current;
                                  if (!input) return;

                                  if (typeof input.showPicker === "function") {
                                    input.showPicker();
                                    return;
                                  }

                                  input.focus();
                                  input.click();
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                aria-label="Open validity date picker"
                              >
                                <FaCalendar />
                              </button>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contract & shipping</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1 text-sm sm:col-span-2">
                            <span className="font-medium text-slate-700">Payment terms</span>
                            <input
                              value={invoiceMeta.paymentTerms}
                              onChange={(event) => updateInvoiceMeta("paymentTerms", event.target.value)}
                              placeholder="Ex: 30% advance, 70% before shipment"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                            />
                          </label>
                          <label className="space-y-1 text-sm">
                            <span className="font-medium text-slate-700">Production time</span>
                            <input
                              value={invoiceMeta.productionTime}
                              onChange={(event) => updateInvoiceMeta("productionTime", event.target.value)}
                              placeholder="Ex: 15 days"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                            />
                          </label>
                          <label className="space-y-1 text-sm">
                            <span className="font-medium text-slate-700">Port of loading</span>
                            <input
                              value={invoiceMeta.portOfLoading}
                              onChange={(event) => updateInvoiceMeta("portOfLoading", event.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                            />
                          </label>
                          <label className="space-y-1 text-sm sm:col-span-2">
                            <span className="font-medium text-slate-700">Delivery address</span>
                            <input
                              value={invoiceMeta.deliveryAddress}
                              onChange={(event) => updateInvoiceMeta("deliveryAddress", event.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Buyer details</h3>
                    <p className="mt-1 text-sm text-slate-600">Edit this information before generating the invoice.</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Name</span>
                        <input value={customerDraft.name} onChange={(event) => updateCustomer("name", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500" />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Company</span>
                        <input value={customerDraft.companyName} onChange={(event) => updateCustomer("companyName", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500" />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Email</span>
                        <input value={customerDraft.email} onChange={(event) => updateCustomer("email", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500" />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Phone</span>
                        <input value={customerDraft.phone} onChange={(event) => updateCustomer("phone", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500" />
                      </label>
                      <label className="space-y-1 text-sm md:col-span-2">
                        <span className="font-medium text-slate-700">Address</span>
                        <input value={customerDraft.address} onChange={(event) => updateCustomer("address", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500" />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">City</span>
                        <input value={customerDraft.city} onChange={(event) => updateCustomer("city", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500" />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Zone</span>
                        <input value={customerDraft.zone} onChange={(event) => updateCustomer("zone", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500" />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Area</span>
                        <input value={customerDraft.area} onChange={(event) => updateCustomer("area", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500" />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Zip code</span>
                        <input value={customerDraft.zipCode} onChange={(event) => updateCustomer("zipCode", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500" />
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2 xl:items-stretch">
                    <div className="flex min-h-[24rem] flex-col rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-200">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">Invoice products</h3>
                          <p className="text-sm text-slate-600">Edit quantities and prices for each selected product.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditableItems((prev) => [...prev, { ...EMPTY_ITEM }])}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <PackagePlus className="h-4 w-4" /> Add new item
                        </button>
                      </div>

                      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
                        {editableItems.map((item, index) => {
                          const imageUrl = item.image || "";
                          const sizeOptions = getSizeOptionsFromTiers(item.pricingTiers);

                          return (
                            <div key={`${item.productId || "item"}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                              <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                                <div className="flex w-full flex-col gap-4 sm:flex-row xl:w-[260px]">
                                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                    {imageUrl ? (
                                      <img src={imageUrl} alt={item.title || item.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                                        <PackagePlus className="h-5 w-5" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 w-full">
                                    <p className="truncate font-semibold text-slate-900">{item.title || item.name || "Invoice item"}</p>
                                    <p className="text-sm text-slate-600">{item.name || "Use the add products panel."}</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                      {formatCurrency(Math.max(Number(item.quantity || 0) * Number(item.unitPrice || 0), 0))}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid flex-1 gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
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
                                    <span className="font-medium text-slate-700">Brand</span>
                                    <input
                                      value={item.brand || ""}
                                      onChange={(event) => updateItem(index, "brand", event.target.value)}
                                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                    />
                                  </label>
                                  <label className="space-y-1 text-sm">
                                    <span className="font-medium text-slate-700">Pattern</span>
                                    <input
                                      value={item.pattern || ""}
                                      onChange={(event) => updateItem(index, "pattern", event.target.value)}
                                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                    />
                                  </label>
                                  <label className="space-y-1 text-sm">
                                    <span className="font-medium text-slate-700">Size</span>
                                    {sizeOptions.length > 0 ? (
                                      <select
                                        value={item.size || ""}
                                        onChange={(event) => updateItem(index, "size", event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                      >
                                        <option value="">Select size</option>
                                        {sizeOptions.map((sizeOption) => (
                                          <option key={sizeOption} value={sizeOption}>{sizeOption}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        value={item.size || ""}
                                        onChange={(event) => updateItem(index, "size", event.target.value)}
                                        placeholder="Ex: 26/30"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                      />
                                    )}
                                  </label>
                                  <label className="space-y-1 text-sm">
                                    <span className="font-medium text-slate-700">Qty</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={displayNumericValue(item.quantity)}
                                      onChange={(event) => updateItem(index, "quantity", event.target.value)}
                                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                    />
                                  </label>
                                  {isVehicleAccessoryItem(item) ? (
                                    <label className="space-y-1 text-sm">
                                      <span className="font-medium text-slate-700">Ply</span>
                                      <input
                                        value={item.ply || ""}
                                        onChange={(event) => updateItem(index, "ply", event.target.value)}
                                        placeholder="Ex: 16"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                      />
                                    </label>
                                  ) : null}
                                  <label className="space-y-1 text-sm">
                                    <span className="font-medium text-slate-700">Unit price</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={displayNumericValue(item.unitPrice)}
                                      onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-teal-500"
                                    />
                                  </label>
                                  <label className="space-y-1 text-sm sm:col-span-2">
                                    <span className="font-medium text-slate-700">Item image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(event) => uploadItemImage(index, event.target.files?.[0])}
                                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                                    />
                                  </label>
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 sm:col-span-2">
                                    Line total: {formatCurrency(Math.max(Number(item.quantity || 0) * Number(item.unitPrice || 0), 0))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100 sm:w-auto"
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

                    <div className="flex min-h-[24rem] flex-col rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900">Add products</h3>
                      <label className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-teal-500">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                          value={productSearch}
                          onChange={(event) => setProductSearch(event.target.value)}
                          placeholder="Search existing products"
                          className="w-full bg-transparent text-sm text-slate-900 outline-none"
                        />
                      </label>

                      <div className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 p-3">
                        {productLoading ? (
                          <div className="flex items-center justify-center py-6 text-teal-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        ) : productResults.length === 0 ? (
                          <p className="py-6 text-center text-sm text-slate-500">No products found.</p>
                        ) : (
                          productResults.map((product) => {
                            const imageUrl = getProductImage(product);
                            const unitPrice = getProductUnitPrice(product);

                            return (
                              <div key={product.id} className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center">
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
                                  <p className="text-xs text-slate-600">Price: {formatCurrency(unitPrice)}</p>
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

                  <div className="grid gap-6 xl:grid-cols-2 xl:items-stretch">
                    <div className="h-full rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-200">
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
                          value={displayNumericValue(vatRate)}
                          onChange={handleNumericInputChange(setVatRate)}
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
                          value={displayNumericValue(discountRate)}
                          onChange={handleNumericInputChange(setDiscountRate)}
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
                          value={displayNumericValue(shippingCost)}
                          onChange={handleNumericInputChange(setShippingCost)}
                          className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-right text-slate-900 outline-none focus:border-teal-500"
                        />
                      </label>
                      <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-4 text-white">
                        <span className="font-medium">Subtotal</span>
                        <span className="text-xl font-semibold">{formatCurrency(subtotal)}</span>
                      </div>
                    </div>
                    </div>

                    <div className="h-full rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-200">
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
                          value={displayNumericValue(paidAmount)}
                          onChange={handleNumericInputChange(setPaidAmount)}
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
                      {paymentStatus === "overpaid" ? (
                        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-emerald-900">
                          <span>Extra paid</span>
                          <span className="font-semibold">{formatCurrency(extraPaidAmount)}</span>
                        </div>
                      ) : null}
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
                  </div>
                </>
              ) : null}
              {selectedInquiry ? (
                <>
                  <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Invoice terms and notes</h3>
                    <div className="mt-4 space-y-4">
                      <label className="block text-sm font-medium text-slate-700">
                        Incoterms
                        <input
                          value={invoiceMeta.incoterms}
                          onChange={(event) => updateInvoiceMeta("incoterms", event.target.value)}
                          placeholder="Ex: DDP"
                          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        Bank details

                        <textarea
                          rows={3}
                          value={invoiceMeta.bankDetails}
                          onChange={(event) => updateInvoiceMeta("bankDetails", event.target.value)}
                          placeholder="Account name, bank name, account number, SWIFT"
                          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                        />
                      </label>
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
                        Terms and conditions
                        <textarea
                          rows={4}
                          value={termsAndConditions}
                          onChange={(event) => setTermsAndConditions(event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        Additional message
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
              ) : null}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
