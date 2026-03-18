// services/financeService.js
import api from "./api";

const financeService = {
  getReports: () =>
    api.get("/finance/"),

  getReportDetail: (id) =>
    api.get(`/finance/${id}/`),

  uploadReport: (formData, onProgress) =>
    api.post("/finance/upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) =>
        onProgress?.(Math.round((e.loaded * 100) / e.total)),
    }),

  deleteReport: (id) =>
    api.delete(`/finance/${id}/delete/`),
};

export default financeService;