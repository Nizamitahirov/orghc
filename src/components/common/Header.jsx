// src/components/common/Header.jsx
"use client";
import {
  Moon,
  Sun,
  Menu,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Home,
  Briefcase,
  BookOpen,
  Globe,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useAuth } from "@/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import NotificationDropdown from "./NotificationDropdown";
import { useLanguage } from "@/contexts/LanguageContext";
import GlobalSearch from "./GlobalSearch";

const Header = ({ toggleSidebar, isMobile, isSidebarCollapsed }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { account, logout } = useAuth();
  const { t, language, changeLanguage, languages } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [currentTimes, setCurrentTimes] = useState({ baku: "", london: "" });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  // Tab definitions
  const tabs = [
    { id: 'personal', labelKey: 'header.tabs.personalArea', icon: Home, path: '/' },
    { id: 'general', labelKey: 'header.tabs.generalWorkspace', icon: Briefcase, path: '/workspace/general' },
    { id: 'library', labelKey: 'header.tabs.documentationLibrary', icon: BookOpen, path: '/workspace/library' },
  ];

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname === '/') return 'personal';
    if (pathname.startsWith('/workspace/general')) return 'general';
    if (pathname.startsWith('/workspace/library')) return 'library';
    return 'personal';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [pathname]);

  // Function to update times
  const updateTimes = () => {
    const now = new Date();
    const bakuTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Baku' }));
    const bakuHours = bakuTime.getHours().toString().padStart(2, '0');
    const bakuMinutes = bakuTime.getMinutes().toString().padStart(2, '0');
    const londonTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const londonHours = londonTime.getHours().toString().padStart(2, '0');
    const londonMinutes = londonTime.getMinutes().toString().padStart(2, '0');
    setCurrentTimes({ baku: `${bakuHours}:${bakuMinutes}`, london: `${londonHours}:${londonMinutes}` });
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize clock
  useEffect(() => {
    updateTimes();
    const timerID = setInterval(updateTimes, 60000);
    return () => clearInterval(timerID);
  }, []);

  // User initials for avatar
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
    if (account?.username) return account.username.charAt(0).toUpperCase();
    return 'U';
  };

  if (account?.username && typeof window !== 'undefined') {
    localStorage.setItem("user_email", account.username);
  }

  const getUserDisplayName = () => {
    if (account?.name) return account.name;
    if (account?.first_name && account?.last_name) return `${account.first_name} ${account.last_name}`;
    if (account?.username) return account.username;
    return 'User';
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  return (
    <header className="bg-white dark:bg-almet-cloud-burst border-b border-gray-200 dark:border-almet-comet shadow-sm">
      <div className="h-11 px-4 flex items-center justify-between">
        {/* Left side - Menu button + Tabs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
            aria-label={t('header.toggleSidebar')}
          >
            {isMobile ? (
              <Menu size={18} />
            ) : (
              isSidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />
            )}
          </button>

          {/* Tab Navigation */}
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`
                    relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300
                    flex items-center gap-2
                    ${isActive
                      ? 'text-almet-sapphire dark:text-almet-steel-blue bg-almet-sapphire/10 dark:bg-almet-steel-blue/10'
                      : 'text-gray-600 dark:text-almet-bali-hai hover:text-almet-sapphire dark:hover:text-almet-steel-blue hover:bg-gray-100 dark:hover:bg-almet-comet'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="hidden lg:inline">{t(tab.labelKey)}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-almet-sapphire to-almet-astral dark:from-almet-steel-blue dark:to-almet-astral"></div>
                  )}
                </button>
              );
            })}

          </nav>
        </div>

        {/* Right Side Elements */}
        <div className="flex items-center space-x-3">
          {/* World Time Display */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-almet-san-juan/30 border border-gray-200 dark:border-almet-comet">
            <div className="flex items-center gap-1.5 pr-2 border-r border-gray-300 dark:border-almet-comet">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px] font-bold">AZ</span>
              </div>
              <span className="text-[10px] font-bold text-gray-900 dark:text-white leading-none">
                {currentTimes.baku}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px] font-bold">UK</span>
              </div>
              <span className="text-[10px] font-bold text-gray-900 dark:text-white leading-none">
                {currentTimes.london}
              </span>
            </div>
          </div>

          {/* Global Search */}
          <GlobalSearch />

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Theme + Language group */}
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-almet-comet overflow-hidden">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
              aria-label={t('header.toggleDarkMode')}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Divider */}
            <div className="w-px h-4 bg-gray-200 dark:bg-almet-comet" />

            {/* Language Switcher */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
                title="Change language"
              >
                <Globe size={16} />
                <span className="hidden sm:inline text-xs font-semibold uppercase">{language}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg border border-gray-200 dark:border-almet-comet py-1 z-50">
                  {Object.values(languages).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 text-xs transition-colors gap-2
                        ${language === lang.code
                          ? 'bg-almet-sapphire/10 text-almet-sapphire dark:text-almet-steel-blue font-semibold'
                          : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet'
                        }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.nativeLabel}</span>
                      {language === lang.code && (
                        <span className="ml-auto text-almet-sapphire dark:text-almet-steel-blue">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors max-w-48"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center font-semibold text-xs shadow-md flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="hidden md:block text-left min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-[8px] text-gray-500 dark:text-almet-bali-hai truncate">
                  {account?.username || 'user@company.com'}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-500 dark:text-almet-bali-hai transition-transform flex-shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg border border-gray-200 dark:border-almet-comet py-1.5 z-50">
                {/* User Info Header */}
                <div className="px-3 py-1.5 border-b border-gray-100 dark:border-almet-comet">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center font-semibold text-xs shadow-md flex-shrink-0">
                      {getUserInitials()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={getUserDisplayName()}>
                        {getUserDisplayName()}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai truncate" title={account?.username || 'user@company.com'}>
                        {account?.username || 'user@company.com'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button className="flex items-center w-full px-3 py-1.5 text-xs text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
                    <User size={12} className="mr-2 text-gray-500 dark:text-almet-bali-hai flex-shrink-0" />
                    <span className="truncate">{t('header.userMenu.profileSettings')}</span>
                  </button>

                  <button className="flex items-center w-full px-3 py-1.5 text-xs text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
                    <Settings size={12} className="mr-2 text-gray-500 dark:text-almet-bali-hai flex-shrink-0" />
                    <span className="truncate">{t('header.userMenu.accountSettings')}</span>
                  </button>

                  <button className="flex items-center w-full px-3 py-1.5 text-xs text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
                    <HelpCircle size={12} className="mr-2 text-gray-500 dark:text-almet-bali-hai flex-shrink-0" />
                    <span className="truncate">{t('header.userMenu.helpSupport')}</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 dark:border-almet-comet pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center w-full px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={12} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{t('header.userMenu.signOut')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
