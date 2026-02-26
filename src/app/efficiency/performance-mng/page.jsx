"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import performanceApi from "@/services/performanceService";
import competencyApi from "@/services/competencyApi";

// Component Imports
import PerformanceHeader from "@/components/performance/PerformanceHeader";
import PerformanceDashboard from "@/components/performance/PerformanceDashboard";
import EmployeePerformanceDetail from "@/components/performance/EmployeePerformanceDetail";

// Common Components
import { LoadingSpinner, ErrorDisplay } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/Toast";

// Icons
import { Loader, Users } from 'lucide-react';

export default function PerformanceManagementPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  // UI State
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ NEW: Simplified User Access (Job Description style)
  const [userAccess, setUserAccess] = useState({
    can_view_all: false,
    is_manager: false,
    is_admin: false,
    access_level: '',
    accessible_count: 0,
    employee_id: null,
    employee_name: ''
  });

  // Performance Year Data
  const [activeYear, setActiveYear] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [performanceYears, setPerformanceYears] = useState([]);

  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [employees, setEmployees] = useState([]);

  // Employee Detail
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState(null);
  const [performanceData, setPerformanceData] = useState({});

  // Settings & References
  const [settings, setSettings] = useState({
    weightConfigs: [],
    goalLimits: { min: 3, max: 7 },
    departmentObjectives: [],
    evaluationScale: [],
    evaluationTargets: { objective_score_target: 21 },
    statusTypes: []
  });

  // Competencies
  const [behavioralCompetencies, setBehavioralCompetencies] = useState([]);
  const [leadershipCompetencies, setLeadershipCompetencies] = useState([]);
  const [leadershipMainGroups, setLeadershipMainGroups] = useState([]);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (selectedYear && activeYear && userAccess.employee_id) {
      loadDashboardData();
    }
  }, [selectedYear, activeYear, userAccess.employee_id]);

  const initializeApp = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Load user access first
      await loadUserAccess();
      
      await Promise.all([
        loadActiveYear(),
        loadSettings(),
        loadBehavioralCompetencies(),
        loadLeadershipCompetencies() 
      ]);

    } catch (error) {
      console.error('❌ Initialization error:', error);
      setError(error.message || 'Failed to load application data');
      showError('Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Load user access info (like Job Description)
  const loadUserAccess = async () => {
    try {
      const accessInfo = await performanceApi.performances.getMyAccessInfo();
      
   
      
      setUserAccess({
        can_view_all: accessInfo.can_view_all || false,
        is_manager: accessInfo.is_manager || false,
        is_admin: accessInfo.is_admin || false,
        access_level: accessInfo.access_level || 'Employee',
        accessible_count: accessInfo.accessible_count || 0,
        employee_id: accessInfo.employee_id || null,
        employee_name: accessInfo.employee_name || ''
      });
      
    } catch (error) {
      console.error('❌ Error loading user access:', error);
      throw error;
    }
  };

  const loadActiveYear = async () => {
    try {
      const yearData = await performanceApi.years.getActiveYear();
      setActiveYear(yearData);
      setSelectedYear(yearData.year);
      
      const allYears = await performanceApi.years.list();
      setPerformanceYears(allYears.results || allYears);
    } catch (error) {
      console.error('❌ Error loading year:', error);
      throw error;
    }
  };

  // app/efficiency/page.jsx

const loadSettings = async () => {
  try {
    const [weightsRes, limitsRes, deptObjRes, scalesRes, targetsRes, statusesRes] = 
      await Promise.all([
        performanceApi.weightConfigs.list(),
        performanceApi.goalLimits.getActiveConfig(),
        performanceApi.departmentObjectives.list({}),
        performanceApi.evaluationScales.list(),
        performanceApi.evaluationTargets.getActiveConfig(),
        performanceApi.objectiveStatuses.list()
      ]);
    
    // ✅ Sort evaluation scales by range_min for consistent lookup
    const sortedScales = (scalesRes.results || scalesRes).sort(
      (a, b) => a.range_min - b.range_min
    );
    
    setSettings({
      weightConfigs: weightsRes.results || weightsRes,
      goalLimits: {
        min: limitsRes.min_goals,
        max: limitsRes.max_goals
      },
      departmentObjectives: deptObjRes.results || deptObjRes,
      evaluationScale: sortedScales,  // ✅ Use sorted scales
      evaluationTargets: {
        objective_score_target: targetsRes.objective_score_target
      },
      statusTypes: statusesRes.results || statusesRes
    });
    
  } catch (error) {
    console.error('❌ Error loading settings:', error);
    throw error;
  }
};
const handleInitializeEmployee = async (employee) => {
  if (!activeYear) {
    showError('No active performance year');
    return;
  }

  try {
    setLoading(true);
    
    const result = await performanceApi.performances.initialize({
      employee: employee.id,
      performance_year: activeYear.id
    });
    
    showSuccess(`✅ Performance initialized for ${employee.name || employee.employee_name}`);
    
    // Reload employees to reflect new performance
    await loadEmployees();
    
  } catch (error) {
    console.error('❌ Error initializing employee:', error);
    const errorMsg = error.response?.data?.error || 
                     error.response?.data?.message || 
                     'Failed to initialize performance';
    showError(errorMsg);
  } finally {
    setLoading(false);
  }
};

  const loadBehavioralCompetencies = async () => {
    try {
      const groupsResponse = await competencyApi.behavioralGroups.getAll();
      const groups = groupsResponse.results || groupsResponse;
      
      const allCompetencies = [];
      
      for (const group of groups) {
        try {
          const competenciesResponse = await competencyApi.behavioralGroups.getCompetencies(group.id);
          const competencies = competenciesResponse || [];
          
          competencies.forEach(comp => {
            allCompetencies.push({
              id: comp.id,
              name: comp.name,
              description: comp.description || '',
              group_id: group.id,
              group_name: group.name
            });
          });
        } catch (error) {
          console.error(`❌ Error loading competencies for group ${group.name}:`, error);
        }
      }
      
      setBehavioralCompetencies(allCompetencies);
      return allCompetencies;
    } catch (error) {
      console.error('❌ Error loading behavioral competencies:', error);
      return [];
    }
  };

  const loadLeadershipCompetencies = async () => {
    try {
      const mainGroupsResponse = await competencyApi.leadershipMainGroups.getAll();
      const mainGroups = mainGroupsResponse.results || mainGroupsResponse;
      
      const allLeadershipItems = [];
      
      for (const mainGroup of mainGroups) {
        try {
          const mainGroupDetail = await competencyApi.leadershipMainGroups.getById(mainGroup.id);
          const childGroups = mainGroupDetail.child_groups || [];
          
          for (const childGroup of childGroups) {
            try {
              const childGroupDetail = await competencyApi.leadershipChildGroups.getById(childGroup.id);
              const items = childGroupDetail.items || [];
              
              items.forEach(item => {
                allLeadershipItems.push({
                  id: item.id,
                  name: item.name,
                  description: item.description || '',
                  child_group_id: childGroup.id,
                  child_group_name: childGroup.name,
                  main_group_id: mainGroup.id,
                  main_group_name: mainGroup.name
                });
              });
            } catch (error) {
              console.error(`❌ Error loading items for child group ${childGroup.name}:`, error);
            }
          }
        } catch (error) {
          console.error(`❌ Error loading child groups for main group ${mainGroup.name}:`, error);
        }
      }
      
      setLeadershipCompetencies(allLeadershipItems);
      setLeadershipMainGroups(mainGroups);
      return allLeadershipItems;
    } catch (error) {
      console.error('❌ Error loading leadership competencies:', error);
      return [];
    }
  };

  const loadDashboardData = async () => {
    if (!userAccess.employee_id) {
      console.error('❌ Cannot load dashboard - no employee_id');
      return;
    }
    
    setLoading(true);
    try {
      const stats = await performanceApi.dashboard.getStatistics(selectedYear);
      setDashboardStats(stats);
      
      await loadEmployees();
      
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      showError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE: loadEmployees function in page.jsx

const loadEmployees = async () => {
  try {
    if (!userAccess.employee_id) {
      console.error('❌ No employee_id in userAccess!');
      setEmployees([]);
      return;
    }
    
    // ✅ NEW: Use team_members_with_status API
    const teamResponse = await performanceApi.performances.getTeamMembersWithStatus(selectedYear);
    

    
    // Extract team members with performance data
    const employeesWithPerformance = teamResponse.team_members.map(member => {
    
      const emp = member.employee;
      const perf = member.performance;
      
      return {
        id: emp.id,
        employee_id: emp.employee_id,
        name: emp.full_name,
        employee_name: emp.full_name,
        company: emp.company_name,
        employee_company: emp.company_name,
        position: emp.position_group,
        employee_position_group: emp.position_group,
        department: emp.department,
        employee_department: emp.department,
        line_manager: emp.line_manager_name,
        line_manager_hc: emp.line_manager_hc,
        
        // Performance data
        has_performance: member.has_performance,
        can_initialize: member.can_initialize,
        performanceId: perf?.id || null,
        objectives_percentage: perf?.objectives_percentage || 0,
        competencies_percentage: perf?.competencies_percentage || 0,
        overall_weighted_percentage: perf?.overall_weighted_percentage || 0,
        final_rating: perf?.final_rating || null,
        objectives_employee_approved: perf?.objectives_employee_approved || false,
        objectives_manager_approved: perf?.objectives_manager_approved || false,
        mid_year_completed: perf?.mid_year_completed || false,
        end_year_completed: perf?.end_year_completed || false,
        approval_status: perf?.approval_status || 'NOT_STARTED'
      };
    });
    
   
    setEmployees(employeesWithPerformance);
    
  } catch (error) {
    console.error('❌ Error loading team members:', error);
    showError('Error loading team members');
  }
};

  const loadPerformanceData = async (employeeId, year) => {
    const key = `${employeeId}_${year}`;
    
    setLoading(true);
    try {
      const response = await performanceApi.performances.list({
        employee_id: employeeId,
        year: year
      });
      
      const perfs = response.results || response;
      let detailData;
      
      if (perfs.length > 0) {
        const performance = perfs[0];
        detailData = await performanceApi.performances.get(performance.id);
      } else {
        detailData = await performanceApi.performances.initialize({
          employee: employeeId,
          performance_year: activeYear.id
        });
      }
      
      const employee = employees.find(e => e.id === employeeId);
      const positionName = employee?.position?.toUpperCase().replace('_', ' ').trim() || '';
      
      const leadershipKeywords = [
        'MANAGER', 'VICE_CHAIRMAN', 'VICE CHAIRMAN', 
        'DIRECTOR', 'VICE', 'HOD', 'HEAD OF DEPARTMENT'
      ];
      
      const isLeadershipPosition = leadershipKeywords.some(keyword => 
        positionName === keyword.toUpperCase() ||
        positionName.includes(keyword.toUpperCase())
      );
      
      if (detailData.competency_ratings && detailData.competency_ratings.length > 0) {
        const firstRating = detailData.competency_ratings[0];
        
        const hasLeadershipItem = firstRating.leadership_item !== null && firstRating.leadership_item !== undefined;
        const hasBehavioralCompetency = firstRating.behavioral_competency !== null && firstRating.behavioral_competency !== undefined;
        
        const actualType = hasLeadershipItem ? 'LEADERSHIP' : 
                          hasBehavioralCompetency ? 'BEHAVIORAL' : 
                          'UNKNOWN';
        
        if (isLeadershipPosition && actualType === 'BEHAVIORAL') {
          showError(
            `⚠️ ERROR: ${employee.name} is a ${positionName} but has BEHAVIORAL competencies. ` +
            `Please create a Leadership Assessment Template for this position.`
          );
          setLoading(false);
          return null;
        }
        
        if (actualType === 'LEADERSHIP') {
          if (!leadershipCompetencies || leadershipCompetencies.length === 0) {
            await loadLeadershipCompetencies();
          }
          
          const enrichedRatings = detailData.competency_ratings.map((rating) => {
            const leadershipItem = leadershipCompetencies.find(
              item => item.id === rating.leadership_item
            );
            
            let ratingValue = 0;
            if (rating.end_year_rating_value !== null && rating.end_year_rating_value !== undefined) {
              ratingValue = parseFloat(rating.end_year_rating_value);
            } else if (rating.end_year_rating) {
              const selectedScale = settings.evaluationScale?.find(
                s => s.id === rating.end_year_rating
              );
              if (selectedScale) {
                ratingValue = selectedScale.value;
              }
            }
            
            return {
              ...rating,
              competency_name: leadershipItem?.name || `Leadership Item ${rating.leadership_item}`,
              leadership_item_id: rating.leadership_item,
              leadership_item_name: leadershipItem?.name || 'Unknown',
              main_group_id: leadershipItem?.main_group_id || null,
              main_group_name: leadershipItem?.main_group_name || 'Ungrouped',
              child_group_id: leadershipItem?.child_group_id || null,
              child_group_name: leadershipItem?.child_group_name || 'Ungrouped',
              description: leadershipItem?.description || '',
              end_year_rating_value: ratingValue,
              competency_type: 'LEADERSHIP'
            };
          });
          
          detailData.competency_ratings = enrichedRatings;
          detailData.is_leadership_assessment = true;
          
        } else if (actualType === 'BEHAVIORAL') {
          if (!behavioralCompetencies || behavioralCompetencies.length === 0) {
            await loadBehavioralCompetencies();
          }
          
          const enrichedRatings = detailData.competency_ratings.map((rating) => {
            const competency = behavioralCompetencies.find(
              comp => comp.id === rating.behavioral_competency
            );
            
            let ratingValue = 0;
            if (rating.end_year_rating_value !== null && rating.end_year_rating_value !== undefined) {
              ratingValue = parseFloat(rating.end_year_rating_value);
            } else if (rating.end_year_rating) {
              const selectedScale = settings.evaluationScale?.find(
                s => s.id === rating.end_year_rating
              );
              if (selectedScale) {
                ratingValue = selectedScale.value;
              }
            }
            
            return {
              ...rating,
              competency_name: competency?.name || `Behavioral Competency ${rating.behavioral_competency}`,
              behavioral_competency_id: rating.behavioral_competency,
              behavioral_competency_name: competency?.name || 'Unknown',
              competency_group_id: competency?.group_id || null,
              competency_group_name: competency?.group_name || 'Ungrouped',
              description: competency?.description || '',
              end_year_rating_value: ratingValue,
              competency_type: 'BEHAVIORAL'
            };
          });
          
          detailData.competency_ratings = enrichedRatings;
          detailData.is_leadership_assessment = false;
        }
      }
      
      const recalculatedData = recalculateScores(detailData);
      
      setPerformanceData(prev => ({
        ...prev,
        [key]: recalculatedData
      }));
      
      setSelectedPerformanceId(recalculatedData.id);
      
      return recalculatedData;
      
    } catch (error) {
      console.error('❌ Error loading performance data:', error);
      showError('Error loading performance data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ SIMPLIFIED: canViewEmployee (backend handles filtering)
  const canViewEmployee = (employeeId) => {
    // If employee is in the list, we can view them (backend already filtered)
    return employees.some(e => e.id === employeeId);
  };

  const getCurrentPeriod = () => {
    if (!activeYear) return 'CLOSED';
    return activeYear.current_period || 'CLOSED';
  };

  // app/efficiency/page.jsx

const getLetterGradeFromScale = (percentage) => {
  if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
    return 'N/A';
  }
  
  // ✅ Ensure we're working with a number
  const numPercentage = parseFloat(percentage);
  if (isNaN(numPercentage)) return 'N/A';
  
  // ✅ Find matching scale (scales are already sorted by range_min)
  const matchingScale = settings.evaluationScale.find(scale => 
    numPercentage >= scale.range_min && numPercentage <= scale.range_max
  );
  
  if (matchingScale) {
    return matchingScale.name;
  }
  
  // ✅ Fallback for edge cases
  // If below all ranges, return lowest grade
  if (numPercentage < settings.evaluationScale[0].range_min) {
    return settings.evaluationScale[0].name;
  }
  
  // If above all ranges, return highest grade
  return settings.evaluationScale[settings.evaluationScale.length - 1].name;
};

  const recalculateScores = (data) => {
  if (!data) return data;
  
  // ✅ CRITICAL: Don't mutate input data
  const newData = JSON.parse(JSON.stringify(data)); // Deep clone
  
  // Calculate objectives
  let totalObjectivesScore = 0;
  (newData.objectives || []).forEach(obj => {
    if (!obj.is_cancelled) {
      totalObjectivesScore += parseFloat(obj.calculated_score) || 0;
    }
  });
  
  const targetScore = settings.evaluationTargets?.objective_score_target || 21;
  const objectivesPercentage = targetScore > 0 
    ? (totalObjectivesScore / targetScore) * 100 
    : 0;
  
  newData.total_objectives_score = totalObjectivesScore;
  newData.objectives_percentage = objectivesPercentage;
  newData.objectives_letter_grade = getLetterGradeFromScale(objectivesPercentage);

  // Calculate competencies
  let totalRequired = 0;
  let totalActual = 0;
  (newData.competency_ratings || []).forEach(comp => {
    const required = parseFloat(comp.required_level) || 0;
    const actual = parseFloat(comp.end_year_rating_value) || 0;
    totalRequired += required;
    totalActual += actual;
  });
  
  const competenciesPercentage = totalRequired > 0 
    ? (totalActual / totalRequired) * 100 
    : 0;
  
  newData.total_competencies_required_score = totalRequired;
  newData.total_competencies_actual_score = totalActual;
  newData.competencies_percentage = competenciesPercentage;
  newData.competencies_letter_grade = getLetterGradeFromScale(competenciesPercentage);

  // Calculate overall
  const objectivesWeight = parseFloat(newData.objectives_weight) || 70;
  const competenciesWeight = parseFloat(newData.competencies_weight) || 30;
  
  const overallPercentage = 
    (objectivesPercentage * objectivesWeight / 100) + 
    (competenciesPercentage * competenciesWeight / 100);
  
  newData.overall_weighted_percentage = overallPercentage;
  
  if (!newData.final_rating) {
    newData.final_rating = getLetterGradeFromScale(overallPercentage);
  }
  

  
  return newData;
};

  // ==================== OBJECTIVE HANDLERS ====================
  const saveObjectivesTimeoutRef = useRef(null);

  const debouncedSaveObjectives = useCallback((performanceId, objectives) => {
    if (saveObjectivesTimeoutRef.current) {
      clearTimeout(saveObjectivesTimeoutRef.current);
    }
    
    saveObjectivesTimeoutRef.current = setTimeout(async () => {
      try {
        const scrollY = window.scrollY;
        
        await performanceApi.performances.saveObjectivesDraft(performanceId, objectives);
        
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
        
      } catch (error) {
        console.error('❌ Auto-save error:', error);
      }
    }, 1000);
  }, []); 

  const handleLoadEmployeePerformance = async (employeeId, year) => {
    try {
      const response = await performanceApi.performances.list({
        employee_id: employeeId,
        year: year
      });
      
      const perfs = response.results || response;
      
      if (perfs.length > 0) {
        const performance = perfs[0];
        const detailData = await performanceApi.performances.get(performance.id);
        
        return detailData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error loading performance for analytics:', error);
      throw error;
    }
  };

  // ==================== END-YEAR OBJECTIVES HANDLERS ====================

const handleSaveEndYearObjectivesDraft = async (objectives) => {
  if (!selectedPerformanceId) return;
  
  setLoading(true);
  try {
    await performanceApi.performances.saveEndYearObjectivesDraft(
      selectedPerformanceId,
      objectives
    );
    showSuccess('End-year objective ratings draft saved');
    await loadPerformanceData(selectedEmployee.id, selectedYear);
  } catch (error) {
    console.error('❌ Error saving end-year objectives:', error);
    showError(error.response?.data?.error || 'Error saving end-year objectives');
  } finally {
    setLoading(false);
  }
};

const handleSubmitEndYearObjectives = async (objectives) => {
  if (!selectedPerformanceId) return;
  
  setLoading(true);
  try {
    await performanceApi.performances.submitEndYearObjectives(
      selectedPerformanceId,
      objectives
    );
    showSuccess('End-year objective ratings submitted successfully');
    await loadPerformanceData(selectedEmployee.id, selectedYear);
  } catch (error) {
    console.error('❌ Error submitting end-year objectives:', error);
    showError(error.response?.data?.error || 'Error submitting end-year objectives');
  } finally {
    setLoading(false);
  }
};
// ==================== OBJECTIVE COMMENT HANDLERS ====================

const handleAddObjectiveComment = async (objectiveId, comment) => {
  if (!selectedPerformanceId) return;
  
  setLoading(true);
  try {
    await performanceApi.performances.addObjectiveComment(
      selectedPerformanceId,
      objectiveId,
      comment
    );
    showSuccess('Comment added successfully');
    await loadPerformanceData(selectedEmployee.id, selectedYear);
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    showError(error.response?.data?.error || 'Error adding comment');
  } finally {
    setLoading(false);
  }
};

const handleDeleteObjectiveComment = async (commentId) => {
  if (!selectedPerformanceId) return;
  
  setLoading(true);
  try {
    await performanceApi.performances.deleteObjectiveComment(
      selectedPerformanceId,
      commentId
    );
    showSuccess('Comment deleted successfully');
    await loadPerformanceData(selectedEmployee.id, selectedYear);
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    showError(error.response?.data?.error || 'Error deleting comment');
  } finally {
    setLoading(false);
  }
};
const handleUpdateObjective = (index, field, value) => {
  const scrollY = window.scrollY;
  
  const key = `${selectedEmployee.id}_${selectedYear}`;
  const data = performanceData[key];
  

  
  // ✅ CRITICAL FIX: Create completely new array with new objects
  const newObjectives = data.objectives.map((obj, idx) => {
    if (idx !== index) {
      // ✅ For unchanged objectives, return NEW object with same values
      // This prevents reference issues
      return { ...obj };
    }
    
    // ✅ For changed objective, create new object with update
    const updatedObj = {
      ...obj,
      [field]: value
    };
    
    // ✅ Handle end_year_rating calculation
    if (field === 'end_year_rating') {
      const selectedScaleId = value ? parseInt(value) : null;
      
      if (selectedScaleId) {
        const selectedScale = settings.evaluationScale?.find(s => s.id === selectedScaleId);
        if (selectedScale) {
          const weight = parseFloat(updatedObj.weight) || 0;
          updatedObj.calculated_score = (weight / 100) * selectedScale.value;
          
         
        }
      } else {
        updatedObj.end_year_rating = null;
        updatedObj.calculated_score = 0;
      }
    }
    
  
    
    return updatedObj;
  });
  

  
  const updatedData = {
    ...data,
    objectives: newObjectives
  };
  
  const recalculatedData = recalculateScores(updatedData);
  

  
  setPerformanceData(prev => ({
    ...prev,
    [key]: recalculatedData
  }));
  
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY);
  });
  
  // ✅ Auto-save
  if (selectedPerformanceId) {
    debouncedSaveObjectives(selectedPerformanceId, newObjectives);
  }
};

  const handleAddObjective = () => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    
    const defaultStatus = settings.statusTypes && settings.statusTypes.length > 0 
      ? settings.statusTypes[0].id 
      : null;
    
    const newObjective = {
      title: '',
      description: '',
      weight: 0,
      linked_department_objective: null,
      status: defaultStatus,
      end_year_rating: null,
      calculated_score: 0,
      is_cancelled: false
    };
    
    const updatedData = {
      ...performanceData[key],
      objectives: [...(performanceData[key].objectives || []), newObjective]
    };
    
    const recalculatedData = recalculateScores(updatedData);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: recalculatedData
    }));
  };

  const handleDeleteObjective = (index) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newObjectives = [...(data.objectives || [])];
    newObjectives.splice(index, 1);
    
    const updatedData = {
      ...data,
      objectives: newObjectives
    };
    
    const recalculatedData = recalculateScores(updatedData);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: recalculatedData
    }));
  };

  const handleSaveObjectivesDraft = async (objectives) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.saveObjectivesDraft(selectedPerformanceId, objectives);
      showSuccess('Objectives draft saved successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error saving objectives:', error);
      showError(error.response?.data?.error || 'Error saving objectives');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitObjectives = async (objectives) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitObjectives(
        selectedPerformanceId,
        objectives
      );
      showSuccess('Objectives submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting objectives:', error);
      showError(error.response?.data?.error || 'Error submitting objectives');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelObjective = async (objectiveId, reason) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.cancelObjective(selectedPerformanceId, objectiveId, reason);
      showSuccess('Objective cancelled successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error cancelling objective:', error);
      showError(error.response?.data?.error || 'Error cancelling objective');
    } finally {
      setLoading(false);
    }
  };

  // ==================== COMPETENCY HANDLERS ====================
  const handleUpdateCompetency = (index, field, value) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newCompetencies = [...(data.competency_ratings || [])];
    
    const updatedCompetency = {
      ...newCompetencies[index],
      [field]: value
    };
    
    if (field === 'end_year_rating') {
      const selectedScaleId = value ? parseInt(value) : null;
      if (selectedScaleId) {
        const selectedScale = settings.evaluationScale?.find(s => s.id === selectedScaleId);
        if (selectedScale) {
          updatedCompetency.end_year_rating_value = selectedScale.value;
        }
      } else {
        updatedCompetency.end_year_rating_value = 0;
      }
    }
    
    newCompetencies[index] = updatedCompetency;
    
    const updatedData = {
      ...data,
      competency_ratings: newCompetencies
    };
    
    const recalculatedData = recalculateScores(updatedData);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: recalculatedData
    }));
  };

  const handleSaveCompetenciesDraft = async (competencies) => {
    if (!selectedPerformanceId) {
      showError('No performance record selected');
      return;
    }
    
    setLoading(true);
    try {
      const preparedCompetencies = competencies.map(comp => ({
        id: comp.id,
        behavioral_competency: comp.behavioral_competency,
        leadership_item: comp.leadership_item,
        required_level: comp.required_level,
        end_year_rating: comp.end_year_rating,
        notes: comp.notes || ''
      }));
      
      const response = await performanceApi.performances.saveCompetenciesDraft(
        selectedPerformanceId, 
        preparedCompetencies
      );
      
      if (response.synced_to_assessment) {
        showSuccess(
          `✔ Competencies saved and synced to ${response.assessment_type || 'assessment'}`
        );
      } else {
        showSuccess('Competencies draft saved successfully');
      }
      
      await loadPerformanceData(selectedEmployee.id, selectedYear);
      
    } catch (error) {
      console.error('❌ Error saving competencies:', error);
      showError(error.response?.data?.error || 'Error saving competencies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCompetencies = async (competencies) => {
    if (!selectedPerformanceId) {
      showError('No performance record selected');
      return;
    }
    
    setLoading(true);
    try {
      const preparedCompetencies = competencies.map(comp => ({
        id: comp.id,
        behavioral_competency: comp.behavioral_competency,
        leadership_item: comp.leadership_item,
        required_level: comp.required_level,
        end_year_rating: comp.end_year_rating,
        notes: comp.notes || ''
      }));
      
      const response = await performanceApi.performances.submitCompetencies(
        selectedPerformanceId,
        preparedCompetencies
      );
      
      if (response.synced_to_assessment) {
        showSuccess(
          `Competencies submitted and synced to ${response.assessment_type || 'assessment'}`
        );
      } else {
        showSuccess('Competencies submitted successfully');
      }
      
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting competencies:', error);
      showError(error.response?.data?.error || 'Error submitting competencies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMidYearEmployee = async (comment, objectives = null) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitMidYearEmployee(
        selectedPerformanceId,
        comment,
        objectives
      );
      showSuccess('Mid-year self-review submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting mid-year employee review:', error);
      showError(error.response?.data?.error || 'Error submitting mid-year review');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMidYearManager = async (comment, objectives = null) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitMidYearManager(
        selectedPerformanceId,
        comment,
        objectives
      );
      showSuccess('Mid-year review completed successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting mid-year manager review:', error);
      showError(error.response?.data?.error || 'Error completing mid-year review');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEndYearEmployee = async (comment) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitEndYearEmployee(
        selectedPerformanceId,
        comment
      );
      showSuccess('End-year self-review submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting end-year employee review:', error);
      showError(error.response?.data?.error || 'Error submitting end-year review');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEndYearManager = async (comment) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitEndYearManager(
        selectedPerformanceId,
        comment
      );
      showSuccess('End-year assessment submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting end-year manager assessment:', error);
      showError(error.response?.data?.error || 'Error submitting end-year assessment');
    } finally {
      setLoading(false);
    }
  };

  // ==================== DEVELOPMENT NEEDS HANDLERS ====================
  const handleUpdateDevelopmentNeed = (index, field, value) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newNeeds = [...(data.development_needs || [])];
    newNeeds[index] = {
      ...newNeeds[index],
      [field]: value
    };
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        development_needs: newNeeds
      }
    }));
  };

  const handleAddDevelopmentNeed = () => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const newNeed = {
      competency_gap: '',
      development_activity: '',
      progress: 0,
      comment: ''
    };
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        development_needs: [...(prev[key].development_needs || []), newNeed]
      }
    }));
  };

  const handleDeleteDevelopmentNeed = (index) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newNeeds = [...(data.development_needs || [])];
    newNeeds.splice(index, 1);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        development_needs: newNeeds
      }
    }));
  };

  const handleSaveDevelopmentNeedsDraft = async () => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    
    setLoading(true);
    try {
      await performanceApi.performances.saveDevelopmentNeedsDraft(
        selectedPerformanceId,
        data.development_needs || []
      );
      showSuccess('Development needs submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error saving development needs:', error);
      showError(error.response?.data?.error || 'Error saving development needs');
    } finally {
      setLoading(false);
    }
  };

  // ==================== OTHER HANDLERS ====================
  const handleSelectEmployee = async (employee) => {
    if (!canViewEmployee(employee.id)) {
      showError('You do not have permission to view this employee');
      return;
    }
    
    setSelectedEmployee(employee);
    await loadPerformanceData(employee.id, selectedYear);
    setActiveView('detail');
  };

  const handleBackToDashboard = () => {
    setSelectedEmployee(null);
    setSelectedPerformanceId(null);
    setActiveView('dashboard');
  };

  const handleExportExcel = async () => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.downloadExcel(
        selectedPerformanceId, 
        `performance_${selectedEmployee.employee_id}_${selectedYear}.xlsx`
      );
      showSuccess('Export successful');
    } catch (error) {
      console.error('❌ Error exporting:', error);
      showError('Error exporting');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    initializeApp();
  };

  // ==================== RENDER ====================
  if (error) {
    return (
      <DashboardLayout>
        <ErrorDisplay error={error} onRetry={handleRetry} />
      </DashboardLayout>
    );
  }

  if (loading && !activeYear) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading Performance Management System..." />
      </DashboardLayout>
    );
  }

  const currentKey = selectedEmployee ? `${selectedEmployee.id}_${selectedYear}` : null;
  const currentPerformanceData = currentKey ? performanceData[currentKey] : null;

  // ✅ Convert userAccess to old permissions format for compatibility
  const compatiblePermissions = {
    is_admin: userAccess.is_admin,
    can_view_all: userAccess.can_view_all,
    is_manager: userAccess.is_manager,
    accessible_employee_count: userAccess.accessible_count,
    employee: userAccess.employee_id ? {
      id: userAccess.employee_id,
      name: userAccess.employee_name,
      employee_id: userAccess.employee_id
    } : null
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6 mx-auto">
        <PerformanceHeader
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          performanceYears={performanceYears}
          currentPeriod={getCurrentPeriod()}
          loading={loading}
          onRefresh={loadDashboardData}
          onSettings={() => router.push('/efficiency/settings')}
          darkMode={darkMode}
          permissions={compatiblePermissions}
        />

        {activeView === 'dashboard' ? (
          
<PerformanceDashboard
  dashboardStats={dashboardStats}
  employees={employees}
  settings={settings}
  selectedYear={selectedYear}
  permissions={compatiblePermissions}
  onSelectEmployee={handleSelectEmployee}
  canViewEmployee={canViewEmployee}
  onLoadEmployeePerformance={handleLoadEmployeePerformance}
  // ✅ NEW PROPS:
  onInitializeEmployee={handleInitializeEmployee}

  performanceYearId={activeYear?.id}
  canInitialize={userAccess.is_admin || userAccess.is_manager}
  darkMode={darkMode}
/> 
        ) : (
          selectedEmployee && currentPerformanceData ? (
            <EmployeePerformanceDetail
              employee={selectedEmployee}
              performanceData={currentPerformanceData}
              settings={settings}
              currentPeriod={getCurrentPeriod()}
              activeYear={activeYear}
              permissions={compatiblePermissions}
              loading={loading}
              darkMode={darkMode}
              onBack={handleBackToDashboard}
              onExport={handleExportExcel}
               onAddObjectiveComment={handleAddObjectiveComment}
  onDeleteObjectiveComment={handleDeleteObjectiveComment}
              onUpdateObjective={handleUpdateObjective}
              onAddObjective={handleAddObjective}
              onDeleteObjective={handleDeleteObjective}
              onSaveObjectivesDraft={handleSaveObjectivesDraft}
              onSubmitObjectives={handleSubmitObjectives}
              onCancelObjective={handleCancelObjective}
              
              onUpdateCompetency={handleUpdateCompetency}
              onSaveCompetenciesDraft={handleSaveCompetenciesDraft}
              onSubmitCompetencies={handleSubmitCompetencies}
              onSaveEndYearObjectivesDraft={handleSaveEndYearObjectivesDraft}
  onSubmitEndYearObjectives={handleSubmitEndYearObjectives}
              onSubmitMidYearEmployee={handleSubmitMidYearEmployee}
              onSubmitMidYearManager={handleSubmitMidYearManager}
              
              onSubmitEndYearEmployee={handleSubmitEndYearEmployee}
              onSubmitEndYearManager={handleSubmitEndYearManager}
              
              onUpdateDevelopmentNeed={handleUpdateDevelopmentNeed}
              onAddDevelopmentNeed={handleAddDevelopmentNeed}
              onDeleteDevelopmentNeed={handleDeleteDevelopmentNeed}
              onSaveDevelopmentNeedsDraft={handleSaveDevelopmentNeedsDraft}
            />
          ) : (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-16 text-center`}>
              <Users className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">
                No Employee Selected
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Select a team member from the dashboard to view their performance
              </p>
              <button
                onClick={handleBackToDashboard}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-all shadow-sm"
              >
                Back to Dashboard
              </button>
            </div>
          )
        )}

        {loading && activeYear && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8`}>
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}