import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle, ChevronDown, Check, Calendar } from "lucide-react";
import NavyButton from "../Buttons";
import { useProjectStore } from "../../store/projectStore";

import { resourceAPI } from "../../api/api";

const STATUS_OPTIONS = [
  { value: "PLANNED",   label: "Planned"   },
  { value: "ACTIVE",    label: "Active"    },
  { value: "ON_HOLD",   label: "On Hold"   },
  { value: "COMPLETED", label: "Completed" },
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

// ─── Multi-select Team ────────────────────────────────────────────────────────
function MultiSelect({ value = [], onChange, teamOptions = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (member) => {
    onChange(
      value.includes(member) ? value.filter((m) => m !== member) : [...value, member]
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`${inputCls} flex items-center justify-between text-left min-h-[42px]`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {value.length === 0 ? (
            <span className="text-gray-400">Select team members...</span>
          ) : (
            value.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
              >
                {m}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggle(m); }}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto">
          {teamOptions.map((member) => {
            const selected = value.includes(member);
            return (
              <button
                key={member}
                type="button"
                onClick={() => toggle(member)}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                  selected ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {member}
                {selected && <Check className="w-4 h-4" />}
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
    status: "PLANNED",
    team: [],
  };

  const [formData, setFormData] = useState(empty);
  const [formError, setFormError] = useState(null);
  const [clientOptions, setClientOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchOptions = async () => {
      try {
        const [clientsRes, usersRes] = await Promise.all([
          resourceAPI.get('/clients'),
          resourceAPI.get('/users')
        ]);
        const clients = clientsRes.data.clients || clientsRes.data.data || [];
        const users = usersRes.data.users || usersRes.data.data || [];
        setClientOptions(clients);
        setTeamOptions(users.map(u => u.fullName || u.email || 'Unknown'));
      } catch (err) {
        console.error("Failed to fetch form options:", err);
      }
    };
    fetchOptions();
  }, [isOpen]);

  useEffect(() => {
    if (project) {
      setFormData({
        name:        project.name        || "",
        clientId:    project.clientId    || "",
        startDate:   project.startDate   || "",
        endDate:     project.endDate     || "",
        description: project.description || "",
        status:      project.status      || "PLANNED",
        team:        project.team        || [],
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

    try {
      if (project?.id) {
        await updateProject(project.id, formData);
      } else {
        await createProject(formData);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save project");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
              {project ? "Edit Project" : "+ Create / Edit Project"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

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

          {/* Assign Team */}
          <div>
            <label className={labelCls}>Assign Team</label>
            <MultiSelect
              value={formData.team}
              onChange={(v) => set("team", v)}
              teamOptions={teamOptions}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-1">
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