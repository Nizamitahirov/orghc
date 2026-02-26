import { Bell, Mail, Inbox, CheckCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationService from "@/services/notificationService";
import { useRouter } from "next/navigation";
import { useToast } from '@/components/common/Toast';

const NotificationDropdown = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch emails when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  // Poll for unread count every 2 minutes
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await NotificationService.getUnreadCount('all', 'received');
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getOutlookEmails({
        module: 'all',
        email_type: 'received',
        top: 10
      });

      if (data.success) {
        setEmails(data.received_emails || []);
        const unread = data.received_emails?.filter(e => !e.is_read).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId, e) => {
    e.stopPropagation();
    try {
      await NotificationService.markEmailAsRead(messageId);
      setEmails(prev => 
        prev.map(e => e.id === messageId ? { ...e, is_read: true } : e)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      showSuccess('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAsUnread = async (messageId, e) => {
    e.stopPropagation();
    try {
      await NotificationService.markEmailAsUnread(messageId);
      setEmails(prev => 
        prev.map(e => e.id === messageId ? { ...e, is_read: false } : e)
      );
      setUnreadCount(prev => prev + 1);
      showSuccess('Marked as unread');
    } catch (error) {
      console.error('Error marking as unread:', error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      const unreadEmails = emails.filter(e => !e.is_read);
      if (unreadEmails.length === 0) return;
      
      await NotificationService.markAllEmailsAsRead('all', 'received');
      setEmails(prev => prev.map(e => ({ ...e, is_read: true })));
      setUnreadCount(0);
      showSuccess(`${unreadEmails.length} marked as read`);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleEmailClick = (email) => {
    if (!email.is_read) {
      handleMarkAsRead(email.id, { stopPropagation: () => {} });
    }
    setIsOpen(false);
    router.push(`/notifications/${email.id}`);
  };

  const getModuleIcon = (module) => {
    switch (module) {
      case 'vacation': return '🏖️';
      case 'business_trip': return '✈️';
      case 'timeoff': return '🕐';
      case 'handover': return '🔄';
      case 'company_news': return '📰';
      default: return '📧';
    }
  };

  const getModuleColor = (module) => {
    switch (module) {
      case 'vacation': return 'text-emerald-600';
      case 'business_trip': return 'text-blue-600';
      case 'timeoff': return 'text-amber-600';
      case 'handover': return 'text-purple-600';
      case 'company_news': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Now';
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] bg-white dark:bg-almet-cloud-burst rounded-lg shadow-2xl border border-gray-200 dark:border-almet-comet z-50 overflow-hidden">
          
          {/* Header */}
          <div className="px-3 py-2.5 bg-gradient-to-r from-almet-sapphire to-almet-astral border-b border-almet-sapphire/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox size={14} className="text-white" />
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Inbox
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-white/80">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-[10px] text-white font-medium transition-colors"
                  title="Mark all as read"
                >
                  Mark all
                </button>
              )}
            </div>
          </div>

          {/* Email List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-almet-sapphire border-t-transparent mb-2"></div>
                <p className="text-[11px] text-gray-500 dark:text-almet-bali-hai">
                  Loading...
                </p>
              </div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-almet-comet flex items-center justify-center">
                  <Mail size={24} className="text-gray-300 dark:text-almet-bali-hai" />
                </div>
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                  No new messages
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div>
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`px-3 py-2 border-b border-gray-100 dark:border-almet-comet last:border-b-0 hover:bg-gray-50 dark:hover:bg-almet-comet/30 cursor-pointer transition-all group ${
                      !email.is_read ? 'bg-blue-50/50 dark:bg-almet-comet/20' : ''
                    }`}
                  >
                    <div className="flex gap-2">
                      
                      {/* Module Icon */}
                      <div className="flex-shrink-0">
                        <div className={`text-base ${getModuleColor(email.module)}`}>
                          {getModuleIcon(email.module)}
                        </div>
                      </div>

                      {/* Email Content */}
                      <div className="flex-1 min-w-0">
                        
                        {/* Sender & Time */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={`text-[11px] truncate flex-1 ${
                            !email.is_read 
                              ? 'font-semibold text-gray-900 dark:text-white' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {email.contact_name || email.contact_email}
                          </p>
                          
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-gray-400 dark:text-almet-bali-hai">
                              {getTimeAgo(email.received_at)}
                            </span>
                            
                            {/* Action Buttons */}
                            {!email.is_read ? (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:hidden"></div>
                                <button
                                  onClick={(e) => handleMarkAsRead(email.id, e)}
                                  className="hidden group-hover:block p-1 rounded hover:bg-almet-sapphire/10 text-almet-sapphire transition-all"
                                  title="Mark as read"
                                >
                                  <CheckCheck size={12} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => handleMarkAsUnread(email.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-500/10 text-gray-500 dark:text-gray-400 transition-all"
                                title="Mark as unread"
                              >
                                <Mail size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subject */}
                        <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                          !email.is_read 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {email.subject}
                        </p>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {emails.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 dark:border-almet-comet bg-gray-50 dark:bg-almet-comet/20">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  router.push('/notifications');
                }}
                className="w-full text-[11px] font-medium text-almet-sapphire hover:text-almet-astral transition-colors py-1.5 rounded hover:bg-almet-sapphire/5 flex items-center justify-center gap-1"
              >
                View all
                <span className="text-[10px]">→</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;