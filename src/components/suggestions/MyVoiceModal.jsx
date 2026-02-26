// src/components/suggestions/MyVoiceModal.jsx

'use client';

import React, { useState } from 'react';
import { X, Send, Loader2, Lightbulb, ShieldCheck, AlertCircle } from 'lucide-react';
import { suggestionService } from '@/services/suggestionService';

export default function MyVoiceModal({ show, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_anonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  
    
    setLoading(true);
    try {
      await suggestionService.createSuggestion(formData);
      
      setFormData({
        title: '',
        description: '',
        is_anonymous: false
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating suggestion:', error);
      setErrors({ 
        submit: error.response?.data?.detail || 'Failed to submit suggestion' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      is_anonymous: false
    });
    setErrors({});
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-almet-mystic dark:border-almet-san-juan">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">My Voice</h2>
              <p className="text-xs text-white/80">Share your innovative ideas</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Info Alert */}
          <div className="flex items-start gap-2 p-2.5 bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800/30 rounded-lg">
            <AlertCircle className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-sky-700 dark:text-sky-300">
              Your suggestion will be visible to all employees and reviewed by management
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief, catchy title "
              maxLength={200}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                errors.title 
                  ? 'border-rose-500 focus:ring-rose-500' 
                  : 'border-almet-mystic dark:border-almet-san-juan focus:ring-almet-sapphire'
              } bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 transition-all`}
            />
       
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
              rows={6}
              maxLength={2000}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                errors.description 
                  ? 'border-rose-500 focus:ring-rose-500' 
                  : 'border-almet-mystic dark:border-almet-san-juan focus:ring-almet-sapphire'
              } bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 resize-none transition-all`}
            />
          
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900/10 rounded-lg border border-slate-200 dark:border-slate-800/30">
            <input
              type="checkbox"
              id="is_anonymous"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-almet-sapphire focus:ring-almet-sapphire focus:ring-offset-0"
            />
            <label htmlFor="is_anonymous" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-almet-cloud-burst dark:text-white mb-0.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Post Anonymously
              </div>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                Your suggestion will be visible to everyone, but your name will not be shown
              </p>
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-start gap-2 p-2.5 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-lg">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-600 dark:text-rose-400">{errors.submit}</p>
            </div>
          )}

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
              className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-sapphire text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Idea
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}