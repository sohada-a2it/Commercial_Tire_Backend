"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, Briefcase, Star, X } from "lucide-react";
import { fetchDealers } from "@/services/dealerServices";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Service options - will be displayed inline
const serviceOptions = [
  { value: "Emergency Call", label: "Emergency Call", icon: "🚨" },
  { value: "Road Service 247", label: "Road Service 24/7", icon: "🔄" },
  { value: "Road Service", label: "Road Service", icon: "🛠️" },
];

// Predefined countries with common options
const COMMON_COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Bahamas",
  "India",
  "Brazil",
  "Mexico",
  "Japan",
  "South Africa",
  "United Arab Emirates",
  "Singapore",
  "New Zealand",
];

// Marker icons based on services
const getMarkerIcon = (services, isAuthorized) => {
  let color = "red";
  if (isAuthorized) color = "gold";
  else if (services?.includes("Road Service 247")) color = "green";
  else if (services?.includes("Road Service")) color = "blue";
  else if (services?.includes("Emergency Call")) color = "orange";

  const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
  
  return new L.Icon({
    iconUrl: iconUrl,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Map controller component
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat && center?.lng && center.lat !== 0 && center.lng !== 0) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Dealer Card Component
function DealerCard({ dealer, isExpanded, onToggle, onLocate }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-3 cursor-pointer hover:bg-gray-50" onClick={onToggle}>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{dealer.name}</h3>
              {dealer.isAuthorized && (
                <span className="inline-flex items-center gap-0.5 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3" /> Auth
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{dealer.company}</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {dealer.address?.city}, {dealer.address?.country}
            </p>
            {dealer.services?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {dealer.services.slice(0, 2).map((service, idx) => (
                  <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                    {service.length > 15 ? service.slice(0, 12) + "..." : service}
                  </span>
                ))}
                {dealer.services.length > 2 && (
                  <span className="text-xs text-gray-400">+{dealer.services.length - 2}</span>
                )}
              </div>
            )}
          </div>
          <div className="text-gray-400 ml-2">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t px-3 py-2 bg-gray-50 text-xs">
          <div className="space-y-1.5">
            {dealer.address?.street && (
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">{dealer.address.street}, {dealer.address.area}</span>
              </p>
            )}
            {dealer.phone && (
              <p className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-gray-500" />
                <a href={`tel:${dealer.phone}`} className="text-blue-600 hover:underline">{dealer.phone}</a>
              </p>
            )}
            {dealer.email && (
              <p className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-gray-500" />
                <a href={`mailto:${dealer.email}`} className="text-blue-600 hover:underline truncate">{dealer.email}</a>
              </p>
            )}
            {dealer.website && (
              <p className="flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-gray-500" />
                <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                  Website
                </a>
              </p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onLocate(); }}
              className="mt-1.5 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
            >
              📍 Locate on Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DealerLocatorPage() {
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("USA"); // Default to USA
  const [countrySearch, setCountrySearch] = useState("United States");
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableCountries, setAvailableCountries] = useState(COMMON_COUNTRIES);
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // USA center
  const [mapZoom, setMapZoom] = useState(4);
  const [expandedDealerId, setExpandedDealerId] = useState(null);

  // Fetch all unique countries from API on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetchDealers({ limit: 1000 });
        const allDealers = res.dealers || [];
        const countries = new Set(COMMON_COUNTRIES);
        allDealers.forEach(dealer => {
          if (dealer.address?.country) countries.add(dealer.address.country);
        });
        setAvailableCountries(Array.from(countries).sort());
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };
    fetchCountries();
  }, []);

  // Search dealers by country
  const searchByCountry = useCallback(async () => {
    if (!selectedCountry) {
      setDealers([]);
      setFilteredDealers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchDealers({
        country: selectedCountry,
        limit: 200,
      });
      const fetchedDealers = res.dealers || [];
      setDealers(fetchedDealers);
      setFilteredDealers(fetchedDealers);

      // Update map bounds
      if (fetchedDealers.length > 0) {
        const dealersWithCoords = fetchedDealers.filter(d => {
          const lng = d.location?.coordinates?.[0];
          const lat = d.location?.coordinates?.[1];
          return lng && lat && !(lng === 0 && lat === 0);
        });

        if (dealersWithCoords.length > 0) {
          const bounds = L.latLngBounds([]);
          dealersWithCoords.forEach(dealer => {
            bounds.extend([dealer.location.coordinates[1], dealer.location.coordinates[0]]);
          });
          if (bounds.isValid()) {
            const center = bounds.getCenter();
            setMapCenter({ lat: center.lat, lng: center.lng });
            setMapZoom(dealersWithCoords.length === 1 ? 13 : 6);
          }
        }
      }
    } catch (err) {
      console.error("Error searching dealers:", err);
      setDealers([]);
      setFilteredDealers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry]);

  // Filter by services
  useEffect(() => {
    if (selectedServices.length === 0) {
      setFilteredDealers(dealers);
    } else {
      const filtered = dealers.filter(dealer =>
        dealer.services && selectedServices.some(service => dealer.services.includes(service))
      );
      setFilteredDealers(filtered);
    }
  }, [selectedServices, dealers]);

  // Initial load and when country changes
  useEffect(() => {
    searchByCountry();
  }, [searchByCountry]);

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    setCountrySearch(value);
    setSelectedServices([]);
    setExpandedDealerId(null);
  };

  const resetSearch = () => {
    setSelectedCountry("United States");
    setCountrySearch("United States");
    setSelectedServices([]);
    setExpandedDealerId(null);
    setMapCenter({ lat: 39.8283, lng: -98.5795 });
    setMapZoom(4);
  };

  const locateDealer = (dealer) => {
    if (dealer.location?.coordinates) {
      setMapCenter({
        lat: dealer.location.coordinates[1],
        lng: dealer.location.coordinates[0],
      });
      setMapZoom(15);
    }
  };

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📍</span>
            <h1 className="text-xl font-bold text-gray-800">Find a Dealer</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Country Select with Search */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search country..."
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={countrySearch}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    handleCountryChange(e.target.value);
                  }}
                  list="country-list"
                />
                <datalist id="country-list">
                  {availableCountries.map((country) => (
                    <option key={country} value={country} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Services - Inline checkboxes */}
            <div className="flex-[2]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Services</label>
              <div className="flex flex-wrap items-center gap-4 border border-gray-300 rounded-lg px-3 py-2 bg-white">
                {serviceOptions.map((service) => (
                  <label key={service.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.value)}
                      onChange={() => toggleService(service.value)}
                      className="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{service.label}</span>
                  </label>
                ))}
                {selectedServices.length > 0 && (
                  <button
                    onClick={() => setSelectedServices([])}
                    className="text-xs text-red-500 hover:text-red-600 ml-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetSearch}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition flex items-center gap-1 border"
              >
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Results count */}
          {selectedCountry && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                📍 {filteredDealers.length} dealer{filteredDealers.length !== 1 ? 's' : ''} in {selectedCountry}
              </span>
              {selectedServices.map(s => (
                <span key={s} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  🔧 {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Dealer List Sidebar */}
        {selectedCountry && (
          <div className="w-80 border-r bg-white overflow-y-auto flex-shrink-0">
            <div className="p-3">
              <h2 className="font-semibold text-gray-700 text-sm mb-2">
                Dealers {selectedServices.length > 0 && `(${filteredDealers.length})`}
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-xs text-gray-500">Loading...</p>
                </div>
              ) : filteredDealers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No dealers found
                </div>
              ) : (
                filteredDealers.map((dealer) => (
                  <DealerCard
                    key={dealer._id}
                    dealer={dealer}
                    isExpanded={expandedDealerId === dealer._id}
                    onToggle={() => setExpandedDealerId(expandedDealerId === dealer._id ? null : dealer._id)}
                    onLocate={() => locateDealer(dealer)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={mapZoom}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            <MapController center={mapCenter} zoom={mapZoom} />

            {selectedCountry && filteredDealers.map((dealer) => {
              const lng = dealer.location?.coordinates?.[0];
              const lat = dealer.location?.coordinates?.[1];
              if (!lng || !lat) return null;

              return (
                <Marker
                  key={dealer._id}
                  position={[lat, lng]}
                  icon={getMarkerIcon(dealer.services, dealer.isAuthorized)}
                  eventHandlers={{ click: () => setExpandedDealerId(dealer._id) }}
                >
                  <Popup>
                    <div className="text-sm min-w-[200px]">
                      <div className="font-bold text-blue-600">{dealer.name}</div>
                      <div className="text-gray-500 text-xs">{dealer.company}</div>
                      <div className="text-xs mt-1">{dealer.address?.city}, {dealer.address?.country}</div>
                      {dealer.phone && (
                        <div className="text-xs mt-1">📞 {dealer.phone}</div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Legend */}
          {selectedCountry && filteredDealers.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg shadow p-2 text-xs z-[1000] border">
              <div className="font-medium text-gray-700 mb-1">Legend</div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span>Regular</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div><span>Authorized</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span>24/7 Service</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span>Road Service</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}