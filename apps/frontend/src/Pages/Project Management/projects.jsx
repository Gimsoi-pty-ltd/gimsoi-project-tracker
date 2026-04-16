import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, ChevronDown, Pencil, Trash2, Zap } from "lucide-react";
import NavyButton from "../../Components/Buttons";

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

function Projects() {
    const [projects, setProjects] = useState(defaultProjects);

    const handleNavigate = (project) => {
        console.log("Navigating to project:", project);
    };

    const handleDelete = (projectId) => {
        setProjects(projects.filter(p => p.id !== projectId));
    };

    const handleStatusChange = (projectId, colorKey, status) => {
        setProjects(projects.map(p => 
            p.id === projectId 
                ? { ...p, defaultColor: colorKey, status } 
                : p
        ));
    };

    return (
        <div className="bg-[#f5f7fb] min-h-screen font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
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
                        <NavyButton
                          className="flex items-center gap-2"
                          onClick={() => console.log("Opening New Project modal...")}
                         >
                          <Plus className="w-4 h-4" />
                          New Project
                         </NavyButton>

                       <Link to="/kanban-board">
                        <NavyButton className="flex items-center gap-2">
                         <Zap className="w-4 h-4" />
                          Kanban Board
                        </NavyButton>
                       </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 mb-6">
                    {/* Table header (hidden on mobile) */}
                    <div className="hidden sm:flex font-semibold text-slate-500 text-sm pb-4 mb-4 border-b border-slate-100 uppercase tracking-wider">
                        <div className="flex-1 px-4">Client</div>
                        <div className="flex-[1.5] px-4">Project name</div>
                        <div className="flex-1 px-4">Status</div>
                        <div className="flex-[0.8] px-4">Sprint</div>
                        <div className="flex-[1.5] px-4">Progress</div>
                        <div className="w-10"></div> {/* For actions column */}
                    </div>

                    <div className="space-y-1">
                        {projects.map(project => (
                            <Row
                                key={project.id}
                                project={project}
                                onNavigate={handleNavigate}
                                onDelete={handleDelete}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                    <NavyButton 
                        onClick={() => console.log("Loading more projects...")}
                        className="w-full sm:w-auto"
                    >
                        Load more projects
                    </NavyButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Projects;
