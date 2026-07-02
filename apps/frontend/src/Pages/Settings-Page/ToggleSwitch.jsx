import { useState } from "react";

export default function ToggleSwitch({ defaultOn = false }) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      aria-pressed={enabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
