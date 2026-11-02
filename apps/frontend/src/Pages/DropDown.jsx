import React from "react";

export default function DropDown({
  label,
  options,
  selectedOption,
  onSelect
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={selectedOption}
        onChange={(e) => onSelect(e.target.value)}
        className="border border-slate-300 rounded-lg p-2 bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}