// src/Components/Dashboard/DaysRemainingPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSprintStore } from "../../store/sprintStore";
import { useTaskStore } from "../../store/taskStore";

const DaysRemainingPage = () => {
  const navigate           = useNavigate();
  const location           = useLocation();
  const [search, setSearch] = useState("");

  const { sprints }  = useSprintStore();
  const { tasks }    = useTaskStore();

  
  const activeSprint = location.state?.sprint
    ?? sprints.find((s) => s.status === "active")
    ?? sprints[0];

  // Calculate days remaining
  const { daysLeft, totalDays, progressPercent } = React.useMemo(() => {
    if (!activeSprint?.endDate) return { daysLeft: 0, totalDays: 14, progressPercent: 0 };
    const now   = new Date();
    const end   = new Date(activeSprint.endDate);
    const start = activeSprint.startDate ? new Date(activeSprint.startDate) : new Date(end - 14 * 86400000);
    const total = Math.max(1, Math.ceil((end - start) / 86400000));
    const left  = Math.max(0, Math.ceil((end - now)  / 86400000));
    const used  = total - left;
    return { daysLeft: left, totalDays: total, progressPercent: Math.round((used / total) * 100) };
  }, [activeSprint]);

  const isUrgent   = daysLeft <= 5;
  const isCritical = daysLeft <= 2;
  const strokeColor = isCritical ? "#dc2626" : isUrgent ? "#f59e0b" : "#3b82f6";

  // Sprint tasks broken by status
  const sprintTasks = tasks.filter((t) => !activeSprint?.id || t.sprintId === activeSprint.id);
  const inProgress  = sprintTasks.filter((t) => t.status === "inProgress" || t.status === "in_progress");
  const blocked     = sprintTasks.filter((t) => t.status === "blocked");
  const completed   = sprintTasks.filter((t) => t.status === "done" || t.status === "completed");

  // Filter by search query
  const filteredTasks = sprintTasks.filter((t) =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.assignee?.toLowerCase().includes(search.toLowerCase())
  );

  const deadlineStr = activeSprint?.endDate
    ? new Date(activeSprint.endDate).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const timelineGradient = isCritical
    ? "linear-gradient(to right, #ef4444, #dc2626)"
    : isUrgent
    ? "linear-gradient(to right, #fbbf24, #f59e0b)"
    : "linear-gradient(to right, #60a5fa, #3b82f6)";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col items-center gap-4 mb-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700">Days Remaining</h1>
            <p className="text-gray-600 mt-1">
              Sprint Deadline: <span className="font-medium text-blue-700">{deadlineStr}</span>
            </p>
            {activeSprint?.name && (
              <p className="text-sm text-gray-500 mt-0.5">{activeSprint.name}</p>
            )}
          </div>

          <div className="flex items-center gap-4 w-full justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div className="min-w-[240px] max-w-sm flex-1 relative">
              <input
                type="text"
                placeholder="Search tasks, blockers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Hero countdown */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">Time Left Until Deadline</h2>
          <p className="text-gray-500 mb-8">Project: {activeSprint?.goal ?? "—"}</p>

          <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#e5e7eb" strokeWidth="3.5" />
              <circle
                cx="18" cy="18" r="16"
                fill="transparent"
                stroke={strokeColor}
                strokeWidth="3.5"
                strokeDasharray={`${progressPercent * 0.314} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl md:text-7xl font-extrabold text-black">{daysLeft}</span>
              <span className="text-xl font-medium text-gray-600 mt-1">{daysLeft === 1 ? "day" : "days"}</span>
              <span className="text-sm font-medium mt-2 uppercase tracking-wide text-gray-700">
                {isCritical ? "CRITICAL" : isUrgent ? "URGENT" : "ON TRACK"}
              </span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-500 uppercase">Elapsed</p>
              <p className="text-2xl font-bold text-gray-800">{progressPercent}%</p>
            </div>
            <div className="border-l border-r border-gray-200">
              <p className="text-sm text-gray-500 uppercase">Remaining</p>
              <p className="text-2xl font-bold text-gray-800">{100 - progressPercent}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total</p>
              <p className="text-2xl font-bold text-gray-800">{totalDays} days</p>
            </div>
          </div>
        </div>

        {/* Timeline bar */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sprint Timeline</h3>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%`, background: timelineGradient }} />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Start</span>
            <span className="font-medium">Today ({progressPercent}%)</span>
            <span>Deadline</span>
          </div>
        </div>

        {/* Tasks impacting deadline */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Tasks Impacting Deadline</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* In Progress */}
            <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h4 className="font-semibold text-gray-900">In Progress ({inProgress.length})</h4>
              </div>
              {inProgress.slice(0, 3).map((t) => (
                <div key={t.id} className="mb-2">
                  <p className="font-medium text-gray-900 text-sm truncate">{t.title}</p>
                  {t.assignee && <p className="text-xs text-gray-500">Assigned: {t.assignee}</p>}
                </div>
              ))}
              {inProgress.length === 0 && <p className="text-sm text-gray-400">None</p>}
            </div>

            {/* Blocked */}
            <div className="border border-red-100 bg-red-50/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <h4 className="font-semibold text-gray-900">Blocked ({blocked.length})</h4>
              </div>
              {blocked.slice(0, 3).map((t) => (
                <div key={t.id} className="mb-2">
                  <p className="font-medium text-gray-900 text-sm truncate">{t.title}</p>
                  {t.assignee && <p className="text-xs text-gray-500">Assigned: {t.assignee}</p>}
                </div>
              ))}
              {blocked.length === 0 && <p className="text-sm text-gray-400">None</p>}
            </div>

            {/* Completed */}
            <div className="border border-green-100 bg-green-50/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <h4 className="font-semibold text-gray-900">Completed ({completed.length})</h4>
              </div>
              {completed.slice(0, 3).map((t) => (
                <div key={t.id} className="mb-2">
                  <p className="font-medium text-gray-900 text-sm truncate">{t.title}</p>
                </div>
              ))}
              {completed.length === 0 && <p className="text-sm text-gray-400">None</p>}
            </div>
          </div>
        </div>

        {/* Search results */}
        {search && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results ({filteredTasks.length})</h3>
            <div className="divide-y divide-gray-100">
              {filteredTasks.length === 0 ? (
                <p className="text-gray-400 text-sm py-4">No tasks match "{search}"</p>
              ) : (
                filteredTasks.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{t.title}</p>
                      {t.assignee && <p className="text-xs text-gray-500">{t.assignee}</p>}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      t.status === "blocked"   ? "bg-red-100 text-red-700" :
                      t.status === "done"      ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{t.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Risk alert */}
        <div className={`border rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 ${
          isCritical ? "bg-red-50 border-red-200" : isUrgent ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"
        }`}>
          <div>
            <h3 className={`text-xl font-bold ${isCritical ? "text-red-700" : isUrgent ? "text-amber-700" : "text-blue-700"}`}>
              ⚠ Risk Level: {isCritical ? "CRITICAL" : isUrgent ? "HIGH" : "MODERATE"}
            </h3>
            <p className="text-gray-700 mt-2">
              {isCritical
                ? `Immediate action required — ${blocked.length} task(s) blocked and deadline critical.`
                : isUrgent
                ? "Deadline approaching — review blockers and reassign if needed."
                : "Sprint is on track, but monitor closely."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate("/tasks/blocked")} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              View Blockers
            </button>
            <button onClick={() => navigate("/users")} className="px-5 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition">
              Reassign Tasks
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DaysRemainingPage;