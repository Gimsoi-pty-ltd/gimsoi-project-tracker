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
            const raw = response.data?.data ?? response.data;
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
            set({ currentClient: response.data?.data ?? response.data, isLoading: false });
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
            const created = response.data?.data ?? response.data;
            set((state) => ({
                clients: [...(Array.isArray(state.clients) ? state.clients : []), created],
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error creating client", isLoading: false });
            throw error;
        }
    },

    updateClient: async (id, clientData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.patch(`/clients/${id}`, clientData);
            const updated = response.data?.data ?? response.data;
            set((state) => ({
                clients: state.clients.map((c) => (c.id === id ? updated : c)),
                currentClient: state.currentClient?.id === id ? updated : state.currentClient,
                isLoading: false,
            }));
            return updated;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error updating client", isLoading: false });
            throw error;
        }
    },

    deleteClient: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await resourceAPI.delete(`/clients/${id}`);
            set((state) => ({
                clients: state.clients.filter((c) => c.id !== id),
                currentClient: state.currentClient?.id === id ? null : state.currentClient,
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || "Error deleting client", isLoading: false });
            throw error;
        }
    },

    clearCurrentClient: () => set({ currentClient: null }),
    clearError: () => set({ error: null }),
}));
