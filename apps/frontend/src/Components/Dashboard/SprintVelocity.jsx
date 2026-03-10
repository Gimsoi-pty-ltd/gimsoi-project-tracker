import React from "react";
import { Link } from "react-router-dom"; // Import Link

const SprintVelocityCard = () => {
    const velocity = 32;
    const goal = 40;
    const progress = (velocity / goal) * 100;

    return (
        // Wrap the whole card in a Link to the detail page
        <Link to="/sprint-velocity" className="block h-full">
            <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center h-full hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                <h3 className="text-md font-bold text-blue-500 mb-4 uppercase tracking-wider text-center">
                    Sprint Velocity
                </h3>

                <div className="relative w-48 h-28 mb-2"> 
                    {/* Adjusted width slightly for better fit */}
                    <svg viewBox="0 0 36 21" className="w-full h-full">
                        {/* Background Arc */}
                        <path
                            d="M4 19 A14 14 0 0 1 32 19"
                            fill="none"
                            stroke="#F1F5F9"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />

                        {/* Progress Arc */}
                        <path
                            d="M4 19 A14 14 0 0 1 32 19"
                            fill="none"
                            stroke="#1A75FF"
                            strokeWidth="4"
                            strokeDasharray={`${progress * 0.44}, 100`}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                        />
                    </svg>
                    <div className="absolute bottom-1 inset-x-0 flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold text-gray-800 leading-none">
                                {velocity}
                            </span>
                            <span className="text-lg font-bold text-gray-400">pts</span>
                        </div>
                    </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-2">Click for details</p>
            </div>
        </Link>
    );
};

export default SprintVelocityCard;