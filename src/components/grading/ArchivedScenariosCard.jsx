import React, { useState } from "react";
import { Archive, Search, Filter, Calendar, Eye } from "lucide-react";

const fmt    = (v)       => (v || 0).toLocaleString();
const fmtPct = (v, d=1)  => `${((v || 0) * 100).toFixed(d)}%`;

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

const ArchivedScenariosCard = ({ archivedScenarios, handleViewDetails }) => {
  const [search,      setSearch]      = useState("");
  const [sortBy,      setSortBy]      = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = archivedScenarios
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
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-almet-bali-hai dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search archived scenarios…"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 py-2 text-xs border border-almet-mystic dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white placeholder-almet-bali-hai dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 focus:border-almet-sapphire"
          />
        </div>
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
        <p className="text-[11px] text-almet-waterloo dark:text-gray-400 sm:ml-auto">
          {archivedScenarios.length} archived
        </p>
      </div>

      {/* Grid */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {paginated.map(s => (
            <div
              key={s.id}
              onClick={() => handleViewDetails(s)}
              className="group rounded-xl border border-almet-mystic dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:border-almet-bali-hai dark:hover:border-gray-500 hover:shadow-sm transition-all opacity-70 hover:opacity-100 p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white truncate mb-1.5 group-hover:text-almet-sapphire transition-colors">
                    {s.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currencyBadgeCls(s.currency)}`}>
                      {s.currency || "AZN"}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-almet-waterloo dark:text-gray-400">
                      <Calendar size={9} />
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-2 flex-shrink-0">
                  <span className="text-[9px] px-1.5 py-0.5 bg-almet-bali-hai/20 dark:bg-gray-600 text-almet-waterloo dark:text-gray-300 rounded font-semibold">
                    Archived
                  </span>
                  <Eye size={12} className="text-almet-sapphire opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {[
                  { label: "V",                    value: fmtPct(s.data?.verticalAvg),   cls: "text-almet-sapphire" },
                  { label: "H",                    value: fmtPct(s.data?.horizontalAvg), cls: "text-almet-astral"   },
                  { label: s.currency || "AZN",    value: fmt(s.data?.baseValue1),       cls: "text-almet-cloud-burst dark:text-white" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="text-center p-2 bg-almet-mystic/30 dark:bg-gray-700/40 rounded-lg">
                    <p className={`text-[11px] font-bold ${cls}`}>{value}</p>
                    <p className="text-[9px] text-almet-waterloo dark:text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {s.description && (
                <p className="text-[10px] text-almet-waterloo dark:text-gray-400 line-clamp-2">{s.description}</p>
              )}
              {s.createdBy && (
                <p className="text-[10px] text-almet-bali-hai dark:text-gray-500 mt-2 pt-2 border-t border-almet-mystic/50 dark:border-gray-700">
                  {s.createdBy}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14">
          <div className="w-12 h-12 bg-almet-mystic dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Archive size={22} className="text-almet-bali-hai dark:text-gray-400" />
          </div>
          <p className="text-sm font-medium text-almet-cloud-burst dark:text-gray-300">
            {search ? "No results found" : "No Archived Scenarios"}
          </p>
          <p className="text-xs text-almet-waterloo dark:text-gray-500 mt-1">
            {search ? "Try different keywords" : "Archived scenarios will appear here"}
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

export default ArchivedScenariosCard;