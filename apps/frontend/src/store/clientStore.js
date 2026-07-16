import { create } from "zustand";
import { resourceAPI } from "../api/api";

export const useClientStore = create((set) => ({
    clients: [],
    currentClient: null,
    isLoading: false,
    error: null,

    getClients: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams(filters).toString();
            const url = params ? `/clients?${params}` : "/clients";
            const response = await resourceAPI.get(url);
            const raw = response.data.clients ?? response.data;
            set({ clients: Array.isArray(raw) ? raw : [], isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching clients", isLoading: false });
            throw error;
        }
    },

    getClientById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.get(`/clients/${id}`);
            set({ currentClient: response.data.client || response.data, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching client", isLoading: false });
            throw error;
        }
    },

    createClient: async (clientData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.post("/clients", clientData);
            set((state) => ({
                clients: [...state(Array.isArray(state.clients) ? state.clients : []), response.data.client || response.data],
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error creating client", isLoading: false });
            throw error;
        }
    },

    clearCurrentClient: () => set({ currentClient: null }),
    clearError: () => set({ error: null }),
}));
