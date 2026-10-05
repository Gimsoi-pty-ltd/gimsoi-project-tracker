import { create } from "zustand";
import { resourceAPI } from "../api/api";


const normalizeList = (response) => {
    const data = response?.data?.data;
    return Array.isArray(data) ? data : [];
};

export const useDashboardStore = create((set, get) => ({
    users: [],
    clients: [],
    projects: [],
    activities: [],
    isLoading: false,
    error: null,
    lastFetchedAt: null,

    fetchOverview: async () => {
        set({ isLoading: true, error: null });
        try {
            const [usersRes, clientsRes, projectsRes, activitiesRes] = await Promise.all([
                resourceAPI.get("/users?limit=100"),
                resourceAPI.get("/clients?limit=100"),
                resourceAPI.get("/projects?limit=100"),
                resourceAPI.get("/activity").catch(() => ({ data: { data: [] } })),
            ]);

            set({
                users: normalizeList(usersRes),
                clients: normalizeList(clientsRes),
                projects: normalizeList(projectsRes),
                activities: normalizeList(activitiesRes),
                isLoading: false,
                lastFetchedAt: new Date().toISOString(),
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to load overview data",
                isLoading: false,
            });
        }
    },
    
    getCounts: () => {
        const { users, clients, projects } = get();
        const now = new Date();

        const isThisMonth = (dateStr) => {
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        };

        return {
            usersTotal: users.length,
            usersVerified: users.filter((u) => u.isVerified).length,
            usersUnverified: users.filter((u) => !u.isVerified).length,

            clientsTotal: clients.length,
            clientsNewThisMonth: clients.filter((c) => isThisMonth(c.createdAt)).length,

            projectsTotal: projects.length,
            projectsActive: projects.filter((p) => p.status === "ACTIVE").length,
            projectsArchived: projects.filter((p) => p.status === "ARCHIVED").length,
        };
    },

    clearError: () => set({ error: null }),
}));