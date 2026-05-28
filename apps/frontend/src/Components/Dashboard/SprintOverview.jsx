// src/Components/Dashboard/SprintOverview.jsx

import { Link } from "react-router-dom";
import { useSprintStore } from "../../store/sprintStore";
import { useTaskStore } from "../../store/taskStore";

const SprintOverview = () => {
  const { sprints, isLoading: sprintsLoading } = useSprintStore();
  const { tasks, isLoading: tasksLoading }     = useTaskStore();

  const activeSprint = sprints.find((s) => s.status === "active") || sprints[0];
  const isLoading    = sprintsLoading || tasksLoading;

  
  const completionPct = React.useMemo(() => {
    if (activeSprint?.completionPercentage != null) return activeSprint.completionPercentage;
    if (activeSprint?.totalPoints && activeSprint?.completedPoints) {
      return Math.round((activeSprint.completedPoints / activeSprint.totalPoints) * 100);
    }
    
    const sprintTasks = tasks.filter((t) => t.sprintId === activeSprint?.id);
    if (!sprintTasks.length) return 0;
    const done = sprintTasks.filter((t) => t.status === "done" || t.status === "completed").length;
    return Math.round((done / sprintTasks.length) * 100);
  }, [activeSprint, tasks]);

  const remaining = 100 - completionPct;

  return (
    <Link to="/reports/sprint-report" className="no-underline block h-full">
      <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center h-full hover:shadow-md transition-shadow">
        <h3 className="text-md text-[#1A75FF] font-bold uppercase tracking-wider mb-4 text-center">
          Sprint Overview
        </h3>

        <div className="w-full">
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            {activeSprint?.name ?? "No active sprint"}
          </p>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-extrabold text-gray-800">{completionPct}%</span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                  {remaining}% Remaining
                </span>
              </div>

              <div
                className="h-3 w-full rounded-full bg-gray-100 overflow-hidden"
                role="progressbar"
                aria-valuenow={completionPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-[#FF8C00] transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              {activeSprint?.goal && (
                <p className="text-xs text-gray-400 mt-2 truncate" title={activeSprint.goal}>
                  Goal: {activeSprint.goal}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </Link>
  );
};

export default SprintOverview;