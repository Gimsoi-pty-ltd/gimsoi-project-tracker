import React from 'react';

const BlockedTasks = () => {
    // Task data array
    const tasks = [
        {
            id: "b1",
            name: "Waiting on Data from Backend",
            date: "Thu, Dec 23",
            severity: "high",
            avatarUrl: "https://i.pravatar.cc/100?img=5",
        },
        {
            id: "b1",
            name: "Waiting on Data from Backend",
            date: "Thu, Dec 23",
            severity: "low",
            avatarUrl: "https://i.pravatar.cc/100?img=14",
        },
        {
            id: "b1",
            name: "Waiting on Data from Backend",
            date: "Thu, Dec 23",
            severity: "high",
            avatarUrl: "https://i.pravatar.cc/100?img=1",
        },
        {
            id: "b2",
            name: "Security Review",
            date: "Mon, Dec 15",
            severity: "medium",
            avatarUrl: "https://i.pravatar.cc/100?img=9",
        },
        {
            id: "b3",
            name: "Priority Conflict",
            date: "Wed, Dec 15",
            severity: "medium",
            avatarUrl: "https://i.pravatar.cc/100?img=24",
        },
        {
            id: "b4",
            name: "Priority Conflict",
            date: "Thur, Oct 23",
            severity: "high",
            avatarUrl: "https://i.pravatar.cc/100?img=10",
        },
    ];

    return (
        <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 w-full h-full hover:shadow-md transition-shadow">
            {/* Header */}
            <h3 className="text-[#1A75FF] font-bold text-md mb-4 uppercase tracking-wider text-center">
                Blocked Tasks
            </h3>

            {/* List Container */}
            <ul className="divide-y divide-gray-100">
                {tasks.map((task, index) => (
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
                ))}
            </ul>
        </section>
    );
};

export default BlockedTasks;