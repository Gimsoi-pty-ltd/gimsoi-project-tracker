import React from "react";
import CloseButton from "./CloseButton";

function InformationModal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-info-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="auth-info-title" className="text-xl font-bold text-[#002D62]">
            {title}
          </h2>

          <CloseButton onClose={onClose} />
        </div>

        <div className="text-sm leading-6 text-gray-600">{children}</div>
      </div>
    </div>
  );
}

export default InformationModal;
