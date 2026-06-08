import React, { useState, useEffect } from 'react';
import { useSprintStore } from '../../store/sprintStore';
import { useTaskStore } from '../../store/taskStore';

const SprintOverview = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const { sprints, isLoading: sprintLoading, getSprints } = useSprintStore();
  const { tasks, isLoading: taskLoading, getTasks } = useTaskStore();

  useEffect(() => {
    getSprints();
  }, [getSprints]);

  // Use the first active sprint, fallback to first sprint
  const activeSprint = sprints.find((s) => s.status === 'active') || sprints[0] || null;

  useEffect(() => {
    if (activeSprint?.id) {
      getTasks({ sprintId: activeSprint.id });
    }
  }, [activeSprint?.id, getTasks]);

  const completionPercentage = activeSprint
    ? activeSprint.completedPoints && activeSprint.totalPoints
      ? Math.round((activeSprint.completedPoints / activeSprint.totalPoints) * 100)
      : activeSprint.completion ?? 0
    : 0;

  // Group tasks into kanban columns by status
  const groupByStatus = (taskList) => ({
    todo: taskList.filter((t) => t.status === 'todo' || t.status === 'TODO'),
    inProgress: taskList.filter((t) => t.status === 'in_progress' || t.status === 'IN_PROGRESS'),
    review: taskList.filter((t) => t.status === 'review' || t.status === 'REVIEW'),
    done: taskList.filter((t) => t.status === 'done' || t.status === 'completed' || t.status === 'DONE'),
  });

  const filtered = tasks.filter((t) =>
    !searchQuery || t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const kanbanColumns = groupByStatus(filtered);

  const isLoading = sprintLoading || taskLoading;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="bg-white rounded-2xl shadow-sm mb-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700 text-center flex-1">
              {isLoading ? 'Loading...' : activeSprint ? activeSprint.name : 'No Active Sprint'}
            </h1>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 bg-white">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-48 text-blue-900"
              />
              <svg className="w-5 h-5 text-blue-900 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>

        {/* No sprint state */}
        {!isLoading && !activeSprint && (
          <div className="text-center py-20 text-gray-400">No sprints found. Create a sprint to get started.</div>
        )}

        {/* Main Content */}
        {activeSprint && (
          <div className="flex gap-4 items-stretch">
            {/* Left — Stats + Kanban */}
            <div className="flex-1 flex flex-col">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                  <h2 className="text-center font-medium text-blue-900 mb-2">Sprint Goal</h2>
                  <p className="text-center text-blue-900 text-sm">{activeSprint.goal || 'No goal set'}</p>
                </div>
                <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                  <h2 className="text-center font-medium text-blue-900 mb-2">Velocity</h2>
                  <p className="text-center text-blue-900 text-sm">
                    {activeSprint.completedPoints ?? '—'} / {activeSprint.totalPoints ?? '—'} pts
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                  <h2 className="text-center font-medium text-blue-900 mb-2">Completion</h2>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div className="text-right w-full">
                        <span className="text-xs font-semibold inline-block text-blue-900">{completionPercentage}%</span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-300">
                      <div style={{ width: `${completionPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kanban Board */}
              <div className="bg-gray-100 rounded-lg shadow-sm p-4 flex-1 flex flex-col">
                <h2 className="text-center font-medium text-blue-900 mb-4">Kanban Board</h2>
                <div className="grid grid-cols-4 gap-4 flex-1">
                  {Object.entries(kanbanColumns).map(([column, colTasks]) => (
                    <div key={column} className="bg-gray-200 rounded-lg p-3 flex flex-col">
                      <h3 className="text-center font-medium text-blue-900 mb-3 pb-2 border-b border-gray-300 capitalize">
                        {column === 'inProgress' ? 'In Progress' : column.charAt(0).toUpperCase() + column.slice(1)}
                      </h3>
                      <div className="space-y-2 flex-1">
                        {colTasks.length === 0 && (
                          <p className="text-center text-xs text-gray-400 pt-4">Empty</p>
                        )}
                        {colTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`bg-blue-900 rounded-lg p-3 shadow-sm cursor-pointer hover:bg-blue-800 transition transform hover:-translate-y-1 ${
                              selectedTask?.id === task.id ? 'ring-2 ring-orange-500' : ''
                            }`}
                          >
                            <p className="text-sm text-white text-center font-medium">{task.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Task Details */}
            <div className="w-80">
              <div className="bg-gray-100 rounded-lg shadow-sm p-4 sticky top-4 h-full">
                <h2 className="text-center font-medium text-blue-900 mb-4 pb-2 border-b border-gray-300">
                  Task details
                </h2>
                {selectedTask ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Task Title</label>
                      <input type="text" value={selectedTask.title} readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-blue-900 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Status</label>
                      <input type="text" value={selectedTask.status || ''} readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-blue-900 outline-none capitalize" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Priority</label>
                      <input type="text" value={selectedTask.priority || '—'} readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-blue-900 outline-none capitalize" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Assignee</label>
                      <input type="text"
                        value={selectedTask.assignee?.fullName || selectedTask.assignedTo?.fullName || 'Unassigned'}
                        readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-blue-900 outline-none" />
                    </div>
                    {selectedTask.description && (
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">Description</label>
                        <textarea rows="3" readOnly value={selectedTask.description}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white resize-none text-blue-900 outline-none" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>Select a task card to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintOverview;
