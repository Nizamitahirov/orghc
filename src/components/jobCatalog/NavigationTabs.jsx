// src/components/jobCatalog/NavigationTabs.jsx

import React from 'react';
import { BarChart3, Layers, Grid, List, Table2 } from 'lucide-react';

export default function NavigationTabs({ activeView, setActiveView }) {
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: BarChart3,
      description: 'Job catalog overview'
    },
    { 
      id: 'hierarchical', 
      label: 'Hierarchical', 
      icon: List,
      description: 'Hierarchical table view'
    },
    // { 
    //   id: 'simple', 
    //   label: 'Simple Table', 
    //   icon: Table2,
    //   description: 'Flat table view'
    // },
    { 
      id: 'structure', 
      label: 'Reference Data', 
      icon: Layers,
      description: 'Manage reference data'
    },
    { 
      id: 'matrix', 
      label: 'Matrix', 
      icon: Grid,
      description: 'Hierarchy matrix view'
    }
  ];

  return (
    <div className="flex space-x-1 bg-white dark:bg-almet-cloud-burst rounded-lg p-1 shadow-sm mb-4 border border-gray-200 dark:border-almet-comet">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveView(tab.id)}
          title={tab.description}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all text-xs font-medium ${
            activeView === tab.id 
              ? 'bg-almet-sapphire text-white shadow-sm' 
              : 'text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-san-juan'
          }`}
        >
          <tab.icon size={14} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}