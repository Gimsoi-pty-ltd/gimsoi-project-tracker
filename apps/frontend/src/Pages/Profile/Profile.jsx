// src/Pages/Profile/Profile.jsx
import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useProjectStore } from "../../store/projectStore";

export default function ProjectTrackerProfilePage() {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, []);


  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";


  const assignedProjects = user?.projectIds?.length
    ? projects.filter((p) => user.projectIds.includes(p.id))
    : projects;

  const joinedDate = user?.createdAt || user?.joinedDate;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 lg:p-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full">
          <div className="w-20 md:w-28 h-20 md:h-28 rounded-full bg-[#002D62] flex items-center justify-center text-white text-2xl md:text-4xl font-bold shadow-md flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold text-black">{user?.fullName ?? "—"}</h1>
            <p className="text-base md:text-lg text-gray-700 mt-1">{user?.jobTitle ?? user?.title ?? "Team Member"}</p>
            <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
              {user?.role ?? "Member"}
            </span>
            <div className="mt-3 text-xs md:text-sm text-gray-700 space-y-1">
              <p>📧 {user?.email ?? "—"}</p>
              {user?.phone && <p>📞 {user.phone}</p>}
              {joinedDate && (
                <p>📅 Joined {new Date(joinedDate).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
              )}
            </div>
          </div>
        </div>
        <button className="rounded-2xl px-4 md:px-6 py-2 text-sm md:text-base bg-blue-600 text-white hover:bg-blue-700 transition w-full sm:w-auto">
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

        {/* Assigned Projects */}
        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Assigned Projects</h2>
          <div className="space-y-4 text-sm text-gray-800">
            {assignedProjects.length === 0 && (
              <p className="text-gray-500 text-sm">No projects assigned.</p>
            )}
            {assignedProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  project.status?.toLowerCase() === "active" ? "bg-green-500" :
                  project.status?.toLowerCase() === "completed" ? "bg-blue-500" :
                  "bg-yellow-500"
                }`} />
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-gray-500">
                    Status: {project.status}
                    {project.progress != null ? ` · ${project.progress}% complete` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Permissions</h2>
          <div className="space-y-4 text-sm text-gray-800">
            <p><span className="font-medium">Role:</span> {user?.role ?? "—"}</p>
            <p><span className="font-medium">Job Title:</span> {user?.jobTitle ?? user?.title ?? "—"}</p>
            <p><span className="font-medium">Project Access:</span> All Projects</p>
            <p><span className="font-medium">Task Management:</span> Full Access</p>
            <p><span className="font-medium">User Management:</span> {user?.role === "Admin" ? "Full Access" : "View Only"}</p>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Activity Log</h2>
          <div className="space-y-3 text-sm text-gray-800">
            {(!user?.activityLog || user.activityLog.length === 0) && (
              <p className="text-gray-500 text-sm">No recent activity.</p>
            )}
            {(user?.activityLog ?? []).map((entry, i) => (
              <p key={i}>
                <span className="text-gray-500 text-xs">{entry.date}</span>
                <br />{entry.action}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}