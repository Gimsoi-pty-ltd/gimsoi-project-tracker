import React, { useEffect, useState } from "react";
import { useProjectStore } from "../../store/projectStore";
import { resourceAPI } from "../../api/api";

const PhaseStatus = () => {
    const { currentProject } = useProjectStore();
    const [activePhase, setActivePhase] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPhaseStatus = async () => {
            if (!currentProject?.id) return;
            
            setIsLoading(true);
            try {
                // Assuming we can fetch phases for the project
                const response = await resourceAPI.get(`/phases?projectId=${currentProject.id}`);
                const phases = response.data?.phases || response.data?.data || [];
                
                // Find the first active phase
                const current = phases.find(p => p.status === 'ACTIVE') || phases[0];
                setActivePhase(current);
            } catch (error) {
                console.error("Failed to fetch phases", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPhaseStatus();
    }, [currentProject?.id]);

    if (!currentProject) {
        return (
            <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm h-full flex flex-col justify-center text-center">
                <p className="text-gray-500">Select a project</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm h-full flex flex-col justify-center text-center">
                <p className="text-gray-500">Loading phase...</p>
            </div>
        );
    }

    if (!activePhase) {
        return (
            <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm h-full flex flex-col justify-center text-center">
                <p className="text-gray-500">No active phase</p>
            </div>
        );
    }

    // Calculate progress (fallback to 0 if task counts are missing)
    const totalTasks = activePhase.taskCounts?.total || 1; // avoid div by 0
    const completedTasks = activePhase.taskCounts?.DONE || 0;
    const progressPercent = Math.round((completedTasks / totalTasks) * 100) || 0;
    const isCompleted = progressPercent === 100;

    return (
        <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm h-full flex flex-col justify-center hover:shadow-md transition-shadow">
            <h3 className="text-center text-md font-bold text-blue-500 mb-4 uppercase tracking-wider">
                Phase Status
            </h3>

            <div className="flex items-center gap-5">
                {/* Status Icon */}
                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold shadow-sm ${isCompleted ? 'bg-green-400 text-white' : 'bg-[#FFD700] text-[#1A1A1A]'}`}>
                    {isCompleted ? '✓' : '⧖'}
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-xl text-gray-800 truncate" title={activePhase.name}>
                            {activePhase.name}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${isCompleted ? 'text-green-600 bg-green-50' : 'text-orange-500 bg-orange-50'}`}>
                            {activePhase.status === 'ACTIVE' ? 'On Track' : activePhase.status}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex items-center">
                        <div
                            className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-[#FF8C00]'}`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhaseStatus;
