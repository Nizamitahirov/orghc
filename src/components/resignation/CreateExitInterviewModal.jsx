'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Send, Calendar, User, Briefcase, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';
import { employeeService } from "@/services/newsService";
import SearchableDropdown from '@/components/common/SearchableDropdown';

// Separate question components outside main component
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

export default function CreateExitInterviewModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  const [formData, setFormData] = useState({
    employee: '',
    last_working_day: '',
  });

  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [interviewId, setInterviewId] = useState(null);

  const sections = useMemo(() => [
    { id: 'ROLE', label: 'Role', shortLabel: 'Role' },
    { id: 'MANAGEMENT', label: 'Management', shortLabel: 'Mgmt' },
    { id: 'COMPENSATION', label: 'Compensation', shortLabel: 'Comp' },
    { id: 'CONDITIONS', label: 'Work Conditions', shortLabel: 'Work' },
    { id: 'CULTURE', label: 'Culture & Values', shortLabel: 'Culture' },
    { id: 'FINAL', label: 'Final Comments', shortLabel: 'Final' },
  ], []);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployees({ 
        page_size: 1000,
        status__affects_headcount: true
      });
      setEmployees(response.results || []);
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const data = await resignationExitService.exitInterview.getQuestions();
      
      let questionsArray = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [data];
      setQuestions(questionsArray);
      
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
      
    } catch (err) {
      console.error('Error loading questions:', err);
      alert('Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === parseInt(formData.employee)),
    [employees, formData.employee]
  );

  const handleContinue = () => {
    if (!formData.employee) {
      alert('Please select an employee');
      return;
    }
    if (!formData.last_working_day) {
      alert('Please select last working day');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDay = new Date(formData.last_working_day);
    
    if (lastDay < today) {
      alert('Last working day cannot be in the past');
      return;
    }

    setStep(2);
  };

  const handleCreateInterview = async () => {
    try {
      setSubmitting(true);

      const exitInterview = await resignationExitService.exitInterview.createExitInterview({
        employee: formData.employee,
        last_working_day: formData.last_working_day,
      });

      setInterviewId(exitInterview.id);
      await loadQuestions();
      setStep(3);

    } catch (err) {
      console.error('Error creating exit interview:', err);
      alert(err.response?.data?.detail || err.message || 'Failed to create exit interview');
    } finally {
      setSubmitting(false);
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

  const handleSubmitQuestions = async () => {
    try {
      setSubmitting(true);
      
      const requiredQuestions = questions.filter(q => q.is_required);
      for (const q of requiredQuestions) {
        const response = responses[q.id];
        if (q.question_type === 'RATING' && !response.rating_value) {
          alert(`Please answer: ${q.question_text_en}`);
          return;
        }
        if (q.question_type === 'TEXT' && !response.text_value.trim()) {
          alert(`Please answer: ${q.question_text_en}`);
          return;
        }
      }

      await resignationExitService.exitInterview.submitResponses(
        interviewId,
        Object.values(responses)
      );

      alert('Exit interview created and completed successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('Error submitting:', err);
      alert('Failed to submit. Please try again.');
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

  const employeeOptions = useMemo(() => 
    employees.map(emp => ({
      value: emp.id.toString(),
      label: emp.name,
      sublabel: `${emp.employee_id} • ${emp.job_title}`,
    })),
    [employees]
  );

  const sectionQuestions = useMemo(() => 
    questions.filter(q => q.section === sections[currentSection]?.id),
    [questions, sections, currentSection]
  );
  
  const isLastSection = currentSection === sections.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 text-white flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">Create Exit Interview</h2>
            <p className="text-blue-100 text-[10px]">
              {step === 1 ? 'Select employee' : step === 2 ? 'Confirm details' : `Complete questionnaire - ${sections[currentSection]?.label}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Progress Indicator */}
        {step === 3 ? (
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {sections.map((section, idx) => (
                <div key={section.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentSection(idx)}
                    disabled={submitting}
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold transition-all ${
                      idx < currentSection
                        ? 'bg-emerald-500 text-white'
                        : idx === currentSection
                        ? 'bg-almet-sapphire text-white scale-110'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {idx < currentSection ? <Check size={12} /> : idx + 1}
                  </button>
                  {idx < sections.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${
                      idx < currentSection ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {sections.map((section, idx) => (
                <span key={section.id} className={`text-[8px] font-medium ${
                  idx === currentSection ? 'text-almet-sapphire' : 'text-gray-500'
                }`}>
                  {section.shortLabel}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                step >= 1 ? 'bg-almet-sapphire text-white' : 'bg-gray-200 text-gray-500'
              }`}>1</div>
              <div className={`h-0.5 w-12 ${step >= 2 ? 'bg-almet-sapphire' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                step >= 2 ? 'bg-almet-sapphire text-white' : 'bg-gray-200 text-gray-500'
              }`}>2</div>
              <div className={`h-0.5 w-12 ${step >= 3 ? 'bg-almet-sapphire' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                step >= 3 ? 'bg-almet-sapphire text-white' : 'bg-gray-200 text-gray-500'
              }`}>3</div>
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-gray-600 dark:text-gray-400">
              <span className={step === 1 ? 'text-almet-sapphire font-medium' : ''}>Select</span>
              <span className={step === 2 ? 'text-almet-sapphire font-medium' : ''}>Confirm</span>
              <span className={step === 3 ? 'text-almet-sapphire font-medium' : ''}>Questions</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <SearchableDropdown
                  options={employeeOptions}
                  value={formData.employee}
                  onChange={(value) => setFormData({...formData, employee: value})}
                  placeholder="Search employee..."
                  icon={<User size={12} />}
                  portal={true}
                  disabled={loading}
                />
              </div>

              {selectedEmployee && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-[10px] font-medium text-blue-800 dark:text-blue-200 mb-2">Selected:</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex items-start gap-1.5">
                      <User size={10} className="text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-blue-600">Name</p>
                        <p className="font-medium text-blue-900 dark:text-blue-100">{selectedEmployee.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Briefcase size={10} className="text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-blue-600">Position</p>
                        <p className="font-medium text-blue-900 dark:text-blue-100">{selectedEmployee.job_title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Working Day <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                  <input 
                    type="date"
                    value={formData.last_working_day}
                    onChange={(e) => setFormData({...formData, last_working_day: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">Confirm Details</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Employee:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEmployee?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Day:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(formData.last_working_day).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            loadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-almet-sapphire border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {sections[currentSection]?.label}
                </h3>
                {sectionQuestions.map(q => renderQuestion(q))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 flex justify-between border-t border-gray-200 dark:border-gray-700">
          {step === 1 && (
            <>
              <button onClick={onClose} className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 font-medium">
                Cancel
              </button>
              <button 
                onClick={handleContinue}
                disabled={!formData.employee || !formData.last_working_day}
                className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral font-medium disabled:opacity-50 flex items-center gap-1"
              >
                Continue <Send size={11} />
              </button>
            </>
          )}
          
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 font-medium">
                Back
              </button>
              <button 
                onClick={handleCreateInterview}
                disabled={submitting}
                className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center gap-1"
              >
                {submitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>Create & Continue</>
                )}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0 || submitting}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-xs font-medium disabled:opacity-50"
              >
                <ChevronLeft size={12} /> Back
              </button>
              
              {!isLastSection ? (
                <button
                  onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-xs font-medium"
                >
                  Next <ChevronRight size={12} />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuestions}
                  disabled={submitting}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>Submit <Send size={11} /></>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}