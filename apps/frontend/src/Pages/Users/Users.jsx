// src/Pages/Users/Users.jsx
import { useState, useEffect, useCallback } from "react";
import { resourceAPI } from "../../api/api";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const ROLES = ["Admin", "Manager", "Developer", "Designer", "QA", "Member"];

export default function UsersPage() {
  const [users, setUsers]           = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState("");

  const [showModal, setShowModal]   = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [formData, setFormData]     = useState({
    id: null, fullName: "", email: "", role: "Member", jobTitle: "",
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (search) params.append("search", search);
      const response = await resourceAPI.get(`/users?${params}`);
      setUsers(response.data.users || response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ id: null, fullName: "", email: "", role: "Member", jobTitle: "" });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setFormData({
      id: user.id,
      fullName: user.fullName || user.name || "",
      email: user.email || "",
      role: user.role || "Member",
      jobTitle: user.jobTitle || user.title || "",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.email) return;
    setSaving(true);
    try {
      if (isEditing) {
        await resourceAPI.patch(`/users/${formData.id}`, formData);
      } else {
        await resourceAPI.post("/users", formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await resourceAPI.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const initials = (name) =>
    (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your team members</p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#002D62] hover:bg-[#001f44] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus size={18} /> Add User
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">{error}</div>
        )}

        {/* User Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[560px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-600">User</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Role</th>
                  <th className="px-6 py-4 font-medium text-gray-600 hidden md:table-cell">Job Title</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                  <th className="px-6 py-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No users found</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#002D62] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials(user.fullName || user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.fullName || user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{user.role ?? "Member"}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{user.jobTitle || user.title || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.isVerified || user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {user.isVerified ? "Verified" : user.status ?? "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-600 transition">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{isEditing ? "Edit User" : "Add New User"}</h2>
            <div className="space-y-4">
              {[
                { name: "fullName", label: "Full Name *", type: "text" },
                { name: "email",    label: "Email *",     type: "email" },
                { name: "jobTitle", label: "Job Title",   type: "text" },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.fullName || !formData.email}
                className="px-4 py-2 bg-[#002D62] text-white rounded-md text-sm font-medium hover:bg-[#001f44] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}