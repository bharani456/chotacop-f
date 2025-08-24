import React from 'react';

const BrowserTabs = ({ activeTab, onTabClick }) => {
  return (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => onTabClick('response')}
        className={`
          px-4 py-2 text-sm font-medium border-t-2 border-l border-r rounded-t-lg transition-colors
          ${activeTab === 'response' 
            ? 'bg-[#fdf5eb] border-gray-200 border-t-yellow-500 text-yellow-600 -mb-px relative z-10' 
            : 'bg-gray-50 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }
        `}
      >
        Response
      </button>
      <button
        onClick={() => onTabClick('certificate')}
        className={`
          px-4 py-2 text-sm font-medium border-t-2 border-l border-r rounded-t-lg ml-1 transition-colors
          ${activeTab === 'certificate' 
            ? 'bg-[#fdf5eb] border-gray-200 border-t-yellow-500 text-yellow-600 -mb-px relative z-10' 
            : 'bg-gray-50 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }
        `}
      >
        Certificate
      </button>
    </div>
  );
};

export default BrowserTabs;