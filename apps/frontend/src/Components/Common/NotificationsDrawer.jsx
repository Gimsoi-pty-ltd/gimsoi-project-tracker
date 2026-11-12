
import React, { useEffect } from "react";
import { Bell, X } from "lucide-react";

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications = [],
  loadingActions = {},
  onAction,
}) {
  // Close drawer using Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationAction = (notificationId, actionId) => {
    if (typeof onAction === "function") {
      onAction(notificationId, actionId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="relative flex h-full w-screen max-w-md flex-col bg-white shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between bg-[#002D62] px-6 py-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-200" />
              <h2 className="m-0 text-lg font-semibold">
                Notifications
              </h2>
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

          {/* Notification Items */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">

            {notifications.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <Bell className="h-6 w-6" />
                </div>

                <p className="text-sm font-medium text-gray-900">
                  No new notifications
                </p>

                <p className="mt-1 max-w-[200px] text-xs text-gray-500">
                  When you receive updates about tasks or projects,
                  they will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`rounded-xl border p-4 shadow-sm transition-all ${
                    notif.isRead
                      ? "border-gray-100 bg-white"
                      : "border-blue-100 bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {!notif.isRead && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      )}

                      <h4 className="text-sm font-semibold text-gray-900">
                        {notif.title}
                      </h4>
                    </div>

                    <span className="shrink-0 text-xs text-gray-400">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-gray-600">
                    {notif.message}
                  </p>

                  {/* Direct Action Buttons */}
                  {notif.actions?.length > 0 && (
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
                            onClick={() =>
                              handleNotificationAction(
                                notif.id,
                                action.id
                              )
                            }
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
                  )}
                </div>
              ))
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
