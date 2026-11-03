import React, { useRef } from 'react';

const ImportButton = ({ onFileSelect, disabled = false, label = "Import Data" }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file); 
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
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        {label}
      </button>
    </>
  );
};

export default ImportButton;