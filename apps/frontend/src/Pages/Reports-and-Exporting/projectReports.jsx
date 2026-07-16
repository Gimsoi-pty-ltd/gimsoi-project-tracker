import React from 'react';
import { Link } from 'react-router-dom';
import NavyButton from '../../Components/Buttons';
import { Calendar, DollarSignIcon, AlertCircle, Users, Check, Code, Loader2, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const taskData = [
  { name: 'Design', value: 30 },
  { name: 'Development', value: 45 },
  { name: 'Testing', value: 15 },
  { name: 'Documentation', value: 10 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const ProjectReport = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Project Report</h2>
          <nav className="flex mt-1 text-sm text-gray-500">
            <Link to="/reports">
              <span className="text-slate-900 hover:text-slate-600 cursor-pointer">Reports Hub</span>
            </Link>
            <span className="mx-2">/</span>
            <span>Project Report</span>
          </nav>
        </div>
        <NavyButton>
          <Filter className="mr-2 h-4 w-4" /> Filter
        </NavyButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <ProjectStatCard title="Timeline" value="On Track" icon={<Calendar />} color="blue" />
        <ProjectStatCard title="Budget Used" value="65%" icon={<DollarSignIcon />} color="green" />
        <ProjectStatCard title="Risks" value="2 Low" icon={<AlertCircle />} color="red" />
        <ProjectStatCard title="Team Load" value="85%" icon={<Users />} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Pie Chart */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Task Distribution</h3>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Project Milestones</h3>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              <TimelineItem icon={<Check className="h-5 w-5 text-white" />} color="bg-green-500" title="Requirement Gathering" subtitle="Completed by Kelebogile" time="2 days ago" />
              <TimelineItem icon={<Code className="h-5 w-5 text-white" />} color="bg-blue-500" title="Backend API Development" subtitle="Started" time="5 days ago" />
              <TimelineItem icon={<Loader2 className="h-5 w-5 text-white animate-spin" />} color="bg-gray-400" title="UI/UX Design Review" subtitle="In Progress" time="Today" isLast />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectStatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white overflow-hidden shadow-sm rounded-lg p-4 md:p-5 border-l-4 border-${color}-500`}>
    <div className="flex items-center">
      <div className={`flex-shrink-0 bg-${color}-100 rounded-md p-2 md:p-3`}>
        {React.cloneElement(icon, { className: `h-5 w-5 md:h-6 md:w-6 text-${color}-600` })}
      </div>
      <div className="ml-3 md:ml-5 w-0 flex-1">
        <dl>
          <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd><div className="text-base md:text-lg font-medium text-gray-900">{value}</div></dd>
        </dl>
      </div>
    </div>
  </div>
);

const TimelineItem = ({ icon, color, title, subtitle, time, isLast }) => (
  <li>
    <div className={`relative ${!isLast ? 'pb-8' : 'pb-0'}`}>
      {!isLast && <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>}
      <div className="relative flex space-x-3">
        <div>
          <span className={`h-8 w-8 rounded-full ${color} flex items-center justify-center ring-8 ring-white`}>
            {icon}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5 flex-wrap gap-y-1">
          <div>
            <p className="text-sm text-gray-500">{title} <span className="font-medium text-gray-900">{subtitle}</span></p>
          </div>
          <div className="whitespace-nowrap text-sm text-gray-500">
            <time>{time}</time>
          </div>
        </div>
      </div>
    </div>
  </li>
);

export default ProjectReport;