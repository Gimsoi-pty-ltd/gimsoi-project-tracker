export default function Recommendation() {
  // Change to [] to see Empty Screen
  const cards = [
    { id: 1, title: "Project at risk", priority: "High", status: "New" },
    { id: 2, title: "Team overloaded", priority: "Medium", status: "In Progress" },
    { id: 3, title: "Task done", priority: "Low", status: "Completed" },
  ];

  const total = cards.length;

  return (
    <div className="p-6">
      {/* HEADING */}
      <h1 className="text-2xl font-bold">AI Recommendations</h1>
      <p className="text-sm text-gray-500">Actionable insights from GIMSOI AI Agent</p>

      {/* SUMMARY COUNT TOTALS */}
      <div className="flex gap-3 mt-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow text-sm">Total: <b>{total}</b></div>
        <div className="bg-red-50 px-4 py-2 rounded-lg shadow text-sm">High: <b>{cards.filter(c=>c.priority==="High").length}</b></div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg shadow text-sm">New: <b>{cards.filter(c=>c.status==="New").length}</b></div>
      </div>

      {/* CARD GRID / EMPTY SCREEN */}
      {total === 0 ? (
        <div className="text-center mt-20 text-gray-400">
          <div className="text-5xl">📭</div>
          <p className="mt-2 font-medium">No recommendations yet</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {cards.map(card => (
            <div key={card.id} className="bg-white p-4 rounded-xl shadow border">
              <div className="flex justify-between text-xs">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded">{card.priority}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{card.status}</span>
              </div>
              <h3 className="font-semibold mt-3">{card.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}