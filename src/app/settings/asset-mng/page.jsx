// src/app/asset-management/page.jsx - UPDATED Complete Asset Management
"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { assetService, categoryService, employeeService, batchService } from "@/services/assetService";
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Package,
  AlertCircle,
  Building,
  Loader,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Archive,
  BarChart3,
  Wrench,
  Grid3X3,
  List,
  Target,
  ChevronLeft,
  ChevronRight,
  Users,
  UserMinus,
  TrendingUp,
  Activity
} from "lucide-react";
import {
  AddAssetModal,
  EditAssetModal,
} from "@/components/assets/AssetManagementModals";
import {
  AssetDetailsModal,
} from "@/components/assets/AssetDetailsModal";
import ChangeStatusModal from "@/components/assets/ChangeStatusModal";
import CheckInAssetModal from "@/components/assets/CheckInAssetModal";
import {
  AssetStatsModal,
  AssignAssetModal,
  AssetActivitiesModal
} from "@/components/assets/EnhancedModals";
import CategoryManagement from "@/components/assets/CategoryManagement";
import EmployeeAssetActionModal from "@/components/assets/EmployeeAssetActionModal";
import ActionDropdown from "@/components/assets/ActionDropdown";
import CustomCheckbox from "@/components/common/CustomCheckbox";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import Link from "next/link";

const NotificationToast = ({ message, type = 'success', onClose }) => {
  const { darkMode } = useTheme();
  
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
  const icon = type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />;

  return (
    <div className={`fixed top-4 right-4 z-[60] ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 ease-in-out`}>
      {icon}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1">
        <XCircle size={14} />
      </button>
    </div>
  );
};

const AssetManagementPage = () => {
  const { darkMode } = useTheme();
  
  // State management
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("-created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState("table");
  const [activeTab, setActiveTab] = useState("assets");
  const [notification, setNotification] = useState(null);
  const itemsPerPage = 12;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEmployeeActionModal, setShowEmployeeActionModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [employeeActionType, setEmployeeActionType] = useState('');

  // Status choices
  const statusChoices = [
    { value: 'all', label: 'All Status' },
    { value: 'IN_STOCK', label: 'In Stock' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_USE', label: 'In Use' },
    { value: 'NEED_CLARIFICATION', label: 'Need Clarification' },
    { value: 'IN_REPAIR', label: 'In Repair' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  // Sort options
  const sortOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: 'asset_name', label: 'Name A-Z' },
    { value: '-asset_name', label: 'Name Z-A' },
    { value: 'purchase_price', label: 'Price Low-High' },
    { value: '-purchase_price', label: 'Price High-Low' }
  ];

  // Statistics
  const [assetStats, setAssetStats] = useState({
    total: 0,
    inStock: 0,
    inUse: 0,
    assigned: 0,
    needClarification: 0,
    inRepair: 0,
    archived: 0,
    totalValue: 0
  });

  // Quick stats for dashboard
  const [quickStats, setQuickStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    totalAssignments: 0,
    activeOffboardings: 0
  });
   const [batches, setBatches] = useState([]);

  // Fetch batches
  const fetchBatches = async () => {
    try {
      const response = await batchService.getBatches({ page_size: 100 });
      setBatches(response.results || []);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };
  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgPage = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const shadowClass = "shadow-sm";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Utility function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      'IN_STOCK': 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-900/30',
      'IN_USE': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/30',
      'ASSIGNED': 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/30',
      'NEED_CLARIFICATION': 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-900/30',
      'IN_REPAIR': 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/30',
      'ARCHIVED': 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-900/30'
    };
    return statusColors[status] || 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-950/50 dark:text-slate-400 dark:border-slate-900/30';
  };

  const getStatusIcon = (status) => {
    const iconProps = { size: 12 };
    switch (status) {
      case 'IN_USE': return <CheckCircle {...iconProps} />;
      case 'IN_STOCK': return <Package {...iconProps} />;
      case 'ASSIGNED': return <Clock {...iconProps} />;
      case 'NEED_CLARIFICATION': return <AlertCircle {...iconProps} />;
      case 'IN_REPAIR': return <Wrench {...iconProps} />;
      case 'ARCHIVED': return <Archive {...iconProps} />;
      default: return <Package {...iconProps} />;
    }
  };

  // Data fetching functions
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        search: searchTerm,
        ordering: sortBy
      };
      
      const response = await assetService.getAssets(params);
      setAssets(response.results || []);
      setTotalCount(response.count || 0);
      calculateStats(response.results || []);
    } catch (err) {
      setError("Failed to fetch assets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.results || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      setEmployees(response.results || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const [batchStats] = await Promise.all([
        batchService.getBatchStatistics()
      ]);

      setQuickStats({
        totalBatches: batchStats.total_batches || 0,
        activeBatches: batchStats.active_batches || 0,
        totalAssignments: 0,
        activeOffboardings: 0
      });
    } catch (err) {
      console.error("Failed to fetch quick stats:", err);
    }
  };

  const calculateStats = (assetList) => {
    const stats = {
      total: assetList.length,
      inStock: 0,
      inUse: 0,
      assigned: 0,
      needClarification: 0,
      inRepair: 0,
      archived: 0,
      totalValue: 0
    };

    assetList.forEach(asset => {
      stats.totalValue += parseFloat(asset.purchase_price || 0);
      switch (asset.status) {
        case 'IN_STOCK': stats.inStock++; break;
        case 'IN_USE': stats.inUse++; break;
        case 'ASSIGNED': stats.assigned++; break;
        case 'NEED_CLARIFICATION': stats.needClarification++; break;
        case 'IN_REPAIR': stats.inRepair++; break;
        case 'ARCHIVED': stats.archived++; break;
      }
    });

    setAssetStats(stats);
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(category => ({
      value: category.name,
      label: category.name
    }))
  ];

  useEffect(() => {
    if (activeTab === 'assets') {
      fetchAssets();
    }
    fetchCategories();
    fetchEmployees();
    fetchBatches(); // 🎯 Batches fetch et
    fetchQuickStats();
  }, [currentPage, searchTerm, sortBy, activeTab]);


  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const statusMatch = filterStatus === "all" || asset.status === filterStatus;
    const categoryMatch = filterCategory === "all" || asset.category_name === filterCategory;
    return statusMatch && categoryMatch;
  });

  // Action handlers
  const handleAction = (action, assetId) => {
    switch (action) {
      case 'view':
        handleViewAsset(assetId);
        break;
      case 'edit':
        handleEditAsset(assetId);
        break;
      case 'assign':
        handleAssignAsset(assetId);
        break;
      case 'activities':
        handleViewActivities(assetId);
        break;
      case 'checkin':
        handleCheckInAsset(assetId);
        break;
      case 'changeStatus':
        handleChangeStatus(assetId);
        break;
      case 'clarification':
        handleProvideClarification(assetId);
        break;
      case 'cancelAssignment':
        handleCancelAssignment(assetId);
        break;
      case 'delete':
        handleDeleteAsset(assetId);
        break;
      default:
        break;
    }
  };

  const handleViewAsset = async (assetId) => {
    try {
      setLoading(true);
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsset = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowEditModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleAssignAsset = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowAssignModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleViewActivities = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowActivitiesModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleCheckInAsset = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowCheckInModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleChangeStatus = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowStatusModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleProvideClarification = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setEmployeeActionType('provide_clarification');
      setShowEmployeeActionModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleCancelAssignment = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setEmployeeActionType('cancel_assignment');
      setShowEmployeeActionModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm("Are you sure you want to delete this asset? This action cannot be undone.")) return;
    
    try {
      await assetService.deleteAsset(assetId);
      fetchAssets();
      showNotification("Asset deleted successfully");
    } catch (err) {
      console.error("Failed to delete asset:", err);
      showNotification("Failed to delete asset", "error");
    }
  };

  const handleExportAssets = async () => {
    try {
      const exportData = {
        asset_ids: selectedAssets,
        export_format: "excel",
        include_assignments: true,
        include_depreciation: true
      };
      
      const blob = await assetService.exportAssets(exportData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification("Assets exported successfully");
    } catch (err) {
      console.error("Failed to export assets:", err);
      showNotification("Failed to export assets", "error");
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AZN"
    }).format(amount);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="mx-auto px-4 py-6">
          {/* Notification */}
          {notification && (
            <NotificationToast
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}

          {/* Header Section */}
          <div className="rounded-lg p-6 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary} mb-1`}>Asset Management</h1>
                <p className={`${textMuted} text-xs`}>
                  Manage and track your organization's assets with comprehensive tools
                </p>
              </div>
              <div className="flex gap-2 mt-4 lg:mt-0">
                <button
                  onClick={() => setShowAddModal(true)}
                  className={`${btnPrimary} px-4 py-2 rounded-lg flex items-center text-xs font-medium hover:shadow-md transition-all duration-200`}
                >
                  <Plus size={14} className="mr-1" />
                  Add Asset
                </button>
                <button
                  onClick={() => setShowStatsModal(true)}
                  className={`${btnSecondary} px-4 py-2 rounded-lg flex items-center text-xs font-medium hover:shadow-md transition-all duration-200`}
                >
                  <BarChart3 size={14} className="mr-1" />
                  Stats
                </button>
                <button
                  onClick={handleExportAssets}
                  disabled={selectedAssets.length === 0}
                  className={`${btnSecondary} px-4 py-2 rounded-lg flex items-center text-xs font-medium disabled:opacity-50 hover:shadow-md transition-all duration-200`}
                >
                  <Download size={14} className="mr-1" />
                  Export ({selectedAssets.length})
                </button>
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Link href="/settings/asset-mng/batches" className={`${bgCard} rounded-xl p-4 border ${borderColor} hover:shadow-lg transition-all duration-200 group`}>
              <div className="flex items-center justify-between mb-2">
                <Package className="text-almet-sapphire group-hover:scale-110 transition-transform" size={20} />
                <TrendingUp className="text-emerald-500" size={16} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Asset Batches</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{quickStats.totalBatches}</p>
              <p className={`${textMuted} text-xs mt-1`}>Active: {quickStats.activeBatches}</p>
            </Link>

            <Link href="/settings/asset-mng/my-assets" className={`${bgCard} rounded-xl p-4 border ${borderColor} hover:shadow-lg transition-all duration-200 group`}>
              <div className="flex items-center justify-between mb-2">
                <Users className="text-blue-500 group-hover:scale-110 transition-transform" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>My Assets</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{assetStats.inUse + assetStats.assigned}</p>
              <p className={`${textMuted} text-xs mt-1`}>Assigned to me</p>
            </Link>

            <Link href="/settings/asset-mng/assignments" className={`${bgCard} rounded-xl p-4 border ${borderColor} hover:shadow-lg transition-all duration-200 group`}>
              <div className="flex items-center justify-between mb-2">
                <Activity className="text-purple-500 group-hover:scale-110 transition-transform" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Assignments</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{quickStats.totalAssignments}</p>
              <p className={`${textMuted} text-xs mt-1`}>Track history</p>
            </Link>

            <Link href="/settings/asset-mng/offboarding" className={`${bgCard} rounded-xl p-4 border ${borderColor} hover:shadow-lg transition-all duration-200 group`}>
              <div className="flex items-center justify-between mb-2">
                <UserMinus className="text-amber-500 group-hover:scale-110 transition-transform" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Offboarding</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{quickStats.activeOffboardings}</p>
              <p className={`${textMuted} text-xs mt-1`}>Active processes</p>
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className={`${bgCard} rounded-lg mb-6 border ${borderColor} ${shadowClass} overflow-hidden`}>
            <div className="flex">
              {[
                { 
                  id: 'assets', 
                  label: 'Assets', 
                  icon: <Package size={16} />, 
                  count: assetStats.total
                },
                { 
                  id: 'categories', 
                  label: 'Categories', 
                  icon: <Building size={16} />, 
                  count: categories.length
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-xs font-medium flex items-center justify-center transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-almet-sapphire border-b-2 border-almet-sapphire bg-almet-sapphire/5'
                      : `${textMuted} hover:text-almet-sapphire hover:bg-gray-50 dark:hover:bg-gray-700/50`
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-almet-sapphire text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'assets' ? (
            <>
              {/* Filters Section */}
              <div className={`${bgCard} rounded-lg mb-6 border ${borderColor} ${shadowClass} p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                  {/* Search */}
                  <div className="md:col-span-2 relative">
                    <Search size={14} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 border outline-0 ${borderColor} rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs`}
                    />
                  </div>

                  <SearchableDropdown
                    options={statusChoices}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="All Status"
                    darkMode={darkMode}
                    icon={<Target size={12} />}
                  />

                  <SearchableDropdown
                    options={categoryOptions}
                    value={filterCategory}
                    onChange={setFilterCategory}
                    placeholder="All Categories"
                    darkMode={darkMode}
                    icon={<Building size={12} />}
                  />

                  <SearchableDropdown
                    options={sortOptions}
                    value={sortBy}
                    onChange={setSortBy}
                    placeholder="Sort by"
                    darkMode={darkMode}
                    icon={<ArrowUpDown size={12} />}
                  />

                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                      setFilterCategory("all");
                      setSortBy("-created_at");
                    }}
                    className={`${btnSecondary} px-4 py-2.5 rounded-lg text-xs hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2`}
                  >
                    <RefreshCw size={12} />
                    <span>Reset</span>
                  </button>
                </div>

                {/* View Mode and Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`px-3 py-1 rounded text-xs transition-all duration-200 ${
                          viewMode === "grid"
                            ? "bg-almet-sapphire text-white"
                            : `${textMuted} hover:text-almet-sapphire`
                        }`}
                      >
                        <Grid3X3 size={12} className="inline mr-1" />
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-1 rounded text-xs transition-all duration-200 ${
                          viewMode === "table"
                            ? "bg-almet-sapphire text-white"
                            : `${textMuted} hover:text-almet-sapphire`
                        }`}
                      >
                        <List size={12} className="inline mr-1" />
                        Table
                      </button>
                    </div>
                  </div>
                  <div className={`${textMuted} text-xs`}>
                    {filteredAssets.length} of {totalCount} assets
                    {selectedAssets.length > 0 && (
                      <span className="ml-2 text-almet-sapphire">
                        ({selectedAssets.length} selected)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Assets Display */}
              <div className={`${bgCard} rounded-xl border ${borderColor} ${shadowClass}`}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-6 h-6 animate-spin text-almet-sapphire mr-2" />
                    <span className={`${textMuted} text-sm`}>Loading assets...</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                    <span className={`${textMuted} text-sm`}>{error}</span>
                    <button
                      onClick={fetchAssets}
                      className={`${btnPrimary} px-3 py-1.5 rounded text-xs mt-2 hover:shadow-md transition-all duration-200`}
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className={`${textPrimary} text-sm font-medium mb-1`}>No assets found</p>
                    <p className={`${textMuted} text-xs mb-4`}>
                      {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                        ? 'Try adjusting your search criteria'
                        : 'Get started by adding your first asset'
                      }
                    </p>
                    {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className={`${btnPrimary} px-4 py-2 rounded-lg text-xs hover:shadow-md transition-all duration-200`}
                      >
                        <Plus size={12} className="mr-1" />
                        Add Asset
                      </button>
                    )}
                  </div>
                ) : viewMode === "table" ? (
                  /* Table View */
                  <div className="rounded-xl">
                    <table className="w-full">
                      <thead className={`${bgAccent} rounded-lg border-b ${borderColor} sticky top-0 z-10`}>
                        <tr className="rounded-lg">
                          <th className="px-6 py-3 text-left w-12">
                            <CustomCheckbox
                              checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                              indeterminate={selectedAssets.length > 0 && selectedAssets.length < filteredAssets.length}
                              onChange={() => {
                                if (selectedAssets.length === filteredAssets.length) {
                                  setSelectedAssets([]);
                                } else {
                                  setSelectedAssets(filteredAssets.map(asset => asset.id));
                                }
                              }}
                            />
                          </th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                            Asset
                          </th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                            Category
                          </th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                            Status
                          </th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                            Assigned To
                          </th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                            Price
                          </th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                            Purchase Date
                          </th>
                          <th className={`px-6 py-4 text-center text-xs font-semibold ${textMuted} uppercase tracking-wider w-20`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredAssets.map((asset, index) => (
                          <tr 
                            key={asset.id} 
                            className={`hover:bg-gray-50 rounded-lg dark:hover:bg-gray-750 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <CustomCheckbox
                                checked={selectedAssets.includes(asset.id)}
                                onChange={() => {
                                  setSelectedAssets(prev => 
                                    prev.includes(asset.id)
                                      ? prev.filter(id => id !== asset.id)
                                      : [...prev, asset.id]
                                  );
                                }}
                              />
                            </td>
                            
                            <td className="px-6 py-2">
                              <div className="space-y-1">
                                <p className={`${textPrimary} font-medium text-sm leading-tight`}>
                                  {asset.asset_name}
                                </p>
                                <p className={`${textMuted} text-[0.6rem] font-light`}>
                                  {asset.serial_number}
                                </p>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs 
                                bg-gray-50 text-gray-600 border border-gray-200
                                dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700">
                                <Building size={12} className="mr-1 text-gray-500 dark:text-gray-400" />
                                {asset.category_name}
                              </span>
                            </td>
                            
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs border ${getStatusColor(asset.status)}`}>
                                {getStatusIcon(asset.status)}
                                <span className="ml-1.5">{asset.status_display}</span>
                              </span>
                            </td>
                            
                            <td className="px-6 py-4">
                              {asset.assigned_to_name ? (
                                <div className="space-y-1">
                                  <p className={`${textPrimary} text-xs font-semibold`}>
                                    {asset.assigned_to_name}
                                  </p>
                                  <p className={`${textMuted} text-xs`}>
                                    ID: {asset.assigned_to_employee_id}
                                  </p>
                                </div>
                              ) : (
                                <span className={`${textMuted} text-xs italic`}>
                                  Unassigned
                                </span>
                              )}
                            </td>
                            
                            <td className="px-6 py-4">
                              <p className={`${textPrimary} font-semibold text-xs`}>
                                {formatCurrency(asset.batch.unit_price)}
                              </p>
                            </td>
                            
                            <td className="px-6 py-4">
                              <p className={`${textMuted} text-xs`}>
                                {formatDate(asset.batch.purchase_date)}
                              </p>
                            </td>
                            
                            <td className="px-6 py-4 text-center relative">
                              <ActionDropdown 
                                asset={asset} 
                                onAction={handleAction}
                                darkMode={darkMode}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Grid View */
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className={`${bgAccent} rounded-xl border ${borderColor} p-6 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1`}
                        >
                          {/* Asset Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 pr-3">
                              <h3 className={`${textPrimary} font-semibold text-sm mb-2 line-clamp-2`}>
                                {asset.asset_name}
                              </h3>
                              
                              <div className="mb-2 flex items-center justify-between">
                                <p className={`${textMuted} text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block`}>
                                  {asset.serial_number}
                                </p>
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs border ${getStatusColor(asset.status)}`}>
                                  {getStatusIcon(asset.status)}
                                  <span className="ml-1.5">{asset.status_display}</span>
                                </span>
                              </div>
                            </div>

                            <CustomCheckbox
                              checked={selectedAssets.includes(asset.id)}
                              onChange={() => {
                                setSelectedAssets(prev => 
                                  prev.includes(asset.id)
                                    ? prev.filter(id => id !== asset.id)
                                    : [...prev, asset.id]
                                );
                              }}
                            />
                          </div>

                          {/* Asset Details */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`${textMuted}`}>Category:</span>
                              <span className={`${textSecondary} font-medium`}>{asset.category_name}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`${textMuted}`}>Price:</span>
                              <span className={`${textSecondary} font-semibold`}>{formatCurrency(asset.purchase_price)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`${textMuted}`}>Date:</span>
                              <span className={`${textSecondary}`}>{formatDate(asset.purchase_date)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`${textMuted}`}>Assigned:</span>
                              <span className={`${textSecondary} font-medium truncate ml-2`}>
                                {asset.assigned_to_name ? asset.assigned_to_name : "Unassigned"}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewAsset(asset.id)}
                              className="flex-1 bg-almet-sapphire/10 hover:bg-almet-sapphire/20 text-almet-sapphire px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center"
                            >
                              <Eye size={12} className="mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditAsset(asset.id)}
                              className={`${btnSecondary} px-3 py-2 rounded-lg text-xs transition-all duration-200`}
                            >
                              <Edit size={12} />
                            </button>
                            <ActionDropdown 
                              asset={asset} 
                              onAction={handleAction}
                              darkMode={darkMode}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={`px-6 py-4 border-t ${borderColor} ${bgAccent}`}>
                    <div className="flex items-center justify-between">
                      <div className={`${textMuted} text-xs`}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`${btnSecondary} px-4 py-2 rounded-lg text-xs disabled:opacity-50 flex items-center hover:shadow-md transition-all duration-200`}
                        >
                          <ChevronLeft size={14} className="mr-1" />
                          Prev
                        </button>
                        
                        <div className="flex space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                                  currentPage === pageNum
                                    ? 'bg-almet-sapphire text-white shadow-md'
                                    : `${btnSecondary} hover:shadow-md`
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`${btnSecondary} px-4 py-2 rounded-lg text-xs disabled:opacity-50 flex items-center hover:shadow-md transition-all duration-200`}
                        >
                          Next
                          <ChevronRight size={14} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Categories Tab */
            <CategoryManagement darkMode={darkMode} />
          )}

          {/* Modals */}
          {showViewModal && selectedAsset && (
            <AssetDetailsModal
              asset={selectedAsset}
              onClose={() => setShowViewModal(false)}
              darkMode={darkMode}
              onEdit={() => {
                setShowViewModal(false);
                setShowEditModal(true);
              }}
              onCheckIn={(updatedAsset) => {
                setShowViewModal(false);
                fetchAssets();
                showNotification("Asset checked in successfully");
              }}
              onChangeStatus={(updatedAsset) => {
                setShowViewModal(false);
                fetchAssets();
                showNotification("Asset status changed successfully");
              }}
            />
          )}

           {showAddModal && (
    <AddAssetModal
      onClose={() => setShowAddModal(false)}
      onSuccess={() => {
        setShowAddModal(false);
        fetchAssets();
        showNotification("Asset added successfully");
      }}
      categories={categories}
      batches={batches} // 🎯 Batches əlavə et
      darkMode={darkMode}
    />
  )}

          {showEditModal && selectedAsset && (
            <EditAssetModal
              asset={selectedAsset}
              onClose={() => setShowEditModal(false)}
              onSuccess={() => {
                setShowEditModal(false);
                fetchAssets();
                showNotification("Asset updated successfully");
              }}
              categories={categories}
              darkMode={darkMode}
            />
          )}

          {showAssignModal && selectedAsset && (
            <AssignAssetModal
              asset={selectedAsset}
              onClose={() => setShowAssignModal(false)}
              onSuccess={() => {
                setShowAssignModal(false);
                fetchAssets();
                showNotification("Asset assigned successfully");
              }}
              darkMode={darkMode}
            />
          )}

          {showActivitiesModal && selectedAsset && (
            <AssetActivitiesModal
              asset={selectedAsset}
              onClose={() => setShowActivitiesModal(false)}
              darkMode={darkMode}
            />
          )}

          {showStatsModal && (
            <AssetStatsModal
              onClose={() => setShowStatsModal(false)}
              darkMode={darkMode}
              assetStats={assetStats}
            />
          )}

          {showCheckInModal && selectedAsset && (
            <CheckInAssetModal
              asset={selectedAsset}
              onClose={() => setShowCheckInModal(false)}
              onSuccess={() => {
                setShowCheckInModal(false);
                fetchAssets();
                showNotification("Asset checked in successfully");
              }}
              darkMode={darkMode}
            />
          )}

          {showStatusModal && selectedAsset && (
            <ChangeStatusModal
              asset={selectedAsset}
              onClose={() => setShowStatusModal(false)}
              onSuccess={() => {
                setShowStatusModal(false);
                fetchAssets();
                showNotification("Asset status changed successfully");
              }}
              darkMode={darkMode}
            />
          )}

          {showEmployeeActionModal && selectedAsset && (
            <EmployeeAssetActionModal
              asset={selectedAsset}
              employeeId={selectedAsset.assigned_to?.id}
              onClose={() => setShowEmployeeActionModal(false)}
              onSuccess={() => {
                setShowEmployeeActionModal(false);
                fetchAssets();
                const actionMessage = employeeActionType === 'provide_clarification' 
                  ? "Clarification provided successfully" 
                  : "Assignment cancelled successfully";
                showNotification(actionMessage);
              }}
              darkMode={darkMode}
              actionType={employeeActionType}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetManagementPage;