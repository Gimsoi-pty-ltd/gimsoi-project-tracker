import React from 'react';

// Temporary stub until Tebogo implements full design
const KanbanCard = ({ title, onClick }) => {
  return (
    <div onClick={onClick} className="p-4 border rounded bg-white">
      {title || 'Card'}
    </div>
  );
};

export default KanbanCard;