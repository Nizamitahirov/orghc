'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Users, Check } from 'lucide-react';
import taskService from '@/services/taskService';
import { useTheme } from '@/components/common/ThemeProvider';

export default function EmployeeMultiSelect({ 
  selectedEmployees = [], 
  onChange, 
  placeholder = "Select employees...",
  multiple = true,
  className = ""
}) {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-mystic";
  const bgHover = darkMode ? "bg-gray-700" : "bg-almet-mystic/30";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/20";

  // Fetch employees
  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [searchTerm, isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const result = await taskService.getAllEmployees(searchTerm);
      if (result.success) {
        setEmployees(result.data || []);
      } else {
        setEmployees([]);
        console.error("Failed to fetch employees:", result.error);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (employee) => {
    if (multiple) {
      const isSelected = selectedEmployees.some(e => e.id === employee.id);
      if (isSelected) {
        onChange(selectedEmployees.filter(e => e.id !== employee.id));
      } else {
        onChange([...selectedEmployees, employee]);
      }
    } else {
      onChange([employee]);
      setIsOpen(false);
    }
  };

  const handleRemove = (employeeId, e) => {
    e.stopPropagation();
    onChange(selectedEmployees.filter(e => e.id !== employeeId));
  };

  const isSelected = (employeeId) => {
    return selectedEmployees.some(e => e.id === employeeId);
  };

  const getButtonText = () => {
    if (selectedEmployees.length === 0) return placeholder;
    if (selectedEmployees.length === 1) return selectedEmployees[0].full_name || selectedEmployees[0].name;
    return `${selectedEmployees.length} employees selected`;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Main Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs border ${borderColor} rounded-lg ${bgCard} ${textPrimary} hover:border-almet-sapphire/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/20`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Users size={14} className="flex-shrink-0 text-almet-sapphire" />
          <span className={`truncate ${selectedEmployees.length === 0 ? textMuted : textPrimary}`}>
            {getButtonText()}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedEmployees.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-almet-sapphire text-white">
              {selectedEmployees.length}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${textMuted}`} />
        </div>
      </button>

      {/* Selected Employees Tags */}
      {selectedEmployees.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedEmployees.map(emp => (
            <div key={emp.id} className={`group flex items-center gap-1.5 pl-1.5 pr-1 py-0.5 ${bgAccent} border ${borderColor} rounded text-xs transition-all duration-200 hover:border-almet-sapphire/50`}>
              {emp.profile_image_url ? (
                <img src={emp.profile_image_url} alt={emp.full_name || emp.name} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center text-[8px] font-bold text-white">
                  {(emp.full_name || emp.name).charAt(0)}
                </div>
              )}
              <span className={`${textPrimary} font-medium max-w-[100px] truncate`}>{emp.full_name || emp.name}</span>
              <button onClick={(e) => handleRemove(emp.id, e)} className={`${textMuted} hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20`}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 border ${borderColor} rounded-lg ${bgCard} shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
          {/* Search */}
          <div className={`p-2.5 border-b ${borderColor}`}>
            <div className="relative">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${textMuted}`} size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees..."
                autoFocus
                className={`w-full pl-8 pr-3 py-1.5 text-xs border ${borderColor} rounded-lg ${bgCard} ${textPrimary} placeholder:${textMuted} focus:outline-none focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all`}
              />
              {loading && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Employee List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {employees.length === 0 && !loading ? (
              <div className="p-6 text-center">
                <Users size={28} className={`mx-auto ${textMuted} mb-2`} />
                <p className={`text-xs ${textMuted}`}>
                  {searchTerm ? 'No employees found' : 'No employees available'}
                </p>
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {employees.map(emp => {
                  const selected = isSelected(emp.id);
                  
                  return (
                    <button key={emp.id} onClick={() => handleSelect(emp)} className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-all duration-200 group ${selected ? 'bg-almet-sapphire/10 border border-almet-sapphire/30' : `hover:${bgHover} border border-transparent`}`}>
                      {/* Avatar */}
                      {emp.profile_image_url ? (
                        <img src={emp.profile_image_url} alt={emp.full_name || emp.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-almet-mystic group-hover:ring-almet-sapphire/30 transition-all" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center font-bold text-white text-xs ring-2 ring-almet-mystic group-hover:ring-almet-sapphire/30 transition-all">
                          {(emp.full_name || emp.name).charAt(0)}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className={`font-semibold text-xs ${textPrimary} truncate`}>
                          {emp.full_name || emp.name}
                        </div>
                        {emp.job_title && (
                          <div className={`text-[10px] ${textSecondary} truncate`}>
                            {emp.job_title}
                          </div>
                        )}
                        {emp.department && (
                          <div className={`text-[10px] ${textMuted} truncate`}>
                            {emp.department}
                          </div>
                        )}
                      </div>

                      {/* Checkbox */}
                      {selected && (
                        <div className="flex-shrink-0 w-4.5 h-4.5 rounded-full bg-almet-sapphire flex items-center justify-center">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedEmployees.length > 0 && (
            <div className={`p-2.5 border-t ${borderColor} ${bgAccent}`}>
              <button onClick={() => onChange([])} className="text-[10px] font-semibold text-red-500 hover:text-red-600 transition-colors">
                Clear all ({selectedEmployees.length})
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? '#4B5563 #374151' : '#90a0b9 #e7ebf1'};
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#374151' : '#e7ebf1'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#6B7280' : '#90a0b9'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #30539b;
        }
      `}</style>
    </div>
  );
}