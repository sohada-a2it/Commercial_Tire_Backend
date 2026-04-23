// Updated ProductEditorPage.tsx (with Multiple Tire Sizes Support)

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { fetchCategories, fetchMedia, fetchProduct, saveProduct, uploadMedia, uploadMediaFromUrl } from "@/services/catalogService";
import { ArrowLeft, Loader2, Save, Upload, FileText, Box, Settings, Plus, Trash2, Copy } from "lucide-react";
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

// ✅ Tire specification for a single size
const createTireSpec = (index = 0) => ({
  id: Date.now() + index,
  productCode: "",  // ✅ যোগ করুন
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
  loadRange: "",
  singleMaxLoad: "",
  singleMaxPressure: "",
  dualMaxLoad: "",
  dualMaxPressure: "",
  staticLoadRadius: "",
  weight: "",
  weightUnit: "lbs",
  constructionType: "TL",
});

// Default first spec
const defaultTireSpecs = [createTireSpec(0)];

const defaultResources = {
  brochure: { url: "", publicId: "", alt: "" },
  datasheet: { url: "", publicId: "", alt: "" },
  warrantyDoc: { url: "", publicId: "", alt: "" },
  certificate: { url: "", publicId: "", alt: "" },
};

const productTemplate = {
  name: "New Product", 
  sku: "",
  modelNumber: "",
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
  tireType: "all-position",
  vehicleType: ["truck"],
  application: ["highway"],
  tireSpecs: defaultTireSpecs, // ✅ Now an array!
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
  { value: "A1", label: "A1 (5 km/h)" }, { value: "A2", label: "A2 (10 km/h)" },
  { value: "A3", label: "A3 (15 km/h)" }, { value: "A4", label: "A4 (25 km/h)" },
  { value: "A5", label: "A5 (30 km/h)" }, { value: "A6", label: "A6 (35 km/h)" },
  { value: "A7", label: "A7 (40 km/h)" }, { value: "A8", label: "A8 (50 km/h)" },
  { value: "B", label: "B (50 km/h)" }, { value: "C", label: "C (60 km/h)" },
  { value: "D", label: "D (65 km/h)" }, { value: "E", label: "E (70 km/h)" },
  { value: "F", label: "F (80 km/h)" }, { value: "G", label: "G (90 km/h)" },
  { value: "J", label: "J (100 km/h)" }, { value: "K", label: "K (110 km/h)" },
  { value: "L", label: "L (120 km/h)" }, { value: "M", label: "M (130 km/h)" },
  { value: "N", label: "N (140 km/h)" }, { value: "P", label: "P (150 km/h)" },
  { value: "Q", label: "Q (160 km/h)" }, { value: "R", label: "R (170 km/h)" },
  { value: "S", label: "S (180 km/h)" }, { value: "T", label: "T (190 km/h)" },
  { value: "U", label: "U (200 km/h)" }, { value: "H", label: "H (210 km/h)" },
  { value: "V", label: "V (240 km/h)" }, { value: "W", label: "W (270 km/h)" },
  { value: "Y", label: "Y (300 km/h)" }, { value: "Z", label: "Z (240+ km/h)" },
];

const LOAD_RANGE_OPTIONS = [
  { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" },
  { value: "D", label: "D" }, { value: "E", label: "E" }, { value: "F", label: "F" },
  { value: "G", label: "G" }, { value: "H", label: "H" }, { value: "J", label: "J" },
  { value: "L", label: "L" },
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
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    basic: false,
    pricing: false,
    attributes: false,
    reviews: false,
    tireSpecs: false,
    media: false,
    resources: false,
    seo: false,
  });

  const selectedCategory = categories.find((item) => String(item.id) === String(categoryId));
  const subcategories = selectedCategory?.subcategories || [];
  const selectedSubcategory = subcategories.find((item) => String(item.id) === String(subcategoryId));
  const showPatternField = selectedCategory?.name === VEHICLE_CATEGORY_NAME;

  const toggleSection = (section) => {
    setSectionsCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ✅ Helper to convert backend array to frontend format
  const normalizeTireSpecsFromBackend = (backendSpecs) => {
  if (!backendSpecs || !Array.isArray(backendSpecs)) {
    return defaultTireSpecs;
  }
  if (backendSpecs.length === 0) {
    return [createTireSpec(0)];
  }
  return backendSpecs.map((spec, idx) => ({
    id: spec.id || Date.now() + idx,
    productCode: spec.productCode || "",
    size: spec.size || "",
    loadIndex: spec.loadIndex || "",
    speedRating: spec.speedRating || "",  // ✅ Changed from speedSymbol
    treadPattern: spec.treadPattern || "",
    plyRating: spec.plyRating || "",
    stdRim: spec.stdRim || "",
    overallDiameter: spec.overallDiameter || "",
    sectionWidth: spec.sectionWidth || "",
    maxLoad: spec.maxLoad || "",  // ✅ Added
    maxInflation: spec.maxInflation || "",  // ✅ Added
    treadDepth: spec.treadDepth || "",
    revsPerKm: spec.revsPerKm || "",  // ✅ Changed from revsPerMile
    loadRange: spec.loadRange || "",
    singleMaxLoad: spec.singleMaxLoad || "",
    singleMaxPressure: spec.singleMaxPressure || "",
    dualMaxLoad: spec.dualMaxLoad || "",
    dualMaxPressure: spec.dualMaxPressure || "",
    staticLoadRadius: spec.staticLoadRadius || "",
    weight: spec.weight || "",
    weightUnit: spec.weightUnit || "lbs",
    constructionType: spec.constructionType || "TL",
  }));
};

  const applyProductToEditor = (selected) => {
    const mergedImages = [selected.image, ...(selected.images || [])].filter((item) => item?.url || item?.publicId);
    const packagingAndDelivery = selected.packagingAndDelivery || { packaging: "", delivery: "" };
    const normalizedDelivery = String(packagingAndDelivery.delivery || packagingAndDelivery.deliveryTime || "").trim();
    
    setEditor({
      ...clone(productTemplate),
      ...selected,
      modelNumber: selected.modelNumber || "",
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
      vehicleType: Array.isArray(selected.vehicleType) ? selected.vehicleType : (selected.vehicleTypesList || ["truck"]),
      application: Array.isArray(selected.application) ? selected.application : (selected.applicationsList || ["highway"]),
      tireSpecs: normalizeTireSpecsFromBackend(selected.tireSpecs), // ✅ Convert array
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

  // ✅ Tire Spec specific functions
  const addTireSpec = () => {
    const newSpec = createTireSpec(editor.tireSpecs.length);
    setEditor((current) => ({
      ...current,
      tireSpecs: [...current.tireSpecs, newSpec]
    }));
  };

  const updateTireSpec = (index, field, value) => {
    setEditor((current) => {
      const specs = [...current.tireSpecs];
      specs[index] = { ...specs[index], [field]: value };
      return { ...current, tireSpecs: specs };
    });
  };

  const removeTireSpec = (index) => {
    if (editor.tireSpecs.length <= 1) {
      toast.error("At least one tire size is required");
      return;
    }
    setEditor((current) => ({
      ...current,
      tireSpecs: current.tireSpecs.filter((_, i) => i !== index)
    }));
  };

  const duplicateTireSpec = (index) => {
    const specToDuplicate = editor.tireSpecs[index];
    const newSpec = { ...specToDuplicate, id: Date.now() };
    setEditor((current) => ({
      ...current,
      tireSpecs: [...current.tireSpecs, newSpec]
    }));
    toast.success("Size duplicated");
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

  const getPrimaryValue = (value, defaultValue) => {
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
    if (typeof value === 'string' && value) {
      return value;
    }
    return defaultValue;
  };

  const ensureArray = (value, defaultValue) => {
    if (Array.isArray(value) && value.length > 0) {
      return value.filter(v => v);
    }
    if (typeof value === 'string' && value) {
      return [value];
    }
    return defaultValue;
  };

  // ✅ Build tireSpecs array for backend - FULLY CORRECTED
  const tireSpecsArray = editor.tireSpecs.map(spec => ({
    productCode: String(spec.productCode || "").trim(),
    size: String(spec.size || "").trim(),
    plyRating: String(spec.plyRating || "").trim(),
    loadRange: String(spec.loadRange || "").trim(),
    loadIndex: String(spec.loadIndex || "").trim(),
    speedRating: String(spec.speedRating || "").trim(),
    overallDiameter: String(spec.overallDiameter || "").trim(),
    sectionWidth: String(spec.sectionWidth || "").trim(),
    treadDepth: String(spec.treadDepth || "").trim(),
    stdRim: String(spec.stdRim || "").trim(),
    maxLoad: String(spec.maxLoad || "").trim(),
    maxInflation: String(spec.maxInflation || "").trim(),
    singleMaxLoad: String(spec.singleMaxLoad || "").trim(),
    singleMaxPressure: String(spec.singleMaxPressure || "").trim(),
    dualMaxLoad: String(spec.dualMaxLoad || "").trim(),
    dualMaxPressure: String(spec.dualMaxPressure || "").trim(),
    staticLoadRadius: String(spec.staticLoadRadius || "").trim(),
    revsPerKm: String(spec.revsPerKm || "").trim(),
    weight: String(spec.weight || "").trim(),
    weightUnit: spec.weightUnit || "lbs",
    constructionType: spec.constructionType || "TL",
  }));

  return {
    ...editor,
    modelNumber: String(editor.modelNumber || "").trim(),
    category: categoryId || editor.category || "",
    mainCategory: selectedCategory?.name || editor.mainCategory || "",
    subCategory: selectedSubcategory?.name || editor.subCategory || "",
    categoryName: selectedCategory?.name || editor.categoryName || "",
    categoryIcon: selectedCategory?.icon || editor.categoryIcon || "",
    subcategoryId: subcategoryId ? Number(subcategoryId) : Number(editor.subcategoryId || 0),
    subcategoryName: selectedSubcategory?.name || editor.subcategoryName || "", 
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
    isFeatured: Boolean(editor.isFeatured),
    isActive: editor.isActive !== false,
    isNewArrival: Boolean(editor.isNewArrival),
    isBestSeller: Boolean(editor.isBestSeller),
    shortDescription: String(editor.shortDescription || "").trim(),
    tireType: editor.tireType || "all-position",
    vehicleType: getPrimaryValue(editor.vehicleType, "truck"),
    application: getPrimaryValue(editor.application, "highway"),
    vehicleTypesList: ensureArray(editor.vehicleType, ["truck"]),
    applicationsList: ensureArray(editor.application, ["highway"]),
    tireSpecs: tireSpecsArray,
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

  const SectionHeader = ({ title, icon: Icon, section, description }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-600" />
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      <svg
        className={`w-5 h-5 text-gray-500 transition-transform ${sectionsCollapsed[section] ? '' : 'rotate-180'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 [&_input]:border-gray-200 [&_textarea]:bg-white [&_textarea]:text-gray-900 [&_textarea]:placeholder:text-gray-400 [&_textarea]:border-gray-200 [&_select]:bg-white [&_select]:text-gray-900 [&_select]:border-gray-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? "Edit Product" : "Create Product"}</h1>
            <p className="text-gray-700 mt-1">Complete all product details including specifications, media, and SEO.</p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to products
          </button>
        </div>

        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          {/* SECTION 1: BASIC INFORMATION - Same as before */}
          <div>
            <SectionHeader title="Basic Information" icon={Box} section="basic" description="Product name, category, pricing, and description" />
            {!sectionsCollapsed.basic && (
              <div className="pt-4 space-y-6">
                {/* ... keep existing basic info form ... */}
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm md:col-span-2">
                    <span className="font-medium text-gray-700">Product name</span>
                    <input value={editor.name || ""} onChange={(event) => updateField("name", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                  </label>  
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Model Number</span>
                    <input value={editor.modelNumber || ""} onChange={(event) => updateField("modelNumber", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
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

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Price source</span>
                  <input value={editor.priceSource || ""} onChange={(event) => updateField("priceSource", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Packaging</span>
                    <input value={editor.packagingAndDelivery?.packaging || ""} onChange={(event) => setEditor((current) => ({ ...current, packagingAndDelivery: { ...(current.packagingAndDelivery || {}), packaging: event.target.value } }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-gray-700">Delivery</span>
                    <input value={editor.packagingAndDelivery?.delivery || editor.packagingAndDelivery?.deliveryTime || ""} onChange={(event) => setEditor((current) => ({ ...current, packagingAndDelivery: { ...(current.packagingAndDelivery || {}), delivery: event.target.value, deliveryTime: event.target.value } }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: PRICING TIERS - Same */}
          <div>
            <SectionHeader title="Pricing Tiers" icon={Box} section="pricing" description="Quantity-based pricing for bulk buyers" />
            {!sectionsCollapsed.pricing && (
              <div className="pt-4 space-y-3">
                <div className="flex justify-end">
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
            )}
          </div>

          {/* SECTION 3: TIRE SPECIFICATIONS - UPDATED WITH MULTIPLE SIZES */}
          <div>
            <SectionHeader title="Tire Specifications" icon={Settings} section="tireSpecs" description="Technical specifications for tires - multiple sizes supported" />
            {!sectionsCollapsed.tireSpecs && (
              <div className="pt-4 space-y-6">
                {/* Common fields (not size-specific) */}
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
                </div>

                {/* Multiple Tire Sizes Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-900">Available Sizes & Specifications</h3>
                    <button
                      type="button"
                      onClick={addTireSpec}
                      className="inline-flex items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-4 py-2 text-sm text-teal-700 hover:bg-teal-100"
                    >
                      <Plus className="w-4 h-4" /> Add Size
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {editor.tireSpecs.map((spec, index) => (
                      <div key={spec.id || index} className="rounded-2xl border border-gray-200 p-4 bg-gray-50/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            Size {index + 1}: {spec.size || "Not specified"}
                          </h4>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => duplicateTireSpec(index)}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Copy className="w-3.5 h-3.5 inline mr-1" /> Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTireSpec(index)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Tire Size *</span>
                            <input 
                              value={spec.size || ""} 
                              onChange={(e) => updateTireSpec(index, "size", e.target.value)} 
                              placeholder="e.g., 11R22.5, 295/75R22.5"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>
                          
                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Product Code</span>
                            <input 
                              value={spec.productCode || ""} 
                              onChange={(e) => updateTireSpec(index, "productCode", e.target.value)} 
                              placeholder="e.g., 1133751255"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Ply Rating</span>
                            <input 
                              value={spec.plyRating || ""} 
                              onChange={(e) => updateTireSpec(index, "plyRating", e.target.value)} 
                              placeholder="e.g., 14, 16"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Load Range</span>
                            <select 
                              value={spec.loadRange || ""} 
                              onChange={(e) => updateTireSpec(index, "loadRange", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white"
                            >
                              <option value="">Select Load Range</option>
                              {LOAD_RANGE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Load Index</span>
                            <input 
                              value={spec.loadIndex || ""} 
                              onChange={(e) => updateTireSpec(index, "loadIndex", e.target.value)} 
                              placeholder="e.g., 144/142"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                         <label className="space-y-2 text-sm">
  <span className="font-medium text-gray-700">Speed Rating</span>  
  <select 
    value={spec.speedRating || ""}  
    onChange={(e) => updateTireSpec(index, "speedRating", e.target.value)}  
    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white"
  >
    <option value="">Select Speed Rating</option>
    {SPEED_RATING_OPTIONS.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
</label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Overall Diameter (inch)</span>
                            <input 
                              value={spec.overallDiameter || ""} 
                              onChange={(e) => updateTireSpec(index, "overallDiameter", e.target.value)} 
                              placeholder="e.g., 41.0"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Section Width (inch)</span>
                            <input 
                              value={spec.sectionWidth || ""} 
                              onChange={(e) => updateTireSpec(index, "sectionWidth", e.target.value)} 
                              placeholder="e.g., 10.9"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Tread Depth (32nds)</span>
                            <input 
                              value={spec.treadDepth || ""} 
                              onChange={(e) => updateTireSpec(index, "treadDepth", e.target.value)} 
                              placeholder="e.g., 12"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Standard Rim</span>
                            <input 
                              value={spec.stdRim || ""} 
                              onChange={(e) => updateTireSpec(index, "stdRim", e.target.value)} 
                              placeholder="e.g., 8.25"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Single Max Load</span>
                            <input 
                              value={spec.singleMaxLoad || ""} 
                              onChange={(e) => updateTireSpec(index, "singleMaxLoad", e.target.value)} 
                              placeholder="e.g., 6175lb"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Single Max Pressure (psi)</span>
                            <input 
                              value={spec.singleMaxPressure || ""} 
                              onChange={(e) => updateTireSpec(index, "singleMaxPressure", e.target.value)} 
                              placeholder="e.g., 105"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Dual Max Load</span>
                            <input 
                              value={spec.dualMaxLoad || ""} 
                              onChange={(e) => updateTireSpec(index, "dualMaxLoad", e.target.value)} 
                              placeholder="e.g., 5840lb"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Dual Max Pressure (psi)</span>
                            <input 
                              value={spec.dualMaxPressure || ""} 
                              onChange={(e) => updateTireSpec(index, "dualMaxPressure", e.target.value)} 
                              placeholder="e.g., 105"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Static Load Radius (inch)</span>
                            <input 
                              value={spec.staticLoadRadius || ""} 
                              onChange={(e) => updateTireSpec(index, "staticLoadRadius", e.target.value)} 
                              placeholder="e.g., 19.5"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label>

                          <label className="space-y-2 text-sm">
  <span className="font-medium text-gray-700">Revs per Km</span>  
  <input 
    value={spec.revsPerKm || ""}  
    onChange={(e) => updateTireSpec(index, "revsPerKm", e.target.value)}  
    placeholder="e.g., 500"
    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
  />
</label>

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Weight (lbs)</span>
                            <input 
                              value={spec.weight || ""} 
                              onChange={(e) => updateTireSpec(index, "weight", e.target.value)} 
                              placeholder="e.g., 109"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white" 
                            />
                          </label> 

                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-gray-700">Construction Type</span>
                            <select 
                              value={spec.tireType || "TL"} 
                              onChange={(e) => updateTireSpec(index, "tireType", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500 bg-white"
                            >
                              <option value="TL">TL (Tubeless)</option>
                              <option value="TT">TT (Tube Type)</option>
                              <option value="Both">Both</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {editor.tireSpecs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No sizes added. Click "Add Size" to add tire specifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: KEY ATTRIBUTES */}
          <div>
            <SectionHeader title="Key Attributes" icon={Settings} section="attributes" description="Product specifications as key-value pairs" />
            {!sectionsCollapsed.attributes && (
              <div className="pt-4 space-y-3">
                <div className="flex justify-end">
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
            )}
          </div>

          {/* SECTION 5: USER REVIEWS */}
          <div>
            <SectionHeader title="User Reviews" icon={Box} section="reviews" description="Customer reviews and testimonials" />
            {!sectionsCollapsed.reviews && (
              <div className="pt-4 space-y-3">
                <div className="flex justify-end">
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
            )}
          </div>

          {/* SECTION 6: MEDIA & IMAGES */}
          <div>
            <SectionHeader title="Media & Images" icon={FileText} section="media" description="Product images, videos, and 360° views" />
            {!sectionsCollapsed.media && (
              <div className="pt-4 space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-md font-medium text-gray-900">Product images</h3>
                    <div className="flex gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Upload className="w-4 h-4" /> Upload images
                        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                      </label>
                      <button type="button" onClick={openMediaPicker} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Select from Media</button>
                    </div>
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
                            {index === 0 ? <span className="inline-flex rounded-full bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700">Main image</span> : <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">Other image</span>}
                            <input value={image.url || ""} onChange={(event) => updateArrayField("images", index, { ...image, url: event.target.value })} placeholder="https://res.cloudinary.com/.../image/upload/..." className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                            {image.publicId ? <p className="text-xs text-gray-600">Public id: {image.publicId}</p> : null}
                          </div>
                          <div className="flex gap-2 md:flex-col">
                            {index > 0 && (
                              <button type="button" onClick={() => { const items = [...(editor.images || [])]; const [picked] = items.splice(index, 1); items.unshift(picked); setEditor((current) => ({ ...current, images: items })); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Set as main</button>
                            )}
                            <button onClick={() => removeArrayItem("images", index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-md font-medium text-gray-900">Product Video</h3>
                  <input value={editor.videoUrl || ""} onChange={(event) => updateField("videoUrl", event.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
            <div className="text-sm text-gray-500">
              {editor.tireSpecs.length} tire size(s) configured
            </div>
            <button onClick={handleSave} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-white hover:bg-black disabled:opacity-70">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {uploading ? "Uploading..." : "Save product"}
            </button>
          </div>
        </section>

        {/* Media Picker Modal */}
        {mediaPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Select from Cloudinary Media</h3>
                <button type="button" onClick={() => setMediaPickerOpen(false)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Close</button>
              </div>
              <input value={mediaSearch} onChange={(event) => searchMedia(event.target.value)} placeholder="Search by filename, public id, or folder" className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
              {mediaLoading ? (
                <div className="py-10 text-center text-teal-600"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
              ) : mediaItems.length === 0 ? (
                <p className="py-8 text-center text-gray-600">No media found.</p>
              ) : (
                <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto md:grid-cols-4">
                  {mediaItems.map((media) => (
                    <button key={media.publicId || media._id || media.url} type="button" onClick={() => selectMediaForGallery(media)} className="rounded-xl border border-gray-200 p-2 text-left hover:border-teal-400 hover:bg-teal-50">
                      <img src={media.optimizedUrl || media.url} alt={media.originalFilename || media.publicId || "media"} className="h-28 w-full rounded-lg object-cover" />
                      <p className="mt-2 truncate text-xs text-gray-700">{media.originalFilename || media.publicId}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}