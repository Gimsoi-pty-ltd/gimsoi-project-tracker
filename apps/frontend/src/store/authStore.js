import { create } from "zustand";
import axios, { resourceAPI } from "../api/api";

export const useAuthStore = create((set) => ({
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
            const response = await axios.post("/signup", { email, password, fullName });
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post("/login", { email, password });
            set({
                user: response.data.user,
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
            await axios.post("/logout");
            set({ user: null, isAuthenticated: false, isLoggingOut: false, error: null });
        } catch (error) {
            set({ error: "Error logging out", isLoggingOut: false });
            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const email = useAuthStore.getState().user?.email;
            const response = await axios.post("/verify-email", { code, email });
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
            throw error;
        }
    },

    resendVerificationCode: async (email) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await axios.post("/resend-verification", { email });
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
            const response = await axios.get("/check-auth");
            set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
        } catch (error) {
            set({ error: null, isCheckingAuth: false, isAuthenticated: false });
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post("/forgot-password", { email });
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
            const response = await axios.post(`/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error resetting password",
            });
            throw error;
        }
    },

    updateUserProfile: (profileUpdates) => {
        set((state) => ({
            user: {
                ...state.user,
                ...profileUpdates,
                initials: profileUpdates.fullName
                    ? profileUpdates.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                    : state.user?.initials,
            },
        }));
    },

    /** New method: persist profile updates to backend */
    updateProfile: async (profileUpdates) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.patch("/users/me", profileUpdates);
            const updatedUser = response.data.data; // Server response returns data
            set((state) => ({
                user: {
                    ...state.user,
                    ...updatedUser,
                },
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || "Error updating profile", isLoading: false });
            throw error;
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.patch("/users/me/password", { currentPassword, newPassword });
            set({ isLoading: false, message: response.data.message });
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
        const activities = response.data.data || [];
        // Update both the separate activities array and embed into user for UI consumption
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
            set((state) => ({
                userActivities: [response.data.data, ...(state.userActivities || [])]
            }));
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    },
}));
