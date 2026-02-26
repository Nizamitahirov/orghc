// src/components/common/Pagination.jsx

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  darkMode = false 
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const buttonClass = (isActive) => `
    px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
    ${isActive 
      ? 'bg-almet-sapphire text-white' 
      : `${darkMode ? 'bg-almet-san-juan text-almet-bali-hai hover:bg-almet-comet' : 'bg-white text-gray-700 hover:bg-gray-50'} border ${darkMode ? 'border-almet-comet' : 'border-gray-300'}`
    }
  `;

  const navButtonClass = `
    p-1.5 rounded-lg transition-colors
    ${darkMode 
      ? 'text-almet-bali-hai hover:bg-almet-comet disabled:opacity-30' 
      : 'text-gray-600 hover:bg-gray-100 disabled:opacity-30'
    }
    disabled:cursor-not-allowed
  `;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'}`}>
      {/* Info Text */}
      <div className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
        Showing <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{startItem}</span> to{' '}
        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{endItem}</span> of{' '}
        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalItems}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={navButtonClass}
          title="First page"
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={navButtonClass}
          title="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className={buttonClass(false)}
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className={`px-2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`}>...</span>
              )}
            </>
          )}

          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={buttonClass(pageNum === currentPage)}
            >
              {pageNum}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className={`px-2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`}>...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className={buttonClass(false)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={navButtonClass}
          title="Next page"
        >
          <ChevronRight size={14} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={navButtonClass}
          title="Last page"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}