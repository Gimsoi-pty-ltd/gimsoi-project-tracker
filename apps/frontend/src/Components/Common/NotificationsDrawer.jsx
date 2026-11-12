
import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';

export default function NotificationsDrawer({ isOpen, onClose, children }) {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  // Close drawer when Escape is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Remove notification when action is clicked
  const handleActionClick = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // Filter notifications according to selected tab
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Task Reassignments') {
      return item.category === 'reassignment';
    }
    if (activeTab === 'New Blockers') {
      return item.category === 'blocker';
    }
    if (activeTab === 'PR Reviews') {
      return item.category === 'pr';
    }
    return true;
  });

  const unreadCount = notifications.filter(
    (item) => item.unread
  ).length;

  const tabs = [
    'All',
    'Task Reassignments',
    'New Blockers',
    'PR Reviews'
  ];

  return (
    <>
      {/* Notification Bell */}
      <button
        type="button"
        onClick={isOpen ? onClose : undefined}
        className="relative p-2 rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">

              {/* Header */}
              <div className="px-6 py-4 bg-[#003B7A] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Notifications
                  </h3>
                  <span className="text-xs text-blue-200">
                    {unreadCount} New
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20"
                  aria-label="Close notifications"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap border-b border-gray-200 px-3">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-[#003B7A] text-[#003B7A]'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Notification Content */}
              <div className="flex-1 overflow-y-auto p-6">

                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-16">
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      <CheckCircle
                        size={32}
                        className="text-gray-400"
                      />
                    </div>

                    <h4 className="text-gray-800 font-semibold">
                      No notifications
                    </h4>

                    <p className="text-sm text-gray-500 mt-2">
                      You're all caught up. New notifications
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-gray-800">
                          {item.title}
                        </h4>

                        <p className="text-sm text-gray-600 mt-1">
                          {item.message}
                        </p>

                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-gray-400">
                            {item.time}
                          </span>

                          <button
                            type="button"
                            onClick={(e) =>
                              handleActionClick(item.id, e)
                            }
                            className="text-sm text-[#003B7A] hover:underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
