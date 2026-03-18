// src/components/layout/DashboardLayout.jsx
"use client";
import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import ProtectedRoute from "../auth/ProtectedRoute";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarPinned') === 'true';
    }
    return false;
  });

  const [isHovered, setIsHovered] = useState(false);

  const isSidebarExpanded = isMobile ? isSidebarOpen : (isPinned || isHovered);

  // Desktop: toggle = pin/unpin; Mobile: toggle = open/close
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(prev => !prev);
    } else {
      const newPinned = !isPinned;
      setIsPinned(newPinned);
      localStorage.setItem('sidebarPinned', String(newPinned));
      if (newPinned) setIsHovered(false);
    }
  };

  const togglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    localStorage.setItem('sidebarPinned', String(newPinned));
    if (newPinned) setIsHovered(false);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            ${isMobile ? 'fixed' : 'relative'} z-20
            transition-all duration-300 ease-in-out
            h-full
            ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
            ${isSidebarExpanded ? 'w-52' : 'w-16'}
          `}
          onMouseEnter={() => !isMobile && !isPinned && setIsHovered(true)}
          onMouseLeave={() => !isMobile && !isPinned && setIsHovered(false)}
        >
          <Sidebar
            collapsed={!isSidebarExpanded}
            isPinned={isPinned}
            togglePin={togglePin}
          />
        </aside>

        {/* Mobile overlay */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-almet-mystic dark:bg-gray-900">
          <Header
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
            isSidebarCollapsed={!isSidebarExpanded}
          />
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;