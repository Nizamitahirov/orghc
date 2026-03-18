'use client';
import React, { useState, useEffect } from 'react';
import { X, Star, FileText, TrendingUp, MessageSquare, BarChart3, Loader2 } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ViewExitInterviewModal({ interview, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const detail = await resignationExitService.exitInterview.getExitInterview(interview.id);
        setData(detail);
      } catch (err) {
        console.error('Error loading exit interview detail:', err);
        setError('Failed to load interview data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [interview.id]);

  // Each section uses Almet palette classes only
  const sections = [
    {
      id: 'ROLE',
      label: 'Role & Responsibilities',
      icon: FileText,
      headerBg: 'bg-almet-sapphire',
      badgeBg: 'bg-almet-cloud-burst',
      stripeBg: 'bg-almet-mystic dark:bg-almet-cloud-burst/30',
    },
    {
      id: 'MANAGEMENT',
      label: 'Management & Leadership',
      icon: TrendingUp,
      headerBg: 'bg-almet-cloud-burst',
      badgeBg: 'bg-almet-sapphire',
      stripeBg: 'bg-almet-mystic dark:bg-almet-cloud-burst/30',
    },
    {
      id: 'COMPENSATION',
      label: 'Compensation & Growth',
      icon: Star,
      headerBg: 'bg-almet-san-juan',
      badgeBg: 'bg-almet-cloud-burst',
      stripeBg: 'bg-almet-mystic dark:bg-almet-cloud-burst/30',
    },
    {
      id: 'CONDITIONS',
      label: 'Work Conditions',
      icon: FileText,
      headerBg: 'bg-almet-astral',
      badgeBg: 'bg-almet-san-juan',
      stripeBg: 'bg-almet-mystic dark:bg-almet-cloud-burst/30',
    },
    {
      id: 'CULTURE',
      label: 'Culture & Values',
      icon: Star,
      headerBg: 'bg-almet-steel-blue',
      badgeBg: 'bg-almet-astral',
      stripeBg: 'bg-almet-mystic dark:bg-almet-cloud-burst/30',
    },
    {
      id: 'FINAL',
      label: 'Final Comments',
      icon: MessageSquare,
      headerBg: 'bg-almet-comet',
      badgeBg: 'bg-almet-cloud-burst',
      stripeBg: 'bg-almet-mystic dark:bg-almet-cloud-burst/30',
    },
  ];

  const getSectionResponses = (sectionId) =>
    data?.responses?.filter(r => r.section === sectionId) || [];

  const renderResponse = (response) => {
    const question_type = response.question_type || response.question?.question_type;
    const { rating_value, text_value, choice_value } = response;

    if (question_type === 'RATING') {
      // Rating bar colours mapped to Almet shades
      const colors = [
        'bg-almet-bali-hai',
        'bg-almet-waterloo',
        'bg-almet-steel-blue',
        'bg-almet-astral',
        'bg-almet-sapphire',
      ];
      const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
      return (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                rating_value >= star
                  ? `${colors[rating_value - 1]} text-white`
                  : 'bg-almet-mystic dark:bg-gray-700 text-almet-waterloo'
              }`}
            >
              {star}
            </div>
          ))}
          {rating_value && (
            <span className="text-xs font-medium text-almet-cloud-burst dark:text-almet-bali-hai ml-2">
              {labels[rating_value - 1]}
            </span>
          )}
        </div>
      );
    }

    if (question_type === 'TEXT' || question_type === 'TEXTAREA') {
      return (
        <p className="text-xs text-almet-cloud-burst dark:text-almet-bali-hai bg-almet-mystic dark:bg-almet-cloud-burst/20 p-3 rounded-lg border border-almet-bali-hai/30 dark:border-almet-waterloo/30">
          {text_value || <em className="text-almet-waterloo">No response provided</em>}
        </p>
      );
    }

    if (question_type === 'CHOICE') {
      return (
        <p className="text-xs text-almet-sapphire dark:text-almet-steel-blue font-medium bg-almet-mystic dark:bg-almet-cloud-burst/20 p-2 rounded border border-almet-sapphire/30 dark:border-almet-steel-blue/30">
          {choice_value || <em className="text-almet-waterloo">No selection made</em>}
        </p>
      );
    }

    return null;
  };

  const getSectionAverage = (sectionId) => {
    if (!data?.summary) return null;
    const avgMap = {
      ROLE: data.summary.role_avg_rating,
      MANAGEMENT: data.summary.management_avg_rating,
      COMPENSATION: data.summary.compensation_avg_rating,
      CONDITIONS: data.summary.conditions_avg_rating,
      CULTURE: data.summary.culture_avg_rating,
    };
    return avgMap[sectionId];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-almet-cloud-burst to-almet-sapphire p-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Exit Interview Results</h2>
            <p className="text-almet-mystic text-xs mt-0.5">
              {interview.employee_name} • {interview.employee_id}
            </p>
            <p className="text-almet-bali-hai text-[10px] mt-0.5">
              Completed:{' '}
              {interview.completed_at
                ? new Date(interview.completed_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })
                : 'In Progress'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-almet-sapphire" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-500 text-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Summary Card */}
              {data?.summary && (
                <div className="p-4 bg-gradient-to-br from-almet-mystic to-almet-bali-hai/20 dark:from-almet-cloud-burst/30 dark:to-almet-sapphire/20 border-b border-almet-bali-hai/30 dark:border-almet-waterloo/30">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={16} className="text-almet-sapphire" />
                    <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-almet-mystic">
                      Overall Summary
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Overall Rating */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-almet-bali-hai/30 dark:border-almet-waterloo/30">
                      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-1">
                        Overall Rating
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-almet-sapphire">
                          {data.summary.overall_avg_rating?.toFixed(1)}
                        </span>
                        <span className="text-xs text-almet-waterloo">/ 5.0</span>
                      </div>
                    </div>
                    {/* Would Recommend */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-almet-bali-hai/30 dark:border-almet-waterloo/30">
                      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-1">
                        Would Recommend
                      </p>
                      <span
                        className={`text-lg font-bold ${
                          data.summary.would_recommend_company
                            ? 'text-almet-astral'
                            : 'text-almet-comet'
                        }`}
                      >
                        {data.summary.would_recommend_company ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    {/* Last Working Day */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-almet-bali-hai/30 dark:border-almet-waterloo/30">
                      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-1">
                        Last Working Day
                      </p>
                      <span className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                        {data.last_working_day
                          ? new Date(data.last_working_day).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Responses */}
              <div className="p-4 space-y-6">
                {sections.map((section) => {
                  const responses = getSectionResponses(section.id);
             
                  const Icon = section.icon;
                  if (responses.length === 0) return null;

                  return (
                    <div
                      key={section.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-almet-bali-hai/30 dark:border-almet-waterloo/30 overflow-hidden"
                    >
                      {/* Section header */}
                      <div className={`${section.headerBg} p-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-white" />
                          <h3 className="text-sm font-bold text-white">{section.label}</h3>
                        </div>
                       
                      </div>

                      {/* Questions */}
                      <div className="p-4 space-y-4">
                        {responses.map((response, idx) => (
                          <div
                            key={response.id}
                            className={idx !== 0 ? 'pt-4 border-t border-almet-mystic dark:border-almet-waterloo/20' : ''}
                          >
                            <p className="text-xs font-semibold text-almet-cloud-burst dark:text-almet-mystic mb-2">
                              {response.question_text_en}
                            </p>
                            {renderResponse(response)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {data?.responses?.length === 0 && (
                  <div className="text-center py-8 text-almet-waterloo text-sm">
                    No responses found for this interview.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-almet-mystic dark:bg-gray-900 px-4 py-3 flex justify-end border-t border-almet-bali-hai/30 dark:border-almet-waterloo/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}