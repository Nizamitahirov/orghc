// src/store/slices/gradingSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { gradingApi } from '@/services/gradingApi';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchCurrentStructure = createAsyncThunk(
  'grading/fetchCurrentStructure',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getCurrentStructure();
      // Backend indi { structures: { AZN: {...}, USD: {...} }, currencies: [...] } qaytarır
      return gradingApi.formatCurrentStructures(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchCurrentScenario = createAsyncThunk(
  'grading/fetchCurrentScenario',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getCurrentScenario();
      // Backend currency param olmadan bütün current-ları qaytarır:
      // { current_scenarios: [...], count: N }  YA DA  tək scenario object
      const data = response.data;
      if (data.current_scenarios) {
        // { currency: formattedScenario } dict qaytar
        const map = {};
        data.current_scenarios.forEach(s => {
          map[s.currency] = gradingApi.formatScenarioForFrontend(s);
        });
        return map;
      }
      // Köhnə format — tək scenario
      const formatted = gradingApi.formatScenarioForFrontend(data);
      return { [formatted.currency || 'AZN']: formatted };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchCurrencies = createAsyncThunk(
  'grading/fetchCurrencies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getCurrencies();
      return response.data.currencies || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const compareScenarios = createAsyncThunk(
  'grading/compareScenarios',
  async (scenarioIds, { rejectWithValue }) => {
    try {
      const response = await gradingApi.compareScenarios(scenarioIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchScenarios = createAsyncThunk(
  'grading/fetchScenarios',
  async ({ status }, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getScenarios({ status });
      const scenarios = response.data.results || response.data || [];
      const formattedScenarios = scenarios
        .filter(s => s && s.id)
        .map(s => gradingApi.formatScenarioForFrontend(s));
      return { scenarios: formattedScenarios, status };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchScenarioDetails = createAsyncThunk(
  'grading/fetchScenarioDetails',
  async (scenarioId, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getScenario(scenarioId);
      return gradingApi.formatScenarioForFrontend(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPositionGroups = createAsyncThunk(
  'grading/fetchPositionGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getPositionGroups();
      return response.data.position_groups || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const calculateDynamicScenario = createAsyncThunk(
  'grading/calculateDynamicScenario',
  async (scenarioData, { rejectWithValue }) => {
    try {
      const response = await gradingApi.calculateDynamic(scenarioData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const saveDraftScenario = createAsyncThunk(
  'grading/saveDraftScenario',
  async (scenarioData, { rejectWithValue, dispatch }) => {
    try {
      const response = await gradingApi.saveDraft(scenarioData);
      if (response.data.success) {
        dispatch(fetchScenarios({ status: 'DRAFT' }));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const applyScenario = createAsyncThunk(
  'grading/applyScenario',
  async (scenarioId, { rejectWithValue, dispatch }) => {
    try {
      const response = await gradingApi.applyScenario(scenarioId);
      if (response.data.success) {
        await Promise.all([
          dispatch(fetchCurrentStructure()),
          dispatch(fetchCurrentScenario()),
          dispatch(fetchScenarios({ status: 'DRAFT' })),
          dispatch(fetchScenarios({ status: 'ARCHIVED' })),
        ]);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const archiveScenario = createAsyncThunk(
  'grading/archiveScenario',
  async (scenarioId, { rejectWithValue, dispatch }) => {
    try {
      const response = await gradingApi.archiveScenario(scenarioId);
      if (response.data.success) {
        await Promise.all([
          dispatch(fetchScenarios({ status: 'DRAFT' })),
          dispatch(fetchScenarios({ status: 'ARCHIVED' })),
        ]);
      }
      return { scenarioId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  // Multi-currency: { AZN: structureObj, USD: structureObj, ... }
  currentStructures: {},
  // Aktiv seçilmiş currency (UI tab/dropdown)
  selectedStructureCurrency: 'AZN',

  // Multi-currency current scenarios: { AZN: scenarioObj, USD: scenarioObj, ... }
  currentScenarios: {},

  positionGroups: [],
  comparisonData: null,

  currencies: [
    { code: 'AZN', label: 'Azerbaijani Manat' },
    { code: 'USD', label: 'US Dollar' },
    { code: 'EUR', label: 'Euro' },
    { code: 'GBP', label: 'British Pound' },
    { code: 'RUB', label: 'Russian Ruble' },
    { code: 'TRY', label: 'Turkish Lira' },
  ],

  scenarioInputs: {
    baseValue1: '',
    currency: 'AZN',
    gradeOrder: [],
    grades: {},
    globalHorizontalIntervals: {
      LD_to_LQ: '', LQ_to_M: '', M_to_UQ: '', UQ_to_UD: '',
    },
  },

  calculatedOutputs: {},
  draftScenarios:    [],
  archivedScenarios: [],
  selectedScenario:  null,

  loading: {
    currentStructure:  false,
    currentScenario:   false,
    positionGroups:    false,
    currencies:        false,
    draftScenarios:    false,
    archivedScenarios: false,
    scenarioDetails:   false,
    calculating:       false,
    saving:            false,
    applying:          false,
    archiving:         false,
    comparing:         false,
  },

  errors: {},
  isInitialized: false,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const gradingSlice = createSlice({
  name: 'grading',
  initialState,
  reducers: {
    updateScenarioInput: (state, action) => {
      const { field, value } = action.payload;
      state.scenarioInputs[field] = value;
    },
    updateScenarioCurrency: (state, action) => {
      state.scenarioInputs.currency = action.payload;
    },
    // Aktiv göstərilən current structure currency-sini dəyiş (UI tab)
    setSelectedStructureCurrency: (state, action) => {
      state.selectedStructureCurrency = action.payload;
    },
    updateGradeInput: (state, action) => {
      const { gradeName, field, value } = action.payload;
      if (!state.scenarioInputs.grades[gradeName]) {
        state.scenarioInputs.grades[gradeName] = {};
      }
      state.scenarioInputs.grades[gradeName][field] = value;
    },
    updateGlobalHorizontalInterval: (state, action) => {
      const { intervalKey, value } = action.payload;
      state.scenarioInputs.globalHorizontalIntervals[intervalKey] = value;
    },
    setCalculatedOutputs: (state, action) => {
      state.calculatedOutputs = action.payload;
    },
    setSelectedScenario: (state, action) => {
      state.selectedScenario = action.payload;
    },
    clearErrors: (state) => {
      state.errors = {};
    },
    setError: (state, action) => {
      const { field, message } = action.payload;
      state.errors[field] = message;
    },
    initializeScenarioInputs: (state, action) => {
      // currentData — tək bir currency-nin structure-u (selectedStructureCurrency-yə uyğun)
      const currentData = action.payload;
      if (currentData?.gradeOrder?.length > 0) {
        const initialGrades = {};
        currentData.gradeOrder.forEach((gradeName, idx) => {
          const isBase = idx === currentData.gradeOrder.length - 1;
          initialGrades[gradeName] = { vertical: isBase ? null : '' };
        });
        state.scenarioInputs = {
          baseValue1: '',
          currency: state.scenarioInputs.currency || 'AZN',
          gradeOrder: currentData.gradeOrder,
          grades: initialGrades,
          globalHorizontalIntervals: {
            LD_to_LQ: '', LQ_to_M: '', M_to_UQ: '', UQ_to_UD: '',
          },
        };
        const initOut = {};
        currentData.gradeOrder.forEach(gn => {
          initOut[gn] = { LD: '', LQ: '', M: '', UQ: '', UD: '' };
        });
        state.calculatedOutputs = initOut;
      }
    },
  },

  extraReducers: (builder) => {
    // ── Current Structure (multi-currency) ───────────────────────────────────
    builder
      .addCase(fetchCurrentStructure.pending, (state) => {
        state.loading.currentStructure = true;
        delete state.errors.currentStructure;
      })
      .addCase(fetchCurrentStructure.fulfilled, (state, action) => {
        state.loading.currentStructure = false;
        // action.payload = { AZN: structObj, USD: structObj, ... }
        state.currentStructures = action.payload || {};

        // Əgər seçilmiş currency mövcud deyilsə, birinciyə fall back et
        const available = Object.keys(state.currentStructures);
        if (available.length > 0 && !state.currentStructures[state.selectedStructureCurrency]) {
          state.selectedStructureCurrency = available[0];
        }
      })
      .addCase(fetchCurrentStructure.rejected, (state, action) => {
        state.loading.currentStructure = false;
        state.errors.currentStructure = action.payload;
      });

    // ── Current Scenario (multi-currency) ────────────────────────────────────
    builder
      .addCase(fetchCurrentScenario.pending, (state) => {
        state.loading.currentScenario = true;
        delete state.errors.currentScenario;
      })
      .addCase(fetchCurrentScenario.fulfilled, (state, action) => {
        state.loading.currentScenario = false;
        // action.payload = { AZN: scenarioObj, USD: scenarioObj, ... }
        state.currentScenarios = action.payload || {};
      })
      .addCase(fetchCurrentScenario.rejected, (state, action) => {
        state.loading.currentScenario = false;
        state.errors.currentScenario = action.payload;
      });

    // ── Currencies ───────────────────────────────────────────────────────────
    builder
      .addCase(fetchCurrencies.pending, (state) => {
        state.loading.currencies = true;
      })
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.loading.currencies = false;
        if (action.payload.length > 0) state.currencies = action.payload;
      })
      .addCase(fetchCurrencies.rejected, (state) => {
        state.loading.currencies = false;
      });

    // ── Compare ───────────────────────────────────────────────────────────────
    builder
      .addCase(compareScenarios.pending, (state) => {
        state.loading.comparing = true;
        delete state.errors.comparing;
      })
      .addCase(compareScenarios.fulfilled, (state, action) => {
        state.loading.comparing = false;
        state.comparisonData = action.payload.comparison;
      })
      .addCase(compareScenarios.rejected, (state, action) => {
        state.loading.comparing = false;
        state.errors.comparing = action.payload;
      });

    // ── Position Groups ───────────────────────────────────────────────────────
    builder
      .addCase(fetchPositionGroups.pending, (state) => {
        state.loading.positionGroups = true;
        delete state.errors.positionGroups;
      })
      .addCase(fetchPositionGroups.fulfilled, (state, action) => {
        state.loading.positionGroups = false;
        state.positionGroups = action.payload;
      })
      .addCase(fetchPositionGroups.rejected, (state, action) => {
        state.loading.positionGroups = false;
        state.errors.positionGroups = action.payload;
      });

    // ── Calculate ─────────────────────────────────────────────────────────────
    builder
      .addCase(calculateDynamicScenario.pending, (state) => {
        state.loading.calculating = true;
        delete state.errors.calculating;
      })
      .addCase(calculateDynamicScenario.fulfilled, (state, action) => {
        state.loading.calculating = false;
        if (action.payload?.calculatedOutputs) {
          state.calculatedOutputs = action.payload.calculatedOutputs;
        }
      })
      .addCase(calculateDynamicScenario.rejected, (state, action) => {
        state.loading.calculating = false;
        state.errors.calculating = action.payload;
      });

    // ── Fetch Scenarios ───────────────────────────────────────────────────────
    builder
      .addCase(fetchScenarios.pending, (state, action) => {
        const s = action.meta.arg.status;
        if (s === 'DRAFT')    state.loading.draftScenarios    = true;
        if (s === 'ARCHIVED') state.loading.archivedScenarios = true;
      })
      .addCase(fetchScenarios.fulfilled, (state, action) => {
        const { scenarios, status } = action.payload;
        if (status === 'DRAFT') {
          state.loading.draftScenarios = false;
          state.draftScenarios = scenarios;
        } else if (status === 'ARCHIVED') {
          state.loading.archivedScenarios = false;
          state.archivedScenarios = scenarios;
        }
      })
      .addCase(fetchScenarios.rejected, (state, action) => {
        const s = action.meta.arg.status;
        if (s === 'DRAFT')    { state.loading.draftScenarios    = false; state.errors.draftScenarios    = action.payload; }
        if (s === 'ARCHIVED') { state.loading.archivedScenarios = false; state.errors.archivedScenarios = action.payload; }
      });

    // ── Scenario Details ──────────────────────────────────────────────────────
    builder
      .addCase(fetchScenarioDetails.pending, (state) => {
        state.loading.scenarioDetails = true;
        delete state.errors.scenarioDetails;
      })
      .addCase(fetchScenarioDetails.fulfilled, (state, action) => {
        state.loading.scenarioDetails = false;
        state.selectedScenario = action.payload;
      })
      .addCase(fetchScenarioDetails.rejected, (state, action) => {
        state.loading.scenarioDetails = false;
        state.errors.scenarioDetails = action.payload;
      });

    // ── Save / Apply / Archive ────────────────────────────────────────────────
    builder
      .addCase(saveDraftScenario.pending,  (state) => { state.loading.saving = true;  delete state.errors.saving; })
      .addCase(saveDraftScenario.fulfilled,(state) => { state.loading.saving = false; })
      .addCase(saveDraftScenario.rejected, (state, action) => { state.loading.saving = false; state.errors.saving = action.payload; });

    builder
      .addCase(applyScenario.pending,  (state) => { state.loading.applying = true;  delete state.errors.applying; })
      .addCase(applyScenario.fulfilled,(state) => { state.loading.applying = false; })
      .addCase(applyScenario.rejected, (state, action) => { state.loading.applying = false; state.errors.applying = action.payload; });

    builder
      .addCase(archiveScenario.pending,  (state) => { state.loading.archiving = true;  delete state.errors.archiving; })
      .addCase(archiveScenario.fulfilled,(state) => { state.loading.archiving = false; })
      .addCase(archiveScenario.rejected, (state, action) => { state.loading.archiving = false; state.errors.archiving = action.payload; });
  },
});

export const {
  updateScenarioInput,
  updateScenarioCurrency,
  setSelectedStructureCurrency,
  updateGradeInput,
  updateGlobalHorizontalInterval,
  setCalculatedOutputs,
  setSelectedScenario,
  clearErrors,
  setError,
  initializeScenarioInputs,
} = gradingSlice.actions;

export default gradingSlice.reducer;

// ── Base Selectors ────────────────────────────────────────────────────────────

export const selectCurrentStructures        = (state) => state.grading.currentStructures;
export const selectSelectedStructureCurrency = (state) => state.grading.selectedStructureCurrency;
export const selectCurrentScenarios         = (state) => state.grading.currentScenarios;
export const selectPositionGroups           = (state) => state.grading.positionGroups;
export const selectCurrencies               = (state) => state.grading.currencies;
export const selectScenarioInputs           = (state) => state.grading.scenarioInputs;
export const selectCalculatedOutputs        = (state) => state.grading.calculatedOutputs;
export const selectDraftScenarios           = (state) => state.grading.draftScenarios;
export const selectArchivedScenarios        = (state) => state.grading.archivedScenarios;
export const selectSelectedScenario         = (state) => state.grading.selectedScenario;
export const selectLoading                  = (state) => state.grading.loading;
export const selectErrors                   = (state) => state.grading.errors;
export const selectComparisonData           = (state) => state.grading.comparisonData;

// ── Computed Selectors ────────────────────────────────────────────────────────

/**
 * Aktiv currency-nin current structure-u.
 * useGrading-da `currentData` kimi istifadə edilir — köhnə interfeys qorunur.
 */
export const selectCurrentStructure = createSelector(
  [selectCurrentStructures, selectSelectedStructureCurrency],
  (structures, currency) => structures[currency] || Object.values(structures)[0] || null
);

/**
 * Aktiv currency-nin current scenario-su.
 * useGrading-da `currentScenario` kimi istifadə edilir.
 */
export const selectCurrentScenario = createSelector(
  [selectCurrentScenarios, selectSelectedStructureCurrency],
  (scenarios, currency) => scenarios[currency] || Object.values(scenarios)[0] || null
);

/**
 * Mövcud currency kodlarının siyahısı (current structures-dan).
 */
export const selectAvailableStructureCurrencies = createSelector(
  [selectCurrentStructures],
  (structures) => Object.keys(structures)
);

export const selectIsLoading = createSelector(
  [selectLoading],
  (loading) => Object.values(loading).some(Boolean)
);

export const selectHasErrors = createSelector(
  [selectErrors],
  (errors) => Object.keys(errors).length > 0
);

export const selectBestDraftScenario = createSelector(
  [selectDraftScenarios],
  (drafts) => {
    if (!drafts.length) return null;
    const score = (s) => {
      const d = s.data || {};
      const v = d.verticalAvg || 0, h = d.horizontalAvg || 0, b = d.baseValue1 || 0;
      if (b <= 0) return 0;
      return (v + h) / (1 + Math.abs(v - h) * 2);
    };
    return drafts.reduce((best, s) => score(s) > score(best) ? s : best, drafts[0]);
  }
);

export const selectValidationSummary = createSelector(
  [selectScenarioInputs, selectCalculatedOutputs, selectErrors],
  (inputs, outputs, errors) => {
    const hasBaseValue        = !!(inputs.baseValue1 && parseFloat(inputs.baseValue1) > 0);
    const hasVerticalInputs   = Object.values(inputs.grades || {}).some(g =>
      g.vertical !== null && g.vertical !== '' && g.vertical !== undefined && g.vertical !== 0);
    const hasHorizontalInputs = Object.values(inputs.globalHorizontalIntervals || {}).some(v =>
      v !== '' && v !== null && v !== undefined && v !== 0);
    const hasCalculatedOutputs = Object.values(outputs || {}).some(g =>
      g && Object.values(g).some(v => v && v !== ''));
    const hasErrors = Object.keys(errors).some(k => errors[k]);
    return {
      hasBaseValue, hasVerticalInputs, hasHorizontalInputs, hasCalculatedOutputs, hasErrors,
      canSave: hasBaseValue && hasCalculatedOutputs && (hasVerticalInputs || hasHorizontalInputs) && !hasErrors,
    };
  }
);

export const selectInputSummary = createSelector(
  [selectScenarioInputs],
  (inputs) => {
    if (!inputs.gradeOrder?.length) return null;
    const total = inputs.gradeOrder.length;
    return {
      totalPositions:       total,
      basePosition:         inputs.gradeOrder[total - 1],
      verticalInputsNeeded: total - 1,
      horizontalIntervals:  ['LD→LQ', 'LQ→M', 'M→UQ', 'UQ→UD'],
      hasGlobalIntervals:   Object.values(inputs.globalHorizontalIntervals || {}).some(v =>
        v !== '' && v !== null && v !== undefined && v !== 0),
    };
  }
);