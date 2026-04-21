"use client";
import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { fetchDealers } from "@/services/dealerServices";

/* Fix Leaflet icon issue */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icons
const dealerMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map view
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function DealerLocatorPage() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableCountries, setAvailableCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
  const [mapZoom, setMapZoom] = useState(2);

  /* =========================
     FETCH ALL DEALERS INITIALLY (BUT DON'T SHOW ON MAP)
  ========================= */
  const fetchAllCountries = useCallback(async () => {
    try {
      // Fetch all dealers just to get unique countries
      const res = await fetchDealers({ limit: 1000 });
      const allDealers = res.dealers || [];
      
      // Extract unique countries
      const countries = new Set();
      allDealers.forEach(dealer => {
        if (dealer.address?.country) {
          countries.add(dealer.address.country);
        }
      });
      
      setAvailableCountries(Array.from(countries).sort());
    } catch (err) {
      console.error("Error fetching countries:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllCountries();
  }, [fetchAllCountries]);

  /* =========================
     SEARCH DEALERS BY COUNTRY ONLY
  ========================= */
  const searchByCountry = useCallback(async () => {
    if (!selectedCountry) {
      setDealers([]);
      setTotalCount(0);
      setMapCenter({ lat: 20, lng: 0 });
      setMapZoom(2);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch dealers filtered by country
      const res = await fetchDealers({ 
        country: selectedCountry,
        limit: 100 
      });
      
      const filteredDealers = res.dealers || [];
      setDealers(filteredDealers);
      setTotalCount(res.count || 0);
      
      // If there are dealers, adjust map to show the country
      if (filteredDealers.length > 0) {
        // Get the first dealer's coordinates to center the map
        const firstDealer = filteredDealers[0];
        if (firstDealer.location?.coordinates) {
          setMapCenter({
            lat: firstDealer.location.coordinates[1],
            lng: firstDealer.location.coordinates[0],
          });
          setMapZoom(6); // Zoom to country level
        }
      } else {
        // If no dealers found, show world map
        setMapCenter({ lat: 20, lng: 0 });
        setMapZoom(2);
      }
      
    } catch (err) {
      console.error("Error searching dealers:", err);
      setDealers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry]);

  // Search when country changes
  useEffect(() => {
    searchByCountry();
  }, [searchByCountry]);

  /* =========================
     RESET SEARCH
  ========================= */
  const resetSearch = () => {
    setSelectedCountry("");
    setDealers([]);
    setTotalCount(0);
    setMapCenter({ lat: 20, lng: 0 });
    setMapZoom(2);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* ================= HEADER ================= */}
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">📍 Global Dealer Locator</h1>

          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Country
              </label>
              <select
                className="w-full border px-3 py-2 rounded-lg"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">-- Select a Country --</option>
                {availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={searchByCountry}
                disabled={!selectedCountry}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                🔍 Search Dealers
              </button>
              
              <button
                onClick={resetSearch}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </div>
          
          {selectedCountry && (
            <div className="mt-3 text-sm text-gray-600">
              Found {totalCount} dealer{totalCount !== 1 ? 's' : ''} in {selectedCountry}
            </div>
          )}
          
          {!selectedCountry && (
            <div className="mt-3 text-sm text-gray-500">
              Select a country to find tire dealers
            </div>
          )}
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: DEALER LIST - Only shows when country is selected */}
        {selectedCountry && (
          <div className="w-full md:w-96 border-r overflow-y-auto bg-gray-50">
            <div className="p-3">
              <h2 className="font-semibold mb-3 sticky top-0 bg-gray-50 py-2">
                Dealers in {selectedCountry} ({dealers.length})
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading dealers...</p>
                </div>
              ) : dealers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No dealers found in {selectedCountry}
                </div>
              ) : (
                <div className="space-y-3">
                  {dealers.map((d) => (
                    <div
                      key={d._id}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                      onClick={() => {
                        if (d.location?.coordinates) {
                          setMapCenter({
                            lat: d.location.coordinates[1],
                            lng: d.location.coordinates[0],
                          });
                          setMapZoom(15);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{d.name}</h3>
                          <p className="text-sm text-gray-600">{d.company}</p>
                          
                          {d.isAuthorized && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                              ✓ Authorized Dealer
                            </span>
                          )}
                          
                          <div className="mt-2 text-sm text-gray-500 space-y-1">
                            <p className="flex items-center gap-1">
                              📍 {d.address?.street && `${d.address.street}, `}
                              {d.address?.city}, {d.address?.country}
                            </p>
                            {d.phone && <p>📞 {d.phone}</p>}
                            {d.email && <p>✉️ {d.email}</p>}
                          </div>

                          {d.tireBrands && d.tireBrands.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {d.tireBrands.slice(0, 3).map((b, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                  >
                                    {b}
                                  </span>
                                ))}
                                {d.tireBrands.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{d.tireBrands.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RIGHT: WORLD MAP */}
        <div className={`flex-1 relative ${!selectedCountry ? 'w-full' : ''}`}>
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={mapZoom}
            className="h-full w-full"
            style={{ background: "#e8f4f8" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* DEALER MARKERS - Only show when country is selected */}
            {selectedCountry && dealers.map((d) => {
              // Check if dealer has valid coordinates
              const lng = d.location?.coordinates?.[0];
              const lat = d.location?.coordinates?.[1];
              
              if (!lat || !lng) return null;
              
              return (
                <Marker
                  key={d._id}
                  position={[lat, lng]}
                  icon={dealerMarkerIcon}
                >
                  <Popup>
                    <div className="text-sm min-w-[200px]">
                      <div className="font-bold text-base mb-1">{d.name}</div>
                      <div className="text-gray-600 mb-1">{d.company}</div>
                      <div className="text-gray-500 text-xs mb-2">
                        {d.address?.street && `${d.address.street}, `}
                        {d.address?.city}, {d.address?.country}
                      </div>
                      {d.phone && (
                        <div className="text-xs mb-1">
                          📞 <a href={`tel:${d.phone}`} className="text-blue-600">{d.phone}</a>
                        </div>
                      )}
                      {d.email && (
                        <div className="text-xs mb-1">
                          ✉️ <a href={`mailto:${d.email}`} className="text-blue-600">{d.email}</a>
                        </div>
                      )}
                      {d.tireBrands && d.tireBrands.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold mb-1">Brands:</div>
                          <div className="flex flex-wrap gap-1">
                            {d.tireBrands.slice(0, 3).map((brand, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 px-2 py-0.5 rounded">
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {d.workingHours?.monday && (
                        <div className="mt-2 text-xs text-gray-500">
                          🕒 {d.workingHours.monday}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          
          {/* Map Legend */}
          {selectedCountry && dealers.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs z-[1000]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <span>Dealer Locations ({dealers.length})</span>
              </div>
            </div>
          )}

          {/* Instructions Overlay */}
          {!selectedCountry && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
              <div className="bg-white bg-opacity-90 rounded-lg shadow-xl p-6 text-center max-w-md pointer-events-auto">
                <div className="text-5xl mb-3">🌍</div>
                <h3 className="text-xl font-bold mb-2">Welcome to Global Dealer Locator</h3>
                <p className="text-gray-600 mb-4">
                  Select a country from the dropdown above to find tire dealers in that region.
                </p>
                <div className="text-sm text-gray-500">
                  Available in {availableCountries.length} countries worldwide
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}