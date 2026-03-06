import { useSearchParams } from "react-router-dom";
import Overduetasks from "./Overduetasks";
import PieChart from "../Task Progress/PieChart";
import TaskCard from "../Task Progress/TaskCard";

const TABS = [
  { id: "overdue", label: "Overdue Tasks", count: 8 },
  { id: "blocked", label: "Blocked Tasks", count: 6 },
  { id: "progress", label: "Task Progress", count: null },
];

const BLOCKED_TASKS = [
  { id: "b1", title: "Waiting on Data from Backend", severity: "high", assignee: "John Doe" },
  { id: "b2", title: "Security Review", severity: "medium", assignee: "Jane Doe" },
  { id: "b3", title: "Priority Conflict", severity: "medium", assignee: "Mike Smith" },
  { id: "b4", title: "Dependency on External API", severity: "high", assignee: "Sarah Lee" },
  { id: "b5", title: "Awaiting Design Approval", severity: "low", assignee: "Tom Wilson" },
  { id: "b6", title: "Resource Unavailable", severity: "high", assignee: "Alex Brown" },
];

const urgencyStyle = (urgency) => {
  switch (urgency) {
    case "Critical":
    case "high":
      return "text-red-500";
    case "Moderate":
    case "medium":
      return "text-yellow-600";
    case "Minor":
    case "low":
      return "text-green-700";
    default:
      return "text-gray-600";
  }
};

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "overdue";
  const activeTab = TABS.find((t) => t.id === tabParam) ? tabParam : "overdue";

  const setTab = (id) => {
    setSearchParams({ tab: id });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-6">Tasks</h1>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 bg-gray-50 px-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`px-5 py-4 text-sm font-medium transition-colors -mb-px ${
                  activeTab === tab.id
                    ? "bg-white text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {tab.count != null && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overdue" && <Overduetasks />}

            {activeTab === "blocked" && (
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b">
                  <tr>
                    <th className="text-left py-3">Feature</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Severity</th>
                    <th className="text-left py-3">Assigned to</th>
                  </tr>
                </thead>
                <tbody>
                  {BLOCKED_TASKS.map((task) => (
                    <tr key={task.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="w-5 h-5 rounded-full accent-blue-600" />
                          <span className="text-gray-400 text-sm">{task.id}</span>
                          <span className="text-sm font-medium text-gray-800">{task.title}</span>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                          Blocked
                        </span>
                      </td>
                      <td className={`py-5 text-sm font-medium capitalize ${urgencyStyle(task.severity)}`}>
                        {task.severity}
                      </td>
                      <td className="py-5 text-sm text-gray-600">{task.assignee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "progress" && (
              <div className="space-y-6">
                <div className="max-w-md">
                  <PieChart />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                    Active Tasks
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <TaskCard />
                    <TaskCard />
                    <TaskCard />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
