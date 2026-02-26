// src/components/grading/LoadingSpinner.jsx - Simplified using Almet colors
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Loading Spinner Component
export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-almet-mystic/30 to-white dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-almet-mystic dark:border-almet-comet rounded-full animate-spin border-t-almet-sapphire mx-auto mb-4"></div>
        <div className="absolute inset-0 w-16 h-16 border-2 border-transparent rounded-full border-t-almet-astral animate-spin animation-delay-150 mx-auto"></div>
      </div>
      <h3 className="text-base font-medium text-almet-cloud-burst dark:text-white mb-2">{message}</h3>
      <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
        Please wait while we load the grading system
      </p>
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-almet-sapphire rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-almet-sapphire rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-2 h-2 bg-almet-sapphire rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>
    </div>
  </div>
);

// Error Display Component
export const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-almet-mystic/30 to-white dark:from-gray-900 dark:to-gray-800">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
        System Error
      </h3>
      
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
          {error}
        </p>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          <strong>Troubleshooting:</strong> Please ensure the database is properly configured with position groups and grading system data.
        </p>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-almet-sapphire text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-almet-astral transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Retry Loading
        </button>
      )}
      
      <div className="mt-4 text-xs text-almet-waterloo dark:text-almet-bali-hai">
        If the problem persists, please contact your system administrator.
      </div>
    </div>
  </div>
);

export default { LoadingSpinner, ErrorDisplay };