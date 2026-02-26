// components/orgChart/EmployeeModal.jsx
'use client'
import React, { useState } from 'react';
import { 
    X, User, Phone, Mail, Building2, Layers, Briefcase, Target, 
    Crown, Users, UsersRound, ArrowUp, ArrowDown, AlertCircle, 
    FileText, RefreshCw, XCircle
} from 'lucide-react';
import Avatar from './Avatar';
import Pagination from '../common/Pagination';

const cleanEmployeeData = (employee) => {
    if (!employee) return null;
    return {
        employee_id: employee.employee_id,
        name: employee.name,
        title: employee.title,
        department: employee.department,
        unit: employee.unit,
        business_function: employee.business_function,
        position_group: employee.position_group,
        direct_reports: employee.direct_reports || 0,
        line_manager_id: employee.line_manager_id,
        level_to_ceo: employee.level_to_ceo,
        email: employee.email,
        phone: employee.phone,
        profile_image_url: employee.profile_image_url,
        avatar: employee.avatar,
        status_color: employee.status_color,
        vacant: employee.vacant,
        employee_details: employee.employee_details
    };
};

const EmployeeModal = ({
    selectedEmployee,
    clearSelectedEmployee,
    fetchJobDescription,
    detailLoading,
    orgChart,
    setSelectedEmployee,
    darkMode
}) => {
    // Pagination states
    const [reportsPage, setReportsPage] = useState(1);
    const [colleaguesPage, setColleaguesPage] = useState(1);
    const itemsPerPage = 5;

    if (!selectedEmployee) return null;

    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const textHeader = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
    const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
    const textPrimary = darkMode ? "text-gray-200" : "text-almet-comet";
    const bgAccent = darkMode ? "bg-slate-700" : "bg-almet-mystic";

    // Reset pagination when employee changes
    React.useEffect(() => {
        setReportsPage(1);
        setColleaguesPage(1);
    }, [selectedEmployee.employee_id]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200 ease-in-out">
            <div className={`${bgCard} rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border ${
                selectedEmployee.vacant ? 'border-red-500 border-3' : borderColor
            }`}>
                {/* Modal Header */}
                <div className={`flex items-center justify-between p-4 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-xl z-10`}>
                    <div className="flex items-center gap-3">
                        {selectedEmployee.vacant && (
                            <div className="absolute -top-2 -left-2">
                                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                                    <AlertCircle className="w-4 h-4" />
                                    VACANT POSITION
                                </div>
                            </div>
                        )}
                        <Avatar employee={selectedEmployee} size="md" darkMode={darkMode} />
                        <div>
                            <h2 className={`text-lg font-bold mb-1 ${
                                selectedEmployee.vacant ? 'text-red-700 dark:text-red-400' : textHeader
                            }`}>
                                {selectedEmployee.name}
                            </h2>
                            <p className={`text-sm mb-1 ${
                                selectedEmployee.vacant ? 'text-red-600 dark:text-red-300 italic' : textSecondary
                            }`}>
                                {selectedEmployee.title}
                            </p>
                            <div className="flex items-center gap-2">
                                {selectedEmployee.employee_details?.grading_display && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white ${
                                        selectedEmployee.vacant ? 'bg-red-600' : 'bg-almet-sapphire'
                                    }`}>
                                        {selectedEmployee.employee_details.grading_display}
                                    </span>
                                )}
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                                    selectedEmployee.vacant 
                                        ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200' 
                                        : `${bgAccent} ${textPrimary}`
                                }`}>
                                    {selectedEmployee.department || 'No Department'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!selectedEmployee.vacant && selectedEmployee.employee_id && (
                            <button
                                onClick={() => fetchJobDescription(selectedEmployee.employee_id)}
                                disabled={detailLoading}
                                className="flex items-center gap-2 px-3 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                title="View job description"
                            >
                                {detailLoading ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FileText size={16} />
                                        Job Description
                                    </>
                                )}
                            </button>
                        )}
                        <button 
                            onClick={clearSelectedEmployee} 
                            className={`${textMuted} hover:${textPrimary} p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors`}
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-4 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Employee Details Card */}
                            <EmployeeDetailsCard
                                selectedEmployee={selectedEmployee}
                                bgAccent={bgAccent}
                                borderColor={borderColor}
                                textHeader={textHeader}
                            />
                            
                            {/* Contact Information Card */}
                            {!selectedEmployee.vacant && (
                                <ContactCard
                                    selectedEmployee={selectedEmployee}
                                    bgAccent={bgAccent}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                />
                            )}

                            {/* Team Metrics Card */}
                            {!selectedEmployee.vacant && (
                                <TeamMetricsCard
                                    selectedEmployee={selectedEmployee}
                                    orgChart={orgChart}
                                    bgAccent={bgAccent}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                />
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Reports To Card */}
                            {selectedEmployee.line_manager_id && (
                                <ReportsToCard
                                    selectedEmployee={selectedEmployee}
                                    orgChart={orgChart}
                                    setSelectedEmployee={setSelectedEmployee}
                                    cleanEmployeeData={cleanEmployeeData}
                                    darkMode={darkMode}
                                    bgAccent={bgAccent}
                                    bgCard={bgCard}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                    textSecondary={textSecondary}
                                    textPrimary={textPrimary}
                                />
                            )}

                            {/* Direct Reports Card with Pagination */}
                            {!selectedEmployee.vacant && selectedEmployee.direct_reports > 0 && (
                                <DirectReportsCard
                                    selectedEmployee={selectedEmployee}
                                    orgChart={orgChart}
                                    setSelectedEmployee={setSelectedEmployee}
                                    cleanEmployeeData={cleanEmployeeData}
                                    darkMode={darkMode}
                                    bgAccent={bgAccent}
                                    bgCard={bgCard}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                    textPrimary={textPrimary}
                                    textSecondary={textSecondary}
                                    currentPage={reportsPage}
                                    onPageChange={setReportsPage}
                                    itemsPerPage={itemsPerPage}
                                />
                            )}

                            {/* Unit Colleagues Card with Pagination */}
                            {selectedEmployee.unit && !selectedEmployee.vacant && (
                                <UnitColleaguesCard
                                    selectedEmployee={selectedEmployee}
                                    orgChart={orgChart}
                                    setSelectedEmployee={setSelectedEmployee}
                                    cleanEmployeeData={cleanEmployeeData}
                                    darkMode={darkMode}
                                    bgAccent={bgAccent}
                                    bgCard={bgCard}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                    textPrimary={textPrimary}
                                    textSecondary={textSecondary}
                                    currentPage={colleaguesPage}
                                    onPageChange={setColleaguesPage}
                                    itemsPerPage={itemsPerPage}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Detail Row Component
export const DetailRow = ({ icon: Icon, label, value, isVacant = false }) => (
    <div className="flex items-center gap-2 py-1.5">
        <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${
            isVacant 
                ? 'bg-red-100 dark:bg-red-900' 
                : 'bg-almet-mystic dark:bg-almet-cloud-burst'
        }`}>
            <Icon className={`w-3 h-3 ${
                isVacant ? 'text-red-600 dark:text-red-400' : 'text-almet-sapphire dark:text-almet-bali-hai'
            }`} />
        </div>
        <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium uppercase tracking-wider ${
                isVacant ? 'text-red-600 dark:text-red-400' : 'text-almet-waterloo dark:text-gray-400'
            }`}>
                {label}
            </p>
            <p className={`font-semibold text-sm truncate ${
                isVacant ? 'text-red-700 dark:text-red-300' : 'text-almet-cloud-burst dark:text-gray-200'
            }`} title={value}>
                {value}
            </p>
        </div>
    </div>
);

// Employee Details Card
export const EmployeeDetailsCard = ({ selectedEmployee, bgAccent, borderColor, textHeader }) => (
    <div className={`${bgAccent} rounded-lg p-3 border ${
        selectedEmployee.vacant ? 'border-red-300 dark:border-red-700' : borderColor
    }`}>
        <h4 className={`font-bold mb-3 text-sm uppercase tracking-wider flex items-center gap-2 ${
            selectedEmployee.vacant ? 'text-red-700 dark:text-red-400' : textHeader
        }`}>
            <User size={14} />
            {selectedEmployee.vacant ? 'Vacant Position Details' : 'Employee Details'}
        </h4>
        <div className="space-y-2">
            {selectedEmployee.vacant ? (
                <>
                    <DetailRow icon={XCircle} label="Status" value="Vacant - Hiring in Progress" isVacant={true} />
                    <DetailRow icon={Target} label="Level to CEO" value={selectedEmployee.level_to_ceo || 0} isVacant={true} />
                    <DetailRow icon={Building2} label="Department" value={selectedEmployee.department || 'N/A'} isVacant={true} />
                    <DetailRow icon={Briefcase} label="Hierarchy" value={selectedEmployee.position_group || 'N/A'} isVacant={true} />
                </>
            ) : (
                <>
                    <DetailRow icon={Target} label="Level to CEO" value={selectedEmployee.level_to_ceo || 0} />
                    <DetailRow icon={Building2} label="Department" value={selectedEmployee.department || 'N/A'} />
                    <DetailRow icon={Layers} label="Unit" value={selectedEmployee.unit || 'N/A'} />
                    <DetailRow icon={Briefcase} label="Hierarchy" value={selectedEmployee.position_group || 'N/A'} />
                </>
            )}
        </div>
    </div>
);

// Contact Card
export const ContactCard = ({ selectedEmployee, bgAccent, borderColor, textHeader }) => (
    <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
        <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
            <Phone size={14} />
            Contact
        </h4>
        <div className="space-y-2">
            <DetailRow icon={Phone} label="Phone" value={selectedEmployee.phone || 'Not provided'} />
            <DetailRow icon={Mail} label="Email" value={selectedEmployee.email || 'Not provided'} />
        </div>
    </div>
);

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-almet-mystic dark:bg-almet-cloud-burst/20 border-almet-sapphire/20 dark:border-almet-sapphire/40 text-almet-sapphire dark:text-almet-bali-hai',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    };

    return (
        <div className={`p-2 rounded-lg border ${colorClasses[color]} text-center`}>
            <div className="flex items-center justify-center mb-1">
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold mb-1">{value}</p>
            <p className="text-xs font-medium opacity-80">{label}</p>
        </div>
    );
};

// Team Metrics Card
export const TeamMetricsCard = ({ selectedEmployee, orgChart, bgAccent, borderColor, textHeader }) => {
    const calculateTeamSize = (managerId, visited = new Set()) => {
        if (visited.has(managerId)) return 0;
        visited.add(managerId);
        
        const directReports = orgChart?.filter(emp => emp.line_manager_id === managerId) || [];
        let total = directReports.length;
        
        directReports.forEach(report => {
            total += calculateTeamSize(report.employee_id, visited);
        });
        
        return total;
    };

    return (
        <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
            <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                <Users size={14} />
                Team Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2">
                <MetricCard 
                    icon={Users} 
                    label="Direct Reports" 
                    value={selectedEmployee.direct_reports || 0}
                    color="blue"
                />
                <MetricCard 
                    icon={UsersRound} 
                    label="Total Team" 
                    value={calculateTeamSize(selectedEmployee.employee_id)}
                    color="green"
                />
            </div>
        </div>
    );
};

// Reports To Card
export const ReportsToCard = ({ 
    selectedEmployee, orgChart, setSelectedEmployee, cleanEmployeeData, 
    darkMode, bgAccent, bgCard, borderColor, textHeader, textSecondary, textPrimary 
}) => {
    const manager = orgChart?.find(emp => emp.employee_id === selectedEmployee.line_manager_id);
    
    return (
        <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
            <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                <Crown size={14} />
                Reports To
            </h4>
            {manager ? (
                <div 
                    className={`flex items-center gap-3 p-3 ${bgCard} rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border ${borderColor}`}
                    onClick={() => {
                        const cleanManager = cleanEmployeeData(manager);
                        setSelectedEmployee(cleanManager);
                    }}
                >
                    <Avatar employee={manager} size="sm" darkMode={darkMode} />
                    <div className="flex-1 min-w-0">
                        <h5 className={`font-bold ${textHeader} text-sm mb-1`}>{manager.name}</h5>
                        <p className={`${textSecondary} text-xs mb-1`}>{manager.title}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-almet-mystic dark:bg-slate-700 ${textPrimary}`}>
                            {manager.department}
                        </span>
                    </div>
                    <ArrowUp className="w-4 h-4 text-almet-sapphire" />
                </div>
            ) : (
                <p className="text-almet-waterloo dark:text-gray-400 text-sm italic">Manager information not available</p>
            )}
        </div>
    );
};

// Direct Reports Card with Pagination
export const DirectReportsCard = ({ 
    selectedEmployee, orgChart, setSelectedEmployee, cleanEmployeeData, 
    darkMode, bgAccent, bgCard, borderColor, textHeader, textPrimary, textSecondary,
    currentPage, onPageChange, itemsPerPage 
}) => {
    const allReports = orgChart?.filter(emp => emp.line_manager_id === selectedEmployee.employee_id) || [];
    const totalPages = Math.ceil(allReports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReports = allReports.slice(startIndex, startIndex + itemsPerPage);
    
    return (
        <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
            <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                <Users size={14} />
                Direct Reports ({allReports.length})
            </h4>
            <div className="space-y-2">
                {paginatedReports.map(report => {
                    const isReportVacant = cleanEmployeeData(report).vacant;
                    return (
                        <div 
                            key={report.employee_id}
                            className={`flex items-center gap-2 p-2 ${bgCard} rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border ${
                                isReportVacant ? 'border-red-300 dark:border-red-700' : borderColor
                            }`}
                            onClick={() => {
                                const cleanReport = cleanEmployeeData(report);
                                setSelectedEmployee(cleanReport);
                            }}
                        >
                            <Avatar employee={report} size="sm" darkMode={darkMode} />
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold text-xs mb-1 truncate ${
                                    isReportVacant ? 'text-red-700 dark:text-red-400' : textPrimary
                                }`}>
                                    {report.name}
                                </p>
                                <p className={`text-xs truncate ${
                                    isReportVacant ? 'text-red-600 dark:text-red-300 italic' : textSecondary
                                }`}>
                                    {report.title}
                                </p>
                            </div>
                            {isReportVacant && <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                            <ArrowDown className={`w-3 h-3 flex-shrink-0 ${
                                isReportVacant ? 'text-red-500' : 'text-almet-sapphire'
                            }`} />
                        </div>
                    );
                })}
            </div>
            
            {totalPages > 1 && (
                <div className="mt-3">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={allReports.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={onPageChange}
                        darkMode={darkMode}
                    />
                </div>
            )}
        </div>
    );
};

// Unit Colleagues Card with Pagination
export const UnitColleaguesCard = ({ 
    selectedEmployee, orgChart, setSelectedEmployee, cleanEmployeeData, 
    darkMode, bgAccent, bgCard, borderColor, textHeader, textPrimary, textSecondary,
    currentPage, onPageChange, itemsPerPage 
}) => {
    const allColleagues = orgChart?.filter(emp => 
        emp.unit === selectedEmployee.unit && 
        emp.employee_id !== selectedEmployee.employee_id
    ) || [];
    
    const totalPages = Math.ceil(allColleagues.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedColleagues = allColleagues.slice(startIndex, startIndex + itemsPerPage);
    
    return (
        <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
            <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                <Building2 size={14} />
                Unit Colleagues ({allColleagues.length})
            </h4>
            <div className="space-y-2">
                {paginatedColleagues.map(colleague => (
                    <div 
                        key={colleague.employee_id}
                        className={`flex items-center gap-2 p-2 ${bgCard} rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border ${borderColor}`}
                        onClick={() => {
                            const cleanColleague = cleanEmployeeData(colleague);
                            setSelectedEmployee(cleanColleague);
                        }}
                    >
                        <Avatar employee={colleague} size="sm" darkMode={darkMode} />
                        <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${textPrimary} text-xs truncate`}>{colleague.name}</p>
                            <p className={`${textSecondary} text-xs truncate`}>{colleague.title}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {totalPages > 1 && (
                <div className="mt-3">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={allColleagues.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={onPageChange}
                        darkMode={darkMode}
                    />
                </div>
            )}
        </div>
    );
};

export default EmployeeModal;