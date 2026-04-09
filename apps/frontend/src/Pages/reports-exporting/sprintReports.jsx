import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Download,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    BarChart3,
    Clock,
    ArrowRight
} from "lucide-react";
import DashboardLayout from "../../Layouts/DashboardLayout";

const SprintReport = () => {
    const [activeTab, setActiveTab] = useState("Overview");

    const tasks = [
        {
            name: "Feature A",
            status: "Completed",
            velocity: "45%",
            contribution: "High",
        },
        {
            name: "Feature B",
            status: "In Progress",
            velocity: "20%",
            contribution: "Medium",
        },
        {
            name: "Feature C",
            status: "Coming Next",
            velocity: "-",
            contribution: "-",
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "In Progress":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "Coming Next":
                return "bg-slate-100 text-slate-600 border-slate-200";
            default:
                return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    const getContributionColor = (contribution) => {
        switch (contribution) {
            case "High":
                return "bg-blue-50 text-blue-700 border-blue-100";
            case "Medium":
                return "bg-orange-50 text-orange-700 border-orange-100";
            default:
                return "bg-slate-50 text-slate-400 border-slate-100";
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
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-95">
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <div className="flex gap-8">
                        {["Overview", "Details"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === tab
                                        ? "text-blue-600"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === "Overview" ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-200 transition-colors group">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Velocity</p>
                                    <p className="text-2xl font-bold text-blue-600">+85%</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-200 transition-colors group">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                    <CheckCircle2 size={28} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Task Completion</p>
                                    <p className="text-2xl font-bold text-blue-600">92%</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-200 transition-colors group">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                    <BarChart3 size={28} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Contribution</p>
                                    <p className="text-2xl font-bold text-blue-600">High</p>
                                </div>
                            </div>
                        </div>

                        {/* Iteration Summary */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                Iteration Summary
                            </h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-blue-600 text-white">
                                            <th className="px-6 py-4 font-semibold text-sm">Task</th>
                                            <th className="px-6 py-4 font-semibold text-sm">Status</th>
                                            <th className="px-6 py-4 font-semibold text-sm">Velocity</th>
                                            <th className="px-6 py-4 font-semibold text-sm">Contribution</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tasks.map((task, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {task.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${getStatusColor(task.status)}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-700">
                                                    {task.velocity}
                                                </td>
                                                <td className="px-6 py-4 text-right md:text-left">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getContributionColor(task.contribution)}`}>
                                                        {task.contribution}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 animate-in fade-in duration-500">
                        <Clock className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">Detailed breakdown coming soon...</p>
                    </div>
                )}
            </div>

    );
};

export default SprintReport;
