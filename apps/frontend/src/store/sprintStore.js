import { create } from "zustand";
import { resourceAPI } from "../api/api";

export const useSprintStore = create((set) => ({
    sprints: [],
    currentSprint: null,
    isLoading: false,
    error: null,

    getSprints: async (filters = {}) => {
        set({ isLoading: true, error: null });
        setTimeout(() => {
            set({ 
                sprints: [
                    { id: 201, name: "Sprint 4", status: "active", currentPhase: 'Development', phaseProgress: 75, phaseStatus: 'On Track', startDate: new Date(Date.now() - 5*86400000).toISOString(), endDate: new Date(Date.now() + 9*86400000).toISOString(), completedPoints: 12, totalPoints: 40 },
                    { id: 202, name: "Sprint 3", status: "completed", currentPhase: 'Testing', phaseProgress: 100, phaseStatus: 'Completed', startDate: "2023-09-01", endDate: "2023-09-15", completedPoints: 38, totalPoints: 40 }
                ], 
                isLoading: false 
            });
        }, 500);
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
