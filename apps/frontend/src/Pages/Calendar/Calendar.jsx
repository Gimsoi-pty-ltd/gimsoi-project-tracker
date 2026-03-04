import React from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = () => {
    return (
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
                        January 2026
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Sprint & Milestone Overview
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition">
                        All Projects
                    </button>

                    <button className="px-5 py-2.5 rounded-md bg-[#002D62] hover:bg-[#001f44] text-white text-sm font-medium transition-all duration-200">
                        Today
                    </button>
                    <button className="px-5 py-2.5 rounded-md bg-[#002D62] hover:bg-[#001f44] text-white text-sm font-medium transition-all duration-200">
                        ←
                    </button>
                    <button className="px-5 py-2.5 rounded-md bg-[#002D62] hover:bg-[#001f44] text-white text-sm font-medium transition-all duration-200">
                        →
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    {days.map((day) => (
                        <div
                            key={day}
                            className="py-3 text-center text-xs font-semibold text-gray-500 tracking-wide uppercase"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    <div className="h-28 border-b border-r border-gray-100"></div>

                    {[...Array(31)].map((_, i) => {
                        const date = i + 1;
                        return (
                            <div
                                key={date}
                                className="h-28 border-b border-r border-gray-100 p-3 relative hover:bg-gray-50 transition"
                            >
                                <div className="text-sm font-medium text-gray-700">
                                    {date}
                                </div>

                                {date === 3 && (
                                    <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-md p-2">
                                        <p className="font-semibold">Sprint 4</p>
                                        <p className="text-blue-600">Website Revision</p>
                                    </div>
                                )}

                                {date === 18 && (
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-gray-600">
                                        <span className="w-2 h-2 bg-gray-800 rounded-full"></span>
                                        Design Approved
                                    </div>
                                )}

                                {date === 22 && (
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-gray-600">
                                        <span className="w-2 h-2 bg-gray-800 rounded-full"></span>
                                        QA Start
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            </div>
        </div>
    );
};

export default Calendar;
