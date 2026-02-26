// src/components/headcount/HeadcountAccessControl.jsx - UPDATED with email matching
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldOff, 
  User, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { employeeService } from '@/services/newsService';

const HeadcountAccessControl = ({ children }) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const [accessInfo, setAccessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState(null);

  // Theme classes
  const bgPrimary = darkMode ? "bg-gray-900" : "bg-gray-50";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  useEffect(() => {
    checkAccess();
  }, []);

  const findEmployeeIdByEmail = async (userEmail) => {
    try {
      // Fetch employees with email search
      const response = await employeeService.getEmployees({ 
        search: userEmail,
        page_size: 10 
      });
      
      const employees = response.results || response.data?.results || response.data || [];
      
      // Find exact email match
      const matchedEmployee = employees.find(emp => 
        emp.email?.toLowerCase() === userEmail.toLowerCase() ||
        emp.user_email?.toLowerCase() === userEmail.toLowerCase() ||
        emp.work_email?.toLowerCase() === userEmail.toLowerCase()
      );
      
      if (matchedEmployee) {
        const employeeId = matchedEmployee.id || matchedEmployee.employee_id;
        console.log('✅ Found employee ID by email:', employeeId);
        return employeeId;
      }
      
      console.warn('⚠️ No employee found with email:', userEmail);
      return null;
      
    } catch (error) {
      console.error('Error finding employee by email:', error);
      return null;
    }
  };

 const checkAccess = async () => {
  try {
    const response = await employeeService.getEmployees({ page_size: 1 });
    
    const userEmail = localStorage.getItem('user_email');
    let employeeId = null;
    
    if (userEmail) {
      console.log('🔍 Searching employee by email:', userEmail);
      employeeId = await findEmployeeIdByEmail(userEmail);
      
      if (employeeId) {
        localStorage.setItem('employee_id', employeeId);
      }
    }
    
    // Check if response has access_info
    if (response.access_info) {
      setAccessInfo({
        hasAccess: true,
        isManager: response.access_info.is_manager || false,
        canViewAll: response.access_info.can_view_all || false,
        employeeId: employeeId
      });
    } else {
      setAccessInfo({
        hasAccess: true,
        isManager: false,
        canViewAll: false,
        employeeId: employeeId
      });
    }
  } catch (error) {
    if (error.error === "Access Denied") {
      const userEmail = localStorage.getItem('user_email');
      let employeeId = null;
      
      if (userEmail) {
        try {
          // Use getMyProfile without search parameters - it should return current user's profile
          const profileResponse = await employeeService.getMyProfile();
          
          console.log('Profile response:', profileResponse);
          
          // Based on your data structure, the response should have 'employee' object directly
          if (profileResponse.employee) {
            employeeId = profileResponse.employee.id;
            setCurrentUserEmployeeId(employeeId);
            localStorage.setItem('employee_id', employeeId);
          }
        } catch (e) {
          console.warn('Could not fetch employee for profile redirect:', e);
        }
      }
      
      setAccessInfo({
        hasAccess: false,
        reason: 'no_permission',
        employeeId: employeeId
      });
    } else {
      console.error('Access check failed:', error);
      setAccessInfo({
        hasAccess: false,
        reason: 'error'
      });
    }
  } finally {
    setLoading(false);
  }
};

  const handleGoToProfile = () => {
    const employeeId = currentUserEmployeeId || accessInfo?.employeeId;
    
    if (employeeId) {

      router.push(`/structure/employee/${employeeId}/`);
    } else {
      console.warn('⚠️ No employee ID found, redirecting to generic profile');

    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen  flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-gray-300 border-t-almet-sapphire rounded-full animate-spin" />
          </div>
          <p className={`${textSecondary} text-sm`}>Checking access...</p>
        </div>
      </div>
    );
  }

  // No access - Simple clean denial screen
  if (!accessInfo?.hasAccess) {
    return (
      <div className={`min-h-screen  flex items-center justify-center p-6`}>
        <div className={`max-w-lg w-full ${bgCard} rounded-lg shadow-lg border ${borderColor} p-8`}>
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <ShieldOff className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className={`${textPrimary} text-2xl font-bold text-center mb-3`}>
            Access Denied
          </h1>
          
          <p className={`${textSecondary} text-center mb-8`}>
            You don't have permission to view the Headcount Management system
          </p>

          {/* Info Box */}
          <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-5 border ${borderColor} mb-6`}>
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-almet-sapphire mt-0.5 flex-shrink-0" />
              <div>
                <p className={`${textPrimary} font-medium mb-2`}>
                  Required Access Level
                </p>
                <p className={`${textSecondary} text-sm mb-3`}>
                  This system is only accessible to:
                </p>
              </div>
            </div>
            
            <div className="space-y-2 ml-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-almet-sapphire rounded-full" />
                <span className={`${textSecondary} text-sm`}>Line Managers with direct reports</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-almet-sapphire rounded-full" />
                <span className={`${textSecondary} text-sm`}>HR Administrators</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleGoToProfile}
              className="w-full bg-almet-sapphire hover:bg-almet-astral text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 group"
            >
              <User className="w-5 h-5" />
              <span>Go to My Profile</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => router.back()}
              className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textPrimary} px-6 py-3 rounded-lg font-medium transition-colors duration-200`}
            >
              Go Back
            </button>
          </div>

          {/* Help Text */}
          <p className={`text-center ${textSecondary} text-xs mt-6`}>
            If you believe this is an error, please contact your HR administrator
          </p>
        </div>
      </div>
    );
  }

  // Has access - render children
  return children;
};

export default HeadcountAccessControl;