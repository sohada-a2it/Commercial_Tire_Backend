"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic"; 
import {
  fetchDealers,
  saveDealer,
  deleteDealer,
  fetchDealer,
} from "@/services/dealerServices";

const MapPicker = dynamic(() => import("@/components/mapPicker/page"), {
  ssr: false,
});

export default function DealerDashboard() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    company: "",
    contactPerson: "",
    phone: "",
    email: "",
    website: "",

    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",

    lat: 23.8103,
    lng: 90.4125,

    tireBrands: "",
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
    const res = await fetchDealers();
    setDealers(res.dealers);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= EDIT ================= */
  const handleEdit = async (id) => {
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
      city: d.address?.city || "",
      state: d.address?.state || "",
      country: d.address?.country || "",
      postalCode: d.address?.postalCode || "",

      lat: d.location?.coordinates?.[1] || 23.8103,
      lng: d.location?.coordinates?.[0] || 90.4125,

      tireBrands: (d.tireBrands || []).join(","),
      serviceAreas: (d.serviceAreas || []).join(","),
      specialties: (d.specialties || []).join(","),

      facebook: d.socialMedia?.facebook || "",
      instagram: d.socialMedia?.instagram || "",
      linkedin: d.socialMedia?.linkedin || "",

      description: d.description || "", 
    });
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
      city: "",
      state: "",
      country: "",
      postalCode: "",

      lat: 23.8103,
      lng: 90.4125,

      tireBrands: "",
      serviceAreas: "",
      specialties: "",

      facebook: "",
      instagram: "",
      linkedin: "",

      description: "", 
    });
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      company: form.company,
      contactPerson: form.contactPerson,
      phone: form.phone,
      email: form.email,
      website: form.website,

      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
      },

      location: {
        type: "Point",
        coordinates: [Number(form.lng), Number(form.lat)],
      },

      tireBrands: form.tireBrands
        ? form.tireBrands.split(",").map((x) => x.trim())
        : [],

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
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm("Delete dealer?")) return;
    await deleteDealer(id);
    load();
  };

  /* ================= UI ================= */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">

      {/* ================= FORM ================= */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Update Dealer" : "Create Dealer"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input className="input" placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input className="input" placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <input className="input" placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>

          <input className="input" placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input className="input" placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input className="input" placeholder="Brands (comma)"
            value={form.tireBrands}
            onChange={(e) => setForm({ ...form, tireBrands: e.target.value })}
          /> 

          {/* MAP */}
          <div className="rounded overflow-hidden border">
            <MapPicker form={form} setForm={setForm} />
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            {editingId ? "Update Dealer" : "Create Dealer"}
          </button>

          {editingId && (
            <button type="button"
              onClick={resetForm}
              className="w-full bg-gray-200 py-2 rounded mt-2"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* ================= LIST ================= */}
      <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Dealer List</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {dealers.map((d) => (
              <div key={d._id}
                className="border p-3 rounded flex justify-between items-center">

                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-sm text-gray-500">
                    {d.company} - {d.address?.city}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-yellow-400 rounded"
                    onClick={() => handleEdit(d._id)}>
                    Edit
                  </button>

                  <button className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(d._id)}>
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}