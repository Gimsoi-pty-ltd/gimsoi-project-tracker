import { create } from "zustand";
import { resourceAPI } from "../api/api";

export const useProjectStore = create((set) => ({
    projects: [],
    currentProject: null,
    projectProgress: null,
    isLoading: false,
    error: null,

    getProjects: async (filters = {}) => {
        set({ isLoading: true, error: null });
        setTimeout(() => {
            set({ 
                projects: [
                    { id: 1, name: "Website Redesign", status: "active", progress: 45 },
                    { id: 2, name: "Mobile App MVP", status: "active", progress: 80 },
                    { id: 3, name: "Database Migration", status: "planning", progress: 10 },
                    { id: 4, name: "Marketing Campaign", status: "completed", progress: 100 }
                ], 
                isLoading: false 
            });
        }, 500);
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

    clearCurrentProject: () => set({ currentProject: null }),
    clearError: () => set({ error: null }),
}));
