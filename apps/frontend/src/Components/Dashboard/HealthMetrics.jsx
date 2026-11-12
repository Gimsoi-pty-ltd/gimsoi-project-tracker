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

  const color = health.status === "ON_TRACK" ? "green"
    : health.status === "AT_RISK" ? "orange" : "red"

  return (
    <div>
      <h3 style={{ color: color }}>
        Project Health: {health.status} - {health.healthScore}%
      </h3>

      <h4>Why?</h4>
      <ul>
        {health.riskReasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  )
}