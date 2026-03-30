import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, ChevronDown, Zap } from "lucide-react";
import NavyButton from "../../Components/Buttons";

const Row = ({ client, name, sprint, progress, defaultColor, onClick }) => {
    const [color, setColor] = useState(defaultColor);

    const colors = { blue: "bg-blue-500", green: "bg-emerald-500", orange: "bg-orange-500" };
    const textColors = { blue: "text-blue-700", green: "text-emerald-700", orange: "text-orange-700" };
    const bgColors = { blue: "bg-blue-50", green: "bg-emerald-50", orange: "bg-orange-50" };

    const handleChange = (e) => {
        const colorMap = { active: "blue", complete: "green", onhold: "orange" };
        setColor(colorMap[e.target.value]);
    };

    const initialValueMap = { blue: "active", green: "complete", orange: "onhold" };

    return (
        // ✅ Use div + onClick instead of Link — so we can pass data
        <div
            onClick={onClick}
            className="flex flex-col sm:flex-row sm:items-center bg-white rounded-xl p-4 md:p-5 mb-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow gap-4 sm:gap-6 group cursor-pointer"
        >
            <div className="flex-1 min-w-[120px]">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Client</p>
                <div className="font-semibold text-gray-800">{client}</div>
            </div>

            <div className="flex-[1.5] min-w-[150px]">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Project</p>
                <div className="font-semibold text-gray-900">{name}</div>
            </div>

            <div className="flex-1 min-w-[140px]">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Status</p>
                <div className="relative inline-flex items-center">
                    <select
                        onChange={handleChange}
                        defaultValue={initialValueMap[defaultColor]}
                        onClick={(e) => e.stopPropagation()} // ✅ prevent row click when changing status
                        className={`appearance-none pl-9 pr-8 py-1.5 rounded-full text-sm font-medium outline-none cursor-pointer transition-colors ${bgColors[color]} ${textColors[color]}`}
                    >
                        <option value="active">Active</option>
                        <option value="complete">Complete</option>
                        <option value="onhold">On Hold</option>
                    </select>
                    <div className="absolute left-3 pointer-events-none">
                        <span className={`block w-2.5 h-2.5 rounded-full ${colors[color]}`} />
                    </div>
                    <div className={`absolute right-2.5 pointer-events-none ${textColors[color]}`}>
                        <ChevronDown className="w-4 h-4 opacity-70" />
                    </div>
                </div>
            </div>

            <div className="flex-[0.8] min-w-[100px]">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Sprint</p>
                <div className="bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                    <input
                        defaultValue={sprint}
                        onClick={(e) => e.stopPropagation()} // ✅ prevent row click when editing sprint
                        className="w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex-[1.5] min-w-[150px]">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Progress</p>
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            style={{ width: `${progress}%` }}
                            className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color]}`}
                        />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-10 text-right">{progress}%</span>
                </div>
            </div>

            <div className="hidden sm:flex items-center justify-end w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

function Projects() {
    const navigate = useNavigate(); // ✅ navigate lives here

    // ✅ All project data defined in one place
    const projects = [
        { id: 1, client: "Acme Corp",     name: "Web Redesign",       sprint: "Sprint 3", progress: 67,  defaultColor: "blue",   deadline: "Jan 30, 2026", status: "Active",   team: ["Jane Doe (Lead Dev)", "John Smith (Designer)"], milestones: [{ label: "Design Phase", status: "Done", date: "Dec 15" }, { label: "Development", status: "In Progress", date: "Jan 01 - Jan 20" }, { label: "QA Testing", status: "Upcoming", date: "Jan 21 - Feb 01" }] },
        { id: 2, client: "Globex Inc",    name: "Mobile App V2",      sprint: "Sprint 5", progress: 100, defaultColor: "green",  deadline: "Feb 15, 2026", status: "Complete", team: ["Alice Brown (PM)", "Bob Lee (Dev)"],              milestones: [{ label: "Planning", status: "Done", date: "Nov 01" }, { label: "Development", status: "Done", date: "Dec 01 - Jan 15" }, { label: "Launch", status: "Done", date: "Feb 01" }] },
        { id: 3, client: "Initech",       name: "Backend Migration",  sprint: "Sprint 3", progress: 20,  defaultColor: "orange", deadline: "Mar 10, 2026", status: "On Hold",  team: ["Carlos M. (Architect)", "Dana K. (DevOps)"],      milestones: [{ label: "Audit", status: "Done", date: "Jan 05" }, { label: "Migration", status: "In Progress", date: "Jan 10 - Feb 20" }, { label: "Testing", status: "Upcoming", date: "Feb 21 - Mar 05" }] },
        { id: 4, client: "Umbrella Corp", name: "Security Audit",     sprint: "Sprint 1", progress: 10,  defaultColor: "blue",   deadline: "Apr 01, 2026", status: "Active",   team: ["Eve S. (Security Lead)", "Frank T. (Analyst)"],   milestones: [{ label: "Scoping", status: "Done", date: "Jan 20" }, { label: "Pen Testing", status: "In Progress", date: "Feb 01 - Mar 01" }, { label: "Report", status: "Upcoming", date: "Mar 05 - Mar 25" }] },
    ];

    const handleRowClick = (project) => {
        navigate("/project-overview", { state: { project } }); // ✅ pass the clicked project
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
                        <NavyButton className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> New Project
                        </NavyButton>
                        <Link to="/kanban-board">
                            <NavyButton className="flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Kanban Board
                            </NavyButton>
                        </Link>
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
                                {...project}
                                onClick={() => handleRowClick(project)} // ✅ each row knows its own data
                            />
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <NavyButton>Load more projects</NavyButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Projects;