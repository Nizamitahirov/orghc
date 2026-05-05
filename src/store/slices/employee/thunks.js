// Employee domain thunks — extracted from employeeSlice.js for maintainability
import { createAsyncThunk } from '@reduxjs/toolkit';
import { employeeAPI } from '../../api/employeeAPI';

// ── Core CRUD ─────────────────────────────────────────────────

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getAll(params);
      return {
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous,
          current_page: response.data.current_page || params.page || 1,
          total_pages: response.data.total_pages || Math.ceil((response.data.count || 0) / (params.page_size || 25)),
          page_size: response.data.page_size || params.page_size || 25,
        },
      };
    } catch (error) {
      const status = error.response?.status || error.status;
      if (status === 403) return rejectWithValue({ message: 'Access Denied', status: 403 });
      return rejectWithValue(error.data || { message: error.message });
    }
  }
);

export const fetchEmployee = createAsyncThunk(
  'employees/fetchEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.create(employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'employees/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getStatistics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const searchEmployeesAdvanced = createAsyncThunk(
  'employees/searchEmployeesAdvanced',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.searchAdvanced(searchParams);
      return {
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous,
          current_page: response.data.current_page || searchParams.page || 1,
          total_pages: response.data.total_pages || Math.ceil((response.data.count || 0) / (searchParams.page_size || 25)),
          page_size: response.data.page_size || searchParams.page_size || 25,
        },
        searchParams,
      };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ── Org Chart Visibility ──────────────────────────────────────

export const toggleOrgChartVisibility = createAsyncThunk(
  'employees/toggleOrgChartVisibility',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.toggleOrgChartVisibility(employeeId);
      return { employeeId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkToggleOrgChartVisibility = createAsyncThunk(
  'employees/bulkToggleOrgChartVisibility',
  async ({ employeeIds, setVisible }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkToggleOrgChartVisibility(employeeIds, setVisible);
      return { employeeIds, setVisible, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ── Tags ──────────────────────────────────────────────────────

export const addEmployeeTag = createAsyncThunk(
  'employees/addEmployeeTag',
  async ({ employee_id, tag_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.addTag({ employee_id, tag_id });
      return { employee_id, tag: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const removeEmployeeTag = createAsyncThunk(
  'employees/removeEmployeeTag',
  async ({ employee_id, tag_id }, { rejectWithValue }) => {
    try {
      await employeeAPI.removeTag({ employee_id, tag_id });
      return { employee_id, tag_id };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkAddTags = createAsyncThunk(
  'employees/bulkAddTags',
  async ({ employee_ids, tag_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkAddTags(employee_ids, tag_id);
      return { employee_ids, tag_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkRemoveTags = createAsyncThunk(
  'employees/bulkRemoveTags',
  async ({ employee_ids, tag_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkRemoveTags(employee_ids, tag_id);
      return { employee_ids, tag_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ── Line Manager ──────────────────────────────────────────────

export const assignLineManager = createAsyncThunk(
  'employees/assignLineManager',
  async ({ employee_id, line_manager_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.assignLineManager({ employee_id, line_manager_id });
      return { employee_id, line_manager_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkAssignLineManager = createAsyncThunk(
  'employees/bulkAssignLineManager',
  async ({ employee_ids, line_manager_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkAssignLineManager({ employee_ids, line_manager_id });
      return { employee_ids, line_manager_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ── Profile Photos ────────────────────────────────────────────

export const uploadEmployeeProfilePhoto = createAsyncThunk(
  'employees/uploadProfilePhoto',
  async ({ employeeId, file }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.uploadProfileImage(employeeId, file);
      return { employeeId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to upload profile photo' });
    }
  }
);

export const deleteEmployeeProfilePhoto = createAsyncThunk(
  'employees/deleteProfilePhoto',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.deleteProfileImage(employeeId);
      return { employeeId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete profile photo' });
    }
  }
);

// ── Grading ───────────────────────────────────────────────────

export const fetchEmployeeGrading = createAsyncThunk(
  'employees/fetchEmployeeGrading',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployeeGrading();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ── Export & Bulk Upload ──────────────────────────────────────

export const exportEmployees = createAsyncThunk(
  'employees/exportEmployees',
  async ({ format = 'excel', params = {} }, { rejectWithValue }) => {
    try {
      await employeeAPI.export({ format, ...params });
      return { format, recordCount: params.employee_ids?.length || 'filtered', success: true };
    } catch (error) {
      return rejectWithValue(error.data || error.message || 'Export failed');
    }
  }
);

export const downloadEmployeeTemplate = createAsyncThunk(
  'employees/downloadEmployeeTemplate',
  async (_, { rejectWithValue }) => {
    try {
      await employeeAPI.downloadTemplate();
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkUploadEmployees = createAsyncThunk(
  'employees/bulkUploadEmployees',
  async (file, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkUpload(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ── Activities ────────────────────────────────────────────────

export const fetchEmployeeActivities = createAsyncThunk(
  'employees/fetchEmployeeActivities',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getActivities(employeeId);
      return { employeeId, activities: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchEmployeeDirectReports = createAsyncThunk(
  'employees/fetchEmployeeDirectReports',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getDirectReports(employeeId);
      return { employeeId, directReports: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);
