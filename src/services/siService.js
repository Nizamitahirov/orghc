// src/services/siService.js
import api from './api';

const BASE = '/bonus/si';

// ─── Company Config ────────────────────────────────────────
export const siConfigService = {
  list:               ()         => api.get(`${BASE}/configs/`),
  get:                (id)       => api.get(`${BASE}/configs/${id}/`),
  create:             (data)     => api.post(`${BASE}/configs/`, data),
  update:             (id, data) => api.patch(`${BASE}/configs/${id}/`, data),
  eligibleEmployees:  (id)       => api.get(`${BASE}/configs/${id}/eligible_employees/`),
};

// ─── Eligible Positions ────────────────────────────────────
export const siPositionService = {
  list:   (configId) => api.get(`${BASE}/eligible-positions/`, { params: { company_config: configId } }),
  create: (data)     => api.post(`${BASE}/eligible-positions/`, data),
  update: (id, data) => api.patch(`${BASE}/eligible-positions/${id}/`, data),
  delete: (id)       => api.delete(`${BASE}/eligible-positions/${id}/`),
};

// ─── Company KPIs ──────────────────────────────────────────
export const siCompanyKPIService = {
  list:   (configId) => api.get(`${BASE}/company-kpis/`, { params: { company_config: configId } }),
  create: (data)     => api.post(`${BASE}/company-kpis/`, data),
  update: (id, data) => api.patch(`${BASE}/company-kpis/${id}/`, data),
  delete: (id)       => api.delete(`${BASE}/company-kpis/${id}/`),
};

// ─── Company KPI Rating Scales ─────────────────────────────
export const siCompanyScaleService = {
  list:   (configId) => api.get(`${BASE}/company-kpi-scales/`, { params: { company_config: configId } }),
  create: (data)     => api.post(`${BASE}/company-kpi-scales/`, data),
  update: (id, data) => api.patch(`${BASE}/company-kpi-scales/${id}/`, data),
  delete: (id)       => api.delete(`${BASE}/company-kpi-scales/${id}/`),
};

// ─── Individual KPIs ───────────────────────────────────────
export const siIndividualKPIService = {
  list:   (configId) => api.get(`${BASE}/individual-kpis/`, { params: { company_config: configId } }),
  create: (data)     => api.post(`${BASE}/individual-kpis/`, data),
  update: (id, data) => api.patch(`${BASE}/individual-kpis/${id}/`, data),
  delete: (id)       => api.delete(`${BASE}/individual-kpis/${id}/`),
};

// ─── Individual KPI Rating Scales ──────────────────────────
export const siIndividualScaleService = {
  list:   (kpiId) => api.get(`${BASE}/individual-kpi-scales/`, { params: { individual_kpi: kpiId } }),
  create: (data)  => api.post(`${BASE}/individual-kpi-scales/`, data),
  update: (id, data) => api.patch(`${BASE}/individual-kpi-scales/${id}/`, data),
  delete: (id)    => api.delete(`${BASE}/individual-kpi-scales/${id}/`),
};

// ─── Periods ───────────────────────────────────────────────
export const siPeriodService = {
  list:       (configId) => api.get(`${BASE}/periods/`, { params: { company_config: configId } }),
  create:     (data)     => api.post(`${BASE}/periods/`, data),
  update:     (id, data) => api.patch(`${BASE}/periods/${id}/`, data),
  delete:     (id)       => api.delete(`${BASE}/periods/${id}/`),
  initialize:     (id)         => api.post(`${BASE}/periods/${id}/initialize/`),
  lock:           (id)         => api.post(`${BASE}/periods/${id}/lock/`),
  unlock:         (id)         => api.post(`${BASE}/periods/${id}/unlock/`),
  setCompanyKpis: (id, inputs) => api.patch(`${BASE}/periods/${id}/set_company_kpis/`, { company_kpi_inputs: inputs }),
};

// ─── Calculations ──────────────────────────────────────────
export const siCalcService = {
  list:            (periodId) => api.get(`${BASE}/calculations/`, { params: { period: periodId, page_size: 200 } }),
  listByEmployee:  (employeeId) => api.get(`${BASE}/calculations/`, { params: { employee_id: employeeId, page_size: 50 } }),
  exportExcel:     (params) => api.get(`${BASE}/calculations/export_excel/`, { params, responseType: 'blob' }),
  exportPdf:       (id)     => api.get(`${BASE}/calculations/${id}/export_pdf/`, { responseType: 'blob' }),
  detail:          (id)       => api.get(`${BASE}/calculations/${id}/`),
  calculate:       (id, data) => api.post(`${BASE}/calculations/${id}/calculate/`, data),
  bulkCalculate:   (data)     => api.post(`${BASE}/calculations/bulk_calculate/`, data),
  approve:         (id)       => api.post(`${BASE}/calculations/${id}/approve/`),
  setOverride:     (id, data) => api.post(`${BASE}/calculations/${id}/set_manager_override/`, data),
  periodSummary:   (periodId) => api.get(`${BASE}/calculations/period_summary/`, { params: { period: periodId } }),
  refreshSalaries: (periodId) => api.post(`${BASE}/calculations/refresh_salaries/`, { period_id: periodId }),
};