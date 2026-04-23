import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NavyButton from "../../Components/Buttons";

const STORAGE_KEY = "pm_projects";

const colorMap = {
  blue:   { bar: "bg-blue-500",    badge: "bg-blue-50 text-blue-700" },
  green:  { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  orange: { bar: "bg-orange-500",  badge: "bg-orange-50 text-orange-700" },
};

const statusIcon = { Done: "✅", "In Progress": "🔄", Upcoming: "🔲" };
const statusColorMap = { Active: "blue", Complete: "green", "On Hold": "orange" };

function persistProject(updated) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const projects = stored ? JSON.parse(stored) : [];
    const next = projects.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    
  }
}


function Dashboard({ project, colors, onEdit }) {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Project Overview</h2>
        <nav className="flex mt-1 text-sm text-gray-500">
          <Link to="/projects">
            <span className="text-slate-900 hover:text-slate-600 cursor-pointer">Project Management</span>
          </Link>
          <span className="mx-2">/</span>
          <span>{project.name}</span>
        </nav>
      </div>

    
      <div className="bg-white p-5 rounded-xl shadow">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${colors.badge}`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Client: <span className="font-medium text-gray-700">{project.client}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Deadline: <span className="font-medium text-gray-700">{project.deadline}</span>
        </p>
      </div>

      
      <div className="bg-white p-5 rounded-xl shadow">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-gray-700">Overall Progress</p>
          <span className="text-sm font-bold text-gray-600">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${colors.bar}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      
      <div className="bg-white p-5 rounded-xl shadow border-2 border-blue-600">
        <h3 className="font-semibold mb-3 text-gray-800">Milestones</h3>
        <ul className="space-y-2">
          {project.milestones.map((m, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <span>{statusIcon[m.status]}</span>
              <span className="font-medium">{m.label}</span>
              <span className="text-gray-400">–</span>
              <span className="text-gray-500">{m.status}</span>
              <span className="text-gray-400 ml-auto">{m.date}</span>
            </li>
          ))}
        </ul>
      </div>

      
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="font-semibold text-gray-800">Current Sprint</h3>
        <p className="text-sm text-gray-600 mt-1">{project.sprint}</p>
      </div>

      
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="font-semibold text-gray-800 mb-2">Team Members</h3>
        <div className="flex flex-wrap gap-2">
          {project.team.map((member, i) => (
            <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
              {member}
            </span>
          ))}
        </div>
      </div>

      
      <NavyButton onClick={onEdit}>Edit Project</NavyButton>
    </div>
  );
}


function EditScreen({ project, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...project });

  const updateField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const updateMilestone = (i, key, value) => {
    const updated = draft.milestones.map((m, idx) =>
      idx === i ? { ...m, [key]: value } : m
    );
    setDraft((prev) => ({ ...prev, milestones: updated }));
  };

  const addMilestone = () =>
    setDraft((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { label: "", status: "Upcoming", date: "" }],
    }));

  const removeMilestone = (i) =>
    setDraft((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, idx) => idx !== i),
    }));

  const updateTeamMember = (i, value) => {
    const updated = draft.team.map((m, idx) => (idx === i ? value : m));
    setDraft((prev) => ({ ...prev, team: updated }));
  };

  const addTeamMember = () =>
    setDraft((prev) => ({ ...prev, team: [...prev.team, ""] }));

  const removeTeamMember = (i) =>
    setDraft((prev) => ({ ...prev, team: prev.team.filter((_, idx) => idx !== i) }));

  
  const handleSave = () => {
    const statusToColor = { Active: "blue", Complete: "green", "On Hold": "orange" };
    const updatedProject = {
      ...draft,
      defaultColor: statusToColor[draft.status] || project.defaultColor,
    };
    onSave(updatedProject);
  };

  const inputClass =
    "w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition";
  const labelClass =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-900">Edit Project</h2>
        <nav className="flex mt-1 text-sm text-gray-500">
          <Link to="/projects">
            <span className="text-slate-900 hover:text-slate-600 cursor-pointer">Project Management</span>
          </Link>
          <span className="mx-2">/</span>
          
          <span className="hover:text-slate-600 cursor-pointer" onClick={onCancel}>
            {project.name}
          </span>
          <span className="mx-2">/</span>
          <span>Edit</span>
        </nav>
      </div>

      {/* Basic Info */}
      <div className="bg-white p-5 rounded-xl shadow space-y-4">
        <h3 className="font-semibold text-gray-800 border-b pb-2">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Client Name</label>
            <input className={inputClass} value={draft.client}
              onChange={(e) => updateField("client", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Deadline</label>
            <input className={inputClass} value={draft.deadline}
              onChange={(e) => updateField("deadline", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={draft.status}
              onChange={(e) => updateField("status", e.target.value)}>
              <option>Active</option>
              <option>Complete</option>
              <option>On Hold</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sprint</label>
            <input className={inputClass} value={draft.sprint}
              onChange={(e) => updateField("sprint", e.target.value)} />
          </div>
        </div>

        
        <div>
          <label className={labelClass}>Progress — {draft.progress}%</label>
          <input
            type="range" min={0} max={100} value={draft.progress}
            onChange={(e) => updateField("progress", Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${draft.progress}%` }}
            />
          </div>
        </div>
      </div>

      
      <div className="bg-white p-5 rounded-xl shadow space-y-3">
        <h3 className="font-semibold text-gray-800 border-b pb-2">Team Members</h3>
        {draft.team.map((member, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input className={inputClass} value={member} placeholder="Name (Role)"
              onChange={(e) => updateTeamMember(i, e.target.value)} />
            <NavyButton
              onClick={() => removeTeamMember(i)}
              className="text-red-400 hover:text-red-600 text-lg font-bold px-2 flex-shrink-0"
            >×</NavyButton>
          </div>
        ))}
        <NavyButton onClick={addTeamMember} className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1">
          + Add Member
        </NavyButton>
      </div>


      <div className="bg-white p-5 rounded-xl shadow space-y-3">
        <h3 className="font-semibold text-gray-800 border-b pb-2">Milestones</h3>
        {draft.milestones.map((m, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <input className={inputClass} value={m.label} placeholder="Milestone label"
              onChange={(e) => updateMilestone(i, "label", e.target.value)} />
            <select className={inputClass} value={m.status}
              onChange={(e) => updateMilestone(i, "status", e.target.value)}>
              <option>Done</option>
              <option>In Progress</option>
              <option>Upcoming</option>
            </select>
            <div className="flex gap-2">
              <input className={inputClass} value={m.date} placeholder="Date / range"
                onChange={(e) => updateMilestone(i, "date", e.target.value)} />
              <NavyButton
                onClick={() => removeMilestone(i)}
                className="text-red-400 hover:text-red-600 text-lg font-bold px-2 flex-shrink-0"
              >×</NavyButton>
            </div>
          </div>
        ))}
        <NavyButton onClick={addMilestone} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          + Add Milestone
        </NavyButton>
      </div>
      <div className="flex gap-3 pb-8">
        <NavyButton onClick={handleSave}>Save Changes</NavyButton>
        <NavyButton
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </NavyButton>
      </div>
    </div>
  );
}

export default function ProjectOverview() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const resolveInitial = () => {
    if (state?.project) return state.project;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && state?.projectId) {
        const projects = JSON.parse(stored);
        return projects.find((p) => p.id === state.projectId) || null;
      }
    } catch {}
    return null;
  };

  const [project, setProject] = useState(resolveInitial);
  const [screen, setScreen] = useState("dashboard");
  const handleSave = (updatedProject) => {
    setProject(updatedProject);
    persistProject(updatedProject);
    setScreen("dashboard");
  };

  const colors = colorMap[statusColorMap[project?.status]] || colorMap.blue;

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <p className="text-gray-500 mb-4">No project selected.</p>
          <Link to="/projects" className="text-blue-600 underline">Back to Projects</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {screen === "dashboard" && (
        <Dashboard
          project={project}
          colors={colors}
          onEdit={() => setScreen("edit")}
        />
      )}
      {screen === "edit" && (
        <EditScreen
          project={project}
          onSave={handleSave}
          onCancel={() => setScreen("dashboard")}
        />
      )}
    </div>
  );
}
