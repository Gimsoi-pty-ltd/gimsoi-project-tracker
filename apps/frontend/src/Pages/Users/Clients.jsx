import React, { useState } from "react";

const Clients = () => {
  const [showModal, setShowModal] = useState(false);

  const clients = [
    {
      id: 1,
      name: "Client A",
      status: "Active",
      location: "New York",
      contact: "Contact 1",
      email: "email1@clienta.co",
    },
    {
      id: 2,
      name: "Client B",
      status: "Inactive",
      location: "New York",
      contact: "Contact 2",
      email: "email1@clientb.co",
    },
    {
      id: 3,
      name: "Client C",
      status: "Onboarding",
      location: "San Francisco",
      contact: "Contact 3",
      email: "email2@clientc.co",
    },
    {
      id: 4,
      name: "Client D",
      status: "Active",
      location: "New York",
      contact: "Contact 4",
      email: "email3@clientd.co",
    },
    {
      id: 5,
      name: "Client E",
      status: "Inactive",
      location: "New York",
      contact: "Contact 5",
      email: "email4@cliente.co",
    },
    {
      id: 6,
      name: "Client F",
      status: "Active",
      location: "New York",
      contact: "Contact 6",
      email: "email5@clientf.co",
    },
  ];

  const statusColor = (status) => {
    if (status === "Active") return "bg-green-100 text-green-700";
    if (status === "Inactive") return "bg-red-100 text-red-700";
    if (status === "Onboarding") return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div className="md:flex md:items-center md:justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Manage Clients</h2>
                <nav className="flex mt-1 text-sm text-gray-500">
                  <Link to="/users" >
                  <span className="text-slate-900 hover:text-slate-600 cursor-pointer">User Management</span>
                  </Link>
                  <span className="mx-2">/</span>
                  <span>Clients</span>
                </nav>
              </div>
        </div>
        <div className="flex gap-3">

          <input
            type="text"
            placeholder="Search clients by company name, location, contact..."
            className="border rounded-lg px-4 py-2 w-80 text-sm"
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add Client
          </button>

          <button className="border px-4 py-2 rounded-lg text-sm">
            Import
          </button>

          <button className="border px-4 py-2 rounded-lg text-sm">
            Export
          </button>

        </div>
      </div>

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

            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-4 flex items-center gap-3">

                  <div className="w-8 h-8 border rounded flex items-center justify-center">
                    ✉
                  </div>

                  <span className="font-medium">
                    {client.name}
                  </span>

                </td>

                <td>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${statusColor(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>
                </td>

                <td>{client.location}</td>

                <td className="flex items-center gap-2">

                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>

                  {client.contact}

                </td>

                <td>{client.email}</td>

                <td className="flex gap-2">

                  <button className="border px-3 py-1 rounded text-xs">
                    View Details
                  </button>

                  <button className="border px-3 py-1 rounded text-xs">
                    Edit
                  </button>

                  <button className="border px-3 py-1 rounded text-xs">
                    Archive
                  </button>

                </td>

              </tr>
            ))}

          </tbody>
        </table>

      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">

        <p>Showing 1-6 of 85 clients</p>

        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded">1</button>
          <button className="px-3 py-1 border rounded">2</button>
          <button className="px-3 py-1 border rounded">3</button>
        </div>

      </div>

      {/* Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

          <div className="bg-white w-[650px] rounded-xl shadow-lg p-6">

            <h2 className="text-xl font-semibold mb-6">
              Add New Client
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <button className="border rounded-lg py-2 text-sm">
                + Add Contact Person
              </button>

              <button className="border rounded-lg py-2 text-sm">
                Upload Contract File
              </button>

              <input
                placeholder="Client Company Name"
                className="border p-2 rounded"
              />

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

              <label className="text-sm font-medium">
                Client Communication Channels
              </label>

              <div className="flex gap-2 mt-2">

                <span className="border px-3 py-1 rounded text-sm">
                  Slack
                </span>

                <span className="border px-3 py-1 rounded text-sm">
                  Email
                </span>

                <span className="border px-3 py-1 rounded text-sm">
                  Phone
                </span>

              </div>

            </div>

            <textarea
              placeholder="Client Notes (optional)"
              className="border w-full mt-4 p-2 rounded"
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Save Client
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Clients;
