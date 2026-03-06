import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DaysRemaining = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Example data — later replace with real sprint data
  const daysLeft = 5;
  const totalDays = 20;
  const daysUsed = totalDays - daysLeft;
  const progressPercent = (daysUsed / totalDays) * 100;
  const isUrgent = daysLeft <= 5;
  const isCritical = daysLeft <= 2;

  return (
    <div 
      className="min-h-screen bg-gray-50 p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header - Title centered, Arrow left, Search right */}
        <header className="flex flex-col items-center gap-4 mb-8">
          {/* Centered Title */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
              Days Remaining
            </h1>
            <p className="text-gray-600 mt-1">
              Sprint Deadline: <span className="font-medium text-blue-700">28 Feb 2026</span>
            </p>
          </div>

          {/* Arrow (left) and Search (right) */}
          <div className="flex items-center gap-4 w-full justify-between">
            {/* Back Arrow Only - Left */}
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            {/* Search Input - Right */}
            <div className="min-w-[240px] max-w-sm flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks, blockers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Countdown - Already centered, kept intact */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
            Time Left Until Deadline
          </h2>
          <p className="text-gray-500 mb-8">
            Project: AI Dashboard Revamp
          </p>

          <div className="relative w-56 h-56 md:w-64 h-64 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth="3.5"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="transparent"
                stroke={isCritical ? '#dc2626' : isUrgent ? '#f59e0b' : '#3b82f6'}
                strokeWidth="3.5"
                strokeDasharray={`${progressPercent * 0.314} 100`}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Days number - NOW BLACK */}
              <span className="text-6xl md:text-7xl font-extrabold text-black">
                {daysLeft}
              </span>
              <span className="text-xl md:text-2xl font-medium text-gray-600 mt-1">
                {daysLeft === 1 ? 'day' : 'days'}
              </span>
              <span className="text-sm md:text-base font-medium mt-2 uppercase tracking-wide text-gray-700">
                {isCritical ? 'CRITICAL' : isUrgent ? 'URGENT' : 'ON TRACK'}
              </span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-500 uppercase">Elapsed</p>
              <p className="text-2xl font-bold text-gray-800">{progressPercent.toFixed(0)}%</p>
            </div>
            <div className="border-l border-r border-gray-200">
              <p className="text-sm text-gray-500 uppercase">Remaining</p>
              <p className="text-2xl font-bold text-gray-800">{100 - progressPercent.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total</p>
              <p className="text-2xl font-bold text-gray-800">{totalDays} days</p>
            </div>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sprint Timeline</h3>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPercent}%`,
                background: isCritical
                  ? 'linear-gradient(to right, #ef4444, #dc2626)'
                  : isUrgent
                  ? 'linear-gradient(to right, #fbbf24, #f59e0b)'
                  : 'linear-gradient(to right, #60a5fa, #3b82f6)',
              }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Start</span>
            <span className="font-medium">Today ({progressPercent.toFixed(0)}%)</span>
            <span>Deadline</span>
          </div>
        </div>

        {/* Tasks Impacting Deadline */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Tasks Impacting Deadline</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* In Progress */}
            <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h4 className="font-semibold text-gray-900">In Progress (3)</h4>
              </div>
              <p className="font-medium text-gray-900">API Integration</p>
              <p className="text-sm text-gray-600">Due in 3 days</p>
              <p className="text-xs text-gray-500 mt-1">Assigned: Siya</p>
            </div>

            {/* Blocked */}
            <div className="border border-red-100 bg-red-50/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <h4 className="font-semibold text-gray-900">Blocked (1)</h4>
              </div>
              <p className="font-medium text-gray-900">Backend API Setup</p>
              <p className="text-sm text-gray-600">Waiting on DB config</p>
              <p className="text-xs text-gray-500 mt-1">Assigned: Dev Team</p>
            </div>

            {/* Completed */}
            <div className="border border-green-100 bg-green-50/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h4 className="font-semibold text-gray-900">Completed (4)</h4>
              </div>
              <p className="font-medium text-gray-900">UI Setup</p>
              <p className="text-sm text-gray-600">Finished 2 days ago</p>
            </div>
          </div>
        </div>

        {/* Risk Alert */}
        <div
          className={`
            border rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6
            ${isCritical ? 'bg-red-50 border-red-200' : isUrgent ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}
          `}
        >
          <div className="text-center sm:text-left">
            <h3 className={`text-xl font-bold ${isCritical ? 'text-red-700' : isUrgent ? 'text-amber-700' : 'text-blue-700'}`}>
              ⚠ Risk Level: {isCritical ? 'CRITICAL' : isUrgent ? 'HIGH' : 'MODERATE'}
            </h3>
            <p className="text-gray-700 mt-2">
              {isCritical
                ? 'Immediate action required – 2 tasks blocked and deadline critical.'
                : isUrgent
                ? 'Deadline approaching – review blockers and reassign if needed.'
                : 'Sprint is on track, but monitor closely.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <button 
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              View Blockers
            </button>
            {/* Reassign Tasks Button - NOW NAVY BLUE */}
            <button 
              className="px-5 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
            >
              Reassign Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaysRemaining;