import { Activity, Eye, CircleCheck, ClipboardCheck } from "lucide-react";

// Placeholder values: confirm against the approved status definitions.
export const RISK_STATUS = {
  ACTIVE: "active",
  MONITORING: "monitoring",
  RESOLVED: "resolved",
  COMPLETED: "completed",
};

export const RISK_STATUS_CONFIG = {
  [RISK_STATUS.ACTIVE]: {
    label: "Active",
    description: "Risk is currently open and being actioned.",
    icon: Activity,
    classes: "bg-violet-50 text-violet-800 border-violet-200",
  },
  [RISK_STATUS.MONITORING]: {
    label: "Monitoring",
    description: "Risk is being watched but needs no action yet.",
    icon: Eye,
    classes: "bg-teal-50 text-teal-800 border-teal-200",
  },
  [RISK_STATUS.RESOLVED]: {
    label: "Resolved",
    description: "Risk has been mitigated.",
    icon: CircleCheck,
    classes: "bg-green-50 text-green-800 border-green-200",
  },
  [RISK_STATUS.COMPLETED]: {
    label: "Completed",
    description: "Risk work is closed out.",
    icon: ClipboardCheck,
    classes: "bg-slate-100 text-slate-700 border-slate-300",
  },
};