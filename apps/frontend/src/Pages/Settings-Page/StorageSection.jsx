import { useState } from "react";

export default function StorageSection() {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#001f44]/10 text-[#001f44]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2.25c-4.418 0-8 1.68-8 3.75v12c0 2.07 3.582 3.75 8 3.75s8-1.68 8-3.75V6c0-2.07-3.582-3.75-8-3.75Zm0 1.5c3.866 0 6.5 1.41 6.5 2.25S15.866 8.25 12 8.25 5.5 6.84 5.5 6 8.134 3.75 12 3.75Zm0 16.5c-3.866 0-6.5-1.41-6.5-2.25v-2.259c1.45.984 3.84 1.509 6.5 1.509s5.05-.525 6.5-1.509V18c0 .84-2.634 2.25-6.5 2.25Zm0-4.5c-3.866 0-6.5-1.41-6.5-2.25v-2.259c1.45.984 3.84 1.509 6.5 1.509s5.05-.525 6.5-1.509V13.5c0 .84-2.634 2.25-6.5 2.25Z" />
            </svg>
          </span>
          <h2 className="text-base font-semibold text-[#001f44]">Storage</h2>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="px-5 py-2 rounded-md text-white font-semibold shadow-sm bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
        >
          {open ? "Hide Usage" : "View Usage"}
        </button>
      </div>

      {open && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-md space-y-4">
          <div>
            <p className="text-sm font-medium text-[#001f44]">Storage Used</p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div className="bg-orange-500 h-2 rounded w-[65%]" />
            </div>
            <p className="text-xs text-gray-500">6.5GB / 10GB</p>
          </div>
        </div>
      )}
    </div>
  );
}
