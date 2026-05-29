// src/Pages/Reports and Exporting/reports.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
import { useSprintStore } from "../../store/sprintStore";
import EmptyState from "../../Components/EmptyState";
import ErrorAlert from "../../Components/ErrorAlert";
import LoadingSpinner from "../../Components/LoadingSpinner";

export default function ReportsHub() {
  const { currentProject, fetchProjects, isLoading: projectsLoading } = useProjectStore();
  const { sprints, getSprints, isLoading: sprintsLoading } = useSprintStore();
  const [error, setError] = useState(null);

  const activeProject = currentProject;
  const activeSprint  = sprints.find((s) => s.status === "active") || sprints[0];
  const metrics       = activeSprint ?? {};
  const isLoading     = projectsLoading || sprintsLoading;

  useEffect(() => {
    const load = async () => {
      try {
        await fetchProjects();
        setError(null);
      } catch (err) {
        setError("Failed to load reports. Please try again.");
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (activeProject?.id) getSprints({ projectId: activeProject.id });
  }, [activeProject?.id]);

  const reports = [
    {
      name:         "Sprint Report",
      velocity:     `${metrics.velocity ?? metrics.completedPoints ?? "—"} pts`,
      completion:   `${metrics.completionPercentage ?? "—"}%`,
      contribution: metrics.deliveryRisk === "Low" ? "High" : metrics.deliveryRisk === "Medium" ? "Medium" : "At Risk",
      path:         "/reports/sprint-report",
    },
    {
      name:         "Project Report",
      velocity:     `${metrics.avgVelocity ?? "—"} pts avg`,
      completion:   `${activeProject?.progress ?? "—"}%`,
      contribution: activeProject?.status ?? "—",
      path:         "/reports/project-report",
    },
    {
      name:         "Team Performance",
      velocity:     `${metrics.sprintHealth ?? "—"}%`,
      completion:   `${metrics.goalCompletionPercentage ?? "—"}%`,
      contribution: metrics.deliveryRisk ?? "—",
      path:         "/reports/team-performance",
    },
  ];

  
  const contributionBadge = (contribution) => {
    if (contribution === "High" || contribution === "Active") return "bg-green-100 text-green-700";
    if (contribution === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  if (isLoading) return <LoadingSpinner size="lg" message="Loading reports..." />;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Reports Hub</h1>
        <p className="text-sm text-gray-500 mt-1">
          {activeProject?.name ?? "No project selected"} · {activeSprint?.name ?? "No active sprint"}
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {!activeProject || !activeSprint ? (
        <EmptyState
          title="No Projects or Sprints"
          message="Create a project and sprint to view reports."
          actionLabel="Go to Projects"
          onAction={() => (window.location.href = "/projects")}
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {reports.map((report, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow border">
                <Link to={report.path} className="font-semibold text-slate-900 hover:text-blue-600">
                  {report.name}
                </Link>
                <div className="text-sm text-slate-600 mt-2 space-y-1">
                  <p>Velocity: {report.velocity}</p>
                  <p>Completion: {report.completion}</p>
                  <p>Contribution: {report.contribution}</p>
                </div>
                <button className="mt-3 inline-flex items-center gap-2 text-blue-600 text-sm">
                  <Download size={16} /> Download PDF
                </button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[520px]">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-6 py-4 font-semibold text-sm">Report Name</th>
                    <th className="px-6 py-4 font-semibold text-sm">Velocity</th>
                    <th className="px-6 py-4 font-semibold text-sm">Task Completion</th>
                    <th className="px-6 py-4 font-semibold text-sm">Contribution</th>
                    <th className="px-6 py-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={report.path}
                          className="font-semibold text-slate-900 hover:text-blue-600 no-underline"
                        >
                          {report.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{report.velocity}</td>
                      <td className="px-6 py-4 text-slate-600">{report.completion}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${contributionBadge(report.contribution)}`}>
                          {report.contribution}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="inline-flex items-center gap-2 text-blue-600 text-sm hover:underline">
                          <Download size={16} /> Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}