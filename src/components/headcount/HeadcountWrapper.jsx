// src/components/headcount/HeadcountWrapper.jsx - WITH STATE PERSISTENCE
"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  ArrowRight, 
  Grid3x3, 
  List,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  UserCheck,
  Clock,
  ShieldOff
} from 'lucide-react';
import { useTheme } from "../common/ThemeProvider";
import { useReferenceData } from "../../hooks/useReferenceData";
import { useEmployees } from "../../hooks/useEmployees";
import { useRouter } from "next/navigation";
import HeadcountTable from "./HeadcountTable";
import HeadcountAccessControl from "@/components/headcount/HeadcountAccessControl";

// ✅ Storage Keys for State Persistence
const STORAGE_KEYS = {
  SELECTED_VIEW: 'headcount_selected_view',
  SELECTED_COMPANY: 'headcount_selected_company',
  VIEW_MODE: 'headcount_view_mode'
};

const findEmployeeIdByEmail = async (userEmail) => {
  try {
    const { employeeService } = await import('@/services/newsService');
    const response = await employeeService.getEmployees({ 
      search: userEmail,
      page_size: 10 
    });
    
    const employees = response.results || response.data?.results || response.data || [];
    
    const matchedEmployee = employees.find(emp => 
      emp.email?.toLowerCase() === userEmail.toLowerCase() ||
      emp.user_email?.toLowerCase() === userEmail.toLowerCase() ||
      emp.work_email?.toLowerCase() === userEmail.toLowerCase()
    );
    
    if (matchedEmployee) {
      const employeeId = matchedEmployee.id || matchedEmployee.employee_id;
      localStorage.setItem('employee_id', employeeId);
      return employeeId;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding employee by email:', error);
    return null;
  }
};

const HeadcountWrapper = () => {
  const { darkMode } = useTheme();
  const router = useRouter();
  
  // ✅ Initialize state from localStorage
  const [selectedView, setSelectedView] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_VIEW) || 'dashboard';
    }
    return 'dashboard';
  });
  
  const [selectedCompany, setSelectedCompany] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_COMPANY);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.VIEW_MODE) || 'grid';
    }
    return 'grid';
  });
  
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState(null);
  
  const { businessFunctions, loading: refLoading } = useReferenceData();
  const { statistics, fetchStatistics, loading } = useEmployees();

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // ✅ Persist selectedView to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SELECTED_VIEW, selectedView);
    }
  }, [selectedView]);

  // ✅ Persist selectedCompany to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedCompany) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_COMPANY, JSON.stringify(selectedCompany));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_COMPANY);
      }
    }
  }, [selectedCompany]);

  // ✅ Persist viewMode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
    }
  }, [viewMode]);

  // ✅ Validate and restore selected company on mount
  useEffect(() => {
    if (selectedCompany && businessFunctions && businessFunctions.length > 0) {
      // Verify the selected company still exists in businessFunctions
      const companyExists = businessFunctions.find(bf => 
        bf.id === selectedCompany.id || bf.code === selectedCompany.code
      );
      
      if (!companyExists) {
        // Company no longer exists, clear selection and go to dashboard
        console.warn('⚠️ Previously selected company no longer exists');
        setSelectedCompany(null);
        setSelectedView('dashboard');
        localStorage.removeItem(STORAGE_KEYS.SELECTED_COMPANY);
        localStorage.setItem(STORAGE_KEYS.SELECTED_VIEW, 'dashboard');
      }
    }
  }, [selectedCompany, businessFunctions]);

  // Check if loading properly
  const isRefDataLoading = useMemo(() => {
    if (typeof refLoading === 'object') {
      return refLoading.businessFunctions === true;
    }
    return refLoading === true;
  }, [refLoading]);

  const isStatsLoading = useMemo(() => {
    if (typeof loading === 'object') {
      return loading.statistics === true;
    }
    return loading === true;
  }, [loading]);

  const isLoading = isRefDataLoading || isStatsLoading;

  // Check if we have the minimum required data
  const hasRequiredData = useMemo(() => {
    return businessFunctions && 
           Array.isArray(businessFunctions) && 
           businessFunctions.length > 0;
  }, [businessFunctions]);

  // Helper function to generate colors based on index
  const generateColorForIndex = useCallback((index) => {
    const colors = [
      '#30539b', '#336fa5', '#4e7db5', '#38587d', '#253360',
      '#7a829a', '#90a0b9', '#4f5772', '#2346A8', '#1e3a8a',
    ];
    return colors[index % colors.length];
  }, []);

  // Transform Companies into company cards with statistics
  const companyCards = useMemo(() => {
    if (!businessFunctions || businessFunctions.length === 0) return [];
    
    return businessFunctions
      .filter(bf => bf.is_active)
      .map((bf, index) => {
        const color = bf.color || generateColorForIndex(index);
        const companyName = bf.label;
        const companyCode = bf.code;
        
        let employeeCount = 0;
        let activeCount = 0;
        let vacantCount = 0;
        let recentHiresCount = 0;
        
        if (companyName && statistics?.by_business_function?.[companyName]) {
          const bfStat = statistics.by_business_function[companyName];
          
          if (typeof bfStat === 'number') {
            employeeCount = bfStat;
            activeCount = bfStat;
          } else if (typeof bfStat === 'object' && bfStat !== null) {
            employeeCount = bfStat.count || 0;
            activeCount = bfStat.active || 0;
            recentHiresCount = bfStat.recent_hires || 0;
          }
          
          vacantCount = statistics.vacant_positions_by_business_function?.[companyName] || 0;
        }
        else if (companyName && statistics?.by_business_function) {
          const statsKeys = Object.keys(statistics.by_business_function);
          const matchedKey = statsKeys.find(key => 
            key.toLowerCase().includes(companyName.toLowerCase()) ||
            companyName.toLowerCase().includes(key.toLowerCase())
          );
          
          if (matchedKey) {
            const bfStat = statistics.by_business_function[matchedKey];
            
            if (typeof bfStat === 'number') {
              employeeCount = bfStat;
              activeCount = bfStat;
            } else if (typeof bfStat === 'object' && bfStat !== null) {
              employeeCount = bfStat.count || 0;
              activeCount = bfStat.active || 0;
              recentHiresCount = bfStat.recent_hires || 0;
            }
            
            vacantCount = statistics.vacant_positions_by_business_function?.[matchedKey] || 0;
          }
        }
        
        if (employeeCount === 0 && bf.employee_count) {
          employeeCount = bf.employee_count;
          activeCount = bf.employee_count;
        }
        
        return {
          code: companyCode,
          name: companyName,
          id: bf.id,
          color: color,
          totalEmployees: employeeCount,
          activeEmployees: activeCount,
          vacantPositions: vacantCount,
          departments: 0,
          recentHires: recentHiresCount
        };
      })
      .sort((a, b) => b.totalEmployees - a.totalEmployees);
  }, [businessFunctions, statistics, generateColorForIndex]);

  // Calculate totals across all companies
  const totals = useMemo(() => {
    return {
      totalCompanies: companyCards.length,
      totalEmployees: statistics?.total_employees || 0,
      activeEmployees: statistics?.active_employees || 0,
      inactiveEmployees: statistics?.inactive_employees || 0,
      recentHires: statistics?.recent_hires_30_days || 0,
      contractEnding: statistics?.upcoming_contract_endings_30_days || 0,
      totalVacant: statistics?.total_vacant_positions || 0
    };
  }, [companyCards, statistics]);

  useEffect(() => {
    const getUserEmployeeId = async () => {
      try {
        let employeeId = localStorage.getItem('employee_id') ||
                        localStorage.getItem('user_employee_id');
        
        if (!employeeId) {
          const userEmail = localStorage.getItem('user_email') || 
                           localStorage.getItem('email');
          
          if (userEmail) {
            employeeId = await findEmployeeIdByEmail(userEmail);
          }
        }
        
        if (employeeId) {
          setCurrentUserEmployeeId(employeeId);
        }
      } catch (error) {
        console.error('Failed to get user employee ID:', error);
      }
    };
    
    getUserEmployeeId();
  }, []);

  const handleGoToProfile = useCallback(() => {
    if (currentUserEmployeeId) {
      router.push(`/structure/employee/${currentUserEmployeeId}/`);
    } else {
      router.push('/structure/profile');
    }
  }, [currentUserEmployeeId, router]);
  
  const handleCompanySelect = useCallback((company) => {
    if (company.totalEmployees === 0) {
      setAccessDenied(true);
      setSelectedCompany(company);
      setSelectedView('no-access');
    } else {
      setAccessDenied(false);
      setSelectedCompany(company);
      setSelectedView('company');
    }
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedView('dashboard');
    setSelectedCompany(null);
    setAccessDenied(false);
  }, []);

  const handleViewAll = useCallback(() => {
    setSelectedView('all');
    setSelectedCompany(null);
    setAccessDenied(false);
  }, []);

  // Theme classes
  const bgPrimary = darkMode ? "bg-gray-900" : "bg-gray-50";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgCardHover = darkMode ? "bg-gray-750" : "bg-gray-50";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-500" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBorder = darkMode ? "hover:border-gray-600" : "hover:border-gray-300";

  // Company Card Component
  const CompanyCard = ({ company, onClick }) => (
    <div
      onClick={() => onClick(company)}
      className={`group relative ${bgCard} rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border ${borderColor} ${hoverBorder}`}
    >
      <div className="h-1 w-full" style={{ backgroundColor: company.color }} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm"
              style={{ backgroundColor: company.color }}
            >
              {company.code}
            </div>
            <div>
              <h3 className={`font-semibold ${textPrimary} text-sm leading-tight`}>
                {company.name}
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                {company.code}
              </p>
            </div>
          </div>
          <ArrowRight 
            className={`${textMuted} group-hover:text-almet-sapphire transition-all flex-shrink-0`}
            size={18}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-1">
              <Users size={14} className={textMuted} />
              <div className="flex justify-center items-center gap-1">
                <p className={`text-sm font-bold ${textPrimary}`}>
                  {company.totalEmployees}
                </p>
                <span className={`text-xs ${textMuted}`}>Total</span>
              </div>
            </div>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-1">
              <Briefcase size={14} className={textMuted} />
              <div className="flex justify-center items-center gap-1">
                <p className={`text-sm font-bold ${textPrimary}`}>
                  {company.vacantPositions}
                </p>
                <span className={`text-xs ${textMuted}`}>Vacant</span>
              </div>
            </div>
          </div>
        </div>

        {company.recentHires > 0 && (
          <div className={`mt-3 pt-3 border-t ${borderColor}`}>
            <div className="flex items-center text-xs">
              <TrendingUp size={12} className="mr-1.5 text-green-500" />
              <span className={textSecondary}>
                {company.recentHires} new hire{company.recentHires > 1 ? 's' : ''} this month
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // All Companies Card
  const AllCompaniesCard = ({ onClick }) => (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-5 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Building2 className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm leading-tight">
                All Companies
              </h3>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Combined view
              </p>
            </div>
          </div>
          <ArrowRight 
            className="text-blue-100/80 group-hover:text-white transition-all flex-shrink-0" 
            size={18} 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <Users size={14} className="text-blue-100/80" />
              <div className="flex justify-center items-center gap-1">
                <p className="text-sm font-bold text-white">
                  {totals.totalEmployees}
                </p>
                <span className="text-xs text-blue-100/80">Total</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <Building2 size={14} className="text-blue-100/80" />
              <div className="flex justify-center items-center gap-1">
                <p className="text-sm font-bold text-white">
                  {totals.totalCompanies}
                </p>
                <span className="text-xs text-blue-100/80">Companies</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // No Access View
  if (selectedView === 'no-access' && selectedCompany) {
    return (
      <div className={`min-h-screen p-6`}>
        <div className="mx-auto">
          <div className="mb-6">
            <button
              onClick={handleBackToDashboard}
              className={`flex items-center space-x-2 text-sm ${textSecondary} hover:${textPrimary} transition-colors group`}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          <div className={`${bgCard} rounded-lg shadow-lg border ${borderColor} p-8`}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <ShieldOff className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <h1 className={`${textPrimary} text-2xl font-bold text-center mb-3`}>
              No Access to Company
            </h1>
            
            <p className={`${textSecondary} text-center mb-8`}>
              You don't have permission to view employees for this company
            </p>

            <div 
              className="rounded-lg p-5 mb-6 border"
              style={{ 
                backgroundColor: `${selectedCompany.color}10`,
                borderColor: selectedCompany.color 
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: selectedCompany.color }}
                >
                  {selectedCompany.code}
                </div>
                <div>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedCompany.name}
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    {selectedCompany.code}
                  </p>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-white'} rounded-lg p-3`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className={`${textPrimary} font-medium mb-2`}>
                      Access Restriction
                    </p>
                    <p className={`${textSecondary} text-sm mb-3`}>
                      You can only access companies where you have employees or manage teams.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        <span className={`${textSecondary} text-sm`}>
                          This company has {selectedCompany.totalEmployees} employees, but none are assigned to you
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        <span className={`${textSecondary} text-sm`}>
                          Contact your HR administrator if you need access
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBackToDashboard}
                className="w-full bg-almet-sapphire hover:bg-almet-astral text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 group"
              >
                <Building2 className="w-5 h-5" />
                <span>Back to Companies</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleGoToProfile}
                className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textPrimary} px-6 py-3 rounded-lg font-medium transition-colors duration-200`}
              >
                Go to My Profile
              </button>
            </div>

            <p className={`text-center ${textSecondary} text-xs mt-6`}>
              If you believe this is an error, please contact your HR administrator
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (!hasRequiredData && isRefDataLoading) {
    return (
      <div className={`min-h-screen ${bgPrimary} flex items-center justify-center`}>
        <div className="text-center">
          <RefreshCw className={`w-10 h-10 ${textSecondary} animate-spin mx-auto mb-3`} />
          <p className={`text-sm ${textSecondary}`}>Loading companies...</p>
        </div>
      </div>
    );
  }

  // No data
  if (!hasRequiredData) {
    return (
      <div className={`min-h-screen ${bgPrimary} flex items-center justify-center p-6`}>
        <div className={`${bgCard} rounded-xl p-8 border ${borderColor} text-center`}>
          <AlertCircle className={`w-12 h-12 ${textMuted} mx-auto mb-4`} />
          <h2 className={`text-lg font-semibold ${textPrimary} mb-2`}>No Companies Found</h2>
          <p className={`text-sm ${textSecondary} mb-4`}>
            No Companies are configured yet.
          </p>
          <button
            onClick={() => window.location.href = '/structure/settings'}
            className="px-4 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (selectedView === 'dashboard') {
    return (
      <div className={`min-h-screen p-5`}>
        <div className="mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>
                  Workforce Management
                </h1>
                <p className={`text-sm ${textSecondary}`}>
                  Select a company to manage employees and positions
                </p>
              </div>
              
              <div className={`flex items-center space-x-1 ${bgCard} rounded-lg p-1 border ${borderColor}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-almet-sapphire/10 text-almet-sapphire' 
                      : `${textMuted} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all text-sm ${
                    viewMode === 'list' 
                      ? 'bg-almet-sapphire/10 text-almet-sapphire' 
                      : `${textMuted} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4 justify-center items-center">
                  <p className={`text-2xl font-bold ${textPrimary}`}>
                    {totals.totalCompanies}
                  </p>
                  <p className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                    Companies
                  </p>
                </div>
                <Building2 size={16} className={textMuted} />
              </div>
            </div>
            
            <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4 justify-center items-center">
                  <p className={`text-2xl font-bold ${textPrimary}`}>
                    {totals.totalEmployees}
                  </p>
                  <p className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                    Total Employees
                  </p>
                </div>
                <Users size={16} className={textMuted} />
              </div>
            </div>
            
            <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4 justify-center items-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {totals.totalVacant}
                  </p>
                  <p className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                    Vacant Positions
                  </p>
                </div>
                <Briefcase size={16} className="text-orange-500" />
              </div>
            </div>
            
            <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4 justify-center items-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {totals.recentHires}
                  </p>
                  <p className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                    Recent Hires
                  </p>
                </div>
                <Clock size={16} className="text-blue-500" />
              </div>
              <p className={`text-xs ${textMuted} mt-1`}>Last 30 days</p>
            </div>
          </div>

          {/* Company Cards Grid */}
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          } gap-4`}>
            <AllCompaniesCard onClick={handleViewAll} />
            {companyCards.map((company) => (
              <CompanyCard
                key={`company-${company.id}-${company.code}`}
                company={company}
                onClick={handleCompanySelect}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Company View or All View
  return (
    <HeadcountAccessControl>
      <div className={`min-h-screen`}>
        <div className="mx-auto">
          <div className="mb-2">
            <button
              onClick={handleBackToDashboard}
              className={`flex items-center space-x-2 text-sm ${textSecondary} hover:${textPrimary} transition-colors group`}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          {selectedView === 'company' && selectedCompany && (
            <div 
              className="rounded-xl p-3 mb-3 text-white relative overflow-hidden"
              style={{ backgroundColor: selectedCompany.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold text-lg">
                      {selectedCompany.code}
                    </div>
                    <div>
                      <h1 className="text-base font-bold mb-0.5">
                        {selectedCompany.name}
                      </h1>
                      <p className="text-white/80 text-sm">
                        {selectedCompany.code} • {selectedCompany.totalEmployees} employees
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <HeadcountTable 
            businessFunctionFilter={selectedView === 'company' ? selectedCompany?.code : null} 
          />
        </div>
      </div>
    </HeadcountAccessControl>
  );
};

export default HeadcountWrapper;