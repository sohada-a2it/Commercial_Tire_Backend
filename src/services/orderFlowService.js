import { config } from "@/config/site";
import { auth } from "@/config/firebase";
import { getAuthorizedSession } from "@/lib/sessionAuth";

const buildAuthHeaders = async () => {
  const firebaseToken = await auth.currentUser?.getIdToken();
  const authorizedSessionToken = getAuthorizedSession()?.token;
  const token = firebaseToken || authorizedSessionToken;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const apiRequest = async (path, options = {}) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
};

export const placeOrderInquiry = async (payload) => {
  return apiRequest("/api/inquiries/place-order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getMyInquiries = async () => {
  return apiRequest("/api/inquiries/my", { method: "GET" });
};

export const getAllInquiries = async () => {
  return apiRequest("/api/inquiries", { method: "GET" });
};

export const updateInquiryStatus = async (inquiryId, payload) => {
  return apiRequest(`/api/inquiries/${inquiryId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteInquiry = async (inquiryId) => {
  return apiRequest(`/api/inquiries/${inquiryId}`, {
    method: "DELETE",
  });
};

export const createInvoice = async (payload) => {
  return apiRequest("/api/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getMyInvoices = async () => {
  return apiRequest("/api/invoices/my", { method: "GET" });
};

export const getAllInvoices = async () => {
  return apiRequest("/api/invoices", { method: "GET" });
};

export const downloadInvoicePdf = async (invoiceId) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/invoices/${invoiceId}/pdf`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch (_error) {
      // Ignore JSON parsing error for non-JSON response bodies.
    }
    throw new Error(message);
  }

  return response.blob();
};
