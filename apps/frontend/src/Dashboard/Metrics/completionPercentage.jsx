import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Info, ArrowRight, Percent } from "lucide-react";
import { useProjectStore } from "../../store/ProjectStore";

const CompletionPercentage = () => {
  const navigate = useNavigate();
  const { activeSprint } = useProjectStore((state) => state);
  const completedTasks = activeSprint?.metrics?.completedTasks || 0;
  const totalTasks = activeSprint?.metrics?.totalTasks || 0;
  const completionPercentage = activeSprint?.metrics?.completionPercentage || 0;
  const sprintName = activeSprint?.name || "Current Sprint";

  const [showInfo, setShowInfo] = useState(false);

  const getProgressColor = (percentage) => {
    if (percentage <= 40) return "bg-red-600";
    if (percentage <= 70) return "bg-orange-600";
    return "bg-green-500";
  };

  const handleNavigate = () => {
    navigate("/tasks/completion");
  };

  return (
    <>
      <div
        onClick={handleNavigate}
        className="w-full min-h-[220px] bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-50">
              <Percent className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-wide">
                Tasks Completed
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                Sprint progress
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

        <div className="mt-7">
          <div className="flex items-end gap-2 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">
              {completionPercentage}%
            </h2>
            <span className="text-sm sm:text-base text-gray-500 mb-1">
              complete
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div
              className={`${getProgressColor(completionPercentage)} h-1.5 rounded-full transition-all duration-500`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="mt-3">
            <p className="text-sm text-gray-600">
              {completedTasks} / {totalTasks} tasks done
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-[11px] sm:text-xs text-gray-400 max-w-[80%]">
            Completion rate for {sprintName}
          </p>
          <div className="flex items-center gap-1 text-sky-500 text-sm font-medium">
            View
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {showInfo &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowInfo(false)}
          >
            <div
              className="bg-white w-[90%] max-w-md rounded-2xl mt-10 p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tasks Completed %</h2>
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
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-sm text-gray-700">
                    Completion % = (Completed Tasks ÷ Total Tasks) × 100
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT MEANS</p>
                  <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                    Shows how much of the sprint workload has been finished. A higher
                    percentage means the team is on track; a low percentage late in the
                    sprint may indicate risk of incomplete delivery.
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">CURRENT STATUS</p>
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-sm text-gray-700">
                    {completedTasks} of {totalTasks} tasks completed.
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default CompletionPercentage;
