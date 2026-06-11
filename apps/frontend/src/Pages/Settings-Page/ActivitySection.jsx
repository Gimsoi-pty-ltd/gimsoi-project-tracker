import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

export default function ActivitySection() {
  const { userActivities = [], fetchActivities } = useAuthStore((state) => state);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchActivities();
    }
  }, [open, fetchActivities]);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#001f44]/10 text-[#001f44] flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M3 12h4l2-5 4 10 2-5h6" />
            </svg>
          </span>
          <h2 className="text-base font-semibold text-[#001f44] truncate">Activity</h2>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex-shrink-0 px-4 py-2 rounded-md text-white text-sm font-semibold shadow-sm bg-[#001f44] hover:bg-[#002d62] focus:outline-none focus:ring-2 focus:ring-[#001f44] focus:ring-offset-2 transition-colors"
        >
          {open ? "Hide Log" : "View Log"}
        </button>
      </div>

      {open && (
        <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
          {userActivities.length > 0 ? (
            userActivities.map((entry, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 border-l-4 border-l-orange-500 p-3 rounded">
                <p className="text-sm font-medium">{entry.action}</p>
                <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 p-3 text-center">No activities logged yet.</p>
          )}
        </div>
      )}
    </div>
  );
}