'use client'
import React, { useState, useMemo } from 'react';
import { Building2, Users, AlertCircle, XCircle, ChevronLeft, ChevronRight, Layers, Mail } from 'lucide-react';
import Avatar from './Avatar';

const POSITION_COLORS = {
    'VC':                  '#1e3a8a',
    'Vice Chairman':       '#1e3a8a',
    'DIRECTOR':            '#30539b',
    'HEAD OF DEPARTMENT':  '#336fa5',
    'SENIOR SPECIALIST':   '#4f5772',
    'SPECIALIST':          '#7a829a',
    'JUNIOR SPECIALIST':   '#90a0b9',
};
const getAccent = (pg) => POSITION_COLORS[pg] || '#7a829a';

const cleanEmployeeData = (employee) => {
    if (!employee) return null;
    const isVacancy = Boolean(
        employee.employee_details?.is_vacancy ||
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
        is_vacancy: isVacancy,
        record_type: employee.record_type || (isVacancy ? 'vacancy' : 'employee'),
        employee_details: employee.employee_details
    };
};

const GridView = ({ filteredOrgChart, setSelectedEmployee, darkMode }) => {
    const bgCard      = darkMode ? 'bg-slate-800'  : 'bg-white';
    const borderColor = darkMode ? 'border-slate-600' : 'border-gray-200';
    const textHeader  = darkMode ? 'text-gray-100' : 'text-almet-cloud-burst';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-almet-waterloo';
    const textMuted   = darkMode ? 'text-gray-500' : 'text-almet-bali-hai';
    const bgAccent    = darkMode ? 'bg-slate-700'  : 'bg-gray-50';

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const totalItems = filteredOrgChart?.length || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const paginatedData = useMemo(() => {
        if (!filteredOrgChart?.length) return [];
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrgChart.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOrgChart, currentPage]);

    React.useEffect(() => { setCurrentPage(1); }, [filteredOrgChart?.length]);

    if (!filteredOrgChart?.length) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                    <div className={`w-16 h-16 rounded-2xl ${bgAccent} flex items-center justify-center mx-auto mb-4`}>
                        <Users className={`w-8 h-8 ${textMuted}`} />
                    </div>
                    <p className={`${textSecondary} text-base font-semibold`}>No employees found</p>
                    <p className={`${textMuted} text-sm mt-1`}>Try adjusting your filters or search criteria</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
                    {paginatedData.map(employee => {
                        const emp = cleanEmployeeData(employee);
                        const isVacant = emp.vacant;
                        const accent = isVacant ? '#dc2626' : getAccent(emp.position_group);

                        return (
                            <div
                                key={emp.employee_id}
                                className={`${bgCard} rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden`}
                                style={{
                                    border: isVacant ? `2px solid ${accent}` : `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                                    willChange: 'transform, box-shadow'
                                }}
                                onClick={() => setSelectedEmployee(emp)}
                            >
                                {/* Accent top stripe */}
                                <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

                                <div className="p-3.5">
                                    {/* Avatar + name */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="relative flex-shrink-0">
                                            <Avatar employee={emp} size="md" darkMode={darkMode} />
                                            {emp.status_color && !isVacant && (
                                                <span
                                                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800"
                                                    style={{ backgroundColor: emp.status_color }}
                                                    title="Status"
                                                />
                                            )}
                                            {isVacant && (
                                                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                                    <AlertCircle className="w-2.5 h-2.5 text-white" />
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className={`font-semibold text-sm leading-tight truncate ${
                                                    isVacant ? 'text-red-600 dark:text-red-400' : textHeader
                                                }`}
                                                title={emp.name}
                                            >
                                                {emp.name}
                                            </h3>
                                            <p
                                                className={`text-xs line-clamp-2 mt-0.5 ${
                                                    isVacant ? 'text-red-500 dark:text-red-300 italic' : textSecondary
                                                }`}
                                                title={emp.title}
                                            >
                                                {emp.title}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1">
                                        {emp.department && (
                                            <div className={`flex items-center gap-1.5 text-xs ${isVacant ? 'text-red-500 dark:text-red-400' : textSecondary}`}>
                                                <Building2 className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{emp.department}</span>
                                            </div>
                                        )}
                                        {emp.unit && emp.unit !== emp.department && (
                                            <div className={`flex items-center gap-1.5 text-xs ${textMuted}`}>
                                                <Layers className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{emp.unit}</span>
                                            </div>
                                        )}
                                        {!isVacant && emp.email && (
                                            <div className={`flex items-center gap-1.5 text-xs ${textMuted}`}>
                                                <Mail className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{emp.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div
                                    className="px-3.5 py-2 flex items-center justify-between"
                                    style={{ borderTop: `1px solid ${accent}22`, background: `${accent}08` }}
                                >
                                    {isVacant ? (
                                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                                            <XCircle className="w-3 h-3" /> Position Open
                                        </span>
                                    ) : emp.direct_reports > 0 ? (
                                        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: accent }}>
                                            <Users className="w-3 h-3" />
                                            {emp.direct_reports} Report{emp.direct_reports !== 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className={`text-[11px] ${textMuted}`}>Individual contributor</span>
                                    )}

                                    {/* Position group badge */}
                                    {emp.position_group && !isVacant && (
                                        <span
                                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                                            style={{ background: accent }}
                                        >
                                            {emp.position_group.replace('HEAD OF ', 'HoD').replace(' SPECIALIST', '')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={`${bgCard} border-t ${borderColor} px-4 py-2.5 flex items-center justify-between gap-4`}>
                    <span className={`text-xs ${textMuted}`}>
                        {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded-lg border ${borderColor} ${bgCard} hover:${bgAccent} disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
                        >
                            <ChevronLeft className={`w-4 h-4 ${textSecondary}`} />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let p = totalPages <= 5 ? i + 1
                                : currentPage <= 3 ? i + 1
                                : currentPage >= totalPages - 2 ? totalPages - 4 + i
                                : currentPage - 2 + i;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                                        currentPage === p
                                            ? 'bg-almet-sapphire text-white'
                                            : `${bgCard} ${textSecondary} hover:${bgAccent} border ${borderColor}`
                                    }`}
                                >
                                    {p}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-1.5 rounded-lg border ${borderColor} ${bgCard} hover:${bgAccent} disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
                        >
                            <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className={`text-xs ${textMuted}`}>Page:</span>
                        <input
                            type="number" min="1" max={totalPages} value={currentPage}
                            onChange={(e) => { const p = parseInt(e.target.value); if (p >= 1 && p <= totalPages) setCurrentPage(p); }}
                            className={`w-12 px-1.5 py-1 text-xs border ${borderColor} rounded-lg ${bgCard} ${textSecondary} text-center outline-none focus:ring-1 focus:ring-almet-sapphire`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GridView;
