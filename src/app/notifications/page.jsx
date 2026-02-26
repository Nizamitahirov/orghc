"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Inbox, 
  Send, 
  Mail, 
  CheckCheck,
  Search,
  RefreshCw,
  Paperclip,
  X,
  ExternalLink
} from "lucide-react";
import NotificationService from "@/services/notificationService";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import CustomCheckbox from "@/components/common/CustomCheckbox";
import Pagination from "@/components/common/Pagination";
import { useToast } from '@/components/common/Toast';

const NotificationsPage = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [receivedEmails, setReceivedEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState('received');
  const [activeModule, setActiveModule] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  const [stats, setStats] = useState({
    received: 0,
    sent: 0,
    unread: 0
  });

  useEffect(() => {
    fetchEmails();
  }, [activeModule]);

  const fetchEmails = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await NotificationService.getOutlookEmails({
        module: activeModule,
        email_type: 'all',
        top: 100
      });

      if (data.success) {
        setReceivedEmails(data.received_emails || []);
        setSentEmails(data.sent_emails || []);
        
        const unread = data.received_emails?.filter(e => !e.is_read).length || 0;
        setStats({
          received: data.counts?.received || 0,
          sent: data.counts?.sent || 0,
          unread: unread
        });
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      showError('Failed to load emails');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (messageId, e) => {
    if (e) e.stopPropagation();
    try {
      await NotificationService.markEmailAsRead(messageId);
      setReceivedEmails(prev => 
        prev.map(e => e.id === messageId ? { ...e, is_read: true } : e)
      );
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      showSuccess('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      showError('Failed to mark as read');
    }
  };

  const handleMarkAsUnread = async (messageId, e) => {
    if (e) e.stopPropagation();
    try {
      await NotificationService.markEmailAsUnread(messageId);
      setReceivedEmails(prev => 
        prev.map(e => e.id === messageId ? { ...e, is_read: false } : e)
      );
      setStats(prev => ({ ...prev, unread: prev.unread + 1 }));
      showSuccess('Marked as unread');
    } catch (error) {
      console.error('Error marking as unread:', error);
      showError('Failed to mark as unread');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadEmails = receivedEmails.filter(e => !e.is_read);
      if (unreadEmails.length === 0) {
        showError('No unread messages');
        return;
      }
      
      await NotificationService.markAllEmailsAsRead(activeModule, 'received');
      setReceivedEmails(prev => prev.map(e => ({ ...e, is_read: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
      setSelectedEmails([]);
      showSuccess(`${unreadEmails.length} messages marked as read`);
    } catch (error) {
      console.error('Error marking all as read:', error);
      showError('Failed to mark all as read');
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      const unreadSelected = selectedEmails.filter(id => {
        const email = receivedEmails.find(e => e.id === id);
        return email && !email.is_read;
      });

      if (unreadSelected.length === 0) {
        showError('Selected messages are already read');
        setSelectedEmails([]);
        return;
      }

      await Promise.all(unreadSelected.map(id => 
        NotificationService.markEmailAsRead(id)
      ));
      
      setReceivedEmails(prev => 
        prev.map(e => selectedEmails.includes(e.id) ? { ...e, is_read: true } : e)
      );
      
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - unreadSelected.length) }));
      setSelectedEmails([]);
      showSuccess(`${unreadSelected.length} messages marked as read`);
    } catch (error) {
      console.error('Error marking selected as read:', error);
      showError('Failed to mark selected as read');
    }
  };

  const handleBulkMarkAsUnread = async () => {
    try {
      const readSelected = selectedEmails.filter(id => {
        const email = receivedEmails.find(e => e.id === id);
        return email && email.is_read;
      });

      if (readSelected.length === 0) {
        showError('Selected messages are already unread');
        setSelectedEmails([]);
        return;
      }

      await Promise.all(readSelected.map(id => 
        NotificationService.markEmailAsUnread(id)
      ));
      
      setReceivedEmails(prev => 
        prev.map(e => selectedEmails.includes(e.id) ? { ...e, is_read: false } : e)
      );
      
      setStats(prev => ({ ...prev, unread: prev.unread + readSelected.length }));
      setSelectedEmails([]);
      showSuccess(`${readSelected.length} messages marked as unread`);
    } catch (error) {
      console.error('Error marking selected as unread:', error);
      showError('Failed to mark selected as unread');
    }
  };

  const handleSelectEmail = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(e => e.id));
    }
  };

  const handleNavigateToModule = (module, e) => {
    if (e) e.stopPropagation();
    const moduleRoutes = {
      'vacation': '/requests/vacation/',
      'business_trip': '/requests/requests/business-trip/',
      'timeoff': '/requests/time-off/',
      'handover': '/requests/handover-takeover/',
      'company_news': '/communication/company-news/'
    };
    const route = moduleRoutes[module];
    if (route) {
      router.push(route);
    }
  };

  const getModuleColor = (module) => {
    switch (module) {
      case 'vacation':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'business_trip':
        return 'text-blue-600 dark:text-blue-400';
      case 'timeoff':
        return 'text-amber-600 dark:text-amber-400';
      case 'handover':
        return 'text-purple-600 dark:text-purple-400';
      case 'company_news':
        return 'text-pink-600 dark:text-pink-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getModuleBadgeColor = (module) => {
    switch (module) {
      case 'vacation':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40';
      case 'business_trip':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40';
      case 'timeoff':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/40';
      case 'handover':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/40';
      case 'company_news':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/40';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';
    }
  };

  const getModuleIcon = (module) => {
    switch (module) {
      case 'vacation':
        return '🏖️';
      case 'business_trip':
        return '✈️';
      case 'timeoff':
        return '🕐';
      case 'handover':
        return '🔄';
      case 'company_news':
        return '📰';
      default:
        return '📧';
    }
  };

  const getModuleLabel = (module) => {
    switch (module) {
      case 'business_trip':
        return 'Business Trip';
      case 'vacation':
        return 'Vacation';
      case 'timeoff':
        return 'Time Off';
      case 'handover':
        return 'Handover';
      case 'company_news':
        return 'Company News';
      default:
        return 'General';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const currentEmails = activeView === 'received' ? receivedEmails : sentEmails;

  const filteredEmails = currentEmails.filter(email => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(query) ||
      email.preview?.toLowerCase().includes(query) ||
      email.contact_name?.toLowerCase().includes(query) ||
      email.contact_email?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmails = filteredEmails.slice(startIndex, startIndex + itemsPerPage);

  const isAllSelected = selectedEmails.length === filteredEmails.length && filteredEmails.length > 0;
  const isSomeSelected = selectedEmails.length > 0 && selectedEmails.length < filteredEmails.length;

  const selectedReadCount = selectedEmails.filter(id => {
    const email = receivedEmails.find(e => e.id === id);
    return email && email.is_read;
  }).length;
  
  const selectedUnreadCount = selectedEmails.filter(id => {
    const email = receivedEmails.find(e => e.id === id);
    return email && !email.is_read;
  }).length;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-full">
        
        {/* Header */}
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm mb-6`}>
          <div className="px-5 py-4">
            
            {/* Title Section */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2.5 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg shadow-lg shadow-almet-sapphire/20">
                    <Mail size={20} className="text-white" />
                  </div>
                  {stats.unread > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{stats.unread}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Mail Center
                  </h1>
                  <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'} mt-0.5`}>
                    Manage your email notifications
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchEmails(true)}
                  disabled={refreshing}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode 
                      ? 'bg-almet-san-juan hover:bg-almet-comet text-almet-bali-hai' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Refresh"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>

                {/* Bulk Actions */}
                {selectedEmails.length > 0 && activeView === 'received' && (
                  <div className="flex items-center gap-2">
                    {selectedUnreadCount > 0 && (
                      <button
                        onClick={handleBulkMarkAsRead}
                        className="px-3 py-2 rounded-lg bg-almet-sapphire hover:bg-almet-astral text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCheck size={14} />
                        Mark as read ({selectedUnreadCount})
                      </button>
                    )}
                    {selectedReadCount > 0 && (
                      <button
                        onClick={handleBulkMarkAsUnread}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm ${
                          darkMode
                            ? 'bg-almet-san-juan hover:bg-almet-comet text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                      >
                        <Mail size={14} />
                        Mark as unread ({selectedReadCount})
                      </button>
                    )}
                  </div>
                )}

                {/* Mark All as Read */}
                {stats.unread > 0 && activeView === 'received' && selectedEmails.length === 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-3 py-2 rounded-lg bg-almet-sapphire hover:bg-almet-astral text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCheck size={14} />
                    Mark all as read ({stats.unread})
                  </button>
                )}
              </div>
            </div>

            {/* Module Tabs */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {[
                { key: 'all',           label: 'All Mail',      icon: '📬' },
                { key: 'business_trip', label: 'Business Trips', icon: '✈️' },
                { key: 'vacation',      label: 'Vacation',      icon: '🏖️' },
                { key: 'timeoff',       label: 'Time Off',      icon: '🕐' },
                { key: 'handover',      label: 'Handover',      icon: '🔄' },
                { key: 'company_news',  label: 'Company News',  icon: '📰' },
              ].map(module => (
                <button
                  key={module.key}
                  onClick={() => {
                    setActiveModule(module.key);
                    setCurrentPage(1);
                    setSelectedEmails([]);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeModule === module.key
                      ? 'bg-almet-sapphire text-white shadow-md shadow-almet-sapphire/30'
                      : darkMode
                        ? 'bg-almet-san-juan text-almet-bali-hai hover:bg-almet-comet'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1.5">{module.icon}</span>
                  {module.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search emails by subject, sender, or content..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-xs transition-all ${
                  darkMode
                    ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-bali-hai focus:bg-almet-comet'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                } border-2 focus:outline-none focus:border-almet-sapphire`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-almet-comet ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-2.5`}>
              
              {/* Inbox Button */}
              <button
                onClick={() => {
                  setActiveView('received');
                  setSelectedEmails([]);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all mb-1.5 ${
                  activeView === 'received'
                    ? 'bg-gradient-to-r from-almet-sapphire to-almet-astral text-white shadow-md'
                    : darkMode
                      ? 'text-gray-300 hover:bg-almet-comet'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox size={16} />
                  <span>Inbox</span>
                </div>
                {stats.unread > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeView === 'received'
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {stats.unread}
                  </span>
                )}
              </button>

              {/* Sent Items Button */}
              <button
                onClick={() => {
                  setActiveView('sent');
                  setSelectedEmails([]);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeView === 'sent'
                    ? 'bg-gradient-to-r from-almet-sapphire to-almet-astral text-white shadow-md'
                    : darkMode
                      ? 'text-gray-300 hover:bg-almet-comet'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Send size={16} />
                <span>Sent Items</span>
              </button>

              {/* Stats Section */}
              <div className={`mt-5 pt-4 border-t ${darkMode ? 'border-almet-comet' : 'border-gray-200'}`}>
                <h3 className={`text-[10px] font-semibold uppercase tracking-wider mb-2.5 px-2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                  Statistics
                </h3>
                <div className="space-y-1.5 px-2">
                  <div className="flex items-center justify-between py-1.5">
                    <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Received
                    </span>
                    <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.received}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Sent
                    </span>
                    <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.sent}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between py-1.5 px-2.5 -mx-1 rounded-lg ${stats.unread > 0 ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                    <span className={`text-xs font-medium ${stats.unread > 0 ? 'text-red-600 dark:text-red-400' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Unread
                    </span>
                    <span className={`text-xs font-bold ${stats.unread > 0 ? 'text-red-600 dark:text-red-400' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.unread}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="col-span-12 lg:col-span-9">
            <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`}>
              
              {/* List Header */}
              <div className={`px-4 py-3 border-b ${darkMode ? 'border-almet-comet' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {activeView === 'received' && filteredEmails.length > 0 && (
                      <CustomCheckbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onChange={handleSelectAll}
                      />
                    )}
                    <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {activeView === 'received' ? 'Inbox' : 'Sent Items'}
                      <span className={`ml-2 font-normal ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                        ({filteredEmails.length})
                      </span>
                    </h2>
                  </div>
                  {selectedEmails.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                        {selectedEmails.length} selected
                      </span>
                      <button
                        onClick={() => setSelectedEmails([])}
                        className={`text-xs font-medium ${darkMode ? 'text-almet-sapphire hover:text-almet-astral' : 'text-almet-sapphire hover:text-almet-astral'}`}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Items */}
              <div className={`divide-y ${darkMode ? 'divide-almet-comet' : 'divide-gray-100'}`}>
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-almet-sapphire border-t-transparent mx-auto mb-3"></div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                      Loading messages...
                    </p>
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className={`inline-flex p-3 rounded-full mb-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-100'}`}>
                      {activeView === 'received' ? (
                        <Inbox size={40} className={darkMode ? 'text-almet-bali-hai' : 'text-gray-400'} />
                      ) : (
                        <Send size={40} className={darkMode ? 'text-almet-bali-hai' : 'text-gray-400'} />
                      )}
                    </div>
                    <h3 className={`text-base font-semibold mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {searchQuery ? 'No results found' : 'No messages'}
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                      {searchQuery 
                        ? 'Try adjusting your search terms' 
                        : activeView === 'received' 
                          ? "You don't have any messages in your inbox"
                          : "You haven't sent any messages yet"}
                    </p>
                  </div>
                ) : (
                  <>
                    {paginatedEmails.map((email) => (
                      <div
                        key={email.id}
                        className={`px-4 py-3 transition-all group ${
                          selectedEmails.includes(email.id)
                            ? darkMode
                              ? 'bg-almet-sapphire/10'
                              : 'bg-blue-50'
                            : !email.is_read && activeView === 'received' 
                              ? darkMode
                                ? 'bg-almet-comet/30 hover:bg-almet-comet/50'
                                : 'bg-blue-50/40 hover:bg-blue-50/60'
                              : darkMode
                                ? 'hover:bg-almet-comet/20'
                                : 'hover:bg-gray-50'
                        } cursor-pointer`}
                      >
                        <div className="flex items-start gap-3">
                          
                          {/* Checkbox */}
                          {activeView === 'received' && (
                            <div 
                              className="flex-shrink-0 pt-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <CustomCheckbox
                                checked={selectedEmails.includes(email.id)}
                                onChange={() => handleSelectEmail(email.id)}
                              />
                            </div>
                          )}

                          {/* Icon - Click for module page */}
                          <div 
                            className="flex-shrink-0 pt-0.5 group/icon"
                            onClick={(e) => handleNavigateToModule(email.module, e)}
                            title={`Go to ${getModuleLabel(email.module)}`}
                          >
                            <div className={`text-2xl transition-transform group-hover/icon:scale-110 cursor-pointer ${getModuleColor(email.module)}`}>
                              {getModuleIcon(email.module)}
                            </div>
                          </div>

                          {/* Content - Click for detail page */}
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => router.push(`/notifications/${email.id}`)}
                          >
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <p className={`text-xs font-semibold truncate ${
                                    !email.is_read && activeView === 'received'
                                      ? darkMode ? 'text-white' : 'text-gray-900'
                                      : darkMode ? 'text-gray-200' : 'text-gray-700'
                                  }`}>
                                    {email.contact_name || email.contact_email}
                                  </p>
                                  {!email.is_read && activeView === 'received' && (
                                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-almet-sapphire"></div>
                                  )}
                                </div>
                                <p className={`text-xs font-medium truncate mb-1 ${
                                  !email.is_read && activeView === 'received'
                                    ? darkMode ? 'text-gray-100' : 'text-gray-800'
                                    : darkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {email.subject}
                                </p>
                                <p className={`text-[11px] line-clamp-2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                                  {email.preview}
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[11px] font-medium whitespace-nowrap ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                                    {getTimeAgo(activeView === 'received' ? email.received_at : email.sent_at)}
                                  </span>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                    {!email.is_read && activeView === 'received' ? (
                                      <button
                                        onClick={(e) => handleMarkAsRead(email.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-almet-sapphire/10 text-almet-sapphire transition-all"
                                        title="Mark as read"
                                      >
                                        <CheckCheck size={14} />
                                      </button>
                                    ) : activeView === 'received' && (
                                      <button
                                        onClick={(e) => handleMarkAsUnread(email.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-500 dark:text-gray-400 transition-all"
                                        title="Mark as unread"
                                      >
                                        <Mail size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={(e) => handleNavigateToModule(email.module, e)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all hover:shadow-md ${getModuleBadgeColor(email.module)} hover:scale-105`}
                                title={`Go to ${getModuleLabel(email.module)} page`}
                              >
                                <span>{getModuleIcon(email.module)}</span>
                                <span>{getModuleLabel(email.module)}</span>
                                <ExternalLink size={10} className="opacity-60" />
                              </button>
                              
                              {email.has_attachments && (
                                <span className={`inline-flex items-center gap-1 text-[10px] ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                                  <Paperclip size={12} />
                                  Attachment
                                </span>
                              )}
                              
                              {/* View Details hint */}
                              <span className={`opacity-0 group-hover:opacity-100 text-[10px] italic transition-opacity ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`}>
                                Click to view details
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-3">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={filteredEmails.length}
                          itemsPerPage={itemsPerPage}
                          onPageChange={setCurrentPage}
                          darkMode={darkMode}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;