import React from 'react';
import KanbanCard from './KanbanCard';

const Column = ({
  title,
  headerColor,
  cards = [],
  onCardClick,
}) => {
  return (
    <div className="flex flex-col rounded-lg shadow-md min-w-[280px] w-[280px] max-h-[700px]">
      {/* Column Header */}
      <div className={`${headerColor} text-white font-bold text-base px-4 py-3 rounded-t-lg text-center uppercase tracking-wide`}>
        {title}
      </div>

      {/* Cards Container */}
      <div className="bg-gray-50 p-3 rounded-b-lg flex-1 space-y-3 overflow-y-auto">
        {/* Render Cards */}
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            title={card.title}
            priority={card.priority}
            assignee={card.assignee}
            tags={card.tags}
            onClick={() => onCardClick?.(card)}
          />
        ))}

        {/* Drag and Drop Placeholder */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 text-sm">
          Drag and drop
        </div>
      </div>
    </div>
  );
};

export default Column;