// src/Pages/Users/Teams.jsx
import { useState, useEffect } from "react";
import { useProjectStore } from "../../store/projectStore";
import { resourceAPI } from "../../api/api";
import { Plus, Search, Users } from "lucide-react";

const statusColor = (status) => {
  const s = status?.toLowerCase();
  if (s === "active" || s === "in_progress") return "bg-green-100 text-green-700";
  if (s === "completed") return "bg-blue-100 text-blue-700";
  if (s === "on_hold" || s === "on hold") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
};

export default function TeamsPage() {
  const { projects, fetchProjects } = useProjectStore();
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const response = await resourceAPI.get("/users");
        setTeamMembers(response.data.users || response.data || []);
      } catch {
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  
  const teams = projects
    .map((project) => {
      const projectMembers = teamMembers.filter((m) =>
        m.projectIds?.includes(project.id) || m.projects?.includes(project.id)
      );
      const lead = projectMembers.find((m) => m.role === "Lead" || m.role === "Manager") || projectMembers[0];
      return {
        id:      project.id,
        name:    `${project.name} Team`,
        project: project.name,
        client:  project.clientName || project.client || "—",
        lead:    lead?.fullName || lead?.name || "—",
        members: projectMembers.length || teamMembers.length, 
        status:  project.status,
        dept:    project.department || "Engineering",
      };
    })
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase()) ||
      t.client.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-sm text-gray-500 mt-1">{teams.length} teams · {teamMembers.length} members</p>
          </div>
          <button className="inline-flex items-center gap-2 bg-[#002D62] hover:bg-[#001f44] text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus size={18} /> Create Team
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Teams",   value: teams.length },
            { label: "Total Members", value: teamMembers.length },
            { label: "Active Teams",  value: teams.filter((t) => t.status?.toLowerCase() === "active").length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Team Table */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            {search ? `No teams found for "${search}"` : "No projects found to build teams from."}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-600">Team</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Project</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Client</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Lead</th>
                    <th className="px-6 py-4 font-medium text-gray-600 text-center">Members</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#002D62] text-white flex items-center justify-center flex-shrink-0">
                            <Users size={14} />
                          </div>
                          <span className="font-medium text-gray-900">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{team.project}</td>
                      <td className="px-6 py-4 text-gray-600">{team.client}</td>
                      <td className="px-6 py-4 text-gray-600">{team.lead}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{team.members}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor(team.status)}`}>
                          {team.status ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}