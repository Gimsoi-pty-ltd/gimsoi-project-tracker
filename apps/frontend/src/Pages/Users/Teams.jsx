// src/Pages/Users/Teams.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Download, Upload } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";

const statusColor = (status) => {
  if (status === "Active") return "bg-green-100 text-green-700";
  if (status === "On Hold") return "bg-yellow-100 text-yellow-700";
  if (status === "Archived") return "bg-gray-200 text-gray-600";
  return "bg-gray-100 text-gray-600";
};

// Build teams from projects + team members
const buildTeams = (projects = []) =>
  projects.map((project) => {
    const teamMembers = (project.team || []).map((name) => ({
      name: name.split("(")[0]?.trim() || "Team Member",
      initials:
        name
          .split("(")[0]
          ?.trim()
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "?",
    }));

    const clientName =
      typeof project.client === "object" && project.client !== null
        ? project.client.name ?? "N/A"
        : project.client || "N/A";

    return {
      name: `${project.name} Team`,
      project: project.name,
      client: clientName,
      dept: "Engineering",
      lead: teamMembers[0]?.name || "Unassigned",
      members: teamMembers.length,
      status: project.status || "Active",
      _teamMembers: teamMembers,
    };
  });

export default function Teams() {
  const { projects = [] } = useProjectStore((state) => state);

  const [search, setSearch] = useState("");

  // ✅ ADDED STATES ONLY
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    project: "",
    client: "",
    lead: "",
    status: "Active",
  });

  const teams = useMemo(() => buildTeams(projects), [projects]).filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ SAVE TEAM (CLIENT STYLE BEHAVIOR)
  const handleSaveTeam = async () => {
    if (!form.name) return;

    setSaving(true);

    try {
      console.log("Team created:", form);

      setShowModal(false);

      setForm({
        name: "",
        project: "",
        client: "",
        lead: "",
        status: "Active",
      });
    } catch (err) {
      console.error("Error saving team:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Manage Teams
          </h2>

          <nav className="flex mt-1 text-sm text-gray-500">
            <Link to="/users">
              <span className="text-slate-900 hover:text-slate-600 cursor-pointer">
                User Management
              </span>
            </Link>
            <span className="mx-2">/</span>
            <span>Teams</span>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">

          {/* SEARCH (UNCHANGED) */}
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 flex-1 min-w-[180px] md:w-72">
            <Search size={15} className="text-gray-400 mr-2 flex-shrink-0" />
            <input
              className="outline-none w-full text-sm"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>


          {/*  ADD TEAM BUTTON */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#002D62] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#001f44] text-sm"
          >
            <Plus size={15} /> Add Team
          </button>

          {/*  IMPORT BUTTON */}
          <button
            onClick={() => alert("Import Data action triggered - this would open the CSV upload interface.")}
            className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} className="inline mr-1" /> Import
          </button>

          {/*  EXPORT BUTTON */}
          <button
            onClick={() => alert("Export Data action triggered - this would open the CSV download interface.")}
            className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} className="inline mr-1" /> Export
          </button>

        </div>
      </div>

      {/* TABLE (UNCHANGED) */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-left">
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
            {teams.length > 0 && teams[0]?._teamMembers?.length > 0 ? (
              teams[0]._teamMembers.map((member, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#002D62] text-white flex items-center justify-center text-xs font-bold">{member.initials || '?'}</div>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600`}>Developer</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Developer</td>
                  <td className="px-6 py-4 text-gray-500">—</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No team members assigned
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ MODAL (ADDED ONLY) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

          <div className="bg-white w-[500px] rounded-xl shadow-lg p-6">

            <h2 className="text-xl font-semibold mb-4">Add New Team</h2>

            <div className="grid gap-3">

              <input
                placeholder="Team Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 rounded"
              />

              <input
                placeholder="Project"
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="border p-2 rounded"
              />

              <input
                placeholder="Client"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                className="border p-2 rounded"
              />

              <input
                placeholder="Lead"
                value={form.lead}
                onChange={(e) => setForm({ ...form, lead: e.target.value })}
                className="border p-2 rounded"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Archived">Archived</option>
              </select>

            </div>

            <div className="flex justify-end gap-3 mt-5">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTeam}
                disabled={saving || !form.name}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Team"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
