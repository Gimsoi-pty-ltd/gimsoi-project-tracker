import React, { useRef } from 'react';

const ImportButton = ({ onClick, onFileSelect, disabled = false, label = "Import Data", children, type = "button", className = "px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" }) => {
  const fileInputRef = useRef(null);

  // onClick is standard, onFileSelect kept for backwards compatibility
  const handleFileSelectFn = onClick || onFileSelect;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && handleFileSelectFn) {
      handleFileSelectFn(file);
    }
    event.target.value = "";
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      <button
        type={type}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        aria-label={label}
        className={`${className} focus:outline-none focus:ring-4 focus:ring-[#002D62]/30 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {children || label}
      </button>
    </>
  );
};

export default ImportButton;