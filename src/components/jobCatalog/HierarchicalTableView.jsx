// src/components/jobCatalog/HierarchicalTableView.jsx
// EMPLOYEE-BASED: Reference data kombinasiyası yox, real employee position-ları

import React, { useMemo, useState } from 'react';
import {
  Building2, Target, Briefcase, Award, Search, X, Download,
  Settings, Eye, EyeOff, Building
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { getHierarchyColor } from './HierarchyColors';
import SearchableDropdown from '@/components/common/SearchableDropdown';

export default function StructureTableView({ context }) {
  const { employees, businessFunctions } = context;
  const { darkMode } = useTheme();

  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jobCatalog_visibleColumns');
      return saved ? JSON.parse(saved) : {
        company: true, department: true, unit: true,
        jobFunction: true, hierarchy: true, title: true
      };
    }
    return { company: true, department: true, unit: true, jobFunction: true, hierarchy: true, title: true };
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobCatalog_visibleColumns', JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  const toggleColumn = (col) => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));

  // ✅ ƏSAS FIX: Reference data kombinasiyası yox, real employee-lərdən unique position-lar
  const structureData = useMemo(() => {
    if (!employees || !Array.isArray(employees) || employees.length === 0) return [];

    const uniqueSet = new Set();
    const structure = [];

    employees.forEach(emp => {
      const company   = emp.business_function_name || '—';
      const dept      = emp.department_name        || '—';
      const unit      = emp.unit_name              || '—';
      const jobFunc   = emp.job_function_name      || '—';
      const hierarchy = emp.position_group_name    || '—';
      const title     = emp.job_title              || '—';
      const hierLevel = emp.position_group_level   || 0;

      // Company filter
      if (selectedCompany) {
        const match = businessFunctions.find(bf =>
          (bf.value === selectedCompany || bf.id === selectedCompany) &&
          (bf.label === company || bf.name === company)
        );
        if (!match) return;
      }

      // Search filter
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matches =
          company.toLowerCase().includes(s)   ||
          dept.toLowerCase().includes(s)      ||
          unit.toLowerCase().includes(s)      ||
          jobFunc.toLowerCase().includes(s)   ||
          hierarchy.toLowerCase().includes(s) ||
          title.toLowerCase().includes(s);
        if (!matches) return;
      }

      // Unique key — yalnız görünən column-lara görə
      const keyParts = [];
      if (visibleColumns.company)     keyParts.push(company);
      if (visibleColumns.department)  keyParts.push(dept);
      if (visibleColumns.unit)        keyParts.push(unit);
      if (visibleColumns.jobFunction) keyParts.push(jobFunc);
      if (visibleColumns.hierarchy)   keyParts.push(hierarchy);
      if (visibleColumns.title)       keyParts.push(title);

      const key = keyParts.join('|||');
      if (uniqueSet.has(key)) return;
      uniqueSet.add(key);

      structure.push({ company, department: dept, unit, jobFunction: jobFunc, hierarchy, hierarchyLevel: hierLevel, title });
    });

    // Sort
    structure.sort((a, b) => {
      if (a.company     !== b.company)     return a.company.localeCompare(b.company);
      if (a.department  !== b.department)  return a.department.localeCompare(b.department);
      if (a.unit        !== b.unit)        return a.unit.localeCompare(b.unit);
      if (a.jobFunction !== b.jobFunction) return a.jobFunction.localeCompare(b.jobFunction);
      if (a.hierarchyLevel !== b.hierarchyLevel) return a.hierarchyLevel - b.hierarchyLevel;
      if (a.title !== b.title) return a.title.localeCompare(b.title);
      return 0;
    });

    return structure;
  }, [employees, selectedCompany, searchTerm, visibleColumns, businessFunctions]);

  // Row spans
  const rowSpans = useMemo(() => {
    const spans = { company: {}, department: {}, unit: {}, jobFunction: {}, hierarchy: {} };

    structureData.forEach((row, i) => {
      const ck = row.company;
      const dk = `${row.company}|${row.department}`;
      const uk = `${row.company}|${row.department}|${row.unit}`;
      const fk = `${row.company}|${row.department}|${row.unit}|${row.jobFunction}`;
      const hk = `${row.company}|${row.department}|${row.unit}|${row.jobFunction}|${row.hierarchy}`;

      if (!spans.company[ck])     spans.company[ck]     = { startIndex: i, count: 0 };
      if (!spans.department[dk])  spans.department[dk]  = { startIndex: i, count: 0 };
      if (!spans.unit[uk])        spans.unit[uk]        = { startIndex: i, count: 0 };
      if (!spans.jobFunction[fk]) spans.jobFunction[fk] = { startIndex: i, count: 0 };
      if (!spans.hierarchy[hk])   spans.hierarchy[hk]   = { startIndex: i, count: 0 };

      spans.company[ck].count++;
      spans.department[dk].count++;
      spans.unit[uk].count++;
      spans.jobFunction[fk].count++;
      spans.hierarchy[hk].count++;
    });

    return spans;
  }, [structureData]);

  const clearFilters = () => { setSearchTerm(''); setSelectedCompany(''); };

  const exportToCSV = () => {
    const headers = [];
    if (visibleColumns.company)     headers.push('Company');
    if (visibleColumns.department)  headers.push('Department');
    if (visibleColumns.unit)        headers.push('Unit');
    if (visibleColumns.jobFunction) headers.push('Job Function');
    if (visibleColumns.hierarchy)   headers.push('Hierarchy');
    if (visibleColumns.title)       headers.push('Title');

    const rows = structureData.map(row => {
      const r = [];
      if (visibleColumns.company)     r.push(row.company);
      if (visibleColumns.department)  r.push(row.department);
      if (visibleColumns.unit)        r.push(row.unit);
      if (visibleColumns.jobFunction) r.push(row.jobFunction);
      if (visibleColumns.hierarchy)   r.push(row.hierarchy);
      if (visibleColumns.title)       r.push(row.title || '');
      return r;
    });

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'job_catalog_structure.csv';
    link.click();
  };

  const columnDefs = [
    { id: 'company',     label: 'Company',      icon: Building },
    { id: 'department',  label: 'Department',   icon: Target },
    { id: 'unit',        label: 'Unit',         icon: Building2 },
    { id: 'jobFunction', label: 'Job Function', icon: Briefcase },
    { id: 'hierarchy',   label: 'Hierarchy',    icon: Award },
    { id: 'title',       label: 'Title',        icon: Award },
  ];

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-sm border border-gray-200 dark:border-almet-comet">

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Organizational Structure Matrix
              </h2>
              <p className="text-xs text-gray-600 dark:text-almet-bali-hai">
                {structureData.length} unique positions • {visibleCount} columns visible
              </p>
            </div>
            <div className="flex gap-2">
              {/* Column Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    showColumnSettings
                      ? 'bg-almet-sapphire text-white'
                      : 'bg-gray-100 dark:bg-almet-san-juan text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-almet-comet'
                  }`}
                >
                  <Settings size={12} /> Columns
                </button>
                {showColumnSettings && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowColumnSettings(false)} />
                    <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg border border-gray-200 dark:border-almet-comet z-20 p-3">
                      <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Toggle Columns</div>
                      <div className="space-y-2">
                        {columnDefs.map(col => {
                          const Icon = col.icon;
                          return (
                            <label key={col.id} className="flex items-center cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={visibleColumns[col.id]}
                                onChange={() => toggleColumn(col.id)}
                                className="mr-2 w-3.5 h-3.5 text-almet-sapphire bg-gray-100 border-gray-300 rounded focus:ring-almet-sapphire"
                              />
                              <Icon size={12} className="mr-1.5 text-gray-400 group-hover:text-almet-sapphire" />
                              <span className="text-xs text-gray-700 dark:text-almet-bali-hai group-hover:text-gray-900 dark:group-hover:text-white">
                                {col.label}
                              </span>
                              {visibleColumns[col.id]
                                ? <Eye size={10} className="ml-auto text-green-500" />
                                : <EyeOff size={10} className="ml-auto text-gray-400" />}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={exportToCSV}
                disabled={structureData.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={12} /> Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search across all columns..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 dark:border-almet-comet rounded-lg
                  bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-0"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="w-full sm:w-64">
              <SearchableDropdown
                options={businessFunctions}
                value={selectedCompany}
                onChange={setSelectedCompany}
                placeholder="Filter by Company"
                searchPlaceholder="Search companies..."
                allowUncheck={true}
                darkMode={darkMode}
              />
            </div>
            {(searchTerm || selectedCompany) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-xs border border-gray-300 dark:border-almet-comet text-gray-700 dark:text-almet-bali-hai rounded-lg hover:bg-gray-50 dark:hover:bg-almet-comet transition-colors whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-almet-sapphire text-white sticky top-0 z-10">
            <tr>
              {visibleColumns.company     && <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20 min-w-[160px]"><div className="flex items-center gap-2"><Building size={14}/>Company</div></th>}
              {visibleColumns.department  && <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20 min-w-[180px]"><div className="flex items-center gap-2"><Target size={14}/>Department</div></th>}
              {visibleColumns.unit        && <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20 min-w-[160px]"><div className="flex items-center gap-2"><Building2 size={14}/>Unit</div></th>}
              {visibleColumns.jobFunction && <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20 min-w-[180px]"><div className="flex items-center gap-2"><Briefcase size={14}/>Job Function</div></th>}
              {visibleColumns.hierarchy   && <th className="px-4 py-3 text-center text-xs font-semibold uppercase border-r border-white/20 min-w-[150px]"><div className="flex items-center justify-center gap-2"><Award size={14}/>Hierarchy</div></th>}
              {visibleColumns.title       && <th className="px-4 py-3 text-left text-xs font-semibold uppercase min-w-[220px]">Title</th>}
            </tr>
          </thead>
          <tbody>
            {structureData.length === 0 ? (
              <tr>
                <td colSpan={visibleCount} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-almet-bali-hai">
                  {!employees || employees.length === 0
                    ? 'No employee data available'
                    : searchTerm || selectedCompany ? 'No results found' : 'No data'}
                </td>
              </tr>
            ) : (
              structureData.map((row, i) => {
                const ck = row.company;
                const dk = `${row.company}|${row.department}`;
                const uk = `${row.company}|${row.department}|${row.unit}`;
                const fk = `${row.company}|${row.department}|${row.unit}|${row.jobFunction}`;
                const hk = `${row.company}|${row.department}|${row.unit}|${row.jobFunction}|${row.hierarchy}`;

                const showCompany  = visibleColumns.company     && rowSpans.company[ck]?.startIndex     === i;
                const showDept     = visibleColumns.department  && rowSpans.department[dk]?.startIndex  === i;
                const showUnit     = visibleColumns.unit        && rowSpans.unit[uk]?.startIndex        === i;
                const showFunc     = visibleColumns.jobFunction && rowSpans.jobFunction[fk]?.startIndex === i;
                const showHier     = visibleColumns.hierarchy   && rowSpans.hierarchy[hk]?.startIndex   === i;

                const colors = getHierarchyColor(row.hierarchy, darkMode);

                return (
                  <tr key={i} className="border-b border-gray-200 dark:border-almet-comet hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                    {showCompany && (
                      <td rowSpan={rowSpans.company[ck].count} className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet bg-blue-50 dark:bg-blue-900/20 align-top">
                        <div className="flex items-center gap-2"><Building size={14} className="text-blue-600 dark:text-blue-400"/>{row.company}</div>
                      </td>
                    )}
                    {showDept && (
                      <td rowSpan={rowSpans.department[dk].count} className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet bg-gray-50 dark:bg-almet-san-juan align-top">
                        {row.department}
                      </td>
                    )}
                    {showUnit && (
                      <td rowSpan={rowSpans.unit[uk].count} className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet align-top">
                        {row.unit}
                      </td>
                    )}
                    {showFunc && (
                      <td rowSpan={rowSpans.jobFunction[fk].count} className="px-4 py-3 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet align-top">
                        {row.jobFunction}
                      </td>
                    )}
                    {showHier && (
                      <td rowSpan={rowSpans.hierarchy[hk].count} className="px-4 py-3 text-center border-r border-gray-200 dark:border-almet-comet align-top">
                        <span className="inline-block px-3 py-1.5 rounded text-xs font-semibold"
                          style={{ backgroundColor: colors.backgroundColor, color: colors.textColor, border: `1px solid ${colors.borderColor}` }}>
                          {row.hierarchy}
                        </span>
                      </td>
                    )}
                    {visibleColumns.title && (
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {row.title || '—'}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 dark:bg-almet-san-juan border-t border-gray-200 dark:border-almet-comet">
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-almet-bali-hai">
              <strong className="text-gray-900 dark:text-white">{structureData.length}</strong> Unique Positions
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-almet-bali-hai">
              <strong className="text-gray-900 dark:text-white">{employees?.length || 0}</strong> Employees
            </span>
          </div>
          <span className="text-gray-500 dark:text-almet-bali-hai italic">
            Based on actual employee data
          </span>
        </div>
      </div>
    </div>
  );
}