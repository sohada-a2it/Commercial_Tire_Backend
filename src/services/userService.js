import { config } from "@/config/site";

/**
 * Fetch all users from the backend
 */
export const getAllUsers = async () => {
  try {
    const url = `${config.email.backendUrl}/api/users`;
    console.log("Fetching users from:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
    const response = await fetch(
      `${config.email.backendUrl}/api/users/profile/${firebaseUid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
    const response = await fetch(
      `${config.email.backendUrl}/api/users/${firebaseUid}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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
