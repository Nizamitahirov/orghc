import { useState } from 'react';
import { Users, Search, ChevronRight, Lock, X, Building2, User, Plus, Loader } from 'lucide-react';

export default function TeamMembersWithSearch({ 
  employees = [], 
  currentUserId,
  canViewEmployee,
  onSelectEmployee,
  onInitializeEmployee,  // ✅ NEW
  darkMode,
  isPersonalView = false,
  canInitialize = false  // ✅ NEW
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [initializing, setInitializing] = useState({});


  // ✅ Get unique values
  const getUniqueValues = (field) => {
    return [...new Set(
      employees
        .map(e => e[field] || e[field.replace('employee_', '')])
    )].filter(Boolean).sort();
  };
 

  const departments = getUniqueValues('employee_department');
  const positions = getUniqueValues('employee_position_group');
  const companies = getUniqueValues('employee_company');

  // ✅ Filter logic
  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (emp.employee_name || emp.name || '').toLowerCase().includes(searchLower) ||
      (emp.employee_id || '').toLowerCase().includes(searchLower);
    
    const matchesDepartment = !filterDepartment || 
      (emp.employee_department || emp.department) === filterDepartment;
    
    const matchesPosition = !filterPosition || 
      (emp.employee_position_group || emp.position) === filterPosition;
    
    const matchesCompany = !filterCompany || 
      (emp.employee_company || emp.company) === filterCompany;
    
    return matchesSearch && matchesDepartment && matchesPosition && matchesCompany;
  });

  // ✅ Get employees without performance
  const employeesWithoutPerformance = filteredEmployees.filter(emp => 
    !emp.has_performance && emp.can_initialize
  );

  const getStatusBadge = (employee) => {
    if (!employee.has_performance) {
      return {
        text: 'Not Started',
        class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
      };
    }

    const objPct = parseFloat(employee.objectives_percentage);
    const compPct = parseFloat(employee.competencies_percentage);
    
    let status = employee.approval_status || 'DRAFT';
    
    if (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0) {
      status = 'COMPLETED';
    }
    
    const badges = {
      'DRAFT': { text: 'Draft', class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
      'PENDING_EMPLOYEE_APPROVAL': { text: 'Pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      'PENDING_MANAGER_APPROVAL': { text: 'Review', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      'APPROVED': { text: 'Approved', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      'COMPLETED': { text: 'Completed', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      'NEED_CLARIFICATION': { text: 'Clarification', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    };
    
    return badges[status] || badges['DRAFT'];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterPosition('');
    setFilterCompany('');
  };

  const hasActiveFilters = searchTerm || filterDepartment || filterPosition || filterCompany;

  // ✅ Handle single employee initialize
  const handleInitializeSingle = async (employee) => {
    if (!onInitializeEmployee) return;
    
    setInitializing(prev => ({ ...prev, [employee.id]: true }));
    try {
      await onInitializeEmployee(employee);
    } finally {
      setInitializing(prev => ({ ...prev, [employee.id]: false }));
    }
  };

 
  // ✅ Personal view (employee only sees themselves)
  if (isPersonalView && employees.length === 1) {
    const personalEmployee = employees.find(e => e.id === currentUserId);
    
    if (!personalEmployee) {
      return (
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-8 text-center`}>
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 font-medium">No performance data found</p>
        </div>
      );
    }
    
    const badge = getStatusBadge(personalEmployee);
    const canInit = !personalEmployee.has_performance && personalEmployee.can_initialize && canInitialize;
    
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-almet-sapphire/10 dark:bg-almet-sapphire/20">
            <User className="w-5 h-5 text-almet-sapphire" />
          </div>
          <div className="flex-1">
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              My Performance
            </h3>
            <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
              View and manage your performance
            </p>
          </div>
        </div>

        <div className={`${
          darkMode ? 'bg-almet-san-juan hover:bg-almet-comet' : 'bg-almet-mystic hover:bg-gray-100'
        } rounded-xl p-4 transition-all`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                {(personalEmployee.employee_name || personalEmployee.name || 'U').charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  {personalEmployee.employee_name || personalEmployee.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai flex-wrap">
                  <span className="truncate">{personalEmployee.employee_position_group || personalEmployee.position}</span>
                  <span>•</span>
                  <span className="truncate">{personalEmployee.employee_department || personalEmployee.department}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.class}`}>
                {badge.text}
              </span>
              
              {canInit ? (
                <button
                  onClick={() => handleInitializeSingle(personalEmployee)}
                  disabled={initializing[personalEmployee.id]}
                 className="px-3 py-2 bg-[#D1FAE5] hover:bg-[#A7F3D0] text-green-800 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-50"

                >
                  {initializing[personalEmployee.id] ? (
                    <Loader className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      Initialize
                    </>
                  )}
                </button>
              ) : (
                personalEmployee.has_performance && (
                  <button
                    onClick={() => onSelectEmployee(personalEmployee)}
                    className="px-3 py-2 bg-[#5975af] hover:bg-almet-astral text-white rounded-lg text-xs font-medium"
                  >
                    View Details
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
            Team Members
          </h3>
          <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
            {filteredEmployees.length} direct reports
            {employeesWithoutPerformance.length > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                {' '}• {employeesWithoutPerformance.length} not started
              </span>
            )}
          </p>
        </div>
        
       
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or employee ID..."
            className={`w-full pl-10 pr-4 h-10 text-sm rounded-xl border ${
              darkMode 
                ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-bali-hai' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30`}
          />
        </div>

        {/* Filters */}
        {(departments.length > 0 || positions.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {departments.length > 0 && (
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className={`h-10 px-3 text-sm rounded-xl border ${
                  darkMode 
                    ? 'bg-almet-san-juan border-almet-comet text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30`}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}

            {positions.length > 0 && (
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className={`h-10 px-3 text-sm rounded-xl border ${
                  darkMode 
                    ? 'bg-almet-san-juan border-almet-comet text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30`}
              >
                <option value="">All Positions</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Company Filter */}
        {companies.length > 0 && (
          <div className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/30'} rounded-xl p-3`}>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-almet-sapphire" />
              <h4 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                Filter by Company
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCompany('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterCompany === ''
                    ? 'bg-almet-sapphire text-white shadow-sm'
                    : darkMode
                      ? 'bg-almet-comet/50 text-almet-bali-hai hover:bg-almet-comet'
                      : 'bg-white text-almet-waterloo hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Companies
              </button>

              {companies.map(company => (
                <button
                  key={company}
                  onClick={() => setFilterCompany(company)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCompany === company
                      ? 'bg-almet-sapphire text-white shadow-sm'
                      : darkMode
                        ? 'bg-almet-comet/50 text-almet-bali-hai hover:bg-almet-comet'
                        : 'bg-white text-almet-waterloo hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`w-full h-9 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
              darkMode 
                ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            } transition-colors`}
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Employee List */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 font-medium">
            {hasActiveFilters ? 'No employees match your filters' : 'No team members'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEmployees.map((employee, index) => {
            const hasAccess = canViewEmployee(employee.id);
            const badge = getStatusBadge(employee);
            const canInit = !employee.has_performance && employee.can_initialize && canInitialize;
            const isInit = initializing[employee.id];
            
            return (
              <div
                key={`employee-${employee.id}-${index}`}
                className={`${
                  darkMode ? 'bg-almet-san-juan hover:bg-almet-comet' : 'bg-almet-mystic hover:bg-gray-100'
                } rounded-xl p-4 transition-all`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {(employee.employee_name || employee.name || 'U').charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                          {employee.employee_name || employee.name}
                        </h4>
                        {!hasAccess && <Lock className="w-3 h-3 text-almet-waterloo flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai flex-wrap">
                        <span className="truncate">{employee.employee_position_group || employee.position}</span>
                        <span>•</span>
                        <span className="truncate">{employee.employee_department || employee.department}</span>
                        {(employee.employee_company || employee.company) && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 font-medium text-almet-sapphire">
                              <Building2 className="w-3 h-3" />
                              {employee.employee_company || employee.company}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.class}`}>
                      {badge.text}
                    </span>
                    
                    {canInit ? (
                      <button
                        onClick={() => handleInitializeSingle(employee)}
                        disabled={isInit}
                        className="px-3 py-2 bg-[#D1FAE5] hover:bg-[#A7F3D0] text-green-700 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        {isInit ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            Initialize
                          </>
                        )}
                      </button>
                    ) : hasAccess && employee.has_performance ? (
                      <button
                        onClick={() => onSelectEmployee(employee)}
                        className="px-3 py-2 bg-[#5975af] hover:bg-almet-astral text-white rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        View
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}