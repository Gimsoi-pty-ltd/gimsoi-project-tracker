import React from "react";
import { Link } from "react-router-dom";
import { Download, FileText, BarChart2, Users } from "lucide-react";

const ReportsHub = () => {
    const reports = [
        {
            name: "Sprint Report",
            velocity: "85%",
            completion: "92%",
            contribution: "High",
            path: "/reports/sprint-report",
        },
        {
            name: "Project Report",
            velocity: "78%",
            completion: "88%",
            contribution: "Medium",
            path: "/reports/project-report",
        },
        {
            name: "Team Performance",
            velocity: "90%",
            completion: "95%",
            contribution: "High",
            path: "/reports/team-performance",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Reports Hub</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="px-6 py-4 font-semibold text-sm">Report Name</th>
                                <th className="px-6 py-4 font-semibold text-sm">Velocity</th>
                                <th className="px-6 py-4 font-semibold text-sm">Task Completion</th>
                                <th className="px-6 py-4 font-semibold text-sm">Contribution</th>
                                <th className="px-6 py-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((report, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link
                                            to={report.path}
                                            className="font-medium text-slate-900 hover:text-blue-600 no-underline transition-colors"
                                        >
                                            {report.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{report.velocity}</td>
                                    <td className="px-6 py-4 text-slate-600">{report.completion}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.contribution === "High"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-amber-100 text-amber-800"
                                                }`}
                                        >
                                            {report.contribution}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all">
                                            <Download size={16} />
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsHub;