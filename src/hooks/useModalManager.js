'use client';
import { useState, useCallback } from 'react';

/**
 * Manages a fixed set of named modals + optional payload per modal.
 *
 * Usage:
 *   const modal = useModalManager(['createPosition', 'editPosition', 'viewAssessment']);
 *
 *   modal.open('createPosition')
 *   modal.open('viewAssessment', assessmentRecord)   // with payload
 *   modal.close('createPosition')
 *   modal.closeAll()
 *   modal.isOpen('createPosition')            // → boolean
 *   modal.payload('viewAssessment')           // → assessmentRecord | null
 */
export function useModalManager(modalNames) {
  const initial = Object.fromEntries(modalNames.map(n => [n, { open: false, payload: null }]));
  const [state, setState] = useState(initial);

  const open = useCallback((name, payload = null) => {
    setState(prev => ({ ...prev, [name]: { open: true, payload } }));
  }, []);

  const close = useCallback((name) => {
    setState(prev => ({ ...prev, [name]: { open: false, payload: null } }));
  }, []);

  const closeAll = useCallback(() => {
    setState(prev =>
      Object.fromEntries(Object.keys(prev).map(k => [k, { open: false, payload: null }]))
    );
  }, []);

  const toggle = useCallback((name, payload = null) => {
    setState(prev => ({
      ...prev,
      [name]: prev[name]?.open
        ? { open: false, payload: null }
        : { open: true, payload },
    }));
  }, []);

  return {
    open,
    close,
    closeAll,
    toggle,
    isOpen:  (name) => state[name]?.open  ?? false,
    payload: (name) => state[name]?.payload ?? null,
    /** Raw state — use only when you need to iterate */
    state,
  };
}

export default useModalManager;
