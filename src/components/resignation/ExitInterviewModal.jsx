'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

// Separate question components
const TextQuestion = ({ question, value, onChange, disabled }) => {
  return (
    <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:outline-none"
        placeholder="Your answer..."
      />
    </div>
  );
};

const TextAreaQuestion = ({ question, value, onChange, disabled }) => {
  return (
    <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={3}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:outline-none resize-none"
        placeholder="Your answer..."
      />
    </div>
  );
};

const RatingQuestion = ({ question, value, onChange, disabled }) => {
  const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  
  return (
    <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            disabled={disabled}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
              value >= rating
                ? 'bg-almet-sapphire text-white shadow-sm scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {rating}
          </button>
        ))}
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-2">
          {labels[value - 1]}
        </span>
      </div>
    </div>
  );
};

const ChoiceQuestion = ({ question, value, onChange, disabled }) => (
  <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
      {question.question_text_en}
      {question.is_required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
    >
      <option value="">Select...</option>
      {question.choices && question.choices.map((choice, idx) => (
        <option key={idx} value={choice}>{choice}</option>
      ))}
    </select>
  </div>
);

export default function ExitInterviewModal({ interview, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const sections = useMemo(() => [
    { id: 'ROLE', label: 'Role', shortLabel: 'Role' },
    { id: 'MANAGEMENT', label: 'Management', shortLabel: 'Mgmt' },
    { id: 'COMPENSATION', label: 'Compensation', shortLabel: 'Comp' },
    { id: 'CONDITIONS', label: 'Work Conditions', shortLabel: 'Work' },
    { id: 'CULTURE', label: 'Culture & Values', shortLabel: 'Culture' },
    { id: 'FINAL', label: 'Final Comments', shortLabel: 'Final' },
  ], []);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await resignationExitService.exitInterview.getQuestions();
      
      let questionsArray = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [data];
      setQuestions(questionsArray);
      
      // ✅ FIX: Initialize responses with proper structure
      const initialResponses = {};
      questionsArray.forEach(q => {
        initialResponses[q.id] = {
          question: q.id,
          rating_value: q.question_type === 'RATING' ? 3 : null,
          text_value: '',
          choice_value: ''
        };
      });
      setResponses(initialResponses);
      
      console.log('✅ Loaded questions:', questionsArray.length);
      console.log('✅ Initialized responses:', Object.keys(initialResponses).length);
      
    } catch (err) {
      console.error('❌ Error loading questions:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = useCallback((questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        text_value: value
      }
    }));
  }, []);

  const handleRatingChange = useCallback((questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        rating_value: value
      }
    }));
  }, []);

  const handleChoiceChange = useCallback((questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        choice_value: value
      }
    }));
  }, []);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // ✅ Validate required questions
      const requiredQuestions = questions.filter(q => q.is_required);
      for (const q of requiredQuestions) {
        const response = responses[q.id];
        
        if (!response) {
          alert(`Please answer: ${q.question_text_en}`);
          return;
        }
        
        if (q.question_type === 'RATING' && !response.rating_value) {
          alert(`Please provide a rating for: ${q.question_text_en}`);
          return;
        }
        
        if (q.question_type === 'TEXT' && !response.text_value?.trim()) {
          alert(`Please answer: ${q.question_text_en}`);
          return;
        }
        
        if (q.question_type === 'TEXTAREA' && !response.text_value?.trim()) {
          alert(`Please answer: ${q.question_text_en}`);
          return;
        }
        
        if (q.question_type === 'CHOICE' && !response.choice_value) {
          alert(`Please select an option for: ${q.question_text_en}`);
          return;
        }
      }

      // ✅ Prepare payload - ensure all fields are present
      const responsesArray = Object.values(responses).map(r => ({
        question: r.question,
        rating_value: r.rating_value || null,
        text_value: r.text_value || '',
        choice_value: r.choice_value || ''
      }));

      console.log('✅ Submitting responses:', {
        interview_id: interview.id,
        responses_count: responsesArray.length,
        payload: { responses: responsesArray }
      });

      // ✅ Submit to backend
      const result = await resignationExitService.exitInterview.submitResponses(
        interview.id,
        responsesArray
      );

      console.log('✅ Submit result:', result);

      alert('Exit interview completed successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('❌ Error submitting:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message 
        || err.message 
        || 'Failed to submit. Please try again.';
      
      alert(`Submission failed: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = useCallback((question) => {
    const response = responses[question.id] || {};
    
    switch (question.question_type) {
      case 'RATING':
        return (
          <RatingQuestion
            key={question.id}
            question={question}
            value={response.rating_value || 3}
            onChange={(value) => handleRatingChange(question.id, value)}
            disabled={submitting}
          />
        );
      case 'TEXT':
        return (
          <TextQuestion
            key={question.id}
            question={question}
            value={response.text_value || ''}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
            disabled={submitting}
          />
        );
      case 'TEXTAREA':
        return (
          <TextAreaQuestion
            key={question.id}
            question={question}
            value={response.text_value || ''}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
            disabled={submitting}
          />
        );
      case 'CHOICE':
        return (
          <ChoiceQuestion
            key={question.id}
            question={question}
            value={response.choice_value || ''}
            onChange={(e) => handleChoiceChange(question.id, e.target.value)}
            disabled={submitting}
          />
        );
      default:
        return null;
    }
  }, [responses, submitting, handleTextChange, handleRatingChange, handleChoiceChange]);

  const sectionQuestions = useMemo(() => 
    questions.filter(q => q.section === sections[currentStep]?.id),
    [questions, sections, currentStep]
  );

  const isLastStep = currentStep === sections.length - 1;
  const isFirstStep = currentStep === 0;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="w-10 h-10 border-3 border-almet-sapphire border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 text-white flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">Exit Interview</h2>
            <p className="text-blue-100 text-[10px]">{interview.employee_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {sections.map((section, idx) => (
              <div key={section.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(idx)}
                  disabled={submitting}
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all ${
                    idx < currentStep
                      ? 'bg-emerald-500 text-white'
                      : idx === currentStep
                      ? 'bg-almet-sapphire text-white scale-110'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {idx < currentStep ? <Check size={14} /> : idx + 1}
                </button>
                {idx < sections.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${
                    idx < currentStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {sections.map((section, idx) => (
              <span
                key={section.id}
                className={`text-[9px] font-medium ${
                  idx === currentStep ? 'text-almet-sapphire' : 'text-gray-500'
                }`}
              >
                {section.shortLabel}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-3">
            {sections[currentStep].label}
          </h3>
          
          {sectionQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No questions in this section
            </div>
          ) : (
            <div className="space-y-3">
              {sectionQuestions.map(question => renderQuestion(question))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex justify-between border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={isFirstStep || submitting}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          
          {!isLastStep ? (
            <button
              onClick={() => setCurrentStep(Math.min(sections.length - 1, currentStep + 1))}
              disabled={submitting}
              className="flex items-center gap-1 px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-xs font-medium"
            >
              Next
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Submit Interview
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}