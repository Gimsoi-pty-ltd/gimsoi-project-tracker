import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, TrendingUp, ArrowRight } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";

const VelocityCard = () => {
  const navigate = useNavigate();
  const { activeSprint } = useProjectStore((state) => state);
  const [showInfo, setShowInfo] = useState(false);

  const velocity = activeSprint?.metrics?.velocity || 0;
  const avgVelocity = activeSprint?.metrics?.avgVelocity || 0;
  const sprintName = activeSprint?.name || "current sprint";

  const growth =
    avgVelocity > 0
      ? (((velocity - avgVelocity) / avgVelocity) * 100).toFixed(1)
      : 0;

  return (
    <div
      onClick={() => navigate("/velocity-details")}
      className="
        w-full min-h-[220px] bg-white border border-gray-200 rounded-2xl
        p-4 sm:p-5 lg:p-6 shadow-sm cursor-pointer transition-all duration-300
        hover:shadow-xl  flex flex-col justify-between
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-wide">
              Velocity Trend
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              Sprint performance
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

      {/* Velocity value */}
      <div className="mt-5">
        <div className="flex items-end gap-2 flex-wrap">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">
            {velocity}
          </h2>
          <span className="text-sm sm:text-base text-gray-500 mb-1">
            tasks done
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              growth >= 0
                ? "bg-green-100 text-green-500"
                : "bg-red-100 text-red-600"
            }`}
          >
            {growth >= 0 ? "+" : ""}{growth}%
          </span>
          <p className="text-xs text-gray-500">vs previous sprint average</p>
        </div>

      
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-[11px] sm:text-xs text-gray-400 max-w-[80%]">
          Completed tasks in {sprintName}
        </p>
        <div className="flex items-center gap-1 text-sky-500 text-sm font-medium">
          View
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Info modal */}
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
              <h2 className="text-xl font-bold text-gray-900">Velocity Trend</h2>
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
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-gray-700">
                   Velocity Trend = Current Velocity − Previous Velocity
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT MEANS</p>
                <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                  Velocity measures the total story points completed this sprint.
                  Comparing it to the previous sprint average shows whether the
                  team is speeding up or slowing down.
                </div>
              </div>

              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VelocityCard;
