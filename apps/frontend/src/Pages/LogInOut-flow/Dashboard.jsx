// src/Pages/LogInOut-flow/Dashboard.jsx
import { useEffect } from "react";
import DashboardCards from "../../Components/Dashboard/DashboardCards";
import { useProjectStore } from "../../store/projectStore";
import { useSprintStore } from "../../store/sprintStore";
import { useTaskStore } from "../../store/taskStore";

const Dashboard = () => {
  const { fetchProjects, currentProject } = useProjectStore();
  const { getSprints } = useSprintStore();
  const { getTasks } = useTaskStore();


  useEffect(() => {
    fetchProjects();
    getTasks();
  }, []);

  useEffect(() => {
    if (currentProject?.id) getSprints({ projectId: currentProject.id });
  }, [currentProject?.id]);

  return <DashboardCards />;
};

export default Dashboard;