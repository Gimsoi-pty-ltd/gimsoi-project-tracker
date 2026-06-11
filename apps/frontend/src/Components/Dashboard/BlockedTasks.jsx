import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resourceAPI } from '../../api/api';

const BlockedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchBlockedTasks = async () => {
            setIsLoading(true);
            try {
                // Fetch tasks with status BLOCKED
                const response = await resourceAPI.get('/tasks?status=BLOCKED');
                // The API might return tasks under different keys depending on pagination
                const tasksData = response.data?.tasks || response.data?.data || [];
                
                // Map the API response to the format needed by the component
                const mappedTasks = tasksData.slice(0, 6).map(t => ({
                    id: t.id,
                    name: t.title,
                    date: t.dueDate ? new Date(t.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'No Due Date',
                    severity: t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'high' : 'medium', // fallback mapping
                    avatarUrl: t.assignee?.avatarUrl || "https://i.pravatar.cc/100?img=12" // Fallback avatar
                }));
                setTasks(mappedTasks);
            } catch (error) {
                console.error("Failed to fetch blocked tasks", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlockedTasks();
    }, []);

    return (
        <Link to="/tasks/blocked" className="block h-full no-underline">
        <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 w-full h-full hover:shadow-md transition-shadow cursor-pointer">
            {/* Header */}
            <h3 className="text-[#1A75FF] font-bold text-md mb-4 uppercase tracking-wider text-center">
                Blocked Tasks
            </h3>

            {/* List Container */}
            <ul className="divide-y divide-gray-100">
                {isLoading ? (
                    <li className="py-3 text-center text-gray-500 text-sm">Loading...</li>
                ) : tasks.length === 0 ? (
                    <li className="py-3 text-center text-gray-500 text-sm">No blocked tasks!</li>
                ) : (
                    tasks.map((task, index) => (
                        <li key={`${task.id}-${index}`} className="py-3 flex items-center gap-4 group">

                            {/* Severity Icon */}
                            <div
                                className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 transition-all shadow-sm ${task.severity === "high" ? "bg-red-500 shadow-red-100" : "bg-orange-400 shadow-orange-100"
                                    }`}
                            >
                                {task.severity === "high" ? "!" : "i"}
                            </div>

                            {/* Content Area */}
                            <div className="min-w-0 flex-1">
                                <p
                                    className={`font-bold text-[16px] truncate mb-0.5 ${task.severity === "high" ? "text-red-600" : "text-orange-600"
                                        }`}
                                    title={task.name}
                                >
                                    {task.name}
                                </p>
                                <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">
                                    {task.date}
                                </p>
                            </div>

                            {/* Assignee Avatar */}
                            <div className="flex-shrink-0">
                                <img
                                    src={task.avatarUrl}
                                    alt="Assignee"
                                    className="h-9 w-9 rounded-lg object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform"
                                />
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </section>
        </Link>
    );
};

export default BlockedTasks;