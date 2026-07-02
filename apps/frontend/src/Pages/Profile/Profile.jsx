import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useProjectStore } from "../../store/projectStore";
import { Phone } from "lucide-react"; // Phone icon component

const getInitials = (name) =>
  !name
    ? "?"
    : name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

export default function ProjectTrackerProfilePage() {
  const user = useAuthStore((state) => state.user) || {};
  const projects = useProjectStore((state) => state.projects) || [];
  // Load user data and activity log on component mount
  useEffect(() => {
    const auth = useAuthStore.getState();
    // Ensure auth state
    if (!auth.user) {
      auth.checkAuth();
    }
    // Fetch user's activity log
    auth.fetchActivities();
  }, []);

  const [showEdit, setShowEdit] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: user.fullName || user.name || "",
    jobTitle: user.jobTitle || "",
    phone: user.phone || "",
    email: user.email || "",
  });

  useEffect(() => {
    setFormValues({
      fullName: user.fullName || user.name || "",
      jobTitle: user.jobTitle || "",
      phone: user.phone || "",
      email: user.email || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const auth = useAuthStore.getState();
    // Optimistically update UI locally
    auth.updateUserProfile({
      fullName: formValues.fullName,
      name: formValues.fullName,
      jobTitle: formValues.jobTitle,
      phone: formValues.phone,
      email: formValues.email,
    });
    try {
      await auth.updateProfile({
        fullName: formValues.fullName,
        name: formValues.fullName,
        jobTitle: formValues.jobTitle,
        phone: formValues.phone,
        email: formValues.email,
        version: user.version,
      });
      // Refresh activity logs after successful update
      await auth.fetchActivities();
    } catch (err) {
      console.error(err);
    }
    setShowEdit(false);
  };

  const assignedProjects = projects.filter((p) => p.assignedTo === user.name);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 lg:p-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full">
          <div className="w-20 md:w-28 h-20 md:h-28 rounded-full bg-[#002D62] flex items-center justify-center text-white text-2xl md:text-4xl font-bold shadow-md flex-shrink-0">
            {user.initials || getInitials(user.fullName || user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold text-black">{user.fullName || user.name}</h1>
            <p className="text-base md:text-lg text-gray-700 mt-1">{user.jobTitle}</p>
            <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
              {user.role}
            </span>
            <div className="mt-3 text-xs md:text-sm text-gray-700 space-y-1">
              <p>📧 {user.email}</p>
              <p><Phone className="inline-block w-4 h-4 mr-1" /> {user.phone}</p>
              <p>📅 Joined {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</p>
            </div>
          </div>
        </div>
        <button
          className="rounded-2xl px-4 md:px-6 py-2 text-sm md:text-base bg-blue-600 text-white hover:bg-blue-700 transition w-full sm:w-auto"
          onClick={() => setShowEdit(true)}
        >
          Edit Profile
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <div className="space-y-3">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formValues.fullName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="jobTitle"
                placeholder="Job Title"
                value={formValues.jobTitle}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formValues.phone}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formValues.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Assigned Projects</h2>
          <div className="space-y-4 text-sm text-gray-800">
            {assignedProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${project.color}`} />
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-gray-500">Status: {project.status} · {project.progress}% complete</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Permissions</h2>
          <div className="space-y-4 text-sm text-gray-800">
            <p><span className="font-medium">Role:</span> {user.role}</p>
            <p><span className="font-medium">Job Title:</span> {user.jobTitle}</p>
            <p><span className="font-medium">Project Access:</span> All Projects</p>
            <p><span className="font-medium">Task Management:</span> Full Access</p>
            <p><span className="font-medium">User Management:</span> {user.role === "Admin" ? "Full Access" : "View Only"}</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Activity Log</h2>
          <div className="space-y-3 text-sm text-gray-800">
            {user?.activityLog && user.activityLog.length > 0 ? (
              user.activityLog.map((entry, i) => (
                <p key={i}>
                  <span className="text-gray-500 text-xs">{entry.date}</span>
                  <br />
                  {entry.action}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}