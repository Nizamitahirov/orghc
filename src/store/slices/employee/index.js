import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { reducers } from './reducers';
import { capitalizeAcronyms } from '../../../utils/formatText';

const normalizeEmployee = (emp) =>
  emp ? { ...emp, job_title: capitalizeAcronyms(emp.job_title) } : emp;
import {
  fetchEmployees, fetchEmployee, createEmployee, updateEmployee, fetchStatistics,
  toggleOrgChartVisibility, bulkToggleOrgChartVisibility,
  addEmployeeTag, removeEmployeeTag, bulkAddTags, bulkRemoveTags,
  assignLineManager, bulkAssignLineManager,
  uploadEmployeeProfilePhoto, deleteEmployeeProfilePhoto,
  fetchEmployeeGrading, exportEmployees, downloadEmployeeTemplate, bulkUploadEmployees,
  fetchEmployeeActivities, fetchEmployeeDirectReports, searchEmployeesAdvanced,
} from './thunks';

// Re-export thunks
export * from './thunks';

// Re-export selectors
export * from './selectors';

// ── Slice ────────────────────────────────────────────────────────────────────
const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers,
  extraReducers: (builder) => {
    // Fetch employees
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading.employees = true; state.error.employees = null; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading.employees = false;
        state.employees = action.payload.data.map(normalizeEmployee);
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
          hasNext: !!action.payload.pagination.next,
          hasPrevious: !!action.payload.pagination.previous,
        };
      })
      .addCase(fetchEmployees.rejected, (state, action) => { state.loading.employees = false; state.error.employees = action.payload; });

    // Fetch single employee
    builder
      .addCase(fetchEmployee.pending, (state) => { state.loading.employee = true; state.error.employee = null; })
      .addCase(fetchEmployee.fulfilled, (state, action) => { state.loading.employee = false; state.currentEmployee = normalizeEmployee(action.payload); })
      .addCase(fetchEmployee.rejected, (state, action) => { state.loading.employee = false; state.error.employee = action.payload; });

    // Create
    builder
      .addCase(createEmployee.pending, (state) => { state.loading.creating = true; state.error.create = null; })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.employees.unshift(normalizeEmployee(action.payload));
        state.statistics.total_employees += 1;
        state.statistics.active_employees += 1;
      })
      .addCase(createEmployee.rejected, (state, action) => { state.loading.creating = false; state.error.create = action.payload; });

    // Update
    builder
      .addCase(updateEmployee.pending, (state) => { state.loading.updating = true; state.error.update = null; })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading.updating = false;
        const updated = normalizeEmployee(action.payload);
        const idx = state.employees.findIndex(e => e.id === updated.id);
        if (idx !== -1) state.employees[idx] = updated;
        if (state.currentEmployee?.id === updated.id) state.currentEmployee = updated;
      })
      .addCase(updateEmployee.rejected, (state, action) => { state.loading.updating = false; state.error.update = action.payload; });

    // Statistics
    builder
      .addCase(fetchStatistics.pending, (state) => { state.loading.statistics = true; state.error.statistics = null; })
      .addCase(fetchStatistics.fulfilled, (state, action) => { state.loading.statistics = false; state.statistics = action.payload; })
      .addCase(fetchStatistics.rejected, (state, action) => { state.loading.statistics = false; state.error.statistics = action.payload; });

    // Org chart visibility
    builder
      .addCase(toggleOrgChartVisibility.pending, (state) => { state.loading.orgChart = true; state.error.orgChart = null; })
      .addCase(toggleOrgChartVisibility.fulfilled, (state, action) => {
        state.loading.orgChart = false;
        const { employeeId, result } = action.payload;
        const emp = state.employees.find(e => e.id === employeeId);
        if (emp && result.employee) {
          emp.is_visible_in_org_chart = result.employee.is_visible_in_org_chart;
          emp._isOptimisticOrgChart = false;
        }
      })
      .addCase(toggleOrgChartVisibility.rejected, (state, action) => {
        state.loading.orgChart = false;
        state.error.orgChart = action.payload;
        state.employees.forEach(emp => {
          if (emp._isOptimisticOrgChart) { emp.is_visible_in_org_chart = !emp.is_visible_in_org_chart; emp._isOptimisticOrgChart = false; }
        });
      });

    builder
      .addCase(bulkToggleOrgChartVisibility.pending, (state) => { state.loading.bulkOperations = true; state.error.bulkOperations = null; })
      .addCase(bulkToggleOrgChartVisibility.fulfilled, (state, action) => {
        state.loading.bulkOperations = false;
        const { employeeIds, setVisible, result } = action.payload;
        if (result.updated_employees) {
          result.updated_employees.forEach(updated => {
            const emp = state.employees.find(e => e.id === updated.id);
            if (emp) { emp.is_visible_in_org_chart = updated.is_visible_in_org_chart; emp._isOptimisticOrgChart = false; }
          });
        } else {
          employeeIds.forEach(id => {
            const emp = state.employees.find(e => e.id === id);
            if (emp) { emp.is_visible_in_org_chart = setVisible; emp._isOptimisticOrgChart = false; }
          });
        }
        state.selectedEmployees = [];
      })
      .addCase(bulkToggleOrgChartVisibility.rejected, (state, action) => {
        state.loading.bulkOperations = false;
        state.error.bulkOperations = action.payload;
        state.employees.forEach(emp => {
          if (emp._isOptimisticOrgChart) { emp.is_visible_in_org_chart = !emp.is_visible_in_org_chart; emp._isOptimisticOrgChart = false; }
        });
      });

    // Tags
    builder
      .addCase(addEmployeeTag.pending, (state) => { state.loading.tagUpdate = true; state.error.tagUpdate = null; })
      .addCase(addEmployeeTag.fulfilled, (state, action) => {
        state.loading.tagUpdate = false;
        const { employee_id, tag } = action.payload;
        const emp = state.employees.find(e => e.id === employee_id);
        if (emp) { if (!emp.tag_names) emp.tag_names = []; emp.tag_names.push(tag); }
      })
      .addCase(addEmployeeTag.rejected, (state, action) => { state.loading.tagUpdate = false; state.error.tagUpdate = action.payload; });

    builder
      .addCase(removeEmployeeTag.fulfilled, (state, action) => {
        const { employee_id, tag_id } = action.payload;
        const emp = state.employees.find(e => e.id === employee_id);
        if (emp?.tag_names) emp.tag_names = emp.tag_names.filter(t => t.id !== tag_id);
      });

    builder
      .addCase(bulkAddTags.fulfilled, (state, action) => {
        const { employee_ids, result } = action.payload;
        if (result.tag_info) {
          employee_ids.forEach(id => {
            const emp = state.employees.find(e => e.id === id);
            if (emp) { if (!emp.tag_names) emp.tag_names = []; emp.tag_names.push(result.tag_info); }
          });
        }
        state.selectedEmployees = [];
      });

    builder
      .addCase(bulkRemoveTags.fulfilled, (state, action) => {
        const { employee_ids, tag_id } = action.payload;
        employee_ids.forEach(id => {
          const emp = state.employees.find(e => e.id === id);
          if (emp?.tag_names) emp.tag_names = emp.tag_names.filter(t => t.id !== tag_id);
        });
        state.selectedEmployees = [];
      });

    // Line manager
    builder
      .addCase(assignLineManager.pending, (state) => { state.loading.lineManagerUpdate = true; state.error.lineManagerUpdate = null; })
      .addCase(assignLineManager.fulfilled, (state, action) => {
        state.loading.lineManagerUpdate = false;
        const { employee_id, line_manager_id, result } = action.payload;
        const emp = state.employees.find(e => e.id === employee_id);
        if (emp && result.line_manager_info) {
          emp.line_manager = line_manager_id;
          emp.line_manager_name = result.line_manager_info.name;
          emp.line_manager_hc_number = result.line_manager_info.employee_id;
        }
      })
      .addCase(assignLineManager.rejected, (state, action) => { state.loading.lineManagerUpdate = false; state.error.lineManagerUpdate = action.payload; });

    builder
      .addCase(bulkAssignLineManager.fulfilled, (state, action) => {
        const { employee_ids, line_manager_id, result } = action.payload;
        if (result.line_manager_info) {
          employee_ids.forEach(id => {
            const emp = state.employees.find(e => e.id === id);
            if (emp) {
              emp.line_manager = line_manager_id;
              emp.line_manager_name = result.line_manager_info.name;
              emp.line_manager_hc_number = result.line_manager_info.employee_id;
            }
          });
        }
        state.selectedEmployees = [];
      });

    // Profile photo
    builder
      .addCase(uploadEmployeeProfilePhoto.pending, (state) => { state.loading.profilePhoto = true; state.error.profilePhoto = null; state.success.profilePhoto = false; })
      .addCase(uploadEmployeeProfilePhoto.fulfilled, (state, action) => {
        state.loading.profilePhoto = false;
        state.success.profilePhoto = true;
        const { employeeId, data } = action.payload;
        const img = data.profile_image_url || data.profile_image;
        if (state.currentEmployee?.id == employeeId) { state.currentEmployee.profile_image = img; state.currentEmployee.profile_image_url = img; }
        const idx = state.employees.findIndex(e => e.id == employeeId);
        if (idx !== -1) { state.employees[idx].profile_image = img; state.employees[idx].profile_image_url = img; }
      })
      .addCase(uploadEmployeeProfilePhoto.rejected, (state, action) => { state.loading.profilePhoto = false; state.error.profilePhoto = action.payload?.message || 'Failed to upload profile photo'; });

    builder
      .addCase(deleteEmployeeProfilePhoto.pending, (state) => { state.loading.profilePhoto = true; state.error.profilePhoto = null; state.success.profilePhoto = false; })
      .addCase(deleteEmployeeProfilePhoto.fulfilled, (state, action) => {
        state.loading.profilePhoto = false;
        state.success.profilePhoto = true;
        const { employeeId } = action.payload;
        if (state.currentEmployee?.id == employeeId) { state.currentEmployee.profile_image = null; state.currentEmployee.profile_image_url = null; }
        const idx = state.employees.findIndex(e => e.id == employeeId);
        if (idx !== -1) { state.employees[idx].profile_image = null; state.employees[idx].profile_image_url = null; }
      })
      .addCase(deleteEmployeeProfilePhoto.rejected, (state, action) => { state.loading.profilePhoto = false; state.error.profilePhoto = action.payload?.message || 'Failed to delete profile photo'; });

    // Grading
    builder
      .addCase(fetchEmployeeGrading.pending, (state) => { state.loading.grading = true; state.error.grading = null; })
      .addCase(fetchEmployeeGrading.fulfilled, (state, action) => {
        state.loading.grading = false;
        state.gradingData = action.payload;
        const employees = action.payload.employees || [];
        const graded = employees.filter(e => e.grading_level && e.grading_level !== '').length;
        state.gradingStatistics = { ...state.gradingStatistics, totalEmployees: employees.length, gradedEmployees: graded, ungradedEmployees: employees.length - graded };
      })
      .addCase(fetchEmployeeGrading.rejected, (state, action) => { state.loading.grading = false; state.error.grading = action.payload; });

    // Export & template
    builder
      .addCase(exportEmployees.pending, (state) => { state.loading.exporting = true; state.error.export = null; })
      .addCase(exportEmployees.fulfilled, (state) => { state.loading.exporting = false; })
      .addCase(exportEmployees.rejected, (state, action) => { state.loading.exporting = false; state.error.export = action.payload; });

    builder
      .addCase(downloadEmployeeTemplate.pending, (state) => { state.loading.template = true; state.error.template = null; })
      .addCase(downloadEmployeeTemplate.fulfilled, (state) => { state.loading.template = false; })
      .addCase(downloadEmployeeTemplate.rejected, (state, action) => { state.loading.template = false; state.error.template = action.payload; });

    builder
      .addCase(bulkUploadEmployees.pending, (state) => { state.loading.upload = true; state.error.upload = null; })
      .addCase(bulkUploadEmployees.fulfilled, (state, action) => {
        state.loading.upload = false;
        const result = action.payload;
        if (result.created_employees?.length > 0) {
          state.employees.unshift(...result.created_employees);
          state.statistics.total_employees += result.successful || 0;
        }
      })
      .addCase(bulkUploadEmployees.rejected, (state, action) => { state.loading.upload = false; state.error.upload = action.payload; });

    // Activities & direct reports
    builder
      .addCase(fetchEmployeeActivities.pending, (state) => { state.loading.activities = true; state.error.activities = null; })
      .addCase(fetchEmployeeActivities.fulfilled, (state, action) => {
        state.loading.activities = false;
        const { employeeId, activities } = action.payload;
        state.activities[employeeId] = activities;
      })
      .addCase(fetchEmployeeActivities.rejected, (state, action) => { state.loading.activities = false; state.error.activities = action.payload; });

    builder
      .addCase(fetchEmployeeDirectReports.pending, (state) => { state.loading.directReports = true; state.error.directReports = null; })
      .addCase(fetchEmployeeDirectReports.fulfilled, (state, action) => {
        state.loading.directReports = false;
        const { employeeId, directReports } = action.payload;
        state.directReports[employeeId] = directReports;
      })
      .addCase(fetchEmployeeDirectReports.rejected, (state, action) => { state.loading.directReports = false; state.error.directReports = action.payload; });

    // Advanced search
    builder
      .addCase(searchEmployeesAdvanced.pending, (state) => { state.loading.advancedSearch = true; state.error.advancedSearch = null; })
      .addCase(searchEmployeesAdvanced.fulfilled, (state, action) => {
        state.loading.advancedSearch = false;
        state.employees = action.payload.data.map(normalizeEmployee);
        state.searchResults = action.payload.data.map(normalizeEmployee);
        state.searchPagination = action.payload.pagination;
        state.lastSearchParams = action.payload.searchParams;
        state.pagination = { ...state.pagination, ...action.payload.pagination, hasNext: !!action.payload.pagination.next, hasPrevious: !!action.payload.pagination.previous };
      })
      .addCase(searchEmployeesAdvanced.rejected, (state, action) => { state.loading.advancedSearch = false; state.error.advancedSearch = action.payload; });
  },
});

export const {
  setSelectedEmployees, toggleEmployeeSelection, selectAllEmployees, selectAllVisible, clearSelection,
  setCurrentFilters, addFilter, removeFilter, clearFilters, updateFilter,
  setAdvancedFilters, updateAdvancedFilter, clearAdvancedFilters, setFilterMode,
  setSorting, addSort, removeSort, clearSorting, toggleSort, reorderSorts, setSortingMode,
  setCurrentPage, setPageSize, goToNextPage, goToPreviousPage,
  toggleAdvancedFilters, setShowAdvancedFilters, setViewMode,
  setShowGradingPanel, toggleGradingPanel, setGradingMode,
  clearErrors, clearError, setError, clearCurrentEmployee,
  setQuickFilter, setLastSearchParams, clearSearchResults,
  optimisticUpdateEmployee,
  optimisticToggleOrgChartVisibility, optimisticBulkToggleOrgChartVisibility,
  clearProfilePhotoError, clearProfilePhotoSuccess, setProfilePhotoLoading,
} = employeeSlice.actions;

export default employeeSlice.reducer;
