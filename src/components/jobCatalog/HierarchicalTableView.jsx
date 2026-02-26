// src/components/jobCatalog/StructureTableView.jsx
// ✅ DYNAMIC UNIQUE KEY: Görünən column-lara görə unique data

import React, { useMemo, useState } from 'react';
import { 
  Building2, Target, Briefcase, Award, Search, X, Download, 
  Settings, Eye, EyeOff, Building
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { getHierarchyColor } from './HierarchyColors';
import SearchableDropdown from '@/components/common/SearchableDropdown';

export default function StructureTableView({ context }) {
  const { 
    businessFunctions, 
    departments, 
    units, 
    jobFunctions, 
    jobTitles,
    positionGroups 
  } = context;
  
  const { darkMode } = useTheme();
  
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [visibleColumns, setVisibleColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jobCatalog_visibleColumns');
      return saved ? JSON.parse(saved) : {
        company: true,
        department: true,
        unit: true,
        jobFunction: true,
        hierarchy: true,
        title: true
      };
    }
    return {
      company: true,
      department: true,
      unit: true,
      jobFunction: true,
      hierarchy: true,
      title: true
    };
  });
  
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobCatalog_visibleColumns', JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  const toggleColumn = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const mappings = useMemo(() => {
    const bfMap = new Map();
    (businessFunctions || []).forEach(bf => {
      const id = bf.value || bf.id;
      const name = bf.label || bf.name;
      bfMap.set(id, { id, name, ...bf });
      bfMap.set(name, { id, name, ...bf });
    });

    const deptMap = new Map();
    (departments || []).forEach(dept => {
      const deptId = dept.value || dept.id;
      const deptName = dept.label || dept.name;
      
      let businessFunctionId = dept.business_function || dept.business_function_id;
      
      if (!businessFunctionId && dept.business_function_name) {
        const bf = bfMap.get(dept.business_function_name);
        if (bf) {
          businessFunctionId = bf.id;
        }
      }
      
      deptMap.set(deptId, { 
        id: deptId, 
        name: deptName, 
        businessFunctionId,
        ...dept 
      });
    });

    const unitMap = new Map();
    (units || []).forEach(unit => {
      const unitId = unit.value || unit.id;
      const unitName = unit.label || unit.name;
      
      let departmentId = unit.department || unit.department_id;
      
      if (!departmentId && unit.department_name) {
        const dept = Array.from(deptMap.values()).find(d => d.name === unit.department_name);
        if (dept) {
          departmentId = dept.id;
        }
      }
      
      unitMap.set(unitId, { 
        id: unitId, 
        name: unitName, 
        departmentId,
        ...unit 
      });
    });

    return { bfMap, deptMap, unitMap };
  }, [businessFunctions, departments, units]);

  // ✅ BUILD STRUCTURE with DYNAMIC UNIQUE KEY
  const structureData = useMemo(() => {
    const structure = [];
    const uniqueSet = new Set();

    let activeCompanies = (businessFunctions || []).filter(bf => bf.is_active !== false);
    if (selectedCompany) {
      const selected = activeCompanies.find(bf => 
        bf.value === selectedCompany || bf.id === selectedCompany
      );
      if (selected) {
        activeCompanies = [selected];
      }
    }

    const activeDepartments = Array.from(mappings.deptMap.values()).filter(d => d.is_active !== false);
    const activeUnits = Array.from(mappings.unitMap.values()).filter(u => u.is_active !== false);
    const activeJobFunctions = (jobFunctions || []).filter(jf => jf.is_active !== false);
    const activePositionGroups = (positionGroups || []).filter(pg => pg.is_active !== false);
    const activeJobTitles = (jobTitles || []).filter(jt => jt.is_active !== false);

    const addStructureEntry = (company, dept, unit, jobFunc, pg, title = null) => {
      const companyName = company.label || company.name;
      const deptName = dept || '-';
      const unitName = unit || '-';
      const jobFuncName = jobFunc.label || jobFunc.name;
      const hierarchyName = pg.label || pg.name;
      const titleName = title ? (title.label || title.name) : null;

      // ✅ DYNAMIC UNIQUE KEY - sadəcə görünən column-lar
      const keyParts = [];
      if (visibleColumns.company) keyParts.push(companyName);
      if (visibleColumns.department) keyParts.push(deptName);
      if (visibleColumns.unit) keyParts.push(unitName);
      if (visibleColumns.jobFunction) keyParts.push(jobFuncName);
      if (visibleColumns.hierarchy) keyParts.push(hierarchyName);
      if (visibleColumns.title) keyParts.push(titleName || 'NULL');
      
      const uniqueKey = keyParts.join('|');

      // Skip if already exists
      if (uniqueSet.has(uniqueKey)) {
        return;
      }
      uniqueSet.add(uniqueKey);

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          companyName.toLowerCase().includes(search) ||
          (deptName !== '-' && deptName.toLowerCase().includes(search)) ||
          (unitName !== '-' && unitName.toLowerCase().includes(search)) ||
          jobFuncName.toLowerCase().includes(search) ||
          hierarchyName.toLowerCase().includes(search) ||
          (titleName && titleName.toLowerCase().includes(search));
        
        if (!matchesSearch) return;
      }

      structure.push({
        company: companyName,
        department: deptName,
        unit: unitName,
        jobFunction: jobFuncName,
        hierarchy: hierarchyName,
        hierarchyLevel: pg.hierarchy_level || 0,
        title: titleName
      });
    };

    activeCompanies.forEach(company => {
      const companyId = company.value || company.id;
      
      const companyDepartments = activeDepartments.filter(dept => {
        return dept.businessFunctionId === companyId;
      });

      if (companyDepartments.length === 0) {
        activeJobFunctions.forEach(jobFunc => {
          activePositionGroups.forEach(pg => {
            if (visibleColumns.title) {
              activeJobTitles.forEach(title => {
                addStructureEntry(company, null, null, jobFunc, pg, title);
              });
            } else {
              addStructureEntry(company, null, null, jobFunc, pg, null);
            }
          });
        });
        return;
      }

      companyDepartments.forEach(dept => {
        const deptId = dept.id;
        const deptName = dept.name;
        
        const departmentUnits = activeUnits.filter(unit => {
          return unit.departmentId === deptId;
        });

        if (departmentUnits.length === 0) {
          activeJobFunctions.forEach(jobFunc => {
            activePositionGroups.forEach(pg => {
              if (visibleColumns.title) {
                activeJobTitles.forEach(title => {
                  addStructureEntry(company, deptName, null, jobFunc, pg, title);
                });
              } else {
                addStructureEntry(company, deptName, null, jobFunc, pg, null);
              }
            });
          });
          return;
        }

        departmentUnits.forEach(unit => {
          const unitName = unit.name;
          
          activeJobFunctions.forEach(jobFunc => {
            activePositionGroups.forEach(pg => {
              if (visibleColumns.title) {
                activeJobTitles.forEach(title => {
                  addStructureEntry(company, deptName, unitName, jobFunc, pg, title);
                });
              } else {
                addStructureEntry(company, deptName, unitName, jobFunc, pg, null);
              }
            });
          });
        });
      });
    });

    structure.sort((a, b) => {
      if (a.company !== b.company) return a.company.localeCompare(b.company);
      if (a.department !== b.department) return a.department.localeCompare(b.department);
      if (a.unit !== b.unit) return a.unit.localeCompare(b.unit);
      if (a.jobFunction !== b.jobFunction) return a.jobFunction.localeCompare(b.jobFunction);
      if (a.hierarchyLevel !== b.hierarchyLevel) return a.hierarchyLevel - b.hierarchyLevel;
      if (visibleColumns.title && a.title && b.title) return a.title.localeCompare(b.title);
      return 0;
    });

    console.log('🎯 Structure built:', {
      total: structure.length,
      unique: uniqueSet.size,
      visibleColumns: Object.keys(visibleColumns).filter(k => visibleColumns[k])
    });

    return structure;
  }, [businessFunctions, departments, units, jobFunctions, jobTitles, positionGroups, selectedCompany, searchTerm, mappings, visibleColumns]);

  const getRowSpans = useMemo(() => {
    const spans = {
      company: {},
      department: {},
      unit: {},
      jobFunction: {},
      hierarchy: {}
    };

    structureData.forEach((row, index) => {
      const companyKey = row.company;
      const deptKey = `${row.company}|${row.department}`;
      const unitKey = `${row.company}|${row.department}|${row.unit}`;
      const funcKey = `${row.company}|${row.department}|${row.unit}|${row.jobFunction}`;
      const hierKey = `${row.company}|${row.department}|${row.unit}|${row.jobFunction}|${row.hierarchy}`;

      if (!spans.company[companyKey]) {
        spans.company[companyKey] = { startIndex: index, count: 0 };
      }
      if (!spans.department[deptKey]) {
        spans.department[deptKey] = { startIndex: index, count: 0 };
      }
      if (!spans.unit[unitKey]) {
        spans.unit[unitKey] = { startIndex: index, count: 0 };
      }
      if (!spans.jobFunction[funcKey]) {
        spans.jobFunction[funcKey] = { startIndex: index, count: 0 };
      }
      if (!spans.hierarchy[hierKey]) {
        spans.hierarchy[hierKey] = { startIndex: index, count: 0 };
      }

      spans.company[companyKey].count++;
      spans.department[deptKey].count++;
      spans.unit[unitKey].count++;
      spans.jobFunction[funcKey].count++;
      spans.hierarchy[hierKey].count++;
    });

    return spans;
  }, [structureData]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCompany('');
  };

  const exportToCSV = () => {
    const headers = [];
    if (visibleColumns.company) headers.push('Company');
    if (visibleColumns.department) headers.push('Department');
    if (visibleColumns.unit) headers.push('Unit');
    if (visibleColumns.jobFunction) headers.push('Job Function');
    if (visibleColumns.hierarchy) headers.push('Hierarchy');
    if (visibleColumns.title) headers.push('Title');
    
    const rows = structureData.map(row => {
      const rowData = [];
      if (visibleColumns.company) rowData.push(row.company);
      if (visibleColumns.department) rowData.push(row.department);
      if (visibleColumns.unit) rowData.push(row.unit);
      if (visibleColumns.jobFunction) rowData.push(row.jobFunction);
      if (visibleColumns.hierarchy) rowData.push(row.hierarchy);
      if (visibleColumns.title) rowData.push(row.title || '');
      return rowData;
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'job_catalog_structure.csv';
    link.click();
  };

  const columnDefinitions = [
    { id: 'company', label: 'Company', icon: Building },
    { id: 'department', label: 'Department', icon: Target },
    { id: 'unit', label: 'Unit', icon: Building2 },
    { id: 'jobFunction', label: 'Job Function', icon: Briefcase },
    { id: 'hierarchy', label: 'Hierarchy | Grade', icon: Award },
    { id: 'title', label: 'Title', icon: Award }
  ];

  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-sm border border-gray-200 dark:border-almet-comet">
      
      <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
        <div className="flex flex-col gap-3">
          
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Organizational Structure Matrix
              </h2>
              <p className="text-xs text-gray-600 dark:text-almet-bali-hai">
                {structureData.length} unique positions • {visibleColumnCount} columns visible
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    showColumnSettings
                      ? 'bg-almet-sapphire text-white'
                      : 'bg-gray-100 dark:bg-almet-san-juan text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-almet-comet'
                  }`}
                >
                  <Settings size={12} />
                  Columns
                </button>
                
                {showColumnSettings && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowColumnSettings(false)}
                    />
                    <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg border border-gray-200 dark:border-almet-comet z-20">
                      <div className="p-3">
                        <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                          Toggle Columns
                        </div>
                        <div className="space-y-2">
                          {columnDefinitions.map(col => {
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
                                {visibleColumns[col.id] ? (
                                  <Eye size={10} className="ml-auto text-green-500" />
                                ) : (
                                  <EyeOff size={10} className="ml-auto text-gray-400" />
                                )}
                              </label>
                            );
                          })}
                        </div>
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
                <Download size={12} />
                Export
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search across all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 dark:border-almet-comet rounded-lg 
                  bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white 
                  focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-0"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-almet-sapphire text-white sticky top-0 z-10">
            <tr>
              {visibleColumns.company && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <Building size={14} />
                    Company
                  </div>
                </th>
              )}
              {visibleColumns.department && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <Target size={14} />
                    Department
                  </div>
                </th>
              )}
              {visibleColumns.unit && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} />
                    Unit
                  </div>
                </th>
              )}
              {visibleColumns.jobFunction && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} />
                    Job Function
                  </div>
                </th>
              )}
              {visibleColumns.hierarchy && (
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase border-r border-white/20 min-w-[150px]">
                  <div className="flex items-center justify-center gap-2">
                    <Award size={14} />
                    Hierarchy
                  </div>
                </th>
              )}
              {visibleColumns.title && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase min-w-[220px]">
                  Title
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {structureData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnCount} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-almet-bali-hai">
                  {searchTerm || selectedCompany ? 'No results found' : 'No structure data available'}
                </td>
              </tr>
            ) : (
              structureData.map((row, index) => {
                const companyKey = row.company;
                const deptKey = `${row.company}|${row.department}`;
                const unitKey = `${row.company}|${row.department}|${row.unit}`;
                const funcKey = `${row.company}|${row.department}|${row.unit}|${row.jobFunction}`;
                const hierKey = `${row.company}|${row.department}|${row.unit}|${row.jobFunction}|${row.hierarchy}`;

                const showCompany = visibleColumns.company && getRowSpans.company[companyKey].startIndex === index;
                const showDept = visibleColumns.department && getRowSpans.department[deptKey].startIndex === index;
                const showUnit = visibleColumns.unit && getRowSpans.unit[unitKey].startIndex === index;
                const showFunc = visibleColumns.jobFunction && getRowSpans.jobFunction[funcKey].startIndex === index;
                const showHier = visibleColumns.hierarchy && getRowSpans.hierarchy[hierKey].startIndex === index;

                const companyRowspan = getRowSpans.company[companyKey].count;
                const deptRowspan = getRowSpans.department[deptKey].count;
                const unitRowspan = getRowSpans.unit[unitKey].count;
                const funcRowspan = getRowSpans.jobFunction[funcKey].count;
                const hierRowspan = getRowSpans.hierarchy[hierKey].count;

                const colors = getHierarchyColor(row.hierarchy, darkMode);

                return (
                  <tr 
                    key={index}
                    className="border-b border-gray-200 dark:border-almet-comet hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    {showCompany && (
                      <td 
                        rowSpan={companyRowspan}
                        className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet bg-blue-50 dark:bg-blue-900/20 align-top"
                      >
                        <div className="flex items-center gap-2">
                          <Building size={14} className="text-blue-600 dark:text-blue-400" />
                          {row.company}
                        </div>
                      </td>
                    )}

                    {showDept && (
                      <td 
                        rowSpan={deptRowspan}
                        className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet bg-gray-50 dark:bg-almet-san-juan align-top"
                      >
                        {row.department}
                      </td>
                    )}

                    {showUnit && (
                      <td 
                        rowSpan={unitRowspan}
                        className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet align-top"
                      >
                        {row.unit}
                      </td>
                    )}

                    {showFunc && (
                      <td 
                        rowSpan={funcRowspan}
                        className="px-4 py-3 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet align-top"
                      >
                        {row.jobFunction}
                      </td>
                    )}

                    {showHier && (
                      <td 
                        rowSpan={hierRowspan}
                        className="px-4 py-3 text-center border-r border-gray-200 dark:border-almet-comet align-top"
                      >
                        <span 
                          className="inline-block px-3 py-1.5 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: colors.backgroundColor,
                            color: colors.textColor,
                            border: `1px solid ${colors.borderColor}`
                          }}
                        >
                          {row.hierarchy}
                        </span>
                      </td>
                    )}

                    {visibleColumns.title && (
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {row.title || '-'}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-almet-san-juan border-t border-gray-200 dark:border-almet-comet">
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-almet-bali-hai">
              <strong className="text-gray-900 dark:text-white">{structureData.length}</strong> Unique Positions
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-almet-bali-hai">
              <strong className="text-gray-900 dark:text-white">{visibleColumnCount}</strong> Columns
            </span>
          </div>
          <span className="text-gray-500 dark:text-almet-bali-hai italic">
            Dynamic unique combinations
          </span>
        </div>
      </div>
    </div>
  );
}