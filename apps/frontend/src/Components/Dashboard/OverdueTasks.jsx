import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resourceAPI } from '../../api/api';

const OverdueTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchOverdueTasks = async () => {
            setIsLoading(true);
            try {
                // Fetch tasks that are overdue
                const response = await resourceAPI.get('/tasks?overdue=true');
                const tasksData = response.data?.tasks || response.data?.data || [];
                
                // Map the API response
                const mappedTasks = tasksData.slice(0, 5).map(t => {
                    const daysLate = Math.floor((Date.now() - new Date(t.dueDate).getTime()) / 86400000);
                    
                    return {
                        id: t.id,
                        name: t.title,
                        date: `Due: ${new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
                        severity: daysLate > 7 ? 'critical' : 'overdue', 
                        daysLate: daysLate > 0 ? daysLate : 1
                    };
                });
                
                setTasks(mappedTasks);
            } catch (error) {
                console.error("Failed to fetch overdue tasks", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOverdueTasks();
    }, []);

    return (
        <Link to="/tasks/overdue" className="block h-full no-underline">
        <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-full hover:shadow-md transition-shadow cursor-pointer">
            {/* Header */}
            <h3 className="text-[#1A75FF] font-bold text-md mb-4 uppercase tracking-wider text-center">
                Overdue Tasks
            </h3>

            {/* List Container */}
            <ul className="divide-y divide-gray-100">
                {isLoading ? (
                    <li className="py-4 text-center text-gray-500 text-sm">Loading...</li>
                ) : tasks.length === 0 ? (
                    <li className="py-4 text-center text-gray-500 text-sm">No overdue tasks!</li>
                ) : (
                    tasks.map((task) => (
                        <li key={task.id} className="py-4 flex items-center gap-4 group">

                            {/* Status Icon */}
                            <div
                                className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 transition-all shadow-sm ${task.severity === "critical" ? "bg-red-500 shadow-red-100" : "bg-orange-400 shadow-orange-100"
                                    }`}
                            >
                                {task.severity === "critical" ? "!" : "i"}
                            </div>

                            {/* Content Area */}
                            <div className="min-w-0 flex-1">
                                <p
                                    className={`font-bold text-[16px] truncate mb-0.5 ${task.severity === "critical" ? "text-red-600" : "text-orange-600"
                                        }`}
                                    title={task.name}
                                >
                                    {task.name}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">
                                        {task.date}
                                    </p>
                                    <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                    <p className="text-[12px] text-red-500 font-extrabold uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded-md">
                                        {task.daysLate}D LATE
                                    </p>
                                </div>
                            </div>

                            {/* Action Indicator */}
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </section>
        </Link>
    );
};

export default OverdueTasks;