// src/Pages/Users/Teams.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Download, Upload } from "lucide-react";


const statusColor = (status) => {
  if (status === "Active")   return "bg-green-100 text-green-700";
  if (status === "On Hold")  return "bg-yellow-100 text-yellow-700";
  if (status === "Archived") return "bg-gray-200 text-gray-600";
  return "bg-gray-100 text-gray-600";
};

// Build teams from projects + team members
const buildTeams = () =>
  projects.map((project) => ({
    name:    `${project.name} Team`,
    project: project.name,
    client:  project.client,
    dept:    "Engineering",
    lead:    teamMembers[0].name,
    members: teamMembers.length,
    status:  project.status,
  }));

export default function Teams() {
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch]       = useState("");

  const teams = buildTeams().filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.project.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Manage Teams</h2>
          <nav className="flex mt-1 text-sm text-gray-500">
            <Link to="/users"><span className="text-slate-900 hover:text-slate-600 cursor-pointer">User Management</span></Link>
            <span className="mx-2">/</span>
            <span>Teams</span>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 flex-1 min-w-[180px] md:w-72">
            <Search size={15} className="text-gray-400 mr-2 flex-shrink-0" />
            <input className="outline-none w-full text-sm" placeholder="Search teams..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setOpenModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            <Plus size={15} /> Add Team
          </button>
          <button className="flex items-center gap-1.5 border px-3 py-2 rounded-lg bg-white text-sm"><Download size={15} /> Import</button>
          <button className="flex items-center gap-1.5 border px-3 py-2 rounded-lg bg-white text-sm"><Upload size={15} /> Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Team</th>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Members</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teams.map((team, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">{team.name}</td>
                <td className="px-6 py-4 text-gray-600">{team.project}</td>
                <td className="px-6 py-4 text-gray-600">{team.client}</td>
                <td className="px-6 py-4 text-gray-600">{team.lead}</td>
                <td className="px-6 py-4 text-gray-600">{team.members}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(team.status)}`}>{team.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Team Members Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Team Members</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Member</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Job Title</th>
              <th className="px-6 py-3">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teamMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#002D62] text-white flex items-center justify-center text-xs font-bold">{member.initials}</div>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${member.role === "Admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{member.role}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{member.jobTitle}</td>
                <td className="px-6 py-4 text-gray-500">{member.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}