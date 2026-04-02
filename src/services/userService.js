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

/**
 * Fetch all users from the backend
 */
export const getAllUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = `${config.email.backendUrl}/api/users${
      queryString ? `?${queryString}` : ""
    }`;
    console.log("Fetching users from:", url);
    const headers = await buildAuthHeaders();
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Received data:", data);
    return { success: true, users: data.users || data || [] };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { 
      success: false, 
      message: error.message || "Failed to connect to backend", 
      users: [] 
    };
  }
};

/**
 * Fetch a single user by Firebase UID
 */
export const getUserByUid = async (firebaseUid) => {
  try {
    const response = await fetch(
      `${config.email.backendUrl}/api/users/profile/${firebaseUid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await response.json();
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, message: error.message, user: null };
  }
};

/**
 * Update user profile
 */
export const updateUser = async (firebaseUid, userData) => {
  try {
    const headers = await buildAuthHeaders();
    const response = await fetch(
      `${config.email.backendUrl}/api/users/profile/${firebaseUid}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const data = await response.json();
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Delete user
 */
export const deleteUser = async (firebaseUid) => {
  try {
    const headers = await buildAuthHeaders();
    const response = await fetch(
      `${config.email.backendUrl}/api/users/customers/${firebaseUid}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: error.message };
  }
};

export const getAuthorizedPersons = async () => {
  try {
    const headers = await buildAuthHeaders();
    const response = await fetch(
      `${config.email.backendUrl}/api/users/authorized-persons`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch authorized persons");
    }

    return { success: true, users: data.users || [] };
  } catch (error) {
    return { success: false, message: error.message, users: [] };
  }
};

export const createAuthorizedPerson = async (payload) => {
  try {
    const headers = await buildAuthHeaders();
    const response = await fetch(
      `${config.email.backendUrl}/api/users/authorized-persons`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create authorized person");
    }

    return { success: true, user: data.user, message: data.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateAuthorizedPerson = async (firebaseUid, payload) => {
  try {
    const headers = await buildAuthHeaders();
    const response = await fetch(
      `${config.email.backendUrl}/api/users/authorized-persons/${firebaseUid}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update authorized person");
    }

    return { success: true, user: data.user, message: data.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteAuthorizedPerson = async (firebaseUid) => {
  try {
    const headers = await buildAuthHeaders();
    const response = await fetch(
      `${config.email.backendUrl}/api/users/authorized-persons/${firebaseUid}`,
      {
        method: "DELETE",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete authorized person");
    }

    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
