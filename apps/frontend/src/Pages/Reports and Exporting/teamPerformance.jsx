import React from 'react';
import { Download, TrendingUp, CheckCircle, Clock, Zap, Search, ChevronDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import NavyButton from "../../Components/Buttons";
import { Link } from 'react-router-dom';

const data = [
  { name: 'Kelebogile', velocity: 32 },
  { name: 'Keatlehile', velocity: 25 },
  { name: 'Tebogo', velocity: 20 },
  { name: 'Tshegofatso', velocity: 36 },
];

const TeamPerformance = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Team Performance</h2>
          <nav className="flex mt-1 text-sm text-gray-500">
            <Link to="/reports">
              <span className="text-blue-600 hover:text-blue-500 cursor-pointer">Reports Hub</span>
            </Link>
            <span className="mx-2">/</span>
            <span>Team Performance</span>
          </nav>
        </div>
        <NavyButton>
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </NavyButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatCard title="Avg Velocity" value="+28" icon={<TrendingUp />} color="blue" />
        <StatCard title="Tasks Done" value="63" subValue="+8" icon={<CheckCircle />} color="blue" />
        <StatCard title="On-time Rate" value="92%" subValue="+3%" icon={<Clock />} color="blue" />
        <StatCard title="Efficiency" value="High" icon={<Zap />} color="green" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between sm:w-32 border border-gray-300 rounded-md px-3 py-2 text-sm">
          <span>Sprint</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex items-center justify-between sm:w-32 border border-gray-300 rounded-md px-3 py-2 text-sm">
          <span>Role</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search member..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto mb-6 md:mb-8 border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 min-w-[560px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Velocity</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <MemberRow name="Kelebogile" velocity={32} completed={18} progress={3} status="High" trend="up" />
            <MemberRow name="Keatlehile" velocity={25} completed={14} progress={4} status="Medium" trend="flat" />
            <MemberRow name="Tebogo" velocity={20} completed={10} progress={6} status="Medium" trend="down" />
            <MemberRow name="Tshegofatso" velocity={36} completed={21} progress={1} status="High" trend="up" />
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Performance Trend</h3>
          <div className="h-56 md:h-64 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300 text-gray-400 text-sm">
            Line Chart Placeholder
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Velocity Distribution</h3>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="velocity" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon, color }) => (
  <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
    <div className={`absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 rounded-md bg-${color}-50 text-${color}-600`}>
      {React.cloneElement(icon, { className: "h-5 w-5 md:h-6 md:w-6" })}
    </div>
    <p className="text-xs md:text-sm font-medium text-gray-500 pr-8">{title}</p>
    <div className="mt-2 flex items-baseline flex-wrap gap-1">
      <p className={`text-xl md:text-2xl font-semibold text-${color === 'green' ? 'green-600' : 'blue-600'}`}>{value}</p>
      {subValue && (
        <span className="text-xs md:text-sm font-medium text-green-600 flex items-center">
          <ArrowUpRight className="h-3 w-3 mr-0.5" /> {subValue}
        </span>
      )}
    </div>
  </div>
);

const MemberRow = ({ name, velocity, completed, progress, status, trend }) => {
  const statusColor = status === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  return (
    <tr>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3 flex-shrink-0">
            <span className="text-xs font-bold">{name[0]}</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{name}</span>
        </div>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{velocity}</td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{completed}</td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{progress}</td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>{status}</span>
      </td>
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trend === 'up' && <ArrowUpRight className="text-green-500 h-4 w-4" />}
        {trend === 'down' && <ArrowDownRight className="text-red-500 h-4 w-4" />}
        {trend === 'flat' && <Minus className="text-gray-400 h-4 w-4" />}
      </td>
    </tr>
  );
};

export default TeamPerformance;