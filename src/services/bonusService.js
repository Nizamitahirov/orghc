// services/bonusService.js
import api from './api';

const BONUS_BASE = '/bonus';

// ─── Bonus Years ───────────────────────────────────────────
export const bonusYearService = {
  list:   ()        => api.get(`${BONUS_BASE}/years/`),
  create: (data)    => api.post(`${BONUS_BASE}/years/`, data),
  update: (id, data) => api.patch(`${BONUS_BASE}/years/${id}/`, data),
  lock:   (id)      => api.post(`${BONUS_BASE}/years/${id}/lock/`),
  unlock: (id)      => api.post(`${BONUS_BASE}/years/${id}/unlock/`),
};

// ─── Bonus Evaluation Scale Config ────────────────────────
export const bonusEvalScaleService = {
  list:   ()         => api.get(`${BONUS_BASE}/evaluation-scales/`),
  update: (id, data) => api.patch(`${BONUS_BASE}/evaluation-scales/${id}/`, data),
};

// ─── Position Group Configs ────────────────────────────────
export const bonusPositionConfigService = {
  list:        ()         => api.get(`${BONUS_BASE}/position-configs/`),
  withGroups:  ()         => api.get(`${BONUS_BASE}/position-configs/with_position_groups/`),
  create:      (data)     => api.post(`${BONUS_BASE}/position-configs/`, data),
  update:      (id, data) => api.patch(`${BONUS_BASE}/position-configs/${id}/`, data),
};

export const exchangeRateService = {
  list:   (bonusYearId) => api.get(`${BONUS_BASE}/exchange-rates/`, { params: { bonus_year: bonusYearId } }),
  create: (data)        => api.post(`${BONUS_BASE}/exchange-rates/`, data),
  update: (id, data)    => api.patch(`${BONUS_BASE}/exchange-rates/${id}/`, data),
  delete: (id)          => api.delete(`${BONUS_BASE}/exchange-rates/${id}/`),
};
// ─── Company Targets ───────────────────────────────────────
export const companyTargetService = {
  list:          (bonusYearId) => api.get(`${BONUS_BASE}/company-targets/`, { params: { bonus_year: bonusYearId } }),
  create:        (data)        => api.post(`${BONUS_BASE}/company-targets/`, data),
  update:        (id, data)    => api.patch(`${BONUS_BASE}/company-targets/${id}/`, data),
  delete:        (id)          => api.delete(`${BONUS_BASE}/company-targets/${id}/`),
  weightSummary: (bonusYearId) => api.get(`${BONUS_BASE}/company-targets/weight_summary/`, { params: { bonus_year: bonusYearId } }),
};

// ─── Target Evaluations ────────────────────────────────────
export const targetEvaluationService = {
  list:   (bonusYearId) => api.get(`${BONUS_BASE}/target-evaluations/`, { params: { bonus_year: bonusYearId } }),
  create: (data)        => api.post(`${BONUS_BASE}/target-evaluations/`, data),
  update: (id, data)    => api.patch(`${BONUS_BASE}/target-evaluations/${id}/`, data),
      delete: (id) => api.delete(`${BONUS_BASE}/target-evaluations/${id}/`),

};

// ─── Objective Adjusted Weight Config ─────────────────────
export const objectiveWeightConfigService = {
  list:   ()         => api.get(`${BONUS_BASE}/objective-weight-config/`),
  create: (data)     => api.post(`${BONUS_BASE}/objective-weight-config/`, data),
  update: (id, data) => api.patch(`${BONUS_BASE}/objective-weight-config/${id}/`, data),
};

export const competencyBonusConfigService = {
  list:   (bonusYearId) => api.get(`${BONUS_BASE}/competency-configs/`, { params: { bonus_year: bonusYearId } }),
  create: (data)        => api.post(`${BONUS_BASE}/competency-configs/`, data),
  update: (id, data)    => api.patch(`${BONUS_BASE}/competency-configs/${id}/`, data),
  // toggle: (id) silindi — artıq yoxdur

  // YENİ: bütün competency-ləri toggle
  toggleAll:  (bonusYearId, isEnabled) =>
    api.post(`${BONUS_BASE}/competency-configs/toggle-all/`, {
      bonus_year: bonusYearId,
      is_enabled: isEnabled,
    }),

  // YENİ: type üzrə toggle (BEHAVIORAL / LEADERSHIP)
  toggleType: (bonusYearId, competencyType, isEnabled) =>
    api.post(`${BONUS_BASE}/competency-configs/toggle-type/`, {
      bonus_year:      bonusYearId,
      competency_type: competencyType,
      is_enabled:      isEnabled,
    }),
};


// ─── Bonus Records ─────────────────────────────────────────
export const bonusRecordService = {
  list:          (bonusYearId) => api.get(`${BONUS_BASE}/records/`, { params: { bonus_year: bonusYearId, page_size: 1000 } }),
  detail:        (id)          => api.get(`${BONUS_BASE}/records/${id}/`),
  initialize:    (bonusYearId) => api.post(`${BONUS_BASE}/records/initialize/`, { bonus_year_id: bonusYearId }),
  setSalary:     (id, data)    => api.patch(`${BONUS_BASE}/records/${id}/set_salary/`, data),
  calculate:     (id)          => api.post(`${BONUS_BASE}/records/${id}/calculate/`),
  bulkCalculate: (bonusYearId) => api.post(`${BONUS_BASE}/records/bulk_calculate/`, { bonus_year_id: bonusYearId }),
  approve:       (id)          => api.post(`${BONUS_BASE}/records/${id}/approve/`),
  exportExcel:   (bonusYearId) => api.get(`${BONUS_BASE}/records/export_excel/`, { params: { bonus_year: bonusYearId }, responseType: 'blob' }),
  exportPdf:     (id)          => api.get(`${BONUS_BASE}/records/${id}/export_pdf/`, { responseType: 'blob' }),
};

// ─── Helper: blob → download ───────────────────────────────
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};