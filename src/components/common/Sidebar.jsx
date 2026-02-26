"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  UsersRound,
  FileText, 
  BarChart2,
  GraduationCap,
  Activity,
  CalendarDays,
  Plane,
  Newspaper,
  Gift,
  Package,
  RefreshCw,
  UserCog,
  Building2,
  Clock,
  ScrollText,
  BookOpenCheck,
  User,
  ChevronRight,
  FileSignature,
  Target
} from "lucide-react";
import { employeeService } from '@/services/newsService';

const Sidebar = ({ collapsed = false }) => {
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
        icon: <Building2 className="w-4 h-4" />,
        path: "/structure/org-structure",
        id: "org-structure"
      },
      {
        label: "Headcount Table",
        icon: <UsersRound className="w-4 h-4" />,
        path: "/structure/headcount-table",
        id: "headcount-table",
        requiredRole: ['admin', 'manager']
      },
      {
        label: "Job Descriptions",
        icon: <FileText className="w-4 h-4" />,
        path: "/structure/job-descriptions",
        id: "job-descriptions",
        requiredRole: ['admin', 'manager']
      },
      {
        label: "Competency Matrix",
        icon: <BarChart2 className="w-4 h-4" />,
        path: "/structure/comp-matrix",
        id: "comp-matrix"
      },
      {
        label: "Job Catalog",
        icon: <ScrollText className="w-4 h-4" />,
        path: "/structure/job-catalog",
        id: "job-catalog",
        requiredRole: ['admin']
      },
      {
        label: "Grading System",
        icon: <GraduationCap className="w-4 h-4" />,
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
        label: "Skills Matrix",
        icon: <Target className="w-4 h-4" />,
        path: "/efficiency/self-assessment",
        id: "self-assessment",
        requiredRole: ['admin']
      },
      { 
        type: "section", 
        label: "TRAINING"
      },
      {
        label: "Training",
        icon: <BookOpenCheck className="w-4 h-4" />,
        path: "/training",
        id: "training"
      },
      { 
        type: "section", 
        label: "REQUESTS"
      },
      
      {
        label: "Resignation & Offboarding",
        icon: <FileText className="w-4 h-4" />,
        path: "/requests/resignation",
        id: "resignation",
      
      },
      {
        label: "Vacation Request",
        icon: <CalendarDays className="w-4 h-4" />,
        path: "/requests/vacation",
        id: "vacation"
      },
      {
        label: "Handover/Takeover",
        icon: <RefreshCw className="w-4 h-4" />,
        path: "/requests/handover-takeover",
        id: "handover-takeover"
      },
      {
        label: "Business Trip",
        icon: <Plane className="w-4 h-4" />,
        path: "/requests/business-trip",
        id: "business-trip"
      },
      {
        label: "Time Off Request",
        icon: <Clock className="w-4 h-4" />,
        path: "/requests/time-off",
        id: "time-off"
      },
      { 
        type: "section", 
        label: "COMMUNICATION"
      },
      {
        label: "Company News",
        icon: <Newspaper className="w-4 h-4" />,
        path: "/communication/company-news",
        id: "company-news"
      },
      {
        label: "Celebrations",
        icon: <Gift className="w-4 h-4" />,
        path: "/communication/celebrations",
        id: "celebrations"
      }, 
      { 
        type: "section", 
        label: "DOCUMENTS"
      },
      {
        label: "Company Policies",
        icon: <ScrollText className="w-4 h-4" />,
        path: "/company-policies",
        id: "policies"
      }, 
      {
        label: " Procedures",
        icon: <FileText className="w-4 h-4" />,
        path: "/company-procedures",
        id: "procedures"
      }, 
      { 
        type: "section", 
        label: "SETTINGS",
        requiredRole: ['admin']
      },
      {
        label: "Asset Management",
        icon: <Package className="w-4 h-4" />,
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
      if (item.type === "section") return true;
      if (!item.requiredRole) return true;
      return item.requiredRole.includes(userRole);
    });
  };

  const menuItems = getFilteredMenuItems();

return (
    <div className="h-full bg-white dark:bg-almet-cloud-burst border-r border-gray-200 dark:border-almet-comet flex flex-col w-full">
{/*   
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
      </Link> */}
  <Link 
        href="/" 
        className={`flex items-center justify-center ${collapsed ? 'justify-center' : 'px-3'} py-2 border-b border-gray-200 dark:border-almet-comet group`}
      >
 
        {collapsed ? (
        <div className="bg-almet-sapphire transform transition-transform duration-300 group-hover:scale-110 text-white h-8 w-8 rounded flex items-center justify-center font-bold mr-2">
          UP
        </div>
         ) : (
        <div className="text-gray-800 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105 dark:text-white font-semibold">
         UP Intranet
        </div>
          )}
    
    </Link>

      
      
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
                  pathname.startsWith(item.path) 
                    ? "bg-[#5975af] text-white shadow-md transform scale-[1.02]" 
                    : "text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet hover:shadow-sm"
                }`}
                title={collapsed ? item.label : ''}
              >
                <div className="flex items-center gap-2">
                  <span className={`transition-all duration-300 ${
                    pathname.startsWith(item.path) 
                      ? "text-white" 
                      : "text-gray-500 dark:text-gray-400"
                  } ${hoveredItem === item.id ? 'transform scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
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