import ToggleSwitch from "./ToggleSwitch";

export default function PreferencesSection() {
  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#001f44]/10 text-[#001f44]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.846 1.568l-.078.478a1.875 1.875 0 0 1-1.215 1.462l-.452.176a1.875 1.875 0 0 1-1.88-.318l-.38-.302a1.875 1.875 0 0 0-2.492.14l-.757.757a1.875 1.875 0 0 0-.14 2.492l.302.38c.449.565.57 1.33.318 1.98l-.176.452a1.875 1.875 0 0 1-1.462 1.215l-.478.078a1.875 1.875 0 0 0-1.568 1.846v1.07c0 .917.663 1.699 1.568 1.846l.478.078a1.875 1.875 0 0 1 1.462 1.215l.176.452c.252.65.131 1.415-.318 1.98l-.302.38a1.875 1.875 0 0 0 .14 2.492l.757.757c.651.65 1.676.709 2.492.14l.38-.302a1.875 1.875 0 0 1 1.88-.318l.452.176a1.875 1.875 0 0 1 1.215 1.462l.078.478c.147.905.929 1.568 1.846 1.568h1.07c.917 0 1.699-.663 1.846-1.568l.078-.478a1.875 1.875 0 0 1 1.215-1.462l.452-.176a1.875 1.875 0 0 1 1.88.318l.38.302c.816.569 1.84.51 2.492-.14l.757-.757a1.875 1.875 0 0 0 .14-2.492l-.302-.38a1.875 1.875 0 0 1-.318-1.98l.176-.452a1.875 1.875 0 0 1 1.462-1.215l.478-.078A1.875 1.875 0 0 0 21.75 14.32v-1.07a1.875 1.875 0 0 0-1.568-1.846l-.478-.078a1.875 1.875 0 0 1-1.462-1.215l-.176-.452a1.875 1.875 0 0 1 .318-1.98l.302-.38a1.875 1.875 0 0 0-.14-2.492l-.757-.757a1.875 1.875 0 0 0-2.492-.14l-.38.302a1.875 1.875 0 0 1-1.88.318l-.452-.176a1.875 1.875 0 0 1-1.215-1.462l-.078-.478A1.875 1.875 0 0 0 12.148 2.25h-1.07ZM12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" clipRule="evenodd" />
          </svg>
        </span>
        <h2 className="text-base font-semibold text-[#001f44]">Preferences</h2>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Theme</span>
        <select className="border border-gray-300 bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500">
          <option>Light</option>
          <option>Dark</option>
          <option>Auto</option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Email Notifications</span>
        <ToggleSwitch defaultOn />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Desktop Notifications</span>
        <ToggleSwitch />
      </div>
    </div>
  );
}
