// src/hooks/useGrading.js - FIXED: Current üçün Current Scenario-dan input data götürmək

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCurrentStructure,
  fetchCurrentScenario,
  fetchPositionGroups,
  fetchScenarios,
  fetchScenarioDetails,
  calculateDynamicScenario,
  saveDraftScenario,
  applyScenario,
  archiveScenario,
  setScenarioInputs,
  updateScenarioInput,
  updateGradeInput,
  updateGlobalHorizontalInterval,
  setCalculatedOutputs,
  setSelectedScenario,
  clearErrors,
  setError,
  initializeScenarioInputs,
  selectCurrentStructure,
  selectCurrentScenario,
  selectPositionGroups,
  selectScenarioInputs,
  selectCalculatedOutputs,
  selectDraftScenarios,
  selectArchivedScenarios,
  selectSelectedScenario,
  selectLoading,
  selectErrors,
  selectBestDraftScenario,
  selectValidationSummary,
  selectInputSummary,
  compareScenarios,
  selectComparisonData
} from '@/store/slices/gradingSlice';


const useGrading = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const currentData = useSelector(selectCurrentStructure);        // Current Structure (yalnız calculated values)
  const currentScenario = useSelector(selectCurrentScenario);     // Current Scenario (input + calculated values)
  const positionGroups = useSelector(selectPositionGroups);
  const scenarioInputs = useSelector(selectScenarioInputs);
  const calculatedOutputs = useSelector(selectCalculatedOutputs);
  const draftScenarios = useSelector(selectDraftScenarios);
  const archivedScenarios = useSelector(selectArchivedScenarios);
  const selectedScenario = useSelector(selectSelectedScenario);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);
  const bestDraft = useSelector(selectBestDraftScenario);
  const validationSummary = useSelector(selectValidationSummary);
  const inputSummary = useSelector(selectInputSummary);

  // Local state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculationInputs, setLastCalculationInputs] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Data loading (same as before)
  const loadInitialData = useCallback(async () => {

    
    try {
      const corePromises = [
        dispatch(fetchCurrentStructure()),
        dispatch(fetchPositionGroups()),
        dispatch(fetchCurrentScenario())  // ✅ Current Scenario-nu da yükləyirik
      ];
      
      const coreResults = await Promise.allSettled(corePromises);
      
      const currentStructureResult = coreResults[0];
      if (currentStructureResult.status === 'fulfilled' && currentStructureResult.value.payload) {
  
        dispatch(initializeScenarioInputs(currentStructureResult.value.payload));
      }
      
      const scenarioPromises = [
        dispatch(fetchScenarios({ status: 'DRAFT' })),
        dispatch(fetchScenarios({ status: 'ARCHIVED' }))
      ];
      
      await Promise.allSettled(scenarioPromises);
      
      setIsInitialized(true);
  
      
    } catch (error) {
      console.error('❌ Error during initial data load:', error);
      setIsInitialized(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) {
      loadInitialData();
    }
  }, [loadInitialData, isInitialized]);

  // Input handlers (eyni qalır)
  const handleBaseValueChange = useCallback((value) => {
  
    
    if (errors.baseValue1) {
      dispatch(clearErrors());
    }
    
    const numValue = parseFloat(value);
    if (value !== '' && (isNaN(numValue) || numValue <= 0)) {
      dispatch(setError({ field: 'baseValue1', message: 'Base value must be a positive number' }));
      return;
    }
    
    dispatch(updateScenarioInput({ field: 'baseValue1', value }));
    
    const timer = setTimeout(() => {
      if (value && numValue > 0) {
        calculateGrades();
      } else {
        clearCalculatedOutputs();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, errors.baseValue1]);
  const comparisonData = useSelector(selectComparisonData);  // YENİ
  
  // Comparison function - YENİ
  const handleCompareScenarios = useCallback(async (scenarioIds) => {
    try {

      const response = await dispatch(compareScenarios(scenarioIds));
      
      if (response.type.endsWith('/fulfilled')) {

        return response.payload;
      } else {
        console.error('❌ Comparison failed:', response.payload);
        return null;
      }
    } catch (error) {
      console.error('❌ Error in comparison:', error);
      return null;
    }
  }, [dispatch]);
  const handleVerticalChange = useCallback((gradeName, value) => {
   
    const errorKey = `vertical-${gradeName}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      dispatch(clearErrors());
    }
    
    if (value !== '' && value !== null && value !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        dispatch(setError({ 
          field: errorKey, 
          message: `Vertical rate for ${gradeName} must be between 0-100` 
        }));
        return;
      }
    }
    
    dispatch(updateGradeInput({ gradeName, field: 'vertical', value }));
    
    const timer = setTimeout(() => {
      calculateGrades();
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, errors]);

  const handleGlobalHorizontalChange = useCallback((intervalKey, value) => {
  
    
    const errorKey = `global-horizontal-${intervalKey}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      dispatch(clearErrors());
    }
    
    if (value !== '' && value !== null && value !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        dispatch(setError({ 
          field: errorKey, 
          message: `${intervalKey.replace(/_/g, ' ')} rate must be between 0-100` 
        }));
        return;
      }
    }
    
    dispatch(updateGlobalHorizontalInterval({ intervalKey, value }));
    
    const timer = setTimeout(() => {
      calculateGrades();
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, errors]);

  // Digər funksiyalar eyni qalır...
  const clearCalculatedOutputs = useCallback(() => {

    
    const emptyOutputs = {};
    if (scenarioInputs.gradeOrder && scenarioInputs.gradeOrder.length > 0) {
      scenarioInputs.gradeOrder.forEach((gradeName) => {
        emptyOutputs[gradeName] = { 
          LD: "", LQ: "", M: "", UQ: "", UD: "" 
        };
      });
      dispatch(setCalculatedOutputs(emptyOutputs));
    }
  }, [dispatch, scenarioInputs.gradeOrder]);

  const calculateGrades = useCallback(async () => {
    try {

      
      if (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
    
        clearCalculatedOutputs();
        return;
      }

      if (!scenarioInputs.gradeOrder || scenarioInputs.gradeOrder.length === 0) {
      
        return;
      }

      const hasVerticalInputs = Object.values(scenarioInputs.grades || {}).some(grade => 
        grade && grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined && grade.vertical !== 0
      );
      
      const hasHorizontalInputs = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
        interval !== '' && interval !== null && interval !== undefined && interval !== 0
      );

      if (!hasVerticalInputs && !hasHorizontalInputs) {
      
        clearCalculatedOutputs();
        return;
      }

      const currentInputString = JSON.stringify({
        baseValue1: scenarioInputs.baseValue1,
        grades: scenarioInputs.grades,
        globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals
      });

      if (currentInputString === lastCalculationInputs) {
      
        return;
      }

      setIsCalculating(true);
      setLastCalculationInputs(currentInputString);

      const formattedGrades = {};
      scenarioInputs.gradeOrder.forEach(gradeName => {
        const gradeInput = scenarioInputs.grades[gradeName] || {};
        
        let verticalValue = gradeInput.vertical;
        if (verticalValue === '' || verticalValue === null || verticalValue === undefined) {
          verticalValue = null;
        } else {
          try {
            verticalValue = parseFloat(verticalValue);
            if (isNaN(verticalValue)) {
              verticalValue = null;
            }
          } catch (e) {
            verticalValue = null;
          }
        }
        
        const cleanIntervals = {};
        Object.keys(scenarioInputs.globalHorizontalIntervals || {}).forEach(key => {
          const value = scenarioInputs.globalHorizontalIntervals[key];
          if (value === '' || value === null || value === undefined) {
            cleanIntervals[key] = 0;
          } else {
            try {
              cleanIntervals[key] = parseFloat(value) || 0;
            } catch (e) {
              cleanIntervals[key] = 0;
            }
          }
        });
        
        formattedGrades[gradeName] = {
          vertical: verticalValue,
          horizontal_intervals: cleanIntervals
        };
      });

      const calculationData = {
        baseValue1: parseFloat(scenarioInputs.baseValue1),
        gradeOrder: scenarioInputs.gradeOrder,
        grades: formattedGrades
      };



      const response = await dispatch(calculateDynamicScenario(calculationData));
      
      if (response.type.endsWith('/fulfilled')) {
      
      } else {
        console.error('❌ Calculation failed:', response.payload);
      }
    } catch (error) {
      console.error('❌ Error during calculation:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [dispatch, scenarioInputs, lastCalculationInputs, clearCalculatedOutputs]);


const handleSaveDraft = useCallback(async (customName = '') => {
  try {
  
    
    if (!validationSummary.canSave) {
      console.error('❌ Cannot save draft - validation failed');
      dispatch(setError({ field: 'saving', message: 'Please fix validation errors before saving' }));
      return null;
    }

    // Use custom name or generate auto name
    const scenarioName = customName && customName.trim() 
      ? customName.trim() 
      : `Scenario ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const draftData = {
      name: scenarioName,
      description: customName && customName.trim() 
        ? 'Custom scenario' 
        : 'Auto-generated scenario with global horizontal intervals',
      baseValue1: parseFloat(scenarioInputs.baseValue1),
      gradeOrder: scenarioInputs.gradeOrder,
      grades: scenarioInputs.grades,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals || {
        LD_to_LQ: 0,
        LQ_to_M: 0,
        M_to_UQ: 0,
        UQ_to_UD: 0
      },
      calculatedOutputs: calculatedOutputs
    };


    const response = await dispatch(saveDraftScenario(draftData));
    
    if (response.type.endsWith('/fulfilled')) {
  
      dispatch(initializeScenarioInputs(currentData));
      clearCalculatedOutputs();
      return response.payload;
    } else {
      console.error('❌ Failed to save draft:', response.payload);
      return null;
    }
  } catch (error) {
    console.error('❌ Error saving draft:', error);
    return null;
  }
}, [dispatch, validationSummary.canSave, scenarioInputs, calculatedOutputs, currentData, clearCalculatedOutputs]);

  const handleSaveAsCurrent = useCallback(async (scenarioId) => {
    try {
   
      const response = await dispatch(applyScenario(scenarioId));
      
      if (response.type.endsWith('/fulfilled')) {
   
        setIsDetailOpen(false);
      } else {
        console.error('❌ Failed to apply scenario:', response.payload);
      }
    } catch (error) {
      console.error('❌ Error applying scenario:', error);
    }
  }, [dispatch]);

  const handleArchiveDraft = useCallback(async (scenarioId) => {
    try {

      const response = await dispatch(archiveScenario(scenarioId));
      
      if (response.type.endsWith('/fulfilled')) {
 
        setIsDetailOpen(false);
      } else {
        console.error('❌ Failed to archive scenario:', response.payload);
      }
    } catch (error) {
      console.error('❌ Error archiving scenario:', error);
    }
  }, [dispatch]);

  const handleViewDetails = useCallback(async (scenario) => {
    try {
      
      if (scenario.id && scenario.status !== 'current') {
        const response = await dispatch(fetchScenarioDetails(scenario.id));
        if (response.type.endsWith('/fulfilled')) {
          dispatch(setSelectedScenario(response.payload));
        } else {
          dispatch(setSelectedScenario(scenario));
        }
      } else {
        dispatch(setSelectedScenario(scenario));
      }
      
      setIsDetailOpen(true);
    } catch (error) {
     
      dispatch(setSelectedScenario(scenario));
      setIsDetailOpen(true);
    }
  }, [dispatch]);

  // Comparison functions
  // In useGrading.js - Update toggleCompareMode

const toggleCompareMode = useCallback(() => {
  setCompareMode(prev => {
    const newMode = !prev;
   

    if (!newMode) {
      // Exiting compare mode - clear selections
      setSelectedForComparison([]);
    }
    // Note: No longer auto-selecting 'current' since it's always included
    return newMode;
  });
}, []);

  const toggleScenarioForComparison = useCallback((scenarioId) => {
    setSelectedForComparison(prev => {
      const newSelection = prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId];
      
   
      return newSelection;
    });
  }, []);

  const startComparison = useCallback(() => {
  
    setIsDetailOpen(true);
  }, [selectedForComparison]);

  // ✅ FIXED: Scenario retrieval for comparison - Current Scenario istifadə edirik
  const getScenarioForComparison = useCallback((scenarioId) => {
 
    
    if (scenarioId === 'current') {
    
      // ✅ Current Scenario-dan input data götürürük, Current Structure-dan deyil
      return {
        scenario: currentScenario,  // currentData deyil, currentScenario
        data: currentScenario?.data || currentScenario,
        name: 'Current Active Scenario',
        status: 'current'
      };
    }
    
    // Search in all scenarios
    const allScenarios = [...draftScenarios, ...archivedScenarios];
    const scenario = allScenarios.find(s => s.id === scenarioId);
    
    if (scenario) {
   
      return {
        scenario: scenario,
        data: scenario.data || scenario,
        name: scenario.name,
        status: scenario.status.toLowerCase()
      };
    }
    

    return null;
  }, [currentScenario, draftScenarios, archivedScenarios]); // currentData deyil, currentScenario

  // ✅ FIXED: Helper functions - Current Scenario-dan input data götürürük
  const getVerticalInputValue = useCallback((scenarioId, gradeName) => {
  
    
    if (scenarioId === 'current') {
    
      
      // Current Scenario-dan input data götürürük
      if (currentScenario && currentScenario.input_rates && currentScenario.input_rates[gradeName] && currentScenario.input_rates[gradeName].vertical !== undefined) {
        const value = currentScenario.input_rates[gradeName].vertical;

        return value;
      }
      
      // Fallback: data.positionVerticalInputs
      if (currentScenario && currentScenario.data && currentScenario.data.positionVerticalInputs && currentScenario.data.positionVerticalInputs[gradeName] !== undefined) {
        const value = currentScenario.data.positionVerticalInputs[gradeName];
   
        return value;
      }
      

      return null;
    }
    
    const comparisonData = getScenarioForComparison(scenarioId);
    if (!comparisonData) {

      return null;
    }
    
    const { scenario } = comparisonData;
    
    // Check input_rates first (most reliable for scenarios)
    if (scenario.input_rates && scenario.input_rates[gradeName] && scenario.input_rates[gradeName].vertical !== undefined) {
      const value = scenario.input_rates[gradeName].vertical;

      return value;
    }
    
    // Fallback: Check data.positionVerticalInputs
    if (scenario.data && scenario.data.positionVerticalInputs && scenario.data.positionVerticalInputs[gradeName] !== undefined) {
      const value = scenario.data.positionVerticalInputs[gradeName];
 
      return value;
    }
    

    return null;
  }, [currentScenario, getScenarioForComparison]);

  const getHorizontalInputValues = useCallback((scenarioId) => {
  
    
    if (scenarioId === 'current') {
     
      // Current Scenario-dan horizontal intervals götürürük
      if (currentScenario && currentScenario.data && currentScenario.data.globalHorizontalIntervals) {
     
        return currentScenario.data.globalHorizontalIntervals;
      }
      
      // Fallback: input_rates-dən götürmək
      if (currentScenario && currentScenario.input_rates) {
        for (const [gradeName, gradeData] of Object.entries(currentScenario.input_rates)) {
          if (gradeData && gradeData.horizontal_intervals) {
  
            return gradeData.horizontal_intervals;
          }
        }
      }
      

      return {
        LD_to_LQ: 0,
        LQ_to_M: 0,
        M_to_UQ: 0,
        UQ_to_UD: 0
      };
    }
    
    const comparisonData = getScenarioForComparison(scenarioId);
    if (!comparisonData) {
  
      return {
        LD_to_LQ: 0,
        LQ_to_M: 0,
        M_to_UQ: 0,
        UQ_to_UD: 0
      };
    }
    
    const { scenario } = comparisonData;
    
    // Check data.globalHorizontalIntervals first
    if (scenario.data && scenario.data.globalHorizontalIntervals) {
  
      return scenario.data.globalHorizontalIntervals;
    }
    
    // Fallback: Check input_rates (get from any position - they should be the same)
    if (scenario.input_rates) {
      for (const [gradeName, gradeData] of Object.entries(scenario.input_rates)) {
        if (gradeData && gradeData.horizontal_intervals) {
    
          return gradeData.horizontal_intervals;
        }
      }
    }
    

    return {
      LD_to_LQ: 0,
      LQ_to_M: 0,
      M_to_UQ: 0,
      UQ_to_UD: 0
    };
  }, [currentScenario, getScenarioForComparison]);

  const refreshData = useCallback(async () => {

    await loadInitialData();
  }, [loadInitialData]);

  // Combined scenario display data (eyni qalır)
  const newScenarioDisplayData = useMemo(() => {
    if (!scenarioInputs.gradeOrder || scenarioInputs.gradeOrder.length === 0) {
      return null;
    }
    
    const combinedGrades = {};
    scenarioInputs.gradeOrder.forEach((gradeName) => {
      const inputGrade = scenarioInputs.grades[gradeName] || { vertical: '' };
      const outputGrade = calculatedOutputs[gradeName] || { 
        LD: "", LQ: "", M: "", UQ: "", UD: "" 
      };
      
      combinedGrades[gradeName] = {
        ...inputGrade,
        ...outputGrade,
        isCalculated: Object.values(outputGrade).some(value => value && value !== "")
      };
    });
    
    return {
      baseValue1: scenarioInputs.baseValue1,
      gradeOrder: scenarioInputs.gradeOrder,
      grades: combinedGrades,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals,
      calculationProgress: {
        totalPositions: scenarioInputs.gradeOrder.length,
        calculatedPositions: Object.values(combinedGrades).filter(grade => grade.isCalculated).length,
        hasVerticalInputs: Object.values(scenarioInputs.grades || {}).some(grade => 
          grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined
        ),
        hasHorizontalInputs: Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
          interval !== '' && interval !== null && interval !== undefined && interval !== 0
        )
      }
    };
  }, [scenarioInputs, calculatedOutputs]);

  // Auto-calculation effect (eyni qalır)
  useEffect(() => {
    if (!isInitialized || !scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
      return;
    }

    const hasAnyInput = 
      Object.values(scenarioInputs.grades || {}).some(grade => 
        grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined && grade.vertical !== 0
      ) ||
      Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
        interval !== '' && interval !== null && interval !== undefined && interval !== 0
      );

    if (hasAnyInput) {
      const timer = setTimeout(() => {

        calculateGrades();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, scenarioInputs, calculateGrades]);

  useEffect(() => {
    if (isInitialized && (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0)) {
      clearCalculatedOutputs();
    }
  }, [isInitialized, scenarioInputs.baseValue1, clearCalculatedOutputs]);

  // Computed values
  const basePositionName = useMemo(() => {
    if (currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0) {
      return currentData.gradeOrder[currentData.gradeOrder.length - 1];
    }
    if (scenarioInputs.gradeOrder && scenarioInputs.gradeOrder.length > 0) {
      return scenarioInputs.gradeOrder[scenarioInputs.gradeOrder.length - 1];
    }
    return "Base Position";
  }, [currentData, scenarioInputs.gradeOrder]);

  const isLoading = useMemo(() => {
    return Object.values(loading).some(Boolean) || isCalculating || !isInitialized;
  }, [loading, isCalculating, isInitialized]);

  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  const dataAvailability = useMemo(() => {
    return {
      hasCurrentData: !!(currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0),
      hasCurrentScenario: !!(currentScenario && currentScenario.id),
      hasPositionGroups: !!(positionGroups && positionGroups.length > 0),
      hasDraftScenarios: draftScenarios.length > 0,
      hasArchivedScenarios: archivedScenarios.length > 0,
      isSystemReady: !!(currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0 && isInitialized)
    };
  }, [currentData, currentScenario, positionGroups, draftScenarios, archivedScenarios, isInitialized]);



  return {
    // Core data
    currentData,         // Current Structure (calculated values only)
    currentScenario,     // Current Scenario (input + calculated values) ✅
    positionGroups,
    scenarioInputs,
    calculatedOutputs,
    newScenarioDisplayData,
    draftScenarios,
    archivedScenarios,
    selectedScenario,
    bestDraft,
    basePositionName,
    
    // Computed state
    validationSummary,
    inputSummary,
    dataAvailability,
    
    // UI state
    isDetailOpen,
    setIsDetailOpen,
    compareMode,
    selectedForComparison,
    isLoading,
    isCalculating,
    errors,
    hasErrors,
    isInitialized,
    
    // Direct loading access
    loading,
    
    // Actions
    handleBaseValueChange,
    handleVerticalChange,
    handleGlobalHorizontalChange,
    handleSaveDraft,
    handleSaveAsCurrent,
    handleArchiveDraft,
    handleViewDetails,
    toggleCompareMode,
    toggleScenarioForComparison,
    startComparison,
    getScenarioForComparison,
    calculateGrades,
    clearCalculatedOutputs,
    refreshData,
    
    // ✅ FIXED: Comparison helper functions - Current Scenario istifadə edir
    getVerticalInputValue,
    getHorizontalInputValues,
    comparisonData,           // YENİ
    handleCompareScenarios,
    // Utility functions
    clearErrors: () => dispatch(clearErrors()),
    setError: (field, message) => dispatch(setError({ field, message }))
  };
};

export default useGrading;