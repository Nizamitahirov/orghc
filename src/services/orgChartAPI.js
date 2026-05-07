// src/services/orgChartAPI.js - Mock fetch-based org chart service

const buildQueryString = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      if (value.length > 0) sp.append(key, value.join(","));
    } else {
      sp.append(key, value);
    }
  });
  return sp.toString();
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
  return { data, status: res.status };
};

export const orgChartAPI = {
  getOrgChartEmployee: async (id) => {
    return fetchJSON(`/api/org-chart/detail/${id}`);
  },

  getFullTreeWithVacancies: async (params = {}) => {
    const qs = buildQueryString(params);
    return fetchJSON(`/api/org-chart${qs ? `?${qs}` : ""}`);
  },

  getManagerTeam: async (managerId, params = {}) => {
    const all = await fetchJSON("/api/employees");
    const reports = (all.data.results || []).filter(
      (e) => (e.manager_id || e.line_manager) === parseInt(managerId, 10)
    );
    return { data: reports };
  },

  searchOrgChart: async (searchParams = {}) => {
    const qs = buildQueryString(searchParams);
    return fetchJSON(`/api/org-chart${qs ? `?${qs}` : ""}`);
  },

  applyFilterPreset: async (presetName, additionalParams = {}) => {
    return orgChartAPI.getFullTreeWithVacancies(additionalParams);
  },

  buildHierarchy: (employees) => {
    if (!Array.isArray(employees)) return { roots: [], map: {} };
    const employeeMap = {};
    const roots = [];
    employees.forEach((emp) => {
      employeeMap[emp.employee_id || emp.id] = { ...emp, children: [] };
    });
    employees.forEach((emp) => {
      const id = emp.employee_id || emp.id;
      const mgr = emp.line_manager_id || emp.manager_id || emp.line_manager;
      if (mgr && employeeMap[mgr]) {
        employeeMap[mgr].children.push(employeeMap[id]);
      } else {
        roots.push(employeeMap[id]);
      }
    });
    return { roots, map: employeeMap };
  },
};

export default orgChartAPI;
