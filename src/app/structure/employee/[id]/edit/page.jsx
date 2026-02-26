"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import Link from "next/link";
import { Provider } from "react-redux";
import { store } from "@/store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeForm from "@/components/headcount/EmployeeForm";
import { useTheme } from "@/components/common/ThemeProvider";
import { useEmployees } from "@/hooks/useEmployees";

/**
 * Edit Employee Page with API Integration
 */
const EditEmployeePageContent = () => {
  const { id } = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const { fetchEmployee, currentEmployee, loading, error, clearCurrentEmployee } = useEmployees();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Fetch employee data
  useEffect(() => {
    if (id) {
      fetchEmployee(id);
    }
    
    return () => {
      clearCurrentEmployee();
    };
  }, [id, fetchEmployee, clearCurrentEmployee]);

  // Handle successful form submission
  const handleSuccess = (updatedEmployee) => {
    router.push(`/structure/employee/${id}`);
  };

  // Handle form cancellation
  const handleCancel = () => {
    router.push(`/structure/employee/${id}`);
  };

  // Loading state
  if (loading.employee) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="w-16 h-16 text-almet-sapphire animate-spin mb-4" />
          <p className={`${textPrimary} text-lg font-medium`}>Loading employee data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error.employee || !currentEmployee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`${bgCard} rounded-lg border border-red-300 dark:border-red-700 p-6 shadow-md`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                Error Loading Employee
              </h3>
              <p className="mt-2 text-red-700 dark:text-red-400">
                {error.employee || "Employee not found"}
              </p>
              <div className="mt-4">
                <Link
                  href="/structure/headcount-table"
                  className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Headcount Table
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-0">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-6">
        <div >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>
                Edit Employee
              </h1>
              <p className={`text-sm ${textMuted} mt-1`}>
                Editing information for: <span className="font-medium text-almet-sapphire dark:text-almet-steel-blue">{currentEmployee.name}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/structure/employee/${id}`}
                className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Profile
              </Link>
              <Link
                href="/structure/headcount-table"
                className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Headcount Table
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render the Employee Form in edit mode */}
      <EmployeeForm 
        employee={currentEmployee} 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default function EditEmployeePage() {
  return (
    <DashboardLayout>
      <Provider store={store}>
        <EditEmployeePageContent />
      </Provider>
    </DashboardLayout>
  );
}