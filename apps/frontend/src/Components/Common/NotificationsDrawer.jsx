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
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              No active alerts.
            </div>
          ) : (
            notifications.map((notif) => {
              const isLoading = loadingActions[notif.id];

              return (
                <div
                  key={notif.id}
                  className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Direct Action Buttons */}
                  {notif.actions && notif.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {notif.actions.map((action) => (
                        <button
                          key={action.id}
                          disabled={Boolean(isLoading)}
                          onClick={() => handleAction(notif.id, action.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                            action.variant === 'primary'
                              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50'
                          }`}
                        >
                          {isLoading === action.id && (
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          )}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}