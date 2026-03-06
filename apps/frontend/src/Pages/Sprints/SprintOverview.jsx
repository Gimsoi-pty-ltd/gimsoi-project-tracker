import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';


const SprintOverview = (props) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // Accept sprint data from props, navigation state, or fallback to default
  const [sprintData, setSprintData] = useState({
    sprintName: 'Sprint Overview',
    goal: 'Goal description',
    completion: 65,
    totalTasks: 25,
    completedTasks: 20,
  });

  useEffect(() => {
    if (props.sprintData) {
      setSprintData((prev) => ({ ...prev, ...props.sprintData }));
    } else if (location.state && location.state.sprintData) {
      setSprintData((prev) => ({ ...prev, ...location.state.sprintData }));
    }
  }, [props.sprintData, location.state]);

  const completionPercentage = sprintData.completion ?? 65;

  const kanbanColumns = {
    todo: [
      { id: 1, title: 'Task card 1' },
      { id: 2, title: 'Task card 2' }
    ],
    inProgress: [
      { id: 3, title: 'Task card 3' },
      { id: 8, title: 'Task card 4' }
    ],
    review: [
      { id: 4, title: 'Task card 5' },
      { id: 5, title: 'Task card 6' }
    ],
    done: [
      { id: 6, title: 'Task card 7' },
      { id: 7, title: 'Task card 8' }
    ]
  };

  return (
    
      <div className="bg-gray-50 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-sm mb-4 p-4 md:p-6">
          <div className="flex items-center justify-between">

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700 text-center flex-1">{sprintData.sprintName}</h1>

            {/* Search Bar */}
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

        {/* Main Content Area */}
        <div className="flex gap-4 items-stretch">
          {/* Left Side - Kanban Board */}
          <div className="flex-1 flex flex-col">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Sprint Goal */}
              <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                <h2 className="text-center font-medium text-blue-900 mb-2">Sprint Goal</h2>
                <p className="text-center text-blue-900 text-sm">{sprintData.goal}</p>
              </div>

              {/* Velocity */}
              <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                <h2 className="text-center font-medium text-blue-900 mb-2">Velocity</h2>
                <p className="text-center text-blue-900 text-sm">{sprintData.completedTasks} tasks / {sprintData.totalTasks} tasks</p>
              </div>

              {/* Completion */}
              <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                <h2 className="text-center font-medium text-blue-900 mb-2">Completion</h2>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="text-right w-full">
                      <span className="text-xs font-semibold inline-block text-blue-900">
                        {completionPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-300">
                    <div style={{ width: `${completionPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban Board - Stretched to match Task Details height */}
            <div className="bg-gray-100 rounded-lg shadow-sm p-4 flex-1 flex flex-col">
              <h2 className="text-center font-medium text-blue-900 mb-4">Kanban Board</h2>

              <div className="grid grid-cols-4 gap-4 flex-1">
                {/* Kanban Columns (dynamic, with task selection) */}
                {Object.entries(kanbanColumns).map(([column, tasks]) => (
                  <div key={column} className="bg-gray-200 rounded-lg p-3 flex flex-col">
                    <h3 className="text-center font-medium text-blue-900 mb-3 pb-2 border-b border-gray-300 capitalize">
                      {column === 'inProgress' ? 'In Progress' : column.charAt(0).toUpperCase() + column.slice(1)}
                    </h3>
                    <div className="space-y-2 flex-1">
                      {tasks.map((task) => (
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

              {/* Flow Arrows */}
              <div className="flex justify-between mt-4 px-8">
                <svg className="w-6 h-6 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <svg className="w-6 h-6 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <svg className="w-6 h-6 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side - Task Details (dynamic) */}
          <div className="w-80">
            <div className="bg-gray-100 rounded-lg shadow-sm p-4 sticky top-4 h-full">
              <h2 className="text-center font-medium text-blue-900 mb-4 pb-2 border-b border-gray-300">
                Task details
              </h2>
              {selectedTask ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">Task Title</label>
                    <input
                      type="text"
                      value={selectedTask.title}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">Status</label>
                    <input
                      type="text"
                      value="In Progress"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">Assignee</label>
                    <input
                      type="text"
                      placeholder="Select assignee"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">Task Description</label>
                    <textarea
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white resize-none text-blue-900"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">Comments</label>
                    <input
                      type="text"
                      placeholder="Add comments..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">Time Logged</label>
                    <input
                      type="text"
                      placeholder="0h 0m"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-blue-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Select a task card to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
  );
};

export default SprintOverview;
