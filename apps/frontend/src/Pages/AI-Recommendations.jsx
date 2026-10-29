import React from "react";

export default function Recommendations() {
  const recommendations = [
    {
      id: 1,
      title: "Project Tracker Enhancement",
      desc: "Add automated milestone notifications to improve project visibility and stakeholder updates.",
      priority: "High",
      status: "New",
    },
    {
      id: 2,
      title: "Resource Allocation",
      desc: "Redistribute workload across team members to balance project delivery timelines.",
      priority: "Medium",
      status: "Active",
    },
    {
      id: 3,
      title: "Risk Monitoring",
      desc: "Enable predictive risk detection for projects approaching deadlines.",
      priority: "High",
      status: "Pending",
    },
  ];

  const total = recommendations.length;
  const highCount = recommendations.filter(r => r.priority === "High").length;
  const newCount = recommendations.filter(r => r.status === "New").length;

  // --- 1. EMPTY SCREEN LAYOUT ---
  if (total === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">AI Recommendations</h1>
          <p className="text-slate-500 mt-2">Smart project recommendations based on project progress, priorities, and team activity.</p>
        </div>
        <div className="empty-screen flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
          <h3 className="text-xl font-semibold">No recommendations yet</h3>
          <p className="text-slate-500 mt-2">AI Agent is analyzing your projects...</p>
        </div>
      </div>
    );
  }

  // --- 2. OVERALL SECTION LAYOUT ---
  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      {/* HEADINGS */}
      <div className="header mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Recommendations</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Smart project recommendations based on project progress, priorities, and team activity.
        </p>
      </div>

      {/* SUMMARY COUNT TOTALS */}
      <div className="summary-counts grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs uppercase text-slate-500">Total</p>
          <p className="text-2xl font-bold">Total: {total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs uppercase text-slate-500">High Priority</p>
          <p className="text-2xl font-bold text-red-600">High: {highCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs uppercase text-slate-500">New</p>
          <p className="text-2xl font-bold text-blue-600">New: {newCount}</p>
        </div>
      </div>

      {/* CARD GRID */}
      <div className="recommendations-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((r) => (
          <div key={r.id} className="recommendation-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${r.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {r.priority}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{r.status}</span>
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">{r.title}</h3>
            <p className="text-sm text-slate-600 mt-2 line-clamp-3">{r.desc}</p>
            <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View Details →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}