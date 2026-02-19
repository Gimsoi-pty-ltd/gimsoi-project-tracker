import React from "react";

const PhaseStatus = () => {
    return (
        <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm h-full flex flex-col justify-center hover:shadow-md transition-shadow">
            <h3 className="text-center text-md font-bold text-blue-500 mb-4 uppercase tracking-wider">
                Phase Status
            </h3>

            <div className="flex items-center gap-5">
                {/* Status Icon */}
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFD700] text-[#1A1A1A] text-lg font-bold shadow-sm">
                    ✓
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-xl text-gray-800">
                            Planning
                        </span>
                        <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
                            On Track
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#FF8C00]"
                            style={{ width: "70%" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhaseStatus;
