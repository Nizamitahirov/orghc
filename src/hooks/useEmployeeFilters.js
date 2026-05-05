// Focused hook: employee filtering, sorting, pagination
// Use in pages that manage filter/sort/page state without needing full CRUD
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  setCurrentFilters,
  addFilter,
  removeFilter,
  clearFilters,
  updateFilter,
  setSorting,
  addSort,
  removeSort,
  clearSorting,
  toggleSort,
  reorderSorts,
  setCurrentPage,
  setPageSize,
  goToNextPage,
  goToPreviousPage,
  toggleAdvancedFilters,
  setShowAdvancedFilters,
  setViewMode,
  setQuickFilter,
} from '../store/slices/employeeSlice';
import {
  selectCurrentFilters,
  selectAppliedFilters,
  selectSorting,
  selectPagination,
  selectSortingForBackend,
  selectFilteredEmployeesCount,
  selectGetSortDirection,
  selectIsSorted,
  selectGetSortIndex,
  selectApiParams,
  selectViewMode,
  selectShowAdvancedFilters,
} from '../store/slices/employeeSlice';

export function useEmployeeFilters() {
  const dispatch = useDispatch();

  const currentFilters = useSelector(selectCurrentFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const sorting = useSelector(selectSorting);
  const pagination = useSelector(selectPagination);
  const sortingForBackend = useSelector(selectSortingForBackend);
  const filteredEmployeesCount = useSelector(selectFilteredEmployeesCount);
  const viewMode = useSelector(selectViewMode);
  const showAdvancedFilters = useSelector(selectShowAdvancedFilters);
  const apiParams = useSelector(selectApiParams);
  const getSortDirection = useSelector(selectGetSortDirection);
  const isSorted = useSelector(selectIsSorted);
  const getSortIndex = useSelector(selectGetSortIndex);

  const hasActiveFilters = Object.keys(currentFilters).length > 0 || appliedFilters.length > 0;

  return {
    // State
    currentFilters,
    appliedFilters,
    sorting,
    pagination,
    sortingForBackend,
    filteredEmployeesCount,
    viewMode,
    showAdvancedFilters,
    apiParams,
    getSortDirection,
    isSorted,
    getSortIndex,

    // Computed
    hasActiveFilters,
    activeFilterCount: Object.keys(currentFilters).length + appliedFilters.length,
    hasSorting: sorting.length > 0,
    sortingCount: sorting.length,
    hasNextPage: pagination.hasNext,
    hasPreviousPage: pagination.hasPrevious,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,

    // Filter actions
    setCurrentFilters: useCallback((filters) => dispatch(setCurrentFilters(filters)), [dispatch]),
    addFilter: useCallback((filter) => dispatch(addFilter(filter)), [dispatch]),
    removeFilter: useCallback((key) => dispatch(removeFilter(key)), [dispatch]),
    clearFilters: useCallback(() => dispatch(clearFilters()), [dispatch]),
    updateFilter: useCallback((key, value) => dispatch(updateFilter({ key, value })), [dispatch]),
    setQuickFilter: useCallback((type, value) => dispatch(setQuickFilter({ type, value })), [dispatch]),

    // Sort actions
    setSorting: useCallback((params) => dispatch(setSorting(params)), [dispatch]),
    addSort: useCallback((field, direction) => dispatch(addSort({ field, direction })), [dispatch]),
    removeSort: useCallback((field) => dispatch(removeSort(field)), [dispatch]),
    clearSorting: useCallback(() => dispatch(clearSorting()), [dispatch]),
    toggleSort: useCallback((field) => dispatch(toggleSort(field)), [dispatch]),
    reorderSorts: useCallback((oldIndex, newIndex) => dispatch(reorderSorts({ oldIndex, newIndex })), [dispatch]),

    // Pagination actions
    setCurrentPage: useCallback((page) => dispatch(setCurrentPage(page)), [dispatch]),
    setPageSize: useCallback((size) => dispatch(setPageSize(size)), [dispatch]),
    goToNextPage: useCallback(() => dispatch(goToNextPage()), [dispatch]),
    goToPreviousPage: useCallback(() => dispatch(goToPreviousPage()), [dispatch]),

    // UI actions
    toggleAdvancedFilters: useCallback(() => dispatch(toggleAdvancedFilters()), [dispatch]),
    setShowAdvancedFilters: useCallback((show) => dispatch(setShowAdvancedFilters(show)), [dispatch]),
    setViewMode: useCallback((mode) => dispatch(setViewMode(mode)), [dispatch]),
  };
}
