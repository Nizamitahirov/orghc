// src/services/api.js - Mock fetch-based service (no real backend)

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        if (key === "ordering" || key === "sort") {
          const sortStr = value
            .map((s) => {
              if (typeof s === "object" && s.field && s.direction) {
                return s.direction === "desc" ? `-${s.field}` : s.field;
              }
              return s;
            })
            .join(",");
          searchParams.append("ordering", sortStr);
        } else {
          searchParams.append(key, value.join(","));
        }
      }
    } else if (typeof value === "object") {
      if (value.from && value.to) {
        searchParams.append(`${key}_from`, value.from);
        searchParams.append(`${key}_to`, value.to);
      } else {
        searchParams.append(key, JSON.stringify(value));
      }
    } else {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw { status: res.status, data: err, message: err.message || res.statusText };
  }
  const data = await res.json();
  // Wrap in axios-like shape { data }
  return { data, status: res.status };
};

// No-op token manager kept for compatibility
export const TokenManager = {
  getAccessToken: () => null,
  clearTokens: () => {},
  redirectToLogin: () => {
    if (typeof window !== "undefined") window.location.href = "/login";
  },
};

export const apiService = {
  // ── Auth (stubs) ───────────────────────────────────────────────────────────
  login: async (credentials) => ({ data: { access: "mock", refresh: "mock" } }),
  logout: async () => ({ data: {} }),
  refreshToken: async () => ({ data: { access: "mock" } }),

  // ── Business Functions ─────────────────────────────────────────────────────
  getBusinessFunctions: async (params = {}) => {
    const qs = buildQueryString(params);
    return fetchJSON(`/api/business-functions${qs ? `?${qs}` : ""}`);
  },
  getBusinessFunction: async (id) => fetchJSON(`/api/business-functions`).then((r) => ({
    data: (r.data.results || []).find((b) => b.id === parseInt(id, 10)) || null,
  })),

  // ── Departments ────────────────────────────────────────────────────────────
  getDepartments: async (params = {}) => {
    const qs = buildQueryString(params);
    return fetchJSON(`/api/departments${qs ? `?${qs}` : ""}`);
  },
  getDepartment: async (id) => fetchJSON(`/api/departments/${id}`),
  createDepartment: async (data) =>
    fetchJSON("/api/departments", { method: "POST", body: JSON.stringify(data) }),
  updateDepartment: async (id, data) =>
    fetchJSON(`/api/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDepartment: async (id) =>
    fetchJSON(`/api/departments/${id}`, { method: "DELETE" }),

  // ── Employees ──────────────────────────────────────────────────────────────
  getEmployees: async (params = {}) => {
    const qs = buildQueryString(params);
    return fetchJSON(`/api/employees${qs ? `?${qs}` : ""}`);
  },
  getEmployee: async (id) => fetchJSON(`/api/employees/${id}`),
  createEmployee: async (data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const headers = data instanceof FormData ? {} : { "Content-Type": "application/json" };
    return fetchJSON("/api/employees", { method: "POST", body, headers });
  },
  updateEmployee: async (id, data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const headers = data instanceof FormData ? {} : { "Content-Type": "application/json" };
    return fetchJSON(`/api/employees/${id}`, { method: "PUT", body, headers });
  },
  deleteEmployee: async (id) =>
    fetchJSON(`/api/employees/${id}`, { method: "DELETE" }),

  getEmployeeStatistics: async () => fetchJSON("/api/employees/statistics"),
  getEmployeeDirectReports: async (id) => {
    const all = await fetchJSON("/api/employees");
    const reports = (all.data.results || []).filter(
      (e) => (e.manager_id || e.line_manager) === parseInt(id, 10)
    );
    return { data: reports };
  },
  getEmployeeActivities: async (id) => ({ data: [] }),

  // ── Positions ──────────────────────────────────────────────────────────────
  getPositions: async (params = {}) => {
    const qs = buildQueryString(params);
    return fetchJSON(`/api/positions${qs ? `?${qs}` : ""}`);
  },

  // ── Units (stub - return empty) ────────────────────────────────────────────
  getUnits: async () => ({ data: { results: [], count: 0 } }),
  getUnit: async () => ({ data: {} }),

  // ── Job Functions / Titles (stub) ─────────────────────────────────────────
  getJobFunctions: async () => ({ data: { results: [], count: 0 } }),
  getJobFunction: async () => ({ data: {} }),
  getJobTitles: async () => ({ data: { results: [], count: 0 } }),
  getJobTitle: async () => ({ data: {} }),

  // ── Position Groups (stub) ─────────────────────────────────────────────────
  getPositionGroups: async () => ({ data: { results: [], count: 0 } }),

  // ── Employee Statuses (stub) ───────────────────────────────────────────────
  getEmployeeStatuses: async () => ({
    data: {
      results: [
        { id: 1, name: "Active", status_type: "ACTIVE", is_active: true },
        { id: 2, name: "Inactive", status_type: "INACTIVE", is_active: true },
        { id: 3, name: "Probation", status_type: "PROBATION", is_active: true },
        { id: 4, name: "Onboarding", status_type: "ONBOARDING", is_active: true },
        { id: 5, name: "On Leave", status_type: "ON_LEAVE", is_active: true },
      ],
      count: 5,
    },
  }),

  // ── Employee Tags (stub) ───────────────────────────────────────────────────
  getEmployeeTags: async () => ({ data: { results: [], count: 0 } }),

  // ── Contract Configs (stub) ────────────────────────────────────────────────
  getContractConfigs: async () => ({
    data: {
      results: [
        { id: 1, contract_type: "PERMANENT", display_name: "Permanent", is_active: true },
        { id: 2, contract_type: "FIXED_TERM", display_name: "Fixed Term", is_active: true },
      ],
      count: 2,
    },
  }),

  // ── Employment Types (stub) ────────────────────────────────────────────────
  getEmploymentTypes: async () => ({
    data: {
      results: [
        { id: 1, name: "Full Time", code: "FULL_TIME", is_active: true },
        { id: 2, name: "Part Time", code: "PART_TIME", is_active: true },
        { id: 3, name: "Contract", code: "CONTRACT", is_active: true },
      ],
      count: 3,
    },
  }),

  // ── Org chart visibility toggles (stub) ───────────────────────────────────
  toggleOrgChartVisibility: async () => ({ data: { success: true } }),
  bulkToggleOrgChartVisibility: async () => ({ data: { success: true } }),

  // ── Tag management (stub) ─────────────────────────────────────────────────
  addEmployeeTag: async () => ({ data: { success: true } }),
  removeEmployeeTag: async () => ({ data: { success: true } }),
  bulkAddTags: async () => ({ data: { success: true } }),
  bulkRemoveTags: async () => ({ data: { success: true } }),

  // ── Line manager (stub) ───────────────────────────────────────────────────
  assignLineManager: async () => ({ data: { success: true } }),
  bulkAssignLineManager: async () => ({ data: { success: true } }),

  // ── Documents (stub) ──────────────────────────────────────────────────────
  getEmployeeDocuments: async () => ({ data: [] }),
  uploadEmployeeDocument: async () => ({ data: { success: true } }),
  deleteEmployeeDocument: async () => ({ data: { success: true } }),
  downloadEmployeeDocument: async () => ({ success: true }),
  signEmployeeDocument: async () => ({ data: { success: true } }),
  downloadSignedDocument: async () => ({ success: true }),

  // ── Profile images (stub) ─────────────────────────────────────────────────
  uploadProfileImage: async () => ({ data: { success: true } }),
  deleteProfileImage: async () => ({ data: { success: true } }),

  // ── Export / Bulk upload (stub) ───────────────────────────────────────────
  exportEmployees: async () => ({ success: true }),
  downloadEmployeeTemplate: async () => ({ success: true }),
  bulkUploadEmployees: async () => ({ data: { success: true } }),

  // ── Advanced search ───────────────────────────────────────────────────────
  searchEmployeesAdvanced: async (params = {}) => {
    return apiService.getEmployees(params);
  },

  buildSortingParams: (sortingArray) => {
    if (!Array.isArray(sortingArray) || sortingArray.length === 0) return "";
    return sortingArray
      .map((s) => {
        if (typeof s === "object" && s.field && s.direction) {
          return s.direction === "desc" ? `-${s.field}` : s.field;
        }
        return typeof s === "string" ? s : "";
      })
      .filter(Boolean)
      .join(",");
  },

  applyFilterPreset: (presetName, additionalParams = {}) => {
    const presets = {
      active_employees: { status: ["ACTIVE"], is_active: true },
      org_chart_visible: { is_visible_in_org_chart: true },
    };
    return apiService.searchEmployeesAdvanced({
      ...(presets[presetName] || {}),
      ...additionalParams,
    });
  },

  // ── Generic utilities ─────────────────────────────────────────────────────
  get: (endpoint, params = {}) => {
    const qs = buildQueryString(params);
    return fetchJSON(`${endpoint}${qs ? `?${qs}` : ""}`);
  },
  post: (endpoint, data, options = {}) =>
    fetchJSON(endpoint, { method: "POST", body: JSON.stringify(data), ...options }),
  put: (endpoint, data, options = {}) =>
    fetchJSON(endpoint, { method: "PUT", body: JSON.stringify(data), ...options }),
  delete: (endpoint) => fetchJSON(endpoint, { method: "DELETE" }),
};

export default apiService;
