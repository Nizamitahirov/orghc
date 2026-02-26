import React from 'react';

// ✅ Reusable chart wrapper with light shadow & clean header
const ChartContainer = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 ${className}`}>
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-almet-sapphire" />}
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      </div>
    </div>
    {children}
  </div>
);

export default ChartContainer;
