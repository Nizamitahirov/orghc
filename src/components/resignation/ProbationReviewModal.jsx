// components/resignation/ProbationReviewModal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Check, User, Briefcase, Calendar, AlertCircle, Eye } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ProbationReviewModal({ review, onClose, onSuccess, respondentType, viewMode = false }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [existingResponses, setExistingResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isEmployee = respondentType === 'EMPLOYEE';
  const isViewMode = viewMode || (isEmployee && review.employee_responses?.length > 0) || (!isEmployee && review.manager_responses?.length > 0);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      const reviewTypePrefix = isEmployee ? 'EMPLOYEE' : 'MANAGER';
      const reviewTypeSuffix = review.review_period.split('_')[0];
      const reviewType = `${reviewTypePrefix}_${reviewTypeSuffix}`;
      
      const data = await resignationExitService.probationReview.getQuestions(reviewType);
      
      if (!data || data.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }
      
      setQuestions(data);
      
      const existingResponsesList = isEmployee ? review.employee_responses : review.manager_responses;
      
      if (isViewMode && existingResponsesList?.length > 0) {
        const existingMap = {};
        existingResponsesList.forEach(resp => {
          existingMap[resp.question] = resp;
        });
        setExistingResponses(existingMap);
        
        const initialResponses = {};
        data.forEach(q => {
          const existing = existingMap[q.id];
          initialResponses[q.id] = {
            question: q.id,
            rating_value: existing?.rating_value || (q.question_type === 'RATING' ? 3 : null),
            yes_no_value: existing?.yes_no_value ?? null,
            text_value: existing?.text_value || ''
          };
        });
        setResponses(initialResponses);
      } else {
        const initialResponses = {};
        data.forEach(q => {
          initialResponses[q.id] = {
            question: q.id,
            rating_value: q.question_type === 'RATING' ? 3 : null,
            yes_no_value: null,
            text_value: ''
          };
        });
        setResponses(initialResponses);
      }
      
    } catch (err) {
      console.error('❌ Error loading questions:', err);
      alert('Failed to load probation review questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, field, value) => {
    if (isViewMode) return;
    
    setResponses(prev => ({
      ...prev,
      [questionId]: { 
        ...prev[questionId], 
        [field]: value 
      }
    }));
  };

  const handleSubmit = async () => {
    if (isViewMode) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);
      
      const requiredQuestions = questions.filter(q => q.is_required);
      for (const q of requiredQuestions) {
        const response = responses[q.id];
        if (q.question_type === 'RATING' && !response.rating_value) {
          alert(`Please answer: ${q.question_text_en}`);
          setSubmitting(false);
          return;
        }
        if (q.question_type === 'YES_NO' && response.yes_no_value === null) {
          alert(`Please answer: ${q.question_text_en}`);
          setSubmitting(false);
          return;
        }
        if ((q.question_type === 'TEXT' || q.question_type === 'TEXTAREA') && !response.text_value.trim()) {
          alert(`Please answer: ${q.question_text_en}`);
          setSubmitting(false);
          return;
        }
      }

      await resignationExitService.probationReview.submitResponses(
        review.id,
        respondentType,
        Object.values(responses)
      );

      alert('Probation review submitted successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('❌ Error submitting:', err);
      alert(err.response?.data?.detail || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingQuestion = ({ question }) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const currentValue = responses[question.id]?.rating_value || 3;

    return (
      <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-900 dark:text-white mb-2">
          {question.question_text_en}
          {question.is_required && !isViewMode && <span className="text-red-500 ml-1">*</span>}
          {isViewMode && existingResponses[question.id] && (
            <span className="ml-2 text-[10px] text-green-600 dark:text-green-400">(Answered)</span>
          )}
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => !isViewMode && handleResponseChange(question.id, 'rating_value', rating)}
              disabled={isViewMode}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                currentValue >= rating
                  ? 'bg-almet-sapphire text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              } ${!isViewMode ? 'hover:bg-almet-astral dark:hover:bg-almet-steel-blue cursor-pointer' : 'cursor-default opacity-75'}`}
            >
              {rating}
            </button>
          ))}
          <span className="text-xs font-medium text-gray-900 dark:text-white ml-2">
            {labels[currentValue - 1]}
          </span>
        </div>
      </div>
    );
  };

  const YesNoQuestion = ({ question }) => {
    const currentValue = responses[question.id]?.yes_no_value;

    return (
      <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-900 dark:text-white mb-2">
          {question.question_text_en}
          {question.is_required && !isViewMode && <span className="text-red-500 ml-1">*</span>}
          {isViewMode && existingResponses[question.id] && (
            <span className="ml-2 text-[10px] text-green-600 dark:text-green-400">(Answered)</span>
          )}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => !isViewMode && handleResponseChange(question.id, 'yes_no_value', true)}
            disabled={isViewMode}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              currentValue === true
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            } ${!isViewMode ? 'hover:bg-green-700 dark:hover:bg-green-500 cursor-pointer' : 'cursor-default opacity-75'}`}
          >
            ✓ Yes
          </button>
          <button
            type="button"
            onClick={() => !isViewMode && handleResponseChange(question.id, 'yes_no_value', false)}
            disabled={isViewMode}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              currentValue === false
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            } ${!isViewMode ? 'hover:bg-red-700 dark:hover:bg-red-500 cursor-pointer' : 'cursor-default opacity-75'}`}
          >
            ✗ No
          </button>
        </div>
      </div>
    );
  };

  const TextQuestion = ({ question }) => (
    <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
      <label className="block text-xs font-medium text-gray-900 dark:text-white mb-2">
        {question.question_text_en}
        {question.is_required && !isViewMode && <span className="text-red-500 ml-1">*</span>}
        {isViewMode && existingResponses[question.id] && (
          <span className="ml-2 text-[10px] text-green-600 dark:text-green-400">(Answered)</span>
        )}
      </label>
      <input
        type="text"
        value={responses[question.id]?.text_value || ''}
        onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
        disabled={isViewMode}
        className={`w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${
          isViewMode ? 'opacity-75 cursor-default bg-gray-50 dark:bg-gray-800' : ''
        }`}
        placeholder={isViewMode ? '' : 'Your answer...'}
      />
    </div>
  );

  const TextAreaQuestion = ({ question }) => (
    <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
      <label className="block text-xs font-medium text-gray-900 dark:text-white mb-2">
        {question.question_text_en}
        {question.is_required && !isViewMode && <span className="text-red-500 ml-1">*</span>}
        {isViewMode && existingResponses[question.id] && (
          <span className="ml-2 text-[10px] text-green-600 dark:text-green-400">(Answered)</span>
        )}
      </label>
      <textarea
        value={responses[question.id]?.text_value || ''}
        onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
        disabled={isViewMode}
        rows={3}
        className={`w-full px-3 py-2 text-xs border focus:outline-none  border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none ${
          isViewMode ? 'opacity-75 cursor-default bg-gray-50 dark:bg-gray-800' : ''
        }`}
        placeholder={isViewMode ? '' : 'Your answer...'}
      />
    </div>
  );

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case 'RATING': return <RatingQuestion key={question.id} question={question} />;
      case 'YES_NO': return <YesNoQuestion key={question.id} question={question} />;
      case 'TEXT': return <TextQuestion key={question.id} question={question} />;
      case 'TEXTAREA': return <TextAreaQuestion key={question.id} question={question} />;
      default: return null;
    }
  };

  const questionsPerSection = 5;
  const totalSections = Math.ceil(questions.length / questionsPerSection);
  const sections = Array.from({ length: totalSections }, (_, i) => ({
    index: i,
    label: `Section ${i + 1}`,
    questions: questions.slice(i * questionsPerSection, (i + 1) * questionsPerSection)
  }));

  const currentSectionData = sections[currentStep] || { questions: [] };
  const isLastStep = currentStep === sections.length - 1;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-xl">
          <div className="w-10 h-10 border-3 border-almet-sapphire border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-5">
          <div className="text-center">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={28} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              No Questions Available
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              No questions have been configured for this probation review yet.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${isViewMode ? 'bg-almet-astral' : 'bg-gradient-to-r from-almet-sapphire to-almet-astral'} p-3 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isViewMode && (
                <div className="p-1.5 bg-white/20 rounded-md">
                  <Eye size={14} />
                </div>
              )}
              <div>
                <h2 className="text-xs font-semibold">
                  {review.review_period.replace('_', '-')} Probation Review {isViewMode && '(View Only)'}
                </h2>
                <p className="text-white/90 text-[10px] mt-0.5">
                  {review.employee_name} • {isEmployee ? 'Self Assessment' : 'Manager Evaluation'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-md transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Stepper */}
        {sections.length > 1 && (
          <div className="px-3 py-2 bg-almet-mystic dark:bg-almet-cloud-burst/30 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {sections.map((section, idx) => (
                <div key={idx} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(idx)}
                    disabled={submitting}
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all ${
                      idx < currentStep
                        ? 'bg-green-500 text-white'
                        : idx === currentStep
                        ? 'bg-almet-sapphire text-white scale-110'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {idx < currentStep ? <Check size={12} /> : idx + 1}
                  </button>
                  {idx < sections.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1.5 rounded ${
                      idx < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employee Info */}
        <div className="px-3 py-2 bg-almet-mystic/50 dark:bg-almet-cloud-burst/20 border-b border-almet-bali-hai/30 dark:border-gray-700">
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />
              <span className="text-gray-900 dark:text-white font-medium">{review.employee_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />
              <span className="text-gray-700 dark:text-gray-300">{review.position}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />
              <span className="text-gray-700 dark:text-gray-300">{review.review_period.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                {currentSectionData.label} {isViewMode && '(Read Only)'}
              </h3>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                {currentSectionData.questions.length} questions in this section
              </p>
            </div>
            {currentSectionData.questions.map(question => renderQuestion(question))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 flex justify-between bg-gray-50 dark:bg-gray-900/30">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300 dark:border-gray-600"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          
          {!isLastStep ? (
            <button
              onClick={() => setCurrentStep(Math.min(sections.length - 1, currentStep + 1))}
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-xs font-medium transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : isViewMode ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-almet-waterloo text-white rounded-lg hover:bg-almet-comet text-xs font-medium transition-colors"
            >
              Close
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Submit Review
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}