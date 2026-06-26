import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../Components/EmptyState";

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    team: "",
    department: "",
    phone: "",
    notes: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

   

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users?page=${page}&limit=6`)
    .then((res) => res.json())
    .then((data) => {
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
      setUsers([]);
      setTotalPages(1);
      setLoading(false);
    });
  }, [page]);


  const statusStyle = (status) => {
    if (status === "Active")
      return "bg-green-100 text-green-700";
    if (status === "Pending")
      return "bg-yellow-100 text-yellow-700";
    if (status === "Inactive")
      return "bg-red-100 text-red-700";
  };

const handleSaveUser = async () => {
  if (!formData.name) return;

  setSaving(true);

  try {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setShowModal(false);

    setFormData({
      name: "",
      email: "",
      role: "",
      team: "",
      department: "",
      phone: "",
      notes: "",
    });

    // optional UX refresh (same pattern as clients usually rely on re-fetch)
    setPage(1);

  } catch (err) {
    console.error("Error saving user:", err);
  } finally {
    setSaving(false);
  }
};

const handleEditUser = async (id, updatedData) => {
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    const updatedUser = await res.json();
    setUsers(users.map((u) => (u.id === id ? updatedUser : u)));
  } catch (err) {
    console.error("Error editing user:", err);
  }
};


const handleDeactivate = async (id) => {
  try {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers(users.filter((u) => u.id !== id));
  } catch (err) {
    console.error("Error deactivating user:", err);
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};




  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">

       <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Manage Users</h2>
              <nav className="flex mt-1 text-xs md:text-sm text-gray-500">
                <Link to="/users" >
                <span className="text-slate-900 hover:text-slate-600 cursor-pointer">User Management</span>
                </Link>
                <span className="mx-2">/</span>
                <span>Users</span>
              </nav>
            </div>

        <div className="flex flex-wrap gap-2 md:gap-3">

        {/* Filter Input . Allows to search users by name, role, or email. Updates the search state on change. */}
          <input
            type="text"
            placeholder="Search users..."
            className="border rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm flex-1 min-w-[150px] md:w-auto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => {
              setFormData({ name: "", email: "", role: "", team: "", department: "", phone: "", notes: "" });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
          >
            + Add User
          </button>

          <button 
            onClick={() => alert("Import Data action triggered - this would open the CSV upload interface.")}
            className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Import Data
          </button>
          <button 
            onClick={() => alert("Export Report action triggered - this generates and downloads a CSV report.")}
            className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Export Report
          </button>

        </div>
      </div>


      {loading ? (
        <div className="bg-white rounded-xl border shadow-sm p-10 text-center">
          <p className="text-sm text-gray-600">Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          message="The users list is empty or the users endpoint is unavailable. Please check your connection or contact the admin."
          actionLabel="Try Again"
          onAction={() => setPage(1)}
        />
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">

          <table className="w-full text-xs md:text-sm min-w-[640px]">

          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-4">Users</th>
              <th>Email</th>
              <th>Role</th>
              <th>Team</th>
              <th>Permission Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users
              .filter((u) =>
                (u.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (u.role ?? '').toLowerCase().includes(search.toLowerCase())
              )
              .map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-gray-300"></div>

                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      Company Colleague
                    </p>
                  </div>

                </td>

                <td>{user.email}</td>

                <td>
                  <span className="text-gray-700">
                    {user.role}
                  </span>
                </td>

                <td>{user.team}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="flex gap-2">
                  {/* Edit user details - opens modal with form to edit all fields */}
                  <button
                    onClick={() => {
                      setFormData(user);
                      setShowModal(true);
                    }}
                    className="border px-3 py-1 rounded text-xs hover:bg-blue-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeactivate(user.id)}
                    className="border px-3 py-1 rounded text-xs "
                  >
                    Deactivate
                  </button>


                </td>
              </tr>
            ))}

          </tbody>
        </table>

      </div>
      )}

      {/* Pagination */}
      {!loading && users.length > 0 && (

      
          <div className="flex gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className="px-3 py-1 border rounded"
          >
            {i + 1}
          </button>
        ))}
      </div>
      )}



      {/* Add User Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

          <div className="bg-white w-[600px] rounded-xl p-6 shadow-lg">

            <h2 className="text-xl font-semibold mb-6">
              {formData.id ? "Edit User" : "Add New User"}
            </h2>

            {/* Controlled form state for adding/editing user. Each input updates the formData state on change. */}
            <div className="grid grid-cols-2 gap-4">

        
              <input
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 placeholder="Full Name"
                className="border p-2 rounded"
              />

              <input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email Address"
                className="border p-2 rounded"
              />

              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone Number"
                className="border p-2 rounded"
              />

              <select
                name="role"
                className="border p-2 rounded"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Designer">Designer</option>
              </select>

             <select
                name="department"
                className="border p-2 rounded"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>

              <select
                name="team"
                className="border p-2 rounded"
                value={formData.team}
                onChange={handleChange}
              >
                <option value="">Select Team</option>
                <option value="Project Ares Team">Project Ares Team</option>
                <option value="Marketing Squad">Marketing Squad</option>
                <option value="Sales Group">Sales Group</option>
              </select>

            </div>

            <textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="User Notes (optional)"
              className="border rounded w-full p-2 mt-4 col-span-2"
            ></textarea>


            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveUser}
                disabled={saving || !formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save User"}
              </button>

            </div>

          </div>

        </div>

      )}
    </div>
  );
};

export default Users;
