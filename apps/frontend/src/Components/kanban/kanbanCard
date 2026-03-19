// src/Components/Kanban/KanbanCard.jsx
import React from 'react';

const KanbanCard = ({
  title,
  priority,
  assignee,
  tags = [],
  cardColor = 'bg-white',
  onClick,
}) => {
  // Priority badge colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-orange-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`${cardColor} rounded-md p-3 cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200`}
    >
      {/* Top section: Title + Priority */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-sm flex-1 pr-2">
          {title}
        </h3>
        {priority && (
          <span className={`text-xs font-bold ${getPriorityColor(priority)}`}>
            {priority}
          </span>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Assignee */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-600 font-medium">
          {assignee}
        </span>
      </div>
    </div>
  );
};

export default KanbanCard;
