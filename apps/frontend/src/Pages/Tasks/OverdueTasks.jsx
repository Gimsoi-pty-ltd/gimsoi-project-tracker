
import { AlertCircle } from "lucide-react";
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

const urgencyLabel = (priority) => {
  switch ((priority || "").toLowerCase()) {
    case "critical": return "Critical";
    case "high": return "High";
    case "medium": return "Moderate";
    case "low": return "Minor";
    default: return priority || "—";
  }
};

const getAssignee = (task) => {
  if (typeof task.assignee === "string") return task.assignee;
  return task.assignee?.fullName || task.assignedTo?.fullName || "Unassigned";
};

export default function OverdueTasks() {
  const EMPTY = [];
const activeSprintTasks = useProjectStore((state) => state.activeSprint?.tasks ?? EMPTY);
  const { tasks, isLoading, error } = useTaskStore();



  const taskSource = activeSprintTasks.length > 0 ? activeSprintTasks : tasks;
  const now = Date.now();
  const overdueTasks = taskSource.filter(
    (t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status?.toLowerCase() !== "completed" && t.status?.toLowerCase() !== "done" && t.status?.toLowerCase() !== "cancelled"
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {isLoading && (
          <div className="text-center py-12 text-gray-400">Loading overdue tasks...</div>
        )}

        {error && !isLoading && (
          <div className="text-center py-12 text-red-500">{error}</div>
        )}

        {!isLoading && !error && overdueTasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">No overdue tasks — you're on track! ✅</div>
        )}

        {!isLoading && overdueTasks.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b">
              <tr>
                <th className="text-left py-3">Feature</th>
                <th className="text-left py-3">Progress</th>
                <th className="text-left py-3">Urgency</th>
                <th className="text-left py-3">Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {overdueTasks.map((task, index) => (
                <tr key={task.id ?? index} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded-full accent-blue-600" readOnly />
                      <span className="text-gray-400 text-sm">{task.id}</span>
                      <span className="text-sm font-medium text-gray-800">{task.title}</span>
                    </div>
                  </td>

                  <td className="py-5">
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle size={20} className="text-white bg-red-500 rounded-full" />
                      Overdue
                    </div>
                  </td>

                  <td className="py-5">
                    <div className={`flex items-center gap-2 text-sm font-medium ${urgencyStyle(task.priority)}`}>
                      {urgencyLabel(task.priority)}
                    </div>
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
