import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';

const KanbanSummary = () => {
    const [showInfo, setShowInfo] = useState(false);
    const activeSprint = useProjectStore((state) => state.activeSprint);
    
    const getStatusData = () => {
        const kanban = activeSprint?.kanban || { todo: 0, inProgress: 0, review: 0, done: 0, blocked: 0 };
        const total = kanban.todo + kanban.inProgress + kanban.review + kanban.done + kanban.blocked;
        
        if (total === 0) return [];
        
        return [
            {
                label: 'To-do',
                count: kanban.todo,
                percent: `${Math.round((kanban.todo / total) * 100)}%`,
                color: 'bg-blue-600',
            },
            {
                label: 'In Progress',
                count: kanban.inProgress,
                percent: `${Math.round((kanban.inProgress / total) * 100)}%`,
                color: 'bg-blue-400',
            },
            {
                label: 'Review',
                count: kanban.review,
                percent: `${Math.round((kanban.review / total) * 100)}%`,
                color: 'bg-orange-400',
            },
            {
                label: 'Done',
                count: kanban.done,
                percent: `${Math.round((kanban.done / total) * 100)}%`,
                color: 'bg-green-500',
            },
            {
                label: 'Blocked',
                count: kanban.blocked,
                percent: `${Math.round((kanban.blocked / total) * 100)}%`,
                color: 'bg-red-500',
            },
        ];
    };

    const statusData = getStatusData();

    return (
        <Link 
            to="/kanban-board" 
            className="block min-h-[390px] bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-bold text-blue-400 uppercase">
                    Kanban Summary
                </h3>
                
                <Info
                    className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer z-10"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowInfo(true);
                    }}
                />
            </div>

            {statusData.length === 0 && (
                <p className="text-sm text-gray-500 py-8 text-center">
                    No tasks in this sprint yet
                </p>
            )}

            {/* Status List */}
            <div className="space-y-4">
                {statusData.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm text-slate-700 font-medium">
                                {item.label}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-800">
                                {item.count}
                            </span>
                            <span className="text-sm text-slate-500">
                                ({item.percent})
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Text */}
            <div className="mt-6 text-sm text-slate-600 leading-relaxed">
                <p>Snapshot of tasks by status.</p>
                <p>Click anywhere to open Kanban board.</p>
            </div>

            {/* Hover Indicator */}
            <div className="mt-6 flex items-center justify-end text-sky-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-200">
                Open Full Kanban Board →
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setShowInfo(false)}
                >
                    <div
                        className="bg-white w-[90%] max-w-md rounded-2xl p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Kanban Summary
                            </h2>
                            <button
                                onClick={() => setShowInfo(false)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT SHOWS</p>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-gray-700">
                                    Displays the number and percentage of tasks in each workflow stage.
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-2">HOW PERCENTAGES ARE CALCULATED</p>
                                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-gray-700">
                                    (Tasks in Status ÷ Total Tasks) × 100
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT MEANS</p>
                                <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                                    Helps monitor sprint progress and identify bottlenecks. High numbers in "Blocked" or "Review" may indicate delays.
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-2">CURRENT STATUS BREAKDOWN</p>
                                <div className="bg-slate-50 border rounded-xl p-3 text-sm text-gray-700 space-y-2">
                                    {statusData.map((item) => (
                                        <div key={item.label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                                <span>{item.label}</span>
                                            </div>
                                            <span>{item.count} ({item.percent})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Link>
    );
};

export default KanbanSummary;