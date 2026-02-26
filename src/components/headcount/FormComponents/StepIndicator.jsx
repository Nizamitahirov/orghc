// src/components/headcount/FormComponents/StepIndicator.jsx - IMPROVED UI/UX
import { Check, AlertCircle, Clock } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * IMPROVED STEP INDICATOR
 * ✓ Daha aydın görünüş
 * ✓ Smooth animations
 * ✓ Professional dizayn
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

  // IMPROVED THEME CLASSES
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";

  // Get step style
  const getStepStyle = (step) => {
    const status = getStepStatus(step);
    const isActive = step === currentStep;
    const isClickable = allowNavigation && onStepClick && (step <= currentStep || status === 'completed');

    let baseClasses = "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ";
    
    if (isClickable) {
      baseClasses += "cursor-pointer hover:scale-105 ";
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
          ? "bg-gray-700 text-gray-400 hover:bg-gray-600" 
          : "bg-gray-100 text-gray-500 hover:bg-gray-200");
    }
  };

  // Get step icon
  const getStepIcon = (step) => {
    const status = getStepStatus(step);
    
    switch (status) {
      case 'completed':
        return <Check size={12} strokeWidth={3} />;
      case 'error':
        return <AlertCircle size={12} />;
      case 'active':
        return <Clock size={12} />;
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
    return darkMode ? "bg-gray-700" : "bg-gray-300";
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
      {/* STEPS CONTAINER */}
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
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white dark:border-gray-900" />
                )}
              </div>
              
              {/* STEP LABEL */}
              {stepLabels && stepLabels[index] && (
                <div className="ml-1.5 hidden sm:block">
                  <p className={`text-[11px] font-medium leading-tight ${
                    step === currentStep ? 'text-almet-sapphire' : 
                    status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                    status === 'error' ? 'text-rose-600 dark:text-rose-400' :
                    textSecondary
                  }`}>
                    {stepLabels[index]}
                  </p>
                </div>
              )}
              
              {/* CONNECTOR LINE */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2">
                  <div className={`h-full transition-all duration-300 rounded-full ${getConnectorStyle(step)}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE STEP LABELS */}
      <div className="sm:hidden mt-1.5">
        {stepLabels && stepLabels[currentStep - 1] && (
          <div className="text-center">
            <p className={`text-xs font-medium ${textPrimary}`}>
              {stepLabels[currentStep - 1]}
            </p>
          </div>
        )}
      </div>

      {/* PROGRESS SUMMARY */}
      <div className="mt-1.5 flex justify-between items-center text-[10px]">
        <div className={textMuted}>
          Step {currentStep} of {totalSteps}
        </div>
        
        <div className="flex items-center gap-2">
          {/* COMPLETED STEPS */}
          {Array.from({ length: totalSteps }).filter((_, i) => getStepStatus(i + 1) === 'completed').length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-600 rounded-full" />
              <span className={textMuted}>
                {Array.from({ length: totalSteps }).filter((_, i) => getStepStatus(i + 1) === 'completed').length} done
              </span>
            </div>
          )}
          
          {/* ERROR STEPS */}
          {Array.from({ length: totalSteps }).some((_, i) => getStepStatus(i + 1) === 'error') && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-rose-500 dark:bg-rose-600 rounded-full" />
              <span className="text-rose-600 dark:text-rose-400">
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