import React, { useState } from "react";
import { useSprintStore } from "../../store/sprintStore";
import { Download, TrendingUp, CheckCircle2, AlertCircle, LineChart } from "lucide-react";

export const sprintReports = [
  {
    id: "report-sprint-001",
    sprintId: "sprint-01",
    projectId: "project-01",
    name: "Sprint 01 Report - AI Agent Platform",
    startDate: "2026-04-01",
    endDate: "2026-04-15",
    goalsAchieved: ["Set up project foundation", "All setup tasks completed"],
    burndownChart: [
      { day: "Apr 01", ideal: 7, actual: 7 },
      { day: "Apr 04", ideal: 5, actual: 5 },
      { day: "Apr 07", ideal: 4, actual: 4 },
      { day: "Apr 10", ideal: 2, actual: 2 },
      { day: "Apr 14", ideal: 0, actual: 0 },
    ],
    velocity: 11,
    metrics: {
      totalTasks: 7,
      completedTasks: 7,
      completionPercentage: 100,
      sprintHealth: 95,
      deliveryRisk: "Low",
    },
  },
];

const SprintReport = () => {
  const { activeSprint, projects, projectSprints } = useSprintStore((state) => state);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedSprintId, setSelectedSprintId] = useState(activeSprint?.id);

  const selectedSprint = projectSprints.find(s => s.id === selectedSprintId) || activeSprint;
  
  const getStatusColor = (status) => {
    switch (status) {
      case "done": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "inProgress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "review": return "bg-orange-100 text-orange-800 border-orange-200";
      case "blocked": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      done: "Done",
      inProgress: "In Progress",
      review: "In Review",
      blocked: "Blocked",
      todo: "To Do"
    };
    return labels[status] || status;
  };

  if (!selectedSprint) {
    return <div className="p-8 text-center">No sprint data available</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-5 md:space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Sprint Report</h1>
          <p className="text-sm text-slate-500 mt-1">{selectedSprint.name}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#002D62] hover:bg-[#001f44] text-white rounded-lg font-medium transition-colors">
          <Download size={18} />
          Download PDF
        </button>
      </div>

      {/* Sprint Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Sprint</label>
        <select
          value={selectedSprintId}
          onChange={(e) => setSelectedSprintId(e.target.value)}
          className="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {projectSprints.map(sprint => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name} ({sprint.status})
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-lg">
        <div className="flex gap-6 md:gap-8 px-4 md:px-6">
          {["Overview", "Details"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === tab ? "text-blue-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Overview" ? (
        <div className="space-y-6 md:space-y-8">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-900 flex-shrink-0">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500 uppercase">Velocity</p>
                <p className="text-xl md:text-2xl font-bold text-blue-900">{selectedSprint.metrics.velocity}</p>
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-900 flex-shrink-0">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500 uppercase">Completion</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-900">{selectedSprint.metrics.completionPercentage}%</p>
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                selectedSprint.metrics.deliveryRisk === 'Low' ? 'bg-green-50 text-green-900' :
                selectedSprint.metrics.deliveryRisk === 'Medium' ? 'bg-yellow-50 text-yellow-900' :
                'bg-red-50 text-red-900'
              }`}>
                <AlertCircle size={28} />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500 uppercase">Risk</p>
                <p className={`text-xl md:text-2xl font-bold ${
                  selectedSprint.metrics.deliveryRisk === 'Low' ? 'text-green-900' :
                  selectedSprint.metrics.deliveryRisk === 'Medium' ? 'text-yellow-900' :
                  'text-red-900'
                }`}>{selectedSprint.metrics.deliveryRisk}</p>
              </div>
            </div>
          </div>

          {/* Goals Achieved */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Sprint Goals</h2>
            <ul className="space-y-2">
              {selectedSprint.goal && (
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{selectedSprint.goal}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Task Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Task Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total", value: selectedSprint.metrics.totalTasks, color: "bg-blue-50 text-blue-900" },
                { label: "Completed", value: selectedSprint.metrics.completedTasks, color: "bg-emerald-50 text-emerald-900" },
                { label: "In Progress", value: selectedSprint.kanban?.inProgress || 0, color: "bg-orange-50 text-orange-900" },
                { label: "Blocked", value: selectedSprint.kanban?.blocked || 0, color: "bg-red-50 text-red-900" },
              ].map(item => (
                <div key={item.label} className={`${item.color} rounded-lg p-4 text-center`}>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs mt-1 opacity-75">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-blue-900">Tasks</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-4 md:px-6 py-4 font-semibold text-sm">Task</th>
                    <th className="px-4 md:px-6 py-4 font-semibold text-sm">Status</th>
                    <th className="px-4 md:px-6 py-4 font-semibold text-sm">Assignee</th>
                    <th className="px-4 md:px-6 py-4 font-semibold text-sm">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSprint.tasks?.slice(0, 10).map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 md:px-6 py-4 font-medium text-blue-900">{task.title}</td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-slate-700 text-sm">{task.assignee}</td>
                      <td className="px-4 md:px-6 py-4 font-semibold text-slate-700">{task.storyPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 md:p-12 text-center bg-white rounded-lg border border-slate-200">
          <LineChart className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Detailed breakdown showing charts and metrics</p>
        </div>
      )}
    </div>
  );
};

export default SprintReport;