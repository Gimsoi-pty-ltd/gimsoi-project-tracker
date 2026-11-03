import React from "react";
import { Info } from "lucide-react";

function InfoIcon({ onClick, label = "Show information" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center rounded-full text-gray-500 transition-colors hover:text-[#002D62] focus:outline-none focus:ring-2 focus:ring-[#002D62]/30"
    >
      <Info size={20} />
    </button>
  );
}

export default InfoIcon;
