'use client';
import React from 'react';
import { X, Star, FileText, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react';

export default function ViewExitInterviewModal({ interview, onClose }) {
  // Group responses by section
  const sections = [
    { id: 'ROLE', label: 'Role & Responsibilities', icon: FileText, color: 'blue' },
    { id: 'MANAGEMENT', label: 'Management & Leadership', icon: TrendingUp, color: 'purple' },
    { id: 'COMPENSATION', label: 'Compensation & Growth', icon: Star, color: 'amber' },
    { id: 'CONDITIONS', label: 'Work Conditions', icon: FileText, color: 'green' },
    { id: 'CULTURE', label: 'Culture & Values', icon: Star, color: 'pink' },
    { id: 'FINAL', label: 'Final Comments', icon: MessageSquare, color: 'red' },
  ];

  const getSectionResponses = (sectionId) => {
    return interview.responses?.filter(r => r.section === sectionId) || [];
  };

  const renderResponse = (response) => {
    const { question_type, rating_value, text_value, choice_value } = response;

    if (question_type === 'RATING') {
      const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
      
      return (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                rating_value >= star
                  ? `${colors[rating_value - 1]} text-white`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              }`}
            >
              {star}
            </div>
          ))}
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-2">
            {labels[rating_value - 1]}
          </span>
        </div>
      );
    }

    if (question_type === 'TEXT' || question_type === 'TEXTAREA') {
      return (
        <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          {text_value || <em className="text-gray-400">No response provided</em>}
        </p>
      );
    }

    if (question_type === 'CHOICE') {
      return (
        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-700">
          {choice_value || <em className="text-gray-400">No selection made</em>}
        </p>
      );
    }

    return null;
  };

  const getSectionAverage = (sectionId) => {
    if (!interview.summary) return null;
    
    const avgMap = {
      'ROLE': interview.summary.role_avg_rating,
      'MANAGEMENT': interview.summary.management_avg_rating,
      'COMPENSATION': interview.summary.compensation_avg_rating,
      'CONDITIONS': interview.summary.conditions_avg_rating,
      'CULTURE': interview.summary.culture_avg_rating,
    };
    
    return avgMap[sectionId];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Exit Interview Results</h2>
            <p className="text-blue-100 text-xs mt-0.5">{interview.employee_name} • {interview.employee_id}</p>
            <p className="text-blue-200 text-[10px] mt-0.5">
              Completed: {interview.completed_at ? new Date(interview.completed_at).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'In Progress'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Summary Card */}
        {interview.summary && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-almet-sapphire" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Overall Summary</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Overall Rating</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-almet-sapphire">
                    {interview.summary.overall_avg_rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">/ 5.0</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Would Recommend</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${interview.summary.would_recommend_company ? 'text-green-600' : 'text-red-600'}`}>
                    {interview.summary.would_recommend_company ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Last Working Day</p>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(interview.last_working_day).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content - Scrollable Responses */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {sections.map((section) => {
              const responses = getSectionResponses(section.id);
              const avgRating = getSectionAverage(section.id);
              const Icon = section.icon;
              
              if (responses.length === 0) return null;
              
              return (
                <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Section Header */}
                  <div className={`bg-gradient-to-r from-${section.color}-500 to-${section.color}-600 p-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-white" />
                      <h3 className="text-sm font-bold text-white">{section.label}</h3>
                    </div>
                    {avgRating !== null && avgRating !== undefined && (
                      <div className="bg-white/20 px-2 py-1 rounded text-xs font-bold text-white">
                        Avg: {avgRating.toFixed(1)}/5
                      </div>
                    )}
                  </div>
                  
                  {/* Section Responses */}
                  <div className="p-4 space-y-4">
                    {responses.map((response, idx) => (
                      <div key={response.id} className={`${idx !== 0 ? 'pt-4 border-t border-gray-100 dark:border-gray-700' : ''}`}>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {response.question_text_en}
                        </p>
                        {renderResponse(response)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex justify-end border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}