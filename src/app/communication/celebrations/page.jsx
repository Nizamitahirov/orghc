"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Pagination from "@/components/common/Pagination";
import { useToast } from "@/components/common/Toast";
import celebrationService from "@/services/celebrationService";
import { 
  Plus, Search, Calendar, Cake, Award, Gift, PartyPopper,
  Edit, Trash2, X, Loader2, TrendingUp, ChevronLeft, ChevronRight,
  Building2, Briefcase, Image as ImageIcon, Heart, Users
} from 'lucide-react';
import jobDescriptionService from '@/services/jobDescriptionService';

export default function CelebrationsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  const [celebrations, setCelebrations] = useState([]);
  const [selectedCelebration, setSelectedCelebration] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null, loading: false });
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [statistics, setStatistics] = useState({
    total_celebrations: 0,
    this_month: 0,
    upcoming: 0,
    total_wishes: 0
  });
  const [formData, setFormData] = useState({
    type: 'company_event',
    title: '',
    date: '',
    message: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [celebratedItems, setCelebratedItems] = useState(new Set());
  const [celebrationWishes, setCelebrationWishes] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  
  // ✅ Access control state
  const [userAccess, setUserAccess] = useState(null);
  const [accessLoading, setAccessLoading] = useState(true);

  const celebrationTypes = [
    { id: 'all', name: 'All Celebrations', icon: PartyPopper, color: 'bg-almet-sapphire' },
    { id: 'birthday', name: 'Birthdays', icon: Cake, color: 'bg-pink-500' },
    { id: 'work_anniversary', name: 'Work Anniversary', icon: Award, color: 'bg-purple-500' },
    { id: 'company_event', name: 'Company Events', icon: Building2, color: 'bg-green-500' },
    { id: 'achievement', name: 'Achievements', icon: Briefcase, color: 'bg-amber-500' },
    { id: 'other', name: 'Other', icon: Gift, color: 'bg-orange-500' }
  ];

  const months = [
    { id: 'all', name: 'All Months' },
    ...Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      const monthName = new Date(2024, i, 1).toLocaleString('en-US', { month: 'long' });
      return { id: monthNum, name: monthName };
    })
  ];

  useEffect(() => { 
    loadUserAccess();
    loadCelebrations(); 
    loadStatistics();
    loadCelebratedItems();
  }, []);

  // ✅ Load user access
  const loadUserAccess = async () => {
    try {
      setAccessLoading(true);
      const accessInfo = await jobDescriptionService.getMyAccessInfo();
      setUserAccess(accessInfo);
    } catch (error) {
      console.error('Error fetching user access:', error);
      showError('Failed to load access information');
    } finally {
      setAccessLoading(false);
    }
  };

  const loadCelebratedItems = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`celebrated_${today}`);
    if (stored) {
      setCelebratedItems(new Set(JSON.parse(stored)));
    }
  };

  const saveCelebratedItem = (itemId) => {
    const today = new Date().toISOString().split('T')[0];
    const newCelebrated = new Set([...celebratedItems, itemId]);
    setCelebratedItems(newCelebrated);
    localStorage.setItem(`celebrated_${today}`, JSON.stringify([...newCelebrated]));
  };

  const loadCelebrations = async () => {
    setLoading(true);
    try {
      const data = await celebrationService.getAllCelebrations();
      setCelebrations(data);
    } catch (error) {
      console.error('Error loading celebrations:', error);
      showError('Error loading celebrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await celebrationService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageData) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageData.id));
    setImagesToRemove(prev => [...prev, imageData.id]);
  };

  const openCreateModal = () => {
    // ✅ Check access before opening
    if (!userAccess?.can_create) {
      showWarning('You do not have permission to create celebrations');
      return;
    }
    setIsEditMode(false);
    resetForm();
    setShowFormModal(true);
  };

  const openEditModal = (celebration) => {
    // ✅ Check access before editing
    if (!userAccess?.can_create) {
      showWarning('You do not have permission to edit celebrations');
      return;
    }
    setIsEditMode(true);
    setSelectedCelebration(celebration);
    
    setFormData({
      type: celebration.type,
      title: celebration.title,
      date: celebration.date,
      message: celebration.message
    });
    
    setExistingImages(celebration.images || []);
    setImageFiles([]);
    setImagePreview([]);
    setImagesToRemove([]);
    
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.date || !formData.message) {
        showWarning('Please fill in all required fields');
        return;
      }

      setFormLoading(true);

      if (isEditMode) {
        await handleUpdateCelebration();
      } else {
        await handleCreateCelebration();
      }

      setShowFormModal(false);
      resetForm();
      loadCelebrations();
      loadStatistics();
      
      showSuccess(isEditMode ? 'Celebration updated successfully!' : 'Celebration created successfully!');
    } catch (error) {
      console.error('Error submitting celebration:', error);
      showError('Error submitting celebration. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateCelebration = async () => {
    const celebrationData = {
      type: formData.type,
      title: formData.title,
      date: formData.date,
      message: formData.message,
      images: imageFiles
    };

    await celebrationService.createCelebration(celebrationData);
  };

  const handleUpdateCelebration = async () => {
    if (!selectedCelebration) return;

    for (const imageId of imagesToRemove) {
      try {
        await celebrationService.removeImage(selectedCelebration.id, imageId);
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }

    const updateData = {
      type: formData.type,
      title: formData.title,
      date: formData.date,
      message: formData.message,
      images: imageFiles
    };

    await celebrationService.updateCelebration(selectedCelebration.id, updateData);
  };

  const resetForm = () => {
    setFormData({
      type: 'company_event',
      title: '',
      date: '',
      message: ''
    });
    setImageFiles([]);
    setImagePreview([]);
    setExistingImages([]);
    setImagesToRemove([]);
    setSelectedCelebration(null);
    setIsEditMode(false);
  };

  const handleCelebrate = async (item, e) => {
    e.stopPropagation();
    
    if (celebratedItems.has(item.id)) {
      return;
    }

    if (!item.is_auto) {
      const celebrationDate = new Date(item.date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
    }

    try {
      const celebrateMessage = '🎉';
      
      if (item.is_auto) {
        await celebrationService.addAutoWish(
          item.employee_id,
          item.type,
          celebrateMessage
        );
      } else {
        await celebrationService.addWish(
          item.id,
          celebrateMessage
        );
      }

      saveCelebratedItem(item.id);
      loadCelebrations();
      loadStatistics();
      
      if (showDetailModal && selectedCelebration && selectedCelebration.id === item.id) {
        loadCelebrationWishes(item);
      }
      
      showSuccess('Celebration sent! 🎉');
    } catch (error) {
      console.error('Error celebrating:', error);
      showError('Error celebrating. Please try again.');
    }
  };

  const loadCelebrationWishes = async (celebration) => {
    try {
      if (celebration.is_auto) {
        const data = await celebrationService.getAutoCelebrationWishes(
          celebration.employee_id,
          celebration.type
        );
        setCelebrationWishes(data);
      } else {
        const data = await celebrationService.getCelebrationWishes(celebration.id);
        setCelebrationWishes(data);
      }
    } catch (error) {
      console.error('Error loading wishes:', error);
      setCelebrationWishes([]);
    }
  };

  const formatWishTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const filteredCelebrations = celebrations.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesMonth = selectedMonth === 'all' || item.date.split('-')[1] === selectedMonth;
    return matchesSearch && matchesType && matchesMonth;
  });

  const sortedCelebrations = [...filteredCelebrations].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalPages = Math.ceil(sortedCelebrations.length / itemsPerPage);
  const paginatedCelebrations = sortedCelebrations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => { 
    setCurrentPage(page); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const getTypeInfo = (typeId) => celebrationTypes.find(type => type.id === typeId) || celebrationTypes[0];

  const handleEditCelebration = (item, e) => { 
    e.stopPropagation(); 
    if (item.is_auto) {
      showWarning('Cannot edit auto-generated celebrations (birthdays and work anniversaries)');
      return;
    }
    openEditModal(item);
  };

  const handleDeleteCelebration = (item, e) => { 
    e.stopPropagation();
    if (item.is_auto) {
      showWarning('Cannot delete auto-generated celebrations (birthdays and work anniversaries)');
      return;
    }
    // ✅ Check access before deleting
    if (!userAccess?.can_create) {
      showWarning('You do not have permission to delete celebrations');
      return;
    }
    setConfirmModal({ isOpen: true, item, loading: false }); 
  };

  const confirmDelete = async () => { 
    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      await celebrationService.deleteCelebration(confirmModal.item.id);
      setConfirmModal({ isOpen: false, item: null, loading: false });
      loadCelebrations();
      loadStatistics();
      showSuccess('Celebration deleted successfully!');
    } catch (error) {
      console.error('Error deleting celebration:', error);
      showError('Error deleting celebration. Please try again.');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedCelebration) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedCelebration.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedCelebration) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedCelebration.images.length) % selectedCelebration.images.length);
    }
  };

  return (
    <DashboardLayout>
      <div className={`p-6 min-h-screen`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Company Celebrations
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Celebrate milestones and achievements together
              </p>
            </div>
            {/* ✅ Only show Create button if user has permission */}
            {userAccess?.can_create && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                Create Celebration
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-xl p-5 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Celebrations</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{statistics.total_celebrations}</p>
              </div>
              <div className="p-3 bg-almet-sapphire/10 rounded-xl">
                <PartyPopper className="h-6 w-6 text-almet-sapphire" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-5 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{statistics.this_month}</p>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Calendar className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-5 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{statistics.upcoming}</p>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <TrendingUp className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-5 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Wishes</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{statistics.total_wishes}</p>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-pink-900/30' : 'bg-pink-100'}`}>
                <Heart className={`h-6 w-6 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-xl p-4 mb-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="mb-4">
            <label className={`block text-xs font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filter by Type
            </label>
            <div className="flex flex-wrap gap-2">
              {celebrationTypes.map(type => {
                const Icon = type.icon;
                const isActive = selectedType === type.id;
                const count = type.id === 'all' ? celebrations.length : celebrations.filter(c => c.type === type.id).length;
                return (
                  <button
                    key={type.id}
                    onClick={() => { setSelectedType(type.id); setCurrentPage(1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive 
                        ? `${type.color} text-white shadow-md scale-105` 
                        : darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={14} />
                    {type.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive ? 'bg-white/20' : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-5" />
              <input
                type="text"
                placeholder="Search celebrations..."
                className={`w-full pl-10 pr-4 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-almet-sapphire outline-none ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
              className={`px-4 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-almet-sapphire outline-none ${
                darkMode 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {months.map(month => <option key={month.id} value={month.id}>{month.name}</option>)}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
          </div>
        ) : paginatedCelebrations.length === 0 ? (
          <div className={`rounded-xl p-12 text-center border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <PartyPopper className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No Celebrations Found
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your filters or create a new celebration
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {paginatedCelebrations.map((item) => {
                const typeInfo = getTypeInfo(item.type);
                const TypeIcon = typeInfo.icon;
                
                const firstImage = item.is_auto 
                  ? item.images[0] 
                  : (item.images[0]?.image_url || item.images[0]?.image || item.images[0]);

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl overflow-hidden border hover:shadow-xl transition-all duration-300 group relative transform hover:-translate-y-1 ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div 
                      className="relative h-52 overflow-hidden cursor-pointer" 
                      onClick={() => { 
                        setSelectedCelebration(item); 
                        setCurrentImageIndex(0);
                        setShowDetailModal(true);
                        loadCelebrationWishes(item);
                      }}
                    >
                      <img
                        src={firstImage}
                        alt={item.title || item.employee_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {item.images.length > 1 && (
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                          <ImageIcon size={12} />
                          {item.images.length} photos
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 ${typeInfo.color} text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg`}>
                        <TypeIcon size={14} />
                        {typeInfo.name}
                      </div>
                    </div>

                    {/* ✅ Only show edit/delete if user has permission AND celebration is not auto */}
                    {!item.is_auto && userAccess?.can_create && (
                      <div className="absolute top-56 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditCelebration(item, e)}
                          className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCelebration(item, e)}
                          className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    <div 
                      className="p-5 cursor-pointer" 
                      onClick={() => { 
                        setSelectedCelebration(item); 
                        setCurrentImageIndex(0);
                        setShowDetailModal(true);
                        loadCelebrationWishes(item);
                      }}
                    >
                      <h3 className={`font-semibold text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title || item.employee_name}
                      </h3>
                      {item.position && (
                        <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.position}
                        </p>
                      )}
                 
                      {item.years && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium mb-3 ${
                          darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                        }`}>
                          <Award size={14} />
                          {item.years} years
                        </div>
                      )}
                      <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        {item.message}
                      </p>
                      <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Calendar size={14} />
                          {formatDate(item.date)}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1.5 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Users size={14} />
                            {item.wishes}
                          </div>
                          <button
                            onClick={(e) => handleCelebrate(item, e)}
                            disabled={celebratedItems.has(item.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              celebratedItems.has(item.id)
                                ? darkMode 
                                  ? 'bg-green-900/30 text-green-400 cursor-default'
                                  : 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-almet-sapphire text-white hover:bg-blue-700 hover:shadow-md'
                            }`}
                            title={
                              celebratedItems.has(item.id) 
                                ? 'Already celebrated' 
                                : 'Celebrate'
                            }
                          >
                            {celebratedItems.has(item.id) ? '✓' : '🎉'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedCelebrations.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              darkMode={darkMode}
            />
          </>
        )}

        {/* Create/Edit Modal */}
        {showFormModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowFormModal(false);
              resetForm();
            }}
          >
            <div 
              className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isEditMode ? 'Edit Celebration' : 'Create Celebration'}
                </h2>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Type Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Celebration Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {celebrationTypes.filter(t => !['all', 'birthday', 'work_anniversary'].includes(t.id)).map(type => {
                      const Icon = type.icon;
                      const isActive = formData.type === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.id })}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive 
                              ? `${type.color} text-white shadow-md` 
                              : darkMode 
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon size={16} />
                          {type.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter celebration title"
                    className={`w-full px-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-almet-sapphire outline-none ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-almet-sapphire outline-none ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter celebration message"
                    rows={4}
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-almet-sapphire outline-none resize-none ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Images
                  </label>
                  
                  {/* Existing Images (Edit Mode) */}
                  {isEditMode && existingImages.length > 0 && (
                    <div className="mb-4">
                      <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Current Images
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {existingImages.map((imageData) => (
                          <div key={imageData.id} className="relative group">
                            <img
                              src={imageData.image_url || imageData.image}
                              alt={`Image ${imageData.id}`}
                              className="w-full h-28 object-cover rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(imageData)}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New Images */}
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700/50 hover:border-almet-sapphire' : 'border-gray-300 bg-gray-50 hover:border-almet-sapphire'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <ImageIcon className={`h-8 w-8 mx-auto mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Click to upload {isEditMode ? 'additional ' : ''}images
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        PNG, JPG up to 10MB
                      </p>
                    </label>
                  </div>

                  {/* New Image Previews */}
                  {imagePreview.length > 0 && (
                    <div className="mt-4">
                      <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        New Images to Upload
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-28 object-cover rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className={`sticky bottom-0 flex justify-end gap-3 p-4 border-t ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  disabled={formLoading}
                  className={`px-5 py-2 text-xs rounded-xl font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.date || !formData.message || formLoading}
                  className={`px-6 py-2 text-xs rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 ${
                    !formData.title || !formData.date || !formData.message || formLoading
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-almet-sapphire text-white hover:bg-blue-700 hover:shadow-xl'
                  }`}
                >
                  {formLoading && <Loader2 size={14} className="animate-spin" />}
                  {formLoading ? 'Saving...' : isEditMode ? 'Update Celebration' : 'Create Celebration'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCelebration && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDetailModal(false);
              setCelebrationWishes([]);
            }}
          >
            <div 
              className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-80">
                <img
                  src={
                    selectedCelebration.is_auto 
                      ? selectedCelebration.images[currentImageIndex]
                      : (selectedCelebration.images[currentImageIndex]?.image_url || 
                         selectedCelebration.images[currentImageIndex]?.image ||
                         selectedCelebration.images[currentImageIndex])
                  }
                  alt={selectedCelebration.title || selectedCelebration.employee_name}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Buttons */}
                {selectedCelebration.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-xl shadow-lg transition-all ${
                        darkMode ? 'bg-gray-800/90 hover:bg-gray-700' : 'bg-white/90 hover:bg-white'
                      }`}
                    >
                      <ChevronLeft size={24} className={darkMode ? 'text-white' : 'text-gray-600'} />
                    </button>
                    <button
                      onClick={nextImage}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl shadow-lg transition-all ${
                        darkMode ? 'bg-gray-800/90 hover:bg-gray-700' : 'bg-white/90 hover:bg-white'
                      }`}
                    >
                      <ChevronRight size={24} className={darkMode ? 'text-white' : 'text-gray-600'} />
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium">
                      {currentImageIndex + 1} / {selectedCelebration.images.length}
                    </div>
                  </>
                )}

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setCelebrationWishes([]);
                  }}
                  className={`absolute top-4 right-4 p-2.5 rounded-xl shadow-lg transition-all ${
                    darkMode ? 'bg-gray-800/90 hover:bg-gray-700' : 'bg-white/90 hover:bg-white'
                  }`}
                >
                  <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                </button>

                {/* ✅ Edit and Delete Buttons - only if user has permission */}
                {!selectedCelebration.is_auto && userAccess?.can_create && (
                  <div className="absolute top-4 left-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailModal(false);
                        openEditModal(selectedCelebration);
                      }}
                      className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        setShowDetailModal(false);
                        handleDeleteCelebration(selectedCelebration, e);
                      }}
                      className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

                {/* Type Badge */}
                <div className={`absolute bottom-4 left-4 ${getTypeInfo(selectedCelebration.type).color} text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg`}>
                  {React.createElement(getTypeInfo(selectedCelebration.type).icon, { size: 18 })}
                  {getTypeInfo(selectedCelebration.type).name}
                </div>
              </div>

              <div className="p-6">
                <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCelebration.title || selectedCelebration.employee_name}
                </h2>
                {selectedCelebration.position && (
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedCelebration.position} 
                  </p>
                )}
              
                {selectedCelebration.years && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mb-4 ${
                    darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <Award size={18} />
                    {selectedCelebration.years} years with us
                  </div>
                )}
                
                <div className={`rounded-xl p-5 mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedCelebration.message}
                  </p>
                </div>

                <div className={`flex items-center justify-between pt-5 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Calendar size={18} />
                    {formatDate(selectedCelebration.date)}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Users size={18} />
                      {selectedCelebration.wishes} celebrations
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCelebrate(selectedCelebration, e);
                      }}
                      disabled={celebratedItems.has(selectedCelebration.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg ${
                        celebratedItems.has(selectedCelebration.id)
                          ? darkMode 
                            ? 'bg-green-900/30 text-green-400 cursor-default'
                            : 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-almet-sapphire text-white hover:bg-blue-700 hover:shadow-xl'
                      }`}
                      title={
                        celebratedItems.has(selectedCelebration.id) 
                          ? 'Already celebrated' 
                          : 'Celebrate'
                      }
                    >
                      {celebratedItems.has(selectedCelebration.id) ? '✓ Celebrated' : '🎉 Celebrate'}
                    </button>
                  </div>
                </div>

                {/* Wishes Section */}
                {selectedCelebration.wishes > 0 && (
                  <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Celebrations ({selectedCelebration.wishes})
                      </h3>
                      {celebrationWishes.length === 0 && (
                        <button
                          onClick={() => loadCelebrationWishes(selectedCelebration)}
                          className="text-sm text-almet-sapphire hover:underline font-medium"
                        >
                          Load wishes
                        </button>
                      )}
                    </div>

                    {celebrationWishes.length > 0 && (
                      <div className={`rounded-xl p-5 max-h-64 overflow-y-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="space-y-3">
                          {celebrationWishes.map((wish, index) => (
                            <div 
                              key={index}
                              className={`flex items-start gap-3 pb-3 ${
                                index !== celebrationWishes.length - 1 
                                  ? darkMode ? 'border-b border-gray-600' : 'border-b border-gray-200' 
                                  : ''
                              }`}
                            >
                              <div className="text-2xl">🎉</div>
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {wish.user_name || 'Anonymous'}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatWishTime(wish.created_at)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, item: null, loading: false })}
          onConfirm={confirmDelete}
          title="Delete Celebration"
          message={`Are you sure you want to delete "${confirmModal.item?.title || confirmModal.item?.employee_name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          loading={confirmModal.loading}
          darkMode={darkMode}
        />
      </div>
    </DashboardLayout>
  );
}