import { useState } from "react";

export default function ToggleSwitch({ defaultOn = false }) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
        enabled ? "bg-[#001f44]" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
          enabled ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
