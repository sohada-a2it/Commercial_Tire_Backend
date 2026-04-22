"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import LeafletControlGeocoder from "leaflet-control-geocoder";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ form, setForm }) {
  const [position, setPosition] = useState(
    form.lat && form.lng ? [form.lat, form.lng] : [20, 0]
  );

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setForm({ ...form, lat: lat, lng: lng });
    },
  });

  return position ? <Marker position={position}></Marker> : null;
}

function SearchControl({ setForm, form }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (!map) return;

    const geocoder = new LeafletControlGeocoder({
      defaultMarkGeocode: true,
      position: "topleft",
      placeholder: "🔍 Search location or address...",
      errorMessage: "Location not found",
      suggestMinLength: 2,
      suggestTimeout: 250,
    });

    geocoder.on("markgeocode", function (e) {
      const center = e.geocode.center;
      const lat = center.lat;
      const lng = center.lng;

      console.log(`📍 Location found: ${e.geocode.name}`);
      console.log(`Coordinates: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);

      map.setView(center, 12);
      setForm({ ...form, lat: lat, lng: lng });
    });

    geocoder.addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map, form, setForm]);

  return null;
}

export default function MapPicker({ form, setForm }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }

  return (
    <MapContainer
      center={[form.lat || 20, form.lng || 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker form={form} setForm={setForm} />
      <SearchControl form={form} setForm={setForm} />
    </MapContainer>
  );
}