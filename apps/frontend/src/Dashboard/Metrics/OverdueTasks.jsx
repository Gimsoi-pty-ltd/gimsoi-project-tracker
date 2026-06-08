import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, AlertCircle, ArrowRight } from "lucide-react";
import { useProjectStore } from "../../store/ProjectStore";

const OverdueCard = () => {
  const navigate = useNavigate();
  const { activeSprint } = useProjectStore((state) => state);
  const overduePercentage = activeSprint?.metrics?.overduePercentage || 0;
  const totalTasks = activeSprint?.metrics?.totalTasks || 0;
  const overdueCount = Math.round((overduePercentage / 100) * totalTasks);
  const sprintName = activeSprint?.name || "Current Sprint";

  const [showInfo, setShowInfo] = useState(false);

  // Determine color scheme based on overdue percentage
  const getColorScheme = () => {
    if (overduePercentage === 0) {
      return {
        bg: "bg-green-50",
        text: "text-green-500",
        border: "border-green-100",
        percentageText: "text-green-500",
        infoBg: "bg-green-50",
      };
    } else if (overduePercentage >= 1 && overduePercentage <= 30) {
      return {
        bg: "bg-orange-50",
        text: "text-orange-500",
        border: "border-orange-100",
        percentageText: "text-orange-500",
        infoBg: "bg-orange-50",
      };
    } else {
      return {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-100",
        percentageText: "text-red-600",
        infoBg: "bg-red-50",
      };
    }
  };

  const colorScheme = getColorScheme();

  const handleNavigate = () => {
    navigate("/tasks");
  };

  return (
    <div
      onClick={handleNavigate}
      className="w-full min-h-[220px] bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${colorScheme.bg}`}>
            <AlertCircle className={`w-5 h-5 ${colorScheme.text}`} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-wide">
              Overdue Tasks
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              Past due date
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
          <h2 className={`text-3xl sm:text-4xl font-bold ${colorScheme.percentageText} leading-none`}>
            {overduePercentage}%
          </h2>
          <span className="text-sm sm:text-base text-gray-500 mb-1">
            ({overdueCount} tasks)
          </span>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">Tasks past their due date</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[11px] sm:text-xs text-gray-400 max-w-[80%]">
          Overdue tasks in {sprintName}
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
              <h2 className="text-xl font-bold text-gray-900">Overdue Tasks</h2>
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
                <div className={`${colorScheme.infoBg} ${colorScheme.border} border rounded-xl p-3 text-sm text-gray-700`}>
                 Overdue % = (Overdue tasks ÷ Total tasks) × 100
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT MEANS</p>
                <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                  A high overdue percentage indicates tasks are consistently missing
                  deadlines, which may point to poor estimation, blockers, or resource
                  constraints.
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">CURRENT STATUS</p>
                <div className={`${colorScheme.infoBg} ${colorScheme.border} border rounded-xl p-3 text-sm text-gray-700`}>
                  {overdueCount} of {totalTasks} tasks are overdue 
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">STATUS INDICATOR</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-gray-600">Green: 0% (On Track)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-600">Orange: 1-30% (Warning)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Red: 31%+ (Critical)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverdueCard;