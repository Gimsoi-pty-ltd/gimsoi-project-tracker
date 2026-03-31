import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, MoreHorizontal, CheckCircle2, Circle, AlertCircle, ChevronDown, Zap } from "lucide-react";
import NavyButton from "../../Components/Buttons";

const Row = ({ client, name, sprint, progress, defaultColor }) => {
  const [color, setColor] = useState(defaultColor);
  const [statusValue, setStatusValue] = useState(
    { blue: "active", green: "complete", orange: "onhold" }[defaultColor] ||
      "active",
  );

  const colors = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    orange: "bg-orange-500",
  };

  const textColors = {
    blue: "text-blue-700",
    green: "text-emerald-700",
    orange: "text-orange-700",
  };

  const bgColors = {
    blue: "bg-blue-50",
    green: "bg-emerald-50",
    orange: "bg-orange-50",
  };

  const handleChange = (e) => {
    const colorMap = {
      active: "blue",
      complete: "green",
      onhold: "orange",
    };
    setStatusValue(e.target.value);
    setColor(colorMap[e.target.value]);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center bg-white rounded-xl p-4 md:p-5 mb-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow gap-4 sm:gap-6 group">
      <div className="flex-1 min-w-[120px]">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">
          Client
        </p>
        <div className="font-semibold text-gray-800">{client}</div>
      </div>

      <div className="flex-[1.5] min-w-[150px]">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">
          Project
        </p>
        <div className="font-semibold text-gray-900">{name}</div>
      </div>

      <div className="flex-1 min-w-[140px]">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">
          Status
        </p>
        <div className="relative inline-flex items-center">
          <select
            onChange={handleChange}
            value={statusValue}
            className={`appearance-none pl-9 pr-8 py-1.5 rounded-full text-sm font-medium outline-none cursor-pointer transition-colors ${bgColors[color]} ${textColors[color]} border border-transparent`}
          >
            <option value="active">Active</option>
            <option value="complete">Complete</option>
            <option value="onhold">On Hold</option>
          </select>
          <div className="absolute left-3 pointer-events-none">
            <span
              className={`block w-2.5 h-2.5 rounded-full ${colors[color]}`}
            />
          </div>
          <div
            className={`absolute right-2.5 pointer-events-none ${textColors[color]}`}
          >
            <ChevronDown className="w-4 h-4 opacity-70" />
          </div>
        </div>
      </div>

      <div className="flex-[0.8] min-w-[100px]">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">
          Sprint
        </p>
        <div className="bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
          <input
            defaultValue={sprint}
            className="w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-[1.5] min-w-[150px]">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">
          Progress
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color]}`}
            />
          </div>
          <span className="text-sm font-semibold text-gray-600 w-10 text-right">
            {progress}%
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-end w-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
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

const statusToColor = {
  Active: "blue",
  Completed: "green",
  "On Hold": "orange",
  Planned: "blue",
};

export default function Projects() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [projects, setProjects] = useState([
    {
      id: 1,
      client: "Acme Corp",
      name: "Web Redesign",
      sprint: "Sprint 3",
      progress: 67,
      defaultColor: "blue",
    },
    {
      id: 2,
      client: "Globex Inc",
      name: "Mobile App V2",
      sprint: "Sprint 5",
      progress: 100,
      defaultColor: "green",
    },
    {
      id: 3,
      client: "Initech",
      name: "Backend Migration",
      sprint: "Sprint 3",
      progress: 20,
      defaultColor: "orange",
    },
    {
      id: 4,
      client: "Umbrella Corp",
      name: "Security Audit",
      sprint: "Sprint 1",
      progress: 10,
      defaultColor: "blue",
    },
  ]);

  const clients = ["Acme Corp", "TechStart Inc", "BlueWave Ltd"];
  const teamMembers = ["TK", "Samantha", "John Doe", "Aisha", "David"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const newProject = {
      id: Date.now(),
      client: formData.client || "Unknown Client",
      name: formData.projectName || "Untitled Project",
      sprint: "Sprint 1",
      progress: 0,
      defaultColor: statusToColor[formData.status] || "blue",
    };
    setProjects((prev) => [...prev, newProject]);
    setFormData(defaultFormData);
    setShowProjectModal(false);
  };

  return (
    <div className="bg-[#f5f7fb] min-h-screen font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Projects
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and track your ongoing projects
            </p>
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
                client={project.client}
                name={project.name}
                sprint={project.sprint}
                progress={project.progress}
                defaultColor={project.defaultColor}
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
              <h2 className="text-xl font-semibold text-gray-800">
                Create New Project
              </h2>
            </div>

            <div className="space-y-4 px-6 py-5 overflow-y-auto">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Project Name
                </label>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Client
                </label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select status</option>
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Assign Team
                </label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select team member</option>
                  {teamMembers.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between border-t px-6 py-4 flex-shrink-0">
              <button
                onClick={() => {
                  setFormData(defaultFormData);
                  setShowProjectModal(false);
                }}
                className="rounded-xl bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-[#1A75FF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
