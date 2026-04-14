const BLOCKED_TASKS = [
  { id: "b1", title: "Waiting on Data from Backend", severity: "high", assignee: "John Doe" },
  { id: "b2", title: "Security Review", severity: "medium", assignee: "Jane Doe" },
  { id: "b3", title: "Priority Conflict", severity: "medium", assignee: "Mike Smith" },
  { id: "b4", title: "Dependency on External API", severity: "high", assignee: "Sarah Lee" },
  { id: "b5", title: "Awaiting Design Approval", severity: "low", assignee: "Tom Wilson" },
  { id: "b6", title: "Resource Unavailable", severity: "high", assignee: "Alex Brown" },
];

const urgencyStyle = (severity) => {
  switch (severity) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-yellow-600";
    case "low":
      return "text-green-700";
    default:
      return "text-gray-600";
  }
};

export default function BlockedTasks() {
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-8">Blocked Work Items</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex gap-6 mb-6">
            <span className="text-gray-600 font-medium">Overview</span>
            <span className="bg-gray-200 px-5 py-2 rounded text-sm font-medium flex items-center gap-3">
              Blocked Tasks
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                {BLOCKED_TASKS.length}
              </span>
            </span>
          </div>

          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b">
              <tr>
                <th className="text-left py-3">Feature</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Severity</th>
                <th className="text-left py-3">Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {BLOCKED_TASKS.map((task) => (
                <tr key={task.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded-full accent-blue-600" />
                      <span className="text-gray-400 text-sm">{task.id}</span>
                      <span className="text-sm font-medium text-gray-800">{task.title}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      Blocked
                    </span>
                  </td>
                  <td className={`py-5 text-sm font-medium capitalize ${urgencyStyle(task.severity)}`}>
                    {task.severity}
                  </td>
                  <td className="py-5 text-sm text-gray-600">{task.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
