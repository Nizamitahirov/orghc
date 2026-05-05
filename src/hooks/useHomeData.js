'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { newsService } from '@/services/newsService';
import trainingService from '@/services/trainingService';
import handoverService from '@/services/handoverService';
import { VacationService } from '@/services/vacationService';

const POLL_INTERVAL = 60_000;

/**
 * Aggregates all data-fetching for the home dashboard.
 * Keeps home/page.js free of fetch logic and useState clutter.
 */
export function useHomeData() {
  // ── News ────────────────────────────────────────────────────────────────────
  const [latestNews, setLatestNews] = useState([]);

  // ── Trainings ───────────────────────────────────────────────────────────────
  const [myTrainings,      setMyTrainings]      = useState(null);
  const [loadingTrainings, setLoadingTrainings] = useState(true);

  // ── User / Vacation ─────────────────────────────────────────────────────────
  const [userDetails,     setUserDetails]     = useState(null);
  const [vacationData,    setVacationData]    = useState(null);
  const [loadingVacation, setLoadingVacation] = useState(true);
  const [userRole,        setUserRole]        = useState(null);

  // Avoid stale-closure in poll callback
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // ── Loaders ─────────────────────────────────────────────────────────────────
  const loadLatestNews = useCallback(async () => {
    try {
      const res = await newsService.getNews({
        page: 1, page_size: 5,
        is_published: true,
        ordering: '-is_pinned,-published_at',
      });
      if (mountedRef.current) setLatestNews(res.results ?? []);
    } catch { /* silent — news is non-critical */ }
  }, []);

  const loadMyTrainings = useCallback(async () => {
    setLoadingTrainings(true);
    try {
      const res = await trainingService.assignments.getMyTrainings();
      if (mountedRef.current) setMyTrainings(res);
    } catch { /* silent */ }
    finally { if (mountedRef.current) setLoadingTrainings(false); }
  }, []);

  const loadUserDetails = useCallback(async () => {
    try {
      const data = await handoverService.getUser();
      if (mountedRef.current) setUserDetails(data);
    } catch { /* silent */ }
  }, []);

  const loadVacationData = useCallback(async () => {
    setLoadingVacation(true);
    try {
      const data = await VacationService.getDashboard();
      if (mountedRef.current) setVacationData(data);
    } catch { /* silent */ }
    finally { if (mountedRef.current) setLoadingVacation(false); }
  }, []);

  const fetchUserRole = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/job-descriptions/my_access_info/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (!res.ok) { if (mountedRef.current) setUserRole('employee'); return; }
      const data = await res.json();
      if (mountedRef.current)
        setUserRole(data.is_admin ? 'admin' : data.is_manager ? 'manager' : 'employee');
    } catch {
      if (mountedRef.current) setUserRole('employee');
    }
  }, []);

  // ── Bootstrap ───────────────────────────────────────────────────────────────
  useEffect(() => {
    // Wave 1 — critical (above-fold)
    Promise.all([loadUserDetails(), fetchUserRole(), loadVacationData()]);

    // Wave 2 — secondary
    const t = setTimeout(() => { loadLatestNews(); loadMyTrainings(); }, 150);

    // Poll vacation balance + news every minute
    const poll = setInterval(() => { loadVacationData(); loadLatestNews(); }, POLL_INTERVAL);

    return () => { clearTimeout(t); clearInterval(poll); };
  }, [loadUserDetails, fetchUserRole, loadVacationData, loadLatestNews, loadMyTrainings]);

  // ── Training helpers (derived, no extra state) ───────────────────────────────
  const getPendingTrainings = useCallback(
    () => myTrainings?.assignments?.filter(a => a.status !== 'COMPLETED') ?? [],
    [myTrainings],
  );

  const getTrainingStats = useCallback(
    () => ({
      completedCount: myTrainings?.summary?.completed ?? 0,
      totalCount:     myTrainings?.summary?.total     ?? 0,
    }),
    [myTrainings],
  );

  const hasPendingTrainings =
    !loadingTrainings && myTrainings != null && getPendingTrainings().length > 0;

  return {
    // News
    latestNews,
    // Trainings
    myTrainings,
    loadingTrainings,
    hasPendingTrainings,
    getPendingTrainings,
    getTrainingStats,
    reloadTrainings: loadMyTrainings,
    // User
    userDetails,
    userRole,
    // Vacation
    vacationData,
    loadingVacation,
  };
}
