import React from "react";

function TeamInsights() {

    const Card = ({ title, children }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="font-semibold text-gray-700 mb-4 tracking-wide">
                {title}
            </h3>
            {children}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Main Content */}
            <div className="flex-1 px-6 pb-6">
                
                {/* Title */}
                <div className="py-6">
                    <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
                        Team Insights
                    </h1>
                </div>

                {/* Dashboard */}
                <div className="flex gap-6">
                    
                    {/* LEFT SECTION */}
                    <div className="flex-[3]">
                        
                        {/* Contribution Overview */}
                        <Card title="Contribution Overview">
                            
                            <div className="grid grid-cols-4 gap-3 mb-5">
                                <div className="h-20 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 shadow-inner">
                                    User
                                </div>

                                <div className="bg-blue-600 rounded-lg p-3 text-sm text-gray-600 shadow-sm">
                                    Avg. velocity 
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 shadow-sm">
                                    Total Completed
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 shadow-sm">
                                    Task Due Soon
                                </div>
                            </div>

                            <div className="flex font-medium text-sm border-b pb-2 mb-2 text-white bg-orange-600 rounded-t-md px-2 py-1">
                                <span className="flex-1">User</span>
                                <span className="flex-1">Velocity</span>
                                <span className="flex-1">Completed</span>
                                <span className="flex-1">Due</span>
                            </div>

                            {[1, 2, 3].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex text-sm py-2 border-b last:border-none hover:bg-gray-50 transition-colors duration-200 rounded px-2"
                                >
                                    <span className="flex-1 text-gray-700">User {i + 1}</span>
                                    <span className="flex-1 text-gray-600">15</span>
                                    <span className="flex-1 text-gray-600">24</span>
                                    <span className="flex-1 text-gray-600">3</span>
                                </div>
                            ))}
                        </Card>

                        {/* Sprint Activity */}
                        <Card title="Sprint Activity">
                            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-dashed">
                                Chart Placeholder
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="flex-[1.2] flex flex-col gap-6">
                        
                        <Card title="Tasks Summary">
                            <ul className="text-sm space-y-3 text-gray-600">
                                <li className="flex justify-between">
                                    <span>✔ Completed Tasks</span>
                                    <span className="font-medium text-gray-800">42</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>⏳ In Progress</span>
                                    <span className="font-medium text-gray-800">8</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>⏳ Due Soon</span>
                                    <span className="font-medium text-gray-800">5</span>
                                </li>
                            </ul>
                        </Card>

                        <Card title="Notifications">
                            <p className="text-sm text-gray-500">
                                No new alerts
                            </p>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeamInsights;