// src/Components/Dashboard/DaysRemaining.jsx

import { useNavigate } from "react-router-dom";
import { useSprintStore } from "../../store/sprintStore";

const DaysRemaining = () => {
  const navigate   = useNavigate();
  const { sprints, isLoading } = useSprintStore();

  const activeSprint = sprints.find((s) => s.status === "active") || sprints[0];

  
  const daysRemaining = React.useMemo(() => {
    if (!activeSprint?.endDate) return null;
    const end  = new Date(activeSprint.endDate);
    const now  = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [activeSprint?.endDate]);

 
  const sprintDuration = React.useMemo(() => {
    if (!activeSprint?.startDate || !activeSprint?.endDate) return null;
    const start = new Date(activeSprint.startDate);
    const end   = new Date(activeSprint.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }, [activeSprint]);

  const isUrgent   = daysRemaining !== null && daysRemaining <= 3;
  const arcColor   = isUrgent ? "#ef4444" : "#FF8C00";

  
  const arcProgress = sprintDuration && daysRemaining !== null
    ? Math.round(((sprintDuration - daysRemaining) / sprintDuration) * 44) // 44 = approx arc length
    : 22; // default half-filled

  const handleClick = () => {
    navigate("/days-remaining", { state: { sprint: activeSprint } });
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white p-6 rounded-[20px] border shadow-sm text-center flex flex-col items-center justify-center h-full hover:shadow-md transition-shadow cursor-pointer ${
        isUrgent ? "border-red-200 bg-red-50/30" : "border-gray-100"
      }`}
    >
      <h3 className="text-md font-bold text-blue-500 mb-4 uppercase tracking-wider">
        Days Remaining
      </h3>

      <div className="relative w-40 h-20 mb-2">
        <svg viewBox="0 0 36 21" className="w-full h-full">
          {/* Background arc */}
          <path d="M4 19 A14 14 0 0 1 32 19" fill="none" stroke="#F1F5F9" strokeWidth="4" strokeLinecap="round" />
          {/* Progress arc */}
          <path
            d="M4 19 A14 14 0 0 1 32 19"
            fill="none"
            stroke={arcColor}
            strokeWidth="4"
            strokeDasharray={`${arcProgress} 100`}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute bottom-1 inset-x-0 flex flex-col items-center">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className={`text-4xl font-extrabold leading-none ${isUrgent ? "text-red-600" : "text-gray-800"}`}>
              {daysRemaining ?? "—"}
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
        {activeSprint?.name ?? "No active sprint"}
      </p>
    </div>
  );
};

export default DaysRemaining;