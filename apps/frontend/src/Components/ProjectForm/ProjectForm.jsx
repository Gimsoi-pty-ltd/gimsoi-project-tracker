import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle, ChevronDown, Check, Calendar } from "lucide-react";
import NavyButton from "../Buttons";
import { useProjectStore } from "../../store/projectStore";
import { resourceAPI } from "../../api/api";

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
function Dropdown({ label, value, onChange, options, placeholder }) {
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
        className={`${inputCls} flex items-center justify-between text-left ${!selected ? "text-gray-400" : ""}`}
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
  const { createProject, updateProject, isLoading, error } = useProjectStore();

  const empty = {
    name: "",
    clientId: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "DRAFT",
    milestones: [],
  };

  const [formData, setFormData] = useState(empty);
  const [formError, setFormError] = useState(null);
  const [clientOptions, setClientOptions] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchOptions = async () => {
      try {
        const clientsRes = await resourceAPI.get('/clients');
        const clients = clientsRes.data?.data ?? clientsRes.data.clients ?? [];
        setClientOptions(clients);
      } catch (err) {
        console.error("Failed to fetch form options:", err);
      }
    };
    fetchOptions();
  }, [isOpen]);

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

      setFormData({
        name:        project.name        || "",
        clientId:    project.clientId    || "",
        startDate:   project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
        endDate:     project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
        description: project.description || "",
        status:      project.status      || "DRAFT",
        milestones:  parsedMilestones,
      });
    } else {
      setFormData(empty);
    }
    setFormError(null);
  }, [project, isOpen]);

  const set = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Project name is required");
      return;
    }

    // Only send fields the backend's Zod schema actually accepts
    // (createProjectSchema / updateProjectSchema). Anything else — like the
    // old `team` field — gets dropped here instead of causing a 400.
    // `milestones` is stored as a single String/null column, so serialize
    // the array rather than sending it as-is.
    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      status: formData.status,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      milestones: formData.milestones?.length
        ? JSON.stringify(formData.milestones.filter((m) => m.trim() !== ""))
        : null,
      ...(project?.id ? { version: project.version } : { clientId: formData.clientId }),
    };

    try {
      if (project?.id) {
        await updateProject(project.id, payload);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
              {project ? "Edit Project" : "Create Project"}
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              {project ? project.name : "New Project"}
            </h2>
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
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

            {/* Error */}
            {(formError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{formError || error}</p>
              </div>
            )}

            {/* Project Name */}
            <div>
              <label className={labelCls}>Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Website Redesign"
                className={inputCls}
              />
            </div>

            {/* Client */}
            <div>
              <label className={labelCls}>Client</label>
              <Dropdown
                value={formData.clientId}
                onChange={(v) => set("clientId", v)}
                options={clientOptions}
                placeholder="Acme Corp, TechStart Inc..."
              />
            </div>

            {/* Start + End Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className={inputCls}
                  />
                </div>
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

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief project description..."
                className={inputCls}
              />
            </div>

            {/* Milestones */}
            <div>
              <label className={labelCls}>Milestones</label>
              <div className="space-y-2">
                {formData.milestones?.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => {
                        const newMilestones = [...formData.milestones];
                        newMilestones[idx] = e.target.value;
                        set("milestones", newMilestones);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm" />
                    <button type="button" onClick={() => {
                      const newMilestones = formData.milestones.filter((_, i) => i !== idx);
                      set("milestones", newMilestones);
                    }} className="text-red-500 ml-2">Remove</button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
                onClick={() => set("milestones", [...(formData.milestones || []), ""])}
              >
                + Add milestone
              </button>
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

            {/* Where to go next — sprints/phases/tasks live on their own pages,
                not bundled into this form, so this modal stays short. */}
            {project && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
                Manage sprints from this project's Overview page, phases from the
                Phases page, and tasks (linked to a sprint and/or phase) from the
                Dashboard's "+ Add Task" button.
              </div>
            )}
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
              disabled={isLoading}
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