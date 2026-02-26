// src/components/jobCatalog/HierarchyColors.js
// Sadə və effektiv rəng sistemi - hər position üçün fərqli rəng

const COLOR_PALETTE = [
  { primary: '#c4b5fd', light: '#ddd6fe', bg: '#f5f3ff', bgDark: 'rgba(109, 40, 217, 0.3)' },
  { primary: '#93c5fd', light: '#bfdbfe', bg: '#eff6ff', bgDark: 'rgba(29, 78, 216, 0.3)' },
  { primary: '#6ee7b7', light: '#a7f3d0', bg: '#ecfdf5', bgDark: 'rgba(4, 120, 87, 0.3)' },
  { primary: '#67e8f9', light: '#a5f3fc', bg: '#ecfeff', bgDark: 'rgba(14, 116, 144, 0.3)' },
  { primary: '#fca5a5', light: '#fecaca', bg: '#fef2f2', bgDark: 'rgba(185, 28, 28, 0.3)' },
  { primary: '#fdba74', light: '#fed7aa', bg: '#fff7ed', bgDark: 'rgba(194, 65, 12, 0.3)' },
  { primary: '#5eead4', light: '#99f6e4', bg: '#f0fdfa', bgDark: 'rgba(15, 118, 110, 0.3)' },
  { primary: '#a78bfa', light: '#c4b5fd', bg: '#faf5ff', bgDark: 'rgba(91, 33, 182, 0.3)' },
  { primary: '#f9a8d4', light: '#fbcfe8', bg: '#fdf2f8', bgDark: 'rgba(190, 24, 93, 0.3)' },
  { primary: '#86efac', light: '#bbf7d0', bg: '#f0fdf4', bgDark: 'rgba(21, 128, 61, 0.3)' },
  { primary: '#7dd3fc', light: '#bae6fd', bg: '#f0f9ff', bgDark: 'rgba(3, 105, 161, 0.3)' },
  { primary: '#fde047', light: '#fef08a', bg: '#fefce8', bgDark: 'rgba(161, 98, 7, 0.3)' },
];

let positionGroupsList = [];
const colorMap = new Map();

export const setPositionGroups = (groups) => {
  if (!groups || !Array.isArray(groups)) return;
  
  positionGroupsList = groups;
  colorMap.clear();
  
  groups.forEach((pg, index) => {
    const name = pg.label || pg.name || pg.display_name;
    if (name) {
      const colorIndex = index % COLOR_PALETTE.length;
      colorMap.set(name.toLowerCase(), COLOR_PALETTE[colorIndex]);
      

    }
  });
  

};

export const getHierarchyColor = (hierarchyName, darkMode = false) => {
  if (!hierarchyName) {
    return getDefaultColor(darkMode);
  }

  const key = hierarchyName.toLowerCase();
  let colors = colorMap.get(key);
  
  if (!colors) {
    for (const [mapKey, mapColors] of colorMap.entries()) {
      if (mapKey.includes(key) || key.includes(mapKey)) {
        colors = mapColors;
        break;
      }
    }
  }
  
  if (!colors) {
    console.warn(`No color found for: ${hierarchyName}, using default`);
    return getDefaultColor(darkMode);
  }

  return {
    borderColor: colors.primary,
    backgroundColor: darkMode ? colors.bgDark : colors.bg,
    dotColor: colors.light,
    textColor: darkMode ? '#ffffff' : '#000000'
  };
};

const getDefaultColor = (darkMode) => {
  return {
    borderColor: '#9ca3af',
    backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(243, 244, 246, 0.5)',
    dotColor: '#d1d5db',
    textColor: darkMode ? '#ffffff' : '#000000'
  };
};

export const getAllHierarchyColors = (darkMode = false) => {
  return Array.from(colorMap.entries()).map(([name, colors]) => ({
    name: name,
    ...getHierarchyColor(name, darkMode)
  }));
};

export default {
  setPositionGroups,
  getHierarchyColor,
  getAllHierarchyColors
};