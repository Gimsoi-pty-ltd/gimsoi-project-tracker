import React, { useMemo, useState } from "react";
import {
  Search, ArrowUp, ArrowDown, ArrowRight,
  ArrowUpRight, MoreVertical, ExternalLink,
} from "lucide-react";
import { useProjectStore } from "../../store/projectStore";

const statusColors = {
  inProgress: "bg-blue-500",
  review:     "bg-orange-400",
  blocked:    "bg-red-500",
  todo:       "bg-blue-400",
  done:       "bg-green-500",
};

export default function ActiveTasksCard() {
  const { activeSprint } = useProject();
  const tasks = activeSprint?.tasks || [];
  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedStatus,   setSelectedStatus]   = useState("All");
  const [selectedOwner,    setSelectedOwner]    = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [dueDateSort,      setDueDateSort]      = useState("Earliest");
  const statusOptions   = ["All", ...new Set(tasks.map((t) => t.status))];
  const ownerOptions    = ["All", ...new Set(tasks.map((t) => t.assignee))];
  const priorityOptions = ["All", ...new Set(tasks.map((t) => t.priority))];

  
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (searchTerm)
      result = result.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (selectedStatus !== "All")
      result = result.filter((t) => t.status === selectedStatus);

    if (selectedOwner !== "All")
      result = result.filter((t) => t.assignee === selectedOwner);

    if (selectedPriority !== "All")
      result = result.filter((t) => t.priority === selectedPriority);

    result.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dueDateSort === "Earliest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [tasks, searchTerm, selectedStatus, selectedOwner, selectedPriority, dueDateSort]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setSelectedOwner("All");
    setSelectedPriority("All");
    setDueDateSort("Earliest");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-blue-400 uppercase">Active Tasks</h3>
        <div className="flex items-center gap-3">
          <select
            value={dueDateSort}
            onChange={(e) => setDueDateSort(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="Earliest">Due Date: Earliest</option>
            <option value="Latest">Due Date: Latest</option>
          </select>
          <button className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition">
            Export
          </button>
          <button className="bg-blue-900 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition">
            + Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 w-[260px]">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-2 w-full outline-none text-sm"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none hover:bg-gray-50"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>Status: {s}</option>
          ))}
        </select>

        <select
          value={selectedOwner}
          onChange={(e) => setSelectedOwner(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none hover:bg-gray-50"
        >
          {ownerOptions.map((o) => (
            <option key={o} value={o}>Owner: {o}</option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none hover:bg-gray-50"
        >
          {priorityOptions.map((p) => (
            <option key={p} value={p}>Priority: {p}</option>
          ))}
        </select>

        <button
          onClick={clearFilters}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-3 px-2"><input type="checkbox" /></th>
              <th className="py-3 px-2 font-medium">TASK NAME</th>
              <th className="py-3 px-2 font-medium">OWNER</th>
              <th className="py-3 px-2 font-medium">STATUS</th>
              <th className="py-3 px-2 font-medium">DUE DATE</th>
              <th className="py-3 px-2 font-medium">PRIORITY</th>
              <th className="py-3 px-2 font-medium">STORY POINTS</th>
              <th className="py-3 px-2 font-medium">TAGS</th>
              <th className="py-3 px-2 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-4 px-2"><input type="checkbox" /></td>

                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="font-medium text-gray-700">{task.title}</span>
                  </div>
                </td>

                <td className="py-4 px-2 text-gray-600">{task.assignee}</td>

                <td className="py-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColors[task.status] ?? "bg-gray-400"}`} />
                    <span>{task.status}</span>
                  </div>
                </td>

                <td className="py-4 px-2 text-gray-600">{task.dueDate}</td>

                <td className="py-4 px-2">
                  <div className="flex items-center gap-2">
                    {task.priority === "High"     && <ArrowUp      size={16} className="text-orange-500" />}
                    {task.priority === "Low"      && <ArrowDown    size={16} className="text-green-700"  />}
                    {task.priority === "Critical" && <ArrowUpRight size={16} className="text-red-900"    />}
                    {task.priority === "Medium"   && <ArrowRight   size={16} className="text-gray-700"   />}
                    <span>{task.priority}</span>
                  </div>
                </td>

                <td className="py-4 px-2 text-gray-700">{task.storyPoints}</td>

                <td className="py-4 px-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${task.tagColor}`}>
                    {task.tag}
                  </span>
                </td>

                <td className="py-4 px-2">
                  <div className="flex items-center gap-3 text-gray-500">
                    <button className="hover:text-gray-700"><ExternalLink size={16} /></button>
                    <button className="hover:text-gray-700"><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-400">
                  No matching tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap gap-5 text-xs text-gray-500 mt-5 border-t border-gray-100 pt-4">
        <p>Click a row to view task details</p>
        <p>Use filters to narrow down tasks</p>
        <p>Use actions to edit, reassign, or update status</p>
      </div>
    </div>
  );
}