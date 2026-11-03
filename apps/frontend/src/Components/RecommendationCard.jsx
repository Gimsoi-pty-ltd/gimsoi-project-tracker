export default function RecommendationCard({ recommendation }) {
  // Get recommendation information
  const { rank, employee = {}, workload = {}, reason } = recommendation || {};

  const hasNoActiveTasks = (workload.activeTasks ?? 0) === 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* RECOMMENDATION HEADER */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          Recommendation #{rank ?? "N/A"}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            hasNoActiveTasks
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {hasNoActiveTasks ? "No Active Tasks" : "Has Active Tasks"}
        </span>
      </div>

      {/* Employee details */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {employee.fullName || "Unknown Employee"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {employee.jobTitle || employee.role || "Employee"}
        </p>
      </div>

      {/* Recommendation reason */}
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {reason || "No recommendation reason available."}
      </p>

      {/* Employee workload */}
      <div className="mt-5 border-t border-slate-200 pt-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-800">
          Employee Workload
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <WorkloadItem label="Active Tasks" value={workload.activeTasks} />

          <WorkloadItem
            label="Active Story Points"
            value={workload.activeStoryPoints}
          />

          <WorkloadItem
            label="Completed Tasks"
            value={workload.completedTasks}
            valueColor="text-green-600"
          />

          <WorkloadItem
            label="Overdue Tasks"
            value={workload.overdueTasks}
            valueColor="text-red-600"
          />

          <div className="col-span-2">
            <WorkloadItem
              label="Blocked Tasks"
              value={workload.blockedTasks}
              valueColor="text-orange-600"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

//workload display
function WorkloadItem({ label, value, valueColor = "text-slate-900" }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>

      <p className={`mt-1 text-lg font-bold ${valueColor}`}>{value ?? 0}</p>
    </div>
  );
}
