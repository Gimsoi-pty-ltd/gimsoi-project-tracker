// src/Pages/Users/Teams.jsx
//
// NOTE: the backend has no standalone "Team" model — Project and User are
// connected only through ProjectMember (see prisma schema.prisma). So "team"
// here means a project's real member list, managed through
// /api/projects/:id/members (getProjectMembers / addProjectMember /
// updateProjectMemberRole / removeProjectMember in projectStore.js).
// This page lets you pick a project, then add/remove/re-role its members.
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, X, Check } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
import { resourceAPI } from "../../api/api";

const ROLE_OPTIONS = ["OWNER", "MEMBER", "VIEWER"];

const roleBadge = (role) => {
  if (role === "OWNER") return "bg-blue-100 text-blue-700";
  if (role === "VIEWER") return "bg-gray-100 text-gray-600";
  return "bg-emerald-100 text-emerald-700";
};

const initialsFor = (name) =>
  (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function Teams() {
  const {
    projects = [],
    fetchProjects,
    getProjectMembers,
    addProjectMember,
    removeProjectMember,
    updateProjectMemberRole,
  } = useProjectStore();

  const [search, setSearch] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  const [allUsers, setAllUsers] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState("MEMBER");
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState(null);

  const [removingId, setRemovingId] = useState(null);
  const [roleSavingId, setRoleSavingId] = useState(null);

  useEffect(() => {
    if (!projects.length) fetchProjects({ limit: 50 });
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    resourceAPI.get("/users")
      .then((res) => setAllUsers(res.data?.data || res.data?.users || []))
      .catch((err) => console.error("Failed to load users:", err));
  }, []);

  useEffect(() => {
    if (!selectedProjectId && projects.length) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const loadMembers = useCallback(async (projectId) => {
    if (!projectId) return;
    setMembersLoading(true);
    setMembersError(null);
    try {
      const data = await getProjectMembers(projectId);
      setMembers(data);
    } catch (err) {
      setMembersError("Failed to load members for this project");
    } finally {
      setMembersLoading(false);
    }
  }, [getProjectMembers]);

  useEffect(() => {
    if (selectedProjectId) loadMembers(selectedProjectId);
  }, [selectedProjectId, loadMembers]);

  const filteredProjects = useMemo(
    () => projects.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const availableUsers = useMemo(
    () => allUsers.filter((u) => !members.some((m) => (m.userId || m.user?.id) === u.id)),
    [allUsers, members]
  );

  const openAddModal = () => {
    setAddUserId(availableUsers[0]?.id || "");
    setAddRole("MEMBER");
    setAddError(null);
    setShowAddModal(true);
  };

  const handleAddMember = async () => {
    if (!addUserId || !selectedProjectId) return;
    setSaving(true);
    setAddError(null);
    try {
      await addProjectMember(selectedProjectId, addUserId, addRole);
      setShowAddModal(false);
      await loadMembers(selectedProjectId);
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    setRemovingId(userId);
    try {
      await removeProjectMember(selectedProjectId, userId);
      setMembers((prev) => prev.filter((m) => (m.userId || m.user?.id) !== userId));
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert(err.response?.data?.message || "Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setRoleSavingId(userId);
    try {
      const updated = await updateProjectMemberRole(selectedProjectId, userId, role);
      setMembers((prev) =>
        prev.map((m) => ((m.userId || m.user?.id) === userId ? { ...m, role: updated?.role || role } : m))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
      alert(err.response?.data?.message || "Failed to update role");
    } finally {
      setRoleSavingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Manage Teams</h2>
          <nav className="flex mt-1 text-sm text-gray-500">
            <Link to="/users">
              <span className="text-slate-900 hover:text-slate-600 cursor-pointer">User Management</span>
            </Link>
            <span className="mx-2">/</span>
            <span>Teams</span>
          </nav>
          <p className="text-xs text-gray-400 mt-1 max-w-md">
            There's no separate "team" concept on the backend — this manages each project's real members.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 flex-1 min-w-[180px] md:w-64">
            <Search size={15} className="text-gray-400 mr-2 flex-shrink-0" />
            <input
              className="outline-none w-full text-sm"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={openAddModal}
            disabled={!selectedProjectId}
            className="flex items-center gap-2 bg-[#002D62] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#001f44] text-sm disabled:opacity-50"
          >
            <Plus size={15} /> Add Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Project list */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden self-start">
          <div className="px-4 py-3 border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Projects
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {filteredProjects.length === 0 && (
              <div className="px-4 py-6 text-sm text-gray-400 text-center">No projects found</div>
            )}
            {filteredProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full text-left px-4 py-3 border-b last:border-b-0 text-sm transition-colors ${
                  p.id === selectedProjectId ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Members table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              {selectedProject ? `${selectedProject.name} — Members` : "Select a project"}
            </span>
            {selectedProject && (
              <span className="text-xs text-gray-400">{members.length} member{members.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {membersError && (
            <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{membersError}</div>
          )}

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {membersLoading && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">Loading members...</td>
                </tr>
              )}
              {!membersLoading && selectedProjectId && members.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">No members assigned yet</td>
                </tr>
              )}
              {!membersLoading && !selectedProjectId && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">Pick a project on the left</td>
                </tr>
              )}
              {!membersLoading && members.map((m) => {
                const userId = m.userId || m.user?.id;
                const name = m.user?.fullName || m.user?.email || "Unknown";
                return (
                  <tr key={userId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#002D62] text-white flex items-center justify-center text-xs font-bold">
                          {initialsFor(m.user?.fullName)}
                        </div>
                        <span className="font-medium text-gray-900">{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{m.user?.email || "—"}</td>
                    <td className="px-6 py-3">
                      <select
                        value={m.role}
                        disabled={roleSavingId === userId}
                        onChange={(e) => handleRoleChange(userId, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 ${roleBadge(m.role)} disabled:opacity-50`}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleRemoveMember(userId)}
                        disabled={removingId === userId}
                        className="border px-3 py-1 rounded text-xs text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {removingId === userId ? "Removing..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[440px] rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Adding to <span className="font-medium text-gray-700">{selectedProject?.name}</span>
            </p>

            {addError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{addError}</div>
            )}

            {availableUsers.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Everyone is already a member of this project.</p>
            ) : (
              <div className="space-y-3">
                <select
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                  className="border p-2 rounded w-full text-sm"
                >
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
                  ))}
                </select>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="border p-2 rounded w-full text-sm"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={saving || !addUserId}
                className="px-4 py-2 bg-[#002D62] text-white rounded disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? "Adding..." : (<><Check size={14} /> Add Member</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}