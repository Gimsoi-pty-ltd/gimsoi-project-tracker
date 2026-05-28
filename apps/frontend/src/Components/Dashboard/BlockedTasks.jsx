// src/Components/Dashboard/BlockedTasks.jsx

import { Link } from "react-router-dom";
import { useTaskStore } from "../../store/taskStore";

const severityOf = (priority) => {
  if (priority === "critical" || priority === "high") return "high";
  return "medium";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
};


const avatarUrl = (id) => `https://i.pravatar.cc/100?img=${(parseInt(id, 10) % 70) + 1}`;

const BlockedTasks = () => {
  const { tasks, isLoading } = useTaskStore();

  const blockedTasks = tasks
    .filter((t) => t.status === "blocked")
    .slice(0, 6); 

  return (
    <Link to="/tasks/blocked" className="block h-full no-underline">
      <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 w-full h-full hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="text-[#1A75FF] font-bold text-md mb-4 uppercase tracking-wider text-center">
          Blocked Tasks
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blockedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <span className="text-4xl mb-2">✓</span>
            <p className="text-sm font-medium">No blocked tasks</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {blockedTasks.map((task, index) => {
              const severity = severityOf(task.priority);
              return (
                <li key={`${task.id}-${index}`} className="py-3 flex items-center gap-4 group">
                  {/* Severity icon */}
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm ${
                    severity === "high" ? "bg-red-500 shadow-red-100" : "bg-orange-400 shadow-orange-100"
                  }`}>
                    {severity === "high" ? "!" : "i"}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-[15px] truncate mb-0.5 ${
                      severity === "high" ? "text-red-600" : "text-orange-600"
                    }`} title={task.title}>
                      {task.title}
                    </p>
                    <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">
                      {formatDate(task.dueDate)}
                    </p>
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {task.assigneeAvatar ? (
                      <img
                        src={task.assigneeAvatar}
                        alt={task.assignee}
                        className="h-9 w-9 rounded-lg object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-[#002D62] text-white flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
                        {(task.assignee || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                    )}
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

export default BlockedTasks;