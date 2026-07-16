import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle, ChevronDown, Check, Calendar } from "lucide-react";
import NavyButton from "../Buttons";
import { useProjectStore } from "../../store/projectStore";
import { useSprintStore } from "../../store/sprintStore";
import { useTaskStore } from "../../store/taskStore";

import { resourceAPI } from "../../api/api";
import TaskForm from "../../Components/Tasks/TaskForm";

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
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); toggle(m); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(m);
                    }
                  }}
                  className="hover:text-blue-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </span>
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
  const { createSprint } = useSprintStore();
  const { createTask } = useTaskStore();

  const empty = {
    name: "",
    clientId: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "PLANNED",
    team: [],
    milestones: [],
  };

  const [formData, setFormData] = useState(empty);
  const [queuedSprints, setQueuedSprints] = useState([]);
  const [formError, setFormError] = useState(null);
  const [clientOptions, setClientOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [userOptionsFull, setUserOptionsFull] = useState([]);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalSprintIdx, setTaskModalSprintIdx] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', storyPoints: '', parentTaskId: '', assigneeId: '', ownerIds: [], teamIds: []
  });

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
        setUserOptionsFull(users.map(u => ({ id: u.id, label: u.fullName || u.email || 'Unknown' })));
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
        startDate:   project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
        endDate:     project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
        description: project.description || "",
        status:      project.status      || "PLANNED",
        team:        project.team        || [],
        milestones:  project.milestones   || [],
      });
      // if editing an existing project, clear any queued sprints
      setQueuedSprints([]);
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
      let createdProjectResp = null;
      if (project?.id) {
        createdProjectResp = await updateProject(project.id, formData);
      } else {
        createdProjectResp = await createProject(formData);
      }

      // If there are queued sprints (added while creating project), create them now
      const pid = project?.id || createdProjectResp?.project?.id || createdProjectResp?.id;
      if (queuedSprints.length && pid) {
        for (const s of queuedSprints) {
          try {
            const sprintRes = await createSprint({
              projectId: pid,
              name: s.name,
              startDate: s.startDate,
              endDate: s.endDate,
              status: s.status || 'PLANNED',
            });
            const sprintId = sprintRes?.sprint?.id || sprintRes?.id;
            if (s.tasks && sprintId) {
              for (const t of s.tasks) {
                await createTask({
                  projectId: pid,
                  sprintId,
                  title: t.title,
                  storyPoints: Number(t.storyPoints) || 0,
                  status: t.status || 'TODO',
                });
              }
            }
          } catch (err) {
            console.error('Failed creating queued sprint or its tasks', err);
          }
        }
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save project");
    }
  };

  // Sprint & Task helpers
  const addSprint = () => {
    setQueuedSprints((s) => [...s, { id: Math.random().toString(36).slice(2, 8), name: '', startDate: '', endDate: '', status: 'PLANNED', tasks: [] }]);
  };

  const updateSprintField = (idx, field, value) => {
    setQueuedSprints((s) => s.map((sp, i) => (i === idx ? { ...sp, [field]: value } : sp)));
  };

  const removeSprint = (idx) => setQueuedSprints((s) => s.filter((_, i) => i !== idx));

  const addTaskToSprint = (sprintIdx) => {
    // open task modal for queued sprint to capture full task details
    setTaskFormData({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', storyPoints: '', parentTaskId: '', assigneeId: '', ownerIds: [], teamIds: [] });
    setTaskModalSprintIdx(sprintIdx);
    setTaskModalOpen(true);
  };

  const updateTaskInSprint = (sprintIdx, taskIdx, field, value) => {
    setQueuedSprints((s) => s.map((sp, i) => {
      if (i !== sprintIdx) return sp;
      const tasks = sp.tasks.map((t, ti) => ti === taskIdx ? { ...t, [field]: value } : t);
      return { ...sp, tasks };
    }));
  };

  const removeTaskFromSprint = (sprintIdx, taskIdx) => {
    setQueuedSprints((s) => s.map((sp, i) => i === sprintIdx ? { ...sp, tasks: sp.tasks.filter((_, ti) => ti !== taskIdx) } : sp));
  };

  const handleTaskFormSaveForQueuedSprint = (data) => {
    // Append to queued sprint tasks
    if (taskModalSprintIdx == null) return;
    const newTask = {
      id: Math.random().toString(36).slice(2,8),
      title: data.title,
      description: data.description,
      storyPoints: Number(data.storyPoints) || 0,
      status: data.status || 'TODO'
    };
    setQueuedSprints((s) => s.map((sp, i) => i === taskModalSprintIdx ? { ...sp, tasks: [...sp.tasks, newTask] } : sp));
    setTaskModalOpen(false);
    setTaskModalSprintIdx(null);
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

          {/* Assign Team */}
          <div>
            <label className={labelCls}>Assign Team</label>
            <MultiSelect
              value={formData.team}
              onChange={(v) => set("team", v)}
              teamOptions={teamOptions}
            />
          </div>

          {/* Sprints (queued while creating project) */}
          <div>
            <div className="flex items-center justify-between">
              <label className={labelCls}>Sprints (optional)</label>
              <button type="button" onClick={addSprint} className="text-sm text-blue-600">+ Add Sprint</button>
            </div>
            <div className="space-y-3 mt-2">
              {queuedSprints.map((sp, idx) => (
                <div key={sp.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={sp.name}
                      onChange={(e) => updateSprintField(idx, 'name', e.target.value)}
                      placeholder="Sprint name"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
                    />
                    <button type="button" onClick={() => removeSprint(idx)} className="text-red-500 ml-2">Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input type="date" value={sp.startDate} onChange={(e) => updateSprintField(idx, 'startDate', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm" />
                    <input type="date" value={sp.endDate} onChange={(e) => updateSprintField(idx, 'endDate', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm" />
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Tasks</p>
                      <button type="button" onClick={() => addTaskToSprint(idx)} className="text-sm text-blue-600">+ Add Task</button>
                    </div>
                    <div className="space-y-2 mt-2">
                      {sp.tasks.map((t, ti) => (
                        <div key={t.id} className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{t.title}</div>
                            <div className="text-xs text-gray-500">{t.description || ''}</div>
                          </div>
                          <div className="w-[60px] text-sm text-gray-700">{t.storyPoints}</div>
                          <button type="button" onClick={() => removeTaskFromSprint(idx, ti)} className="text-red-500">✕</button>
                        </div>
                      ))}
                      {sp.tasks.length === 0 && <p className="text-xs text-gray-400">No tasks added</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
      {taskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Create Task</h2>
              <button onClick={() => setTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <TaskForm formData={taskFormData} setFormData={setTaskFormData} userOptions={userOptionsFull} parentTaskOptions={[]} />

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setTaskModalOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="button" onClick={() => handleTaskFormSaveForQueuedSprint(taskFormData)} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Save Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}