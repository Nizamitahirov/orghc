// src/services/gradingApi.js
// Yalnız dəyişən/əlavə olan hissələr göstərilir.
// Köhnə formatCurrentStructure → formatCurrentStructures (dict qaytarır)

import api from './api';

export const gradingApi = {
  getCurrentStructure: () => api.get('/grading/systems/current_structure/'),
  compareScenarios: (scenarioIds) =>
    api.post('/grading/scenarios/compare_scenarios/', { scenario_ids: scenarioIds }),
  getCurrentScenario: () => api.get('/grading/scenarios/current_scenario/'),
  getPositionGroups: () => api.get('/grading/systems/position_groups/'),
  getCurrencies: () => api.get('/grading/systems/currencies/'),

  calculateDynamic: (scenarioData) => {
    const payload = {
      baseValue1: parseFloat(scenarioData.baseValue1) || 0,
      currency: scenarioData.currency || 'AZN',
      gradeOrder: scenarioData.gradeOrder || [],
      grades: {},
    };

    if (scenarioData.grades && typeof scenarioData.grades === 'object') {
      Object.keys(scenarioData.grades).forEach(gradeName => {
        const grade = scenarioData.grades[gradeName];
        if (grade && typeof grade === 'object') {
          const cleanGrade = { vertical: null, horizontal_intervals: {} };

          if (grade.vertical !== undefined && grade.vertical !== null && grade.vertical !== '') {
            const n = parseFloat(grade.vertical);
            if (!isNaN(n)) cleanGrade.vertical = n;
          }

          if (grade.horizontal_intervals && typeof grade.horizontal_intervals === 'object') {
            ['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].forEach(k => {
              const v = grade.horizontal_intervals[k];
              if (v !== undefined && v !== null && v !== '') {
                const n = parseFloat(v);
                cleanGrade.horizontal_intervals[k] = isNaN(n) ? 0 : n;
              } else {
                cleanGrade.horizontal_intervals[k] = 0;
              }
            });
          }

          payload.grades[gradeName] = cleanGrade;
        }
      });
    }

    return api.post('/grading/scenarios/calculate_dynamic/', payload);
  },

  saveDraft: (scenarioData) => {
    const payload = {
      name: scenarioData.name || `Scenario ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      description: scenarioData.description || 'Auto-generated scenario',
      currency: scenarioData.currency || 'AZN',
      baseValue1: parseFloat(scenarioData.baseValue1) || 0,
      gradeOrder: scenarioData.gradeOrder || [],
      grades: {},
      globalHorizontalIntervals: scenarioData.globalHorizontalIntervals || {
        LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0,
      },
      calculatedOutputs: scenarioData.calculatedOutputs || {},
    };

    if (scenarioData.grades && typeof scenarioData.grades === 'object') {
      Object.keys(scenarioData.grades).forEach(gradeName => {
        const grade = scenarioData.grades[gradeName];
        if (grade && typeof grade === 'object') {
          payload.grades[gradeName] = {
            vertical: (grade.vertical !== undefined && grade.vertical !== null && grade.vertical !== '')
              ? parseFloat(grade.vertical) || null
              : null,
          };
        }
      });
    }

    return api.post('/grading/scenarios/save_draft/', payload);
  },

  getScenarios: (params = {}) => {
    const sp = new URLSearchParams();
    if (params.status)   sp.append('status',   params.status.toUpperCase());
    if (params.search)   sp.append('search',   params.search);
    if (params.ordering) sp.append('ordering', params.ordering);
    if (params.currency) sp.append('currency', params.currency);
    const url = `/grading/scenarios/${sp.toString() ? `?${sp.toString()}` : ''}`;
    return api.get(url);
  },

  getScenario:     (id) => api.get(`/grading/scenarios/${id}/`),
  applyScenario:   (id) => api.post(`/grading/scenarios/${id}/apply_as_current/`, {}),
  archiveScenario: (id) => api.post(`/grading/scenarios/${id}/archive/`, {}),

  // ── Formatters ─────────────────────────────────────────────────────────────

  /**
   * Backend { structures: { AZN: {...}, USD: {...} }, currencies: [...] }
   * → { AZN: formattedStruct, USD: formattedStruct, ... }
   */
  formatCurrentStructures: (backendResponse) => {
    if (!backendResponse) return {};

    // Yeni format
    if (backendResponse.structures && typeof backendResponse.structures === 'object') {
      const result = {};
      Object.entries(backendResponse.structures).forEach(([currency, structData]) => {
        result[currency] = gradingApi._formatSingleCurrentStructure(
          structData.data || structData,
          currency
        );
      });
      return result;
    }

    // Köhnə format fallback — tək dict gəlibsə
    const currency = backendResponse.currency || 'AZN';
    return {
      [currency]: gradingApi._formatSingleCurrentStructure(backendResponse, currency),
    };
  },

  /**
   * Tək bir currency-nin structure dict-ini frontend formatına çevirir.
   * (köhnə formatCurrentStructure funksiyasının məntiqi)
   */
  _formatSingleCurrentStructure: (backendData, forceCurrency) => {
    const currency = forceCurrency || backendData?.currency || 'AZN';

    if (!backendData) {
      return {
        id: 'current', name: `Current Structure (${currency})`, currency,
        grades: {}, gradeOrder: [], verticalAvg: 0, horizontalAvg: 0,
        baseValue1: 0, status: 'current',
      };
    }

    const grades = {};
    const gradeOrder = Array.isArray(backendData.gradeOrder) ? backendData.gradeOrder : [];

    if (backendData.grades && typeof backendData.grades === 'object') {
      gradeOrder.forEach(gradeName => {
        const g = backendData.grades[gradeName];
        if (g && typeof g === 'object') {
          grades[gradeName] = {
            LD: parseFloat(g.LD || 0) || 0,
            LQ: parseFloat(g.LQ || 0) || 0,
            M:  parseFloat(g.M  || 0) || 0,
            UQ: parseFloat(g.UQ || 0) || 0,
            UD: parseFloat(g.UD || 0) || 0,
            vertical: parseFloat(g.vertical || 0) || 0,
            horizontal_intervals: g.horizontal_intervals || {
              LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0,
            },
            currency,
          };
        } else {
          grades[gradeName] = {
            LD: 0, LQ: 0, M: 0, UQ: 0, UD: 0, vertical: 0,
            horizontal_intervals: { LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0 },
            currency,
          };
        }
      });
    }

    return {
      id: 'current',
      name: `Current Structure (${currency})`,
      currency,
      grades,
      gradeOrder,
      verticalAvg:   parseFloat(backendData.verticalAvg   || 0) || 0,
      horizontalAvg: parseFloat(backendData.horizontalAvg || 0) || 0,
      baseValue1:    parseFloat(backendData.baseValue1    || 0) || 0,
      status: 'current',
    };
  },

  // Köhnə adı saxla — hər yerdə dəyişiklik lazım olmasın
  formatCurrentStructure: (backendData) => {
    return gradingApi._formatSingleCurrentStructure(backendData);
  },

  formatScenarioForFrontend: (backendScenario) => {
    if (!backendScenario) return null;

    const data          = backendScenario.data || {};
    const calcGrades    = backendScenario.calculated_grades || data.grades || {};
    const inputRates    = backendScenario.input_rates || {};
    const gradeOrder    = backendScenario.grade_order || data.gradeOrder || [];
    const currency      = backendScenario.currency || data.currency || 'AZN';

    let globalHorizontalIntervals = { LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0 };

    if (data.globalHorizontalIntervals && typeof data.globalHorizontalIntervals === 'object') {
      globalHorizontalIntervals = { ...data.globalHorizontalIntervals };
    } else if (inputRates && typeof inputRates === 'object') {
      for (const gradeName of gradeOrder) {
        const gi = inputRates[gradeName];
        if (gi?.horizontal_intervals && typeof gi.horizontal_intervals === 'object') {
          globalHorizontalIntervals = { ...gi.horizontal_intervals };
          break;
        }
      }
    }

    Object.keys(globalHorizontalIntervals).forEach(k => {
      const v = globalHorizontalIntervals[k];
      globalHorizontalIntervals[k] = (v !== null && v !== undefined && v !== '')
        ? parseFloat(v) || 0 : 0;
    });

    const positionVerticalInputs = {};
    if (inputRates && typeof inputRates === 'object') {
      gradeOrder.forEach(gradeName => {
        const gi = inputRates[gradeName];
        if (gi?.vertical !== undefined) positionVerticalInputs[gradeName] = gi.vertical;
      });
    }

    const formattedGrades = {};
    gradeOrder.forEach(gradeName => {
      const calc  = calcGrades[gradeName] || {};
      const input = inputRates[gradeName] || {};

      const extract = (obj, key, def = 0) => {
        const v = obj[key];
        if (v === null || v === undefined || v === '') return def;
        const p = parseFloat(v);
        return isNaN(p) ? def : p;
      };

      formattedGrades[gradeName] = {
        LD: extract(calc, 'LD'),
        LQ: extract(calc, 'LQ'),
        M:  extract(calc, 'M'),
        UQ: extract(calc, 'UQ'),
        UD: extract(calc, 'UD'),
        vertical:      input.vertical !== undefined ? input.vertical : null,
        verticalInput: input.vertical,
        horizontal_intervals: globalHorizontalIntervals,
        currency,
      };
    });

    let verticalAvg   = parseFloat(backendScenario.vertical_avg   ?? data.verticalAvg   ?? 0) || 0;
    let horizontalAvg = parseFloat(backendScenario.horizontal_avg ?? data.horizontalAvg ?? 0) || 0;
    let baseValue     = parseFloat(backendScenario.base_value     ?? data.baseValue1    ?? 0) || 0;

    const metrics = { totalBudgetImpact: 0, avgSalaryIncrease: 0, maxSalaryIncrease: 0, positionsAffected: 0, currency };
    if (backendScenario.metrics && typeof backendScenario.metrics === 'object') {
      metrics.totalBudgetImpact = parseFloat(backendScenario.metrics.totalBudgetImpact || 0) || 0;
      metrics.avgSalaryIncrease = parseFloat(backendScenario.metrics.avgSalaryIncrease || 0) || 0;
      metrics.maxSalaryIncrease = parseFloat(backendScenario.metrics.maxSalaryIncrease || 0) || 0;
      metrics.positionsAffected = parseInt(backendScenario.metrics.positionsAffected   || 0) || 0;
    }

    return {
      id:                   backendScenario.id,
      name:                 backendScenario.name || 'Unnamed Scenario',
      description:          backendScenario.description || '',
      status:               (backendScenario.status || 'draft').toLowerCase(),
      currency,
      createdAt:            backendScenario.created_at || new Date().toISOString(),
      calculationTimestamp: backendScenario.calculation_timestamp,
      appliedAt:            backendScenario.applied_at,
      vertical_avg:         verticalAvg,
      horizontal_avg:       horizontalAvg,
      input_rates:          inputRates,
      data: {
        baseValue1:                 baseValue,
        currency,
        gradeOrder,
        grades:                     formattedGrades,
        globalHorizontalIntervals,
        verticalAvg,
        horizontalAvg,
        positionVerticalInputs,
        inputRates,
        hasCalculation: !!(backendScenario.calculated_grades && Object.keys(backendScenario.calculated_grades).length > 0),
        isComplete:     gradeOrder.length > 0 && Object.keys(formattedGrades).length > 0,
      },
      metrics,
      isCalculated: !!(backendScenario.calculated_grades && Object.keys(backendScenario.calculated_grades).length > 0),
      createdBy:    backendScenario.created_by_name || backendScenario.created_by || 'Unknown',
      appliedBy:    backendScenario.applied_by_name || backendScenario.applied_by,
    };
  },

  // ── Helpers ───────────────────────────────────────────────────────────────

  validateScenarioData: (scenarioData) => {
    const errors = {};
    if (!scenarioData.baseValue1 || scenarioData.baseValue1 <= 0)
      errors.baseValue1 = 'Base value must be greater than 0';
    if (!scenarioData.gradeOrder?.length)
      errors.gradeOrder = 'Grade order is required';
    if (!scenarioData.grades || typeof scenarioData.grades !== 'object')
      errors.grades = 'Grade inputs are required';
    else if (scenarioData.gradeOrder) {
      scenarioData.gradeOrder.forEach((gradeName, idx) => {
        const isBase = idx === scenarioData.gradeOrder.length - 1;
        const grade  = scenarioData.grades[gradeName];
        if (grade && !isBase && grade.vertical !== null && grade.vertical !== undefined && grade.vertical !== '') {
          const n = parseFloat(grade.vertical);
          if (isNaN(n) || n < 0 || n > 100)
            errors[`vertical-${gradeName}`] = `Vertical rate for ${gradeName} must be 0-100`;
        }
      });
    }
    if (scenarioData.globalHorizontalIntervals) {
      ['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].forEach(k => {
        const v = scenarioData.globalHorizontalIntervals[k];
        if (v !== null && v !== undefined && v !== '') {
          const n = parseFloat(v);
          if (isNaN(n) || n < 0 || n > 100)
            errors[`global-horizontal-${k}`] = `${k} rate must be 0-100`;
        }
      });
    }
    return errors;
  },

  cleanScenarioData: (scenarioData) => {
    const cleaned = {
      baseValue1:               parseFloat(scenarioData.baseValue1) || 0,
      currency:                 scenarioData.currency || 'AZN',
      gradeOrder:               Array.isArray(scenarioData.gradeOrder) ? [...scenarioData.gradeOrder] : [],
      grades:                   {},
      globalHorizontalIntervals: { LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0 },
      calculatedOutputs:        scenarioData.calculatedOutputs || {},
    };
    if (scenarioData.grades) {
      Object.keys(scenarioData.grades).forEach(gn => {
        const g = scenarioData.grades[gn];
        if (g && typeof g === 'object') {
          cleaned.grades[gn] = {
            vertical: (g.vertical !== null && g.vertical !== undefined && g.vertical !== '')
              ? parseFloat(g.vertical) || null : null,
          };
        }
      });
    }
    if (scenarioData.globalHorizontalIntervals) {
      Object.keys(cleaned.globalHorizontalIntervals).forEach(k => {
        const v = scenarioData.globalHorizontalIntervals[k];
        cleaned.globalHorizontalIntervals[k] = (v !== null && v !== undefined && v !== '')
          ? parseFloat(v) || 0 : 0;
      });
    }
    return cleaned;
  },

  extractVerticalInputForGrade: (scenario, gradeName) => {
    if (!scenario) return null;
    if (scenario.input_rates?.[gradeName]?.vertical !== undefined)
      return scenario.input_rates[gradeName].vertical;
    if (scenario.data?.positionVerticalInputs?.[gradeName] !== undefined)
      return scenario.data.positionVerticalInputs[gradeName];
    if (scenario.data?.grades?.[gradeName]?.verticalInput !== undefined)
      return scenario.data.grades[gradeName].verticalInput;
    return null;
  },

  extractHorizontalInputs: (scenario) => {
    if (!scenario) return null;
    if (scenario.data?.globalHorizontalIntervals) return scenario.data.globalHorizontalIntervals;
    if (scenario.input_rates) {
      for (const gd of Object.values(scenario.input_rates)) {
        if (gd?.horizontal_intervals) return gd.horizontal_intervals;
      }
    }
    return { LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0 };
  },
};

export default gradingApi;