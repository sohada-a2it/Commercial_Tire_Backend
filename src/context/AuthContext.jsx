"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "@/config/firebase";
import { config } from "@/config/site";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch user profile from MongoDB
  const fetchUserProfile = async (firebaseUid) => {
    try {
      const response = await fetch(
        `${config.email.backendUrl}/api/users/profile/${firebaseUid}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        return data.user;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Register user in MongoDB
  const registerUserInDB = async (userData) => {
    try {
      const response = await fetch(
        `${config.email.backendUrl}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Error registering user:", error);
      return { success: false, message: "Failed to register user" };
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update Firebase profile with display name
      if (userData.fullName) {
        await updateProfile(userCredential.user, {
          displayName: userData.fullName,
        });
      }

      // Register in MongoDB
      const dbResult = await registerUserInDB({
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email,
        fullName: userData.fullName,
        companyName: userData.companyName,
        whatsappNumber: userData.whatsappNumber,
        country: userData.country,
        provider: "email",
      });

      return { success: true, user: userCredential.user, dbUser: dbResult.user };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, message: error.message };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // Fetch profile from MongoDB
      await fetchUserProfile(userCredential.user.uid);

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, message: error.message };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Register/update in MongoDB
      await registerUserInDB({
        firebaseUid: user.uid,
        email: user.email,
        fullName: user.displayName || user.email.split("@")[0],
        photoURL: user.photoURL,
        provider: "google",
      });

      return { success: true, user };
    } catch (error) {
      console.error("Google sign in error:", error);
      return { success: false, message: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: error.message };
    }
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    if (!user) return { success: false, message: "Not authenticated" };

    try {
      const response = await fetch(
        `${config.email.backendUrl}/api/users/profile/${user.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      if (data.success) {
        setUserProfile(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, message: "Failed to update profile" };
    }
  };

  // Open/close auth modal
  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    authModalOpen,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
    openAuthModal,
    closeAuthModal,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
