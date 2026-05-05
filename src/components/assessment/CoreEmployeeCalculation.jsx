'use client';
import React from 'react';
import { Plus, Search, Loader2, Building, Users } from 'lucide-react';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import ActionButton from './ActionButton';
import useCoreAssessment from './hooks/useCoreAssessment';
import { CorePositionTab } from './CorePositionTab';
import { CoreEmployeeTab } from './CoreEmployeeTab';
import { CorePositionModal } from './modals/CorePositionModal';
import { CoreEmployeeModal } from './modals/CoreEmployeeModal';
import { CoreViewModal } from './modals/CoreViewModal';

const CoreEmployeeCalculation = () => {
  const state = useCoreAssessment();

  const {
    activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    selectedStatus, setSelectedStatus,
    isLoading,
    isSubmitting,
    showCreatePositionModal, setShowCreatePositionModal,
    showEditPositionModal, setShowEditPositionModal,
    showCreateEmployeeModal, setShowCreateEmployeeModal,
    showEditEmployeeModal, setShowEditEmployeeModal,
    showViewModal, setShowViewModal,
    showCoreScalesInfo, setShowCoreScalesInfo,
    selectedAssessment, setSelectedAssessment,
    templateError, setTemplateError,
    selectedEmployeeInfo, setSelectedEmployeeInfo,
    confirmModal, setConfirmModal,
    userPermissions, isEmployeeOnlyAccess,
    expandedGroups, setExpandedGroups,
    expandedCreateGroups, setExpandedCreateGroups,
    expandedEditGroups, setExpandedEditGroups,
    positionAssessments,
    employees, positionGroups, coreScales, skillGroups,
    positionFormData, setPositionFormData,
    editPositionFormData, setEditPositionFormData,
    employeeFormData, setEmployeeFormData,
    editFormData, setEditFormData,
    filteredJobTitles, editFilteredJobTitles,
    companies, selectedCompany, setSelectedCompany,
    handlePositionGroupChange, handleEditPositionGroupChange,
    handleEmployeeChange,
    handleEditPositionAssessment, handleEditAssessment,
    handleCreatePositionAssessment, handleUpdatePositionAssessment,
    handleCreateEmployeeAssessment, handleUpdateEmployeeAssessment,
    handleSubmitAssessment, handleReopenAssessment,
    handleExport, handleDelete,
    filteredPositionAssessments, filteredEmployeeAssessments,
  } = state;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-almet-sapphire" />
        <p className="text-gray-600 text-sm">Loading assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      {!isEmployeeOnlyAccess && (
        <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('position')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'position'
                  ? 'bg-almet-sapphire text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Building size={16} />
              <span>Position Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('employee')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'employee'
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

      {/* Search / Filter Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={isEmployeeOnlyAccess ? "Search my assessments..." : `Search ${activeTab === 'position' ? 'positions' : 'employees'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border outline-0 border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
              />
            </div>

            {/* Company Dropdown (admin only) */}
            {!isEmployeeOnlyAccess && userPermissions?.is_admin && activeTab === 'employee' && (
              <select
                value={selectedCompany}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCompany(value);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire min-w-[160px]"
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company.value} value={company.value}>
                    {company.label}
                  </option>
                ))}
              </select>
            )}

            {!isEmployeeOnlyAccess && activeTab === 'employee' && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none min-w-[140px]"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
              </select>
            )}
          </div>

          {!isEmployeeOnlyAccess && (
            <ActionButton
              onClick={() => activeTab === 'position' ? setShowCreatePositionModal(true) : setShowCreateEmployeeModal(true)}
              icon={Plus}
              label={`New ${activeTab === 'position' ? 'Template' : 'Assessment'}`}
              variant="primary"
              size="md"
            />
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {!isEmployeeOnlyAccess && activeTab === 'position' ? (
          <CorePositionTab
            filteredPositionAssessments={filteredPositionAssessments}
            setSelectedAssessment={setSelectedAssessment}
            setShowViewModal={setShowViewModal}
            handleEditPositionAssessment={handleEditPositionAssessment}
            handleDelete={handleDelete}
          />
        ) : (
          <CoreEmployeeTab
            filteredEmployeeAssessments={filteredEmployeeAssessments}
            isEmployeeOnlyAccess={isEmployeeOnlyAccess}
            setSelectedAssessment={setSelectedAssessment}
            setShowViewModal={setShowViewModal}
            handleEditAssessment={handleEditAssessment}
            handleSubmitAssessment={handleSubmitAssessment}
            handleReopenAssessment={handleReopenAssessment}
            handleExport={handleExport}
            handleDelete={handleDelete}
          />
        )}
      </div>

      {/* Modals */}
      <CorePositionModal
        mode="create"
        showCreatePositionModal={showCreatePositionModal}
        positionFormData={positionFormData}
        setPositionFormData={setPositionFormData}
        handleCreatePositionAssessment={handleCreatePositionAssessment}
        setShowCreatePositionModal={setShowCreatePositionModal}
        filteredJobTitles={filteredJobTitles}
        handlePositionGroupChange={handlePositionGroupChange}
        positionGroups={positionGroups}
        coreScales={coreScales}
        skillGroups={skillGroups}
        showCoreScalesInfo={showCoreScalesInfo}
        setShowCoreScalesInfo={setShowCoreScalesInfo}
        expandedCreateGroups={expandedCreateGroups}
        setExpandedCreateGroups={setExpandedCreateGroups}
        isSubmitting={isSubmitting}
      />

      <CorePositionModal
        mode="edit"
        showEditPositionModal={showEditPositionModal}
        editPositionFormData={editPositionFormData}
        setEditPositionFormData={setEditPositionFormData}
        handleUpdatePositionAssessment={handleUpdatePositionAssessment}
        setShowEditPositionModal={setShowEditPositionModal}
        editFilteredJobTitles={editFilteredJobTitles}
        handleEditPositionGroupChange={handleEditPositionGroupChange}
        positionGroups={positionGroups}
        coreScales={coreScales}
        skillGroups={skillGroups}
        showCoreScalesInfo={showCoreScalesInfo}
        setShowCoreScalesInfo={setShowCoreScalesInfo}
        expandedEditGroups={expandedEditGroups}
        setExpandedEditGroups={setExpandedEditGroups}
        isSubmitting={isSubmitting}
      />

      <CoreEmployeeModal
        mode="create"
        showCreateEmployeeModal={showCreateEmployeeModal}
        employeeFormData={employeeFormData}
        setEmployeeFormData={setEmployeeFormData}
        handleCreateEmployeeAssessment={handleCreateEmployeeAssessment}
        setShowCreateEmployeeModal={setShowCreateEmployeeModal}
        handleEmployeeChange={handleEmployeeChange}
        templateError={templateError}
        setTemplateError={setTemplateError}
        employees={employees}
        positionAssessments={positionAssessments}
        coreScales={coreScales}
        showCoreScalesInfo={showCoreScalesInfo}
        setShowCoreScalesInfo={setShowCoreScalesInfo}
        expandedGroups={expandedGroups}
        setExpandedGroups={setExpandedGroups}
        selectedEmployeeInfo={selectedEmployeeInfo}
        setSelectedEmployeeInfo={setSelectedEmployeeInfo}
        isSubmitting={isSubmitting}
      />

      <CoreEmployeeModal
        mode="edit"
        showEditEmployeeModal={showEditEmployeeModal}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        handleUpdateEmployeeAssessment={handleUpdateEmployeeAssessment}
        setShowEditEmployeeModal={setShowEditEmployeeModal}
        employees={employees}
        positionAssessments={positionAssessments}
        coreScales={coreScales}
        showCoreScalesInfo={showCoreScalesInfo}
        setShowCoreScalesInfo={setShowCoreScalesInfo}
        expandedGroups={expandedGroups}
        setExpandedGroups={setExpandedGroups}
        selectedEmployeeInfo={selectedEmployeeInfo}
        setSelectedEmployeeInfo={setSelectedEmployeeInfo}
        isSubmitting={isSubmitting}
      />

      <CoreViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAssessment(null);
        }}
        assessment={selectedAssessment}
        activeTab={activeTab}
        handleExport={handleExport}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm"
        cancelText="Cancel"
        type={confirmModal.type}
        loading={isSubmitting}
      />
    </div>
  );
};

export default CoreEmployeeCalculation;
