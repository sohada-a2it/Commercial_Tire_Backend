// Updated ProductEditorPage.tsx (frontend)
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { fetchCategories, fetchMedia, fetchProduct, saveProduct, uploadMedia, uploadMediaFromUrl } from "@/services/catalogService";
import { ArrowLeft, Loader2, Save, Upload, FileText, Video, Box, Settings } from "lucide-react";
import toast from "react-hot-toast";

const createPricingTier = (index = 0) => ({
  minQuantity: index === 0 ? 0 : 1,
  maxQuantity: "",
  pricePerTire: "",
  note: "",
});

const createReview = (index = 0) => ({
  username: "",
  location: "",
  rating: 5,
  date: "",
  title: "",
  text: "",
  verified: index === 0,
});

const createImage = (index = 0) => ({
  url: "",
  publicId: "",
  alt: `Image ${index + 1}`,
});

const createAttribute = () => ({ key: "", value: "" });

// Tire specification defaults
const defaultTireSpecs = {
  size: "",
  loadIndex: "",
  speedRating: "",
  treadPattern: "",
  plyRating: "",
  stdRim: "",
  overallDiameter: "",
  sectionWidth: "",
  maxLoad: "",
  maxInflation: "",
  treadDepth: "",
  revsPerKm: "",
  // নতুন ফিল্ড
  loadRange: "",
  singleMaxLoad: "",
  singleMaxPressure: "",
  dualMaxLoad: "",
  dualMaxPressure: "",
  staticLoadRadius: "",
  weight: "",
  weightUnit: "lbs",
  constructionType: "TL",
};

const defaultResources = {
  brochure: { url: "", publicId: "", alt: "" },
  datasheet: { url: "", publicId: "", alt: "" },
  warrantyDoc: { url: "", publicId: "", alt: "" },
  certificate: { url: "", publicId: "", alt: "" },
};

const productTemplate = {
  name: "New Product",
  slug: "new-product",
  sku: "",
  brand: "",
  price: "$0.00",
  offerPrice: "$0.00",
  pricingTiers: [createPricingTier(0)],
  customizationOptions: [""],
  shipping: "",
  description: "",
  shortDescription: "",
  image: { url: "", publicId: "", alt: "" },
  images: [createImage(0)],
  keyAttributes: {},
  packagingAndDelivery: { packaging: "", delivery: "" },
  priceSource: "",
  userReviews: [createReview(0)],
  tags: [""],
  isFeatured: false,
  isActive: true,
  isNewArrival: false,
  isBestSeller: false,
  metadata: {},
  mainCategory: "",
  subCategory: "",
  pattern: "",
  // Tire-specific fields
  tireType: "all-position",
  vehicleType: ["truck"],
  application: ["highway"],
  tireSpecs: { ...defaultTireSpecs },
  resources: { ...defaultResources },
  videoUrl: "",
  threeSixtyImages: [],
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const cleanStringArray = (items = []) => items.map((item) => String(item).trim()).filter(Boolean);

const cleanImages = (images = []) =>
  images
    .map((image, index) => ({
      url: String(image?.url || "").trim(),
      publicId: String(image?.publicId || "").trim(),
      alt: String(image?.alt || `Image ${index + 1}`).trim(),
    }))
    .filter((image) => image.url || image.publicId);

const VEHICLE_CATEGORY_NAME = "Vehicle Parts and Accessories";

// Tire type options
const TIRE_TYPE_OPTIONS = [
  { value: "steer", label: "Steer Tire" },
  { value: "drive", label: "Drive Tire" },
  { value: "trailer", label: "Trailer Tire" },
  { value: "all-position", label: "All-Position Tire" },
  { value: "off-road", label: "Off-Road Tire" },
  { value: "mining", label: "Mining Tire" },
];

const VEHICLE_TYPE_OPTIONS = [
  { value: "truck", label: "Truck" },
  { value: "bus", label: "Bus" },
  { value: "otr", label: "OTR (Off-The-Road)" },
  { value: "industrial", label: "Industrial" },
  { value: "mining", label: "Mining" },
  { value: "agricultural", label: "Agricultural" },
];

const APPLICATION_OPTIONS = [
  { value: "highway", label: "Highway / Long Haul" },
  { value: "regional", label: "Regional / Distribution" },
  { value: "mixed-service", label: "Mixed Service (On/Off Road)" },
  { value: "off-road", label: "Off-Road" },
  { value: "mining", label: "Mining" },
  { value: "port", label: "Port / Container Handling" },
  { value: "construction", label: "Construction" },
];

const SPEED_RATING_OPTIONS = [
  { value: "A1", label: "A1 (5 km/h)" },
  { value: "A2", label: "A2 (10 km/h)" },
  { value: "A3", label: "A3 (15 km/h)" },
  { value: "A4", label: "A4 (25 km/h)" },
  { value: "A5", label: "A5 (30 km/h)" },
  { value: "A6", label: "A6 (35 km/h)" },
  { value: "A7", label: "A7 (40 km/h)" },
  { value: "A8", label: "A8 (50 km/h)" },
  { value: "B", label: "B (50 km/h)" },
  { value: "C", label: "C (60 km/h)" },
  { value: "D", label: "D (65 km/h)" },
  { value: "E", label: "E (70 km/h)" },
  { value: "F", label: "F (80 km/h)" },
  { value: "G", label: "G (90 km/h)" },
  { value: "J", label: "J (100 km/h)" },
  { value: "K", label: "K (110 km/h)" },
  { value: "L", label: "L (120 km/h)" },
  { value: "M", label: "M (130 km/h)" },
  { value: "N", label: "N (140 km/h)" },
  { value: "P", label: "P (150 km/h)" },
  { value: "Q", label: "Q (160 km/h)" },
  { value: "R", label: "R (170 km/h)" },
  { value: "S", label: "S (180 km/h)" },
  { value: "T", label: "T (190 km/h)" },
  { value: "U", label: "U (200 km/h)" },
  { value: "H", label: "H (210 km/h)" },
  { value: "V", label: "V (240 km/h)" },
  { value: "W", label: "W (270 km/h)" },
  { value: "Y", label: "Y (300 km/h)" },
  { value: "Z", label: "Z (240+ km/h)" },
];

export default function ProductEditorPage({ mode = "create", productId = "", returnUrl = "" }) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = useMemo(() => ["admin", "moderator"].includes(role), [role]);

  const isEditMode = mode === "edit";

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [editor, setEditor] = useState(clone(productTemplate));
  const [keyAttributes, setKeyAttributes] = useState([createAttribute()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [activeTab, setActiveTab] = useState("basic"); // basic, tire-specs, media, seo

  const selectedCategory = categories.find((item) => String(item.id) === String(categoryId));
  const subcategories = selectedCategory?.subcategories || [];
  const selectedSubcategory = subcategories.find((item) => String(item.id) === String(subcategoryId));
  const showPatternField = selectedCategory?.name === VEHICLE_CATEGORY_NAME;

  const applyProductToEditor = (selected) => {
    const mergedImages = [selected.image, ...(selected.images || [])].filter((item) => item?.url || item?.publicId);
    const packagingAndDelivery = selected.packagingAndDelivery || { packaging: "", delivery: "" };
    const normalizedDelivery = String(packagingAndDelivery.delivery || packagingAndDelivery.deliveryTime || "").trim();
    
    setEditor({
      ...clone(productTemplate),
      ...selected,
      pricingTiers: Array.isArray(selected.pricingTiers) && selected.pricingTiers.length ? selected.pricingTiers : [createPricingTier(0)],
      customizationOptions: Array.isArray(selected.customizationOptions) && selected.customizationOptions.length ? selected.customizationOptions : [""],
      images: mergedImages.length ? mergedImages : [],
      userReviews: Array.isArray(selected.userReviews) && selected.userReviews.length ? selected.userReviews : [createReview(0)],
      tags: Array.isArray(selected.tags) && selected.tags.length ? selected.tags : [""],
      packagingAndDelivery: {
        ...packagingAndDelivery,
        delivery: normalizedDelivery,
        deliveryTime: normalizedDelivery,
      },
      tireType: selected.tireType || "all-position",
      vehicleType: Array.isArray(selected.vehicleType) ? selected.vehicleType : [selected.vehicleType || "truck"],
      application: Array.isArray(selected.application) ? selected.application : [selected.application || "highway"],
      tireSpecs: { ...defaultTireSpecs, ...(selected.tireSpecs || {}) },
      resources: { ...defaultResources, ...(selected.resources || {}) },
      videoUrl: selected.videoUrl || "",
      threeSixtyImages: selected.threeSixtyImages || [],
      shortDescription: selected.shortDescription || "",
      isNewArrival: selected.isNewArrival || false,
      isBestSeller: selected.isBestSeller || false,
    });

    setKeyAttributes(
      selected.keyAttributes && typeof selected.keyAttributes === "object"
        ? Object.entries(selected.keyAttributes).map(([key, value]) => ({ key, value: String(value ?? "") }))
        : [createAttribute()]
    );
    setCategoryId(String(selected.category || ""));
    setSubcategoryId(String(selected.subcategoryId || ""));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const categoryResult = await fetchCategories();
        const loadedCategories = categoryResult.categories || [];
        setCategories(loadedCategories);

        if (isEditMode) {
          const productResult = await fetchProduct(productId);
          applyProductToEditor(productResult.product || {});
        } else {
          const nextCategory = loadedCategories[0];
          const nextSubcategory = nextCategory?.subcategories?.[0];
          setCategoryId(nextCategory?.id ? String(nextCategory.id) : "");
          setSubcategoryId(nextSubcategory?.id ? String(nextSubcategory.id) : "");
          setEditor({
            ...clone(productTemplate),
            mainCategory: nextCategory?.name || "",
            subCategory: nextSubcategory?.name || "",
            category: nextCategory?.id || "",
            categoryName: nextCategory?.name || "",
            categoryIcon: nextCategory?.icon || "",
            subcategoryId: nextSubcategory?.id || "",
            subcategoryName: nextSubcategory?.name || "",
            subcategorySlug: nextSubcategory?.slug || "",
            pattern: "",
          });
          setKeyAttributes([createAttribute()]);
        }
      } catch (error) {
        toast.error(error.message || "Failed to load product editor");
      } finally {
        setLoading(false);
      }
    };

    if (isStaff) {
      loadData();
    }
  }, [isEditMode, isStaff, productId]);

  useEffect(() => {
    if (!showPatternField && editor.pattern) {
      setEditor((current) => ({ ...current, pattern: "" }));
    }
  }, [showPatternField, editor.pattern]);

  const updateField = (field, value) => {
    setEditor((current) => ({ ...current, [field]: value }));
  };

  const updateArrayField = (field, index, value) => {
    setEditor((current) => {
      const items = [...(current[field] || [])];
      items[index] = value;
      return { ...current, [field]: items };
    });
  };

  const addArrayItem = (field, factory) => {
    setEditor((current) => ({ ...current, [field]: [...(current[field] || []), factory((current[field] || []).length)] }));
  };

  const removeArrayItem = (field, index) => {
    setEditor((current) => ({ ...current, [field]: (current[field] || []).filter((_item, itemIndex) => itemIndex !== index) }));
  };

  const updateKeyAttribute = (index, field, value) => {
    setKeyAttributes((current) => {
      const items = [...current];
      items[index] = { ...(items[index] || createAttribute()), [field]: value };
      return items;
    });
  };

  const handleKeyAttributeAdd = () => setKeyAttributes((current) => [...current, createAttribute()]);
  const handleKeyAttributeRemove = (index) => setKeyAttributes((current) => current.filter((_item, itemIndex) => itemIndex !== index));

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploads = await Promise.all(files.map((file) => uploadMedia(file, { relatedType: "product-gallery" })));
      setEditor((current) => ({
        ...current,
        images: [
          ...(current.images || []),
          ...uploads.map((result, index) => {
            const media = result.media;
            return {
              url: media.optimizedUrl || media.url,
              publicId: media.publicId,
              alt: `${current.name || "Product"} ${index + 1}`,
            };
          }),
        ],
      }));
      toast.success("Gallery images uploaded to Cloudinary");
    } catch (error) {
      toast.error(error.message || "Gallery upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleAddGalleryUrl = () => {
    const url = String(galleryUrlInput || "").trim();
    if (!url) return;

    setEditor((current) => ({
      ...current,
      images: [
        ...(current.images || []),
        {
          url,
          publicId: "",
          alt: `${current.name || "Product"} ${(current.images || []).length + 1}`,
        },
      ],
    }));
    setGalleryUrlInput("");
  };

  const handlePasteAndUploadUrl = async () => {
    const imageUrl = String(galleryUrlInput || "").trim();
    if (!imageUrl) {
      toast.error("Please paste an image URL first");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadMediaFromUrl(imageUrl, { relatedType: "product-gallery" });
      const media = result.media;
      setEditor((current) => ({
        ...current,
        images: [
          ...(current.images || []),
          {
            url: media.optimizedUrl || media.url,
            publicId: media.publicId,
            alt: `${current.name || "Product"} ${(current.images || []).length + 1}`,
          },
        ],
      }));
      setGalleryUrlInput("");
      toast.success("Image uploaded to Cloudinary and added to gallery");
    } catch (error) {
      toast.error(error.message || "Failed to upload image from URL");
    } finally {
      setUploading(false);
    }
  };

  const handleResourceUpload = async (event, resourceField) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadMedia(file, { relatedType: "product-resource" });
      const media = result.media;
      setEditor((current) => ({
        ...current,
        resources: {
          ...current.resources,
          [resourceField]: {
            url: media.optimizedUrl || media.url,
            publicId: media.publicId,
            alt: file.name,
          },
        },
      }));
      toast.success(`${resourceField} uploaded successfully`);
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const openMediaPicker = async () => {
    setMediaSearch("");
    setMediaLoading(true);
    setMediaPickerOpen(true);
    try {
      const result = await fetchMedia({});
      setMediaItems(result.media || []);
    } catch (error) {
      toast.error(error.message || "Failed to load media");
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const searchMedia = async (value) => {
    setMediaSearch(value);
    setMediaLoading(true);
    try {
      const result = await fetchMedia({ search: value });
      setMediaItems(result.media || []);
    } catch (error) {
      toast.error(error.message || "Failed to filter media");
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const selectMediaForGallery = (media) => {
    if (!media) return;

    setEditor((current) => ({
      ...current,
      images: [
        ...(current.images || []),
        {
          url: media.optimizedUrl || media.url,
          publicId: media.publicId || "",
          alt: `${current.name || "Product"} ${(current.images || []).length + 1}`,
        },
      ],
    }));
    setMediaPickerOpen(false);
    toast.success("Image selected from Cloudinary media");
  };

  const buildPayload = () => {
  const normalizedGallery = cleanImages(editor.images || []);
  const mainImage = normalizedGallery[0] || { url: "", publicId: "", alt: "" };
  const otherImages = normalizedGallery.slice(1);

  const cleanPricingTiers = (editor.pricingTiers || [])
    .map((tier) => ({
      minQuantity: tier.minQuantity === "" ? 0 : Number(tier.minQuantity ?? 0),
      maxQuantity: tier.maxQuantity === "" ? null : Number(tier.maxQuantity),
      pricePerTire: String(tier.pricePerTire || "").trim(),
      note: String(tier.note || "").trim(),
    }))
    .filter((tier) => tier.pricePerTire || tier.note || tier.minQuantity || tier.maxQuantity !== null);

  const cleanReviews = (editor.userReviews || [])
    .map((review) => ({
      username: String(review.username || "").trim(),
      location: String(review.location || "").trim(),
      rating: Number(review.rating || 0),
      date: String(review.date || "").trim(),
      title: String(review.title || "").trim(),
      text: String(review.text || "").trim(),
      verified: Boolean(review.verified),
    }))
    .filter((review) => review.username || review.text || review.title);

  const payloadPattern = showPatternField ? String(editor.pattern || "").trim() : "";

  const packagingAndDelivery = { ...(editor.packagingAndDelivery || {}) };
  const deliveryText = String(packagingAndDelivery.delivery || packagingAndDelivery.deliveryTime || "").trim();
  if (deliveryText) {
    packagingAndDelivery.delivery = deliveryText;
    packagingAndDelivery.deliveryTime = deliveryText;
  }

  // Clean up resources
  const cleanResources = {};
  Object.keys(editor.resources || {}).forEach(key => {
    const resource = editor.resources[key];
    if (resource?.url || resource?.publicId) {
      cleanResources[key] = {
        url: String(resource.url || "").trim(),
        publicId: String(resource.publicId || "").trim(),
        alt: String(resource.alt || key).trim(),
      };
    } else {
      cleanResources[key] = { url: "", publicId: "", alt: "" };
    }
  });

  // Helper to get primary value from array
  const getPrimaryValue = (value, defaultValue) => {
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
    if (typeof value === 'string' && value) {
      return value;
    }
    return defaultValue;
  };

  // Helper to ensure array
  const ensureArray = (value, defaultValue) => {
    if (Array.isArray(value) && value.length > 0) {
      return value.filter(v => v);
    }
    if (typeof value === 'string' && value) {
      return [value];
    }
    return defaultValue;
  };

  return {
    ...editor,
    // Category fields
    category: categoryId || editor.category || "",
    mainCategory: selectedCategory?.name || editor.mainCategory || "",
    subCategory: selectedSubcategory?.name || editor.subCategory || "",
    categoryName: selectedCategory?.name || editor.categoryName || "",
    categoryIcon: selectedCategory?.icon || editor.categoryIcon || "",
    subcategoryId: subcategoryId ? Number(subcategoryId) : Number(editor.subcategoryId || 0),
    subcategoryName: selectedSubcategory?.name || editor.subcategoryName || "",
    subcategorySlug: selectedSubcategory?.slug || editor.subcategorySlug || "",
    
    // Basic fields
    pattern: payloadPattern,
    pricingTiers: cleanPricingTiers,
    customizationOptions: cleanStringArray(editor.customizationOptions || []),
    image: mainImage,
    images: otherImages,
    tags: cleanStringArray(editor.tags || []),
    userReviews: cleanReviews,
    keyAttributes: keyAttributes.reduce((accumulator, item) => {
      const key = String(item.key || "").trim();
      if (!key) return accumulator;
      if (!showPatternField && key.toLowerCase() === "pattern") return accumulator;
      accumulator[key] = String(item.value ?? "").trim();
      return accumulator;
    }, {}),
    packagingAndDelivery,
    
    // Status flags
    isFeatured: Boolean(editor.isFeatured),
    isActive: editor.isActive !== false,
    isNewArrival: Boolean(editor.isNewArrival),
    isBestSeller: Boolean(editor.isBestSeller),
    shortDescription: String(editor.shortDescription || "").trim(),
    
    // Tire-specific fields - CRITICAL: Convert arrays to strings for backend
    tireType: editor.tireType || "all-position",
    
    // Backend expects STRING for vehicleType and application (not array)
    vehicleType: getPrimaryValue(editor.vehicleType, "truck"),
    application: getPrimaryValue(editor.application, "highway"),
    
    // Also send array versions for multi-select support
    vehicleTypesList: ensureArray(editor.vehicleType, ["truck"]),
    applicationsList: ensureArray(editor.application, ["highway"]),
    
    // Tire specifications
    tireSpecs: {
      size: String(editor.tireSpecs?.size || "").trim(),
      loadIndex: String(editor.tireSpecs?.loadIndex || "").trim(),
      speedRating: String(editor.tireSpecs?.speedRating || "").trim(),
      treadPattern: String(editor.tireSpecs?.treadPattern || "").trim(),
      plyRating: String(editor.tireSpecs?.plyRating || "").trim(),
      stdRim: String(editor.tireSpecs?.stdRim || "").trim(),
      overallDiameter: String(editor.tireSpecs?.overallDiameter || "").trim(),
      sectionWidth: String(editor.tireSpecs?.sectionWidth || "").trim(),
      maxLoad: String(editor.tireSpecs?.maxLoad || "").trim(),
      maxInflation: String(editor.tireSpecs?.maxInflation || "").trim(),
      treadDepth: String(editor.tireSpecs?.treadDepth || "").trim(),
      revsPerKm: String(editor.tireSpecs?.revsPerKm || "").trim(),
      // নতুন ফিল্ড (আপনার CSV এর জন্য)
      loadRange: String(editor.tireSpecs?.loadRange || "").trim(),
      singleMaxLoad: String(editor.tireSpecs?.singleMaxLoad || "").trim(),
      singleMaxPressure: String(editor.tireSpecs?.singleMaxPressure || "").trim(),
      dualMaxLoad: String(editor.tireSpecs?.dualMaxLoad || "").trim(),
      dualMaxPressure: String(editor.tireSpecs?.dualMaxPressure || "").trim(),
      staticLoadRadius: String(editor.tireSpecs?.staticLoadRadius || "").trim(),
      weight: String(editor.tireSpecs?.weight || "").trim(),
      weightUnit: editor.tireSpecs?.weightUnit || "lbs",
      constructionType: editor.tireSpecs?.constructionType || "TL",
    },
    resources: cleanResources,
    videoUrl: String(editor.videoUrl || "").trim(),
    threeSixtyImages: cleanImages(editor.threeSixtyImages || []),
  };
};

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = buildPayload();
      if (payload.pattern && !payload.keyAttributes?.Pattern) {
        payload.keyAttributes = { ...(payload.keyAttributes || {}), Pattern: payload.pattern };
      }
      const result = await saveProduct(payload, isEditMode ? productId : "");
      toast.success(isEditMode ? "Product updated" : "Product created");

      if (result?.product?.id || isEditMode) {
        const redirectUrl = returnUrl || "/dashboard/products";
        router.push(redirectUrl);
      }
    } catch (error) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(returnUrl || "/dashboard/products");
  };

  if (!isStaff) {
    return (
      <DashboardLayout>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Access denied</h1>
          <p className="text-gray-700 mt-2">Staff access is required to manage products.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center rounded-2xl bg-white p-10 text-teal-600">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Tab components for better organization
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        activeTab === id
          ? "border-teal-500 text-teal-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 [&_input]:border-gray-200 [&_textarea]:bg-white [&_textarea]:text-gray-900 [&_textarea]:placeholder:text-gray-400 [&_textarea]:border-gray-200 [&_select]:bg-white [&_select]:text-gray-900 [&_select]:border-gray-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? "Edit Product" : "Create Product"}</h1>
            <p className="text-gray-700 mt-1">Use this form to manage all product details including tire specifications.</p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to products
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex gap-2">
            <TabButton id="basic" label="Basic Info" icon={Box} />
            <TabButton id="tire-specs" label="Tire Specifications" icon={Settings} />
            <TabButton id="media" label="Media & Downloads" icon={FileText} />
            <TabButton id="seo" label="SEO & Metadata" icon={FileText} />
          </div>
        </div>

        <section className="space-y-6 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          {/* BASIC INFO TAB */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Category</span>
                  <select
                    value={categoryId}
                    onChange={(event) => {
                      const nextCategoryId = event.target.value;
                      const nextCategory = categories.find((item) => String(item.id) === String(nextCategoryId));
                      const nextSubcategory = nextCategory?.subcategories?.[0];
                      setCategoryId(nextCategoryId);
                      setSubcategoryId(nextSubcategory?.id ? String(nextSubcategory.id) : "");
                      setEditor((current) => ({
                        ...current,
                        category: nextCategoryId,
                        mainCategory: nextCategory?.name || "",
                        categoryName: nextCategory?.name || "",
                        categoryIcon: nextCategory?.icon || "",
                        subCategory: nextSubcategory?.name || "",
                        subcategoryId: nextSubcategory?.id || "",
                        subcategoryName: nextSubcategory?.name || "",
                        subcategorySlug: nextSubcategory?.slug || "",
                        pattern: nextCategory?.name === VEHICLE_CATEGORY_NAME ? current.pattern : "",
                      }));
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Subcategory</span>
                  <select
                    value={subcategoryId}
                    onChange={(event) => {
                      const nextSubcategoryId = event.target.value;
                      const nextSubcategory = subcategories.find((item) => String(item.id) === String(nextSubcategoryId));
                      setSubcategoryId(nextSubcategoryId);
                      setEditor((current) => ({
                        ...current,
                        subCategory: nextSubcategory?.name || "",
                        subcategoryId: nextSubcategoryId,
                        subcategoryName: nextSubcategory?.name || "",
                        subcategorySlug: nextSubcategory?.slug || "",
                      }));
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Product name</span>
                  <input value={editor.name || ""} onChange={(event) => updateField("name", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Slug</span>
                  <input value={editor.slug || ""} onChange={(event) => updateField("slug", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">SKU</span>
                  <input value={editor.sku || ""} onChange={(event) => updateField("sku", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Brand</span>
                  <input value={editor.brand || ""} onChange={(event) => updateField("brand", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Price</span>
                  <input value={editor.price || ""} onChange={(event) => updateField("price", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Offer price</span>
                  <input value={editor.offerPrice || ""} onChange={(event) => updateField("offerPrice", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                {showPatternField ? (
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Pattern (optional)</span>
                    <input value={editor.pattern || ""} onChange={(event) => updateField("pattern", event.target.value)} placeholder="Drive, Steer, Trailer" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                  </label>
                ) : null}
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Short Description</span>
                  <textarea value={editor.shortDescription || ""} onChange={(event) => updateField("shortDescription", event.target.value)} rows={2} placeholder="Brief summary for product cards (max 160 chars)" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Full Description</span>
                  <textarea value={editor.description || ""} onChange={(event) => updateField("description", event.target.value)} rows={6} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Shipping Information</span>
                  <textarea value={editor.shipping || ""} onChange={(event) => updateField("shipping", event.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
              </div>

              {/* Pricing Tiers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pricing tiers</h3>
                    <p className="text-sm text-gray-700">Add quantity-based prices for bulk buyers.</p>
                  </div>
                  <button onClick={() => addArrayItem("pricingTiers", createPricingTier)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Add tier</button>
                </div>
                <div className="space-y-3">
                  {(editor.pricingTiers || []).map((tier, index) => (
                    <div key={`tier-${index}`} className="rounded-2xl border border-gray-200 p-4">
                      <div className="grid gap-3 md:grid-cols-4">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Min qty</span>
                          <input type="number" value={tier.minQuantity ?? ""} onChange={(event) => updateArrayField("pricingTiers", index, { ...tier, minQuantity: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Max qty</span>
                          <input type="number" value={tier.maxQuantity ?? ""} onChange={(event) => updateArrayField("pricingTiers", index, { ...tier, maxQuantity: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Price per tire</span>
                          <input value={tier.pricePerTire || ""} onChange={(event) => updateArrayField("pricingTiers", index, { ...tier, pricePerTire: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Note</span>
                          <input value={tier.note || ""} onChange={(event) => updateArrayField("pricingTiers", index, { ...tier, note: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button onClick={() => removeArrayItem("pricingTiers", index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove tier</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customization Options & Tags */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Customization options</h3>
                      <p className="text-sm text-gray-700">List the available custom choices.</p>
                    </div>
                    <button onClick={() => addArrayItem("customizationOptions", () => "")} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Add option</button>
                  </div>
                  <div className="space-y-3">
                    {(editor.customizationOptions || []).map((option, index) => (
                      <div key={`option-${index}`} className="flex gap-3 rounded-2xl border border-gray-200 p-4">
                        <input value={option || ""} onChange={(event) => updateArrayField("customizationOptions", index, event.target.value)} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" placeholder="Custom engraving, private label, etc." />
                        <button onClick={() => removeArrayItem("customizationOptions", index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                      <p className="text-sm text-gray-700">Short labels used for search and filtering.</p>
                    </div>
                    <button onClick={() => addArrayItem("tags", () => "")} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Add tag</button>
                  </div>
                  <div className="space-y-3">
                    {(editor.tags || []).map((tag, index) => (
                      <div key={`tag-${index}`} className="flex gap-3 rounded-2xl border border-gray-200 p-4">
                        <input value={tag || ""} onChange={(event) => updateArrayField("tags", index, event.target.value)} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" placeholder="Industrial, export, heavy-duty" />
                        <button onClick={() => removeArrayItem("tags", index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Attributes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Key attributes</h3>
                    <p className="text-sm text-gray-700">Use simple key/value pairs instead of raw objects.</p>
                  </div>
                  <button onClick={handleKeyAttributeAdd} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Add attribute</button>
                </div>
                <div className="space-y-3">
                  {keyAttributes.map((attribute, index) => (
                    <div key={`attribute-${index}`} className="flex gap-3 rounded-2xl border border-gray-200 p-4">
                      <input value={attribute.key || ""} onChange={(event) => updateKeyAttribute(index, "key", event.target.value)} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" placeholder="Material" />
                      <input value={attribute.value || ""} onChange={(event) => updateKeyAttribute(index, "value", event.target.value)} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" placeholder="Stainless steel" />
                      <button onClick={() => handleKeyAttributeRemove(index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Packaging & Delivery */}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Packaging</span>
                  <input value={editor.packagingAndDelivery?.packaging || ""} onChange={(event) => setEditor((current) => ({ ...current, packagingAndDelivery: { ...(current.packagingAndDelivery || {}), packaging: event.target.value } }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Delivery</span>
                  <input value={editor.packagingAndDelivery?.delivery || editor.packagingAndDelivery?.deliveryTime || ""} onChange={(event) => setEditor((current) => ({ ...current, packagingAndDelivery: { ...(current.packagingAndDelivery || {}), delivery: event.target.value, deliveryTime: event.target.value } }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Price source</span>
                  <input value={editor.priceSource || ""} onChange={(event) => updateField("priceSource", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
              </div>

              {/* User Reviews */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">User reviews</h3>
                    <p className="text-sm text-gray-700">Capture review cards from the source catalog.</p>
                  </div>
                  <button onClick={() => addArrayItem("userReviews", createReview)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Add review</button>
                </div>
                <div className="space-y-3">
                  {(editor.userReviews || []).map((review, index) => (
                    <div key={`review-${index}`} className="rounded-2xl border border-gray-200 p-4">
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Name</span>
                          <input value={review.username || ""} onChange={(event) => updateArrayField("userReviews", index, { ...review, username: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Location</span>
                          <input value={review.location || ""} onChange={(event) => updateArrayField("userReviews", index, { ...review, location: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Rating</span>
                          <input type="number" min="0" max="5" step="0.1" value={review.rating ?? 0} onChange={(event) => updateArrayField("userReviews", index, { ...review, rating: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Date</span>
                          <input value={review.date || ""} onChange={(event) => updateArrayField("userReviews", index, { ...review, date: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm md:col-span-2 lg:col-span-2">
                          <span className="font-medium text-gray-700">Title</span>
                          <input value={review.title || ""} onChange={(event) => updateArrayField("userReviews", index, { ...review, title: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm md:col-span-2 lg:col-span-3">
                          <span className="font-medium text-gray-700">Review text</span>
                          <textarea value={review.text || ""} onChange={(event) => updateArrayField("userReviews", index, { ...review, text: event.target.value })} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                          <input type="checkbox" checked={Boolean(review.verified)} onChange={(event) => updateArrayField("userReviews", index, { ...review, verified: event.target.checked })} />
                          Verified buyer
                        </label>
                        <div className="flex items-end justify-end">
                          <button onClick={() => removeArrayItem("userReviews", index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TIRE SPECIFICATIONS TAB */}
          {activeTab === "tire-specs" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Tire Type</span>
                  <select
                    value={editor.tireType || "all-position"}
                    onChange={(event) => updateField("tireType", event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                  >
                    {TIRE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Vehicle Type</span>
                  <select
                    multiple
                    value={editor.vehicleType || ["truck"]}
                    onChange={(event) => {
                      const selected = Array.from(event.target.selectedOptions, opt => opt.value);
                      updateField("vehicleType", selected);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 min-h-[100px]"
                  >
                    {VEHICLE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Application</span>
                  <select
                    multiple
                    value={editor.application || ["highway"]}
                    onChange={(event) => {
                      const selected = Array.from(event.target.selectedOptions, opt => opt.value);
                      updateField("application", selected);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 min-h-[100px]"
                  >
                    {APPLICATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                </label>

                <div className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Pattern</span>
                  <input
                    value={editor.pattern || ""}
                    onChange={(event) => updateField("pattern", event.target.value)}
                    placeholder="e.g., RLB400, D858, etc."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Tire Size</span>
                    <input
                      value={editor.tireSpecs?.size || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, size: event.target.value }
                      }))}
                      placeholder="e.g., 12R22.5, 11R22.5"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>

                  {/* Technical Specifications - এর মধ্যে এই নতুন ফিল্ডগুলি যোগ করুন */}

<label className="space-y-2 text-sm">
  <span className="font-medium text-gray-700">Load Range</span>
  <select
    value={editor.tireSpecs?.loadRange || ""}
    onChange={(event) => setEditor(current => ({
      ...current,
      tireSpecs: { ...current.tireSpecs, loadRange: event.target.value }
    }))}
    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
  >
    <option value="">Select Load Range</option>
    <option value="A">A</option>
    <option value="B">B</option>
    <option value="C">C</option>
    <option value="D">D</option>
    <option value="E">E</option>
    <option value="F">F</option>
    <option value="G">G</option>
    <option value="H">H</option>
    <option value="J">J</option>
    <option value="L">L</option>
  </select>
</label>

<label className="space-y-2 text-sm">
  <span className="font-medium text-gray-700">Single Max Load / Pressure</span>
  <div className="flex gap-2">
    <input
      value={editor.tireSpecs?.singleMaxLoad || ""}
      onChange={(event) => setEditor(current => ({
        ...current,
        tireSpecs: { ...current.tireSpecs, singleMaxLoad: event.target.value }
      }))}
      placeholder="e.g., 4080lbs"
      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
    />
    <input
      value={editor.tireSpecs?.singleMaxPressure || ""}
      onChange={(event) => setEditor(current => ({
        ...current,
        tireSpecs: { ...current.tireSpecs, singleMaxPressure: event.target.value }
      }))}
      placeholder="psi"
      className="w-24 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
    />
  </div>
</label>

<label className="space-y-2 text-sm">
  <span className="font-medium text-gray-700">Dual Max Load / Pressure</span>
  <div className="flex gap-2">
    <input
      value={editor.tireSpecs?.dualMaxLoad || ""}
      onChange={(event) => setEditor(current => ({
        ...current,
        tireSpecs: { ...current.tireSpecs, dualMaxLoad: event.target.value }
      }))}
      placeholder="e.g., 3640lb"
      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
    />
    <input
      value={editor.tireSpecs?.dualMaxPressure || ""}
      onChange={(event) => setEditor(current => ({
        ...current,
        tireSpecs: { ...current.tireSpecs, dualMaxPressure: event.target.value }
      }))}
      placeholder="psi"
      className="w-24 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
    />
  </div>
</label>

<label className="space-y-2 text-sm">
  <span className="font-medium text-gray-700">Static Load Radius (inch)</span>
  <input
    value={editor.tireSpecs?.staticLoadRadius || ""}
    onChange={(event) => setEditor(current => ({
      ...current,
      tireSpecs: { ...current.tireSpecs, staticLoadRadius: event.target.value }
    }))}
    placeholder="e.g., 14"
    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
  />
</label>

<label className="space-y-2 text-sm">
  <span className="font-medium text-gray-700">Weight</span>
  <div className="flex gap-2">
    <input
      value={editor.tireSpecs?.weight || ""}
      onChange={(event) => setEditor(current => ({
        ...current,
        tireSpecs: { ...current.tireSpecs, weight: event.target.value }
      }))}
      placeholder="e.g., 54"
      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
    />
    <select
      value={editor.tireSpecs?.weightUnit || "lbs"}
      onChange={(event) => setEditor(current => ({
        ...current,
        tireSpecs: { ...current.tireSpecs, weightUnit: event.target.value }
      }))}
      className="w-24 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
    >
      <option value="lbs">lbs</option>
      <option value="kg">kg</option>
    </select>
  </div>
</label>

<label className="space-y-2 text-sm">
  <span className="font-medium text-gray-700">Construction Type</span>
  <select
    value={editor.tireSpecs?.constructionType || "TL"}
    onChange={(event) => setEditor(current => ({
      ...current,
      tireSpecs: { ...current.tireSpecs, constructionType: event.target.value }
    }))}
    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
  >
    <option value="TL">TL (Tubeless)</option>
    <option value="TT">TT (Tube Type)</option>
    <option value="Both">Both</option>
  </select>
</label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Speed Rating</span>
                    <select
                      value={editor.tireSpecs?.speedRating || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, speedRating: event.target.value }
                      }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    >
                      <option value="">Select speed rating</option>
                      {SPEED_RATING_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Tread Pattern</span>
                    <input
                      value={editor.tireSpecs?.treadPattern || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, treadPattern: event.target.value }
                      }))}
                      placeholder="e.g., RLB400"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Ply Rating</span>
                    <input
                      value={editor.tireSpecs?.plyRating || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, plyRating: event.target.value }
                      }))}
                      placeholder="e.g., 18 PR"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Standard Rim</span>
                    <input
                      value={editor.tireSpecs?.stdRim || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, stdRim: event.target.value }
                      }))}
                      placeholder="e.g., 9.00"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Overall Diameter</span>
                    <input
                      value={editor.tireSpecs?.overallDiameter || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, overallDiameter: event.target.value }
                      }))}
                      placeholder="e.g., 1080 mm"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Section Width</span>
                    <input
                      value={editor.tireSpecs?.sectionWidth || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, sectionWidth: event.target.value }
                      }))}
                      placeholder="e.g., 300 mm"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Max Load</span>
                    <input
                      value={editor.tireSpecs?.maxLoad || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, maxLoad: event.target.value }
                      }))}
                      placeholder="e.g., 3750 kg"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Max Inflation</span>
                    <input
                      value={editor.tireSpecs?.maxInflation || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, maxInflation: event.target.value }
                      }))}
                      placeholder="e.g., 120 psi"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Tread Depth</span>
                    <input
                      value={editor.tireSpecs?.treadDepth || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, treadDepth: event.target.value }
                      }))}
                      placeholder="e.g., 18 mm"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Revolutions per km</span>
                    <input
                      value={editor.tireSpecs?.revsPerKm || ""}
                      onChange={(event) => setEditor(current => ({
                        ...current,
                        tireSpecs: { ...current.tireSpecs, revsPerKm: event.target.value }
                      }))}
                      placeholder="e.g., 492"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* MEDIA & DOWNLOADS TAB */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Product Images */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Product images</h3>
                    <p className="text-sm text-gray-700">Upload images or paste URLs. The first image will be the main image.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Upload className="w-4 h-4" /> Upload images
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={openMediaPicker}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Select from Cloudinary Media
                  </button>
                </div>
                <div className="flex gap-2">
                  <input value={galleryUrlInput} onChange={(event) => setGalleryUrlInput(event.target.value)} placeholder="Paste image URL and click Add URL or Paste & Upload" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                  <button type="button" onClick={handleAddGalleryUrl} className="rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Add URL</button>
                  <button type="button" onClick={handlePasteAndUploadUrl} disabled={uploading} className="inline-flex items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-700 hover:bg-teal-100 disabled:opacity-50">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Paste & Upload
                  </button>
                </div>
                <div className="space-y-3">
                  {(editor.images || []).map((image, index) => (
                    <div key={`image-${index}`} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start">
                        <img src={image.url || ""} alt={image.alt || `Image ${index + 1}`} className="h-28 w-28 rounded-lg border border-gray-200 object-cover" />
                        <div className="min-w-0 flex-1 space-y-2">
                          {index === 0 ? <div className="inline-flex rounded-full bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700">Main image</div> : <div className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">Other image</div>}
                          <input value={image.url || ""} onChange={(event) => updateArrayField("images", index, { ...image, url: event.target.value })} placeholder="https://res.cloudinary.com/.../image/upload/..." className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                          {image.publicId ? <p className="text-xs text-gray-600">Public id: {image.publicId}</p> : null}
                        </div>
                        <div className="flex gap-2 md:flex-col">
                          {index > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const items = [...(editor.images || [])];
                                const [picked] = items.splice(index, 1);
                                items.unshift(picked);
                                setEditor((current) => ({ ...current, images: items }));
                              }}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Set as main
                            </button>
                          ) : null}
                          <button onClick={() => removeArrayItem("images", index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video URL */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Product Video</h3>
                  <p className="text-sm text-gray-700">YouTube or Vimeo URL for product demonstration</p>
                </div>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Video URL</span>
                  <input
                    value={editor.videoUrl || ""}
                    onChange={(event) => updateField("videoUrl", event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                  />
                </label>
              </div>

              {/* 360 View Images */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">360° View Images</h3>
                    <p className="text-sm text-gray-700">Upload multiple images for 360-degree product view</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Upload className="w-4 h-4" /> Upload 360 images
                    <input type="file" accept="image/*" multiple onChange={async (event) => {
                      const files = Array.from(event.target.files || []);
                      if (!files.length) return;
                      setUploading(true);
                      try {
                        const uploads = await Promise.all(files.map((file) => uploadMedia(file, { relatedType: "product-360" })));
                        setEditor((current) => ({
                          ...current,
                          threeSixtyImages: [
                            ...(current.threeSixtyImages || []),
                            ...uploads.map((result, idx) => ({
                              url: result.media.optimizedUrl || result.media.url,
                              publicId: result.media.publicId,
                              alt: `${current.name || "Product"} 360° ${idx + 1}`,
                            })),
                          ],
                        }));
                        toast.success("360° images uploaded");
                      } catch (error) {
                        toast.error(error.message || "Upload failed");
                      } finally {
                        setUploading(false);
                        event.target.value = "";
                      }
                    }} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(editor.threeSixtyImages || []).map((image, index) => (
                    <div key={`360-${index}`} className="relative rounded-xl border border-gray-200 p-2">
                      <img src={image.url} alt={image.alt} className="h-24 w-full rounded-lg object-cover" />
                      <button
                        onClick={() => {
                          setEditor(current => ({
                            ...current,
                            threeSixtyImages: current.threeSixtyImages.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downloadable Resources */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Downloadable Resources</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Product Brochure
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={editor.resources?.brochure?.url || ""}
                        onChange={(event) => setEditor(current => ({
                          ...current,
                          resources: {
                            ...current.resources,
                            brochure: { ...current.resources?.brochure, url: event.target.value }
                          }
                        }))}
                        placeholder="PDF URL"
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                      />
                      <label className="cursor-pointer rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700 hover:bg-teal-100">
                        Upload
                        <input type="file" accept=".pdf" onChange={(e) => handleResourceUpload(e, "brochure")} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Technical Datasheet
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={editor.resources?.datasheet?.url || ""}
                        onChange={(event) => setEditor(current => ({
                          ...current,
                          resources: {
                            ...current.resources,
                            datasheet: { ...current.resources?.datasheet, url: event.target.value }
                          }
                        }))}
                        placeholder="PDF URL"
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                      />
                      <label className="cursor-pointer rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700 hover:bg-teal-100">
                        Upload
                        <input type="file" accept=".pdf" onChange={(e) => handleResourceUpload(e, "datasheet")} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Warranty Document
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={editor.resources?.warrantyDoc?.url || ""}
                        onChange={(event) => setEditor(current => ({
                          ...current,
                          resources: {
                            ...current.resources,
                            warrantyDoc: { ...current.resources?.warrantyDoc, url: event.target.value }
                          }
                        }))}
                        placeholder="PDF URL"
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                      />
                      <label className="cursor-pointer rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700 hover:bg-teal-100">
                        Upload
                        <input type="file" accept=".pdf" onChange={(e) => handleResourceUpload(e, "warrantyDoc")} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Quality Certificate
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={editor.resources?.certificate?.url || ""}
                        onChange={(event) => setEditor(current => ({
                          ...current,
                          resources: {
                            ...current.resources,
                            certificate: { ...current.resources?.certificate, url: event.target.value }
                          }
                        }))}
                        placeholder="PDF URL"
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                      />
                      <label className="cursor-pointer rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700 hover:bg-teal-100">
                        Upload
                        <input type="file" accept=".pdf" onChange={(e) => handleResourceUpload(e, "certificate")} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO & METADATA TAB */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">SEO Title</span>
                  <input
                    value={editor.metadata?.seoTitle || ""}
                    onChange={(event) => setEditor(current => ({
                      ...current,
                      metadata: { ...current.metadata, seoTitle: event.target.value }
                    }))}
                    placeholder="Custom title for search engines"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">SEO Description</span>
                  <textarea
                    value={editor.metadata?.seoDescription || ""}
                    onChange={(event) => setEditor(current => ({
                      ...current,
                      metadata: { ...current.metadata, seoDescription: event.target.value }
                    }))}
                    rows={3}
                    placeholder="Meta description for search results (max 160 chars)"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
                  />
                </label>
              </div>

              {/* Product Status Flags */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={Boolean(editor.isFeatured)} onChange={(event) => updateField("isFeatured", event.target.checked)} />
                    Featured product (shows on homepage)
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={editor.isActive !== false} onChange={(event) => updateField("isActive", event.target.checked)} />
                    Active (visible on website)
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={Boolean(editor.isNewArrival)} onChange={(event) => updateField("isNewArrival", event.target.checked)} />
                    New Arrival (shows "New" badge)
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={Boolean(editor.isBestSeller)} onChange={(event) => updateField("isBestSeller", event.target.checked)} />
                    Best Seller (shows bestseller badge)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end border-t border-gray-200 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-white hover:bg-black disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {uploading ? "Uploading..." : "Save product"}
            </button>
          </div>
        </section>

        {/* Media Picker Modal */}
        {mediaPickerOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Select from Cloudinary Media</h3>
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
              <input
                value={mediaSearch}
                onChange={(event) => searchMedia(event.target.value)}
                placeholder="Search by filename, public id, or folder"
                className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
              />
              {mediaLoading ? (
                <div className="py-10 text-center text-teal-600"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
              ) : mediaItems.length === 0 ? (
                <p className="py-8 text-center text-gray-600">No media found.</p>
              ) : (
                <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto md:grid-cols-4">
                  {mediaItems.map((media) => (
                    <button
                      key={media.publicId || media._id || media.url}
                      type="button"
                      onClick={() => selectMediaForGallery(media)}
                      className="rounded-xl border border-gray-200 p-2 text-left hover:border-teal-400 hover:bg-teal-50"
                    >
                      <img
                        src={media.optimizedUrl || media.url}
                        alt={media.originalFilename || media.publicId || "media"}
                        className="h-28 w-full rounded-lg object-cover"
                      />
                      <p className="mt-2 truncate text-xs text-gray-700">{media.originalFilename || media.publicId}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}