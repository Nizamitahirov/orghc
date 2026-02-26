"use client";
import { Calendar, Eye, ChevronRight, Cake, Award, Sparkles, MapPin, Briefcase, TrendingUp, Users, Building, X, FileText, Star } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useToast } from "@/components/common/Toast";
import { useState, useEffect } from "react";
import { newsService } from "@/services/newsService";
import celebrationService from "@/services/celebrationService";
import { useTheme } from "@/components/common/ThemeProvider";

// Featured News Component
const FeaturedNewsCard = ({ news, darkMode, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer group mb-6"
    >
      <div className="relative h-[340px] rounded-2xl overflow-hidden shadow-2xl border border-almet-mystic/50 dark:border-almet-san-juan/50">
        <img 
          src={news.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200'} 
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        
        {news.category_name && (
          <div className="absolute top-4 left-4 bg-almet-sapphire/90 dark:bg-almet-steel-blue/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg">
            {news.category_name}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="text-almet-steel-blue dark:text-almet-steel-blue text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
            Latest Update
          </span>
          <h2 className="text-white text-xl font-bold mb-2 leading-tight">
            {news.title}
          </h2>
          <p className="text-white/90 text-xs mb-3 line-clamp-2">
            {news.excerpt || news.content}
          </p>
          <div className="flex items-center gap-3 text-white/80 text-[10px]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(news.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {news.view_count} views
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Birthday Card Component
const BirthdayCard = ({ celebration, darkMode, onCelebrate, isCelebrated }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];
    
    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === tomorrowOnly) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = () => {
    const date = new Date(celebration.date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const todayCheck = isToday();

  return (
    <div className={`bg-white dark:bg-almet-cloud-burst rounded-xl p-4 shadow-lg border ${
      todayCheck 
        ? 'border-almet-sapphire dark:border-almet-steel-blue ring-2 ring-almet-sapphire/20 dark:ring-almet-steel-blue/20' 
        : 'border-almet-mystic/50 dark:border-almet-san-juan/50'
    } text-center relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      
      {todayCheck && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-almet-sapphire via-almet-astral to-almet-steel-blue rounded-t-xl"></div>
      )}
      
      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mx-auto mb-2.5 flex items-center justify-center text-white shadow-lg">
        🎂
      </div>
      
      <h4 className="font-bold text-xs text-almet-cloud-burst dark:text-white mb-0.5">
        {celebration.employee_name}
      </h4>
      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-2">
        {celebration.position}
      </p>
      
      <div className={`flex items-center justify-center gap-1 text-[10px] mb-3 px-2 py-1 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded-lg ${
        todayCheck 
          ? 'text-almet-sapphire dark:text-almet-steel-blue font-medium' 
          : 'text-almet-waterloo dark:text-almet-bali-hai'
      }`}>
        <Calendar className="h-3 w-3" />
        <span>{formatDate(celebration.date)}</span>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCelebrate(celebration);
        }}
        disabled={isCelebrated}
        className={`w-full py-2 rounded-lg text-[10px] font-semibold transition-all ${
          isCelebrated
            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-default'
            : 'bg-gradient-to-r from-almet-sapphire to-almet-astral text-white hover:from-almet-astral hover:to-almet-steel-blue shadow-lg hover:shadow-xl'
        }`}
      >
        {isCelebrated ? '✓ Wished' : '🎉 Send Wishes'}
      </button>
    </div>
  );
};

// Work Anniversary Item
const AnniversaryItem = ({ celebration, darkMode, onCelebrate, isCelebrated }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];
    
    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === tomorrowOnly) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = () => {
    const date = new Date(celebration.date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const todayCheck = isToday();

  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${
      todayCheck 
        ? 'border-almet-sapphire/30 dark:border-almet-steel-blue/30 bg-almet-sapphire/5 dark:bg-almet-steel-blue/5 px-2 rounded-lg -mx-2' 
        : 'border-almet-mystic dark:border-almet-comet'
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
          <Award className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-xs text-almet-cloud-burst dark:text-white">
              {celebration.employee_name}
            </h4>
            {todayCheck && (
              <span className="bg-almet-sapphire text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                Today
              </span>
            )}
          </div>
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
            {celebration.position}
          </p>
          <div className={`flex items-center gap-1 text-[9px] mt-0.5 ${
            todayCheck 
              ? 'text-almet-sapphire dark:text-almet-steel-blue font-medium' 
              : 'text-almet-waterloo dark:text-almet-bali-hai'
          }`}>
            <Calendar className="h-2.5 w-2.5" />
            <span>{formatDate(celebration.date)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-lg text-[10px] font-bold">
          {celebration.years} {celebration.years === 1 ? 'Year' : 'Years'}
        </span>
        {!isCelebrated && (
          <button
            onClick={() => onCelebrate(celebration)}
            className="text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire/10 dark:hover:bg-almet-steel-blue/10 p-1.5 rounded-lg transition-all"
          >
            🎉
          </button>
        )}
      </div>
    </div>
  );
};

// Promotion Item Component
const PromotionItem = ({ celebration, darkMode, onCelebrate, isCelebrated }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];
    
    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === tomorrowOnly) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = () => {
    const date = new Date(celebration.date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const todayCheck = isToday();

  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${
      todayCheck 
        ? 'border-green-500/30 dark:border-green-400/30 bg-green-50/50 dark:bg-green-900/10 px-2 rounded-lg -mx-2' 
        : 'border-almet-mystic dark:border-almet-comet'
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white shadow-md">
          <Star className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-xs text-almet-cloud-burst dark:text-white">
              {celebration.employee_name}
            </h4>
            {todayCheck && (
              <span className="bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                Today
              </span>
            )}
          </div>
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
            {celebration.position}
          </p>
          <div className={`flex items-center gap-1 text-[9px] mt-0.5 ${
            todayCheck 
              ? 'text-green-600 dark:text-green-400 font-medium' 
              : 'text-almet-waterloo dark:text-almet-bali-hai'
          }`}>
            <Calendar className="h-2.5 w-2.5" />
            <span>{formatDate(celebration.date)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg text-[10px] font-bold">
          Promoted
        </span>
        {!isCelebrated && (
          <button
            onClick={() => onCelebrate(celebration)}
            className="text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 p-1.5 rounded-lg transition-all"
          >
            🎉
          </button>
        )}
      </div>
    </div>
  );
};

// Vacancy Card Component
const VacancyCard = ({ darkMode }) => {
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-xl overflow-hidden shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50 min-w-[240px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <img 
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400" 
        alt="Job"
        className="w-full h-24 object-cover"
      />
      <div className="p-4">
        <h4 className="font-bold text-xs text-almet-cloud-burst dark:text-white mb-1">
          Senior UX Designer
        </h4>
        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai flex items-center gap-1 mb-3">
          <MapPin className="h-3 w-3" />
          Design Studio • Posted Dec 24
        </p>
        <Link href="/structure/open-positions">
          <button className="w-full bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 dark:from-almet-steel-blue/10 dark:to-almet-san-juan/20 text-almet-sapphire dark:text-almet-steel-blue hover:from-almet-sapphire hover:to-almet-astral hover:text-white dark:hover:from-almet-steel-blue dark:hover:to-almet-astral py-2 rounded-lg text-[10px] font-semibold transition-all shadow-lg hover:shadow-xl">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

// News List Item
const NewsListItem = ({ news, darkMode, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-start justify-between py-3 border-b border-almet-mystic dark:border-almet-comet last:border-0 cursor-pointer group hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 px-2 rounded-lg transition-all -mx-2"
    >
      <div className="flex-1">
        <h4 className="font-bold text-xs text-almet-cloud-burst dark:text-white mb-1 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
          {news.title}
        </h4>
        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai line-clamp-2 mb-1">
          {news.excerpt || news.content}
        </p>
        <span className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai flex items-center gap-1">
          <Calendar className="h-2.5 w-2.5" />
          {new Date(news.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

// Referral Widget Component
const ReferralWidget = ({ darkMode }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-almet-cloud-burst dark:to-almet-san-juan rounded-2xl overflow-hidden shadow-2xl border border-almet-mystic/30 dark:border-almet-san-juan/50">
      <div className="relative h-24 bg-gradient-to-br from-yellow-400 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 p-4">
          <h2 className="text-yellow-300 text-base font-extrabold uppercase tracking-wider">
            Inspector Gadget
          </h2>
        </div>
      </div>
      <div className="p-4 text-center">
        <p className="text-white/90 text-[10px] mb-3 leading-relaxed">
          Refer your talented friends to open positions and earn mystery rewards up to $1,500!
        </p>
        <button className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-2 text-[10px] rounded-xl transition-all shadow-lg hover:shadow-xl">
          Submit Referral
        </button>
      </div>
    </div>
  );
};

// News Detail Modal
const NewsDetailModal = ({ isOpen, onClose, news, darkMode }) => {
  if (!isOpen || !news) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
          darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
        } animate-slideUp`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72">
          <img
            src={news.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200'}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all hover:scale-110"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-5 left-5 right-5">
            {news.category_name && (
              <div className="bg-almet-sapphire text-white px-3 py-1 rounded-xl text-[10px] font-medium inline-flex items-center gap-1 mb-2 shadow-lg">
                <FileText size={12} />
                {news.category_name}
              </div>
            )}
            <h2 className="text-white text-xl font-bold mb-2">{news.title}</h2>
            <div className="flex items-center gap-3 text-white/90 text-xs">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(news.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {news.view_count} views
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {news.excerpt && (
            <p className="text-almet-sapphire dark:text-almet-steel-blue font-semibold text-sm mb-3 leading-relaxed">
              {news.excerpt}
            </p>
          )}
          <p className={`leading-relaxed whitespace-pre-line text-xs ${
            darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
          }`}>
            {news.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function GeneralWorkspace() {
  const { darkMode } = useTheme();
  const toast = useToast();
  
  const [allNews, setAllNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [workAnniversaries, setWorkAnniversaries] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loadingCelebrations, setLoadingCelebrations] = useState(true);
  const [celebratedItems, setCelebratedItems] = useState(new Set());
  
  const today = new Date().toISOString().split('T')[0];
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  useEffect(() => {
    loadAllNews();
    loadCelebrations();
    loadCelebratedItems();
  }, []);

  const loadAllNews = async () => {
    setLoadingNews(true);
    try {
      const response = await newsService.getNews({
        page: 1,
        page_size: 10,
        is_published: true,
        ordering: '-is_pinned,-published_at'
      });
      setAllNews(response.results || []);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const loadCelebrations = async () => {
    setLoadingCelebrations(true);
    try {
      const allCelebrations = await celebrationService.getAllCelebrations();
      
      const today = new Date().toISOString().split('T')[0];
      
      // Filter by type
      const birthdays = allCelebrations.filter(c => c.type === 'birthday');
      const anniversaries = allCelebrations.filter(c => c.type === 'work_anniversary');
      const promotionsList = allCelebrations.filter(c => c.type === 'promotion');
      
      // Sort function: today's first, then by date
      const sortByDateWithTodayFirst = (a, b) => {
        const dateA = new Date(a.date).toISOString().split('T')[0];
        const dateB = new Date(b.date).toISOString().split('T')[0];
        
        if (dateA === today && dateB !== today) return -1;
        if (dateB === today && dateA !== today) return 1;
        return new Date(dateA) - new Date(dateB);
      };
      
      // Sort all arrays
      birthdays.sort(sortByDateWithTodayFirst);
      anniversaries.sort(sortByDateWithTodayFirst);
      promotionsList.sort(sortByDateWithTodayFirst);
      
      setTodayBirthdays(birthdays.slice(0, 4));
      setWorkAnniversaries(anniversaries.slice(0, 4));
      setPromotions(promotionsList.slice(0, 4));
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
      await celebrationService.addAutoWish(
        celebration.employee_id,
        celebration.type,
        '🎉'
      );
      saveCelebratedItem(celebration.id);
      toast.showSuccess('Wishes sent successfully!');
    } catch (error) {
      console.error('Error celebrating:', error);
      toast.showError('Failed to send wishes');
    }
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

  const featuredNews = allNews[0];
  const otherNews = allNews.slice(1);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-5">
          {/* Featured News */}
          {!loadingNews && featuredNews && (
            <FeaturedNewsCard 
              news={featuredNews} 
              darkMode={darkMode}
              onClick={() => handleNewsClick(featuredNews)}
            />
          )}

          {/* Today's Birthdays */}
          {!loadingCelebrations && todayBirthdays.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <Cake className="h-4 w-4 text-pink-500" />
                  Upcoming Birthdays
                </h2>
                <Link href="/communication/celebrations" className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {todayBirthdays.map((celebration) => (
                  <BirthdayCard
                    key={celebration.id}
                    celebration={celebration}
                    darkMode={darkMode}
                    onCelebrate={handleCelebrate}
                    isCelebrated={celebratedItems.has(celebration.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Internal Vacancies */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <Briefcase className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
                Internal Vacancies
              </h2>
              <Link href="/structure/open-positions" className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline">
                View All
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              <VacancyCard darkMode={darkMode} />
              <VacancyCard darkMode={darkMode} />
            </div>
          </div>

          {/* More News */}
          {!loadingNews && otherNews.length > 0 && (
            <div className={`${bgCard} rounded-2xl p-5 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50`}>
              <h2 className={`text-sm font-bold ${textPrimary} mb-3`}>More News</h2>
              <div>
                {otherNews.slice(0, 5).map((news) => (
                  <NewsListItem
                    key={news.id}
                    news={news}
                    darkMode={darkMode}
                    onClick={() => handleNewsClick(news)}
                  />
                ))}
              </div>
              <Link href="/communication/company-news">
                <button className="w-full mt-3 bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 dark:from-almet-steel-blue/10 dark:to-almet-san-juan/20 text-almet-sapphire dark:text-almet-steel-blue hover:from-almet-sapphire hover:to-almet-astral hover:text-white dark:hover:from-almet-steel-blue dark:hover:to-almet-astral py-2.5 text-[10px] rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
                  View All Company News
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar - 1/3 width */}
        <div className="space-y-5">
          {/* Referral Widget */}
          <ReferralWidget darkMode={darkMode} />

          {/* Promotions */}
          {!loadingCelebrations && promotions.length > 0 && (
            <div className={`${bgCard} rounded-2xl p-4 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50`}>
              <h3 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                <Star className="h-4 w-4 text-green-500" />
                Team Promotions
              </h3>
              <div>
                {promotions.map((celebration) => (
                  <PromotionItem
                    key={celebration.id}
                    celebration={celebration}
                    darkMode={darkMode}
                    onCelebrate={handleCelebrate}
                    isCelebrated={celebratedItems.has(celebration.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Work Anniversaries */}
          {!loadingCelebrations && workAnniversaries.length > 0 && (
            <div className={`${bgCard} rounded-2xl p-4 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50`}>
              <h3 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                <Award className="h-4 w-4 text-purple-500" />
                Work Anniversaries
              </h3>
              <div>
                {workAnniversaries.map((celebration) => (
                  <AnniversaryItem
                    key={celebration.id}
                    celebration={celebration}
                    darkMode={darkMode}
                    onCelebrate={handleCelebrate}
                    isCelebrated={celebratedItems.has(celebration.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DashboardLayout>
  );
}