import React from "react";

const CertificateButton = ({ onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Action Document"
      className={`px-4 py-2 rounded-lg font-medium text-white transition
        ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
    >
      Certificates
    </button>
  );
};

export default CertificateButton;
