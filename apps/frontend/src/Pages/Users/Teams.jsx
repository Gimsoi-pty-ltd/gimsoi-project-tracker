import React, { useState } from "react";
import { Search, Plus, Download, Upload } from "lucide-react";

export default function Teams() {
  const [openModal, setOpenModal] = useState(false);

  const teams = [
    { name: "Team Alpha", project: "Project Ares", dept: "Engineering", lead: "John Doe", members: 15, status: "Active" },
    { name: "Team Beta", project: "Project Ares", dept: "Engineering", lead: "John Doe", members: 16, status: "Active" },
    { name: "Team Gamma", project: "Project Aeta", dept: "Engineering", lead: "Mark Bayenn", members: 12, status: "On Hold" },
    { name: "Team Alpha", project: "Project Ares", dept: "Engineering", lead: "John Doe", members: 15, status: "Active" },
    { name: "Team Beta", project: "Project Ares", dept: "Engineering", lead: "John Doe", members: 14, status: "Active" },
    { name: "Team Feta", project: "Project Ares", dept: "Engineering", lead: "Mark Bayenn", members: 12, status: "On Hold" },
    { name: "Team Gamma", project: "Project Anns", dept: "Engineering", lead: "John Doe", members: 8, status: "Active" },
    { name: "Team Heni", project: "Project Ares", dept: "Engineering", lead: "John Doe", members: 17, status: "Active" },
    { name: "Team Alpha", project: "Project Ares", dept: "Engineering", lead: "John Doe", members: 9, status: "On Hold" },
    { name: "Team Beta", project: "Project Ares", dept: "Engineering", lead: "John Doe", members: 6, status: "Archived" },
  ];

  const statusColor = (status) => {
    if (status === "Active")
      return "bg-green-100 text-green-700";
    if (status === "On Hold")
      return "bg-yellow-100 text-yellow-700";
    if (status === "Archived")
      return "bg-gray-200 text-gray-600";
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-semibold text-gray-800">
          Manage Teams
        </h1>

        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 w-72">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              className="outline-none w-full text-sm"
              placeholder="Search teams by name, project, department..."
            />
          </div>

          {/* Add */}
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Team
          </button>

          {/* Import */}
          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-white">
            <Download size={16} />
            Import
          </button>

          {/* Export */}
          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-white">
            <Upload size={16} />
            Export
          </button>

        </div>
      </div>


      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Team Name</th>
              <th className="p-3 text-left">Primary Project</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Team Lead</th>
              <th className="p-3 text-left">Members</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>

            {teams.map((team, index) => (

              <tr key={index} className="border-t hover:bg-gray-50">

                <td className="p-3 font-medium">{team.name}</td>

                <td className="p-3">{team.project}</td>

                <td className="p-3">{team.dept}</td>

                <td className="p-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-300"></div>
                  {team.lead}
                </td>

                <td className="p-3">{team.members}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                      team.status
                    )}`}
                  >
                    {team.status}
                  </span>
                </td>

                <td className="p-3 flex gap-2">

                  <button className="border px-3 py-1 rounded-md text-sm bg-white">
                    View Team
                  </button>

                  <button className="border px-3 py-1 rounded-md text-sm bg-white">
                    Edit
                  </button>

                  <button className="border px-3 py-1 rounded-md text-sm bg-white">
                    View Members
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">

        <span>Showing 1-12 of 34 teams</span>

        <div className="flex gap-3">
          <span className="font-semibold text-blue-600">1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>...</span>
          <span>8</span>
        </div>

      </div>


      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

          <div className="bg-white rounded-xl w-[650px] p-6">

            <h2 className="text-xl font-semibold mb-4">
              Add New Team
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <label className="text-sm text-gray-600">
                  Team Name
                </label>
                <input
                  className="w-full border rounded-lg p-2 mt-1"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Associated Primary Project
                </label>
                <select className="w-full border rounded-lg p-2 mt-1">
                  <option>Project Ares</option>
                  <option>Project Atlas</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Department
                </label>
                <select className="w-full border rounded-lg p-2 mt-1">
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Assign Team Lead
                </label>
                <select className="w-full border rounded-lg p-2 mt-1">
                  <option>John Doe</option>
                  <option>Mark Bayenn</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Initial Status
                </label>
                <select className="w-full border rounded-lg p-2 mt-1">
                  <option>Active</option>
                  <option>On Hold</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-600">
                  Notes / Description
                </label>
                <textarea
                  className="w-full border rounded-lg p-2 mt-1"
                  rows="3"
                ></textarea>
              </div>

            </div>


            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Save Team
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
