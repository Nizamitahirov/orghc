// components/orgChart/OrgChartFilters.jsx
'use client'
import React, { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import Select from 'react-select';

const OrgChartFilters = ({ 
    showFilters,
    filters,
    filterOptions,
    updateFilter,
    clearFilters,
    setShowFilters,
    selectStyles,
    darkMode,
    isFullscreen
}) => {
    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const textHeader = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
    const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";

    // Animate height on show/hide
    const contentRef = useRef(null);
    const [maxHeight, setMaxHeight] = useState('0px');
    const [visible, setVisible] = useState(showFilters);

    useEffect(() => {
        if (showFilters) {
            setVisible(true);
            // Let DOM paint first, then expand
            requestAnimationFrame(() => {
                setMaxHeight(contentRef.current ? `${contentRef.current.scrollHeight + 32}px` : '600px');
            });
        } else {
            setMaxHeight('0px');
            // Keep mounted until transition ends
            const t = setTimeout(() => setVisible(false), 280);
            return () => clearTimeout(t);
        }
    }, [showFilters]);

    if (!visible) return null;

    // Format options with count display
    const formatOptions = (options) => {
        return options?.map(opt => ({
            ...opt,
            label: opt.count !== undefined ? `${opt.label} (${opt.count})` : opt.label
        })) || [];
    };

    return (
        <div
            className={`${bgCard} border-b ${borderColor} sticky ${isFullscreen ? 'top-[57px]' : 'top-[57px]'} z-20 `}
            style={{ maxHeight, transition: 'max-height 0.28s cubic-bezier(0.4,0,0.2,1)' }}
        >
            <div className="px-4 py-3" ref={contentRef}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-semibold ${textHeader} flex items-center gap-2`}>
                        <SlidersHorizontal size={14} />
                        Advanced Filters
                    </h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={clearFilters} 
                            className={`text-xs ${textMuted} hover:text-almet-sapphire transition-colors hover:underline font-medium`}
                        >
                            Clear All
                        </button>
                        <button 
                            onClick={() => setShowFilters(false)} 
                            className={`p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg ${textMuted} transition-colors`}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                
                {/* Filter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Companies Filter */}
                    <div>
                        <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Companies</label>
                        <Select
                            isMulti
                            placeholder="Select functions..."
                            options={formatOptions(filterOptions.businessFunctions)}
                            value={formatOptions(filterOptions.businessFunctions).filter(opt => 
                                filters.business_function?.includes(opt.value)
                            )}
                            onChange={(selected) => 
                                updateFilter('business_function', selected ? selected.map(s => s.value) : [])
                            }
                            styles={selectStyles}
                            className="text-sm"
                            isClearable
                            isSearchable
                            maxMenuHeight={300}
                        />
                    </div>

                    {/* Departments Filter */}
                    <div>
                        <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Departments</label>
                        <Select
                            isMulti
                            placeholder="Select departments..."
                            options={formatOptions(filterOptions.departments)}
                            value={formatOptions(filterOptions.departments).filter(opt => 
                                filters.department?.includes(opt.value)
                            )}
                            onChange={(selected) => 
                                updateFilter('department', selected ? selected.map(s => s.value) : [])
                            }
                            styles={selectStyles}
                            className="text-sm"
                            isClearable
                            isSearchable
                            maxMenuHeight={300}
                        />
                    </div>

                    {/* Hierarchy Filter */}
                    <div>
                        <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Hierarchy</label>
                        <Select
                            isMulti
                            placeholder="Select positions..."
                            options={formatOptions(filterOptions.positionGroups)}
                            value={formatOptions(filterOptions.positionGroups).filter(opt => 
                                filters.position_group?.includes(opt.value)
                            )}
                            onChange={(selected) => 
                                updateFilter('position_group', selected ? selected.map(s => s.value) : [])
                            }
                            styles={selectStyles}
                            className="text-sm"
                            isClearable
                            isSearchable
                            maxMenuHeight={300}
                        />
                    </div>

                    {/* Line Managers Filter */}
                    <div>
                        <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Line Managers</label>
                        <Select
                            isMulti
                            placeholder="Select managers..."
                            options={formatOptions(filterOptions.managers)}
                            value={formatOptions(filterOptions.managers).filter(opt => 
                                filters.line_manager?.includes(opt.value)
                            )}
                            onChange={(selected) => 
                                updateFilter('line_manager', selected ? selected.map(s => s.value) : [])
                            }
                            styles={selectStyles}
                            className="text-sm"
                            isClearable
                            isSearchable
                            maxMenuHeight={300}
                        />
                    </div>

                    {/* Units Filter */}
                    <div>
                        <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Units</label>
                        <Select
                            isMulti
                            placeholder="Select units..."
                            options={formatOptions(filterOptions.units)}
                            value={formatOptions(filterOptions.units).filter(opt => 
                                filters.unit?.includes(opt.value)
                            )}
                            onChange={(selected) => 
                                updateFilter('unit', selected ? selected.map(s => s.value) : [])
                            }
                            styles={selectStyles}
                            className="text-sm"
                            isClearable
                            isSearchable
                            maxMenuHeight={300}
                        />
                    </div>

                  

                    {/* Grading Level Filter */}
                    {filterOptions.gradingLevels && filterOptions.gradingLevels.length > 0 && (
                        <div>
                            <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Grading Level</label>
                            <Select
                                isMulti
                                placeholder="Select grading..."
                                options={formatOptions(filterOptions.gradingLevels)}
                                value={formatOptions(filterOptions.gradingLevels).filter(opt => 
                                    filters.grading_level?.includes(opt.value)
                                )}
                                onChange={(selected) => 
                                    updateFilter('grading_level', selected ? selected.map(s => s.value) : [])
                                }
                                styles={selectStyles}
                                className="text-sm"
                                isClearable
                                isSearchable
                                maxMenuHeight={300}
                            />
                        </div>
                    )}

                    {/* Gender Filter */}
                    {filterOptions.genders && filterOptions.genders.length > 0 && (
                        <div>
                            <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Gender</label>
                            <Select
                                isMulti
                                placeholder="Select gender..."
                                options={formatOptions(filterOptions.genders)}
                                value={formatOptions(filterOptions.genders).filter(opt => 
                                    filters.gender?.includes(opt.value)
                                )}
                                onChange={(selected) => 
                                    updateFilter('gender', selected ? selected.map(s => s.value) : [])
                                }
                                styles={selectStyles}
                                className="text-sm"
                                isClearable
                                isSearchable
                                maxMenuHeight={300}
                            />
                        </div>
                    )}
                </div>

                {/* Boolean Filters */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.show_top_level_only || false}
                            onChange={(e) => updateFilter('show_top_level_only', e.target.checked)}
                            className="w-4 h-4 text-almet-sapphire rounded focus:ring-almet-sapphire"
                        />
                        <span className={`text-xs ${textSecondary}`}>Top Level Only</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.managers_only || false}
                            onChange={(e) => updateFilter('managers_only', e.target.checked)}
                            className="w-4 h-4 text-almet-sapphire rounded focus:ring-almet-sapphire"
                        />
                        <span className={`text-xs ${textSecondary}`}>Managers Only</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default OrgChartFilters;