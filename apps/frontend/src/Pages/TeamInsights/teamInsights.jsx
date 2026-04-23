import React from "react";
import { Users, Activity, CheckCircle, Clock, Bell, Users2Icon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function TeamInsights() {
    const Card = ({ title, children }) => (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all duration-300">
            <h3 className="font-semibold text-gray-800 mb-5 text-lg tracking-tight flex items-center gap-2">
                {title}
            </h3>
            {children}
        </div>
    );

    const StatBox = ({ icon, label, value, bg }) => (
        <div className={`${bg} rounded-xl p-4 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform duration-200`}> 
            <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{label}</span>
                {icon}
            </div>
            <div className="text-xl font-semibold text-gray-800 mt-3">
                {value}
            </div>
        </div>
    );

    const sprintData = [
    { day: "Mon", tasks: 12 },
    { day: "Tue", tasks: 18 },
    { day: "Wed", tasks: 14 },
    { day: "Thu", tasks: 22 },
    { day: "Fri", tasks: 16 },
    { day: "Sat", tasks: 10 },
    { day: "Sun", tasks: 8 }
];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            <div className="flex-1 px-8 pb-8">
                {/* Title Section */}
                <div className="py-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                            Team Insights
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Performance overview of your team
                        </p>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Section */}
                    <div className="xl:col-span-2 space-y-6">
                        <Card title="Contribution Overview">
                            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <StatBox
                                    label="Team Members"
                                    value="12"
                                    bg="bg-blue-50"
                                    icon={<Users size={18} className="text-blue-600" />}
                                />

                                <StatBox
                                    label="Average Velocity"
                                    value="15"
                                    bg="bg-purple-50"
                                    icon={<Activity size={18} className="text-purple-600" />}
                                />

                                <StatBox
                                    label="Completed Tasks"
                                    value="24"
                                    bg="bg-green-50"
                                    icon={<CheckCircle size={18} className="text-green-600" />}
                                />

                                <StatBox
                                    label="Due Soon"
                                    value="3"
                                    bg="bg-orange-50"
                                    icon={<Clock size={18} className="text-orange-600" />}
                                />
                            </div>

                            <div className="rounded-xl overflow-hidden border border-gray-200">
                                <div className="flex font-medium text-xs uppercase tracking-wider bg-orange-500 text-white px-4 py-3">
                                    <span className="flex-1">User</span>
                                    <span className="flex-1">Velocity</span>
                                    <span className="flex-1">Completed</span>
                                    <span className="flex-1">Due</span>
                                </div>

                                {[1, 2, 3].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex text-sm py-3 px-4 border-b last:border-none hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <span className="flex-1 text-gray-700 flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                                                U{i + 1}
                                            </div>
                                            User {i + 1}
                                        </span>
                                        <span className="flex-1 text-gray-600">15</span>
                                        <span className="flex-1 text-gray-600">24</span>
                                        <span className="flex-1 text-gray-600">3</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                       <Card title="Sprint Activity">
                            <div className="h-64 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-dashed text-gray-400">
                                <div className="w-full h-full p-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sprintData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                            <XAxis dataKey="day" fontSize={12} axisLine={false} tickLine={false} />
                                            <YAxis fontSize={12} axisLine={false} tickLine={false} />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="tasks"
                                                strokeWidth={2}
                                                dot={{ r: 3 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Section */}
                    <div className="space-y-6">
                        <Card title="Tasks Summary">
                            <ul className="text-sm space-y-4 text-gray-600">
                                <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
                                    <span className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-600" />
                                        Completed Tasks
                                    </span>
                                    <span className="font-semibold text-gray-800">42</span>
                                </li>

                                <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
                                    <span className="flex items-center gap-2">
                                        <Activity size={16} className="text-blue-600" />
                                        In Progress
                                    </span>
                                    <span className="font-semibold text-gray-800">8</span>
                                </li>

                                <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
                                    <span className="flex items-center gap-2">
                                        <Clock size={16} className="text-orange-600" />
                                        Due Soon
                                    </span>
                                    <span className="font-semibold text-gray-800">5</span>
                                </li>
                            </ul>
                        </Card>

                        <Card title="Notifications">
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                                <Bell size={28} className="mb-2 text-gray-300" />
                                <p>No new alerts</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeamInsights;
