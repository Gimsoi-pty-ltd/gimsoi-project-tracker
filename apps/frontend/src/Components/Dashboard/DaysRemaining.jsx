import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSprintStore } from "../../store/sprintStore";

const DaysRemaining = () => {
  const navigate = useNavigate();
  const { sprints, getSprints, isLoading } = useSprintStore();
  const [activeSprint, setActiveSprint] = useState(null);

  useEffect(() => {
    // Fetch sprints if they aren't loaded yet
    if (sprints.length === 0) {
      getSprints().catch(console.error);
    }
  }, [sprints.length, getSprints]);

  useEffect(() => {
    if (sprints && sprints.length > 0) {
        // Find the active sprint. Fallback to the first sprint if none is active.
        const current = sprints.find(s => s.status === 'ACTIVE') || sprints[0];
        setActiveSprint(current);
    }
  }, [sprints]);

  // Calculate days remaining
  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  const daysRemaining = activeSprint ? calculateDaysRemaining(activeSprint.endDate) : 0;
  const isUrgent = daysRemaining <= 3;

  const handleCardClick = () => {
    if (activeSprint) {
        navigate('/days-remaining', { state: {
            sprintId: activeSprint.id,
            sprintName: activeSprint.name,
            goal: activeSprint.goal,
            daysRemaining: daysRemaining,
            status: activeSprint.status
        } });
    }
  };

  if (isLoading && !activeSprint) {
      return (
        <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">Loading sprint...</p>
        </div>
      );
  }

  if (!activeSprint) {
      return (
        <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">No active sprint</p>
        </div>
      );
  }

  return (
    <div
      onClick={handleCardClick}
      className={`
        bg-white p-6 rounded-[20px] 
        border border-gray-100 shadow-sm 
        text-center flex flex-col items-center justify-center h-full 
        hover:shadow-md transition-shadow cursor-pointer
        ${isUrgent ? 'border-red-200 bg-red-50/30' : ''}
      `}
    >
      <h3 className="text-md font-bold text-blue-500 mb-4 uppercase tracking-wider">
        Days Remaining
      </h3>

      <div className="relative w-40 h-20 mb-2">
        <svg viewBox="0 0 36 21" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M4 19 A14 14 0 0 1 32 19"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Progress Arc */}
          <path
            d="M4 19 A14 14 0 0 1 32 19"
            fill="none"
            stroke={isUrgent ? "#ef4444" : "#FF8C00"}
            strokeWidth="4"
            strokeDasharray="60 100"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute bottom-1 inset-x-0 flex flex-col items-center">
          <span
            className={`
              text-4xl font-extrabold leading-none
              ${isUrgent ? 'text-red-600' : 'text-gray-800'}
            `}
          >
            {daysRemaining}
          </span>
        </div>
      </div>

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
        {activeSprint.name}
      </p>
    </div>
  );
};

export default DaysRemaining;