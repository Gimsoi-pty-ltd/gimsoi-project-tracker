import { useState } from "react";
import { useProjectStore } from "../../store/ProjectStore";

export default function ProfileSection() {
  const { user, updateUserProfile, addActivityLog } = useProjectStore((state) => state);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [saved, setSaved] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateUserProfile({ name: formData.name, email: formData.email });
    addActivityLog(`Updated profile information`);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#001f44]/10 text-[#001f44] flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5a18.683 18.683 0 0 1-7.812-1.7.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
          </svg>
        </span>
        <h2 className="text-base font-semibold text-[#001f44]">Profile</h2>
      </div>

      {/* Avatar Card */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex gap-4 items-center">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#001f44] text-white flex items-center justify-center rounded-lg text-lg md:text-xl font-bold flex-shrink-0">
          {user.initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#001f44] truncate">{user.name}</p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
          <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full inline-block mt-1">
            {user.jobTitle}
          </span>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="text-sm font-medium text-gray-700 sm:flex-shrink-0">Full Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full sm:max-w-xs rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="text-sm font-medium text-gray-700 sm:flex-shrink-0">Email Address</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full sm:max-w-xs rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-1 flex justify-end">
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-md bg-[#001f44] text-white text-sm font-semibold shadow-sm hover:bg-[#002d62] transition-colors focus:outline-none focus:ring-2 focus:ring-[#001f44] focus:ring-offset-2"
        >
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}