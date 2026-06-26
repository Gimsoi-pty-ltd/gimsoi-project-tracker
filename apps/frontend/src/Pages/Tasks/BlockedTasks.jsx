import { useEffect } from "react";
import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";

const urgencyStyle = (priority) => {
  switch ((priority || "").toLowerCase()) {
    case "critical":
    case "high":
      return "text-red-500";
    case "medium":
      return "text-yellow-600";
    case "low":
      return "text-green-700";
    default:
      return "text-gray-600";
  }
};

const getAssignee = (task) => {
  if (typeof task.assignee === "string") return task.assignee;
  return task.assignee?.fullName || task.assignedTo?.fullName || "Unassigned";
};

export default function BlockedTasks() {
const activeSprintTasks = useProjectStore((state) => state.activeSprint?.tasks ?? null);
  const { tasks, isLoading, error, getTasks } = useTaskStore();

  useEffect(() => {
    if (!activeSprintTasks?.length) {
      getTasks({ status: "blocked" });
    }
  }, [getTasks, activeSprintTasks?.length]);

  const taskSource = activeSprintTasks?.length > 0 ? activeSprintTasks : tasks;
  const blockedTasks = taskSource.filter((t) => (t.status || "").toString().toLowerCase() === "blocked");

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Blocked Work Items</h1>   
          <div className="flex gap-6 mb-6">
           
          </div>

          {isLoading && (
            <div className="text-center py-12 text-gray-400">Loading blocked tasks...</div>
          )}

          {error && !isLoading && (
            <div className="text-center py-12 text-red-500">{error}</div>
          )}

          {!isLoading && !error && blockedTasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">No blocked tasks — great work! 🎉</div>
          )}

          {!isLoading && blockedTasks.length > 0 && (
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b">
                <tr>
                  <th className="text-left py-3">Feature</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Priority</th>
                  <th className="text-left py-3">Assigned to</th>
                </tr>
              </thead>
              <tbody>
                {blockedTasks.map((task) => (
                  <tr key={task.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="w-5 h-5 rounded-full accent-blue-600" readOnly />
                        <span className="text-gray-400 text-sm">{task.id}</span>
                        <span className="text-sm font-medium text-gray-800">{task.title}</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                        Blocked
                      </span>
                    </td>
                    <td className={`py-5 text-sm font-medium capitalize ${urgencyStyle(task.priority)}`}>
                      {task.priority || "—"}
                    </td>
                    <td className="py-5 text-sm text-gray-600">{getAssignee(task)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        
      </div>
    </div>
  );
}
