// src/Components/Dashboard/ActiveProjects.jsx

import { Link } from "react-router-dom";
import { useProjectStore } from "../../store/projectStore";

const ActiveProjects = () => {
  const { projects, isLoading } = useProjectStore();

  const activeCount = projects.filter(
    (p) => p.status?.toLowerCase() === "active" || p.status?.toLowerCase() === "in_progress"
  ).length;

  const total = projects.length;
  
  const progressDeg = total > 0 ? (activeCount / total) * 270 : 0;

  return (
    <Link to="/projects" className="no-underline block h-full">
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center h-full hover:shadow-md transition-shadow">
        <h3 className="text-xs text-[#1A75FF] font-bold uppercase tracking-wider mb-4">
          Active Projects
        </h3>

        {/* Circular progress indicator */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-[10px] border-[#FF8C00]/10" />
          <div
            className="absolute inset-0 rounded-full border-[10px] border-[#FF8C00] border-t-transparent"
            style={{ transform: `rotate(-${45 - progressDeg * 0.5}deg)` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-2xl font-extrabold text-slate-800">{activeCount}</span>
            )}
          </div>
        </div>

        {!isLoading && (
          <p className="text-xs text-gray-400 mt-3">
            {activeCount} of {total} projects active
          </p>
        )}
      </section>
    </Link>
  );
};

export default ActiveProjects;