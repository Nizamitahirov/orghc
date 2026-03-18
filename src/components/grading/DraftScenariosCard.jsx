import React, { useState } from "react";
import {
  Calculator, GitCompare, Eye, CheckCircle, Archive,
  Plus, Calendar, User, RefreshCw, Search, Filter,
} from "lucide-react";
import CustomCheckbox from "@/components/common/CustomCheckbox";

const fmt    = (v) => (v || 0).toLocaleString();
const fmtPct = (v, d = 1) => `${((v || 0) * 100).toFixed(d)}%`;

const currencyBadgeCls = (code) => {
  const m = {
    AZN: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    USD: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    EUR: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    GBP: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    RUB: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    TRY: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  };
  return m[code] || "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
};

const DraftScenariosCard = ({
  draftScenarios, currentData, compareMode, selectedForComparison,
  loading, handleViewDetails, handleSaveAsCurrent, handleArchiveDraft,
  toggleCompareMode, toggleScenarioForComparison, handleStartComparison,
}) => {
  const [search,       setSearch]       = useState("");
  const [sortBy,       setSortBy]       = useState("created_at");
  const [currentPage,  setCurrentPage]  = useState(1);
  const PER_PAGE = 6;

  const filtered = draftScenarios
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name")       return a.name.localeCompare(b.name);
      if (sortBy === "base_value") return (b.data?.baseValue1 || 0) - (a.data?.baseValue1 || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const start      = (currentPage - 1) * PER_PAGE;
  const paginated  = filtered.slice(start, start + PER_PAGE);

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-almet-bali-hai dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search scenarios…"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 py-2 text-xs border border-almet-mystic dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white placeholder-almet-bali-hai dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 focus:border-almet-sapphire"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-almet-bali-hai dark:text-gray-500" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs px-3 py-2 border border-almet-mystic dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30"
          >
            <option value="created_at">Date</option>
            <option value="name">Name</option>
            <option value="base_value">Base Value</option>
          </select>
        </div>

        {/* Compare toggle */}
        <button
          onClick={toggleCompareMode}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            compareMode
              ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
              : "bg-almet-sapphire text-white hover:bg-almet-astral"
          }`}
        >
          <GitCompare size={13} />
          {compareMode ? "Cancel" : "Compare"}
        </button>

        {compareMode && selectedForComparison.length >= 1 && (
          <button
            onClick={handleStartComparison}
            disabled={loading.comparing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading.comparing
              ? <><RefreshCw size={12} className="animate-spin" />Loading…</>
              : <><Eye size={12} />Compare ({selectedForComparison.length})</>
            }
          </button>
        )}
      </div>

      {/* Compare mode hint */}
      {compareMode && (
        <div className="flex items-center gap-2 px-4 py-3 bg-almet-sapphire/5 dark:bg-almet-sapphire/10 border border-almet-sapphire/20 rounded-xl">
          <GitCompare size={14} className="text-almet-sapphire flex-shrink-0" />
          <p className="text-xs text-almet-cloud-burst dark:text-gray-300">
            Select scenarios below to compare against the current structure.
          </p>
        </div>
      )}

      {/* Grid */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map(s => {
            const selected = selectedForComparison.includes(s.id);
            return (
              <div
                key={s.id}
                onClick={() => compareMode ? toggleScenarioForComparison(s.id) : handleViewDetails(s)}
                className={`rounded-xl border cursor-pointer transition-all ${
                  selected
                    ? "border-almet-sapphire bg-almet-sapphire/5 dark:bg-almet-sapphire/10 shadow-sm"
                    : "border-almet-mystic dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-almet-bali-hai dark:hover:border-gray-500 hover:shadow-sm"
                }`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between p-4 pb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white truncate mb-1.5">{s.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currencyBadgeCls(s.currency)}`}>
                        {s.currency || "AZN"}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-almet-waterloo dark:text-gray-400">
                        <Calendar size={9} />
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                      {s.createdBy && (
                        <span className="flex items-center gap-0.5 text-[10px] text-almet-waterloo dark:text-gray-400">
                          <User size={9} />{s.createdBy}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-2 flex-shrink-0">
                    {compareMode
                      ? <CustomCheckbox checked={selected} onChange={() => toggleScenarioForComparison(s.id)} />
                      : <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded font-semibold">Draft</span>
                    }
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 px-4 pb-3">
                  {[
                    { label: "Vertical",   value: fmtPct(s.data?.verticalAvg),            cls: "text-almet-sapphire" },
                    { label: "Horizontal", value: fmtPct(s.data?.horizontalAvg),           cls: "text-almet-astral"   },
                    { label: s.currency || "AZN", value: fmt(s.data?.baseValue1),          cls: "text-almet-cloud-burst dark:text-white" },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="text-center p-2 bg-almet-mystic/40 dark:bg-gray-700/40 rounded-lg">
                      <p className={`text-xs font-bold ${cls}`}>{value}</p>
                      <p className="text-[9px] text-almet-waterloo dark:text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                {!compareMode && (
                  <div className="flex gap-2 px-4 pb-4">
                    <button
                      onClick={e => { e.stopPropagation(); handleSaveAsCurrent(s.id); }}
                      disabled={loading.applying}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50"
                    >
                      {loading.applying ? <RefreshCw size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                      Apply
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleArchiveDraft(s.id); }}
                      disabled={loading.archiving}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-almet-mystic dark:bg-gray-700 text-almet-waterloo dark:text-gray-300 rounded-lg hover:bg-almet-bali-hai/20 transition-colors disabled:opacity-50"
                    >
                      {loading.archiving ? <RefreshCw size={11} className="animate-spin" /> : <Archive size={11} />}
                      Archive
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-14">
          <div className="w-12 h-12 bg-almet-mystic dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Calculator size={22} className="text-almet-bali-hai dark:text-gray-400" />
          </div>
          <p className="text-sm font-medium text-almet-cloud-burst dark:text-gray-300">
            {search ? "No scenarios match your search" : "No Draft Scenarios"}
          </p>
          <p className="text-xs text-almet-waterloo dark:text-gray-500 mt-1">
            {search ? "Try different keywords" : "Create your first scenario in the Create tab"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-almet-mystic dark:border-gray-700">
          <p className="text-[11px] text-almet-waterloo dark:text-gray-400">
            {start + 1}–{Math.min(start + PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs border border-almet-mystic dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-almet-mystic/40 dark:hover:bg-gray-700 text-almet-cloud-burst dark:text-white transition-colors"
            >← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                  currentPage === p
                    ? "bg-almet-sapphire text-white"
                    : "border border-almet-mystic dark:border-gray-600 text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/40 dark:hover:bg-gray-700"
                }`}
              >{p}</button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs border border-almet-mystic dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-almet-mystic/40 dark:hover:bg-gray-700 text-almet-cloud-burst dark:text-white transition-colors"
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftScenariosCard;