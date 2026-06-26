import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, Filter, Clock, FileText, User, Folder, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProjectStore } from "../../store/projectStore";

export default function SearchPage() {
  const { searchableItems } = useProjectStore((state) => state);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [recentSearches, setRecentSearches] = useState([
    'AI Agent Platform', 'Implement authentication', 'Phumudzo Netshia'
  ]);

  const filters = ['All', 'project', 'task', 'team-member', 'document', 'client'];

  // Search and filter results
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    let results = searchableItems.filter(item => {
      const matchesQuery = 
        item.title.toLowerCase().includes(query) ||
        item.keywords?.some(k => k.toLowerCase().includes(query));
      
      const matchesFilter = activeFilter === 'All' || item.type === activeFilter;
      
      return matchesQuery && matchesFilter;
    });

    return results.slice(0, 15); // Limit to 15 results
  }, [searchQuery, activeFilter, searchableItems]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleAddRecent = () => {
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'project':
        return <Folder className="w-5 h-5 text-purple-500" />;
      case 'task':
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case 'team-member':
        return <User className="w-5 h-5 text-green-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-orange-500" />;
      case 'client':
        return <User className="w-5 h-5 text-cyan-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'project': 'Project',
      'task': 'Task',
      'team-member': 'Team Member',
      'document': 'Document',
      'client': 'Client'
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans p-4 md:p-8">
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
              className="block w-full pl-12 pr-12 py-3.5 md:py-4 bg-gray-50 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition-all shadow-sm"
              placeholder="Search for projects, tasks, people, documents, or clients..."
              value={searchQuery}
              onChange={handleSearch}
              onBlur={handleAddRecent}
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
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    activeFilter === filter
                      ? 'bg-[#002D62] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {filter === 'All' ? 'All' : getTypeLabel(filter)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Main Results Area */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {searchQuery ? `Results for "${searchQuery}"` : 'Enter a search term'}
            </h2>
            
            {filteredResults.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-50">
                  {filteredResults.map((result, idx) => (
                    <li
                      key={idx}
                      className="p-4 md:p-5 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-white transition-colors shadow-sm shrink-0">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-base font-semibold text-gray-900 truncate">
                              {result.title}
                            </p>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                              {getTypeLabel(result.type)}
                            </span>

                            {result.description && (
                              <>
                                <span className="hidden md:inline text-gray-300">•</span>
                                <span className="truncate max-w-[300px]">{result.description}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : searchQuery ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
                <p className="text-gray-400 text-sm mt-2">Try searching for a different term</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Start typing to search</p>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-5 md:space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Recent Searches
              </h3>
              <ul className="space-y-3">
                {recentSearches.map((search, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                    onClick={() => setSearchQuery(search)}
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{search}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#2f66d0] to-indigo-600 rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">Search Tips</h3>
              <p className="text-blue-100 text-sm mb-5 relative z-10 leading-relaxed">
                Search across projects, tasks, team members, documents, and clients. Results are shown in real-time as you type.
              </p>
              <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors relative z-10 border border-white/10">
                View Examples
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
