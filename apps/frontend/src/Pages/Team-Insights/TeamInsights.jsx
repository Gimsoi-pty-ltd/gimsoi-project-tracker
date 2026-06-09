// src/Pages/Team Insights/teamInsights.jsx
import React from "react";
import { Users, Activity, CheckCircle, Clock, Bell } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useProjectStore } from "../../store/projectStore";


function TeamInsights() {
  const { activeSprint, activeProject, projects = [] } = useProjectStore((state) => state);
  const metrics = activeSprint?.metrics ?? {};
  const tasks   = activeSprint?.tasks ?? [];
  const teamMembers = (activeProject?.team || []).map((name, i) => ({
    id: i,
    name: name.split('(')[0]?.trim() || 'Team Member',
    firstName: name.split('(')[0]?.trim().split(' ')[0] || 'Member',
    initials: name.split('(')[0]?.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?',
    jobTitle: name.includes('(') ? name.match(/\(([^)]+)\)/)?.[1] || 'Developer' : 'Developer',
  }));

  const memberStats = teamMembers.map((member) => {
    const firstName      = member.name.split(" ")[0];
    const memberTasks    = tasks.filter((t) => t.assignee === firstName);
    const completed      = memberTasks.filter((t) => t.status === "done").length;
    const velocity       = memberTasks.filter((t) => t.status === "done").reduce((sum, t) => sum + t.storyPoints, 0);
    const active         = memberTasks.filter((t) => t.status !== "done").length;
    return { ...member, firstName, velocity, completed, active };
  });

  const sprintActivity = (activeSprint?.charts?.burndown ?? []).map((d) => ({ day: d.day, tasks: d.actual }));

  const Card = ({ title, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="font-semibold text-gray-800 mb-5 text-lg tracking-tight">{title}</h3>
      {children}
    </div>
  );

  const StatBox = ({ icon, label, value, bg }) => (
    <div className={`${bg} rounded-xl p-4 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform`}>
      <div className="flex items-center justify-between text-sm text-gray-600"><span>{label}</span>{icon}</div>
      <div className="text-xl font-semibold text-gray-800 mt-3">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 pb-6 md:pb-8">
        <div className="py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Team Insights</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">{activeProject.name} · {activeSprint?.name} · {activeSprint?.goal}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card title="Contribution Overview">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <StatBox label="Team Members"    value={teamMembers.length}        bg="bg-blue-50"   icon={<Users size={18} className="text-blue-600" />} />
                <StatBox label="Avg Velocity"    value={`${metrics.avgVelocity ?? "—"} pts`} bg="bg-purple-50" icon={<Activity size={18} className="text-purple-600" />} />
                <StatBox label="Completed Tasks" value={metrics.completedTasks ?? "—"}     bg="bg-green-50"  icon={<CheckCircle size={18} className="text-green-600" />} />
                <StatBox label="Blocked"         value={activeSprint?.blocked?.length ?? 0} bg="bg-orange-50" icon={<Clock size={18} className="text-orange-600" />} />
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-200">
                <div className="flex font-medium text-xs uppercase tracking-wider bg-orange-500 text-white px-4 py-3">
                  <span className="flex-1">Member</span>
                  <span className="flex-1">Role</span>
                  <span className="flex-1">Velocity</span>
                  <span className="flex-1">Completed</span>
                  <span className="flex-1">Active</span>
                </div>
                {memberStats.map((member) => (
                  <div key={member.id} className="flex text-sm py-3 px-4 border-b last:border-none hover:bg-gray-50 transition-colors">
                    <span className="flex-1 text-gray-700 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#002D62] text-white flex items-center justify-center text-xs font-bold">{member.initials}</div>
                      {member.firstName}
                    </span>
                    <span className="flex-1 text-gray-500 text-xs self-center">{member.jobTitle}</span>
                    <span className="flex-1 text-gray-600 self-center">{member.velocity} pts</span>
                    <span className="flex-1 text-gray-600 self-center">{member.completed}</span>
                    <span className="flex-1 text-gray-600 self-center">{member.active}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Sprint Activity">
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
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Tasks Summary">
              <ul className="text-sm space-y-4 text-gray-600">
                {[
                  { label: "Completed Tasks", value: metrics.completedTasks ?? "—", icon: <CheckCircle size={16} className="text-green-600" /> },
                  { label: "In Progress",     value: activeSprint?.kanban?.inProgress ?? "—", icon: <Activity size={16} className="text-blue-600" /> },
                  { label: "Blocked",         value: activeSprint?.blocked?.length ?? 0, icon: <Clock size={16} className="text-orange-600" /> },
                  { label: "Delivery Risk",   value: metrics.deliveryRisk ?? "—", icon: <Clock size={16} className="text-red-500" /> },
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