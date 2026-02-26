'use client';

import { 

  ChevronDown, ChevronRight
} from 'lucide-react';




// Collapsible Group Component
const CollapsibleGroup = ({ title, isOpen, onToggle, children }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
    >
      <h4 className="font-medium text-sm text-gray-700">{title}</h4>
      {isOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
    </button>
    {isOpen && (
      <div className="bg-white">
        {children}
      </div>
    )}
  </div>
);

export default CollapsibleGroup