// src/components/layout/DashboardLayout.jsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import ProtectedRoute from "../auth/ProtectedRoute";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarPinned') === 'true';
    }
    return false;
  });

  const isSidebarExpanded = isMobile ? isSidebarOpen : isPinned;

  // Desktop: toggle = pin/unpin; Mobile: toggle = open/close
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(prev => !prev);
    } else {
      const newPinned = !isPinned;
      setIsPinned(newPinned);
      localStorage.setItem('sidebarPinned', String(newPinned));
    }
  };

  const togglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    localStorage.setItem('sidebarPinned', String(newPinned));
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
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
        >
          <Sidebar
            collapsed={!isSidebarExpanded}
            isPinned={isPinned}
            togglePin={togglePin}
          />
        </aside>

        {/* Mobile overlay */}
        <AnimatePresence>
          {isMobile && isSidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-almet-mystic dark:bg-gray-900">
          <Header
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
            isSidebarCollapsed={!isSidebarExpanded}
          />
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                className="h-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
