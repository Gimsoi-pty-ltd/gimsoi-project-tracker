// src/Pages/Phases/Phases-of-tasks.jsx
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, ChevronDown } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
import { usePhaseStore } from "../../store/phaseStore";
import NavyButton from "../../Components/Buttons";
import EmptyState from "../../Components/EmptyState";
import ErrorAlert from "../../Components/ErrorAlert";
import LoadingSpinner from "../../Components/LoadingSpinner";

// Must match the backend's PhaseStatus enum (see phase.schema.js)
const STATUS_CONFIG = {
  DRAFT: { label: "Draft", dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100" },
  ACTIVE: { label: "Active", dot: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50" },
  COMPLETED: { label: "Completed", dot: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" },
};
const getStatusCfg = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

const PROGRESS_COLOR = (pct) => {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 60) return "bg-blue-500";
  return "bg-orange-400";
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

function StatusSelect({ status, onChange }) {
  const cfg = getStatusCfg(status);
  return (
    <div className={`relative inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none text-xs font-medium appearance-none pr-4 cursor-pointer"
      >
        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 opacity-60 pointer-events-none absolute right-1.5" />
    </div>
  );
}

function NewPhaseModal({ onClose, onCreate, saving }) {
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "", status: "DRAFT" });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Phase</h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Phase name</label>
            <input
              name="name"
              value={form.name}
              onChange={change}
              placeholder="e.g. Discovery & Planning"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Start date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={change}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">End date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={change}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Status</label>
            <select name="status" value={form.status} onChange={change}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 text-sm transition-colors">
            Cancel
          </button>
          <NavyButton
            disabled={!form.name.trim() || saving}
            onClick={() =>
              onCreate({
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
                endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
                status: form.status,
              })
            }
            className="flex-1 !min-w-0 px-4 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Phase"}
          </NavyButton>
        </div>
      </div>
    </div>
  );
}

export default function ProjectPhases() {
  const projects = useProjectStore((s) => s.projects);
  const currentProject = useProjectStore((s) => s.currentProject);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);

  const { phases, isLoading, error, fetchPhases, createPhase, updatePhase, deletePhase, getMilestoneStatus, clearError } = usePhaseStore();
  const [progressByPhase, setProgressByPhase] = useState({});
  const [showNewPhase, setShowNewPhase] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load projects once, default to the first one if nothing is selected yet.
  useEffect(() => {
    if (!projects.length) fetchProjects();
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    if (!currentProject && projects.length) {
      setCurrentProject(projects[0]);
    }
  }, [currentProject, projects, setCurrentProject]);

  // Load phases for whichever project is selected.
  useEffect(() => {
    if (currentProject?.id) fetchPhases(currentProject.id);
  }, [currentProject?.id, fetchPhases]);

  // Once phases load, fetch each one's real completion % from the milestone endpoint.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        phases.map(async (p) => {
          const status = await getMilestoneStatus(p.id);
          return [p.id, status?.percentComplete ?? 0];
        })
      );
      if (!cancelled) setProgressByPhase(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases.map((p) => p.id).join(",")]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createPhase({ ...data, projectId: currentProject.id });
      setShowNewPhase(false);
    } catch (err) {
      console.error("Failed to create phase:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (phase, status) => {
    try {
      await updatePhase(phase.id, { status, version: phase.version });
    } catch (err) {
      console.error("Failed to update phase status:", err);
    }
  };

  const handleDelete = async (phase) => {
    if (!window.confirm(`Delete phase "${phase.name}"? Tasks in it will be unassigned from it.`)) return;
    try {
      await deletePhase(phase.id);
    } catch (err) {
      console.error("Failed to delete phase:", err);
    }
  };

  return (
    <div className="bg-[#f5f7fb] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Phases</h1>
            <p className="text-gray-400 text-sm mt-0.5">Break a project into phases and track each one's completion</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={currentProject?.id || ""}
              onChange={(e) => {
                const proj = projects.find((p) => p.id === e.target.value);
                if (proj) setCurrentProject(proj);
              }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <NavyButton
              onClick={() => setShowNewPhase(true)}
              disabled={!currentProject}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Phase
            </NavyButton>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert
              message={error}
              type="error"
              onDismiss={clearError}
              actions={[{ label: "Retry", onClick: () => currentProject && fetchPhases(currentProject.id) }]}
            />
          </div>
        )}

        {!currentProject ? (
          <EmptyState title="No project selected" message="Create a project first, then add phases to it." />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1.2fr_0.9fr_40px] px-6 py-3 border-b border-gray-100 bg-gray-50/60">
              {["PHASE", "START", "END", "PROGRESS", "STATUS", ""].map((h) => (
                <div key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
              ))}
            </div>

            {isLoading && !phases.length && <LoadingSpinner size="md" message="Loading phases..." />}

            {!isLoading && !phases.length && (
              <EmptyState
                title="No phases yet"
                message={`Break "${currentProject.name}" into phases (e.g. Discovery, Build, Launch) to track progress stage by stage.`}
                onAction={() => setShowNewPhase(true)}
                actionLabel="Add Phase"
              />
            )}

            {phases.map((phase) => {
              const pct = progressByPhase[phase.id] ?? 0;
              return (
                <div key={phase.id} className="grid grid-cols-[1.6fr_1fr_1fr_1.2fr_0.9fr_40px] items-center px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors group">
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-gray-900 truncate">{phase.name}</p>
                    {phase.description && <p className="text-xs text-gray-400 truncate">{phase.description}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{phase._count?.tasks ?? 0} tasks</p>
                  </div>

                  <div className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-300" /> {fmtDate(phase.startDate)}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-300" /> {fmtDate(phase.endDate)}
                  </div>

                  <div className="flex items-center gap-3 pr-4">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div style={{ width: `${Math.min(pct, 100)}%` }} className={`h-full rounded-full transition-all duration-500 ${PROGRESS_COLOR(pct)}`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 w-9 text-right tabular-nums">{pct}%</span>
                  </div>

                  <div>
                    <StatusSelect status={phase.status} onChange={(status) => handleStatusChange(phase, status)} />
                  </div>

                  <button
                    onClick={() => handleDelete(phase)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete phase"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNewPhase && (
        <NewPhaseModal onClose={() => setShowNewPhase(false)} onCreate={handleCreate} saving={saving} />
      )}
    </div>
  );
}
