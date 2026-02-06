import React from 'react';

const ActiveProjects = () => {
    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center h-full hover:shadow-md transition-shadow">
            <h3 className="text-xs text-[#1A75FF] font-bold uppercase tracking-wider mb-4">
                Active Projects
            </h3>

            {/* Circular Progress with Number */}
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-[10px] border-[#FF8C00]/10"></div>
                <div className="absolute inset-0 rounded-full border-[10px] border-[#FF8C00] border-t-transparent -rotate-45"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-extrabold text-slate-800">3</span>
                </div>
            </div>
        </section>
    );
};

export default ActiveProjects;
