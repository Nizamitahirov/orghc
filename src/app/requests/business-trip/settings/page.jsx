"use client";
import { useState, useEffect } from 'react';
import { Settings, Users, Briefcase, Car, Plane, Target, ArrowLeft, Plus, Edit, Trash, Save, X, Lock } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import { BusinessTripService, BusinessTripHelpers } from '@/services/businessTripService';
import { useRouter } from 'next/navigation';

export default function BusinessTripSettingsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [userPermissions, setUserPermissions] = useState({ is_admin: false, permissions: [] });
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    notification_days_before: 7
  });
  
  // HR Representatives
  const [hrRepresentatives, setHrRepresentatives] = useState([]);
  const [currentDefaultHR, setCurrentDefaultHR] = useState(null);
  const [selectedHR, setSelectedHR] = useState(null);
  
  // Finance Approvers
  const [financeApprovers, setFinanceApprovers] = useState([]);
  const [currentDefaultFinance, setCurrentDefaultFinance] = useState(null);
  const [selectedFinance, setSelectedFinance] = useState(null);
  
  // Travel Types
  const [travelTypes, setTravelTypes] = useState([]);
  const [editingTravelType, setEditingTravelType] = useState(null);
  const [newTravelType, setNewTravelType] = useState({ name: '', description: '', is_active: true });
  
  // Transport Types
  const [transportTypes, setTransportTypes] = useState([]);
  const [editingTransportType, setEditingTransportType] = useState(null);
  const [newTransportType, setNewTransportType] = useState({ name: '', description: '', is_active: true });
  
  // Trip Purposes
  const [tripPurposes, setTripPurposes] = useState([]);
  const [editingTripPurpose, setEditingTripPurpose] = useState(null);
  const [newTripPurpose, setNewTripPurpose] = useState({ name: '', description: '', is_active: true });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserPermissions(),
        fetchGeneralSettings(),
        fetchHRRepresentatives(),
        fetchFinanceApprovers(),
        fetchTravelTypes(),
        fetchTransportTypes(),
        fetchTripPurposes()
      ]);
    } catch (error) {
      console.error('Initialization error:', error);
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const data = await BusinessTripService.getMyPermissions();
      setUserPermissions(data);
      
      if (!data.is_admin) {
        showError('Admin access required');
        router.push('/requests/business-trip');
      }
    } catch (error) {
      console.error('Permissions fetch error:', error);
      router.push('/requests/business-trip');
    }
  };

  const fetchGeneralSettings = async () => {
    try {
      const data = await BusinessTripService.getGeneralSettings();
      setGeneralSettings(data);
    } catch (error) {
      console.error('General settings fetch error:', error);
    }
  };

  const fetchHRRepresentatives = async () => {
    try {
      const data = await BusinessTripService.getHRRepresentatives();
      setHrRepresentatives(data.hr_representatives || []);
      setCurrentDefaultHR(data.current_default);
      if (data.current_default) {
        setSelectedHR(data.current_default.id);
      }
    } catch (error) {
      console.error('HR representatives fetch error:', error);
    }
  };

  const fetchFinanceApprovers = async () => {
    try {
      const data = await BusinessTripService.getFinanceApprovers();
      setFinanceApprovers(data.finance_approvers || []);
      setCurrentDefaultFinance(data.current_default);
      if (data.current_default) {
        setSelectedFinance(data.current_default.id);
      }
    } catch (error) {
      console.error('Finance approvers fetch error:', error);
    }
  };

  const fetchTravelTypes = async () => {
    try {
      const data = await BusinessTripService.getTravelTypes();
      setTravelTypes(data.results || []);
    } catch (error) {
      console.error('Travel types fetch error:', error);
    }
  };

  const fetchTransportTypes = async () => {
    try {
      const data = await BusinessTripService.getTransportTypes();
      setTransportTypes(data.results || []);
    } catch (error) {
      console.error('Transport types fetch error:', error);
    }
  };

  const fetchTripPurposes = async () => {
    try {
      const data = await BusinessTripService.getTripPurposes();
      setTripPurposes(data.results || []);
    } catch (error) {
      console.error('Trip purposes fetch error:', error);
    }
  };

  // === GENERAL SETTINGS ===
  const handleSaveGeneralSettings = async () => {
    setLoading(true);
    try {
      await BusinessTripService.updateGeneralSettings(generalSettings);
      showSuccess('General settings updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  // === HR REPRESENTATIVE ===
  const handleUpdateHR = async () => {
    if (!selectedHR) {
      showError('Please select an HR representative');
      return;
    }
    
    setLoading(true);
    try {
      await BusinessTripService.updateHRRepresentative({ default_hr_representative_id: selectedHR });
      showSuccess('Default HR representative updated');
      fetchHRRepresentatives();
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update HR representative');
    } finally {
      setLoading(false);
    }
  };

  // === FINANCE APPROVER ===
  const handleUpdateFinance = async () => {
    if (!selectedFinance) {
      showError('Please select a finance approver');
      return;
    }
    
    setLoading(true);
    try {
      await BusinessTripService.updateFinanceApprover({ default_finance_approver_id: selectedFinance });
      showSuccess('Default finance approver updated');
      fetchFinanceApprovers();
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update finance approver');
    } finally {
      setLoading(false);
    }
  };

  // === TRAVEL TYPES ===
  const handleCreateTravelType = async () => {
    if (!newTravelType.name.trim()) {
      showError('Name is required');
      return;
    }
    
    setLoading(true);
    try {
      await BusinessTripService.createTravelType(newTravelType);
      showSuccess('Travel type created');
      setNewTravelType({ name: '', description: '', is_active: true });
      fetchTravelTypes();
    } catch (error) {
      console.error('Create error:', error);
      showError('Failed to create travel type');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTravelType = async () => {
    if (!editingTravelType) return;
    
    setLoading(true);
    try {
      await BusinessTripService.updateTravelType(editingTravelType.id, editingTravelType);
      showSuccess('Travel type updated');
      setEditingTravelType(null);
      fetchTravelTypes();
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update travel type');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTravelType = async (id) => {
    if (!confirm('Are you sure you want to delete this travel type?')) return;
    
    setLoading(true);
    try {
      await BusinessTripService.deleteTravelType(id);
      showSuccess('Travel type deleted');
      fetchTravelTypes();
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete travel type');
    } finally {
      setLoading(false);
    }
  };

  // === TRANSPORT TYPES ===
  const handleCreateTransportType = async () => {
    if (!newTransportType.name.trim()) {
      showError('Name is required');
      return;
    }
    
    setLoading(true);
    try {
      await BusinessTripService.createTransportType(newTransportType);
      showSuccess('Transport type created');
      setNewTransportType({ name: '', description: '', is_active: true });
      fetchTransportTypes();
    } catch (error) {
      console.error('Create error:', error);
      showError('Failed to create transport type');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransportType = async () => {
    if (!editingTransportType) return;
    
    setLoading(true);
    try {
      await BusinessTripService.updateTransportType(editingTransportType.id, editingTransportType);
      showSuccess('Transport type updated');
      setEditingTransportType(null);
      fetchTransportTypes();
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update transport type');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransportType = async (id) => {
    if (!confirm('Are you sure you want to delete this transport type?')) return;
    
    setLoading(true);
    try {
      await BusinessTripService.deleteTransportType(id);
      showSuccess('Transport type deleted');
      fetchTransportTypes();
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete transport type');
    } finally {
      setLoading(false);
    }
  };

  // === TRIP PURPOSES ===
  const handleCreateTripPurpose = async () => {
    if (!newTripPurpose.name.trim()) {
      showError('Name is required');
      return;
    }
    
    setLoading(true);
    try {
      await BusinessTripService.createTripPurpose(newTripPurpose);
      showSuccess('Trip purpose created');
      setNewTripPurpose({ name: '', description: '', is_active: true });
      fetchTripPurposes();
    } catch (error) {
      console.error('Create error:', error);
      showError('Failed to create trip purpose');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTripPurpose = async () => {
    if (!editingTripPurpose) return;
    
    setLoading(true);
    try {
      await BusinessTripService.updateTripPurpose(editingTripPurpose.id, editingTripPurpose);
      showSuccess('Trip purpose updated');
      setEditingTripPurpose(null);
      fetchTripPurposes();
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update trip purpose');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTripPurpose = async (id) => {
    if (!confirm('Are you sure you want to delete this trip purpose?')) return;
    
    setLoading(true);
    try {
      await BusinessTripService.deleteTripPurpose(id);
      showSuccess('Trip purpose deleted');
      fetchTripPurposes();
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete trip purpose');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userPermissions.is_admin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-almet-sapphire border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/requests/business-trip')}
              className="p-2 hover:bg-almet-mystic/30 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-almet-cloud-burst dark:text-white" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">Business Trip Settings</h1>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">Configure business trip system settings</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Admin Only</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 border-b border-almet-mystic dark:border-almet-comet">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { key: 'general', label: 'General', icon: Settings },
              { key: 'hr', label: 'HR Representative', icon: Users },
              { key: 'finance', label: 'Finance Approver', icon: Briefcase },
              { key: 'travel', label: 'Travel Types', icon: Plane },
              { key: 'transport', label: 'Transport Types', icon: Car },
              { key: 'purpose', label: 'Trip Purposes', icon: Target }
            ].map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)} 
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.key 
                    ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral' 
                    : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-almet-sapphire" />
                General Settings
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Notification Days Before Trip
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={generalSettings.notification_days_before}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, notification_days_before: parseInt(e.target.value) })}
                  className="w-full md:w-64 px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                  System will send notifications this many days before trip starts
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                <button
                  onClick={handleSaveGeneralSettings}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HR Representative */}
        {activeTab === 'hr' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-almet-sapphire" />
                Default HR Representative
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              {currentDefaultHR && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">Current Default</p>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-200">{currentDefaultHR.name}</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">{currentDefaultHR.department}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Select HR Representative
                </label>
                <SearchableDropdown
                  options={hrRepresentatives.map(hr => ({ 
                    value: hr.id, 
                    label: `${hr.name} (${hr.department})` 
                  }))}
                  value={selectedHR}
                  onChange={(value) => setSelectedHR(value)}
                  placeholder="Select HR representative"
                  darkMode={darkMode}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                <button
                  onClick={handleUpdateHR}
                  disabled={loading || !selectedHR}
                  className="px-5 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update HR Representative
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Finance Approver */}
        {activeTab === 'finance' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-almet-sapphire" />
                Default Finance Approver
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              {currentDefaultFinance && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Current Default</p>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{currentDefaultFinance.name}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">{currentDefaultFinance.department}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Select Finance Approver
                </label>
                <SearchableDropdown
                  options={financeApprovers.map(finance => ({ 
                    value: finance.id, 
                    label: `${finance.name} (${finance.department})` 
                  }))}
                  value={selectedFinance}
                  onChange={(value) => setSelectedFinance(value)}
                  placeholder="Select finance approver"
                  darkMode={darkMode}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                <button
                  onClick={handleUpdateFinance}
                  disabled={loading || !selectedFinance}
                  className="px-5 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Finance Approver
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Travel Types */}
        {activeTab === 'travel' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Plane className="w-4 h-4 text-almet-sapphire" />
                Travel Types
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Add New */}
              <div className="bg-almet-mystic/20 dark:bg-gray-900/20 rounded-lg p-4 border border-almet-mystic/40 dark:border-almet-comet">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3">Add New Travel Type</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newTravelType.name}
                    onChange={(e) => setNewTravelType({ ...newTravelType, name: e.target.value })}
                    className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newTravelType.description}
                    onChange={(e) => setNewTravelType({ ...newTravelType, description: e.target.value })}
                    className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleCreateTravelType}
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="space-y-2">
                {travelTypes.map(type => (
                  <div key={type.id} className="border border-almet-mystic/40 dark:border-almet-comet rounded-lg p-3 hover:border-almet-sapphire/50 transition-all">
                    {editingTravelType?.id === type.id ? (
                      <div className="grid md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={editingTravelType.name}
                          onChange={(e) => setEditingTravelType({ ...editingTravelType, name: e.target.value })}
                          className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="text"
                          value={editingTravelType.description}
                          onChange={(e) => setEditingTravelType({ ...editingTravelType, description: e.target.value })}
                          className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateTravelType}
                            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTravelType(null)}
                            className="px-3 py-2 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{type.name}</p>
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">{type.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingTravelType(type)}
                            className="p-2 text-almet-sapphire hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTravelType(type.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transport Types */}
        {activeTab === 'transport' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-almet-sapphire" />
                Transport Types
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Add New */}
              <div className="bg-almet-mystic/20 dark:bg-gray-900/20 rounded-lg p-4 border border-almet-mystic/40 dark:border-almet-comet">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3">Add New Transport Type</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newTransportType.name}
                    onChange={(e) => setNewTransportType({ ...newTransportType, name: e.target.value })}
                    className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newTransportType.description}
                    onChange={(e) => setNewTransportType({ ...newTransportType, description: e.target.value })}
                    className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleCreateTransportType}
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="space-y-2">
                {transportTypes.map(type => (
                  <div key={type.id} className="border border-almet-mystic/40 dark:border-almet-comet rounded-lg p-3 hover:border-almet-sapphire/50 transition-all">
                    {editingTransportType?.id === type.id ? (
                      <div className="grid md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={editingTransportType.name}
                          onChange={(e) => setEditingTransportType({ ...editingTransportType, name: e.target.value })}
                          className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="text"
                          value={editingTransportType.description}
                          onChange={(e) => setEditingTransportType({ ...editingTransportType, description: e.target.value })}
                          className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateTransportType}
                            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTransportType(null)}
                            className="px-3 py-2 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{type.name}</p>
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">{type.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingTransportType(type)}
                            className="p-2 text-almet-sapphire hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransportType(type.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trip Purposes */}
        {activeTab === 'purpose' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-almet-sapphire" />
                Trip Purposes
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Add New */}
              <div className="bg-almet-mystic/20 dark:bg-gray-900/20 rounded-lg p-4 border border-almet-mystic/40 dark:border-almet-comet">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3">Add New Trip Purpose</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newTripPurpose.name}
                    onChange={(e) => setNewTripPurpose({ ...newTripPurpose, name: e.target.value })}
                    className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newTripPurpose.description}
                    onChange={(e) => setNewTripPurpose({ ...newTripPurpose, description: e.target.value })}
                    className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleCreateTripPurpose}
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="space-y-2">
                {tripPurposes.map(purpose => (
                  <div key={purpose.id} className="border border-almet-mystic/40 dark:border-almet-comet rounded-lg p-3 hover:border-almet-sapphire/50 transition-all">
                    {editingTripPurpose?.id === purpose.id ? (
                      <div className="grid md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={editingTripPurpose.name}
                          onChange={(e) => setEditingTripPurpose({ ...editingTripPurpose, name: e.target.value })}
                          className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="text"
                          value={editingTripPurpose.description}
                          onChange={(e) => setEditingTripPurpose({ ...editingTripPurpose, description: e.target.value })}
                          className="px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateTripPurpose}
                            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTripPurpose(null)}
                            className="px-3 py-2 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{purpose.name}</p>
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">{purpose.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingTripPurpose(purpose)}
                            className="p-2 text-almet-sapphire hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTripPurpose(purpose.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}