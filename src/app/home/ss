"use client";
import { Calendar, Users, LineChart, Plane, Clock, CheckCircle, TrendingUp, Bell, UserCheck, MapPin, FileText, Eye, ChevronRight, X, Cake, Award, Sparkles, BookOpen, Download, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useToast } from "@/components/common/Toast";
import { useAuth } from "@/auth/AuthContext";
import { useState, useEffect } from "react";
import { newsService } from "@/services/newsService";
import celebrationService from "@/services/celebrationService";
import trainingService from "@/services/trainingService";
import OnboardingTrainingCard from "@/components/training/OnboardingTrainingCard";
import AssignmentDetailModal from "@/components/training/AssignmentDetailModal";
import { useTheme } from "@/components/common/ThemeProvider";
import { useRouter } from "next/navigation";


const StatsCard = ({ icon, title, value, subtitle, actionText, isHighlight = false }) => {
  return (
    <div className={`${
      isHighlight 
        ? 'bg-gradient-to-br from-almet-sapphire to-almet-astral shadow-lg shadow-almet-sapphire/20' 
        : 'bg-white dark:bg-almet-cloud-burst shadow-md'
    } backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border ${
      isHighlight 
        ? 'border-almet-steel-blue' 
        : 'border-almet-mystic dark:border-almet-san-juan'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-4 items-center">
          <div className={`p-2 ${
          isHighlight 
            ? 'bg-white/20 text-white' 
            : 'bg-gradient-to-br from-almet-mystic to-white dark:from-almet-san-juan dark:to-almet-comet text-almet-sapphire dark:text-almet-steel-blue'
        } rounded-xl transition-all duration-300 shadow-sm`}>
          {icon}
        </div>
      </div>
      <h3 className={`${
        isHighlight 
          ? 'text-white/90' 
          : 'text-almet-waterloo dark:text-almet-bali-hai'
      } text-xs font-semibold mb-1 uppercase tracking-wide`}>
        {title}
      </h3>
        </div>
        
      <div className="flex gap-4 items-center mb-3">
      <div className={`text-xl font-bold mb-1 ${
        isHighlight 
          ? 'text-white' 
          : 'text-almet-cloud-burst dark:text-white'
      }`}>
        {value}
      </div>
      <p className={`${
        isHighlight 
          ? 'text-white/80' 
          : 'text-almet-waterloo dark:text-almet-bali-hai'
      } text-sm `}>
        {subtitle}
      </p>
 </div>

      {actionText && (
        <button className={`${
          isHighlight 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white shadow-md'
        } text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 w-full`}>
          {actionText}
        </button>
      )}
    </div>
  );
};

const ActionCard = ({ icon, title, description, href }) => {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-almet-mystic dark:border-almet-san-juan"
    >
      <div className="flex flex-col h-full">
        <div className="text-almet-sapphire dark:text-almet-steel-blue mb-3 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-almet-cloud-burst dark:text-white font-medium text-sm md:text-base">
          {title}
        </h3>
        <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs md:text-sm mt-1">
          {description}
        </p>
      </div>
    </Link>
  );
};

const NewsCard = ({ news, darkMode, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-almet-cloud-burst rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-300 group border border-almet-mystic dark:border-almet-san-juan cursor-pointer"
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={news.image_url || 'https://images.unsplash.com/photo-1573164713619-24c711fe7878?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80'} 
          alt={news.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
        />
        {news.category_name && (
          <div className="absolute top-2 left-2 bg-almet-sapphire text-white text-xs rounded-full px-3 py-1 font-medium shadow-lg">
            {news.category_name}
          </div>
        )}
        {news.is_pinned && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs rounded-full px-3 py-1 font-medium shadow-lg">
            Pinned
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-almet-cloud-burst dark:text-white font-medium text-sm md:text-base mb-2 line-clamp-2 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
          {news.title}
        </h3>
        <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs md:text-sm mb-3 line-clamp-2">
          {news.excerpt}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-almet-waterloo dark:text-almet-bali-hai text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(news.published_at)}
          </span>
          <div className="flex items-center gap-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {news.view_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CelebrationCard = ({ celebration, darkMode, onCelebrate, isCelebrated, isToday }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getIcon = () => {
    if (celebration.type === 'birthday') return <Cake className="h-4 w-4" />;
    if (celebration.type === 'work_anniversary') return <Award className="h-4 w-4" />;
    return null;
  };

  const getTypeLabel = () => {
    if (celebration.type === 'birthday') return 'Birthday';
    if (celebration.type === 'work_anniversary') return 'Work Anniversary';
    return '';
  };

  const getTypeColor = () => {
    if (celebration.type === 'birthday') return 'text-pink-600 dark:text-pink-400';
    if (celebration.type === 'work_anniversary') return 'text-purple-600 dark:text-purple-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <div className={`bg-white dark:bg-almet-cloud-burst rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border ${
      isToday 
        ? 'border-almet-sapphire dark:border-almet-steel-blue ring-2 ring-almet-sapphire/30 dark:ring-almet-steel-blue/30' 
        : 'border-almet-mystic dark:border-almet-san-juan'
    } relative overflow-hidden`}>
      
      {isToday && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-almet-sapphire via-almet-astral to-almet-steel-blue"></div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              celebration.type === 'birthday' 
                ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
            }`}>
              {getIcon()}
            </div>
            <div>
              <p className={`text-xs font-medium ${getTypeColor()}`}>
                {getTypeLabel()}
              </p>
              {celebration.years && (
                <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
                  {celebration.years} {celebration.years === 1 ? 'year' : 'years'}
                </p>
              )}
            </div>
          </div>
          
          {isToday && (
            <div className="bg-almet-sapphire dark:bg-almet-steel-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Today
            </div>
          )}
        </div>

        <div className="mb-3">
          <h3 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {celebration.employee_name}
          </h3>
          <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
            {celebration.position}
          </p>
          <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
            {celebration.department}
          </p>
        </div>

        <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? 'border-almet-comet' : 'border-gray-200'}`}>
          <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
            <Calendar size={12} />
            {formatDate(celebration.date)}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCelebrate(celebration);
            }}
            disabled={isCelebrated}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isCelebrated
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-default'
                : 'bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue dark:hover:text-white'
            }`}
            title={isCelebrated ? 'Already celebrated' : 'Send wishes'}
          >
            {isCelebrated ? (
              <>
                <CheckCircle size={12} />
                <span>Sent</span>
              </>
            ) : (
              <>
                <span>🎉</span>
                <span>Celebrate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};



const NewsDetailModal = ({ isOpen, onClose, news, darkMode }) => {
  if (!isOpen || !news) return null;

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

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
          darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
        }`} 
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="relative h-72">
          <img
            src={news.image_url || 'https://images.unsplash.com/photo-1573164713619-24c711fe7878?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80'}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          
          <button
            onClick={onClose}
            className={`absolute top-3 right-3 p-2 rounded-xl shadow-lg transition-colors ${
              darkMode
                ? 'bg-almet-cloud-burst hover:bg-almet-comet text-white'
                : 'bg-white hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X size={18} />
          </button>

          {news.category_name && (
            <div className="absolute bottom-3 left-3 bg-almet-sapphire text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg">
              <FileText size={14} />
              {news.category_name}
            </div>
          )}

          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {news.is_pinned && (
              <div className="bg-orange-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-medium shadow-lg">
                Pinned
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-almet-sapphire to-almet-astral text-white rounded-full flex items-center justify-center text-sm font-medium">
                {(news.author_display_name || news.author_name || 'S').charAt(0)}
              </div>
              <div>
                <p className={`text-xs font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {news.author_display_name || news.author_name || 'System'}
                </p>
                <p className={`text-[10px] ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                }`}>
                  {formatDate(news.published_at)}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${
              darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
            }`}>
              <Eye size={14} />
              {news.view_count} views
            </div>
          </div>

          <h2 className={`text-xl font-bold mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {news.title}
          </h2>

          {news.excerpt && (
            <p className={`text-sm font-medium mb-3 ${
              darkMode ? 'text-almet-steel-blue' : 'text-almet-sapphire'
            }`}>
              {news.excerpt}
            </p>
          )}

          <p className={`leading-relaxed mb-5 whitespace-pre-line text-sm ${
            darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
          }`}>
            {news.content}
          </p>

          {news.tags_list && news.tags_list.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 pt-4 border-t ${
              darkMode ? 'border-almet-comet' : 'border-gray-200'
            }`}>
              {news.tags_list.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-xl text-xs ${
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

          <div className="mt-6 pt-4 border-t border-almet-mystic dark:border-almet-comet">
            <Link
              href="/communication/company-news"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-xl hover:from-almet-astral hover:to-almet-steel-blue transition-all text-sm font-medium shadow-lg"
            >
              View All Company News
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { account } = useAuth();
  const { darkMode } = useTheme();
  const toast = useToast();
  const [isManager, setIsManager] = useState(false);
  const [latestNews, setLatestNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [upcomingCelebrations, setUpcomingCelebrations] = useState([]);
  const [loadingCelebrations, setLoadingCelebrations] = useState(true);
  const [celebratedItems, setCelebratedItems] = useState(new Set());
  
  // Training State
  const [myTrainings, setMyTrainings] = useState(null);
  const [loadingTrainings, setLoadingTrainings] = useState(true);

  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Theme colors
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  useEffect(() => {
    loadMyTrainings();
  }, []);

  const loadMyTrainings = async () => {
    setLoadingTrainings(true);
    try {
      const response = await trainingService.assignments.getMyTrainings();
      setMyTrainings(response);
    } catch (error) {
      console.error("Failed to load my trainings:", error);
    } finally {
      setLoadingTrainings(false);
    }
  };

  const handleTrainingClick = async (assignment) => {
    try {
      // Fetch full assignment details
      const data = await trainingService.assignments.getById(assignment.id);
      
      // Fetch training details to get materials
      if (data.training) {
        const trainingDetails = await trainingService.trainings.getById(data.training);
        data.materials = trainingDetails.materials || [];
      }
      
      setSelectedAssignment(data);
      setShowTrainingModal(true);
    } catch (error) {
      console.error("Error loading assignment:", error);
      toast.showError("Failed to load training details");
    }
  };

  const getPendingTrainings = () => {
    if (!myTrainings || !myTrainings.assignments) return [];
    return myTrainings.assignments
      .filter((a) => a.status !== "COMPLETED")
      .slice(0, 2);
  };

  const getTrainingStats = () => {
    if (!myTrainings || !myTrainings.summary) {
      return { completedCount: 0, totalCount: 0 };
    }
    return {
      completedCount: myTrainings.summary.completed,
      totalCount: myTrainings.summary.total,
    };
  };
  useEffect(() => {
    loadLatestNews();
    loadUpcomingCelebrations();
    loadCelebratedItems();
    loadMyTrainings();
  }, []);

 

  const loadLatestNews = async () => {
    setLoadingNews(true);
    try {
      const response = await newsService.getNews({
        page: 1,
        page_size: 3,
        is_published: true,
        ordering: '-is_pinned,-published_at'
      });
      setLatestNews(response.results || []);
    } catch (error) {
      console.error('Failed to load latest news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const loadUpcomingCelebrations = async () => {
    setLoadingCelebrations(true);
    try {
      const allCelebrations = await celebrationService.getAllCelebrations();
      
      const celebrations = allCelebrations.filter(c => 
        c.type === 'birthday' || c.type === 'work_anniversary'
      );
      
      celebrations.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setUpcomingCelebrations(celebrations.slice(0, 4));
    } catch (error) {
      console.error('Failed to load celebrations:', error);
    } finally {
      setLoadingCelebrations(false);
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

  const handleCelebrate = async (celebration) => {
    if (celebratedItems.has(celebration.id)) return;

    try {
      const celebrateMessage = '🎉';
      
      await celebrationService.addAutoWish(
        celebration.employee_id,
        celebration.type,
        celebrateMessage
      );

      saveCelebratedItem(celebration.id);
      loadUpcomingCelebrations();
    } catch (error) {
      console.error('Error celebrating:', error);
      alert('Error celebrating. Please try again.');
    }
  };

  const isCelebrationToday = (dateString) => {
    const celebrationDate = new Date(dateString).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return celebrationDate === today;
  };

  const handleNewsClick = async (news) => {
    try {
      const fullNews = await newsService.getNewsById(news.id);
      setSelectedNews(fullNews);
      setShowNewsModal(true);
    } catch (error) {
      console.error('Failed to load news details:', error);
      setSelectedNews(news);
      setShowNewsModal(true);
    }
  };


  
  return (
    <DashboardLayout>
      {/* Enhanced Welcome Banner */}
      <div className="bg-gradient-to-br from-almet-mystic via-white to-almet-mystic dark:from-almet-san-juan dark:via-almet-cloud-burst dark:to-almet-san-juan rounded-2xl overflow-hidden mb-6 shadow-lg border-2 border-almet-sapphire/20 dark:border-almet-steel-blue/20">
        <div className="px-6 py-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-almet-sapphire via-almet-astral to-almet-steel-blue dark:from-almet-steel-blue dark:via-almet-astral dark:to-almet-sapphire bg-clip-text text-transparent mb-2">
                {isManager ? "Manager Dashboard" : (account ? `Welcome, ${account.name || account.username || "İstifadəçi"}!` : "Welcome, Almet Central!")}
              </h1>
              <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs font-medium">
                {isManager ? "Approvals and team overview at a glance." : "Your key stats and quick actions for the day."}
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button 
                onClick={() => setIsManager(false)}
                className={`${!isManager ? 'bg-gradient-to-r from-almet-sapphire to-almet-astral text-white shadow-md shadow-almet-sapphire/30' : 'bg-white/60 dark:bg-almet-comet text-almet-cloud-burst dark:text-almet-bali-hai hover:bg-white/80 dark:hover:bg-almet-comet/80 border border-almet-sapphire/20 dark:border-almet-steel-blue/20'} px-5 py-2 rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105`}
              >
                Employee
              </button>
              <button 
                onClick={() => setIsManager(true)}
                className={`${isManager ? 'bg-gradient-to-r from-almet-sapphire to-almet-astral text-white shadow-md shadow-almet-sapphire/30' : 'bg-white/60 dark:bg-almet-comet text-almet-cloud-burst dark:text-almet-bali-hai hover:bg-white/80 dark:hover:bg-almet-comet/80 border border-almet-sapphire/20 dark:border-almet-steel-blue/20'} px-5 py-2 rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105`}
              >
                Manager
              </button>
            </div>
          </div>
          
          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {!isManager ? (
              <>
                <StatsCard
                  icon={<Clock className="h-5 w-5" />}
                  title="My Leave Balance"
                  value="12"
                  subtitle="days available"
                  actionText="Request Leave"
                  isHighlight={true}
                />
                <StatsCard
                  icon={<CheckCircle className="h-5 w-5" />}
                  title="My Requests"
                  value="1"
                  subtitle="pending approval"
                  actionText="View All Requests"
                />
                <StatsCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="Performance"
                  value="Nov 30"
                  subtitle="Next review on:"
                  actionText="View History"
                />
                <StatsCard
                  icon={<Bell className="h-5 w-5" />}
                  title="Info Center"
                  value={latestNews.length}
                  subtitle="Latest company updates."
                  actionText="Read Company News"
                />
              </>
            ) : (
              <>
                <StatsCard
                  icon={<UserCheck className="h-5 w-5" />}
                  title="Team Approvals"
                  value="5"
                  subtitle="requests awaiting action"
                  actionText="Manage Requests"
                  isHighlight={true}
                />
                <StatsCard
                  icon={<Users className="h-5 w-5" />}
                  title="Team Status"
                  value="3 members"
                  subtitle="out of office today"
                  actionText="View Team Calendar"
                />
                <StatsCard
                  icon={<MapPin className="h-5 w-5" />}
                  title="Open Positions"
                  value="1"
                  subtitle="in the Marketing department"
                  actionText="Review Candidates"
                />
                <StatsCard
                  icon={<FileText className="h-5 w-5" />}
                  title="Quick Reports"
                  value="Generate"
                  subtitle="one-click reports "
                  actionText="Go To Reports"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ActionCard
          icon={<Calendar className="h-5 w-5" />}
          title="Request Vacation"
          description="Plan your time off"
          href="/requests/vacation"
        />
        <ActionCard
          icon={<Plane className="h-5 w-5" />}
          title="Submit Business Trip"
          description="Travel request form"
          href="/requests/business-trip"
        />
        <ActionCard
          icon={<LineChart className="h-5 w-5" />}
          title="View Performance"
          description="Check your progress"
          href="/efficiency/performance-mng"
        />
        <ActionCard
          icon={<Users className="h-5 w-5" />}
          title="Access Directory"
          description="Find colleagues"
          href="/structure/headcount-table"
        />
      </div>

     {/* My Trainings Section */}
        {!loadingTrainings &&
          myTrainings &&
          getPendingTrainings().length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2
                  className={`text-base font-medium ${textPrimary} flex items-center gap-2`}
                >
                  <BookOpen
                    className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue"
                  />
                  My Training Progress
                </h2>
              </div>

              {/* Progress Bar */}
              <div
                className={`${bgCard} rounded-xl p-4 shadow-md border ${borderColor} mb-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className={`text-sm font-semibold ${textPrimary} mb-1`}>
                      Overall Training Progress
                    </h3>
                    <p className={`text-xs ${textMuted}`}>
                      {getTrainingStats().completedCount} of{" "}
                      {getTrainingStats().totalCount} trainings completed
                    </p>
                  </div>
                  <div className="text-xl font-bold text-almet-sapphire dark:text-almet-steel-blue">
                    {getTrainingStats().totalCount > 0
                      ? Math.round(
                          (getTrainingStats().completedCount /
                            getTrainingStats().totalCount) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className="w-full bg-almet-mystic dark:bg-almet-san-juan rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-almet-sapphire to-almet-astral transition-all duration-500 rounded-full"
                    style={{
                      width: `${
                        getTrainingStats().totalCount > 0
                          ? (getTrainingStats().completedCount /
                              getTrainingStats().totalCount) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Training Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPendingTrainings().map((assignment) => (
                  <OnboardingTrainingCard
                    key={assignment.id}
                    assignment={assignment}
                    darkMode={darkMode}
                    onClick={handleTrainingClick}
                  />
                ))}
              </div>
            </div>
          )}


     

      {/* Company Updates - REAL NEWS */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium text-almet-cloud-burst dark:text-white">
            Company Updates
          </h2>
          <Link 
            href="/communication/company-news" 
            className="text-almet-sapphire dark:text-almet-steel-blue flex items-center text-xs md:text-sm hover:underline transition-all duration-300 group"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loadingNews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-almet-cloud-burst rounded-lg overflow-hidden shadow animate-pulse border border-almet-mystic dark:border-almet-san-juan">
                <div className="h-40 bg-almet-mystic dark:bg-almet-san-juan"></div>
                <div className="p-4">
                  <div className="h-4 bg-almet-mystic dark:bg-almet-san-juan rounded mb-2"></div>
                  <div className="h-3 bg-almet-mystic dark:bg-almet-san-juan rounded mb-2"></div>
                  <div className="h-3 bg-almet-mystic dark:bg-almet-san-juan rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestNews.map((news) => (
              <NewsCard 
                key={news.id} 
                news={news} 
                darkMode={darkMode}
                onClick={() => handleNewsClick(news)}
              />
            ))}
          </div>
        ) : (
          <div className={`rounded-lg p-8 text-center border ${
            darkMode ? 'bg-almet-cloud-burst border-almet-san-juan' : 'bg-white border-almet-mystic'
          }`}>
            <FileText className={`h-12 w-12 mx-auto mb-3 ${
              darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'
            }`} />
            <h3 className={`text-sm font-semibold mb-1 ${
              darkMode ? 'text-white' : 'text-almet-cloud-burst'
            }`}>
              No News Available
            </h3>
            <p className={`text-xs ${
              darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'
            }`}>
              Check back later for company updates
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Celebrations */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium text-almet-cloud-burst dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Upcoming Celebrations
          </h2>
          <Link 
            href="/communication/celebrations" 
            className="text-almet-sapphire dark:text-almet-steel-blue flex items-center text-xs md:text-sm hover:underline transition-all duration-300 group"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loadingCelebrations ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-almet-cloud-burst rounded-xl overflow-hidden shadow-md animate-pulse border border-almet-mystic dark:border-almet-san-juan">
                <div className="h-20 bg-almet-mystic dark:bg-almet-san-juan"></div>
                <div className="p-4">
                  <div className="h-4 bg-almet-mystic dark:bg-almet-san-juan rounded mb-2"></div>
                  <div className="h-3 bg-almet-mystic dark:bg-almet-san-juan rounded mb-2"></div>
                  <div className="h-8 bg-almet-mystic dark:bg-almet-san-juan rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : upcomingCelebrations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingCelebrations.map((celebration) => (
              <CelebrationCard
                key={celebration.id}
                celebration={celebration}
                darkMode={darkMode}
                onCelebrate={handleCelebrate}
                isCelebrated={celebratedItems.has(celebration.id)}
                isToday={isCelebrationToday(celebration.date)}
              />
            ))}
          </div>
        ) : (
          <div className={`rounded-lg p-8 text-center border ${
            darkMode ? 'bg-almet-cloud-burst border-almet-san-juan' : 'bg-white border-almet-mystic'
          }`}>
            <Cake className={`h-12 w-12 mx-auto mb-3 ${
              darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'
            }`} />
            <h3 className={`text-sm font-semibold mb-1 ${
              darkMode ? 'text-white' : 'text-almet-cloud-burst'
            }`}>
              No Upcoming Celebrations
            </h3>
            <p className={`text-xs ${
              darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'
            }`}>
              Check back later for birthdays and anniversaries
            </p>
          </div>
        )}
      </div>

      {/* News Detail Modal */}
      <NewsDetailModal
        isOpen={showNewsModal}
        onClose={() => {
          setShowNewsModal(false);
          setSelectedNews(null);
        }}
        news={selectedNews}
        darkMode={darkMode}
      />

       {/* Training Detail Modal */}
      <AssignmentDetailModal
        show={showTrainingModal}
        assignment={selectedAssignment}
        onClose={() => {
          setShowTrainingModal(false);
          setSelectedAssignment(null);
        }}
        trainingService={trainingService}
        toast={toast}
        onUpdate={() => {
          loadMyTrainings();
        }}
        darkMode={darkMode}
        bgCard={bgCard}
        bgCardHover={darkMode ? "bg-almet-san-juan" : "bg-gray-50"}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        borderColor={borderColor}
      />
    </DashboardLayout>
  );
}