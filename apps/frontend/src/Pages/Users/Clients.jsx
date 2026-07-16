import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useClientStore } from "../../store/clientStore";

const statusColor = (status) => {
  if (status === "Active") return "bg-green-100 text-green-700";
  if (status === "Inactive") return "bg-red-100 text-red-700";
  if (status === "Onboarding") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
};

const Clients = () => {
  const { clients, isLoading, error, getClients, createClient } = useClientStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ name: "", industry: "", contactPerson: "", email: "", location: "", status: "Active", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getClients();
  }, [getClients]);

  const filtered = clients.filter((c) =>
    !searchTerm ||
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await createClient(form);
      setShowModal(false);
      setForm({ name: "", industry: "", contactPerson: "", email: "", location: "", status: "Active", notes: "" });
    } catch (err) {
      console.error("Failed to create client:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Manage Clients</h2>
          <nav className="flex mt-1 text-sm text-gray-500">
            <Link to="/users">
              <span className="text-slate-900 hover:text-slate-600 cursor-pointer">User Management</span>
            </Link>
            <span className="mx-2">/</span>
            <span>Clients</span>
          </nav>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 w-72 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#002D62] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#001f44] transition"
          >
            + Add Client
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-4">Client Company</th>
              <th>Status</th>
              <th>Location</th>
              <th>Primary Contact</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">Loading clients...</td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  {searchTerm ? `No clients matching "${searchTerm}"` : "No clients yet. Add your first client!"}
                </td>
              </tr>
            )}
            {!isLoading && filtered.map((client) => (
              <tr key={client.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 border rounded flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-50">
                    {client.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="font-medium">{client.name}</span>
                </td>
                <td>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusColor(client.status)}`}>
                    {client.status || "—"}
                  </span>
                </td>
                <td>{client.location || "—"}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {(client.contactPerson || client.contact || "?").charAt(0).toUpperCase()}
                  </div>
                  {client.contactPerson || client.contact || "—"}
                  </div>
                </td>
                <td>{client.email || "—"}</td>
                <td>
                  <div className="flex gap-2 py-2">
                    <button className="border px-3 py-1 rounded text-xs hover:bg-gray-50 transition">View Details</button>
                    <button className="border px-3 py-1 rounded text-xs hover:bg-gray-50 transition">Edit</button>
                    <button className="border px-3 py-1 rounded text-xs text-red-500 hover:bg-red-50 transition">Archive</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      {!isLoading && filtered.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[620px] rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Add New Client</h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Client Company Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Primary Contact Person"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Department / Industry</option>
                <option value="Finance">Finance</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Onboarding">Onboarding</option>
              </select>
            </div>

            <textarea
              placeholder="Client Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border w-full mt-4 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="border px-4 py-2 rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="bg-[#002D62] text-white px-4 py-2 rounded hover:bg-[#001f44] transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
