import React from "react";
import { X, ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";

export default function Toaster({
  type = "info",
  title = "Project Health",
  message,
  onView,
  onDismiss
}) {
  const config = {
    info: {
      Icon: ShieldCheck,
      styles: "bg-blue-50 border-blue-200 text-blue-900",
      role: "status"
    },
    success: {
      Icon: CheckCircle,
      styles: "bg-green-50 border-green-200 text-green-900",
      role: "status"
    },
    warning: {
      Icon: AlertTriangle,
      styles: "bg-orange-50 border-orange-200 text-orange-900",
      role: "status"
    },
    error: {
      Icon: AlertTriangle,
      styles: "bg-red-50 border-red-200 text-red-900",
      role: "alert"
    }
  };

  const selected = config[type] || config.info;
  const Icon = selected.Icon;

  return (
    <div
      className={`fixed top-20 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border p-4 shadow-lg ${selected.styles}`}
      role={selected.role}
      aria-live={selected.role === "alert" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <Icon size={24} aria-hidden="true" className="shrink-0" />

        <div className="flex-1">
          <h3 className="font-bold">{title}</h3>

          <p className="mt-1 text-sm">{message}</p>

          {onView && (
            <button
              type="button"
              onClick={onView}
              className="mt-3 text-sm font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              View Project Health
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss Project Health notification"
          className="rounded p-1 hover:bg-black/10 focus-visible:outline-2"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
