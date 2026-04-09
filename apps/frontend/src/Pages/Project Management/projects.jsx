import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, ChevronDown, Pencil,Trash2 } from "lucide-react";

const STORAGE_KEY = "pm_projects";

const defaultProjects = [
  {
    id: 1,
    client: "Acme Corp",
    name: "Web Redesign",
    sprint: "Sprint 3",
    progress: 67,
    defaultColor: "blue",
    status: "Active",
    deadline: "2025-06-30",
    team: ["TK", "Samantha"],
    milestones: [
      { label: "Discovery", status: "Done", date: "Jan 2025" },
      { label: "Design", status: "In Progress", date: "Mar 2025" },
      { label: "Launch", status: "Upcoming", date: "Jun 2025" },
    ],
  },
  {
    id: 2,
    client: "Globex Inc",
    name: "Mobile App V2",
    sprint: "Sprint 5",
    progress: 100,
    defaultColor: "green",
    status: "Complete",
    deadline: "2025-03-15",
    team: ["John Doe", "Aisha"],
    milestones: [
      { label: "Planning", status: "Done", date: "Nov 2024" },
      { label: "Development", status: "Done", date: "Feb 2025" },
      { label: "Release", status: "Done", date: "Mar 2025" },
    ],
  },
  {
    id: 3,
    client: "Initech",
    name: "Backend Migration",
    sprint: "Sprint 3",
    progress: 20,
    defaultColor: "orange",
    status: "On Hold",
    deadline: "2025-09-01",
    team: ["David"],
    milestones: [
      { label: "Audit", status: "Done", date: "Feb 2025" },
      { label: "Migration", status: "Upcoming", date: "Jul 2025" },
    ],
  },
  {
    id: 4,
    client: "Umbrella Corp",
    name: "Security Audit",
    sprint: "Sprint 1",
    progress: 10,
    defaultColor: "blue",
    status: "Active",
    deadline: "2025-12-01",
    team: ["TK", "John Doe"],
    milestones: [
      { label: "Scoping", status: "In Progress", date: "Apr 2025" },
      { label: "Testing", status: "Upcoming", date: "Sep 2025" },
    ],
  },
];

const colorMap = {
  blue: {
    bar: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  green: {
    bar: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
  orange: {
    bar: "bg-orange-500",
    text: "text-orange-700",
    bg: "bg-orange-50",
    dot: "bg-orange-500",
  },
};

const statusToColor = {
  Active: "blue",
  Complete: "green",
  Completed: "green",
  "On Hold": "orange",
  Planned: "blue",
};

const colorToStatus = {
  blue: "Active",
  green: "Complete",
  orange: "On Hold",
};

const defaultFormData = {
  projectName: "",
  client: "",
  startDate: "",
  endDate: "",
  description: "",
  status: "",
  team: "",
};

const Row = ({ project, onNavigate, onDelete, onStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const color = colorMap[project.defaultColor] || colorMap.blue;

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleStatusChange = (e) => {
    const colorKey = e.target.value;
    onStatusChange(project.id, colorKey, colorToStatus[colorKey]);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center bg-white rounded-xl p-4 md:p-5 mb-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow gap-4 sm:gap-6 group cursor-pointer"
      onClick={() => onNavigate(project)}
    >
      {/* Client */}
      <div className="flex-1 min-w-[120px]">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Client</p>
        <div className="font-semibold text-gray-800">{project.client}</div>
      </div>

      {/* Name */}
      <div className="flex-[1.5] min-w-[150px]">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Project</p>
        <div className="font-semibold text-gray-900">{project.name}</div>
      </div>

      {/* Status */}
      <div className="flex-1 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Status</p>
        <div className="relative inline-flex items-center">
          <select
            value={project.defaultColor}
            onChange={handleStatusChange}
            className={`appearance-none pl-9 pr-8 py-1.5 rounded-full text-sm font-medium outline-none cursor-pointer transition-colors ${color.bg} ${color.text} border border-transparent`}
          >
            <option value="blue">Active</option>
            <option value="green">Complete</option>
            <option value="orange">On Hold</option>
          </select>
          <div className="absolute left-3 pointer-events-none">
            <span className={`block w-2.5 h-2.5 rounded-full ${color.dot}`} />
          </div>
          <div className={`absolute right-2.5 pointer-events-none ${color.text}`}>
            <ChevronDown className="w-4 h-4 opacity-70" />
          </div>
        </div>
      </div>

      {/* Sprint */}
      <div className="flex-[0.8] min-w-[100px]" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Sprint</p>
        <div className="bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
          <input
            defaultValue={project.sprint}
            className="w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Progress */}
      <div className="flex-[1.5] min-w-[150px]">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Progress</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${project.progress}%` }}
              className={`h-full rounded-full transition-all duration-500 ease-out ${color.bar}`}
            />
          </div>
          <span className="text-sm font-semibold text-gray-600 w-10 text-right">{project.progress}%</span>
        </div>
      </div>

      {/* Action Menu */}
      <div className="hidden sm:flex items-center justify-end w-10" onClick={(e) => e.stopPropagation()} ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fadeIn">
              <button
                onClick={() => { setMenuOpen(false); onNavigate(project); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(project.id); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultProjects;
    } catch {
      return defaultProjects;
    }
  });

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  // Sync to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Callback passed to ProjectOverview so edits sync back here
  const handleUpdateProject = (updated) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
  };

  const handleDeleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStatusChange = (id, colorKey, statusLabel) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, defaultColor: colorKey, status: statusLabel } : p
      )
    );
  };

  const handleNavigate = (project) => {
    navigate(`/projects/${project.id}`, {
      state: { project, onUpdate: null }, // onUpdate passed via context/localStorage
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const colorKey = statusToColor[formData.status] || "blue";
    const newProject = {
      id: Date.now(),
      client: formData.client || "Unknown Client",
      name: formData.projectName || "Untitled Project",
      sprint: "Sprint 1",
      progress: 0,
      defaultColor: colorKey,
      status: formData.status || "Active",
      deadline: formData.endDate || "",
      team: formData.team ? [formData.team] : [],
      milestones: [],
    };
    setProjects((prev) => [...prev, newProject]);
    setFormData(defaultFormData);
    setShowProjectModal(false);
  };

  const clients = ["Acme Corp", "TechStart Inc", "BlueWave Ltd"];
  const teamMembers = ["TK", "Samantha", "John Doe", "Aisha", "David"];

  return (
    <div className="bg-[#f5f7fb] min-h-screen font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Projects</h1>
            <p className="text-gray-500 mt-1">Manage and track your ongoing projects</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A75FF] focus:border-[#1A75FF] outline-none w-full md:w-64 transition-all bg-white shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowProjectModal(true)}
              className="bg-[#1A75FF] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(26,117,255,0.25)] hover:shadow-[0_6px_16px_rgba(26,117,255,0.35)] hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 mb-6">
          <div className="hidden sm:flex font-semibold text-slate-500 text-sm pb-4 mb-4 border-b border-slate-100 uppercase tracking-wider">
            <div className="flex-1 px-4">Client</div>
            <div className="flex-[1.5] px-4">Project name</div>
            <div className="flex-1 px-4">Status</div>
            <div className="flex-[0.8] px-4">Sprint</div>
            <div className="flex-[1.5] px-4">Progress</div>
            <div className="w-10"></div>
          </div>

          <div className="space-y-1">
            {projects.map((project) => (
              <Row
                key={project.id}
                project={project}
                onNavigate={handleNavigate}
                onDelete={handleDeleteProject}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button className="px-8 py-3 bg-white hover:bg-[#1A75FF] hover:text-white text-slate-700 font-semibold rounded-xl text-sm transition-all border border-slate-200 hover:border-[#1A75FF] w-full sm:w-auto shadow-sm hover:shadow-md active:scale-95">
              Load more projects
            </button>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showProjectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowProjectModal(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800">Create New Project</h2>
            </div>

            <div className="space-y-4 px-6 py-5 overflow-y-auto">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Client</label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  placeholder="Enter project description" rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <option value="">Select status</option>
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Assign Team</label>
                <select name="team" value={formData.team} onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <option value="">Select team member</option>
                  {teamMembers.map((m) => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>
            </div>

            <div className="flex justify-between border-t px-6 py-4 flex-shrink-0">
              <button onClick={() => { setFormData(defaultFormData); setShowProjectModal(false); }}
                className="rounded-xl bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={handleSave}
                className="rounded-xl bg-[#1A75FF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
