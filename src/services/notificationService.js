// src/services/notificationService.js - COMPLETE VERSION
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const TokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("accessToken");
    }
    return null;
  },

  setAccessToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", token);
    }
  },

  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
};

const notificationApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

notificationApi.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

notificationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const NotificationService = {
  /**
   * 📬 Get Outlook emails with sent/received separation
   * @param {Object} params - Filter parameters
   * @param {string} params.module - 'business_trip', 'vacation', 'timeoff', 'handover', 'company_news', or 'all'
   * @param {string} params.email_type - 'received', 'sent', or 'all'
   * @param {number} params.top - Number of emails (max 50)
   * @returns {Promise} Email data with received_emails, sent_emails, all_emails
   */
  getOutlookEmails: async (params = { module: 'all', email_type: 'all', top: 50 }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.module) queryParams.append('module', params.module);
      if (params.email_type) queryParams.append('email_type', params.email_type);
      if (params.top) queryParams.append('top', Math.min(params.top, 50));

      const response = await notificationApi.get(
        `/notifications/outlook/emails/?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching Outlook emails:', error);
      throw error;
    }
  },

  /**
   * ✅ Get full email details by ID
   * @param {string} messageId - Email message ID
   * @returns {Promise} Email details with full body
   */
  getEmailDetail: async (messageId) => {
    try {
      const response = await notificationApi.get(
        `/notifications/outlook/email/${messageId}/`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching email detail:', error);
      throw error;
    }
  },

  /**
   * ✅ Delete email
   * @param {string} messageId - Email message ID
   * @returns {Promise} Deletion result
   */
  deleteEmail: async (messageId) => {
    try {
      const response = await notificationApi.delete(
        `/notifications/outlook/email/${messageId}/`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  },

  /**
   * Mark email as read
   * @param {string} messageId - Email message ID
   * @returns {Promise} Success response
   */
  markEmailAsRead: async (messageId) => {
    try {
      const response = await notificationApi.post(
        '/notifications/outlook/mark-read/',
        { message_id: messageId }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  },

  /**
   * Mark email as unread
   * @param {string} messageId - Email message ID
   * @returns {Promise} Success response
   */
  markEmailAsUnread: async (messageId) => {
    try {
      const response = await notificationApi.post(
        '/notifications/outlook/mark-unread/',
        { message_id: messageId }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking email as unread:', error);
      throw error;
    }
  },

  /**
   * Mark all emails as read by module and email type
   * @param {string} module - 'business_trip', 'vacation', 'timeoff', 'handover', 'company_news', or 'all'
   * @param {string} email_type - 'received', 'sent', or 'all'
   * @returns {Promise} Batch operation result
   */
  markAllEmailsAsRead: async (module = 'all', email_type = 'all') => {
    try {
      const response = await notificationApi.post(
        '/notifications/outlook/mark-all-read/',
        { module, email_type }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all emails as read:', error);
      throw error;
    }
  },

  /**
   * Get unread count by module and email type
   * @param {string} module - Module filter
   * @param {string} email_type - 'received', 'sent', or 'all'
   * @returns {Promise<number>} Unread count
   */
  getUnreadCount: async (module = 'all', email_type = 'received') => {
    try {
      const response = await notificationApi.get(
        `/notifications/outlook/emails/?module=${module}&email_type=${email_type}&top=50`
      );
      
      if (response.data.success) {
        // Count unread from received emails only
        const emails = email_type === 'received' 
          ? response.data.received_emails || []
          : response.data.all_emails || [];
        return emails.filter(email => !email.is_read).length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  /**
   * Get notification statistics
   * @returns {Promise} Statistics object
   */
  getNotificationStats: async () => {
    try {
      const emails = await NotificationService.getOutlookEmails({ 
        module: 'all', 
        email_type: 'all',
        top: 50 
      });

      const unreadCount = emails.received_emails?.filter(e => !e.is_read).length || 0;

      return {
        totalEmails: emails.counts?.total || 0,
        receivedEmails: emails.counts?.received || 0,
        sentEmails: emails.counts?.sent || 0,
        unreadEmails: unreadCount
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
};

export default NotificationService;