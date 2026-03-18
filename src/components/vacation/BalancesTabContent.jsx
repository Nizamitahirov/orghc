// components/vacation/BalancesTabContent.jsx

"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Download, Edit, X, Save, Search, BarChart3,
  Info, TrendingUp, CheckCircle, AlertCircle, Users
} from "lucide-react";
import { VacationService, VacationHelpers } from '@/services/vacationService';
import SearchableDropdown from "@/components/common/SearchableDropdown";
import PlanningStatisticsModal from './PlanningStatisticsModal';
import Pagination from '@/components/common/Pagination';

export default function BalancesTabContent({
  userPermissions,
  darkMode,
  showSuccess,
  showError,
  businessFunctions,
}) {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBalance, setEditingBalance] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    business_function_id: "",
  });

  const fetchBalances = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const response = await VacationService.getAllBalances(currentFilters);
      setBalances(response?.balances || []);
    } catch {
      showError?.("Failed to load vacation balances");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchBalances(filters); }, [filters, fetchBalances]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const blob = await VacationService.exportBalances(filters);
      VacationHelpers.downloadBlobFile(blob, `vacation_balances_${filters.year}.xlsx`);
      showSuccess?.("Export completed");
    } catch { showError?.("Export failed"); }
  };

  const handleEditBalance = b => {
    setEditingBalance(b.id);
    setEditValues({
      employee_id: b.employee,
      year: b.year,
      start_balance: b.start_balance,
      yearly_balance: b.yearly_balance,
      used_days: b.used_days,
      scheduled_days: b.scheduled_days,
    });
  };

  const handleSaveBalance = async () => {
    try {
      await VacationService.updateEmployeeBalance(editValues);
      showSuccess?.("Balance updated");
      setEditingBalance(null);
      setEditValues({});
      fetchBalances(filters);
    } catch { showError?.("Failed to update balance"); }
  };

  const filtered = balances.filter(b => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return true;
    return (b.employee_name || "").toLowerCase().includes(t) ||
           String(b.employee_id || "").toLowerCase().includes(t);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const canUpdate = userPermissions.is_admin;
  const canExport  = userPermissions.is_admin;

  // Summary stats
  const totalEmployees   = balances.length;
  const fullyUsed        = balances.filter(b => parseFloat(b.remaining_balance) === 0).length;
  const needsPlanning    = balances.filter(b => parseFloat(b.should_be_planned) > 0).length;
  const avgRemaining     = totalEmployees
    ? (balances.reduce((s, b) => s + parseFloat(b.remaining_balance || 0), 0) / totalEmployees).toFixed(1)
    : 0;

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-almet-cloud-burst dark:text-white">Vacation Balances</h2>
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
            Track how many vacation days each employee has remaining
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(userPermissions.is_admin || userPermissions.is_manager) && (
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Planning Overview
            </button>
          )}
          {canExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export to Excel
            </button>
          )}
        </div>
      </div>


      {/* ── Info Banner ── */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Remaining</strong> = Total balance minus used days. &nbsp;
          <strong>To Plan</strong> = Days that still need to be scheduled before year end. &nbsp;
          Balances update automatically as vacations are approved.
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search employee name or ID..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Company */}
          <SearchableDropdown
            options={businessFunctions.map(bf => ({ value: bf.id, label: bf.name }))}
            value={filters.business_function_id}
            onChange={v => updateFilter("business_function_id", v || "")}
            placeholder="All Companies"
            allowUncheck
            darkMode={darkMode}
          />

          {/* Year */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-almet-waterloo dark:text-almet-bali-hai whitespace-nowrap">Year:</label>
            <input
              type="number"
              value={filters.year}
              onChange={e => updateFilter("year", e.target.value)}
              className="flex-1 px-3 py-2.5 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-almet-sapphire border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {[
                      { label: 'Employee',   tip: null },
                      { label: 'Company',    tip: null },
                      { label: 'Total Days', tip: 'Total vacation entitlement for the year' },
                      { label: 'Used',       tip: 'Days already taken' },
                      { label: 'Scheduled',  tip: 'Days planned but not yet taken' },
                      { label: 'Remaining',  tip: 'Days still available' },
                      { label: 'To Plan',    tip: 'Days that should still be scheduled' },
                      ...(canUpdate ? [{ label: 'Edit', tip: null }] : []),
                    ].map(h => (
                      <th key={h.label} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                        <span title={h.tip || ''} className={h.tip ? 'border-b border-dashed border-almet-bali-hai/50 cursor-help' : ''}>
                          {h.label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                  {paginated.map(balance => {
                    const isEditing = editingBalance === balance.id;
                    const remaining = parseFloat(balance.remaining_balance);
                    const toPlan    = parseFloat(balance.should_be_planned);

                    return (
                      <tr key={balance.id} className="hover:bg-almet-mystic/10 dark:hover:bg-gray-700/30 transition-colors">
                        {/* Employee */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-almet-cloud-burst dark:text-white">{balance.employee_name}</p>
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{balance.employee_id}</p>
                        </td>

                        {/* Company */}
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {balance.business_function_name || '—'}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-sm font-bold text-almet-sapphire text-center">
                          {balance.total_balance}
                        </td>

                        {/* Used */}
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input type="number" step="0.5" value={editValues.used_days}
                              onChange={e => setEditValues(p => ({ ...p, used_days: e.target.value }))}
                              className="w-20 px-2 py-1 text-xs text-center border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded dark:bg-gray-700 dark:text-white"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-orange-500">{balance.used_days}</span>
                          )}
                        </td>

                        {/* Scheduled */}
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input type="number" step="0.5" value={editValues.scheduled_days}
                              onChange={e => setEditValues(p => ({ ...p, scheduled_days: e.target.value }))}
                              className="w-20 px-2 py-1 text-xs text-center border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded dark:bg-gray-700 dark:text-white"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-almet-steel-blue">{balance.scheduled_days}</span>
                          )}
                        </td>

                        {/* Remaining */}
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-bold ${remaining > 10 ? 'text-green-600 dark:text-green-400' : remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                            {balance.remaining_balance}
                          </span>
                        </td>

                        {/* To Plan */}
                        <td className="px-4 py-3 text-center">
                          {toPlan > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold">
                              <AlertCircle className="w-3 h-3" />{toPlan}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold">
                              <CheckCircle className="w-3 h-3" />Done
                            </span>
                          )}
                        </td>

                        {/* Edit */}
                        {canUpdate && (
                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={handleSaveBalance} title="Save"
                                  className="p-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => { setEditingBalance(null); setEditValues({}); }} title="Cancel"
                                  className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-600 text-almet-cloud-burst dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => handleEditBalance(balance)} title="Edit balance"
                                className="p-1.5 rounded-lg text-almet-sapphire hover:bg-almet-sapphire/10 dark:text-almet-astral transition-colors">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={canUpdate ? 8 : 7} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 bg-almet-mystic/30 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-almet-waterloo/40 dark:text-almet-bali-hai/40" />
                          </div>
                          <p className="text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">No balances found</p>
                          <p className="text-xs text-almet-waterloo/60 dark:text-almet-bali-hai/60">Try changing the company or year filter</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > itemsPerPage && (
              <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  darkMode={darkMode}
                />
              </div>
            )}
          </>
        )}
      </div>

      <PlanningStatisticsModal
        show={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        darkMode={darkMode}
        userAccess={userPermissions}
        showSuccess={showSuccess}
        showError={showError}
      />
    </div>
  );
}