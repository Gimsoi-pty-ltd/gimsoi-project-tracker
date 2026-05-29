// src/Pages/Reports and Exporting/projectReport.jsx
import { useEffect } from "react";
import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";
import { useSprintStore } from "../../store/sprintStore";
import { Download, TrendingUp, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#ef4444", "#8b5cf6"];

export default function ProjectReport() {
  const { currentProject, projectProgress, fetchProjects, getProjectProgress, isLoading } = useProjectStore();
  const { tasks, getTasks } = useTaskStore();
  const { sprints, getSprints } = useSprintStore();

  useEffect(() => {
    fetchProjects();
    getTasks();
    getSprints();
  }, []);

  useEffect(() => {
    if (currentProject?.id) getProjectProgress(currentProject.id);
  }, [currentProject?.id]);

  const activeSprint = sprints.find((s) => s.status === "active") || sprints[0];


  const statusGroups = [
    { name: "Completed",   value: tasks.filter((t) => t.status === "done" || t.status === "completed").length },
    { name: "In Progress", value: tasks.filter((t) => t.status === "inProgress" || t.status === "in_progress").length },
    { name: "To Do",       value: tasks.filter((t) => t.status === "todo").length },
    { name: "Blocked",     value: tasks.filter((t) => t.status === "blocked").length },
    { name: "In Review",   value: tasks.filter((t) => t.status === "review").length },
  ].filter((g) => g.value > 0);

  const completedTasks = tasks.filter((t) => t.status === "done" || t.status === "completed").length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const blockedCount   = tasks.filter((t) => t.status === "blocked").length;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Project Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentProject?.name ?? "No project selected"}
            {activeSprint ? ` · ${activeSprint.name}` : ""}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#002D62] hover:bg-[#001f44] text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Download size={16} /> Download PDF
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Loading project data...</div>
      ) : !currentProject ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">No project selected. Choose a project from the sidebar.</div>
      ) : (
        <>
          {/* Project Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Project Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  currentProject.status?.toLowerCase() === "active" ? "bg-green-100 text-green-700" :
                  currentProject.status?.toLowerCase() === "completed" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{currentProject.status ?? "—"}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Client</p>
                <p className="font-semibold text-gray-800 text-sm">{currentProject.clientName || currentProject.client || "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Progress</p>
                <p className="font-semibold text-gray-800 text-sm">{currentProject.progress ?? completionRate}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Risk</p>
                <p className="font-semibold text-gray-800 text-sm">
                  {projectProgress?.deliveryRisk ?? (blockedCount > 3 ? "High" : blockedCount > 1 ? "Medium" : "Low")}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <CheckCircle size={22} className="text-green-600" />,    label: "Completed Tasks",  value: completedTasks,            color: "bg-green-100" },
              { icon: <TrendingUp size={22} className="text-blue-600" />,      label: "Total Tasks",      value: tasks.length,              color: "bg-blue-100" },
              { icon: <AlertTriangle size={22} className="text-red-500" />,    label: "Blocked",          value: blockedCount,              color: "bg-red-100" },
              { icon: <Calendar size={22} className="text-purple-600" />,      label: "Active Sprint",    value: activeSprint?.name ?? "—", color: "bg-purple-100" },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Overall Progress</h2>
              <span className="text-sm font-bold text-blue-600">{currentProject.progress ?? completionRate}%</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-700"
                style={{ width: `${currentProject.progress ?? completionRate}%` }}
              />
            </div>
          </div>

          {/* Task Distribution Pie */}
          {statusGroups.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Task Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusGroups} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusGroups.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sprint Summary */}
          {activeSprint && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Current Sprint Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sprint</p>
                  <p className="font-semibold text-gray-800">{activeSprint.name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Points</p>
                  <p className="font-semibold text-gray-800">{activeSprint.completedPoints ?? "—"} / {activeSprint.totalPoints ?? "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">End Date</p>
                  <p className="font-semibold text-gray-800">{activeSprint.endDate ? new Date(activeSprint.endDate).toLocaleDateString("en-ZA") : "—"}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}