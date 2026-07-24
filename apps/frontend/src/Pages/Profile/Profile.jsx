import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useProjectStore } from "../../store/projectStore";
import NavyButton from "../../Components/Buttons";
import {
  CalendarDays,
  Camera,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const getProfileFormValues = (user) => ({
  fullName: user.fullName || user.name || "",
  jobTitle: user.jobTitle || "",
  phone: user.phone || "",
  email: user.email || "",
});

const getInitials = (name) =>
  !name
    ? "?"
    : name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ProjectTrackerProfilePage() {
  const user = useAuthStore((state) => state.user) || {};
  const isAvatarLoading = useAuthStore((state) => state.isAvatarLoading);
  const projects = useProjectStore((state) => state.projects) || [];
  const avatarInputRef = useRef(null);
  const editButtonRef = useRef(null);
  const editDialogRef = useRef(null);
  const firstInputRef = useRef(null);
  const [avatarError, setAvatarError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formValues, setFormValues] = useState(() =>
    getProfileFormValues(user),
  );

  // Load user data and activity log on component mount
  useEffect(() => {
    const auth = useAuthStore.getState();
    const projectStore = useProjectStore.getState();

    // Ensure auth state
    if (!auth.user) {
      void auth.checkAuth();
    }

    // Fetch user's activity log
    void auth.fetchActivities();

    // The projects endpoint already scopes results to the current user's access.
    if (!projectStore.projects.length) {
      void projectStore.fetchProjects({ limit: 50 }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    setFormValues(getProfileFormValues(user));
  }, [user]);

  useEffect(() => {
    if (!showEdit) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      editButtonRef.current?.focus();
    };
  }, [showEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const openEditDialog = () => {
    setFormValues(getProfileFormValues(user));
    setFormError("");
    setShowEdit(true);
  };

  const closeEditDialog = () => {
    if (isSaving) return;
    setFormError("");
    setShowEdit(false);
  };

  const handleDialogKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeEditDialog();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = editDialogRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const auth = useAuthStore.getState();
    setFormError("");
    setIsSaving(true);

    try {
      await useAuthStore.getState().updateProfile({
        fullName: formValues.fullName,
        jobTitle: formValues.jobTitle,
        phone: formValues.phone,
        email: formValues.email,
      });
      await auth.fetchActivities();
      setShowEdit(false);
    } catch (error) {
      setFormError(
        error.response?.data?.message || "Could not save your profile changes.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError("");

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("The profile picture must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      await useAuthStore.getState().uploadAvatar(file);
      await useAuthStore.getState().fetchActivities();
    } catch (error) {
      setAvatarError(
        error.response?.data?.message ||
          "Could not upload the profile picture.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarError("");
    try {
      await useAuthStore.getState().removeAvatar();
      await useAuthStore.getState().fetchActivities();
    } catch (error) {
      setAvatarError(
        error.response?.data?.message ||
          "Could not remove the profile picture.",
      );
    }
  };

  const joinedDate = user.createdAt || user.joinedDate;
  const hasAllProjectAccess = ["ADMIN", "PM"].includes(user.role);
  const taskAccess =
    user.role === "ADMIN" || user.role === "PM"
      ? "Full Access"
      : user.role === "INTERN"
        ? "Update Assigned Tasks"
        : "View Only";

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 lg:p-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full">
          <div className="flex flex-col items-start sm:items-center gap-2 shrink-0">
            <div className="w-20 md:w-28 h-20 md:h-28 rounded-full bg-[#002D62] flex items-center justify-center text-white text-2xl md:text-4xl font-bold shadow-md overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.fullName || user.name || "User"} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.initials || getInitials(user.fullName || user.name)
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isAvatarLoading}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-blue-900 hover:bg-blue-800 text-white transitio disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                {isAvatarLoading
                  ? "Saving..."
                  : user.avatarUrl
                    ? "Change"
                    : "Add photo"}
              </button>
              {user.avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  disabled={isAvatarLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" cursor-pointer />
                  Remove
                </button>
              )}
            </div>
            {avatarError && (
              <p className="max-w-48 text-xs text-red-600" role="alert">
                {avatarError}
              </p>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold text-black">
              {user.fullName || user.name}
            </h1>
            
            <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
              {user.jobTitle}
            </span>
            <br />
            <span className="inline-block mt-1 text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-medium">
              {user.role}
            </span>
            <div className="mt-3 text-xs md:text-sm text-gray-700 space-y-1">
              <p className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{user.email}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{user.phone || "Not provided"}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CalendarDays
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>Joined {formatDate(joinedDate)}</span>
              </p>
            </div>
          </div>
        </div>
        <NavyButton
          ref={editButtonRef}
          type="button"
          className="rounded-2xl px-4 md:px-6 py-2 text-sm md:text-base  text-white transition w-full sm:w-auto cursor-pointer"
          onClick={openEditDialog}
        >
          Edit Profile
        </NavyButton>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditDialog();
          }}
        >
          <div
            ref={editDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            aria-describedby={formError ? "edit-profile-error" : undefined}
            onKeyDown={handleDialogKeyDown}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
          >
            <h2
              id="edit-profile-title"
              className="text-xl font-semibold mb-4"
            >
              Edit Profile
            </h2>
            <form onSubmit={handleSave}>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="profile-full-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Full name
                  </label>
                  <input
                    ref={firstInputRef}
                    id="profile-full-name"
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    required
                    value={formValues.fullName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-job-title"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Job title
                  </label>
                  <input
                    id="profile-job-title"
                    type="text"
                    name="jobTitle"
                    autoComplete="organization-title"
                    value={formValues.jobTitle}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-phone"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formValues.phone}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={formValues.email}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
              {formError && (
                <p
                  id="edit-profile-error"
                  className="mt-3 text-sm text-red-600"
                  role="alert"
                >
                  {formError}
                </p>
              )}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={closeEditDialog}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Accessible Projects
          </h2>
          <div className="space-y-4 text-sm text-gray-800">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${project.color || "bg-blue-600"}`}
                  />
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-gray-500">
                      Status: {project.status}
                      {typeof project.percentComplete === "number" && (
                        <>
                          {" \u00b7 "}
                          {project.percentComplete}% complete
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No accessible projects.</p>
            )}
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Permissions</h2>
          <div className="space-y-4 text-sm text-gray-800">
            <p>
              <span className="font-medium">Role:</span> {user.role}
            </p>
            <p>
              <span className="font-medium">Job Title:</span> {user.jobTitle}
            </p>
            <p>
              <span className="font-medium">Project Access:</span>{" "}
              {hasAllProjectAccess ? "All Projects" : "Assigned Projects"}
            </p>
            <p>
              <span className="font-medium">Task Management:</span> {taskAccess}
            </p>
            <p>
              <span className="font-medium">User Management:</span>{" "}
              {user.role === "ADMIN" ? "Full Access" : "No Access"}
            </p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Activity Log
          </h2>
          <div className="space-y-3 text-sm text-gray-800">
            {user?.activityLog && user.activityLog.length > 0 ? (
              user.activityLog.map((entry) => (
                <p key={entry.id}>
                  <span className="text-gray-500 text-xs">
                    {formatDate(entry.createdAt || entry.date)}
                  </span>
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
