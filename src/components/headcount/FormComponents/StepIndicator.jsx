// src/components/headcount/FormComponents/StepIndicator.jsx - REDESIGNED
import { Check, AlertCircle, Clock } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * TƏKMİLLƏŞDİRİLMİŞ STEP INDICATOR
 * - Daha kompakt və oxunaqlı dizayn
 * - Kiçik font ölçüləri
 * - Yumşaq rənglər və keçidlər
 * - Almet rəng palitrasına uyğun
 */
const StepIndicator = ({ 
  currentStep, 
  totalSteps, 
  stepLabels = [],
  getStepStatus = () => 'pending',
  onStepClick = null,
  allowNavigation = true
}) => {
  const { darkMode } = useTheme();

  // TƏKMİLLƏŞDİRİLMİŞ THEME CLASSES
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";

  // Get step style
  const getStepStyle = (step) => {
    const status = getStepStatus(step);
    const isActive = step === currentStep;
    const isClickable = allowNavigation && onStepClick && (step <= currentStep || status === 'completed');

    let baseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ";
    
    if (isClickable) {
      baseClasses += "cursor-pointer ";
    }

    switch (status) {
      case 'completed':
        return baseClasses + "bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700 shadow-sm";
      case 'error':
        return baseClasses + "bg-rose-500 dark:bg-rose-600 text-white hover:bg-rose-600 dark:hover:bg-rose-700 shadow-sm";
      case 'active':
        return baseClasses + "bg-almet-sapphire text-white shadow-md ring-2 ring-almet-sapphire/30";
      case 'pending':
      default:
        if (isActive) {
          return baseClasses + "bg-almet-sapphire text-white shadow-md ring-2 ring-almet-sapphire/30";
        }
        return baseClasses + (darkMode 
          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
          : "bg-gray-100 text-almet-comet hover:bg-gray-200");
    }
  };

  // Get step icon
  const getStepIcon = (step) => {
    const status = getStepStatus(step);
    
    switch (status) {
      case 'completed':
        return <Check size={14} strokeWidth={3} />;
      case 'error':
        return <AlertCircle size={14} />;
      case 'active':
        return <Clock size={14} />;
      default:
        return <span className="text-xs font-bold">{step}</span>;
    }
  };

  // Get connector line style
  const getConnectorStyle = (step) => {
    const status = getStepStatus(step);
    
    if (status === 'completed' || step < currentStep) {
      return "bg-emerald-400 dark:bg-emerald-500";
    }
    if (status === 'error') {
      return "bg-rose-400 dark:bg-rose-500";
    }
    return darkMode ? "bg-gray-700" : "bg-gray-200";
  };

  // Handle step click
  const handleStepClick = (step) => {
    if (!allowNavigation || !onStepClick) return;
    
    const status = getStepStatus(step);
    if (step <= currentStep || status === 'completed') {
      onStepClick(step);
    }
  };

  return (
    <div className="w-full">
      {/* STEPS CONTAINER - kompakt */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isLast = step === totalSteps;
          const status = getStepStatus(step);
          
          return (
            <div key={step} className="flex items-center flex-1">
              {/* STEP CIRCLE */}
              <div className="relative flex items-center">
                <div
                  className={getStepStyle(step)}
                  onClick={() => handleStepClick(step)}
                  title={stepLabels[index] || `Step ${step}`}
                >
                  {getStepIcon(step)}
                </div>
                
                {/* ERROR INDICATOR */}
                {status === 'error' && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              
              {/* STEP LABEL - kiçik və oxunaqlı */}
              {stepLabels && stepLabels[index] && (
                <div className="ml-2 hidden sm:block">
                  <p className={`text-xs font-medium ${
                    step === currentStep ? 'text-almet-sapphire' : 
                    status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                    status === 'error' ? 'text-rose-600 dark:text-rose-400' :
                    textSecondary
                  }`}>
                    {stepLabels[index]}
                  </p>
                  <p className={`text-[10px] ${textMuted}`}>
                    {status === 'completed' ? 'Completed' :
                     status === 'error' ? 'Has errors' :
                     step === currentStep ? 'Current' :
                     step < currentStep ? 'Completed' : 'Pending'}
                  </p>
                </div>
              )}
              
              {/* CONNECTOR LINE - yumşaq */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-3">
                  <div className={`h-full transition-all duration-300 rounded-full ${getConnectorStyle(step)}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE STEP LABELS - çox kiçik */}
      <div className="sm:hidden mt-2">
        {stepLabels && stepLabels[currentStep - 1] && (
          <div className="text-center">
            <p className={`text-xs font-medium ${textPrimary}`}>
              {stepLabels[currentStep - 1]}
            </p>
            <p className={`text-[10px] ${textMuted}`}>
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        )}
      </div>

      {/* PROGRESS SUMMARY - kompakt */}
      <div className="mt-2 flex justify-between items-center text-[10px]">
        <div className={textMuted}>
          <span>Step {currentStep} of {totalSteps}</span>
          {stepLabels[currentStep - 1] && (
            <span className="hidden sm:inline"> • {stepLabels[currentStep - 1]}</span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* COMPLETED STEPS */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-600 rounded-full" />
            <span className={textMuted}>
              {Array.from({ length: totalSteps }).filter((_, i) => getStepStatus(i + 1) === 'completed').length} done
            </span>
          </div>
          
          {/* ERROR STEPS */}
          {Array.from({ length: totalSteps }).some((_, i) => getStepStatus(i + 1) === 'error') && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-rose-500 dark:bg-rose-600 rounded-full" />
              <span className={`text-rose-600 dark:text-rose-400`}>
                {Array.from({ length: totalSteps }).filter((_, i) => getStepStatus(i + 1) === 'error').length} errors
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;