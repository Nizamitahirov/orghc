"use client";
import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/common/Toast";
import useGrading from "@/hooks/useGrading";

import GradingHeader         from "@/components/grading/GradingHeader";
import CurrentStructureCard  from "@/components/grading/CurrentStructureCard";
import CreateScenarioCard    from "@/components/grading/CreateScenarioCard";
import DraftScenariosCard    from "@/components/grading/DraftScenariosCard";
import ArchivedScenariosCard from "@/components/grading/ArchivedScenariosCard";
import ScenarioDetailModal   from "@/components/grading/ScenarioDetailModal";
import ComparisonModal       from "@/components/grading/ComparisonModal";
import SalaryTab             from "@/components/grading/SalaryTab";
import { LoadingSpinner, ErrorDisplay } from "@/components/common/LoadingSpinner";
import { BarChart3, Plus, Calculator, Archive, Settings, DollarSign } from "lucide-react";

/* ─── Tab Bar ──────────────────────────────────────────────────────────────── */
const TabNavigation = ({ activeTab, setActiveTab, tabs }) => (
  <div className="flex gap-1 p-1 bg-almet-mystic dark:bg-gray-700/50 rounded-xl w-fit">
    {tabs.map(({ id, name, icon: Icon, count }) => {
      const active = activeTab === id;
      return (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
            active
              ? "bg-white dark:bg-gray-800 text-almet-sapphire shadow-sm"
              : "text-almet-waterloo dark:text-gray-400 hover:text-almet-cloud-burst dark:hover:text-white"
          }`}
        >
          <Icon size={13} />
          {name}
          {count != null && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none ${
              active
                ? "bg-almet-sapphire text-white"
                : "bg-white/70 dark:bg-gray-600 text-almet-waterloo dark:text-gray-300"
            }`}>
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/* ─── Page ─────────────────────────────────────────────────────────────────── */
const GradingPage = () => {
  const { showSuccess, showError, showWarning } = useToast();

  const [activeTab,             setActiveTab]             = useState("current");
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [scenarioName,          setScenarioName]          = useState("");
  const [lastDraftCount,        setLastDraftCount]        = useState(0);
  const prevLoadingRef = useRef({ saving: false, applying: false, archiving: false });

  const {
    currentData, currentStructures, currentScenarios,
    selectedStructureCurrency, availableStructureCurrencies,
    currentScenario, currencies,
    handleStructureCurrencyChange,
    scenarioInputs, newScenarioDisplayData,
    draftScenarios, archivedScenarios, selectedScenario, basePositionName,
    validationSummary, dataAvailability,
    isDetailOpen, setIsDetailOpen,
    compareMode, selectedForComparison,
    isLoading, isCalculating, errors, hasErrors, isInitialized, loading,
    handleBaseValueChange, handleCurrencyChange, handleVerticalChange,
    handleGlobalHorizontalChange, handleSaveDraft, handleSaveAsCurrent,
    handleArchiveDraft, handleViewDetails, toggleCompareMode,
    toggleScenarioForComparison, getScenarioForComparison,
    refreshData, getVerticalInputValue, getHorizontalInputValues,
    comparisonData, handleCompareScenarios,
    salaryData, salaryLoading, salaryError, salaryUpdating, salaryBulkUpdating,
    salaryPagination, salaryFilters,
    fetchSalaryData, handleSalaryUpdate, handleSalaryBulkUpdate,
    handleSalaryExcelImport, handleSalaryTemplateDownload, updateSalaryFilters,
  } = useGrading();

  const handleStartComparison = async () => {
    if (!selectedForComparison.length) {
      showWarning("Select at least 1 scenario to compare");
      return null;
    }
    const result = await handleCompareScenarios(["current", ...selectedForComparison]);
    if (result?.comparison) { setIsComparisonModalOpen(true); return result; }
    showError("Failed to load comparison data");
    return null;
  };

  const handleSaveDraftWithName = async () => {
    const result = await handleSaveDraft(scenarioName);
    if (result) setScenarioName("");
  };

  useEffect(() => {
    if (draftScenarios.length > lastDraftCount && lastDraftCount > 0)
   
    setLastDraftCount(draftScenarios.length);
  }, [draftScenarios.length]); // eslint-disable-line

  useEffect(() => {
    const prev = prevLoadingRef.current;
    if (prev.saving    && !loading.saving)    showSuccess("Draft saved!");
    if (prev.applying  && !loading.applying)  showSuccess("Scenario applied as current!");
    if (prev.archiving && !loading.archiving) showSuccess("Scenario archived!");
    prevLoadingRef.current = { saving: loading.saving, applying: loading.applying, archiving: loading.archiving };
  }, [loading.saving, loading.applying, loading.archiving]); // eslint-disable-line

  useEffect(() => {
    if (hasErrors)
      Object.entries(errors).forEach(([k, msg]) => { if (msg && k !== "comparing") showError(msg); });
  }, [hasErrors, errors]); // eslint-disable-line

  const tabs = [
    { id: "current", name: "Current Structure", icon: BarChart3,  count: currentData?.gradeOrder?.length },
    { id: "create",  name: "Create Scenario",   icon: Plus },
    { id: "drafts",  name: "Drafts",            icon: Calculator, count: draftScenarios.length },
    { id: "archive", name: "Archive",           icon: Archive,    count: archivedScenarios.length },
    { id: "salary",  name: "Salary",            icon: DollarSign, count: salaryData.length || undefined },
  ];

  if (isLoading && !isInitialized)
    return <DashboardLayout><LoadingSpinner message="Initializing grading system..." /></DashboardLayout>;

  if (!dataAvailability.hasCurrentData && !isLoading)
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-almet-mystic dark:border-gray-700 p-10 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings size={28} className="text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white mb-1">No Grading Structure</h3>
            <p className="text-xs text-almet-waterloo dark:text-gray-400 mb-6 leading-relaxed">
              No grading structure exists yet. Set up your initial structure to get started.
            </p>
            <button
              onClick={() => { refreshData(); showWarning("Please create your initial grading structure"); }}
              className="bg-almet-sapphire text-white px-5 py-2 rounded-lg text-xs font-medium hover:bg-almet-astral transition-colors inline-flex items-center gap-2"
            >
              <Plus size={14} /> Set Up Structure
            </button>
          </div>
        </div>
      </DashboardLayout>
    );

  if (errors.currentStructure)
    return <DashboardLayout><ErrorDisplay error={errors.currentStructure} onRetry={refreshData} /></DashboardLayout>;

  const renderTab = () => {
    switch (activeTab) {
      case "current":
        return (
          <CurrentStructureCard
           currentData={currentData}
            basePositionName={basePositionName}
           availableStructureCurrencies={availableStructureCurrencies}
           selectedStructureCurrency={selectedStructureCurrency}
            onCurrencyChange={handleStructureCurrencyChange}
          />);
      case "create":
        return (
          <CreateScenarioCard
            scenarioInputs={scenarioInputs} newScenarioDisplayData={newScenarioDisplayData}
            basePositionName={basePositionName} validationSummary={validationSummary}
            errors={errors} loading={loading} isCalculating={isCalculating}
            handleBaseValueChange={handleBaseValueChange} handleVerticalChange={handleVerticalChange}
            handleGlobalHorizontalChange={handleGlobalHorizontalChange} handleSaveDraft={handleSaveDraftWithName}
            handleCurrencyChange={handleCurrencyChange} currencies={currencies}
            scenarioName={scenarioName} onScenarioNameChange={setScenarioName}
          />
        );
      case "drafts":
        return (
          <DraftScenariosCard
            draftScenarios={draftScenarios} currentData={currentData}
            compareMode={compareMode} selectedForComparison={selectedForComparison}
            loading={loading} handleViewDetails={handleViewDetails}
            handleSaveAsCurrent={handleSaveAsCurrent} handleArchiveDraft={handleArchiveDraft}
            toggleCompareMode={toggleCompareMode} toggleScenarioForComparison={toggleScenarioForComparison}
            handleStartComparison={handleStartComparison}
          />
        );
      case "archive":
        return archivedScenarios.length > 0
          ? <ArchivedScenariosCard archivedScenarios={archivedScenarios} handleViewDetails={handleViewDetails} />
          : (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-almet-mystic dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Archive size={22} className="text-almet-bali-hai dark:text-gray-400" />
              </div>
              <p className="text-sm font-medium text-almet-cloud-burst dark:text-gray-300">No Archived Scenarios</p>
              <p className="text-xs text-almet-waterloo dark:text-gray-500 mt-1">Archived scenarios will appear here</p>
            </div>
          );
      case "salary":
        return (
          <SalaryTab
            salaryData={salaryData} salaryLoading={salaryLoading} salaryError={salaryError}
            salaryUpdating={salaryUpdating} salaryBulkUpdating={salaryBulkUpdating}
            salaryPagination={salaryPagination} salaryFilters={salaryFilters}
            currencies={currencies} currentData={currentData}
            fetchSalaryData={fetchSalaryData} handleSalaryUpdate={handleSalaryUpdate}
            handleSalaryBulkUpdate={handleSalaryBulkUpdate} handleSalaryExcelImport={handleSalaryExcelImport}
            handleSalaryTemplateDownload={handleSalaryTemplateDownload} updateSalaryFilters={updateSalaryFilters}
          />
        );
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-almet-mystic/20 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-5 space-y-4">

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic dark:border-gray-700 px-5 py-4">
            <GradingHeader />
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic dark:border-gray-700">
            <div className="px-5 pt-4 pb-3 border-b border-almet-mystic dark:border-gray-700">
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
            </div>
            <div className="p-5">{renderTab()}</div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {isDetailOpen && (
        <ScenarioDetailModal
          isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)}
          selectedScenario={selectedScenario} compareMode={compareMode}
          selectedForComparison={selectedForComparison} currentData={currentData}
          basePositionName={basePositionName} loading={loading}
          getScenarioForComparison={getScenarioForComparison}
          getVerticalInputValue={getVerticalInputValue} getHorizontalInputValues={getHorizontalInputValues}
          handleSaveAsCurrent={handleSaveAsCurrent} handleArchiveDraft={handleArchiveDraft}
        />
      )}

      {isComparisonModalOpen && comparisonData && (
        <ComparisonModal
          isOpen={isComparisonModalOpen} onClose={() => setIsComparisonModalOpen(false)}
          comparisonData={comparisonData}
          scenarios={[
            ...Object.entries(currentScenarios).map(([cur, sc]) => ({
              id: "current",
              name: `Current Structure (${cur})`,
              currency: cur,
              is_current: true,
            })),
            ...draftScenarios.filter(s => selectedForComparison.includes(s.id)),
          ]}
        />
      )}

      {/* Global loading overlay */}
      {(loading.saving || loading.applying || loading.archiving) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-7 shadow-2xl border border-almet-mystic dark:border-gray-700 w-64 text-center">
            <div className="w-10 h-10 border-4 border-almet-mystic border-t-almet-sapphire rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
              {loading.saving ? "Saving…" : loading.applying ? "Applying…" : "Archiving…"}
            </p>
            <p className="text-xs text-almet-waterloo dark:text-gray-400 mt-1">
              {loading.saving ? "Creating draft scenario" : loading.applying ? "Setting as current" : "Moving to archive"}
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GradingPage;