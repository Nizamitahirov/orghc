// src/components/headcount/utils/themeStyles.js - CLEAN VERSION WITHOUT DEFAULTS

/**
 * Global color mode management
 */
let COLOR_MODE = null;
let REFERENCE_DATA = null;
let COLOR_CONFIG_CACHE = new Map();

/**
 * Color mode listeners for real-time updates
 */
const COLOR_MODE_LISTENERS = new Set();

/**
 * Enhanced predefined color palette for automatic assignment
 */
const COLOR_PALETTE = [
  { primary: '#c4b5fd', light: '#ddd6fe', bg: '#f5f3ff', bgDark: '#6d28d9' }, // soft purple
  { primary: '#93c5fd', light: '#bfdbfe', bg: '#eff6ff', bgDark: '#1d4ed8' }, // soft blue
  { primary: '#6ee7b7', light: '#a7f3d0', bg: '#ecfdf5', bgDark: '#047857' }, // soft emerald
  { primary: '#67e8f9', light: '#a5f3fc', bg: '#ecfeff', bgDark: '#0e7490' }, // soft cyan
  { primary: '#fca5a5', light: '#fecaca', bg: '#fef2f2', bgDark: '#b91c1c' }, // soft red
  { primary: '#fdba74', light: '#fed7aa', bg: '#fff7ed', bgDark: '#c2410c' }, // soft orange
  { primary: '#5eead4', light: '#99f6e4', bg: '#f0fdfa', bgDark: '#0f766e' }, // soft teal
    { primary: '#4ade80', light: '#86efac', bg: '#ecfdf5', bgDark: '#047857' }, // soft violet
  { primary: '#f9a8d4', light: '#fbcfe8', bg: '#fdf2f8', bgDark: '#be185d' }, // soft pink
  { primary: '#86efac', light: '#bbf7d0', bg: '#f0fdf4', bgDark: '#15803d' }, // soft green
  { primary: '#7dd3fc', light: '#bae6fd', bg: '#f0f9ff', bgDark: '#0369a1' }, // soft sky
  { primary: '#fde047', light: '#fef08a', bg: '#fefce8', bgDark: '#a16207' }, // soft yellow
  { primary: '#f472b6', light: '#f9a8d4', bg: '#fdf2f8', bgDark: '#9d174d' }, // soft deep pink
  { primary: '#4ade80', light: '#86efac', bg: '#ecfdf5', bgDark: '#047857' }, // soft emerald-700
  { primary: '#fdba74', light: '#fed7aa', bg: '#fff7ed', bgDark: '#9a3412' }, // soft orange-800
  { primary: '#a78bfa', light: '#c4b5fd', bg: '#faf5ff', bgDark: '#5b21b6' }, // soft purple-800
];


/**
 * Default neutral color configuration - used when no color mode is selected
 */
const NEUTRAL_COLOR = {
  primary: '#30539b',
  light: '#9ca3af',
  bg: 'transparent',
  bgDark: 'transparent'
};

/**
 * Theme styles helper function
 */
export const getThemeStyles = (darkMode) => {
  return {
    bgCard: darkMode ? "bg-gray-800" : "bg-white",
    textPrimary: darkMode ? "text-white" : "text-gray-900",
    textSecondary: darkMode ? "text-gray-300" : "text-gray-700",
    textMuted: darkMode ? "text-gray-400" : "text-gray-500",
    borderColor: darkMode ? "border-gray-700" : "border-gray-200",
    inputBg: darkMode ? "bg-gray-700" : "bg-gray-100",
    btnPrimary: darkMode
      ? "bg-almet-sapphire hover:bg-almet-astral"
      : "bg-almet-sapphire hover:bg-almet-astral",
    btnSecondary: darkMode
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-200 hover:bg-gray-300",
    hoverBg: darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
    shadowClass: darkMode ? "" : "shadow",
    theadBg: darkMode ? "bg-gray-700" : "bg-gray-50",
  };
};

/**
 * Set reference data
 */
export const setReferenceData = (data) => {

  REFERENCE_DATA = data;
  
  // Clear cache to force rebuild
  COLOR_CONFIG_CACHE.clear();
  
  // Only rebuild configs if a color mode is already selected
  if (COLOR_MODE) {
    buildDynamicColorConfig(COLOR_MODE);
    notifyColorModeListeners(COLOR_MODE);
  }
  
  // Dispatch global event for components using addEventListener
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('referenceDataUpdated', { 
      detail: { data, timestamp: Date.now() } 
    }));
  }
};

/**
 * Color mode listener management
 */
export const addColorModeListener = (listener) => {
  if (typeof listener !== 'function') {
    return () => {};
  }
  
  COLOR_MODE_LISTENERS.add(listener);
  
  // Immediately call with current mode (could be null)
  try {
    listener(COLOR_MODE);
  } catch (error) {
    console.error('THEME_SIMPLE: Error calling new listener:', error);
  }
  
  // Return cleanup function
  const cleanup = () => {
    COLOR_MODE_LISTENERS.delete(listener);
  };
  
  return cleanup;
};

const notifyColorModeListeners = (mode) => {

  COLOR_MODE_LISTENERS.forEach(listener => {
    try {
      listener(mode);
    } catch (error) {
      console.error('THEME_SIMPLE: Error in listener:', error);
    }
  });
};

/**
 * Validate hex color
 */
const isValidHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

/**
 * Generate color variants from base color
 */
const generateColorVariants = (baseColor) => {
  if (!isValidHexColor(baseColor)) {
    return NEUTRAL_COLOR;
  }
  
  try {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const lightR = Math.min(255, r + 40);
    const lightG = Math.min(255, g + 40);
    const lightB = Math.min(255, b + 40);
    const light = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
    
    const bg = `rgba(${r}, ${g}, ${b}, 0.1)`;
    const bgDark = `rgba(${r}, ${g}, ${b}, 0.6)`;
    
    return {
      primary: baseColor,
      light: light,
      bg: bg,
      bgDark: bgDark
    };
  } catch (error) {
    console.error('THEME_SIMPLE: Error generating color variants:', error);
    return NEUTRAL_COLOR;
  }
};

/**
 * Build dynamic color config only when a mode is selected
 */
const buildDynamicColorConfig = (mode) => {
  if (!mode) {
    return {};
  }

  const cacheKey = `${mode}_${REFERENCE_DATA ? 'with_data' : 'no_data'}`;
  
  // Check cache first
  if (COLOR_CONFIG_CACHE.has(cacheKey)) {
    const cached = COLOR_CONFIG_CACHE.get(cacheKey);

    return cached;
  }



  let sourceData = [];
  const colorConfig = {};
  
  try {
    // Only proceed if we have reference data
    if (!REFERENCE_DATA) {
      console.warn('THEME_SIMPLE: No reference data available, returning empty config');
      COLOR_CONFIG_CACHE.set(cacheKey, colorConfig);
      return colorConfig;
    }

    switch (mode) {
      case 'HIERARCHY':
        sourceData = REFERENCE_DATA.positionGroups || [];
        break;
      case 'DEPARTMENT':
        sourceData = REFERENCE_DATA.departments || [];
        break;
      case 'BUSINESS_FUNCTION':
        sourceData = REFERENCE_DATA.businessFunctions || [];
        break;
      case 'UNIT':
        sourceData = REFERENCE_DATA.units || [];
        break;
      case 'JOB_FUNCTION':
        sourceData = REFERENCE_DATA.jobFunctions || [];
        break;
      case 'GRADE':
        // Build grade data from position groups
        sourceData = [];
        if (REFERENCE_DATA.positionGroups) {
          const gradeSet = new Set();
          REFERENCE_DATA.positionGroups.forEach(pg => {
            if (pg.grading_levels) {
              pg.grading_levels.forEach(level => {
                const gradeName = level.code || level.display || level.name || level.level;
                if (gradeName && !gradeSet.has(gradeName)) {
                  gradeSet.add(gradeName);
                  sourceData.push({
                    name: gradeName,
                    display_name: level.full_name || level.display || gradeName,
                    label: gradeName,
                    id: `grade_${gradeName}`,
                    color: level.color
                  });
                }
              });
            }
          });
        }
        break;
      default:
        sourceData = [];
    }

   
    
    // Only build config if we have actual data
    if (sourceData.length === 0) {
   
      COLOR_CONFIG_CACHE.set(cacheKey, colorConfig);
      return colorConfig;
    }
    
    sourceData.forEach((item, index) => {
      // Extract all possible key variations
      const possibleKeys = [];
      
      // Primary keys based on data structure
      if (item.name) possibleKeys.push(item.name);
      if (item.display_name) possibleKeys.push(item.display_name);
      if (item.label) possibleKeys.push(item.label);
      
      // Secondary keys
      if (item.code) possibleKeys.push(item.code);
      if (item.value) possibleKeys.push(item.value);
      if (item.id) possibleKeys.push(item.id.toString());

      
      if (possibleKeys.length === 0) {
        console.warn('THEME_SIMPLE: No valid keys for item:', item);
        return;
      }
      
      // Use primary key for color selection
      const primaryKey = possibleKeys[0];
      
      let colors;
      if (item.color && isValidHexColor(item.color)) {
        colors = generateColorVariants(item.color);
   
      } else {
        const paletteIndex = index % COLOR_PALETTE.length;
        colors = COLOR_PALETTE[paletteIndex];
    
      }
      
      // Add all possible keys to config
      possibleKeys.forEach(key => {
        colorConfig[key] = colors;
 
      });
    });


    
    // Cache the result
    COLOR_CONFIG_CACHE.set(cacheKey, colorConfig);
    return colorConfig;
    
  } catch (error) {
    console.error('THEME_SIMPLE: Error building config:', error);
    COLOR_CONFIG_CACHE.set(cacheKey, colorConfig);
    return colorConfig;
  }
};

/**
 * Get employee colors - returns neutral if no color mode is selected
 */
export const getEmployeeColors = (employee, darkMode = false) => {
  // If no color mode is selected, return neutral colors
  if (!COLOR_MODE) {

    return {
      borderColor: NEUTRAL_COLOR.primary,
      backgroundColor: NEUTRAL_COLOR.bg,
      dotColor: NEUTRAL_COLOR.light,
      textColor: darkMode ? '#ffffff' : '#000000',
      borderStyle: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, // Subtle border
      backgroundStyle: 'background-color: transparent',
      dotStyle: `background-color: ${NEUTRAL_COLOR.light}`,
      avatarStyle: `background-color: ${NEUTRAL_COLOR.primary}`
    };
  }

  const mode = COLOR_MODE;
  let colorKey = '';


  
  // Determine color key based on mode
  switch (mode) {
    case 'HIERARCHY':
      colorKey = employee.position_group_name || 
                 employee.position_group || 
                 employee.positionGroup || 
                 '';
      break;
    case 'DEPARTMENT':
      colorKey = employee.department_name || 
                 employee.department || 
                 '';
      break;
    case 'BUSINESS_FUNCTION':
      colorKey = employee.business_function_name || 
                 employee.businessFunction || 
                 employee.business_function || 
                 '';
      break;
    case 'UNIT':
      colorKey = employee.unit_name || 
                 employee.unit || 
                 '';
      break;
    case 'JOB_FUNCTION':
      colorKey = employee.job_function_name || 
                 employee.jobFunction || 
                 employee.job_function || 
                 '';
      break;
    case 'GRADE':
      colorKey = employee.grading_level || 
                 employee.grade || 
                 employee.grading_display ||
                 '';
      break;
    default:
      colorKey = '';
  }
  

  
  // Build dynamic color config
  const colorConfig = buildDynamicColorConfig(mode);

  
  // If no color key or no config, use neutral
  if (!colorKey || Object.keys(colorConfig).length === 0) {

    return {
      borderColor: NEUTRAL_COLOR.primary,
      backgroundColor: NEUTRAL_COLOR.bg,
      dotColor: NEUTRAL_COLOR.light,
      textColor: darkMode ? '#ffffff' : '#000000',
      borderStyle: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      backgroundStyle: 'background-color: transparent',
      dotStyle: `background-color: ${NEUTRAL_COLOR.light}`,
      avatarStyle: `background-color: ${NEUTRAL_COLOR.primary}`
    };
  }
  
  // Try exact match first
  let selectedColor = colorConfig[colorKey];
  
  // If no exact match, try case-insensitive search
  if (!selectedColor) {
    const exactKey = Object.keys(colorConfig).find(key => 
      key.toLowerCase() === colorKey.toLowerCase()
    );
    if (exactKey) {
      selectedColor = colorConfig[exactKey];

    }
  }
  
  // If still no match, try partial matching
  if (!selectedColor) {
    const partialKey = Object.keys(colorConfig).find(key => 
      key.includes(colorKey) || colorKey.includes(key)
    );
    if (partialKey) {
      selectedColor = colorConfig[partialKey];
  
    }
  }
  
  // Final fallback
  if (!selectedColor) {
    console.warn('THEME_SIMPLE: No color found for key:', colorKey, 'Using neutral');
    selectedColor = NEUTRAL_COLOR;
  }

  const result = {
    borderColor: selectedColor.primary,
    backgroundColor: darkMode ? selectedColor.bgDark : selectedColor.bg,
    dotColor: selectedColor.light,
    textColor: darkMode ? '#ffffff' : '#000000',
    borderStyle: `3px solid ${selectedColor.primary}`,
    backgroundStyle: darkMode ? 
      `background-color: ${selectedColor.bgDark}` : 
      `background-color: ${selectedColor.bg}`,
    dotStyle: `background-color: ${selectedColor.light}`,
    avatarStyle: `background-color: ${selectedColor.primary}`
  };


  return result;
};

/**
 * Get color grouping value for sorting - only when color mode is active
 */
export const getEmployeeColorGroup = (employee) => {
  if (!COLOR_MODE) {
    return null; // No grouping when no color mode
  }

  const mode = COLOR_MODE;
  let groupValue = '';
  
  switch (mode) {
    case 'HIERARCHY':
      groupValue = employee.position_group_name || employee.position_group || 'ZZ_Unknown';
      break;
    case 'DEPARTMENT':
      groupValue = employee.department_name || employee.department || 'ZZ_Unknown';
      break;
    case 'BUSINESS_FUNCTION':
      groupValue = employee.business_function_name || employee.business_function || 'ZZ_Unknown';
      break;
    case 'UNIT':
      groupValue = employee.unit_name || employee.unit || 'ZZ_Unknown';
      break;
    case 'JOB_FUNCTION':
      groupValue = employee.job_function_name || employee.job_function || 'ZZ_Unknown';
      break;
    case 'GRADE':
      groupValue = employee.grading_level || employee.grade || 'ZZ_No Grade';
      break;
    default:
      groupValue = null;
  }
  
  return groupValue;
};

/**
 * Set color mode
 */
export const setColorMode = (mode) => {

  COLOR_MODE = mode;
  
  // Build config for new mode if we have reference data
  if (mode && REFERENCE_DATA) {
    buildDynamicColorConfig(mode);
  }
  
  // Notify listeners immediately
  notifyColorModeListeners(mode);
  
  // Dispatch custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('colorModeChanged', { 
      detail: { mode, timestamp: Date.now() } 
    }));
  }
};

/**
 * Get current color mode
 */
export const getCurrentColorMode = () => {
  return COLOR_MODE;
};

/**
 * Check if color mode is active
 */
export const isColorModeActive = () => {
  return COLOR_MODE !== null;
};

/**
 * Get hierarchy legend
 */
export const getHierarchyLegend = (darkMode) => {
  try {
    if (!COLOR_MODE) {
      return [];
    }

    const mode = COLOR_MODE;
    const colorConfig = buildDynamicColorConfig(mode);
    
    return Object.entries(colorConfig).map(([key, colors]) => ({
      level: key,
      description: key,
      color: colors.light,
      colorHex: colors.primary
    }));
  } catch (error) {
    console.error('THEME_SIMPLE: Error getting hierarchy legend:', error);
    return [];
  }
};

/**
 * Get available color modes based on actual data
 */
export const getColorModes = () => {
  const availableModes = [];
  
  // Only add modes if we have actual data for them
  if (REFERENCE_DATA?.positionGroups?.length > 0) {
    availableModes.push({ value: 'HIERARCHY', label: 'Position Hierarchy', description: 'Color by job level' });
  }
  
  if (REFERENCE_DATA?.departments?.length > 0) {
    availableModes.push({ value: 'DEPARTMENT', label: 'Department', description: 'Color by department' });
  }
  
  if (REFERENCE_DATA?.businessFunctions?.length > 0) {
    availableModes.push({ value: 'BUSINESS_FUNCTION', label: 'Company', description: 'Color by business unit' });
  }
  
  if (REFERENCE_DATA?.units?.length > 0) {
    availableModes.push({ value: 'UNIT', label: 'Unit', description: 'Color by organizational unit' });
  }
  
  if (REFERENCE_DATA?.jobFunctions?.length > 0) {
    availableModes.push({ value: 'JOB_FUNCTION', label: 'Job Function', description: 'Color by job function' });
  }
  
  // Add Grade mode if position groups have grading levels
  if (REFERENCE_DATA?.positionGroups?.some(pg => pg.grading_levels && pg.grading_levels.length > 0)) {
    availableModes.push({ value: 'GRADE', label: 'Grade Level', description: 'Color by employee grade' });
  }
  
  return availableModes;
};

/**
 * Initialize color system with reference data - but don't set default mode
 */
export const initializeColorSystem = (referenceData) => {

  setReferenceData(referenceData);
  

};

/**
 * Backward compatibility functions
 */
export const getHierarchyColors = (positionGroup, darkMode) => {
  const employee = { position_group_name: positionGroup };
  const colors = getEmployeeColors(employee, darkMode);
  return {
    borderColor: `border-l-[${colors.borderColor}]`,
    bgColor: darkMode ? `hover:bg-[${colors.backgroundColor}]` : `hover:bg-[${colors.backgroundColor}]`,
    dotColor: `bg-[${colors.dotColor}]`
  };
};

export const getDepartmentColor = (department, darkMode) => {
  const employee = { department_name: department };
  const colors = getEmployeeColors(employee, darkMode);
  return darkMode ? `bg-[${colors.backgroundColor}]` : `bg-[${colors.backgroundColor}]`;
};