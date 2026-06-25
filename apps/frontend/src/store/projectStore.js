import { create } from "zustand";
import { resourceAPI } from "../api/api";

const STATUS_UI = {
    TODO: "todo",
    IN_PROGRESS: "inProgress",
    DONE: "done",
    BLOCKED: "blocked",
    CANCELLED: "cancelled",
};

const PRIORITY_UI = {
    URGENT: "Critical",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
};

async function fetchAllProjectTasks(projectId) {
    const tasks = [];
    let cursor = null;
    do {
        const params = new URLSearchParams({ projectId, limit: "100" });
        if (cursor) params.append("cursor", cursor);
        const response = await resourceAPI.get(`/tasks?${params}`);
        tasks.push(...(response.data.data || []));
        cursor = response.data.nextCursor || null;
    } while (cursor);
    return tasks;
}

async function fetchSprintVelocity(sprintId) {
    const response = await resourceAPI.get(`/sprints/${sprintId}/velocity`);
    return response.data?.data?.velocity ?? 0;
}

function pickDefaultSprint(sprints) {
    if (!sprints.length) return null;
    return (
        sprints.find((s) => s.status === "ACTIVE") ||
        sprints.find((s) => s.status === "PLANNING") ||
        sprints[sprints.length - 1]
    );
}

function findPreviousSprint(sprints, currentSprint) {
    const sorted = [...sprints].sort(
        (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0)
    );
    const idx = sorted.findIndex((s) => s.id === currentSprint.id);
    return idx > 0 ? sorted[idx - 1] : null;
}

function computeSprintMetrics(sprintTasks) {
    const activeTasks = sprintTasks.filter((t) => t.status !== "CANCELLED");
    const total = activeTasks.length;
    const done = activeTasks.filter((t) => t.status === "DONE").length;
    const blocked = activeTasks.filter((t) => t.status === "BLOCKED" || t.isBlocked).length;
    const today = new Date();
    const overdue = activeTasks.filter(
        (t) =>
            t.dueDate &&
            new Date(t.dueDate) < today &&
            t.status !== "DONE" &&
            t.status !== "CANCELLED"
    ).length;
    const percentComplete = total ? Math.round((done / total) * 100) : 0;
    const penalty = overdue * 5 + blocked * 10;
    return {
        totalTasks: total,
        completedTasks: done,
        completionPercentage: percentComplete,
        overduePercentage: total ? Math.round((overdue / total) * 100) : 0,
        blockedPercentage: total ? Math.round((blocked / total) * 100) : 0,
        sprintHealth: Math.max(0, percentComplete - penalty),
    };
}

function buildKanbanCounts(sprintTasks) {
    const counts = { todo: 0, inProgress: 0, review: 0, done: 0, blocked: 0 };
    sprintTasks.forEach((t) => {
        if (t.status === "TODO") counts.todo += 1;
        else if (t.status === "IN_PROGRESS") counts.inProgress += 1;
        else if (t.status === "DONE") counts.done += 1;
        else if (t.status === "BLOCKED") counts.blocked += 1;
    });
    return counts;
}

function buildPriorityDistribution(sprintTasks) {
    const buckets = { urgent: 0, high: 0, medium: 0, low: 0 };
    sprintTasks.forEach((t) => {
        const key = (t.priority || "MEDIUM").toLowerCase();
        if (key in buckets) buckets[key] += 1;
    });
    return Object.entries(buckets).map(([label, value]) => ({ label, value }));
}

function buildPriorityHeatmap(sprintTasks) {
    const priorities = [
        { key: "critical", match: "URGENT", label: "Critical" },
        { key: "high", match: "HIGH", label: "High" },
        { key: "medium", match: "MEDIUM", label: "Medium" },
        { key: "low", match: "LOW", label: "Low" },
    ];
    const statusOrder = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"];
    return priorities.map(({ key, match, label }) => ({
        priority: key,
        priorityLabel: label,
        values: statusOrder.map((status) =>
            status === "REVIEW"
                ? 0
                : sprintTasks.filter((t) => t.priority === match && t.status === status).length
        ),
    }));
}

function mapTaskForDashboard(task) {
    return {
        id: task.id,
        title: task.title,
        status: STATUS_UI[task.status] || task.status,
        priority: PRIORITY_UI[task.priority] || task.priority,
        assignee: task.assignee?.fullName || "Unassigned",
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—",
        storyPoints: null,
        tag: task.labels?.[0]?.name || "—",
        tagColor: "bg-gray-100 text-gray-600",
    };
}

function buildActiveSprintView(sprint, projectTasks, velocity, avgVelocity) {
    const sprintTasks = projectTasks.filter((t) => t.sprintId === sprint.id);
    return {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status,
        metrics: {
            ...computeSprintMetrics(sprintTasks),
            velocity,
            avgVelocity,
            sprintGoal: null,
        },
        kanban: buildKanbanCounts(sprintTasks),
        tasks: sprintTasks
            .filter((t) => t.status !== "DONE" && t.status !== "CANCELLED")
            .map(mapTaskForDashboard),
    };
}

function buildDashboardCharts(sprintTasks) {
    return {
        heatmap: buildPriorityHeatmap(sprintTasks),
        distribution: buildPriorityDistribution(sprintTasks),
        burndown: [],
    };
}

const emptyDashboardData = {
    charts: {
        heatmap: [],
        distribution: [],
        burndown: [],
    },
};

const applySprintSelection = async (sprint, projectTasks, projectSprints) => {
    const velocity = await fetchSprintVelocity(sprint.id);
    const previous = findPreviousSprint(projectSprints, sprint);
    const avgVelocity = previous ? await fetchSprintVelocity(previous.id) : 0;
    const sprintTasks = projectTasks.filter((t) => t.sprintId === sprint.id);

    return {
        activeSprint: buildActiveSprintView(sprint, projectTasks, velocity, avgVelocity),
        dashboardData: buildDashboardCharts(sprintTasks),
    };
};

export const useProjectStore = create((set, get) => ({
    projects: [],
    currentProject: null,
    activeProject: null,
    projectProgress: null,
    isLoading: false,
    error: null,

    activeSprint: null,
    projectSprints: [],
    projectTasks: [],
    dashboardData: emptyDashboardData,
    dashboardLoading: false,
    dashboardError: null,

    fetchDashboard: async (projectId) => {
        set({ dashboardLoading: true, dashboardError: null });
        try {
            let pid = projectId || get().currentProject?.id;
            if (!pid) {
                if (!get().projects.length) {
                    await get().fetchProjects({ limit: 50 });
                }
                pid = get().projects[0]?.id;
            }
            if (!pid) {
                set({
                    dashboardLoading: false,
                    dashboardError: "No projects found",
                    activeSprint: null,
                    projectSprints: [],
                    projectTasks: [],
                    dashboardData: emptyDashboardData,
                });
                return;
            }

            const project = get().projects.find((p) => p.id === pid);
            if (project) {
                set({ currentProject: project, activeProject: project });
            } else if (get().currentProject?.id !== pid) {
                await get().getProjectById(pid);
            }

            const [sprintsRes, projectTasks] = await Promise.all([
                resourceAPI.get(`/sprints?projectId=${pid}&limit=100`),
                fetchAllProjectTasks(pid),
            ]);

            const projectSprints = sprintsRes.data.data || [];
            const defaultSprint = pickDefaultSprint(projectSprints);

            if (!defaultSprint) {
                set({
                    currentProject: get().currentProject || { id: pid },
                    activeProject: get().currentProject || { id: pid },
                    projectSprints,
                    projectTasks,
                    activeSprint: null,
                    dashboardData: emptyDashboardData,
                    dashboardLoading: false,
                });
                return;
            }

            const { activeSprint, dashboardData } = await applySprintSelection(
                defaultSprint,
                projectTasks,
                projectSprints
            );

            set({
                projectSprints,
                projectTasks,
                activeSprint,
                dashboardData,
                dashboardLoading: false,
            });
        } catch (error) {
            set({
                dashboardError: error.response?.data?.message || "Error loading dashboard",
                dashboardLoading: false,
            });
            throw error;
        }
    },

    switchSprint: async (sprintId) => {
        const { projectSprints, projectTasks } = get();
        const sprint = projectSprints.find((s) => s.id === sprintId);
        if (!sprint) return;

        set({ dashboardLoading: true });
        try {
            const { activeSprint, dashboardData } = await applySprintSelection(
                sprint,
                projectTasks,
                projectSprints
            );
            set({ activeSprint, dashboardData, dashboardLoading: false });
        } catch (error) {
            set({
                dashboardError: error.response?.data?.message || "Error switching sprint",
                dashboardLoading: false,
            });
        }
    },

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
            const project = response.data.project || response.data;
            set({ currentProject: project, activeProject: project, isLoading: false });
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
            const project = response.data.project || response.data;
            set((state) => ({
                projects: state.projects.map((existingProject) => (existingProject.id === id ? project : existingProject)),
                currentProject: project,
                activeProject: project,
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

    setCurrentProject: (project) => set({ currentProject: project, activeProject: project }),

    switchProject: async (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (project) {
            set({ currentProject: project, activeProject: project });
        }
        await get().fetchDashboard(projectId);
    },

    clearCurrentProject: () => set({ currentProject: null, activeProject: null }),
    clearError: () => set({ error: null }),
    clearDashboardError: () => set({ dashboardError: null }),
}));
