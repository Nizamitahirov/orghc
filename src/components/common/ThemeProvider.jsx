"use client";
import { createContext, useState, useEffect, useContext } from "react";

// Create context
const ThemeContext = createContext({
  darkMode: false,
  toggleTheme: () => {},
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize when component mounts
  useEffect(() => {
    // Apply class to <html> element
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Toggle 'dark' class on <html> element
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);