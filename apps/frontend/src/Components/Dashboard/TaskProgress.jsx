import React from 'react';
import { Link } from 'react-router-dom';

const TaskProgress = () => {
    return (
        <Link to="/tasks?tab=progress" className="block h-full no-underline">
        <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-md text-[#1A75FF] font-bold uppercase tracking-wider mb-4">
                Task Progress
            </h3>

            {/* Circular Progress SVG */}
            <div className="relative w-32 h-32">
                <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                >
                    {/* Background Ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#F1F5F9"
                        strokeWidth="10"
                    />

                    {/* Progress Ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#FF8C00"
                        strokeWidth="10"
                        strokeDasharray="263.89"
                        strokeDashoffset="131.95"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-extrabold text-gray-800">50%</span>
                </div>
            </div>
        </section>
        </Link>
    );
};

export default TaskProgress;
