'use client';
import React from 'react';
import { Plus, Users, Building, Search, Loader2 } from 'lucide-react';
import ActionButton from './ActionButton';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import useBehavioralAssessment from './hooks/useBehavioralAssessment';
import { BehavioralPositionTab } from './BehavioralPositionTab';
import { BehavioralEmployeeTab } from './BehavioralEmployeeTab';
import { BehavioralPositionModal } from './modals/BehavioralPositionModal';
import { BehavioralEmployeeModal } from './modals/BehavioralEmployeeModal';
import { BehavioralViewModal } from './modals/BehavioralViewModal';

const BehavioralAssessmentCalculation = () => {
  const state = useBehavioralAssessment();

  if (state.isLoading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-almet-sapphire" />
        <p className="text-gray-600 text-sm">Loading behavioral assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      {!state.isEmployeeOnlyAccess && (
        <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <div className="flex gap-1">
            <button
              onClick={() => state.setActiveTab('position')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                state.activeTab === 'position'
                  ? 'bg-almet-sapphire text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Building size={16} />
              <span>Position Templates</span>
            </button>

            <button
              onClick={() => state.setActiveTab('employee')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                state.activeTab === 'employee'
                  ? 'bg-almet-sapphire text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users size={16} />
              <span>Employee Assessments</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters & actions bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={state.isEmployeeOnlyAccess ? "Search my assessments..." : `Search ${state.activeTab === 'position' ? 'positions' : 'employees'}...`}
                value={state.searchTerm}
                onChange={(e) => state.setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border outline-0 border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
              />
            </div>

            {!state.isEmployeeOnlyAccess && state.userPermissions?.is_admin && state.activeTab === 'employee' && (
              <select
                value={state.selectedCompany}
                onChange={(e) => state.setSelectedCompany(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire min-w-[160px]"
              >
                <option value="">All Companies</option>
                {state.companies.map(company => (
                  <option key={company.value} value={company.value}>{company.label}</option>
                ))}
              </select>
            )}

            {!state.isEmployeeOnlyAccess && state.activeTab === 'employee' && (
              <select
                value={state.selectedStatus}
                onChange={(e) => state.setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none min-w-[140px]"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
              </select>
            )}
          </div>

          {!state.isEmployeeOnlyAccess && (
            <ActionButton
              onClick={() => state.activeTab === 'position' ? state.setShowCreatePositionModal(true) : state.setShowCreateEmployeeModal(true)}
              icon={Plus}
              label={`New ${state.activeTab === 'position' ? 'Template' : 'Assessment'}`}
              variant="primary"
              size="md"
            />
          )}
        </div>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {!state.isEmployeeOnlyAccess && state.activeTab === 'position' ? (
          <BehavioralPositionTab
            filteredPositionAssessments={state.filteredPositionAssessments}
            setSelectedAssessment={state.setSelectedAssessment}
            setShowViewModal={state.setShowViewModal}
            handleEditPositionAssessment={state.handleEditPositionAssessment}
            handleDelete={state.handleDelete}
          />
        ) : (
          <BehavioralEmployeeTab
            filteredEmployeeAssessments={state.filteredEmployeeAssessments}
            isEmployeeOnlyAccess={state.isEmployeeOnlyAccess}
            setSelectedAssessment={state.setSelectedAssessment}
            setShowViewModal={state.setShowViewModal}
            handleEditAssessment={state.handleEditAssessment}
            handleExport={state.handleExport}
            handleSubmitAssessment={state.handleSubmitAssessment}
            handleReopenAssessment={state.handleReopenAssessment}
            handleDelete={state.handleDelete}
          />
        )}
      </div>

      {/* Create Position Modal */}
      <BehavioralPositionModal
        mode="create"
        showCreatePositionModal={state.showCreatePositionModal}
        positionFormData={state.positionFormData}
        setPositionFormData={state.setPositionFormData}
        positionGroups={state.positionGroups}
        gradeLevels={state.gradeLevels}
        setGradeLevels={state.setGradeLevels}
        selectedGradeLevels={state.selectedGradeLevels}
        setSelectedGradeLevels={state.setSelectedGradeLevels}
        positionDuplicateError={state.positionDuplicateError}
        setPositionDuplicateError={state.setPositionDuplicateError}
        handlePositionGroupChange={state.handlePositionGroupChange}
        handleGradeLevelMultiSelectChange={state.handleGradeLevelMultiSelectChange}
        handleCreatePositionAssessment={state.handleCreatePositionAssessment}
        setShowCreatePositionModal={state.setShowCreatePositionModal}
        behavioralGroups={state.behavioralGroups}
        behavioralScales={state.behavioralScales}
        expandedGroups={state.expandedGroups}
        toggleGroup={state.toggleGroup}
        showScalesInfo={state.showScalesInfo}
        setShowScalesInfo={state.setShowScalesInfo}
        isSubmitting={state.isSubmitting}
      />

      {/* Edit Position Modal */}
      <BehavioralPositionModal
        mode="edit"
        showEditPositionModal={state.showEditPositionModal}
        editPositionFormData={state.editPositionFormData}
        setEditPositionFormData={state.setEditPositionFormData}
        positionGroups={state.positionGroups}
        editGradeLevels={state.editGradeLevels}
        editSelectedGradeLevels={state.editSelectedGradeLevels}
        setEditSelectedGradeLevels={state.setEditSelectedGradeLevels}
        handleEditPositionGroupChange={state.handleEditPositionGroupChange}
        handleEditGradeLevelMultiSelectChange={state.handleEditGradeLevelMultiSelectChange}
        handleUpdatePositionAssessment={state.handleUpdatePositionAssessment}
        setShowEditPositionModal={state.setShowEditPositionModal}
        behavioralGroups={state.behavioralGroups}
        behavioralScales={state.behavioralScales}
        expandedGroups={state.expandedGroups}
        toggleGroup={state.toggleGroup}
        showScalesInfo={state.showScalesInfo}
        setShowScalesInfo={state.setShowScalesInfo}
        isSubmitting={state.isSubmitting}
      />

      {/* Create Employee Modal */}
      <BehavioralEmployeeModal
        mode="create"
        showCreateEmployeeModal={state.showCreateEmployeeModal}
        setShowCreateEmployeeModal={state.setShowCreateEmployeeModal}
        employeeFormData={state.employeeFormData}
        setEmployeeFormData={state.setEmployeeFormData}
        employees={state.employees}
        handleEmployeeChange={state.handleEmployeeChange}
        handleCreateEmployeeAssessment={state.handleCreateEmployeeAssessment}
        templateError={state.templateError}
        setTemplateError={state.setTemplateError}
        selectedEmployeeInfo={state.selectedEmployeeInfo}
        setSelectedEmployeeInfo={state.setSelectedEmployeeInfo}
        positionAssessments={state.positionAssessments}
        behavioralScales={state.behavioralScales}
        showScalesInfo={state.showScalesInfo}
        setShowScalesInfo={state.setShowScalesInfo}
        isSubmitting={state.isSubmitting}
      />

      {/* Edit Employee Modal */}
      <BehavioralEmployeeModal
        mode="edit"
        showEditEmployeeModal={state.showEditEmployeeModal}
        setShowEditEmployeeModal={state.setShowEditEmployeeModal}
        editFormData={state.editFormData}
        setEditFormData={state.setEditFormData}
        handleUpdateEmployeeAssessment={state.handleUpdateEmployeeAssessment}
        selectedEmployeeInfo={state.selectedEmployeeInfo}
        setSelectedEmployeeInfo={state.setSelectedEmployeeInfo}
        positionAssessments={state.positionAssessments}
        behavioralScales={state.behavioralScales}
        showScalesInfo={state.showScalesInfo}
        setShowScalesInfo={state.setShowScalesInfo}
        isSubmitting={state.isSubmitting}
      />

      {/* View Modal */}
      <BehavioralViewModal
        isOpen={state.showViewModal}
        onClose={() => { state.setShowViewModal(false); state.setSelectedAssessment(null); }}
        assessment={state.selectedAssessment}
        activeTab={state.activeTab}
        handleExport={state.handleExport}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={state.confirmModal.isOpen}
        onClose={() => state.setConfirmModal({ ...state.confirmModal, isOpen: false })}
        onConfirm={state.confirmModal.onConfirm}
        title={state.confirmModal.title}
        message={state.confirmModal.message}
        type={state.confirmModal.type}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BehavioralAssessmentCalculation;
