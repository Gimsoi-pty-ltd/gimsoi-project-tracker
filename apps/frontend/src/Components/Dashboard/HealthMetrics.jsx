import { useEffect, useState } from "react";

// Pass projectId if you have it: <HealthMetrics projectId={project.id} />
export default function HealthMetrics({ projectId }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

        // If your backend needs a project filter, we add ?projectId=
        const url = projectId
          ? `${API}/api/tasks?projectId=${projectId}`
          : `${API}/api/tasks`;

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error(`Backend returned ${res.status} - check if backend is running + token is valid`);

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.tasks || data.data || [];

        // --- LIVE CALCULATION FROM REAL TASKS ---
        const now = new Date();
        const norm = (s) => String(s || "").toLowerCase().replace(/[\s_-]/g, "");

        const isDone = (t) => ["done", "completed", "complete"].includes(norm(t.status));
        const isBlocked = (t) => ["blocked", "blocker", "waiting", "onhold"].includes(norm(t.status));

        const overdue = list.filter(t => {
          if (isDone(t) || !t.dueDate) return false;
          return new Date(t.dueDate) < now;
        }).length;

        const blocked = list.filter(t => isBlocked(t)).length;
        const total = list.length;
        const done = list.filter(isDone).length;

        // Find bottleneck column = status with most open tasks
        const counts = {};
        list.filter(t => !isDone(t)).forEach(t => {
          const key = t.status || "Unknown";
          counts[key] = (counts[key] || 0) + 1;
        });
        let bottleneck = null, maxCount = 0;
        for (const [k, v] of Object.entries(counts)) {
          if (v > maxCount) { maxCount = v; bottleneck = k; }
        }

        // Score: 100 - penalties
        const overduePenalty = overdue * 10; // <-- ADDED
        const blockedPenalty = blocked * 5; // <-- ADDED
        let score = Math.max(0, Math.min(100, 100 - overduePenalty - blockedPenalty)); // <-- ADDED

        setHealth({ 
          score, 
          overdue, 
          blocked, 
          total, 
          done, 
          bottleneck, 
          bottleneckCount: maxCount,
        }); 
      } catch (err) { 
        setError(err.message || "Failed to load health metrics"); 
      } finally { 
        setLoading(false); 
      } 
    }

    load();
  }, [projectId]); 

  if (loading) return <p>Loading health metrics...</p>; 
  if (error) return <p>{error}</p>; 
  if (!health) return null; 

  return ( 
    <div> 
      <p>Health Score: {health.score}</p> 
      <p>Completed: {health.done} / {health.total}</p> 
      <p>Overdue: {health.overdue}</p> 
      <p>Blocked: {health.blocked}</p> 
      {health.bottleneck && ( 
        <p>Bottleneck: {health.bottleneck} ({health.bottleneckCount})</p> 
      )} // 
    </div> 
  ); 
}