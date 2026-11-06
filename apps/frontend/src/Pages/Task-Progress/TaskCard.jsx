import React, { useState } from "react";

const formatStatus = (status = "") => {
  const normalized = status.toString().toLowerCase();
  if (normalized === "in_progress" || normalized === "inprogress" || normalized === "in progress") return "In Progress";
  if (normalized === "todo" || normalized === "backlog") return "To Do";
  if (normalized === "done" || normalized === "completed") return "Done";
  if (normalized === "blocked") return "Blocked";
  if (normalized === "review") return "Review";

  return status
    ? status.toString().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Unknown";
};

const statusStyles = {
  "To Do": "bg-blue-500",
  "In Progress": "bg-orange-500",
  "Review": "bg-slate-600",
  Blocked: "bg-red-500",
  Done: "bg-green-500",
  Unknown: "bg-gray-400",
};

const TaskCard = ({ task = {}, onStatusChange }) => {
  const [currentStatus, setCurrentStatus] = useState(
    formatStatus(task.status || task.taskStatus)
  );

  const title = task.title || task.name || "Untitled Task";
  const statusColor = statusStyles[currentStatus] || statusStyles.Unknown;
  const assignedTo = typeof task.assignee === "string"
    ? task.assignee
    : task.assignee?.fullName || task.assignedTo?.fullName || "Unassigned";
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date";
  const projectName = task.project?.name || task.projectName || "Project";
  const priority = task.priority ? task.priority : "Medium";

  const handleSelectChange = (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    
    if (onStatusChange) {
      onStatusChange(task.id || task._id, newStatus);
    }
  };

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

          <div className="relative inline-block">
            <select
              value={currentStatus}
              onChange={handleSelectChange}
              className={`inline-flex items-center text-xs font-bold text-white ${statusColor} px-3 py-1.5 rounded-full appearance-none cursor-pointer outline-none pr-7 transition-colors duration-200`}
            >
              <option value="To Do" className="bg-white text-gray-800">To Do</option>
              <option value="In Progress" className="bg-white text-gray-800">In Progress</option>
              <option value="Review" className="bg-white text-gray-800">Review</option>
              <option value="Blocked" className="bg-white text-gray-800">Blocked</option>
              <option value="Done" className="bg-white text-gray-800">Done</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
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