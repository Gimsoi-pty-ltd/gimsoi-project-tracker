import React, { useState } from 'react';
import { Search as SearchIcon, Filter, Clock, CheckCircle2, Circle, AlertCircle, FileText, User, Folder } from 'lucide-react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Projects', 'Tasks', 'People', 'Files'];

  const recentSearches = [
    'Website Redesign', 'Sarah Mitchell', 'Q1 Marketing Report', 'API Authentication'
  ];

  const mockResults = [
    { type: 'Task', title: 'Implement API Authentication', status: 'In Progress', project: 'Backend Services', date: 'Oct 24', icon: <Circle className="w-5 h-5 text-blue-500" /> },
    { type: 'Project', title: 'Website Redesign', status: 'Active', members: 4, date: 'Nov 12', icon: <Folder className="w-5 h-5 text-purple-500" /> },
    { type: 'People', title: 'Sarah Mitchell', role: 'Project Manager', email: 'sarah.mitchell@email.com', icon: <User className="w-5 h-5 text-green-500" /> },
    { type: 'File', title: 'Q1 Marketing Report.pdf', size: '2.4 MB', project: 'Marketing Campaign', icon: <FileText className="w-5 h-5 text-orange-500" /> },
    { type: 'Task', title: 'Fix Navigation Bug', status: 'Completed', project: 'Frontend App', date: 'Oct 20', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
  ];

  return (
    <div className="bg-[#f5f7fb] min-h-screen font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">

        {/* Header & Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 space-y-5 md:space-y-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Search</h1>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-12 py-3.5 md:py-4 bg-gray-50 border border-gray-200 rounded-xl leading-5 bg-transparent placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition-all shadow-sm"
              placeholder="Search for projects, tasks, people, or files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Main Results Area */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Top Results</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-50">
                {mockResults.map((result, idx) => (
                  <li
                    key={idx}
                    className="p-4 md:p-5 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-white transition-colors shadow-sm shrink-0">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-base font-semibold text-gray-900 truncate">
                            {result.title}
                          </p>
                          {result.date && (
                            <p className="text-xs md:text-sm text-gray-400 whitespace-nowrap">{result.date}</p>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                            {result.type}
                          </span>

                          {result.project && (
                            <>
                              <span className="hidden md:inline text-gray-300">•</span>
                              <span className="truncate max-w-[120px] md:max-w-xs">{result.project}</span>
                            </>
                          )}
                          {result.role && (
                            <>
                              <span className="hidden md:inline text-gray-300">•</span>
                              <span>{result.role}</span>
                            </>
                          )}
                          {result.size && (
                            <>
                              <span className="hidden md:inline text-gray-300">•</span>
                              <span>{result.size}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-5 md:space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Recent Searches
              </h3>
              <ul className="space-y-3">
                {recentSearches.map((search, idx) => (
                  <li key={idx} className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{search}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#2f66d0] to-indigo-600 rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">Need help?</h3>
              <p className="text-blue-100 text-sm mb-5 relative z-10 leading-relaxed">
                Use advanced search operators like <span className="font-mono bg-black/20 px-1 py-0.5 rounded text-xs">project:</span> or <span className="font-mono bg-black/20 px-1 py-0.5 rounded text-xs">assignee:</span> to narrow down your results.
              </p>
              <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors relative z-10 border border-white/10">
                View Search Guide
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
