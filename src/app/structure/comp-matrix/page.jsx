'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, RefreshCw, AlertCircle, Building, Users, ListFilter, LayoutGrid, 
  Table as TableIcon, Crown, ChevronRight, ArrowLeft, Target,
  Settings as SettingsIcon, X, BarChart3, Search 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { competencyApi } from '@/services/competencyApi';
import AssessmentMatrix from './AssessmentMatrix';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import { ToastProvider, useToast } from '@/components/common/Toast';
import { 
  LeadershipCardView, 
  LeadershipTableView, 
  TableView, 
  CardView 
} from '@/components/competency/CompetencyViewComponents';

const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false, loading = false, size = 'md', className = '' }) => {
  const variants = {
    primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
    secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white',
    success: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border-2 border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white bg-transparent',
    ghost: 'text-almet-sapphire hover:bg-almet-sapphire/10 border border-transparent',
  };
  const sizes = { xs: 'px-2 py-1 text-xs', sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow hover:scale-[1.02] active:scale-[0.98]'} ${className}`}
    >
      {loading ? <RefreshCw size={16} className="animate-spin"/> : <Icon size={16}/>}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const Field = ({ label, children, required }) => (
  <label className="block space-y-2">
    {label && (
      <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
    )}
    {children}
  </label>
);

const TextInput = ({ value, onChange, placeholder = '', required = false, autoFocus = false }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    autoFocus={autoFocus}
    className="w-full px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire placeholder-almet-waterloo dark:placeholder-almet-bali-hai"
  />
);

const StatChip = ({ label }) => (
  <div className="px-3 py-1 rounded-full bg-almet-mystic dark:bg-almet-comet text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai border border-gray-200 dark:border-almet-comet">
    {label}
  </div>
);

const CompetencyMatrixSystemInner = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();

  const [mainView, setMainView] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('competencyMainView') || 'matrix';
    }
    return 'matrix';
  });

  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('competencyActiveView') || 'skills';
    }
    return 'skills';
  });
  
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('competencyViewMode') || 'cards';
    }
    return 'cards';
  });
  
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [expandedChildGroups, setExpandedChildGroups] = useState({});
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddChildGroup, setShowAddChildGroup] = useState(false);

  const [skillGroups, setSkillGroups] = useState([]);
  const [behavioralGroups, setBehavioralGroups] = useState([]);
  const [leadershipMainGroups, setLeadershipMainGroups] = useState([]);
  const [skillsData, setSkillsData] = useState({});
  const [behavioralData, setBehavioralData] = useState({});
  const [leadershipFullData, setLeadershipFullData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [newGroupName, setNewGroupName] = useState('');
  const [newChildGroup, setNewChildGroup] = useState({ main_group: '', name: '' });
  const [newItem, setNewItem] = useState({ main_group: '', child_group: '', name: '' });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'default'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('competencyMainView', mainView);
    }
  }, [mainView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('competencyActiveView', activeView);
    }
  }, [activeView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('competencyViewMode', viewMode);
    }
  }, [viewMode]);

  const bgApp = darkMode ? 'bg-gray-950' : 'bg-almet-mystic';
  const card = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const border = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const text = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textDim = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [sg, bg, lmg] = await Promise.all([
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll(),
        competencyApi.leadershipMainGroups.getAll(),
      ]);
      
      const sgList = sg.results || [];
      const bgList = bg.results || [];
      const lmgList = lmg.results || [];
      
      setSkillGroups(sgList);
      setBehavioralGroups(bgList);
      setLeadershipMainGroups(lmgList);

      const [sgd, bgd, lmgd] = await Promise.all([
        Promise.all(sgList.map(g => competencyApi.skillGroups.getById(g.id))),
        Promise.all(bgList.map(g => competencyApi.behavioralGroups.getById(g.id))),
        Promise.all(lmgList.map(g => competencyApi.leadershipMainGroups.getById(g.id))),
      ]);

      const sMap = {};
      sgd.forEach(g => {
        sMap[g.name] = (g.skills || []).map(s => ({
          id: s.id,
          name: s.name,
          created_at: s.created_at,
          updated_at: s.updated_at
        }));
      });

      const bMap = {};
      bgd.forEach(g => {
        bMap[g.name] = (g.competencies || []).map(c => ({
          id: c.id,
          name: c.name,
          created_at: c.created_at,
          updated_at: c.updated_at
        }));
      });

      const leadershipStructure = [];
      for (const mg of lmgd) {
        const mainGroup = {
          id: mg.id,
          name: mg.name,
          childGroups: []
        };
        
        const childGroups = mg.child_groups || [];
        for (const cg of childGroups) {
          const cgDetail = await competencyApi.leadershipChildGroups.getById(cg.id);
          mainGroup.childGroups.push({
            id: cgDetail.id,
            name: cgDetail.name,
            items: (cgDetail.items || []).map(item => ({
              id: item.id,
              name: item.name,
              created_at: item.created_at,
              updated_at: item.updated_at
            }))
          });
        }
        
        leadershipStructure.push(mainGroup);
      }

      setSkillsData(sMap);
      setBehavioralData(bMap);
      setLeadershipFullData(leadershipStructure);
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mainView === 'management') {
      fetchData();
    }
  }, [mainView]);

  const getCurrentData = () => {
    switch (activeView) {
      case 'skills': return { data: skillsData, setData: setSkillsData, groups: skillGroups };
      case 'behavioral': return { data: behavioralData, setData: setBehavioralData, groups: behavioralGroups };
      case 'leadership': return { data: leadershipFullData, groups: leadershipMainGroups };
      default: return { data: {}, setData: () => {}, groups: [] };
    }
  };

  const { data: currentData, setData: setCurrentData, groups: currentGroups } = getCurrentData();

  const filteredData = useMemo(() => {
    if (activeView === 'leadership') {
      let filtered = leadershipFullData;
      
      if (selectedGroup) {
        filtered = filtered.filter(mg => mg.name === selectedGroup);
      }
      
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.map(mg => ({
          ...mg,
          childGroups: mg.childGroups.map(cg => ({
            ...cg,
            items: cg.items.filter(item => 
              item.name.toLowerCase().includes(q) ||
              cg.name.toLowerCase().includes(q) ||
              mg.name.toLowerCase().includes(q)
            )
          })).filter(cg => cg.items.length > 0)
        })).filter(mg => mg.childGroups.length > 0);
      }
      
      return filtered;
    }
    
    let obj = currentData;
    if (selectedGroup) obj = { [selectedGroup]: currentData[selectedGroup] || [] };
    if (!search) return obj;
    const q = search.toLowerCase();
    const next = {};
    Object.keys(obj).forEach(g => {
      const items = (obj[g] || []).filter(it => {
        const name = (it?.name || it).toLowerCase();
        return name.includes(q) || g.toLowerCase().includes(q);
      });
      if (items.length) next[g] = items;
    });
    return next;
  }, [currentData, leadershipFullData, search, selectedGroup, activeView]);

  const stats = useMemo(() => {
    if (activeView === 'leadership') {
      const totalGroups = leadershipFullData.length;
      const totalChildGroups = leadershipFullData.reduce((acc, mg) => acc + mg.childGroups.length, 0);
      const totalItems = leadershipFullData.reduce((acc, mg) => 
        acc + mg.childGroups.reduce((acc2, cg) => acc2 + cg.items.length, 0), 0
      );
      return { totalGroups, totalChildGroups, totalItems };
    }
    
    const totalGroups = Object.keys(currentData).length;
    const totalItems = Object.values(currentData).reduce((a, b) => a + b.length, 0);
    return { totalGroups, totalItems };
  }, [currentData, leadershipFullData, activeView]);

  const findGroupByName = (name) => currentGroups.find(g => g.name === name);
  
  const toggleExpand = (g) => {
    setExpandedCard(expandedCard === g ? null : g);
  };

  const toggleChildGroup = (mainGroupId, childGroupId) => {
    const key = `${mainGroupId}-${childGroupId}`;
    setExpandedChildGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const beginEditItem = (group, index, itemData = null) => {
    const name = itemData?.name || (currentData[group][index]?.name) || currentData[group][index];
    setEditKey(`${group}-${index}`);
    setEditValue(name);
  };

  const beginEditGroup = (groupId, groupName) => {
    setEditKey(`group-${groupId}`);
    setEditValue(groupName);
  };

  const beginEditChildGroup = (mainGroupId, childGroupId, childGroupName) => {
    setEditKey(`childgroup-${mainGroupId}-${childGroupId}`);
    setEditValue(childGroupName);
  };

  const beginEditLeadershipItem = (mainGroupId, childGroupId, itemId, itemName) => {
    setEditKey(`item-${mainGroupId}-${childGroupId}-${itemId}`);
    setEditValue(itemName);
  };

  const addGroup = async () => {
    if (!newGroupName.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      if (activeView === 'skills') {
        await competencyApi.skillGroups.create({ name: newGroupName.trim() });
      } else if (activeView === 'behavioral') {
        await competencyApi.behavioralGroups.create({ name: newGroupName.trim() });
      } else if (activeView === 'leadership') {
        await competencyApi.leadershipMainGroups.create({ name: newGroupName.trim() });
      }
      await fetchData();
      setShowAddGroup(false);
      setNewGroupName('');
      showSuccess('Group created successfully');
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Could not add group');
    } finally {
      setBusy(false);
    }
  };

  const addChildGroup = async () => {
    if (!newChildGroup.main_group || !newChildGroup.name.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const mainGroup = leadershipMainGroups.find(g => g.id === parseInt(newChildGroup.main_group));
      if (!mainGroup) throw new Error('Main group not found');
      
      await competencyApi.leadershipChildGroups.create({
        main_group: mainGroup.id,
        name: newChildGroup.name.trim()
      });
      
      await fetchData();
      setShowAddChildGroup(false);
      setNewChildGroup({ main_group: '', name: '' });
      showSuccess('Child group created successfully');
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Could not add child group');
    } finally {
      setBusy(false);
    }
  };

  const deleteGroup = async (gName, gId = null) => {
    const g = gId ? currentGroups.find(gr => gr.id === gId) : findGroupByName(gName);
    if (!g) {
      showError('Group not found');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Group',
      message: `Are you sure you want to delete "${gName}" group and all its items? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setBusy(true);
        setErr(null);
        try {
          if (activeView === 'skills') {
            await competencyApi.skillGroups.delete(g.id);
          } else if (activeView === 'behavioral') {
            await competencyApi.behavioralGroups.delete(g.id);
          } else if (activeView === 'leadership') {
            await competencyApi.leadershipMainGroups.delete(g.id);
          }
          await fetchData();
          if (expandedCard === gName || expandedCard === g.id) setExpandedCard(null);
          if (selectedGroup === gName) setSelectedGroup('');
          showSuccess('Group deleted successfully');
        } catch (e) {
          setErr(e);
          showError(e?.message || 'Could not delete group');
        } finally {
          setBusy(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const deleteChildGroup = async (childGroupId, childGroupName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Child Group',
      message: `Are you sure you want to delete "${childGroupName}" and all its items?`,
      type: 'danger',
      onConfirm: async () => {
        setBusy(true);
        setErr(null);
        try {
          await competencyApi.leadershipChildGroups.delete(childGroupId);
          await fetchData();
          showSuccess('Child group deleted successfully');
        } catch (e) {
          setErr(e);
          showError(e?.message || 'Could not delete child group');
        } finally {
          setBusy(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const addItem = async () => {
    if (activeView === 'leadership') {
      if (!newItem.child_group || !newItem.name.trim()) return;
    } else {
      if (!newItem.main_group || !newItem.name.trim()) return;
    }
    
    setBusy(true);
    setErr(null);
    try {
      if (activeView === 'leadership') {
        await competencyApi.leadershipItems.create({
          child_group: parseInt(newItem.child_group),
          name: newItem.name.trim()
        });
      } else {
        const g = findGroupByName(newItem.main_group);
        if (!g) throw new Error('Group not found');
        const payload = { group: g.id, name: newItem.name.trim() };
        if (activeView === 'skills') {
          await competencyApi.skills.create(payload);
        } else if (activeView === 'behavioral') {
          await competencyApi.behavioralCompetencies.create(payload);
        }
      }
      
      await fetchData();
      setShowAddItem(false);
      setNewItem({ main_group: '', child_group: '', name: '' });
      showSuccess('Item added successfully');
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Could not add item');
    } finally {
      setBusy(false);
    }
  };

  const deleteItem = async (itemId, itemName, childGroupId = null) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Item',
      message: `Are you sure you want to delete "${itemName}"?`,
      type: 'danger',
      onConfirm: async () => {
        setBusy(true);
        setErr(null);
        try {
          if (activeView === 'leadership') {
            await competencyApi.leadershipItems.delete(itemId);
          } else if (activeView === 'skills') {
            await competencyApi.skills.delete(itemId);
          } else if (activeView === 'behavioral') {
            await competencyApi.behavioralCompetencies.delete(itemId);
          }
          await fetchData();
          showSuccess('Item deleted successfully');
        } catch (e) {
          setErr(e);
          showError(e?.message || 'Could not delete item');
        } finally {
          setBusy(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const cancelEdit = () => {
    setEditKey(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editKey || !editValue.trim()) return;

    if (editKey.startsWith('group-')) {
      const groupId = parseInt(editKey.replace('group-', ''));
      const gObj = currentGroups.find(g => g.id === groupId);
      if (!gObj) {
        showError('Group not found');
        return;
      }

      setBusy(true);
      setErr(null);
      try {
        const payload = { name: editValue.trim() };
        if (activeView === 'skills') {
          await competencyApi.skillGroups.update(gObj.id, payload);
        } else if (activeView === 'behavioral') {
          await competencyApi.behavioralGroups.update(gObj.id, payload);
        } else if (activeView === 'leadership') {
          await competencyApi.leadershipMainGroups.update(gObj.id, payload);
        }
        await fetchData();
        cancelEdit();
        showSuccess('Group updated successfully');
      } catch (e) {
        setErr(e);
        showError(e?.message || 'Could not update group');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (editKey.startsWith('childgroup-')) {
      const parts = editKey.split('-');
      const childGroupId = parseInt(parts[2]);

      setBusy(true);
      setErr(null);
      try {
        const childGroup = leadershipFullData
          .flatMap(mg => mg.childGroups)
          .find(cg => cg.id === childGroupId);
        
        if (!childGroup) throw new Error('Child group not found');

        const mainGroup = leadershipFullData.find(mg => 
          mg.childGroups.some(cg => cg.id === childGroupId)
        );

        await competencyApi.leadershipChildGroups.update(childGroupId, {
          main_group: mainGroup.id,
          name: editValue.trim()
        });
        
        await fetchData();
        cancelEdit();
        showSuccess('Child group updated successfully');
      } catch (e) {
        setErr(e);
        showError(e?.message || 'Could not update child group');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (editKey.startsWith('item-')) {
      const parts = editKey.split('-');
      const itemId = parseInt(parts[3]);
      const childGroupId = parseInt(parts[2]);

      setBusy(true);
      setErr(null);
      try {
        await competencyApi.leadershipItems.update(itemId, {
          child_group: childGroupId,
          name: editValue.trim()
        });
        
        await fetchData();
        cancelEdit();
        showSuccess('Item updated successfully');
      } catch (e) {
        setErr(e);
        showError(e?.message || 'Could not update item');
      } finally {
        setBusy(false);
      }
      return;
    }

    const [group, idxStr] = editKey.split('-');
    const index = Number(idxStr);
    const item = currentData[group][index];
    const id = item?.id;

    if (!id) {
      setCurrentData(prev => ({
        ...prev,
        [group]: prev[group].map((it, i) => i === index ? editValue.trim() : it)
      }));
      cancelEdit();
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const gObj = findGroupByName(group);
      if (!gObj) throw new Error('Group not found');
      
      const payload = { group: gObj.id, name: editValue.trim() };
      if (activeView === 'skills') {
        await competencyApi.skills.update(id, payload);
      } else if (activeView === 'behavioral') {
        await competencyApi.behavioralCompetencies.update(id, payload);
      }
      
      await fetchData();
      cancelEdit();
      showSuccess('Item updated successfully');
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Could not update item');
    } finally {
      setBusy(false);
    }
  };

  if (loading && mainView === 'management') {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="mx-auto">
            <div className={`${card} border ${border} rounded-2xl p-10 shadow-md text-center`}>
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-almet-mystic border-t-almet-sapphire rounded-full animate-spin" />
              <p className={`${text} font-semibold`}>Loading data...</p>
              <p className={`${textDim} text-sm mt-1`}>Please wait.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (err && !loading && mainView === 'management') {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="mx-auto space-y-4">
            <div className={`${card} border border-red-200 rounded-2xl p-8 shadow-md`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600" />
                <div>
                  <h3 className="text-red-700 font-bold">An error occurred</h3>
                  <p className="text-sm text-red-600 mt-1">{err?.message || 'Unexpected error.'}</p>
                </div>
                <div className="ml-auto">
                  <ActionButton icon={RefreshCw} label="Try again" onClick={fetchData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const mainGroupOptions = leadershipMainGroups.map(g => ({ value: g.id.toString(), label: g.name }));
  const groupOptions = activeView === 'leadership' 
    ? mainGroupOptions 
    : Object.keys(activeView === 'skills' ? skillsData : behavioralData).map(g => ({ value: g, label: g }));

  // Matrix view - Assessment Matrix component
  if (mainView === 'matrix') {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="mx-auto space-y-4">
            <AssessmentMatrix onNavigateToManagement={() => setMainView('management')} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Management view - Competency management
  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} p-6`}>
        <div className="mx-auto space-y-4">
          {/* Header */}
          <div className={`${card} border ${border} rounded-xl shadow-sm`}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMainView('matrix')}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-almet-comet' : 'hover:bg-almet-mystic'
                    }`}
                    title="Back to Assessment Matrix"
                  >
                    <ArrowLeft size={20} className={text} />
                  </button>
                  
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-almet-comet' : 'bg-almet-mystic'}`}>
                    <Target className="w-5 h-5 text-almet-sapphire" />
                  </div>
                  
                  <div>
                    <h1 className={`text-xl font-bold ${text}`}>Competency Management</h1>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => setMainView('matrix')}
                        className={`text-xs ${textDim} hover:text-almet-sapphire transition-colors`}
                      >
                        Assessment Matrix
                      </button>
                      <ChevronRight size={12} className={textDim} />
                      <span className={`text-xs font-semibold ${text}`}>
                        Competency Management
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatChip label={`${stats.totalGroups} groups`} />
                  {activeView === 'leadership' && stats.totalChildGroups > 0 && (
                    <StatChip label={`${stats.totalChildGroups} child groups`} />
                  )}
                  <StatChip label={`${stats.totalItems} items`} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls Bar */}
          <div className={`${card} border ${border} rounded-2xl p-2 shadow-sm`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div className="flex items-center gap-1">
                {[
                  { id: 'skills', name: 'Skills', icon: Target },
                  { id: 'behavioral', name: 'Behavioral', icon: Users },
                  { id: 'leadership', name: 'Leadership', icon: Crown },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveView(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeView === t.id ? 'bg-almet-sapphire text-white shadow' : 'text-almet-waterloo hover:bg-almet-mystic hover:text-almet-cloud-burst'}`}
                  >
                    <t.icon size={16} />
                    <span className="hidden sm:inline">{t.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-lg transition ${viewMode === 'cards' ? 'bg-white dark:bg-gray-700 text-almet-sapphire shadow-sm' : 'text-gray-500'}`}
                    title="Card View"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 text-almet-sapphire shadow-sm' : 'text-gray-500'}`}
                    title="Table View"
                  >
                    <TableIcon size={16} />
                  </button>
                </div>

                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-almet-waterloo" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-9 pr-3 py-2 rounded-xl border-2 text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                  />
                </div>

                <SearchableDropdown
                  options={[{ value: '', label: 'All groups' }, ...groupOptions]}
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  placeholder="Filter"
                  searchPlaceholder="Search groups..."
                  darkMode={darkMode}
                  icon={<ListFilter size={14} />}
                  portal={true}
                  className="min-w-[140px]"
                />

                <ActionButton icon={Plus} label="Item" onClick={() => setShowAddItem(true)} size="sm" />
                <ActionButton icon={Building} label="Group" onClick={() => setShowAddGroup(true)} size="sm" variant="success" />
              </div>
            </div>
          </div>

          {/* Content Views */}
          {activeView === 'leadership' ? (
            viewMode === 'table' ? (
              <LeadershipTableView
                filteredData={filteredData}
                beginEditGroup={beginEditGroup}
                beginEditChildGroup={beginEditChildGroup}
                beginEditLeadershipItem={beginEditLeadershipItem}
                deleteGroup={deleteGroup}
                deleteChildGroup={deleteChildGroup}
                deleteItem={deleteItem}
                editKey={editKey}
                editValue={editValue}
                setEditValue={setEditValue}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                busy={busy}
                darkMode={darkMode}
              />
            ) : (
              <LeadershipCardView
                filteredData={filteredData}
                expandedCard={expandedCard}
                toggleExpand={toggleExpand}
                expandedChildGroups={expandedChildGroups}
                toggleChildGroup={toggleChildGroup}
                editKey={editKey}
                editValue={editValue}
                setEditValue={setEditValue}
                beginEditGroup={beginEditGroup}
                beginEditChildGroup={beginEditChildGroup}
                beginEditLeadershipItem={beginEditLeadershipItem}
                deleteGroup={deleteGroup}
                deleteChildGroup={deleteChildGroup}
                deleteItem={deleteItem}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                busy={busy}
                setShowAddChildGroup={setShowAddChildGroup}
                setNewChildGroup={setNewChildGroup}
                setShowAddItem={setShowAddItem}
                setNewItem={setNewItem}
                darkMode={darkMode}
              />
            )
          ) : (
            viewMode === 'table' ? (
              <TableView
                filteredData={filteredData}
                beginEditItem={beginEditItem}
                deleteItem={deleteItem}
                editKey={editKey}
                editValue={editValue}
                setEditValue={setEditValue}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                busy={busy}
                darkMode={darkMode}
              />
            ) : (
              <CardView
                filteredData={filteredData}
                expandedCard={expandedCard}
                toggleExpand={toggleExpand}
                beginEditItem={beginEditItem}
                beginEditGroup={beginEditGroup}
                deleteItem={deleteItem}
                deleteGroup={deleteGroup}
                editKey={editKey}
                editValue={editValue}
                setEditValue={setEditValue}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                busy={busy}
                setShowAddItem={setShowAddItem}
                setNewItem={setNewItem}
                darkMode={darkMode}
              />
            )
          )}
        </div>

        {/* Add Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`${card} border ${border} rounded-2xl w-full max-w-md shadow-2xl`}>
              <div className={`p-5 border-b ${border} flex items-center gap-2`}>
                <span className="p-2 rounded-xl bg-almet-mystic">
                  <Plus className="text-almet-sapphire" />
                </span>
                <h3 className={`text-sm font-bold ${text}`}>
                  New {activeView === 'skills' ? 'Skill' : activeView === 'behavioral' ? 'Competency' : 'Leadership Item'}
                </h3>
                <button
                  className="ml-auto p-2 rounded-xl hover:bg-almet-mystic"
                  onClick={() => {
                    setShowAddItem(false);
                    setNewItem({ main_group: '', child_group: '', name: '' });
                  }}
                >
                  <X />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {activeView === 'leadership' ? (
                  <>
                    <Field label="Main Group" required>
                      <select
                        value={newItem.main_group}
                        onChange={(e) => {
                          setNewItem(s => ({ ...s, main_group: e.target.value, child_group: '' }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                      >
                        <option value="">Select main group</option>
                        {leadershipMainGroups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </Field>
                    {newItem.main_group && (
                      <Field label="Child Group" required>
                        <select
                          value={newItem.child_group}
                          onChange={(e) => setNewItem(s => ({ ...s, child_group: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                        >
                          <option value="">Select child group</option>
                          {leadershipFullData
                            .find(mg => mg.id === parseInt(newItem.main_group))
                            ?.childGroups.map(cg => (
                              <option key={cg.id} value={cg.id}>{cg.name}</option>
                            ))}
                        </select>
                      </Field>
                    )}
                  </>
                ) : (
                  <Field label="Group" required>
                    <SearchableDropdown
                      options={groupOptions}
                      value={newItem.main_group}
                      onChange={(value) => setNewItem(s => ({ ...s, main_group: value }))}
                      placeholder="Select a group"
                      searchPlaceholder="Search groups..."
                      darkMode={darkMode}
                      portal={true}
                    />
                  </Field>
                )}
                <Field label="Name" required>
                  <TextInput
                    value={newItem.name}
                    onChange={(e) => setNewItem(s => ({ ...s, name: e.target.value }))}
                    placeholder={activeView === 'leadership' ? 'e.g. Strategic Planning' : 'e.g. React, Teamwork'}
                  />
                </Field>
              </div>
              <div className="p-5 pt-0 flex justify-end gap-2">
                <ActionButton
                  icon={X}
                  label="Close"
                  variant="outline"
                  onClick={() => {
                    setShowAddItem(false);
                    setNewItem({ main_group: '', child_group: '', name: '' });
                  }}
                />
                <ActionButton
                  icon={Plus}
                  label="Add"
                  onClick={addItem}
                  loading={busy}
                  disabled={
                    !newItem.name.trim() || 
                    (activeView === 'leadership' ? (!newItem.main_group || !newItem.child_group) : !newItem.main_group)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Group Modal */}
        {showAddGroup && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`${card} border ${border} rounded-2xl w-full max-w-md shadow-2xl`}>
              <div className={`p-5 border-b ${border} flex items-center gap-2`}>
                <span className="p-2 rounded-xl bg-almet-mystic">
                  <Building className="text-almet-sapphire" />
                </span>
                <h3 className={`text-sm font-bold ${text}`}>
                  New {activeView === 'leadership' ? 'Main Group' : 'Group'}
                </h3>
                <button
                  className="ml-auto p-2 rounded-xl hover:bg-almet-mystic"
                  onClick={() => {
                    setShowAddGroup(false);
                    setNewGroupName('');
                  }}
                >
                  <X />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Group name" required>
                  <TextInput
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={activeView === 'leadership' ? 'e.g. Strategic Leadership' : 'e.g. Frontend, Leadership'}
                  />
                </Field>
              </div>
              <div className="p-5 pt-0 flex justify-end gap-2">
                <ActionButton
                  icon={X}
                  label="Close"
                  variant="outline"
                  onClick={() => {
                    setShowAddGroup(false);
                    setNewGroupName('');
                  }}
                />
                <ActionButton
                  icon={Plus}
                  label="Create"
                  variant="success"
                  onClick={addGroup}
                  loading={busy}
                  disabled={!newGroupName.trim()}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Child Group Modal - Leadership only */}
        {activeView === 'leadership' && showAddChildGroup && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`${card} border ${border} rounded-2xl w-full max-w-md shadow-2xl`}>
              <div className={`p-5 border-b ${border} flex items-center gap-2`}>
                <span className="p-2 rounded-xl bg-almet-mystic">
                  <Building className="text-almet-sapphire" />
                </span>
                <h3 className={`text-sm font-bold ${text}`}>New Child Group</h3>
                <button
                  className="ml-auto p-2 rounded-xl hover:bg-almet-mystic"
                  onClick={() => {
                    setShowAddChildGroup(false);
                    setNewChildGroup({ main_group: '', name: '' });
                  }}
                >
                  <X />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Main Group" required>
                  <select
                    value={newChildGroup.main_group}
                    onChange={(e) => setNewChildGroup(s => ({ ...s, main_group: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                  >
                    <option value="">Select main group</option>
                    {leadershipMainGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Child Group name" required>
                  <TextInput
                    value={newChildGroup.name}
                    onChange={(e) => setNewChildGroup(s => ({ ...s, name: e.target.value }))}
                    placeholder="e.g. Strategic Thinking"
                  />
                </Field>
              </div>
              <div className="p-5 pt-0 flex justify-end gap-2">
                <ActionButton
                  icon={X}
                  label="Close"
                  variant="outline"
                  onClick={() => {
                    setShowAddChildGroup(false);
                    setNewChildGroup({ main_group: '', name: '' });
                  }}
                />
                <ActionButton
                  icon={Plus}
                  label="Create"
                  variant="success"
                  onClick={addChildGroup}
                  loading={busy}
                  disabled={!newChildGroup.main_group || !newChildGroup.name.trim()}
                />
              </div>
            </div>
          </div>
        )}

        {/* Floating Child Group Button - Leadership only */}
        {activeView === 'leadership' && mainView === 'management' && (
          <div className="fixed bottom-6 right-6 z-40">
            <ActionButton
              icon={Plus}
              label="Child Group"
              onClick={() => setShowAddChildGroup(true)}
              variant="secondary"
              size="md"
              className="shadow-lg"
            />
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Delete"
          cancelText="Cancel"
          type={confirmModal.type}
          loading={busy}
          darkMode={darkMode}
        />
      </div>
    </DashboardLayout>
  );
};

const CompetencyMatrixSystem = () => {
  return (
    <ToastProvider>
      <CompetencyMatrixSystemInner />
    </ToastProvider>
  );
};

export default CompetencyMatrixSystem;