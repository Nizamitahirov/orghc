// components/orgChart/EmployeeNode.jsx - Improved Version
'use client'
import React, { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Users, Layers, Plus, Minus, ArrowUp, AlertCircle, XCircle } from 'lucide-react';
import Avatar from './Avatar';

// components/orgChart/EmployeeNode.jsx - Update cleanEmployeeData
const cleanEmployeeData = (employee) => {
    if (!employee) return null;
    
    // ✅ FIXED: More robust vacancy check
    const isVacancy = Boolean(
        employee.employee_details?.is_vacancy === true ||
        employee.is_vacancy === true || 
        employee.vacant === true || 
        employee.record_type === 'vacancy' ||
        (employee.name && employee.name.includes('[VACANT]'))
    );
    
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
        vacant: isVacancy,
        is_vacancy: isVacancy,
        employee_details: employee.employee_details
    };
};


const EmployeeNode = React.memo(({ data, id }) => {
    const employee = data.employee;
    const directReports = employee.direct_reports || 0;
    const hasChildren = directReports > 0;
    const isExpanded = data.isExpanded;
    const isVacant = Boolean(
        employee.employee_details?.is_vacancy === true ||
        employee.is_vacancy === true || 
        employee.vacant === true
    );
    

    
    // IMPROVED: More reliable click handler with stopPropagation at top level
    const handleToggleExpanded = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
       
        data.onToggleExpanded(employee.employee_id);
    }, [employee.employee_id, employee.name, data.onToggleExpanded]);
    
    const handleSelectEmployee = useCallback((e) => {
        // Don't trigger if clicking on expand button
        if (e.target.closest('.expand-button')) {
            return;
        }
        e.stopPropagation();
        const cleanEmployee = cleanEmployeeData(employee);
        data.onSelectEmployee(cleanEmployee);
    }, [employee, data.onSelectEmployee]);

    const handleNavigateToManager = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (employee.line_manager_id) {
            data.onNavigateToEmployee(employee.line_manager_id);
        }
    }, [employee.line_manager_id, data.onNavigateToEmployee]);

    // Almet color palette - BRIGHTER for better visibility
    const hierarchyColors = {
        'VC': { primary: '#2346A8', bg: 'rgba(35, 70, 168, 0.08)', badge: '#1e3a8a' },
        'DIRECTOR': { primary: '#30539b', bg: 'rgba(48, 83, 155, 0.08)', badge: '#1e40af' },
        'HEAD OF DEPARTMENT': { primary: '#336fa5', bg: 'rgba(51, 111, 165, 0.08)', badge: '#1e40af' },
        'SENIOR SPECIALIST': { primary: '#4f5772', bg: 'rgba(79, 87, 114, 0.08)', badge: '#374151' },
        'SPECIALIST': { primary: '#7a829a', bg: 'rgba(122, 130, 154, 0.08)', badge: '#4b5563' },
        'JUNIOR SPECIALIST': { primary: '#90a0b9', bg: 'rgba(144, 160, 185, 0.08)', badge: '#6b7280' },
        'Vice Chairman': { primary: '#1e3a8a', bg: 'rgba(30, 58, 138, 0.08)', badge: '#1e3a8a' }
    };

    const vacantColors = {
        primary: '#dc2626',
        bg: 'rgba(220, 38, 38, 0.05)',
        badge: '#991b1b',
        border: '#ef4444'
    };

    const colors = isVacant ? vacantColors : (hierarchyColors[employee.position_group] || hierarchyColors['SPECIALIST']);

    return (
        <div className="relative">
            <Handle 
                type="target" 
                position={Position.Top} 
                className="!bg-almet-sapphire !border-2 !border-white !w-3 !h-3 !opacity-100"
                style={{ top: -6 }}
            />
            
            {/* IMPROVED: Cleaner card design with better spacing and smooth transitions */}
            <div 
                className={`bg-white dark:bg-slate-800 rounded-lg shadow-md transition-all duration-300 ease-out cursor-pointer hover:shadow-xl hover:scale-[1.02] w-[260px] ${
                    isVacant 
                        ? 'border-2 border-red-400 bg-red-50/50 dark:bg-red-900/10' 
                        : 'border border-gray-200 dark:border-slate-600'
                }`}
                onClick={handleSelectEmployee}
                style={{
                    transform: 'translateZ(0)', // Force GPU acceleration
                    willChange: 'transform, box-shadow'
                }}
            >
                {/* Vacant Badge - IMPROVED: Smaller and cleaner */}
                {isVacant && (
                    <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            VACANT
                        </div>
                    </div>
                )}

                {/* IMPROVED: Compact header with better alignment */}
                <div className="p-3 pb-2">
                    <div className="flex items-start gap-2.5">
                        <Avatar employee={employee} size="sm" />
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-sm leading-tight mb-0.5 ${
                                isVacant 
                                    ? 'text-red-700 dark:text-red-400' 
                                    : 'text-gray-900 dark:text-gray-100'
                            }`}>
                                {employee.name || 'Vacant Position'}
                            </h3>
                            <p className={`text-[11px] leading-snug line-clamp-2 ${
                                isVacant 
                                    ? 'text-red-600 dark:text-red-300 italic' 
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}>
                                {employee.title || 'No Title'}
                            </p>
                        </div>
                        {employee.line_manager_id && !isVacant && (
                            <button
                                onClick={handleNavigateToManager}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                                title="Go to Manager"
                            >
                                <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>
                
                {/* IMPROVED: Cleaner badges with better spacing */}
                <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
                    {employee.employee_details?.grading_display && (
                        <span 
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: isVacant ? '#dc2626' : colors.badge }}
                        >
                            {employee.employee_details.grading_display}
                        </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        isVacant 
                            ? 'bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300' 
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    }`}>
                        {employee.department || 'No Department'}
                    </span>
                    {employee.status_color && !isVacant && (
                        <div 
                            className="w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-800"
                            style={{ backgroundColor: employee.status_color }}
                            title="Employee Status"
                        />
                    )}
                </div>

                {/* IMPROVED: Compact info section */}
                <div className={`px-3 pb-3 pt-2 border-t space-y-1 ${
                    isVacant 
                        ? 'border-red-200 dark:border-red-800/30' 
                        : 'border-gray-100 dark:border-slate-700'
                }`}>
                    {employee.unit && (
                        <div className={`flex items-center text-[11px] ${
                            isVacant 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-gray-600 dark:text-gray-400'
                        }`}>
                            <Layers className="w-3 h-3 mr-1.5 flex-shrink-0" />
                            <span className="font-medium truncate">{employee.unit}</span>
                        </div>
                    )}
                    
                    {isVacant ? (
                        <div className="flex items-center font-semibold text-[11px] text-red-600 dark:text-red-400">
                            <XCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />
                            <span>Position Open</span>
                        </div>
                    ) : directReports > 0 && (
                        <div className="flex items-center font-semibold text-[11px]" style={{ color: colors.primary }}>
                            <Users className="w-3 h-3 mr-1.5 flex-shrink-0" />
                            <span>{directReports} Direct Report{directReports > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
                
                {/* IMPROVED: LARGER clickable area for expand/collapse button */}
                {hasChildren && (
                    <div 
                        className="expand-button absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-50 cursor-pointer"
                        onClick={handleToggleExpanded}
                        style={{ 
                            width: '48px', 
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-150 shadow-lg hover:shadow-xl ring-2 ring-white dark:ring-slate-900"
                            style={{ 
                                background: isVacant 
                                    ? (isExpanded 
                                        ? 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)' 
                                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')
                                    : (isExpanded 
                                        ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' 
                                        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`),
                            }}
                        >
                            {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                    </div>
                )}
            </div>
            
            {hasChildren && (
                <Handle 
                    type="source" 
                    position={Position.Bottom} 
                    className="!bg-almet-sapphire !border-2 !border-white !w-3 !h-3 !opacity-100"
                    style={{ 
                        bottom: -6,
                        background: isVacant ? 'linear-gradient(135deg, #ef4444, #dc2626)' : undefined
                    }}
                />
            )}
        </div>
    );
});

EmployeeNode.displayName = 'EmployeeNode';

export default EmployeeNode;