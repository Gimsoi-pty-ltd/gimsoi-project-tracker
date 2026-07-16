import React, { useMemo } from "react";
import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";

const statusStyles = {
  todo: "bg-blue-500 text-white",
  in_progress: "bg-orange-500 text-white",
  "in progress": "bg-orange-500 text-white",
  inprogress: "bg-orange-500 text-white",
  blocked: "bg-red-500 text-white",
  done: "bg-green-500 text-white",
  completed: "bg-green-500 text-white",
};

const normalizeStatus = (status = "") => {
  if (!status) return "todo";
  return status.toString().toLowerCase().replace(/ /g, "_");
};

const formatDate = (date) => {
  if (!date) return "No due date";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const mapTask = (task = {}, currentProjectName) => ({
  id: task.id,
  title: task.title || task.name || "Untitled task",
  status: normalizeStatus(task.status || task.taskStatus),
  priority: task.priority || "medium",
  assignee:
    typeof task.assignee === "string"
      ? task.assignee
      : task.assignee?.fullName || task.assignedTo?.fullName || "Unassigned",
  dueDate: task.dueDate || task.dueDateString || null,
  projectName: task.project?.name || task.projectName || currentProjectName || "Current Project",
});

export default function ActiveProjects() {
  const { currentProject, activeSprint, projectTasks, dashboardLoading, dashboardError } = useProjectStore();
  const { tasks: fallbackTasks } = useTaskStore();

  const taskSource = activeSprint?.tasks?.length
    ? activeSprint.tasks
    : projectTasks.length
      ? projectTasks
      : fallbackTasks;

  const groupedTasks = useMemo(() => {
    return taskSource.reduce((groups, rawTask) => {
      const task = mapTask(rawTask, currentProject?.name);
      const projectName = task.projectName || currentProject?.name || "Current Project";
      if (!groups[projectName]) groups[projectName] = [];
      groups[projectName].push(task);
      return groups;
    }, {});
  }, [taskSource, currentProject?.name]);

  const totalTasks = taskSource.length;
  const overdueTasks = taskSource.filter((task) => {
    const due = task.dueDate ? new Date(task.dueDate).getTime() : null;
    return due && due < Date.now() && !["done", "completed"].includes(normalizeStatus(task.status));
  }).length;
  const blockedTasks = taskSource.filter((task) => normalizeStatus(task.status) === "blocked").length;
  const inProgressTasks = taskSource.filter((task) => ["in_progress", "in progress", "inprogress"].includes(normalizeStatus(task.status))).length;

  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Active Projects</h1>
            <p className="mt-2 text-sm text-slate-600">
              Showing current active work items for {currentProject?.name || "your project"}.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total tasks</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{totalTasks}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">In progress</p>
              <p className="mt-3 text-2xl font-semibold text-blue-600">{inProgressTasks}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Blocked</p>
              <p className="mt-3 text-2xl font-semibold text-red-600">{blockedTasks}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Overdue</p>
              <p className="mt-3 text-2xl font-semibold text-amber-600">{overdueTasks}</p>
            </div>
          </div>
        </div>

        {dashboardLoading && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Loading active project tasks...
          </div>
        )}

        {dashboardError && !dashboardLoading && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
            {dashboardError}
          </div>
        )}

        {!dashboardLoading && !dashboardError && totalTasks === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            There are no active tasks to display. Add tasks to the current sprint or select another sprint to populate this page.
          </div>
        )}

        {!dashboardLoading && !dashboardError && totalTasks > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedTasks).map(([projectName, tasks]) => (
              <div key={projectName} className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{projectName}</h2>
                    <p className="text-sm text-slate-500">{tasks.length} active task{tasks.length === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Task</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Assigned</th>
                        <th className="px-6 py-4">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                          <td className="px-6 py-4 text-slate-900 font-medium">{task.title}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status] || "bg-slate-200 text-slate-700"}`}>
                              {task.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 capitalize text-slate-800">{task.priority}</td>
                          <td className="px-6 py-4 text-slate-700">{task.assignee}</td>
                          <td className="px-6 py-4 text-slate-700">{formatDate(task.dueDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
