// src/Pages/Team Insights/teamInsights.jsx
import { useEffect } from "react";
import { Users, Activity, CheckCircle, Clock, Bell } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useProjectStore } from "../../store/projectStore";
import { useSprintStore } from "../../store/sprintStore";
import { useTaskStore } from "../../store/taskStore";

function TeamInsights() {
  const { currentProject, fetchProjects } = useProjectStore();
  const { sprints, getSprints } = useSprintStore();
  const { tasks, getTasks, isLoading } = useTaskStore();

  const activeProject = currentProject;
  const activeSprint  = sprints.find((s) => s.status === "active") || sprints[0];
  const metrics       = activeSprint ?? {};

  useEffect(() => {
    fetchProjects();
    getTasks();
    getSprints();
  }, []);


  const assignees = [...new Set(tasks.map((t) => t.assignee).filter(Boolean))];

  const memberStats = assignees.map((assignee) => {
    const memberTasks = tasks.filter((t) => t.assignee === assignee);
    const completed   = memberTasks.filter((t) => t.status === "done" || t.status === "completed").length;
    const active      = memberTasks.filter((t) => t.status !== "done" && t.status !== "completed").length;
    const velocity    = memberTasks
      .filter((t) => t.status === "done" || t.status === "completed")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const initials = assignee.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return { name: assignee, firstName: assignee.split(" ")[0], initials, velocity, completed, active };
  });

 
  const sprintActivity = (activeSprint?.charts?.burndown ?? []).map((d) => ({
    day: d.day,
    tasks: d.actual,
  }));

  const blockedCount    = tasks.filter((t) => t.status === "blocked").length;
  const completedCount  = tasks.filter((t) => t.status === "done" || t.status === "completed").length;
  const inProgressCount = tasks.filter((t) => t.status === "inProgress" || t.status === "in_progress").length;

  const Card = ({ title, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="font-semibold text-gray-800 mb-5 text-lg tracking-tight">{title}</h3>
      {children}
    </div>
  );

  const StatBox = ({ icon, label, value, bg }) => (
    <div className={`${bg} rounded-xl p-4 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform`}>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{label}</span>
        {icon}
      </div>
      <div className="text-xl font-semibold text-gray-800 mt-3">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 pb-6 md:pb-8">
        <div className="py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Team Insights</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {activeProject?.name ?? "All Projects"} · {activeSprint?.name ?? "No active sprint"}
            {activeSprint?.goal ? ` · ${activeSprint.goal}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card title="Contribution Overview">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <StatBox label="Team Members"    value={assignees.length}          bg="bg-blue-50"   icon={<Users size={18} className="text-blue-600" />} />
                <StatBox label="Velocity"        value={`${metrics.completedPoints ?? completedCount} pts`} bg="bg-purple-50" icon={<Activity size={18} className="text-purple-600" />} />
                <StatBox label="Completed Tasks" value={completedCount}            bg="bg-green-50"  icon={<CheckCircle size={18} className="text-green-600" />} />
                <StatBox label="Blocked"         value={blockedCount}              bg="bg-orange-50" icon={<Clock size={18} className="text-orange-600" />} />
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading team data...</div>
              ) : memberStats.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No assignee data found. Assign tasks to team members to see contributions.
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <div className="flex font-medium text-xs uppercase tracking-wider bg-orange-500 text-white px-4 py-3">
                    <span className="flex-1">Member</span>
                    <span className="flex-1">Velocity</span>
                    <span className="flex-1">Completed</span>
                    <span className="flex-1">Active</span>
                  </div>
                  {memberStats.map((member, i) => (
                    <div key={i} className="flex text-sm py-3 px-4 border-b last:border-none hover:bg-gray-50 transition-colors">
                      <span className="flex-1 text-gray-700 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#002D62] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {member.initials}
                        </div>
                        {member.firstName}
                      </span>
                      <span className="flex-1 text-gray-600 self-center">{member.velocity} pts</span>
                      <span className="flex-1 text-gray-600 self-center">{member.completed}</span>
                      <span className="flex-1 text-gray-600 self-center">{member.active}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Sprint Activity">
              {sprintActivity.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sprintActivity} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="day" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  Burndown chart data not available for this sprint
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Tasks Summary">
              <ul className="text-sm space-y-4 text-gray-600">
                {[
                  { label: "Completed Tasks", value: completedCount,  icon: <CheckCircle size={16} className="text-green-600" /> },
                  { label: "In Progress",     value: inProgressCount, icon: <Activity size={16} className="text-blue-600" /> },
                  { label: "Blocked",         value: blockedCount,    icon: <Clock size={16} className="text-orange-600" /> },
                  { label: "Delivery Risk",   value: blockedCount > 3 ? "High" : blockedCount > 1 ? "Medium" : "Low", icon: <Clock size={16} className="text-red-500" /> },
                ].map(({ label, value, icon }) => (
                  <li key={label} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
                    <span className="flex items-center gap-2">{icon}{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Notifications">
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                <Bell size={28} className="mb-2 text-gray-300" />
                <p>No new alerts</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamInsights;