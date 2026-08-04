import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../Components/EmptyState";
import ErrorAlert from "../../Components/ErrorAlert";
import { resourceAPI } from "../../api/api";

// Must match the backend's Role enum exactly (see user.schema.js RoleEnum)
const ROLES = ["ADMIN", "PM", "INTERN", "CLIENT"];

const emptyForm = { email: "", password: "", fullName: "", role: "INTERN" };

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // user being role-edited
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [history, setHistory] = useState([]); // stack of previous cursors, for "Back"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = (cursorToUse) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: "20" });
    if (cursorToUse) params.append("cursor", cursorToUse);
    resourceAPI
      .get(`/users?${params.toString()}`)
      .then((res) => {
        const data = res.data?.data;
        setUsers(Array.isArray(data) ? data : []);
        setNextCursor(res.data?.nextCursor || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setUsers([]);
        setNextCursor(null);
        setError(err.response?.data?.message || "Failed to load users");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers(cursor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  const goNext = () => {
    if (!nextCursor) return;
    setHistory((h) => [...h, cursor]);
    setCursor(nextCursor);
  };
  const goBack = () => {
    setHistory((h) => {
      const prev = h[h.length - 1] ?? null;
      setCursor(prev);
      return h.slice(0, -1);
    });
  };

  const handleAddUser = async () => {
    setSaving(true);
    try {
      const res = await resourceAPI.post("/users", formData);
      const savedUser = res.data?.data;
      setUsers((prev) => [savedUser, ...prev]);
      setShowModal(false);
      setFormData(emptyForm);
    } catch (err) {
      console.error("Error saving user:", err);
      alert(err.response?.data?.message || "Failed to save user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await resourceAPI.patch(`/users/${editingUser.id}/role`, {
        role: editRole,
        version: editingUser.version,
      });
      const updatedUser = res.data?.data;
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updatedUser : u)));
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating role:", err);
      alert(err.response?.data?.message || "Failed to update role. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (users.length === 0) {
      alert("No users to export.");
      return;
    }
    const headers = ["Name", "Email", "Role", "Verified"];
    const rows = users.map((u) => [u.fullName, u.email, u.role, u.isVerified ? "Yes" : "No"]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val || ""}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.role ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Manage Users</h2>
          <nav className="flex mt-1 text-xs md:text-sm text-gray-500">
            <Link to="/users">
              <span className="text-slate-900 hover:text-slate-600 cursor-pointer">User Management</span>
            </Link>
            <span className="mx-2">/</span>
            <span>Users</span>
          </nav>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3">
          <input
            type="text"
            placeholder="Search users..."
            className="border rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm flex-1 min-w-[150px] md:w-auto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => {
              setFormData(emptyForm);
              setShowModal(true);
            }}
            className="bg-[#002D62] text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-[#001f44] whitespace-nowrap"
          >
            + Add User
          </button>

          <button
            onClick={handleExport}
            className="border px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm bg-white hidden sm:block hover:bg-gray-50"
          >
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} type="error" onDismiss={() => setError(null)} actions={[{ label: "Retry", onClick: () => loadUsers(cursor) }]} />
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border shadow-sm p-10 text-center">
          <p className="text-sm text-gray-600">Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          message="No users have been added yet."
          actionLabel="Add User"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
          <table className="w-full text-xs md:text-sm min-w-[640px]">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="p-4">User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Job Title</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase">
                      {(user.fullName || "?").slice(0, 2)}
                    </div>
                    <p className="font-medium">{user.fullName}</p>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span className="text-gray-700">{user.role}</span>
                  </td>

                  <td>{user.jobTitle || "—"}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>

                  <td className="flex gap-2 p-4">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setEditRole(user.role);
                      }}
                      className="border px-3 py-1 rounded text-xs hover:bg-blue-50"
                    >
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination — cursor-based, matches the backend's cursor pagination */}
      {!loading && users.length > 0 && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={goBack}
            disabled={history.length === 0}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={goNext}
            disabled={!nextCursor}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Add New User</h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Full Name"
                className="border p-2 rounded col-span-2"
              />

              <input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email Address"
                className="border p-2 rounded col-span-2"
              />

              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Temporary Password (min 8 characters)"
                className="border p-2 rounded col-span-2"
              />

              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="border p-2 rounded col-span-2"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={saving || !formData.fullName || !formData.email || formData.password.length < 8}
                className="px-4 py-2 bg-[#002D62] text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-1">Change Role</h2>
            <p className="text-sm text-gray-500 mb-4">{editingUser.fullName} — {editingUser.email}</p>

            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="border p-2 rounded w-full"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={handleRoleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#002D62] text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
