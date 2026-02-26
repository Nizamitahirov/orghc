import React from "react";
import { Plus, Target, Settings, CheckCircle, AlertTriangle, RefreshCw, Save } from "lucide-react";

const CreateScenarioCard = ({
  scenarioInputs,
  newScenarioDisplayData,
  basePositionName,
  validationSummary,
  errors,
  loading,
  isCalculating,
  handleBaseValueChange,
  handleVerticalChange,
  handleGlobalHorizontalChange,
  handleSaveDraft,
  scenarioName,
  onScenarioNameChange
}) => {
  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const safeValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Plus size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Create New Scenario
          </h3>
          {isCalculating && (
            <RefreshCw size={14} className="animate-spin text-blue-600 dark:text-blue-400 ml-auto" />
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Scenario Name Input */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">
            <Plus size={12} className="text-blue-600 dark:text-blue-400" />
            Scenario Name
          </label>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => onScenarioNameChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter scenario name (e.g., Q1 2025 Adjustment)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Leave empty for auto-generated name
          </p>
        </div>

        {/* Base Value Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">
              <Target size={12} className="text-blue-600 dark:text-blue-400" />
              Base Value ({basePositionName})
            </label>
            <input
              type="number"
              value={scenarioInputs.baseValue1 || ''}
              onChange={(e) => handleBaseValueChange(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all ${
                errors.baseValue1 ? "border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-600" : "border-blue-300 dark:border-blue-700"
              }`}
              placeholder="Enter base salary"
            />
            {errors.baseValue1 && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-2 flex items-center gap-1">
                <AlertTriangle size={12} />
                {errors.baseValue1}
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-end">
            <button
              onClick={handleSaveDraft}
              disabled={!validationSummary?.canSave || loading.saving}
              className={`w-full px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                validationSummary?.canSave && !loading.saving
                  ? "bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700 shadow-sm hover:shadow-md"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading.saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Draft
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Horizontal Intervals */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
          <h4 className="text-xs font-medium text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Settings size={12} className="text-amber-600 dark:text-amber-400" />
            Global Horizontal Intervals
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].map((intervalKey) => {
              const displayName = intervalKey.replace(/_to_/g, '→').replace(/_/g, ' ');
              const errorKey = `global-horizontal-${intervalKey}`;
              
              return (
                <div key={intervalKey}>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {displayName}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scenarioInputs.globalHorizontalIntervals?.[intervalKey] || ''}
                      onChange={(e) => handleGlobalHorizontalChange(intervalKey, e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-lg text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all ${
                        errors[errorKey] ? "border-red-400 dark:border-red-600" : "border-amber-300 dark:border-amber-700"
                      }`}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 font-medium">%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Position Table */}
        {newScenarioDisplayData && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-medium text-gray-800 dark:text-gray-100">
                Real-time Results
              </h4>
              {newScenarioDisplayData.calculationProgress && (
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                  {newScenarioDisplayData.calculationProgress.calculatedPositions}/
                  {newScenarioDisplayData.calculationProgress.totalPositions}
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">Grade</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">Vertical %</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">LD</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">LQ</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">Median</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">UQ</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">UD</th>
                  </tr>
                </thead>
                <tbody>
                  {newScenarioDisplayData.gradeOrder.map((gradeName, index) => {
                    const gradeData = newScenarioDisplayData.grades[gradeName] || {};
                    const isBasePosition = gradeName === basePositionName;
                    const isTopPosition = index === 0;
                    const errorKey = `vertical-${gradeName}`;
                    
                    const ldValue = isBasePosition && scenarioInputs.baseValue1 > 0 
                      ? Math.round(parseFloat(scenarioInputs.baseValue1)) 
                      : safeValue(gradeData.LD);

                    return (
                      <tr 
                        key={gradeName} 
                        className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                          isBasePosition ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <td className="py-2 px-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-500'
                            }`} />
                            <span className="font-medium text-gray-900 dark:text-white">{gradeName}</span>
                            {isBasePosition && <Target size={10} className="text-blue-600 dark:text-blue-400" />}
                          </div>
                        </td>
                        
                        <td className="py-2 px-2 text-center">
                          {!isBasePosition ? (
                            <div className="relative inline-block">
                              <input
                                type="number"
                                value={gradeData.vertical || ''}
                                onChange={(e) => handleVerticalChange(gradeName, e.target.value)}
                                className={`w-16 px-1 py-1 text-xs border rounded text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all ${
                                  errors[errorKey] ? "border-red-400 dark:border-red-600" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="0"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                              <span className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">Base</span>
                          )}
                        </td>
                        
                        <td className="py-2 px-2 text-center">
                          {gradeData.isCalculated ? (
                            <CheckCircle size={10} className="text-green-600 dark:text-green-400 mx-auto" />
                          ) : isBasePosition && scenarioInputs.baseValue1 > 0 ? (
                            <Target size={10} className="text-blue-600 dark:text-blue-400 mx-auto" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-auto"></div>
                          )}
                        </td>
                        
                        {/* Calculated Values */}
                        <td className="py-2 px-2 text-xs text-right font-mono">
                          {ldValue > 0 ? (
                            <span className={`font-medium ${
                              isBasePosition ? "text-blue-700 dark:text-blue-400" : 
                              gradeData.isCalculated ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
                            }`}>
                              {formatCurrency(ldValue)}
                              {isBasePosition && scenarioInputs.baseValue1 > 0 && !gradeData.isCalculated && (
                                <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(Input)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-xs text-right font-mono">
                          <span className={`font-medium ${gradeData.LQ && gradeData.LQ !== "" ? "text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                            {gradeData.LQ && gradeData.LQ !== "" ? formatCurrency(gradeData.LQ) : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-right font-mono">
                          <span className={`font-semibold ${gradeData.M && gradeData.M !== "" ? "text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                            {gradeData.M && gradeData.M !== "" ? formatCurrency(gradeData.M) : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-right font-mono">
                          <span className={`font-medium ${gradeData.UQ && gradeData.UQ !== "" ? "text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                            {gradeData.UQ && gradeData.UQ !== "" ? formatCurrency(gradeData.UQ) : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-right font-mono">
                          <span className={`font-medium ${gradeData.UD && gradeData.UD !== "" ? "text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                            {gradeData.UD && gradeData.UD !== "" ? formatCurrency(gradeData.UD) : "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateScenarioCard;