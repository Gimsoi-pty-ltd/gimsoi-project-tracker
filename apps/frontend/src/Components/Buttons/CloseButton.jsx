import React from 'react';
import { X } from 'lucide-react';

function CloseButton({ onClick, onClose, label = "Close information", disabled = false, className = "", type = "button" }) {
  // onClose kept for backwards compatibility, onClick is the standard
  const handleClick = onClick || onClose;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 focus:outline-none focus:ring-4 focus:ring-[#002D62]/30 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <X size={20} />
    </button>
  );
}

export default CloseButton;