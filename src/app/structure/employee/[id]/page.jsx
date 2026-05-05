// src/app/structure/employee/[id]/page.jsx - WITH PROBATION REVIEWS TAB
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "../../../../store";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  Users,
  Award,
  Target,
  LayoutGrid,
  AlertTriangle,
  FileText,
  Activity,
  Clock,
  Eye,
  EyeOff,
  Loader,
  ClipboardList,
  Settings,
  TrendingUp,
  ExternalLink,
  Package,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  LogOut,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  XCircle,
  Wallet,
  DollarSign,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useEmployees } from "@/hooks/useEmployees";
import EmployeeStatusBadge from "@/components/headcount/EmployeeStatusBadge";
import EmployeeTag from "@/components/headcount/EmployeeTag";
import EmployeeDetailJobDescriptions from "@/components/headcount/EmployeeDetailJobDescriptions";
import EmployeeAssetManagement from "@/components/headcount/EmployeeAssetManagement";
import EmployeeDetailPerformance from "@/components/headcount/EmployeeDetailPerformance";
import EmployeeProfilePhotoManager from "@/components/headcount/EmployeeProfilePhotoManager";
import EmployeeDocumentManager from "@/components/headcount/EmployeeDocumentManager";
import ResignationSubmissionModal from "@/components/resignation/ResignationSubmissionModal";
import ProbationReviewModal from "@/components/resignation/ProbationReviewModal";
import resignationExitService from '@/services/resignationExitService';
import { apiService } from '@/services/api';
import { bonusRecordService } from '@/services/bonusService';
import { siCalcService } from '@/services/siService';

const EmployeeDetailPageContent = () => {
  const { id } = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const { 
    fetchEmployee, 
    currentEmployee, 
    loading, 
    error, 
    clearCurrentEmployee,
  } = useEmployees();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState(null);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    contact: true,
    organization: true,
    employment: true,
    status: true
  });

  // Resignation & Probation States
  const [showResignationModal, setShowResignationModal] = useState(false);
  const [showProbationModal, setShowProbationModal] = useState(false);
  const [probationInfo, setProbationInfo] = useState(null);
  const [allProbationReviews, setAllProbationReviews] = useState([]);
  const [loadingProbation, setLoadingProbation] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [contractConfigs, setContractConfigs] = useState({});
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeReviewFilter, setActiveReviewFilter] = useState('all'); // 'all', 'employee', 'manager'
const [respondentType, setRespondentType] = useState('EMPLOYEE'); //  ƏLAVƏ ET

  // Bonus records
  const [bonusRecords,     setBonusRecords]     = useState([]);
  const [siRecords,        setSiRecords]        = useState([]);
  const [bonusLoading,     setBonusLoading]     = useState(false);
  const [bonusDetailMap,   setBonusDetailMap]   = useState({}); // { [recordId]: detailObj }
  const [loadingDetailId,  setLoadingDetailId]  = useState(null);
  const [expandedBonusId,  setExpandedBonusId]  = useState(null);
  const [siDetailModal, setSiDetailModal] = useState(null); // {record, detail: null|obj}
  const [siDetailLoading, setSiDetailLoading] = useState(false);

  // Theme classes
  const bgPrimary = darkMode ? "bg-almet-cloud-burst" : "bg-almet-mystic";
  const bgCard = darkMode ? "bg-almet-san-juan" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode
    ? "bg-almet-comet hover:bg-almet-san-juan text-almet-bali-hai border border-almet-comet"
    : "bg-white hover:bg-almet-mystic text-almet-waterloo border border-gray-300";
  const shadowClass = darkMode ? "shadow-lg shadow-black/10" : "shadow-md shadow-gray-200/50";
  const bgAccent = darkMode ? "bg-almet-comet/30" : "bg-almet-mystic/50";
  const bgGradient = "bg-gradient-to-br from-almet-sapphire to-almet-steel-blue";

  const isManager = currentEmployee?.direct_reports && currentEmployee.direct_reports.length > 0;

  // Load bonus records when bonus tab activated
  useEffect(() => {
    if (activeTab === 'bonuses' && id) {
      setBonusLoading(true);
      Promise.allSettled([
        bonusRecordService.listByEmployee(id),
        siCalcService.listByEmployee(id),
      ]).then(([perfResult, siResult]) => {
        if (perfResult.status === 'fulfilled') {
          const d = perfResult.value.data;
          setBonusRecords(Array.isArray(d) ? d : (d.results ?? []));
        }
        if (siResult.status === 'fulfilled') {
          const d = siResult.value.data;
          setSiRecords(Array.isArray(d) ? d : (d.results ?? []));
        }
      }).finally(() => setBonusLoading(false));
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (id) {
      fetchEmployee(id);
      loadUserInfo();
      loadContractConfigs();
    }

    return () => {
      clearCurrentEmployee();
    };
  }, [id]);

  useEffect(() => {
    if (currentEmployee) {
      setCurrentProfilePhoto(
        currentEmployee.profile_image || 
        currentEmployee.profile_image_url || 
        null
      );
      
      // Always load probation data (even if not in probation status)
      loadProbationData();
    }
  }, [currentEmployee]);

  const loadUserInfo = async () => {
    try {
      const userInfo = await resignationExitService.getCurrentUser();
      const userProfile = await resignationExitService.getUser();
      
      const fullUserData = {
        ...userInfo,
        ...userProfile,
        id: userProfile.employee?.id || userInfo.id,
        employee_id: userProfile.employee?.employee_id || userInfo.username,
        full_name: userProfile.employee?.full_name || `${userInfo.first_name} ${userInfo.last_name}`,
      };
      
      setCurrentUser(fullUserData);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadContractConfigs = async () => {
    try {
      const contractResponse = await apiService.getContractConfigs();
      const contracts = contractResponse.data.results || contractResponse.data || [];
      
      const configMap = {};
      contracts.forEach(config => {
        configMap[config.contract_type] = {
          probation_days: config.probation_days || 0,
          total_days_until_active: config.total_days_until_active || 0,
          display_name: config.display_name || config.contract_type
        };
      });
      
      setContractConfigs(configMap);
    } catch (error) {
      console.error('Error loading contract configs:', error);
    }
  };

  // 🆕 Load ALL probation reviews
  const loadProbationData = async () => {
    try {
      setLoadingProbation(true);
      
      // Calculate probation info if in probation
      if (currentEmployee.status_name?.toUpperCase().includes('PROBATION') && 
          currentEmployee.start_date && 
          currentEmployee.contract_duration) {
        
        const contractConfig = contractConfigs[currentEmployee.contract_duration];
        const totalProbationDays = contractConfig?.probation_days || 90;
        
        const startDate = new Date(currentEmployee.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const probationEndDate = new Date(startDate);
        probationEndDate.setDate(probationEndDate.getDate() + totalProbationDays);
        
        const daysCompleted = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.ceil((probationEndDate - today) / (1000 * 60 * 60 * 24));
        const progressPercent = Math.min(100, Math.round((daysCompleted / totalProbationDays) * 100));
        
        let urgencyLevel = 'normal';
        if (daysRemaining <= 7) urgencyLevel = 'critical';
        else if (daysRemaining <= 14) urgencyLevel = 'warning';
        else if (daysRemaining <= 30) urgencyLevel = 'attention';
        
        setProbationInfo({
          probationEndDate: probationEndDate.toISOString().split('T')[0],
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          daysCompleted,
          totalProbationDays,
          progressPercent,
          urgencyLevel
        });
      }
      
      // Load ALL probation reviews for this employee
      const response = await resignationExitService.probationReview.getProbationReviews({
        employee: id
      });
      
      setAllProbationReviews(response.results || []);
      
    } catch (error) {
      console.error('Error loading probation data:', error);
    } finally {
      setLoadingProbation(false);
    }
  };

  const isOwnProfile = currentUser?.id === currentEmployee?.id;


  const getFilteredReviews = () => {
    if (activeReviewFilter === 'employee') {
      return allProbationReviews.filter(r => 
        r.employee_responses && r.employee_responses.length > 0
      );
    }
    if (activeReviewFilter === 'manager') {
      return allProbationReviews.filter(r => 
        r.manager_responses && r.manager_responses.length > 0
      );
    }
    return allProbationReviews; // 'all'
  };

  const pendingReviews = allProbationReviews.filter(r => r.status === 'PENDING');
  const completedReviews = allProbationReviews.filter(r => r.status === 'COMPLETED');

  // Enhanced field getters (keep existing)
  const getFieldValue = (field, fallback = 'N/A') => {
    if (!currentEmployee) return fallback;
    
    const fieldMappings = {
      'name': currentEmployee.name || currentEmployee.full_name,
      'employee_id': currentEmployee.employee_id,
      'job_title': currentEmployee.job_title,
      'email': currentEmployee.email,
      'phone': currentEmployee.phone,
      'address': currentEmployee.address,
      'date_of_birth': currentEmployee.date_of_birth,
      'gender': currentEmployee.gender,
      'emergency_contact': currentEmployee.emergency_contact,
      'start_date': currentEmployee.start_date,
      'end_date': currentEmployee.end_date,
      'notes': currentEmployee.notes,
      'grading_level': currentEmployee.grading_level,
      'contract_duration': currentEmployee.contract_duration,
      'contract_start_date': currentEmployee.contract_start_date,
      'contract_end_date': currentEmployee.contract_end_date,
      'is_visible_in_org_chart': currentEmployee.is_visible_in_org_chart,
      'business_function_name': currentEmployee.business_function_detail?.name,
      'department_name': currentEmployee.department_detail?.name,
      'unit_name': currentEmployee.unit_detail?.name,
      'job_function_name': currentEmployee.job_function_detail?.name,
      'position_group_name': currentEmployee.position_group_detail?.name,
      'position_group_display_name': currentEmployee.position_group_detail?.display_name,
      'hierarchy_level': currentEmployee.position_group_detail?.hierarchy_level,
      'status_name': currentEmployee.status_detail?.name,
      'status_type': currentEmployee.status_detail?.status_type,
      'status_color': currentEmployee.status_detail?.color,
      
'hiring_date': currentEmployee.hiring_date,
'employment_type_name': currentEmployee.employment_type_detail?.name ||
                        currentEmployee.employment_type?.name,
      'line_manager_name': currentEmployee.line_manager_detail?.name || currentEmployee.line_manager_detail?.full_name,
      'line_manager_id': currentEmployee.line_manager_detail?.id,
      'line_manager_employee_id': currentEmployee.line_manager_detail?.employee_id,
      'contract_duration_display': currentEmployee.contract_duration_display || 
        (currentEmployee.contract_duration === 'PERMANENT' ? 'Permanent' : currentEmployee.contract_duration),
    };
    
    const value = fieldMappings[field];
    return (value === undefined || value === null || value === '') ? fallback : value;
  };

  const handleEditEmployee = () => {
    router.push(`/structure/employee/${id}/edit`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getDisplayName = () => {
    if (currentEmployee.name) return currentEmployee.name;
    if (currentEmployee.full_name) return currentEmployee.full_name;
    const firstName = currentEmployee.first_name || '';
    const lastName = currentEmployee.last_name || '';
    const combined = `${firstName} ${lastName}`.trim();
    return combined || 'Unknown Employee';
  };

  const getEmail = () => {
    return currentEmployee.email || currentEmployee.user?.email || 'No email';
  };

  const toggleSection = (section) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfilePhotoUpdate = (newPhotoUrl) => {
    setCurrentProfilePhoto(newPhotoUrl);
    if (id) {
      fetchEmployee(id);
    }
  };

  const getUrgencyBadgeColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'warning': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      'attention': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      'normal': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    };
    return colors[urgencyLevel] || colors.normal;
  };

  const getProgressBarColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-red-500',
      'warning': 'bg-amber-500',
      'attention': 'bg-orange-500',
      'normal': 'bg-almet-sapphire',
    };
    return colors[urgencyLevel] || colors.normal;
  };



  // Enhanced Info Item Component (keep existing)
  const InfoItem = ({ icon, label, value, isLink, linkPath }) => (
    <div className={`group flex items-start py-2 px-1 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mr-3 transition-all duration-200 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 group-hover:bg-almet-sapphire/20`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-1`}>{label}</p>
        {isLink && linkPath && value !== 'N/A' ? (
          <Link 
            href={linkPath} 
            className={`${textPrimary} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors font-medium break-all text-[10px] flex items-center gap-2 group`}
          >
            {value}
            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : (
          <p className={`${textPrimary} font-medium break-all text-[10px] ${value === 'N/A' ? 'text-gray-400 italic' : ''}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );

  // Collapsible Section Component (keep existing)
  const CollapsibleSection = ({ title, icon, children, sectionKey, defaultExpanded = true }) => {
    const isExpanded = sectionsExpanded[sectionKey] ?? defaultExpanded;
    
    return (
      <div className={`${bgCard} rounded-lg ${shadowClass} overflow-hidden border ${borderColor} transition-all duration-300`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-almet-comet/30 transition-all duration-200 ${borderColor} border-b`}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-almet-sapphire/10 rounded-md">
              {icon}
            </div>
            <h3 className={`${textPrimary} font-semibold text-[10px]`}>{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp size={12} className={`${textMuted} transition-transform duration-200`} />
          ) : (
            <ChevronDown size={12} className={`${textMuted} transition-transform duration-200`} />
          )}
        </button>
        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-3">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // Tab Component
  const TabButton = ({ id, label, icon, isActive, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-xs ${
        isActive
          ? 'bg-almet-sapphire text-white shadow-lg transform scale-105'
          : `${textMuted} hover:text-almet-sapphire hover:bg-almet-sapphire/5 hover:scale-102`
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </button>
  );

  // Loading & Error states (keep existing)
  if (loading.employee) {
    return (
      <div className={`min-h-screen ${bgPrimary}`}>
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <Loader className="w-16 h-16 text-almet-sapphire animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-almet-sapphire/20 rounded-full"></div>
            </div>
            <p className={`${textPrimary} text-lg font-medium mt-4`}>Loading employee details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error.employee || !currentEmployee) {
    return (
      <div className={`min-h-screen ${bgPrimary}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`${bgCard} rounded-xl border border-red-300 dark:border-red-700 p-8 ${shadowClass}`}>
            <div className="flex items-start">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Error Loading Employee</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-4">{error.employee || "Employee not found"}</p>
                <Link href="/structure/headcount-table" className="inline-flex items-center px-6 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 transition-all duration-200 font-semibold text-sm">
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Return to Headcount Table
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPrimary}`}>
      <div className="container mx-auto px-3 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/structure/headcount-table" className={`inline-flex items-center px-3 py-2 ${btnSecondary} rounded-lg transition-all duration-200 text-xs font-medium`}>
                <ChevronLeft size={16} className="mr-1" />
                <span>Back</span>
              </Link>
              
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-almet-comet"></div>
              
              <div>
                <h1 className={`text-base font-bold ${textPrimary} mb-0.5`}>Employee Profile</h1>
                <p className={`${textMuted} text-[10px]`}>Comprehensive employee information</p>
              </div>
            </div>

           
          </div>
        </div>

        {/* Probation Alert Banner */}
        {probationInfo && probationInfo.urgencyLevel === 'critical' && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">
                  Probation Period Ending Soon!
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400 mb-3">
                  Your probation period will end in {probationInfo.daysRemaining} days. Please complete your self-assessment reviews.
                </p>
                {pendingReviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    {pendingReviews.map((review) => (
                      <button
                        key={review.id}
                        onClick={() => {
                          setSelectedReview(review);
                          setShowProbationModal(true);
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium inline-flex items-center gap-2"
                      >
                        <MessageSquare size={12} />
                        Complete {review.review_period.replace('_', '-')} Review
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className={`grid grid-cols-1 ${sidebarCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-4 transition-all duration-300`}>
          
          {/* Sidebar */}
          <div className={`${sidebarCollapsed ? 'hidden' : 'lg:col-span-4 xl:col-span-3'} transition-all duration-300`}>
            <div className={`${bgCard} rounded-lg ${shadowClass} overflow-hidden border ${borderColor} sticky top-4`}>
              
              {/* Profile Header */}
              <div className={`${bgGradient} p-4 text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative z-10">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-all duration-200"
                  >
                    <Minimize2 size={14} className="text-white" />
                  </button>

                  <div className="mb-3">
                    <EmployeeProfilePhotoManager
                      employeeId={id}
                      currentPhotoUrl={currentProfilePhoto}
                      employeeName={getDisplayName()}
                      onPhotoUpdate={handleProfilePhotoUpdate}
                      editable={isOwnProfile}
                      size="lg"
                    />
                  </div>
                  
                  <h1 className="text-sm font-bold text-white mb-1">{getDisplayName()}</h1>
                  <p className="text-white/90 text-[10px] mb-3 line-clamp-2">{getFieldValue('job_title')}</p>
                  
                  <div className="flex justify-center items-center flex-wrap gap-1.5 mb-3">
                    <EmployeeStatusBadge 
                      status={getFieldValue('status_name')} 
                      color={getFieldValue('status_color')}
                    />
                    {currentEmployee.tag_details && currentEmployee.tag_details.map((tag, idx) => (
                      <EmployeeTag key={idx} tag={tag} />
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 text-[9px]">
                    {getFieldValue('employee_id') !== 'N/A' && (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
                        ID: {getFieldValue('employee_id')}
                      </div>
                    )}
                    {getFieldValue('grading_level') !== 'N/A' && (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
                        Grade: {getFieldValue('grading_level')}
                      </div>
                    )}
                    {getFieldValue('start_date') !== 'N/A' && (<div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
                    Since: {formatDate(getFieldValue('start_date'))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Probation Progress */}
          {probationInfo && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                      Probation Period
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getUrgencyBadgeColor(probationInfo.urgencyLevel)}`}>
                    {probationInfo.daysRemaining}d left
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[9px] text-blue-700 dark:text-blue-400 mb-1">
                    <span>{probationInfo.daysCompleted} / {probationInfo.totalProbationDays} days</span>
                    <span className="font-bold">{probationInfo.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${getProgressBarColor(probationInfo.urgencyLevel)}`}
                      style={{ width: `${probationInfo.progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Reviews Summary */}
                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-1 text-blue-700 dark:text-blue-400">
                    <CheckCircle size={10} />
                    <span>{completedReviews.length} Completed</span>
                  </div>
                  {pendingReviews.length > 0 && (
                    <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                      <AlertCircle size={10} />
                      <span>{pendingReviews.length} Pending</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`p-3 border-b ${borderColor}`}>
            <div className="grid grid-cols-1 gap-2">
              {!isOwnProfile && (
                <button
                  onClick={handleEditEmployee}
                  className={`${btnPrimary} px-3 py-2 rounded-md flex items-center justify-center text-[10px] font-semibold`}
                >
                  <Edit size={12} className="mr-1" />
                  Edit Profile
                </button>
              )}
              
              {isOwnProfile && (
                <button
                  onClick={() => setShowResignationModal(true)}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-[10px] font-semibold flex items-center justify-center"
                >
                  <LogOut size={12} className="mr-1" />
                  Submit Resignation
                </button>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-3 space-y-3">
            <CollapsibleSection
              title="Contact Information"
              icon={<Mail size={14} className="text-almet-sapphire" />}
              sectionKey="contact"
            >
              <div className="space-y-1">
                <InfoItem 
                  icon={<Mail size={12} className="text-almet-sapphire" />}
                  label="Email"
                  value={getEmail()}
                  isLink={true}
                  linkPath={`mailto:${getEmail()}`}
                />
                <InfoItem 
                  icon={<Phone size={12} className="text-almet-sapphire" />}
                  label="Phone"
                  value={getFieldValue('phone')}
                  isLink={getFieldValue('phone') !== 'N/A'}
                  linkPath={`tel:${getFieldValue('phone')}`}
                />
                <InfoItem 
                  icon={<Calendar size={12} className="text-almet-sapphire" />}
                  label="Birth Date"
                  value={formatDate(getFieldValue('date_of_birth'))}
                />
                <InfoItem 
                  icon={<MapPin size={12} className="text-almet-sapphire" />}
                  label="Address"
                  value={getFieldValue('address')}
                />
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-9'} transition-all duration-300`}>
        
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className={`${btnPrimary} p-3 rounded-xl mb-6 shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <Maximize2 size={18} />
          </button>
        )}

        {/* Tab Navigation */}
        <div className={`${bgCard} rounded-2xl ${shadowClass} border ${borderColor} mb-6 overflow-hidden`}>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: <User size={16} /> },
                { id: 'job', label: 'Job Details', icon: <Briefcase size={16} /> },
                { 
                  id: 'job-descriptions', 
                  label: 'Job Descriptions', 
                  icon: <ClipboardList size={16} />
                },
                { 
                  id: 'performance', 
                  label: 'Performance', 
                  icon: <TrendingUp size={16} />,
                 
                },
      ...( allProbationReviews.length > 0 ? [{
        id: 'probation-reviews',
        label: 'Probation Reviews',
        icon: <MessageSquare size={16} />,
        badge: pendingReviews.length > 0 ? pendingReviews.length : null
      }] : []),
                { 
                  id: 'assets', 
                  label: 'Assets', 
                  icon: <Package size={16} />
                },
                { id: 'bonuses', label: 'Bonuses', icon: <Wallet size={16} /> },
                { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
                { id: 'activity', label: 'Activity', icon: <Activity size={16} /> }
              ].map((tab) => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  onClick={setActiveTab}
                  badge={tab.badge}
                />
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`${textPrimary} text-lg font-bold`}>Personal Overview</h3>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-medium ${
                        getFieldValue('is_visible_in_org_chart', false)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {getFieldValue('is_visible_in_org_chart', false) ? (
                          <>
                            <Eye className="inline w-3 h-3 mr-1" />
                            Visible in Org Chart
                          </>
                        ) : (
                          <>
                            <EyeOff className="inline w-3 h-3 mr-1" />
                            Hidden from Org Chart
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[
                      { label: 'Full Name', value: getDisplayName(), icon: <User size={14} /> },
                      { label: 'Date of Birth', value: formatDate(getFieldValue('date_of_birth')), icon: <Calendar size={14} /> },
                      { label: 'Gender', value: getFieldValue('gender'), icon: <User size={14} /> },
                      { label: 'Email Address', value: getEmail(), icon: <Mail size={14} /> },
                      { label: 'Phone Number', value: getFieldValue('phone'), icon: <Phone size={14} /> },
                      { label: 'Primary Address', value: getFieldValue('address'), icon: <MapPin size={14} /> },
                      { label: 'Emergency Contact', value: getFieldValue('emergency_contact'), icon: <AlertTriangle size={14} /> }
                    ].map((item, index) => (
                      <div key={index} className={`${bgAccent} rounded-xl p-4 border ${borderColor} hover:shadow-md transition-all duration-200 group`}>
                        <div className="flex items-center mb-3">
                          <div className="p-1.5 bg-almet-sapphire/10 rounded-lg mr-3 group-hover:bg-almet-sapphire/20 transition-colors">
                            {item.icon}
                          </div>
                          <span className={`${textMuted} text-xs font-semibold uppercase tracking-wide`}>{item.label}</span>
                        </div>
                        <p className={`${textPrimary} font-semibold text-xs ${item.value === 'N/A' ? 'text-gray-400 italic text-xs' : ''}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                 {activeTab === 'job' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className={`${textPrimary} text-sm font-bold`}>Job Information</h3>
                        <div className={`px-3 py-1 rounded-lg ${bgAccent} border ${borderColor}`}>
                          <span className={`text-[9px] font-semibold ${textMuted}`}>
                            Employee ID: {getFieldValue('employee_id')}
                          </span>
                        </div>
                      </div>

                      {/* Organizational Structure */}
                      <div className={`${bgCard} rounded-lg border ${borderColor} ${shadowClass} overflow-hidden`}>
                        <div className={`bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 px-4 py-2 border-b ${borderColor}`}>
                          <h4 className={`${textPrimary} font-bold text-xs flex items-center gap-2`}>
                            <Building size={14} className="text-almet-sapphire" />
                            Organizational Structure
                          </h4>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InfoItem 
                              icon={<Building size={12} className="text-almet-sapphire" />}
                              label="Company"
                              value={getFieldValue('business_function_name')}
                            />
                            <InfoItem 
                              icon={<Building size={12} className="text-almet-sapphire" />}
                              label="Department"
                              value={getFieldValue('department_name')}
                            />
                            <InfoItem 
                              icon={<Building size={12} className="text-almet-sapphire" />}
                              label="Unit"
                              value={getFieldValue('unit_name')}
                            />
                            <InfoItem 
                              icon={<Briefcase size={12} className="text-almet-sapphire" />}
                              label="Job Function"
                              value={getFieldValue('job_function_name')}
                            />
                            <InfoItem 
                              icon={<Target size={12} className="text-almet-sapphire" />}
                              label="Hierarchy"
                              value={getFieldValue('position_group_display_name') || getFieldValue('position_group_name')}
                            />
                            <InfoItem 
                              icon={<Award size={12} className="text-almet-sapphire" />}
                              label="Grading Level"
                              value={getFieldValue('grading_level')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Management Structure */}
                      <div className={`${bgCard} rounded-xl border ${borderColor} ${shadowClass} overflow-hidden`}>
                        <div className={`bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 px-4 py-2 border-b ${borderColor}`}>
                          <h4 className={`${textPrimary} font-bold text-xs flex items-center gap-2`}>
                            <Users size={14} className="text-green-600" />
                            Management Structure
                          </h4>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InfoItem 
                              icon={<Users size={12} className="text-green-600" />}
                              label="Line Manager"
                              value={getFieldValue('line_manager_name')}
                              isLink={getFieldValue('line_manager_id') !== 'N/A'}
                              linkPath={getFieldValue('line_manager_id') !== 'N/A' ? 
                                `/structure/employee/${getFieldValue('line_manager_id')}` : "#"}
                            />
                            <InfoItem 
                              icon={<Users size={12} className="text-green-600" />}
                              label="Direct Reports"
                              value={`${currentEmployee?.direct_reports?.length || 0} employees`}
                            />
                            <InfoItem 
                              icon={<User size={12} className="text-green-600" />}
                              label="Manager HC Number"
                              value={getFieldValue('line_manager_employee_id')}
                            />
                            {currentEmployee?.hierarchy_level && (
                              <InfoItem 
                                icon={<LayoutGrid size={12} className="text-green-600" />}
                                label="Hierarchy Level"
                                value={currentEmployee.hierarchy_level}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Employment Details */}
                      <div className={`${bgCard} rounded-xl border ${borderColor} ${shadowClass} overflow-hidden`}>
                        <div className={`bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 px-4 py-2 border-b ${borderColor}`}>
                          <h4 className={`${textPrimary} font-bold text-xs flex items-center gap-2`}>
                            <Calendar size={14} className="text-blue-600" />
                            Employment Timeline
                          </h4>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            <InfoItem 
                              icon={<Calendar size={12} className="text-blue-600" />}
                              label="Start Date"
                              value={formatDate(getFieldValue('start_date'))}
                            />
                            <InfoItem 
                              icon={<Calendar size={12} className="text-blue-600" />}
                              label="End Date"
                              value={formatDate(getFieldValue('end_date'))}
                            />
                            <InfoItem 
                              icon={<Clock size={12} className="text-blue-600" />}
                              label="Contract Duration"
                              value={getFieldValue('contract_duration_display')}
                            />
                            
<InfoItem
  icon={<Calendar size={12} className="text-blue-600" />}
  label="Hiring Date"
  value={formatDate(getFieldValue('hiring_date'))}
/>
<InfoItem
  icon={<Briefcase size={12} className="text-blue-600" />}
  label="Employment Type"
  value={getFieldValue('employment_type_name')}
/>

                            <InfoItem 
                              icon={<TrendingUp size={12} className="text-blue-600" />}
                              label="Years of Service"
                              value={currentEmployee?.years_of_service ? `${currentEmployee.years_of_service} years` : 'N/A'}
                            />
                            <InfoItem 
                              icon={<Calendar size={12} className="text-blue-600" />}
                              label="Contract Start"
                              value={formatDate(getFieldValue('contract_start_date'))}
                            />
                            <InfoItem 
                              icon={<Calendar size={12} className="text-blue-600" />}
                              label="Contract End"
                              value={formatDate(getFieldValue('contract_end_date'))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status Information */}
                      <div className={`${bgCard} rounded-xl border ${borderColor} ${shadowClass} overflow-hidden`}>
                        <div className={`bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 px-4 py-2 border-b ${borderColor}`}>
                          <h4 className={`${textPrimary} font-bold text-xs flex items-center gap-2`}>
                            <AlertCircle size={14} className="text-purple-600" />
                            Status & Visibility
                          </h4>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InfoItem 
                              icon={<AlertCircle size={12} className="text-purple-600" />}
                              label="Employment Status"
                              value={getFieldValue('status_name')}
                            />
                            <InfoItem 
                              icon={<Settings size={12} className="text-purple-600" />}
                              label="Status Type"
                              value={getFieldValue('status_type')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

              {/* Job Descriptions Tab */}
              {activeTab === 'job-descriptions' && (
                <div className="space-y-6">
                  <EmployeeDetailJobDescriptions 
                    employeeId={id} 
                    isManager={isManager}
                  />
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
               
                  <EmployeeDetailPerformance 
                    employeeId={id} 
                    isOwnProfile={isOwnProfile}
                    darkMode={darkMode}
                    currentUser={currentUser}
                    employeeData={currentEmployee}
                    isManager={isManager}
                  />
                </div>
              )}

              {activeTab === 'probation-reviews' && (
  <div className="space-y-6">


    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs ${textMuted} mb-1`}>Total Reviews</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>{allProbationReviews.length}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs ${textMuted} mb-1`}>Pending</p>
            <p className={`text-2xl font-bold text-amber-600 dark:text-amber-400`}>{pendingReviews.length}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Clock size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs ${textMuted} mb-1`}>Completed</p>
            <p className={`text-2xl font-bold text-green-600 dark:text-green-400`}>{completedReviews.length}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>
    </div>

    {/* Filter Buttons */}
    <div className={`${bgCard} rounded-lg border ${borderColor} p-3`}>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveReviewFilter('all')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeReviewFilter === 'all'
              ? 'bg-almet-sapphire text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Reviews ({allProbationReviews.length})
        </button>
        <button
          onClick={() => setActiveReviewFilter('employee')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeReviewFilter === 'employee'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Employee Review
        </button>
        <button
          onClick={() => setActiveReviewFilter('manager')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeReviewFilter === 'manager'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Manager Reviews
        </button>
      </div>
    </div>

    {/* Reviews List */}
    <div className="space-y-3">
      {getFilteredReviews().length === 0 ? (
        <div className={`${bgCard} rounded-lg border ${borderColor} p-12 text-center`}>
          <MessageSquare size={48} className={`mx-auto ${textMuted} mb-3`} />
          <h4 className={`text-lg font-bold ${textPrimary} mb-2`}>No Reviews Found</h4>
          <p className={`text-sm ${textMuted}`}>
            {activeReviewFilter === 'all' 
              ? 'No probation reviews available yet'
              : activeReviewFilter === 'employee'
              ? 'No employee self-assessments completed yet'
              : 'No manager reviews completed yet'}
          </p>
        </div>
      ) : (
        getFilteredReviews().map((review) => {
   
          const hasEmployeeResponse = review.employee_responses && review.employee_responses.length > 0;
          const hasManagerResponse = review.manager_responses && review.manager_responses.length > 0;
          
          //  Can employee complete self-assessment?
          const canEmployeeComplete =  !hasEmployeeResponse;
          
          //  Can view employee responses?
          const canViewEmployeeResponse = hasEmployeeResponse;
          
          //  Can view manager responses?
          const canViewManagerResponse = hasManagerResponse;
          
          return (
            <div
              key={review.id}
              className={`${bgCard} rounded-lg border-2 p-4 hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                
                  <div>
                    <h4 className={`text-sm font-semibold ${textPrimary}`}>
                      {review.review_period.replace('_', '-')} Review
                    </h4>
               
                  </div>
                </div>

              
              </div>

              {/* Response Status */}
              <div className="flex items-center gap-4 mb-3 text-xs">
                <div className={`flex items-center gap-1 ${hasEmployeeResponse ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  {hasEmployeeResponse ? (
                    <CheckCircle size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  <span>Onboarding Review</span>
                </div>
                <div className={`flex items-center gap-1 ${hasManagerResponse ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  {hasManagerResponse ? (
                    <CheckCircle size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  <span>Manager Review</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                {/*  Employee can complete self-assessment if pending and not submitted */}
                {canEmployeeComplete && (
  <button
    onClick={() => {
      setSelectedReview(review);
      setRespondentType('EMPLOYEE');
      setShowProbationModal(true);
    }}
    className="w-full px-3 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-medium flex items-center justify-center gap-2"
  >
                    <MessageSquare size={12} />
                    Add Review
                  </button>
                )}
                
                {/*  View employee responses */}
{canViewEmployeeResponse && (
  <button
    onClick={() => {
      setSelectedReview(review); // Əvvəlcə review-ı set et
      setRespondentType('EMPLOYEE'); // Sonra respondent type set et
      setShowProbationModal(true);
    }}
    className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-xs font-medium flex items-center justify-center gap-2"
  >
    <Eye size={12} />
    View My Assessment
  </button>
)}

{/*  View manager responses */}
{canViewManagerResponse && (
  <button
    onClick={() => {
  
      setSelectedReview(review);
      setRespondentType('MANAGER');
      setShowProbationModal(true);
    }}
    className="flex-1 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-xs font-medium flex items-center justify-center gap-2"
  >
    <Eye size={12} />
    View Manager's Review
  </button>
)}
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
)}

              {/* Assets Tab */}
              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`${textPrimary} text-lg font-bold`}>Asset Management</h3>
                    <div className={`px-4 py-2 rounded-xl ${bgAccent} border ${borderColor} flex items-center gap-2`}>
                      <Package size={16} className="text-almet-sapphire" />
                      <span className={`text-xs font-semibold ${textMuted}`}>
                        Assigned Assets
                      </span>
                    </div>
                  </div>
                  <EmployeeAssetManagement 
                    employeeId={id} 
                    employeeData={currentEmployee}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {/* Bonuses Tab */}
              {activeTab === 'bonuses' && (() => {
                const fmtMoney = v => parseFloat(v || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const statusColors = {
                  APPROVED:   darkMode ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200",
                  PAID:       darkMode ? "bg-violet-500/15 text-violet-400 border border-violet-500/20"   : "bg-violet-50 text-violet-700 border border-violet-200",
                  CALCULATED: darkMode ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"         : "bg-blue-50 text-blue-700 border border-blue-200",
                  DRAFT:      darkMode ? "bg-slate-700/50 text-slate-400 border border-slate-600"         : "bg-gray-100 text-gray-500 border border-gray-200",
                };
                const currencySymbols = { AZN: "₼", USD: "$", EUR: "€", GBP: "£", TRY: "₺" };
                const hasAny = bonusRecords.length > 0 || siRecords.length > 0;

                return (
                  <div className="space-y-6">
                    <h3 className={`${textPrimary} text-lg font-bold`}>Bonus History</h3>

                    {bonusLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="w-7 h-7 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : !hasAny ? (
                      <div className={`${bgCard} rounded-2xl border ${borderColor} p-12 text-center ${shadowClass}`}>
                        <div className={`inline-flex p-4 rounded-2xl mb-4 ${darkMode ? "bg-almet-comet/30" : "bg-almet-mystic"}`}>
                          <Wallet size={28} className="text-almet-steel-blue" />
                        </div>
                        <p className={`font-bold ${textPrimary}`}>No bonus records</p>
                        <p className={`text-sm mt-1 ${textMuted}`}>Approved bonuses will appear here.</p>
                      </div>
                    ) : (
                      <>
                        {/* ── Annual Performance Bonus ── */}
                        {bonusRecords.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-2 h-2 rounded-full bg-almet-sapphire`} />
                              <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Annual Performance Bonus</p>
                            </div>
                            <div className="space-y-3">
                              {bonusRecords
                                .sort((a, b) => (b.bonus_year_label || b.bonus_year || 0) - (a.bonus_year_label || a.bonus_year || 0))
                                .map(r => {
                                  const isApproved   = r.status === "APPROVED" || r.status === "PAID";
                                  const sym          = currencySymbols[r.salary_currency] || r.salary_currency || "₼";
                                  const isExpanded   = expandedBonusId === r.id;
                                  const detail       = bonusDetailMap[r.id];
                                  const isLoadingDet = loadingDetailId === r.id;

                                  const handleToggleDetail = async () => {
                                    if (isExpanded) { setExpandedBonusId(null); return; }
                                    setExpandedBonusId(r.id);
                                    if (!bonusDetailMap[r.id]) {
                                      setLoadingDetailId(r.id);
                                      try {
                                        const { data } = await bonusRecordService.detail(r.id);
                                        setBonusDetailMap(prev => ({ ...prev, [r.id]: data }));
                                      } catch { /* silent */ }
                                      finally { setLoadingDetailId(null); }
                                    }
                                  };

                                  const BreakdownTable = ({ items, color }) => {
                                    if (!items?.length) return <p className={`text-xs ${textMuted} py-2`}>No breakdown available.</p>;
                                    return (
                                      <div className="space-y-1.5">
                                        {items.map((item, i) => (
                                          <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl
                                            ${darkMode ? "bg-white/[0.03] border border-white/[0.06]" : "bg-white border border-gray-100"}`}>
                                            <span className={`text-xs font-semibold flex-1 min-w-0 truncate ${textPrimary}`}>
                                              {item.target_name || item.objective_name || item.competency_name || item.group_name || `Item ${i+1}`}
                                            </span>
                                            {item.weight_pct != null && (
                                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0
                                                ${darkMode ? "bg-white/[0.06] text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                                {item.weight_pct}%
                                              </span>
                                            )}
                                            {item.rating_name && (
                                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0
                                                ${darkMode ? "bg-almet-sapphire/15 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"}`}>
                                                {item.rating_name}
                                              </span>
                                            )}
                                            {item.bonus_salary_pct != null && (
                                              <span className={`text-[10px] ${textMuted} shrink-0`}>{item.bonus_salary_pct}%</span>
                                            )}
                                            <span className={`text-xs font-bold tabular-nums shrink-0 ${color}`}>
                                              {sym}{fmtMoney(item.bonus_amount)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  };

                                  return (
                                    <div key={r.id} className={`${bgCard} rounded-2xl border ${borderColor} overflow-hidden ${shadowClass}`}>
                                      <div className="p-5">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                          <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${darkMode ? "bg-almet-sapphire/15" : "bg-almet-mystic"}`}>
                                              <DollarSign size={16} className="text-almet-steel-blue" />
                                            </div>
                                            <div>
                                              <p className={`font-bold text-sm ${textPrimary}`}>
                                                {r.bonus_year_label ? `${r.bonus_year_label} Bonus Year` : `Bonus Year #${r.bonus_year}`}
                                              </p>
                                              <p className={`text-xs mt-0.5 ${textMuted}`}>
                                                {r.salary_currency && r.salary_currency !== "AZN" ? r.salary_currency + " · " : ""}
                                                Effective salary: {sym}{fmtMoney(r.effective_salary)}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[r.status] || statusColors.DRAFT}`}>
                                              {r.status}
                                            </span>
                                            {isApproved && (
                                              <div className="text-right">
                                                <p className={`text-xs ${textMuted}`}>Total Bonus</p>
                                                <p className="text-lg font-bold text-emerald-500 tabular-nums">
                                                  {sym}{fmtMoney(r.total_bonus)}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {isApproved && (
                                          <div className="grid grid-cols-3 gap-2 mt-4">
                                            {[
                                              { label: "Company Targets", value: r.company_targets_bonus, color: "text-almet-steel-blue" },
                                              { label: "Objectives",       value: r.objectives_bonus,      color: "text-amber-500" },
                                              { label: "Competencies",     value: r.competencies_bonus,    color: "text-violet-500" },
                                            ].map(({ label, value, color }) => (
                                              <div key={label} className={`p-3 rounded-xl text-center ${darkMode ? "bg-almet-comet/20" : "bg-almet-mystic/50 border border-gray-100"}`}>
                                                <p className={`text-[10px] ${textMuted} mb-1`}>{label}</p>
                                                <p className={`text-sm font-bold tabular-nums ${color}`}>{sym}{fmtMoney(value)}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        <div className="flex items-center justify-between mt-3">
                                          {r.approved_at ? (
                                            <p className={`text-[10px] ${textMuted}`}>
                                              Approved: {new Date(r.approved_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                                            </p>
                                          ) : <span />}
                                          {isApproved && (
                                            <button onClick={handleToggleDetail}
                                              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition
                                                ${isExpanded
                                                  ? darkMode ? "bg-almet-sapphire/20 text-almet-steel-blue" : "bg-almet-mystic text-almet-sapphire"
                                                  : darkMode ? "text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]" : "text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic"}`}>
                                              {isLoadingDet
                                                ? <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" /> Loading…</>
                                                : isExpanded ? <>▲ Hide Details</> : <>▼ View Details</>}
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Expanded detail breakdown */}
                                      {isExpanded && (
                                        <div className={`border-t px-5 py-4 space-y-5
                                          ${darkMode ? "border-white/[0.06] bg-[#080a10]" : "border-gray-100 bg-gray-50/60"}`}>
                                          {isLoadingDet ? (
                                            <div className="flex justify-center py-6">
                                              <div className="w-5 h-5 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
                                            </div>
                                          ) : detail ? (
                                            <>
                                              {detail.company_targets_breakdown?.length > 0 && (
                                                <div>
                                                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 text-almet-steel-blue`}>Company Targets</p>
                                                  <BreakdownTable items={detail.company_targets_breakdown} color="text-almet-steel-blue" />
                                                </div>
                                              )}
                                              {detail.objectives_breakdown?.length > 0 && (
                                                <div>
                                                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 text-amber-500`}>Objectives</p>
                                                  <BreakdownTable items={detail.objectives_breakdown} color="text-amber-500" />
                                                </div>
                                              )}
                                              {detail.competencies_breakdown?.length > 0 && (
                                                <div>
                                                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 text-violet-500`}>Competencies</p>
                                                  <BreakdownTable items={detail.competencies_breakdown} color="text-violet-500" />
                                                </div>
                                              )}
                                              {detail.notes && (
                                                <p className={`text-xs italic ${textMuted}`}>{detail.notes}</p>
                                              )}
                                            </>
                                          ) : (
                                            <p className={`text-xs text-center py-4 ${textMuted}`}>No detail available.</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* ── Sales Incentive Bonus ── */}
                        {siRecords.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-2 h-2 rounded-full bg-amber-500`} />
                              <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Sales Incentive Bonus</p>
                            </div>
                            <div className="space-y-3">
                              {siRecords
                                .sort((a, b) => new Date(b.approved_at || b.calculated_at || 0) - new Date(a.approved_at || a.calculated_at || 0))
                                .map(r => {
                                  const isApproved = r.status === "APPROVED" || r.status === "PAID";
                                  return (
                                    <div key={r.id} className={`${bgCard} rounded-2xl border ${borderColor} p-5 ${shadowClass}`}>
                                      <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex items-center gap-3">
                                          <div className={`p-2.5 rounded-xl ${darkMode ? "bg-amber-500/15" : "bg-amber-50"}`}>
                                            <TrendingUp size={16} className="text-amber-500" />
                                          </div>
                                          <div>
                                            <p className={`font-bold text-sm ${textPrimary}`}>{r.period_name || `Period #${r.period}`}</p>
                                            <p className={`text-xs mt-0.5 ${textMuted}`}>
                                              Monthly salary: ₼{fmtMoney(r.monthly_salary)}
                                              {r.payroll_impact_pct != null ? ` · Impact: ${parseFloat(r.payroll_impact_pct).toFixed(1)}%` : ""}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[r.status] || statusColors.DRAFT}`}>
                                            {r.status}
                                          </span>
                                          {isApproved && (
                                            <div className="text-right">
                                              <p className={`text-xs ${textMuted}`}>Total Bonus</p>
                                              <p className="text-lg font-bold text-emerald-500 tabular-nums">
                                                ₼{fmtMoney(r.total_bonus)}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {isApproved && r.employee_pool_portion != null && (
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                          {[
                                            { label: "Company Bonus Pool", value: r.company_bonus_pool, color: "text-almet-steel-blue" },
                                            { label: "Employee Portion",   value: r.employee_pool_portion, color: "text-amber-500" },
                                          ].map(({ label, value, color }) => (
                                            <div key={label} className={`p-3 rounded-xl text-center ${darkMode ? "bg-almet-comet/20" : "bg-amber-50/50 border border-amber-100"}`}>
                                              <p className={`text-[10px] ${textMuted} mb-1`}>{label}</p>
                                              <p className={`text-sm font-bold tabular-nums ${color}`}>₼{fmtMoney(value)}</p>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {r.approved_at && (
                                        <p className={`text-[10px] mt-3 ${textMuted}`}>
                                          Approved: {new Date(r.approved_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                      )}
                                      {r.status !== "DRAFT" && (
                                        <div className="mt-3 flex justify-end">
                                          <button
                                            onClick={async () => {
                                              setSiDetailModal({ record: r, detail: null });
                                              setSiDetailLoading(true);
                                              try {
                                                const { data } = await siCalcService.detail(r.id);
                                                setSiDetailModal({ record: r, detail: data });
                                              } finally { setSiDetailLoading(false); }
                                            }}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border
                                              ${darkMode ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10" : "border-amber-200 text-amber-600 hover:bg-amber-50"}`}>
                                            <Eye size={12} /> View Details
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  {/* ── SI Detail Modal ── */}
                  {siDetailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                      onClick={() => setSiDetailModal(null)}>
                      <div
                        onClick={e => e.stopPropagation()}
                        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col
                          ${darkMode ? "bg-almet-san-juan border-almet-comet" : "bg-white border-gray-200"}`}>
                        {/* Header */}
                        <div className={`px-5 py-4 border-b flex items-center justify-between
                          ${darkMode ? "border-almet-comet bg-almet-cloud-burst/50" : "border-gray-100 bg-amber-50"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${darkMode ? "bg-amber-500/15" : "bg-amber-100"}`}>
                              <TrendingUp size={16} className="text-amber-500" />
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${textPrimary}`}>
                                {siDetailModal.record.period_name || `Period #${siDetailModal.record.period}`}
                              </p>
                              <p className={`text-xs ${textMuted}`}>Sales Incentive Bonus — Detail</p>
                            </div>
                          </div>
                          <button onClick={() => setSiDetailModal(null)}
                            className={`p-1.5 rounded-lg transition ${darkMode ? "text-gray-400 hover:text-white hover:bg-almet-comet" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
                            ✕
                          </button>
                        </div>
                        {/* Body */}
                        <div className="overflow-y-auto p-5 space-y-4">
                          {siDetailLoading || !siDetailModal.detail ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (() => {
                            const d = siDetailModal.detail;
                            const fmtV = v => parseFloat(v || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            return (
                              <>
                                {/* Summary */}
                                <div className={`grid grid-cols-2 gap-3`}>
                                  {[
                                    { label: "Monthly Salary", value: `₼${fmtV(d.monthly_salary)}`,       color: textPrimary },
                                    { label: "Total Salary",   value: `₼${fmtV(d.total_salary)}`,         color: textPrimary },
                                    { label: "Company Pool",   value: `₼${fmtV(d.company_bonus_pool)}`,   color: "text-almet-steel-blue" },
                                    { label: "Your Portion",   value: `₼${fmtV(d.employee_pool_portion)}`, color: "text-amber-500" },
                                  ].map(({ label, value, color }) => (
                                    <div key={label} className={`p-3 rounded-xl text-center border ${darkMode ? "bg-almet-comet/20 border-almet-comet" : "bg-gray-50 border-gray-100"}`}>
                                      <p className={`text-[10px] ${textMuted} mb-1`}>{label}</p>
                                      <p className={`text-sm font-bold ${color}`}>{value}</p>
                                    </div>
                                  ))}
                                </div>
                                {/* Total */}
                                <div className={`flex items-center justify-between p-4 rounded-xl border
                                  ${darkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}>
                                  <span className={`text-sm font-semibold ${textPrimary}`}>Total Bonus</span>
                                  <span className="text-xl font-bold text-emerald-500">₼{fmtV(d.total_bonus)}</span>
                                </div>
                                {/* Company KPI Results */}
                                {d.company_kpi_results?.length > 0 && (
                                  <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Company KPI Results</p>
                                    <div className="space-y-1.5">
                                      {d.company_kpi_results.map((kpi, i) => (
                                        <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg
                                          ${darkMode ? "bg-almet-comet/20" : "bg-gray-50"}`}>
                                          <span className={`text-xs ${textPrimary}`}>{kpi.kpi_name}</span>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-xs ${textMuted}`}>{kpi.achievement_pct != null ? `${(parseFloat(kpi.achievement_pct)*100).toFixed(0)}%` : "—"}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                                              ${darkMode ? "bg-almet-sapphire/15 text-almet-steel-blue" : "bg-blue-50 text-blue-700"}`}>
                                              {kpi.rating_label || "—"}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* Individual KPI Results */}
                                {d.individual_kpi_results?.length > 0 && (
                                  <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Individual KPI Results</p>
                                    <div className="space-y-1.5">
                                      {d.individual_kpi_results.map((kpi, i) => (
                                        <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg
                                          ${darkMode ? "bg-almet-comet/20" : "bg-gray-50"}`}>
                                          <span className={`text-xs ${textPrimary}`}>{kpi.kpi_name}</span>
                                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold
                                            ${kpi.band_label === 'E++' ? (darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700")
                                              : kpi.band_label === 'E+' ? (darkMode ? "bg-sky-500/15 text-sky-400" : "bg-sky-50 text-sky-700")
                                              : kpi.band_label === 'E'  ? (darkMode ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-700")
                                              : (darkMode ? "bg-rose-500/15 text-rose-400" : "bg-rose-50 text-rose-700")}`}>
                                            {kpi.final_rating || kpi.band_label || "—"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })()}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <EmployeeDocumentManager 
                    employeeId={id} 
                    employeeData={currentEmployee}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`${textPrimary} text-lg font-bold`}>Recent Activity</h3>
                    <div className={`px-4 py-2 rounded-xl ${bgAccent} border ${borderColor} flex items-center gap-2`}>
                      <Activity size={16} className="text-almet-sapphire" />
                      <span className={`text-xs font-semibold ${textMuted}`}>
                        Activity Timeline
                      </span>
                    </div>
                  </div>
                  
                  {currentEmployee.activities && currentEmployee.activities.length > 0 ? (
                    <div className="space-y-4">
                      {currentEmployee.activities.map((activity, index) => (
                        <div key={activity.id} className={`${bgCard} rounded-xl border ${borderColor} p-6 ${shadowClass} hover:shadow-lg transition-all duration-300`}>
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-almet-sapphire rounded-xl text-white flex-shrink-0">
                              <Activity size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className={`${textPrimary} font-semibold text-sm mb-1`}>
                                    {activity.activity_type}
                                  </h4>
                                  <p className={`${textSecondary} text-xs mb-3 leading-relaxed`}>
                                    {activity.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span className={`${textMuted} flex items-center gap-1`}>
                                      <User size={14} />
                                      {activity.performed_by_name}
                                    </span>
                                    <span className={`${textMuted} flex items-center gap-1`}>
                                      <Clock size={14} />
                                      {formatDate(activity.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <div className={`text-[10px] ${textMuted} bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full`}>
                                  #{index + 1}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`${bgAccent} rounded-2xl p-12 text-center border ${borderColor}`}>
                      <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                        <Activity size={32} className={`${textMuted}`} />
                      </div>
                      <h4 className={`text-lg font-bold ${textPrimary} mb-2`}>No Recent Activity</h4>
                      <p className={`${textMuted} text-sm`}>
                        No activities have been recorded for this employee yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

        {getFieldValue('notes') !== 'N/A' && (
          <div className={`${bgCard} rounded-2xl ${shadowClass} border ${borderColor} p-8 mt-8`}>
            <h3 className={`${textPrimary} text-lg font-bold mb-4 flex items-center gap-3`}>
              <FileText size={20} className="text-almet-sapphire" />
              Additional Notes
            </h3>
            <div className={`${bgAccent} rounded-xl p-6 border ${borderColor}`}>
              <p className={`${textSecondary} text-sm leading-relaxed`}>
                {getFieldValue('notes')}
              </p>
            </div>
          </div>
        )}

        {/* Direct Reports Section */}
        {currentEmployee.direct_reports && currentEmployee.direct_reports.length > 0 && (
          <div className={`${bgCard} rounded-2xl ${shadowClass} border ${borderColor} p-4 mt-8`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${textPrimary} text-sm font-bold flex items-center gap-3`}>
                <Users size={16} className="text-green-600" />
                Direct Reports
                <span className="text-sm font-normal text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  {currentEmployee.direct_reports.length}
                </span>
              </h3>
              <Link
                href={`/structure/org-structure/`}
                className={`${btnSecondary} px-2 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-200`}
              >
                <LayoutGrid size={16} />
                View in Org Chart
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentEmployee.direct_reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/structure/employee/${report.id}`}
                  className={`${bgAccent} rounded-xl p-2 hover:shadow-lg transition-all duration-300 border ${borderColor} group block`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`${textPrimary} font-semibold text-sm truncate group-hover:text-almet-sapphire transition-colors mb-1`}>
                        {report.name}
                      </h4>
                      <p className={`${textMuted} text-xs truncate mb-1`}>{report.job_title}</p>
                      <p className={`${textMuted} text-[10px] flex items-center gap-1`}>
                        <span>ID: {report.employee_id}</span>
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
</p>
</div>
</div>
</Link>
))}
</div>
</div>
)}

    {showResignationModal && isOwnProfile && (
      <ResignationSubmissionModal
        onClose={() => setShowResignationModal(false)}
        onSuccess={() => {
          setShowResignationModal(false);
          alert('Resignation submitted successfully!');
        }}
        currentEmployee={currentEmployee}
      />
    )}

    {showProbationModal && selectedReview && (
      <ProbationReviewModal
        review={selectedReview}
        onClose={() => {
          setShowProbationModal(false);
          setSelectedReview(null);
        }}
        onSuccess={() => {
          setShowProbationModal(false);
          setSelectedReview(null);
          loadProbationData();
        }}
        respondentType={respondentType}  //  state-dən istifadə edir
        viewMode={
          (respondentType === 'EMPLOYEE' && selectedReview.employee_responses?.length > 0) ||
          (respondentType === 'MANAGER' && selectedReview.manager_responses?.length > 0)
        }
      />
    )}
  </div>
</div>
);
};
export default function EmployeeDetailPage() {
return (
<DashboardLayout>
<Provider store={store}>
<EmployeeDetailPageContent />
</Provider>
</DashboardLayout>
);
}