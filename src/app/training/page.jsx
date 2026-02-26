'use client'
import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Users } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import trainingService from '@/services/trainingService';
import { employeeService } from '@/services/newsService';
import jobDescriptionService from '@/services/jobDescriptionService';
import { useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import AllTrainingsTab from '@/components/training/AllTrainingsTab';
import AssignmentsTab from '@/components/training/AssignmentsTab';
import MyTrainingsTab from '@/components/training/MyTrainingsTab';
import CreateEditTrainingModal from '@/components/training/CreateEditTrainingModal';
import TrainingDetailModal from '@/components/training/TrainingDetailModal';
import AssignmentDetailModal from '@/components/training/AssignmentDetailModal';
import BulkAssignModal from '@/components/training/BulkAssignModal';
import PdfViewerModal from '@/components/training/PdfViewerModal';

const TrainingManagement = () => {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('all-trainings');
  const [trainings, setTrainings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [myTrainings, setMyTrainings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [userAccess, setUserAccess] = useState(null);
  const [accessLoading, setAccessLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 12,
    total: 0
  });

  const [assignmentPagination, setAssignmentPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0
  });
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedTrainingIds, setSelectedTrainingIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, type: null });
  const [showAssignmentDetailModal, setShowAssignmentDetailModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true,
    requires_completion: false,
    completion_deadline_days: '',
    materials: []
  });
  
  const [materialForm, setMaterialForm] = useState({
    file: null,
  });
  
  const [assignFormData, setAssignFormData] = useState({
    training_ids: [],
    employee_ids: [],
    due_date: '',
    is_mandatory: false,
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Theme colors
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  // Fetch user access on mount
  useEffect(() => {
    fetchUserAccess();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, pagination.page, assignmentPagination.page]);

  useEffect(() => {
    if (activeTab === 'all-trainings') {
      loadStatistics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (userAccess?.is_admin) {
      loadEmployees();
    }
  }, [userAccess]);

  const fetchUserAccess = async () => {
    try {
      setAccessLoading(true);
      const accessInfo = await jobDescriptionService.getMyAccessInfo();
      setUserAccess(accessInfo);
    } catch (error) {
      console.error('Error fetching user access:', error);
      toast.showError('Failed to load access information');
    } finally {
      setAccessLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getEmployees({ page_size: 100 });
      setEmployees(response.results || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.showError('Failed to load employees');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all-trainings') {
        const params = {
          search: searchTerm,
          page: pagination.page,
          page_size: pagination.page_size
        };
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null) delete params[key];
        });
        
        const data = await trainingService.trainings.getAll(params);
        setTrainings(data.results || []);
        setPagination(prev => ({ ...prev, total: data.count || 0 }));
      } else if (activeTab === 'my-trainings') {
        const data = await trainingService.assignments.getMyTrainings();
        setMyTrainings(data);
      } else if (activeTab === 'assignments') {
        const params = {
          search: searchTerm,
          page: assignmentPagination.page,
          page_size: assignmentPagination.page_size
        };
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null) delete params[key];
        });
        
        const data = await trainingService.assignments.getAll(params);
        setAssignments(data.results || []);
        setAssignmentPagination(prev => ({ ...prev, total: data.count || 0 }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await trainingService.trainings.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSearch = () => {
    if (activeTab === 'assignments') {
      setAssignmentPagination({ ...assignmentPagination, page: 1 });
    } else {
      setPagination({ ...pagination, page: 1 });
    }
    loadData();
  };

  const handleViewDetails = async (trainingId) => {
    try {
      const data = await trainingService.trainings.getById(trainingId);
      setSelectedTraining(data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading training details:', error);
      toast.showError('Failed to load training details');
    }
  };

  const handleViewAssignmentDetails = async (assignmentId) => {
    try {
      const data = await trainingService.assignments.getById(assignmentId);
      console.log('Assignment details:', data);
      
      // Fetch training details to get materials
      if (data.training) {
        try {
          const trainingDetails = await trainingService.trainings.getById(data.training);
          console.log('Training details:', trainingDetails);
          
          // Merge materials into assignment
          data.materials = trainingDetails.materials || [];
          
          // Fetch material completion status for this assignment
          // Backend might have completed_materials or material_completions field
          // For now, we'll check if there's a separate endpoint or field
          console.log('Materials:', data.materials);
          console.log('Completed materials count:', data.materials_completed_count);
          
        } catch (err) {
          console.error('Error fetching training materials:', err);
        }
      }
      
      setSelectedAssignment(data);
      setShowAssignmentDetailModal(true);
    } catch (error) {
      console.error('Error loading assignment details:', error);
      toast.showError('Failed to load assignment details');
    }
  };

  const handleCreateTraining = () => {
    setFormData({
      title: '',
      description: '',
      is_active: true,
      requires_completion: false,
      completion_deadline_days: '',
      materials: []
    });
    setErrors({});
    setShowCreateModal(true);
  };

  const handleEditTraining = async (training) => {
    setFormData({
      title: training.title,
      description: training.description,
      is_active: training.is_active,
      requires_completion: training.requires_completion,
      completion_deadline_days: training.completion_deadline_days || '',
      materials: []
    });
    setSelectedTraining(training);
    setErrors({});
    setShowEditModal(true);
  };

  const handleDeleteTraining = async (trainingId) => {
    setDeleteConfirm({ show: true, id: trainingId, type: 'training' });
  };

  const handleDeleteAssignment = async (assignmentId) => {
    setDeleteConfirm({ show: true, id: assignmentId, type: 'assignment' });
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfirm.type === 'training') {
        await trainingService.trainings.delete(deleteConfirm.id);
        toast.showSuccess('Training deleted successfully!');
      } else if (deleteConfirm.type === 'assignment') {
        await trainingService.assignments.delete(deleteConfirm.id);
        toast.showSuccess('Assignment deleted successfully!');
      }
      setDeleteConfirm({ show: false, id: null, type: null });
      loadData();
      if (deleteConfirm.type === 'training') {
        loadStatistics();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.showError('Error deleting: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAssignTraining = () => {
    if (selectedTrainingIds.length === 0) {
      toast.showWarning('Please select at least one training');
      return;
    }
    
    setAssignFormData({
      training_ids: selectedTrainingIds,
      employee_ids: [],
      due_date: '',
      is_mandatory: false,
      notes: ''
    });
    setErrors({});
    setShowAssignModal(true);
  };

  const handleAssignSingleTraining = (trainingId) => {
    setAssignFormData({
      training_ids: [trainingId],
      employee_ids: [],
      due_date: '',
      is_mandatory: false,
      notes: ''
    });
    setErrors({});
    setShowAssignModal(true);
  };

  const handleToggleTraining = (trainingId) => {
    setSelectedTrainingIds(prev => {
      if (prev.includes(trainingId)) {
        return prev.filter(id => id !== trainingId);
      } else {
        return [...prev, trainingId];
      }
    });
  };

  const handleToggleAllTrainings = () => {
    if (selectedTrainingIds.length === trainings.length) {
      setSelectedTrainingIds([]);
    } else {
      setSelectedTrainingIds(trainings.map(t => t.id));
    }
  };

  const handleViewPdf = (url) => {
    setPdfUrl(url);
    setShowPdfViewerModal(true);
  };

  // Filter tabs based on user access
  const tabs = [
    { id: 'all-trainings', label: 'All Trainings', icon: BookOpen },
    ...(userAccess?.is_admin ? [{ id: 'assignments', label: 'Assignments', icon: Users }] : []),
    { id: 'my-trainings', label: 'My Trainings', icon: Users },
  ];

  if (accessLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen p-3 sm:p-5 flex items-center justify-center">
          <div className={`text-center ${textSecondary}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-3 sm:p-5">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className={`${bgCard} rounded-xl shadow-lg p-4 mb-5 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary} flex items-center gap-2.5`}>
                  <div className="p-2 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl shadow-lg">
                    <BookOpen className="text-white" size={20} />
                  </div>
                  Training Management
                </h1>
                <p className={`${textSecondary} text-xs mt-1`}>Manage employee training programs and track progress</p>
              </div>
              <div className="flex gap-2">
                {userAccess?.is_admin && selectedTrainingIds.length > 0 && (
                  <button
                    onClick={handleAssignTraining}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg text-xs font-medium"
                  >
                    <Users size={16} />
                    Assign ({selectedTrainingIds.length})
                  </button>
                )}
                {userAccess?.is_admin && (
                  <button
                    onClick={handleCreateTraining}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg text-xs font-medium"
                  >
                    <Plus size={16} />
                    New Training
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className={`flex gap-2 border-b ${borderColor}`}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm('');
                    setSelectedTrainingIds([]);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2.5 font-medium transition-all text-xs relative ${
                    activeTab === tab.id
                      ? 'text-almet-sapphire dark:text-almet-steel-blue'
                      : `${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-almet-sapphire to-almet-astral"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'all-trainings' && (
            <AllTrainingsTab
              trainings={trainings}
              statistics={statistics}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
              selectedTrainingIds={selectedTrainingIds}
              handleToggleTraining={handleToggleTraining}
              handleToggleAllTrainings={handleToggleAllTrainings}
              handleViewDetails={handleViewDetails}
              handleEditTraining={handleEditTraining}
              handleDeleteTraining={handleDeleteTraining}
              handleAssignSingleTraining={handleAssignSingleTraining}
              pagination={pagination}
              setPagination={setPagination}
              darkMode={darkMode}
              bgCard={bgCard}
              bgCardHover={bgCardHover}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              borderColor={borderColor}
              isAdmin={userAccess?.is_admin}
            />
          )}

          {activeTab === 'assignments' && userAccess?.is_admin && (
            <AssignmentsTab
              assignments={assignments}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
              handleViewAssignmentDetails={handleViewAssignmentDetails}
              handleDeleteAssignment={handleDeleteAssignment}
              assignmentPagination={assignmentPagination}
              setAssignmentPagination={setAssignmentPagination}
              darkMode={darkMode}
              bgCard={bgCard}
              bgCardHover={bgCardHover}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              borderColor={borderColor}
            />
          )}

          {activeTab === 'my-trainings' && (
            <MyTrainingsTab
              myTrainings={myTrainings}
              handleViewAssignmentDetails={handleViewAssignmentDetails}
              darkMode={darkMode}
              bgCard={bgCard}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textMuted={textMuted}
              borderColor={borderColor}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {userAccess?.is_admin && (
        <>
          <CreateEditTrainingModal
            show={showCreateModal || showEditModal}
            isEdit={showEditModal}
            formData={formData}
            setFormData={setFormData}
            materialForm={materialForm}
            setMaterialForm={setMaterialForm}
            errors={errors}
            setErrors={setErrors}
            submitLoading={submitLoading}
            setSubmitLoading={setSubmitLoading}
            onClose={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
            }}
            onSuccess={() => {
              loadData();
              loadStatistics();
            }}
            selectedTraining={selectedTraining}
            trainingService={trainingService}
            toast={toast}
            darkMode={darkMode}
            bgCard={bgCard}
            bgCardHover={bgCardHover}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            borderColor={borderColor}
          />

          <BulkAssignModal
            show={showAssignModal}
            assignFormData={assignFormData}
            setAssignFormData={setAssignFormData}
            employees={employees}
            errors={errors}
            submitLoading={submitLoading}
            setSubmitLoading={setSubmitLoading}
            onClose={() => setShowAssignModal(false)}
            onSuccess={() => {
              setSelectedTrainingIds([]);
              loadData();
              loadStatistics();
            }}
            trainingService={trainingService}
            toast={toast}
            darkMode={darkMode}
            bgCard={bgCard}
            bgCardHover={bgCardHover}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            borderColor={borderColor}
          />

          <ConfirmationModal
            isOpen={deleteConfirm.show}
            onClose={() => setDeleteConfirm({ show: false, id: null, type: null })}
            onConfirm={confirmDelete}
            title={`Delete ${deleteConfirm.type === 'training' ? 'Training' : 'Assignment'}`}
            message={`Are you sure you want to delete this ${deleteConfirm.type}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            loading={false}
            darkMode={darkMode}
          />
        </>
      )}

      <TrainingDetailModal
        show={showDetailModal}
        training={selectedTraining}
        onClose={() => setShowDetailModal(false)}
        handleViewPdf={handleViewPdf}
        darkMode={darkMode}
        bgCard={bgCard}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        borderColor={borderColor}
      />

      <AssignmentDetailModal
        show={showAssignmentDetailModal}
        assignment={selectedAssignment}
        onClose={() => setShowAssignmentDetailModal(false)}
        trainingService={trainingService}
        toast={toast}
        onUpdate={() => {
          loadData();
          if (activeTab === 'all-trainings') {
            loadStatistics();
          }
        }}
        darkMode={darkMode}
        bgCard={bgCard}
        bgCardHover={bgCardHover}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        borderColor={borderColor}
      />

      <PdfViewerModal
        show={showPdfViewerModal}
        pdfUrl={pdfUrl}
        onClose={() => {
          setShowPdfViewerModal(false);
          setPdfUrl('');
        }}
        darkMode={darkMode}
        bgCard={bgCard}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        borderColor={borderColor}
      />
    </DashboardLayout>
  );
};

export default TrainingManagement;