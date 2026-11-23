import React, { useState } from "react";

const ExportButton = ({
  onClick,
  onExport,
  label = "Export CSV",
  children,
  loadingLabel = "Preparing export...",
  disabled = false,
  type = "button",
  className = "px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer",
}) => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // onClick is standard, onExport kept for backwards compatibility
  const handleExportFn = onClick || onExport;

  const handleExport = async () => {
    if (!handleExportFn || exporting || disabled) return;

    setExporting(true);
    setError(null);

    try {
      const result = await handleExportFn();
      if (!result || result.content == null || !result.filename) {
        throw new Error("Export did not provide file content and a filename.");
      }

      const blob = result.content instanceof Blob
        ? result.content
        : new Blob([result.content], { type: result.mimeType || "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (exportError) {
      setError(exportError.message || "Could not export this file.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <button
        type={type}
        onClick={handleExport}
        disabled={disabled || exporting || !handleExportFn}
        aria-label={label}
        className={`${className} focus:outline-none focus:ring-4 focus:ring-[#002D62]/30 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {exporting ? loadingLabel : (children || label)}
      </button>
      {error && <p role="alert" className="exportmt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
};

export default ExportButton;