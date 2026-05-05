"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText, Network, UsersRound, BarChart2, Layers, Activity,
  Repeat, CalendarDays, AlarmClock, ShieldCheck, ListChecks,
  Boxes, PartyPopper, UserCog, Brain, List,
  ScrollText, LogOut, PlaneTakeoff, GraduationCap, ChevronRight, ChevronLeft,
  FileSignature, Megaphone, BookOpen, Coins, Lightbulb, PieChart, LineChart,
  UserPlus, Truck,
} from "lucide-react";
import { employeeService, newsService } from '@/services/newsService';
import { useLanguage } from '@/contexts/LanguageContext';

const Sidebar = ({ collapsed = false, toggleSidebar, isPinned = false, togglePin }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [employeeId, setEmployeeId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [newsUnreadCount, setNewsUnreadCount] = useState(0);
  const [logisticsLoading, setLogisticsLoading] = useState(false);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employee_id');
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    } else {
      fetchEmployeeId();
    }
    fetchUserRole();
    fetchNewsUnreadCount();
    const interval = setInterval(fetchNewsUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNewsUnreadCount = async () => {
    try {
      const count = await newsService.getUnreadCount();
      setNewsUnreadCount(count);
    } catch {
      // silent
    }
  };

  const fetchEmployeeId = async () => {
    try {
      const userEmail = localStorage.getItem('user_email');
      if (!userEmail) return;
      const profileResponse = await employeeService.getMyProfile();
      if (profileResponse.employee?.id) {
        const empId = profileResponse.employee.id;
        setEmployeeId(empId);
        localStorage.setItem('employee_id', empId);
      }
    } catch (error) {
      console.error('Error fetching employee ID:', error);
    }
  };

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
        if (data.is_admin)        setUserRole('admin');
        else if (data.is_manager) setUserRole('manager');
        else                      setUserRole('employee');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('employee');
    }
  };

  const handleLogisticsClick = async (e) => {
    e.preventDefault();
    setLogisticsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/generate-sso-token/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) throw new Error('Token alınmadı');
      const { redirect_url } = await res.json();
      window.open(redirect_url, '_blank');
    } catch (err) {
      console.error('Logistics SSO xətası:', err);
      alert('Logistika sistemine keçid mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setLogisticsLoading(false);
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (employeeId) {
      router.push(`/structure/employee/${employeeId}/`);
    } else {
      const storedId = localStorage.getItem('employee_id');
      if (storedId) router.push(`/structure/employee/${storedId}/`);
      else          router.push('/dashboard');
    }
  };

  const getFilteredMenuItems = () => {
    const allMenuItems = [

      { type: "section", label: t('sidebar.sections.structure') },
      {
        label: t('sidebar.items.orgStructure'),
        icon: <Network className="w-4 h-4" />,
        path: "/structure/org-structure",
        id: "org-structure"
      },
      {
        label: t('sidebar.items.headcountTable'),
        icon: <UsersRound className="w-4 h-4" />,
        path: "/structure/headcount-table",
        id: "headcount-table",
        requiredRole: ['admin', 'manager']
      },
      {
        label: t('sidebar.items.jobDescriptions'),
        icon: <FileText className="w-4 h-4" />,
        path: "/structure/job-descriptions",
        id: "job-descriptions",
        requiredRole: ['admin', 'manager']
      },
      {
        label: t('sidebar.items.competencyMatrix'),
        icon: <BarChart2 className="w-4 h-4" />,
        path: "/structure/comp-matrix",
        id: "comp-matrix"
      },
      {
        label: t('sidebar.items.jobCatalog'),
        icon: <ScrollText className="w-4 h-4" />,
        path: "/structure/job-catalog",
        id: "job-catalog",
        requiredRole: ['admin']
      },
      {
        label: t('sidebar.items.gradingSystem'),
        icon: <Layers className="w-4 h-4" />,
        path: "/structure/grading",
        id: "grading",
        requiredRole: ['admin']
      },

        { type: "section", label: t('sidebar.sections.analytics'), requiredRole: ['admin', 'manager'] },
      {
        label: t('sidebar.items.reports'),
        icon: <LineChart className="w-4 h-4" />,
        path: "/reports",
        id: "reports",
        requiredRole: ['admin']
      },
      {
        label: "Referrals",
        icon: <UserPlus className="w-4 h-4" />,
        path: "/hr-admin/referrals",
        id: "referrals",
        requiredRole: ['admin']
      },

      { type: "section", label: t('sidebar.sections.efficiency') },
      {
        label: t('sidebar.items.performanceMng'),
        icon: <Activity className="w-4 h-4" />,
        path: "/efficiency/performance-mng",
        id: "performance-mng"
      },
      {
        label: t('sidebar.items.bonus'),
        icon: <Coins className="w-4 h-4" />,
        path: "/bonus",
        id: "bonus",
        requiredRole: ['admin', 'manager']
      },
      {
        label: t('sidebar.items.tasksMng'),
        icon: <List className="w-4 h-4" />,
        path: "/efficiency/tasks",
        id: "my-tasks"
      },
      {
        label: t('sidebar.items.skillsMatrix'),
        icon: <Brain className="w-4 h-4" />,
        path: "/efficiency/self-assessment",
        id: "self-assessment",
        requiredRole: ['admin']
      },
      {
        label: t('sidebar.items.contractsProbation'),
        icon: <FileSignature className="w-4 h-4" />,
        path: "/efficiency/contracts",
        id: "contracts",
        requiredRole: ['admin', 'manager']
      },

      { type: "section", label: t('sidebar.sections.training') },
      {
        label: t('sidebar.items.training'),
        icon: <GraduationCap className="w-4 h-4" />,
        path: "/training",
        id: "training"
      },

      { type: "section", label: t('sidebar.sections.requests') },
      {
        label: t('sidebar.items.resignationOffboarding'),
        icon: <LogOut className="w-4 h-4" />,
        path: "/requests/resignation",
        id: "resignation"
      },
      {
        label: t('sidebar.items.vacationRequest'),
        icon: <CalendarDays className="w-4 h-4" />,
        path: "/requests/vacation",
        id: "vacation"
      },
      {
        label: t('sidebar.items.handoverTakeover'),
        icon: <Repeat className="w-4 h-4" />,
        path: "/requests/handover-takeover",
        id: "handover-takeover"
      },
      {
        label: t('sidebar.items.businessTrip'),
        icon: <PlaneTakeoff className="w-4 h-4" />,
        path: "/requests/business-trip",
        id: "business-trip"
      },
      {
        label: t('sidebar.items.timeOffRequest'),
        icon: <AlarmClock className="w-4 h-4" />,
        path: "/requests/time-off",
        id: "time-off"
      },

      { type: "section", label: t('sidebar.sections.communication') },
      {
        label: t('sidebar.items.companyNews'),
        icon: <Megaphone className="w-4 h-4" />,
        path: "/communication/company-news",
        id: "company-news"
      },
      {
        label: t('sidebar.items.celebrations'),
        icon: <PartyPopper className="w-4 h-4" />,
        path: "/communication/celebrations",
        id: "celebrations"
      },

      { type: "section", label: t('sidebar.sections.voiceFeedback') },
      {
        label: t('sidebar.items.suggestions'),
        icon: <Lightbulb className="w-4 h-4" />,
        path: "/suggestions/",
        id: "my-voice"
      },

      { type: "section", label: t('sidebar.sections.documents') },
      {
        label: t('sidebar.items.companyPolicies'),
        icon: <ShieldCheck className="w-4 h-4" />,
        path: "/company-policies",
        id: "policies"
      },
      {
        label: t('sidebar.items.procedures'),
        icon: <ListChecks className="w-4 h-4" />,
        path: "/company-procedures",
        id: "procedures"
      },
      {
        label: t('sidebar.items.guidelines'),
        icon: <BookOpen className="w-4 h-4" />,
        path: "/workspace/library/guidelines",
        id: "guidelines",
        isHighlighted: true
      },

    

      // { type: "section", label: "Xarici Sistemlər" },
      // {
      //   label: "Logistika",
      //   icon: <Truck className="w-4 h-4" />,
      //   id: "logistics",
      //   isLogistics: true,
      // },

      { type: "section", label: t('sidebar.sections.settings'), requiredRole: ['admin'] },
      {
        label: t('sidebar.items.assetManagement'),
        icon: <Boxes className="w-4 h-4" />,
        path: "/settings/asset-mng",
        id: "asset-mng",
        requiredRole: ['admin']
      },
      {
        label: t('sidebar.items.roleManagement'),
        icon: <UserCog className="w-4 h-4" />,
        path: "/settings/role-mng",
        id: "role-mng",
        requiredRole: ['admin']
      }
    ];

    return allMenuItems.filter(item => {
      if (item.type === "section") {
        if (item.requiredRole) return item.requiredRole.includes(userRole);
        return true;
      }
      if (!item.requiredRole) return true;
      return item.requiredRole.includes(userRole);
    });
  };

  const menuItems = getFilteredMenuItems();

  return (
    <div className="h-full bg-white/90 dark:bg-almet-cloud-burst/95 backdrop-blur-xl border-r border-gray-200/60 dark:border-white/[0.07] flex flex-col w-full relative shadow-lg shadow-black/[0.04] dark:shadow-black/20">

      {/* Logo area */}
      <Link
        href="/"
        className={`flex items-center justify-center ${collapsed ? '' : 'px-3'} py-2.5 border-b border-gray-200/60 dark:border-white/[0.07] group bg-gradient-to-r from-transparent via-almet-sapphire/[0.03] to-transparent dark:via-white/[0.02]`}
      >
        {collapsed ? (
          <div className="transform transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-md">
            <img src="/pdfs/logoSmall.png" alt="" className="h-6" />
          </div>
        ) : (
          <div className="flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md">
            <img src="/pdfs/logo.png" alt="Almet Logo" className="h-6" />
          </div>
        )}
      </Link>

      {/* Pin/Unpin button */}
      <button
        onClick={togglePin}
        className="absolute -right-3 top-8 z-50
          w-6 h-6 rounded-full
          bg-white/90 dark:bg-almet-cloud-burst/95
          backdrop-blur-sm
          border border-almet-sapphire/40 dark:border-almet-steel-blue/40
          flex items-center justify-center
          hover:scale-110 hover:border-almet-sapphire dark:hover:border-almet-steel-blue
          transition-all duration-200
          shadow-md shadow-black/10 hover:shadow-almet-sapphire/20
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-almet-sapphire focus-visible:ring-offset-1"
        aria-label={isPinned ? t('sidebar.unpinSidebar') : t('sidebar.pinSidebar')}
        title={isPinned ? t('sidebar.unpinSidebar') : t('sidebar.pinSidebar')}
      >
        {isPinned
          ? <ChevronLeft size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />
          : <ChevronRight size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />
        }
      </button>

      <div className="overflow-y-auto flex-1 py-1 scrollbar-thin scrollbar-track-transparent">
        <nav className="px-2">
          {menuItems.map((item, index) =>
            item.type === "section" ? (
              !collapsed && (
                <div key={index} className="pt-3 pb-1">
                  <p className="px-2 text-[9.5px] font-semibold text-gray-400 dark:text-white/25 uppercase tracking-widest">
                    {item.label}
                  </p>
                </div>
              )
            ) : item.isLogistics ? (
              <button
                key={index}
                onClick={handleLogisticsClick}
                disabled={logisticsLoading}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-1.5 text-xs font-medium rounded-lg my-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-almet-sapphire/60 focus-visible:ring-inset text-gray-600 dark:text-white/55 hover:bg-almet-sapphire/8 dark:hover:bg-white/5 hover:text-almet-sapphire dark:hover:text-white/90 disabled:opacity-50`}
                title={collapsed ? item.label : ''}
              >
                <div className="flex items-center gap-2">
                  <span className={`transition-all duration-200 text-gray-400 dark:text-white/35 group-hover:text-almet-sapphire dark:group-hover:text-white/70 ${hoveredItem === item.id ? 'scale-110' : ''}`}>
                    {logisticsLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : item.icon}
                  </span>
                  {!collapsed && <span>{logisticsLoading ? 'Yüklənir...' : item.label}</span>}
                </div>
                {!collapsed && (
                  <svg className="w-3 h-3 text-gray-400 dark:text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </button>
            ) : item.isProfile ? (
              <button
                key={index}
                onClick={handleProfileClick}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-1.5 text-xs font-medium rounded-lg my-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-almet-sapphire/60 focus-visible:ring-inset ${
                  pathname.includes('/structure/employee/') && employeeId && pathname.includes(employeeId)
                    ? "bg-gradient-to-r from-almet-sapphire to-almet-astral text-white shadow-md shadow-almet-sapphire/25 scale-[1.02]"
                    : "text-gray-600 dark:text-white/55 hover:bg-almet-sapphire/8 dark:hover:bg-white/5 hover:text-almet-sapphire dark:hover:text-white/90"
                }`}
                title={collapsed ? item.label : ''}
              >
                <div className="flex items-center gap-2">
                  <span className={`transition-all duration-200 ${
                    pathname.includes('/structure/employee/') && employeeId && pathname.includes(employeeId)
                      ? "text-white"
                      : "text-gray-400 dark:text-white/35 group-hover:text-almet-sapphire dark:group-hover:text-white/70"
                  } ${hoveredItem === item.id ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && (
                  <ChevronRight className={`w-3 h-3 transition-all duration-200 ${
                    pathname.includes('/structure/employee/') && employeeId && pathname.includes(employeeId)
                      ? 'opacity-70 translate-x-0'
                      : 'opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0'
                  }`} />
                )}
              </button>
            ) : (
              <Link
                key={index}
                href={item.path}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-1.5 text-xs font-medium rounded-lg my-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-almet-sapphire/60 focus-visible:ring-inset ${
                  item.isHighlighted
                    ? (pathname.startsWith(item.path)
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/25 scale-[1.02]"
                        : "bg-red-50/80 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100/80 dark:hover:bg-red-500/15 border border-red-200/60 dark:border-red-500/20")
                    : (pathname.startsWith(item.path)
                        ? "bg-gradient-to-r from-almet-sapphire to-almet-astral text-white shadow-md shadow-almet-sapphire/25 scale-[1.02]"
                        : "text-gray-600 dark:text-white/55 hover:bg-almet-sapphire/8 dark:hover:bg-white/5 hover:text-almet-sapphire dark:hover:text-white/90")
                }`}
                title={collapsed ? item.label : ''}
              >
                {/* Active left indicator */}
                {pathname.startsWith(item.path) && !item.isHighlighted && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-white/60" />
                )}
                <div className="flex items-center gap-2">
                  <span className={`transition-all duration-200 ${
                    item.isHighlighted
                      ? (pathname.startsWith(item.path) ? "text-white" : "text-red-500 dark:text-red-400")
                      : (pathname.startsWith(item.path) ? "text-white" : "text-gray-400 dark:text-white/35 group-hover:text-almet-sapphire dark:group-hover:text-white/70")
                  } ${hoveredItem === item.id ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className={item.isHighlighted && !pathname.startsWith(item.path) ? "font-semibold" : ""}>
                      {item.label}
                    </span>
                  )}
                  {item.id === 'company-news' && newsUnreadCount > 0 && (
                    <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center bg-red-500 text-white shadow-sm shadow-red-500/40`}>
                      {newsUnreadCount > 99 ? '99+' : newsUnreadCount}
                    </span>
                  )}
                </div>
                {!collapsed && item.id !== 'company-news' && (
                  <ChevronRight className={`w-3 h-3 transition-all duration-200 ${
                    pathname.startsWith(item.path)
                      ? 'opacity-60 translate-x-0'
                      : 'opacity-0 -translate-x-1 group-hover:opacity-35 group-hover:translate-x-0'
                  }`} />
                )}
                {!collapsed && item.id === 'company-news' && newsUnreadCount === 0 && (
                  <ChevronRight className={`w-3 h-3 transition-all duration-200 ${
                    pathname.startsWith(item.path)
                      ? 'opacity-60 translate-x-0'
                      : 'opacity-0 -translate-x-1 group-hover:opacity-35 group-hover:translate-x-0'
                  }`} />
                )}
              </Link>
            )
          )}
        </nav>
      </div>

    </div>
  );
};

export default Sidebar;
