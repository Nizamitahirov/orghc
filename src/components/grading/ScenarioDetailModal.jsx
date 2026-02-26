// src/components/grading/ScenarioDetailModal.jsx - Dark mode düzəldilmiş - TAM VERSİYA
import React from "react";
import { X, Target, Settings, CheckCircle, Archive, RefreshCw, Info } from "lucide-react";

const ScenarioDetailModal = ({
  isOpen,
  onClose,
  selectedScenario,
  compareMode,
  selectedForComparison,
  currentData,
  basePositionName,
  loading,
  getScenarioForComparison,
  getVerticalInputValue,
  getHorizontalInputValues,
  handleSaveAsCurrent,
  handleArchiveDraft
}) => {
  if (!isOpen) return null;

  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (value, decimals = 1) => {
    const numValue = value || 0;
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  const safeValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-almet-mystic dark:border-gray-700 shadow-2xl custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-almet-mystic dark:border-gray-700 px-4 py-3 rounded-t-xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                {compareMode && selectedForComparison.length >= 2 ? 
                  `Scenario Comparison (${selectedForComparison.length})` : 
                  selectedScenario ? `${selectedScenario.name}` : 'Scenario Details'
                }
              </h2>
              <p className="text-xs text-almet-waterloo dark:text-gray-300">
                {compareMode ? 'Compare multiple scenarios' : 'Detailed scenario analysis'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-almet-waterloo hover:text-almet-cloud-burst dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-almet-mystic dark:hover:bg-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {compareMode && selectedForComparison.length >= 2 ? (
            // Comparison View
            <div className="space-y-4">
              {/* Comparison Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedForComparison.map(scenarioId => {
                  const comparisonData = getScenarioForComparison(scenarioId);
                  if (!comparisonData) return null;
                  
                  const { data, name, status } = comparisonData;
                  const horizontalInputs = getHorizontalInputValues(scenarioId);
                  
                  return (
                    <div key={scenarioId} className={`p-3 border rounded-lg ${
                      status === 'current' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-almet-mystic dark:bg-gray-700 border-almet-bali-hai dark:border-gray-600'
                    }`}>
                      <h4 className="font-medium text-sm mb-3 text-almet-cloud-burst dark:text-white flex items-center gap-2">
                        {status === 'current' && <CheckCircle size={12} className="text-green-600 dark:text-green-400" />}
                        {name}
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-almet-waterloo dark:text-gray-300">Base:</span>
                          <span className="font-medium text-almet-cloud-burst dark:text-white">{formatCurrency(data?.baseValue1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-almet-waterloo dark:text-gray-300">Vertical:</span>
                          <span className="font-medium text-almet-sapphire dark:text-almet-sapphire">{formatPercentage(data?.verticalAvg)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-almet-waterloo dark:text-gray-300">Horizontal:</span>
                          <span className="font-medium text-almet-sapphire dark:text-almet-sapphire">{formatPercentage(data?.horizontalAvg)}</span>
                        </div>
                      </div>
                      
                      {/* Horizontal Input Display */}
                      {horizontalInputs && Object.values(horizontalInputs).some(v => safeValue(v) > 0) && (
                        <div className="mt-3 pt-3 border-t border-almet-mystic dark:border-gray-600">
                          <div className="text-xs font-medium text-almet-cloud-burst dark:text-white mb-2 flex items-center gap-1">
                            <Settings size={10} />
                            Intervals:
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {Object.entries(horizontalInputs).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-almet-waterloo dark:text-gray-300 truncate">
                                  {key.replace(/_to_/g, '→').replace(/_/g, ' ')}
                                </span>
                                <span className="font-mono font-medium text-almet-sapphire dark:text-almet-sapphire">
                                  {safeValue(value).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Comparison Table */}
              <div className="bg-almet-mystic/30 dark:bg-gray-700/30 rounded-lg p-4 border border-almet-bali-hai/20 dark:border-gray-600">
                <h3 className="text-sm font-medium mb-3 text-almet-cloud-burst dark:text-white">Position Comparison</h3>
                <div className="overflow-x-auto custom-scrollbar-table">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-almet-mystic dark:border-gray-600">
                        <th className="text-left py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Grade</th>
                        {selectedForComparison.map(scenarioId => {
                          const comparisonData = getScenarioForComparison(scenarioId);
                          return comparisonData ? (
                            <th key={scenarioId} className="text-center py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">
                              <div className="flex items-center justify-center gap-1">
                                {scenarioId === 'current' && <CheckCircle size={8} className="text-green-600 dark:text-green-400" />}
                                {comparisonData.name}
                              </div>
                            </th>
                          ) : null;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {(currentData?.gradeOrder || []).map((gradeName, index) => {
                        const isBasePosition = gradeName === basePositionName;
                        
                        return (
                          <tr key={gradeName} className="border-b border-almet-mystic/30 dark:border-gray-600/30 hover:bg-white/50 dark:hover:bg-gray-700/50">
                            <td className="py-2 px-2 text-xs">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  index === 0 ? 'bg-red-500' : isBasePosition ? 'bg-almet-sapphire' : 'bg-almet-waterloo dark:bg-gray-500'
                                }`} />
                                <span className="text-almet-cloud-burst dark:text-white">{gradeName}</span>
                                {isBasePosition && <Target size={8} className="text-almet-sapphire dark:text-almet-sapphire" />}
                              </div>
                            </td>
                            {selectedForComparison.map(scenarioId => {
                              const comparisonData = getScenarioForComparison(scenarioId);
                              const data = comparisonData?.data;
                              const gradeData = data?.grades?.[gradeName];
                              const verticalInput = getVerticalInputValue(scenarioId, gradeName);
                              
                              return (
                                <td key={scenarioId} className="py-2 px-2 text-center">
                                  {gradeData ? (
                                    <div>
                                      <div className={`font-mono text-xs font-semibold ${
                                        scenarioId === 'current' ? 'text-green-600 dark:text-green-400' : 'text-almet-sapphire dark:text-almet-sapphire'
                                      }`}>
                                        {formatCurrency(gradeData.M)}
                                      </div>
                                      {!isBasePosition && verticalInput !== null && verticalInput !== undefined && (
                                        <div className="text-xs text-almet-waterloo dark:text-gray-400">
                                          V: {safeValue(verticalInput).toFixed(1)}%
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-almet-waterloo dark:text-gray-400">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Horizontal Intervals Comparison */}
              <div className="bg-almet-mystic/30 dark:bg-gray-700/30 rounded-lg p-4 border border-almet-bali-hai/20 dark:border-gray-600">
                <h3 className="text-sm font-medium mb-3 text-almet-cloud-burst dark:text-white">
                  Horizontal Intervals
                </h3>
                <div className="overflow-x-auto custom-scrollbar-table">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-almet-mystic dark:border-gray-600">
                        <th className="text-left py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Interval</th>
                        {selectedForComparison.map(scenarioId => {
                          const comparisonData = getScenarioForComparison(scenarioId);
                          return comparisonData ? (
                            <th key={scenarioId} className="text-center py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">
                              <div className="flex items-center justify-center gap-1">
                                {scenarioId === 'current' && <CheckCircle size={8} className="text-green-600 dark:text-green-400" />}
                                {comparisonData.name}
                              </div>
                            </th>
                          ) : null;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].map(intervalKey => {
                        const displayName = intervalKey.replace(/_to_/g, ' → ').replace(/_/g, ' ');
                        
                        return (
                          <tr key={intervalKey} className="border-b border-almet-mystic/30 dark:border-gray-600/30">
                            <td className="py-2 px-2 text-xs font-medium text-almet-cloud-burst dark:text-white">{displayName}</td>
                            {selectedForComparison.map(scenarioId => {
                              const horizontalInputs = getHorizontalInputValues(scenarioId);
                              const intervalValue = horizontalInputs?.[intervalKey];
                              
                              return (
                                <td key={scenarioId} className="py-2 px-2 text-center">
                                  <span className={`font-mono text-xs font-semibold ${
                                    scenarioId === 'current' ? 'text-green-600 dark:text-green-400' : 'text-almet-sapphire dark:text-almet-sapphire'
                                  }`}>
                                    {safeValue(intervalValue).toFixed(1)}%
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : selectedScenario ? (
            <div className="space-y-4">
              {/* Scenario Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="text-center p-4 bg-almet-mystic dark:bg-gray-700 rounded-lg border border-almet-bali-hai/20 dark:border-gray-600">
                  <div className="text-lg font-bold text-almet-sapphire dark:text-almet-sapphire mb-1">
                    {formatCurrency(selectedScenario.data?.baseValue1 || selectedScenario.baseValue1)}
                  </div>
                  <div className="text-xs font-medium text-almet-cloud-burst dark:text-white">Base Value</div>
                  <div className="text-xs text-almet-waterloo dark:text-gray-300">{basePositionName}</div>
                </div>
                <div className="text-center p-4 bg-almet-mystic dark:bg-gray-700 rounded-lg border border-almet-bali-hai/20 dark:border-gray-600">
                  <div className="text-lg font-bold text-almet-sapphire dark:text-almet-sapphire mb-1">
                    {formatPercentage(selectedScenario.data?.verticalAvg !== undefined ? selectedScenario.data.verticalAvg : selectedScenario.vertical_avg)}
                  </div>
                  <div className="text-xs font-medium text-almet-cloud-burst dark:text-white">Vertical Average</div>
                  <div className="text-xs text-almet-waterloo dark:text-gray-300">Position transitions</div>
                </div>
                <div className="text-center p-4 bg-almet-mystic dark:bg-gray-700 rounded-lg border border-almet-bali-hai/20 dark:border-gray-600">
                  <div className="text-lg font-bold text-almet-sapphire dark:text-almet-sapphire mb-1">
                    {formatPercentage(selectedScenario.data?.horizontalAvg !== undefined ? selectedScenario.data.horizontalAvg : selectedScenario.horizontal_avg)}
                  </div>
                  <div className="text-xs font-medium text-almet-cloud-burst dark:text-white">Horizontal Average</div>
                  <div className="text-xs text-almet-waterloo dark:text-gray-300">Global intervals</div>
                </div>
               
              </div>

              {/* Global Intervals Display */}
              {(() => {
                const globalIntervals = selectedScenario.data?.globalHorizontalIntervals || {};
                let hasIntervals = Object.values(globalIntervals).some(v => safeValue(v) > 0);
                
                if (!hasIntervals && selectedScenario.input_rates) {
                  for (const [gradeName, gradeData] of Object.entries(selectedScenario.input_rates)) {
                    if (gradeData && gradeData.horizontal_intervals) {
                      Object.assign(globalIntervals, gradeData.horizontal_intervals);
                      hasIntervals = Object.values(globalIntervals).some(v => safeValue(v) > 0);
                      break;
                    }
                  }
                }
                
                return hasIntervals ? (
                  <div className={`rounded-lg p-4 border ${
                    selectedScenario.status === 'current' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-almet-mystic/30 dark:bg-gray-700/30 border-almet-bali-hai/20 dark:border-gray-600'
                  }`}>
                    <h3 className="font-medium text-sm text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                      <Settings size={14} className={selectedScenario.status === 'current' ? 'text-green-600 dark:text-green-400' : 'text-almet-sapphire dark:text-almet-sapphire'} />
                      {selectedScenario.status === 'current' ? 'Current Active' : 'Scenario'} Horizontal Intervals 
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries({
                        LD_to_LQ: globalIntervals.LD_to_LQ || 0,
                        LQ_to_M: globalIntervals.LQ_to_M || 0,
                        M_to_UQ: globalIntervals.M_to_UQ || 0,
                        UQ_to_UD: globalIntervals.UQ_to_UD || 0
                      }).map(([key, value]) => {
                        const displayName = key.replace(/_to_/g, ' → ').replace(/_/g, ' ');
                        return (
                          <div key={key} className="text-center p-3 bg-white dark:bg-gray-800 rounded border border-almet-mystic dark:border-gray-600">
                            <div className={`font-bold text-base mb-1 ${
                              selectedScenario.status === 'current' ? 'text-green-600 dark:text-green-400' : 'text-almet-sapphire dark:text-almet-sapphire'
                            }`}>
                              {safeValue(value).toFixed(1)}%
                            </div>
                            <div className="text-xs text-almet-waterloo dark:text-gray-300">{displayName}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Detailed Grade Table */}
              <div className="bg-almet-mystic/30 dark:bg-gray-700/30 rounded-lg p-4 border border-almet-bali-hai/20 dark:border-gray-600">
                <h3 className="text-sm font-medium mb-3 text-almet-cloud-burst dark:text-white">Detailed Grade Breakdown</h3>
                <div className="overflow-x-auto custom-scrollbar-table">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-almet-mystic dark:border-gray-600">
                        <th className="text-left py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Grade</th>
                        <th className="text-center py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Vertical %</th>
                        <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">LD</th>
                        <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">LQ</th>
                        <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Median</th>
                        <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">UQ</th>
                        <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">UD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedScenario.data?.gradeOrder || selectedScenario.gradeOrder || currentData?.gradeOrder || []).map((gradeName, index) => {
                        const scenarioData = selectedScenario.data || selectedScenario;
                        const values = scenarioData.grades?.[gradeName] || {};
                        const isBasePosition = gradeName === basePositionName;
                        const isTopPosition = index === 0;
                        
                        let verticalValue = getVerticalInputValue(selectedScenario.id, gradeName);
                        
                        return (
                          <tr key={gradeName} className={`border-b border-almet-mystic/30 dark:border-gray-600/30 hover:bg-white/50 dark:hover:bg-gray-700/50 ${
                            isBasePosition ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}>
                            <td className="py-2 px-2 text-xs">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-almet-sapphire' : 'bg-almet-waterloo dark:bg-gray-500'
                                }`} />
                                <span className="font-medium text-almet-cloud-burst dark:text-white">{gradeName}</span>
                                {isBasePosition && <Target size={8} className="text-almet-sapphire dark:text-almet-sapphire" />}
                              </div>
                            </td>
                            
                            <td className="py-2 px-2 text-xs text-center">
                              {!isBasePosition ? (
                                verticalValue !== null && verticalValue !== undefined ? (
                                  <span className={`font-mono font-medium px-2 py-1 rounded ${
                                    selectedScenario.status === 'current' 
                                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                                      : 'text-almet-sapphire dark:text-almet-sapphire bg-almet-mystic dark:bg-gray-700'
                                  }`}>
                                    {safeValue(verticalValue).toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-almet-waterloo dark:text-gray-400 italic">N/A</span>
                                )
                              ) : (
                                <span className="text-almet-sapphire dark:text-almet-sapphire font-medium">Base</span>
                              )}
                            </td>
                            
                            {/* Calculated Values */}
                            <td className="py-2 px-2 text-xs text-right font-mono text-almet-waterloo dark:text-gray-300">{formatCurrency(values.LD)}</td>
                            <td className="py-2 px-2 text-xs text-right font-mono text-almet-waterloo dark:text-gray-300">{formatCurrency(values.LQ)}</td>
                            <td className={`py-2 px-2 text-xs text-right font-mono font-semibold ${
                              selectedScenario.status === 'current' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-almet-sapphire dark:text-almet-sapphire'
                            }`}>
                              {formatCurrency(values.M)}
                            </td>
                            <td className="py-2 px-2 text-xs text-right font-mono text-almet-waterloo dark:text-gray-300">{formatCurrency(values.UQ)}</td>
                            <td className="py-2 px-2 text-xs text-right font-mono text-almet-waterloo dark:text-gray-300">{formatCurrency(values.UD)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons for Draft Scenarios Only */}
              {selectedScenario.status === 'draft' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-almet-mystic dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleSaveAsCurrent(selectedScenario.id);
                      onClose();
                    }}
                    disabled={loading.applying}
                    className="bg-almet-sapphire dark:bg-almet-sapphire text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-almet-astral dark:hover:bg-almet-astral transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.applying ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    Apply as Current
                  </button>
                  <button
                    onClick={() => {
                      handleArchiveDraft(selectedScenario.id);
                      onClose();
                    }}
                    disabled={loading.archiving}
                    className="bg-almet-waterloo dark:bg-gray-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-almet-comet dark:hover:bg-gray-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.archiving ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Archive size={14} />
                    )}
                    Archive
                  </button>
                </div>
              )}

              {/* Enhanced Info Display for Current Scenario */}
              {selectedScenario.status === 'current' && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h3 className="font-medium text-sm text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                    Currently Active Scenario
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
                      <div className="text-xs font-medium text-almet-cloud-burst dark:text-white mb-1">Applied</div>
                      <div className="text-xs text-almet-waterloo dark:text-gray-300">
                        {selectedScenario.applied_at ? new Date(selectedScenario.applied_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // No Scenario Selected
            <div className="text-center py-12">
              <div className="text-almet-waterloo dark:text-gray-400 mb-3">
                <Info size={48} className="mx-auto" />
              </div>
              <h3 className="text-base font-medium text-almet-waterloo dark:text-gray-300 mb-2">
                No Scenario Selected
              </h3>
              <p className="text-sm text-almet-waterloo/70 dark:text-gray-400">
                Please select a scenario to view details
              </p>
            </div>
          )}
        </div>
        
        {/* Custom Scroll Styles */}
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #2346A8 #e7ebf1;
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #e7ebf1;
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #2346A8, #336fa5);
            border-radius: 4px;
            border: 1px solid #e7ebf1;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #1e3a8a, #30539b);
          }
          
          .custom-scrollbar::-webkit-scrollbar-corner {
            background: #e7ebf1;
          }
          
          .custom-scrollbar-table {
            scrollbar-width: thin;
            scrollbar-color: #90a0b9 #e7ebf1;
          }
          
          .custom-scrollbar-table::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .custom-scrollbar-table::-webkit-scrollbar-track {
            background: #e7ebf1;
            border-radius: 3px;
          }
          
          .custom-scrollbar-table::-webkit-scrollbar-thumb {
            background: #90a0b9;
            border-radius: 3px;
          }
          
          .custom-scrollbar-table::-webkit-scrollbar-thumb:hover {
            background: #7a829a;
          }
          
          /* Dark mode scrollbar */
          .dark .custom-scrollbar {
            scrollbar-color: #336fa5 #4f5772;
          }
          
          .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #4f5772;
          }
          
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #336fa5, #4e7db5);
            border: 1px solid #4f5772;
          }
          
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #30539b, #38587d);
          }
          
          .dark .custom-scrollbar::-webkit-scrollbar-corner {
            background: #4f5772;
          }
          
          .dark .custom-scrollbar-table::-webkit-scrollbar-track {
            background: #4f5772;
          }
          
          .dark .custom-scrollbar-table::-webkit-scrollbar-thumb {
            background: #7a829a;
          }
          
          .dark .custom-scrollbar-table::-webkit-scrollbar-thumb:hover {
            background: #9c9cb5;
          }
          
          /* Smooth scrolling */
          .custom-scrollbar {
            scroll-behavior: smooth;
          }
          
          /* Firefox scrollbar styling */
          @supports (scrollbar-width: thin) {
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #2346A8 #e7ebf1;
            }
            
            .dark .custom-scrollbar {
              scrollbar-color: #336fa5 #4f5772;
            }
            
            .custom-scrollbar-table {
              scrollbar-width: thin;
              scrollbar-color: #90a0b9 #e7ebf1;
            }
            
            .dark .custom-scrollbar-table {
              scrollbar-color: #7a829a #4f5772;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ScenarioDetailModal;