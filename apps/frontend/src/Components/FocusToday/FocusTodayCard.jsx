import { useState } from "react";
import { useProjectStore } from "../../store/projectStore";

export default function FocusTodayCard({
  tasks = [],
  loading = false,
  error = null,
  onOpenTask,
}) {
  const [localTasks, setLocalTasks] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const displayTasks = localTasks || tasks;

  if (loading) {
    return (
      <div className="focus-card" style={{ padding: 20, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Focus Today</h3>
        <div style={{ marginTop: 12 }}>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              style={{
                height: 70,
                background: "#f3f4f6",
                borderRadius: 10,
                marginBottom: 10,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="focus-card" style={{ padding: 20, border: "1px solid #fee2e2", borderRadius: 12, background: "#fef2f2" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#991b1b" }}>Focus Today</h3>
        <p style={{ color: "#b91c1c", fontSize: 14, marginTop: 4 }}>
          Something went wrong while loading your tasks. Please refresh to try again.
        </p>
      </div>
    );
  }

  if (!displayTasks.length) {
    return (
      <div className="focus-card" style={{ padding: 20, border: "1px solid #e5e7eb", borderRadius: 12, textAlign: "center", background: "#fff" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Focus Today</h3>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>
          🎉 Nothing to focus on today. You're all clear.
        </p>
      </div>
    );
  }

  const priorityOrder = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  // Requirement 1: Sort by Blocked tasks first -> Priority -> Due Date
  const sorted = [...displayTasks].sort((a, b) => {
    const statusA = (a.status || "todo").toLowerCase();
    const statusB = (b.status || "todo").toLowerCase();

    const isBlockedA = statusA === "blocked" || statusA === "on-hold";
    const isBlockedB = statusB === "blocked" || statusB === "on-hold";

    if (isBlockedA !== isBlockedB) {
      return isBlockedA ? -1 : 1;
    }

    const priorityA = priorityOrder[(a.priority || "low").toLowerCase()] ?? 3;
    const priorityB = priorityOrder[(b.priority || "low").toLowerCase()] ?? 3;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    const dueA = a.dueDate || a.due_date || "9999-12-31";
    const dueB = b.dueDate || b.due_date || "9999-12-31";

    return new Date(dueA) - new Date(dueB);
  });

  const getTaskKey = (task, index) => task.id || task._id || task.taskId || task.title || task.name || index;

  // Requirement 3 & 4: Instant local update + background sync without UI lockups
  function handleStatus(task, newStatus, index) {
    const taskUniqueKey = getTaskKey(task, index);
    const taskId = task.id || task._id || task.taskId;
    setActiveDropdownId(null);

    const apiStatus = newStatus === "in-progress" ? "inProgress" : newStatus;

    // Instant local UI state change
    const nextTasks = displayTasks.map((item, idx) => {
      const match = getTaskKey(item, idx) === taskUniqueKey || item.title === task.title;
      return match ? { ...item, status: apiStatus } : item;
    });

    setLocalTasks(nextTasks);

    // Background store sync attempt without blocking UI
    try {
      const store = useProjectStore.getState();
      const updateFn = store.updateTaskStatus || store.updateTask || store.editTask;

      if (typeof updateFn === "function" && taskId) {
        updateFn(taskId, apiStatus).catch((err) => {
          console.warn("Background store update notice:", err);
        });
      }

      window.dispatchEvent(
        new CustomEvent("task-status-updated", {
          detail: { taskId, newStatus: apiStatus },
        })
      );
    } catch (e) {
      console.error("Status update execution error:", e);
    }
  }

  // Requirement 3: Open task details safely
  function handleOpen(task, index) {
    setActiveDropdownId(null);

    if (typeof onOpenTask === "function") {
      onOpenTask(task);
      return;
    }

    const taskId = task.id || task._id || task.taskId || task.key;
    if (taskId) {
      try {
        window.location.href = `/tasks/${taskId}`;
      } catch (err) {
        window.dispatchEvent(
          new CustomEvent("open-task-detail", { detail: { task, taskId } })
        );
      }
    } else {
      const identifier = task.title || task.name;
      if (identifier) {
        window.location.href = `/tasks?search=${encodeURIComponent(identifier)}`;
      }
    }
  }

  return (
    <div className="focus-card" style={{ padding: 20, border: "1px solid #e5e7eb", borderRadius: 12, background: "#ffffff", fontFamily: "sans-serif" }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>Focus Today</h3>
      <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: 14, fontWeight: 500 }}>
        {sorted.length} task(s) to focus on
      </p>

      <ul style={{ listStyle: "none", padding: 0, marginTop: 16, marginBottom: 0 }}>
        {sorted.map((task, index) => {
          const title = task.title || task.name || "Untitled task";
          const priority = task.priority || "Low";
          const status = (task.status || "todo")
            .toLowerCase()
            .replaceAll("_", "-")
            .replaceAll(" ", "-");

          const due = task.dueDate || task.due_date || null;

          const priorityColors = {
            critical: { background: "#fee2e2", color: "#b91c1c" },
            high: { background: "#ffedd5", color: "#c2410c" },
            medium: { background: "#fef3c7", color: "#92400e" },
            low: { background: "#dcfce7", color: "#166534" },
          };

          const priorityStyle = priorityColors[priority.toLowerCase()] || priorityColors.low;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const dueDate = due ? new Date(due) : null;
          if (dueDate && !Number.isNaN(dueDate.getTime())) {
            dueDate.setHours(0, 0, 0, 0);
          }

          const isOverdue = dueDate && !Number.isNaN(dueDate.getTime()) && dueDate < today && status !== "done" && status !== "completed";

          const threeDaysFromNow = new Date(today);
          threeDaysFromNow.setDate(today.getDate() + 3);

          const isDueSoon = dueDate && !Number.isNaN(dueDate.getTime()) && dueDate >= today && dueDate <= threeDaysFromNow;

          const isBlocked = status === "blocked" || status === "on-hold";
          const taskUniqueKey = getTaskKey(task, index);
          const isCompleted = status === "done" || status === "completed";
          const isToDo = status === "todo" || status === "to-do";
          const isMenuOpen = activeDropdownId === taskUniqueKey;

          return (
            <li
              key={taskUniqueKey}
              style={{
                borderTop: "1px solid #f3f4f6",
                padding: "14px 0",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{title}</div>

              {/* Requirement 2: Visual badges */}
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span
                  style={{
                    background: priorityStyle.background,
                    color: priorityStyle.color,
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {priority}
                </span>

                <span
                  style={{
                    background: isOverdue ? "#fee2e2" : isDueSoon ? "#fef3c7" : "#e0e7ff",
                    color: isOverdue ? "#b91c1c" : isDueSoon ? "#92400e" : "#3730a3",
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {due
                    ? isOverdue
                      ? `Overdue: ${due}`
                      : isDueSoon
                      ? `Due soon: ${due}`
                      : `Due: ${due}`
                    : "No due date"}
                </span>

                {isBlocked && (
                  <span
                    style={{
                      background: "#111827",
                      color: "#ffffff",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Blocked
                  </span>
                )}
              </div>

              {/* Requirement 3: Quick Action Buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 10, position: "relative", alignItems: "center" }}>
                {!isCompleted && !isBlocked && (
                  <button
                    onClick={() => handleStatus(task, isToDo ? "in-progress" : "done", index)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      cursor: "pointer",
                      background: "#ffffff",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    {isToDo ? "Start →" : "Mark Done ✓"}
                  </button>
                )}

                <button
                  onClick={() => handleOpen(task, index)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    cursor: "pointer",
                    background: "#f9fafb",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Open ↗
                </button>

                {/* More status actions menu (...) */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setActiveDropdownId(isMenuOpen ? null : taskUniqueKey)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      cursor: "pointer",
                      background: "#f9fafb",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#374151",
                    }}
                    title="More actions"
                  >
                    ⋯
                  </button>

                  {isMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        marginTop: 4,
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        zIndex: 10,
                        minWidth: 140,
                      }}
                    >
                      <div style={{ padding: "4px 10px", fontSize: 11, color: "#6b7280", borderBottom: "1px solid #f3f4f6", fontWeight: 600 }}>
                        Change Status:
                      </div>
                      <button
                        onClick={() => handleStatus(task, "todo", index)}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 12px", background: "none", border: "none", fontSize: 13, cursor: "pointer", color: "#374151" }}
                      >
                        Set To Do
                      </button>
                      <button
                        onClick={() => handleStatus(task, "in-progress", index)}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 12px", background: "none", border: "none", fontSize: 13, cursor: "pointer", color: "#374151" }}
                      >
                        Set In Progress
                      </button>
                      <button
                        onClick={() => handleStatus(task, "blocked", index)}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 12px", background: "none", border: "none", fontSize: 13, cursor: "pointer", color: "#b91c1c" }}
                      >
                        Mark Blocked
                      </button>
                      <button
                        onClick={() => handleStatus(task, "done", index)}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 12px", background: "none", border: "none", fontSize: 13, cursor: "pointer", color: "#166534" }}
                      >
                        Mark Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}