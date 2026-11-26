import { useEffect, useState } from "react";

export default function HealthMetrics({ projectId }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawCount, setRawCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const API = "";
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        const url = projectId ? `/api/tasks?projectId=${encodeURIComponent(projectId)}` : `/api/tasks`;
        console.log("HealthMetrics - Request URL:", url);
        const res = await fetch(url, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        const data = await res.json();
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data.tasks)) list = data.tasks;
        else if (Array.isArray(data.data)) list = data.data;
        else if (Array.isArray(data.items)) list = data.items;
        else if (Array.isArray(data.results)) list = data.results;
        console.log("HealthMetrics - RAW from backend:", data);
        console.log("HealthMetrics - Normalized list:", list);
        if (!isMounted) return;
        setRawCount(list.length);
        const filtered = projectId
          ? list.filter((t) => {
              const pid = t.projectId ?? t.project_id ?? t.project?.id ?? t.project;
              if (!pid) return true;
              if (typeof pid === "object") return true;
              return String(pid) === String(projectId);
            })
          : list;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const getStatus = (t) => String(t.status || t.column || t.state || "").toLowerCase().replace(/[\s_-]/g, "");
        const getDueDate = (t) => t.dueDate || t.due_date || t.deadline || t.due || null;
        const isDone = (t) => ["done", "completed", "complete", "closed", "finished"].includes(getStatus(t));
        const isBlocked = (t) => ["blocked", "blocker", "waiting", "onhold", "impeded"].includes(getStatus(t));
        const isCancelled = (t) => ["cancelled", "canceled", "archived"].includes(getStatus(t));
        const active = filtered.filter((t) => !isCancelled(t));
        const overdue = active.filter((t) => {
          if (isDone(t)) return false;
          const d = getDueDate(t);
          if (!d) return false;
          const due = new Date(d);
          if (isNaN(due.getTime())) return false;
          due.setHours(0, 0, 0, 0);
          return due < now;
        }).length;
        const blocked = active.filter(isBlocked).length;
        const total = active.length;
        const done = active.filter(isDone).length;
        const counts = {};
        active.filter((t) => !isDone(t)).forEach((t) => {
          const key = t.status || t.column || "Unknown";
          counts[key] = (counts[key] || 0) + 1;
        });
        let bottleneck = "None";
        let maxCount = 0;
        for (const [k, v] of Object.entries(counts)) {
          if (v > maxCount) { maxCount = v; bottleneck = k; }
        }
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
        let score = 100 - overdue * 5 - blocked * 5;
        score += Math.round(completionRate * 0.1);
        score = Math.max(0, Math.min(100, score));
        let status = "Healthy";
        if (total === 0) status = "No Tasks";
        else if (score < 50) status = "At Risk";
        else if (score < 75) status = "Needs Attention";
        if (!isMounted) return;
        setHealth({ score, status, total, done, overdue, blocked, completionRate, bottleneck, bottleneckCount: maxCount });
      } catch (err) {
        console.error("HealthMetrics error:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [projectId]);

  // --- STYLES (inline only, no external CSS = no crash) ---
  const card = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    fontFamily: "system-ui, -apple-system, sans-serif",
    maxWidth: "100%",
    boxSizing: "border-box",
  };
  const getStatusColor = () => {
    if (!health) return "#6b7280";
    if (health.status === "Healthy") return "#16a34a";
    if (health.status === "Needs Attention") return "#f59e0b";
    if (health.status === "At Risk") return "#dc2626";
    return "#6b7280";
  };
  const getScoreColor = () => {
    if (!health) return "#6b7280";
    if (health.score >= 75) return "#16a34a";
    if (health.score >= 50) return "#f59e0b";
    return "#dc2626";
  };

  if (loading) {
    return (
      <div style={card}>
        <p style={{ margin: 0, color: "#6b7280" }}>Loading project health...</p>
        <div style={{ height: "8px", background: "#f3f4f6", borderRadius: "99px", marginTop: "12px", overflow: "hidden" }}>
          <div style={{ width: "40%", height: "100%", background: "#d1d5db", borderRadius: "99px" }} />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ ...card, borderColor: "#fecaca", background: "#fef2f2" }}>
        <p style={{ margin: 0, color: "#dc2626", fontWeight: "600" }}>Health error</p>
        <p style={{ margin: "6px 0 0", color: "#991b1b", fontSize: "13px" }}>{error}</p>
      </div>
    );
  }
  if (!health) return <div style={card}><p style={{ margin: 0 }}>No health data.</p></div>;

  const stats = [
    { label: "Total", value: health.total, color: "#111827", bg: "#f3f4f6" },
    { label: "Done", value: health.done, color: "#16a34a", bg: "#dcfce7" },
    { label: "Overdue", value: health.overdue, color: "#dc2626", bg: "#fee2e2" },
    { label: "Blocked", value: health.blocked, color: "#d97706", bg: "#fef3c7" },
  ];

  return (
    <div style={card}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", fontWeight: "700" }}>
            Project Health
          </p>
          <h3 style={{ margin: "4px 0 0", fontSize: "20px", lineHeight: "1.2", color: "#111827" }}>
            {health.status}
          </h3>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "28px", fontWeight: "800", color: getScoreColor(), lineHeight: "1" }}>
            {health.score}
            <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "600" }}>/100</span>
          </div>
          <span style={{ display: "inline-block", marginTop: "6px", padding: "4px 10px", borderRadius: "99px", background: getStatusColor(), color: "#fff", fontSize: "11px", fontWeight: "700" }}>
            {health.status}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
          <span>Completion</span>
          <span style={{ fontWeight: "700", color: "#111827" }}>{health.completionRate}%</span>
        </div>
        <div style={{ height: "10px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ width: `${health.completionRate}%`, height: "100%", background: getScoreColor(), borderRadius: "99px", transition: "width 0.4s" }} />
        </div>
      </div>

      {/* 4 stat boxes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "16px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: "12px", padding: "12px" }}>
            <p style={{ margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", fontWeight: "700" }}>
              {s.label}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "800", color: s.color, lineHeight: "1" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Bottleneck */}
      <div style={{ marginTop: "14px", padding: "12px", background: "#f9fafb", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "13px", color: "#374151" }}>Bottleneck</span>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827", textAlign: "right" }}>
          {health.bottleneck} • {health.bottleneckCount} open
        </span>
      </div>

      <p style={{ margin: "12px 0 0", fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>
        Live from backend — {rawCount} tasks fetched
      </p>
    </div>
  );
}