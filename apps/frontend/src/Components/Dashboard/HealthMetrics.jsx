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
}