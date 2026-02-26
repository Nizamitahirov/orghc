"use client";
import { Calendar, User, Target, Plane, Clock, CheckCircle, TrendingUp, Bell, UserCheck, MapPin, FileText, Eye, ChevronRight, X, Cake, Award, Sparkles, BookOpen, Download, ExternalLink, Briefcase, Shield, Laptop, FileCheck, Zap, BarChart3, Umbrella, Mail } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useToast } from "@/components/common/Toast";
import { useAuth } from "@/auth/AuthContext";
import { useState, useEffect } from "react";
import { newsService } from "@/services/newsService";
import celebrationService from "@/services/celebrationService";
import trainingService from "@/services/trainingService";
import handoverService from "@/services/handoverService"; // ƏLAVƏ EDİLDİ
import OnboardingTrainingCard from "@/components/training/OnboardingTrainingCard";
import AssignmentDetailModal from "@/components/training/AssignmentDetailModal";
import { useTheme } from "@/components/common/ThemeProvider";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation"; // Əlavə edin
// Profile Card Component
const ProfileCard = ({ account, userDetails, darkMode }) => {
  const router = useRouter();
  const pathname = usePathname(); // Əlavə edin
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    // Employee ID-ni localStorage-dən və ya account-dan götür
    const storedEmployeeId = localStorage.getItem('employee_id');
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    } else if (account?.employee?.id) {
      setEmployeeId(account.employee.id);
      localStorage.setItem('employee_id', account.employee.id);
    }
  }, [account]);

  const getUserInitials = () => {
    if (account?.first_name && account?.last_name) {
      return `${account.first_name.charAt(0)}${account.last_name.charAt(0)}`.toUpperCase();
    }
    if (account?.name) {
      const names = account.name.split(' ');
      return names.length > 1 
        ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
        : names[0].charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (account?.name) return account.name;
    if (account?.first_name && account?.last_name) {
      return `${account.first_name} ${account.last_name}`;
    }
    return 'User';
  };

  const handleZhooshClick = () => {
    window.open('https://portal.zhooshbenefits.co.uk/login', '_blank');
  };

  const handleViewProfile = (e) => {
    e.preventDefault();
    
    if (employeeId) {
      router.push(`/structure/employee/${employeeId}/`);
    } else {
      const storedId = localStorage.getItem('employee_id');
      if (storedId) {
        router.push(`/structure/employee/${storedId}/`);
      } else {
        router.push('/dashboard');
      }
    }
  };

  // Check if user's business function is UK
  const getBusinessFunction = () => {
    if (!userDetails) return null;
    

    // Object with name property
    if (userDetails.employee.business_function_detail?.name) {
      return userDetails.employee.business_function_detail.name;
    }
    
    // Object with code property
    if (userDetails.employee.business_function_detail?.code) {
      return userDetails.employee.business_function_detail.code;
    }
    
    return null;
  };

  const businessFunction = getBusinessFunction();
  const isUKBusinessFunction = businessFunction?.toUpperCase() === 'UK';

  // Check if current path is the employee profile
  const isProfileActive = pathname.includes('/structure/employee/') && 
                          employeeId && 
                          pathname.includes(employeeId);

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl overflow-hidden shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      {/* Banner */}
      <div className="h-20 bg-gradient-to-br from-almet-sapphire via-almet-astral to-almet-steel-blue"></div>
      
      {/* Avatar */}
      <div className="px-5 pb-5 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center font-bold text-xl shadow-lg -mt-8 mx-auto border-4 border-white dark:border-almet-cloud-burst">
          {getUserInitials()}
        </div>
        
        <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white mt-3 mb-1">
          {getUserName()}
        </h3>
        
        {/* View Full Profile Button - Sidebar kimi davranış */}
        <button 
          onClick={handleViewProfile}
          className={`w-full mb-2 font-semibold py-2.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-2 group ${
            isProfileActive
              ? "bg-[#5975af] text-white shadow-md"
              : "bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 dark:from-almet-steel-blue/10 dark:to-almet-san-juan/20 hover:from-almet-sapphire hover:to-almet-astral dark:hover:from-almet-steel-blue dark:hover:to-almet-astral text-almet-cloud-burst dark:text-white hover:text-white"
          }`}
        >
          <User className={`h-3 w-3 transition-transform ${
            isProfileActive ? "" : "group-hover:scale-110"
          }`} />
          View Full Profile
        </button>

        {/* Zhoosh Up Profile Button - Only visible for UK business function */}
        {isUKBusinessFunction && (
          <button 
            onClick={handleZhooshClick}
            className="w-full bg-almet-mystic/30 dark:bg-almet-san-juan/30 hover:bg-almet-mystic/50 dark:hover:bg-almet-san-juan/50 text-almet-cloud-burst dark:text-white font-semibold py-2 rounded-lg text-[10px] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="h-3 w-3" />
            Zhoosh  Profile
          </button>
        )}
      </div>
    </div>
  );
};

// Vacation Tracker Card
const VacationTrackerCard = ({ darkMode }) => {
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-5 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-xs text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <Umbrella className="h-3 w-3 text-orange-500" />
          Vacation Tracker
        </h3>
        <button className="text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-sapphire dark:hover:text-almet-steel-blue">
          <FileText className="h-3 w-3" />
        </button>
      </div>
      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-3">
        Allocated for 2025: 34 Days
      </p>
      
      <div className="flex justify-around border-t border-almet-mystic dark:border-almet-comet pt-3 mb-3">
        <div className="text-center">
          <div className="text-xl font-bold text-almet-sapphire dark:text-almet-steel-blue">4</div>
          <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai uppercase">Used</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">30</div>
          <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai uppercase">Balance</p>
        </div>
      </div>
      
      <Link href="/requests/vacation">
        <button className="w-full bg-almet-sapphire hover:bg-almet-astral text-white font-semibold py-2 rounded-lg text-[10px] transition-all">
          + Request Time Off
        </button>
      </Link>
    </div>
  );
};

// Quick Operations Card - Redesigned

const QuickOperationsCard = ({ darkMode }) => {

  const actions = [

    {

      icon: Plane,

      label: 'Business Trip',

      href: '/requests/business-trip',

      color: 'from-blue-500 to-blue-600',

      bgColor: 'bg-blue-100 dark:bg-blue-900/20'

    },

    {

      icon: Target,

      label: 'Performance',

      href: '/efficiency/performance-mng',

      color: 'from-purple-500 to-purple-600',

      bgColor: 'bg-purple-100 dark:bg-purple-900/20'

    },

    {

      icon: BookOpen,

      label: 'Trainings',

      href: '/training',

      color: 'from-green-500 to-green-600',

      bgColor: 'bg-green-100 dark:bg-green-900/20'

    },

  ];



  return (

   

         <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-5 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <h3 className="font-bold text-xs text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
        <Zap className="h-3 w-3 text-almet-sapphire dark:text-almet-steel-blue" />
        Quick Operations
      </h3>

   

     

      <div className="space-y-2">

        {actions.map((action, index) => (

          <Link key={index} href={action.href}>

            <button className="w-full mb-2 group bg-almet-mystic/30 dark:bg-almet-san-juan/30 hover:bg-gradient-to-r hover:from-almet-sapphire/10 hover:to-almet-astral/10 dark:hover:from-almet-steel-blue/10 dark:hover:to-almet-san-juan/20 border border-transparent hover:border-almet-sapphire/20 dark:hover:border-almet-steel-blue/20 text-almet-cloud-burst dark:text-white font-medium py-3 px-4 rounded-xl text-[10px] transition-all flex items-center gap-3">

              <div className={`w-8 h-8 rounded-lg ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>

                <action.icon className="h-3 w-3 text-current" />

              </div>

              <span className="flex-1 text-left">{action.label}</span>

              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />

            </button>

          </Link>

        ))}

      </div>

    </div>

  );

};

// Stats Card Component  
const StatsCard = ({ icon: Icon, title, value, subtitle, color, darkMode }) => {
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-4 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h4 className="text-[10px] font-semibold text-almet-waterloo dark:text-almet-bali-hai mb-1">
        {title}
      </h4>
      <div className="flex items-baseline justify-between">
        <div className="text-xl font-bold text-almet-cloud-burst dark:text-white">{value}</div>
        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">{subtitle}</p>
      </div>
    </div>
  );
};

// Featured News - Enhanced
const FeaturedNewsCarousel = ({ news, darkMode, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-almet-cloud-burst rounded-2xl overflow-hidden shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50 cursor-pointer group hover:shadow-2xl transition-all duration-300 h-80"
    >
      <div className="relative h-full">
        <img 
          src={news?.image_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800'} 
          alt="News"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="bg-almet-sapphire/90 dark:bg-almet-steel-blue/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-3 inline-flex items-center gap-2 w-fit">
            <Sparkles className="h-3 w-3" />
            Featured
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-almet-steel-blue transition-colors">
            {news?.title || 'Innovation Lab Grant for 2026'}
          </h2>
          
          <p className="text-white/90 text-xs mb-3 line-clamp-2">
            {news?.excerpt || 'Propose your breakthrough ideas and win funding for internal implementation.'}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/80 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {news ? new Date(news.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Dec 26, 2025'}
            </span>
            <div className="flex items-center gap-2 text-white/80 text-[10px]">
              <Eye className="h-3 w-3" />
              <span>{news?.view_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CelebrationMiniCard = ({ celebration, darkMode, onCelebrate, isCelebrated, isToday }) => {
  const getIcon = () => {
    if (celebration.type === 'birthday') return <Cake className="h-3 w-3" />;
    if (celebration.type === 'work_anniversary') return <Award className="h-3 w-3" />;
    return null;
  };

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

  return (
    <div className={`bg-white dark:bg-almet-cloud-burst rounded-xl p-3 border ${
      isToday 
        ? 'border-almet-sapphire dark:border-almet-steel-blue ring-2 ring-almet-sapphire/20 dark:ring-almet-steel-blue/20 shadow-lg' 
        : 'border-almet-mystic dark:border-almet-san-juan shadow-md'
    } transition-all duration-300 hover:shadow-xl relative`}>
      
      {isToday && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-almet-sapphire via-almet-astral to-almet-steel-blue rounded-t-xl"></div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          celebration.type === 'birthday' 
            ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
            : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
        }`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xs text-almet-cloud-burst dark:text-white truncate">
            {celebration.employee_name}
          </h4>
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai truncate">
            {celebration.position}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2 px-2 py-1 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded-lg">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-almet-waterloo dark:text-almet-bali-hai" />
          <span className={`text-[10px] font-medium ${
            isToday 
              ? 'text-almet-sapphire dark:text-almet-steel-blue' 
              : 'text-almet-waterloo dark:text-almet-bali-hai'
          }`}>
            {formatDate(celebration.date)}
          </span>
        </div>
        <span className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
          {celebration.type === 'birthday' ? 'Birthday' : `${celebration.years} Year${celebration.years !== 1 ? 's' : ''}`}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onCelebrate(celebration);
        }}
        disabled={isCelebrated}
        className={`w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
          isCelebrated
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-default'
            : 'bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue'
        }`}
      >
        {isCelebrated ? (
          <>
            <CheckCircle className="h-3 w-3" />
            Sent
          </>
        ) : (
          <>🎉 Wish</>
        )}
      </button>
    </div>
  );
};

// News Detail Modal
const NewsDetailModal = ({ isOpen, onClose, news, darkMode }) => {
  if (!isOpen || !news) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
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
            src={news.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200'}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-5 left-5 right-5">
            {news.category_name && (
              <div className="bg-almet-sapphire text-white px-3 py-1 rounded-xl text-[10px] font-medium inline-flex items-center gap-1 mb-2">
                <FileText size={12} />
                {news.category_name}
              </div>
            )}
            <h2 className="text-white text-xl font-bold mb-2">{news.title}</h2>
            <div className="flex items-center gap-3 text-white/90 text-xs">
              <span>{new Date(news.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {news.view_count} views
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {news.excerpt && (
            <p className="text-almet-sapphire dark:text-almet-steel-blue font-semibold text-base mb-3">
              {news.excerpt}
            </p>
          )}
          <p className={`leading-relaxed whitespace-pre-line text-sm ${
            darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
          }`}>
            {news.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function PersonalArea() {
  const { account } = useAuth();
  const { darkMode } = useTheme();
  const toast = useToast();
  const router = useRouter();
  
  const [latestNews, setLatestNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  
  const [upcomingCelebrations, setUpcomingCelebrations] = useState([]);
  const [loadingCelebrations, setLoadingCelebrations] = useState(true);
  const [celebratedItems, setCelebratedItems] = useState(new Set());
  
  const [myTrainings, setMyTrainings] = useState(null);
  const [loadingTrainings, setLoadingTrainings] = useState(true);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // YENİ: User details state
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  useEffect(() => {
    loadLatestNews();
    loadUpcomingCelebrations();
    loadCelebratedItems();
    loadMyTrainings();

      loadUserDetails();
  
  }, []);

  // YENİ: Load user details function
  const loadUserDetails = async () => {
   
    
    
    try {
      const userData = await handoverService.getUser();
   
      setUserDetails(userData);
    
    } catch (error) {
      console.error('Failed to load user details:', error);
    } 
  };



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
      await celebrationService.addAutoWish(
        celebration.employee_id,
        celebration.type,
        '🎉'
      );
      saveCelebratedItem(celebration.id);
      loadUpcomingCelebrations();
    } catch (error) {
      console.error('Error celebrating:', error);
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
      const data = await trainingService.assignments.getById(assignment.id);
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

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Sidebar - Profile & Tools */}
        <div className="lg:col-span-3 space-y-5">
           <ProfileCard 
            account={account} 
            userDetails={userDetails} 
            darkMode={darkMode} 
          />
          <VacationTrackerCard darkMode={darkMode} />
          <QuickOperationsCard darkMode={darkMode} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-6 space-y-5">
          {/* Daily Spotlight */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-bold ${textPrimary}`}>Daily Spotlight</h2>
              <Link href="/communication/company-news" className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline">
                See all updates
              </Link>
            </div>
            {!loadingNews && latestNews.length > 0 && (
              <FeaturedNewsCarousel 
                news={latestNews[0]} 
                darkMode={darkMode}
                onClick={() => handleNewsClick(latestNews[0])}
              />
            )}
          </div>

          {/* My Training Progress */}
          {!loadingTrainings && myTrainings && getPendingTrainings().length > 0 && (
            <div className={`${bgCard} rounded-2xl p-5 shadow-lg border ${borderColor}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <BookOpen className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
                  My Training Progress
                </h2>
                <Link href="/training/my-trainings" className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline">
                  View All
                </Link>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${textSecondary}`}>
                    {getTrainingStats().completedCount} of {getTrainingStats().totalCount} trainings completed
                  </span>
                  <span className="text-base font-bold text-almet-sapphire dark:text-almet-steel-blue">
                    {getTrainingStats().totalCount > 0
                      ? Math.round((getTrainingStats().completedCount / getTrainingStats().totalCount) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-almet-mystic dark:bg-almet-san-juan rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-almet-sapphire to-almet-astral transition-all duration-500 rounded-full"
                    style={{
                      width: `${
                        getTrainingStats().totalCount > 0
                          ? (getTrainingStats().completedCount / getTrainingStats().totalCount) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Training Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>

        {/* Right Sidebar - Stats & Celebrations */}
        <div className="lg:col-span-3 space-y-5">
          <StatsCard
            icon={TrendingUp}
            title="Workflow Tasks"
            value="5"
            subtitle="Active"
            color="bg-green-500"
            darkMode={darkMode}
          />

          {/* Celebrations */}
          {/* {!loadingCelebrations && upcomingCelebrations.length > 0 && (
            <div className={`${bgCard} rounded-2xl p-4 shadow-lg border ${borderColor}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-bold ${textPrimary} flex items-center gap-2`}>
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  Celebrations
                </h3>
                <Link href="/communication/celebrations" className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {upcomingCelebrations.slice(0, 3).map((celebration) => (
                  <CelebrationMiniCard
                    key={celebration.id}
                    celebration={celebration}
                    darkMode={darkMode}
                    onCelebrate={handleCelebrate}
                    isCelebrated={celebratedItems.has(celebration.id)}
                    isToday={isCelebrationToday(celebration.date)}
                  />
                ))}
              </div>
            </div>
          )} */}

          {/* Feedback Echo Card */}
          <div className={`${bgCard} rounded-2xl p-5 shadow-lg border ${borderColor} text-center`}>
            <div className="w-10 h-10 bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bell className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <h4 className={`font-bold text-sm ${textPrimary} mb-1`}>My Voice</h4>
            <p className={`text-[10px] ${textSecondary} mb-3`}>
              Your innovative ideas and feedback help us improve our global culture.
            </p>
            <button className="w-full bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue text-almet-sapphire dark:text-almet-steel-blue font-semibold py-2 rounded-lg text-[10px] transition-all">
              + Create Suggestion
            </button>
          </div>

          {/* Letter to Board Card */}
          <div className={`${bgCard} rounded-2xl p-5 shadow-lg border ${borderColor} text-center`}>
            <div className="w-10 h-10 bg-purple-500/10 dark:bg-purple-400/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className={`font-bold text-sm ${textPrimary} mb-1`}>Letter to Board</h4>
            <p className={`text-[10px] ${textSecondary} mb-3`}>
              A direct line of communication for confidential board-level inquiries.
            </p>
            <button className="w-full bg-purple-500/10 dark:bg-purple-400/10 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-500 text-purple-600 dark:text-purple-400 font-semibold py-2 rounded-lg text-[10px] transition-all">
              Write to Board
            </button>
          </div>
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