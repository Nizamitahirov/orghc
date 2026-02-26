// src/components/grading/CurrentStructureCard.jsx - Dark mode düzəldilmiş
import React from "react";
import { BarChart3, Target, CheckCircle } from "lucide-react";

const CurrentStructureCard = ({ currentData, basePositionName }) => {
  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (value, decimals = 1) => {
    const numValue = value || 0;
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic dark:border-gray-700">
      {/* Simplified Header */}
      <div className="px-4 py-3 border-b border-almet-mystic dark:border-gray-700">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-almet-sapphire dark:text-almet-sapphire" />
          <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white">
            Current Grade Structure
          </h3>
        </div>
      </div>
      
      <div className="p-4">
        {/* Simplified metrics - horizontal layout */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-almet-mystic dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-almet-sapphire dark:text-almet-sapphire">
              {formatPercentage(currentData?.verticalAvg)}
            </div>
            <div className="text-xs text-almet-waterloo dark:text-gray-300">Vertical Avg</div>
          </div>
          
          <div className="text-center p-3 bg-almet-mystic dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-almet-sapphire dark:text-almet-sapphire">
              {formatPercentage(currentData?.horizontalAvg)}
            </div>
            <div className="text-xs text-almet-waterloo dark:text-gray-300">Horizontal Avg</div>
          </div>
          
          <div className="text-center p-3 bg-almet-mystic dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-almet-sapphire dark:text-almet-sapphire">
              {formatCurrency(currentData?.baseValue1)}
            </div>
            <div className="text-xs text-almet-waterloo dark:text-gray-300">Base Value</div>
          </div>
        </div>

        {/* Simplified Structure Table */}
        <div className="bg-almet-mystic/50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-almet-mystic dark:border-gray-600">
                  <th className="text-left py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">
                    Grade
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">LD</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">LQ</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Median</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">UQ</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">UD</th>
                </tr>
              </thead>
              <tbody>
                {(currentData?.gradeOrder || []).map((gradeName, index) => {
                  const values = currentData?.grades?.[gradeName] || {};
                  const isBasePosition = gradeName === basePositionName;
                  const isTopPosition = index === 0;
                  
                  return (
                    <tr 
                      key={gradeName} 
                      className={`border-b border-almet-mystic/30 dark:border-gray-600/30 hover:bg-white/50 dark:hover:bg-gray-700/50 ${
                        isBasePosition ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <td className="py-2 px-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-almet-sapphire' : 'bg-almet-waterloo dark:bg-gray-500'
                          }`} />
                          <span className="font-medium text-almet-cloud-burst dark:text-white">{gradeName}</span>
                          {isBasePosition && (
                            <Target size={8} className="text-almet-sapphire dark:text-almet-sapphire" />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xs text-right font-mono text-almet-waterloo dark:text-gray-300">
                        {formatCurrency(values.LD)}
                      </td>
                      <td className="py-2 px-2 text-xs text-right font-mono text-almet-waterloo dark:text-gray-300">
                        {formatCurrency(values.LQ)}
                      </td>
                      <td className="py-2 px-2 text-xs text-right font-mono font-semibold text-almet-cloud-burst dark:text-white">
                        {formatCurrency(values.M)}
                      </td>
                      <td className="py-2 px-2 text-xs text-right font-mono text-almet-waterloo dark:text-gray-300">
                        {formatCurrency(values.UQ)}
                      </td>
                      <td className="py-2 px-2 text-xs text-right font-mono text-almet-waterloo dark:text-gray-300">
                        {formatCurrency(values.UD)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentStructureCard;