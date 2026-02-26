import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CheckCircle,
  Users,
  Tag,
  FileText,
  Search,
  RefreshCw,
  Shield,
  Calendar,
  Zap,
  Bell,
  Loader
} from 'lucide-react';

// Import components and providers
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import ConfirmationModal from '../common/ConfirmationModal';
import SearchableDropdown from '../common/SearchableDropdown';
import { useToast } from '../common/Toast';
import { referenceDataAPI } from '@/store/api/referenceDataAPI';

const WorkforceSettings = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('status');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  
  const [employeeStatuses, setEmployeeStatuses] = useState([]);
  const [employeeTags, setEmployeeTags] = useState([]);
  const [contractConfigs, setContractConfigs] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Clean, minimal section configurations
  const sections = [
    {
      id: 'status',
      label: 'Status Types',
      icon: Users,
      description: 'Employee status management',
      count: employeeStatuses?.length || 0,
      color: 'almet-sapphire'
    },
    {
      id: 'tags',
      label: 'Tags',
      icon: Tag,
      description: 'Employee categorization',
      count: employeeTags?.length || 0,
      color: 'emerald-600'
    },
    {
      id: 'contracts',
      label: 'Contracts',
      icon: FileText,
      description: 'Contract configurations',
      count: contractConfigs?.length || 0,
      color: 'purple-600'
    }
  ];

  // Load data on mount and section change
  useEffect(() => {
    loadSectionData();
  }, [activeSection]);

  const loadSectionData = async () => {
    setLoading(true);
    try {
      let response;
      
      switch (activeSection) {
        case 'status':
          response = await referenceDataAPI.getEmployeeStatuses();
          const statusData = response?.data?.results || response?.results || response?.data || [];
          setEmployeeStatuses(Array.isArray(statusData) ? statusData : []);
          break;
          
        case 'tags':
          response = await referenceDataAPI.getEmployeeTags();
          const tagsData = response?.data?.results || response?.results || response?.data || [];
          setEmployeeTags(Array.isArray(tagsData) ? tagsData : []);
          break;
          
        case 'contracts':
          response = await referenceDataAPI.getContractConfigs();
          const contractData = response?.data?.results || response?.results || response?.data || [];
          setContractConfigs(Array.isArray(contractData) ? contractData : []);
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${activeSection} data:`, error);
      showError(`Failed to load ${activeSection} data`);
      switch (activeSection) {
        case 'status':
          setEmployeeStatuses([]);
          break;
        case 'tags':
          setEmployeeTags([]);
          break;
        case 'contracts':
          setContractConfigs([]);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let response;
      
      if (modalType === 'create') {
        switch (activeSection) {
          case 'status':
            response = await referenceDataAPI.createEmployeeStatus(formData);
            break;
          case 'tags':
            response = await referenceDataAPI.createEmployeeTag(formData);
            break;
          case 'contracts':
            response = await referenceDataAPI.createContractConfig(formData);
            break;
        }
        showSuccess(`${getSectionLabel()} created successfully`);
      } else {
        switch (activeSection) {
          case 'status':
            response = await referenceDataAPI.updateEmployeeStatus(editingItem.id, formData);
            break;
          case 'tags':
            response = await referenceDataAPI.updateEmployeeTag(editingItem.id, formData);
            break;
          case 'contracts':
            response = await referenceDataAPI.updateContractConfig(editingItem.id, formData);
            break;
        }
        showSuccess(`${getSectionLabel()} updated successfully`);
      }
      
      await loadSectionData();
      setShowModal(false);
      setFormData({});
      setEditingItem(null);
    } catch (error) {
      console.error('Save failed:', error);
      showError(`Failed to save ${getSectionLabel().toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  }, [modalType, formData, editingItem, activeSection, showSuccess, showError]);

  const handleDelete = useCallback(async () => {
    if (!deleteItem) return;
    
    try {
      setLoading(true);
      
      switch (activeSection) {
        case 'status':
          await referenceDataAPI.deleteEmployeeStatus(deleteItem.id);
          break;
        case 'tags':
          await referenceDataAPI.deleteEmployeeTag(deleteItem.id);
          break;
        case 'contracts':
          await referenceDataAPI.deleteContractConfig(deleteItem.id);
          break;
      }
      
      showSuccess(`${getSectionLabel()} deleted successfully`);
      await loadSectionData();
      setShowDeleteModal(false);
      setDeleteItem(null);
    } catch (error) {
      console.error('Delete failed:', error);
      showError(`Failed to delete ${getSectionLabel().toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [deleteItem, activeSection, showSuccess, showError]);

  const getSectionLabel = () => {
    const section = sections.find(s => s.id === activeSection);
    return section ? section.label : 'Item';
  };

  const getCurrentData = () => {
    switch (activeSection) {
      case 'status':
        return Array.isArray(employeeStatuses) ? employeeStatuses : [];
      case 'tags':
        return Array.isArray(employeeTags) ? employeeTags : [];
      case 'contracts':
        return Array.isArray(contractConfigs) ? contractConfigs : [];
      default:
        return [];
    }
  };

  const filteredData = useMemo(() => {
    const data = getCurrentData();
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      const name = (item.name || item.display_name || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      const type = (item.status_type || item.tag_type || item.contract_type || '').toLowerCase();
      
      return name.includes(term) || description.includes(term) || type.includes(term);
    });
  }, [searchTerm, activeSection, employeeStatuses, employeeTags, contractConfigs]);

  const openCreateModal = () => {
    setModalType('create');
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalType('edit');
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const openDeleteModal = (item) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  // Simplified status form
  const renderStatusForm = () => (
    <div className="space-y-4">
   
        <div>
          <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
            Status Name
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white"
            placeholder="Enter status name"
            required
          />
        </div>

      

       
      

      <div>
        <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 text-sm border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white"
          rows="3"
          placeholder="Enter description"
        />
      </div>

     
    </div>
  );

  // Simplified tag form
  const renderTagForm = () => (
    <div className="space-y-4">
      
        <div>
          <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
            Tag Name
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white"
            placeholder="Enter tag name"
            required
          />
        </div>

      
 

      <div>
        <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 text-sm outline-0 border border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white"
          rows="3"
          placeholder="Enter description"
        />
      </div>
    </div>
  );

  // Simplified contract form
  const renderContractForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
            Contract Type
          </label>
          <input
            type="text"
            value={formData.contract_type || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, contract_type: e.target.value }))}
            className="w-full px-3 py-2 text-sm border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white"
            placeholder="e.g., PERMANENT"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={formData.display_name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white"
            placeholder="e.g., Permanent Contract"
            required
          />
        </div>


        <div>
          <label className="block text-sm font-medium  text-almet-cloud-burst dark:text-white mb-2">
            Probation Days
          </label>
          <input
            type="number"
            value={formData.probation_days || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, probation_days: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 text-sm border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={formData.enable_auto_transitions || false}
            onChange={(e) => setFormData(prev => ({ ...prev, enable_auto_transitions: e.target.checked }))}
            className="h-4 w-4 text-almet-sapphire focus:ring-almet-sapphire border-almet-waterloo rounded mr-2"
          />
          <span className="text-almet-cloud-burst dark:text-white">Enable Auto Transitions</span>
        </label>
      </div>
    </div>
  );

  // Clean, minimal data table
  const renderDataTable = () => {
    const data = filteredData;
    const currentSection = sections.find(s => s.id === activeSection);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-2 text-almet-waterloo">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-almet-waterloo dark:text-almet-bali-hai mb-4">
            {searchTerm ? 'No items match your search' : `No ${currentSection?.label.toLowerCase()} found`}
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 bg-almet-sapphire text-white text-sm rounded-lg hover:bg-almet-astral transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {getSectionLabel()}
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-lg border border-almet-mystic dark:border-almet-comet">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-almet-mystic/20 dark:bg-almet-comet/20 border-b border-almet-mystic dark:border-almet-comet">
              <th className="text-left p-3 font-medium text-almet-cloud-burst dark:text-white">
                {activeSection === 'contracts' ? 'Contract' : 'Name'}
              </th>
              {activeSection === 'status' && (
                <>
                  <th className="text-left p-3 font-medium text-almet-cloud-burst dark:text-white">Type</th>
                  <th className="text-left p-3 font-medium text-almet-cloud-burst dark:text-white">Color</th>
                </>
              )}
            
              {activeSection === 'contracts' && (
                <>
                  <th className="text-left p-3 font-medium text-almet-cloud-burst dark:text-white">Type</th>
                  <th className="text-left p-3 font-medium text-almet-cloud-burst dark:text-white">Duration</th>
                </>
              )}
              <th className="text-left p-3 font-medium text-almet-cloud-burst dark:text-white">Usage</th>
              <th className="text-left p-3 font-medium text-almet-cloud-burst dark:text-white">Status</th>
              <th className="text-right p-3 font-medium text-almet-cloud-burst dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-almet-mystic dark:divide-almet-comet">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-almet-mystic/10 dark:hover:bg-almet-comet/10 group">
                <td className="p-3">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: item.color || '#30539b' }}
                    />
                    <div>
                      <div className="font-medium text-almet-cloud-burst dark:text-white">
                        {item.name || item.display_name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                {activeSection === 'status' && (
                  <>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-almet-mystic/30 text-almet-cloud-burst dark:bg-almet-comet/30 dark:text-almet-bali-hai">
                        {item.status_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {item.color}
                        </span>
                      </div>
                    </td>
                  </>
                )}
                
             
                {activeSection === 'contracts' && (
                  <>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-almet-mystic/30 text-almet-cloud-burst dark:bg-almet-comet/30 dark:text-almet-bali-hai">
                        {item.contract_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-almet-cloud-burst dark:text-white">
                       Probation days : {item.probation_days}
                      </span>
                    </td>
                  </>
                )}
                
                <td className="p-3">
                  <span className="text-almet-cloud-burst dark:text-white">
                    {item.employee_count || 0}
                  </span>
                </td>
                
                <td className="p-3">
                  {item.is_active ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      Inactive
                    </span>
                  )}
                </td>
                
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-1 ">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(item)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete"
                      disabled={item.employee_count > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="  p-6 min-h-screen  space-y-6">
        {/* Clean Header */}
        <div className="bg-white   dark:bg-almet-cloud-burst rounded-lg shadow-sm border border-almet-mystic dark:border-almet-comet">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-almet-sapphire rounded-lg mr-3">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">
                    Workforce Settings
                  </h1>
                  <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                    Manage employee status, tags and contract configurations
                  </p>
                </div>
              </div>
              
            
            </div>

            {/* Simple section tabs */}
            <div className="flex mt-6 border-b border-almet-mystic dark:border-almet-comet">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                const Icon = section.icon;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center px-4 py-3 text-sm transition-colors relative ${
                      isActive
                        ? 'text-almet-sapphire border-b-2 border-almet-sapphire'
                        : 'text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {section.label}
                    <span className="ml-2 px-2 py-1 text-xs bg-almet-mystic/30 text-almet-waterloo rounded">
                      {section.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-sm border border-almet-mystic dark:border-almet-comet">
          {/* Section header with search and add button */}
          <div className="p-4 border-b border-almet-mystic dark:border-almet-comet">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-almet-cloud-burst dark:text-white">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                  {sections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-almet-waterloo w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm outline-0 border border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white w-48"
                  />
                </div>
                
                {/* Add button */}
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center px-4 py-2 bg-almet-sapphire text-white text-sm rounded-lg hover:bg-almet-astral transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {getSectionLabel()}
                </button>
              </div>
            </div>
          </div>

          {/* Data table */}
          <div className="p-4">
            {renderDataTable()}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-almet-mystic dark:border-almet-comet">
              {/* Modal Header */}
              <div className="p-4 border-b border-almet-mystic dark:border-almet-comet">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white">
                    {modalType === 'create' ? 'Create' : 'Edit'} {getSectionLabel()}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-140px)]">
                <div className="p-4 overflow-y-auto flex-1">
                  {activeSection === 'status' && renderStatusForm()}
                  {activeSection === 'tags' && renderTagForm()}
                  {activeSection === 'contracts' && renderContractForm()}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-almet-mystic dark:border-almet-comet bg-almet-mystic/10 dark:bg-almet-comet/10">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm text-almet-waterloo dark:text-almet-bali-hai bg-white dark:bg-almet-comet border border-almet-mystic dark:border-almet-comet rounded-lg hover:bg-almet-mystic/20 dark:hover:bg-almet-comet/40 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 bg-almet-sapphire text-white text-sm rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {modalType === 'create' ? 'Create' : 'Update'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Confirmation"
          message={deleteItem ? (
            deleteItem.employee_count > 0 ? (
              `Cannot delete "${deleteItem.name || deleteItem.display_name}" because it is currently used by ${deleteItem.employee_count} employee(s).`
            ) : (
              `Are you sure you want to delete "${deleteItem.name || deleteItem.display_name}"?`
            )
          ) : ''}
          confirmText={deleteItem?.employee_count > 0 ? 'OK' : 'Delete'}
          type={deleteItem?.employee_count > 0 ? 'info' : 'danger'}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  );
};

export default WorkforceSettings;