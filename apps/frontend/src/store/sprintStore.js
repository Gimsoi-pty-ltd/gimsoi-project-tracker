import { create } from "zustand";
import { resourceAPI } from "../api/api";

export const useSprintStore = create((set) => ({
    sprints: [],
    currentSprint: null,
    isLoading: false,
    error: null,

    getSprints: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.projectId) params.append('projectId', filters.projectId);
            if (filters.status) params.append('status', filters.status);
            const response = await resourceAPI.get(`/sprints${params.toString() ? `?${params.toString()}` : ''}`);
            set({ sprints: response.data.sprints || response.data.data || [], isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error fetching sprints', isLoading: false });
            throw error;
        }
    },

    createSprint: async (sprintData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.post("/sprints", sprintData);
            set((state) => ({
                sprints: [...state.sprints, response.data.sprint || response.data],
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error creating sprint", isLoading: false });
            throw error;
        }
    },

    updateSprintStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.patch(`/sprints/${id}/status`, { status });
            set((state) => ({
                sprints: state.sprints.map((sprint) => (sprint.id === id ? response.data.sprint || response.data : sprint)),
                currentSprint: response.data.sprint || response.data,
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error updating sprint status", isLoading: false });
            throw error;
        }
    },

    updateSprint: async (id, sprintData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.patch(`/sprints/${id}`, sprintData);
            set((state) => ({
                sprints: state.sprints.map((sprint) => (sprint.id === id ? response.data.sprint || response.data : sprint)),
                currentSprint: response.data.sprint || response.data,
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error updating sprint", isLoading: false });
            throw error;
        }
    },

    clearCurrentSprint: () => set({ currentSprint: null }),
    clearError: () => set({ error: null }),
}));
