import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, CheckCircle, Clock, Zap, Search, ChevronDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { resourceAPI } from '../../api/api';
import NavyButton from '../../Components/Buttons';

const TeamPerformance = () => {
  const [teamData, setTeamData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stats, setStats] = useState({
    avgVelocity: 0,
    tasksDone: 0,
    onTimeRate: 0,
    efficiency: 'N/A'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await resourceAPI.get('/analytics/team');
        const users = res.data.data || [];
        setTeamData(users);
        setFilteredData(users);

        let totalCompleted = 0;
        let sumCompletionRate = 0;
        users.forEach(u => {
            totalCompleted += u.metrics?.completedTasks || 0;
            sumCompletionRate += u.metrics?.completionRate || 0;
        });

        const avgVelocity = users.length > 0 ? Math.round(sumCompletionRate / users.length) : 0;
        let efficiency = 'Low';
        if (avgVelocity >= 80) efficiency = 'High';
        else if (avgVelocity >= 50) efficiency = 'Medium';

        setStats({
          avgVelocity,
          tasksDone: totalCompleted,
          onTimeRate: avgVelocity, // Approximated
          efficiency
        });
      } catch (err) {
        console.error("Error fetching team analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    let result = teamData;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => u.fullName?.toLowerCase().includes(term));
    }
    
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }
    
    setFilteredData(result);
  }, [searchTerm, roleFilter, teamData]);

  const chartData = filteredData.map(u => ({
    name: u.fullName?.split(' ')[0] || 'User',
    velocity: u.metrics?.completionRate || 0,
    completed: u.metrics?.completedTasks || 0
  }));

  const getEfficiencyStatus = (rate) => {
    if (rate >= 80) return 'High';
    if (rate >= 50) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Performance</h2>
          <nav className="flex mt-1 text-sm text-gray-500">
            <Link to="/reports" >
            <span className="text-blue-600 hover:text-blue-500 cursor-pointer">Reports Hub</span>
            </Link>
            <span className="mx-2">/</span>
            <span>Team Performance</span>
          </nav>
        </div>
        <NavyButton 
          onClick={() => window.print()}
          className="mt-4 md:mt-0 !min-w-0 !px-6 !py-2 text-sm" 
        >
        <Download className="mr-2 h-4 w-4" />
          Download PDF
        </NavyButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Avg Velocity" value={`${stats.avgVelocity}%`} icon={<TrendingUp />} color="blue" />
        <StatCard title="Tasks Done" value={stats.tasksDone} icon={<CheckCircle />} color="blue" />
        <StatCard title="On-time Rate" value={`${stats.onTimeRate}%`} icon={<Clock />} color="blue" />
        <StatCard title="Efficiency" value={stats.efficiency} icon={<Zap />} color="green" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-32">
          <select 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:bg-gray-100 disabled:text-gray-400"
            disabled
            title="Sprint filtering requires backend support"
          >
            <option>All Sprints</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
        <div className="relative w-full sm:w-32">
          <select 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="PM">PM</option>
            <option value="INTERN">Intern</option>
            <option value="CLIENT">Client</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search member..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
              </tr>
            ) : filteredData.map(u => (
              <MemberRow 
                key={u.id}
                name={u.fullName} 
                velocity={`${u.metrics?.completionRate || 0}%`} 
                completed={u.metrics?.completedTasks || 0} 
                progress={u.metrics?.openTasks || 0} 
                status={getEfficiencyStatus(u.metrics?.completionRate || 0)} 
                trend="flat" 
                avatarUrl={u.avatarUrl}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Velocity Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="velocity" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, subValue, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
    <div className={`absolute top-4 right-4 p-2 rounded-md bg-${color}-50 text-${color}-600`}>
      {React.cloneElement(icon, { className: "h-6 w-6" })}
    </div>
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <div className="mt-2 flex items-baseline">
      <p className={`text-2xl font-semibold text-${color === 'green' ? 'green-600' : 'blue-600'}`}>{value}</p>
      {subValue && <span className="ml-2 text-sm font-medium text-green-600 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1"/> {subValue}</span>}
    </div>
  </div>
);

const MemberRow = ({ name, velocity, completed, progress, status, trend, avatarUrl }) => {
  const statusColor = status === 'High' ? 'bg-green-100 text-green-800' : status === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800';
  
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full object-cover mr-3" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#001f44] flex items-center justify-center text-white mr-3">
              <span className="text-xs font-bold">{name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          )}
          <span className="text-sm font-medium text-gray-900">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{velocity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{completed}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{progress}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>{status}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trend === 'up' && <ArrowUpRight className="text-green-500 h-4 w-4" />}
        {trend === 'down' && <ArrowDownRight className="text-red-500 h-4 w-4" />}
        {trend === 'flat' && <Minus className="text-gray-400 h-4 w-4" />}
      </td>
    </tr>
  );
};

export default TeamPerformance;