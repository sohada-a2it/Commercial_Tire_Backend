"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { deleteCategory, fetchCategories, importCatalog, saveCategory } from "@/services/catalogService";
import { Download, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const createSubcategory = (index = 0) => ({
  id: index + 1,
  name: "",
  slug: "",
  description: "",
  displayOrder: index,
  isActive: true,
});

const categoryTemplate = {
  name: "New Category",
  slug: "new-category",
  icon: "📦",
  description: "",
  displayOrder: 0,
  isActive: true,
  image: { url: "", publicId: "" },
  subcategories: [createSubcategory(0)],
  metadata: {},
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export default function CategoriesPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = useMemo(() => ["admin", "moderator"].includes(role), [role]);

  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [editor, setEditor] = useState(clone(categoryTemplate));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    const result = await fetchCategories();
    if (!result.success) {
      toast.error(result.message || "Failed to load categories");
      setLoading(false);
      return;
    }

    setCategories(result.categories || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isStaff) loadCategories();
  }, [isStaff]);

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

  const filteredCategories = categories.filter((category) => {
    const query = search.toLowerCase();
    return (
      category.name?.toLowerCase().includes(query) ||
      category.slug?.toLowerCase().includes(query) ||
      category.icon?.toLowerCase().includes(query)
    );
  });

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...editor,
        subcategories: (editor.subcategories || []).map((subcategory, index) => ({
          ...subcategory,
          id: Number(subcategory.id || index + 1),
          displayOrder: Number(subcategory.displayOrder || index),
          isActive: subcategory.isActive !== false,
        })),
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

  const handleDelete = async () => {
    const target = categories.find((item) => String(item.id) === String(selectedId));
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
    handleNew();
    await loadCategories();
  };

  const handleImport = async () => {
    setSyncing(true);
    const result = await importCatalog();
    if (!result.success) {
      toast.error(result.message || "Import failed");
      setSyncing(false);
      return;
    }

    toast.success(`Imported ${result.categoryCount} categories and ${result.productCount} products`);
    await loadCategories();
    setSyncing(false);
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
              <p className="text-gray-700 mt-1">Use the form to manage main categories and subcategories without editing raw JSON.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleNew} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50">
                <Plus className="w-4 h-4" /> New
              </button>
              <button onClick={loadCategories} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button onClick={handleImport} disabled={syncing} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:opacity-70">
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Import JSON
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
              />

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
                      <button
                        key={category.id}
                        onClick={() => handleSelect(category)}
                        className={`w-full rounded-xl border p-4 text-left transition ${active ? "border-teal-500 bg-teal-50" : "border-gray-200 bg-white hover:border-teal-300"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold text-gray-900">{category.icon || "•"} {category.name}</div>
                            <div className="text-sm text-gray-700">{category.subcategories?.length || 0} subcategories</div>
                          </div>
                          <div className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-700">{category.slug}</div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="space-y-6 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Category form</h2>
                  <p className="text-sm text-gray-700">Edit the category title, icon, and subcategories in plain fields.</p>
                </div>
                <button onClick={handleDelete} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Category name</span>
                  <input value={editor.name || ""} onChange={(event) => updateField("name", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Slug</span>
                  <input value={editor.slug || ""} onChange={(event) => updateField("slug", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Icon</span>
                  <input value={editor.icon || ""} onChange={(event) => updateField("icon", event.target.value)} placeholder="🚛" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Display order</span>
                  <input type="number" value={editor.displayOrder ?? 0} onChange={(event) => updateField("displayOrder", Number(event.target.value))} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
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
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Cloudinary public id</span>
                  <input value={editor.image?.publicId || ""} onChange={(event) => setEditor((current) => ({ ...current, image: { ...(current.image || {}), publicId: event.target.value } }))} placeholder="asian-import-export/catalog/category-name" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Subcategories</h3>
                    <p className="text-sm text-gray-700">Each main category can contain multiple subcategories.</p>
                  </div>
                  <button onClick={addSubcategory} className="rounded-lg border text-gray-900 border-teal-200 bg-teal-50 px-4 py-2 text-sm hover:bg-teal-200">Add subcategory</button>
                </div>

                <div className="space-y-4">
                  {(editor.subcategories || []).map((subcategory, index) => (
                    <div key={`${subcategory.id || index}-${index}`} className="rounded-2xl border border-gray-200 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <strong className="text-sm text-gray-800">Subcategory {index + 1}</strong>
                        <button onClick={() => removeSubcategory(index)} className="text-sm text-red-600 hover:text-red-700">Remove</button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">ID</span>
                          <input type="number" value={subcategory.id ?? index + 1} onChange={(event) => updateSubcategory(index, "id", Number(event.target.value))} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Name</span>
                          <input value={subcategory.name || ""} onChange={(event) => updateSubcategory(index, "name", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Slug</span>
                          <input value={subcategory.slug || ""} onChange={(event) => updateSubcategory(index, "slug", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm md:col-span-2 lg:col-span-3">
                          <span className="font-medium text-gray-700">Description</span>
                          <input value={subcategory.description || ""} onChange={(event) => updateSubcategory(index, "description", event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Display order</span>
                          <input type="number" value={subcategory.displayOrder ?? index} onChange={(event) => updateSubcategory(index, "displayOrder", Number(event.target.value))} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500" />
                        </label>
                        <label className="flex items-center gap-2 self-end rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                          <input type="checkbox" checked={subcategory.isActive !== false} onChange={(event) => updateSubcategory(index, "isActive", event.target.checked)} />
                          Active
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-white hover:bg-black disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save category
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
