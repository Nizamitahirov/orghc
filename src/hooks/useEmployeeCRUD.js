// Focused hook: core employee CRUD operations + statistics
// Use this instead of full useEmployees when you only need basic operations
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  fetchStatistics,
  fetchEmployeeActivities,
  fetchEmployeeDirectReports,
  uploadEmployeeProfilePhoto,
  deleteEmployeeProfilePhoto,
  clearProfilePhotoError,
  clearProfilePhotoSuccess,
  clearCurrentEmployee,
  optimisticUpdateEmployee,
} from '../store/slices/employeeSlice';
import {
  selectEmployees,
  selectCurrentEmployee,
  selectEmployeeLoading,
  selectEmployeeError,
  selectStatistics,
  selectActivities,
  selectDirectReports,
  selectFormattedEmployees,
  selectPagination,
  selectApiParams,
  selectIsAnyLoading,
  selectProfilePhotoLoading,
  selectProfilePhotoError,
  selectProfilePhotoSuccess,
} from '../store/slices/employeeSlice';

export function useEmployeeCRUD() {
  const dispatch = useDispatch();

  const employees = useSelector(selectEmployees);
  const formattedEmployees = useSelector(selectFormattedEmployees);
  const currentEmployee = useSelector(selectCurrentEmployee);
  const loading = useSelector(selectEmployeeLoading);
  const error = useSelector(selectEmployeeError);
  const statistics = useSelector(selectStatistics);
  const pagination = useSelector(selectPagination);
  const apiParams = useSelector(selectApiParams);
  const activities = useSelector(selectActivities);
  const directReports = useSelector(selectDirectReports);
  const isAnyLoading = useSelector(selectIsAnyLoading);
  const profilePhotoLoading = useSelector(selectProfilePhotoLoading);
  const profilePhotoError = useSelector(selectProfilePhotoError);
  const profilePhotoSuccess = useSelector(selectProfilePhotoSuccess);

  return {
    // State
    employees,
    formattedEmployees,
    currentEmployee,
    loading,
    error,
    statistics,
    pagination,
    activities,
    directReports,
    isAnyLoading,
    profilePhotoLoading,
    profilePhotoError,
    profilePhotoSuccess,

    // Computed
    isLoading: loading.employees || loading.creating || loading.updating || loading.deleting,
    isCreating: loading.creating,
    isUpdating: loading.updating,
    isEmpty: employees.length === 0,
    totalItems: pagination.totalItems,
    hasNextPage: pagination.hasNext,
    hasPreviousPage: pagination.hasPrevious,

    // Actions
    fetchEmployees: useCallback((params) => dispatch(fetchEmployees(params)), [dispatch]),
    fetchEmployee: useCallback((id) => dispatch(fetchEmployee(id)), [dispatch]),
    createEmployee: useCallback((data) => dispatch(createEmployee(data)), [dispatch]),
    updateEmployee: useCallback((id, data) => dispatch(updateEmployee({ id, data })), [dispatch]),
    fetchStatistics: useCallback(() => dispatch(fetchStatistics()), [dispatch]),
    fetchEmployeeActivities: useCallback((id) => dispatch(fetchEmployeeActivities(id)), [dispatch]),
    fetchEmployeeDirectReports: useCallback((id) => dispatch(fetchEmployeeDirectReports(id)), [dispatch]),
    clearCurrentEmployee: useCallback(() => dispatch(clearCurrentEmployee()), [dispatch]),
    optimisticUpdateEmployee: useCallback((id, updates) => dispatch(optimisticUpdateEmployee({ id, updates })), [dispatch]),

    // Photo actions
    uploadProfilePhoto: useCallback((employeeId, file) => dispatch(uploadEmployeeProfilePhoto({ employeeId, file })), [dispatch]),
    deleteProfilePhoto: useCallback((employeeId) => dispatch(deleteEmployeeProfilePhoto(employeeId)), [dispatch]),
    clearProfilePhotoError: useCallback(() => dispatch(clearProfilePhotoError()), [dispatch]),
    clearProfilePhotoSuccess: useCallback(() => dispatch(clearProfilePhotoSuccess()), [dispatch]),
  };
}
