import React, { useState } from "react";
import { Link } from "react-router-dom";

const Clients = () => {
  const [showModal, setShowModal] = useState(false);

  const clients = [
    { id: 1, name: "Client A", status: "Active", location: "New York", contact: "Contact 1", email: "email1@clienta.co" },
    { id: 2, name: "Client B", status: "Inactive", location: "New York", contact: "Contact 2", email: "email1@clientb.co" },
    { id: 3, name: "Client C", status: "Onboarding", location: "San Francisco", contact: "Contact 3", email: "email2@clientc.co" },
    { id: 4, name: "Client D", status: "Active", location: "New York", contact: "Contact 4", email: "email3@clientd.co" },
    { id: 5, name: "Client E", status: "Inactive", location: "New York", contact: "Contact 5", email: "email4@cliente.co" },
    { id: 6, name: "Client F", status: "Active", location: "New York", contact: "Contact 6", email: "email5@clientf.co" },
  ];

  const statusColor = (status) => {
    if (status === "Active") return "bg-green-100 text-green-700";
    if (status === "Inactive") return "bg-red-100 text-red-700";
    if (status === "Onboarding") return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Manage Clients</h2>
          <nav className="flex mt-1 text-sm text-gray-500">
            <Link to="/users">
              <span className="text-slate-900 hover:text-slate-600 cursor-pointer">User Management</span>
            </Link>
            <span className="mx-2">/</span>
            <span>Clients</span>
          </nav>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3">
          <input
            type="text"
            placeholder="Search clients..."
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] md:w-80"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
          >
            + Add Client
          </button>
          <button className="border px-3 md:px-4 py-2 rounded-lg text-sm bg-white">Import</button>
          <button className="border px-3 md:px-4 py-2 rounded-lg text-sm bg-white">Export</button>
        </div>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-4">Client Company</th>
              <th className="p-3">Status</th>
              <th className="p-3">Location</th>
              <th className="p-3">Primary Contact</th>
              <th className="p-3">Email</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border rounded flex items-center justify-center flex-shrink-0">✉</div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusColor(client.status)}`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-3">{client.location}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-300 rounded-full flex-shrink-0"></div>
                    {client.contact}
                  </div>
                </td>
                <td className="p-3">{client.email}</td>
                <td className="p-3">
                  <div className="flex gap-1.5">
                    <button className="border px-2 py-1 rounded text-xs whitespace-nowrap">View Details</button>
                    <button className="border px-2 py-1 rounded text-xs">Edit</button>
                    <button className="border px-2 py-1 rounded text-xs">Archive</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600 sm:flex-row sm:justify-between sm:items-center">
        <p>Showing 1-6 of 85 clients</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded">1</button>
          <button className="px-3 py-1 border rounded">2</button>
          <button className="px-3 py-1 border rounded">3</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-[650px] rounded-xl shadow-lg p-5 md:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-5">Add New Client</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="border rounded-lg py-2 text-sm">+ Add Contact Person</button>
              <button className="border rounded-lg py-2 text-sm">Upload Contract File</button>
              <input placeholder="Client Company Name" className="border p-2 rounded" />
              <select className="border p-2 rounded">
                <option>Department / Industry</option>
                <option>Finance</option>
                <option>Technology</option>
                <option>Healthcare</option>
              </select>
              <select className="border p-2 rounded">
                <option>Project Ares</option>
                <option>Project Alpha</option>
                <option>Project Beta</option>
              </select>
              <select className="border p-2 rounded">
                <option>John Doe</option>
                <option>Jane Smith</option>
                <option>Mike Johnson</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Client Communication Channels</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="border px-3 py-1 rounded text-sm">Slack</span>
                <span className="border px-3 py-1 rounded text-sm">Email</span>
                <span className="border px-3 py-1 rounded text-sm">Phone</span>
              </div>
            </div>
            <textarea placeholder="Client Notes (optional)" className="border w-full mt-4 p-2 rounded" />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Save Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;