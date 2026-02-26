// src/app/structure/employee/[id]/page.jsx - Complete with Profile Photo Management
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "../../../../store";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
  Download, 
  UserX, 
  AlertCircle,
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
  const [deleting, setDeleting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState(null);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    contact: true,
    organization: true,
    employment: true,
    status: true
  });

  // Theme-dependent classes with Almet colors and simplified design
  const bgPrimary = darkMode ? "bg-almet-cloud-burst" : "bg-almet-mystic";
  const bgCard = darkMode ? "bg-almet-san-juan" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-comet" : "bg-gray-50";
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

  // Current date and time
  const currentDateTime = new Date().toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Baku'
  });

  // Check if user is a manager
  const isManager = currentEmployee?.direct_reports && currentEmployee.direct_reports.length > 0;

  // Fetch employee data
  useEffect(() => {
    if (id) {
      fetchEmployee(id);
    }
    
    return () => {
      clearCurrentEmployee();
    };
  }, [id, fetchEmployee, clearCurrentEmployee]);

  // Update profile photo state when employee data changes
  useEffect(() => {
    if (currentEmployee) {
      setCurrentProfilePhoto(
        currentEmployee.profile_image || 
        currentEmployee.profile_image_url || 
        null
      );
    }
  }, [currentEmployee]);

  // Enhanced field getters
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
      'business_function_code': currentEmployee.business_function_detail?.code,
      'department_name': currentEmployee.department_detail?.name,
      'unit_name': currentEmployee.unit_detail?.name,
      'job_function_name': currentEmployee.job_function_detail?.name,
      'position_group_name': currentEmployee.position_group_detail?.name,
      'position_group_display_name': currentEmployee.position_group_detail?.display_name,
      'hierarchy_level': currentEmployee.position_group_detail?.hierarchy_level,
      'status_name': currentEmployee.status_detail?.name,
      'status_type': currentEmployee.status_detail?.status_type,
      'status_color': currentEmployee.status_detail?.color,
      'line_manager_name': currentEmployee.line_manager_detail?.name || currentEmployee.line_manager_detail?.full_name,
      'line_manager_id': currentEmployee.line_manager_detail?.id,
      'line_manager_employee_id': currentEmployee.line_manager_detail?.employee_id,
      'contract_duration_display': currentEmployee.contract_duration_display || 
        (currentEmployee.contract_duration === 'PERMANENT' ? 'Permanent' : currentEmployee.contract_duration),
    };
    
    const value = fieldMappings[field];
    return (value === undefined || value === null || value === '') ? fallback : value;
  };

  // Handler functions
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

  // Handle profile photo update
  const handleProfilePhotoUpdate = (newPhotoUrl) => {
    setCurrentProfilePhoto(newPhotoUrl);
    // Optionally refresh employee data
    if (id) {
      fetchEmployee(id);
    }
  };

  // Enhanced Info Item Component
  const InfoItem = ({ icon, label, value, isLink, linkPath }) => (
    <div className={`group flex items-start py-2 px-1 rounded-lg transition-all duration-200 ${'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mr-3 transition-all duration-200 ${'bg-almet-sapphire/10 dark:bg-almet-sapphire/20 group-hover:bg-almet-sapphire/20'}`}>
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
            <ExternalLink size={12} className="opacity-0 mr group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : (
          <p className={`${textPrimary} font-medium break-all text-[10px] ${value === 'N/A' ? 'text-gray-400 italic' : ''}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );

  // Collapsible Section Component
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

  // Tab Component with enhanced styling
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

  // Loading state
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
            <p className={`${textMuted} text-sm mt-2`}>Please wait while we fetch the information</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error.employee || !currentEmployee) {
    return (
      <div className={`min-h-screen ${bgPrimary}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`${bgCard} rounded-xl border border-red-300 dark:border-red-700 p-8 ${shadowClass}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                  Error Loading Employee
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                  {error.employee || "Employee not found"}
                </p>
                <Link
                  href="/structure/headcount-table"
                  className="inline-flex items-center px-6 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200 font-semibold text-sm"
                >
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
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/structure/headcount-table"
                className={`inline-flex items-center px-3 py-2 ${btnSecondary} rounded-lg transition-all duration-200 text-xs font-medium`}
              >
                <ChevronLeft size={16} className="mr-1" />
                <span>Back</span>
              </Link>
              
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-almet-comet"></div>
              
              <div>
                <h1 className={`text-base font-bold ${textPrimary} mb-0.5`}>Employee Details</h1>
                <p className={`${textMuted} text-[10px]`}>Employee information and management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout - Responsive Grid */}
        <div className={`grid grid-cols-1 ${sidebarCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-4 transition-all duration-300`}>
          
          {/* Sidebar - Employee Profile */}
          <div className={`${sidebarCollapsed ? 'hidden' : 'lg:col-span-4 xl:col-span-3'} transition-all duration-300`}>
            <div className={`${bgCard} rounded-lg ${shadowClass} overflow-hidden border ${borderColor} sticky top-4`}>
              
              {/* Enhanced Profile Header */}
              <div className={`${bgGradient} p-4 text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative z-10">
                  {/* Sidebar Toggle */}
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-all duration-200"
                  >
                    <Minimize2 size={14} className="text-white" />
                  </button>

                  {/* Profile Image with Photo Manager */}
                  <div className="mb-3">
                    <EmployeeProfilePhotoManager
                      employeeId={id}
                      currentPhotoUrl={currentProfilePhoto}
                      employeeName={getDisplayName()}
                      onPhotoUpdate={handleProfilePhotoUpdate}
                      editable={true}
                      size="lg"
                    />
                  </div>
                  
                  {/* Name and Title */}
                  <h1 className="text-sm font-bold text-white mb-1">{getDisplayName()}</h1>
                  <p className="text-white/90 text-[10px] mb-3 line-clamp-2">{getFieldValue('job_title')}</p>
                  
                  {/* Status and Tags */}
                  <div className="flex justify-center items-center flex-wrap gap-1.5 mb-3">
                    <EmployeeStatusBadge 
                      status={getFieldValue('status_name')} 
                      color={getFieldValue('status_color')}
                    />
                    {currentEmployee.tag_details && currentEmployee.tag_details.map((tag, idx) => (
                      <EmployeeTag key={idx} tag={tag} />
                    ))}
                  </div>

                  {/* Quick Info Badges */}
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
                    {getFieldValue('start_date') !== 'N/A' && (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
                        Since: {formatDate(getFieldValue('start_date'))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className={`p-3 border-b ${borderColor}`}>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={handleEditEmployee}
                    className={`${btnPrimary} px-3 py-2 rounded-md flex items-center justify-center text-[10px] font-semibold`}
                  >
                    <Edit size={12} className="mr-1" />
                    Edit
                  </button>
                 
                </div>
              </div>

              {/* Collapsible Information Sections */}
              <div className="p-3 space-y-3">
                {/* Contact Information */}
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

          {/* Main Content Area */}
          <div className={`${sidebarCollapsed ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-9'} transition-all duration-300`}>
            
            {/* Sidebar Toggle Button (when collapsed) */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className={`${btnPrimary} p-3 rounded-xl mb-6 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <Maximize2 size={18} />
              </button>
            )}

            {/* Enhanced Tab Navigation */}
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
  badge: currentEmployee?.pending_performance_actions?.has_pending_actions ? 
    currentEmployee.pending_performance_actions.actions.length : null
},
                    { 
                      id: 'assets', 
                      label: 'Assets', 
                      icon: <Package size={16} />
                    },
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

              {/* Tab Content with Enhanced Styling */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="p-6">
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
                            <Users size={20} className="text-green-600" />
                            Management Structure
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem 
                              icon={<Users size={16} className="text-green-600" />}
                              label="Line Manager"
                              value={getFieldValue('line_manager_name')}
                              isLink={getFieldValue('line_manager_id') !== 'N/A'}
                              linkPath={getFieldValue('line_manager_id') !== 'N/A' ? 
                                `/structure/employee/${getFieldValue('line_manager_id')}` : "#"}
                            />
                            <InfoItem 
                              icon={<Users size={16} className="text-green-600" />}
                              label="Direct Reports"
                              value={`${currentEmployee?.direct_reports?.length || 0} employees`}
                            />
                            <InfoItem 
                              icon={<User size={16} className="text-green-600" />}
                              label="Manager HC Number"
                              value={getFieldValue('line_manager_employee_id')}
                            />
                            {currentEmployee?.hierarchy_level && (
                              <InfoItem 
                                icon={<LayoutGrid size={16} className="text-green-600" />}
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
                            <Calendar size={20} className="text-blue-600" />
                            Employment Timeline
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <InfoItem 
                              icon={<Calendar size={16} className="text-blue-600" />}
                              label="Start Date"
                              value={formatDate(getFieldValue('start_date'))}
                            />
                            <InfoItem 
                              icon={<Calendar size={16} className="text-blue-600" />}
                              label="End Date"
                              value={formatDate(getFieldValue('end_date'))}
                            />
                            <InfoItem 
                              icon={<Clock size={16} className="text-blue-600" />}
                              label="Contract Duration"
                              value={getFieldValue('contract_duration_display')}
                            />
                            <InfoItem 
                              icon={<TrendingUp size={16} className="text-blue-600" />}
                              label="Years of Service"
                              value={currentEmployee?.years_of_service ? `${currentEmployee.years_of_service} years` : 'N/A'}
                            />
                            <InfoItem 
                              icon={<Calendar size={16} className="text-blue-600" />}
                              label="Contract Start"
                              value={formatDate(getFieldValue('contract_start_date'))}
                            />
                            <InfoItem 
                              icon={<Calendar size={16} className="text-blue-600" />}
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
                            <AlertCircle size={20} className="text-purple-600" />
                            Status & Visibility
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem 
                              icon={<AlertCircle size={16} className="text-purple-600" />}
                              label="Employment Status"
                              value={getFieldValue('status_name')}
                            />
                            <InfoItem 
                              icon={<Settings size={16} className="text-purple-600" />}
                              label="Status Type"
                              value={getFieldValue('status_type')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'job-descriptions' && (
                    <div className="space-y-6">
                 
                      <EmployeeDetailJobDescriptions 
                        employeeId={id} 
                        isManager={isManager}
                      />
                    </div>
                  )}
{activeTab === 'performance' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className={`${textPrimary} text-lg font-bold`}>Performance Management</h3>
      <div className={`px-4 py-2 rounded-xl ${bgAccent} border ${borderColor} flex items-center gap-2`}>
        <TrendingUp size={16} className="text-almet-sapphire" />
        <span className={`text-xs font-semibold ${textMuted}`}>
          Annual Review & Goals
        </span>
      </div>
    </div>
    <EmployeeDetailPerformance 
      employeeId={id} 
      employeeData={currentEmployee}
      isManager={isManager}
    />
  </div>
)}
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

               {activeTab === 'documents' && (
  <div className="space-y-6">
    <EmployeeDocumentManager 
      employeeId={id} 
      employeeData={currentEmployee}
      darkMode={darkMode}
    />
  </div>
)}

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
        
        {/* Additional Notes Section */}
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

        {/* Direct Reports Section - Enhanced */}
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

        {/* Performance Metrics Section */}
        {currentEmployee.performance_metrics && (
          <div className={`${bgCard} rounded-2xl ${shadowClass} border ${borderColor} p-6 mt-8`}>
            <h3 className={`${textPrimary} text-lg font-bold mb-6 flex items-center gap-3`}>
              <TrendingUp size={20} className="text-almet-sapphire" />
              Performance Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Performance Score */}
              <div className={`${bgAccent} rounded-xl p-6 border ${borderColor} text-center`}>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <Award size={24} className="text-white" />
                </div>
                <h4 className={`${textPrimary} font-bold text-lg mb-2`}>
                  {currentEmployee.performance_metrics.overall_score || 'N/A'}
                </h4>
                <p className={`${textMuted} text-sm`}>Overall Performance</p>
              </div>

              {/* Goals Completion */}
              <div className={`${bgAccent} rounded-xl p-6 border ${borderColor} text-center`}>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <Target size={24} className="text-white" />
                </div>
                <h4 className={`${textPrimary} font-bold text-lg mb-2`}>
                  {currentEmployee.performance_metrics.goals_completion || 'N/A'}%
                </h4>
                <p className={`${textMuted} text-sm`}>Goals Completion</p>
              </div>

              {/* Last Review Date */}
              <div className={`${bgAccent} rounded-xl p-6 border ${borderColor} text-center`}>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Calendar size={24} className="text-white" />
                </div>
                <h4 className={`${textPrimary} font-bold text-lg mb-2`}>
                  {formatDate(currentEmployee.performance_metrics.last_review_date)}
                </h4>
                <p className={`${textMuted} text-sm`}>Last Review</p>
              </div>
            </div>
          </div>
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