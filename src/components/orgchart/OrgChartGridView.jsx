// components/orgChart/GridView.jsx - FULL VERSION with Pagination
'use client'
import React, { useState, useMemo } from 'react';
import { Building2, Users, AlertCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Avatar from './Avatar';

const cleanEmployeeData = (employee) => {
    if (!employee) return null;
    
    // ✅ FIXED: Check employee_details.is_vacancy first
    const isVacancy = Boolean(
        employee.employee_details?.is_vacancy ||  // ✅ Primary - backend format
        employee.is_vacancy || 
        employee.vacant || 
        employee.record_type === 'vacancy' ||
        (employee.name && employee.name.includes('[VACANT]'))
    );
    
    return {
        id: employee.id,
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
        vacant: isVacancy,
        is_vacancy: isVacancy,  // ✅ Flatten for easier access
        record_type: employee.record_type || (isVacancy ? 'vacancy' : 'employee'),
        employee_details: employee.employee_details
    };
};

const GridView = ({ 
    filteredOrgChart, 
    setSelectedEmployee, 
    darkMode 
}) => {
    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const textHeader = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
    const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
    const bgAccent = darkMode ? "bg-slate-700" : "bg-almet-mystic";

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // 3x4 grid

    // Calculate pagination
    const totalItems = filteredOrgChart?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const paginatedData = useMemo(() => {
        if (!filteredOrgChart || filteredOrgChart.length === 0) return [];
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        return filteredOrgChart.slice(startIndex, endIndex);
    }, [filteredOrgChart, currentPage, itemsPerPage]);

    // Reset to page 1 when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filteredOrgChart?.length]);

    if (!filteredOrgChart || filteredOrgChart.length === 0) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                    <AlertCircle className={`w-12 h-12 ${textSecondary} mx-auto mb-4`} />
                    <p className={`${textSecondary} text-lg font-medium`}>
                        No employees found
                    </p>
                    <p className={`${textSecondary} text-sm mt-2`}>
                        Try adjusting your filters or search criteria
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Grid Container */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {paginatedData.map(employee => {
                        const cleanEmployee = cleanEmployeeData(employee);
                        const isVacant = cleanEmployee.vacant;
                        
                        return (
                            <div 
                                key={employee.employee_id}
                                className={`${bgCard} rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 relative ${
                                    isVacant 
                                        ? 'border-3 border-red-500 bg-red-50 dark:bg-red-900/20' 
                                        : `border ${borderColor}`
                                }`}
                                style={{
                                    borderWidth: isVacant ? '3px' : '1px',
                                    borderColor: isVacant ? '#ef4444' : undefined
                                }}
                                onClick={() => setSelectedEmployee(cleanEmployee)}
                            >
                                {/* Vacant Badge */}
                                {isVacant && (
                                    <div className="absolute -top-2 -right-2 z-10">
                                        <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            VACANT
                                        </div>
                                    </div>
                                )}
                                
                                {/* Employee Card Content */}
                                <div className="flex items-start gap-3 mb-3">
                                    <Avatar employee={cleanEmployee} size="sm" darkMode={darkMode} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-sm leading-tight mb-1 truncate ${
                                            isVacant ? 'text-red-700 dark:text-red-400' : textHeader
                                        }`} title={cleanEmployee.name}>
                                            {cleanEmployee.name}
                                        </h3>
                                        <p className={`text-xs line-clamp-2 ${
                                            isVacant ? 'text-red-600 dark:text-red-300 italic' : textSecondary
                                        }`} title={cleanEmployee.title}>
                                            {cleanEmployee.title}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Employee Details */}
                                <div className="space-y-1.5">
                                    <div className={`flex items-center text-xs ${
                                        isVacant ? 'text-red-600 dark:text-red-400' : textSecondary
                                    }`}>
                                        <Building2 className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                        <span className="truncate" title={cleanEmployee.department}>
                                            {cleanEmployee.department}
                                        </span>
                                    </div>
                                    
                                    {!isVacant && cleanEmployee.direct_reports > 0 && (
                                        <div className={`flex items-center ${textSecondary} text-xs`}>
                                            <Users className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                            <span>{cleanEmployee.direct_reports} Reports</span>
                                        </div>
                                    )}
                                    
                                    {isVacant && (
                                        <div className="flex items-center text-red-600 dark:text-red-400 text-xs font-semibold">
                                            <XCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                            <span>Position Open</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className={`${bgCard} border-t ${borderColor} px-4 py-3`}>
                    <div className="flex items-center justify-between">
                        {/* Page Info */}
                        <div className={`text-xs ${textSecondary}`}>
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} employees
                        </div>

                        {/* Pagination Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg border ${borderColor} ${bgCard} hover:${bgAccent} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                            >
                                <ChevronLeft className={`w-4 h-4 ${textSecondary}`} />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                                currentPage === pageNum
                                                    ? 'bg-almet-sapphire text-white'
                                                    : `${bgCard} ${textSecondary} hover:${bgAccent} border ${borderColor}`
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg border ${borderColor} ${bgCard} hover:${bgAccent} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                            >
                                <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
                            </button>
                        </div>

                        {/* Go to Page */}
                        <div className="flex items-center gap-2">
                            <span className={`text-xs ${textSecondary}`}>Go to:</span>
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={currentPage}
                                onChange={(e) => {
                                    const page = parseInt(e.target.value);
                                    if (page >= 1 && page <= totalPages) {
                                        setCurrentPage(page);
                                    }
                                }}
                                className={`w-16 px-2 py-1 text-xs border ${borderColor} rounded ${bgCard} ${textSecondary}`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GridView;