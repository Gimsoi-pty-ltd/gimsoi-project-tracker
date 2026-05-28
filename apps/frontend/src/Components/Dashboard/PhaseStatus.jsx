// src/Components/Dashboard/PhaseStatus.jsx

import { Link } from "react-router-dom";
import { useSprintStore } from "../../store/sprintStore";

const phaseStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (s === "on track")    return "text-orange-500 bg-orange-50";
  if (s === "completed")   return "text-green-600 bg-green-50";
  if (s === "at risk")     return "text-red-500 bg-red-50";
  if (s === "blocked")     return "text-red-600 bg-red-100";
  return "text-gray-500 bg-gray-50";
};

const PhaseStatus = () => {
  const { sprints, isLoading } = useSprintStore();
  const activeSprint = sprints.find((s) => s.status === "active") || sprints[0];

  const phase        = activeSprint?.currentPhase    ?? "—";
  const phaseStatus  = activeSprint?.phaseStatus     ?? "On Track";
  const phaseProgress = activeSprint?.phaseProgress  ?? 0;

  return (
    <Link to="/phases" className="no-underline block h-full">
      <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm h-full flex flex-col justify-center hover:shadow-md transition-shadow">
        <h3 className="text-center text-md font-bold text-blue-500 mb-4 uppercase tracking-wider">
          Phase Status
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex items-center gap-5">
            {/* Status icon */}
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFD700] text-[#1A1A1A] text-lg font-bold shadow-sm flex-shrink-0">
              ✓
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xl text-gray-800 truncate">{phase}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${phaseStatusColor(phaseStatus)}`}>
                  {phaseStatus}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FF8C00] transition-all duration-700"
                  style={{ width: `${phaseProgress}%` }}
                />
              </div>

              <p className="text-xs text-gray-400 mt-1.5">{phaseProgress}% complete</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PhaseStatus;