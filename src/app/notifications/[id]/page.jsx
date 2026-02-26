"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  User, 
  Paperclip,
  CheckCheck,
  Trash2,
  Reply,
  Forward,
  MoreVertical,
  Download
} from "lucide-react";
import NotificationService from "@/services/notificationService";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from '@/components/common/Toast';

const EmailDetailPage = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const emailId = params?.id;

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (emailId) {
      fetchEmailDetail();
    }
  }, [emailId]);

  const fetchEmailDetail = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getEmailDetail(emailId);
      setEmail(data);
      
      // Auto mark as read if unread
      if (!data.is_read) {
        await NotificationService.markEmailAsRead(emailId);
        setEmail(prev => ({ ...prev, is_read: true }));
      }
    } catch (error) {
      console.error('Error fetching email detail:', error);
      showError('Failed to load email');
      router.push('/notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsUnread = async () => {
    try {
      setActionLoading(true);
      await NotificationService.markEmailAsUnread(emailId);
      setEmail(prev => ({ ...prev, is_read: false }));
      showSuccess('Marked as unread');
    } catch (error) {
      showError('Failed to mark as unread');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this email?')) return;
    
    try {
      setActionLoading(true);
      await NotificationService.deleteEmail(emailId);
      showSuccess('Email deleted');
      router.push('/notifications');
    } catch (error) {
      showError('Failed to delete email');
    } finally {
      setActionLoading(false);
    }
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

  const getModuleBadgeColor = (module) => {
    switch (module) {
      case 'vacation':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'business_trip':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'timeoff':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'handover':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'company_news':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const getModuleLabel = (module) => {
    switch (module) {
      case 'business_trip': return 'Business Trip';
      case 'vacation': return 'Vacation';
      case 'timeoff': return 'Time Off';
      case 'handover': return 'Handover';
      case 'company_news': return 'Company News';
      default: return 'General';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-almet-sapphire border-t-transparent mx-auto mb-4"></div>
            <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
              Loading email...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!email) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Mail size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Email not found
            </h2>
            <button
              onClick={() => router.push('/notifications')}
              className="text-sm text-almet-sapphire hover:text-almet-astral"
            >
              Back to inbox
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className=" mx-auto p-6 ">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/notifications')}
            className={`flex items-center gap-2 text-sm font-medium mb-4 transition-colors ${
              darkMode 
                ? 'text-almet-bali-hai hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft size={16} />
            Back to Inbox
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg shadow-lg">
                <Mail size={20} className="text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Email Details
                </h1>
                <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'} mt-0.5`}>
                  View full message
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {email.is_read && (
                <button
                  onClick={handleMarkAsUnread}
                  disabled={actionLoading}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode 
                      ? 'bg-almet-san-juan hover:bg-almet-comet text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Mark as unread"
                >
                  <Mail size={16} />
                </button>
              )}
              
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode 
                      ? 'bg-almet-san-juan hover:bg-almet-comet text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title="More actions"
                >
                  <MoreVertical size={16} />
                </button>

                {showActions && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border z-10 ${
                    darkMode 
                      ? 'bg-almet-cloud-burst border-almet-comet' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                        darkMode 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      } rounded-t-lg`}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Email Content Card */}
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
          
          {/* Email Header */}
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-almet-comet' : 'border-gray-200'}`}>
            
            {/* Subject */}
            <div className="mb-4">
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {email.subject}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getModuleBadgeColor(email.module)}`}>
                  <span className="mr-1.5">{getModuleIcon(email.module)}</span>
                  {getModuleLabel(email.module)}
                </span>
                
                {email.importance === 'high' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                    🔴 High Priority
                  </span>
                )}
                
                {email.has_attachments && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                    darkMode ? 'bg-almet-san-juan text-almet-bali-hai' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Paperclip size={12} />
                    Attachments
                  </span>
                )}
              </div>
            </div>

            {/* Sender Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  darkMode ? 'bg-almet-sapphire' : 'bg-gradient-to-br from-almet-sapphire to-almet-astral'
                }`}>
                  {(email.from?.name || email.from?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {email.from?.name || email.from?.email}
                    </p>
                    <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                      {formatDate(email.received_at)}
                    </span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                    {email.from?.email}
                  </p>
                  
                  {/* To Recipients */}
                  {email.to_recipients && email.to_recipients.length > 0 && (
                    <div className="mt-2">
                      <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                        To:{' '}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {email.to_recipients.map(r => r.name || r.email).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* CC Recipients */}
                  {email.cc_recipients && email.cc_recipients.length > 0 && (
                    <div className="mt-1">
                      <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                        CC:{' '}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {email.cc_recipients.map(r => r.name || r.email).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className={`px-6 py-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {email.body_html ? (
              <div 
                className="email-content prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: email.body_html }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {email.body_text || email.preview || 'No content available'}
              </div>
            )}
          </div>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-almet-comet' : 'border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Attachments ({email.attachments.length})
              </h3>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${darkMode ? 'bg-almet-comet' : 'bg-gray-200'}`}>
                        <Paperclip size={16} className={darkMode ? 'text-almet-bali-hai' : 'text-gray-600'} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {attachment.name}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                          {attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'hover:bg-almet-comet text-almet-bali-hai' 
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

       
        </div>
      </div>

      {/* Custom Styles for Email Content */}
      <style jsx global>{`
        .email-content {
          font-size: 14px;
          line-height: 1.6;
        }
        
        .email-content p {
          margin-bottom: 1em;
        }
        
        .email-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .email-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        
        .email-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        
        .email-content table td,
        .email-content table th {
          padding: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .dark .email-content table td,
        .dark .email-content table th {
          border-color: #374151;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default EmailDetailPage;