import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ArrowUp, ArrowDown, ArrowRight,
  ArrowUpRight, MoreVertical, ExternalLink,
} from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";
import { useAuthStore } from "../../store/authStore";
import { resourceAPI } from "../../api/api";
import { hasPermission } from "../../utils/accessControl";
import ImportButton from "../../Components/Buttons/ImportButton";
import ExportButton from "../../Components/Buttons/exportButton";
import { fetchAllProjectTasks, mapTaskForDashboard } from "../../store/projectStore";
import TaskModal from "./TaskModal";

const statusColors = {
  inProgress: "bg-blue-500",
  review:     "bg-orange-400",
  blocked:    "bg-red-500",
  todo:       "bg-blue-400",
  done:       "bg-green-500",
};

const TASK_CSV_HEADERS = ["title", "description", "priority", "dueDate", "storyPoints", "sprint", "phase", "assignee", "owners", "teamMembers", "department"];

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field); field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = []; field = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else field += character;
  }
  if (quoted) throw new Error("The CSV contains an unclosed quoted field.");
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
};

const csvEscape = (value) => {
  let text = value == null ? "" : String(value);
  if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export default function ActiveTasksCard() {
  const navigate = useNavigate();
  const activeSprint = useProjectStore((state) => state.activeSprint);
  const currentProject = useProjectStore((state) => state.currentProject);
  const projectSprints = useProjectStore((state) => state.projectSprints);
  const user = useAuthStore((state) => state.user);
  const [taskScope, setTaskScope] = useState("sprint");
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectTasksLoading, setProjectTasksLoading] = useState(false);
  const [projectTasksError, setProjectTasksError] = useState("");
  const [taskImporting, setTaskImporting] = useState(false);
  const [taskImportResult, setTaskImportResult] = useState(null);
  const [optionRows, setOptionRows] = useState({ phases: [], members: [], labels: [] });
  const phaseNameById = new Map(optionRows.phases.map((phase) => [phase.id, phase.name]));
  const scopedTasks = taskScope === "project" ? projectTasks : activeSprint?.tasks || [];
  const tasks = scopedTasks.map((task) => ({
    ...task,
    phaseName: task.phaseName || phaseNameById.get(task.phaseId) || "—",
    sprintName: task.sprintName || (task.sprintId ? projectSprints.find((sprint) => sprint.id === task.sprintId)?.name : "Backlog") || "Backlog",
  }));
  const isViewOnlyRole = ["INTERN", "CLIENT"].includes(user?.role);
  const canCreateTask = !isViewOnlyRole && hasPermission(user?.role, "CREATE_TASK");
  const canUpdateAnyTask = !isViewOnlyRole && hasPermission(user?.role, "UPDATE_ANY_TASK");
  const canUpdateOwnTaskStatus = !isViewOnlyRole && hasPermission(user?.role, "UPDATE_OWN_TASK_STATUS");
  const canDeleteTask = !isViewOnlyRole && hasPermission(user?.role, "DELETE_TASK");
  const canDeleteOwnTask = !isViewOnlyRole && hasPermission(user?.role, "DELETE_OWN_TASK");
  const canActOnTask = (task) =>
    canUpdateAnyTask || canDeleteTask ||
    (canUpdateOwnTaskStatus && task.assigneeId === user?.id) ||
    (canDeleteOwnTask && task.reporterId === user?.id);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedStatus,   setSelectedStatus]   = useState("All");
  const [selectedOwner,    setSelectedOwner]    = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [dueDateSort,      setDueDateSort]      = useState("Earliest");
  const [isTaskModalOpen,  setIsTaskModalOpen]  = useState(false);
  const [selectedTaskIds,  setSelectedTaskIds]  = useState(new Set());
  
  const [activeDropdownTaskId, setActiveDropdownTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToast, setTaskToast] = useState(null);

  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const createTask = useTaskStore((state) => state.createTask);

  useEffect(() => {
    if (taskScope !== "project" || !currentProject?.id) return undefined;
    let cancelled = false;
    setProjectTasksLoading(true);
    setProjectTasksError("");
    fetchAllProjectTasks(currentProject.id)
      .then((allTasks) => {
        if (!cancelled) setProjectTasks(allTasks.map(mapTaskForDashboard));
      })
      .catch((error) => {
        if (!cancelled) setProjectTasksError(error.response?.data?.message || "Could not load all project tasks.");
      })
      .finally(() => { if (!cancelled) setProjectTasksLoading(false); });
    return () => { cancelled = true; };
  }, [taskScope, currentProject?.id]);

  useEffect(() => {
    if (!currentProject?.id) return;
    Promise.all([
      resourceAPI.get(`/phases?projectId=${currentProject.id}&limit=100`),
      resourceAPI.get(`/projects/${currentProject.id}/members`),
      resourceAPI.get(`/projects/${currentProject.id}/labels`),
    ]).then(([phasesResponse, membersResponse, labelsResponse]) => {
      setOptionRows({
        phases: phasesResponse.data?.data || [],
        members: (membersResponse.data?.data || []).map((member) => member.user).filter(Boolean),
        labels: labelsResponse.data?.data || [],
      });
    }).catch(() => setOptionRows({ phases: [], members: [], labels: [] }));
  }, [currentProject?.id]);

  const statusOptions   = ["All", ...new Set(tasks.map((t) => t.status))];
  const ownerOptions    = ["All", ...new Set(tasks.map((t) => t.assignee))];
  const priorityOptions = ["All", ...new Set(tasks.map((t) => t.priority))];

  useEffect(() => {
    const handleClose = () => setActiveDropdownTaskId(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  useEffect(() => {
    if (!taskToast) return undefined;
    const timeoutId = window.setTimeout(() => setTaskToast(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [taskToast]);

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setSelectedOwner("All");
    setSelectedPriority("All");
    setDueDateSort("Earliest");
  };

  const refreshProjectTasks = async () => {
    if (!currentProject?.id) return;
    const allTasks = await fetchAllProjectTasks(currentProject.id);
    setProjectTasks(allTasks.map(mapTaskForDashboard));
  };

  const handleTaskExport = async () => {
    let rows = filteredTasks;
    if (taskScope === "project") {
      const allTasks = await fetchAllProjectTasks(currentProject.id);
      rows = allTasks.map((task) => ({
        ...mapTaskForDashboard(task),
        phaseName: phaseNameById.get(task.phaseId) || "—",
        sprintName: task.sprint?.name || "Backlog",
      }));
    }
    const columns = [
      ["Task", "title"], ["Status", "rawStatus"], ["Priority", "rawPriority"],
      ["Sprint", "sprintName"], ["Phase", "phaseName"], ["Assignee", "assignee"],
      ["Due date", "dueDate"], ["Story points", "storyPoints"], ["Departments", "tags"],
      ["Description", "description"],
    ];
    const csv = [
      columns.map(([label]) => csvEscape(label)).join(","),
      ...rows.map((task) => columns.map(([, key]) => {
        const value = key === "tags" ? (task.labels || []).map((label) => label.name).join("; ") : task[key];
        return csvEscape(value);
      }).join(",")),
    ].join("\r\n");
    return {
      content: `\uFEFF${csv}`,
      filename: `${currentProject?.name?.replace(/[^a-z0-9]+/gi, "_") || "project"}_${taskScope}_tasks_${new Date().toISOString().slice(0, 10)}.csv`,
    };
  };

  const handleTaskImport = async (file) => {
    setTaskImporting(true);
    setTaskImportResult(null);
    const failedRows = [];
    let created = 0;
    try {
      const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
      if (rows.length < 2) throw new Error("The CSV needs a header row and at least one task.");
      if (rows.length > 101) throw new Error("Import is limited to 100 tasks per file.");
      const headers = rows[0].map((header) => header.trim().toLowerCase());
      const titleIndex = headers.indexOf("title");
      if (titleIndex < 0) throw new Error("The CSV must include a title column.");
      const getCell = (values, name) => {
        const index = headers.indexOf(name.toLowerCase());
        return index < 0 ? "" : (values[index] || "").trim();
      };
      const sprintByName = new Map(projectSprints.map((sprint) => [sprint.name.trim().toLowerCase(), sprint]));
      const phaseByName = new Map(optionRows.phases.map((phase) => [phase.name.trim().toLowerCase(), phase]));
      const labelByName = new Map(optionRows.labels.map((label) => [label.name.trim().toLowerCase(), label]));
      const memberByName = new Map();
      optionRows.members.forEach((member) => {
        if (member.fullName) memberByName.set(member.fullName.trim().toLowerCase(), member);
        if (member.email) memberByName.set(member.email.trim().toLowerCase(), member);
      });
      const allowedPriorities = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);
      if (currentProject.status === "COMPLETED") {
        throw new Error("Tasks cannot be imported into a completed project.");
      }

      for (const [index, values] of rows.slice(1).entries()) {
        const rowNumber = index + 2;
        const title = (values[titleIndex] || "").trim();
        const priority = (getCell(values, "priority") || "MEDIUM").toUpperCase();
        const storyPointsValue = getCell(values, "storyPoints");
        const storyPoints = storyPointsValue ? Number(storyPointsValue) : null;
        const sprintName = getCell(values, "sprint").toLowerCase();
        const phaseName = getCell(values, "phase").toLowerCase();
        const departmentName = getCell(values, "department").toLowerCase();
        const assigneeName = getCell(values, "assignee").toLowerCase();
        const owners = getCell(values, "owners").split(";").map((name) => name.trim().toLowerCase()).filter(Boolean);
        const teamMembers = getCell(values, "teamMembers").split(";").map((name) => name.trim().toLowerCase()).filter(Boolean);
        const dueDateValue = getCell(values, "dueDate");
        const dueDate = dueDateValue ? new Date(dueDateValue) : null;
        let validationError = "";

        if (!title || title.length > 200) validationError = "Title is required and must be 200 characters or fewer";
        else if (!allowedPriorities.has(priority)) validationError = "Priority is not valid";
        else if (storyPoints !== null && (!Number.isInteger(storyPoints) || storyPoints < 0)) validationError = "Story points must be a non-negative whole number";
        else if (dueDate && Number.isNaN(dueDate.getTime())) validationError = "Due date is invalid";
        else if (sprintName && !sprintByName.has(sprintName)) validationError = `Sprint not found: ${getCell(values, "sprint")}`;
        else if (phaseName && !phaseByName.has(phaseName)) validationError = `Phase not found: ${getCell(values, "phase")}`;
        else if (departmentName && !labelByName.has(departmentName)) validationError = `Department tag not found: ${getCell(values, "department")}`;
        else if (assigneeName && !memberByName.has(assigneeName)) validationError = `Project member not found: ${getCell(values, "assignee")}`;
        else if (owners.some((name) => !memberByName.has(name))) validationError = "One or more owners are not project members";
        else if (teamMembers.some((name) => !memberByName.has(name))) validationError = "One or more team members are not project members";

        if (validationError) {
          failedRows.push({ row: rowNumber, message: validationError });
          continue;
        }

        try {
          const result = await createTask({
            title,
            description: getCell(values, "description") || null,
            status: "TODO",
            priority,
            projectId: currentProject.id,
            sprintId: sprintName ? sprintByName.get(sprintName).id : null,
            phaseId: phaseName ? phaseByName.get(phaseName).id : null,
            assigneeId: assigneeName ? memberByName.get(assigneeName).id : null,
            ownerIds: [...new Set(owners.map((name) => memberByName.get(name).id))],
            teamIds: [...new Set(teamMembers.map((name) => memberByName.get(name).id))],
            storyPoints,
            dueDate: dueDate ? dueDate.toISOString() : null,
            isBlocked: false,
          });
          const createdTask = result?.data?.data || result?.data || result;
          const label = departmentName ? labelByName.get(departmentName) : null;
          if (createdTask?.id && label) {
            await resourceAPI.post(`/tasks/${createdTask.id}/labels`, { labelIds: [label.id] });
          }
          created += 1;
        } catch (requestError) {
          failedRows.push({ row: rowNumber, message: requestError.response?.data?.message || requestError.message || "Could not create task" });
        }
      }

      setTaskImportResult({ created, failedRows });
      if (created) {
        useProjectStore.getState().fetchDashboard(currentProject.id);
        if (taskScope === "project") await refreshProjectTasks();
      }
    } catch (importError) {
      setTaskImportResult({ error: importError.message || "Could not read the task CSV." });
    } finally {
      setTaskImporting(false);
    }
  };

  const downloadTaskTemplate = () => {
    const blob = new Blob([`${TASK_CSV_HEADERS.join(",")}\r\n`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "project_tasks_import_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        await useProjectStore.getState().fetchDashboard();
        if (taskScope === "project") await refreshProjectTasks();
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
      if (taskScope === "project") await refreshProjectTasks();
    } catch (err) {
      alert(err.message || "Failed to update task status");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 w-full">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-bold text-sky-700 uppercase">Project tasks</h3>
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1" role="group" aria-label="Task scope">
            <button type="button" onClick={() => setTaskScope("sprint")} aria-pressed={taskScope === "sprint"} className={`rounded-md px-3 py-1.5 text-xs font-medium ${taskScope === "sprint" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Current sprint</button>
            <button type="button" onClick={() => setTaskScope("project")} aria-pressed={taskScope === "project"} className={`rounded-md px-3 py-1.5 text-xs font-medium ${taskScope === "project" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Entire project</button>
          </div>
          {taskScope === "project" && <span className="text-xs text-gray-500">{projectTasks.length} All tasks</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dueDateSort}
            onChange={(e) => setDueDateSort(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="Earliest">Due Date: Earliest</option>
            <option value="Latest">Due Date: Latest</option>
          </select>
          {canCreateTask && <>
            <ImportButton onFileSelect={handleTaskImport} disabled={taskImporting || !currentProject} label={taskImporting ? "Importing..." : "Import tasks"} />
            <button type="button" onClick={downloadTaskTemplate} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">template</button>
          </>}
          {hasPermission(user?.role, "VIEW_TASKS") && <ExportButton onExport={handleTaskExport} disabled={!tasks.length || projectTasksLoading} label={`Export ${taskScope === "project" ? "project" : "sprint"} tasks`} loadingLabel="Preparing CSV..." />}
          {canCreateTask && <button 
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="bg-blue-900 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer"
          >
            + Add Task
          </button>}

        </div>
      </div>

      {taskScope === "project" && projectTasksLoading && <p role="status" className="mb-4 text-sm text-gray-500">Loading all project tasks…</p>}
      {projectTasksError && taskScope === "project" && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{projectTasksError}</p>}
      
      {taskImportResult && (
        <div role={taskImportResult.error ? "alert" : "status"} className={`mb-4 rounded-lg border p-3 text-sm ${taskImportResult.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {taskImportResult.error ? taskImportResult.error : <>
            <p>Imported {taskImportResult.created} task{taskImportResult.created === 1 ? "" : "s"}; {taskImportResult.failedRows.length} row{taskImportResult.failedRows.length === 1 ? "" : "s"} failed.</p>
            {taskImportResult.failedRows.length > 0 && <ul className="mt-2 list-disc pl-5">{taskImportResult.failedRows.map((failure) => <li key={failure.row}>Row {failure.row}: {failure.message}</li>)}</ul>}
          </>}
        </div>
      )}

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }} 
        task={editingTask}
        initialSprintId={activeSprint?.id}
        onSuccess={(mode) => setTaskToast({ type: 'success', message: mode === 'updated' ? 'Task updated successfully.' : 'Task created successfully.' })}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 w-65">
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

      {taskToast && (
        <div
          role={taskToast.type === 'error' ? 'alert' : 'status'}
          aria-live={taskToast.type === 'error' ? 'assertive' : 'polite'}
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-70 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${taskToast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-50 bg-red-100 text-red-800'}`}
        >
          <div className="flex items-center justify-between gap-4">
            <span>{taskToast.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => setTaskToast(null)} className="font-semibold opacity-70 hover:opacity-100">×</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              {(canUpdateAnyTask || canUpdateOwnTaskStatus || canDeleteTask || canDeleteOwnTask) && <th className="py-3 px-2">
                <input
                  type="checkbox"
                  checked={filteredTasks.length > 0 && selectedTaskIds.size === filteredTasks.length}
                  onChange={handleSelectAll}
                  className="cursor-pointer"
                />
              </th>}
              <th className="py-3 px-2 font-medium">TASK NAME</th>
              {taskScope === "project" && <th className="py-3 px-2 font-medium">SPRINT</th>}
              {taskScope === "project" && <th className="py-3 px-2 font-medium">PHASE</th>}
              <th className="py-3 px-2 font-medium">OWNER</th>
              <th className="py-3 px-2 font-medium">STATUS</th>
              <th className="py-3 px-2 font-medium">DUE DATE</th>
              <th className="py-3 px-2 font-medium">PRIORITY</th>
              <th className="py-3 px-2 font-medium">STORY POINTS</th>
              <th className="py-3 px-2 font-medium">TAGS</th>
              <th className="py-3 px-2 font-medium text-right pr-6">{canUpdateAnyTask || canUpdateOwnTaskStatus || canDeleteTask ? "ACTIONS" : ""}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                {(canUpdateAnyTask || canUpdateOwnTaskStatus || canDeleteTask || canDeleteOwnTask) && <td className="py-4 px-2">
                  <input 
                    type="checkbox" 
                    checked={selectedTaskIds.has(task.id)}
                    onChange={() => handleSelectRow(task.id)}
                    className="cursor-pointer"
                  />
                </td>}

                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="font-medium text-gray-700">{task.title}</span>
                  </div>
                </td>

                {taskScope === "project" && <td className="py-4 px-2 text-gray-600">{task.sprintName}</td>}
                {taskScope === "project" && <td className="py-4 px-2 text-gray-600">{task.phaseName}</td>}

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
                    {task.priority === "Low"      && <ArrowDown    size={16} className="text-green-500"  />}
                    {task.priority === "Critical" && <ArrowUpRight size={16} className="text-red-500"    />}
                    {task.priority === "Medium"   && <ArrowRight   size={16} className="text-amber-500"   />}
                    <span>{task.priority}</span>
                  </div>
                </td>

                <td className="py-4 px-2 text-gray-700">{task.storyPoints ?? "—"}</td>

                <td className="py-4 px-2">
                  <div className="flex flex-wrap gap-1">
                    {(task.tags?.length ? task.tags : task.tag && task.tag !== "—" ? [task.tag] : []).map((tag) => (
                      <span key={tag} className={`px-2 py-1 rounded-md text-xs font-medium ${task.tagColor}`}>
                        {tag}
                      </span>
                    ))}
                    {!task.tags?.length && (!task.tag || task.tag === "—") && <span className="text-gray-400">—</span>}
                  </div>
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
                    {canActOnTask(task) && <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownTaskId(activeDropdownTaskId === task.id ? null : task.id);
                      }} 
                      className="hover:text-gray-700 cursor-pointer"
                      title="More actions"
                    >
                      <MoreVertical size={16} />
                    </button>}
                  </div>

                  {activeDropdownTaskId === task.id && canActOnTask(task) && (
                    <div className="absolute right-6 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 text-left">
                      {canUpdateAnyTask && <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                          setActiveDropdownTaskId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        Edit Task
                      </button>}
                      {(canUpdateAnyTask || canUpdateOwnTaskStatus) && <div className="border-t border-gray-100 my-1" />}
                      {(canUpdateAnyTask || (canUpdateOwnTaskStatus && task.assigneeId === user?.id)) && <>
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
                      </>}
                      {(canUpdateAnyTask || canDeleteTask || (canDeleteOwnTask && task.reporterId === user?.id)) && <div className="border-t border-gray-100 my-1" />}
                      {(canUpdateAnyTask || canDeleteTask || (canDeleteOwnTask && task.reporterId === user?.id)) && <button
                        onClick={() => {
                          handleDeleteTask(task.id);
                          setActiveDropdownTaskId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                      >
                        Delete Task
                      </button>}
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={9 + (taskScope === "project" ? 2 : 0) + ((canUpdateAnyTask || canUpdateOwnTaskStatus || canDeleteTask || canDeleteOwnTask) ? 1 : 0)} className="text-center py-8 text-gray-400">
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
