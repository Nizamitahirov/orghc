// src/components/layout/DashboardLayout.jsx
"use client";
import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import ProtectedRoute from "../auth/ProtectedRoute"; // Qorunan Route komponentini əlavə edin

const DashboardLayout = ({ children }) => {
  // Use state to track sidebar visibility and collapse state
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Toggle sidebar function for mobile view
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!isSidebarOpen);
    } else {
      // On desktop, toggle between collapsed and expanded state
      setSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-hide sidebar on mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ProtectedRoute> {/* Qorunan Route ilə əhatə edin */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - with both mobile and desktop behavior */}
        <aside 
          className={`
            ${isMobile ? 'fixed' : 'relative'} z-20 
            transition-all duration-300 ease-in-out 
            h-full 
            ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
            ${!isMobile && isSidebarCollapsed ? 'w-16' : 'w-52'}
          `}
        >
          <Sidebar collapsed={!isMobile && isSidebarCollapsed} />
        </aside>

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-almet-mystic dark:bg-gray-900">
          {/* Pass toggleSidebar function to Header */}
          <Header 
            toggleSidebar={toggleSidebar} 
            isMobile={isMobile}
            isSidebarCollapsed={isSidebarCollapsed} 
          />
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;