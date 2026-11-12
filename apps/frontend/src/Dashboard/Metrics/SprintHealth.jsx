import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, ShieldCheck, ArrowRight, X, TrendingUp } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";

const SprintHealth = () => {
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();
  const { activeSprint } = useProjectStore();

  const sprintHealth = activeSprint?.metrics?.sprintHealth || 0;
  const deliveryRisk = 100 - sprintHealth;
  const sprintName = activeSprint?.name || "Current Sprint";

  const getRiskLevel = (risk) => {
    if (risk >= 55) return "High";
    if (risk >= 30) return "Medium";
    return "Low";
  };

  const deliveryRiskLevel = getRiskLevel(deliveryRisk);

  const riskStyles = {
    High: { badge: "bg-red-100 text-red-700", bar: "bg-red-500", dot: "bg-red-500" },
    Medium: { badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500", dot: "bg-amber-500" },
    Low: { badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  };

  const style = riskStyles[deliveryRiskLevel];

  return (
    <>
      <div
        onClick={() => navigate("/sprint-health")}
        className="w-full min-h-[220px] bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-wide">Sprint Health</h3>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">Risk & delivery health</p>
            </div>
          </div>
          <Info
            className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
            onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
          />
        </div>

        {/* Big Number + Badge */}
        <div className="mt-5">
          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">{deliveryRisk}%</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${style.badge}`}>
              {deliveryRiskLevel} Risk
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{sprintName} • Delivery risk</p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${deliveryRisk}%` }} />
          </div>

          {/* Legend - FIXED SPACING */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low &lt; 30%
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium 30-54%
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-red-500" /> High 55%+
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-gray-400">Health: {sprintHealth}%</span>
          <span className="flex items-center gap-1 font-medium text-sky-600">View details <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>

      {/* Info Popup */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm">Sprint Health</h4>
              <X className="w-4 h-4 cursor-pointer" onClick={() => setShowInfo(false)} />
            </div>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Delivery risk is 100 minus sprint health. Higher risk means more chance of missing sprint goals. Low is under 30%, Medium is 30-54%, High is 55% and above.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SprintHealth;