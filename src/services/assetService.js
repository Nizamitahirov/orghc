// src/services/assetService.js
import axios from "axios";

// ─── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── HTTP helpers ──────────────────────────────────────────────────────────────
const get = (url, params = {}) =>
  api
    .get(url, {
      params,
      paramsSerializer: (p) => {
        const sp = new URLSearchParams();
        Object.entries(p).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach((i) => sp.append(k, i));
          else if (v !== undefined && v !== null && v !== "") sp.append(k, v);
        });
        return sp.toString();
      },
    })
    .then((r) => r.data);

// Fetch every page and return a flat array of all results
export const fetchAll = async (url, params = {}, pageSize = 200) => {
  let results = [];
  let page = 1;
  while (true) {
    const res = await get(url, { ...params, page, page_size: pageSize });
    const items = res.results ?? res;
    results = results.concat(items);
    if (!res.next || !Array.isArray(res.results)) break;
    page++;
  }
  return results;
};

const post  = (url, data = {}) => api.post(url, data).then((r) => r.data);
const put   = (url, data = {}) => api.put(url, data).then((r) => r.data);
const patch = (url, data = {}) => api.patch(url, data).then((r) => r.data);
const del   = (url)            => api.delete(url).then((r) => r.data);

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORY  —  /assets/categories/
// ══════════════════════════════════════════════════════════════════════════════
export const categoryService = {
  list:   (params = {}) => get("/assets/categories/", params),
  detail: (id)          => get(`/assets/categories/${id}/`),
  create: (data)        => post("/assets/categories/", data),
  update: (id, data)    => put(`/assets/categories/${id}/`, data),
  patch:  (id, data)    => patch(`/assets/categories/${id}/`, data),
  remove: (id)          => del(`/assets/categories/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// BATCH  —  /assets/batches/
// ══════════════════════════════════════════════════════════════════════════════
export const batchService = {
  list:       (params = {}) => get("/assets/batches/", params),
  detail:     (id)          => get(`/assets/batches/${id}/`),
  create:     (data)        => post("/assets/batches/", data),
  update:     (id, data)    => put(`/assets/batches/${id}/`, data),
  patch:      (id, data)    => patch(`/assets/batches/${id}/`, data),
  remove:     (id)          => del(`/assets/batches/${id}/`),
  addAssets:  (id, data)    => post(`/assets/batches/${id}/add-assets/`, data),
  assets:     (id)          => get(`/assets/batches/${id}/assets/`),
  statistics: ()            => get("/assets/batches/statistics/"),
};

// ══════════════════════════════════════════════════════════════════════════════
// ASSET  —  /assets/assets/
// ══════════════════════════════════════════════════════════════════════════════
export const assetService = {
  // ── CRUD ──────────────────────────────────────────────────────────────────
  list:   (params = {}) => get("/assets/assets/", params),
  detail: (id)          => get(`/assets/assets/${id}/`),
  update: (id, data)    => put(`/assets/assets/${id}/`, data),
  patch:  (id, data)    => patch(`/assets/assets/${id}/`, data),
  remove: (id)          => del(`/assets/assets/${id}/`),

  // ── Read-only actions ─────────────────────────────────────────────────────
  activities:     (id) => get(`/assets/assets/${id}/activities/`),
  statistics:     ()   => get("/assets/assets/statistics/"),
  accessInfo:     ()   => get("/assets/assets/access-info/"),
  pendingActions: ()   => get("/assets/assets/pending-actions/"),
  myAssets:       ()   => get("/assets/assets/my-assets/"),
  assignmentHistory: (id) => get(`/assets/assets/${id}/assignment-history/`),

  // ── Assign flow ───────────────────────────────────────────────────────────
  // Body: { asset_ids: UUID[], employee_id, check_out_date,
  //         condition_out?, check_out_notes?, require_acceptance? }
  assign: (data) => post("/assets/assets/assign/", data),

  // Body: { asset_id: UUID, comments? }
  accept: (data) => post("/assets/assets/accept/", data),

  // Body: { asset_id: UUID, reason: string }
  requestClarification: (data) =>
    post("/assets/assets/request-clarification/", data),

  // Body: { asset_id: UUID, response: string }
  provideClarification: (data) =>
    post("/assets/assets/provide-clarification/", data),

  // Body: { asset_ids: UUID[], condition_in?, check_in_notes? }
  bulkCheckIn: (data) => post("/assets/assets/bulk-check-in/", data),

  // file: File (.xlsx | .xls | .csv, max 10 MB)
  bulkUpload: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api
      .post("/assets/assets/bulk-upload/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// OFFBOARDING  —  /assets/offboarding/
// ══════════════════════════════════════════════════════════════════════════════
export const offboardingService = {
  list:   (params = {}) => get("/assets/offboarding/", params),
  detail: (id)          => get(`/assets/offboarding/${id}/`),
  update: (id, data)    => put(`/assets/offboarding/${id}/`, data),
  patch:  (id, data)    => patch(`/assets/offboarding/${id}/`, data),
  remove: (id)          => del(`/assets/offboarding/${id}/`),

  // Body: { employee_id, last_working_day, offboarding_type, notes? }
  initiate: (data) => post("/assets/offboarding/initiate/", data),

  // Returns: { employee, offboarding_type, total_assets, assets[] }
  assets: (id) => get(`/assets/offboarding/${id}/assets/`),

  // Returns: offboarding summary with processed_assets[]
  summary: (id) => get(`/assets/offboarding/${id}/summary/`),


  processAsset: (id, data) =>
    post(`/assets/offboarding/${id}/process-asset/`, data),

  // Köhnə metodlar — geriyə uyğunluq üçün saxlanıb
  // Artıq processAsset istifadə edilir
  bulkTransfer:     (id, data) => post(`/assets/offboarding/${id}/bulk-transfer/`, data),
  completeHandover: (id)       => post(`/assets/offboarding/${id}/complete-handover/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// TRANSFER REQUESTS  —  /assets/transfers/
// ══════════════════════════════════════════════════════════════════════════════
export const transferService = {
  list:      (params = {}) => get("/assets/transfers/", params),
  detail:    (id)          => get(`/assets/transfers/${id}/`),
  myPending: ()            => get("/assets/transfers/my-pending/"),
  // Body: { accepted: boolean, reason?: string }
  respond:   (id, data)    => post(`/assets/transfers/${id}/respond/`, data),
};

// ══════════════════════════════════════════════════════════════════════════════
// HANDOVER (Tehvil Aktı)  —  /assets/handovers/
// ══════════════════════════════════════════════════════════════════════════════
export const handoverService = {
  list:      (params = {}) => get("/assets/handovers/", params),
  detail:    (id)          => get(`/assets/handovers/${id}/`),
  myPending: ()            => get("/assets/handovers/my-pending/"),
  // Body: { notes?: string }
  accept:    (id, data={}) => post(`/assets/handovers/${id}/accept/`, data),
};

// ══════════════════════════════════════════════════════════════════════════════
// EMPLOYEE  —  /employees/
// ══════════════════════════════════════════════════════════════════════════════
export const employeeService = {
  list:   (params = {}) => get("/employees/", params),
  detail: (id)          => get(`/employees/${id}/`),
};

// ══════════════════════════════════════════════════════════════════════════════
// UI CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════
export const ASSET_STATUS = {
  IN_STOCK:           { label: "In Stock",            color: "#6B7280", bg: "#F3F4F6" },
  ASSIGNED:           { label: "Pending Accept",       color: "#D97706", bg: "#FEF3C7" },
  IN_USE:             { label: "In Use",              color: "#059669", bg: "#D1FAE5" },
  NEED_CLARIFICATION: { label: "Needs Clarification", color: "#7C3AED", bg: "#EDE9FE" },
  IN_REPAIR:          { label: "In Repair",           color: "#2563EB", bg: "#DBEAFE" },
  OUT_OF_SERVICE:     { label: "Out of Service",      color: "#DC2626", bg: "#FEE2E2" },
  ARCHIVED:           { label: "Archived",            color: "#78350F", bg: "#FEF3C7" },
};

export const OFFBOARDING_TYPE = {
  TRANSFER: "Transfer to Another Employee",
  RETURN:   "Return to IT",
  MIXED:    "Mixed",
};

export const OFFBOARDING_STATUS = {
  PENDING:     { label: "Pending",     color: "#D97706", bg: "#FEF3C7" },
  IN_PROGRESS: { label: "In Progress", color: "#2563EB", bg: "#DBEAFE" },
  COMPLETED:   { label: "Completed",   color: "#059669", bg: "#D1FAE5" },
  CANCELLED:   { label: "Cancelled",   color: "#DC2626", bg: "#FEE2E2" },
};

export const TRANSFER_STATUS = {
  PENDING:   { label: "Pending",   color: "#D97706", bg: "#FEF3C7" },
  ACCEPTED:  { label: "Accepted",  color: "#2563EB", bg: "#DBEAFE" },
  REJECTED:  { label: "Rejected",  color: "#DC2626", bg: "#FEE2E2" },
  COMPLETED: { label: "Completed", color: "#059669", bg: "#D1FAE5" },
};

export const CONDITION = ["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"];

// ══════════════════════════════════════════════════════════════════════════════
// DOWNLOAD HELPER
// ══════════════════════════════════════════════════════════════════════════════
export const downloadBlob = (blobData, filename) => {
  const url = window.URL.createObjectURL(blobData);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default api;