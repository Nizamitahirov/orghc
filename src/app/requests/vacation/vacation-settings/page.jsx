// app/requests/vacation/vacation-settings/page.jsx - ✅ COMPLETE WITH CONFIRMATION MODALS
"use client";
import { useState, useEffect } from 'react';
import { 
  Calendar, Users, Settings, Save, Plus, Trash2, AlertCircle, CheckCircle, Shield, ArrowLeft,
  Edit, FileText, TrendingUp, Upload, Download, X, Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import { VacationService, VacationHelpers } from '@/services/vacationService';
import SearchableDropdown from "@/components/common/SearchableDropdown";

export default function VacationSettingsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  
  // ✅ Dual Production Calendar States
  const [azHolidays, setAzHolidays] = useState([]);
  const [ukHolidays, setUkHolidays] = useState([]);
  const [newAzHoliday, setNewAzHoliday] = useState({ date: '', name: '' });
  const [newUkHoliday, setNewUkHoliday] = useState({ date: '', name: '' });
  
  // ✅ UK Additional Approver State
  const [ukApprover, setUkApprover] = useState(null);
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [employees, setEmployees] = useState([]);
  
  // ✅ Vacation Types State
  const [vacationTypes, setVacationTypes] = useState([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    is_uk_only: false,
    requires_time_selection: false
  });
  const [selectedAzDates, setSelectedAzDates] = useState([]);
const [selectedUkDates, setSelectedUkDates] = useState([]);
  // ✅ Balances State
  const [balanceFile, setBalanceFile] = useState(null);
  const [balanceUploadLoading, setBalanceUploadLoading] = useState(false);
  const [resetYear, setResetYear] = useState(new Date().getFullYear());
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    allow_negative_balance: false,
    max_schedule_edits: 3,
    notification_days_before: 7,
    notification_frequency: 2
  });
  
  // HR Representative
  const [hrRepresentatives, setHrRepresentatives] = useState([]);
  const [defaultHR, setDefaultHR] = useState(null);
  const [selectedHR, setSelectedHR] = useState(null);

  // ✅ CONFIRMATION MODAL STATE
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmType, setConfirmType] = useState('warning'); // 'warning', 'danger', 'info'

  useEffect(() => {
    fetchAllSettings();
    fetchEmployees();
    fetchVacationTypes();
  }, []);

  const fetchAllSettings = async () => {
    setLoading(true);
    try {
      const [calendarData, generalData, hrData, ukApproverData] = await Promise.all([
        VacationService.getProductionCalendar(),
        VacationService.getGeneralSettings(),
        VacationService.getHRRepresentatives(),
        VacationService.getUKAdditionalApprover()
      ]);
      
      setAzHolidays(calendarData.azerbaijan || []);
      setUkHolidays(calendarData.uk || []);
      setGeneralSettings(generalData);
      setHrRepresentatives(hrData.hr_representatives || []);
      setDefaultHR(hrData.current_default);
      if (hrData.current_default) {
        setSelectedHR(hrData.current_default.id);
      }
      setUkApprover(ukApproverData.uk_additional_approver);
      if (ukApproverData.uk_additional_approver) {
        setSelectedApprover(ukApproverData.uk_additional_approver.id);
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
      showError('❌ Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await VacationService.searchEmployees();
      setEmployees(data.results || []);
    } catch (error) {
      console.error('Employees fetch error:', error);
    }
  };

  // ✅ CONFIRMATION MODAL HELPERS
  const openConfirmModal = (title, message, type, action) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmType(type);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
    setConfirmTitle('');
  };

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction();
    }
    closeConfirmModal();
  };

  // ✅ Vacation Types Handlers
  const fetchVacationTypes = async () => {
    try {
      const data = await VacationService.getVacationTypes();
      setVacationTypes(data.results || []);
    } catch (error) {
      console.error('Vacation types fetch error:', error);
    }
  };

  const handleOpenTypeModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setTypeForm({
        name: type.name,
        description: type.description || '',
        is_uk_only: type.is_uk_only || false,
        requires_time_selection: type.requires_time_selection || false
      });
    } else {
      setEditingType(null);
      setTypeForm({
        name: '',
        description: '',
        is_uk_only: false,
        requires_time_selection: false
      });
    }
    setShowTypeModal(true);
  };

  const handleSaveType = async () => {
    if (!typeForm.name.trim()) {
      showError('❌ Name is required');
      return;
    }

    const action = async () => {
      setLoading(true);
      try {
        if (editingType) {
          await VacationService.updateVacationType(editingType.id, typeForm);
          showSuccess('✅ Vacation type updated successfully');
        } else {
          await VacationService.createVacationType(typeForm);
          showSuccess('✅ Vacation type created successfully');
        }
        setShowTypeModal(false);
        setEditingType(null);
        setTypeForm({ name: '', description: '', is_uk_only: false, requires_time_selection: false });
        fetchVacationTypes();
      } catch (error) {
        console.error('Save type error:', error);
        showError(error.response?.data?.error || '❌ Failed to save vacation type');
      } finally {
        setLoading(false);
      }
    };

    if (editingType) {
      openConfirmModal(
        'Update Vacation Type',
        `Are you sure you want to update "${editingType.name}"?`,
        'info',
        action
      );
    } else {
      await action();
    }
  };

  const handleDeleteType = async (typeId, typeName) => {
    const action = async () => {
      setLoading(true);
      try {
        await VacationService.deleteVacationType(typeId);
        showSuccess(`✅ "${typeName}" deleted successfully`);
        fetchVacationTypes();
      } catch (error) {
        console.error('Delete type error:', error);
        showError(error.response?.data?.error || '❌ Failed to delete vacation type');
      } finally {
        setLoading(false);
      }
    };

    openConfirmModal(
      'Delete Vacation Type',
      `⚠️ Are you sure you want to delete "${typeName}"? This action cannot be undone.`,
      'danger',
      action
    );
  };

  // ✅ Balances Handlers - WITH CONFIRMATION
  const handleDownloadTemplate = async () => {
    try {
      const blob = await VacationService.downloadBalanceTemplate();
      VacationHelpers.downloadBlobFile(blob, 'vacation_balances_template.xlsx');
      showSuccess('✅ Template downloaded successfully');
    } catch (error) {
      console.error('Download template error:', error);
      showError('❌ Failed to download template');
    }
  };

  const handleBalanceFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        showError('❌ Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setBalanceFile(file);
      showSuccess(`✅ File selected: ${file.name}`);
    }
  };

  const handleUploadBalances = async () => {
    if (!balanceFile) {
      showError('❌ Please select a file first');
      return;
    }

    const action = async () => {
      setBalanceUploadLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', balanceFile);
        
        const result = await VacationService.bulkUploadBalances(formData);
        showSuccess(`✅ Successfully uploaded ${result.created_count} balances`);
        setBalanceFile(null);
      } catch (error) {
        console.error('Upload error:', error);
        showError(error.response?.data?.error || '❌ Failed to upload balances');
      } finally {
        setBalanceUploadLoading(false);
      }
    };

    openConfirmModal(
      'Upload Balances',
      `Are you sure you want to upload balances from "${balanceFile.name}"? This will update existing records.`,
      'warning',
      action
    );
  };

  const handleResetBalances = async () => {
    const action = async () => {
      setLoading(true);
      try {
        await VacationService.resetBalances({ year: resetYear });
        showSuccess(`✅ Balances reset successfully for year ${resetYear}`);
      } catch (error) {
        console.error('Reset error:', error);
        showError(error.response?.data?.error || '❌ Failed to reset balances');
      } finally {
        setLoading(false);
      }
    };

    openConfirmModal(
      '⚠️ Reset All Balances',
      `WARNING: This will reset ALL balances for year ${resetYear}!\n\nAll used and scheduled days will be set to 0.\n\nAre you absolutely sure?`,
      'danger',
      action
    );
  };

  // Azerbaijan/UK Holiday Handlers - ✅ ALLOW MULTIPLE ON SAME DATE
  const handleAddAzHoliday = () => {
    if (!newAzHoliday.date || !newAzHoliday.name) {
      showError('❌ Date and name are required');
      return;
    }
    
    setAzHolidays([...azHolidays, newAzHoliday].sort((a, b) => a.date.localeCompare(b.date)));
    setNewAzHoliday({ date: '', name: '' });
    showSuccess('✅ Holiday added successfully');
  };

  const handleRemoveAzHoliday = (index, holidayName) => {
    const action = () => {
      setAzHolidays(azHolidays.filter((_, i) => i !== index));
      showSuccess(`✅ "${holidayName}" removed`);
    };

    openConfirmModal(
      'Remove Holiday',
      `Are you sure you want to remove "${holidayName}"?`,
      'warning',
      action
    );
  };

  const handleAddUkHoliday = () => {
    if (!newUkHoliday.date || !newUkHoliday.name) {
      showError('❌ Date and name are required');
      return;
    }
    
    setUkHolidays([...ukHolidays, newUkHoliday].sort((a, b) => a.date.localeCompare(b.date)));
    setNewUkHoliday({ date: '', name: '' });
    showSuccess('✅ Holiday added successfully');
  };

  const handleRemoveUkHoliday = (index, holidayName) => {
    const action = () => {
      setUkHolidays(ukHolidays.filter((_, i) => i !== index));
      showSuccess(`✅ "${holidayName}" removed`);
    };

    openConfirmModal(
      'Remove Holiday',
      `Are you sure you want to remove "${holidayName}"?`,
      'warning',
      action
    );
  };

  const handleSaveCalendars = async () => {
    const action = async () => {
      setLoading(true);
      try {
        await VacationService.updateNonWorkingDays({
          non_working_days_az: azHolidays,
          non_working_days_uk: ukHolidays
        });
        showSuccess('✅ Production calendars updated successfully');
      } catch (error) {
        console.error('Calendar save error:', error);
        showError(error.response?.data?.error || '❌ Failed to save calendars');
      } finally {
        setLoading(false);
      }
    };

    openConfirmModal(
      'Save Production Calendars',
      `Save ${azHolidays.length} Azerbaijan holidays and ${ukHolidays.length} UK holidays?`,
      'info',
      action
    );
  };

  const handleSaveUKApprover = async () => {
    if (!selectedApprover) {
      showError('❌ Please select an approver');
      return;
    }

    const action = async () => {
      setLoading(true);
      try {
        await VacationService.setUKAdditionalApprover({
          uk_additional_approver_id: selectedApprover
        });
        showSuccess('✅ UK Additional Approver updated successfully');
        await fetchAllSettings();
      } catch (error) {
        console.error('UK Approver save error:', error);
        showError(error.response?.data?.error || '❌ Failed to save UK approver');
      } finally {
        setLoading(false);
      }
    };

    openConfirmModal(
      'Update UK Additional Approver',
      'Are you sure you want to update the UK Additional Approver?',
      'info',
      action
    );
  };

  const handleSaveGeneralSettings = async () => {
    const action = async () => {
      setLoading(true);
      try {
        await VacationService.updateGeneralSettings(generalSettings);
        showSuccess('✅ General settings updated successfully');
      } catch (error) {
        console.error('General settings save error:', error);
        showError(error.response?.data?.error || '❌ Failed to save general settings');
      } finally {
        setLoading(false);
      }
    };

    openConfirmModal(
      'Save General Settings',
      'Are you sure you want to update general vacation settings?',
      'info',
      action
    );
  };

  const handleSaveHR = async () => {
    if (!selectedHR) {
      showError('❌ Please select an HR representative');
      return;
    }

    const action = async () => {
      setLoading(true);
      try {
        await VacationService.updateDefaultHRRepresentative({
          default_hr_representative_id: selectedHR
        });
        showSuccess('✅ HR representative updated successfully');
        await fetchAllSettings();
      } catch (error) {
        console.error('HR save error:', error);
        showError(error.response?.data?.error || '❌ Failed to save HR representative');
      } finally {
        setLoading(false);
      }
    };

    openConfirmModal(
      'Update Default HR Representative',
      'Are you sure you want to update the default HR representative?',
      'info',
      action
    );
  };

  const tabs = [
    { key: 'calendar', label: 'Production Calendar', icon: Calendar },
    { key: 'uk-approver', label: 'UK Approver', icon: Shield },
    { key: 'types', label: 'Leave Types', icon: FileText },
    { key: 'balances', label: 'Balances', icon: TrendingUp },
    { key: 'general', label: 'General Settings', icon: Settings },
    { key: 'hr', label: 'HR Representative', icon: Users }
  ];

  const ukEmployees = employees.filter(emp => 
    emp.business_function_name?.toUpperCase().includes('UK')
  );

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">Vacation Settings</h1>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">Configure vacation system parameters</p>
          </div>
          <button
            onClick={() => router.push('/requests/vacation')}
            className="flex items-center gap-2 px-4 py-2 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Vacation
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-almet-mystic dark:border-almet-comet overflow-x-auto">
          <div className="flex space-x-8 min-w-max">
            {tabs.map(tab => (
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

        {/* PRODUCTION CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-5">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-green-600" />
      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Azerbaijan Holidays</h3>
    </div>
    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
      {azHolidays.length} holidays
    </span>
  </div>

  <div className="space-y-3 mb-4">
    {/* ✅ Multiple Date Picker */}
    <div>
      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
        Select Dates (Click to add/remove)
      </label>
      <input
        type="date"
        onChange={(e) => {
          const date = e.target.value;
          if (date) {
            setSelectedAzDates(prev => {
              if (prev.includes(date)) {
                return prev.filter(d => d !== date);
              } else {
                return [...prev, date].sort();
              }
            });
          }
        }}
        className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
      />
    </div>

    {/* ✅ Selected Dates Display */}
    {selectedAzDates.length > 0 && (
      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-2">
          Selected Dates ({selectedAzDates.length}):
        </p>
        <div className="flex flex-wrap gap-1">
          {selectedAzDates.map(date => (
            <span 
              key={date}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded flex items-center gap-1"
            >
              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              <button
                onClick={() => setSelectedAzDates(prev => prev.filter(d => d !== date))}
                className="hover:bg-green-700 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Holiday Name */}
    <input
      type="text"
      value={newAzHoliday.name}
      onChange={(e) => setNewAzHoliday({...newAzHoliday, name: e.target.value})}
      placeholder="e.g., Novruz Bayramı"
      className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
    />
    
    <button
      onClick={() => {
        if (!newAzHoliday.name || selectedAzDates.length === 0) {
          showError('❌ Please select dates and enter name');
          return;
        }
        
        // ✅ Add all selected dates with same name
        const newHolidays = selectedAzDates.map(date => ({
          date,
          name: newAzHoliday.name
        }));
        
        setAzHolidays([...azHolidays, ...newHolidays].sort((a, b) => a.date.localeCompare(b.date)));
        setNewAzHoliday({ date: '', name: '' });
        setSelectedAzDates([]);
        showSuccess(`✅ Added ${newHolidays.length} holidays`);
      }}
      disabled={selectedAzDates.length === 0 || !newAzHoliday.name}
      className="w-full px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <Plus className="w-4 h-4" />
      Add {selectedAzDates.length > 0 ? `${selectedAzDates.length} ` : ''}Azerbaijan Holiday{selectedAzDates.length > 1 ? 's' : ''}
    </button>
  </div>

  {/* Existing holidays list */}
  <div className="space-y-2 max-h-[400px] overflow-y-auto">
    {azHolidays.map((holiday, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-almet-cloud-burst dark:text-white truncate">{holiday.name}</p>
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
            {new Date(holiday.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => handleRemoveAzHoliday(index, holiday.name)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0 ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
</div>

              {/* UK Calendar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-5">
                <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-red-600" />
      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">UK Holidays</h3>
    </div>
    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs font-medium">
      {ukHolidays.length} holidays
    </span>
  </div>

  <div className="space-y-3 mb-4">
    {/* ✅ Multiple Date Picker */}
    <div>
      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
        Select Dates (Click to add/remove)
      </label>
      <input
        type="date"
        onChange={(e) => {
          const date = e.target.value;
          if (date) {
            setSelectedUkDates(prev => {
              if (prev.includes(date)) {
                return prev.filter(d => d !== date);
              } else {
                return [...prev, date].sort();
              }
            });
          }
        }}
        className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
      />
    </div>

    {/* ✅ Selected Dates Display */}
    {selectedUkDates.length > 0 && (
      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-2">
          Selected Dates ({selectedUkDates.length}):
        </p>
        <div className="flex flex-wrap gap-1">
          {selectedUkDates.map(date => (
            <span 
              key={date}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded flex items-center gap-1"
            >
              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              <button
                onClick={() => setSelectedUkDates(prev => prev.filter(d => d !== date))}
                className="hover:bg-red-700 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Holiday Name */}
    <input
      type="text"
      value={newUkHoliday.name}
      onChange={(e) => setNewUkHoliday({...newUkHoliday, name: e.target.value})}
      placeholder="e.g., Christmas Day"
      className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
    />
    
    <button
      onClick={() => {
        if (!newUkHoliday.name || selectedUkDates.length === 0) {
          showError('❌ Please select dates and enter name');
          return;
        }
        
        // ✅ Add all selected dates with same name
        const newHolidays = selectedUkDates.map(date => ({
          date,
          name: newUkHoliday.name
        }));
        
        setUkHolidays([...ukHolidays, ...newHolidays].sort((a, b) => a.date.localeCompare(b.date)));
        setNewUkHoliday({ date: '', name: '' });
        setSelectedUkDates([]);
        showSuccess(`✅ Added ${newHolidays.length} holidays`);
      }}
      disabled={selectedUkDates.length === 0 || !newUkHoliday.name}
      className="w-full px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <Plus className="w-4 h-4" />
      Add {selectedUkDates.length > 0 ? `${selectedUkDates.length} ` : ''}UK Holiday{selectedUkDates.length > 1 ? 's' : ''}
    </button>
  </div>

  {/* Existing holidays list */}
  <div className="space-y-2 max-h-[400px] overflow-y-auto">
    {ukHolidays.map((holiday, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-almet-cloud-burst dark:text-white truncate">{holiday.name}</p>
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
            {new Date(holiday.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => handleRemoveUkHoliday(index, holiday.name)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0 ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ))}
    {ukHolidays.length === 0 && (
      <div className="text-center py-8 text-sm text-almet-waterloo dark:text-almet-bali-hai">
        No UK holidays added yet
      </div>
    )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveCalendars}
                disabled={loading}
                className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Production Calendars
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* UK APPROVER TAB */}
        {activeTab === 'uk-approver' && (
          <div className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200">UK Additional Approver</h3>
                  <p className="text-xs text-orange-800 dark:text-orange-300 mt-1">
                    For UK employees requesting 5+ days vacation, an additional approval step is required after Line Manager.
                    <br/>Recommended: Vice Chairman position group.
                  </p>
                </div>
              </div>
            </div>

           <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-6">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-4">Current UK Additional Approver</h3>
              
              {ukApprover ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-200">{ukApprover.name}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-green-800 dark:text-green-300">
                        <span className="bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded">
                          {ukApprover.employee_id}
                        </span>
                        <span className="bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded">
                          {ukApprover.position_group}
                        </span>
                        <span className="bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded">
                          {ukApprover.business_function}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">No UK Additional Approver Set</p>
                      <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                        UK employees requesting 5+ days cannot proceed past Line Manager approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Select UK Additional Approver
                  </label>
                  <SearchableDropdown
                    options={ukEmployees.map(emp => ({
                      value: emp.id,
                      label: `${emp.name} (${emp.employee_id}) - ${emp.position_group_name || 'N/A'}`,
                      badge: emp.position_group_name?.includes('Vice') ? 'Recommended' : null
                    }))}
                    value={selectedApprover}
                    onChange={setSelectedApprover}
                    placeholder="Select UK employee..."
                    darkMode={darkMode}
                    searchPlaceholder="Search UK employees..."
                    allowUncheck={true}
                  />
                </div>

                <button
                  onClick={handleSaveUKApprover}
                  disabled={loading || !selectedApprover}
                  className="w-full px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save UK Additional Approver
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VACATION TYPES TAB */}
        {activeTab === 'types' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleOpenTypeModal()}
                className="px-4 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 shadow-md whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Leave Type
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                  <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
                    <tr>
                      {['Name', 'Description', 'UK Only', 'Half Day', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                    {vacationTypes.map(type => (
                      <tr key={type.id} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-almet-cloud-burst dark:text-white">
                          {type.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-almet-waterloo dark:text-almet-bali-hai">
                          {type.description || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {type.is_uk_only ? (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                              UK Only
                            </span>
                          ) : (
                            <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">All</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {type.requires_time_selection ? (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              Half Day
                            </span>
                          ) : (
                            <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Full Day</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenTypeModal(type)}
                              className="p-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteType(type.id, type.name)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {vacationTypes.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-12 text-center text-sm text-almet-waterloo dark:text-almet-bali-hai">
                          No vacation types configured yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BALANCES TAB */}
        {activeTab === 'balances' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload Balances */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-6">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-4">Upload Balances</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full px-4 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Excel Template
                  </button>

                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                      Select Excel File
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleBalanceFileSelect}
                      className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    {balanceFile && (
                      <div className="mt-2 flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <span className="text-xs text-blue-800 dark:text-blue-300 truncate">{balanceFile.name}</span>
                        <button
                          onClick={() => setBalanceFile(null)}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleUploadBalances}
                    disabled={balanceUploadLoading || !balanceFile}
                    className="w-full px-4 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {balanceUploadLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Balances
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Reset Balances */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-6">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-4">Reset Balances</h3>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    <strong>Warning:</strong> This will reset all used and scheduled days to 0 for the selected year.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                      Select Year
                    </label>
                    <input
                      type="number"
                      value={resetYear}
                      onChange={(e) => setResetYear(parseInt(e.target.value))}
                      min="2020"
                      max="2030"
                      className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleResetBalances}
                    disabled={loading}
                    className="w-full px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Reset Balances for {resetYear}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GENERAL SETTINGS TAB */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-6">
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-6">General Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-start justify-between p-4 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">Allow Negative Balance</h4>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    If enabled, employees can submit requests even without sufficient remaining balance.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={generalSettings.allow_negative_balance}
                    onChange={(e) => setGeneralSettings(prev => ({...prev, allow_negative_balance: e.target.checked}))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-almet-sapphire/30 dark:peer-focus:ring-almet-sapphire/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-almet-sapphire"></div>
                </label>
              </div>

              <div className="p-4 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                  Maximum Schedule Edits
                </label>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
                  Number of times a schedule can be edited before requiring recreation.
                </p>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={generalSettings.max_schedule_edits}
                  onChange={(e) => setGeneralSettings(prev => ({...prev, max_schedule_edits: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="p-4 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                  Notification Days Before
                </label>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
                  Days before vacation starts to send reminder notifications.
                </p>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={generalSettings.notification_days_before}
                  onChange={(e) => setGeneralSettings(prev => ({...prev, notification_days_before: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="p-4 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                  Notification Frequency (days)
                </label>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
                  How often to send repeat notifications.
                </p>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={generalSettings.notification_frequency}
                  onChange={(e) => setGeneralSettings(prev => ({...prev, notification_frequency: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveGeneralSettings}
                disabled={loading}
                className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save General Settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* HR REPRESENTATIVE TAB */}
        {activeTab === 'hr' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-6">
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-4">Default HR Representative</h3>
            
            {defaultHR && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 dark:text-green-200">Current Default HR</p>
                    <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                      {defaultHR.name}  {defaultHR.department}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                  Select Default HR Representative
                </label>
                <SearchableDropdown
                  options={hrRepresentatives.map(hr => ({
                    value: hr.id,
                    label: `${hr.name} - ${hr.department}`
                  }))}
                  value={selectedHR}
                  onChange={setSelectedHR}
                  placeholder="Select HR representative..."
                  darkMode={darkMode}
                  searchPlaceholder="Search HR representatives..."
                />
              </div>

              <button
                onClick={handleSaveHR}
                disabled={loading || !selectedHR}
                className="w-full px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save HR Representative
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ VACATION TYPE MODAL */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full border border-almet-mystic/50 dark:border-almet-comet">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
                {editingType ? 'Edit Leave Type' : 'Add Leave Type'}
              </h2>
              <button
                onClick={() => {
                  setShowTypeModal(false);
                  setEditingType(null);
                  setTypeForm({ name: '', description: '', is_uk_only: false, requires_time_selection: false });
                }}
                className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
                  placeholder="e.g., Annual Leave"
                  className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                  Description
                </label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({...typeForm, description: e.target.value})}
                  rows={3}
                  placeholder="Optional description..."
                  className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-start p-3 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">UK Only</h4>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    Only UK employees can select this type
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={typeForm.is_uk_only}
                    onChange={(e) => setTypeForm({...typeForm, is_uk_only: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-almet-sapphire/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="flex items-start p-3 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">Half Day Type</h4>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    Requires start/end time selection (0.5 days)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={typeForm.requires_time_selection}
                    onChange={(e) => setTypeForm({...typeForm, requires_time_selection: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-almet-sapphire/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>

            <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex justify-end gap-3">
              <button
            onClick={() => {
              setShowTypeModal(false);
              setEditingType(null);
              setTypeForm({ name: '', description: '', is_uk_only: false, requires_time_selection: false });
            }}
            className="px-5 py-2.5 text-sm border border-almet-mystic dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveType}
            disabled={loading || !typeForm.name.trim()}
            className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editingType ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* ✅ CONFIRMATION MODAL */}
  {showConfirmModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-almet-mystic/50 dark:border-almet-comet">
        <div className={`border-b px-5 py-4 flex items-center gap-3 ${
          confirmType === 'danger' 
            ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
            : confirmType === 'warning'
            ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
            : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
        }`}>
          {confirmType === 'danger' ? (
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          ) : confirmType === 'warning' ? (
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          )}
          <h2 className={`text-base font-semibold ${
            confirmType === 'danger'
              ? 'text-red-900 dark:text-red-200'
              : confirmType === 'warning'
              ? 'text-amber-900 dark:text-amber-200'
              : 'text-blue-900 dark:text-blue-200'
          }`}>
            {confirmTitle}
          </h2>
        </div>

        <div className="p-6">
          <p className="text-sm text-almet-cloud-burst dark:text-white whitespace-pre-line">
            {confirmMessage}
          </p>
        </div>

        <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex justify-end gap-3">
          <button
            onClick={closeConfirmModal}
            className="px-5 py-2.5 text-sm border border-almet-mystic dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2.5 text-sm text-white rounded-lg transition-all flex items-center gap-2 shadow-md ${
              confirmType === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : confirmType === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmType === 'danger' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Confirm Delete
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}
</DashboardLayout>)}