import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../Components/EmptyState";
import { resourceAPI } from "../../api/api";

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

  const fileInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    resourceAPI.get(`/users?page=${page}&limit=6`)
    .then((res) => {
      const data = res.data;
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
    try {
      if (formData.id) {
        // Edit existing user
        const res = await resourceAPI.put(`/users/${formData.id}`, formData);
        const updatedUser = res.data;
        setUsers(users.map((u) => (u.id === formData.id ? updatedUser : u)));
      } else {
        // Add new user
        const res = await resourceAPI.post("/users", formData);
        const savedUser = res.data;
        setUsers([...users, savedUser]);
      }
      setShowModal(false);
      setFormData({ name: "", email: "", role: "", team: "", department: "", phone: "", notes: "" });
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Failed to save user. Please try again.");
    }
  };

const handleEditUser = async (id, updatedData) => {
  try {
    const res = await resourceAPI.put(`/users/${id}`, updatedData);
    const updatedUser = res.data;
    setUsers(users.map((u) => (u.id === id ? updatedUser : u)));
  } catch (err) {
    console.error("Error editing user:", err);
    alert("Failed to edit user. Please try again.");
  }
};


const handleDeactivate = async (id) => {
  try {
    await resourceAPI.delete(`/users/${id}`);
    setUsers(users.filter((u) => u.id !== id));
  } catch (err) {
    console.error("Error deactivating user:", err);
    alert("Failed to deactivate user. Please try again.");
  }
};

const handleExport = () => {
  if (users.length === 0) {
    alert("No users to export.");
    return;
  }
  const headers = ["Name", "Email", "Role", "Team", "Status"];
  const rows = users.map(u => [u.name, u.email, u.role, u.team, u.status]);
  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(","), ...rows.map(e => e.map(val => `"${val || ''}"`).join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `users_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleImport = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const text = event.target.result;
      let importedList = [];
      if (file.name.endsWith(".json")) {
        importedList = JSON.parse(text);
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n").filter(Boolean);
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
        importedList = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
          const item = {};
          headers.forEach((header, idx) => {
            const key = header.toLowerCase();
            item[key] = values[idx];
          });
          return item;
        });
      } else {
        alert("Please upload a .json or .csv file.");
        return;
      }

      const processed = importedList.map((item, index) => ({
        id: item.id || `imported-${Date.now()}-${index}`,
        name: item.name || item.fullName || "Imported User",
        email: item.email || `imported-${index}@example.com`,
        role: item.role || "MEMBER",
        team: item.team || "Engineering",
        status: item.status || "Active",
      }));

      setUsers(prev => [...processed, ...prev]);
      alert(`Successfully imported ${processed.length} users!`);
    } catch (err) {
      console.error("Failed to parse file:", err);
      alert("Error parsing file. Ensure it is valid JSON or CSV.");
    }
  };
  reader.readAsText(file);
  e.target.value = '';
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
            className="bg-[#002D62] text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-[#001f44] whitespace-nowrap"
          >
            + Add User
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json,.csv"
            style={{ display: "none" }}
          />

          <button
            onClick={handleImportClick}
            className="border px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm bg-white hidden sm:block hover:bg-gray-50"
          >
            Import
          </button>

          <button
            onClick={handleExport}
            className="border px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm bg-white hidden sm:block hover:bg-gray-50"
          >
            Export
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
            className="px-4 py-2 bg-[#002D62]  text-white rounded"
          >
            Save User
          </button>

            </div>

          </div>

        </div>

      )}
    </div>
  );
};

export default Users;
