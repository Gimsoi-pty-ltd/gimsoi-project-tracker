import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle, ChevronDown, Check, Plus, Trash2 } from "lucide-react";
import NavyButton from "../Buttons/NavyButton";
import { useProjectStore } from "../../store/projectStore";
import { fetchAllPages } from "../../api/fetchAllPages";

const STATUS_OPTIONS = [
  { value: "DRAFT",   label: "Draft"   },
  { value: "ACTIVE",    label: "Active"    },
  { value: "COMPLETED",   label: "Completed"   },
  { value: "ARCHIVED", label: "Archived" },
];

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";

const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

// ─── Custom Dropdown ──────────────────────────────────────────────────────────
function Dropdown({ value, onChange, options, placeholder, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => (o.id || o.value) === value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        disabled={disabled}
        className={`${inputCls} flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-60 ${!selected ? "text-gray-400" : ""}`}
      >
        <span>{selected ? (selected.name || selected.label) : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto">
          {options.map((o) => {
            const val = o.id || o.value;
            const lbl = o.name || o.label;
            const isSelected = value === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => { onChange(val); setOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                  isSelected ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {lbl}
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function ProjectForm({ isOpen, onClose, project = null, onSuccess = null }) {
  const { createProject, updateProject, isLoading, error, clearError } = useProjectStore();

  const empty = {
    name: "",
    clientId: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "DRAFT",
    milestones: [],
    setupNotes: "",
  };

  const [formData, setFormData] = useState(empty);
  const [formError, setFormError] = useState(null);
  const [clientOptions, setClientOptions] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);
  const [clientsVersion, setClientsVersion] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setClientOptions(project?.client?.id ? [project.client] : []);
    const fetchOptions = async () => {
      setClientsLoading(true);
      setClientsError(null);
      try {
        const clients = await fetchAllPages('/clients');
        if (!cancelled) {
          const currentClient = project?.client;
          const options = currentClient?.id && !clients.some((client) => client.id === currentClient.id)
            ? [currentClient, ...clients]
            : clients;
          setClientOptions(options);
        }
      } catch (err) {
        if (!cancelled) setClientsError(err.response?.data?.message || "Could not load client options.");
      } finally {
        if (!cancelled) setClientsLoading(false);
      }
    };
    fetchOptions();
    return () => { cancelled = true; };
  }, [isOpen, project?.id, clientsVersion]);

  useEffect(() => {
    if (project) {
      // milestones is stored as a single String/null column on the backend,
      // so an existing project may hand us back a JSON string (or, for older
      // rows saved before this change, a plain-text value). Normalize it
      // back into an array for the UI either way.
      let parsedMilestones = [];
      if (Array.isArray(project.milestones)) {
        parsedMilestones = project.milestones;
      } else if (typeof project.milestones === "string" && project.milestones.trim() !== "") {
        try {
          const parsed = JSON.parse(project.milestones);
          parsedMilestones = Array.isArray(parsed) ? parsed : [project.milestones];
        } catch {
          parsedMilestones = [project.milestones]; // fallback for legacy plain-text values
        }
      }
      parsedMilestones = parsedMilestones.map((milestone) =>
        typeof milestone === "string" ? milestone : milestone?.label || milestone?.name || "",
      );

      setFormData({
        name:        project.name        || "",
        clientId:    project.clientId    || "",
        startDate:   project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
        endDate:     project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
        description: project.description || "",
        status:      project.status      || "DRAFT",
        milestones:  parsedMilestones,
        setupNotes:  project.setupNotes  || "",
      });
    } else {
      setFormData(empty);
    }
    setFormError(null);
    clearError();
  }, [project, isOpen, clearError]);

  const set = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Project name is required");
      return;
    }

    if (!project?.id && !formData.clientId) {
      setFormError("Client is required");
      return;
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setFormError("End date must be on or after the start date.");
      return;
    }

    const milestones = formData.milestones
      .map((milestone) => milestone.trim())
      .filter(Boolean);
    const serializedMilestones = JSON.stringify(milestones);
    if (serializedMilestones.length > 4000) {
      setFormError("Milestones exceed the 4,000 character limit. Shorten or remove some entries.");
      return;
    }

    // Only send fields the backend's Zod schema actually accepts
    // (createProjectSchema / updateProjectSchema). Anything else — like the
    // old `team` field — gets dropped here instead of causing a 400.
    // `milestones` is stored as a single String/null column, so serialize
    // the array rather than sending it as-is.
    const payload = {
      name: formData.name,
      clientId: formData.clientId,
      description: formData.description || undefined,
      status: formData.status,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      milestones: milestones.length
        ? serializedMilestones
        : null,
      setupNotes: formData.setupNotes || null,
    };

    try {
      if (project?.id) {
        // updateProjectSchema requires `version` for optimistic locking —
        // without it the backend 400s with "expected number, received undefined".
        // clientId isn't part of updateProjectSchema, so drop it on updates.
        const { clientId, ...updatePayload } = payload;
        await updateProject(project.id, { ...updatePayload, version: project.version });
      } else {
        await createProject(payload);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save project");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
              {project ? "Edit Project" : "Create Project"}
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              {project ? project.name : "New Project"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">Set the project details, delivery window, and key milestones.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form — scrollable body, header/footer stay fixed so Save is always reachable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-5 overflow-y-auto flex-1">

            {/* Error */}
            {(formError || error || clientsError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{formError || error || clientsError}</p>
                  {clientsError && !formError && !error && <button type="button" onClick={() => setClientsVersion((version) => version + 1)} className="mt-1 text-xs font-semibold text-red-800 underline">Retry loading clients</button>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left column */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Project details</h3>
                  <p className="mt-1 text-xs text-gray-500">Core information visible to project members.</p>
                </div>
                {/* Project Name */}
                <div>
                  <label className={labelCls}>Project Name *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Website Redesign"
                    className={inputCls}
                  />
                </div>

                {/* Client */}
                <div>
                  <label className={labelCls}>Client {!project && "*"}</label>
                  <Dropdown
                    value={formData.clientId}
                    onChange={(v) => set("clientId", v)}
                    options={clientOptions}
                    disabled={clientsLoading || Boolean(project)}
                    placeholder={clientsLoading ? "Loading clients..." : "Select a client"}
                  />
                  {!clientsLoading && clientOptions.length === 0 && !clientsError && <p className="mt-1 text-xs text-amber-700">No clients are available. Add a client before creating a project.</p>}
                  {project && (
                    <p className="mt-1 text-xs text-gray-400">Client can't be changed after a project is created.</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Status</label>
                  <Dropdown
                    value={formData.status}
                    onChange={(v) => set("status", v)}
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Brief project description..."
                    maxLength={2000}
                    rows={4}
                    className={`${inputCls} resize-none`}
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{formData.description.length}/2000</p>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Schedule &amp; milestones</h3>
                  <p className="mt-1 text-xs text-gray-500">Dates help teams understand the intended delivery window.</p>
                </div>
                {/* Start + End Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => set("startDate", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => set("endDate", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Setup Notes */}
                <div>
                  <label className={labelCls}>Setup Notes</label>
                  <textarea
                    value={formData.setupNotes}
                    onChange={(e) => set("setupNotes", e.target.value)}
                    placeholder="Internal notes about getting this project up and running..."
                    maxLength={4000}
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{formData.setupNotes.length}/4000</p>
                </div>

                {/* Milestones */}
                <div>
                  <label className={labelCls}>Milestones</label>
                  <p className="mb-3 text-xs leading-relaxed text-gray-500">
                    Milestones are major project checkpoints that mark meaningful outcomes, not individual tasks or work phases. Examples: “Design approved”, “Beta launched”, or “Client handoff”. They appear on the project timeline; track day-to-day work in tasks and phases.
                  </p>
                  <div className="space-y-2">
                    {formData.milestones?.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={250}
                          aria-label={`Milestone ${idx + 1}`}
                          placeholder={`Milestone ${idx + 1}`}
                          value={m}
                          onChange={(e) => {
                            const newMilestones = [...formData.milestones];
                            newMilestones[idx] = e.target.value;
                            set("milestones", newMilestones);
                          }}
                          className={inputCls} />
                        <button type="button" aria-label={`Remove milestone ${idx + 1}`} onClick={() => {
                          const newMilestones = formData.milestones.filter((_, i) => i !== idx);
                          set("milestones", newMilestones);
                        }} className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
                    onClick={() => set("milestones", [...(formData.milestones || []), ""])}
                  >
                    <Plus size={16} /> Add milestone
                  </button>
                </div>

                {/* Where to go next — sprints/phases/tasks live on their own pages,
                    not bundled into this form, so this modal stays focused. */}
                {project && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
                    Manage sprints from this project's Overview page, phases from the
                    Phases page, and tasks (linked to a sprint and/or phase) from the
                    Dashboard's "+ Add Task" button.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions — always visible, never scrolls away */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-slate-900 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <NavyButton
              type="submit"
              disabled={isLoading || clientsLoading || (!project && clientOptions.length === 0)}
              className="flex-1 px-4 py-2.5  hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? project ? "Saving..." : "Creating..."
                : project ? "Save Changes" : "Save"}
            </NavyButton>
          </div>
        </form>
      </div>
    </div>
  );
}