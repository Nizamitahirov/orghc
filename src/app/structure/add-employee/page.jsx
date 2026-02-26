// src/app/structure/add-employee/page.jsx - Complete with API Integration
"use client";
import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { Info, ChevronLeft, Users, FileText, BookOpen, X, CheckCircle, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeForm from "@/components/headcount/EmployeeForm";
import { useTheme } from "@/components/common/ThemeProvider";
import Link from "next/link";

/**
 * Info Modal Component
 */
const InfoModal = ({ isOpen, onClose, title, content, type = "info" }) => {
  const { darkMode } = useTheme();
  
  if (!isOpen) return null;

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  const getIcon = () => {
    switch (type) {
      case 'onboarding':
        return <BookOpen className="text-blue-500" size={20} />;
      case 'documents':
        return <FileText className="text-green-500" size={20} />;
      case 'employees':
        return <Users className="text-purple-500" size={20} />;
    
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border ${borderColor}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            {getIcon()}
            <h2 className={`text-lg font-bold ${textPrimary} ml-3`}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {content}
        </div>
      </div>
    </div>
  );
};

/**
 * Add Employee Page with comprehensive guidance and API integration
 */
const AddEmployeePage = () => {
  const { darkMode } = useTheme();
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    content: null
  });

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  useEffect(() => {
    document.title = "Add New Employee - Almet Holding HRIS";
  }, []);

  const openModal = (type) => {
    let title = '';
    let content = null;

    switch (type) {
      case 'onboarding':
        title = 'Employee Onboarding Guide';
        content = (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                Welcome to Almet Holding Employee Onboarding
              </h3>
              <p className={`${textSecondary} leading-relaxed mb-4`}>
                This comprehensive guide will help you navigate through adding a new employee to our HRIS system. 
                The process is designed to be intuitive while ensuring all necessary information is captured accurately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-green-600 dark:text-green-400">✓ What You'll Need</h4>
                <ul className={`space-y-2 text-sm ${textSecondary}`}>
                  <li>• Employee's personal information (name, email, phone)</li>
                  <li>• Job details (title, department, position group)</li>
                  <li>• Contract information (duration, start date)</li>
                  <li>• Line manager assignment (optional)</li>
                  <li>• Employee documents (optional)</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-amber-600 dark:text-amber-400">⚡ Automated Features</h4>
                <ul className={`space-y-2 text-sm ${textSecondary}`}>
                  <li>• Status automatically assigned based on contract</li>
                  <li>• Grading levels fetched from position group</li>
                  <li>• Contract end dates calculated automatically</li>
                  <li>• Employee ID validation and uniqueness check</li>
                  <li>• Organizational hierarchy maintained</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                Step-by-Step Process
              </h4>
              <ol className={`space-y-1 text-sm ${textSecondary} ml-4`}>
                <li>1. <strong>Basic Information:</strong> Enter personal details and contact information</li>
                <li>2. <strong>Job Details:</strong> Set up organizational structure and grading</li>
                <li>3. <strong>Management:</strong> Assign line manager and tags (optional)</li>
                <li>4. <strong>Documents:</strong> Upload any relevant files (optional)</li>
              </ol>
            </div>
          </div>
        );
        break;

     
   
      case 'documents':
        title = 'Document Management';
        content = (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">
                Optional Document Upload
              </h3>
              <p className={`${textSecondary} leading-relaxed`}>
                Document upload is completely optional during employee creation. You can add, remove, 
                or modify documents at any time after the employee is created in the system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-3">Supported File Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="mr-2">📄</span>
                    <span>PDF Documents (.pdf)</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="mr-2">📝</span>
                    <span>Word Documents (.doc, .docx)</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="mr-2">🖼️</span>
                    <span>Images (.jpg, .png, .gif)</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="mr-2">📄</span>
                    <span>Text Files (.txt)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-3">Common Documents</h4>
                <ul className={`space-y-2 text-sm ${textSecondary}`}>
                  <li>• Employment contracts</li>
                  <li>• ID copies and personal documents</li>
                  <li>• Educational certificates</li>
                  <li>• Professional certifications</li>
                  <li>• Medical certificates</li>
                  <li>• Background check results</li>
                  <li>• Emergency contact forms</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                File Guidelines
              </h4>
              <ul className={`space-y-1 text-sm ${textSecondary}`}>
                <li>• Maximum file size: 10MB per document</li>
                <li>• Files are securely stored and encrypted</li>
                <li>• Documents can be added/removed anytime after creation</li>
                <li>• Access is controlled based on user permissions</li>
                <li>• All document changes are logged for audit purposes</li>
              </ul>
            </div>
          </div>
        );
        break;

      default:
        title = 'Employee Management Help';
        content = (
          <div className="space-y-4">
            <p className={`${textSecondary} leading-relaxed`}>
              Welcome to the employee management system. Here you can add new employees, 
              manage their information, and track their progress through the organization.
            </p>
          </div>
        );
    }

    setModalState({ isOpen: true, type, title, content });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: '', title: '', content: null });
  };

  return (
    <Provider store={store}>
      <DashboardLayout>
        <div className="p-4 m mx-auto">
          {/* Header with navigation and help */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Link 
                  href="/structure/headcount-table"
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-almet-sapphire transition-colors mr-4"
                >
                  <ChevronLeft size={20} className="mr-1" />
                  Back to Employee Directory
                </Link>
              </div>

              {/* Help buttons */}
              <div className="flex items-center gap-2">
            
                
                <button
                  onClick={() => openModal('documents')}
                  className={`${bgCard} border ${borderColor} px-3 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm flex items-center`}
                >
                  <FileText size={16} className="mr-2 text-green-500" />
                  Document Guide
                </button>
                
                <button
                  onClick={() => openModal('onboarding')}
                  className="bg-almet-sapphire text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg flex items-center"
                >
                  <BookOpen size={16} className="mr-2" />
                  Onboarding Guide
                </button>
              </div>
            </div>

           
          </div>

          {/* Employee Form */}
          <EmployeeForm />

          {/* Info Modal */}
          <InfoModal 
            isOpen={modalState.isOpen}
            onClose={closeModal}
            title={modalState.title}
            content={modalState.content}
            type={modalState.type}
          />
        </div>
      </DashboardLayout>
    </Provider>
  );
};

export default AddEmployeePage;