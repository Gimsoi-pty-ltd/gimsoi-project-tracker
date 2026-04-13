import React, { useState } from "react";
import { Link } from "react-router-dom";

const Users = () => {
  const [showModal, setShowModal] = useState(false);

  const users = [
    { id: 1, name: "Sarah Chen", email: "product@company.co", role: "Designer", title: "Senior Product Designer", team: "Design Team", status: "Active" },
    { id: 2, name: "Mike Ross", email: "mike@company.co", role: "Developer", title: "Lead Frontend Developer", team: "Engineering", status: "Active" },
    { id: 3, name: "Rachel Zane", email: "rachel@company.co", role: "Manager", title: "Project Manager", team: "Operations", status: "Pending" },
    { id: 4, name: "Harvey Specter", email: "harvey@company.co", role: "Admin", title: "System Administrator", team: "IT", status: "Active" },
    { id: 5, name: "Donna Paulsen", email: "donna@company.co", role: "HR", title: "HR Coordinator", team: "People", status: "Active" },
    { id: 6, name: "Louis Litt", email: "louis@company.co", role: "QA", title: "QA Engineer", team: "Engineering", status: "Inactive" },
  ];

  const statusStyle = (status) => {
    if (status === "Active") return "bg-green-100 text-green-700";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Inactive") return "bg-red-100 text-red-700";
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

       <div className="md:flex md:items-center md:justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Manage Users</h2>
                <nav className="flex mt-1 text-sm text-gray-500">
                  <Link to="/users" >
                  <span className="text-slate-900 hover:text-slate-600 cursor-pointer">User Management</span>
                  </Link>
                  <span className="mx-2">/</span>
                  <span>Users</span>
                </nav>
              </div>
        </div>

        <div className="flex gap-3">

        <div className="flex flex-wrap gap-2 md:gap-3">
          <input
            type="text"
            placeholder="Search users..."
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] md:w-72"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
          >
            + Add User
          </button>
          <button className="border px-3 md:px-4 py-2 rounded-lg text-sm bg-white">Import</button>
          <button className="border px-3 md:px-4 py-2 rounded-lg text-sm bg-white">Export</button>
        </div>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-4">Users</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Team</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">Company Colleague</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 text-gray-700">{user.role}</td>
                <td className="p-3">{user.team}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="border px-3 py-1 rounded text-xs whitespace-nowrap">Edit</button>
                    <button className="border px-3 py-1 rounded text-xs whitespace-nowrap">Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600 sm:flex-row sm:justify-between sm:items-center">
        <p>Showing 1-6 of 85 users</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded">1</button>
          <button className="px-3 py-1 border rounded">2</button>
          <button className="px-3 py-1 border rounded">3</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-[600px] rounded-xl p-5 md:p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-5">Add New User</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Full Name" className="border p-2 rounded" />
              <input placeholder="Email Address" className="border p-2 rounded" />
              <input placeholder="Phone Number" className="border p-2 rounded" />
              <select className="border p-2 rounded">
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Designer</option>
              </select>
              <select className="border p-2 rounded">
                <option>Engineering</option>
                <option>Marketing</option>
                <option>Sales</option>
              </select>
              <select className="border p-2 rounded">
                <option>Project Ares Team</option>
                <option>Marketing Squad</option>
                <option>Sales Group</option>
              </select>
            </div>
            <textarea placeholder="User Notes (optional)" className="border rounded w-full p-2 mt-4" />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Save User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;