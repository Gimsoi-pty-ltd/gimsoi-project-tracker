export default function SecuritySection() {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#001f44]/10 text-[#001f44]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.98 11.98 0 0 1-3.643 2.183 11.987 11.987 0 0 1-3.765.899.75.75 0 0 0-.699.75v4.805a11.25 11.25 0 0 0 6.863 10.356l1.435.616a.75.75 0 0 0 .65 0l1.435-.616a11.25 11.25 0 0 0 6.863-10.356V6.002a.75.75 0 0 0-.699-.75 11.987 11.987 0 0 1-3.765-.9 11.98 11.98 0 0 1-3.643-2.182ZM15.75 9a.75.75 0 0 0-1.5 0v.75h.75a2.25 2.25 0 0 1 2.25 2.25v3A2.25 2.25 0 0 1 15 17.25h-6A2.25 2.25 0 0 1 6.75 15v-3A2.25 2.25 0 0 1 9 9.75h3.75V9a.75.75 0 0 0-1.5 0v.75H9A3.75 3.75 0 0 0 5.25 13.5v1.5A3.75 3.75 0 0 0 9 18.75h6A3.75 3.75 0 0 0 18.75 15v-1.5A3.75 3.75 0 0 0 15 9.75h.75V9Z" clipRule="evenodd" />
          </svg>
        </span>
        <h2 className="text-base font-semibold text-[#001f44]">Security</h2>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">Password</p>
          <p className="text-sm text-gray-400">Last changed 2 months ago</p>
        </div>
        <button className="px-5 py-2 rounded-md text-white font-semibold shadow-sm bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors" >
          Change
        </button>
      </div>

      <div className="flex justify-between items-center">
        <p>Two-Factor Authentication</p>
        <button className="px-5 py-2 rounded-md text-white font-semibold shadow-sm bg-[#001f44] focus:outline-none focus:ring-2 focus:ring-[#001f44] focus:ring-offset-2 transition-colors">
          Enabled
        </button>
      </div>
    </div>
  );
}
