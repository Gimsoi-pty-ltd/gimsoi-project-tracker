function DropDown({ label, options, selectedOption, onSelect }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <select
        value={selectedOption}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
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

export default DropDown;
