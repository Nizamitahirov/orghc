import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Users, Target, BarChart3, Loader, User, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import SearchableDropdown from '@/components/common/SearchableDropdown';

export default function FixedAnalyticsDashboard({ 
  employees = [], 
  settings,
  darkMode,
  selectedYear,
  onLoadEmployeePerformance,
  isManager = false,
  canViewAll = false
}) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [loadingEmployeeData, setLoadingEmployeeData] = useState(false);
  
  // Accordion states
  const [expandedSections, setExpandedSections] = useState({
    distribution: true,
    department: false,
    position: false,
    competency: false
  });



  useEffect(() => {
    if (employees && employees.length > 0 && settings?.evaluationScale) {
      calculateAnalytics();
    }
  }, [employees, settings]);

  useEffect(() => {
    if (selectedEmployeeId && onLoadEmployeePerformance) {
      loadEmployeePerformanceData(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const loadEmployeePerformanceData = async (employeeId) => {
    setLoadingEmployeeData(true);
    try {
      const performanceData = await onLoadEmployeePerformance(employeeId, selectedYear);
      
      if (performanceData && performanceData.competency_ratings) {
        setSelectedEmployeeData(performanceData);
      } else {
        console.warn('⚠️ No competency ratings found');
        setSelectedEmployeeData(null);
      }
    } catch (error) {
      console.error('❌ Error loading employee performance:', error);
      setSelectedEmployeeData(null);
    } finally {
      setLoadingEmployeeData(false);
    }
  };

  const calculateAnalytics = () => {
    setLoading(true);
    try {
      const gradeDistribution = calculateGradeDistribution();
      const departmentStats = calculateDepartmentStats();
      const positionStats = calculatePositionStats();
      
      setAnalyticsData({
        gradeDistribution,
        departmentStats,
        positionStats,
        totalEmployees: employees.length
      });

    } catch (error) {
      console.error('❌ Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGradeDistribution = () => {
    if (!settings?.evaluationScale || !employees || employees.length === 0) {
      return [];
    }

    const sortedScales = [...settings.evaluationScale].sort((a, b) => b.value - a.value);
    
    const bellCurveDistribution = {
      5: 5,
      4: 15,
      3: 60,
      2: 15,
      1: 5
    };

    const gradeCounts = {};
    sortedScales.forEach(scale => {
      gradeCounts[scale.name] = 0;
    });

    let employeesWithRatings = 0;
    
    employees.forEach(emp => {
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);
      
      if (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0) {
        employeesWithRatings++;
        
        let grade = emp.final_rating;
        
        if (!grade) {
          const overallPct = parseFloat(emp.overall_weighted_percentage) || 
                           ((objPct * 70 + compPct * 30) / 100);
          
          const matchingScale = sortedScales.find(s => 
            overallPct >= parseFloat(s.range_min) && 
            overallPct <= parseFloat(s.range_max)
          );
          
          grade = matchingScale?.name || 'N/A';
        }
        
        if (gradeCounts[grade] !== undefined) {
          gradeCounts[grade]++;
        }
      }
    });

    const result = sortedScales.map((scale) => {
      const actualPercentage = employeesWithRatings > 0 
        ? Math.round((gradeCounts[scale.name] / employeesWithRatings) * 1000) / 10 
        : 0;
      
      const normPercentage = bellCurveDistribution[scale.value] || 0;
      
      return {
        grade: scale.name,
        norm: normPercentage,
        actual: actualPercentage,
        employeeCount: gradeCounts[scale.name],
        value: scale.value
      };
    });

    return result;
  };

  const calculateDepartmentStats = () => {
    if (!employees || employees.length === 0) return [];

    const deptMap = {};
    
    employees.forEach(emp => {
      const dept = emp.employee_department || emp.department || 'Unknown';
      
      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          totalEmployees: 0,
          completedCount: 0,
          totalScore: 0,
          scores: []
        };
      }
      
      deptMap[dept].totalEmployees++;
      
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);
      
      if (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0) {
        deptMap[dept].completedCount++;
        
        const overallPct = parseFloat(emp.overall_weighted_percentage) || 
                          ((objPct * 70 + compPct * 30) / 100);
        
        if (!isNaN(overallPct) && overallPct > 0) {
          deptMap[dept].totalScore += overallPct;
          deptMap[dept].scores.push(overallPct);
        }
      }
    });

    const result = Object.values(deptMap).map(dept => ({
      department: dept.department,
      employeeCount: dept.totalEmployees,
      completedCount: dept.completedCount,
      avgScore: dept.scores.length > 0 
        ? parseFloat((dept.totalScore / dept.scores.length).toFixed(1))
        : 0
    })).sort((a, b) => b.avgScore - a.avgScore);

    return result;
  };

  const calculatePositionStats = () => {
    if (!employees || employees.length === 0) return [];

    const posMap = {};
    
    employees.forEach(emp => {
      const pos = emp.employee_position_group || emp.position || 'Unknown';
      
      if (!posMap[pos]) {
        posMap[pos] = {
          position: pos,
          totalEmployees: 0,
          completedCount: 0,
          totalScore: 0,
          scores: []
        };
      }
      
      posMap[pos].totalEmployees++;
      
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);
      
      if (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0) {
        posMap[pos].completedCount++;
        
        const overallPct = parseFloat(emp.overall_weighted_percentage) || 
                          ((objPct * 70 + compPct * 30) / 100);
        
        if (!isNaN(overallPct) && overallPct > 0) {
          posMap[pos].totalScore += overallPct;
          posMap[pos].scores.push(overallPct);
        }
      }
    });

    const result = Object.values(posMap).map(pos => ({
      position: pos.position,
      employeeCount: pos.totalEmployees,
      completedCount: pos.completedCount,
      avgScore: pos.scores.length > 0 
        ? parseFloat((pos.totalScore / pos.scores.length).toFixed(1))
        : 0
    })).sort((a, b) => b.avgScore - a.avgScore);

    return result;
  };

  const getEmployeeCompetencyData = () => {
    if (!selectedEmployeeData?.competency_ratings) {
      return [];
    }

    const groupMap = {};
    
    selectedEmployeeData.competency_ratings.forEach(comp => {
      const groupName = comp.main_group_name || comp.competency_group_name || 'Other';
      
      if (!groupMap[groupName]) {
        groupMap[groupName] = {
          group: groupName,
          totalRequired: 0,
          totalActual: 0,
          count: 0
        };
      }
      
      const required = parseFloat(comp.required_level) || 0;
      const actual = parseFloat(comp.end_year_rating_value) || 0;
      
      groupMap[groupName].totalRequired += required;
      groupMap[groupName].totalActual += actual;
      groupMap[groupName].count++;
    });

    const result = Object.values(groupMap).map(group => ({
      competency: group.group,
      percentage: group.totalRequired > 0 
        ? Math.round((group.totalActual / group.totalRequired) * 100)
        : 0,
      required: group.totalRequired,
      actual: group.totalActual
    }));

    return result;
  };

  const getEligibleEmployees = () => {
    return employees.filter(emp => {
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);
      return !isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0;
    });
  };

  const employeeOptions = getEligibleEmployees().map(emp => ({
    value: emp.id,
    label: `${emp.employee_name || emp.name} - ${emp.employee_position_group || emp.position}`,
    id: emp.id
  }));

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  // ✅ Access level message
  const getAccessMessage = () => {
    if (canViewAll) {
      return {
        type: 'info',
        message: 'Analytics for all employees'
      };
    }
    if (isManager) {
      return {
        type: 'info',
        message: 'Analytics for you and your direct reports'
      };
    }
    return {
      type: 'warning',
      message: 'Analytics based on your accessible employees'
    };
  };

  const accessMessage = getAccessMessage();

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} rounded-xl p-8 flex items-center justify-center`}>
        <Loader className="w-8 h-8 animate-spin text-almet-sapphire" />
      </div>
    );
  }

  if (!analyticsData || !analyticsData.gradeDistribution || analyticsData.gradeDistribution.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} rounded-xl p-8 text-center`}>
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium mb-2">No analytics data available</p>
        <p className="text-sm text-gray-400">Complete some performance reviews to see analytics</p>
      </div>
    );
  }

  const COLORS = {
    norm: '#10b981',
    actual: '#ef4444',
    primary: '#0ea5e9',
    secondary: '#8b5cf6'
  };

  return (
    <div className="space-y-4">
      {/* ✅ Access Level Info */}
      <div className={`${
        accessMessage.type === 'info' 
          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30' 
          : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30'
      } border rounded-xl p-3`}>
        <div className="flex items-start gap-2">
          <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
            accessMessage.type === 'info' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-amber-600 dark:text-amber-400'
          }`} />
          <p className={`text-xs ${
            accessMessage.type === 'info' 
              ? 'text-blue-700 dark:text-blue-400' 
              : 'text-amber-700 dark:text-amber-400'
          }`}>
            {accessMessage.message}
          </p>
        </div>
      </div>

      {/* Grade Distribution Section */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
        <button
          onClick={() => toggleSection('distribution')}
          className={`w-full px-5 py-3 flex items-center justify-between ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-almet-sapphire" />
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Grade Distribution Analysis
            </h3>
          </div>
          {expandedSections.distribution ? 
            <ChevronUp className="w-5 h-5 text-gray-400" /> : 
            <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </button>
        
        {expandedSections.distribution && (
          <div className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="grade" stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: '12px' }} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'norm') return [`${value}%`, 'Expected'];
                    if (name === 'actual') return [`${value}%`, 'Actual'];
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="norm" stroke={COLORS.norm} strokeWidth={2} name="Expected" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="actual" stroke={COLORS.actual} strokeWidth={2} name="Actual" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Grade</th>
                    <th className="px-3 py-2 text-right font-semibold">Expected</th>
                    <th className="px-3 py-2 text-right font-semibold">Actual</th>
                    <th className="px-3 py-2 text-right font-semibold">Count</th>
                    <th className="px-3 py-2 text-right font-semibold">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analyticsData.gradeDistribution.map((item) => {
                    const variance = (item.actual - item.norm).toFixed(1);
                    return (
                      <tr key={item.grade} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-3 py-2 font-bold text-almet-sapphire">{item.grade}</td>
                        <td className="px-3 py-2 text-right">{item.norm}%</td>
                        <td className="px-3 py-2 text-right font-semibold">{item.actual}%</td>
                        <td className="px-3 py-2 text-right">{item.employeeCount}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${
                          variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {variance > 0 ? '+' : ''}{variance}%
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

      {/* Department Performance Section */}
      {analyticsData.departmentStats && analyticsData.departmentStats.length > 0 && (
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
          <button
            onClick={() => toggleSection('department')}
            className={`w-full px-5 py-3 flex items-center justify-between ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-almet-sapphire" />
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Department Performance
              </h3>
            </div>
            {expandedSections.department ? 
              <ChevronUp className="w-5 h-5 text-gray-400" /> : 
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </button>
          
          {expandedSections.department && (
            <div className="px-5 pb-5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.departmentStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis type="number" stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: '11px' }} />
                  <YAxis dataKey="department" type="category" width={120} stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="avgScore" fill={COLORS.primary} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Position Performance Section */}
      {analyticsData.positionStats && analyticsData.positionStats.length > 0 && (
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
          <button
            onClick={() => toggleSection('position')}
            className={`w-full px-5 py-3 flex items-center justify-between ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-almet-sapphire" />
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Position Performance
              </h3>
            </div>
            {expandedSections.position ? 
              <ChevronUp className="w-5 h-5 text-gray-400" /> : 
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </button>
          
          {expandedSections.position && (
            <div className="px-5 pb-5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.positionStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="position" stroke={darkMode ? '#9ca3af' : '#6b7280'} angle={-45} textAnchor="end" height={80} style={{ fontSize: '10px' }} />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="avgScore" fill={COLORS.secondary} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Employee Competency Section */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
        <button
          onClick={() => toggleSection('competency')}
          className={`w-full px-5 py-3 flex items-center justify-between ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}
        >
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-almet-sapphire" />
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Employee Competency Analysis
            </h3>
          </div>
          {expandedSections.competency ? 
            <ChevronUp className="w-5 h-5 text-gray-400" /> : 
            <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </button>
        
        {expandedSections.competency && (
          <div className="px-5 pb-5">
            <div className="mb-4">
              <SearchableDropdown
                options={employeeOptions}
                value={selectedEmployeeId}
                onChange={(value) => {
                  setSelectedEmployeeId(value);
                  if (!value) {
                    setSelectedEmployeeData(null);
                  }
                }}
                placeholder="-- Search and select an employee --"
                searchPlaceholder="Search by name or position..."
                darkMode={darkMode}
                icon={<User size={14} />}
                allowUncheck={true}
                className="w-full"
              />
              
              {employeeOptions.length === 0 && (
                <p className={`text-xs mt-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  ⚠️ No employees with completed performance found
                </p>
              )}
            </div>

            {loadingEmployeeData && (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-almet-sapphire mr-2" />
                <p className="text-xs text-gray-500">Loading...</p>
              </div>
            )}

            {!loadingEmployeeData && selectedEmployeeId && selectedEmployee && selectedEmployeeData && (
              <>
                <div className="mb-3">
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedEmployee.employee_name || selectedEmployee.name}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedEmployee.employee_position_group || selectedEmployee.position} • {selectedEmployee.employee_department || selectedEmployee.department}
                  </p>
                  
                  {selectedEmployeeData.metadata && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        selectedEmployeeData.metadata.competency_type === 'LEADERSHIP'
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {selectedEmployeeData.metadata.competency_type === 'LEADERSHIP' ? '👔 Leadership' : '🎯 Behavioral'}
                      </span>
                    </div>
                  )}
                </div>
                
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={getEmployeeCompetencyData()}>
                    <PolarGrid stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <PolarAngleAxis dataKey="competency" stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: '11px' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: '10px' }} />
                    <Radar name="Score" dataKey="percentage" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} strokeWidth={2} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </>
            )}

            {!loadingEmployeeData && !selectedEmployeeId && (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs text-gray-500">Select an employee to view competency analysis</p>
              </div>
            )}

            {!loadingEmployeeData && selectedEmployeeId && !selectedEmployeeData && (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-400" />
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Failed to load data</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}