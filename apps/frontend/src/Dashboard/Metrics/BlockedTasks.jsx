import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Info, Lock, ArrowRight } from "lucide-react";
import { useProjectStore } from "../../store/ProjectStore";

const BlockedCard = () => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const { activeSprint } = useProjectStore((state) => state);
  const blockedPercentage = activeSprint?.metrics?.blockedPercentage || 0;
  const blockedCount = activeSprint?.tasks?.filter(t => t.status === 'blocked').length || 0;

  const percentageColor = blockedPercentage === 0 ? "text-green-500" : "text-red-600";

  const handleNavigate = () => {
    navigate("/tasks");
  };

  return (
    <>
      <div
        onClick={handleNavigate}
        className="w-full min-h-[220px] bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-50">
              <Lock className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-wide">
                Blocked Tasks
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                Blocked from progress
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
            <h2 className={`text-3xl sm:text-4xl font-bold leading-none ${percentageColor}`}>
              {blockedPercentage}%
            </h2>
            <span className="text-sm sm:text-base text-gray-500 mb-1">
              ({blockedCount} tasks)
            </span>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Tasks blocked from progress
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-[11px] sm:text-xs text-gray-400 max-w-[80%]">
            Total blocked tasks in the current project
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
              className="bg-white w-[90%] max-w-md rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Blocked Percentage
                </h2>
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
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-gray-700">
                    (Blocked Tasks ÷ Total Tasks) × 100
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT MEANS</p>
                  <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                    Shows the percentage of tasks currently blocked in the sprint.
                    High blocked percentages may indicate bottlenecks or unresolved
                    dependencies slowing project progress.
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">CURRENT STATUS</p>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-gray-700">
                    {blockedCount} blocked task(s) out of the current sprint tasks.
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

export default BlockedCard;
