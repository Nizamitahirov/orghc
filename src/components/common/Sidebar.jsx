"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText, 
  Network,
  UsersRound,
  BarChart2,
  Layers,
  Activity,
  Repeat,
  CalendarDays,
  AlarmClock,
  ShieldCheck,
  ListChecks,
  Boxes,
  PartyPopper,
  UserCog,
  Pin, PinOff,
  Brain,
  List,
  ScrollText,
  LogOut,
  PlaneTakeoff,
  GraduationCap,
  ChevronRight,
  FileSignature,
  Megaphone,
  BookOpen,
  Coins,
  Lightbulb,

} from "lucide-react";
import { employeeService } from '@/services/newsService';

const Sidebar = ({ collapsed = false, toggleSidebar, isPinned = false, togglePin }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employee_id');
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    } else {
      fetchEmployeeId();
    }
    
    fetchUserRole();
  }, []);

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

  const handleProfileClick = (e) => {
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
  const getFilteredMenuItems = () => {
    const allMenuItems = [
     
      { 
        type: "section", 
        label: "STRUCTURE"
      }, 
      {
        label: "Org Structure",
        icon: <Network  className="w-4 h-4" />,
        path: "/structure/org-structure",
        id: "org-structure"
      },
      // {
      //   label: "Finance Reports",
      //   icon: <BarChart2  className="w-4 h-4" />,
      //   path: "/finance",
      //   id: "finance-reports"
      // },
      {
        label: "Headcount Table",
        icon: <UsersRound  className="w-4 h-4" />,
        path: "/structure/headcount-table",
        id: "headcount-table",
        requiredRole: ['admin', 'manager']
      },
      {
        label: "Job Descriptions",
        icon: <FileText  className="w-4 h-4" />,
        path: "/structure/job-descriptions",
        id: "job-descriptions",
        requiredRole: ['admin', 'manager']
      },
      {
        label: "Competency Matrix",
        icon: <BarChart2   className="w-4 h-4" />,
        path: "/structure/comp-matrix",
        id: "comp-matrix"
      },
      {
        label: "Job Catalog",
        icon: <ScrollText   className="w-4 h-4" />,
        path: "/structure/job-catalog",
        id: "job-catalog",
        requiredRole: ['admin']
      },
      {
        label: "Grading System",
        icon: <Layers  className="w-4 h-4" />,
        path: "/structure/grading",
        id: "grading",
        requiredRole: ['admin']
      },
      { 
        type: "section", 
        label: "EFFICIENCY"
      },
      {
        label: "Performance Mng",
        icon: <Activity className="w-4 h-4" />,
        path: "/efficiency/performance-mng",
        id: "performance-mng"
      },
 
      {
        label: "Bonus",
        icon: <Coins className="w-4 h-4" />,
        path: "/bonus",
        id: "bonus",
            requiredRole: ['admin']
      },
      {
        label: "Tasks Mng",
        icon: <List className="w-4 h-4" />,
        path: "/efficiency/tasks",
        id: "my-tasks"
      },
      {
        label: "Skills Matrix",
        icon: <Brain  className="w-4 h-4" />,
        path: "/efficiency/self-assessment",
        id: "self-assessment",
        requiredRole: ['admin']
      },
      {
        label: "Contracts/Probation",
        icon: <FileSignature className="w-4 h-4" />,
        path: "/efficiency/contracts",
        id: "contracts",
        requiredRole: ['admin', 'manager']

      },
      { 
        type: "section", 
        label: "TRAINING"
      },
      {
        label: "Training",
        icon: <GraduationCap  className="w-4 h-4" />,
        path: "/training",
        id: "training"
      },
      { 
        type: "section", 
        label: "REQUESTS"
      },
      
      {
        label: "Resignation/Offboarding",
        icon: <LogOut  className="w-4 h-4" />,
        path: "/requests/resignation",
        id: "resignation",
   
      
      },
      {
        label: "Vacation Request",
        icon: <CalendarDays  className="w-4 h-4" />,
        path: "/requests/vacation",
        id: "vacation"
      },
      {
        label: "Handover/Takeover",
        icon: <Repeat className="w-4 h-4" />,
        path: "/requests/handover-takeover",
        id: "handover-takeover"
      },
      {
        label: "Business Trip",
        icon: <PlaneTakeoff className="w-4 h-4" />,
        path: "/requests/business-trip",
        id: "business-trip"
      },
      {
        label: "Time Off Request",
        icon: <AlarmClock className="w-4 h-4" />,
        path: "/requests/time-off",
        id: "time-off"
      },
      { 
        type: "section", 
        label: "COMMUNICATION"
      },
      {
        label: "Company News",
        icon: <Megaphone className="w-4 h-4" />,
        path: "/communication/company-news",
        id: "company-news"
      },
      {
        label: "Celebrations",
        icon: <PartyPopper className="w-4 h-4" />,
        path: "/communication/celebrations",
        id: "celebrations"
      }, 
      { 
        type: "section", 
        label: "VOICE & FEEDBACK"
      },
      {
        label: "Suggestions",
        icon: <Lightbulb className="w-4 h-4" />,
        path: "/suggestions/",
        id: "my-voice"
      },
    
      { 
        type: "section", 
        label: "DOCUMENTS"
      },
      {
        label: "Company Policies",
        icon: <ShieldCheck className="w-4 h-4" />,
        path: "/company-policies",
        id: "policies"
      }, 
      {
        label: "Procedures",
        icon: <ListChecks className="w-4 h-4" />,
        path: "/company-procedures",
        id: "procedures"
      },
      {
        label: "Guidelines",
        icon: <BookOpen className="w-4 h-4" />,
        path: "/workspace/library/guidelines",
        id: "guidelines",
        isHighlighted: true
      },
      { 
        type: "section", 
        label: "SETTINGS",
        requiredRole: ['admin']
      },
      {
        label: "Asset Management",
        icon: <Boxes  className="w-4 h-4" />,
        path: "/settings/asset-mng",
        id: "asset-mng",
        requiredRole: ['admin']
      },
      {
        label: "Role Management",
        icon: <UserCog className="w-4 h-4" />,
        path: "/settings/role-mng",
        id: "role-mng",
        requiredRole: ['admin']
      }
    ];

    return allMenuItems.filter(item => {
      if (item.type === "section") {
        // Show section if user has required role or no role required
        if (item.requiredRole) {
          return item.requiredRole.includes(userRole);
        }
        return true;
      }
      if (!item.requiredRole) return true;
      return item.requiredRole.includes(userRole);
    });
  };

  const menuItems = getFilteredMenuItems();

  return (
    <div className="h-full bg-white dark:bg-almet-cloud-burst border-r border-gray-200 dark:border-almet-comet flex flex-col w-full relative">
  
      <Link 
        href="/" 
        className={`flex items-center justify-center ${collapsed ? 'justify-center' : 'px-3'} py-2 border-b border-gray-200 dark:border-almet-comet group`}
      >
        {collapsed ? (
          <div className="transform transition-transform duration-300 group-hover:scale-110">
            <img src="/pdfs/logoSmall.png" alt="" className="h-6" /> 
          </div>
        ) : (
          <div className="flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
            <img src="/pdfs/logo.png" alt="Almet Logo" className="h-6" />
          </div>
        )}
      </Link>

      
<button
  onClick={togglePin}
  className="absolute -right-3 top-8 transform z-50
    w-6 h-6 rounded-full bg-white dark:bg-almet-cloud-burst
    border-2 border-almet-sapphire dark:border-almet-steel-blue
    flex items-center justify-center
    hover:scale-110 transition-all duration-300
    shadow-md hover:shadow-lg"
  aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
  title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
>
  {isPinned 
    ? <Pin size={12} className="text-almet-sapphire dark:text-almet-steel-blue fill-current" />
    : <PinOff size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />
  }
</button>
      
      <div className="overflow-y-auto flex-1 py-0 scrollbar-thin scrollbar-track-transparent">
        <nav className="px-2">
          {menuItems.map((item, index) => 
            item.type === "section" ? (
              !collapsed && (
                <div key={index} className="pt-3 pb-1">
                  <p className="px-3 text-[10px] font-medium text-gray-500 dark:text-almet-santas-gray uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              )
            ) : item.isProfile ? (
              <button
                key={index}
                onClick={handleProfileClick}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-1.5 text-xs font-medium rounded-md my-0.5 transition-all duration-300 group ${
                  pathname.includes('/structure/employee/') && employeeId && pathname.includes(employeeId)
                    ? "bg-[#5975af] text-white shadow-md transform scale-[1.02]" 
                    : "text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet hover:shadow-sm"
                }`}
                title={collapsed ? item.label : ''}
              >
                <div className="flex items-center gap-2">
                  <span className={`transition-all duration-300 ${
                    pathname.includes('/structure/employee/') && employeeId && pathname.includes(employeeId)
                      ? "text-white" 
                      : "text-gray-500 dark:text-gray-400"
                  } ${hoveredItem === item.id ? 'transform scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
                
                {!collapsed && (
                  <ChevronRight className={`w-3.5 h-3.5 transition-all duration-300 ${
                    pathname.includes('/structure/employee/') && employeeId && pathname.includes(employeeId)
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'
                  }`} />
                )}
              </button>
            ) : (
              <Link 
                key={index}
                href={item.path}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-1.5 text-xs font-medium rounded-md my-0.5 transition-all duration-300 group ${
                  item.isHighlighted 
                    ? (pathname.startsWith(item.path)
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md transform scale-[1.02]"
                        : "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30 hover:shadow-sm border border-red-200 dark:border-red-800/50")
                    : (pathname.startsWith(item.path) 
                        ? "bg-[#5975af] text-white shadow-md transform scale-[1.02]" 
                        : "text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet hover:shadow-sm")
                }`}
                title={collapsed ? item.label : ''}
              >
                <div className="flex items-center gap-2">
                  <span className={`transition-all duration-300 ${
                    item.isHighlighted
                      ? (pathname.startsWith(item.path) ? "text-white" : "text-red-600 dark:text-red-400")
                      : (pathname.startsWith(item.path) ? "text-white" : "text-gray-500 dark:text-gray-400")
                  } ${hoveredItem === item.id ? 'transform scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className={item.isHighlighted && !pathname.startsWith(item.path) ? "font-semibold" : ""}>{item.label}</span>}
                </div>
                
                {!collapsed && (
                  <ChevronRight className={`w-3.5 h-3.5 transition-all duration-300 ${
                    pathname.startsWith(item.path) 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'
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