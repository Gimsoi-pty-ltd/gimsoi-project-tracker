import { useState } from "react";

export default function FocusTodayCard({ tasks = [], loading = false, error = null, onUpdateStatus, onOpenTask }) {
  const [localTasks, setLocalTasks] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const displayTasks = localTasks || tasks;

  if (loading) {
    return (
      <div className="focus-card">
        <h3>Focus Today</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="focus-card">
        <h3>Focus Today</h3>
        <p>Something went wrong. Try again.</p>
      </div>
    );
  }

  if (!displayTasks.length) {
    return (
      <div className="focus-card">
        <h3>Focus Today</h3>
        <p>Nothing to focus on today. You're all clear.</p>
      </div>
    );
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...displayTasks].sort((a, b) => {
    const pA = priorityOrder[(a.priority || "low").toLowerCase()] ?? 2;
    const pB = priorityOrder[(b.priority || "low").toLowerCase()] ?? 2;
    if (pA !== pB) return pA - pB;
    const dA = a.dueDate || a.due_date || "9999-12-31";
    const dB = b.dueDate || b.due_date || "9999-12-31";
    return new Date(dA) - new Date(dB);
  });

  async function handleStatus(task, newStatus) {
    const id = task.id || task.title;
    setUpdatingId(id);
    setUpdateError(null);
    const oldTasks = displayTasks;
    const next = displayTasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t));
    setLocalTasks(next);
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(task.id, newStatus);
      }
    } catch (e) {
      setLocalTasks(oldTasks);
      setUpdateError("Couldn't update task. Check your connection and try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  // FIXED: Open now works even if parent doesn't pass onOpenTask
  function handleOpen(task) {
    if (onOpenTask) {
      onOpenTask(task);
      return;
    }
    // Fallback: try to go to Kanban / Tasks page
    // Change this URL to your real tasks page if different
    if (task.id) {
      window.location.href = `/tasks/${task.id}`;
    } else {
      alert("Opening: " + (task.title || task.name));
    }
  }

  return (
    <div className="focus-card">
      <h3>Focus Today</h3>
      <p>{sorted.length} task(s) to focus on</p>

      {updateError && (
        <p style={{ background: "#fee2e2", padding: 8, borderRadius: 8, fontSize: 13 }}>{updateError}</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
        {sorted.map((task) => {
          const title = task.title || task.name || "Untitled task";
          const priority = task.priority || "Low";
          const due = task.dueDate || task.due_date || "No due date";
          const status = (task.status || "todo").toLowerCase();
          const isBlocked = status === "blocked";
          const id = task.id || title;
          const isUpdating = updatingId === id;

          return (
            <li key={id} style={{ borderTop: "1px solid #eee", padding: "10px 0" }}>
              <div style={{ fontWeight: 600 }}>{title}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                <span style={{ background: "#fee2e2", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>{priority}</span>
                <span style={{ background: "#e0e7ff", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>Due: {due}</span>
                {isBlocked && (
                  <span style={{ background: "#111", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>Blocked</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {status !== "done" && status !== "completed" && (
                  <button
                    onClick={() => handleStatus(task, status === "todo" ? "in-progress" : "done")}
                    disabled={isUpdating}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff" }}
                  >
                    {isUpdating ? "Saving..." : status === "todo" ? "Start →" : "Mark Done ✓"}
                  </button>
                )}
                <button
                  onClick={() => handleOpen(task)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#f8f8f8" }}
                >
                  Open ↗
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}