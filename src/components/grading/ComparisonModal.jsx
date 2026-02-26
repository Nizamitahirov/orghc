import React, { useState } from "react";
import { X, TrendingUp, TrendingDown, Minus, DollarSign, Users, AlertCircle, BarChart3 } from "lucide-react";
import Pagination from '../common/Pagination';

const ComparisonModal = ({ isOpen, onClose, comparisonData, scenarios }) => {
  const [activeSection, setActiveSection] = useState('total_cost');
  
  if (!isOpen || !comparisonData) return null;
  
  const formatCurrency = (value) => {
    return Math.round(value || 0).toLocaleString();
  };
  
  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };
  
  const getScenarioName = (scenarioId) => {
    if (scenarioId === 'current') return 'Current';
    const scenario = scenarios.find(s => s.id === scenarioId);
    return scenario?.name || 'Unknown';
  };
  
  const sections = [
    { id: 'total_cost', name: 'Total Cost', icon: DollarSign },
    { id: 'headcount', name: 'Employee Analysis', icon: Users },
    { id: 'underpaid_overpaid', name: 'Salary Differences', icon: AlertCircle },
    { id: 'percentage_comparison', name: 'Percentage Comparison', icon: BarChart3 }
  ];
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral px-6 py-4 border-b border-blue-300">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Scenario Comparison
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Detailed analysis of {scenarios.length} scenarios
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Section Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white text-almet-sapphire shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <section.icon size={14} />
                {section.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-50">
          {activeSection === 'total_cost' && (
            <TotalCostSection 
              data={comparisonData.total_cost_comparison}
              getScenarioName={getScenarioName}
              formatCurrency={formatCurrency}
            />
          )}
          
          {activeSection === 'headcount' && (
            <EmployeeAnalysisSection 
              data={comparisonData.employee_analysis}
              getScenarioName={getScenarioName}
            />
          )}
          
          {activeSection === 'underpaid_overpaid' && (
            <UnderpaidOverpaidSection 
              data={comparisonData.underpaid_overpaid_lists}
              getScenarioName={getScenarioName}
              formatCurrency={formatCurrency}
              formatPercentage={formatPercentage}
            />
          )}
          
          {activeSection === 'percentage_comparison' && (
            <PercentageComparisonSection 
              data={comparisonData.scenarios_comparison}
              getScenarioName={getScenarioName}
              formatPercentage={formatPercentage}
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Total Cost Section
const TotalCostSection = ({ data, getScenarioName, formatCurrency }) => {
  if (!data) return <div className="text-sm text-gray-500">No data available</div>;
  
  const positions = Object.keys(data.positions || {});
  const scenarioNames = Object.keys(data.positions[positions[0]]?.scenarios || {});
  
  return (
    <div className="space-y-4">
      
      {/* Totals Card */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Total Cost Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
            <div className="text-xs text-gray-600 mb-1">Current Status</div>
            <div className="text-base font-bold text-green-700">
              {formatCurrency(data.totals.current)}
            </div>
          </div>
          {scenarioNames.map(scenarioName => {
            const diff = data.totals.scenarios[scenarioName] - data.totals.current;
            return (
              <div key={scenarioName} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="text-xs text-gray-600 mb-1">{scenarioName}</div>
                <div className="text-base font-bold text-almet-sapphire">
                  {formatCurrency(data.totals.scenarios[scenarioName])}
                </div>
                <div className={`text-xs mt-1 font-medium ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Position Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-almet-sapphire to-almet-steel-blue text-white">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Position</th>
                <th className="px-3 py-2 text-right font-medium">Current</th>
                {scenarioNames.map(name => (
                  <th key={name} className="px-3 py-2 text-right font-medium">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {positions.map((position, idx) => (
                <tr key={position} className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-3 py-2 font-medium text-gray-700">{position}</td>
                  <td className="px-3 py-2 text-right font-mono text-green-700">
                    {formatCurrency(data.positions[position].current)}
                  </td>
                  {scenarioNames.map(scenarioName => {
                    const scenarioValue = data.positions[position].scenarios[scenarioName];
                    const currentValue = data.positions[position].current;
                    const diff = scenarioValue - currentValue;
                    
                    return (
                      <td key={scenarioName} className="px-3 py-2 text-right">
                        <div className="font-mono text-almet-sapphire">{formatCurrency(scenarioValue)}</div>
                        <div className={`text-[10px] font-medium ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Employee Analysis Section
const EmployeeAnalysisSection = ({ data, getScenarioName }) => {
  if (!data) return <div className="text-sm text-gray-500">No data available</div>;
  
  const positions = Object.keys(data);
  
  return (
    <div className="space-y-4">
      {positions.map(position => {
        const positionData = data[position];
        const currentGrades = Object.keys(positionData.current_grading);
        const scenarioNames = Object.keys(positionData.scenarios);
        
        return (
          <div key={position} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {position} <span className="text-gray-500 font-normal">({positionData.total_employees} employees)</span>
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Grade</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-600">Current</th>
                    {scenarioNames.map(name => (
                      <th key={name} className="px-3 py-2 text-center font-medium text-gray-600">{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentGrades.map(grade => (
                    <tr key={grade} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-700">{grade}</td>
                      <td className="px-3 py-2">
                        <GradeDistributionCell data={positionData.current_grading[grade]} />
                      </td>
                      {scenarioNames.map(scenarioName => (
                        <td key={scenarioName} className="px-3 py-2">
                          <GradeDistributionCell 
                            data={positionData.scenarios[scenarioName][grade] || { count: 0, over: 0, at: 0, under: 0 }} 
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Grade Distribution Cell
const GradeDistributionCell = ({ data }) => {
  if (!data || data.count === 0) {
    return <div className="text-center text-gray-300">—</div>;
  }
  
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="font-semibold text-gray-700">{data.count}</span>
      <div className="flex gap-1">
        {data.over > 0 && (
          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
            ↑{data.over}
          </span>
        )}
        {data.at > 0 && (
          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
            ={data.at}
          </span>
        )}
        {data.under > 0 && (
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
            ↓{data.under}
          </span>
        )}
      </div>
    </div>
  );
};

// Underpaid/Overpaid Section
const UnderpaidOverpaidSection = ({ data, getScenarioName, formatCurrency, formatPercentage }) => {
  if (!data) return <div className="text-sm text-gray-500">No data available</div>;
  
  const scenarioNames = Object.keys(data);
  const [selectedScenario, setSelectedScenario] = useState(scenarioNames[0]);
  const [activeTab, setActiveTab] = useState('underpaid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const scenarioData = data[selectedScenario] || { underpaid: [], overpaid: [] };
  const activeList = activeTab === 'underpaid' ? scenarioData.underpaid : scenarioData.overpaid;
  
  const totalPages = Math.ceil(activeList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = activeList.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('underpaid'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'underpaid'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
            }`}
          >
            Underpaid ({scenarioData.underpaid.length})
          </button>
          <button
            onClick={() => { setActiveTab('overpaid'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'overpaid'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            Overpaid ({scenarioData.overpaid.length})
          </button>
        </div>
        
        <select
          value={selectedScenario}
          onChange={(e) => { setSelectedScenario(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
        >
          {scenarioNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      
      {/* Employee Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-almet-sapphire to-almet-steel-blue text-white">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Employee</th>
                <th className="px-3 py-2 text-left font-medium">Position</th>
                <th className="px-3 py-2 text-left font-medium">Grade</th>
                <th className="px-3 py-2 text-right font-medium">Current Salary</th>
                <th className="px-3 py-2 text-right font-medium">Scenario Salary</th>
                <th className="px-3 py-2 text-right font-medium">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedList.length > 0 ? (
                paginatedList.map((emp, idx) => (
                  <tr key={emp.employee_id} className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-700">{emp.employee_name}</div>
                      <div className="text-[10px] text-gray-500">{emp.employee_id}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{emp.position}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{emp.grading_level}</td>
                    <td className="px-3 py-2 text-right font-mono text-green-700">
                      {formatCurrency(emp.current_salary)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-almet-sapphire">
                      {formatCurrency(emp.scenario_salary)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className={`font-mono font-semibold ${
                        emp.difference > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {emp.difference > 0 ? '+' : ''}{formatCurrency(emp.difference)}
                      </div>
                      <div className={`text-[10px] ${
                        emp.difference_percent > 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        ({emp.difference_percent > 0 ? '+' : ''}{formatPercentage(emp.difference_percent)})
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-3 py-8 text-center text-gray-500">
                    No {activeTab} employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={activeList.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Percentage Comparison Section
const PercentageComparisonSection = ({ data, getScenarioName, formatPercentage, formatCurrency }) => {
  if (!data) return <div className="text-sm text-gray-500">No data available</div>;
  
  const positions = Object.keys(data);
  const [selectedPosition, setSelectedPosition] = useState(positions[0]);
  
  const positionData = data[selectedPosition];
  const scenarioNames = Object.keys(positionData.scenarios);
  const levels = ['LD', 'LQ', 'M', 'UQ', 'UD'];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">
          Percentage change vs Current
        </h3>
        
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
        >
          {positions.map(pos => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-almet-sapphire to-almet-steel-blue text-white">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Level</th>
                <th className="px-3 py-2 text-right font-medium">Current</th>
                {scenarioNames.map(name => (
                  <React.Fragment key={name}>
                    <th className="px-3 py-2 text-right font-medium">{name}</th>
                    <th className="px-3 py-2 text-right font-medium">% Diff</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {levels.map((level, idx) => (
                <tr key={level} className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-3 py-2 font-medium text-gray-700">{level}</td>
                  <td className="px-3 py-2 text-right font-mono text-green-700">
                    {formatCurrency(positionData.current[level])}
                  </td>
                  {scenarioNames.map(scenarioName => {
                    const scenarioData = positionData.scenarios[scenarioName][level];
                    const diffPercent = scenarioData.diff_percent;
                    
                    return (
                      <React.Fragment key={scenarioName}>
                        <td className="px-3 py-2 text-right font-mono text-almet-sapphire">
                          {formatCurrency(scenarioData.value)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {diffPercent > 0.1 ? (
                              <TrendingUp size={12} className="text-red-500" />
                            ) : diffPercent < -0.1 ? (
                              <TrendingDown size={12} className="text-green-500" />
                            ) : (
                              <Minus size={12} className="text-gray-400" />
                            )}
                            <span className={`font-semibold ${
                              diffPercent > 0.1 ? 'text-red-600' :
                              diffPercent < -0.1 ? 'text-green-600' :
                              'text-gray-500'
                            }`}>
                              {diffPercent > 0 ? '+' : ''}{formatPercentage(diffPercent)}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {diffPercent > 0 ? '+' : ''}{formatCurrency(scenarioData.diff_amount)}
                          </div>
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;