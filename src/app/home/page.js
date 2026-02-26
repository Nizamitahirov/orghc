// src/app/(dashboard)/page.jsx - UPDATED WITH TASKS SECTION

"use client";
import { Calendar, User, Target, Plane, Clock, CheckCircle, TrendingUp, Bell, UserCheck, MapPin, FileText, Eye, ChevronRight, X, Cake, Award, Sparkles, BookOpen, Download, ExternalLink, Briefcase, Shield, Laptop, FileCheck, Zap, BarChart3, Umbrella, Mail, ChevronLeft, Network, UsersRound, BarChart2, Layers, Activity, Brain, ScrollText, LogOut, PlaneTakeoff, GraduationCap, FileSignature, Megaphone, PartyPopper, ShieldCheck, ListChecks, Boxes, UserCog, Repeat, AlarmClock, ArrowRight, TrendingDown, Calendar as CalendarIcon, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer, CloudDrizzle, CloudFog, List, CheckCircle2, AlertCircle, Circle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useToast } from "@/components/common/Toast";
import { useAuth } from "@/auth/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { newsService } from "@/services/newsService";
import trainingService from "@/services/trainingService";
import handoverService from "@/services/handoverService";
import { VacationService } from "@/services/vacationService";
import taskService from "@/services/taskService";
import OnboardingTrainingCard from "@/components/training/OnboardingTrainingCard";
import AssignmentDetailModal from "@/components/training/AssignmentDetailModal";
import { useTheme } from "@/components/common/ThemeProvider";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import MyVoiceModal from "@/components/suggestions/MyVoiceModal";
import BoardLetterModal from "@/components/suggestions/BoardLetterModal";

const GreetingHeader = ({ account, darkMode, userDetails }) => {
  const [weatherData, setWeatherData] = useState({ baku: null, london: null });
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAllWeather();
  }, []);

  const fetchAllWeather = async () => {
    setLoadingWeather(true);
    try {
      const [bakuRes, londonRes] = await Promise.allSettled([
        fetch('https://api.open-meteo.com/v1/forecast?latitude=40.4093&longitude=49.8671&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Asia/Baku'),
        fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Europe/London')
      ]);

      const baku = bakuRes.status === 'fulfilled' ? await bakuRes.value.json() : null;
      const london = londonRes.status === 'fulfilled' ? await londonRes.value.json() : null;

      setWeatherData({ baku, london });
    } catch (error) {
      console.error('Weather fetch failed:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFirstName = () => {
    if (account?.first_name) return account.first_name;
    if (account?.name) return account.name.split(' ')[0];
    return 'there';
  };

  const getWeatherIcon = (code) => {
    if (code === undefined || code === null) return <Sun className="h-5 w-5" />;
    if (code === 0) return <Sun className="h-5 w-5 text-yellow-500" />;
    if (code <= 3) return <Cloud className="h-5 w-5 text-gray-400" />;
    if (code <= 49) return <CloudFog className="h-5 w-5 text-gray-400" />;
    if (code <= 59) return <CloudDrizzle className="h-5 w-5 text-sky-400" />;
    if (code <= 69) return <CloudRain className="h-5 w-5 text-sky-500" />;
    if (code <= 79) return <CloudSnow className="h-5 w-5 text-sky-200" />;
    if (code <= 82) return <CloudRain className="h-5 w-5 text-sky-600" />;
    if (code <= 86) return <CloudSnow className="h-5 w-5 text-sky-300" />;
    if (code <= 99) return <CloudLightning className="h-5 w-5 text-yellow-600" />;
    return <Cloud className="h-5 w-5 text-gray-400" />;
  };

  const getWeatherDescription = (code) => {
    if (code === undefined || code === null) return 'N/A';
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Cloudy';
    if (code <= 49) return 'Foggy';
    if (code <= 59) return 'Drizzle';
    if (code <= 69) return 'Rain';
    if (code <= 79) return 'Snow';
    if (code <= 82) return 'Showers';
    if (code <= 86) return 'Snow';
    if (code <= 99) return 'Storm';
    return 'N/A';
  };

  const getMotivationalText = () => {
    const day = currentTime.getDay();
    const texts = [
      "",
      "Start your week strong!",
      "Keep the momentum going!",
      "You're halfway there!",
      "Push through, you've got this!",
      "Almost weekend, finish strong!",
      "Happy Friday! Wrap it up!",
      "Enjoy your weekend rest!",
      "Recharge for the week ahead!"
    ];
    return texts[day];
  };

  const renderWeatherCard = (data, city, flag) => {
    if (!data?.current) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-almet-mystic/30 dark:bg-almet-san-juan/20 rounded-xl">
          <span className="text-sm">{flag}</span>
          <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{city}: N/A</span>
        </div>
      );
    }

    const current = data.current;
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-almet-san-juan/30 backdrop-blur-sm rounded-xl border border-almet-mystic/50 dark:border-almet-san-juan/50">
        <span className="text-base">{flag}</span>
        <div className="flex items-center gap-2">
          {getWeatherIcon(current.weather_code)}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-almet-cloud-burst dark:text-white">
                {Math.round(current.temperature_2m)}°C
              </span>
              <span className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
                {getWeatherDescription(current.weather_code)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-almet-waterloo dark:text-almet-bali-hai">
              <span className="flex items-center gap-0.5">
                <Wind className="h-2.5 w-2.5" />
                {Math.round(current.wind_speed_10m)} km/h
              </span>
              <span className="flex items-center gap-0.5">
                <Droplets className="h-2.5 w-2.5" />
                {current.relative_humidity_2m}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-almet-sapphire via-almet-astral to-almet-steel-blue rounded-2xl p-4 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">
              {getGreeting()}, {getFirstName()}! 👋
            </h1>
            <p className="text-white text-sm mb-1">{getMotivationalText()}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {loadingWeather ? (
              <>
                <div className="h-12 w-48 bg-white/20 rounded-xl animate-pulse"></div>
                <div className="h-12 w-48 bg-white/20 rounded-xl animate-pulse"></div>
              </>
            ) : (
              <>
                {renderWeatherCard(weatherData.baku, 'Baku', '🇦🇿')}
                {renderWeatherCard(weatherData.london, 'London', '🇬🇧')}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileCard = ({ account, userDetails, darkMode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
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

  const getBusinessFunction = () => {
    if (!userDetails) return null;
    if (userDetails.employee.business_function_detail?.name) {
      return userDetails.employee.business_function_detail.name;
    }
    if (userDetails.employee.business_function_detail?.code) {
      return userDetails.employee.business_function_detail.code;
    }
    return null;
  };

  const businessFunction = getBusinessFunction();
  const isUKBusinessFunction = businessFunction?.toUpperCase() === 'UK';
  const isProfileActive = pathname.includes('/structure/employee/') && 
                          employeeId && 
                          pathname.includes(employeeId);

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl overflow-hidden shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className="h-20 bg-gradient-to-br from-almet-sapphire via-almet-astral to-almet-steel-blue"></div>
      <div className="px-5 pb-5 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center font-bold text-xl shadow-lg -mt-8 mx-auto border-4 border-white dark:border-almet-cloud-burst">
          {getUserInitials()}
        </div>
        <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white mt-3 mb-1">
          {getUserName()}
        </h3>


<button 
  onClick={handleViewProfile}
  className={`w-full mb-2 font-semibold py-2.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-2 group ${
    isProfileActive
      ? "bg-[#5975af] text-white shadow-md"
      : "bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 dark:from-almet-steel-blue/10 dark:to-almet-san-juan/20 hover:from-almet-sapphire hover:to-almet-astral dark:hover:from-almet-steel-blue dark:hover:to-almet-astral text-almet-cloud-burst dark:text-white hover:text-white"
  }`}
>
  <User className="h-3 w-3" />
  View Full Profile
</button>

{isUKBusinessFunction && (
  <div className="flex flex-col gap-1.5">
    <button 
      onClick={handleZhooshClick}
      className="w-full bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 dark:from-almet-steel-blue/10 dark:to-almet-san-juan/20 hover:from-almet-sapphire hover:to-almet-astral dark:hover:from-almet-steel-blue dark:hover:to-almet-astral text-almet-cloud-burst dark:text-white hover:text-white font-semibold py-2.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-2 group"
    >
      <Sparkles className="h-3 w-3" />
      Zhoosh Profile
    </button>
    <button 
      onClick={() => window.open('https://www.IMHRplusprivilege.co.uk', '_blank')}
      className="w-full bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 dark:from-almet-steel-blue/10 dark:to-almet-san-juan/20 hover:from-almet-sapphire hover:to-almet-astral dark:hover:from-almet-steel-blue dark:hover:to-almet-astral text-almet-cloud-burst dark:text-white hover:text-white font-semibold py-2.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-2 group"
    >
      <Award className="h-3 w-3" />
      IMHRplus Privilege
    </button>
  </div>
)}
      </div>
    </div>
  );
};

const VacationTrackerCard = ({ darkMode, vacationData, loading }) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-5 shadow-lg border border-almet-mystic dark:border-almet-san-juan animate-pulse">
        <div className="h-20 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded"></div>
      </div>
    );
  }

  const balance = vacationData?.balance || {};
  const usedPercentage = balance.yearly_balance > 0 
    ? Math.round((balance.used_days / balance.yearly_balance) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-5 shadow-lg border border-almet-mystic dark:border-almet-san-juan group hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <Umbrella className="h-4 w-4 text-orange-500" />
          Vacation Tracker
        </h3>
        <button 
          onClick={() => router.push('/requests/vacation')}
          className="text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors"
        >
          <FileText className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-4">
        Allocated for {new Date().getFullYear()}: {balance.yearly_balance || 0} Days
      </p>
      <div className="flex items-center justify-center mb-2">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="48" stroke="currentColor" strokeWidth="8" fill="none" className="text-almet-mystic dark:text-almet-san-juan" />
            <circle cx="64" cy="64" r="48" stroke="url(#vacGradient)" strokeWidth="8" fill="none" strokeDasharray={`${(usedPercentage / 100) * 301.59} 301.59`} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
            <defs>
              <linearGradient id="vacGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5975AF" />
                <stop offset="100%" stopColor="#7B93C7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-almet-sapphire dark:text-almet-steel-blue">
              {balance.remaining_balance || 0}
            </span>
            <span className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">days left</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-almet-mystic dark:border-almet-comet pt-3 mb-3">
        <div className="text-center">
          <div className="text-sm font-bold text-orange-600 dark:text-orange-400">{balance.used_days || 0}</div>
          <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai uppercase">Used</p>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-sky-600 dark:text-sky-400">{balance.scheduled_days || 0}</div>
          <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai uppercase">Planned</p>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-green-600 dark:text-green-400">{balance.available_for_planning || 0}</div>
          <p className="text-[9px] text-almet-waterloo dark:text-almet-bali-hai uppercase">Available</p>
        </div>
      </div>
      <Link href="/requests/vacation">
        <button className="w-full bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-sapphire text-white font-semibold py-2.5 rounded-xl text-[10px] transition-all transform group-hover:scale-105 flex items-center justify-center gap-2">
          <Plane className="h-3 w-3" />
          Request Vacation
        </button>
      </Link>
    </div>
  );
};

const EnterpriseSystemsHub = ({ darkMode, userRole }) => {
  const systems = [
    {
      category: "STRUCTURE",
      items: [
        { icon: Network, label: "Org Structure", path: "/structure/org-structure" },
        { icon: UsersRound, label: "Headcount", path: "/structure/headcount-table", requiredRole: ['admin', 'manager'] },
        { icon: FileText, label: "Job Descriptions", path: "/structure/job-descriptions", requiredRole: ['admin', 'manager'] },
        { icon: BarChart2, label: "Competency Matrix", path: "/structure/comp-matrix" },
        { icon: ScrollText, label: "Job Catalog", path: "/structure/job-catalog", requiredRole: ['admin'] },
        { icon: Layers, label: "Grading System", path: "/structure/grading", requiredRole: ['admin'] },
      ]
    },
    {
      category: "EFFICIENCY",
      items: [
        { icon: Activity, label: "Performance", path: "/efficiency/performance-mng" },
        { icon: List, label: "Tasks Mng", path: "/efficiency/tasks" },
        { icon: Brain, label: "Skills Matrix", path: "/efficiency/self-assessment", requiredRole: ['admin'] },
        { icon: FileSignature, label: "Contracts", path: "/efficiency/contracts", requiredRole: ['admin', 'manager'] },
      ]
    },
    {
      category: "TRAINING",
      items: [
        { icon: GraduationCap, label: "Training", path: "/training" },
      ]
    },
    {
      category: "REQUESTS",
      items: [
        { icon: LogOut, label: "Resignation", path: "/requests/resignation", requiredRole: ['admin'] },
        { icon: CalendarIcon, label: "Vacation", path: "/requests/vacation" },
        { icon: Repeat, label: "Handover", path: "/requests/handover-takeover" },
        { icon: PlaneTakeoff, label: "Business Trip", path: "/requests/business-trip" },
        { icon: AlarmClock, label: "Time Off", path: "/requests/time-off" },
      ]
    },
    {
      category: "COMMUNICATION",
      items: [
        { icon: Megaphone, label: "Company News", path: "/communication/company-news" },
        { icon: PartyPopper, label: "Celebrations", path: "/communication/celebrations" },
      ]
    },
    {
      category: "SETTINGS",
      items: [
        { icon: Boxes, label: "Asset Management", path: "/settings/asset-mng", requiredRole: ['admin'] },
        { icon: UserCog, label: "Role Management", path: "/settings/role-mng", requiredRole: ['admin'] },
      ]
    }
  ];

  const visibleItems = systems.flatMap(s => s.items).filter(item => {
    if (!item.requiredRole) return true;
    return item.requiredRole.includes(userRole);
  });

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-base text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
          Enterprise Systems
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {visibleItems.map((item, index) => (
          <Link key={index} href={item.path}>
            <div className="group relative bg-almet-mystic/20 dark:bg-almet-san-juan/20 hover:bg-almet-sapphire/10 dark:hover:bg-almet-steel-blue/10 border border-almet-mystic/50 dark:border-almet-san-juan/50 hover:border-almet-sapphire/50 dark:hover:border-almet-steel-blue/50 rounded-xl p-3 transition-all duration-300 cursor-pointer hover:shadow-md">
              <div className="w-8 h-8 rounded-xl bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 group-hover:bg-almet-sapphire dark:group-hover:bg-almet-steel-blue flex items-center justify-center mb-3 transition-all duration-300">
                <item.icon className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue group-hover:text-white transition-colors" />
              </div>
              <p className="text-xs font-semibold text-almet-cloud-burst dark:text-white leading-tight">
                {item.label}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const NewsCarousel = ({ news, darkMode, onClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (news.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [news.length]);

  if (!news || news.length === 0) return null;
  const currentNews = news[currentIndex];

  return (
    <div className="relative">
      <div 
        onClick={() => onClick(currentNews)}
        className="bg-white dark:bg-almet-cloud-burst rounded-2xl overflow-hidden shadow-lg border border-almet-mystic dark:border-almet-san-juan cursor-pointer group hover:shadow-xl transition-all duration-300 h-80"
      >
        <div className="relative h-full">
          <img 
            src={currentNews?.image_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800'} 
            alt={currentNews?.title || "News"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            key={currentIndex}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h2 className="text-xl font-bold text-white mb-2 leading-tight">
              {currentNews?.title || 'Innovation Lab Grant for 2026'}
            </h2>
            <p className="text-white/90 text-xs mb-3 line-clamp-2">
              {currentNews?.excerpt || 'Propose your breakthrough ideas and win funding for internal implementation.'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/80 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {currentNews ? new Date(currentNews.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Dec 26, 2025'}
              </span>
              <div className="flex items-center gap-2 text-white/80 text-[10px]">
                <Eye className="h-3 w-3" />
                <span>{currentNews?.view_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {news.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + news.length) % news.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-almet-cloud-burst/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-almet-cloud-burst transition-all z-10"
          >
            <ChevronLeft className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % news.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-almet-cloud-burst/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-almet-cloud-burst transition-all z-10"
          >
            <ChevronRight className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {news.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};



const ActionCard = ({ icon: Icon, title, description, buttonText, onClick, color = "sapphire" }) => {
  const colorClasses = {
    sapphire: {
      bg: "bg-almet-sapphire/10 dark:bg-almet-steel-blue/10",
      icon: "text-almet-sapphire dark:text-almet-steel-blue",
      button: "bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue text-almet-sapphire dark:text-almet-steel-blue"
    },
    purple: {
      bg: "bg-purple-500/10 dark:bg-purple-400/10",
      icon: "text-purple-600 dark:text-purple-400",
      button: "bg-purple-500/10 dark:bg-purple-400/10 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-500 text-purple-600 dark:text-purple-400"
    }
  };
  const styles = colorClasses[color];

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-4 shadow-lg border border-almet-mystic dark:border-almet-san-juan text-center group hover:shadow-xl transition-all">
      <div className={`w-10 h-10 ${styles.bg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className={`h-5 w-5 ${styles.icon}`} />
      </div>
      <h4 className="font-bold text-sm text-almet-cloud-burst dark:text-white mb-2">{title}</h4>
      <p className="text-[11px] text-almet-waterloo dark:text-almet-bali-hai mb-4">{description}</p>
      <button 
        onClick={onClick}
        className={`w-full ${styles.button} font-semibold py-2.5 rounded-xl text-[11px] transition-all`}
      >
        {buttonText}
      </button>
    </div>
  );
};

const NewsDetailModal = ({ isOpen, onClose, news, darkMode }) => {
  if (!isOpen || !news) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72">
          <img
            src={news.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200'}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all">
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
              <span className="flex items-center gap-1"><Eye size={12} />{news.view_count} views</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {news.excerpt && (
            <p className="text-almet-sapphire dark:text-almet-steel-blue font-semibold text-base mb-3">{news.excerpt}</p>
          )}
          <p className={`leading-relaxed whitespace-pre-line text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}`}>{news.content}</p>
        </div>
      </div>
    </div>
  );
};

const TrainingProgressSection = ({ 
  hasPendingTrainings, myTrainings, 
  getPendingTrainings, getTrainingStats, handleTrainingClick,
  darkMode, bgCard, textPrimary, textSecondary, borderColor 
}) => {
  if (!hasPendingTrainings) return null;

  const stats = getTrainingStats();
  const percentage = stats.totalCount > 0 
    ? Math.round((stats.completedCount / stats.totalCount) * 100) 
    : 0;

  return (
    <div className={`${bgCard} rounded-2xl p-6 shadow-lg border ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
          <BookOpen className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
          My Training Progress
        </h2>
        <Link href="/training/my-trainings" className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${textSecondary}`}>
            {stats.completedCount} of {stats.totalCount} trainings completed
          </span>
          <span className="text-sm font-bold text-almet-sapphire dark:text-almet-steel-blue">{percentage}%</span>
        </div>
        <div className="w-full bg-almet-mystic dark:bg-almet-san-juan rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-almet-sapphire to-almet-astral transition-all duration-500 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {getPendingTrainings().map((assignment) => (
          <OnboardingTrainingCard key={assignment.id} assignment={assignment} darkMode={darkMode} onClick={handleTrainingClick} />
        ))}
      </div>
    </div>
  );
};

// NEW: My Tasks Overview Section
const MyTasksOverview = ({ darkMode }) => {
  const router = useRouter();
  const { showError } = useToast();
  const [taskStats, setTaskStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getMyTasks();
      if (response.success) {
        setTaskStats(response.stats);
        // Get recent 4 tasks (2 assigned to me, 2 created by me)
        const assigned = response.assignedToMe?.slice(0, 2) || [];
        const created = response.createdByMe?.slice(0, 2) || [];
        setRecentTasks([...assigned, ...created].slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      showError('Failed to load task overview');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'TODO': return Circle;
      case 'IN_PROGRESS': return Clock;
      case 'IN_REVIEW': return Eye;
      case 'COMPLETED': return CheckCircle2;
      default: return Circle;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'TODO': return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
      case 'IN_PROGRESS': return 'text-sky-500 bg-sky-100 dark:bg-sky-900/20';
      case 'IN_REVIEW': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20';
      case 'COMPLETED': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'LOW': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'URGENT': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded w-1/3"></div>
          <div className="h-20 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
          My Tasks Overview
        </h2>
        <Link href="/efficiency/tasks" className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Stats */}
      {taskStats && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{taskStats.todo || 0}</div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">To Do</p>
          </div>
          <div className="text-center p-2 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
            <div className="text-lg font-bold text-sky-600 dark:text-sky-400">{taskStats.in_progress || 0}</div>
            <p className="text-[10px] text-sky-600 dark:text-sky-400 uppercase">In Progress</p>
          </div>
          <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{taskStats.in_review || 0}</div>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase">In Review</p>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{taskStats.completed || 0}</div>
            <p className="text-[10px] text-green-600 dark:text-green-400 uppercase">Completed</p>
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="space-y-3">
        {recentTasks.length > 0 ? (
          recentTasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            return (
              <div
                key={task.id}
                onClick={() => router.push('/efficiency/tasks')}
                className="p-3 bg-almet-mystic/20 dark:bg-almet-san-juan/20 hover:bg-almet-mystic/40 dark:hover:bg-almet-san-juan/40 rounded-xl border border-almet-mystic/50 dark:border-almet-san-juan/50 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors flex-1">
                    {task.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${getStatusColor(task.status)}`}>
                    <StatusIcon className="h-3 w-3" />
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div >
            
          </div>
        )}
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
  
  const [myTrainings, setMyTrainings] = useState(null);
  const [loadingTrainings, setLoadingTrainings] = useState(true);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [userDetails, setUserDetails] = useState(null);
  const [vacationData, setVacationData] = useState(null);
  const [loadingVacation, setLoadingVacation] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const [showMyVoiceModal, setShowMyVoiceModal] = useState(false);
  const [showBoardLetterModal, setShowBoardLetterModal] = useState(false);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  useEffect(() => {
    loadLatestNews();
    loadMyTrainings();
    loadUserDetails();
    loadVacationData();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job-descriptions/my_access_info/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.is_admin) {
          setUserRole('admin');
        } else if (data.is_manager) {
          setUserRole('manager');
        } else {
          setUserRole('employee');
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('employee');
    }
  };

  const loadUserDetails = async () => {
    try {
      const userData = await handoverService.getUser();
      setUserDetails(userData);
    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  };

  const loadVacationData = async () => {
    setLoadingVacation(true);
    try {
      const data = await VacationService.getDashboard();
      setVacationData(data);
    } catch (error) {
      console.error('Failed to load vacation data:', error);
    } finally {
      setLoadingVacation(false);
    }
  };

  const loadLatestNews = async () => {
    setLoadingNews(true);
    try {
      const response = await newsService.getNews({
        page: 1, page_size: 5, is_published: true, ordering: '-is_pinned,-published_at'
      });
      setLatestNews(response.results || []);
    } catch (error) {
      console.error('Failed to load latest news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleNewsClick = async (news) => {
    try {
      const fullNews = await newsService.getNewsById(news.id);
      setSelectedNews(fullNews);
      setShowNewsModal(true);
    } catch (error) {
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
      toast.showError("Failed to load training details");
    }
  };

  const getPendingTrainings = () => {
    if (!myTrainings?.assignments) return [];
    return myTrainings.assignments.filter((a) => a.status !== "COMPLETED").slice(0, 3);
  };

  const getTrainingStats = () => {
    if (!myTrainings?.summary) return { completedCount: 0, totalCount: 0 };
    return { completedCount: myTrainings.summary.completed, totalCount: myTrainings.summary.total };
  };

  const hasPendingTrainings = !loadingTrainings && myTrainings && getPendingTrainings().length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <GreetingHeader account={account} darkMode={darkMode} userDetails={userDetails} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <div className="lg:col-span-3 space-y-5">
            <ProfileCard account={account} userDetails={userDetails} darkMode={darkMode} />
            <VacationTrackerCard darkMode={darkMode} vacationData={vacationData} loading={loadingVacation} />
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${textPrimary}`}>Daily Spotlight</h2>
                <Link href="/communication/company-news" className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline flex items-center gap-1">
                  See all updates <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {!loadingNews && latestNews.length > 0 && (
                <NewsCarousel news={latestNews} darkMode={darkMode} onClick={handleNewsClick} />
              )}
            </div>

            {/* NEW: My Tasks Overview */}
            <MyTasksOverview darkMode={darkMode} />
          </div>

          <div className="lg:col-span-3 space-y-5">
   
            <ActionCard
              icon={Bell} 
              title="My Voice"
              description="Your innovative ideas and feedback help us improve our global culture."
              buttonText="+ Create Suggestion" 
              onClick={() => setShowMyVoiceModal(true)}
              color="sapphire"
            />
            <ActionCard
              icon={Mail} 
              title="Letter to Board"
              description="A direct line of communication for confidential board-level inquiries."
              buttonText="Write to Board" 
              onClick={() => setShowBoardLetterModal(true)}
              color="purple"
            />
          </div>
        </div>

        <TrainingProgressSection
          hasPendingTrainings={hasPendingTrainings}
          myTrainings={myTrainings}
          getPendingTrainings={getPendingTrainings}
          getTrainingStats={getTrainingStats}
          handleTrainingClick={handleTrainingClick}
          darkMode={darkMode} bgCard={bgCard}
          textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor}
        />

        <EnterpriseSystemsHub darkMode={darkMode} userRole={userRole} />
      </div>

      <MyVoiceModal
        show={showMyVoiceModal}
        onClose={() => setShowMyVoiceModal(false)}
        onSuccess={() => {
          toast.showSuccess("Suggestion submitted successfully!");
          setShowMyVoiceModal(false);
        }}
      />

      <BoardLetterModal
        show={showBoardLetterModal}
        onClose={() => setShowBoardLetterModal(false)}
        onSuccess={(trackingNumber) => {
          toast.showSuccess(`Letter sent! Tracking number: ${trackingNumber}`);
          setShowBoardLetterModal(false);
        }}
      />

      <NewsDetailModal
        isOpen={showNewsModal}
        onClose={() => { setShowNewsModal(false); setSelectedNews(null); }}
        news={selectedNews} darkMode={darkMode}
      />
      
      <AssignmentDetailModal
        show={showTrainingModal}
        assignment={selectedAssignment}
        onClose={() => { setShowTrainingModal(false); setSelectedAssignment(null); }}
        trainingService={trainingService} toast={toast}
        onUpdate={() => loadMyTrainings()}
        darkMode={darkMode} bgCard={bgCard}
        bgCardHover={darkMode ? "bg-almet-san-juan" : "bg-gray-50"}
        textPrimary={textPrimary} textSecondary={textSecondary}
        textMuted={textMuted} borderColor={borderColor}
      />
    </DashboardLayout>
  );
}