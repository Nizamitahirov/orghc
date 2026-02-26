// src/components/jobCatalog/SimpleTableView.jsx
// SIMPLE FLAT TABLE VIEW - Shows all data in a plain table format
// Her job combination üçün ayrı sətir, eyni adlar təkrar ola bilər

import React, { useMemo, useState } from 'react';
import { Users, Loader2, Building2, Target, Briefcase, Award, Search } from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { getHierarchyColor } from './HierarchyColors';

export default function SimpleTableView({ context }) {
  const { employees, loading, setSelectedJob } = context;
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten and prepare table data
  const tableData = useMemo(() => {
    if (!employees || !Array.isArray(employees)) return [];

    // Group employees by unique job combinations
    const jobGroups = {};

    employees.forEach(emp => {
      const deptName = emp.department_name || 'Unassigned';
      const unitName = emp.unit_name || 'Unassigned';
      const funcName = emp.job_function_name || 'Unassigned';
      const hierarchyName = emp.position_group_name || 'Unassigned';
      const titleName = emp.job_title || 'Unassigned';

      // Create unique key for this job combination
      const key = `${deptName}|||${unitName}|||${funcName}|||${hierarchyName}|||${titleName}`;

      if (!jobGroups[key]) {
        jobGroups[key] = {
          department: deptName,
          unit: unitName,
          jobFunction: funcName,
          hierarchy: hierarchyName,
          title: titleName,
          employees: [],
          count: 0
        };
      }

      jobGroups[key].employees.push(emp);
      jobGroups[key].count++;
    });

    return Object.values(jobGroups);
  }, [employees]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;

    const search = searchTerm.toLowerCase();
    return tableData.filter(row => 
      row.department.toLowerCase().includes(search) ||
      row.unit.toLowerCase().includes(search) ||
      row.jobFunction.toLowerCase().includes(search) ||
      row.hierarchy.toLowerCase().includes(search) ||
      row.title.toLowerCase().includes(search)
    );
  }, [tableData, searchTerm]);

  // Loading state
  if (loading.employees) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-almet-sapphire" />
        <span className="ml-2 text-gray-600 dark:text-almet-bali-hai text-xs">Loading...</span>
      </div>
    );
  }

  // No data state
  if (!employees || employees.length === 0) {
    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-8 text-center border border-gray-200 dark:border-almet-comet">
        <Building2 size={48} className="mx-auto text-gray-400 dark:text-almet-bali-hai mb-3" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Data Available</h3>
        <p className="text-xs text-gray-500 dark:text-almet-bali-hai">No employee data found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-sm border border-gray-200 dark:border-almet-comet">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Job Catalogue - Table View
            </h2>
            <p className="text-xs text-gray-600 dark:text-almet-bali-hai">
              Complete list of all positions
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by department, unit, function, hierarchy, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-almet-comet rounded-lg 
              bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white 
              placeholder-gray-400 dark:placeholder-almet-bali-hai
              focus:ring-2 focus:ring-almet-sapphire focus:border-transparent
              transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-almet-sapphire text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20">
                <div className="flex items-center gap-2">
                  <Target size={14} />
                  Department
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20">
                <div className="flex items-center gap-2">
                  <Building2 size={14} />
                  Unit
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} />
                  Job Function
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase border-r border-white/20">
                <div className="flex items-center justify-center gap-2">
                  <Award size={14} />
                  Hierarchy
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20">
                Title
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase">
                <div className="flex items-center justify-center gap-2">
                  <Users size={14} />
                  Employees
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-almet-bali-hai">
                  No results found for "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => {
                const colors = getHierarchyColor(row.hierarchy, darkMode);
                
                return (
                  <tr 
                    key={index}
                    className="border-b border-gray-200 dark:border-almet-comet 
                      hover:bg-almet-sapphire/5 dark:hover:bg-almet-sapphire/10 
                      cursor-pointer transition-colors"
                    onClick={() => {
                      const jobData = {
                        id: `${row.department}-${row.unit}-${row.jobFunction}-${row.hierarchy}-${row.title}`,
                        department: row.department,
                        unit: row.unit,
                        jobFunction: row.jobFunction,
                        hierarchy: row.hierarchy,
                        title: row.title,
                        currentEmployees: row.count,
                        employees: row.employees
                      };
                      setSelectedJob(jobData);
                    }}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet">
                      {row.department}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet">
                      {row.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet">
                      {row.jobFunction}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-almet-comet">
                      <span 
                        className="inline-block px-2.5 py-1 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: colors.backgroundColor,
                          color: colors.textColor,
                          border: `1px solid ${colors.borderColor}`
                        }}
                      >
                        {row.hierarchy}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet">
                      {row.title}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 
                        text-almet-sapphire dark:text-almet-steel-blue rounded-md text-xs font-semibold">
                        <Users size={12} />
                        <span>{row.count}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 dark:bg-almet-san-juan border-t border-gray-200 dark:border-almet-comet">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-almet-bali-hai">
              <strong className="text-gray-900 dark:text-white">{filteredData.length}</strong> Job Positions
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-almet-bali-hai">
              <strong className="text-gray-900 dark:text-white">{employees.length}</strong> Total Employees
            </span>
          </div>
          <span className="text-gray-500 dark:text-almet-bali-hai italic">
            Click on any row to view details
          </span>
        </div>
      </div>
    </div>
  );
}