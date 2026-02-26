// src/components/news/TargetGroupManagement.jsx - Refined with Smaller Fonts & Checkbox
"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from '@/components/common/Toast';
import CustomCheckbox from '@/components/common/CustomCheckbox';
import { targetGroupService, employeeService, formatApiError } from '@/services/newsService';
import { Users, Plus, Search, Edit, Trash2, UserPlus, Tag, Calendar, X, Save, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import MultiSelect from '@/components/common/MultiSelect';

// Target Group Form Modal
function TargetGroupFormModal({ isOpen, onClose, onSave, group = null, darkMode = false, employees = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [],
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        members: group.member_ids || [],
        isActive: group.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        members: [],
        isActive: true
      });
    }
    setErrors({});
  }, [group, isOpen]);

  if (!isOpen) return null;

  const employeeOptions = employees.map(emp => ({
    id: emp.id,
    name: `${emp.name}`,
    label: `${emp.name}`,
    subtitle: `${emp.department_name || 'N/A'} • ${emp.business_function_code || 'N/A'}`,
    value: emp.id
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Group name is required';
    if (formData.name.trim().length < 3) newErrors.name = 'Group name must be at least 3 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.members.length === 0) newErrors.members = 'Please select at least one member';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: formatApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberChange = (fieldName, value) => {
    setFormData(prev => {
      const members = prev.members.includes(value)
        ? prev.members.filter(id => id !== value)
        : [...prev.members, value];
      
      return { ...prev, members };
    });
    setErrors(prev => ({ ...prev, members: null }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-2xl w-full shadow-2xl  ${
        darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b sticky top-0 z-10 ${
          darkMode 
            ? 'border-almet-comet bg-almet-cloud-burst' 
            : 'border-gray-100 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {group ? 'Edit Target Group' : 'Create Target Group'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className={`p-2 rounded-xl transition-colors ${
                darkMode 
                  ? 'hover:bg-almet-comet text-almet-bali-hai hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="space-y-4">
            
            {/* Group Name */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
              }`}>
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setErrors(prev => ({ ...prev, name: null }));
                }}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                  darkMode 
                    ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-waterloo focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
                }`}
                placeholder="e.g., Leadership Team, All Employees"
                maxLength={100}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
              }`}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  setErrors(prev => ({ ...prev, description: null }));
                }}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                  darkMode 
                    ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-waterloo focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
                }`}
                rows="3"
                placeholder="Brief description of this group's purpose"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className={`p-3 rounded-xl border ${
              darkMode ? 'bg-almet-san-juan/50 border-almet-comet' : 'bg-gray-50 border-gray-200'
            }`}>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <CustomCheckbox
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <div>
                  <span className={`text-xs font-medium block ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Active Group
                  </span>
                  <span className={`text-[10px] ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Only active groups can be used for news distribution
                  </span>
                </div>
              </label>
            </div>

            {/* Members Selection */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
              }`}>
                Group Members <span className="text-red-500">*</span>
              </label>
              
              <MultiSelect
                options={employeeOptions}
                selected={formData.members}
                onChange={handleMemberChange}
                placeholder="Select employees..."
                fieldName="members"
                darkMode={darkMode}
              />
              
              {errors.members && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.members}
                </p>
              )}
              
              <p className={`text-[10px] mt-1.5 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
              }`}>
                {formData.members.length} member(s) selected
              </p>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                darkMode 
                  ? 'bg-red-900/20 border-red-800 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span className="text-xs">{errors.submit}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 mt-5">
            <button
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all disabled:opacity-50 ${
                darkMode
                  ? 'border border-almet-comet text-almet-bali-hai hover:bg-almet-comet'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium shadow-lg shadow-almet-sapphire/20"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  {group ? 'Update Group' : 'Create Group'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Target Group Management Component
export default function TargetGroupManagement({ onBack }) {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [groups, setGroups] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGroups(),
        loadEmployees(),
        loadStatistics()
      ]);
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await targetGroupService.getTargetGroups();
      const groupsWithDetails = await Promise.all(
        (response.results || []).map(async (group) => {
          try {
            const detailedGroup = await targetGroupService.getTargetGroupById(group.id);
            return detailedGroup;
          } catch (error) {
            console.error(`Failed to load details for group ${group.id}:`, error);
            return group;
          }
        })
      );
      setGroups(groupsWithDetails);
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getEmployees({ page_size: 100 });
      setEmployees(response.results || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await targetGroupService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowFormModal(true);
  };

  const handleEditGroup = async (group) => {
    try {
      const detailedGroup = await targetGroupService.getTargetGroupById(group.id);
      const memberIds = detailedGroup.members_list?.map(m => m.id) || [];
      
      setEditingGroup({
        ...detailedGroup,
        member_ids: memberIds
      });
      setShowFormModal(true);
    } catch (error) {
      showError('Failed to load group details');
    }
  };

  const handleSaveGroup = async (formData) => {
    try {
      if (editingGroup) {
        await targetGroupService.updateTargetGroup(editingGroup.id, formData);
        showSuccess('Target group updated successfully');
      } else {
        await targetGroupService.createTargetGroup(formData);
        showSuccess('Target group created successfully');
      }
      await loadGroups();
      await loadStatistics();
      setShowFormModal(false);
      setEditingGroup(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteGroup = (group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await targetGroupService.deleteTargetGroup(selectedGroup.id);
      showSuccess('Target group deleted successfully');
      await loadGroups();
      await loadStatistics();
      setShowDeleteModal(false);
      setSelectedGroup(null);
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const getEmployeesByIds = (group) => {
    if (group.members_list && Array.isArray(group.members_list)) {
      return group.members_list;
    }
    const ids = group.member_ids || [];
    return employees.filter(emp => ids.includes(emp.id));
  };

  return (
    <DashboardLayout>
      <div className={`p-6 min-h-screen transition-colors ${
        darkMode ? 'bg-gray-900' : 'bg-almet-mystic'
      }`}>
        <div className=" mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {onBack && (
                  <button
                    onClick={onBack}
                    className={`flex items-center gap-1.5 text-xs mb-3 transition-colors group ${
                      darkMode 
                        ? 'text-almet-bali-hai hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to News
                  </button>
                )}
                <h1 className={`text-2xl font-bold mb-1.5 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Target Groups
                </h1>
                <p className={`text-xs ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                }`}>
                  Manage and organize employee groups for targeted communications
                </p>
              </div>
              <button
                onClick={handleCreateGroup}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-all font-medium text-xs shadow-lg shadow-almet-sapphire/20 hover:shadow-xl hover:shadow-almet-sapphire/30 hover:-translate-y-0.5"
              >
                <Plus size={16} />
                Create Group
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {statistics && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
                darkMode 
                  ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                  : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                    }`}>
                      Total Groups
                    </p>
                    <p className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {statistics.total_groups || 0}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    darkMode ? 'bg-sky-900/30' : 'bg-sky-50'
                  }`}>
                    <Users className={`h-5 w-5 ${
                      darkMode ? 'text-sky-400' : 'text-sky-600'
                    }`} />
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
                darkMode 
                  ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                  : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                    }`}>
                      Active Groups
                    </p>
                    <p className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {statistics.active_groups || 0}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    darkMode ? 'bg-green-900/30' : 'bg-green-50'
                  }`}>
                    <Tag className={`h-5 w-5 ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
                darkMode 
                  ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                  : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                    }`}>
                      Total Members
                    </p>
                    <p className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {statistics.total_unique_members || 0}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
                  }`}>
                    <UserPlus className={`h-5 w-5 ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className={`rounded-2xl p-3.5 mb-5 border ${
            darkMode 
              ? 'bg-almet-cloud-burst border-almet-comet' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search groups by name, description..."
                className={`w-full pl-10 pr-3 py-2.5 text-xs border rounded-xl outline-none transition-all ${
                  darkMode
                    ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-waterloo focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Groups List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-almet-sapphire" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className={`rounded-2xl p-12 text-center border ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet' 
                : 'bg-white border-gray-200'
            }`}>
              <Users className={`h-14 w-14 mx-auto mb-3 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-400'
              }`} />
              <h3 className={`text-base font-semibold mb-1.5 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                No Groups Found
              </h3>
              <p className={`text-xs mb-3 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
              }`}>
                {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first target group'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateGroup}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-all text-xs font-medium shadow-lg shadow-almet-sapphire/20"
                >
                  <Plus size={14} />
                  Create Group
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredGroups.map(group => {
                const members = getEmployeesByIds(group);
                
                return (
                  <div
                    key={group.id}
                    className={`rounded-2xl p-5 border transition-all group hover:shadow-lg ${
                      darkMode
                        ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50'
                        : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
                    }`}
                  >
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className={`text-sm font-semibold truncate ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {group.name}
                          </h3>
                          {group.is_active ? (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex-shrink-0 ${
                              darkMode 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-green-50 text-green-700'
                            }`}>
                              Active
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex-shrink-0 ${
                              darkMode 
                                ? 'bg-gray-700 text-gray-400' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className={`text-xs line-clamp-2 ${
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                        }`}>
                          {group.description}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode 
                              ? 'hover:bg-almet-comet text-almet-bali-hai hover:text-white' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode 
                              ? 'hover:bg-red-900/30 text-red-400' 
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Members Preview */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Users size={12} className={
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                        } />
                        <span className={`text-[10px] font-medium ${
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
                        }`}>
                          {group.member_count || 0} Member{group.member_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {members.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {members.slice(0, 3).map(member => (
                            <div
                              key={member.id}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${
                                darkMode 
                                  ? 'bg-almet-san-juan' 
                                  : 'bg-gray-50'
                              }`}
                            >
                              <div className="w-6 h-6 bg-gradient-to-br from-almet-sapphire to-almet-astral text-white rounded-full flex items-center justify-center text-[10px] font-medium">
                                {(member.full_name || member.first_name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-[10px] font-medium ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {member.full_name || `${member.first_name} ${member.last_name}`}
                                </span>
                                {member.department_name && (
                                  <span className={`text-[9px] ${
                                    darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                                  }`}>
                                    {member.department_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {members.length > 3 && (
                            <div className={`flex items-center px-2.5 py-1.5 rounded-xl ${
                              darkMode 
                                ? 'bg-almet-comet' 
                                : 'bg-gray-100'
                            }`}>
                              <span className={`text-[10px] font-medium ${
                                darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                              }`}>
                                +{members.length - 3} more
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className={`text-[10px] ${
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                        }`}>
                          No members assigned
                        </p>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className={`pt-3 border-t flex items-center justify-between text-[10px] ${
                      darkMode 
                        ? 'border-almet-comet text-almet-bali-hai' 
                        : 'border-gray-200 text-gray-600'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        Created {new Date(group.created_at).toLocaleDateString()}
                      </div>
                      <div className="font-medium">
                        {group.created_by_name || 'System'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Form Modal */}
          <TargetGroupFormModal
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setEditingGroup(null);
            }}
            onSave={handleSaveGroup}
            group={editingGroup}
            darkMode={darkMode}
            employees={employees}
          />

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedGroup && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`rounded-2xl max-w-md w-full p-5 shadow-2xl ${
                darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl ${
                    darkMode ? 'bg-red-900/30' : 'bg-red-50'
                  }`}>
                    <AlertCircle className={`h-5 w-5 ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Delete Group
                    </h3>
                    <p className={`text-xs ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                    }`}>
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                
                <p className={`text-xs mb-5 ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
                }`}>
                  Are you sure you want to delete <span className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    "{selectedGroup.name}"
                  </span>? 
                  This will remove the group but will not affect the member employees.
                </p>
                
                <div className="flex gap-2.5 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedGroup(null);
                    }}
                    className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
                      darkMode
                        ? 'border border-almet-comet text-almet-bali-hai hover:bg-almet-comet'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                  >
                    Delete Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}