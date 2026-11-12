import React, { useEffect } from "react";
import { X, Bell } from "lucide-react";

export default function NotificationsDrawer({ isOpen, onClose, children }) {
  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
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
      </div>
    </div>
  );
}