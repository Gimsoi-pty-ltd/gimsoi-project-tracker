import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavyButton from '../../Components/Buttons';
import EmptyState from '../../Components/EmptyState';
import { Calendar, HeartPulse, AlertCircle, Users, Check, Loader2, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useProjectStore } from '../../store/projectStore';
import { usePhaseStore } from '../../store/phaseStore';

const STATUS_COLORS = {
  DONE: '#10b981',
  IN_PROGRESS: '#3b82f6',
  TODO: '#94a3b8',
  BLOCKED: '#ef4444',
  CANCELLED: '#f59e0b',
};
const STATUS_LABEL = { DONE: 'Done', IN_PROGRESS: 'In Progress', TODO: 'To Do', BLOCKED: 'Blocked', CANCELLED: 'Cancelled' };

const PHASE_ICON = { COMPLETED: Check, ACTIVE: Loader2, DRAFT: Calendar };
const PHASE_COLOR = { COMPLETED: 'bg-green-500', ACTIVE: 'bg-blue-500', DRAFT: 'bg-gray-400' };

const ProjectReport = () => {
  const { projects, currentProject, projectProgress, fetchProjects, setCurrentProject, getProjectProgress } = useProjectStore();
  const { phases, fetchPhases } = usePhaseStore();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!projects.length) fetchProjects();
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    if (!currentProject && projects.length) setCurrentProject(projects[0]);
  }, [currentProject, projects, setCurrentProject]);

  useEffect(() => {
    if (currentProject?.id) {
      getProjectProgress(currentProject.id);
      fetchPhases(currentProject.id);
    }
  }, [currentProject?.id, getProjectProgress, fetchPhases]);

  const prog = projectProgress || {};
  const taskData = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED']
    .map((status) => ({ name: STATUS_LABEL[status], status, value: prog[status] || 0 }))
    .filter((d) => d.value > 0);

  const handleExport = async () => {
    if (!currentProject) return;
    setExporting(true);
    try {
      const createRes = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: `${currentProject.name} — Project Report ${new Date().toISOString().slice(0, 10)}`,
          type: 'PROJECT',
          projectId: currentProject.id,
        }),
      });
      const createData = await createRes.json();
      const reportId = createData?.data?.id || createData?.id;
      if (!reportId) throw new Error('No report id returned');
      const pdfRes = await fetch(`/api/reports/${reportId}/pdf`, { credentials: 'include' });
      const arrayBuffer = await pdfRes.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-report-${currentProject.name.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export project report', err);
    } finally {
      setExporting(false);
    }
  };

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
        <div className="flex items-center gap-2">
          <select
            value={currentProject?.id || ''}
            onChange={(e) => {
              const proj = projects.find((p) => p.id === e.target.value);
              if (proj) setCurrentProject(proj);
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <NavyButton onClick={handleExport} disabled={!currentProject || exporting}>
            <Download className="mr-2 h-4 w-4" /> {exporting ? 'Preparing…' : 'Download PDF'}
          </NavyButton>
        </div>
      </div>

      {!currentProject ? (
        <EmptyState title="No project selected" message="Create a project to see its report." />
      ) : (
        <>
          {/* Stats Grid — real numbers from the project's task summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <ProjectStatCard title="Completion" value={`${prog.percentComplete ?? 0}%`} icon={<Check />} color="green" />
            <ProjectStatCard title="Health Score" value={`${prog.healthScore ?? 0}%`} icon={<HeartPulse />} color="blue" />
            <ProjectStatCard title="Blocked Tasks" value={prog.blockedCount ?? 0} icon={<AlertCircle />} color="red" />
            <ProjectStatCard title="Overdue Tasks" value={prog.overdueCount ?? 0} icon={<Users />} color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

            {/* Pie Chart — real task status breakdown */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1">
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Task Status Distribution</h3>
              {taskData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-16">No tasks yet on this project.</p>
              ) : (
                <div className="h-56 md:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={taskData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {taskData.map((entry) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Milestones — real phases */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Project Phases</h3>
              {phases.length === 0 ? (
                <p className="text-sm text-gray-400">No phases created for this project yet. Add them from the Phases page.</p>
              ) : (
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {phases.map((phase, idx) => {
                      const Icon = PHASE_ICON[phase.status] || Calendar;
                      return (
                        <TimelineItem
                          key={phase.id}
                          icon={<Icon className={`h-5 w-5 text-white ${phase.status === 'ACTIVE' ? 'animate-spin' : ''}`} />}
                          color={PHASE_COLOR[phase.status] || 'bg-gray-400'}
                          title={phase.name}
                          subtitle={phase.status === 'COMPLETED' ? 'Completed' : phase.status === 'ACTIVE' ? 'In Progress' : 'Not started'}
                          time={phase.endDate ? new Date(phase.endDate).toLocaleDateString() : '—'}
                          isLast={idx === phases.length - 1}
                        />
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
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
