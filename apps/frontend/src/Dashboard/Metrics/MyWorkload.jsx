
import React, { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Ban,
  CalendarDays,
  RefreshCw,
  ListTodo,
} from "lucide-react";

import { resourceAPI } from "../../api/api";
import { useAuthStore } from "../../store/authStore";

const STAT_CARDS = [
  {
    key: "activeTasks",
    label: "Active Tasks",
    icon: BriefcaseBusiness,
    color: "text-blue-600",
    background: "bg-blue-50",
  },
  {
    key: "completedTasks",
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600",
    background: "bg-green-50",
  },
  {
    key: "overdueTasks",
    label: "Overdue",
    icon: Clock3,
    color: "text-orange-600",
    background: "bg-orange-50",
  },
  {
    key: "blockedTasks",
    label: "Blocked",
    icon: Ban,
    color: "text-red-600",
    background: "bg-red-50",
  },
  {
    key: "activeStoryPoints",
    label: "Active Story Points",
    icon: ListTodo,
    color: "text-purple-600",
    background: "bg-purple-50",
  },
];

const formatStatus = (status = "") =>
  status.replaceAll("_", " ");

const formatDate = (date) => {
  if (!date) return "No due date";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  }).format(new Date(date));
};

const getFocusHeading = (focusMode) => {
  if (focusMode === "DUE_TODAY") return "Focus Today";
  if (focusMode === "UP_NEXT") return "Up Next";
  return "Nothing on your focus list";
};

const MyWorkload = () => {
  const user = useAuthStore((state) => state.user);

  const [workloadData, setWorkloadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canViewWorkload = ["ADMIN", "PM", "INTERN"].includes(user?.role);

  const fetchWorkload = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await resourceAPI.get("/employees/me/workload");

      setWorkloadData(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your workload. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canViewWorkload) {
      fetchWorkload();
    }
  }, [canViewWorkload, fetchWorkload]);

  if (!canViewWorkload) {
    return null;
  }

  if (loading) {
    return (
      <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-sky-500 animate-spin" />
          <p className="text-sm text-gray-500">
            Loading your workload...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-red-600">{error}</p>

          <button
            onClick={fetchWorkload}
            className="flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (!workloadData) {
    return null;
  }

  const {
    employee,
    workload = {},
    focusMode,
    focusTasks = [],
  } = workloadData;

  return (
    <section className="space-y-4">
      {/* Personal workload heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            My Workload
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {employee?.fullName || "Your"} 
            {employee?.jobTitle ? ` · ${employee.jobTitle}` : ""}
          </p>
        </div>

        <button
          onClick={fetchWorkload}
          className="flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Workload summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          const value = workload[stat.key] ?? 0;

          return (
            <div
              key={stat.key}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm text-gray-500">
                  {stat.label}
                </p>

                <div className={`p-2 rounded-lg ${stat.background}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>

              <p className="text-2xl font-bold text-gray-800 mt-3">
                {value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Focus tasks */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-sky-50">
            <CalendarDays className="w-5 h-5 text-sky-600" />
          </div>

          <div>
            <h3 className="font-bold text-gray-800">
              {getFocusHeading(focusMode)}
            </h3>

            <p className="text-xs text-gray-500">
              {focusMode === "DUE_TODAY"
                ? "Tasks scheduled for today"
                : focusMode === "UP_NEXT"
                  ? "Your upcoming and in-progress tasks"
                  : "You're all caught up"}
            </p>
          </div>
        </div>

        {focusTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-9 h-9 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">
              No tasks to display
            </p>
            <p className="text-xs text-gray-500 mt-1">
              There are no tasks currently on your focus list.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {focusTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 break-words">
                    {task.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatStatus(task.status)}
                    </span>

                    <span className="text-xs text-gray-400">•</span>

                    <span className="text-xs text-gray-500">
                      {task.priority}
                    </span>

                    {(task.isBlocked || task.status === "BLOCKED") && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle size={12} />
                        Blocked
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Due date</p>
                    <p className="text-xs font-medium text-gray-600 mt-1">
                      {formatDate(task.dueDate)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">Points</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      {task.storyPoints ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyWorkload;
