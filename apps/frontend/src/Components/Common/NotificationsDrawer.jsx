import React, { useEffect, useState } from "react";
import { Bell, X, CheckCircle } from "lucide-react";

const tabs = [
  "All",
];

const isUnread = (item) => item?.unread === true || item?.isRead === false;

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications = [],
  loadingActions = {},
  onAction,
  children,
}) {
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "All") return true;
    if (activeTab === "Task Reassignments") return item.category === "reassignment";
    if (activeTab === "New Blockers") return item.category === "blocker";
    if (activeTab === "PR Reviews") return item.category === "pr";
    return true;
  });

  const unreadCount = notifications.filter((item) => isUnread(item)).length;

  const handleNotificationAction = (notificationId, actionId) => {
    if (typeof onAction === "function") {
      onAction(notificationId, actionId);
    }
  };

  const handleDismiss = (notificationId, event) => {
    event?.stopPropagation?.();

    if (typeof onAction === "function") {
      onAction(notificationId, "dismiss");
    }
  };

  return (
    <>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="relative flex h-full w-screen max-w-md flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between bg-[#002D62] px-6 py-5 text-white shadow-sm">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-blue-200" />
                  <h2 className="m-0 text-lg font-semibold">Notifications</h2>
                  {notifications.length > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {notifications.length}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-blue-200 transition-colors hover:bg-blue-700/50 hover:text-white"
                  aria-label="Close notifications drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap border-b border-gray-200 px-3">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "border-[#003B7A] text-[#003B7A]"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {filteredNotifications.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                      <Bell className="h-6 w-6" />
                    </div>

                    <p className="text-sm font-medium text-gray-900">
                      {notifications.length === 0 ? "No new notifications" : "No notifications in this view"}
                    </p>

                    <p className="mt-1 max-w-[200px] text-xs text-gray-500">
                      When you receive updates about tasks or projects, they will appear here.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`rounded-xl border p-4 shadow-sm transition-all ${
                        isUnread(notif) ? "border-blue-100 bg-blue-50/40" : "border-gray-100 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isUnread(notif) && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                          )}

                          <h4 className="text-sm font-semibold text-gray-900">
                            {notif.title}
                          </h4>
                        </div>

                        <span className="shrink-0 text-xs text-gray-400">
                          {notif.timestamp || notif.time}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-gray-600">
                        {notif.message}
                      </p>

                      {notif.actions?.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {notif.actions.map((action) => {
                            const isLoading =
                              loadingActions[notif.id] === action.id ||
                              loadingActions[notif.id] === true;

                            return (
                              <button
                                key={action.id}
                                type="button"
                                disabled={isLoading || !onAction}
                                onClick={() => handleNotificationAction(notif.id, action.id)}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                  action.variant === "primary"
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {isLoading && (
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                )}

                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={(event) => handleDismiss(notif.id, event)}
                            className="text-sm text-[#003B7A] hover:underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  ))
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
