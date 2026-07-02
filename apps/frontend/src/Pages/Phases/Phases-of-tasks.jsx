// src/Pages/Phases/Phases-of-tasks.jsx
import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';

const statusColor = (status) => {
  switch (status) {
    case 'Active': return 'bg-blue-500';
    case 'Completed': return 'bg-green-500';
    case 'On Hold': return 'bg-orange-400';
    default: return 'bg-gray-400';
  }
};

const statusTextColor = (status) => {
  switch (status) {
    case 'Active': return 'bg-blue-100 text-blue-700';
    case 'Completed': return 'bg-green-100 text-green-700';
    case 'On Hold': return 'bg-orange-100 text-orange-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default function ProjectPhasesGantt() {
  const projects = useProjectStore((state) => state.projects ?? []);
  const activeProject = useProjectStore((state) => state.activeProject ?? null);
  const activeSprint = useProjectStore((state) => state.activeSprint ?? null);

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    project: '',
    client: '',
    sprint: '',
    start: '',
    end: '',
    goal: '',
    status: 'Active',
    progress: 0,
  });

  const [localPhases, setLocalPhases] = useState([]);

  const phaseRow = [
    ...projects.map((project) => {
      const sprints = project.sprints || [];
      const sprint =
        sprints.find((s) => s.id === project.activeSprint) ??
        sprints[sprints.length - 1];

      return {
        id: project.id,
        project: project.name,
        client:
          typeof project.client === 'object'
            ? project.client?.name
            : project.client ?? '—',
        assignee: sprint?.tasks?.[0]?.assignee ?? '—',
        status: project.status,
        progress: project.progress,
        color: statusColor(project.status),
        start: sprint?.startDate ?? '—',
        end: sprint?.endDate ?? '—',
        sprint: sprint?.name ?? '—',
        goal: sprint?.goal ?? '—',
      };
    }),
    ...localPhases,
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const newPhase = {
      id: Date.now(),
      project: form.project,
      client: form.client,
      assignee: '—',
      status: form.status,
      progress: Number(form.progress),
      color: statusColor(form.status),
      start: form.start,
      end: form.end,
      sprint: form.sprint,
      goal: form.goal,
    };

    setLocalPhases([...localPhases, newPhase]);
    setShowModal(false);

    setForm({
      project: '',
      client: '',
      sprint: '',
      start: '',
      end: '',
      goal: '',
      status: 'Active',
      progress: 0,
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Phases</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Track project progress and timelines · Active project:{' '}
            <span className="font-medium text-blue-600">{activeProject?.name ?? '—'}</span>
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#002D62] text-white px-4 py-2 rounded-lg hover:bg-[#001f44] transition shadow-sm whitespace-nowrap"
        >
          + New Phase
        </button>
      </div>

      {/* Gantt Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        {/* Timeline Header */}
        <div className="grid grid-cols-6 md:grid-cols-7 min-w-full bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <div className="col-span-2 md:col-span-2 p-3 md:p-4 border-r border-gray-200 text-left">Project & Lead</div>
          <div className="col-span-1 p-3 md:p-4 text-center border-r border-gray-200">Sprint</div>
          <div className="col-span-1 p-3 md:p-4 text-center border-r border-gray-200 hidden sm:block">Start</div>
          <div className="col-span-1 p-3 md:p-4 text-center border-r border-gray-200 hidden md:block">End</div>
          <div className="col-span-1 p-3 md:p-4 text-center border-r border-gray-200">Progress</div>
          <div className="col-span-1 p-3 md:p-4 text-center">Status</div>
        </div>

        {/* Phase Rows */}
        {phaseRow.map((phase) => (
          <div key={phase.id} className="grid grid-cols-6 md:grid-cols-7 min-w-full border-b border-gray-100 hover:bg-gray-50 transition items-center">
            {/* Project Info */}
            <div className="col-span-2 md:col-span-2 p-3 md:p-4 border-r border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${phase.color} flex-shrink-0`} />
                <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{phase.project}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">{phase.client} · {phase.assignee}</p>
              <p className="text-xs text-gray-400 mt-0.5 italic truncate">{phase.goal}</p>
            </div>

            {/* Sprint */}
            <div className="col-span-1 p-3 md:p-4 text-center text-xs md:text-sm text-gray-700 font-medium border-r border-gray-200">{phase.sprint}</div>

            {/* Start */}
            <div className="col-span-1 p-3 md:p-4 text-center text-xs md:text-sm text-gray-600 border-r border-gray-200 hidden sm:block">{phase.start}</div>

            {/* End */}
            <div className="col-span-1 p-3 md:p-4 text-center text-xs md:text-sm text-gray-600 border-r border-gray-200 hidden md:block">{phase.end}</div>

            {/* Progress Bar */}
            <div className="col-span-1 p-3 md:p-4 border-r border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${phase.color}`} style={{ width: `${phase.progress}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-7 text-right">{phase.progress}%</span>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-1 p-3 md:p-4 text-center border-l border-gray-200">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusTextColor(phase.status)}`}>
                {phase.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 md:mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <h2 className="font-semibold text-gray-800 mb-3 text-base md:text-lg">Active Sprint — {activeProject?.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Sprint</p>
            <p className="font-semibold text-gray-800 text-sm">{activeSprint?.name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Goal</p>
            <p className="font-semibold text-gray-800 text-sm">{activeSprint?.goal}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Tasks</p>
            <p className="font-semibold text-gray-800 text-sm">{activeSprint?.metrics?.completedTasks} / {activeSprint?.metrics?.totalTasks} done</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Health</p>
            <p className="font-semibold text-gray-800 text-sm">{activeSprint?.metrics?.sprintHealth}%</p>
          </div>
        </div>
      </div>  


      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        {phases.map((phase) => (
          <div key={phase.id} className="grid grid-cols-6 border-b p-3 items-center">

            <div>
              <p className="font-bold">{phase.project}</p>
              <p className="text-xs text-gray-500">{phase.client}</p>
            </div>

            <div className="text-center">{phase.sprint}</div>
            <div className="text-center">{phase.start}</div>
            <div className="text-center">{phase.end}</div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 h-2 rounded">
                <div
                  className={`h-full ${phase.color}`}
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
              <span className="text-xs">{phase.progress}%</span>
            </div>

            <div className="text-center">
              <span className={`px-2 py-1 rounded text-xs ${statusTextColor(phase.status)}`}>
                {phase.status}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">

            <h2 className="text-lg font-bold mb-4">Create New Phase</h2>

            <input
              name="project"
              placeholder="Project Name"
              className="w-full border p-2 mb-2"
              onChange={handleChange}
            />

            <input
              name="client"
              placeholder="Client"
              className="w-full border p-2 mb-2"
              onChange={handleChange}
            />

            <input
              name="sprint"
              placeholder="Sprint"
              className="w-full border p-2 mb-2"
              onChange={handleChange}
            />

            <input
              name="start"
              type="date"
              className="w-full border p-2 mb-2"
              onChange={handleChange}
            />

            <input
              name="end"
              type="date"
              className="w-full border p-2 mb-2"
              onChange={handleChange}
            />

            <input
              name="goal"
              placeholder="Goal"
              className="w-full border p-2 mb-2"
              onChange={handleChange}
            />

            <select
              name="status"
              className="w-full border p-2 mb-4"
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Completed</option>
              <option>On Hold</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-3 py-1 bg-[#002D62] text-white rounded"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
