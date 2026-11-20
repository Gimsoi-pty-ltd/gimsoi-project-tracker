import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProjectStore } from "../store/projectStore";
import Toaster from "../Components/Common/Toaster";

export default function ProjectHealthToast() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);

  const userRole = user?.role?.toLowerCase().replace(/_/g, " ");
  const isProjectManager = userRole === "project manager" || userRole === "pm";

  const isProjectsPage =
    location.pathname === "/projects" ||
    location.pathname.startsWith("/projects/");

  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const getProjectProgress = useProjectStore(
    (state) => state.getProjectProgress
  );
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  const [toast, setToast] = useState(null);
  const [projectId, setProjectId] = useState(null);

  const dismissedRef = useRef(false);

  const fetchHealthData = useCallback(async () => {
    if (!isProjectManager) return;

    dismissedRef.current = false;

    setToast({
      type: "info",
      title: "Project Health",
      message: "Your project health information is loading."
    });

    try {
      // Load projects if they are not already available.
      if (useProjectStore.getState().projects.length === 0) {
        await fetchProjects({ limit: 50 });
      }

      const projectStore = useProjectStore.getState();

      let project = projectStore.currentProject;

      // Select a project if none is currently selected.
      if (!project?.id) {
        const projects = projectStore.projects;

        project =
          projects.find((p) => p.status === "ACTIVE") ||
          projects.find((p) => p.status === "DRAFT") ||
          projects[0] ||
          null;
      }

      if (!project?.id) {
        throw new Error("No project is available.");
      }

      setCurrentProject(project);
      setProjectId(project.id);

      // Fetch the project's progress information.
      await getProjectProgress(project.id);

      if (!dismissedRef.current) {
        setToast({
          type: "success",
          title: "Project Health Loaded",
          message: "Your project health information is available."
        });
      }
    } catch (err) {
      console.error("Error fetching project health:", err);

      if (!dismissedRef.current) {
        setToast({
          type: "error",
          title: "Project Health Error",
          message:
            err.response?.data?.message ||
            err.message ||
            "Unable to load project health. Please try again."
        });
      }
    }
  }, [isProjectManager, fetchProjects, getProjectProgress, setCurrentProject]);

  // Fetch project health when the component loads.
  useEffect(() => {
    if (isProjectManager) {
      fetchHealthData();
    }
  }, [isProjectManager, fetchHealthData]);

  // Automatically dismiss the notification after 5 seconds.
  useEffect(() => {
    if (!toast || isProjectsPage) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast, isProjectsPage]);

  // Hide the notification for non-managers and Projects pages.
  if (!isProjectManager || !toast || isProjectsPage) {
    return null;
  }

  const navigateToProjectHealth = () => {
    setToast(null);

    navigate("/projects", {
      state: { scrollToProjectHealth: true }
    });
  };

  return (
    <Toaster
      type={toast.type}
      title={toast.title}
      message={toast.message}
      onView={navigateToProjectHealth}
      onDismiss={() => {
        dismissedRef.current = true;
        setToast(null);
      }}
    />
  );
}
