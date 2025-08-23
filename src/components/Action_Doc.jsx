// ActionDocument.jsx
import React from "react";

const ActionDocument = ({ onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Action Document"
      className={`px-4 py-2 rounded-lg font-medium text-white transition
        ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
    >
      Action Document
    </button>
  );
};

export default ActionDocument;
