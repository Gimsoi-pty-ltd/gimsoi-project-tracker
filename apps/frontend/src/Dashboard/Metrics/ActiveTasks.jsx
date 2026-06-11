import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ArrowUp, ArrowDown, ArrowRight,
  ArrowUpRight, MoreVertical, ExternalLink,
} from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";
import TaskModal from "./TaskModal";

const statusColors = {
  inProgress: "bg-blue-500",
  review:     "bg-orange-400",
  blocked:    "bg-red-500",
  todo:       "bg-blue-400",
  done:       "bg-green-500",
};

export default function ActiveTasksCard() {
  const navigate = useNavigate();
  const activeSprint = useProjectStore((state) => state.activeSprint);
  const tasks = activeSprint?.tasks || [];
  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedStatus,   setSelectedStatus]   = useState("All");
  const [selectedOwner,    setSelectedOwner]    = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [dueDateSort,      setDueDateSort]      = useState("Earliest");
  const [isTaskModalOpen,  setIsTaskModalOpen]  = useState(false);
  const [selectedTaskIds,  setSelectedTaskIds]  = useState(new Set());
  
  const [activeDropdownTaskId, setActiveDropdownTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const statusOptions   = ["All", ...new Set(tasks.map((t) => t.status))];
  const ownerOptions    = ["All", ...new Set(tasks.map((t) => t.assignee))];
  const priorityOptions = ["All", ...new Set(tasks.map((t) => t.priority))];

  useEffect(() => {
    const handleClose = () => setActiveDropdownTaskId(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTaskIds(new Set(filteredTasks.map((t) => t.id)));
    } else {
      setSelectedTaskIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    if (filteredTasks.length === 0) return;
    const headers = ["Task ID", "Task Name", "Owner", "Status", "Due Date", "Priority", "Story Points", "Tag"];
    const rows = filteredTasks.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.assignee}"`,
      t.status,
      t.dueDate,
      t.priority,
      t.storyPoints ?? "",
      t.tag,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tasks_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setSelectedOwner("All");
    setSelectedPriority("All");
    setDueDateSort("Earliest");
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        await useProjectStore.getState().fetchDashboard();
      } catch (err) {
        alert(err.message || "Failed to delete task");
      }
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task.id, {
        version: task.version,
        status: newStatus
      });
      await useProjectStore.getState().fetchDashboard();
    } catch (err) {
      alert(err.message || "Failed to update task status");
    }
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
          <button 
            onClick={handleExport}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
          >
            Export
          </button>
          <button 
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="bg-blue-900 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer"
          >
            + Add Task
          </button>
        </div>
      </div>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }} 
        task={editingTask}
      />

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
          className="text-blue-600 text-sm font-medium hover:underline cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-3 px-2">
                <input 
                  type="checkbox" 
                  checked={filteredTasks.length > 0 && selectedTaskIds.size === filteredTasks.length}
                  onChange={handleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="py-3 px-2 font-medium">TASK NAME</th>
              <th className="py-3 px-2 font-medium">OWNER</th>
              <th className="py-3 px-2 font-medium">STATUS</th>
              <th className="py-3 px-2 font-medium">DUE DATE</th>
              <th className="py-3 px-2 font-medium">PRIORITY</th>
              <th className="py-3 px-2 font-medium">STORY POINTS</th>
              <th className="py-3 px-2 font-medium">TAGS</th>
              <th className="py-3 px-2 font-medium text-right pr-6">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-4 px-2">
                  <input 
                    type="checkbox" 
                    checked={selectedTaskIds.has(task.id)}
                    onChange={() => handleSelectRow(task.id)}
                    className="cursor-pointer"
                  />
                </td>

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

                <td className="py-4 px-2 text-gray-700">{task.storyPoints ?? "—"}</td>

                <td className="py-4 px-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${task.tagColor}`}>
                    {task.tag}
                  </span>
                </td>

                <td className="py-4 px-2 text-right pr-6 relative">
                  <div className="flex items-center justify-end gap-3 text-gray-500">
                    <button 
                      onClick={() => navigate("/kanban-board")} 
                      className="hover:text-gray-700 cursor-pointer"
                      title="View on Kanban board"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownTaskId(activeDropdownTaskId === task.id ? null : task.id);
                      }} 
                      className="hover:text-gray-700 cursor-pointer"
                      title="More actions"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {activeDropdownTaskId === task.id && (
                    <div className="absolute right-6 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 text-left">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                          setActiveDropdownTaskId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        Edit Task
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <div className="px-4 py-1 text-xs text-gray-400 font-bold uppercase tracking-wider">Change Status</div>
                      <button
                        onClick={() => {
                          handleStatusChange(task, 'TODO');
                          setActiveDropdownTaskId(null);
                        }}
                        className="w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-400" /> To Do
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange(task, 'IN_PROGRESS');
                          setActiveDropdownTaskId(null);
                        }}
                        className="w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> In Progress
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange(task, 'BLOCKED');
                          setActiveDropdownTaskId(null);
                        }}
                        className="w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500" /> Blocked
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange(task, 'DONE');
                          setActiveDropdownTaskId(null);
                        }}
                        className="w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500" /> Done
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => {
                          handleDeleteTask(task.id);
                          setActiveDropdownTaskId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                      >
                        Delete Task
                      </button>
                    </div>
                  )}
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
        <p>Click external link icon to navigate to Kanban board</p>
        <p>Use filters to narrow down tasks</p>
        <p>Use more icon menu to edit, update status, or delete tasks</p>
      </div>
    </div>
  );
}