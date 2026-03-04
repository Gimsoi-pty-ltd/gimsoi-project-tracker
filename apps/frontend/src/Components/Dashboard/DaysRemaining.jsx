import React from "react";
import { useNavigate } from 'react-router-dom';

const DaysRemaining = () => {
  const navigate = useNavigate();

  // Example sprint data – later replace with real data source
  const sprintData = {
    sprintId: 'sprint-2',
    sprintName: 'Days Remaining',
    goal: 'Sprint deadline',
    completion: 67,
    totalTasks: 25,
    completedTasks: 20,
    daysRemaining: 5,
    status: 'Active'
  };

  const daysRemaining = sprintData.daysRemaining ?? 0;
  const isUrgent = daysRemaining <= 3;

  const handleCardClick = () => {
    navigate('/days-remaining', { state: sprintData });
  };

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
        Deadline Approaching
      </p>
    </div>
  );
};

export default DaysRemaining;