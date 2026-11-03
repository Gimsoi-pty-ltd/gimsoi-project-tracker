import React from 'react';

const NavyButton = ({ onClick, children, type = "button", className = "", disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        min-w-[140px] px-10 py-3.5
        rounded-lg 
        bg-[#002D62] hover:bg-[#001f44] 
        text-white font-semibold tracking-wide
        shadow-md hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200 
        active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#002D62]/30
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default NavyButton;