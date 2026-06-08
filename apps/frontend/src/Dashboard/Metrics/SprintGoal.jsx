import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Flag, ArrowRight } from "lucide-react";
import { useProjectStore } from "../../store/ProjectStore";

const SprintGoal = () => {
  const navigate = useNavigate();
  const { activeSprint } = useProjectStore((state) => state);
  const sprintGoal = activeSprint?.metrics?.sprintGoal || 0;
  const completedTasks = activeSprint?.metrics?.completedTasks || 0;
  const totalTasks = activeSprint?.metrics?.totalTasks || 0;
  const sprintName = activeSprint?.name || "Current Sprint";

  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    navigate("/sprint-goal");
  };

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const getProgressTextColor = (percentage) => {
  if (percentage <= 40) return "text-red-600";
  if (percentage <= 70) return "text-orange-500";
  return "text-green-500";
};

  return (
    <div
      onClick={handleNavigate}
      className="w-full min-h-[220px] bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-50">
            <Flag className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-wide">
              Sprint Goal
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              Story points planned
            </p>
          </div>
        </div>

        <Info
          className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowInfo(true);
          }}
        />
      </div>

      <div className="mt-5">
        <div className="flex items-end gap-2 flex-wrap">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">
            {sprintGoal}
          </h2>
          <span className="text-sm sm:text-base text-gray-500 mb-1">
            story points
          </span>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Completion:{" "}
            <span className={`font-semibold ${getProgressTextColor(completionPercentage)}`}>
  {completedTasks} / {totalTasks} tasks ({completionPercentage}%)
</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[11px] sm:text-xs text-gray-400 max-w-[80%]">
          Planned story points for {sprintName}
        </p>
        <div className="flex items-center gap-1 text-sky-500 text-sm font-medium">
          View
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {showInfo && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setShowInfo(false);
          }}
        >
          <div
            className="bg-white w-[90%] max-w-md rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Sprint Goal</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">CALCULATION</p>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-sm text-gray-700">
                  Sprint Goal: Sprint Goal = sprint goal (from sprints table) 
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT MEANS</p>
                <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                  The sprint goal reflects the total story points planned for this sprint.
                  Tracking completion against it shows whether the team is on pace to deliver.
                </div>
              </div>

              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintGoal;
