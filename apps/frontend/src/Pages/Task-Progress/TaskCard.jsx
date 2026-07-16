import React from "react";

const formatStatus = (status = "") => {
  const normalized = status.toString().toLowerCase();
  if (normalized === "in_progress" || normalized === "inprogress" || normalized === "in progress") return "In Progress";
  if (normalized === "todo" || normalized === "backlog") return "To Do";
  if (normalized === "done" || normalized === "completed") return "Done";
  if (normalized === "blocked") return "Blocked";
  return status
    ? status.toString().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Unknown";
};

const statusStyles = {
  "To Do": "bg-blue-500",
  "In Progress": "bg-orange-500",
  Blocked: "bg-red-500",
  Done: "bg-green-500",
  Unknown: "bg-gray-400",
};

const TaskCard = ({ task = {} }) => {
  const title = task.title || task.name || "Untitled Task";
  const status = formatStatus(task.status || task.taskStatus);
  const statusColor = statusStyles[status] || statusStyles.Unknown;
  const assignedTo = typeof task.assignee === "string"
    ? task.assignee
    : task.assignee?.fullName || task.assignedTo?.fullName || "Unassigned";
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date";
  const projectName = task.project?.name || task.projectName || "Project";
  const priority = task.priority ? task.priority : "Medium";

  return (
    <div className="bg-white rounded-2xl shadow-sm w-[260px] overflow-hidden border border-gray-200">
      <div className="bg-[#f97316] px-6 py-4">
        <h2 className="text-sm font-bold text-white tracking-wide uppercase">Task Progress</h2>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Project Name</p>
          <p className="text-sm font-semibold text-[#002D62] hover:underline">{projectName}</p>
        </div>

        <div className="border-t border-gray-100" />

        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Task</p>
          <p className="text-sm font-medium text-gray-800">{title}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Task Status</p>
          <span className={`inline-flex items-center gap-2 text-xs font-bold text-white ${statusColor} px-3 py-1 rounded-full`}>
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            {status}
          </span>
        </div>

        <div className="border-t border-gray-100" />

        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Assigned</p>
          <p className="text-sm font-medium text-gray-800">{assignedTo}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Due Date</p>
          <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">{dueDate}</span>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Priority</p>
          <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">{priority}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
