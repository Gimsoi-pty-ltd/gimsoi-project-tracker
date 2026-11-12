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

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="px-6 py-5 bg-[#002D62] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-200" />
              <h2 className="text-lg font-semibold text-white m-0">Notifications</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-700/50 transition-colors focus:outline-none"
              aria-label="Close notifications drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {children || (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">No new notifications</p>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                  When you get updates about tasks or projects, they'll show up here.
                </p>
              </div>
            )}
          </div>

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