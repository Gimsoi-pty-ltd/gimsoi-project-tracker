// src/Pages/Users/Clients.jsx
import { useState, useEffect } from "react";
import { useClientStore } from "../../store/clientStore";
import { Plus, Search, MoreVertical, Mail, Phone, MapPin } from "lucide-react";

export default function ClientsPage() {
  const { clients, getClients, createClient, isLoading } = useClientStore();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", location: "", status: "Active", industry: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getClients();
  }, []);

  const filteredClients = clients.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClient = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      await createClient(formData);
      setShowModal(false);
      setFormData({ name: "", email: "", phone: "", location: "", status: "Active", industry: "" });
    } catch (err) {
      console.error("Failed to create client:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 mt-1">{clients.length} total clients</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#002D62] hover:bg-[#001f44] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus size={18} /> Add Client
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients by name, email, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Clients", value: clients.length },
            { label: "Active",        value: clients.filter((c) => c.status === "Active" || c.status === "active").length },
            { label: "Inactive",      value: clients.filter((c) => c.status === "Inactive" || c.status === "inactive").length },
            { label: "Industries",    value: new Set(clients.map((c) => c.industry).filter(Boolean)).size },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Client Cards Grid */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            {search ? `No clients found for "${search}"` : "No clients yet. Add your first client."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#002D62] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {client.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      {client.industry && <p className="text-xs text-gray-500">{client.industry}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      client.status === "Active" || client.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {client.status ?? "Active"}
                    </span>
                    <button className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{client.location}</span>
                    </div>
                  )}
                </div>

                {client.addedDate && (
                  <p className="text-xs text-gray-400 mt-3">Added {new Date(client.addedDate).toLocaleDateString("en-ZA")}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Client</h2>
            <div className="space-y-4">
              {[
                { name: "name",     label: "Client Name *", type: "text",  required: true },
                { name: "email",    label: "Email",         type: "email"  },
                { name: "phone",    label: "Phone",         type: "text"   },
                { name: "location", label: "Location",      type: "text"   },
                { name: "industry", label: "Industry",      type: "text"   },
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSaveClient}
                disabled={saving || !formData.name}
                className="px-4 py-2 bg-[#002D62] text-white rounded-md text-sm font-medium hover:bg-[#001f44] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}