import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSprintStore } from '../../store/sprintStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from 'recharts';

const SprintVelocityPage = () => {
  const [filterText, setFilterText] = useState('');
  const { sprints, getSprints, isLoading } = useSprintStore();

  useEffect(() => {
    getSprints();
  }, []);

  // Compute velocity history (completed sprints)
  const velocityHistory = useMemo(() => {
    return sprints
      .filter(s => s.status === 'COMPLETED')
      .map(s => ({
        sprint: s.name,
        short: s.name.substring(0, 10) + '...', // short name
        committed: s.pointsCommitted || 0,
        completed: s.pointsCompleted || 0,
        notes: s.goal
      }))
      .filter(s => s.sprint.toLowerCase().includes(filterText.toLowerCase()))
      .slice(-8); // Get last 8 sprints
  }, [sprints, filterText]);

  const averageVelocity = velocityHistory.length > 0 
    ? velocityHistory.reduce((sum, s) => sum + s.completed, 0) / velocityHistory.length 
    : 0;

  // Compute upcoming sprints
  const upcomingData = useMemo(() => {
    return sprints
      .filter(s => s.status !== 'COMPLETED')
      .map((s, index) => ({
        id: s.id,
        sprint: s.name,
        owner: 'Project Manager', // Fallback, could be mapped if sprint has ownerId
        points: `${s.pointsCommitted || 0}pts`,
        notes: s.goal,
        progress: s.pointsCommitted > 0 ? ((s.pointsCompleted || 0) / s.pointsCommitted) * 100 : 0
      }));
  }, [sprints]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-arial">
      {/* Header with Back Button + Centered Blue Title */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/dashboard"
          className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="text-3xl font-bold text-blue-600 text-center flex-1">
          Sprint Velocity Details
        </h1>

        <div className="w-10" />
      </div>

      {/* Velocity History Chart */}
      <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-lg font-bold text-gray-800">Velocity History (Last 8 Sprints)</h2>

          <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Filter sprints..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 w-48"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Recharts - Grouped bars + Trend line */}
        <div className="h-96 w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-gray-500">Loading velocity data...</div>
          ) : velocityHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">No completed sprints found.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={velocityHistory}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="short"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 13, fill: '#475569' }}
                />
                <YAxis
                  label={{
                    value: 'Story Points',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#64748b', fontSize: 13 },
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = velocityHistory.find(s => s.short === label);
                      return (
                        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl text-sm min-w-[220px]">
                          <p className="font-bold mb-2 pb-1 border-b border-gray-700">
                            {data?.sprint || label}
                          </p>
                          <p className="mb-1">
                            Committed:{' '}
                            <span className="text-blue-300 font-medium">{payload[0]?.value} pts</span>
                          </p>
                          <p className="mb-2">
                            Completed:{' '}
                            <span className="text-blue-400 font-bold">{payload[1]?.value} pts</span>
                          </p>
                          {data?.notes && (
                            <p className="text-gray-300 text-xs italic mt-2">
                              {data.notes}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }} />
                <Bar
                  dataKey="committed"
                  name="Committed"
                  fill="#93c5fd"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Velocity Trend"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#16a34a', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Average velocity:{' '}
          <span className="font-bold text-gray-800">
            {averageVelocity.toFixed(1)} points
          </span>
        </div>
      </div>

      {/* Upcoming Sprints Table */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Upcoming / Active Sprints</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Sprint</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : upcomingData.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No upcoming sprints.</td></tr>
              ) : upcomingData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{row.sprint}</td>
                  <td className="px-6 py-4 text-gray-600">{row.owner}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono">{row.points}</td>
                  <td className="px-6 py-4 text-gray-500">{row.notes}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SprintVelocityPage;