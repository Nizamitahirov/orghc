// src/components/suggestions/BoardLetterModal.jsx - IMPROVED VERSION

'use client';

import React, { useState } from 'react';
import { 
  X, Send, Loader2, Copy, Check, Upload, AlertTriangle, 
  Shield, FileText, Lock, Info, Key
} from 'lucide-react';
import { boardLetterService } from '@/services/suggestionService';
import { useToast } from '@/components/common/Toast';

export default function BoardLetterModal({ show, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    is_anonymous: true,
    attachment: null
  });
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(null);
  const [copied, setCopied] = useState(false);
const { showSuccess, showError } = useToast();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, attachment: file }));
      showSuccess('File attached successfully');
    }
  };

 

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    setLoading(true);
    try {
      const response = await boardLetterService.createLetter(formData);
      setTrackingNumber(response.tracking_number);
      showSuccess('Letter sent successfully!');
    } catch (error) {
      console.error('Error creating letter:', error);
      showError(error.response?.data?.detail || 'Failed to send letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTracking = async () => {
    if (trackingNumber) {
      try {
        await navigator.clipboard.writeText(trackingNumber);
        setCopied(true);
        showSuccess('Tracking number copied!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        showError('Failed to copy');
      }
    }
  };

  const handleClose = () => {
    setFormData({
      subject: '',
      content: '',
      is_anonymous: true,
      attachment: null
    });
    setTrackingNumber(null);
    setCopied(false);
    onClose();
  };

  const handleSuccessClose = () => {
    onSuccess?.(trackingNumber);
    handleClose();
  };

  if (!show) return null;

  // Success Screen
  if (trackingNumber) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-lg w-full shadow-2xl border border-almet-mystic dark:border-almet-san-juan">
          {/* Header */}
          <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-5 rounded-t-xl">
            <div className="text-center">
              <h2 className="text-base font-bold text-white mb-1">Letter Sent Successfully</h2>
              <p className="text-xs text-white/80">Your letter has been securely delivered to the Board</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Tracking Number */}
            <div className="bg-slate-50 dark:bg-almet-cloud-burst border border-almet-mystic dark:border-almet-san-juan rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-almet-sapphire dark:text-almet-cloud-burst" />
                <p className="text-xs font-semibold text-almet-sapphire dark:text-almet-cloud-burst">
                  Your Tracking Number
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2.5 bg-white dark:bg-almet-cloud-burst border border-almet-mystic dark:border-almet-san-juan rounded-lg text-base font-mono font-bold text-almet-sapphire dark:text-almet-cloud-burst tracking-wider">
                  {trackingNumber}
                </code>
                <button
                  onClick={handleCopyTracking}
                  className="p-2.5 rounded-lg bg-almet-sapphire hover:bg-almet-mystic text-white transition-all shadow-sm"
                  title="Copy tracking number"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Important Notice */}
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  Save this tracking number!
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You'll need it to check for Board responses. This number will not be shown again.
                </p>
              </div>
            </div>

            {/* What's Next */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/10 rounded-lg border border-slate-200 dark:border-slate-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                  What happens next?
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span>Your letter will be reviewed by Board members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span>You can check for responses using your tracking number</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span>{formData.is_anonymous ? 'Your identity remains completely anonymous' : 'The Board can see your name'}</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCopyTracking}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-almet-mystic/30 dark:bg-almet-sapphire/20 hover:bg-almet-mystic dark:hover:bg-almet-san-juan/30 text-almet-sapphire dark:text-almet-cloud-burst transition-all flex items-center justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy Number'}
              </button>
              <button
                onClick={handleSuccessClose}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-mystic hover:to-almet-san-juan text-white transition-all shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-almet-mystic dark:border-almet-san-juan">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Letter to Board</h2>
              <p className="text-xs text-white/80">Confidential communication channel</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info Alert */}
        <div className="p-4 pb-0">
          <div className="flex items-start gap-2 p-2.5 bg-almet-sapphire/10 dark:bg-almet-astral/10 border border-almet-sapphire/20 dark:border-almet-astral/30 rounded-lg">
            <Info className="h-3.5 w-3.5 text-almet-sapphire dark:text-almet-cloud-burst flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-almet-sapphire dark:text-almet-cloud-burst mb-0.5">
                Important Information
              </p>
              <p className="text-xs text-almet-sapphire dark:text-almet-bali-hai">
                This channel is for serious matters only. You can send anonymously or with your name.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief subject line "
              maxLength={300}
              className="w-full px-3 py-2 text-xs rounded-lg border border-almet-mystic dark:border-almet-san-juan focus:ring-almet-bali-hai bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 transition-all"
            />
         
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Please provide as much detail as possible. Include dates, names, locations, and any other relevant information..."
              rows={8}
              maxLength={5000}
              className="w-full px-3 py-2 text-xs rounded-lg border border-almet-mystic dark:border-almet-san-juan focus:ring-almet-bali-hai bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 resize-none transition-all"
            />
         
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-1.5">
              Attachment (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                id="attachment-upload"
              />
              <label
                htmlFor="attachment-upload"
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg border-2 border-dashed border-almet-mystic dark:border-almet-san-juan hover:border-purple-400 dark:hover:border-purple-600 bg-almet-mystic/10 dark:bg-almet-san-juan/10 cursor-pointer transition-all group"
              >
                <Upload className="h-4 w-4 text-almet-waterloo dark:text-almet-bali-hai group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {formData.attachment ? (
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {formData.attachment.name}
                    </span>
                  ) : (
                    'Click to upload (PDF, DOC, DOCX, JPG, PNG • max 10MB)'
                  )}
                </span>
              </label>
            </div>
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-start gap-2 p-3 bg-almet-mystic/10 dark:bg-almet-san-juan/10 rounded-lg border border-almet-mystic dark:border-almet-san-juan">
            <input
              type="checkbox"
              id="is_anonymous"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-almet-mystic dark:border-almet-san-juan text-almet-sapphire focus:ring-almet-bali-hai focus:ring-offset-0"
            />
            <label htmlFor="is_anonymous" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-almet-sapphire dark:text-almet-cloud-burst mb-0.5">
                <Lock className="h-3.5 w-3.5" />
                Send Anonymously
              </div>
              <p className="text-xs text-almet-sapphire dark:text-almet-bali-hai">
                {formData.is_anonymous 
                  ? 'Your letter will be completely anonymous. The Board will not see your name.'
                  : 'The Board will see your name. Check to send anonymously.'
                }
              </p>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-almet-mystic/30 dark:bg-almet-san-juan/30 hover:bg-almet-mystic/50 dark:hover:bg-almet-san-juan/50 text-almet-cloud-burst dark:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-almet-sapphire to-almet-bali-hai hover:from-almet-sapphire hover:to-almet-bali-hai text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Letter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}