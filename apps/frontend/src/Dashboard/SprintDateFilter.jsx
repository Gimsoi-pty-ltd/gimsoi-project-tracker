import React, { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";

// Your exact mock data structure
export const dashboardData = {
  sprint: {
    id: "sprint-12",
    name: "Sprint 12",
    startDate: "2026-05-01",
    endDate: "2026-05-15",
    status: "In Progress",
    goal: "Deliver auth module"
  }
};

// Sprints list for dropdown (dynamic)
export const sprintsList = [
  { id: "sprint-10", name: "Sprint 10", startDate: "2026-04-01", endDate: "2026-04-15", status: "Completed" },
  { id: "sprint-11", name: "Sprint 11", startDate: "2026-04-16", endDate: "2026-04-30", status: "Completed" },
  { id: "sprint-12", name: "Sprint 12", startDate: "2026-05-01", endDate: "2026-05-15", status: "In Progress" },
  { id: "sprint-13", name: "Sprint 13", startDate: "2026-05-16", endDate: "2026-05-30", status: "Planned" }
];

const SprintDateFilter = ({ 
  sprints = sprintsList, 
  defaultSprintId = "sprint-12",
  onSprintChange 
}) => {
  const [selectedSprint, setSelectedSprint] = useState(
    sprints.find(s => s.id === defaultSprintId) || sprints[0]
  );

  // Update selectedSprint when defaultSprintId changes from context
  React.useEffect(() => {
    const sprint = sprints.find(s => s.id === defaultSprintId) || sprints[0];
    setSelectedSprint(sprint);
  }, [defaultSprintId, sprints]);

  // ✅ Calculate days remaining dynamically
  const daysLeft = useMemo(() => {
    const today = new Date();
    const endDate = new Date(selectedSprint.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [selectedSprint.endDate]);

  // ✅ Format: "May 01"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  const handleSprintChange = (e) => {
    const sprint = sprints.find(s => s.id === e.target.value);
    if (sprint) {
      setSelectedSprint(sprint);
      onSprintChange?.(sprint);
    }
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* ✅ Sprint Selector - DYNAMIC */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase hidden sm:inline">
          Time Scope:
        </span>
        <div className="relative">
          <select
            value={selectedSprint.id}
            onChange={handleSprintChange}
            className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium hover:bg-gray-100 transition-colors"
          >
            {/* ✅ Maps actual sprint names instead of "Current/Next" */}
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ✅ Date Range - DYNAMIC */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700">
        <Calendar size={14} className="text-gray-400" />
        <span className="font-medium">
          {formatDate(selectedSprint.startDate)} – {formatDate(selectedSprint.endDate)}, {new Date(selectedSprint.endDate).getFullYear()}
        </span>
        <span className="text-gray-400">
          ({daysLeft} {daysLeft === 1 ? 'day' : 'days'} left)
        </span>
      </div>
    </div>
  );
};

export default SprintDateFilter;