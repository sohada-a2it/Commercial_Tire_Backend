"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ lat, lng, onLocationSelect }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return lat && lng ? <Marker position={[lat, lng]}></Marker> : null;
}

export default function MapPicker({ lat, lng, onLocationSelect }) {
  const [position, setPosition] = useState([lat || 23.8103, lng || 90.4125]);

  useEffect(() => {
    setPosition([lat || 23.8103, lng || 90.4125]);
  }, [lat, lng]);

  const handleLocationSelect = (newLat, newLng) => {
    setPosition([newLat, newLng]);
    if (onLocationSelect) {
      onLocationSelect(newLat, newLng);
    }
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker
        lat={position[0]}
        lng={position[1]}
        onLocationSelect={handleLocationSelect}
      />
    </MapContainer>
  );
}