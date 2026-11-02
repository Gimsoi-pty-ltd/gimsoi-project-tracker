import { useState, useEffect } from "react";
import DropDown from "../Components/DropDown";
import { resourceAPI } from "../api/api";
import { useProjectStore } from "../store/projectStore";

export default function Recommendations() {
<<<<<<< HEAD
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
    status: "In Progress",
  },
  {
    id: 3,
    title: "Risk Monitoring",
    desc: "Enable predictive risk detection for projects approaching deadlines.",
    priority: "Low",
    status: "Completed",
  },
];
  const priorityStyles = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-green-100 text-green-700",
};
  const statusStyles = {
  New: "bg-blue-100 text-blue-700",
  "In Progress": "bg-purple-100 text-purple-700",
  Completed: "bg-emerald-100 text-emerald-700",
};
=======
  const currentProject = useProjectStore((state) => state.currentProject);
  const ensureDashboardLoaded = useProjectStore(
    (state) => state.ensureDashboardLoaded
  );

  const dashboardLoading = useProjectStore((state) => state.dashboardLoading);

  useEffect(() => {
    ensureDashboardLoaded();
  }, [ensureDashboardLoaded]);

  console.log("Selected project:", currentProject);

  console.log("Selected project:", currentProject);
  console.log("Projects in store:", useProjectStore.getState().projects);
  console.log(
    "Dashboard loading:",
    useProjectStore.getState().dashboardLoading
  );
  console.log("Dashboard error:", useProjectStore.getState().dashboardError);

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [accepted, setAccepted] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    if (!currentProject?.id) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await resourceAPI.get("/tasks", {
          params: {
            projectId: currentProject.id,
            limit: 100
          }
        });

        console.log("Project ID:", currentProject.id);
        console.log("Project tasks:", response.data.data);

        setRecommendations(response.data.data ?? []);
      } catch (err) {
        console.error("Failed to fetch project tasks:", err);

        setError(
          err.response?.data?.message || "Failed to load project tasks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentProject?.id, dashboardLoading]);

>>>>>>> d0ddc1beb77240efd584b579a9f5565c5a1211a7
  const total = recommendations.length;

  const highCount = recommendations.filter((r) =>
    ["HIGH", "URGENT"].includes(r.priority?.toUpperCase())
  ).length;

  const newCount = recommendations.filter(
    (r) => r.status?.toUpperCase() === "TODO"
  ).length;
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Priority");

  const filteredRecommendations = recommendations
    .filter((r) => {
      const matchesPriority =
        filterPriority === "All" ||
        r.priority?.toUpperCase() === filterPriority;

      const matchesStatus =
        filterStatus === "All" || r.status?.toUpperCase() === filterStatus;

      return matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "Priority") {
        const priorityOrder = {
          URGENT: 1,
          HIGH: 2,
          MEDIUM: 3,
          LOW: 4
        };

        return (
          (priorityOrder[a.priority?.toUpperCase()] ?? 99) -
          (priorityOrder[b.priority?.toUpperCase()] ?? 99)
        );
      }

      return (a.status ?? "").localeCompare(b.status ?? "");
    });
  if (loading) {
    return <div className="p-8">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  // --- 1. EMPTY SCREEN LAYOUT ---
  if (filteredRecommendations.length === 1) {
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
          options={["All", "High", "Medium"]}
          selectedOption={filterPriority}
          onSelect={setFilterPriority}
        />

        <DropDown
          label="Filter by Status"
          options={["All", "New", "Active", "Pending"]}
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

      {/* SUMMARY COUNT TOTALS */}
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
        {filteredRecommendations.map((r) => (
          <div
            key={r.id}
            className="recommendation-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-3">
              <span
<<<<<<< HEAD
  className={`rounded-full px-3 py-1 text-xs font-semibold ${
    priorityStyles[r.priority] ||
    "bg-gray-100 text-gray-700"
  }`}
>
  {r.priority}
</span>
   <span
  className={`rounded-full px-3 py-1 text-xs font-semibold ${
    statusStyles[r.status] ||
    "bg-gray-100 text-gray-700"
  }`}
>
  {r.status}
</span>
=======
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
>>>>>>> d0ddc1beb77240efd584b579a9f5565c5a1211a7
            </div>

            <h3 className="font-semibold text-slate-900 text-lg">{r.title}</h3>
            <p className="text-sm text-slate-600 mt-2 line-clamp-3">{r.desc}</p>
            <button
              onClick={() => setSelected(r)}
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
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
