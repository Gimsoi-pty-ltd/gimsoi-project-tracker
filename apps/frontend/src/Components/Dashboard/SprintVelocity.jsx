// src/Components/Dashboard/SprintVelocity.jsx

import { Link } from "react-router-dom";
import { useSprintStore } from "../../store/sprintStore";

const SprintVelocityCard = () => {
  const { sprints, isLoading } = useSprintStore();

  const activeSprint = sprints.find((s) => s.status === "active") || sprints[0];

  const velocity = activeSprint?.completedPoints ?? activeSprint?.velocity ?? 0;
  const goal     = activeSprint?.totalPoints     ?? activeSprint?.sprintGoal ?? 40;
  const progress = goal > 0 ? Math.min((velocity / goal) * 100, 100) : 0;

  const arcFill = (progress / 100) * 44;

  return (
    <Link to="/reports/sprint-report" className="block h-full no-underline">
      <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center h-full hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
        <h3 className="text-md font-bold text-blue-500 mb-4 uppercase tracking-wider text-center">
          Sprint Velocity
        </h3>

        <div className="relative w-48 h-28 mb-2">
          <svg viewBox="0 0 36 21" className="w-full h-full">
            {/* Background arc */}
            <path d="M4 19 A14 14 0 0 1 32 19" fill="none" stroke="#F1F5F9" strokeWidth="4" strokeLinecap="round" />
            {/* Progress arc */}
            <path
              d="M4 19 A14 14 0 0 1 32 19"
              fill="none"
              stroke="#1A75FF"
              strokeWidth="4"
              strokeDasharray={`${arcFill} 100`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>

          <div className="absolute bottom-1 inset-x-0 flex flex-col items-center">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-800 leading-none">{velocity}</span>
                <span className="text-lg font-bold text-gray-400">pts</span>
              </div>
            )}
          </div>
        </div>

        {!isLoading && (
          <p className="text-xs text-gray-400 mt-2">
            Goal: {goal} pts · {Math.round(progress)}% achieved
          </p>
        )}
      </div>
    </Link>
  );
};

export default SprintVelocityCard;