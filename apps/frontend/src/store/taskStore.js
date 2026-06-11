import { create } from "zustand";
import { resourceAPI } from "../api/api";

export const useTaskStore = create((set, get) => ({
    tasks: [],
    currentTask: null,
    isLoading: false,
    error: null,
    lastFetched: 0,
    lastRateLimit: 0, // epoch ms of last 429 response

    getTasks: async (filters = {}, retryCount = 0) => {
        const now = Date.now();
        const state = get();
        // Skip if recently rate limited
        if (state.lastRateLimit && now - state.lastRateLimit < 60000) {
            console.warn('Skipping getTasks due to recent rate limit');
            set({ error: 'Too many requests. Please try again later.', isLoading: false });
            return { tasks: [] };
        }
        // Recently fetched within 5 minutes, reuse cached tasks
        if (state.tasks && state.tasks.length > 0 && state.lastFetched && now - state.lastFetched < 300000) {
          return { tasks: state.tasks };
        }
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.projectId) params.append('projectId', filters.projectId);
            if (filters.sprintId) params.append('sprintId', filters.sprintId);
            if (filters.status) params.append('status', filters.status);
            if (filters.overdue) params.append('overdue', filters.overdue);
            const response = await resourceAPI.get(`/tasks${params.toString() ? `?${params.toString()}` : ''}`);
            const now2 = Date.now();
            set({ tasks: response.data.tasks || response.data.data || [], isLoading: false, lastFetched: now2 });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                // Record rate limit timestamp
                set({ lastRateLimit: now });
            }
            // Handle rate limiting gracefully without retry loops
            const friendlyMsg = error.response && error.response.status === 429
                ? 'Too many requests. Please try again later.'
                : error.response?.data?.message || 'Error fetching tasks';
            console.error('getTasks failed:', error);
            set({ error: friendlyMsg, isLoading: false });
            return { tasks: [] }; // Return empty list without throwing
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
