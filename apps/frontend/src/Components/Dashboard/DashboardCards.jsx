// src/Components/Dashboard/DashboardCards.jsx
// Dashboard home page — uses DashboardRedesign cards.
// Replaces the old card set; rendered at "/" inside DashboardLayout.

import React from "react";
import { Info } from "lucide-react";
import { useProjectStore } from "../../store/ProjectStore";
import SprintDateFilter from "../../Dashboard/SprintDateFilter";

// Metrics row
import TotalTasks          from "../../Dashboard/Metrics/totalTasks";
import CompletionPercentage from "../../Dashboard/Metrics/completionPercentage";
import VelocityTrend       from "../../Dashboard/Metrics/Velocity";
import SprintGoal          from "../../Dashboard/Metrics/SprintGoal";
import SprintHealth        from "../../Dashboard/Metrics/SprintHealth";

// Risk row
import OverdueTasks  from "../../Dashboard/Metrics/OverdueTasks";
import BlockedTasks  from "../../Dashboard/Metrics/BlockedTasks";
import DeliveryRisk  from "../../Dashboard/Metrics/DeliveryRisk";

// Charts & visuals
import BurnDownCard         from "../../Dashboard/charts/BurnDownCard";
import TaskDistributionCard from "../../Dashboard/charts/TaskDistributionCard";
import PriorityHeatmap      from "../../Dashboard/PriorityHeatmap";
import KanbanSummary        from "../../Dashboard/KanbanSummary";
import ActiveTasks          from "../../Dashboard/Metrics/ActiveTasks";

const DashboardCards = () => {
  const { activeSprint, projectSprints, switchSprint } = useProjectStore((state) => state);

  const handleSprintChange = (sprint) => {
    switchSprint(sprint.id);
  };

  return (
    <div className="flex flex-col flex-1">

      {/* Sprint / date filter bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <SprintDateFilter
          sprints={projectSprints}
          defaultSprintId={activeSprint?.id}
          onSprintChange={handleSprintChange}
        />
        <button className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1">
          <Info size={12} />
          View Definitions & Logic
        </button>
      </div>

      {/* Dashboard content */}
      <main className="flex-1 p-4 sm:p-6 max-w-[1920px] mx-auto w-full space-y-6">

        {/* ROW 1 — Key metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
         <TotalTasks />
          <CompletionPercentage />
          <VelocityTrend /> 
          <SprintGoal />
          <SprintHealth />
        </div>

        {/* ROW 2 — Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OverdueTasks />
          <BlockedTasks />
          <DeliveryRisk />
        </div>

        {/* ROW 3 — Charts */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <BurnDownCard />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <TaskDistributionCard />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-4">
            <div className="min-h-[256px] overflow-hidden">
              <PriorityHeatmap sprintId={activeSprint?.id} />
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <KanbanSummary sprintId={activeSprint?.id} />
          </div>
        </div>

        {/* ROW 4 — Active tasks */}
        <div>
          <ActiveTasks sprintId={activeSprint?.id} />
        </div>

      </main>
    </div>
  );
};

export default DashboardCards;
