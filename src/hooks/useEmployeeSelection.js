// Focused hook: employee selection (bulk operations UI)
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  setSelectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  selectAllVisible,
  clearSelection,
} from '../store/slices/employeeSlice';
import {
  selectSelectedEmployees,
  selectSelectionInfo,
  selectEmployees,
} from '../store/slices/employeeSlice';

export function useEmployeeSelection() {
  const dispatch = useDispatch();

  const selectedEmployees = useSelector(selectSelectedEmployees);
  const selectionInfo = useSelector(selectSelectionInfo);
  const employees = useSelector(selectEmployees);

  return {
    // State
    selectedEmployees,
    selectionInfo,

    // Computed
    hasSelection: selectedEmployees.length > 0,
    selectionCount: selectedEmployees.length,
    isAllSelected: selectionInfo.isAllSelected,
    isPartialSelection: selectionInfo.isPartialSelection,
    isSelected: useCallback((id) => selectedEmployees.includes(id), [selectedEmployees]),

    // Actions
    setSelectedEmployees: useCallback((ids) => dispatch(setSelectedEmployees(ids)), [dispatch]),
    toggleEmployeeSelection: useCallback((id) => dispatch(toggleEmployeeSelection(id)), [dispatch]),
    selectAllEmployees: useCallback(() => dispatch(selectAllEmployees()), [dispatch]),
    selectAllVisible: useCallback(() => dispatch(selectAllVisible()), [dispatch]),
    clearSelection: useCallback(() => dispatch(clearSelection()), [dispatch]),
  };
}
