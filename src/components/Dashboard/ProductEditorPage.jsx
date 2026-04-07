"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { fetchCategories, fetchMedia, fetchProduct, saveProduct, uploadMedia, uploadMediaFromUrl } from "@/services/catalogService";
import { ArrowLeft, Loader2, Save, Upload } from "lucide-react";
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
  image: { url: "", publicId: "", alt: "" },
  images: [createImage(0)],
  keyAttributes: {},
  packagingAndDelivery: { packaging: "", delivery: "" },
  priceSource: "",
  userReviews: [createReview(0)],
  tags: [""],
  isFeatured: false,
  isActive: true,
  metadata: {},
  mainCategory: "",
  subCategory: "",
  pattern: "",
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

export default function ProductEditorPage({ mode = "create", productId = "" }) {
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

    return {
      ...editor,
      category: categoryId || editor.category || "",
      mainCategory: selectedCategory?.name || editor.mainCategory || "",
      subCategory: selectedSubcategory?.name || editor.subCategory || "",
      categoryName: selectedCategory?.name || editor.categoryName || "",
      categoryIcon: selectedCategory?.icon || editor.categoryIcon || "",
      subcategoryId: subcategoryId ? Number(subcategoryId) : Number(editor.subcategoryId || 0),
      subcategoryName: selectedSubcategory?.name || editor.subcategoryName || "",
      subcategorySlug: selectedSubcategory?.slug || editor.subcategorySlug || "",
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
        router.push("/dashboard/products");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6 [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 [&_input]:border-gray-200 [&_textarea]:bg-white [&_textarea]:text-gray-900 [&_textarea]:placeholder:text-gray-400 [&_textarea]:border-gray-200 [&_select]:bg-white [&_select]:text-gray-900 [&_select]:border-gray-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? "Edit Product" : "Create Product"}</h1>
            <p className="text-gray-700 mt-1">Use this form to manage all product details.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/products")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to products
          </button>
        </div>

        <section className="space-y-6 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
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
              <span className="font-medium text-gray-700">Description</span>
              <textarea value={editor.description || ""} onChange={(event) => updateField("description", event.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Shipping</span>
              <textarea value={editor.shipping || ""} onChange={(event) => updateField("shipping", event.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
            </label>
          </div>

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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
              <input type="checkbox" checked={Boolean(editor.isFeatured)} onChange={(event) => updateField("isFeatured", event.target.checked)} />
              Featured product
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
              <input type="checkbox" checked={editor.isActive !== false} onChange={(event) => updateField("isActive", event.target.checked)} />
              Active
            </label>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-white hover:bg-black disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {uploading ? "Uploading..." : "Save product"}
            </button>
          </div>
        </section>

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
