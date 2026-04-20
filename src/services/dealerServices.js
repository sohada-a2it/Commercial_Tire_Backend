import { config } from "@/config/site";
import { auth } from "@/config/firebase";
import { getAuthorizedSession } from "@/lib/sessionAuth";

/* =========================
   AUTH HEADERS (same pattern)
========================= */
const buildAuthHeaders = async (isJson = true) => {
  const firebaseToken = await auth.currentUser?.getIdToken();
  const authorizedSessionToken = getAuthorizedSession()?.token;
  const token = firebaseToken || authorizedSessionToken;

  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* =========================
   RESPONSE HANDLER
========================= */
const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

/* =========================
   📍 FETCH ALL DEALERS
   (WITH FILTERS)
========================= */
/* =========================
   📍 FETCH DEALERS (WITH FILTERS)
========================= */
export const fetchDealers = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const headers = await buildAuthHeaders();

  const response = await fetch(
    `${config.email.backendUrl}/api/dealers${params.toString() ? `?${params.toString()}` : ""}`,
    {
      headers,
      cache: "no-store",
    }
  );

  const data = await parseResponse(response);

  return {
    success: true,
    dealers: data.data || [],
    count: data.count || 0,
  };
};

/* =========================
   📍 SINGLE DEALER
========================= */
export const fetchDealer = async (dealerId) => {
  if (!dealerId) throw new Error("Dealer ID is required");

  const headers = await buildAuthHeaders();

  const response = await fetch(
    `${config.email.backendUrl}/api/dealers/${dealerId}`,
    {
      headers,
      cache: "no-store",
    }
  );

  const data = await parseResponse(response);

  if (!data?.data) {
    throw new Error("Invalid dealer response");
  }

  return {
    success: true,
    dealer: data.data,
  };
};

/* =========================
   ➕ CREATE / UPDATE DEALER
========================= */
export const saveDealer = async (payload, dealerId) => {
  const headers = await buildAuthHeaders();

  const response = await fetch(
    `${config.email.backendUrl}/api/dealers${
      dealerId ? `/${dealerId}` : ""
    }`,
    {
      method: dealerId ? "PUT" : "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );

  const data = await parseResponse(response);

  return {
    success: true,
    dealer: data.data,
  };
};

/* =========================
   ❌ DELETE DEALER
========================= */
export const deleteDealer = async (dealerId) => {
  const headers = await buildAuthHeaders();

  const response = await fetch(
    `${config.email.backendUrl}/api/dealers/${dealerId}`,
    {
      method: "DELETE",
      headers,
    }
  );

  const data = await parseResponse(response);

  return {
    success: true,
    message: data.message,
  };
};

/* =========================
   🌍 NEARBY DEALERS (GEO)
========================= */
export const fetchNearbyDealers = async ({ lat, lng, distance = 50000 }) => {
  if (!lat || !lng) {
    throw new Error("Latitude and Longitude required");
  }

  const headers = await buildAuthHeaders();

  const response = await fetch(
    `${config.email.backendUrl}/api/dealers/near/search?lat=${lat}&lng=${lng}&distance=${distance}`,
    {
      headers,
      cache: "no-store",
    }
  );

  const data = await parseResponse(response);

  return {
    success: true,
    dealers: data.data || [],
    count: data.count || 0,
  };
};