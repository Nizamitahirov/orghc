// src/app/news/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { newsService, categoryService, targetGroupService, formatApiError } from '@/services/newsService';
import { 
  Plus, Search, Calendar, Eye, Edit, Trash2, 
  FileText, CheckCircle, Loader2, Pin, PinOff, 
  Users, Target, Mail, Settings, Filter, Send
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import NewsFormModal from '@/components/news/NewsFormModal';
import NewsDetailModal from '@/components/news/NewsDetailModal';
import { useToast } from '@/components/common/Toast';
import TargetGroupManagement from '@/components/news/TargetGroupManagement';
import CategoryManagement from '@/components/news/CategoryManagement';

export default function CompanyNewsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();

  // States
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [targetGroups, setTargetGroups] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });
  const [showTargetGroupManagement, setShowTargetGroupManagement] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load news when filters change
  useEffect(() => {
    if (categories.length > 0 && permissions) {
      loadNews();
    }
  }, [currentPage, selectedCategory, searchTerm]);

  // ============================================
  // DATA LOADING FUNCTIONS
  // ============================================

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPermissions(),
        loadCategories(),
        loadTargetGroups(),
        loadStatistics()
      ]);
      await loadNews();
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const perms = await newsService.myPermissions();
      setPermissions(perms);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      showError('Failed to load permissions');
    }
  };

  const loadNews = async () => {
    try {
      const params = {
        page: currentPage,
        search: searchTerm || undefined,
        ordering: '-is_pinned,-published_at'
      };

      const response = await newsService.getNews(params);
      
      setNews(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.results || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTargetGroups = async () => {
    try {
      const response = await targetGroupService.getTargetGroups();
      setTargetGroups(response.results || []);
    } catch (error) {
      console.error('Failed to load target groups:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await newsService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleTogglePublish = async (item, e) => {
    e.stopPropagation();
    
    if (!permissions?.is_admin) {
      showError('Only Admin can publish news');
      return;
    }
    
    try {
      await newsService.togglePublish(item.id);
      showSuccess(item.is_published ? 'News unpublished' : 'News published');
      await loadNews();
      await loadStatistics();
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const handleTogglePin = async (item, e) => {
    e.stopPropagation();
    
    if (!permissions?.is_admin) {
      showError('Only Admin can pin news');
      return;
    }
    
    try {
      await newsService.togglePin(item.id);
      showSuccess(item.is_pinned ? 'News unpinned' : 'News pinned');
      await loadNews();
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const handleCreateNews = () => {
    if (!permissions?.is_admin) {
      showError('Only Admin can create news');
      return;
    }
    setEditingNews(null);
    setShowFormModal(true);
  };

  const handleEditNews = (item, e) => {
    e.stopPropagation();
    
    if (!permissions?.is_admin) {
      showError('Only Admin can edit news');
      return;
    }
    
    setEditingNews({
      ...item,
      tags: item.tags_list || [],
      imagePreview: item.image_url,
      targetGroups: item.target_groups_info?.map(g => g.id) || [],
      notifyMembers: item.notify_members,
      isPinned: item.is_pinned,
      authorDisplayName: item.author_display_name
    });
    setShowFormModal(true);
  };

  const handleDeleteNews = (item, e) => {
    e.stopPropagation();
    
    if (!permissions?.is_admin) {
      showError('Only Admin can delete news');
      return;
    }
    
    setConfirmModal({ isOpen: true, item });
  };

  const handleSaveNews = async (formData) => {
    try {
      if (editingNews) {
        await newsService.updateNews(editingNews.id, formData);
        showSuccess('News updated successfully');
      } else {
        await newsService.createNews(formData);
        showSuccess('News created successfully');
      }
      await loadNews();
      await loadStatistics();
      setShowFormModal(false);
      setEditingNews(null);
    } catch (error) {
      showError(formatApiError(error));
      throw error;
    }
  };

  const confirmDelete = async () => {
    try {
      await newsService.deleteNews(confirmModal.item.id);
      showSuccess('News deleted successfully');
      await loadNews();
      await loadStatistics();
      setConfirmModal({ isOpen: false, item: null });
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const handleViewNews = async (item) => {
    try {
      const fullNews = await newsService.getNewsById(item.id);
      setSelectedNews(fullNews);
      setShowNewsModal(true);
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryInfo = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? {
      id: category.id,
      name: category.name,
      icon: FileText,
      color: 'bg-almet-sapphire'
    } : {
      id: 'unknown',
      name: 'Unknown',
      icon: FileText,
      color: 'bg-gray-500'
    };
  };

  // ============================================
  // RENDER CONDITIONS
  // ============================================

  // Show loading until permissions are loaded
  if (!permissions) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-almet-sapphire" />
        </div>
      </DashboardLayout>
    );
  }

  // If showing management screens
  if (showTargetGroupManagement) {
    return <TargetGroupManagement onBack={() => {
      setShowTargetGroupManagement(false);
      loadTargetGroups();
    }} />;
  }

  if (showCategoryManagement) {
    return <CategoryManagement onBack={() => {
      setShowCategoryManagement(false);
      loadCategories();
      loadNews();
    }} />;
  }

  // Filter news by category
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <DashboardLayout>
      <div className={`p-6 min-h-screen transition-colors ${
        darkMode ? 'bg-gray-900' : 'bg-almet-mystic'
      }`}>
        
        {/* ============================================ */}
        {/* HEADER SECTION */}
        {/* ============================================ */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold mb-1.5 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Company News
              </h1>
              <p className={`text-xs ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
              }`}>
                Stay updated with the latest announcements and events
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {/* ✅ Only Admin can see these buttons */}
              {permissions.is_admin && (
                <>
                  <button 
                    onClick={() => setShowCategoryManagement(true)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl hover:shadow-lg transition-all font-medium text-xs ${
                      darkMode
                        ? 'bg-almet-cloud-burst border-almet-comet text-almet-bali-hai hover:bg-almet-comet hover:text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <Settings size={15} />
                    Categories
                  </button>
                  <button 
                    onClick={() => setShowTargetGroupManagement(true)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl hover:shadow-lg transition-all font-medium text-xs ${
                      darkMode
                        ? 'bg-almet-cloud-burst border-almet-comet text-almet-bali-hai hover:bg-almet-comet hover:text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <Users size={15} />
                    Target Groups
                  </button>
                  <button 
                    onClick={handleCreateNews}
                    className="flex items-center gap-1.5 px-4 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-all font-medium text-xs shadow-lg shadow-almet-sapphire/20 hover:shadow-xl hover:shadow-almet-sapphire/30 hover:-translate-y-0.5"
                  >
                    <Plus size={16} />
                    Create News
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* STATISTICS CARDS - Admin Only */}
        {/* ============================================ */}
        {statistics && permissions.is_admin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {/* Total News Card */}
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
                    Total News
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {statistics.total_news || 0}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-sky-900/30' : 'bg-sky-50'
                }`}>
                  <FileText className={`h-5 w-5 ${
                    darkMode ? 'text-sky-400' : 'text-sky-600'
                  }`} />
                </div>
              </div>
            </div>
           
            {/* Published Card */}
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
                    Published
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {statistics.published_news || 0}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-green-900/30' : 'bg-green-50'
                }`}>
                  <CheckCircle className={`h-5 w-5 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
              </div>
            </div>

            {/* Total Views Card */}
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
                    Total Views
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {(statistics.total_views || 0).toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
                }`}>
                  <Eye className={`h-5 w-5 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
              </div>
            </div>

            {/* Pinned Card */}
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
                    Pinned
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {statistics.pinned_news || 0}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-orange-900/30' : 'bg-orange-50'
                }`}>
                  <Pin className={`h-5 w-5 ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* CATEGORY FILTER */}
        {/* ============================================ */}
        <div className={`rounded-2xl p-3.5 mb-4 border ${
          darkMode 
            ? 'bg-almet-cloud-burst border-almet-comet' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Filter size={14} className={darkMode ? 'text-almet-bali-hai' : 'text-gray-600'} />
            <span className={`text-xs font-medium ${
              darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
            }`}>
              Filter by Category
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-almet-sapphire text-white shadow-lg shadow-almet-sapphire/20'
                  : darkMode
                    ? 'bg-almet-san-juan text-almet-bali-hai hover:bg-almet-comet'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All News
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-lg text-[10px] ${
                selectedCategory === 'all' ? 'bg-white/20' : darkMode ? 'bg-almet-comet' : 'bg-gray-200'
              }`}>
                {news.length}
              </span>
            </button>
            {categories.filter(c => c.is_active).map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-almet-sapphire text-white shadow-lg shadow-almet-sapphire/20'
                    : darkMode
                      ? 'bg-almet-san-juan text-almet-bali-hai hover:bg-almet-comet'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-lg text-[10px] ${
                  selectedCategory === category.id ? 'bg-white/20' : darkMode ? 'bg-almet-comet' : 'bg-gray-200'
                }`}>
                  {news.filter(n => n.category === category.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* SEARCH BAR */}
        {/* ============================================ */}
        <div className={`rounded-2xl p-3.5 mb-5 border ${
          darkMode 
            ? 'bg-almet-cloud-burst border-almet-comet' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search news by title, excerpt..."
              className={`w-full pl-10 pr-3 py-2.5 text-xs border rounded-xl outline-none transition-all ${
                darkMode
                  ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-waterloo focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
              }`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* NEWS GRID */}
        {/* ============================================ */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-almet-sapphire" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center border ${
            darkMode 
              ? 'bg-almet-cloud-burst border-almet-comet' 
              : 'bg-white border-gray-200'
          }`}>
            <FileText className={`h-14 w-14 mx-auto mb-3 ${
              darkMode ? 'text-almet-bali-hai' : 'text-gray-400'
            }`} />
            <h3 className={`text-base font-semibold mb-1.5 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No News Found
            </h3>
            <p className={`text-xs mb-3 ${
              darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
            }`}>
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No news available at the moment'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {filteredNews.map((item) => {
                const categoryInfo = getCategoryInfo(item.category);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl overflow-hidden border transition-all group relative cursor-pointer ${
                      darkMode
                        ? 'bg-almet-cloud-burst border-almet-comet hover:shadow-xl hover:shadow-almet-sapphire/10 hover:border-almet-sapphire/50'
                        : 'bg-white border-gray-200 hover:shadow-xl hover:border-almet-sapphire/50'
                    }`}
                  >
                    {/* News Image */}
                    <div 
                      className="relative h-44 overflow-hidden"
                      onClick={() => handleViewNews(item)}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Status Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                        {item.is_pinned && (
                          <div className="bg-almet-sapphire text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 shadow-lg">
                            <Pin size={10} />
                            Pinned
                          </div>
                        )}
                        {!item.is_published && permissions.is_admin && (
                          <div className="bg-orange-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 shadow-lg">
                            <FileText size={10} />
                            Draft
                          </div>
                        )}
                      </div>
                      
                      {/* Category Badge */}
                      <div className={`absolute top-2.5 right-2.5 ${categoryInfo.color} text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 shadow-lg`}>
                        <CategoryIcon size={10} />
                        {categoryInfo.name}
                      </div>
                    </div>

                    {/* Action Buttons - Admin Only */}
                    <div className="absolute top-48 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {permissions.is_admin && (
                        <>
                          <button
                            onClick={(e) => handleTogglePin(item, e)}
                            className={`p-1.5 rounded-xl transition-all shadow-lg ${
                              item.is_pinned 
                                ? 'bg-orange-600 hover:bg-orange-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            } text-white`}
                            title={item.is_pinned ? 'Unpin' : 'Pin'}
                          >
                            {item.is_pinned ? <PinOff size={12} /> : <Pin size={12} />}
                          </button>
                          
                          <button
                            onClick={(e) => handleTogglePublish(item, e)}
                            className={`p-1.5 rounded-xl transition-all shadow-lg ${
                              item.is_published 
                                ? 'bg-purple-600 hover:bg-purple-700' 
                                : 'bg-sky-600 hover:bg-sky-700'
                            } text-white`}
                            title={item.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {item.is_published ? <Eye size={12} /> : <Send size={12} />}
                          </button>
                          
                          <button
                            onClick={(e) => handleEditNews(item, e)}
                            className="p-1.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all shadow-lg"
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>
                          
                          <button
                            onClick={(e) => handleDeleteNews(item, e)}
                            className="p-1.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Content */}
                    <div 
                      className="p-4"
                      onClick={() => handleViewNews(item)}
                    >
                      <h3 className={`font-semibold mb-1.5 line-clamp-2 text-sm group-hover:text-almet-sapphire transition-colors ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </h3>
                      <p className={`text-xs mb-3 line-clamp-2 ${
                        darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                      }`}>
                        {item.excerpt}
                      </p>

                      {/* Target Groups */}
                      {item.target_groups_info && item.target_groups_info.length > 0 && (
                        <div className="mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className={`flex items-center gap-0.5 text-[10px] ${
                              darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                            }`}>
                              <Target size={10} />
                              <span className="font-medium">Sent to:</span>
                            </div>
                            {item.target_groups_info.slice(0, 2).map(group => (
                              <span
                                key={group.id}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                                  darkMode
                                    ? 'bg-sky-900/30 text-sky-400'
                                    : 'bg-sky-50 text-sky-700'
                                }`}
                              >
                                {group.name}
                              </span>
                            ))}
                            {item.target_groups_info.length > 2 && (
                              <span className={`text-[10px] ${
                                darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                              }`}>
                                +{item.target_groups_info.length - 2} more
                              </span>
                            )}
                            {item.notify_members && item.notification_sent && (
                              <div className="flex items-center gap-0.5 ml-auto">
                                <Mail size={10} className={
                                  darkMode ? 'text-green-400' : 'text-green-600'
                                } />
                                <span className={`text-[10px] font-medium ${
                                  darkMode ? 'text-green-400' : 'text-green-600'
                                }`}>
                                  Notified
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {item.tags_list && item.tags_list.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {item.tags_list.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-lg text-[10px] ${
                                darkMode
                                  ? 'bg-almet-san-juan text-almet-bali-hai'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className={`flex items-center justify-between pt-2.5 border-t text-[10px] ${
                        darkMode ? 'border-almet-comet' : 'border-gray-200'
                      }`}>
                        <div className={`flex items-center gap-1 ${
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                        }`}>
                          <Calendar size={10} />
                          {formatDate(item.published_at)}
                        </div>
                        <div className={`flex items-center gap-0.5 ${
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                        }`}>
                          <Eye size={10} />
                          {item.view_count} views
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                darkMode={darkMode}
              />
            )}
          </>
        )}

        {/* ============================================ */}
        {/* MODALS */}
        {/* ============================================ */}

        {/* News Detail Modal */}
        <NewsDetailModal
          isOpen={showNewsModal}
          onClose={() => setShowNewsModal(false)}
          newsItem={selectedNews}
          darkMode={darkMode}
          permissions={permissions}
          categories={categories}
          onEdit={handleEditNews}
          onDelete={handleDeleteNews}
          onTogglePin={handleTogglePin}
          formatDate={formatDate}
          getCategoryInfo={getCategoryInfo}
        />

        {/* News Form Modal */}
        <NewsFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingNews(null);
          }}
          onSave={handleSaveNews}
          newsItem={editingNews}
          darkMode={darkMode}
          categories={categories}
          targetGroups={targetGroups}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, item: null })}
          onConfirm={confirmDelete}
          title="Delete News"
          message={`Are you sure you want to delete "${confirmModal.item?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
          darkMode={darkMode}
        />
      </div>
    </DashboardLayout>
  );
}