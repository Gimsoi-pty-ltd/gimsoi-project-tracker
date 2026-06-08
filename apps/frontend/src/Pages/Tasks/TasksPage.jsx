import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTaskStore } from "../../store/taskStore";
import OverdueTasks from "./OverdueTasks";
import BlockedTasks from "./BlockedTasks";
import PieChart from "../Task-Progress/PieChart";
import TaskCard from "../Task-Progress/TaskCard";

const TABS = [
  { id: "overdue", label: "Overdue Tasks" },
  { id: "blocked", label: "Blocked Tasks" },
  { id: "progress", label: "Task-Progress" },
];

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "overdue";
  const activeTab = TABS.find((t) => t.id === tabParam) ? tabParam : "overdue";

  const { tasks, getTasks } = useTaskStore();

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  // Compute live counts from store
  const now = Date.now();
  const overdueCount = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "completed" && t.status !== "done"
  ).length;
  const blockedCount = tasks.filter((t) => t.status === "blocked").length;

  const tabsWithCounts = [
    { id: "overdue", label: "Overdue Tasks", count: overdueCount },
    { id: "blocked", label: "Blocked Tasks", count: blockedCount },
    { id: "progress", label: "Task-Progress", count: null },
  ];

  const setTab = (id) => setSearchParams({ tab: id });

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-6">Tasks</h1>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 bg-gray-50 px-6">
            {tabsWithCounts.map((tab) => (
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
            {activeTab === "overdue" && <OverdueTasks />}
            {activeTab === "blocked" && <BlockedTasks />}
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
