"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import {
  fetchDealers,
  saveDealer,
  deleteDealer,
  fetchDealer,
} from "@/services/dealerServices";
import { CITY_COORDINATES } from "@/lib/cityCoordinates";

const MapPicker = dynamic(() => import("@/components/mapPicker/page"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function DealerDashboard() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Center at (0,0) for full world view
  const defaultLat = 20;
  const defaultLng = 0;

  // Service options
  const serviceOptions = [
    "Emergency Call",
    "Road Service 247",
    "Road Service"
  ];

  const [form, setForm] = useState({
    name: "",
    company: "",
    contactPerson: "",
    phone: "",
    email: "",
    website: "",

    street: "",
    area: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",

    lat: defaultLat,
    lng: defaultLng,

    tireBrands: "",
    services: [],
    serviceAreas: "",
    specialties: "",

    facebook: "",
    instagram: "",
    linkedin: "",

    description: "",
  });

  /* ================= LOAD ================= */
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchDealers();
      setDealers(res.dealers);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= EDIT ================= */
  const handleEdit = async (id) => {
    try {
      const res = await fetchDealer(id);
      const d = res.dealer;

      setEditingId(id);

      setForm({
        name: d.name || "",
        company: d.company || "",
        contactPerson: d.contactPerson || "",
        phone: d.phone || "",
        email: d.email || "",
        website: d.website || "",

        street: d.address?.street || "",
        area: d.address?.area || "",
        city: d.address?.city || "",
        state: d.address?.state || "",
        country: d.address?.country || "",
        postalCode: d.address?.postalCode || "",

        lat: d.location?.coordinates?.[1] ?? defaultLat,
        lng: d.location?.coordinates?.[0] ?? defaultLng,

        tireBrands: (d.tireBrands || []).join(", "),
        services: d.services || [],
        serviceAreas: (d.serviceAreas || []).join(", "),
        specialties: (d.specialties || []).join(", "),

        facebook: d.socialMedia?.facebook || "",
        instagram: d.socialMedia?.instagram || "",
        linkedin: d.socialMedia?.linkedin || "",

        description: d.description || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      company: "",
      contactPerson: "",
      phone: "",
      email: "",
      website: "",

      street: "",
      area: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",

      lat: defaultLat,
      lng: defaultLng,

      tireBrands: "",
      services: [],
      serviceAreas: "",
      specialties: "",

      facebook: "",
      instagram: "",
      linkedin: "",

      description: "",
    });
  };

  /* ================= HANDLE SERVICE SELECTION ================= */
  const handleServiceToggle = (service) => {
    setForm(prev => {
      if (prev.services.includes(service)) {
        return { ...prev, services: prev.services.filter(s => s !== service) };
      } else {
        return { ...prev, services: [...prev.services, service] };
      }
    });
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: form.name,
        company: form.company,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        website: form.website,

        address: {
          street: form.street,
          area: form.area,
          city: form.city,
          state: form.state,
          country: form.country,
          postalCode: form.postalCode,
          fullAddress: `${form.street}, ${form.area}, ${form.city}`,
        },

        lat: Number(form.lat),
        lng: Number(form.lng),

        tireBrands: form.tireBrands
          ? form.tireBrands.split(",").map((x) => x.trim())
          : [],

        services: form.services,

        serviceAreas: form.serviceAreas
          ? form.serviceAreas.split(",").map((x) => x.trim())
          : [],

        specialties: form.specialties
          ? form.specialties.split(",").map((x) => x.trim())
          : [],

        socialMedia: {
          facebook: form.facebook,
          instagram: form.instagram,
          linkedin: form.linkedin,
        },

        description: form.description,
      };

      await saveDealer(payload, editingId);
      resetForm();
      load();
      alert(editingId ? "Dealer updated successfully!" : "Dealer created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm("Delete dealer?")) return;

    try {
      await deleteDealer(id);
      load();
      alert("Dealer deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete dealer");
    }
  };

  /* ================= UI ================= */
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* FORM */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-3">
            {editingId ? "Update Dealer" : "Create Dealer"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* NAME */}
            <div>
              <label className="block text-xs font-medium mb-1">Name</label>
              <input
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* COMPANY */}
            <div>
              <label className="block text-xs font-medium mb-1">Company</label>
              <input
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>

            {/* AREA */}
            <div>
              <label className="block text-xs font-medium mb-1">Area</label>
              <input
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
            </div>

            {/* CITY + COUNTRY */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">City</label>
                <input
                  className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Country</label>
                <input
                  className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-xs font-medium mb-1">Phone</label>
              <input
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* WEBSITE */}
            <div>
              <label className="block text-xs font-medium mb-1">Website</label>
              <input
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            {/* SERVICES - DROPDOWN WITH CHECKBOXES */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Services (Select multiple)
              </label>
              <div className="border rounded divide-y">
                {serviceOptions.map((service, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
              {form.services.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {form.services.join(", ")}
                </p>
              )}
            </div>

            {/* TIRE BRANDS */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Tire Brands (comma separated)
              </label>
              <input
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.tireBrands}
                onChange={(e) => setForm({ ...form, tireBrands: e.target.value })}
                placeholder="Michelin, Bridgestone, Goodyear"
              />
            </div>

            {/* WORLD MAP WITH SEARCH */}
            <div>
              <label className="block text-xs font-medium mb-2">
                📍 Location (3 Ways to Set Coordinates)
              </label>

              {/* QUICK SELECT COMMON CITIES */}
              <div className="mb-2">
                <label className="block text-xs text-gray-600 mb-1">Quick Select City</label>
                <select
                  className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  defaultValue=""
                  onChange={(e) => {
                    const city = e.target.value;
                    if (city) {
                      const coords = CITY_COORDINATES[city];
                      if (coords) {
                        setForm({ ...form, lat: coords.lat, lng: coords.lng });
                      }
                    }
                  }}
                >
                  <option value="">-- Select a City --</option>
                  {Object.keys(CITY_COORDINATES).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* MANUAL LAT/LNG INPUT */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 20.5937"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 78.9629"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* INSTRUCTIONS */}
              <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2 text-xs text-gray-700">
                <strong>How to set location:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li><strong>Method 1:</strong> Select from quick-select cities above</li>
                  <li><strong>Method 2:</strong> Search address using the map search box (top-left 🔍)</li>
                  <li><strong>Method 3:</strong> Click directly on the map to mark location</li>
                  <li><strong>Method 4:</strong> Paste or enter latitude & longitude manually</li>
                </ul>
              </div>

              <div className="rounded overflow-hidden border h-80 mb-2">
                <MapPicker form={form} setForm={setForm} />
              </div>

              {/* SELECTED COORDINATES DISPLAY */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded p-2">
                <p className="text-xs font-semibold text-gray-700">
                  ✅ Selected Coordinates:
                </p>
                <p className="text-sm font-mono text-green-700 mt-1">
                  Latitude: {form.lat.toFixed(4)}° N | Longitude: {form.lng.toFixed(4)}° E
                </p>
              </div>
            </div>

            {/* SUBMIT */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-sm font-medium transition">
              {editingId ? "Update Dealer" : "Create Dealer"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full bg-gray-200 hover:bg-gray-300 py-1.5 rounded text-sm font-medium transition"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-3">Dealer List</h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {dealers.map((d) => (
                <div key={d._id}
                  className="border p-3 rounded-lg flex justify-between items-center hover:shadow-md transition">

                  <div className="flex-1">
                    <p className="font-semibold text-sm">{d.name}</p>
                    <p className="text-xs text-gray-500">
                      {d.company} - {d.address?.area}, {d.address?.city}
                    </p>
                    {d.services && d.services.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        🛠️ {d.services.join(", ")}
                      </p>
                    )}
                    {d.phone && (
                      <p className="text-xs text-gray-400 mt-1">📞 {d.phone}</p>
                    )}
                    {d.location && (
                      <p className="text-xs text-gray-400 mt-1">
                        📍 {d.location.coordinates[1].toFixed(4)}°, {d.location.coordinates[0].toFixed(4)}°
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-xs font-medium transition"
                      onClick={() => handleEdit(d._id)}
                    >
                      Edit
                    </button>

                    <button
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition"
                      onClick={() => handleDelete(d._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {dealers.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">
                  No dealers found. Create your first dealer!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}