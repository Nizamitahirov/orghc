'use client';
import { useState, useEffect, useCallback } from 'react';
import { assessmentApi } from '@/services/assessmentApi';

/**
 * Loads assessment user permissions on mount.
 * Shared by LeadershipAssessmentCalculation, BehavioralAssessmentCalculation,
 * and CoreEmployeeCalculation — replaces copy-pasted useEffect + isEmployeeOnlyAccess().
 *
 * Usage:
 *   const { permissions, isEmployeeOnly, isAdmin, isManager, loading } = useAssessmentPermissions();
 */
export function useAssessmentPermissions() {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const perms = await assessmentApi.employeeCore.getUserPermissions();
        if (!cancelled) setPermissions(perms);
      } catch {
        // Fail silently — components should handle null permissions gracefully
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const isAdmin     = Boolean(permissions?.is_admin);
  const isManager   = Boolean(permissions?.is_manager);
  const isEmployeeOnly = Boolean(permissions && !permissions.is_admin && !permissions.is_manager);

  const can = useCallback(
    (action) => {
      if (!permissions) return false;
      switch (action) {
        case 'create': return isAdmin || isManager;
        case 'edit':   return isAdmin || isManager;
        case 'delete': return isAdmin;
        case 'view':   return true;
        case 'approve':return isAdmin;
        default:       return false;
      }
    },
    [permissions, isAdmin, isManager],
  );

  return { permissions, loading, isAdmin, isManager, isEmployeeOnly, can };
}

export default useAssessmentPermissions;
