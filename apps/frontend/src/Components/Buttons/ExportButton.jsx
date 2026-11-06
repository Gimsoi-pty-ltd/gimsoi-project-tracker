import React, { useState } from "react";

const ExportButton = ({
	onExport,
	label = "Export CSV",
	loadingLabel = "Preparing export...",
	disabled = false,
	className = "px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer",
}) => {
	const [exporting, setExporting] = useState(false);
	const [error, setError] = useState(null);

	const handleExport = async () => {
		if (!onExport || exporting || disabled) return;

		setExporting(true);
		setError(null);

		try {
			const result = await onExport();
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
				type="button"
				onClick={handleExport}
				disabled={disabled || exporting || !onExport}
				className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
			>
				{exporting ? loadingLabel : label}
			</button>
			{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
		</div>
	);
};

export default ExportButton;
