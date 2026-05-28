// src/Components/Dashboard/PhasesStatusPage.jsx

import { Link } from "react-router-dom";
import { useProjectStore } from "../../store/projectStore";
import { useSprintStore } from "../../store/sprintStore";

const statusConfig = (status) => {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "done")        return { label: "Completed",   color: "bg-green-800" };
  if (s === "in_progress" || s === "active")    return { label: "In Progress", color: "bg-yellow-500" };
  if (s === "blocked")                          return { label: "Blocked",      color: "bg-red-500" };
  if (s === "review" || s === "under review")   return { label: "Under Review", color: "bg-green-400" };
  if (s === "on_hold" || s === "on hold")       return { label: "On Hold",      color: "bg-gray-400" };
  return { label: status ?? "Unknown", color: "bg-gray-300" };
};

const PhaseOverview = () => {
  const { projects, isLoading: projectsLoading } = useProjectStore();
  const { sprints,  isLoading: sprintsLoading  } = useSprintStore();

  const isLoading = projectsLoading || sprintsLoading;

  // Build phase rows: one per project, pulling in the linked sprint
  const phases = projects.map((project) => {
    const sprint = sprints.find((s) => s.projectId === project.id && s.status === "active")
      ?? sprints.find((s) => s.projectId === project.id);

    const { label, color } = statusConfig(project.status);

    return {
      id:       project.id,
      name:     project.name,
      progress: project.progress ?? sprint?.phaseProgress ?? 0,
      owner:    sprint?.lead ?? sprint?.assignee ?? project.clientName ?? "—",
      due:      sprint?.endDate
        ? new Date(sprint.endDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
        : "—",
      status:   label,
      statusColor: color,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Phase Overview</h1>
          <Link to="/phases" className="text-sm text-blue-600 hover:underline">
            Full Phases View →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : phases.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No projects found</p>
            <Link to="/projects" className="text-blue-600 text-sm mt-2 block hover:underline">Create a project →</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {phases.map((phase) => (
              <Link key={phase.id} to="/phases" className="no-underline">
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{phase.name}</h2>
                    <span className={`text-white text-xs px-4 py-1 rounded-full ${phase.statusColor}`}>
                      {phase.status}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-6 mb-4 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 flex items-center justify-end pr-3 text-xs text-white font-semibold transition-all duration-700"
                      style={{ width: `${phase.progress}%`, minWidth: phase.progress > 0 ? "2rem" : "0" }}
                    >
                      {phase.progress}%
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Owner: {phase.owner}</p>
                    <p>Due: {phase.due}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-12 text-gray-600 text-sm">
          {[
            { color: "text-yellow-500", label: "In Progress" },
            { color: "text-red-500",    label: "Blocked" },
            { color: "text-green-400",  label: "Under Review" },
            { color: "text-green-800",  label: "Completed" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`${color} text-xl`}>●</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhaseOverview;