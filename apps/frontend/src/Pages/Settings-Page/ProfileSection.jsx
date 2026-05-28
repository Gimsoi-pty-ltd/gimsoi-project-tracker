export default function ProfileSection() {
  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#001f44]/10 text-[#001f44]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5a18.683 18.683 0 0 1-7.812-1.7.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
          </svg>
        </span>
        <h2 className="text-base font-semibold text-[#001f44]">Profile</h2>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg flex gap-4 items-center">
        <div className="w-16 h-16 bg-[#001f44] text-white flex items-center justify-center rounded-lg text-xl font-bold">
          JD
        </div>
        <div>
          <p className="font-semibold text-[#001f44]">John Doe</p>
          <p className="text-sm text-gray-500">john.doe@example.com</p>
          <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full">
            Project Manager
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-gray-700">Full Name</span>
        <input
          type="text"
          defaultValue="John Doe"
          className="w-full max-w-xs rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-gray-700">Email Address</span>
        <input
          type="email"
          defaultValue="john.doe@example.com"
          className="w-full max-w-xs rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
        />
      </div>
    </div>
  );
}
