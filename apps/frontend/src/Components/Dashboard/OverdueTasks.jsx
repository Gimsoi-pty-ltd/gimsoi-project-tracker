// src/Components/Dashboard/OverdueTasks.jsx

import { Link } from "react-router-dom";
import { useTaskStore } from "../../store/taskStore";

const daysLate = (dueDate) => {
  const due  = new Date(dueDate);
  const now  = new Date();
  const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

const formatDue = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

const OverdueTasks = () => {
  const { tasks, isLoading } = useTaskStore();

  const overdueTasks = tasks
    .filter((t) => {
      if (!t.dueDate) return false;
      const isDone = t.status === "done" || t.status === "completed";
      const isPast = new Date(t.dueDate) < new Date();
      return !isDone && isPast;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)) 
    .slice(0, 4);

  return (
    <Link to="/tasks/overdue" className="block h-full no-underline">
      <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-full hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="text-[#1A75FF] font-bold text-md mb-4 uppercase tracking-wider text-center">
          Overdue Tasks
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : overdueTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <span className="text-4xl mb-2">✓</span>
            <p className="text-sm font-medium">No overdue tasks</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {overdueTasks.map((task) => {
              const late     = daysLate(task.dueDate);
              const critical = late >= 7 || task.priority === "critical";
              return (
                <li key={task.id} className="py-4 flex items-center gap-4 group">
                  {/* Severity icon */}
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm ${
                    critical ? "bg-red-500 shadow-red-100" : "bg-orange-400 shadow-orange-100"
                  }`}>
                    {critical ? "!" : "i"}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-[15px] truncate mb-0.5 ${
                      critical ? "text-red-600" : "text-orange-600"
                    }`} title={task.title}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">
                        Due: {formatDue(task.dueDate)}
                      </p>
                      <span className="h-1 w-1 bg-gray-300 rounded-full" />
                      <p className="text-[12px] text-red-500 font-extrabold uppercase bg-red-50 px-1.5 py-0.5 rounded-md">
                        {late}D LATE
                      </p>
                    </div>
                  </div>

                  {/* Hover chevron */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Link>
  );
};

export default OverdueTasks;