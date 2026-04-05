"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { deleteMedia, fetchMedia, uploadMedia } from "@/services/catalogService";
import { ImagePlus, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function MediaPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const isStaff = useMemo(() => ["admin", "moderator"].includes(role), [role]);

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const loadMedia = async () => {
    setLoading(true);
    const result = await fetchMedia({ search });
    if (!result.success) {
      toast.error(result.message || "Failed to load media");
      setLoading(false);
      return;
    }

    setMedia(result.media || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isStaff) loadMedia();
  }, [isStaff]);

  useEffect(() => {
    if (!isStaff) return;
    const timeoutId = setTimeout(() => loadMedia(), 300);
    return () => clearTimeout(timeoutId);
  }, [search, isStaff]);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      await Promise.all(files.map((file) => uploadMedia(file)));
      toast.success(`${files.length} image(s) uploaded to Cloudinary`);
      await loadMedia();
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (publicId) => {
    if (!confirm("Delete this media item from Cloudinary?")) return;

    const result = await deleteMedia(publicId);
    if (!result.success) {
      toast.error(result.message || "Failed to delete media");
      return;
    }

    toast.success("Media deleted");
    await loadMedia();
  };

  if (!isStaff) {
    return (
      <DashboardLayout>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Access denied</h1>
          <p className="text-gray-600 mt-2">Staff access is required to manage media.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 [&_input]:border-gray-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-1">Upload and remove Cloudinary assets used across the catalog.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadMedia} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload images
              <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by file name or public id"
              className="w-full md:max-w-md rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-500"
            />
            <div className="text-sm text-gray-500">{media.length} asset{media.length === 1 ? "" : "s"}</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-teal-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : media.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              <ImagePlus className="mx-auto mb-3 w-8 h-8 text-gray-400" />
              No media assets found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
              {media.map((asset) => (
                <article key={asset.publicId} className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  <div className="aspect-square bg-gray-100">
                    <img src={asset.optimizedUrl || asset.url} alt={asset.originalFilename || asset.publicId} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="truncate font-semibold text-gray-900">{asset.originalFilename || asset.publicId}</h3>
                      <p className="truncate text-xs text-gray-500">{asset.publicId}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>{Math.round((asset.bytes || 0) / 1024)} KB</p>
                      <p>{asset.width || 0} x {asset.height || 0}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <a href={asset.optimizedUrl || asset.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-teal-700 hover:text-teal-900">Open</a>
                      <button onClick={() => handleDelete(asset.publicId)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}