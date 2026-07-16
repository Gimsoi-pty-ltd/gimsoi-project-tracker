import React from 'react';
import { Link } from 'react-router-dom';
import { useSprintStore } from '../../store/sprintStore';

const SprintOverview = () => {
    const { sprints } = useSprintStore();
    
    const activeSprint = sprints.find(s => s.status === 'ACTIVE');
    
    let progressPercent = 0;
    let remainingPercent = 0;
    let progressString = "No active sprint";
    
    if (activeSprint) {
        const committed = activeSprint.pointsCommitted || 0;
        const completed = activeSprint.pointsCompleted || 0;
        if (committed > 0) {
            progressPercent = Math.round((completed / committed) * 100);
            remainingPercent = Math.max(0, 100 - progressPercent);
        } else {
            progressPercent = 0;
            remainingPercent = 100;
        }
        progressString = `${remainingPercent}% Remaining`;
    }

    return (
        <Link to="/sprint-overview" className="no-underline block h-full">
            <section className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center h-full hover:shadow-md transition-shadow">
                <h3 className="text-md text-[#1A75FF] font-bold uppercase tracking-wider mb-4 text-center">
                    Sprint Overview
                </h3>

                <div className="w-full">
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                        {activeSprint ? activeSprint.name : 'Current Sprint Progress'}
                    </p>

                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-extrabold text-gray-800">{progressPercent}%</span>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{progressString}</span>
                        </div>

                        {/* Progress Bar */}
                        <div
                            className="h-3 w-full rounded-full bg-gray-100 overflow-hidden"
                            role="progressbar"
                            aria-label="Sprint progress"
                            aria-valuenow={progressPercent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className="h-full rounded-full bg-[#FF8C00] transition-all duration-700"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </section>
        </Link>
    );
};

export default SprintOverview;