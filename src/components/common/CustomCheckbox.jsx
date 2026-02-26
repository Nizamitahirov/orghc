// src/app/asset-management/page.jsx - Complete Enhanced Asset Management Page with All APIs
"use client";

const CustomCheckbox = ({ checked, onChange, className = "", indeterminate = false }) => {
  return (
    <div className="relative z-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div
        onClick={onChange}
        className={`
          w-4 h-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center
          ${checked 
            ? 'bg-almet-sapphire border-almet-sapphire text-white' 
            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-almet-sapphire'
          }
          ${indeterminate ? 'bg-almet-sapphire/50 border-almet-sapphire' : ''}
          ${className}
        `}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {indeterminate && !checked && (
          <div className="w-2 h-0.5 bg-white rounded"></div>
        )}
      </div>
    </div>
  );
};

export default CustomCheckbox