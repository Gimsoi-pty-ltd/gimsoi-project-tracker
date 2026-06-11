import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, ShieldCheck, ArrowRight } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";

const SprintHealth = () => {
  const navigate = useNavigate();
  const { activeSprint } = useProjectStore((state) => state);
  

  const sprintHealth = activeSprint?.metrics?.sprintHealth || 0;
  
  
  const deliveryRisk = 100 - sprintHealth;
  
  
  const getRiskLevel = (risk) => {
    if (risk >= 55) return "High";
    if (risk >= 30) return "Medium";
    return "Low";
  };
  
  const deliveryRiskLevel = getRiskLevel(deliveryRisk);
  const sprintName = activeSprint?.name || "Current Sprint";
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    navigate("/sprint-health");
  };

  const riskColors = {
    High: "text-red-600 bg-red-100",
    Medium: "text-orange-600 bg-orange-100",
    Low: "text-green-500 bg-green-100",
  };

  return (
    <div
      onClick={handleNavigate}
      className="w-full min-h-[220px] bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-50">
            <ShieldCheck className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-wide">
              Sprint Health
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              Risk & delivery health
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
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">
            {sprintHealth}
          </p>
          <span className="text-sm sm:text-base text-gray-500 mb-1">
            / 100
          </span>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Delivery risk:{" "}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${riskColors[deliveryRiskLevel]}`}>
              {deliveryRiskLevel} ({deliveryRisk}%)
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[11px] sm:text-xs text-gray-400 max-w-[80%]">
          Overall sprint health for {sprintName}
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
              <h2 className="text-xl font-bold text-gray-900">Sprint Health</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">HOW METRICS ALIGN</p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-gray-700">
                  Sprint Health + Delivery Risk = 100%<br/>
                  Example: Health 45/100 → Risk 55% (High)
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">RISK THRESHOLDS</p>
                <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-700 space-y-1">
                  <div className="flex justify-between"><span>Low Risk</span><span>&lt; 30%</span></div>
                  <div className="flex justify-between"><span>Medium Risk</span><span>30–54%</span></div>
                  <div className="flex justify-between"><span>High Risk</span><span>55%+</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintHealth;