import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTaskStore } from "../../store/taskStore";
import { useProjectStore } from "../../store/projectStore";
import OverdueTasks from "./OverdueTasks";
import BlockedTasks from "./BlockedTasks";
import PieChart from "../Task-Progress/PieChart";
import TaskCard from "../Task-Progress/TaskCard";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 bg-white min-h-screen">
          <h1 className="text-2xl font-bold mb-4">TasksPage Crashed</h1>
          <pre className="whitespace-pre-wrap">{this.state.error?.toString()}</pre>
          <pre className="whitespace-pre-wrap text-sm mt-4 text-gray-500">{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS = [
  { id: "overdue", label: "Overdue Tasks" },
  { id: "blocked", label: "Blocked Tasks" },
  { id: "progress", label: "Task Progress" },
];

const normalizeStatus = (status) => {
  if (!status) return "";
  const value = status.toString().toLowerCase();
  if (value === "in_progress" || value === "inprogress" || value === "in progress") return "in progress";
  if (value === "todo" || value === "backlog") return "todo";
  if (value === "done" || value === "completed") return "done";
  if (value === "blocked") return "blocked";
  return value;
};

function TasksPageContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "overdue";
  const activeTab = TABS.find((t) => t.id === tabParam) ? tabParam : "overdue";

  const { tasks, getTasks } = useTaskStore();
  const EMPTY = [];
  const activeSprintTasks = useProjectStore((state) => state.activeSprint?.tasks ?? EMPTY);
  const taskSource = activeSprintTasks.length > 0 ? activeSprintTasks : tasks;

  // Load tasks on mount only
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      getTasks();
    }
  }, []);

  // Refetch tasks every 5 minutes while the page is open
  useEffect(() => {
    const interval = setInterval(() => {
      getTasks();
    }, 300000); // 5 minutes in ms
    return () => clearInterval(interval);
  }, [getTasks]);


  const now = Date.now();
  const overdueCount = taskSource.filter(
    (t) => t.dueDate && new Date(t.dueDate).getTime() < now && !["completed", "done"].includes(normalizeStatus(t.status))
  ).length;
  const blockedCount = taskSource.filter((t) => normalizeStatus(t.status) === "blocked").length;
  const activeTasks = taskSource.filter((t) => normalizeStatus(t.status) !== "done");

  const tabsWithCounts = [
    { id: "overdue", label: "Overdue Tasks", count: overdueCount },
    { id: "blocked", label: "Blocked Tasks", count: blockedCount },
    { id: "progress", label: "Task Progress", count: null },
  ];

  const setTab = (id) => setSearchParams({ tab: id });

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Tasks</h1>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex gap-1 border-b border-gray-200 bg-gray-50 px-6">
            {tabsWithCounts.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`px-5 py-4 text-sm font-medium transition-colors -mb-px ${
                  activeTab === tab.id
                    ? "bg-white text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-400 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {tab.count != null && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
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
                <div className="grid gap-6 lg:grid-cols-[minmax(260px,380px)_minmax(320px,1fr)]">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Sprint task summary</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      This view is driven by the current sprint tasks shown in the Kanban board.
                    </p>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Total tasks</span>
                        <span className="font-semibold">{taskSource.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overdue</span>
                        <span className="font-semibold text-red-600">{overdueCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blocked</span>
                        <span className="font-semibold text-amber-700">{blockedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In progress</span>
                        <span className="font-semibold text-blue-600">{activeTasks.filter((t) => normalizeStatus(t.status) === "in progress").length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-md">
                    <PieChart tasks={taskSource} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Active Tasks</h3>
                    <span className="text-xs text-gray-500">{taskSource.length} items</span>
                  </div>

                  {taskSource.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                      No live task cards available yet. Create tasks or select a sprint to populate this view.
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {taskSource.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <ErrorBoundary>
      <TasksPageContent />
    </ErrorBoundary>
  );
}
