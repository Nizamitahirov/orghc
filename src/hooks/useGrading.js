// src/hooks/useGrading.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCurrentStructure, fetchCurrentScenario, fetchPositionGroups,
  fetchScenarios, fetchScenarioDetails, fetchCurrencies,
  calculateDynamicScenario, saveDraftScenario, applyScenario, archiveScenario,
  compareScenarios,
  updateScenarioInput, updateScenarioCurrency, setSelectedStructureCurrency,
  updateGradeInput, updateGlobalHorizontalInterval,
  setCalculatedOutputs, setSelectedScenario, clearErrors, setError,
  initializeScenarioInputs,
  // Selectors
  selectCurrentStructure,       // aktiv currency-nin structure-u
  selectCurrentStructures,      // bütün { AZN: {...}, USD: {...} }
  selectCurrentScenario,        // aktiv currency-nin scenario-su
  selectCurrentScenarios,       // bütün { AZN: {...}, USD: {...} }
  selectSelectedStructureCurrency,
  selectAvailableStructureCurrencies,
  selectPositionGroups,
  selectCurrencies,
  selectScenarioInputs, selectCalculatedOutputs,
  selectDraftScenarios, selectArchivedScenarios, selectSelectedScenario,
  selectLoading, selectErrors,
  selectBestDraftScenario, selectValidationSummary, selectInputSummary,
  selectComparisonData,
} from '@/store/slices/gradingSlice';
import { salaryService } from '@/services/salaryService';

const useGrading = () => {
  const dispatch = useDispatch();

  // ── Redux state ────────────────────────────────────────────────────────────
  // currentData   → aktiv currency-nin structure-u (köhnə interfeys qorunur)
  const currentData                  = useSelector(selectCurrentStructure);
  const currentStructures            = useSelector(selectCurrentStructures);
  const currentScenario              = useSelector(selectCurrentScenario);
  const currentScenarios             = useSelector(selectCurrentScenarios);
  const selectedStructureCurrency    = useSelector(selectSelectedStructureCurrency);
  const availableStructureCurrencies = useSelector(selectAvailableStructureCurrencies);
  const positionGroups               = useSelector(selectPositionGroups);
  const currencies                   = useSelector(selectCurrencies);
  const scenarioInputs               = useSelector(selectScenarioInputs);
  const calculatedOutputs            = useSelector(selectCalculatedOutputs);
  const draftScenarios               = useSelector(selectDraftScenarios);
  const archivedScenarios            = useSelector(selectArchivedScenarios);
  const selectedScenario             = useSelector(selectSelectedScenario);
  const loading                      = useSelector(selectLoading);
  const errors                       = useSelector(selectErrors);
  const bestDraft                    = useSelector(selectBestDraftScenario);
  const validationSummary            = useSelector(selectValidationSummary);
  const inputSummary                 = useSelector(selectInputSummary);
  const comparisonData               = useSelector(selectComparisonData);

  // ── Local state ────────────────────────────────────────────────────────────
  const [isDetailOpen,          setIsDetailOpen]          = useState(false);
  const [compareMode,           setCompareMode]           = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [isCalculating,         setIsCalculating]         = useState(false);
  const [lastCalculationInputs, setLastCalculationInputs] = useState(null);
  const [isInitialized,         setIsInitialized]         = useState(false);

  // ── Salary local state ─────────────────────────────────────────────────────
  const [salaryData,         setSalaryData]         = useState([]);
  const [salaryLoading,      setSalaryLoading]      = useState(false);
  const [salaryError,        setSalaryError]        = useState(null);
  const [salaryUpdating,     setSalaryUpdating]     = useState(false);
  const [salaryBulkUpdating, setSalaryBulkUpdating] = useState(false);
  const [salaryPagination,   setSalaryPagination]   = useState({ count: 0, next: null, previous: null });
  const [salaryFilters,      setSalaryFilters]      = useState({ search: '', has_salary: '', position_group: '' });

  // ── Initial data load ──────────────────────────────────────────────────────
  const loadInitialData = useCallback(async () => {
    try {
      const coreResults = await Promise.allSettled([
        dispatch(fetchCurrentStructure()),
        dispatch(fetchPositionGroups()),
        dispatch(fetchCurrentScenario()),
        dispatch(fetchCurrencies()),
      ]);

      // İlk currency-nin structure-u ilə scenario input-larını init et
      const structureResult = coreResults[0];
      if (structureResult.status === 'fulfilled' && structureResult.value.payload) {
        // payload = { AZN: {...}, USD: {...} } — ilk mövcud currency-ni al
        const structures = structureResult.value.payload;
        const firstCurrency = Object.keys(structures)[0];
        if (firstCurrency) {
          dispatch(initializeScenarioInputs(structures[firstCurrency]));
        }
      }

      await Promise.allSettled([
        dispatch(fetchScenarios({ status: 'DRAFT' })),
        dispatch(fetchScenarios({ status: 'ARCHIVED' })),
      ]);

      setIsInitialized(true);
    } catch {
      setIsInitialized(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) loadInitialData();
  }, [loadInitialData, isInitialized]);

  // ── Currency tab dəyişdirmə ────────────────────────────────────────────────
  const handleStructureCurrencyChange = useCallback((currency) => {
    dispatch(setSelectedStructureCurrency(currency));
    // Scenario input-larını həmin currency-nin structure-u ilə re-init et
    const struct = currentStructures[currency];
    if (struct) dispatch(initializeScenarioInputs(struct));
  }, [dispatch, currentStructures]);

  // ── Salary ─────────────────────────────────────────────────────────────────
  const fetchSalaryData = useCallback(async (params = {}) => {
    setSalaryLoading(true);
    setSalaryError(null);
    try {
      const mergedParams = { ...salaryFilters, ...params };
      const cleanParams = Object.fromEntries(
        Object.entries(mergedParams).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const response = await salaryService.list(cleanParams);
      const data = response.data;
      setSalaryData(data.results || data || []);
      setSalaryPagination({
        count:    data.count    || 0,
        next:     data.next     || null,
        previous: data.previous || null,
      });
    } catch (err) {
      setSalaryError(err.response?.data?.error || err.message || 'Failed to load salary data');
    } finally {
      setSalaryLoading(false);
    }
  }, [salaryFilters]);

  const handleSalaryUpdate = useCallback(async (employeeId, salaryPayload) => {
    setSalaryUpdating(true);
    try {
      await salaryService.update({ employee_id: employeeId, ...salaryPayload });
      setSalaryData(prev => prev.map(emp =>
        emp.id === employeeId ? { ...emp, ...salaryPayload } : emp
      ));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setSalaryUpdating(false);
    }
  }, []);

  const handleSalaryBulkUpdate = useCallback(async (employeeIds, payload) => {
    setSalaryBulkUpdating(true);
    try {
      await salaryService.bulkUpdate({ employee_ids: employeeIds, ...payload });
      await fetchSalaryData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setSalaryBulkUpdating(false);
    }
  }, [fetchSalaryData]);

  const handleSalaryExcelImport = useCallback(async (file) => {
    try {
      const response = await salaryService.excelImport(file);
      await fetchSalaryData();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }, [fetchSalaryData]);

  const handleSalaryTemplateDownload = useCallback(async () => {
    try {
      const response = await salaryService.excelTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = 'salary_template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Template download failed:', err);
    }
  }, []);

  const updateSalaryFilters = useCallback((newFilters) => {
    setSalaryFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const salaryByGrade = useMemo(() => {
    const map = new Map();
    salaryData.forEach(emp => {
      const lvl = emp.grading_level || 'Unknown';
      if (!map.has(lvl)) map.set(lvl, { count: 0, totalCurrent: 0, employees: [] });
      const g = map.get(lvl);
      g.count++;
      g.totalCurrent += parseFloat(emp.monthly_gross || 0);
      g.employees.push(emp);
    });
    return map;
  }, [salaryData]);

  // ── Input handlers ─────────────────────────────────────────────────────────
  const handleBaseValueChange = useCallback((value) => {
    if (errors.baseValue1) dispatch(clearErrors());
    const n = parseFloat(value);
    if (value !== '' && (isNaN(n) || n <= 0)) {
      dispatch(setError({ field: 'baseValue1', message: 'Base value must be a positive number' }));
      return;
    }
    dispatch(updateScenarioInput({ field: 'baseValue1', value }));
    const t = setTimeout(() => {
      if (value && n > 0) calculateGrades();
      else clearCalculatedOutputs();
    }, 500);
    return () => clearTimeout(t);
  }, [dispatch, errors.baseValue1]);

  const handleCurrencyChange = useCallback((currency) => {
    dispatch(updateScenarioCurrency(currency));
  }, [dispatch]);

  const handleVerticalChange = useCallback((gradeName, value) => {
    const ek = `vertical-${gradeName}`;
    if (errors[ek]) dispatch(clearErrors());
    if (value !== '' && value !== null && value !== undefined) {
      const n = parseFloat(value);
      if (isNaN(n) || n < 0 || n > 100) {
        dispatch(setError({ field: ek, message: `Vertical rate for ${gradeName} must be 0-100` }));
        return;
      }
    }
    dispatch(updateGradeInput({ gradeName, field: 'vertical', value }));
    const t = setTimeout(() => calculateGrades(), 500);
    return () => clearTimeout(t);
  }, [dispatch, errors]);

  const handleGlobalHorizontalChange = useCallback((intervalKey, value) => {
    const ek = `global-horizontal-${intervalKey}`;
    if (errors[ek]) dispatch(clearErrors());
    if (value !== '' && value !== null && value !== undefined) {
      const n = parseFloat(value);
      if (isNaN(n) || n < 0 || n > 100) {
        dispatch(setError({ field: ek, message: `${intervalKey.replace(/_/g, ' ')} rate must be 0-100` }));
        return;
      }
    }
    dispatch(updateGlobalHorizontalInterval({ intervalKey, value }));
    const t = setTimeout(() => calculateGrades(), 500);
    return () => clearTimeout(t);
  }, [dispatch, errors]);

  const clearCalculatedOutputs = useCallback(() => {
    const empty = {};
    (scenarioInputs.gradeOrder || []).forEach(gn => {
      empty[gn] = { LD: '', LQ: '', M: '', UQ: '', UD: '' };
    });
    dispatch(setCalculatedOutputs(empty));
  }, [dispatch, scenarioInputs.gradeOrder]);

  const calculateGrades = useCallback(async () => {
    if (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
      clearCalculatedOutputs(); return;
    }
    if (!scenarioInputs.gradeOrder?.length) return;

    const hasV = Object.values(scenarioInputs.grades || {}).some(g =>
      g?.vertical !== null && g?.vertical !== '' && g?.vertical !== undefined && g?.vertical !== 0);
    const hasH = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(v =>
      v !== '' && v !== null && v !== undefined && v !== 0);

    if (!hasV && !hasH) { clearCalculatedOutputs(); return; }

    const sig = JSON.stringify({
      baseValue1: scenarioInputs.baseValue1,
      currency:   scenarioInputs.currency,
      grades:     scenarioInputs.grades,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals,
    });
    if (sig === lastCalculationInputs) return;

    setIsCalculating(true);
    setLastCalculationInputs(sig);

    const formattedGrades = {};
    (scenarioInputs.gradeOrder || []).forEach(gn => {
      const gi = scenarioInputs.grades[gn] || {};
      let v = gi.vertical;
      if (v === '' || v === null || v === undefined) v = null;
      else { v = parseFloat(v); if (isNaN(v)) v = null; }

      const cleanIvs = {};
      Object.keys(scenarioInputs.globalHorizontalIntervals || {}).forEach(k => {
        const iv = scenarioInputs.globalHorizontalIntervals[k];
        cleanIvs[k] = (iv === '' || iv === null || iv === undefined) ? 0 : parseFloat(iv) || 0;
      });

      formattedGrades[gn] = { vertical: v, horizontal_intervals: cleanIvs };
    });

    try {
      const response = await dispatch(calculateDynamicScenario({
        baseValue1: parseFloat(scenarioInputs.baseValue1),
        currency:   scenarioInputs.currency || 'AZN',
        gradeOrder: scenarioInputs.gradeOrder,
        grades:     formattedGrades,
      }));
      if (!response.type.endsWith('/fulfilled')) {
        console.error('Calculation failed:', response.payload);
      }
    } catch (e) {
      console.error('Error during calculation:', e);
    } finally {
      setIsCalculating(false);
    }
  }, [dispatch, scenarioInputs, lastCalculationInputs, clearCalculatedOutputs]);

  const handleSaveDraft = useCallback(async (customName = '') => {
    if (!validationSummary.canSave) {
      dispatch(setError({ field: 'saving', message: 'Please fix validation errors before saving' }));
      return null;
    }
    const name = customName?.trim()
      ? customName.trim()
      : `Scenario ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const response = await dispatch(saveDraftScenario({
      name,
      description:              customName?.trim() ? 'Custom scenario' : 'Auto-generated scenario',
      currency:                 scenarioInputs.currency || 'AZN',
      baseValue1:               parseFloat(scenarioInputs.baseValue1),
      gradeOrder:               scenarioInputs.gradeOrder,
      grades:                   scenarioInputs.grades,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals || {
        LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0,
      },
      calculatedOutputs,
    }));

    if (response.type.endsWith('/fulfilled')) {
      dispatch(initializeScenarioInputs(currentData));
      clearCalculatedOutputs();
      return response.payload;
    }
    return null;
  }, [dispatch, validationSummary.canSave, scenarioInputs, calculatedOutputs, currentData, clearCalculatedOutputs]);

  const handleSaveAsCurrent = useCallback(async (scenarioId) => {
    const response = await dispatch(applyScenario(scenarioId));
    if (response.type.endsWith('/fulfilled')) setIsDetailOpen(false);
  }, [dispatch]);

  const handleArchiveDraft = useCallback(async (scenarioId) => {
    const response = await dispatch(archiveScenario(scenarioId));
    if (response.type.endsWith('/fulfilled')) setIsDetailOpen(false);
  }, [dispatch]);

  const handleViewDetails = useCallback(async (scenario) => {
    try {
      if (scenario.id && scenario.status !== 'current') {
        const response = await dispatch(fetchScenarioDetails(scenario.id));
        dispatch(setSelectedScenario(
          response.type.endsWith('/fulfilled') ? response.payload : scenario
        ));
      } else {
        dispatch(setSelectedScenario(scenario));
      }
    } catch {
      dispatch(setSelectedScenario(scenario));
    }
    setIsDetailOpen(true);
  }, [dispatch]);

  const handleCompareScenarios = useCallback(async (scenarioIds) => {
    try {
      const response = await dispatch(compareScenarios(scenarioIds));
      return response.type.endsWith('/fulfilled') ? response.payload : null;
    } catch { return null; }
  }, [dispatch]);

  // ── Compare mode ───────────────────────────────────────────────────────────
  const toggleCompareMode = useCallback(() => {
    setCompareMode(prev => {
      if (prev) setSelectedForComparison([]);
      return !prev;
    });
  }, []);

  const toggleScenarioForComparison = useCallback((scenarioId) => {
    setSelectedForComparison(prev =>
      prev.includes(scenarioId) ? prev.filter(id => id !== scenarioId) : [...prev, scenarioId]
    );
  }, []);

  /**
   * Scenario-nu tap. 'current' üçün işçinin currency-sinə görə yaxud
   * seçilmiş currency-nin current scenario-sunu qaytar.
   *
   * @param {string} scenarioId
   * @param {string} [employeeCurrency] — işçinin salary_currency (optional)
   */
  const getScenarioForComparison = useCallback((scenarioId, employeeCurrency) => {
    if (scenarioId === 'current') {
      // İşçinin currency-sinə görə avtomatik seç; fallback → seçilmiş currency → AZN
      const cur = employeeCurrency && currentScenarios[employeeCurrency]
        ? employeeCurrency
        : selectedStructureCurrency && currentScenarios[selectedStructureCurrency]
          ? selectedStructureCurrency
          : Object.keys(currentScenarios)[0];

      const scenario = currentScenarios[cur] || Object.values(currentScenarios)[0];
      const struct   = currentStructures[cur] || Object.values(currentStructures)[0];
      return scenario
        ? { scenario, data: scenario.data || scenario, name: `Current Structure (${cur})`, status: 'current' }
        : struct
          ? { scenario: struct, data: struct, name: `Current Structure (${cur})`, status: 'current' }
          : null;
    }
    const all = [...draftScenarios, ...archivedScenarios];
    const s   = all.find(x => x.id === scenarioId);
    return s ? { scenario: s, data: s.data || s, name: s.name, status: s.status.toLowerCase() } : null;
  }, [currentScenarios, currentStructures, selectedStructureCurrency, draftScenarios, archivedScenarios]);

  const getVerticalInputValue = useCallback((scenarioId, gradeName) => {
    const src = scenarioId === 'current'
      ? (currentScenarios[selectedStructureCurrency] || Object.values(currentScenarios)[0])
      : getScenarioForComparison(scenarioId)?.scenario;
    if (!src) return null;
    if (src.input_rates?.[gradeName]?.vertical !== undefined) return src.input_rates[gradeName].vertical;
    if (src.data?.positionVerticalInputs?.[gradeName] !== undefined) return src.data.positionVerticalInputs[gradeName];
    return null;
  }, [currentScenarios, selectedStructureCurrency, getScenarioForComparison]);

  const getHorizontalInputValues = useCallback((scenarioId) => {
    const def = { LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0 };
    const src = scenarioId === 'current'
      ? (currentScenarios[selectedStructureCurrency] || Object.values(currentScenarios)[0])
      : getScenarioForComparison(scenarioId)?.scenario;
    if (!src) return def;
    if (src.data?.globalHorizontalIntervals) return src.data.globalHorizontalIntervals;
    if (src.input_rates) {
      for (const gd of Object.values(src.input_rates)) {
        if (gd?.horizontal_intervals) return gd.horizontal_intervals;
      }
    }
    return def;
  }, [currentScenarios, selectedStructureCurrency, getScenarioForComparison]);

  const refreshData = useCallback(() => loadInitialData(), [loadInitialData]);

  // ── Derived / memoised ─────────────────────────────────────────────────────
  const newScenarioDisplayData = useMemo(() => {
    if (!scenarioInputs.gradeOrder?.length) return null;
    const combined = {};
    scenarioInputs.gradeOrder.forEach(gn => {
      const inp = scenarioInputs.grades[gn] || { vertical: '' };
      const out = calculatedOutputs[gn]     || { LD: '', LQ: '', M: '', UQ: '', UD: '' };
      combined[gn] = {
        ...inp, ...out,
        isCalculated: Object.values(out).some(v => v && v !== ''),
      };
    });
    return {
      baseValue1:               scenarioInputs.baseValue1,
      currency:                 scenarioInputs.currency,
      gradeOrder:               scenarioInputs.gradeOrder,
      grades:                   combined,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals,
      calculationProgress: {
        totalPositions:      scenarioInputs.gradeOrder.length,
        calculatedPositions: Object.values(combined).filter(g => g.isCalculated).length,
        hasVerticalInputs:   Object.values(scenarioInputs.grades || {}).some(g =>
          g.vertical !== null && g.vertical !== '' && g.vertical !== undefined),
        hasHorizontalInputs: Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(v =>
          v !== '' && v !== null && v !== undefined && v !== 0),
      },
    };
  }, [scenarioInputs, calculatedOutputs]);

  useEffect(() => {
    if (!isInitialized || !scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) return;
    const hasAny =
      Object.values(scenarioInputs.grades || {}).some(g =>
        g.vertical !== null && g.vertical !== '' && g.vertical !== undefined && g.vertical !== 0) ||
      Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(v =>
        v !== '' && v !== null && v !== undefined && v !== 0);
    if (!hasAny) return;
    const t = setTimeout(() => calculateGrades(), 1000);
    return () => clearTimeout(t);
  }, [isInitialized, scenarioInputs, calculateGrades]);

  useEffect(() => {
    if (isInitialized && (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0)) {
      clearCalculatedOutputs();
    }
  }, [isInitialized, scenarioInputs.baseValue1, clearCalculatedOutputs]);

  const basePositionName = useMemo(() => {
    const order = currentData?.gradeOrder || scenarioInputs.gradeOrder;
    return order?.length ? order[order.length - 1] : 'Base Position';
  }, [currentData, scenarioInputs.gradeOrder]);

  const isLoading = useMemo(() =>
    Object.values(loading).some(Boolean) || isCalculating || !isInitialized,
  [loading, isCalculating, isInitialized]);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const dataAvailability = useMemo(() => ({
    hasCurrentData:       !!(currentData?.gradeOrder?.length),
    hasCurrentScenario:   !!(currentScenario?.id),
    hasPositionGroups:    !!(positionGroups?.length),
    hasDraftScenarios:    draftScenarios.length > 0,
    hasArchivedScenarios: archivedScenarios.length > 0,
    isSystemReady:        !!(currentData?.gradeOrder?.length && isInitialized),
  }), [currentData, currentScenario, positionGroups, draftScenarios, archivedScenarios, isInitialized]);

  return {
    // Data
    currentData,           // aktiv currency-nin structure-u
    currentStructures,     // bütün { AZN: {...}, USD: {...} }
    currentScenario,       // aktiv currency-nin scenario-su
    currentScenarios,      // bütün { AZN: {...}, USD: {...} }
    selectedStructureCurrency,
    availableStructureCurrencies,
    positionGroups,
    currencies,
    scenarioInputs, calculatedOutputs, newScenarioDisplayData,
    draftScenarios, archivedScenarios, selectedScenario, bestDraft, basePositionName,

    // Computed
    validationSummary, inputSummary, dataAvailability,

    // UI state
    isDetailOpen, setIsDetailOpen,
    compareMode, selectedForComparison,
    isLoading, isCalculating, errors, hasErrors, isInitialized,
    loading,

    // Grading actions
    handleBaseValueChange,
    handleCurrencyChange,
    handleStructureCurrencyChange,   // ← YENİ: current structure tab dəyişdirmə
    handleVerticalChange,
    handleGlobalHorizontalChange,
    handleSaveDraft,
    handleSaveAsCurrent,
    handleArchiveDraft,
    handleViewDetails,
    toggleCompareMode,
    toggleScenarioForComparison,
    getScenarioForComparison,
    calculateGrades,
    clearCalculatedOutputs,
    refreshData,
    getVerticalInputValue,
    getHorizontalInputValues,
    comparisonData,
    handleCompareScenarios,
    clearErrors: () => dispatch(clearErrors()),
    setError:    (field, message) => dispatch(setError({ field, message })),

    // Salary
    salaryData, salaryLoading, salaryError,
    salaryUpdating, salaryBulkUpdating,
    salaryPagination, salaryFilters, salaryByGrade,
    fetchSalaryData, handleSalaryUpdate, handleSalaryBulkUpdate,
    handleSalaryExcelImport, handleSalaryTemplateDownload, updateSalaryFilters,
  };
};

export default useGrading;