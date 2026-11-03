import { useState, useEffect, useMemo } from "react";
import DropDown from "../Components/DropDown";
import RecommendationCard from "../Components/RecommendationCard";
import { resourceAPI } from "../api/api";
import { useProjectStore } from "../store/projectStore";

export default function Recommendations() {
  // PROJECT STORE
  console.log("Recommendations component loaded");
  const currentProject = useProjectStore((state) => state.currentProject);

  console.log("Current Project:", currentProject);
  console.log("Project ID:", currentProject?.id);

  const ensureDashboardLoaded = useProjectStore(
    (state) => state.ensureDashboardLoaded
  );

  // LOAD PROJECT INFORMATION
  useEffect(() => {
    ensureDashboardLoaded();
  }, [ensureDashboardLoaded]);

  // RECOMMENDATION DATA STATES
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // SEARCH, FILTER AND SORT STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWorkload, setFilterWorkload] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");

  // RETRY STATE
  const [refreshKey, setRefreshKey] = useState(0);

  // FETCH EMPLOYEE RECOMMENDATIONS
  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        if (!currentProject?.id) {
          if (isMounted) {
            setRecommendations([]);
          }
          return;
        }

        console.log("Fetching recommendations for project:", currentProject.id);

        const response = await resourceAPI.get(
          `/projects/${currentProject.id}/employee-recommendations`,
          {
            params: { limit: 20 }
          }
        );

        const data = response.data?.data;

        if (!Array.isArray(data)) {
          throw new Error(
            "The recommendations API returned an unexpected response."
          );
        }

        if (isMounted) {
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load recommendations."
          );

          setRecommendations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, [currentProject?.id, refreshKey]);

  // SUMMARY COUNTS
  const total = recommendations.length;

  const availableEmployees = recommendations.filter(
    (r) => (r.workload?.activeTasks ?? 0) === 0
  ).length;

  const employeesWithOverdueTasks = recommendations.filter(
    (r) => (r.workload?.overdueTasks ?? 0) > 0
  ).length;

  // FILTERING, SEARCHING AND SORTING
  const filteredRecommendations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = recommendations.filter((r) => {
      const employeeName = (r.employee?.fullName || "").toLowerCase();
      const jobTitle = (r.employee?.jobTitle || "").toLowerCase();
      const reason = (r.reason || "").toLowerCase();
      const workload = r.workload || {};

      const matchesSearch =
        employeeName.includes(search) ||
        jobTitle.includes(search) ||
        reason.includes(search);

      const matchesWorkload =
        filterWorkload === "All" ||
        (filterWorkload === "No Active Tasks" &&
          (workload.activeTasks ?? 0) === 0) ||
        (filterWorkload === "Has Active Tasks" &&
          (workload.activeTasks ?? 0) > 0) ||
        (filterWorkload === "Has Overdue Tasks" &&
          (workload.overdueTasks ?? 0) > 0) ||
        (filterWorkload === "Has Blocked Tasks" &&
          (workload.blockedTasks ?? 0) > 0);

      return matchesSearch && matchesWorkload;
    });

    // SORT RECOMMENDATIONS
    return [...filtered].sort((a, b) => {
      const workloadA = a.workload || {};
      const workloadB = b.workload || {};

      if (sortBy === "Recommended") {
        return (a.rank ?? Infinity) - (b.rank ?? Infinity);
      }

      if (sortBy === "Active Story Points") {
        return (
          (workloadA.activeStoryPoints ?? 0) -
          (workloadB.activeStoryPoints ?? 0)
        );
      }

      if (sortBy === "Active Tasks") {
        return (workloadA.activeTasks ?? 0) - (workloadB.activeTasks ?? 0);
      }

      if (sortBy === "Completed Tasks") {
        return (
          (workloadB.completedTasks ?? 0) - (workloadA.completedTasks ?? 0)
        );
      }

      return (a.rank ?? Infinity) - (b.rank ?? Infinity);
    });
  }, [recommendations, searchTerm, filterWorkload, sortBy]);

  // RESET FILTERS AND SEARCH
  const clearFilters = () => {
    setSearchTerm("");
    setFilterWorkload("All");
    setSortBy("Recommended");
  };

  // RETRY API REQUEST
  const handleRetry = () => {
    setRefreshKey((previous) => previous + 1);
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="p-8 text-slate-600" role="status">
        Loading employee recommendations...
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-700">
            Unable to load recommendations
          </h2>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Recommendations
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Find suitable employees for task allocation based on their current
          workload and capacity indicators.
        </p>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-8 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Search and Filter
        </h2>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          {/* SEARCH */}
          <div className="w-full lg:flex-1">
            <label
              htmlFor="recommendation-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Search Employees
            </label>

            <input
              id="recommendation-search"
              type="search"
              placeholder="Search by name, job title or recommendation reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* WORKLOAD FILTER */}
          <div className="w-full lg:flex-1">
            <DropDown
              label="Filter by Workload"
              options={[
                "All",
                "No Active Tasks",
                "Has Active Tasks",
                "Has Overdue Tasks",
                "Has Blocked Tasks"
              ]}
              selectedOption={filterWorkload}
              onSelect={setFilterWorkload}
            />
          </div>

          {/* SORT */}
          <div className="w-full lg:flex-1">
            <DropDown
              label="Sort by"
              options={[
                "Recommended",
                "Active Story Points",
                "Active Tasks",
                "Completed Tasks"
              ]}
              selectedOption={sortBy}
              onSelect={setSortBy}
            />
          </div>
        </div>

        {/* RESULTS AND RESET */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing {filteredRecommendations.length} of {total} employees
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* SUMMARY COUNTS */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Recommendations</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{total}</p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Employees With No Active Tasks
          </p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {availableEmployees}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Employees With Overdue Tasks</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {employeesWithOverdueTasks}
          </p>
        </div>
      </div>

      {/* RECOMMENDATION RESULTS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecommendations.length === 0 ? (
          // EMPTY STATE
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <h3 className="text-xl font-semibold text-slate-800">
              {total === 0
                ? "No recommendations yet"
                : "No recommendations found"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {total === 0
                ? "Employee recommendations will appear here when available for the selected project."
                : "Try changing your search term or workload filters."}
            </p>

            {total > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          // REUSABLE RECOMMENDATION CARDS
          filteredRecommendations.map((r) => (
            <RecommendationCard
              key={r.employee?.id || r.rank}
              recommendation={r}
            />
          ))
        )}
      </div>
    </div>
  );
}
