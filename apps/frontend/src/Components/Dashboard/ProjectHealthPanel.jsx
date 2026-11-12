import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
// import { Info } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
import AIProjectInsights from "./AIProjectInsights";
import HealthMetrics from "./HealthMetrics";
export default function ProjectHealthPanel() {
  const { user } = useAuthStore();

  console.log("Logged-in user:", user);

  console.log("User role:", user?.role);

  const userRole = user?.role?.toLowerCase().replace(/_/g, " ");
  const isProjectManager = userRole === "project manager";

  const currentProject = useProjectStore((state) => state.currentProject);
  const ensureDashboardLoaded = useProjectStore(
    (state) => state.ensureDashboardLoaded
  );
  const getProjectProgress = useProjectStore(
    (state) => state.getProjectProgress
  );

  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  console.log("Current project:", currentProject);
  console.log("Current project ID:", currentProject?.id);

  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch project health data from backend

  // Fetch project health data from backend
  const fetchHealthData = useCallback(async () => {
    if (!isProjectManager) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Load projects if they haven't been loaded yet
      if (useProjectStore.getState().projects.length === 0) {
        await fetchProjects({ limit: 50 });
      }

      // Get the latest store data
      const projectStore = useProjectStore.getState();

      let project = projectStore.currentProject;

      // If no project is selected, choose the default project
      if (!project?.id) {
        const projects = projectStore.projects;

        project =
          projects.find((p) => p.status === "ACTIVE") ||
          projects.find((p) => p.status === "DRAFT") ||
          projects[0] ||
          null;
      }

      if (!project?.id) {
        throw new Error(
          "No project is available. Please check your project access."
        );
      }

      // Save the selected project in Zustand
      setCurrentProject(project);

      console.log("Selected project:", project);
      console.log("Selected project ID:", project.id);

      // Fetch project progress
      const progress = await getProjectProgress(project.id);

      console.log("Received project health data:", progress);

      setHealthData(progress);
    } catch (err) {
      console.error("Error fetching project health:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load project health. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [isProjectManager, fetchProjects, setCurrentProject, getProjectProgress]);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // if (!isProjectManager) {
  //   return null;
  // }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sm:p-5 min-w-0">
      {/* Panel header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-blue-50 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">Project Health</h2>

          <p className="text-sm text-gray-500">
            Overview of your project's health
          </p>
        </div>

        <div className="flex items-center justify-end gap-1 ml-auto">
          {/* <Info size={16} className="text-blue-500" /> */}
          <button
            type="button"
            onClick={fetchHealthData}
            disabled={loading}
            aria-label="Refresh project health"
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-16 bg-gray-100 rounded-lg" />
          <div className="h-5 bg-gray-200 rounded w-2/3" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <p className="font-medium">Unable to load project health.</p>
          </div>
          <button
            onClick={fetchHealthData}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>

          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* Boitumelo - Project Health Metrics */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800">
              Health Metrics
            </h3>

            {/* health score, performance metrics and risk reasons */}

           <HealthMetrics /> 
          </section>

          {/* AI Insights and Recommendations */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800">
              AI Insights & Recommendations
            </h3>

            <AIProjectInsights />
          </section>
        </div>
      )}
    </div>
  );
}
