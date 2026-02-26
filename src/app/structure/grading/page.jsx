// src/app/structure/grading/page.jsx - FULL UPDATED VERSION
"use client";
import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import useGrading from "@/hooks/useGrading";

// Komponentləri import et
import GradingHeader from "@/components/grading/GradingHeader";
import CurrentStructureCard from "@/components/grading/CurrentStructureCard";
import CreateScenarioCard from "@/components/grading/CreateScenarioCard";
import DraftScenariosCard from "@/components/grading/DraftScenariosCard";
import ArchivedScenariosCard from "@/components/grading/ArchivedScenariosCard";
import ScenarioDetailModal from "@/components/grading/ScenarioDetailModal";
import ComparisonModal from "@/components/grading/ComparisonModal";
import { LoadingSpinner, ErrorDisplay } from "@/components/common/LoadingSpinner";

// Icons
import { 
  BarChart3, 
  Plus, 
  Calculator, 
  Archive,
  Settings
} from "lucide-react";

// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="border-b border-almet-mystic dark:border-gray-700 mb-6">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-2 border-b-3 font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-sapphire bg-gradient-to-t from-almet-mystic/30 dark:from-gray-700/30 to-transparent'
                : 'border-transparent text-almet-waterloo dark:text-gray-300 hover:text-almet-cloud-burst dark:hover:text-white hover:border-almet-bali-hai dark:hover:border-gray-500'
            }`}
          >
            <tab.icon size={18} />
            {tab.name}
            {tab.count !== undefined && tab.count !== null && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                activeTab === tab.id 
                  ? 'bg-almet-sapphire dark:bg-almet-sapphire text-white' 
                  : 'bg-almet-mystic dark:bg-gray-700 text-almet-waterloo dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Current Structure Tab Content
const CurrentStructureTab = ({ 
  currentData, 
  basePositionName, 
  currentScenario 
}) => {
  return (
    <div className="space-y-6">
      <CurrentStructureCard 
        currentData={currentData}
        basePositionName={basePositionName}
      />
    </div>
  );
};

// Create Scenario Tab Content
const CreateScenarioTab = ({ 
  scenarioInputs,
  newScenarioDisplayData,
  basePositionName,
  validationSummary,
  errors,
  loading,
  isCalculating,
  handleBaseValueChange,
  handleVerticalChange,
  handleGlobalHorizontalChange,
  handleSaveDraft,
  scenarioName,
  onScenarioNameChange
}) => {
  return (
    <div className="space-y-6">
      <CreateScenarioCard 
        scenarioInputs={scenarioInputs}
        newScenarioDisplayData={newScenarioDisplayData}
        basePositionName={basePositionName}
        validationSummary={validationSummary}
        errors={errors}
        loading={loading}
        isCalculating={isCalculating}
        handleBaseValueChange={handleBaseValueChange}
        handleVerticalChange={handleVerticalChange}
        handleGlobalHorizontalChange={handleGlobalHorizontalChange}
        handleSaveDraft={handleSaveDraft}
        scenarioName={scenarioName}
        onScenarioNameChange={onScenarioNameChange}
      />
    </div>
  );
};

// Draft Scenarios Tab Content
const DraftScenariosTab = ({
  draftScenarios,
  currentData,
  compareMode,
  selectedForComparison,
  loading,
  handleViewDetails,
  handleSaveAsCurrent,
  handleArchiveDraft,
  toggleCompareMode,
  toggleScenarioForComparison,
  handleStartComparison
}) => {
  return (
    <div className="space-y-6">
      <DraftScenariosCard 
        draftScenarios={draftScenarios}
        currentData={currentData}
        compareMode={compareMode}
        selectedForComparison={selectedForComparison}
        loading={loading}
        handleViewDetails={handleViewDetails}
        handleSaveAsCurrent={handleSaveAsCurrent}
        handleArchiveDraft={handleArchiveDraft}
        toggleCompareMode={toggleCompareMode}
        toggleScenarioForComparison={toggleScenarioForComparison}
        handleStartComparison={handleStartComparison}
      />
    </div>
  );
};

// Archive Tab Content
const ArchiveTab = ({ archivedScenarios, handleViewDetails }) => {
  return (
    <div className="space-y-6">
      {archivedScenarios.length > 0 ? (
        <ArchivedScenariosCard 
          archivedScenarios={archivedScenarios}
          handleViewDetails={handleViewDetails}
        />
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Archive size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-almet-waterloo dark:text-gray-300 mb-2">
            No Archived Scenarios
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Archived scenarios will appear here for historical reference
          </p>
        </div>
      )}
    </div>
  );
};

const GradingPage = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  const [activeTab, setActiveTab] = useState('current');
  const [lastDraftCount, setLastDraftCount] = useState(0);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  
  const prevLoadingRef = useRef({
    saving: false,
    applying: false,
    archiving: false
  });
  
  const {
    // Core data
    currentData,
    currentScenario,
    positionGroups,
    scenarioInputs,
    calculatedOutputs,
    newScenarioDisplayData,
    draftScenarios,
    archivedScenarios,
    selectedScenario,
    basePositionName,
    
    // Computed state
    validationSummary,
    inputSummary,
    dataAvailability,
    
    // UI state
    isDetailOpen,
    setIsDetailOpen,
    compareMode,
    selectedForComparison,
    isLoading,
    isCalculating,
    errors,
    hasErrors,
    isInitialized,
    
    // Loading states
    loading,
    
    // Actions
    handleBaseValueChange,
    handleVerticalChange,
    handleGlobalHorizontalChange,
    handleSaveDraft,
    handleSaveAsCurrent,
    handleArchiveDraft,
    handleViewDetails,
    toggleCompareMode,
    toggleScenarioForComparison,
    getScenarioForComparison,
    calculateGrades,
    refreshData,
    
    // Comparison helpers
    getVerticalInputValue,
    getHorizontalInputValues,
    comparisonData,
    handleCompareScenarios
  } = useGrading();

  // In page.jsx - Update handleStartComparison function

const handleStartComparison = async () => {
  try {

    
    if (selectedForComparison.length < 1) {
      showWarning('Please select at least 1 scenario to compare with current structure');
      return null;
    }
    
    // Always include 'current' in comparison
    const scenariosToCompare = ['current', ...selectedForComparison];
    

    
    // Fetch comparison data
    const result = await handleCompareScenarios(scenariosToCompare);
    
    if (result && result.comparison) {
    
      setIsComparisonModalOpen(true);
      return result;
    } else {
      showError('Failed to load comparison data');
      return null;
    }
  } catch (error) {
    console.error('❌ Comparison error:', error);
    showError('Error loading comparison data');
    return null;
  }
};

  const handleSaveDraftWithName = async () => {
    const result = await handleSaveDraft(scenarioName);
    if (result) {
      setScenarioName(''); // Clear name after successful save
    }
  };

  // Track draft count changes
  useEffect(() => {
    if (draftScenarios.length > lastDraftCount && lastDraftCount > 0) {
  
    }
    setLastDraftCount(draftScenarios.length);
  }, [draftScenarios.length, lastDraftCount, showSuccess]);

  // Track loading state changes
  useEffect(() => {
    const prev = prevLoadingRef.current;
    
    if (prev.saving && !loading.saving) {
      showSuccess("Draft scenario saved successfully!");
    }
    
    if (prev.applying && !loading.applying) {
      showSuccess("Scenario applied as current structure!");
    }
    
    if (prev.archiving && !loading.archiving) {
      showSuccess("Scenario archived successfully!");
    }
    
    prevLoadingRef.current = {
      saving: loading.saving,
      applying: loading.applying,
      archiving: loading.archiving
    };
  }, [loading.saving, loading.applying, loading.archiving, showSuccess]);

  // Show toast for errors
  useEffect(() => {
    if (hasErrors) {
      Object.entries(errors).forEach(([key, message]) => {
        if (message && key !== 'comparing') {
          showError(message);
        }
      });
    }
  }, [hasErrors, errors, showError]);

  // Tab configuration
  const tabs = [
    {
      id: 'current',
      name: 'Current Structure',
      icon: BarChart3,
      count: currentData?.gradeOrder?.length
    },
    {
      id: 'create',
      name: 'Create Scenario',
      icon: Plus
    },
    {
      id: 'drafts',
      name: 'Draft Scenarios',
      icon: Calculator,
      count: draftScenarios.length
    },
    {
      id: 'archive',
      name: 'Archive',
      icon: Archive,
      count: archivedScenarios.length
    }
  ];

  // Show loading state
  if (isLoading && !isInitialized) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Initializing grading system..." />
      </DashboardLayout>
    );
  }

  // Show error if no current data
  if (!dataAvailability.hasCurrentData && !isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings size={32} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-2">
                No Grading Structure Found
              </h3>
              <p className="text-sm text-almet-waterloo dark:text-gray-300 mb-6">
                No current grading structure exists in the database. Please set up your initial structure to begin.
              </p>
              <button
                onClick={() => {
                  refreshData();
                  showWarning("Please create your initial grading structure");
                }}
                className="bg-almet-sapphire dark:bg-almet-sapphire text-white px-6 py-3 rounded-lg hover:bg-almet-astral dark:hover:bg-almet-astral transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Set Up Structure
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show generic error with retry
  if (errors.currentStructure) {
    return (
      <DashboardLayout>
        <ErrorDisplay 
          error={errors.currentStructure} 
          onRetry={refreshData}
        />
      </DashboardLayout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'current':
        return (
          <CurrentStructureTab 
            currentData={currentData}
            basePositionName={basePositionName}
            currentScenario={currentScenario}
          />
        );
      case 'create':
        return (
          <CreateScenarioTab 
            scenarioInputs={scenarioInputs}
            newScenarioDisplayData={newScenarioDisplayData}
            basePositionName={basePositionName}
            validationSummary={validationSummary}
            errors={errors}
            loading={loading}
            isCalculating={isCalculating}
            handleBaseValueChange={handleBaseValueChange}
            handleVerticalChange={handleVerticalChange}
            handleGlobalHorizontalChange={handleGlobalHorizontalChange}
            handleSaveDraft={handleSaveDraftWithName}
            scenarioName={scenarioName}
            onScenarioNameChange={setScenarioName}
          />
        );
      case 'drafts':
        return (
          <DraftScenariosTab 
            draftScenarios={draftScenarios}
            currentData={currentData}
            compareMode={compareMode}
            selectedForComparison={selectedForComparison}
            loading={loading}
            handleViewDetails={handleViewDetails}
            handleSaveAsCurrent={handleSaveAsCurrent}
            handleArchiveDraft={handleArchiveDraft}
            toggleCompareMode={toggleCompareMode}
            toggleScenarioForComparison={toggleScenarioForComparison}
            handleStartComparison={handleStartComparison}
          />
        );
      case 'archive':
        return (
          <ArchiveTab 
            archivedScenarios={archivedScenarios}
            handleViewDetails={handleViewDetails}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-almet-mystic dark:border-gray-700 p-6">
            <GradingHeader />
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-almet-mystic dark:border-gray-700 p-6">
            <TabNavigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              tabs={tabs} 
            />

            {/* Tab Content */}
            <div className="mt-6">
              {renderTabContent()}
            </div>
          </div>

          {/* Detail Modal */}
          {isDetailOpen && (
            <ScenarioDetailModal 
              isOpen={isDetailOpen}
              onClose={() => setIsDetailOpen(false)}
              selectedScenario={selectedScenario}
              compareMode={compareMode}
              selectedForComparison={selectedForComparison}
              currentData={currentData}
              basePositionName={basePositionName}
              loading={loading}
              getScenarioForComparison={getScenarioForComparison}
              getVerticalInputValue={getVerticalInputValue}
              getHorizontalInputValues={getHorizontalInputValues}
              handleSaveAsCurrent={handleSaveAsCurrent}
              handleArchiveDraft={handleArchiveDraft}
            />
          )}

          {/* Comparison Modal */}
          {isComparisonModalOpen && comparisonData && (
            <ComparisonModal 
              isOpen={isComparisonModalOpen}
              onClose={() => setIsComparisonModalOpen(false)}
              comparisonData={comparisonData}
              scenarios={[
                ...(selectedForComparison.includes('current') ? [{ id: 'current', name: 'Current Structure' }] : []),
                ...draftScenarios.filter(s => selectedForComparison.includes(s.id))
              ]}
            />
          )}

          {/* Loading Overlay */}
          {(loading.saving || loading.applying || loading.archiving) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-almet-mystic dark:border-gray-700 max-w-sm mx-4">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-almet-mystic dark:border-gray-600 border-t-almet-sapphire dark:border-t-almet-sapphire rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="font-semibold text-almet-cloud-burst dark:text-white text-lg mb-2">
                    {loading.saving ? 'Saving Scenario' : 
                     loading.applying ? 'Applying Scenario' : 
                     loading.archiving ? 'Archiving Scenario' : 'Processing'}
                  </h3>
                  <p className="text-sm text-almet-waterloo dark:text-gray-300">
                    {loading.saving ? 'Creating new draft scenario...' :
                     loading.applying ? 'Setting as current structure...' :
                     loading.archiving ? 'Moving to archive...' :
                     'Please wait while we process your request'}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-almet-sapphire dark:bg-almet-sapphire rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-almet-sapphire dark:bg-almet-sapphire rounded-full animate-bounce animation-delay-200"></div>
                      <div className="w-2 h-2 bg-almet-sapphire dark:bg-almet-sapphire rounded-full animate-bounce animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .border-b-3 {
          border-bottom-width: 3px;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default GradingPage;