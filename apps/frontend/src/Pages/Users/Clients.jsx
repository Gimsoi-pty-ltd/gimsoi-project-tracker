import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useClientStore } from "../../store/clientStore";

const emptyForm = { name: "", contactEmail: "" };

const Clients = () => {
  const { clients, isLoading, error, getClients, createClient, updateClient, deleteClient, clearError } = useClientStore();
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getClients();
  }, [getClients]);

  const filtered = clients.filter(
    (c) =>
      !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name || !form.contactEmail) return;
    setSaving(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, { ...form, version: editingClient.version });
      } else {
        await createClient(form);
      }
      setShowModal(false);
      setEditingClient(null);
      setForm(emptyForm);
    } catch (err) {
      console.error("Failed to save client:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete client "${client.name}"? Projects tied to this client won't be deletable until reassigned.`)) return;
    try {
      await deleteClient(client.id);
    } catch (err) {
      console.error("Failed to delete client:", err);
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
            onClick={() => {
              setEditingClient(null);
              setForm(emptyForm);
              setShowModal(true);
            }}
            className="bg-[#002D62] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#001f44] transition"
          >
            + Add Client
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-4">Client Company</th>
              <th>Contact Email</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">Loading clients...</td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  {searchTerm ? `No clients matching "${searchTerm}"` : "No clients yet. Add your first client!"}
                </td>
              </tr>
            )}
            {!isLoading &&
              filtered.map((client) => (
                <tr key={client.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 border rounded flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-50">
                      {client.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </td>
                  <td>{client.contactEmail || "—"}</td>
                  <td>{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <div className="flex gap-2 py-2">
                      <button
                        onClick={() => {
                          setEditingClient(client);
                          setForm({ name: client.name || "", contactEmail: client.contactEmail || "" });
                          setShowModal(true);
                        }}
                        className="border px-3 py-1 rounded text-xs hover:bg-gray-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        className="border px-3 py-1 rounded text-xs text-red-500 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!isLoading && filtered.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[480px] rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">{editingClient ? "Edit Client" : "Add New Client"}</h2>

            <div className="space-y-4">
              <input
                placeholder="Client Company Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Contact Email *"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setEditingClient(null); }}
                className="border px-4 py-2 rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.contactEmail}
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
