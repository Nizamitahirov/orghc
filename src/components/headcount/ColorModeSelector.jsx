// src/components/headcount/ColorModeSelector.jsx - COMPACT VERSION
"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Palette, 
  BarChart3, 
  Building2, 
  Globe, 
  Landmark, 
  Briefcase, 
  Target,
  X
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useReferenceData } from "../../hooks/useReferenceData";

import { 
  setColorMode, 
  getCurrentColorMode, 
  addColorModeListener, 
  initializeColorSystem,
  getColorModes,
  isColorModeActive
} from "./utils/themeStyles";

const ColorSelector = ({ onChange }) => {
  const { darkMode } = useTheme();
  const [currentMode, setCurrentMode] = useState(getCurrentColorMode());
  const [availableModes, setAvailableModes] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [colorSystemReady, setColorSystemReady] = useState(false);
  
  const initRef = useRef(false);
  const lastReferenceDataRef = useRef(null);
  
  const referenceDataHook = useReferenceData();
  const {
    departments,
    businessFunctions,
    positionGroups,
    units,
    jobFunctions,
    loading: refLoading,
    error: refError
  } = referenceDataHook || {};

  // Initialize color system
  useEffect(() => {
    if (initRef.current || initialized) return;
    
    const isLoading = typeof refLoading === 'object' 
      ? Object.values(refLoading || {}).some(loading => loading === true)
      : refLoading;

    if (isLoading) return;

    const hasAnyData = (
      (positionGroups && positionGroups.length > 0) ||
      (departments && departments.length > 0) ||
      (businessFunctions && businessFunctions.length > 0) ||
      (units && units.length > 0) ||
      (jobFunctions && jobFunctions.length > 0)
    );

    if (!hasAnyData) return;

    const currentDataSignature = JSON.stringify({
      positionGroups: positionGroups?.length || 0,
      departments: departments?.length || 0,
      businessFunctions: businessFunctions?.length || 0,
      units: units?.length || 0,
      jobFunctions: jobFunctions?.length || 0
    });

    if (lastReferenceDataRef.current === currentDataSignature) return;

    initRef.current = true;
    lastReferenceDataRef.current = currentDataSignature;
    setInitialized(true);

    try {
      const referenceData = {
        positionGroups: positionGroups || [],
        departments: departments || [],
        businessFunctions: businessFunctions || [],
        units: units || [],
        jobFunctions: jobFunctions || []
      };
      
      initializeColorSystem(referenceData);
      const modes = getColorModes();
      setAvailableModes(modes);
      setColorSystemReady(true);
      
    } catch (error) {
      console.error('COLOR_SELECTOR: Error during initialization:', error);
    }
    
  }, [refLoading, positionGroups, departments, businessFunctions, units, jobFunctions, initialized]);

  // Color mode change listener
  useEffect(() => {
    const removeListener = addColorModeListener((newMode) => {
      setCurrentMode(newMode);
      if (onChange) onChange(newMode);
    });
    return removeListener;
  }, [onChange]);

  useEffect(() => {
    if (colorSystemReady) {
      const modes = getColorModes();
      setAvailableModes(modes);
    }
  }, [colorSystemReady]);

  const handleModeChange = (newMode) => {
    if (newMode === currentMode) return;
    
    const isAvailable = availableModes.some(mode => mode.value === newMode);
    if (!isAvailable) {
      console.warn('Mode not available:', newMode);
      return;
    }
    
    try {
      setColorMode(newMode);
      setCurrentMode(newMode);
      if (onChange) onChange(newMode);
    } catch (error) {
      console.error('Error changing mode:', error);
      const previousMode = getCurrentColorMode();
      setCurrentMode(previousMode);
    }
  };

  const handleClearMode = () => {
    setColorMode(null);
    setCurrentMode(null);
    if (onChange) onChange(null);
  };

  // Don't render if not ready or no modes
  if (!colorSystemReady || availableModes.length === 0) return null;

  const isLoading = typeof refLoading === 'object' 
    ? Object.values(refLoading || {}).some(loading => loading === true)
    : refLoading;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 mb-2">
        <Palette size={12} className="text-gray-400 animate-pulse" />
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  const getModeIcon = (mode) => {
    const iconProps = { size: 14, className: "flex-shrink-0" };
    switch(mode) {
      case 'HIERARCHY': return <BarChart3 {...iconProps} />;
      case 'DEPARTMENT': return <Building2 {...iconProps} />;
      case 'BUSINESS_FUNCTION': return <Globe {...iconProps} />;
      case 'UNIT': return <Landmark {...iconProps} />;
      case 'JOB_FUNCTION': return <Briefcase {...iconProps} />;
      case 'GRADE': return <Target {...iconProps} />;
      default: return <Palette {...iconProps} />;
    }
  };

  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="flex items-center gap-1.5">
        <Palette size={14} className="text-almet-sapphire dark:text-almet-steel-blue flex-shrink-0" />
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          Color by:
        </span>
      </div>
      
      <div className="flex items-center gap-1.5 flex-wrap">
        {availableModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => handleModeChange(mode.value)}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg 
              transition-all duration-200 border font-medium
              ${currentMode === mode.value
                ? 'bg-almet-mystic dark:bg-almet-cloud-burst/30 text-almet-cloud-burst dark:text-almet-mystic border-almet-sapphire/30 dark:border-almet-steel-blue/50 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-almet-mystic/50 dark:hover:bg-almet-cloud-burst/20 border-gray-200 dark:border-gray-700 hover:border-almet-bali-hai/50 dark:hover:border-almet-waterloo/50'
              }
            `}
            title={mode.description}
          >
            <span className={currentMode === mode.value ? 'text-almet-sapphire dark:text-almet-steel-blue' : 'text-almet-waterloo dark:text-almet-bali-hai'}>
              {getModeIcon(mode.value)}
            </span>
            <span>{mode.label}</span>
          </button>
        ))}
        
        {/* Clear button */}
        {isColorModeActive() && (
          <button
            onClick={handleClearMode}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg 
                     text-almet-waterloo dark:text-almet-bali-hai hover:text-red-500 dark:hover:text-red-400 
                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200
                     border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800"
            title="Clear colors"
          >
            <X size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ColorSelector;