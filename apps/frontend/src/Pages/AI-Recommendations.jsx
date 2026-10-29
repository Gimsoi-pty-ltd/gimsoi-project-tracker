import React from "react";

export default function Recommendations() {
  const recommendations = [
    {
      id: 1,
      title: "Project Tracker Enhancement",
      desc: "Add automated milestone notifications to improve project visibility and stakeholder updates.",
      priority: "High",
      status: "New"
    },
    {
      id: 2,
      title: "Resource Allocation",
      desc: "Redistribute workload across team members to balance project delivery timelines.",
      priority: "Medium",
      status: "Active"
    },
    {
      id: 3,
      title: "Risk Monitoring",
      desc: "Enable predictive risk detection for projects approaching deadlines.",
      priority: "High",
      status: "Pending"
    }
  ];

  const total = recommendations.length;
  const highCount = recommendations.filter((r) => r.priority === "High").length;
  const newCount = recommendations.filter((r) => r.status === "New").length;

  // --- 1. EMPTY SCREEN LAYOUT ---
  if (visibleRecs.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            AI Recommendations
          </h1>

          <p className="text-slate-500 mt-2">
            Smart project recommendations based on project progress, priorities,
            and team activity.
          </p>
        </div>
        <div className="empty-screen flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
          <h3 className="text-xl font-semibold">No recommendations yet</h3>
          <p className="text-slate-500 mt-2">
            AI Agent is analyzing your projects...
          </p>
        </div>
      </div>
    );
  }

  // --- 2. OVERALL SECTION LAYOUT ---
  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="header mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          AI Recommendations
        </h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Smart project recommendations based on project progress, priorities,
          and team activity.
        </p>
      </div>

      {/* FILTERS AND SORTING */}
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl p-4">
        <DropDown
          label="Filter by Priority"
          options={["All", "URGENT", "HIGH", "MEDIUM", "LOW"]}
          selectedOption={filterPriority}
          onSelect={setFilterPriority}
        />

        <DropDown
          label="Filter by Status"
          options={[
            "All",
            "TODO",
            "IN_PROGRESS",
            "REVIEW",
            "DONE",
            "CANCELLED",
            "BLOCKED"
          ]}
          selectedOption={filterStatus}
          onSelect={setFilterStatus}
        />

        <DropDown
          label="Sort by"
          options={["Priority", "Status"]}
          selectedOption={sortBy}
          onSelect={setSortBy}
        />
      </div>

      <div className="summary-counts grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs uppercase text-slate-500">Total</p>
          <p className="text-2xl font-bold"> {total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs uppercase text-slate-500">High Priority</p>
          <p className="text-2xl font-bold text-red-600">{highCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs uppercase text-slate-500">New</p>
          <p className="text-2xl font-bold text-blue-600"> {newCount}</p>
        </div>
      </div>

      <div className="recommendations-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((r) => (
          <div
            key={r.id}
            className="recommendation-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-3">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  ["HIGH", "URGENT"].includes(r.priority?.toUpperCase())
                    ? "bg-red-100 text-red-700"
                    : r.priority?.toUpperCase() === "MEDIUM"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {r.priority}
              </span>

              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                {r.status}
              </span>
            </div>

            <h3 className="font-semibold text-slate-900 text-lg">{r.title}</h3>
            <p className="text-sm text-slate-600 mt-2 line-clamp-3">{r.desc}</p>
            <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View Details →
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold">{selected.title}</h2>
            <p className="text-sm bg-blue-50 p-3 rounded-lg mt-4 border border-blue-100">
              <b>Why this was recommended:</b> {selected.why}
            </p>
            <p className="text-sm text-slate-600 mt-4">{selected.desc}</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  alert("Taking action on " + selected.title);
                  setSelected(null);
                }}
                className="bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium"
              >
                Take Action
              </button>
              <button
                onClick={() => {
                  setAccepted([...accepted, selected.id]);
                  setSelected(null);
                }}
                className="bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium"
              >
                Accept
              </button>
              <button
                onClick={() => {
                  setDismissed([...dismissed, selected.id]);
                  setSelected(null);
                }}
                className="bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
