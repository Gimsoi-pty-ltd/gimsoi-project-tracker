// src/Pages/Kanban/KanbanBoard.jsx
import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../../store/projectStore';

const DARK_CARD_COLORS = ['bg-blue-700','bg-purple-600','bg-teal-600','bg-orange-600','bg-yellow-700','bg-green-700'];

const getTextColors = (cardColor = 'bg-white') => {
  const isDark = DARK_CARD_COLORS.includes(cardColor);
  return isDark
    ? { title:'text-white', sub:'text-white/75', tag:'bg-white/20 text-white', border:'border-white/25', priorityHigh:'text-orange-200 border-orange-200/60', priorityMedium:'text-yellow-200 border-yellow-200/60', priorityLow:'text-blue-200 border-blue-200/60', priorityDefault:'text-white/60 border-white/30', columnIdReview:'text-purple-200 border-purple-200/60', columnIdDone:'text-green-200 border-green-200/60' }
    : { title:'text-gray-800', sub:'text-gray-600', tag:'bg-blue-100 text-blue-700', border:'border-gray-200', priorityHigh:'text-orange-600 border-orange-300', priorityMedium:'text-yellow-600 border-yellow-300', priorityLow:'text-blue-600 border-blue-300', priorityDefault:'text-gray-600 border-gray-300', columnIdReview:'text-purple-700 border-purple-300', columnIdDone:'text-green-700 border-green-300' };
};

const getPriorityLabel = (priority, columnId) => {
  if (columnId === 'review') return 'QA Review';
  if (columnId === 'done')   return 'QA Approved';
  return priority;
};

const tagColorMap = { Backend:'bg-blue-700', Frontend:'bg-purple-600', DevOps:'bg-teal-600', Testing:'bg-orange-600', Docs:'bg-yellow-700' };

const KanbanCard = ({ title, priority, assignee, tags = [], cardColor = 'bg-white', columnId, onClick, onDragStart, onDragEnd, isDragging }) => {
  const textColor = getTextColors(cardColor);
  const priorityLabel = getPriorityLabel(priority, columnId);
  const getPriorityColor = (label) => {
    switch (label) {
      case 'High': case 'Critical': return textColor.priorityHigh;
      case 'Medium': return textColor.priorityMedium;
      case 'Low':    return textColor.priorityLow;
      case 'QA Review':   return textColor.columnIdReview;
      case 'QA Approved': return textColor.columnIdDone;
      default: return textColor.priorityDefault;
    }
  };
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick}
      className={`${cardColor} rounded-md p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 border ${textColor.border} ${isDragging ? 'opacity-40 scale-95' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-sm flex-1 pr-2 ${textColor.title}`}>{title}</h3>
        {priorityLabel && <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(priorityLabel)}`}>{priorityLabel}</span>}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag, i) => <span key={i} className={`text-xs px-2 py-0.5 rounded font-medium ${textColor.tag}`}>{tag}</span>)}
        </div>
      )}
      <div className={`mt-3 pt-2 border-t ${textColor.border}`}>
        <span className={`text-xs font-medium ${textColor.sub}`}>{assignee}</span>
      </div>
    </div>
  );
};

const Column = ({ id, title, headerColor, cards = [], onCardClick, onCardDragStart, onCardDragEnd, onDropCard, draggedCard }) => {
  const [isOver, setIsOver] = useState(false);
  const isDragTarget = draggedCard && draggedCard.fromColumnId !== id;
  return (
    <div className="flex flex-col rounded-lg shadow-md w-full sm:w-[300px] max-h-[600px] sm:max-h-[700px]"
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { onDropCard?.(id); setIsOver(false); }}>
      <div className={`${headerColor} text-white font-bold text-xs sm:text-sm px-3 md:px-4 py-2 md:py-3 rounded-t-lg uppercase tracking-wide flex items-center justify-between`}>
        <span className="truncate">{title}</span>
        <span className="bg-white/20 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">{cards.length}</span>
      </div>
      <div className={`bg-gray-50 p-2 sm:p-3 rounded-b-lg flex-1 space-y-2 sm:space-y-3 overflow-y-auto transition-colors ${isOver && isDragTarget ? 'bg-blue-50' : ''}`}>
        {cards.map((card) => (
          <KanbanCard key={card.id} {...card} columnId={id}
            isDragging={draggedCard?.cardId === card.id && draggedCard?.fromColumnId === id}
            onClick={() => onCardClick?.(card)}
            onDragStart={() => onCardDragStart?.(id, card.id)}
            onDragEnd={onCardDragEnd} />
        ))}
        <div className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center text-xs transition-all ${isOver && isDragTarget ? 'border-blue-400 bg-blue-50 text-blue-500' : 'border-gray-300 bg-white text-gray-400'}`}>
          {isOver && isDragTarget ? '📥 Drop here' : 'Drag cards here'}
        </div>
      </div>
    </div>
  );
};

const taskToCard = (task) => ({ id: task.id, title: task.title, priority: task.priority, assignee: task.assignee, tags: [task.tag], cardColor: tagColorMap[task.tag] ?? 'bg-blue-700' });

export default function KanbanTestPage() {
  const { activeSprint, activeProject, updateTasks } = useProjectStore();
  const tasks = activeSprint?.tasks ?? [];

  const initialColumns = useMemo(() => [
    { id: 'todo',       title: 'TO DO',       headerColor: 'bg-blue-600',   cards: tasks.filter(t => t.status === 'todo').map(taskToCard) },
    { id: 'inProgress', title: 'In Progress', headerColor: 'bg-blue-400',   cards: tasks.filter(t => t.status === 'inProgress').map(taskToCard) },
    { id: 'review',     title: 'QA / Review', headerColor: 'bg-orange-400', cards: tasks.filter(t => t.status === 'review').map(taskToCard) },
    { id: 'blocked',    title: 'Blocked',     headerColor: 'bg-red-500',    cards: tasks.filter(t => t.status === 'blocked').map(taskToCard) },
    { id: 'done',       title: 'Done',        headerColor: 'bg-green-500',  cards: tasks.filter(t => t.status === 'done').map(taskToCard) },
  ], [tasks]);

  const [columns, setColumns]           = useState(initialColumns);
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
      
      const updatedColumns = prev.map((col) => {
        if (col.id === fromColumnId) return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        if (col.id === toColumnId)   return { ...col, cards: [...col.cards, card] };
        return col;
      });
      
      // Convert column format back to task format and persist to context
      const updatedTasks = tasks.map(task => {
        const columnId = updatedColumns.find(col => 
          col.cards.some(c => c.id === task.id)
        )?.id;
        return columnId ? { ...task, status: columnId } : task;
      });
      updateTasks(updatedTasks);
      
      return updatedColumns;
    });
    setDraggedCard(null);
  };

  return (
    <div className="bg-gray-200 min-h-screen p-3 md:p-6">
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <div className="pb-4 md:pb-6 border-b border-gray-200 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 flex-wrap">
            <div className="w-full md:w-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Sprint Task Progress</h1>
             <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">{activeProject?.name || 'No Project'} · {activeSprint?.name} — {activeSprint?.goal}</p>
            </div>
            <div className="w-full md:w-auto">
              <p className="text-xs md:text-sm">{doneCards}/{totalCards} Tasks completed</p>
              <div className="w-full md:w-64 bg-gray-300 rounded-full h-2 md:h-3 mt-2 relative">
                <div className="bg-blue-500 h-2 md:h-3 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                <span className="absolute right-0 -top-5 text-xs md:text-sm font-semibold">{progressPct}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-start gap-2 md:gap-4 mt-4 text-xs flex-wrap">
            {[{ color:'bg-purple-600', label:'Frontend' }, { color:'bg-blue-700', label:'Backend' }, { color:'bg-teal-600', label:'DevOps' }, { color:'bg-orange-600', label:'Testing' }].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1"><span className={`w-3 md:w-4 h-3 md:h-4 ${color} rounded-full`} /><span className="hidden sm:inline">{label}</span></div>
            ))}
          </div>
        </div>
        {selectedCard && <div className="mb-4 p-2 md:p-3 bg-green-50 border border-green-300 rounded text-xs md:text-sm text-green-800">Selected: <strong>{selectedCard.title}</strong></div>}
        <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-3 md:mb-4">Kanban board</h2>
        <div className="flex flex-col md:flex-row md:overflow-x-auto gap-3 md:gap-4 pb-2">
          {columns.map((col) => (
            <Column key={col.id} {...col} onCardClick={setSelectedCard} onCardDragStart={handleDragStart} onCardDragEnd={handleDragEnd} onDropCard={handleDrop} draggedCard={draggedCard} />
          ))}
        </div>
      </div>
    </div>
  );
}
