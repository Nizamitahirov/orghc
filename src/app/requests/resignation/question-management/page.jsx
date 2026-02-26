'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Plus, Edit2, Trash2, Save, X, GripVertical, Eye, 
  MessageSquare, CheckSquare, List, AlignLeft
} from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function QuestionManagementPage() {
  const [activeType, setActiveType] = useState('exit_interview');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, [activeType]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      let data;
      
      if (activeType === 'exit_interview') {
        data = await resignationExitService.exitInterview.getQuestions();
      } else {
        data = await resignationExitService.probationReview.getQuestions();
      }

      console.log('Loaded questions:', data);
      
      setQuestions(data);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      if (activeType === 'exit_interview') {
        await resignationExitService.exitInterview.deleteQuestion(questionId);
      } else {
        await resignationExitService.probationReview.deleteQuestion(questionId);
      }
      
      await loadQuestions();
      alert('Question deleted successfully!');
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Failed to delete question');
    }
  };

  const QuestionCard = ({ question }) => {
    const typeIcons = {
      RATING: <CheckSquare size={16} />,
      TEXT: <AlignLeft size={16} />,
      TEXTAREA: <MessageSquare size={16} />,
      YES_NO: <CheckSquare size={16} />,
      CHOICE: <List size={16} />
    };

    const sectionColors = {
      ROLE: 'bg-almet-mystic dark:bg-almet-cloud-burst/30 text-almet-sapphire dark:text-almet-steel-blue',
      MANAGEMENT: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      COMPENSATION: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      CONDITIONS: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      CULTURE: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
      FINAL: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
    };

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded cursor-move">
            <GripVertical size={16} className="text-gray-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                  Order: {question.order}
                </span>
                {activeType === 'exit_interview' && (
                  <span className={`text-xs px-2 py-1 rounded font-medium ${sectionColors[question.section]}`}>
                    {question.section}
                  </span>
                )}
                {activeType === 'probation_review' && (
                  <span className="text-xs px-2 py-1 rounded bg-almet-mystic dark:bg-almet-cloud-burst/30 text-almet-sapphire dark:text-almet-steel-blue font-medium">
                    {question.review_type}
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded bg-almet-sapphire/10 text-almet-sapphire dark:text-almet-steel-blue font-medium flex items-center gap-1">
                  {typeIcons[question.question_type]}
                  {question.question_type}
                </span>
                {question.is_required && (
                  <span className="text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">
                    Required
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditQuestion(question)}
                  className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/30 rounded transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-almet-cloud-burst dark:text-gray-200 mb-2">
              {question.question_text_en}
            </p>
            
            {question.question_text_az && (
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai italic">
                AZ: {question.question_text_az}
              </p>
            )}
            
            {question.choices && question.choices.length > 0 && (
              <div className="mt-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                <span className="font-medium">Choices: </span>
                {question.choices.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const groupedQuestions = () => {
    if (activeType === 'exit_interview') {
      const sections = ['ROLE', 'MANAGEMENT', 'COMPENSATION', 'CONDITIONS', 'CULTURE', 'FINAL'];
      return sections.map(section => ({
        label: section,
        questions: questions.filter(q => q.section === section)
      }));
    } else {
      const types = [
        'EMPLOYEE_30', 'MANAGER_30', 
        'EMPLOYEE_60', 'MANAGER_60', 
        'EMPLOYEE_90', 'MANAGER_90'
      ];
      return types.map(type => ({
        label: type,
        questions: questions.filter(q => q.review_type === type)
      }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Question Management</h1>
              <p className="text-blue-100 text-xs mt-1">
                Manage exit interview and probation review questions
              </p>
            </div>
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-white text-almet-sapphire rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>
        </div>

        {/* Type Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 flex gap-1">
          <button
            onClick={() => setActiveType('exit_interview')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeType === 'exit_interview'
                ? 'bg-almet-sapphire text-white'
                : 'text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic dark:hover:bg-gray-700'
            }`}
          >
            Exit Interview Questions
          </button>
          <button
            onClick={() => setActiveType('probation_review')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeType === 'probation_review'
                ? 'bg-almet-sapphire text-white'
                : 'text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic dark:hover:bg-gray-700'
            }`}
          >
            Probation Review Questions
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-almet-sapphire"></div>
            </div>
          ) : (
            groupedQuestions().map((group) => (
              <div key={group.label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-gray-200 mb-3 flex items-center justify-between">
                  {group.label.replace(/_/g, ' ')}
                  <span className="text-xs font-normal text-almet-waterloo dark:text-almet-bali-hai">
                    {group.questions.length} questions
                  </span>
                </h3>
                
                {group.questions.length === 0 ? (
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai text-center py-4">
                    No questions in this section
                  </p>
                ) : (
                  <div className="space-y-3">
                    {group.questions.map(question => (
                      <QuestionCard key={question.id} question={question} />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <QuestionFormModal
            questionType={activeType}
            editingQuestion={editingQuestion}
            onClose={() => {
              setShowModal(false);
              setEditingQuestion(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingQuestion(null);
              loadQuestions();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Question Form Modal Component
function QuestionFormModal({ questionType, editingQuestion, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    question_text_en: editingQuestion?.question_text_en || '',
    question_text_az: editingQuestion?.question_text_az || '',
    question_type: editingQuestion?.question_type || 'RATING',
    section: editingQuestion?.section || 'ROLE',
    review_type: editingQuestion?.review_type || 'EMPLOYEE_30',
    order: editingQuestion?.order || 0,
    is_required: editingQuestion?.is_required || false,
    is_active: editingQuestion?.is_active !== false,
    choices: editingQuestion?.choices || []
  });
  const [choiceInput, setChoiceInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddChoice = () => {
    if (choiceInput.trim()) {
      setFormData({
        ...formData,
        choices: [...formData.choices, choiceInput.trim()]
      });
      setChoiceInput('');
    }
  };

  const handleRemoveChoice = (index) => {
    setFormData({
      ...formData,
      choices: formData.choices.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!formData.question_text_en.trim()) {
      alert('Please enter question text in English');
      return;
    }

    try {
      setSubmitting(true);

      if (questionType === 'exit_interview') {
        if (editingQuestion) {
          await resignationExitService.exitInterview.updateQuestion(editingQuestion.id, formData);
        } else {
          await resignationExitService.exitInterview.createQuestion(formData);
        }
      } else {
        if (editingQuestion) {
          await resignationExitService.probationReview.updateQuestion(editingQuestion.id, formData);
        } else {
          await resignationExitService.probationReview.createQuestion(formData);
        }
      }

      alert(`Question ${editingQuestion ? 'updated' : 'created'} successfully!`);
      onSuccess();
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Failed to save question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 text-white flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.question_type}
              onChange={(e) => setFormData({...formData, question_type: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
            >
              <option value="RATING">Rating (1-5)</option>
              <option value="TEXT">Text Response</option>
              <option value="TEXTAREA">Long Text Response</option>
              {questionType === 'exit_interview' && <option value="CHOICE">Multiple Choice</option>}
              {questionType === 'probation_review' && <option value="YES_NO">Yes/No</option>}
            </select>
          </div>

          {/* Section / Review Type */}
          {questionType === 'exit_interview' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({...formData, section: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
              >
                <option value="ROLE">Role & Responsibilities</option>
                <option value="MANAGEMENT">Work Environment & Management</option>
                <option value="COMPENSATION">Compensation & Career Development</option>
                <option value="CONDITIONS">Work Conditions</option>
                <option value="CULTURE">Company Culture & Values</option>
                <option value="FINAL">Final Comments</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.review_type}
                onChange={(e) => setFormData({...formData, review_type: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
              >
                <option value="EMPLOYEE_30">Employee 30-Day</option>
                <option value="MANAGER_30">Manager 30-Day</option>
                <option value="EMPLOYEE_60">Employee 60-Day</option>
                <option value="MANAGER_60">Manager 60-Day</option>
                <option value="EMPLOYEE_90">Employee 90-Day</option>
                <option value="MANAGER_90">Manager 90-Day</option>
              </select>
            </div>
          )}

          {/* Question Text (English) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Text (English) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question_text_en}
              onChange={(e) => setFormData({...formData, question_text_en: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire resize-none"
              placeholder="Enter question in English..."
            />
          </div>

          {/* Question Text (Azerbaijani) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Text (Azerbaijani)
            </label>
            <textarea
              value={formData.question_text_az}
              onChange={(e) => setFormData({...formData, question_text_az: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire resize-none"
              placeholder="Sualı Azərbaycan dilində daxil edin..."
            />
          </div>

          {/* Choices (for CHOICE type) */}
          {formData.question_type === 'CHOICE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Answer Choices
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={choiceInput}
                  onChange={(e) => setChoiceInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddChoice()}
                  placeholder="Enter choice and press Enter..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
                />
                <button
                  onClick={handleAddChoice}
                  className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1">
                {formData.choices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{choice}</span>
                    <button
                      onClick={() => handleRemoveChoice(index)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                className="w-4 h-4 text-almet-sapphire rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Required Question</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            className="w-4 h-4 text-almet-sapphire rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
        </label>
      </div>
    </div>

    {/* Footer */}
    <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-5 py-3 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
      <button
        onClick={onClose}
        disabled={submitting}
        className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-4 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral disabled:opacity-50 flex items-center gap-2"
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            Saving...
          </>
        ) : (
          <>
            <Save size={14} />
            {editingQuestion ? 'Update' : 'Create'} Question
          </>
        )}
      </button>
    </div>
  </div>
</div>
  )}