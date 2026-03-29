import React, { useState } from 'react';

// Kanban Cards

const DARK_CARD_COLORS = [
  'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
  'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800',
  'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800',
  'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800',
  'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800',
  'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-800',
  'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800',
  'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-800',
  'bg-teal-500', 'bg-teal-600', 'bg-teal-700',
  'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700',
  'bg-black',
];

const getTextColors = (cardColor = 'bg-white') => {
  const isDark = DARK_CARD_COLORS.includes(cardColor);
  return isDark
    ? {
        title:          'text-white',
        sub:            'text-white/75',
        tag:            'bg-white/20 text-white',
        border:         'border-white/25',
        priorityHigh:   'text-orange-200 border-orange-200/60',
        priorityMedium: 'text-yellow-200 border-yellow-200/60',
        priorityLow:    'text-blue-200   border-blue-200/60',
        priorityDefault:'text-white/60   border-white/30',
        columnIdReview:   'text-purple-200 border-purple-200/60',
        columnIdDone:     'text-green-200  border-green-200/60',
      }
    : {
        title:          'text-gray-800',
        sub:            'text-gray-600',
        tag:            'bg-blue-100 text-blue-700',
        border:         'border-gray-200',
        priorityHigh:   'text-orange-600 border-orange-300',
        priorityMedium: 'text-yellow-600 border-yellow-300',
        priorityLow:    'text-blue-600   border-blue-300',
        priorityDefault:'text-gray-600   border-gray-300',
        columnIdReview:   'text-purple-700 border-purple-300',
        columnIdDone:     'text-green-700  border-green-300',
      };
};


const getPriorityLabel = (priority, columnId) => {
  if (columnId === 'review') return 'QA Review';
  if (columnId === 'done')   return 'QA Approved';
  return priority;
};

const KanbanCard = ({
  title,
  priority,
  assignee,
  tags = [],
  cardColor = 'bg-white',
  columnId,             
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}) => {
  const textColor = getTextColors(cardColor);
  const priorityLabel = getPriorityLabel(priority, columnId);

  const getPriorityColor = (label) => {
    switch (label) {
      case 'High':        return textColor.priorityHigh;
      case 'Medium':      return textColor.priorityMedium;
      case 'Low':         return textColor.priorityLow;
      case 'QA Review':   return textColor.columnIdReview;  
      case 'QA Approved': return textColor.columnIdDone;
      default:            return textColor.priorityDefault;
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`${cardColor} rounded-md p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 border ${textColor.border} ${isDragging ? 'opacity-40 scale-95' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-sm flex-1 pr-2 ${textColor.title}`}>{title}</h3>

        
        {priorityLabel && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(priorityLabel)}`}>
            {priorityLabel}
          </span>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded font-medium ${textColor.tag}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className={`mt-3 pt-2 border-t ${textColor.border}`}>
        <span className={`text-xs font-medium ${textColor.sub}`}>{assignee}</span>
      </div>
    </div>
  );
};

// Kanban Column
const Column = ({
  id,
  title,
  headerColor,
  cards = [],
  onCardClick,
  onCardDragStart,
  onCardDragEnd,
  onDropCard,
  draggedCard,
}) => {
  const [isOver, setIsOver] = useState(false);
  const isDragTarget = draggedCard && draggedCard.fromColumnId !== id;

  return (
    <div
      className="flex flex-col rounded-lg shadow-md min-w-[350px] w-[350px] max-h-[700px]"
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { onDropCard?.(id); setIsOver(false); }}
    >
      {/* Header */}
      <div className={`${headerColor} text-white font-bold text-sm px-4 py-3 rounded-t-lg text-center uppercase tracking-wide flex items-center justify-between`}>
        <span>{title}</span>
        <span className="bg-white/20 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className={`bg-gray-50 p-3 rounded-b-lg flex-1 space-y-3 overflow-y-auto transition-colors duration-200 ${isOver && isDragTarget ? 'bg-blue-50' : ''}`}>
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            {...card}
            columnId={id}
            isDragging={draggedCard?.cardId === card.id && draggedCard?.fromColumnId === id}
            onClick={() => onCardClick?.(card)}
            onDragStart={() => onCardDragStart?.(id, card.id)}
            onDragEnd={onCardDragEnd}
          />
        ))}

        <div className={`border-2 border-dashed rounded-lg p-4 text-center text-xs transition-all duration-200
          ${isOver && isDragTarget
            ? 'border-blue-400 bg-blue-50 text-blue-500 scale-105'
            : 'border-gray-300 bg-white text-gray-400'}`}>
          {isOver && isDragTarget ? '📥 Drop here' : 'Drag cards here'}
        </div>
      </div>
    </div>
  );
};

// Sample data for testing
const SAMPLE_COLUMNS = [
  {
    id: 'backlog',
    title: 'Backlog',
    headerColor: 'bg-gray-600',
    cards: [
      { id: '1', title: 'Implement login page',      priority: 'High',   assignee: 'DevOps',        tags: ['New Feature'], cardColor: 'bg-purple-600' },
      { id: '2', title: 'Duplicate Entries',         priority: 'High',   assignee: 'Backend Team',  tags: ['Bug Fix'],     cardColor: 'bg-orange-400' },
      { id: '3', title: 'Implement dark theme mode', priority: 'Low',    assignee: 'Frontend Team', tags: ['Improvement'], cardColor: 'bg-yellow-400' },
    ],
  },
  {
    id: 'todo',
    title: 'TO DO',
    headerColor: 'bg-blue-600',
    cards: [
      { id: '1', title: 'Build Dashboard Charts', priority: 'High',   assignee: 'Dave',  tags: ['Technical Task'], cardColor: 'bg-blue-700'   },
      { id: '2', title: 'Advanced Filtering',     priority: 'Low',    assignee: 'Frank', tags: ['Improvement'],    cardColor: 'bg-yellow-400' },
      { id: '3', title: 'Bulk Actions',           priority: 'Medium', assignee: 'Carol', tags: ['New Feature'],    cardColor: 'bg-purple-600' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    headerColor: 'bg-green-600',
    cards: [
      { id: '1', title: 'Set up CI/CD pipeline',    priority: 'High',   assignee: 'Frank', tags: ['Technical Task'], cardColor: 'bg-blue-700'   },
      { id: '2', title: 'User management page',     priority: 'Medium', assignee: 'Dave',  tags: ['Technical Task'], cardColor: 'bg-blue-700'   },
      { id: '3', title: 'Users cannot log emails.', priority: 'High',   assignee: 'John',  tags: ['Bug Fix'],        cardColor: 'bg-orange-400' },
    ],
  },
  {
    id: 'review',
    title: 'QA / Review',
    headerColor: 'bg-yellow-500',
    cards: [
      { id: '1', title: 'AI-Driven Scheduling.',        priority: 'High',   assignee: 'Alice', tags: ['New Feature'],    cardColor: 'bg-purple-600' },
      { id: '2', title: 'Email Notification Fix.',      priority: 'Medium', assignee: 'John',  tags: ['Bug Fix'],        cardColor: 'bg-orange-400' },
      { id: '3', title: 'Environment Variable Cleanup', priority: 'Low',    assignee: 'Ace',   tags: ['Technical Task'], cardColor: 'bg-blue-700'   },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    headerColor: 'bg-green-800',
    cards: [],
  },
];

// Main Kanban Component
const Kanban = () => {
  const [columns, setColumns]           = useState(SAMPLE_COLUMNS);
  const [selectedCard, setSelectedCard] = useState(null);
  const [draggedCard, setDraggedCard]   = useState(null);

  const totalCards  = columns.reduce((sum, col) => sum + col.cards.length, 0);
  const doneCards   = columns.find((c) => c.id === 'done')?.cards.length ?? 0;
  const progressPct = totalCards ? Math.round((doneCards / totalCards) * 100) : 0;

  const handleDragStart = (fromColumnId, cardId) => setDraggedCard({ fromColumnId, cardId });
  const handleDragEnd   = () => setDraggedCard(null);

  const handleDrop = (toColumnId) => {
    if (!draggedCard) return;
    const { fromColumnId, cardId } = draggedCard;
    if (fromColumnId === toColumnId) { setDraggedCard(null); return; }

    setColumns((prev) => {
      const card = prev.find((c) => c.id === fromColumnId)?.cards.find((c) => c.id === cardId);
      if (!card) return prev;
      return prev.map((col) => {
        if (col.id === fromColumnId) return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        if (col.id === toColumnId)   return { ...col, cards: [...col.cards, card] };
        return col;
      });
    });
    setDraggedCard(null);
  };

  return (
    <div className="bg-gray-200 min-h-screen p-6 text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="bg-white rounded-lg shadow-lg p-6">

        {/* HEADER */}
        <div className="pb-6 border-b border-gray-200 mb-6">
          <h1 className="text-2xl font-bold">Sprint Task Progress</h1>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-sm">{doneCards}/{totalCards} Tasks completed</p>
              <div className="w-64 bg-gray-300 rounded-full h-3 mt-2 relative">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
                <span className="absolute right-2 top-[-20px] text-sm font-semibold">{progressPct}%</span>
              </div>
            </div>

            <div className="text-xs text-gray-600 flex gap-6">
              <p><span className="font-semibold">High</span> – Critical feature / urgent fix</p>
              <p><span className="font-semibold">Medium</span> – Important improvement</p>
              <p><span className="font-semibold">Low</span> – Optional enhancement</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-4 text-xs">
            {[
              { color: 'bg-purple-600', label: 'New Feature' },
              { color: 'bg-blue-600',   label: 'Technical Task' },
              { color: 'bg-yellow-400', label: 'Improvement' },
              { color: 'bg-orange-400', label: 'Bug Fix' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <span className={`w-4 h-4 ${color} rounded-full`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Card click feedback */}
        {selectedCard && (
          <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded text-sm text-green-800">
            Card clicked: <strong>{selectedCard.title}</strong> (id: {selectedCard.id})
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-700 mb-3">Kanban board</h2>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {columns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              headerColor={col.headerColor}
              cards={col.cards}
              onCardClick={setSelectedCard}
              onCardDragStart={handleDragStart}
              onCardDragEnd={handleDragEnd}
              onDropCard={handleDrop}
              draggedCard={draggedCard}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Kanban;