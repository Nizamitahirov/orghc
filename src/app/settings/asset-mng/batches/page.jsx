// src/app/asset-management/batches/page.jsx
"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { batchService, categoryService } from "@/services/assetService";
import {
  Plus,
  Search,
  Package,
  Loader,
  Eye,
  Edit,
  Trash2,
  Building,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  Grid3X3,
  List as ListIcon,
  Filter
} from "lucide-react";
import Link from "next/link";
import SearchableDropdown from "@/components/common/SearchableDropdown";

const BatchManagementPage = () => {
  const { darkMode } = useTheme();
  
  // State
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("-created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState("table");
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    totalValue: 0,
    totalAssets: 0,
    availableAssets: 0
  });

  const itemsPerPage = 12;

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgPage = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-50";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Fetch batches
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        search: searchTerm,
        ordering: sortBy
      };
      
      const response = await batchService.getBatches(params);
      setBatches(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await batchService.getBatchStatistics();
      setStats(response);
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.results || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchStats();
    fetchCategories();
  }, [currentPage, searchTerm, sortBy]);

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const statusMatch = filterStatus === "all" || batch.status === filterStatus;
    const categoryMatch = filterCategory === "all" || batch.category_name === filterCategory;
    return statusMatch && categoryMatch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AZN"
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getAvailabilityColor = (status) => {
    switch(status?.status) {
      case 'IN_STOCK':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'LOW_STOCK':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/30';
      case 'OUT_OF_STOCK':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/30';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat.name, label: cat.name }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  const sortOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: 'asset_name', label: 'Name A-Z' },
    { value: '-asset_name', label: 'Name Z-A' }
  ];

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>Asset Batches</h1>
                <p className={`${textMuted} text-sm mt-1`}>
                  Manage asset batches and bulk inventory
                </p>
              </div>
              <Link
                href="/settings/asset-mng/batches/create"
                className={`${btnPrimary} px-4 py-2.5 rounded-lg flex items-center text-sm hover:shadow-lg transition-all`}
              >
                <Plus size={16} className="mr-2" />
                Create Batch
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Package className="text-almet-sapphire" size={20} />
                <TrendingUp className="text-emerald-500" size={16} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Total Batches</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.totalBatches}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Building className="text-emerald-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Active Batches</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.activeBatches}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-blue-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Total Value</p>
              <p className={`${textPrimary} text-xl font-bold`}>{formatCurrency(stats.totalValue)}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Grid3X3 className="text-purple-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Total Assets</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.totalAssets}</p>
            </div>

            <div className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <Package className="text-amber-500" size={20} />
              </div>
              <p className={`${textMuted} text-xs mb-1`}>Available</p>
              <p className={`${textPrimary} text-2xl font-bold`}>{stats.availableAssets}</p>
            </div>
          </div>

          {/* Filters */}
          <div className={`${bgCard} rounded-xl border ${borderColor} p-4 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <div className="md:col-span-2 relative">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} text-sm outline-0`}
                />
              </div>

              <SearchableDropdown
                options={statusOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Status"
                darkMode={darkMode}
                icon={<Filter size={12} />}
              />

              <SearchableDropdown
                options={categoryOptions}
                value={filterCategory}
                onChange={setFilterCategory}
                placeholder="Category"
                darkMode={darkMode}
                icon={<Building size={12} />}
              />

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterCategory("all");
                }}
                className={`${btnSecondary} px-4 py-2.5 rounded-lg text-sm border ${borderColor}`}
              >
                <RefreshCw size={14} className="mr-2 inline" />
                Reset
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t ${borderColor}">
              <div className="flex items-center space-x-3">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded text-xs ${
                      viewMode === "grid" ? "bg-almet-sapphire text-white" : textMuted
                    }`}
                  >
                    <Grid3X3 size={12} className="inline mr-1" />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-1.5 rounded text-xs ${
                      viewMode === "table" ? "bg-almet-sapphire text-white" : textMuted
                    }`}
                  >
                    <ListIcon size={12} className="inline mr-1" />
                    Table
                  </button>
                </div>
              </div>
              <p className={`${textMuted} text-xs`}>
                {filteredBatches.length} of {totalCount} batches
              </p>
            </div>
          </div>

          {/* Batches Display */}
          <div className={`${bgCard} rounded-xl border ${borderColor}`}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-almet-sapphire mr-2" />
                <span className={`${textMuted}`}>Loading batches...</span>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className={`${textPrimary} font-medium`}>No batches found</p>
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${bgAccent} border-b ${borderColor}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Batch Info
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Category
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Quantity
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Price
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${textMuted} uppercase`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-center text-xs font-semibold ${textMuted} uppercase`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4">
                          <div>
                            <p className={`${textPrimary} font-medium text-sm`}>
                              {batch.asset_name}
                            </p>
                            <p className={`${textMuted} text-xs`}>{batch.batch_number}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${textSecondary} text-sm`}>
                            {batch.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className={`${textPrimary} text-sm font-semibold`}>
                              {batch.available_quantity}/{batch.initial_quantity}
                            </p>
                            <p className={`${textMuted} text-xs`}>Available/Total</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className={`${textPrimary} text-sm font-semibold`}>
                              {formatCurrency(batch.unit_price)}
                            </p>
                            <p className={`${textMuted} text-xs`}>
                              Total: {formatCurrency(batch.total_value)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${getAvailabilityColor(batch.availability_status)}`}>
                            {batch.availability_status?.status || batch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              href={`/settings/asset-mng/batches/${batch.id}`}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <Eye size={14} className="text-almet-sapphire" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => (
                  <Link
                    key={batch.id}
                    href={`/settings/asset-mng/batches/${batch.id}`}
                    className={`${bgAccent} rounded-xl p-6 border ${borderColor} hover:shadow-lg transition-all`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`${textPrimary} font-semibold text-sm mb-1`}>
                          {batch.asset_name}
                        </h3>
                        <p className={`${textMuted} text-xs`}>{batch.batch_number}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${getAvailabilityColor(batch.availability_status)}`}>
                        {batch.availability_status?.status || batch.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className={textMuted}>Category:</span>
                        <span className={textSecondary}>{batch.category_name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={textMuted}>Available:</span>
                        <span className={`${textPrimary} font-semibold`}>
                          {batch.available_quantity}/{batch.initial_quantity}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={textMuted}>Unit Price:</span>
                        <span className={textSecondary}>{formatCurrency(batch.unit_price)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={textMuted}>Total Value:</span>
                        <span className={`${textPrimary} font-semibold`}>
                          {formatCurrency(batch.total_value)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`px-6 py-4 border-t ${borderColor} ${bgAccent}`}>
                <div className="flex items-center justify-between">
                  <p className={`${textMuted} text-xs`}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`${btnSecondary} px-4 py-2 rounded-lg text-xs border ${borderColor} disabled:opacity-50`}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`${btnSecondary} px-4 py-2 rounded-lg text-xs border ${borderColor} disabled:opacity-50`}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BatchManagementPage;