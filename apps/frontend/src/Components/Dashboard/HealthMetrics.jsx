export default function HealthMetrics({ healthData }) {
  if (!healthData) return <div style={{ padding: 16, color: "#6b7280" }}>Loading health...</div>;

  const p = healthData;
  const overdue = Number(p.overdueCount ?? 0);
  const blocked = Number(p.blockedCount ?? 0);
  const total = Number(p.total ?? 0);
  const done = Number(p.DONE ?? p.done ?? 0);
  const inProgress = Number(p.IN_PROGRESS ?? p.inProgress ?? 0);
  const percentComplete = Number(p.percentComplete ?? 0);

  let score = Number(p.healthScore);
  if (!Number.isFinite(score)) score = Math.max(0, 100 - overdue * 5 - blocked * 10);
  score = Math.min(100, Math.max(0, Math.round(score)));

  const reasons = [];
  if (overdue > 0) reasons.push(`${overdue} task(s) overdue (-${overdue * 5} pts)`);
  if (blocked > 0) reasons.push(`${blocked} task(s) blocked (-${blocked * 10} pts)`);
  if (inProgress > 0) reasons.push(`${inProgress} task(s) in progress`);
  if (reasons.length === 0) reasons.push("All tasks on track");
  const status = score >= 75 ? "On Track" : score >= 50 ? "At Risk" : "Off Track";

<<<<<<< HEAD
  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1f2937" }}>Project Health</h3>
      <div style={{ fontSize: 40, fontWeight: 800 }}>{score}<span style={{ fontSize: 16, color: "#6b7280" }}>/100</span></div>
      <div style={{ fontWeight: 600 }}>{status}</div>
      <div style={{ marginTop: 8, height: 8, background: "#e5e7eb", borderRadius: 999 }}>
        <div style={{ width: score + "%", height: "100%", borderRadius: 999, background: score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444" }} />
      </div>
      <p style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>{percentComplete}% complete · {done}/{total} done</p>
      <ul style={{ marginTop: 8, fontSize: 13 }}>
        {reasons.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
=======
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
>>>>>>> 3eb6cbcef1fec76271a09f677c5b662e80a62aae
}