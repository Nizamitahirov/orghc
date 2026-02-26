// pages/structure/job-descriptions/JobDescriptionSettings/page.jsx - COMPLETE with Nested Items
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Save,
  X,
  Settings,
  Shield,
  Package,
  Gift,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  List
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { ToastProvider, useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import jobDescriptionService from '@/services/jobDescriptionService';

const JobDescriptionSettingsContent = () => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  // Theme classes
  const bgApp = darkMode ? "bg-gray-900" : "bg-almet-mystic";
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // State management
  const [activeTab, setActiveTab] = useState('access-matrix');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingItem, setEditingItem] = useState(null);
  
  // ADDED: Item modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemModalMode, setItemModalMode] = useState('create');
  const [editingItemChild, setEditingItemChild] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);
  
  // ADDED: Expanded items tracking
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'default',
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });
  
  // Data states
  const [accessMatrix, setAccessMatrix] = useState([]);
  const [businessResources, setBusinessResources] = useState([]);
  const [companyBenefits, setCompanyBenefits] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  
  // ADDED: Item form state
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAccessMatrix(),
        fetchBusinessResources(),
        fetchCompanyBenefits()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessMatrix = async () => {
    try {
      const response = await jobDescriptionService.getAccessMatrix({ page_size: 1000 });
      setAccessMatrix(response.results || []);
    } catch (error) {
      console.error('Error fetching access matrix:', error);
    }
  };

  const fetchBusinessResources = async () => {
    try {
      const response = await jobDescriptionService.getBusinessResources({ page_size: 1000 });
      setBusinessResources(response.results || []);
    } catch (error) {
      console.error('Error fetching business resources:', error);
    }
  };

  const fetchCompanyBenefits = async () => {
    try {
      const response = await jobDescriptionService.getCompanyBenefits({ page_size: 1000 });
      setCompanyBenefits(response.results || []);
    } catch (error) {
      console.error('Error fetching company benefits:', error);
    }
  };

  const handleBack = () => {
    router.push('/structure/job-descriptions');
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'access-matrix':
        return accessMatrix;
      case 'business-resources':
        return businessResources;
      case 'company-benefits':
        return companyBenefits;
      default:
        return [];
    }
  };

  const getFilteredData = () => {
    const data = getCurrentData();
    if (!searchTerm) return data;
    
    return data.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
    setEditingItem(null);
    setModalMode('create');
  };
  
  // ADDED: Reset item form
  const resetItemForm = () => {
    setItemFormData({
      name: '',
      description: '',
      is_active: true
    });
    setEditingItemChild(null);
    setItemModalMode('create');
    setSelectedParentId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setFormData({
      name: item.name || '',
      description: item.description || '',
      is_active: item.is_active !== false
    });
    setEditingItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };
  
  // ADDED: Item modal handlers
  const openCreateItemModal = (parentId) => {
    resetItemForm();
    setSelectedParentId(parentId);
    setItemModalMode('create');
    setShowItemModal(true);
  };
  
  const openEditItemModal = (parentId, item) => {
    setItemFormData({
      name: item.name || '',
      description: item.description || '',
      is_active: item.is_active !== false
    });
    setSelectedParentId(parentId);
    setEditingItemChild(item);
    setItemModalMode('edit');
    setShowItemModal(true);
  };
  
  const closeItemModal = () => {
    setShowItemModal(false);
    resetItemForm();
  };
  
  // ADDED: Toggle expanded state
  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      showError('Name is required');
      return;
    }

    try {
      setActionLoading(true);
      
      const apiData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        is_active: formData.is_active
      };

      if (modalMode === 'create') {
        await createItem(apiData);
      } else {
        await updateItem(editingItem.id, apiData);
      }
      
      closeModal();
      await fetchData();
      showSuccess(
        `${getTabDisplayName()} ${modalMode === 'create' ? 'created' : 'updated'} successfully!`
      );
    } catch (error) {
      console.error('Error saving item:', error);
      
      let errorMessage = `Error ${modalMode === 'create' ? 'creating' : 'updating'} ${getTabDisplayName().toLowerCase()}`;
      
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const errorDetails = [];
          Object.keys(error.response.data).forEach(field => {
            const fieldErrors = Array.isArray(error.response.data[field]) 
              ? error.response.data[field].join(', ')
              : error.response.data[field];
            errorDetails.push(`${field}: ${fieldErrors}`);
          });
          errorMessage += `: ${errorDetails.join(', ')}`;
        } else {
          errorMessage += `: ${error.response.data}`;
        }
      }
      
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };
  
  // ADDED: Handle item submit
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    
    if (!itemFormData.name?.trim()) {
      showError('Item name is required');
      return;
    }
    
    if (!selectedParentId) {
      showError('Parent item not selected');
      return;
    }

    try {
      setActionLoading(true);
      
      const apiData = {
        name: itemFormData.name.trim(),
        description: itemFormData.description?.trim() || '',
        is_active: itemFormData.is_active
      };

      if (itemModalMode === 'create') {
        await createChildItem(selectedParentId, apiData);
      } else {
        await updateChildItem(selectedParentId, editingItemChild.id, apiData);
      }
      
      closeItemModal();
      await fetchData();
      
      // Expand parent after adding item
      setExpandedItems(prev => new Set([...prev, selectedParentId]));
      
      showSuccess(
        `Item ${itemModalMode === 'create' ? 'added' : 'updated'} successfully!`
      );
    } catch (error) {
      console.error('Error saving item:', error);
      showError(`Error ${itemModalMode === 'create' ? 'adding' : 'updating'} item`);
    } finally {
      setActionLoading(false);
    }
  };

  const createItem = async (data) => {
    switch (activeTab) {
      case 'access-matrix':
        return await jobDescriptionService.createAccessMatrix(data);
      case 'business-resources':
        return await jobDescriptionService.createBusinessResource(data);
      case 'company-benefits':
        return await jobDescriptionService.createCompanyBenefit(data);
      default:
        throw new Error('Invalid tab');
    }
  };

  const updateItem = async (id, data) => {
    switch (activeTab) {
      case 'access-matrix':
        return await jobDescriptionService.updateAccessMatrix(id, data);
      case 'business-resources':
        return await jobDescriptionService.updateBusinessResource(id, data);
      case 'company-benefits':
        return await jobDescriptionService.updateCompanyBenefit(id, data);
      default:
        throw new Error('Invalid tab');
    }
  };
  
  // ADDED: Child item CRUD operations
  const createChildItem = async (parentId, data) => {
    switch (activeTab) {
      case 'access-matrix':
        return await jobDescriptionService.addAccessMatrixItem(parentId, data);
      case 'business-resources':
        return await jobDescriptionService.addBusinessResourceItem(parentId, data);
      case 'company-benefits':
        return await jobDescriptionService.addCompanyBenefitItem(parentId, data);
      default:
        throw new Error('Invalid tab');
    }
  };
  
  const updateChildItem = async (parentId, itemId, data) => {
    switch (activeTab) {
      case 'access-matrix':
        return await jobDescriptionService.updateAccessMatrixItem(parentId, itemId, data);
      case 'business-resources':
        return await jobDescriptionService.updateBusinessResourceItem(parentId, itemId, data);
      case 'company-benefits':
        return await jobDescriptionService.updateCompanyBenefitItem(parentId, itemId, data);
      default:
        throw new Error('Invalid tab');
    }
  };
  
  const deleteChildItem = async (parentId, itemId) => {
    switch (activeTab) {
      case 'access-matrix':
        return await jobDescriptionService.deleteAccessMatrixItem(parentId, itemId);
      case 'business-resources':
        return await jobDescriptionService.deleteBusinessResourceItem(parentId, itemId);
      case 'company-benefits':
        return await jobDescriptionService.deleteCompanyBenefitItem(parentId, itemId);
      default:
        throw new Error('Invalid tab');
    }
  };

  const handleDelete = async (id, itemName) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: `Delete ${getTabDisplayName()}`,
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone and will also delete all nested items.`,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          
          switch (activeTab) {
            case 'access-matrix':
              await jobDescriptionService.deleteAccessMatrix(id);
              break;
            case 'business-resources':
              await jobDescriptionService.deleteBusinessResource(id);
              break;
            case 'company-benefits':
              await jobDescriptionService.deleteCompanyBenefit(id);
              break;
            default:
              throw new Error('Invalid tab');
          }
          
          await fetchData();
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
          showSuccess(`${getTabDisplayName()} deleted successfully!`);
        } catch (error) {
          console.error('Error deleting item:', error);
          setConfirmModal(prev => ({ ...prev, loading: false }));
          showError(`Error deleting ${getTabDisplayName().toLowerCase()}`);
        }
      }
    });
  };
  
  // ADDED: Handle child item delete
  const handleDeleteChildItem = async (parentId, itemId, itemName) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Item',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          
          await deleteChildItem(parentId, itemId);
          
          await fetchData();
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
          showSuccess('Item deleted successfully!');
        } catch (error) {
          console.error('Error deleting item:', error);
          setConfirmModal(prev => ({ ...prev, loading: false }));
          showError('Error deleting item');
        }
      }
    });
  };

  const closeConfirmModal = () => {
    if (!confirmModal.loading) {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const getTabDisplayName = () => {
    switch (activeTab) {
      case 'access-matrix':
        return 'Access Matrix';
      case 'business-resources':
        return 'Business Resource';
      case 'company-benefits':
        return 'Company Benefit';
      default:
        return 'Item';
    }
  };

  const tabs = [
    { id: 'access-matrix', name: 'Access Matrix', icon: Shield },
    { id: 'business-resources', name: 'Business Resources', icon: Package },
    { id: 'company-benefits', name: 'Company Benefits', icon: Gift }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-almet-sapphire"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} p-6`}>
        <div className=" mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${borderColor} 
                    ${textSecondary} hover:${textPrimary} hover:border-almet-sapphire/50 
                    transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md`}
                  title="Back to Job Descriptions"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Back</span>
                </button>
                
                <div>
                  <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary} flex items-center gap-3`}>
                    <Settings size={28} />
                    Job Description Settings
                  </h1>
                  <p className={`${textSecondary} mt-1 text-sm lg:text-base`}>
                    Manage access matrix, business resources, and company benefits with nested items
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`flex space-x-1 ${bgAccent} rounded-lg p-1 mb-6`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchTerm('');
                      setExpandedItems(new Set());
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                      activeTab === tab.id
                        ? `${bgCard} text-almet-sapphire shadow-sm`
                        : `${textSecondary} hover:${textPrimary}`
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search and Actions */}
          <div className={`${bgCard} rounded-lg p-4 lg:p-6 mb-6 border ${borderColor} shadow-sm`}>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={18} />
                <input
                  type="text"
                  placeholder={`Search ${getTabDisplayName().toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                    focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                />
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg 
                  hover:bg-almet-astral transition-colors text-sm font-medium whitespace-nowrap"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Create New</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {/* Data Table with Nested Items */}
          <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm`}>
            <div className="p-4 lg:p-6">
              <div className="space-y-3">
                {getFilteredData().map(item => {
                  const isExpanded = expandedItems.has(item.id);
                  const hasItems = item.items && item.items.length > 0;
                  
                  return (
                    <div key={item.id} className={`border ${borderColor} rounded-lg overflow-hidden`}>
                      {/* Parent Item */}
                      <div className={`p-4 ${bgCardHover} hover:shadow-sm transition-all`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Expand/Collapse Button */}
                            <button
                              onClick={() => toggleExpanded(item.id)}
                              className={`p-1 ${textMuted} hover:${textPrimary} transition-colors`}
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className={`text-base lg:text-lg font-semibold ${textPrimary} truncate`}>
                                  {item.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {item.is_active ? (
                                    <>
                                      <Eye size={12} className="text-green-600" />
                                      <span className="text-xs text-green-600 font-medium">Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff size={12} className="text-gray-400" />
                                      <span className="text-xs text-gray-400 font-medium">Inactive</span>
                                    </>
                                  )}
                                  {hasItems && (
                                    <span className={`px-2 py-1 rounded-full text-xs ${bgAccent} ${textMuted}`}>
                                      {item.items_count || item.items.length} items
                                    </span>
                                  )}
                                </div>
                              </div>
                              {item.description && (
                                <p className={`text-sm ${textSecondary} mb-2 line-clamp-2`}>{item.description}</p>
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                                <span className={`${textMuted}`}>
                                  Created: {new Date(item.created_at).toLocaleDateString()}
                                </span>
                                <span className={`${textMuted}`}>
                                  By: {item.created_by_name}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => openCreateItemModal(item.id)}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded 
                                transition-colors disabled:opacity-50"
                              title="Add Item"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              disabled={actionLoading}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded 
                                transition-colors disabled:opacity-50"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              disabled={actionLoading}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded 
                                transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Nested Items */}
                      {isExpanded && hasItems && (
                        <div className={`border-t ${borderColor} ${bgAccent} p-4`}>
                          <div className="space-y-2">
                            {item.items.map(childItem => (
                              <div 
                                key={childItem.id} 
                                className={`p-3 ${bgCard} rounded-lg border ${borderColor} hover:shadow-sm transition-all`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <List size={14} className={textMuted} />
                                      <h4 className={`text-sm font-semibold ${textPrimary} truncate`}>
                                        {childItem.name}
                                      </h4>
                                      {childItem.is_active !== undefined && (
                                        <div className="flex items-center gap-1">
                                          {childItem.is_active ? (
                                            <Eye size={10} className="text-green-600" />
                                          ) : (
                                            <EyeOff size={10} className="text-gray-400" />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {childItem.description && (
                                      <p className={`text-xs ${textSecondary} line-clamp-1 ml-5`}>
                                        {childItem.description}
                                      </p>
                                    )}
                                    {childItem.full_path && (
                                      <p className={`text-xs ${textMuted} mt-1 ml-5`}>
                                        Path: {childItem.full_path}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 ml-4">
                                    <button
                                      onClick={() => openEditItemModal(item.id, childItem)}
                                      disabled={actionLoading}
                                      className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded 
                                        transition-colors disabled:opacity-50"
                                      title="Edit Item"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteChildItem(item.id, childItem.id, childItem.name)}
                                      disabled={actionLoading}
                                      className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded 
                                        transition-colors disabled:opacity-50"
                                      title="Delete Item"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Empty State for Items */}
                      {isExpanded && !hasItems && (
                        <div className={`border-t ${borderColor} ${bgAccent} p-4`}>
                          <div className="text-center py-6">
                            <List size={24} className={`mx-auto ${textMuted} mb-2`} />
                            <p className={`text-sm ${textMuted}`}>No items added yet</p>
                            <button
                              onClick={() => openCreateItemModal(item.id)}
                              className="mt-2 text-xs text-almet-sapphire hover:text-almet-astral font-medium"
                            >
                              Add first item
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Empty State */}
              {getFilteredData().length === 0 && (
                <div className="text-center py-12">
                  {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Settings, { 
                    className: `mx-auto h-12 w-12 ${textMuted} mb-4` 
                  })}
                  <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>
                    No {getTabDisplayName()} Found
                  </h3>
                  <p className={textMuted}>
                    {searchTerm ? 'Try adjusting your search criteria' : `Create your first ${getTabDisplayName().toLowerCase()} to get started`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Parent Create/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-lg w-full max-w-md border ${borderColor} shadow-xl`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${textPrimary}`}>
                      {modalMode === 'create' ? 'Create' : 'Edit'} {getTabDisplayName()}
                    </h3>
                    <button
                      onClick={closeModal}
                      className={`p-1 ${textMuted} hover:${textPrimary} transition-colors`}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                          focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                        placeholder={`Enter ${getTabDisplayName().toLowerCase()} name`}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows="3"
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                          focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                        placeholder={`Enter ${getTabDisplayName().toLowerCase()} description`}
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="mr-2 text-almet-sapphire focus:ring-almet-sapphire"
                      />
                      <label htmlFor="is_active" className={`text-sm ${textSecondary}`}>
                        Active
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-almet-comet">
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={actionLoading}
                        className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
                          transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                      >
                        {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        <Save size={16} />
                        {modalMode === 'create' ? 'Create' : 'Update'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {/* Item Create/Edit Modal */}
          {showItemModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-lg w-full max-w-md border ${borderColor} shadow-xl`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${textPrimary}`}>
                      {itemModalMode === 'create' ? 'Add New' : 'Edit'} Item
                    </h3>
                    <button
                      onClick={closeItemModal}
                      className={`p-1 ${textMuted} hover:${textPrimary} transition-colors`}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleItemSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={itemFormData.name}
                        onChange={(e) => setItemFormData({...itemFormData, name: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                          focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                        placeholder="Enter item name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Description
                      </label>
                      <textarea
                        value={itemFormData.description}
                        onChange={(e) => setItemFormData({...itemFormData, description: e.target.value})}
                        rows="3"
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                          focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                        placeholder="Enter item description"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="item_is_active"
                        checked={itemFormData.is_active}
                        onChange={(e) => setItemFormData({...itemFormData, is_active: e.target.checked})}
                        className="mr-2 text-almet-sapphire focus:ring-almet-sapphire"
                      />
                      <label htmlFor="item_is_active" className={`text-sm ${textSecondary}`}>
                        Active
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-almet-comet">
                      <button
                        type="button"
                        onClick={closeItemModal}
                        disabled={actionLoading}
                        className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
                          transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                      >
                        {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        <Save size={16} />
                        {itemModalMode === 'create' ? 'Add Item' : 'Update Item'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
            loading={confirmModal.loading}
            darkMode={darkMode}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

// Wrap with ToastProvider
const JobDescriptionSettings = () => {
  return (
    <ToastProvider>
      <JobDescriptionSettingsContent />
    </ToastProvider>
  );
};

export default JobDescriptionSettings;