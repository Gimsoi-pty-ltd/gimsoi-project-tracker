import React, { useState } from 'react';

const ProjectPhasesGantt = () =>
{
    // Data structure based on your internal tracker requirements
    const [phases, setPhases] = useState([
        {
            id: 1,
            project: 'Website Redesign',
            client: 'Acme Corp',
            assignee: 'Jane Doe',
            status: 'Active',
            progress: 67,
            color: 'bg-blue-500',
            start: 'Jan 01',
            end: 'Jan 20'
        },
        {
            id: 2,
            project: 'Mobile App',
            client: 'Gimsoi AI',
            assignee: 'Mike Will',
            status: 'Blocked',
            progress: 20,
            color: 'bg-red-500',
            start: 'Jan 05',
            end: 'Jan 15'
        }
    ]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Phases</h1>
                    <p className="text-gray-500 text-sm">Track project progress and timelines</p>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-sm">
                    + New Phase
                </button>
            </div>

            {/* Gantt Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Timeline Header */}
                <div className="grid grid-cols-12 bg-gray-100 border-bottom border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="col-span-3 p-4 border-r border-gray-200">Project & Lead</div>
                    <div className="col-span-2 p-4 text-center">Week 1</div>
                    <div className="col-span-2 p-4 text-center border-l border-gray-200">Week 2</div>
                    <div className="col-span-2 p-4 text-center border-l border-gray-200">Week 3</div>
                    <div className="col-span-2 p-4 text-center border-l border-gray-200 text-blue-600 font-bold">Today</div>
                    <div className="col-span-1 p-4 text-center border-l border-gray-200">Status</div>
                </div>

                {/* Phase Rows */}
                {phases.map((phase) => (
                    <div key={phase.id} className="grid grid-cols-12 border-b border-gray-100 hover:bg-gray-50 transition items-center">
                        {/* Project Info */}
                        <div className="col-span-3 p-4 border-r border-gray-200">
                            <h3 className="font-bold text-gray-900">{phase.project}</h3>
                            <p className="text-xs text-gray-500">{phase.assignee} • {phase.client}</p>
                        </div>

                        {/* Gantt Timeline View */}
                        <div className="col-span-8 p-4 relative h-16 flex items-center">
                            {/* Draggable Phase Bar */}
                            <div
                                className={`h-8 rounded-full ${phase.color} shadow-md flex items-center px-3 text-white text-[10px] cursor-move relative transition-all hover:scale-[1.02]`}
                                style={{ width: `${phase.progress}%`, marginLeft: '5%' }}
                            >
                                <span className="truncate font-medium">{phase.start} - {phase.end}</span>
                                {/* Progress Percentage Indicator */}
                                <div className="absolute -top-6 right-0 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded">
                                    {phase.progress}%
                                </div>
                            </div>
                        </div>

                        {/* Status Label */}
                        <div className="col-span-1 p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${phase.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {phase.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Drag & Drop Interaction Area */}
            <div className="mt-8 border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <p className="text-sm font-medium">Drag tasks from your backlog to create new phases here</p>
            </div>
        </div>
    );
};

export default ProjectPhasesGantt;