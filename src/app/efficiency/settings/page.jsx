"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useToast } from "@/components/common/Toast";
import performanceApi from "@/services/performanceService";
import pmSurveyApi from "@/services/pmSurveyService";
import {
  Save, Plus, Trash2, Loader, Calendar, Target,
  Award, Settings as SettingsIcon, ArrowLeft, CheckCircle,
  Edit2, Check, X, Star, MessageSquare, AlignLeft,
  ToggleLeft, ToggleRight, Hash, Type, List,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const SECTION_OPTIONS = [
  { value: "GOAL_SETTING",  label: "Goal Setting & Expectations" },
  { value: "FEEDBACK",      label: "Feedback & Communication" },
  { value: "REVIEWS",       label: "Performance Reviews" },
  { value: "DEVELOPMENT",   label: "Development & Growth" },
  { value: "FAIRNESS",      label: "Fairness & Motivation" },
  { value: "OVERALL",       label: "Overall Experience" },
];
const TYPE_OPTIONS = [
  { value: "LIKERT_5", label: "Likert Scale (1–5)" },
  { value: "TEXT",     label: "Open Text Answer" },
];


const SECTION_ICON_MAP = {
  GOAL_SETTING:  <Target className="w-3.5 h-3.5" />,
  FEEDBACK:      <MessageSquare className="w-3.5 h-3.5" />,
  REVIEWS:       <CheckCircle className="w-3.5 h-3.5" />,
  DEVELOPMENT:   <Star className="w-3.5 h-3.5" />,
  FAIRNESS:      <Award className="w-3.5 h-3.5" />,
  OVERALL:       <SettingsIcon className="w-3.5 h-3.5" />,
};

const SECTION_COLORS = {
  GOAL_SETTING:  "blue",
  FEEDBACK:      "purple",
  REVIEWS:       "emerald",
  DEVELOPMENT:   "amber",
  FAIRNESS:      "rose",
  OVERALL:       "indigo",
};

const COLOR_CLASSES = {
  blue:    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
  purple:  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
  amber:   "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
  indigo:  "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30",
  rose:    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30",
};

const EMPTY_QUESTION = {
  section:       "WORK_ENVIRONMENT",
  question_text: "",
  question_type: "LIKERT_5",
  display_order: 0,
  is_active:     true,
  is_required:   true,
};

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function PerformanceSettingsPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const toast = useToast();

  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState("years");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: null });

  // years
  const [activeYear, setActiveYear]         = useState(null);
  const [positionGroups, setPositionGroups] = useState([]);
  const [years, setYears]                   = useState([]);
  const [editingYear, setEditingYear]       = useState(null);
  const [showAddYear, setShowAddYear]       = useState(false);
  const [newYear, setNewYear] = useState({
    year: new Date().getFullYear() + 1,
    goal_setting_start: "", goal_setting_end: "",
    mid_year_review_start: "", mid_year_review_end: "",
    end_year_review_start: "", end_year_review_end: "",
  });

  // settings
  const [settings, setSettings] = useState({
    weightConfigs: [],
    goalLimits: { min: 3, max: 7 },
    evaluationScale: [],
    evaluationTargets: { objective_score_target: 21 },
    statusTypes: [],
  });

  // survey questions
  const [surveyQuestions, setSurveyQuestions]       = useState([]);
  const [surveyLoading, setSurveyLoading]           = useState(false);
  const [showAddQuestion, setShowAddQuestion]       = useState(false);
  const [editingQuestion, setEditingQuestion]       = useState(null); // { id, ...fields }
  const [newQuestion, setNewQuestion]               = useState({ ...EMPTY_QUESTION });
  const [groupedQuestions, setGroupedQuestions]     = useState({});

  // ── init ──
  useEffect(() => { loadAllData(); }, []);

  useEffect(() => {
    if (activeTab === "survey") loadSurveyQuestions();
  }, [activeTab]);

  // group questions by section whenever list changes
  useEffect(() => {
    const grouped = {};
    surveyQuestions.forEach(q => {
      if (!grouped[q.section]) grouped[q.section] = [];
      grouped[q.section].push(q);
    });
    // sort each section by display_order
    Object.keys(grouped).forEach(sec => {
      grouped[sec].sort((a, b) => a.display_order - b.display_order);
    });
    setGroupedQuestions(grouped);
  }, [surveyQuestions]);

  // ─────────────────────────────────────────────────────────
  // LOAD FUNCTIONS
  // ─────────────────────────────────────────────────────────
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadActiveYear(), loadYears(),
        loadPositionGroups(), loadSettings(),
      ]);
    } catch (err) {
      console.error(err);
      toast.showError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const loadActiveYear = async () => {
    try {
      const d = await performanceApi.years.getActiveYear();
      setActiveYear(d);
    } catch {}
  };

  const loadYears = async () => {
    try {
      const r = await performanceApi.years.list();
      setYears(r.results || r);
    } catch {}
  };

  const loadPositionGroups = async () => {
    try {
      const r = await performanceApi.positionGroups.list();
      setPositionGroups(r.results || r);
    } catch {}
  };

  const loadSettings = async () => {
    try {
      const [weightsRes, limitsRes, scalesRes, targetsRes, statusesRes] = await Promise.all([
        performanceApi.weightConfigs.list(),
        performanceApi.goalLimits.getActiveConfig(),
        performanceApi.evaluationScales.list(),
        performanceApi.evaluationTargets.getActiveConfig(),
        performanceApi.objectiveStatuses.list(),
      ]);
      setSettings({
        weightConfigs:    weightsRes.results || weightsRes,
        goalLimits:       { min: limitsRes.min_goals, max: limitsRes.max_goals },
        evaluationScale:  scalesRes.results  || scalesRes,
        evaluationTargets:{ objective_score_target: targetsRes.objective_score_target },
        statusTypes:      statusesRes.results || statusesRes,
      });
    } catch {
      toast.showError("Error loading settings");
    }
  };

  const loadSurveyQuestions = async () => {
    setSurveyLoading(true);
    try {
      const r = await pmSurveyApi.questions.list();
      setSurveyQuestions(r.results || r);
    } catch {
      toast.showError("Error loading survey questions");
    } finally {
      setSurveyLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // YEAR HANDLERS (unchanged logic)
  // ─────────────────────────────────────────────────────────
  const handleAddYear = async () => {
    if (!newYear.year || !newYear.goal_setting_start || !newYear.goal_setting_end) {
      toast.showError("Year, goal setting start and end are required");
      return;
    }
    setLoading(true);
    try {
      await performanceApi.years.create(newYear);
      toast.showSuccess("Year created successfully");
      await loadYears();
      setShowAddYear(false);
      setNewYear({
        year: new Date().getFullYear() + 1,
        goal_setting_start: "", goal_setting_end: "",
        mid_year_review_start: "", mid_year_review_end: "",
        end_year_review_start: "", end_year_review_end: "",
      });
    } catch (err) {
      const msg = err.response?.data?.year?.[0] || err.response?.data?.detail || "Error creating year";
      toast.showError(msg);
    } finally { setLoading(false); }
  };

  const handleSaveEditYear = async () => {
    if (!editingYear) return;
    setLoading(true);
    try {
      await performanceApi.years.update(editingYear.id, editingYear);
      toast.showSuccess("Year updated successfully");
      await loadYears(); await loadActiveYear();
      setEditingYear(null);
    } catch { toast.showError("Error updating year"); }
    finally { setLoading(false); }
  };

  const handleSetActive = async (id) => {
    setLoading(true);
    try {
      await performanceApi.years.setActive(id);
      toast.showSuccess("Active year updated");
      await loadYears(); await loadActiveYear();
    } catch { toast.showError("Error setting active year"); }
    finally { setLoading(false); }
  };

  const handleDeleteYear = async () => {
    setLoading(true);
    try {
      await performanceApi.years.delete(deleteModal.id);
      toast.showSuccess("Year deleted");
      await loadYears(); await loadActiveYear();
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch { toast.showError("Error deleting year"); }
    finally { setLoading(false); }
  };

  // ─────────────────────────────────────────────────────────
  // SETTINGS HANDLERS (unchanged logic)
  // ─────────────────────────────────────────────────────────
  const handleSaveGoalSettingPeriod = async () => {
    setLoading(true);
    try {
      if (activeYear?.id) {
        await performanceApi.years.update(activeYear.id, { ...activeYear, is_active: true });
        toast.showSuccess("Period dates saved successfully");
        await loadActiveYear(); await loadYears();
      }
    } catch { toast.showError("Error saving dates"); }
    finally { setLoading(false); }
  };

  const handleAddWeightConfig = async () => {
    if (!positionGroups.length) { toast.showError("No position groups available"); return; }
    const existingIds = settings.weightConfigs.map(w => w.position_group);
    const available   = positionGroups.filter(pg => !existingIds.includes(pg.id));
    if (!available.length) { toast.showInfo("All position groups already configured"); return; }
    setLoading(true);
    try {
      await performanceApi.weightConfigs.create({ position_group: available[0].id, objectives_weight: 70, competencies_weight: 30, is_active: true });
      await loadSettings(); toast.showSuccess("Configuration added");
    } catch { toast.showError("Error adding configuration"); }
    finally { setLoading(false); }
  };

  const handleUpdateWeightConfig = async (id, field, value) => {
    setLoading(true);
    try {
      const cfg = settings.weightConfigs.find(w => w.id === id);
      await performanceApi.weightConfigs.update(id, { ...cfg, [field]: value });
      toast.showSuccess("Updated successfully");
    } catch { toast.showError("Error updating"); await loadSettings(); }
    finally { setLoading(false); }
  };

  const handleDeleteWeightConfig = async () => {
    setLoading(true);
    try {
      await performanceApi.weightConfigs.delete(deleteModal.id);
      await loadSettings(); toast.showSuccess("Configuration deleted");
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch { toast.showError("Error deleting"); }
    finally { setLoading(false); }
  };

  const handleSaveGoalLimits = async () => {
    setLoading(true);
    try {
      const cfg = await performanceApi.goalLimits.getActiveConfig();
      await performanceApi.goalLimits.update(cfg.id, { min_goals: settings.goalLimits.min, max_goals: settings.goalLimits.max, is_active: true });
      toast.showSuccess("Goal limits saved"); await loadSettings();
    } catch { toast.showError("Error saving limits"); }
    finally { setLoading(false); }
  };

  const handleAddEvaluationScale = async () => {
    setLoading(true);
    try {
      await performanceApi.evaluationScales.create({ name: "NEW", value: 0, range_min: 0, range_max: 0, description: "", is_active: true });
      await loadSettings(); toast.showSuccess("Scale added");
    } catch { toast.showError("Error adding scale"); }
    finally { setLoading(false); }
  };

  const handleUpdateEvaluationScale = async (id, field, value) => {
    try {
      const scale = settings.evaluationScale.find(s => s.id === id);
      await performanceApi.evaluationScales.update(id, { ...scale, [field]: value });
      await loadSettings();
    } catch { toast.showError("Error updating"); }
  };

  const handleDeleteEvaluationScale = async () => {
    setLoading(true);
    try {
      await performanceApi.evaluationScales.delete(deleteModal.id);
      await loadSettings(); toast.showSuccess("Scale deleted");
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch { toast.showError("Error deleting"); }
    finally { setLoading(false); }
  };

  const handleSaveEvaluationTargets = async () => {
    setLoading(true);
    try {
      const cfg = await performanceApi.evaluationTargets.getActiveConfig();
      await performanceApi.evaluationTargets.update(cfg.id, { objective_score_target: settings.evaluationTargets.objective_score_target, is_active: true });
      toast.showSuccess("Targets saved"); await loadSettings();
    } catch { toast.showError("Error saving targets"); }
    finally { setLoading(false); }
  };

  const handleAddObjectiveStatus = async () => {
    setLoading(true);
    try {
      await performanceApi.objectiveStatuses.create({ label: "New Status", value: "NEW_STATUS", is_active: true });
      await loadSettings(); toast.showSuccess("Status added");
    } catch { toast.showError("Error adding status"); }
    finally { setLoading(false); }
  };

  const handleUpdateObjectiveStatus = async (id, field, value) => {
    try {
      const st = settings.statusTypes.find(s => s.id === id);
      await performanceApi.objectiveStatuses.update(id, { ...st, [field]: value });
      await loadSettings();
    } catch { toast.showError("Error updating"); }
  };

  const handleDeleteObjectiveStatus = async () => {
    setLoading(true);
    try {
      await performanceApi.objectiveStatuses.delete(deleteModal.id);
      await loadSettings(); toast.showSuccess("Status deleted");
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch { toast.showError("Error deleting"); }
    finally { setLoading(false); }
  };

  // ─────────────────────────────────────────────────────────
  // SURVEY QUESTION HANDLERS
  // ─────────────────────────────────────────────────────────
  const handleAddQuestion = async () => {
    if (!newQuestion.question_text.trim()) {
      toast.showError("Question text is required");
      return;
    }
    setSurveyLoading(true);
    try {
      await pmSurveyApi.questions.create(newQuestion);
      toast.showSuccess("Question added successfully");
      await loadSurveyQuestions();
      setShowAddQuestion(false);
      setNewQuestion({ ...EMPTY_QUESTION });
    } catch (err) {
      const msg = err.response?.data?.question_text?.[0]
        || err.response?.data?.detail
        || "Error creating question";
      toast.showError(msg);
    } finally { setSurveyLoading(false); }
  };

  const handleStartEditQuestion = (q) => {
    setEditingQuestion({ ...q });
    setShowAddQuestion(false);
  };

  const handleCancelEditQuestion = () => setEditingQuestion(null);

  const handleSaveEditQuestion = async () => {
    if (!editingQuestion) return;
    if (!editingQuestion.question_text.trim()) {
      toast.showError("Question text is required");
      return;
    }
    setSurveyLoading(true);
    try {
      await pmSurveyApi.questions.update(editingQuestion.id, editingQuestion);
      toast.showSuccess("Question updated successfully");
      await loadSurveyQuestions();
      setEditingQuestion(null);
    } catch { toast.showError("Error updating question"); }
    finally { setSurveyLoading(false); }
  };

  const handleToggleActive = async (q) => {
    try {
      await pmSurveyApi.questions.patch(q.id, { is_active: !q.is_active });
      await loadSurveyQuestions();
      toast.showSuccess(q.is_active ? "Question deactivated" : "Question activated");
    } catch { toast.showError("Error updating question"); }
  };

  const handleDeleteQuestion = async () => {
    setSurveyLoading(true);
    try {
      await pmSurveyApi.questions.delete(deleteModal.id);
      toast.showSuccess("Question deleted");
      await loadSurveyQuestions();
      setDeleteModal({ isOpen: false, id: null, type: null });
    } catch { toast.showError("Error deleting question"); }
    finally { setSurveyLoading(false); }
  };

  // ─────────────────────────────────────────────────────────
  // DELETE ROUTER
  // ─────────────────────────────────────────────────────────
  const handleDelete = () => {
    switch (deleteModal.type) {
      case "weight":   handleDeleteWeightConfig();   break;
      case "scale":    handleDeleteEvaluationScale(); break;
      case "status":   handleDeleteObjectiveStatus(); break;
      case "year":     handleDeleteYear();            break;
      case "question": handleDeleteQuestion();        break;
      default: break;
    }
  };

  // ─────────────────────────────────────────────────────────
  // SHARED STYLES
  // ─────────────────────────────────────────────────────────
  const inputClass = `w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire transition-all ${
    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
  }`;

  const yearDateFields = [
    { key: "goal_setting_start",    label: "Goal Setting Start",  color: "blue" },
    { key: "goal_setting_end",      label: "Goal Setting End",    color: "blue" },
    { key: "mid_year_review_start", label: "Mid-Year Start",      color: "purple" },
    { key: "mid_year_review_end",   label: "Mid-Year End",        color: "purple" },
    { key: "end_year_review_start", label: "End-Year Start",      color: "green" },
    { key: "end_year_review_end",   label: "End-Year End",        color: "green" },
  ];

  if (loading && !activeYear && years.length === 0) {
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

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  const TABS = [
    { id: "years",    label: "Years",           icon: Calendar },
    { id: "periods",  label: "Periods",         icon: Calendar },
    { id: "weights",  label: "Weights",         icon: Award },
    { id: "limits",   label: "Limits",          icon: Target },
    { id: "scales",   label: "Scales",          icon: Award },
    { id: "targets",  label: "Targets",         icon: Target },
    { id: "statuses", label: "Status",          icon: CheckCircle },
    { id: "survey",   label: "Survey Questions", icon: MessageSquare },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 mx-auto">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/efficiency/performance-mng")}
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
              <h1 className="text-base font-bold text-almet-cloud-burst dark:text-almet-mystic">Performance Settings</h1>
              <p className="text-[10px] text-gray-500">Configure system parameters</p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1.5 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-almet-sapphire text-white shadow-sm"
                      : darkMode
                        ? "text-gray-400 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">

          {/* ══════════ YEARS ══════════ */}
          {activeTab === "years" && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Performance Years</h3>
                <button
                  onClick={() => { setShowAddYear(true); setEditingYear(null); }}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Year
                </button>
              </div>

              <div className="p-3 space-y-3">
                {/* Add form */}
                {showAddYear && (
                  <div className={`p-3 rounded-lg border-2 border-dashed border-almet-sapphire/40 ${darkMode ? "bg-gray-700/20" : "bg-blue-50/50"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-almet-sapphire">New Performance Year</span>
                      <button onClick={() => setShowAddYear(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                        <X className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                    <div className="mb-3">
                      <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">Year</label>
                      <input type="number" value={newYear.year}
                        onChange={e => setNewYear(p => ({ ...p, year: parseInt(e.target.value) || "" }))}
                        className={`${inputClass} w-32`} placeholder="2026" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {yearDateFields.map(f => (
                        <div key={f.key}>
                          <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">{f.label}</label>
                          <input type="date" value={newYear[f.key] || ""}
                            onChange={e => setNewYear(p => ({ ...p, [f.key]: e.target.value }))}
                            className={inputClass} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowAddYear(false)} className={`px-3 py-1.5 text-xs rounded-lg border ${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>Cancel</button>
                      <button onClick={handleAddYear} disabled={loading} className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center gap-1.5 disabled:opacity-50">
                        {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Create
                      </button>
                    </div>
                  </div>
                )}

                {/* Year list */}
                {years.map(yr => {
                  const isEditing = editingYear?.id === yr.id;
                  const isActive  = yr.is_active;
                  return (
                    <div key={yr.id} className={`rounded-lg border ${isActive ? "border-almet-sapphire/40 bg-almet-sapphire/5 dark:bg-almet-sapphire/10" : darkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                          {isActive && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                          <span className={`text-sm font-bold ${isActive ? "text-almet-sapphire" : "text-gray-700 dark:text-gray-300"}`}>{yr.year}</span>
                          {isActive && <span className="text-[10px] bg-almet-sapphire text-white px-1.5 py-0.5 rounded-full">Active</span>}
                          {!isEditing && <span className="text-[10px] text-gray-500 dark:text-gray-400">Goal: {yr.goal_setting_start} → {yr.goal_setting_end}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          {!isActive && !isEditing && (
                            <button onClick={() => handleSetActive(yr.id)} disabled={loading} className="px-2 py-1 text-[10px] font-medium text-almet-sapphire border border-almet-sapphire/30 rounded hover:bg-almet-sapphire/10 transition-all disabled:opacity-50">Set Active</button>
                          )}
                          {isEditing ? (
                            <>
                              <button onClick={handleSaveEditYear} disabled={loading} className="p-1.5 bg-green-500/10 text-green-600 rounded hover:bg-green-500/20">
                                {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => setEditingYear(null)} className="p-1.5 bg-gray-200/50 dark:bg-gray-600/50 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setEditingYear({ ...yr })} className="p-1.5 bg-blue-500/10 text-blue-600 rounded hover:bg-blue-500/20"><Edit2 className="w-3.5 h-3.5" /></button>
                              {!isActive && (
                                <button onClick={() => setDeleteModal({ isOpen: true, id: yr.id, type: "year" })} className="p-1.5 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="p-3 grid grid-cols-2 gap-2">
                          {yearDateFields.map(f => (
                            <div key={f.key}>
                              <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">{f.label}</label>
                              <input type="date" value={editingYear[f.key] || ""}
                                onChange={e => setEditingYear(p => ({ ...p, [f.key]: e.target.value }))}
                                className={inputClass} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-3 py-2 grid grid-cols-3 gap-2">
                          <div className="text-[10px] text-gray-500 dark:text-gray-400"><span className="font-medium text-blue-600 dark:text-blue-400">Goal Setting</span><br />{yr.goal_setting_start || "—"} → {yr.goal_setting_end || "—"}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400"><span className="font-medium text-purple-600 dark:text-purple-400">Mid-Year</span><br />{yr.mid_year_review_start || "—"} → {yr.mid_year_review_end || "—"}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400"><span className="font-medium text-green-600 dark:text-green-400">End-Year</span><br />{yr.end_year_review_start || "—"} → {yr.end_year_review_end || "—"}</div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {years.length === 0 && !showAddYear && (
                  <div className="text-center py-10">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">No performance years configured</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════ PERIODS ══════════ */}
          {activeTab === "periods" && activeYear && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Period Configuration — <span className="text-almet-sapphire">{activeYear.year}</span></h3>
              </div>
              <div className="p-3 space-y-3">
                {[
                  { label: "Goal Setting", colorCls: "blue-50 dark:bg-blue-900/10", borderCls: "blue-200 dark:border-blue-800", titleCls: "text-almet-sapphire", startKey: "goal_setting_start", endKey: "goal_setting_end", icon: Target },
                  { label: "Mid-Year Review", colorCls: "purple-50 dark:bg-purple-900/10", borderCls: "purple-200 dark:border-purple-800", titleCls: "text-purple-600 dark:text-purple-400", startKey: "mid_year_review_start", endKey: "mid_year_review_end", icon: Calendar },
                  { label: "End-Year Review", colorCls: "green-50 dark:bg-green-900/10", borderCls: "green-200 dark:border-green-800", titleCls: "text-green-600 dark:text-green-400", startKey: "end_year_review_start", endKey: "end_year_review_end", icon: Award },
                ].map(({ label, colorCls, borderCls, titleCls, startKey, endKey, icon: Icon }) => (
                  <div key={label} className={`bg-${colorCls} p-3 rounded-lg border border-${borderCls}`}>
                    <h4 className={`text-xs font-semibold mb-2 ${titleCls} flex items-center gap-1.5`}><Icon className="w-3.5 h-3.5" />{label}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Start</label>
                        <input type="date" value={activeYear[startKey] || ""} onChange={e => setActiveYear(p => ({ ...p, [startKey]: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">End</label>
                        <input type="date" value={activeYear[endKey] || ""} onChange={e => setActiveYear(p => ({ ...p, [endKey]: e.target.value }))} className={inputClass} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 flex justify-end border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
                <button onClick={handleSaveGoalSettingPeriod} disabled={loading} className="px-4 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center gap-1.5 disabled:opacity-50">
                  {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            </div>
          )}

          {/* ══════════ WEIGHTS ══════════ */}
          {activeTab === "weights" && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Weight Configuration</h3>
                <button onClick={handleAddWeightConfig} disabled={loading} className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center gap-1.5 disabled:opacity-50">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="p-3 space-y-2">
                {settings.weightConfigs.map(weight => (
                  <div key={weight.id} className={`p-3 rounded-lg border ${darkMode ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-almet-sapphire bg-almet-sapphire/10 px-2 py-0.5 rounded-full">ID: {weight.id}</span>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: weight.id, type: "weight" })} className="p-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Hierarchy</label>
                        <SearchableDropdown options={positionGroups} value={weight.position_group} onChange={v => handleUpdateWeightConfig(weight.id, "position_group", v)} placeholder="Select" darkMode={darkMode} portal={true} />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Objectives %</label>
                        <input type="number" min="0" max="100" value={weight.objectives_weight}
                          onChange={e => {
                            const v = parseInt(e.target.value) || 0;
                            setSettings(p => ({ ...p, weightConfigs: p.weightConfigs.map(w => w.id === weight.id ? { ...w, objectives_weight: v, competencies_weight: 100 - v } : w) }));
                          }}
                          onBlur={() => handleUpdateWeightConfig(weight.id, "objectives_weight", weight.objectives_weight)}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Competencies %</label>
                        <input type="number" value={weight.competencies_weight} readOnly className={`${inputClass} cursor-not-allowed opacity-75`} />
                      </div>
                    </div>
                  </div>
                ))}
                {settings.weightConfigs.length === 0 && <div className="text-center py-8"><Award className="w-8 h-8 mx-auto mb-2 text-gray-400" /><p className="text-xs text-gray-500">No configurations yet</p></div>}
              </div>
            </div>
          )}

          {/* ══════════ LIMITS ══════════ */}
          {activeTab === "limits" && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Goal Limits</h3>
              </div>
              <div className="p-3">
                <div className="max-w-lg mx-auto grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block text-[10px] mb-2 text-gray-700 dark:text-gray-300 font-semibold">Minimum</label>
                    <input type="number" min="1" value={settings.goalLimits.min} onChange={e => setSettings(p => ({ ...p, goalLimits: { ...p.goalLimits, min: parseInt(e.target.value) || 1 } }))} className={`${inputClass} text-center text-lg font-bold`} />
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <label className="block text-[10px] mb-2 text-gray-700 dark:text-gray-300 font-semibold">Maximum</label>
                    <input type="number" min="1" value={settings.goalLimits.max} onChange={e => setSettings(p => ({ ...p, goalLimits: { ...p.goalLimits, max: parseInt(e.target.value) || 10 } }))} className={`${inputClass} text-center text-lg font-bold`} />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 flex justify-end border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
                <button onClick={handleSaveGoalLimits} disabled={loading} className="px-4 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center gap-1.5 disabled:opacity-50">
                  {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            </div>
          )}

          {/* ══════════ SCALES ══════════ */}
          {activeTab === "scales" && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Evaluation Scale</h3>
                <button onClick={handleAddEvaluationScale} disabled={loading} className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center gap-1.5 disabled:opacity-50">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="p-3 space-y-2">
                {settings.evaluationScale.map(scale => (
                  <div key={scale.id} className={`p-3 rounded-lg border ${darkMode ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">ID: {scale.id}</span>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: scale.id, type: "scale" })} className="p-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { field: "name", label: "Name", type: "text", placeholder: "E+" },
                        { field: "value", label: "Value", type: "number", placeholder: "5" },
                        { field: "range_min", label: "Min %", type: "number", placeholder: "71" },
                        { field: "range_max", label: "Max %", type: "number", placeholder: "90" },
                        { field: "description", label: "Description", type: "text", placeholder: "Exceeds" },
                      ].map(({ field, label, type, placeholder }) => (
                        <div key={field}>
                          <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">{label}</label>
                          <input type={type} value={scale[field]}
                            onChange={e => setSettings(p => ({ ...p, evaluationScale: p.evaluationScale.map(s => s.id === scale.id ? { ...s, [field]: type === "number" ? (parseInt(e.target.value) || 0) : e.target.value } : s) }))}
                            onBlur={e => handleUpdateEvaluationScale(scale.id, field, type === "number" ? scale[field] : e.target.value)}
                            placeholder={placeholder} className={inputClass} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {settings.evaluationScale.length === 0 && <div className="text-center py-8"><Award className="w-8 h-8 mx-auto mb-2 text-gray-400" /><p className="text-xs text-gray-500">No scales yet</p></div>}
              </div>
            </div>
          )}

          {/* ══════════ TARGETS ══════════ */}
          {activeTab === "targets" && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Evaluation Targets</h3>
              </div>
              <div className="p-3">
                <div className="max-w-md mx-auto bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <label className="block text-[10px] mb-2 text-gray-700 dark:text-gray-300 font-semibold">Objective Score Target</label>
                  <input type="number" value={settings.evaluationTargets.objective_score_target}
                    onChange={e => setSettings(p => ({ ...p, evaluationTargets: { ...p.evaluationTargets, objective_score_target: parseInt(e.target.value) || 0 } }))}
                    className={`${inputClass} text-center text-lg font-bold`} />
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">Maximum possible score</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 flex justify-end border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
                <button onClick={handleSaveEvaluationTargets} disabled={loading} className="px-4 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center gap-1.5 disabled:opacity-50">
                  {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            </div>
          )}

          {/* ══════════ STATUSES ══════════ */}
          {activeTab === "statuses" && (
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Objective Status Types</h3>
                <button onClick={handleAddObjectiveStatus} disabled={loading} className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center gap-1.5 disabled:opacity-50">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="p-3 space-y-2">
                {settings.statusTypes?.map(status => (
                  <div key={status.id} className={`p-3 rounded-lg border ${darkMode ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">ID: {status.id}</span>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: status.id, type: "status" })} className="p-1 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Label</label>
                        <input type="text" value={status.label || ""}
                          onChange={e => setSettings(p => ({ ...p, statusTypes: p.statusTypes.map(s => s.id === status.id ? { ...s, label: e.target.value } : s) }))}
                          onBlur={e => handleUpdateObjectiveStatus(status.id, "label", e.target.value)}
                          placeholder="In Progress" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1 text-gray-700 dark:text-gray-300 font-medium">Value</label>
                        <input type="text" value={status.value || ""}
                          onChange={e => setSettings(p => ({ ...p, statusTypes: p.statusTypes.map(s => s.id === status.id ? { ...s, value: e.target.value } : s) }))}
                          onBlur={e => handleUpdateObjectiveStatus(status.id, "value", e.target.value)}
                          placeholder="IN_PROGRESS" className={inputClass} />
                      </div>
                    </div>
                  </div>
                ))}
                {(!settings.statusTypes || settings.statusTypes.length === 0) && (
                  <div className="text-center py-8"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" /><p className="text-xs text-gray-500">No status types yet</p></div>
                )}
              </div>
            </div>
          )}

          {/* ══════════ SURVEY QUESTIONS ══════════ */}
          {activeTab === "survey" && (
            <div>
              {/* Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div>
                  <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Survey Questions</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{surveyQuestions.length} questions across {Object.keys(groupedQuestions).length} sections</p>
                </div>
                <button
                  onClick={() => { setShowAddQuestion(true); setEditingQuestion(null); }}
                  disabled={surveyLoading}
                  className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>

              <div className="p-3 space-y-3">

                {/* ── Add Question Form ── */}
                {showAddQuestion && (
                  <div className={`p-3 rounded-lg border-2 border-dashed border-almet-sapphire/40 ${darkMode ? "bg-gray-700/20" : "bg-blue-50/50"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-almet-sapphire flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> New Survey Question
                      </span>
                      <button onClick={() => { setShowAddQuestion(false); setNewQuestion({ ...EMPTY_QUESTION }); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                        <X className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {/* Question Text */}
                      <div>
                        <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">
                          Question Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={newQuestion.question_text}
                          onChange={e => setNewQuestion(p => ({ ...p, question_text: e.target.value }))}
                          placeholder="Enter your question..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Section */}
                        <div>
                          <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">Section</label>
                          <select value={newQuestion.section} onChange={e => setNewQuestion(p => ({ ...p, section: e.target.value }))} className={inputClass}>
                            {SECTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        {/* Type */}
                        <div>
                          <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">Question Type</label>
                          <select value={newQuestion.question_type} onChange={e => setNewQuestion(p => ({ ...p, question_type: e.target.value }))} className={inputClass}>
                            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Display Order */}
                        <div>
                          <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">Display Order</label>
                          <input type="number" min="0" value={newQuestion.display_order}
                            onChange={e => setNewQuestion(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                            className={inputClass} />
                        </div>
                        {/* Toggles */}
                        <div className="flex flex-col gap-1.5 justify-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <button
                              type="button"
                              onClick={() => setNewQuestion(p => ({ ...p, is_required: !p.is_required }))}
                              className={`transition-colors ${newQuestion.is_required ? "text-almet-sapphire" : "text-gray-400"}`}
                            >
                              {newQuestion.is_required ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <span className="text-[10px] text-gray-700 dark:text-gray-300">Required</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <button
                              type="button"
                              onClick={() => setNewQuestion(p => ({ ...p, is_active: !p.is_active }))}
                              className={`transition-colors ${newQuestion.is_active ? "text-emerald-500" : "text-gray-400"}`}
                            >
                              {newQuestion.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <span className="text-[10px] text-gray-700 dark:text-gray-300">Active</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <button onClick={() => { setShowAddQuestion(false); setNewQuestion({ ...EMPTY_QUESTION }); }} className={`px-3 py-1.5 text-xs rounded-lg border ${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>Cancel</button>
                      <button onClick={handleAddQuestion} disabled={surveyLoading} className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center gap-1.5 disabled:opacity-50">
                        {surveyLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Create
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Loading ── */}
                {surveyLoading && surveyQuestions.length === 0 && (
                  <div className="text-center py-10">
                    <Loader className="w-6 h-6 animate-spin text-almet-sapphire mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Loading questions...</p>
                  </div>
                )}

                {/* ── Grouped by Section ── */}
                {!surveyLoading && Object.keys(groupedQuestions).length === 0 && !showAddQuestion && (
                  <div className="text-center py-10">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">No survey questions yet</p>
                    <p className="text-[10px] text-gray-400 mt-1">Click "Add Question" to create your first question</p>
                  </div>
                )}

                {SECTION_OPTIONS.map(sec => {
                  const qs = groupedQuestions[sec.value];
                  if (!qs || qs.length === 0) return null;
                  const colorKey = SECTION_COLORS[sec.value] || "blue";
                  const colorCls = COLOR_CLASSES[colorKey];

                  return (
                    <div key={sec.value} className={`rounded-lg border overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                      {/* Section Header */}
                      <div className={`px-3 py-2 flex items-center gap-2 ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colorCls}`}>
                          {SECTION_ICON_MAP[sec.value]}
                          {sec.label}
                        </span>
                        <span className={`text-[10px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{qs.length} question{qs.length !== 1 ? "s" : ""}</span>
                      </div>

                      {/* Questions */}
                      <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                        {qs.map((q, idx) => {
                          const isEditing = editingQuestion?.id === q.id;

                          return (
                            <div key={q.id} className={`p-3 ${darkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-50/80"} transition-colors`}>
                              {isEditing ? (
                                /* ── Edit Form inline ── */
                                <div className={`p-3 rounded-lg border ${darkMode ? "border-almet-sapphire/30 bg-almet-sapphire/5" : "border-almet-sapphire/20 bg-blue-50/50"}`}>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">Question Text <span className="text-red-500">*</span></label>
                                      <textarea rows={2} value={editingQuestion.question_text}
                                        onChange={e => setEditingQuestion(p => ({ ...p, question_text: e.target.value }))}
                                        className={`${inputClass} resize-none`} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">Section</label>
                                        <select value={editingQuestion.section} onChange={e => setEditingQuestion(p => ({ ...p, section: e.target.value }))} className={inputClass}>
                                          {SECTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">Question Type</label>
                                        <select value={editingQuestion.question_type} onChange={e => setEditingQuestion(p => ({ ...p, question_type: e.target.value }))} className={inputClass}>
                                          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[10px] mb-1 font-medium text-gray-700 dark:text-gray-300">Display Order</label>
                                        <input type="number" min="0" value={editingQuestion.display_order}
                                          onChange={e => setEditingQuestion(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                                          className={inputClass} />
                                      </div>
                                      <div className="flex flex-col gap-1.5 justify-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <button type="button" onClick={() => setEditingQuestion(p => ({ ...p, is_required: !p.is_required }))} className={`transition-colors ${editingQuestion.is_required ? "text-almet-sapphire" : "text-gray-400"}`}>
                                            {editingQuestion.is_required ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                          </button>
                                          <span className="text-[10px] text-gray-700 dark:text-gray-300">Required</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <button type="button" onClick={() => setEditingQuestion(p => ({ ...p, is_active: !p.is_active }))} className={`transition-colors ${editingQuestion.is_active ? "text-emerald-500" : "text-gray-400"}`}>
                                            {editingQuestion.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                          </button>
                                          <span className="text-[10px] text-gray-700 dark:text-gray-300">Active</span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <button onClick={handleCancelEditQuestion} className={`px-3 py-1.5 text-xs rounded-lg border ${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>Cancel</button>
                                    <button onClick={handleSaveEditQuestion} disabled={surveyLoading} className="px-3 py-1.5 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center gap-1.5 disabled:opacity-50">
                                      {surveyLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* ── View Row ── */
                                <div className="flex items-start gap-3">
                                  {/* Order badge */}
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                    {q.display_order ?? idx + 1}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium leading-snug mb-1.5 ${darkMode ? "text-white" : "text-almet-cloud-burst"} ${!q.is_active ? "line-through opacity-50" : ""}`}>
                                      {q.question_text}
                                      {q.is_required && <span className="text-red-500 ml-1">*</span>}
                                    </p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {/* Type badge */}
                                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                        q.question_type === "LIKERT_5"
                                          ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30"
                                          : "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30"
                                      }`}>
                                        {q.question_type === "LIKERT_5" ? <Hash className="w-2.5 h-2.5" /> : <AlignLeft className="w-2.5 h-2.5" />}
                                        {q.question_type === "LIKERT_5" ? "Likert 1-5" : "Open Text"}
                                      </span>
                                      {/* Required badge */}
                                      {q.is_required && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30">Required</span>
                                      )}
                                      {/* Active / Inactive */}
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                        q.is_active
                                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30"
                                          : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                                      }`}>
                                        {q.is_active ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {/* Toggle active */}
                                    <button
                                      onClick={() => handleToggleActive(q)}
                                      title={q.is_active ? "Deactivate" : "Activate"}
                                      className={`p-1.5 rounded transition-all ${q.is_active ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "bg-gray-200/50 text-gray-500 hover:bg-gray-200 dark:bg-gray-600/50 dark:hover:bg-gray-600"}`}
                                    >
                                      {q.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                    </button>
                                    {/* Edit */}
                                    <button
                                      onClick={() => handleStartEditQuestion(q)}
                                      className="p-1.5 bg-blue-500/10 text-blue-600 rounded hover:bg-blue-500/20 transition-all"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Delete */}
                                    <button
                                      onClick={() => setDeleteModal({ isOpen: true, id: q.id, type: "question" })}
                                      className="p-1.5 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>{/* end content box */}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, type: null })}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading || surveyLoading}
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}