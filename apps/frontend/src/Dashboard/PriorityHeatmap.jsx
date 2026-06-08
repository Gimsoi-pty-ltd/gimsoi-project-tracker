import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';


const PriorityHeatmap = () => {
    const [showInfo, setShowInfo] = useState(false);

    const COLOR_MAP = {
        critical: ['bg-blue-600','bg-blue-400','bg-orange-400','bg-green-500','bg-red-500'],
        high:     ['bg-blue-600','bg-blue-400','bg-orange-400','bg-green-500','bg-red-500'],
        medium:   ['bg-blue-600','bg-blue-400','bg-orange-400','bg-green-500','bg-red-500'],
        low:      ['bg-blue-600','bg-blue-400','bg-orange-400','bg-green-500','bg-red-500'],
    };

   
    const heatmap = useProjectStore((state) => state.dashboardData.charts.heatmap);

     const heatmapData = heatmap.map((row) => ({
    priority: row.priority.charAt(0).toUpperCase() + row.priority.slice(1),
    values: Array(5).fill(row.count),
    colors: COLOR_MAP[row.priority] ?? Array(5).fill('bg-slate-200'),
}));

    const columns = ['To-do', 'In Progress', 'Review', 'Done', 'Blocked'];

    return (
        <div className="min-h-[390px] bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            
            
                
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-blue-400 uppercase">
                        Priority Heatmap
                    </h3>

                    {/* Info icon here */}
                 <button
    onClick={(e) => {
        e.stopPropagation();
        setShowInfo(true);
    }}
    className="cursor-pointer"
>
    <Info className="w-4 h-4 text-slate-400 hover:text-slate-600" />
</button>
                </div>

                <p className="text-xs text-slate-500 mb-5">
                    Used to identify bottlenecks across priority levels
                </p>

                {/* Column Labels */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                    <div></div>

                    {columns.map((column) => (
                        <div
                            key={column}
                            className="text-xs font-medium text-slate-600 text-center"
                        >
                            {column}
                        </div>
                    ))}
                </div>

                {/* Heatmap Rows */}
                <div className="space-y-2">
                    {heatmapData.map((row) => (
                        <div
                            key={row.priority}
                            className="grid grid-cols-6 gap-2 items-center"
                        >
                            {/* Priority Label */}
                            <div className="text-xs font-medium text-slate-800">
                                {row.priority}
                            </div>

                            {/* Values */}
                            {row.values.map((value, index) => (
                                <div
                                    key={index}
                                    className={`
                                        h-10 rounded-lg flex items-center justify-center
                                        text-sm font-bold text-slate-900
                                        ${row.colors[index]}
                                    `}
                                >
                                    {value}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-6 text-xs text-slate-500 leading-relaxed">
                    <span className="font-semibold">
                        Higher numbers in "In Progress" or "Review"
                    </span>{' '}
                    may indicate bottlenecks.{' '}
                    <span className="text-red-500 font-semibold">
                        Red (Blocked)
                    </span>{' '}
                    requires immediate attention.
                </div>
             {showInfo && (
    <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={() => setShowInfo(false)}
    >
        <div
            className="bg-white w-[90%] max-w-md rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
        >

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    Priority Heatmap
                </h2>

                <button
                    onClick={() => setShowInfo(false)}
                    className="text-gray-400 hover:text-red-500"
                >
                    ✕
                </button>
            </div>

            {/* CONTENT */}
            <div className="space-y-4">

                {/* WHAT IT IS */}
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">
                        WHAT THIS SHOWS
                    </p>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-gray-700">
                        This heatmap shows how tasks are distributed across
                        priorities and workflow stages.
                    </div>
                </div>

                {/* HOW TO READ */}
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">
                        HOW TO READ IT
                    </p>

                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                        Higher numbers in "In Progress", "Review", or
                        "Blocked" indicate potential bottlenecks in the sprint.
                    </div>
                </div>

                {/* COLORS */}
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">
                        COLOR MEANING
                    </p>

                    <div className="bg-gray-50 border rounded-xl p-3 text-sm space-y-2">

                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-600 rounded"></div>
                            <span>To-do</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-400 rounded"></div>
                            <span>In Progress</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-400 rounded"></div>
                            <span>Review</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Done</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>Blocked</span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </div>
)}
           
        </div>
    );
};

export default PriorityHeatmap;
