'use client';
import React from 'react';
import { Plus, Crown, Search, Loader2 } from 'lucide-react';
import ActionButton from './ActionButton';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import useLeadershipAssessment from './hooks/useLeadershipAssessment';
import { LeadershipPositionTab } from './LeadershipPositionTab';
import { LeadershipEmployeeTab } from './LeadershipEmployeeTab';
import { LeadershipPositionModal } from './modals/LeadershipPositionModal';
import { LeadershipEmployeeModal } from './modals/LeadershipEmployeeModal';
import { LeadershipViewModal } from './modals/LeadershipViewModal';

const LeadershipAssessmentCalculation = () => {
  const state = useLeadershipAssessment();

  if (state.isLoading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-almet-sapphire" />
        <p className="text-gray-600 text-sm">Loading leadership assessments...</p>
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
              <Crown size={16} />
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
              <Crown size={16} />
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
          <LeadershipPositionTab
            assessments={state.filteredPositionAssessments}
            onView={(assessment) => { state.setSelectedAssessment(assessment); state.setShowViewModal(true); }}
            onEdit={state.handleEditPositionAssessment}
            onDelete={state.handleDelete}
            isEmployeeOnlyAccess={state.isEmployeeOnlyAccess}
          />
        ) : (
          <LeadershipEmployeeTab
            assessments={state.filteredEmployeeAssessments}
            isEmployeeOnlyAccess={state.isEmployeeOnlyAccess}
            onView={(assessment) => { state.setSelectedAssessment(assessment); state.setShowViewModal(true); }}
            onEdit={state.handleEditAssessment}
            onExport={state.handleExport}
            onSubmit={state.handleSubmitAssessment}
            onReopen={state.handleReopenAssessment}
            onDelete={state.handleDelete}
          />
        )}
      </div>

      {/* Create Position Modal */}
      <LeadershipPositionModal
        mode="create"
        isOpen={state.showCreatePositionModal}
        onClose={() => state.setShowCreatePositionModal(false)}
        positionGroups={state.positionGroups}
        gradeLevels={state.gradeLevels}
        editGradeLevels={state.editGradeLevels}
        selectedGradeLevels={state.selectedGradeLevels}
        editSelectedGradeLevels={state.editSelectedGradeLevels}
        positionFormData={state.positionFormData}
        setPositionFormData={state.setPositionFormData}
        editPositionFormData={state.editPositionFormData}
        setEditPositionFormData={state.setEditPositionFormData}
        behavioralScales={state.behavioralScales}
        leadershipMainGroups={state.leadershipMainGroups}
        expandedGroups={state.expandedGroups}
        expandedChildGroups={state.expandedChildGroups}
        positionDuplicateError={state.positionDuplicateError}
        showScalesInfo={state.showScalesInfo}
        setShowScalesInfo={state.setShowScalesInfo}
        isSubmitting={state.isSubmitting}
        handlePositionGroupChange={state.handlePositionGroupChange}
        handleEditPositionGroupChange={state.handleEditPositionGroupChange}
        handleGradeLevelMultiSelectChange={state.handleGradeLevelMultiSelectChange}
        handleEditGradeLevelMultiSelectChange={state.handleEditGradeLevelMultiSelectChange}
        handleCreatePositionAssessment={state.handleCreatePositionAssessment}
        handleUpdatePositionAssessment={state.handleUpdatePositionAssessment}
        toggleGroup={state.toggleGroup}
        toggleChildGroup={state.toggleChildGroup}
        setGradeLevels={state.setGradeLevels}
        setSelectedGradeLevels={state.setSelectedGradeLevels}
        setEditGradeLevels={state.setEditGradeLevels}
        setEditSelectedGradeLevels={state.setEditSelectedGradeLevels}
        setPositionDuplicateError={state.setPositionDuplicateError}
      />

      {/* Edit Position Modal */}
      <LeadershipPositionModal
        mode="edit"
        isOpen={state.showEditPositionModal}
        onClose={() => state.setShowEditPositionModal(false)}
        positionGroups={state.positionGroups}
        gradeLevels={state.gradeLevels}
        editGradeLevels={state.editGradeLevels}
        selectedGradeLevels={state.selectedGradeLevels}
        editSelectedGradeLevels={state.editSelectedGradeLevels}
        positionFormData={state.positionFormData}
        setPositionFormData={state.setPositionFormData}
        editPositionFormData={state.editPositionFormData}
        setEditPositionFormData={state.setEditPositionFormData}
        behavioralScales={state.behavioralScales}
        leadershipMainGroups={state.leadershipMainGroups}
        expandedGroups={state.expandedGroups}
        expandedChildGroups={state.expandedChildGroups}
        positionDuplicateError={state.positionDuplicateError}
        showScalesInfo={state.showScalesInfo}
        setShowScalesInfo={state.setShowScalesInfo}
        isSubmitting={state.isSubmitting}
        handlePositionGroupChange={state.handlePositionGroupChange}
        handleEditPositionGroupChange={state.handleEditPositionGroupChange}
        handleGradeLevelMultiSelectChange={state.handleGradeLevelMultiSelectChange}
        handleEditGradeLevelMultiSelectChange={state.handleEditGradeLevelMultiSelectChange}
        handleCreatePositionAssessment={state.handleCreatePositionAssessment}
        handleUpdatePositionAssessment={state.handleUpdatePositionAssessment}
        toggleGroup={state.toggleGroup}
        toggleChildGroup={state.toggleChildGroup}
        setGradeLevels={state.setGradeLevels}
        setSelectedGradeLevels={state.setSelectedGradeLevels}
        setEditGradeLevels={state.setEditGradeLevels}
        setEditSelectedGradeLevels={state.setEditSelectedGradeLevels}
        setPositionDuplicateError={state.setPositionDuplicateError}
      />

      {/* Create Employee Modal */}
      <LeadershipEmployeeModal
        mode="create"
        isOpen={state.showCreateEmployeeModal}
        onClose={() => state.setShowCreateEmployeeModal(false)}
        employees={state.employees}
        positionAssessments={state.positionAssessments}
        behavioralScales={state.behavioralScales}
        employeeFormData={state.employeeFormData}
        setEmployeeFormData={state.setEmployeeFormData}
        editFormData={state.editFormData}
        setEditFormData={state.setEditFormData}
        templateError={state.templateError}
        setTemplateError={state.setTemplateError}
        selectedEmployeeInfo={state.selectedEmployeeInfo}
        setSelectedEmployeeInfo={state.setSelectedEmployeeInfo}
        showScalesInfo={state.showScalesInfo}
        setShowScalesInfo={state.setShowScalesInfo}
        isSubmitting={state.isSubmitting}
        expandedGroups={state.expandedGroups}
        expandedChildGroups={state.expandedChildGroups}
        handleEmployeeChange={state.handleEmployeeChange}
        handleCreateEmployeeAssessment={state.handleCreateEmployeeAssessment}
        handleUpdateEmployeeAssessment={state.handleUpdateEmployeeAssessment}
        toggleGroup={state.toggleGroup}
        toggleChildGroup={state.toggleChildGroup}
      />

      {/* Edit Employee Modal */}
      <LeadershipEmployeeModal
        mode="edit"
        isOpen={state.showEditEmployeeModal}
        onClose={() => state.setShowEditEmployeeModal(false)}
        employees={state.employees}
        positionAssessments={state.positionAssessments}
        behavioralScales={state.behavioralScales}
        employeeFormData={state.employeeFormData}
        setEmployeeFormData={state.setEmployeeFormData}
        editFormData={state.editFormData}
        setEditFormData={state.setEditFormData}
        templateError={state.templateError}
        setTemplateError={state.setTemplateError}
        selectedEmployeeInfo={state.selectedEmployeeInfo}
        setSelectedEmployeeInfo={state.setSelectedEmployeeInfo}
        showScalesInfo={state.showScalesInfo}
        setShowScalesInfo={state.setShowScalesInfo}
        isSubmitting={state.isSubmitting}
        expandedGroups={state.expandedGroups}
        expandedChildGroups={state.expandedChildGroups}
        handleEmployeeChange={state.handleEmployeeChange}
        handleCreateEmployeeAssessment={state.handleCreateEmployeeAssessment}
        handleUpdateEmployeeAssessment={state.handleUpdateEmployeeAssessment}
        toggleGroup={state.toggleGroup}
        toggleChildGroup={state.toggleChildGroup}
      />

      {/* View Modal */}
      <LeadershipViewModal
        isOpen={state.showViewModal}
        onClose={() => { state.setShowViewModal(false); state.setSelectedAssessment(null); }}
        assessment={state.selectedAssessment}
        activeTab={state.activeTab}
        expandedGroups={state.expandedGroups}
        expandedChildGroups={state.expandedChildGroups}
        toggleGroup={state.toggleGroup}
        toggleChildGroup={state.toggleChildGroup}
        onExport={state.handleExport}
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

export default LeadershipAssessmentCalculation;
