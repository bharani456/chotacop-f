import React from 'react';

const Popup = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 backdrop-blur-sm">
      {/* Background content remains visible and blurred */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/path-to-your-background-image.jpg)' }}></div>
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-fade-in z-10">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="mt-2 mb-2 text-lg font-semibold text-purple-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;