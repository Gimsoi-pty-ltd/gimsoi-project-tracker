import React, { useEffect } from "react";
import { Info } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
import SprintDateFilter from "../../Dashboard/SprintDateFilter";
import LoadingSpinner from "../LoadingSpinner";
import ErrorAlert from "../ErrorAlert";

import TotalTasks from "../../Dashboard/Metrics/totalTasks";
import CompletionPercentage from "../../Dashboard/Metrics/completionPercentage";
import VelocityTrend from "../../Dashboard/Metrics/Velocity";
import SprintGoal from "../../Dashboard/Metrics/SprintGoal";
import SprintHealth from "../../Dashboard/Metrics/SprintHealth";

import OverdueTasks from "../../Dashboard/Metrics/OverdueTasks";
import BlockedTasks from "../../Dashboard/Metrics/BlockedTasks";
import DeliveryRisk from "../../Dashboard/Metrics/DeliveryRisk";

import BurnDownCard from "../../Dashboard/charts/BurnDownCard";
import TaskDistributionCard from "../../Dashboard/charts/TaskDistributionCard";
import PriorityHeatmap from "../../Dashboard/PriorityHeatmap";
import KanbanSummary from "../../Dashboard/KanbanSummary";
import ActiveTasks from "../../Dashboard/Metrics/ActiveTasks";

const DashboardCards = () => {
  const {
    activeSprint,
    projectSprints,
    currentProject,
    switchSprint,
    fetchDashboard,
    dashboardLoading,
    dashboardError,
    clearDashboardError,
  } = useProjectStore((state) => state);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSprintChange = (sprint) => {
    switchSprint(sprint.id);
  };

  if (dashboardLoading && !activeSprint) {
    return <LoadingSpinner size="md" message="Loading dashboard…" />;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-col gap-1">
          {currentProject?.name && (
            <p className="text-xs text-gray-500 font-medium">{currentProject.name}</p>
          )}
          <SprintDateFilter
            sprints={projectSprints}
            defaultSprintId={activeSprint?.id}
            onSprintChange={handleSprintChange}
          />
        </div>
        <button className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1">
          <Info size={12} />
          View Definitions & Logic
        </button>
      </div>

      {dashboardError && (
        <div className="px-4 sm:px-6 pt-4">
          <ErrorAlert message={dashboardError} onDismiss={clearDashboardError} />
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 max-w-[1920px] mx-auto w-full space-y-6 relative">
        {dashboardLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
            <LoadingSpinner size="sm" message="Updating sprint…" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <TotalTasks />
          <CompletionPercentage />
          <VelocityTrend />
          <SprintGoal />
          <SprintHealth />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OverdueTasks />
          <BlockedTasks />
          <DeliveryRisk />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-3">
            <BurnDownCard />
          </div>
          <div className="col-span-12  lg:col-span-3">
            <TaskDistributionCard />
          </div>
          <div className="col-span-12 sm:col-span-7 lg:col-span-4">
            <div className="min-h-[256px] overflow-hidden">
              <PriorityHeatmap sprintId={activeSprint?.id} />
            </div>
          </div>
          <div className="col-span-12 sm:col-span-5 lg:col-span-2">
            <KanbanSummary sprintId={activeSprint?.id} />
          </div>
        </div>

        <div>
          <ActiveTasks sprintId={activeSprint?.id} />
        </div>
      </main>
    </div>
  );
};

export default DashboardCards;
