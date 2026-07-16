import { create } from "zustand";
// Explicitly import both instances to avoid base URL confusion
import { authAPI, resourceAPI } from "../api/api"; // Adjust path if your file is named API.js

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    isLoggingOut: false,
    message: null,
    userActivities: [],

    signup: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        try {
            // Explicitly use authAPI for auth routes
            const response = await authAPI.post("/signup", { email, password, fullName });
            set({ user: response.data.user || response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.post("/login", { email, password });
            set({
                user: response.data.user || response.data,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoggingOut: true, error: null });
        try {
            await authAPI.post("/logout");
            set({ user: null, isAuthenticated: false, isLoggingOut: false, error: null, message: null });
        } catch (error) {
            set({ error: "Error logging out", isLoggingOut: false });
            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const email = get().user?.email; // Use get() for cleaner state access
            const response = await authAPI.post("/verify-email", { code, email });
            set({ user: response.data.user || response.data, isAuthenticated: true, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
            throw error;
        }
    },

    resendVerificationCode: async (email) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await authAPI.post("/resend-verification", { email });
            set({ message: response.data.message, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error resending verification code", isLoading: false });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await authAPI.get("/check-auth");
            set({ user: response.data.user || response.data, isAuthenticated: true, isCheckingAuth: false });
        } catch (error) {
            set({ error: null, isCheckingAuth: false, isAuthenticated: false, user: null });
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.post("/forgot-password", { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error sending reset password email",
            });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.post(`/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error resetting password",
            });
            throw error;
        }
    },

    // ✅ NEW: Fetch fresh profile data from backend (useful after page reload or external changes)
    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.get("/users/me"); // Adjust path if your backend uses /profile
            const userData = response.data.user || response.data.data || response.data;
            set({ user: userData, isAuthenticated: true, isLoading: false, error: null });
            return userData;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching profile", isLoading: false });
            throw error;
        }
    },

    // ✅ UPDATED: Persist profile updates to backend AND keep local state perfectly fresh
    updateProfile: async (profileUpdates) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await resourceAPI.patch("/users/me", profileUpdates); // Adjust path if needed
            
            // Safely extract the updated user object regardless of backend wrapper (data.user, data.data, or just data)
            const updatedUser = response.data.user || response.data.data || response.data;
            
            set((state) => ({
                user: {
                    ...state.user,
                    ...updatedUser,
                    // Auto-generate initials if fullName was updated
                    initials: updatedUser.fullName
                        ? updatedUser.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
                        : state.user?.initials,
                },
                isLoading: false,
                message: "Profile updated successfully",
            }));
            return updatedUser;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error updating profile", 
                isLoading: false 
            });
            throw error;
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await resourceAPI.patch("/users/me/password", { currentPassword, newPassword });
            set({ isLoading: false, message: response.data.message || "Password changed successfully" });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error changing password", isLoading: false });
            throw error;
        }
    },

    fetchActivities: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.get("/activity");
            const activities = response.data.data || response.data || [];
            set((state) => ({
                userActivities: activities,
                user: { ...state.user, activityLog: activities },
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching activities", isLoading: false });
        }
    },

    addActivityLog: async (action, entityId = null, entityType = null) => {
        try {
            const response = await resourceAPI.post("/activity", { action, entityId, entityType });
            const newActivity = response.data.data || response.data;
            set((state) => ({
                userActivities: [newActivity, ...(state.userActivities || [])]
            }));
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    },
}));