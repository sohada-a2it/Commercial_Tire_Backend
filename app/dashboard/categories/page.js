"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { deleteCategory, fetchCategoriesPaginated, fetchMedia, saveCategory, uploadMedia, uploadMediaFromUrl } from "@/services/catalogService";
import { Loader2, Plus, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

const createSubcategory = (index = 0) => ({
  id: index + 1,
  name: "",
  slug: "",
  description: "",
  displayOrder: index,
  isActive: true,
  image: { url: "", publicId: "" },
});

const categoryTemplate = {
  name: "New Category", 
  description: "",
  displayOrder: 0,
  isActive: true,
  image: { url: "", publicId: "" },
  subcategories: [createSubcategory(0)],
  metadata: {},
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const PAGE_SIZE = 20;

export default function CategoriesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = useMemo(() => ["admin", "moderator"].includes(role), [role]);
  const isAdmin = useMemo(() => role === "admin", [role]);

  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [editor, setEditor] = useState(clone(categoryTemplate));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaTarget, setMediaTarget] = useState({ type: "category", index: -1 });
  const [search, setSearch] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("all");
  const [sortBy, setSortBy] = useState("main-asc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryUrlInput, setCategoryUrlInput] = useState("");
  const [subcategoryUrlInputs, setSubcategoryUrlInputs] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCategories = async (targetPage = page) => {
    setLoading(true);
    const result = await fetchCategoriesPaginated({
      paginate: true,
      page: targetPage,
      limit: PAGE_SIZE,
      search: debouncedSearch,
      isActive: filterIsActive === "all" ? "" : filterIsActive,
      sort: sortBy,
    });
    if (!result.success) {
      toast.error(result.message || "Failed to load categories");
      setLoading(false);
      return;
    }

    setCategories(result.categories || []);
    setPagination(result.pagination || { page: targetPage, limit: PAGE_SIZE, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
    setLoading(false);
  };

  useEffect(() => {
    if (isStaff) loadCategories(page);
  }, [isStaff, page, debouncedSearch, sortBy, filterIsActive]);

  useEffect(() => {
    const selected = categories.find((item) => String(item.id) === String(selectedId));
    if (selected) {
      setEditor({
        ...clone(categoryTemplate),
        ...selected,
        subcategories: Array.isArray(selected.subcategories) && selected.subcategories.length ? selected.subcategories : [createSubcategory(0)],
      });
    }
  }, [categories, selectedId]);

  const filteredCategories = useMemo(() => categories, [categories]);

  const handleSelect = (category) => {
    setSelectedId(String(category.id));
    setEditor({
      ...clone(categoryTemplate),
      ...category,
      subcategories: Array.isArray(category.subcategories) && category.subcategories.length ? category.subcategories : [createSubcategory(0)],
    });
  };

  const handleNew = () => {
    setSelectedId("");
    setEditor(clone(categoryTemplate));
  };

  const updateField = (field, value) => {
    setEditor((current) => ({ ...current, [field]: value }));
  };

  const updateSubcategory = (index, field, value) => {
    setEditor((current) => {
      const subcategories = [...(current.subcategories || [])];
      subcategories[index] = { ...(subcategories[index] || createSubcategory(index)), [field]: value };
      return { ...current, subcategories };
    });
  };

  const handleCategoryImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadMedia(file, { relatedType: "category-image" });
      const media = result.media;
      setEditor((current) => ({
        ...current,
        image: {
          ...(current.image || {}),
          url: media.optimizedUrl || media.url,
          publicId: media.publicId,
        },
      }));
      toast.success("Category image uploaded");
    } catch (error) {
      toast.error(error.message || "Category image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubcategoryImageUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadMedia(file, { relatedType: "subcategory-image" });
      const media = result.media;
      updateSubcategory(index, "image", {
        url: media.optimizedUrl || media.url,
        publicId: media.publicId,
      });
      toast.success("Subcategory image uploaded");
    } catch (error) {
      toast.error(error.message || "Subcategory image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleCategoryUrlUpload = async () => {
    const imageUrl = String(categoryUrlInput || "").trim();
    if (!imageUrl) {
      toast.error("Please paste an image URL first");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadMediaFromUrl(imageUrl, { relatedType: "category-image" });
      const media = result.media;
      setEditor((current) => ({
        ...current,
        image: {
          url: media.optimizedUrl || media.url,
          publicId: media.publicId,
        },
      }));
      setCategoryUrlInput("");
      toast.success("Category image uploaded to Cloudinary");
    } catch (error) {
      toast.error(error.message || "Failed to upload category image from URL");
    } finally {
      setUploading(false);
    }
  };

  const handleSubcategoryUrlUpload = async (index) => {
    const imageUrl = String(subcategoryUrlInputs[index] || "").trim();
    if (!imageUrl) {
      toast.error("Please paste an image URL first");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadMediaFromUrl(imageUrl, { relatedType: "subcategory-image" });
      const media = result.media;
      updateSubcategory(index, "image", {
        url: media.optimizedUrl || media.url,
        publicId: media.publicId,
      });
      setSubcategoryUrlInputs((current) => {
        const updated = { ...current };
        delete updated[index];
        return updated;
      });
      toast.success("Subcategory image uploaded to Cloudinary");
    } catch (error) {
      toast.error(error.message || "Failed to upload subcategory image from URL");
    } finally {
      setUploading(false);
    }
  };

  const addSubcategory = () => {
    setEditor((current) => ({
      ...current,
      subcategories: [...(current.subcategories || []), createSubcategory((current.subcategories || []).length)],
    }));
  };

  const removeSubcategory = (index) => {
    setEditor((current) => ({
      ...current,
      subcategories: (current.subcategories || []).filter((_item, itemIndex) => itemIndex !== index),
    }));
  };

  const openMediaPicker = async (target) => {
    setMediaTarget(target);
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

  const applyMediaSelection = (media) => {
    if (!media) return;

    if (mediaTarget.type === "subcategory" && mediaTarget.index >= 0) {
      updateSubcategory(mediaTarget.index, "image", {
        url: media.optimizedUrl || media.url,
        publicId: media.publicId || "",
      });
      setMediaPickerOpen(false);
      toast.success("Subcategory image selected from Cloudinary media");
      return;
    }

    setEditor((current) => ({
      ...current,
      image: {
        ...(current.image || {}),
        url: media.optimizedUrl || media.url,
        publicId: media.publicId || "",
      },
    }));
    setMediaPickerOpen(false);
    toast.success("Category image selected from Cloudinary media");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...editor,
        subcategories: (editor.subcategories || [])
          .map((subcategory, index) => ({
            ...subcategory,
            id: Number(subcategory.id || index + 1),
            name: String(subcategory.name || "").trim(),
            slug: String(subcategory.slug || "").trim(),
            displayOrder: Number(subcategory.displayOrder || index),
            isActive: subcategory.isActive !== false,
            image: {
              url: String(subcategory.image?.url || "").trim(),
              publicId: String(subcategory.image?.publicId || "").trim(),
            },
          }))
          .filter((subcategory) => subcategory.name),
      };

      const result = await saveCategory(payload, selectedId || editor.id);
      toast.success(selectedId ? "Category updated" : "Category created");
      setSelectedId(String(result.category?.id || payload.id || ""));
      await loadCategories();
    } catch (error) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId = selectedId) => {
    const target = categories.find((item) => String(item.id) === String(categoryId));
    if (!target) {
      toast.error("Select a category to delete");
      return;
    }

    if (!confirm(`Delete ${target.name}? This also removes its products.`)) return;

    const result = await deleteCategory(target.id);
    if (!result.success) {
      toast.error(result.message || "Failed to delete category");
      return;
    }

    toast.success("Category deleted");
    if (String(selectedId) === String(target.id)) {
      handleNew();
    }
    await loadCategories();
  };

  

  return (
    <DashboardLayout>
      {!isStaff ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Access denied</h1>
          <p className="text-gray-700 mt-2">Staff access is required to manage catalog data.</p>
        </div>
      ) : (
        <div className="space-y-6 [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 [&_input]:border-gray-200 [&_textarea]:bg-white [&_textarea]:text-gray-900 [&_textarea]:placeholder:text-gray-400 [&_textarea]:border-gray-200 [&_select]:bg-white [&_select]:text-gray-900 [&_select]:border-gray-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
              <p className="text-gray-700 mt-1">Use the form to manage main categories and subcategories.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleNew} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50">
                <Plus className="w-4 h-4" /> Add Category
              </button>
              <button onClick={loadCategories} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
              <input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Search by main or subcategory"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <select value={filterIsActive} onChange={(event) => { setFilterIsActive(event.target.value); setPage(1); }} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500">
                  <option value="all">All status</option>
                  <option value="true">Active only</option>
                  <option value="false">Inactive only</option>
                </select>
                <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500">
                  <option value="main-asc">Sort: Main category A-Z</option>
                  <option value="main-desc">Sort: Main category Z-A</option>
                  <option value="sub-asc">Sort: Subcategory count low-high</option>
                  <option value="sub-desc">Sort: Subcategory count high-low</option>
                </select>
              </div>
            </div>
          </div>

          <div className=" ">
            <section className="space-y-6 rounded-2xl bg-white p-4 mb-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Category form</h2>
                  <p className="text-sm text-gray-700">Edit the category title, icon, and subcategories in plain fields.</p>
                </div> 
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Category name</span>
                  <input value={editor.name || ""} onChange={(event) => updateField("name", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>   
              </div>

              <label className="space-y-2 text-sm block">
                <span className="font-medium text-gray-700">Description</span>
                <textarea value={editor.description || ""} onChange={(event) => updateField("description", event.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Image URL</span>
                  <input value={editor.image?.url || ""} onChange={(event) => setEditor((current) => ({ ...current, image: { ...(current.image || {}), url: event.target.value } }))} placeholder="https://res.cloudinary.com/.../image/upload/..." className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <div className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Upload category image</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload image
                      <input type="file" accept="image/*" onChange={handleCategoryImageUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => openMediaPicker({ type: "category", index: -1 })}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      Select from Cloudinary Media
                    </button>
                  </div>
                  {editor.image?.publicId ? <p className="text-xs text-gray-600">Public id: {editor.image.publicId}</p> : null}
                </div>
              </div>  

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-white hover:bg-black disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {uploading ? "Uploading..." : "Save category"}
                </button>
              </div>
            </section>
            <aside className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-teal-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-700">No categories found.</div>
                ) : (
                  filteredCategories.map((category) => {
                    const active = String(category.id) === String(selectedId);
                    return (
                      <div
                        key={category.id}
                        className={`w-full rounded-xl border p-4 transition ${active ? "border-teal-500 bg-teal-50" : "border-gray-200 bg-white hover:border-teal-300"}`}
                      >
                        <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => handleSelect(category)}>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">{category.icon || "•"} {category.name}</div>  
                          </div>
                          <div className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-700">{category.slug}</div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelect(category)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(category.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700">
                <span>Page {pagination.page || 1} / {pagination.totalPages || 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!pagination.hasPrevPage || loading}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-lg border border-gray-300 px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={!pagination.hasNextPage || loading}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-gray-300 px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </aside>
          </div>

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
                        onClick={() => applyMediaSelection(media)}
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
      )}
    </DashboardLayout>
  );
}
