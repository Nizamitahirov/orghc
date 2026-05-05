// components/orgChart/EmployeeNode.jsx
'use client'
import React, { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Users, Layers, Plus, Minus, ArrowUp, AlertCircle, XCircle } from 'lucide-react';
import Avatar from './Avatar';

const cleanEmployeeData = (employee) => {
    if (!employee) return null;
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

// Position group → accent color (top stripe + expand button)
const POSITION_COLORS = {
    'VC':                  { accent: '#1e3a8a', light: 'rgba(30,58,138,0.08)',  label: '#1e3a8a' },
    'Vice Chairman':       { accent: '#1e3a8a', light: 'rgba(30,58,138,0.08)',  label: '#1e3a8a' },
    'DIRECTOR':            { accent: '#30539b', light: 'rgba(48,83,155,0.08)',  label: '#30539b' },
    'HEAD OF DEPARTMENT':  { accent: '#336fa5', light: 'rgba(51,111,165,0.08)', label: '#336fa5' },
    'SENIOR SPECIALIST':   { accent: '#4f5772', light: 'rgba(79,87,114,0.08)',  label: '#4f5772' },
    'SPECIALIST':          { accent: '#7a829a', light: 'rgba(122,130,154,0.08)',label: '#7a829a' },
    'JUNIOR SPECIALIST':   { accent: '#90a0b9', light: 'rgba(144,160,185,0.08)',label: '#90a0b9' },
};
const VACANT_COLOR = { accent: '#dc2626', light: 'rgba(220,38,38,0.06)', label: '#dc2626' };
const DEFAULT_COLOR = POSITION_COLORS['SPECIALIST'];

const EmployeeNode = React.memo(({ data }) => {
    const employee = data.employee;
    const directReports = employee.direct_reports || 0;
    const hasChildren = directReports > 0;
    const isExpanded = data.isExpanded;
    const isVacant = Boolean(
        employee.employee_details?.is_vacancy === true ||
        employee.is_vacancy === true ||
        employee.vacant === true
    );

    const colors = isVacant
        ? VACANT_COLOR
        : (POSITION_COLORS[employee.position_group] || DEFAULT_COLOR);

    const handleToggleExpanded = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        data.onToggleExpanded(employee.employee_id);
    }, [employee.employee_id, data.onToggleExpanded]);

    const handleSelectEmployee = useCallback((e) => {
        if (e.target.closest('.expand-button')) return;
        e.stopPropagation();
        data.onSelectEmployee(cleanEmployeeData(employee));
    }, [employee, data.onSelectEmployee]);

    const handleNavigateToManager = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (employee.line_manager_id) data.onNavigateToEmployee(employee.line_manager_id);
    }, [employee.line_manager_id, data.onNavigateToEmployee]);

    const level = employee.level_to_ceo;

    return (
        <div className="relative" style={{ width: 260 }}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-2.5 !h-2.5 !opacity-100 !border-2 !border-white"
                style={{ top: -5, background: colors.accent }}
            />

            <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
                style={{
                    border: isVacant ? `2px solid ${colors.accent}` : '1px solid #e2e8f0',
                    willChange: 'transform, box-shadow'
                }}
                onClick={handleSelectEmployee}
            >
                {/* Colored accent stripe at top */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}99)` }} />

                {/* Main content */}
                <div className="p-3">
                    <div className="flex items-start gap-2.5">
                        {/* Avatar with status dot */}
                        <div className="relative flex-shrink-0">
                            <Avatar employee={employee} size="sm" />
                            {employee.status_color && !isVacant && (
                                <span
                                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800"
                                    style={{ backgroundColor: employee.status_color }}
                                    title="Status"
                                />
                            )}
                        </div>

                        {/* Name + title */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                                <h3 className={`font-semibold text-[13px] leading-tight ${
                                    isVacant ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                    {employee.name || 'Vacant Position'}
                                </h3>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {/* Level badge */}
                                    {typeof level === 'number' && !isVacant && (
                                        <span
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none"
                                            style={{ background: colors.accent }}
                                            title={`Level ${level} from CEO`}
                                        >
                                            L{level}
                                        </span>
                                    )}
                                    {/* Navigate to manager */}
                                    {employee.line_manager_id && !isVacant && (
                                        <button
                                            onClick={handleNavigateToManager}
                                            className="p-0.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                                            title="Go to Manager"
                                        >
                                            <ArrowUp className="w-3 h-3 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className={`text-[11px] leading-snug line-clamp-2 mt-0.5 ${
                                isVacant ? 'text-red-500 dark:text-red-300 italic' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                                {employee.title || 'No Title'}
                            </p>
                        </div>
                    </div>

                    {/* Department + unit badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {employee.department && (
                            <span
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium"
                                style={{ background: colors.light, color: colors.accent }}
                            >
                                {employee.department}
                            </span>
                        )}
                        {employee.unit && employee.unit !== employee.department && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                                <Layers className="w-2.5 h-2.5" />
                                {employee.unit}
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer: direct reports or vacant indicator */}
                {(directReports > 0 || isVacant) && (
                    <div
                        className="px-3 py-1.5 flex items-center justify-between"
                        style={{ borderTop: `1px solid ${colors.accent}22`, background: colors.light }}
                    >
                        {isVacant ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: colors.accent }}>
                                <XCircle className="w-3 h-3" />
                                Position Open
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: colors.accent }}>
                                <Users className="w-3 h-3" />
                                {directReports} Direct Report{directReports !== 1 ? 's' : ''}
                            </span>
                        )}
                        {/* Vacant badge in footer */}
                        {isVacant && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: colors.accent }}>
                                <AlertCircle className="w-2.5 h-2.5" />
                                VACANT
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Expand / collapse button */}
            {hasChildren && (
                <div
                    className="expand-button absolute -bottom-4 left-1/2 -translate-x-1/2 z-50 cursor-pointer"
                    style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={handleToggleExpanded}
                >
                    <div
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900 hover:scale-110 active:scale-95 transition-transform duration-150"
                        style={{
                            background: isExpanded
                                ? `linear-gradient(135deg, #dc2626, #991b1b)`
                                : `linear-gradient(135deg, ${colors.accent}, ${colors.label}cc)`
                        }}
                    >
                        {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                </div>
            )}

            {hasChildren && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-2.5 !h-2.5 !opacity-100 !border-2 !border-white"
                    style={{ bottom: -5, background: colors.accent }}
                />
            )}
        </div>
    );
});

EmployeeNode.displayName = 'EmployeeNode';
export default EmployeeNode;
