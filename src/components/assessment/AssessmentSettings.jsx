'use client';
import React, { useState, useEffect } from 'react';
import { 
  Settings, ArrowLeft, Plus, Edit, Trash2, Save, X, 
  Target, Users, Award, Scale, Loader2
} from 'lucide-react';
import { assessmentApi } from '@/services/assessmentApi';

// Import common components
import ActionButton from './ActionButton';
import { useToast } from '@/components/common/Toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import ConfirmationModal from '@/components/common/ConfirmationModal';

// Status Badge Component
const StatusBadge = ({ isActive }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
    isActive 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700'
  }`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

// Assessment Table Component
const AssessmentTable = ({ data, type, onEdit, onDelete,canAccessManagement }) => {
  const getColumns = () => {
    const baseColumns = [
      { 
        key: 'scale', 
        label: 'Scale', 
        render: (item) => (
          <div className="flex items-center">
            <span className="bg-almet-sapphire text-white px-2 py-1 rounded-full text-xs font-semibold">
              {item.scale}
            </span>
          </div>
        )
      },
      { 
        key: 'description', 
        label: 'Description', 
        render: (item) => <span className="text-gray-900 text-sm">{item.description}</span> 
      },
      { 
        key: 'status', 
        label: 'Status', 
        render: (item) => <StatusBadge isActive={item.is_active} /> 
      },
      { 
        key: 'created_at', 
        label: 'Created', 
        render: (item) => (
          <span className="text-xs text-gray-500">
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        )
      }
    ];

    if (type === 'letter') {
      baseColumns[0] = { 
        key: 'grade', 
        label: 'Grade', 
        render: (item) => (
          <div className="flex items-center">
            <span className="bg-almet-sapphire text-white px-2 py-1 rounded-full text-sm font-semibold">
              {item.letter_grade}
            </span>
          </div>
        )
      };
      baseColumns[1] = { 
        key: 'range', 
        label: 'Range', 
        render: (item) => (
          <span className="font-medium text-gray-900 text-sm">
            {item.min_percentage}% - {item.max_percentage}%
          </span>
        )
      };
    }

    return baseColumns;
  };

  const columns = getColumns();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col, idx) => (
              <th key={idx} className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                {col.label}
              </th>
            ))}
            <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className="py-3 px-4">
                    {col.render(item)}
                  </td>
                ))}
                <td className="py-3 px-4 text-center">
                  {canAccessManagement() && (
                  <div className="flex items-center justify-center gap-2">
                    <ActionButton
                      onClick={() => onEdit(item, type)}
                      icon={Edit}
                      label=""
                      variant="info"
                      size="xs"
                    />
                    <ActionButton
                      onClick={() => onDelete(item.id, type)}
                      icon={Trash2}
                      label=""
                      variant="danger"
                      size="xs"
                    />
                  </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-12">
                <Scale className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">No {type} scales found</p>
                <p className="text-gray-400 text-sm mt-1">Create your first {type} scale</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Form Modal Component
const FormModal = ({ show, onClose, title, icon: Icon, children, onSubmit, submitLabel, isSubmitting, canSubmit }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon className="w-5 h-5 text-almet-sapphire" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {children}
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <ActionButton
            onClick={onClose}
            icon={X}
            label="Cancel"
            disabled={isSubmitting}
            variant="outline"
            size="md"
          />
          <ActionButton
            onClick={onSubmit}
            icon={Save}
            label={submitLabel}
            disabled={!canSubmit}
            loading={isSubmitting}
            variant="primary"
            size="md"
          />
        </div>
      </div>
    </div>
  );
};

// Form Input Component
const FormInput = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const AssessmentSettings = ({ canAccessManagement }) => {
  const { showSuccess, showError } = useToast();
  
  // States
  const [activeSection, setActiveSection] = useState('behavioral');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data states
  const [behavioralScales, setBehavioralScales] = useState([]);
  const [coreScales, setCoreScales] = useState([]);
  const [letterGrades, setLetterGrades] = useState([]);
  
  // Modal states
  const [showBehavioralModal, setShowBehavioralModal] = useState(false);
  const [showCoreModal, setShowCoreModal] = useState(false);
  const [showLetterGradeModal, setShowLetterGradeModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });
  
  // Form states
  const [behavioralFormData, setBehavioralFormData] = useState({
    scale: '',
    description: '',
    is_active: true
  });
  
  const [coreFormData, setCoreFormData] = useState({
    scale: '',
    description: '',
    is_active: true
  });
  
  const [letterGradeFormData, setLetterGradeFormData] = useState({
    letter_grade: '',
    min_percentage: '',
    max_percentage: '',
    description: '',
    is_active: true
  });

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      const [behavioralRes, coreRes, letterGradesRes] = await Promise.all([
        assessmentApi.behavioralScales.getAll(),
        assessmentApi.coreScales.getAll(),
        assessmentApi.letterGrades.getAll()
      ]);
      
      setBehavioralScales(behavioralRes.results || []);
      setCoreScales(coreRes.results || []);
      setLetterGrades(letterGradesRes.results || []);
      
    } catch (err) {
      console.error('Error fetching settings data:', err);
      showError('Failed to load settings data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle CRUD operations
  const handleCreateBehavioral = async () => {
    if (!behavioralFormData.scale || !behavioralFormData.description) {
      showError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await assessmentApi.behavioralScales.update(editingItem.id, behavioralFormData);
        showSuccess('Behavioral scale updated successfully');
      } else {
        await assessmentApi.behavioralScales.create(behavioralFormData);
        showSuccess('Behavioral scale created successfully');
      }
      
      await fetchData();
      setShowBehavioralModal(false);
      setBehavioralFormData({ scale: '', description: '', is_active: true });
      setEditingItem(null);
    } catch (err) {
      console.error('Error with behavioral scale:', err);
      showError('Failed to save behavioral scale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCore = async () => {
    if (!coreFormData.scale || !coreFormData.description) {
      showError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await assessmentApi.coreScales.update(editingItem.id, coreFormData);
        showSuccess('Core scale updated successfully');
      } else {
        await assessmentApi.coreScales.create(coreFormData);
        showSuccess('Core scale created successfully');
      }
      
      await fetchData();
      setShowCoreModal(false);
      setCoreFormData({ scale: '', description: '', is_active: true });
      setEditingItem(null);
    } catch (err) {
      console.error('Error with core scale:', err);
      showError('Failed to save core scale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLetterGrade = async () => {
    if (!letterGradeFormData.letter_grade || !letterGradeFormData.min_percentage || !letterGradeFormData.max_percentage) {
      showError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await assessmentApi.letterGrades.update(editingItem.id, letterGradeFormData);
        showSuccess('Letter grade updated successfully');
      } else {
        await assessmentApi.letterGrades.create(letterGradeFormData);
        showSuccess('Letter grade created successfully');
      }
      
      await fetchData();
      setShowLetterGradeModal(false);
      setLetterGradeFormData({ letter_grade: '', min_percentage: '', max_percentage: '', description: '', is_active: true });
      setEditingItem(null);
    } catch (err) {
      console.error('Error with letter grade:', err);
      showError('Failed to save letter grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          if (type === 'behavioral') {
            await assessmentApi.behavioralScales.delete(id);
          } else if (type === 'core') {
            await assessmentApi.coreScales.delete(id);
          } else if (type === 'letter') {
            await assessmentApi.letterGrades.delete(id);
          }
          
          await fetchData();
          showSuccess('Item deleted successfully');
        } catch (err) {
          console.error('Delete error:', err);
          showError('Failed to delete item');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    if (type === 'behavioral') {
      setBehavioralFormData({
        scale: item.scale,
        description: item.description,
        is_active: item.is_active
      });
      setShowBehavioralModal(true);
    } else if (type === 'core') {
      setCoreFormData({
        scale: item.scale,
        description: item.description,
        is_active: item.is_active
      });
      setShowCoreModal(true);
    } else if (type === 'letter') {
      setLetterGradeFormData({
        letter_grade: item.letter_grade,
        min_percentage: item.min_percentage,
        max_percentage: item.max_percentage,
        description: item.description,
        is_active: item.is_active
      });
      setShowLetterGradeModal(true);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading assessment settings..." />;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto py-6 space-y-6">


        {/* Section Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex p-2 gap-2">
            <button
              onClick={() => setActiveSection('behavioral')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeSection === 'behavioral'
                  ? 'bg-almet-sapphire text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={16} />
                Behavioral Settings
              </div>
            </button>
            
            <button
              onClick={() => setActiveSection('core')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeSection === 'core'
                  ? 'bg-almet-sapphire text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Target size={16} />
                Core Settings
              </div>
            </button>
            
            <button
              onClick={() => setActiveSection('grading')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeSection === 'grading'
                  ? 'bg-almet-sapphire text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Award size={16} />
                Letter Grading
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with Add Button */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {activeSection === 'behavioral' && <><Users size={18} />Behavioral Competency Scales</>}
              {activeSection === 'core' && <><Target size={18} />Core Competency Scales</>}
              {activeSection === 'grading' && <><Award size={18} />Letter Grade Mapping</>}
            </h3>
            {
              canAccessManagement() && (<ActionButton
              onClick={() => {
                if (activeSection === 'behavioral') setShowBehavioralModal(true);
                else if (activeSection === 'core') setShowCoreModal(true);
                else if (activeSection === 'grading') setShowLetterGradeModal(true);
              }}
              icon={Plus}
              label="Add New"
              variant="primary"
              size="md"
            />  )
            }
            
          </div>

          {/* Content */}
          <div className="p-4">
            {activeSection === 'behavioral' && (
              <AssessmentTable 
              canAccessManagement={canAccessManagement}
                data={behavioralScales}
                type="behavioral"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}

            {activeSection === 'core' && (
              <AssessmentTable 
              canAccessManagement={canAccessManagement}
                data={coreScales}
                type="core"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}

            {activeSection === 'grading' && (
              <AssessmentTable 
              canAccessManagement={canAccessManagement}
                data={letterGrades}
                type="letter"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>

        {/* Behavioral Scale Modal */}
        <FormModal
          show={showBehavioralModal}
          onClose={() => {
            setShowBehavioralModal(false);
            setBehavioralFormData({ scale: '', description: '', is_active: true });
            setEditingItem(null);
          }}
          title={editingItem ? 'Edit Behavioral Scale' : 'Create Behavioral Scale'}
          icon={Users}
          onSubmit={handleCreateBehavioral}
          submitLabel={editingItem ? 'Update' : 'Create'}
          isSubmitting={isSubmitting}
          canSubmit={behavioralFormData.scale && behavioralFormData.description}
        >
          <FormInput label="Scale Number" required>
            <input
              type="number"
              value={behavioralFormData.scale}
              onChange={(e) => setBehavioralFormData({...behavioralFormData, scale: parseInt(e.target.value) || ''})}
              placeholder="Enter scale number (e.g., 1, 2, 3...)"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </FormInput>
          
          <FormInput label="Description" required>
            <textarea
              value={behavioralFormData.description}
              onChange={(e) => setBehavioralFormData({...behavioralFormData, description: e.target.value})}
              placeholder="Enter scale description..."
              rows="3"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </FormInput>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="behavioral-active"
              checked={behavioralFormData.is_active}
              onChange={(e) => setBehavioralFormData({...behavioralFormData, is_active: e.target.checked})}
              className="h-4 w-4 outline-0 text-almet-sapphire focus:ring-almet-sapphire border-gray-300 rounded"
            />
            <label htmlFor="behavioral-active" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>
        </FormModal>

        {/* Core Scale Modal */}
        <FormModal
          show={showCoreModal}
          onClose={() => {
            setShowCoreModal(false);
            setCoreFormData({ scale: '', description: '', is_active: true });
            setEditingItem(null);
          }}
          title={editingItem ? 'Edit Core Scale' : 'Create Core Scale'}
          icon={Target}
          onSubmit={handleCreateCore}
          submitLabel={editingItem ? 'Update' : 'Create'}
          isSubmitting={isSubmitting}
          canSubmit={coreFormData.scale && coreFormData.description}
        >
          <FormInput label="Scale Number" required>
            <input
              type="number"
              value={coreFormData.scale}
              onChange={(e) => setCoreFormData({...coreFormData, scale: parseInt(e.target.value) || ''})}
              placeholder="Enter scale number (e.g., 0, 1, 2, 3...)"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </FormInput>
          
          <FormInput label="Description" required>
            <textarea
              value={coreFormData.description}
              onChange={(e) => setCoreFormData({...coreFormData, description: e.target.value})}
              placeholder="Enter scale description..."
              rows="3"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </FormInput>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="core-active"
              checked={coreFormData.is_active}
              onChange={(e) => setCoreFormData({...coreFormData, is_active: e.target.checked})}
              className="h-4 w-4 outline-0 text-almet-sapphire focus:ring-almet-sapphire border-gray-300 rounded"
            />
            <label htmlFor="core-active" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>
        </FormModal>

        {/* Letter Grade Modal */}
        <FormModal
          show={showLetterGradeModal}
          onClose={() => {
            setShowLetterGradeModal(false);
            setLetterGradeFormData({ letter_grade: '', min_percentage: '', max_percentage: '', description: '', is_active: true });
            setEditingItem(null);
          }}
          title={editingItem ? 'Edit Letter Grade' : 'Create Letter Grade'}
          icon={Award}
          onSubmit={handleCreateLetterGrade}
          submitLabel={editingItem ? 'Update' : 'Create'}
          isSubmitting={isSubmitting}
          canSubmit={letterGradeFormData.letter_grade && letterGradeFormData.min_percentage && letterGradeFormData.max_percentage}
        >
          <FormInput label="Letter Grade" required>
            <input
              type="text"
              value={letterGradeFormData.letter_grade}
              onChange={(e) => setLetterGradeFormData({...letterGradeFormData, letter_grade: e.target.value.toUpperCase()})}
              placeholder="Enter grade letter (A, B, C, D, E, F)"
              className="w-full px-3 py-2 outline-0 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </FormInput>
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Min %" required>
              <input
                type="number"
                value={letterGradeFormData.min_percentage}
                onChange={(e) => setLetterGradeFormData({...letterGradeFormData, min_percentage: e.target.value})}
                placeholder="0"
                min="0"
                max="100"
                className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              />
            </FormInput>
            
            <FormInput label="Max %" required>
              <input
                type="number"
                value={letterGradeFormData.max_percentage}
                onChange={(e) => setLetterGradeFormData({...letterGradeFormData, max_percentage: e.target.value})}
                placeholder="100"
                min="0"
                max="100"
                className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              />
            </FormInput>
          </div>
          
          <FormInput label="Description">
            <textarea
              value={letterGradeFormData.description}
              onChange={(e) => setLetterGradeFormData({...letterGradeFormData, description: e.target.value})}
              placeholder="Enter grade description..."
              rows="3"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </FormInput>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="letter-active"
              checked={letterGradeFormData.is_active}
              onChange={(e) => setLetterGradeFormData({...letterGradeFormData, is_active: e.target.checked})}
              className="h-4 w-4 text-almet-sapphire outline-0 focus:ring-almet-sapphire border-gray-300 rounded"
            />
            <label htmlFor="letter-active" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>
        </FormModal>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
};

export default AssessmentSettings;