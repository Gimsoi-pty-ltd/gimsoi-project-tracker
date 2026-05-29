import { create } from "zustand";
import { resourceAPI } from "../api/api";

export const useTaskStore = create((set) => ({
    tasks: [],
    currentTask: null,
    isLoading: false,
    error: null,

    getTasks: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.projectId) params.append("projectId", filters.projectId);
            if (filters.status) params.append("status", filters.status);
            if (filters.isBlocked !== undefined) params.append("isBlocked", String(filters.isBlocked));
            if (filters.isOverdue !== undefined) params.append("isOverdue", String(filters.isOverdue));
            if (filters.limit) params.append("limit", String(filters.limit));
            if (filters.cursor) params.append("cursor", filters.cursor);

            const response = await resourceAPI.get(`/tasks${params.toString() ? `?${params.toString()}` : ""}`);
            const tasksData = response.data.data || [];
            set({ tasks: tasksData, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching tasks", isLoading: false });
            throw error;
        }
    },

    getTaskById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.get(`/tasks/${id}`);
            set({ currentTask: response.data.task || response.data, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching task", isLoading: false });
            throw error;
        }
    },

    createTask: async (taskData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.post("/tasks", taskData);
            set((state) => ({
                tasks: [...state.tasks, response.data.task || response.data],
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error creating task", isLoading: false });
            throw error;
        }
    },

    updateTask: async (id, taskData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.patch(`/tasks/${id}`, taskData);
            set((state) => ({
                tasks: state.tasks.map((task) => (task.id === id ? response.data.task || response.data : task)),
                currentTask: response.data.task || response.data,
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error updating task", isLoading: false });
            throw error;
        }
    },

    deleteTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.delete(`/tasks/${id}`);
            set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== id),
                currentTask: null,
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error deleting task", isLoading: false });
            throw error;
        }
    },

    getTaskSummary: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.get(`/tasks/projects/${projectId}/summary`);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching task summary", isLoading: false });
            throw error;
        }
    },

    clearCurrentTask: () => set({ currentTask: null }),
    clearError: () => set({ error: null }),
}));
