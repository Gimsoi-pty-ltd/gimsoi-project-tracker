export default function HealthMetrics() {
  // Fake data for now - we will connect real data later
  const health = {
    status: "AT_RISK",
    healthScore: 62,
    riskReasons: [
      "5 tasks overdue",
      "Design column is bottleneck - 12 tasks stuck",
      "3 tasks blocked waiting for API"
    ]
  }

  const isOnTrack = health.status === "ON_TRACK"
  const isAtRisk = health.status === "AT_RISK"

  const config = isOnTrack
    ? { label: "On Track", bg: "#dcfce7", text: "#166534", bar: "#22c55e", dot: "#22c55e" }
    : isAtRisk
    ? { label: "At Risk", bg: "#ffedd5", text: "#9a3412", bar: "#f97316", dot: "#f97316" }
    : { label: "Off Track", bg: "#fee2e2", text: "#991b1b", bar: "#ef4444", dot: "#ef4444" }

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      border: "1px solid #e5e7eb",
      fontFamily: "system-ui, sans-serif",
      maxWidth: "420px"
    }}>
      {/* Top row: title + badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "18px", color: "#111827" }}>
          Project Health
        </h3>
        <span style={{
          background: config.bg,
          color: config.text,
          padding: "5px 12px",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: config.dot }} />
          {config.label}
        </span>
      </div>

      {/* Big score */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", margin: "16px 0 8px" }}>
        <span style={{ fontSize: "42px", fontWeight: "800", color: "#111827", lineHeight: 1 }}>
          {health.healthScore}
        </span>
        <span style={{ fontSize: "18px", color: "#6b7280" }}>/100</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: "10px", background: "#f3f4f6", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ width: `${health.healthScore}%`, height: "100%", background: config.bar, borderRadius: "999px" }} />
      </div>
      <p style={{ fontSize: "12px", color: "#9ca3af", margin: "8px 0 16px" }}>
        Health Score • Updated just now
      </p>

      {/* Why section */}
      <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#111827" }}>
        Why?
      </h4>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
        {health.riskReasons.map((reason) => (
          <li key={reason} style={{
            display: "flex",
            gap: "8px",
            background: "#f9fafb",
            padding: "10px 12px",
            borderRadius: "10px",
            fontSize: "14px",
            color: "#374151",
            lineHeight: "1.4"
          }}>
            <span>⚠️</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}