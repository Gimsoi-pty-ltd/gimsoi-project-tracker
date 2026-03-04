import { useState } from "react";

export default function ActivitySection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#001f44]/10 text-[#001f44]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M3 12h4l2-5 4 10 2-5h6" />
            </svg>
          </span>
          <h2 className="text-base font-semibold text-[#001f44]">Activity</h2>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="px-5 py-2 rounded-md text-white font-semibold shadow-sm bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
        >
          {open ? "Hide Log" : "View Log"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="bg-gray-50 border border-gray-200 p-3 rounded border-l-4 border-orange-500">
            <p className="text-sm font-medium">Logged in</p>
            <p className="text-xs text-gray-500">Today 2:45 PM</p>
          </div>
        </div>
      )}
    </div>
  );
}
