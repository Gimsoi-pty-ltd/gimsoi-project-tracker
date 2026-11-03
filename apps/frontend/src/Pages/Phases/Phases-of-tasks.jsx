import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Circle, Clock3, Layers3, Pencil, Plus, Trash2 } from "lucide-react";
import { useProjectStore, fetchAllProjectTasks } from "../../store/projectStore";
import { usePhaseStore } from "../../store/phaseStore";
import { useAuthStore } from "../../store/authStore";
import { hasPermission } from "../../utils/accessControl";
import ErrorAlert from "../../Components/utils/ErrorAlert";
import LoadingSpinner from "../../Components/LoadingState/LoadingSpinner";

const EMPTY_PHASE = { name: "", description: "", startDate: "", endDate: "", status: "DRAFT" };
const STATUS_STYLE = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-blue-50 text-blue-800",
  COMPLETED: "bg-emerald-50 text-emerald-800",
};

const parseMilestones = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return [value];
  }
};

const toInputDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : "";
const toApiDate = (value) => value ? new Date(value).toISOString() : null;

export default function PhasesPage() {
  const user = useAuthStore((state) => state.user);
  const canManagePhases = hasPermission(user?.role, "MANAGE_PHASES");
  const currentProject = useProjectStore((state) => state.currentProject);
  const projects = useProjectStore((state) => state.projects);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const phases = usePhaseStore((state) => state.phases);
  const isLoading = usePhaseStore((state) => state.isLoading);
  const error = usePhaseStore((state) => state.error);
  const clearError = usePhaseStore((state) => state.clearError);
  const fetchPhases = usePhaseStore((state) => state.fetchPhases);
  const createPhase = usePhaseStore((state) => state.createPhase);
  const updatePhase = usePhaseStore((state) => state.updatePhase);
  const deletePhase = usePhaseStore((state) => state.deletePhase);
  const [tasks, setTasks] = useState([]);
  const [taskLoadError, setTaskLoadError] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [form, setForm] = useState(EMPTY_PHASE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentProject?.id) {
      setTasks([]);
      return undefined;
    }

    let cancelled = false;
    setTaskLoading(true);
    setTaskLoadError(null);
    Promise.all([fetchPhases(currentProject.id), fetchAllProjectTasks(currentProject.id)])
      .then(([, projectTasks]) => {
        if (!cancelled) setTasks(projectTasks);
      })
      .catch((loadError) => {
        if (!cancelled) setTaskLoadError(loadError.response?.data?.message || "Could not load phase task details.");
      })
      .finally(() => {
        if (!cancelled) setTaskLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentProject?.id, fetchPhases]);

  const milestones = useMemo(() => parseMilestones(currentProject?.milestones), [currentProject?.milestones]);
  const taskStats = useMemo(() => {
    const byPhase = new Map();
    tasks.forEach((task) => {
      const summary = byPhase.get(task.phaseId) || { total: 0, completed: 0, storyPoints: 0 };
      summary.total += 1;
      if (task.status === "DONE") summary.completed += 1;
      summary.storyPoints += Number(task.storyPoints) || 0;
      byPhase.set(task.phaseId, summary);
    });
    return byPhase;
  }, [tasks]);
  const totalPoints = tasks.reduce((sum, task) => sum + (Number(task.storyPoints) || 0), 0);
  const assignedTasks = tasks.filter((task) => task.phaseId).length;

  const openCreate = () => {
    setEditingPhase(null);
    setForm(EMPTY_PHASE);
    setShowForm(true);
  };

  const openEdit = (phase) => {
    setEditingPhase(phase);
    setForm({
      name: phase.name || "",
      description: phase.description || "",
      startDate: toInputDate(phase.startDate),
      endDate: toInputDate(phase.endDate),
      status: phase.status || "DRAFT",
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentProject?.id || !form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      startDate: toApiDate(form.startDate),
      endDate: toApiDate(form.endDate),
      status: form.status,
    };

    try {
      if (editingPhase) {
        await updatePhase(editingPhase.id, { ...payload, version: editingPhase.version });
      } else {
        await createPhase({ ...payload, projectId: currentProject.id, order: phases.length });
      }
      await fetchPhases(currentProject.id);
      setShowForm(false);
    } catch {
      
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (phase) => {
    if (!window.confirm(`Delete phase "${phase.name}"? Its tasks will remain unassigned.`)) return;
    try {
      await deletePhase(phase.id);
    } catch {
      
    }
  };

  if (!currentProject && projects.length === 0) {
    return <LoadingSpinner size="md" message="Loading projects..." />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">Project delivery</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Phases &amp; milestones</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {projects.length > 1 && (
              <label className="sr-only" htmlFor="phase-project">Select project</label>
            )}
            {projects.length > 1 && (
              <select
                id="phase-project"
                value={currentProject?.id || ""}
                onChange={(event) => setCurrentProject(projects.find((project) => project.id === event.target.value))}
                className="min-w-52 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              >
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            )}
            {canManagePhases && currentProject && (
              <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                <Plus size={16} /> Add phase
              </button>
            )}
          </div>
        </header>

        {error && <ErrorAlert message={error} type="error" onDismiss={clearError} />}
        {taskLoadError && <ErrorAlert message={taskLoadError} type="error" onDismiss={() => setTaskLoadError(null)} />}

        {!currentProject ? (
          <section className="border-y border-slate-200 py-10 text-center text-slate-500">Select a project to see its phases.</section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="border-b border-slate-200 py-4 sm:border-r sm:pr-5">
                <p className="text-sm text-slate-500">Phases</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">{phases.length}</p>
              </div>
              <div className="border-b border-slate-200 py-4 sm:border-r sm:px-5">
                <p className="text-sm text-slate-500">Tasks assigned to phases</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">{assignedTasks} <span className="text-base font-normal text-slate-500">/ {tasks.length}</span></p>
              </div>
              <div className="py-4 sm:pl-5">
                <p className="text-sm text-slate-500">Story points in project</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">{totalPoints}</p>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Project phases</h2>
                  <p className="mt-1 text-sm text-slate-500">Task counts and story points are calculated from tasks assigned to each phase.</p>
                </div>
              </div>

              {isLoading || taskLoading ? (
                <LoadingSpinner size="sm" message="Loading project phases..." />
              ) : phases.length === 0 ? (
                <div className="border-y border-dashed border-slate-300 py-10 text-center">
                  <Layers3 className="mx-auto text-slate-400" size={28} />
                  <p className="mt-3 font-medium text-slate-800">No phases created for this project</p>
                  <p className="mt-1 text-sm text-slate-500">Create phases, then assign tasks and story points to track delivery.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border-y border-slate-200">
                  {phases.map((phase) => {
                    const summary = taskStats.get(phase.id) || { total: 0, completed: 0, storyPoints: 0 };
                    const percent = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0;
                    return (
                      <article key={phase.id} className="grid gap-4 py-5 md:grid-cols-[minmax(0,1.3fr)_minmax(220px,1fr)_auto] md:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900">{phase.name}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[phase.status] || STATUS_STYLE.DRAFT}`}>{phase.status}</span>
                          </div>
                          {phase.description && <p className="mt-1 text-sm text-slate-600">{phase.description}</p>}
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {phase.startDate ? new Date(phase.startDate).toLocaleDateString() : "No start date"} – {phase.endDate ? new Date(phase.endDate).toLocaleDateString() : "No end date"}</span>
                            <span className="inline-flex items-center gap-1"><Layers3 size={13} /> {summary.storyPoints} story points</span>
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-slate-600">{summary.completed} of {summary.total} tasks complete</span>
                            <span className="font-semibold text-slate-900">{percent}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                        {canManagePhases && (
                          <div className="flex items-center gap-2 md:justify-end">
                            <button type="button" onClick={() => openEdit(phase)} title="Edit phase" aria-label={`Edit ${phase.name}`} className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-white"><Pencil size={15} /></button>
                            <button type="button" onClick={() => handleDelete(phase)} title="Delete phase" aria-label={`Delete ${phase.name}`} className="rounded-md border border-slate-300 p-2 text-red-700 hover:bg-red-50"><Trash2 size={15} /></button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 border-b border-slate-200 pb-3">
                <h2 className="text-lg font-semibold text-slate-950">Project milestones</h2>
                <p className="mt-1 text-sm text-slate-500">Milestones are project checkpoints. They are separate from phases and task story points.</p>
              </div>
              {milestones.length ? (
                <ol className="divide-y divide-slate-200 border-y border-slate-200">
                  {milestones.map((milestone, index) => {
                    const label = typeof milestone === "string" ? milestone : milestone?.label || milestone?.name || `Milestone ${index + 1}`;
                    const status = typeof milestone === "object" ? milestone?.status : null;
                    const date = typeof milestone === "object" ? milestone?.date : null;
                    return (
                      <li key={`${label}-${index}`} className="flex items-start gap-3 py-4">
                        <span className="mt-0.5 text-blue-700">{status === "COMPLETED" ? <Check size={18} /> : status === "ACTIVE" ? <Clock3 size={18} /> : <Circle size={18} />}</span>
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
                          <p className="font-medium text-slate-800">{label}</p>
                          <div className="mt-1 flex gap-3 text-xs text-slate-500 sm:mt-0">
                            {status && <span>{status.replaceAll("_", " ")}</span>}
                            {date && <span>{new Date(date).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="border-y border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">No project milestones have been added yet. Add them from project settings.</p>
              )}
            </section>
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
          <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-950">{editingPhase ? "Edit phase" : "Add phase"}</h2>
            <label className="block text-sm font-medium text-slate-700">Name<input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="block text-sm font-medium text-slate-700">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Start<input type="datetime-local" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
              <label className="block text-sm font-medium text-slate-700">End<input type="datetime-local" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            </div>
            <label className="block text-sm font-medium text-slate-700">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option></select></label>
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : editingPhase ? "Save phase" : "Create phase"}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
