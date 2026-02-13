import React from 'react';

const SprintOverview = () => {
    return (
        <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center h-full hover:shadow-md transition-shadow">
            <h3 className="text-md text-[#1A75FF] font-bold uppercase tracking-wider mb-4 text-center">
                Sprint Overview
            </h3>

            <div className="w-full">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Sprint Progress</p>

                <div className="mt-3">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-extrabold text-gray-800">50%</span>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">34% Remaining</span>
                    </div>

                    {/* Progress Bar */}
                    <div
                        className="h-3 w-full rounded-full bg-gray-100 overflow-hidden"
                        role="progressbar"
                        aria-label="Sprint progress"
                        aria-valuenow={67}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full rounded-full bg-[#FF8C00]"
                            style={{ width: '67%' }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SprintOverview;
