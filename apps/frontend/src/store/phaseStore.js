import { create } from "zustand";
import { resourceAPI } from "../api/api";


const normalizeList = (response) => {
    const data = response?.data?.data;
    return Array.isArray(data) ? data : [];
};
const normalizeOne = (response) => response?.data?.data ?? response?.data ?? null;

export const usePhaseStore = create((set, get) => ({
    phases: [],
    currentPhase: null,
    milestoneStatus: null,
    isLoading: false,
    error: null,

    fetchPhases: async (projectId) => {
        if (!projectId) {
            set({ phases: [] });
            return [];
        }
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.get(`/phases?projectId=${projectId}&limit=100`);
            const phases = normalizeList(response);
            set({ phases, isLoading: false });
            return phases;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching phases", isLoading: false });
            throw error;
        }
    },

    getPhaseById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.get(`/phases/${id}`);
            const phase = normalizeOne(response);
            set({ currentPhase: phase, isLoading: false });
            return phase;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching phase", isLoading: false });
            throw error;
        }
    },

    getMilestoneStatus: async (id) => {
        try {
            const response = await resourceAPI.get(`/phases/${id}/milestone`);
            const status = normalizeOne(response);
            set({ milestoneStatus: status });
            return status;
        } catch (error) {
            console.error("Failed to fetch milestone status:", error);
            return null;
        }
    },

    createPhase: async (phaseData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.post("/phases", phaseData);
            const phase = normalizeOne(response);
            set((state) => ({ phases: [...state.phases, phase], isLoading: false }));
            return phase;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error creating phase", isLoading: false });
            throw error;
        }
    },

    updatePhase: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const phase = get().phases.find((p) => p.id === id);
            const response = await resourceAPI.patch(`/phases/${id}`, {
                ...data,
                version: data.version ?? phase?.version,
            });
            const updated = normalizeOne(response);
            set((state) => ({
                phases: state.phases.map((p) => (p.id === id ? updated : p)),
                currentPhase: state.currentPhase?.id === id ? updated : state.currentPhase,
                isLoading: false,
            }));
            return updated;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error updating phase", isLoading: false });
            throw error;
        }
    },

    deletePhase: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await resourceAPI.delete(`/phases/${id}`);
            set((state) => ({
                phases: state.phases.filter((p) => p.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || "Error deleting phase", isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));