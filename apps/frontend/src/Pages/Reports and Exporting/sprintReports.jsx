import React, { useState } from "react";
import NavyButton from '../../Components/Buttons';
import { Link } from "react-router-dom";
import NavyButton from "../../Components/Buttons";
import { Download, ChevronRight, TrendingUp, CheckCircle2, BarChart3, Clock } from "lucide-react";

const SprintReport = () => {
    const [activeTab, setActiveTab] = useState("Overview");

    const tasks = [
        { name: "Feature A", status: "Completed", velocity: "45%", contribution: "High" },
        { name: "Feature B", status: "In Progress", velocity: "20%", contribution: "Medium" },
        { name: "Feature C", status: "Coming Next", velocity: "-", contribution: "-" },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
            default: return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    const getContributionColor = (contribution) => {
        switch (contribution) {
            case "High": return "bg-blue-50 text-blue-700 border-blue-100";
            case "Medium": return "bg-orange-50 text-orange-700 border-orange-100";
            default: return "bg-slate-50 text-slate-400 border-slate-100";
        }
    };

    return (
        
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Sprint Report</h1>
                        <nav className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <Link to="/reports" className="hover:text-blue-600 no-underline transition-colors">
                                Reports Hub
                            </Link>
                            <ChevronRight size={14} className="text-slate-400" />
                            <span className="text-slate-900 font-medium">Sprint Report</span>
                        </nav>
                    </div>
                    <NavyButton onClick={() => console.log("Downloading PDF...")}>
                        <Download size={18} className="mr-2" />
                        Download PDF
                    </NavyButton>
                </div>

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Sprint Report</h1>
                    <nav className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <Link to="/reports" className="hover:text-blue-900 no-underline transition-colors">
                            Reports Hub
                        </Link>
                        <ChevronRight size={14} className="text-slate-400" />
                        <span className="text-blue-900 font-medium">Sprint Report</span>
                    </nav>
                </div>
                <NavyButton>
                    <Download size={18} /> Download PDF
                </NavyButton>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6 md:gap-8">
                    {["Overview", "Details"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === tab ? "text-blue-900" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            {tab}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "Overview" ? (
                <div className="space-y-6 md:space-y-8">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { icon: <TrendingUp size={28} />, label: "Velocity", value: "+85%" },
                            { icon: <CheckCircle2 size={28} />, label: "Task Completion", value: "92%" },
                            { icon: <BarChart3 size={28} />, label: "Contribution", value: "High" },
                        ].map(({ icon, label, value }) => (
                            <div key={label} className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 md:gap-5 hover:border-blue-200 transition-colors group">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-900 transition-transform group-hover:scale-110 flex-shrink-0">
                                    {icon}
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                                    <p className="text-xl md:text-2xl font-bold text-blue-900">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="space-y-4">
                        <h2 className="text-lg md:text-xl font-bold text-blue-900">Iteration Summary</h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[480px]">
                                <thead>
                                    <tr className="bg-blue-900 text-white">
                                        <th className="px-4 md:px-6 py-4 font-semibold text-sm">Task</th>
                                        <th className="px-4 md:px-6 py-4 font-semibold text-sm">Status</th>
                                        <th className="px-4 md:px-6 py-4 font-semibold text-sm">Velocity</th>
                                        <th className="px-4 md:px-6 py-4 font-semibold text-sm">Contribution</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tasks.map((task, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-4 md:px-6 py-4 font-medium text-blue-900 group-hover:text-blue-600 transition-colors">{task.name}</td>
                                            <td className="px-4 md:px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>{task.status}</span>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 font-semibold text-slate-700">{task.velocity}</td>
                                            <td className="px-4 md:px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getContributionColor(task.contribution)}`}>{task.contribution}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-8 md:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <Clock className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">Detailed breakdown coming soon...</p>
                </div>
            )}
        </div>
    );
};

export default SprintReport;