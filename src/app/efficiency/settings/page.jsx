"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useToast } from "@/components/common/Toast";
import performanceApi from "@/services/performanceService";
import { 
  Save, Plus, Trash2, Loader, Calendar, Target, 
  Award, Settings as SettingsIcon, Bell, ArrowLeft, CheckCircle
} from 'lucide-react';

export default function PerformanceSettingsPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('periods');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: null });

  const [activeYear, setActiveYear] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  
  const [settings, setSettings] = useState({
    weightConfigs: [],
    goalLimits: { min: 3, max: 7 },
    departmentObjectives: [],
    evaluationScale: [],
    evaluationTargets: { objective_score_target: 21 },
    statusTypes: [],
    notificationTemplates: []
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadActiveYear(),
        loadDepartments(),
        loadPositionGroups(),
        loadSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveYear = async () => {
    try {
      const yearData = await performanceApi.years.getActiveYear();
      setActiveYear(yearData);
    } catch (error) {
      console.error('Error loading year:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await performanceApi.departments.list();
      setDepartments(response.results || response);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadPositionGroups = async () => {
    try {
      const response = await performanceApi.positionGroups.list();
      setPositionGroups(response.results || response);
    } catch (error) {
      console.error('Error loading position groups:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const [weightsRes, limitsRes, deptObjRes, scalesRes, targetsRes, statusesRes, notifTemplatesRes] = 
        await Promise.all([
          performanceApi.weightConfigs.list(),
          performanceApi.goalLimits.getActiveConfig(),
          performanceApi.departmentObjectives.list({}),
          performanceApi.evaluationScales.list(),
          performanceApi.evaluationTargets.getActiveConfig(),
          performanceApi.objectiveStatuses.list(),
          performanceApi.notificationTemplates.list(),
        ]);
      
      setSettings({
        weightConfigs: (weightsRes.results || weightsRes),
        goalLimits: {
          min: limitsRes.min_goals,
          max: limitsRes.max_goals
        },
        departmentObjectives: (deptObjRes.results || deptObjRes),
        evaluationScale: (scalesRes.results || scalesRes),
        evaluationTargets: {
          objective_score_target: targetsRes.objective_score_target
        },
        statusTypes: (statusesRes.results || statusesRes),
        notificationTemplates: (notifTemplatesRes.results || notifTemplatesRes),
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.showError('Error loading settings');
    }
  };

  // Year handlers
  const handleSaveYear = async () => {
    setLoading(true);
    try {
      if (activeYear?.id) {
        await performanceApi.years.update(activeYear.id, {
          ...activeYear,
          is_active: true
        });
        toast.showSuccess('Period dates saved successfully');
        await loadActiveYear();
      }
    } catch (error) {
      console.error('Error saving year:', error);
      toast.showError('Error saving dates');
    } finally {
      setLoading(false);
    }
  };

  // Weight Config handlers
  const handleAddWeightConfig = async () => {
    if (positionGroups.length === 0) {
      toast.showError('No position groups available');
      return;
    }
    
    const existingGroupIds = settings.weightConfigs.map(w => w.position_group);
    const availableGroups = positionGroups.filter(pg => !existingGroupIds.includes(pg.id));
    
    if (availableGroups.length === 0) {
      toast.showInfo('All position groups already configured');
      return;
    }
    
    try {
      setLoading(true);
      await performanceApi.weightConfigs.create({
        position_group: availableGroups[0].id,
        objectives_weight: 70,
        competencies_weight: 30,
        is_active: true
      });
      await loadSettings();
      toast.showSuccess('Configuration added');
    } catch (error) {
      toast.showError('Error adding configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWeightConfig = async (id, field, value) => {
    try {
      setLoading(true);
      const config = settings.weightConfigs.find(w => w.id === id);
      await performanceApi.weightConfigs.update(id, {
        ...config,
        [field]: value
      });
      toast.showSuccess('Updated successfully');
    } catch (error) {
      toast.showError('Error updating');
      await loadSettings();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeightConfig = async () => {
    try {
      setLoading(true);
      await performanceApi.weightConfigs.delete(deleteModal.id);
      await loadSettings();
      toast.showSuccess('Configuration deleted');
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch (error) {
      toast.showError('Error deleting');
    } finally {
      setLoading(false);
    }
  };

  // Goal Limits handlers
  const handleSaveGoalLimits = async () => {
    setLoading(true);
    try {
      const limitsConfig = await performanceApi.goalLimits.getActiveConfig();
      await performanceApi.goalLimits.update(limitsConfig.id, {
        min_goals: settings.goalLimits.min,
        max_goals: settings.goalLimits.max,
        is_active: true
      });
      toast.showSuccess('Goal limits saved');
      await loadSettings();
    } catch (error) {
      toast.showError('Error saving limits');
    } finally {
      setLoading(false);
    }
  };

  // Department Objective handlers
  const handleAddDepartmentObjective = async () => {
    if (departments.length === 0) {
      toast.showError('No departments available');
      return;
    }
    
    try {
      setLoading(true);
      await performanceApi.departmentObjectives.create({
        department: departments[0].id,
        title: 'New Objective',
        description: '',
        weight: 0,
        is_active: true
      });
      await loadSettings();
      toast.showSuccess('Objective added');
    } catch (error) {
      toast.showError('Error adding objective');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDepartmentObjective = async (id, field, value) => {
    try {
      const obj = settings.departmentObjectives.find(o => o.id === id);
      await performanceApi.departmentObjectives.update(id, {
        ...obj,
        [field]: value
      });
      await loadSettings();
    } catch (error) {
      toast.showError('Error updating');
    }
  };

  const handleDeleteDepartmentObjective = async () => {
    try {
      setLoading(true);
      await performanceApi.departmentObjectives.delete(deleteModal.id);
      await loadSettings();
      toast.showSuccess('Objective deleted');
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch (error) {
      toast.showError('Error deleting');
    } finally {
      setLoading(false);
    }
  };

  // Evaluation Scale handlers
  const handleAddEvaluationScale = async () => {
    try {
      setLoading(true);
      await performanceApi.evaluationScales.create({
        name: 'NEW',
        value: 0,
        range_min: 0,
        range_max: 0,
        description: '',
        is_active: true
      });
      await loadSettings();
      toast.showSuccess('Scale added');
    } catch (error) {
      toast.showError('Error adding scale');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvaluationScale = async (id, field, value) => {
    try {
      const scale = settings.evaluationScale.find(s => s.id === id);
      await performanceApi.evaluationScales.update(id, {
        ...scale,
        [field]: value
      });
      await loadSettings();
    } catch (error) {
      toast.showError('Error updating');
    }
  };

  const handleDeleteEvaluationScale = async () => {
    try {
      setLoading(true);
      await performanceApi.evaluationScales.delete(deleteModal.id);
      await loadSettings();
      toast.showSuccess('Scale deleted');
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch (error) {
      toast.showError('Error deleting');
    } finally {
      setLoading(false);
    }
  };

  // Evaluation Targets handlers
  const handleSaveEvaluationTargets = async () => {
    setLoading(true);
    try {
      const targetsConfig = await performanceApi.evaluationTargets.getActiveConfig();
      await performanceApi.evaluationTargets.update(targetsConfig.id, {
        objective_score_target: settings.evaluationTargets.objective_score_target,
        is_active: true
      });
      toast.showSuccess('Targets saved');
      await loadSettings();
    } catch (error) {
      toast.showError('Error saving targets');
    } finally {
      setLoading(false);
    }
  };

  // Objective Status handlers
  const handleAddObjectiveStatus = async () => {
    try {
      setLoading(true);
      await performanceApi.objectiveStatuses.create({
        label: 'New Status',
        value: 'NEW_STATUS',
        is_active: true
      });
      await loadSettings();
      toast.showSuccess('Status added');
    } catch (error) {
      toast.showError('Error adding status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateObjectiveStatus = async (id, field, value) => {
    try {
      const status = settings.statusTypes.find(s => s.id === id);
      await performanceApi.objectiveStatuses.update(id, {
        ...status,
        [field]: value
      });
      await loadSettings();
    } catch (error) {
      toast.showError('Error updating');
    }
  };

  const handleDeleteObjectiveStatus = async () => {
    try {
      setLoading(true);
      await performanceApi.objectiveStatuses.delete(deleteModal.id);
      await loadSettings();
      toast.showSuccess('Status deleted');
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch (error) {
      toast.showError('Error deleting');
    } finally {
      setLoading(false);
    }
  };

  // Notification Template handlers
  const handleAddNotificationTemplate = async () => {
    try {
      setLoading(true);
      await performanceApi.notificationTemplates.create({
        trigger_type: 'GOAL_SETTING_START',
        subject: 'New Notification',
        message_template: 'Template message',
        days_before: 0,
        is_active: true
      });
      await loadSettings();
      toast.showSuccess('Template added');
    } catch (error) {
      toast.showError('Error adding template');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotificationTemplate = async (id, field, value) => {
    try {
      const template = settings.notificationTemplates.find(t => t.id === id);
      await performanceApi.notificationTemplates.update(id, {
        ...template,
        [field]: value
      });
      await loadSettings();
    } catch (error) {
      toast.showError('Error updating');
    }
  };

  const handleDeleteNotificationTemplate = async () => {
    try {
      setLoading(true);
      await performanceApi.notificationTemplates.delete(deleteModal.id);
      await loadSettings();
      toast.showSuccess('Template deleted');
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch (error) {
      toast.showError('Error deleting');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    switch(deleteModal.type) {
      case 'weight': handleDeleteWeightConfig(); break;
      case 'department': handleDeleteDepartmentObjective(); break;
      case 'scale': handleDeleteEvaluationScale(); break;
      case 'status': handleDeleteObjectiveStatus(); break;
      case 'notification': handleDeleteNotificationTemplate(); break;
      default: break;
    }
  };

  if (loading && !activeYear) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-almet-sapphire mx-auto mb-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const inputClass = `w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`;

  return (
    <DashboardLayout>
      <div className="p-4  mx-auto">
        {/* Compact Header */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/efficiency/performance-mng')}
            className="mb-2 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-almet-sapphire transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Performance
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center">
              <SettingsIcon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-almet-cloud-burst dark:text-almet-mystic">
                Performance Settings
              </h1>
              <p className="text-[10px] text-gray-500">Configure system parameters</p>
            </div>
          </div>
        </div>

        {/* Compact Tabs */}
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1.5 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {[
              { id: 'periods', label: 'Periods', icon: Calendar },
              { id: 'weights', label: 'Weights', icon: Award },
              { id: 'limits', label: 'Limits', icon: Target },
              { id: 'departments', label: 'Departments', icon: SettingsIcon },
              { id: 'scales', label: 'Scales', icon: Award },
              { id: 'targets', label: 'Targets', icon: Target },
              { id: 'statuses', label: 'Status', icon: CheckCircle },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-almet-sapphire text-white shadow-sm'
                      : `${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Compact & Scrollable */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
          
          {/* 1. PERIODS */}
          {activeTab === 'periods' && activeYear && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Period Configuration</h3>
              </div>
              
              <div className="p-3 space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-xs font-semibold mb-2 text-almet-sapphire flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Goal Setting
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Employee Start</label>
                      <input type="date" value={activeYear.goal_setting_employee_start || ''} 
                        onChange={(e) => setActiveYear(prev => ({ ...prev, goal_setting_employee_start: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Employee End</label>
                      <input type="date" value={activeYear.goal_setting_employee_end || ''} 
                        onChange={(e) => setActiveYear(prev => ({ ...prev, goal_setting_employee_end: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Manager Start</label>
                      <input type="date" value={activeYear.goal_setting_manager_start || ''} 
                        onChange={(e) => setActiveYear(prev => ({ ...prev, goal_setting_manager_start: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Manager End</label>
                      <input type="date" value={activeYear.goal_setting_manager_end || ''} 
                        onChange={(e) => setActiveYear(prev => ({ ...prev, goal_setting_manager_end: e.target.value }))}
                        className={inputClass} />
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="text-xs font-semibold mb-2 text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Mid-Year Review
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Start Date</label>
                      <input type="date" value={activeYear.mid_year_review_start || ''} 
                        onChange={(e) => setActiveYear(prev => ({ ...prev, mid_year_review_start: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">End Date</label>
                      <input type="date" value={activeYear.mid_year_review_end || ''} 
                        onChange={(e) => setActiveYear(prev => ({ ...prev, mid_year_review_end: e.target.value }))}
                        className={inputClass} />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-xs font-semibold mb-2 text-green-600 dark:text-green-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    End-Year Review
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Start Date</label>
                      <input type="date" value={activeYear.end_year_review_start || ''} 
                        onChange={(e) => setActiveYear(prev => ({ ...prev, end_year_review_start: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">End Date</label>
                      <input type="date" value={activeYear.end_year_review_end || ''} 
                        onChange={(e) => setActiveYear(prev => ({ ...prev, end_year_review_end: e.target.value }))}
                        className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 flex justify-end border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
                <button onClick={handleSaveYear} disabled={loading}
                  className="px-4 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50">
                  {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>
          )}

          {/* 2. WEIGHTS */}
          {activeTab === 'weights' && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Weight Configuration</h3>
                <button onClick={handleAddWeightConfig} disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              
              <div className="p-3 space-y-2">
                {settings.weightConfigs.map((weight) => (
                  <div key={weight.id} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-almet-sapphire bg-almet-sapphire/10 px-2 py-0.5 rounded-full">
                        ID: {weight.id}
                      </span>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: weight.id, type: 'weight' })}
                        className="p-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Hierarchy</label>
                        <SearchableDropdown
                          options={positionGroups}
                          value={weight.position_group}
                          onChange={(value) => handleUpdateWeightConfig(weight.id, 'position_group', value)}
                          placeholder="Select"
                          darkMode={darkMode}
                          portal={true}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Objectives %</label>
                        <input type="number" min="0" max="100" value={weight.objectives_weight}
                          onChange={(e) => {
                            const newWeights = [...settings.weightConfigs];
                            const idx = newWeights.findIndex(w => w.id === weight.id);
                            const objWeight = parseInt(e.target.value) || 0;
                            newWeights[idx].objectives_weight = objWeight;
                            newWeights[idx].competencies_weight = 100 - objWeight;
                            setSettings(prev => ({ ...prev, weightConfigs: newWeights }));
                          }}
                          onBlur={() => handleUpdateWeightConfig(weight.id, 'objectives_weight', weight.objectives_weight)}
                          className={inputClass} />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Competencies %</label>
                        <input type="number" value={weight.competencies_weight} readOnly
                          className={`${inputClass} cursor-not-allowed opacity-75`} />
                      </div>
                    </div>
                  </div>
                ))}

                {settings.weightConfigs.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">No configurations yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. LIMITS */}
          {activeTab === 'limits' && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Goal Limits</h3>
              </div>
              
              <div className="p-3">
                <div className="max-w-lg mx-auto grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block text-[10px] mb-2 text-gray-700 dark:text-gray-300 font-semibold">Minimum</label>
                    <input type="number" min="1" value={settings.goalLimits.min}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        goalLimits: { ...prev.goalLimits, min: parseInt(e.target.value) || 1 }
                      }))}
                      className={`${inputClass} text-center text-lg font-bold`} />
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <label className="block text-[10px] mb-2 text-gray-700 dark:text-gray-300 font-semibold">Maximum</label>
                    <input type="number" min="1" value={settings.goalLimits.max}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        goalLimits: { ...prev.goalLimits, max: parseInt(e.target.value) || 10 }
                      }))}
                      className={`${inputClass} text-center text-lg font-bold`} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 flex justify-end border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
                <button onClick={handleSaveGoalLimits} disabled={loading}
                  className="px-4 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50">
                  {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>
          )}

          {/* 4. DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Department Objectives</h3>
                <button onClick={handleAddDepartmentObjective} disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              <div className="p-3 space-y-2">
                {settings.departmentObjectives.map((obj) => (
                  <div key={obj.id} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        ID: {obj.id}
                      </span>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: obj.id, type: 'department' })}
                        className="p-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Department</label>
                          <SearchableDropdown
                            options={departments}
                            value={obj.department}
                            onChange={(value) => handleUpdateDepartmentObjective(obj.id, 'department', value)}
                            placeholder="Select"
                            darkMode={darkMode}
                            portal={true}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Weight %</label>
                          <input type="number" min="0" max="100" value={obj.weight}
                            onChange={(e) => {
                              const newObjs = settings.departmentObjectives.map(o => 
                                o.id === obj.id ? { ...o, weight: parseInt(e.target.value) || 0 } : o
                              );
                              setSettings(prev => ({ ...prev, departmentObjectives: newObjs }));
                            }}
                            onBlur={() => handleUpdateDepartmentObjective(obj.id, 'weight', obj.weight)}
                            className={inputClass} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Title</label>
                        <input type="text" value={obj.title}
                          onChange={(e) => {
                            const newObjs = settings.departmentObjectives.map(o => 
                              o.id === obj.id ? { ...o, title: e.target.value } : o
                            );
                            setSettings(prev => ({ ...prev, departmentObjectives: newObjs }));
                          }}
                          onBlur={(e) => handleUpdateDepartmentObjective(obj.id, 'title', e.target.value)}
                          className={inputClass}
                          placeholder="Objective title" />
                      </div>

                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Description</label>
                        <textarea value={obj.description || ''}
                          onChange={(e) => {
                            const newObjs = settings.departmentObjectives.map(o => 
                              o.id === obj.id ? { ...o, description: e.target.value } : o
                            );
                            setSettings(prev => ({ ...prev, departmentObjectives: newObjs }));
                          }}
                          onBlur={(e) => handleUpdateDepartmentObjective(obj.id, 'description', e.target.value)}
                          rows={2}
                          className={inputClass}
                          placeholder="Description (optional)" />
                      </div>
                    </div>
                  </div>
                ))}

                {settings.departmentObjectives.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">No objectives yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. SCALES */}
          {activeTab === 'scales' && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Evaluation Scale</h3>
                <button onClick={handleAddEvaluationScale} disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              
              <div className="p-3 space-y-2">
                {settings.evaluationScale.map((scale) => (
                  <div key={scale.id} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                        ID: {scale.id}
                      </span>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: scale.id, type: 'scale' })}
                        className="p-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Name</label>
                        <input type="text" value={scale.name}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, name: e.target.value } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={(e) => handleUpdateEvaluationScale(scale.id, 'name', e.target.value)}
                          placeholder="E+"
                          className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Value</label>
                        <input type="number" value={scale.value}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, value: parseInt(e.target.value) || 0 } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={() => handleUpdateEvaluationScale(scale.id, 'value', scale.value)}
                          placeholder="5"
                          className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Min %</label>
                        <input type="number" value={scale.range_min}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, range_min: parseInt(e.target.value) || 0 } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={() => handleUpdateEvaluationScale(scale.id, 'range_min', scale.range_min)}
                          placeholder="71"
                          className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Max %</label>
                        <input type="number" value={scale.range_max}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, range_max: parseInt(e.target.value) || 0 } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={() => handleUpdateEvaluationScale(scale.id, 'range_max', scale.range_max)}
                          placeholder="90"
                          className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Description</label>
                        <input type="text" value={scale.description}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, description: e.target.value } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={(e) => handleUpdateEvaluationScale(scale.id, 'description', e.target.value)}
                          placeholder="Exceeds"
                          className={inputClass} />
                      </div>
                    </div>
                  </div>
                ))}

                {settings.evaluationScale.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">No scales yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. TARGETS */}
          {activeTab === 'targets' && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Evaluation Targets</h3>
              </div>
              
              <div className="p-3">
                <div className="max-w-md mx-auto bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <label className="block text-[10px] mb-2 text-gray-700 dark:text-gray-300 font-semibold">Objective Score Target</label>
                  <input type="number" value={settings.evaluationTargets.objective_score_target}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      evaluationTargets: { ...prev.evaluationTargets, objective_score_target: parseInt(e.target.value) || 0 }
                    }))}
                    className={`${inputClass} text-center text-lg font-bold`} />
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">Maximum possible score</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 flex justify-end border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
                <button onClick={handleSaveEvaluationTargets} disabled={loading}
                  className="px-4 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50">
                  {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>
          )}

          {/* 7. STATUS TYPES */}
          {activeTab === 'statuses' && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Objective Status Types</h3>
                <button onClick={handleAddObjectiveStatus} disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              
              <div className="p-3 space-y-2">
                {settings.statusTypes?.map((status) => (
                  <div key={status.id} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">
                        ID: {status.id}
                      </span>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: status.id, type: 'status' })}
                        className="p-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Label</label>
                        <input type="text" value={status.label || ''}
                          onChange={(e) => {
                            const newStatuses = settings.statusTypes.map(s => 
                              s.id === status.id ? { ...s, label: e.target.value } : s
                            );
                            setSettings(prev => ({ ...prev, statusTypes: newStatuses }));
                          }}
                          onBlur={(e) => handleUpdateObjectiveStatus(status.id, 'label', e.target.value)}
                          placeholder="In Progress"
                          className={inputClass} />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Value</label>
                        <input type="text" value={status.value || ''}
                          onChange={(e) => {
                            const newStatuses = settings.statusTypes.map(s => 
                              s.id === status.id ? { ...s, value: e.target.value } : s
                            );
                            setSettings(prev => ({ ...prev, statusTypes: newStatuses }));
                          }}
                          onBlur={(e) => handleUpdateObjectiveStatus(status.id, 'value', e.target.value)}
                          placeholder="IN_PROGRESS"
                          className={inputClass} />
                      </div>
                    </div>
                  </div>
                ))}

                {(!settings.statusTypes || settings.statusTypes.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">No status types yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Notification Templates</h3>
                <button onClick={handleAddNotificationTemplate} disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              
              <div className="p-3 space-y-2">
                {settings.notificationTemplates?.map((template) => (
                  <div key={template.id} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                        ID: {template.id}
                      </span>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: template.id, type: 'notification' })}
                        className="p-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Trigger Type</label>
                          <select value={template.trigger_type || ''}
                            onChange={(e) => handleUpdateNotificationTemplate(template.id, 'trigger_type', e.target.value)}
                            className={inputClass}>
                            <option value="">Select Trigger</option>
                            <option value="GOAL_SETTING_START">Goal Setting Started</option>
                            <option value="MID_YEAR_START">Mid-Year Started</option>
                            <option value="MID_YEAR_END">Mid-Year Ending</option>
                            <option value="END_YEAR_START">End-Year Started</option>
                            <option value="END_YEAR_END">End-Year Ending</option>
                            <option value="FINAL_SCORE_PUBLISHED">Score Published</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Days Before</label>
                          <input type="number" value={template.days_before || 0}
                            onChange={(e) => handleUpdateNotificationTemplate(template.id, 'days_before', parseInt(e.target.value) || 0)}
                            placeholder="7"
                            className={inputClass} />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Subject</label>
                        <input type="text" value={template.subject || ''}
                          onChange={(e) => {
                            const newTemplates = settings.notificationTemplates.map(t => 
                              t.id === template.id ? { ...t, subject: e.target.value } : t
                            );
                            setSettings(prev => ({ ...prev, notificationTemplates: newTemplates }));
                          }}
                          onBlur={(e) => handleUpdateNotificationTemplate(template.id, 'subject', e.target.value)}
                          placeholder="Performance Review Reminder"
                          className={inputClass} />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Message Template</label>
                        <textarea value={template.message_template || ''}
                          onChange={(e) => {
                            const newTemplates = settings.notificationTemplates.map(t => 
                              t.id === template.id ? { ...t, message_template: e.target.value } : t
                            );
                            setSettings(prev => ({ ...prev, notificationTemplates: newTemplates }));
                          }}
                          onBlur={(e) => handleUpdateNotificationTemplate(template.id, 'message_template', e.target.value)}
                          rows={3}
                          placeholder="Hi {{employee_name}}, your {{year}} review is due by {{deadline}}."
                          className={inputClass} />
                        <p className="text-[9px] text-gray-500 mt-1">
                          Use: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{{employee_name}}'}</span>, 
                          <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded ml-1">{'{{year}}'}</span>, 
                          <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded ml-1">{'{{deadline}}'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {(!settings.notificationTemplates || settings.notificationTemplates.length === 0) && (
                  <div className="text-center py-8">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">No templates yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, type: null })}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}