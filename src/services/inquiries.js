import { config } from "@/config/site";

const BACKEND_URL = config.email.backendUrl;

// সব inquiries পাওয়া (general + product)
export const getAllInquiries = async (filters = {}) => {
  try {
    const { type, status, page, limit, search } = filters;
    let url = `${BACKEND_URL}/api/inquiries`;
    const params = new URLSearchParams();
    
    if (type && type !== 'all') params.append('type', type);
    if (status && status !== 'all') params.append('status', status);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to fetch inquiries");
  }
};

// একক inquiry দেখা
export const getInquiryById = async (id) => {
  try {
    const url = `${BACKEND_URL}/api/inquiries/${id}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to fetch inquiry");
  }
};

// ইনকোয়ারি ডিলিট
export const deleteInquiry = async (id) => {
  try {
    const url = `${BACKEND_URL}/api/inquiries/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to delete inquiry");
  }
};

// স্ট্যাটাস আপডেট
export const updateInquiryStatus = async (id, status, adminNotes = '') => {
  try {
    const url = `${BACKEND_URL}/api/inquiries/${id}/status`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status, adminNotes }),
    });
    
    if (!response.ok) throw new Error('Failed to update');
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to update status");
  }
};

// বাল্ক ডিলিট
export const bulkDeleteInquiries = async (ids) => {
  try {
    const url = `${BACKEND_URL}/api/inquiries/bulk-delete`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ ids }),
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to delete inquiries");
  }
};

// পরিসংখ্যান
export const getInquiryStats = async () => {
  try {
    const url = `${BACKEND_URL}/api/inquiries/stats/summary`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to fetch stats");
  }
};