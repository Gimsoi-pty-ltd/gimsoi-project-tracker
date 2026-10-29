import React from "react";
import { X } from "lucide-react";

function CloseButton({ onClose, label = "Close information" }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-[#002D62]/30"
    >
      <X size={20} />
    </button>
  );
}

export default CloseButton;
