// src/Pages/Reports and Exporting/sprintReports.jsx
import { useEffect, useState } from "react";
import { useSprintStore } from "../../store/sprintStore";
import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";
import { Download, TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function SprintReport() {
  const { sprints, getSprints, isLoading: sprintsLoading } = useSprintStore();
  const { currentProject, fetchProjects } = useProjectStore();
  const { tasks, getTasks } = useTaskStore();

  const [selectedSprintId, setSelectedSprintId] = useState(null);

  useEffect(() => {
    fetchProjects();
    getSprints();
    getTasks();
  }, []);

  useEffect(() => {
    if (sprints.length > 0 && !selectedSprintId) {
      const active = sprints.find((s) => s.status === "active") || sprints[0];
      setSelectedSprintId(active?.id ?? null);
    }
  }, [sprints]);

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId) || sprints[0];

  
  const sprintTasks = selectedSprint?.tasks?.length
    ? selectedSprint.tasks
    : tasks.filter((t) => t.sprintId === selectedSprintId);

  const completedTasks  = sprintTasks.filter((t) => t.status === "done" || t.status === "completed").length;
  const inProgressTasks = sprintTasks.filter((t) => t.status === "inProgress" || t.status === "in_progress").length;
  const blockedTasks    = sprintTasks.filter((t) => t.status === "blocked").length;
  const totalTasks      = sprintTasks.length;
  const completionPct   = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const StatCard = ({ icon, label, value, color }) => (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm`}>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sprint Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentProject?.name ?? "All Projects"} · {selectedSprint?.name ?? "No sprint selected"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sprint Selector */}
          <select
            value={selectedSprintId ?? ""}
            onChange={(e) => setSelectedSprintId(Number(e.target.value) || e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button className="inline-flex items-center gap-2 bg-[#002D62] hover:bg-[#001f44] text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {sprintsLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Loading sprint data...</div>
      ) : !selectedSprint ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">No sprint data available</div>
      ) : (
        <>
          {/* Sprint Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4 text-lg">Sprint Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Status</p>
                <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                  selectedSprint.status === "active" ? "bg-green-100 text-green-700" :
                  selectedSprint.status === "completed" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {selectedSprint.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Start</p>
                <p className="font-semibold text-gray-800">{selectedSprint.startDate ? new Date(selectedSprint.startDate).toLocaleDateString("en-ZA") : "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">End</p>
                <p className="font-semibold text-gray-800">{selectedSprint.endDate ? new Date(selectedSprint.endDate).toLocaleDateString("en-ZA") : "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Points</p>
                <p className="font-semibold text-gray-800">
                  {selectedSprint.completedPoints ?? completedTasks} / {selectedSprint.totalPoints ?? totalTasks}
                </p>
              </div>
            </div>
            {selectedSprint.goal && (
              <div className="mt-4 bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Sprint Goal</p>
                <p className="text-sm text-blue-800">{selectedSprint.goal}</p>
              </div>
            )}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<CheckCircle size={22} className="text-green-600" />} label="Completed" value={completedTasks} color="bg-green-100" />
            <StatCard icon={<TrendingUp size={22} className="text-blue-600" />} label="In Progress" value={inProgressTasks} color="bg-blue-100" />
            <StatCard icon={<AlertTriangle size={22} className="text-orange-500" />} label="Blocked" value={blockedTasks} color="bg-orange-100" />
            <StatCard icon={<Clock size={22} className="text-purple-600" />} label="Completion %" value={`${completionPct}%`} color="bg-purple-100" />
          </div>

          {/* Completion Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Task Completion</h2>
              <span className="text-sm font-bold text-blue-600">{completionPct}%</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-500">
              <span>{completedTasks} completed</span>
              <span>{totalTasks - completedTasks} remaining</span>
            </div>
          </div>

          {/* Task Table */}
          {sprintTasks.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Tasks ({totalTasks})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-600">Task</th>
                      <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                      <th className="px-6 py-3 font-medium text-gray-600">Priority</th>
                      <th className="px-6 py-3 font-medium text-gray-600">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sprintTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-800">{task.title}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            task.status === "done" || task.status === "completed" ? "bg-green-100 text-green-700" :
                            task.status === "inProgress" || task.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                            task.status === "blocked" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            task.priority === "critical" ? "bg-red-100 text-red-700" :
                            task.priority === "high" ? "bg-orange-100 text-orange-700" :
                            task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{task.assignee ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}