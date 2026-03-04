import { useState } from "react";
import { Plus, Search, MoreHorizontal, CheckCircle2, Circle, AlertCircle, ChevronDown } from "lucide-react";

const Row = ({ client, name, sprint, progress, defaultColor }) => {
    const [color, setColor] = useState(defaultColor);

    // More modern color palette
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
        const selected = e.target.value;
        // Map value to color
        const colorMap = {
            active: "blue",
            complete: "green",
            onhold: "orange"
        };
        setColor(colorMap[selected]);
    };

    // Initial value for select based on color
    const initialValueMap = {
        blue: "active",
        green: "complete",
        orange: "onhold"
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center bg-white rounded-xl p-4 md:p-5 mb-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow gap-4 sm:gap-6 group">
            <div className="flex-1 min-w-[120px]">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Client</p>
                <div className="font-semibold text-gray-800">{client}</div>
            </div>

            <div className="flex-[1.5] min-w-[150px]">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Project</p>
                <div className="font-semibold text-gray-900">{name}</div>
            </div>

            {/* Status */}
            <div className="flex-1 min-w-[140px]">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Status</p>
                <div className="relative inline-flex items-center">
                    <select
                        onChange={handleChange}
                        defaultValue={initialValueMap[defaultColor]}
                        className={`appearance-none pl-9 pr-8 py-1.5 rounded-full text-sm font-medium outline-none cursor-pointer transition-colors ${bgColors[color]} ${textColors[color]} border border-transparent hover:border-${color}-200`}
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

            {/* Sprint */}
            <div className="flex-[0.8] min-w-[100px]">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 sm:hidden">Sprint</p>
                <div className="bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                    <input
                        defaultValue={sprint}
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
                            style={{ width: `${progress}%` }}
                            className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color]}`}
                        />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-10 text-right">
                        {progress}%
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="hidden sm:flex items-center justify-end w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

function Projects() {
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
                        <button className="bg-[#1A75FF] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(26,117,255,0.25)] hover:shadow-[0_6px_16px_rgba(26,117,255,0.35)] hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap active:scale-95">
                            <Plus className="w-4 h-4" />
                            New Project
                        </button>
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
                        <Row
                            client="Acme Corp"
                            name="Web Redesign"
                            sprint="Sprint 3"
                            progress={67}
                            defaultColor="blue"
                        />

                        <Row
                            client="Globex Inc"
                            name="Mobile App V2"
                            sprint="Sprint 5"
                            progress={100}
                            defaultColor="green"
                        />

                        <Row
                            client="Initech"
                            name="Backend Migration"
                            sprint="Sprint 3"
                            progress={20}
                            defaultColor="orange"
                        />

                        <Row
                            client="Umbrella Corp"
                            name="Security Audit"
                            sprint="Sprint 1"
                            progress={10}
                            defaultColor="blue"
                        />
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button className="px-8 py-3 bg-white hover:bg-[#1A75FF] hover:text-white text-slate-700 font-semibold rounded-xl text-sm transition-all border border-slate-200 hover:border-[#1A75FF] w-full sm:w-auto shadow-sm hover:shadow-md active:scale-95 group">
                            Load more projects
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Projects;
