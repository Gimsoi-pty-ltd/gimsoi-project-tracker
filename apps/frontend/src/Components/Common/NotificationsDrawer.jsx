import React, { useEffect } from 'react';

export default function NotificationsDrawer({ isOpen, onClose, children }) {
  // Accessibility: Close drawer when user presses the Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Notifications">
      {/* Dark background backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 transition-opacity" 
        onClick={onClose} 
      />

      {/* Slide-out Drawer Panel on the right */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl flex flex-col z-50 transition-transform duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close notifications panel"
          >
            ✕
          </button>
        </div>

        {/* Empty Body ready for real notification cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {children}
        </div>

      </div>
    </div>
  );
}