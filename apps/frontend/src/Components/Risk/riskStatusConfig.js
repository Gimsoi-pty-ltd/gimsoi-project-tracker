
import { Activity } from "lucide-react";

export const RISK_STATUS = {
  ACTIVE: "active",
};

export const RISK_STATUS_CONFIG = {
  [RISK_STATUS.ACTIVE]: {
    label: "Active",
    description: "Risk is currently open and being actioned.",
    icon: Activity,
    classes: "bg-violet-50 text-violet-800 border-violet-200",
  },
};
