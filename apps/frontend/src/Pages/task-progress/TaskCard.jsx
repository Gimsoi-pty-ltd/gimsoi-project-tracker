import React from "react";

const TaskCard = () => {
  return (
    <div className="bg-gray-100 rounded-2xl shadow-sm w-[260px] overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#f97316] px-6 py-4">
        <h2 className="text-sm font-bold text-white tracking-wide uppercase">Task Progress</h2>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Project Name</p>
          <p className="text-sm font-semibold text-[#002D62] hover:underline">
            Project 1
          </p>
        </div>

        <div className="border-t border-gray-100" />

        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Task</p>
          <p className="text-sm font-medium text-gray-800">Task 1</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Task Status</p>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#f97316] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            In Progress
          </span>
        </div>

        <div className="border-t border-gray-100" />

        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Assigned</p>
          <p className="text-sm font-medium text-gray-800">General</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Due Date</p>
          <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">30 Apr</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
