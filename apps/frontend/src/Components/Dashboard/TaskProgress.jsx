// src/Components/Dashboard/TaskProgress.jsx

import { Link } from "react-router-dom";
import { useTaskStore } from "../../store/taskStore";

const CIRCUMFERENCE = 2 * Math.PI * 42; 

const TaskProgress = () => {
  const { tasks, isLoading } = useTaskStore();

  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === "done" || t.status === "completed").length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const offset    = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <Link to="/tasks?tab=progress" className="block h-full no-underline">
      <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="text-md text-[#1A75FF] font-bold uppercase tracking-wider mb-4">
          Task Progress
        </h3>

        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            {/* Background ring */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="10" />
            {/* Progress ring */}
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="#FF8C00"
              strokeWidth="10"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-3xl font-extrabold text-gray-800">{pct}%</span>
            )}
          </div>
        </div>

        {!isLoading && (
          <p className="text-xs text-gray-400 mt-3">{completed} of {total} tasks done</p>
        )}
      </section>
    </Link>
  );
};

export default TaskProgress;