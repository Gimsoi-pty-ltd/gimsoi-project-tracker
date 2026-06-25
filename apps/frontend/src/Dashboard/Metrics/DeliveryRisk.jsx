import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, AlertTriangle, ArrowRight } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";

const riskColors = {
  High: { dot: "bg-red-500", text: "text-red-500", badge: "bg-red-100 text-red-600", icon: "text-red-500", bg: "bg-red-50" },
  Medium: { dot: "bg-orange-500", text: "text-orange-500", badge: "bg-orange-100 text-orange-600", icon: "text-orange-500", bg: "bg-orange-50" },
  Low: { dot: "bg-green-500", text: "text-green-500", badge: "bg-green-100 text-green-600", icon: "text-green-500", bg: "bg-green-50" },
};

const getRiskLevel = (risk) => {
  if (risk >= 55) return "High";
  if (risk >= 30) return "Medium";
  return "Low";
};

const DeliveryRisk = () => {
  const navigate = useNavigate();
  const { activeSprint } = useProjectStore((state) => state);
  

  const sprintHealth = activeSprint?.metrics?.sprintHealth || 0;
  const deliveryRisk = 100 - sprintHealth;
  
  const riskLevel = getRiskLevel(deliveryRisk);
  const colors = riskColors[riskLevel];

  const handleNavigate = () => {
    navigate("/delivery-risk");
  };
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className="w-full min-h-[220px] bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <AlertTriangle className="w-5 h-5 text-sky-500" />
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-wide">
              Delivery Risk
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              Inverse of sprint health
            </p>
          </div>
        </div>

        <Info
          className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowInfo(true);
          }}
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-3xl sm:text-4xl font-bold leading-none ${colors.text}`}>
            {deliveryRisk}%
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.badge}`}>
            {riskLevel} Risk
          </span>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Calculated as 100 - Sprint Health score
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[11px] sm:text-xs text-gray-400 max-w-[80%]">
          Current project delivery risk assessment
        </p>
      </div>

      {showInfo && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white w-[90%] max-w-md rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Delivery Risk</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">WHAT THIS MEANS</p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-gray-700">
                  Delivery Risk is the inverse of Sprint Health. If health is 45/100, risk is 55%.
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">FORMULA</p>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-gray-700">
                  Delivery Risk % = 100 − Sprint Health Score
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">RISK LEVELS</p>
                <div className="bg-gray-50 border rounded-xl p-3 text-sm space-y-2">
                  <div className="flex justify-between"><span>Low Risk</span><span>&lt; 30%</span></div>
                  <div className="flex justify-between"><span>Medium Risk</span><span>30–54%</span></div>
                  <div className="flex justify-between"><span>High Risk</span><span>55%+</span></div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">CURRENT VALUES</p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-gray-700">
                  Sprint Health: {sprintHealth}/100 → Delivery Risk: {deliveryRisk}% ({riskLevel})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryRisk;
