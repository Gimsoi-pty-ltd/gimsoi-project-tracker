function DropDown({ options, selectedOption, onSelect }) {
  return (
    <select value={selectedOption} onChange={(e) => onSelect(e.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
