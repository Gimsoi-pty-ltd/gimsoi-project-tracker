import { create } from "zustand";
import { resourceAPI } from "../api/api";

export const useProjectStore = create((set) => ({
    projects: [],
    currentProject: null,
    projectProgress: null,
    isLoading: false,
    error: null,

    fetchProjects: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.page) params.append("page", filters.page);
            if (filters.limit) params.append("limit", filters.limit);
            if (filters.status) params.append("status", filters.status);
            
            const response = await resourceAPI.get(`/projects${params.toString() ? `?${params.toString()}` : ""}`);
            const projectsData = response.data.projects || response.data.data || [];
            set({ projects: projectsData, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching projects", isLoading: false });
            throw error;
        }
    },

    getProjects: async (filters = {}) => {
        // Alias for fetchProjects for backward compatibility
        return useProjectStore.getState().fetchProjects(filters);
    },

    getProjectById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.get(`/projects/${id}`);
            set({ currentProject: response.data.project || response.data, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching project", isLoading: false });
            throw error;
        }
    },

    createProject: async (projectData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.post("/projects", projectData);
            set((state) => ({
                projects: [...state.projects, response.data.project || response.data],
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error creating project", isLoading: false });
            throw error;
        }
    },

    updateProject: async (id, projectData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.patch(`/projects/${id}`, projectData);
            set((state) => ({
                projects: state.projects.map((project) => (project.id === id ? response.data.project || response.data : project)),
                currentProject: response.data.project || response.data,
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error updating project", isLoading: false });
            throw error;
        }
    },

    getProjectProgress: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.get(`/projects/${id}/progress`);
            set({ projectProgress: response.data, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching project progress", isLoading: false });
            throw error;
        }
    },

    deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await resourceAPI.delete(`/projects/${id}`);
            set((state) => ({
                projects: state.projects.filter((project) => project.id !== id),
                currentProject: state.currentProject?.id === id ? null : state.currentProject,
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error deleting project", isLoading: false });
            throw error;
        }
    },

    setCurrentProject: (project) => set({ currentProject: project }),

    clearCurrentProject: () => set({ currentProject: null }),
    clearError: () => set({ error: null }),
}));
