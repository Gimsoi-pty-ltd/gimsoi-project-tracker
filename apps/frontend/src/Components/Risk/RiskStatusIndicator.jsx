import { RISK_STATUS_CONFIG } from "./riskStatusConfig";

const SIZES = {
  sm: { pill: "px-2 py-0.5 text-xs gap-1", icon: 12 },
  md: { pill: "px-2.5 py-1 text-sm gap-1.5", icon: 16 },
};

export default function RiskStatusIndicator({
  status,
  size = "md",
  showLabel = true,
  className = "",
}) {
  const { pill, icon } = SIZES[size] ?? SIZES.md;
  const config = RISK_STATUS_CONFIG[String(status ?? "").toLowerCase()];

  // Unknown or missing status: neutral pill instead of crashing.
  if (!config) {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-slate-300 bg-slate-50 font-medium text-slate-600 ${pill} ${className}`}
      >
        Unknown
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <span
      title={config.description}
      className={`inline-flex items-center rounded-full border font-medium ${config.classes} ${pill} ${className}`}
    >
      <Icon size={icon} aria-hidden="true" />
      {showLabel ? (
        <span>{config.label}</span>
      ) : (
        <span className="sr-only">{config.label}</span>
      )}
    </span>
  );
}