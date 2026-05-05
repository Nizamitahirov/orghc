'use client';
import { useMemo } from 'react';
import { useTheme } from '@/components/common/ThemeProvider';

/**
 * Returns Tailwind class strings derived from the current dark/light mode.
 * Use this hook in place of passing bgCard/textPrimary/... as props.
 *
 * Example:
 *   const { bgCard, textPrimary, borderColor } = useThemeClasses();
 */
export function useThemeClasses() {
  const { darkMode } = useTheme();

  return useMemo(() => ({
    darkMode,
    bgApp:         darkMode ? 'bg-gray-900'            : 'bg-almet-mystic',
    bgCard:        darkMode ? 'bg-almet-cloud-burst'   : 'bg-white',
    bgCardHover:   darkMode ? 'bg-almet-san-juan'      : 'bg-gray-50',
    bgSubtle:      darkMode ? 'bg-almet-san-juan/40'   : 'bg-gray-50',
    textPrimary:   darkMode ? 'text-white'             : 'text-almet-cloud-burst',
    textSecondary: darkMode ? 'text-almet-bali-hai'    : 'text-gray-700',
    textMuted:     darkMode ? 'text-gray-400'          : 'text-almet-waterloo',
    borderColor:   darkMode ? 'border-almet-comet'     : 'border-gray-200',
    borderSubtle:  darkMode ? 'border-almet-san-juan'  : 'border-gray-100',
    inputBg:       darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500'
                            : 'bg-gray-50  border-gray-300 text-gray-900 placeholder:text-gray-400',
    shadow:        darkMode ? 'shadow-gray-900/40'     : 'shadow-gray-200/60',
  }), [darkMode]);
}

export default useThemeClasses;
