// src/components/headcount/Pagination.jsx - Compact & Clean Design
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  loading = false,
  className = ""
}) => {
  const { darkMode } = useTheme();

  // Theme classes with modern colors
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700/40" : "border-gray-200/50";
  const bgCard = darkMode ? "bg-gray-800/30" : "bg-white/80";
  const bgHover = darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50/80";

  // Page size options
  const pageSizeOptions = [10, 25, 50, 100];

  // Calculate display range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Calculate total pages properly
  const actualTotalPages = totalPages > 0 ? totalPages : Math.ceil(totalItems / pageSize);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    
    if (actualTotalPages <= 7) {
      for (let i = 1; i <= actualTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(actualTotalPages);
      } else if (currentPage >= actualTotalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = actualTotalPages - 4; i <= actualTotalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(actualTotalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= actualTotalPages && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    if (onPageSizeChange && newSize !== pageSize) {
      onPageSizeChange(newSize);
    }
  };

  // Handle quick jump
  const handleQuickJump = (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(e.target.value);
      if (page >= 1 && page <= actualTotalPages) {
        handlePageChange(page);
        e.target.value = '';
      }
    }
  };

  // Don't render if no items
  if (totalItems === 0) {
    return (
      <div className={`text-center py-4 ${textMuted}`}>
        <div className="text-xs">No results to display</div>
      </div>
    );
  }

  return (
    <div className={`
      ${bgCard} 
      border-t ${borderColor} 
      px-4 py-2.5 
      flex flex-col lg:flex-row items-center justify-between gap-3
      backdrop-blur-sm
      rounded-lg
      ${className}
    `}>
      {/* Results Info - Compact */}
      <div className="flex items-center gap-3 ">
        <div className={`text-xs ${textSecondary}`}>
          <span className={textMuted}>Showing</span>{' '}
          <span className="font-semibold text-almet-sapphire">
            {startItem.toLocaleString()}
          </span>{' '}
          <span className={textMuted}>to</span>{' '}
          <span className="font-semibold text-almet-sapphire">
            {endItem.toLocaleString()}
          </span>{' '}
          <span className={textMuted}>of</span>{' '}
          <span className="font-semibold text-almet-sapphire">
            {totalItems.toLocaleString()}
          </span>
        </div>

        {/* Page Size Selector - Compact */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xs ${textMuted}`}>Show:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={loading}
              className={`
                appearance-none
                px-2 py-1 pr-6 text-xs font-medium
                border ${borderColor} rounded-md
                ${bgCard} ${textPrimary}
                focus:outline-none focus:ring-1 focus:ring-almet-sapphire/50 focus:border-almet-sapphire
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                hover:border-almet-sapphire/50
                backdrop-blur-sm
              `}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronRight 
              size={10} 
              className={`absolute right-1.5 top-1/2 transform -translate-y-1/2 rotate-90 ${textMuted} pointer-events-none`}
            />
          </div>
        </div>
      </div>

      {/* Navigation Controls - Compact */}
      <div className="flex items-center gap-2">
        {/* Quick Jump - Smaller */}
        {actualTotalPages > 10 && (
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${textMuted}`}>Go to:</span>
            <input
              type="number"
              min={1}
              max={actualTotalPages}
              placeholder="Page"
              onKeyPress={handleQuickJump}
              disabled={loading}
              className={`
                w-16 px-2 py-1 text-xs text-center font-medium
                border ${borderColor} rounded-md
                ${bgCard} ${textPrimary}
                focus:outline-none focus:ring-1 focus:ring-almet-sapphire/50 focus:border-almet-sapphire
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                hover:border-almet-sapphire/50
                backdrop-blur-sm
              `}
            />
          </div>
        )}

        {/* Page Navigation - Compact */}
        {actualTotalPages > 1 && (
          <div className="flex items-center gap-0.5">
            {/* First Page - Smaller */}
            {currentPage > 3 && actualTotalPages > 7 && (
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || loading}
                className={`
                  p-1.5 rounded-md border ${borderColor}
                  ${bgCard} ${textSecondary}
                  ${bgHover}
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  hover:border-almet-sapphire/50
                  focus:outline-none focus:ring-1 focus:ring-almet-sapphire/50
                `}
                title="First page"
              >
                <ChevronsLeft size={12} />
              </button>
            )}

            {/* Previous Button - Compact */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`
                flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md border ${borderColor}
                ${bgCard} ${textSecondary}
                ${bgHover}
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                hover:border-almet-sapphire/50
                focus:outline-none focus:ring-1 focus:ring-almet-sapphire/50
              `}
              title="Previous page"
            >
              <ChevronLeft size={12} />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Numbers - Compact */}
            <div className="flex items-center gap-0.5">
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <div key={`dots-${index}`} className={`px-1.5 py-1.5 ${textMuted}`}>
                      <MoreHorizontal size={12} />
                    </div>
                  );
                }

                const isCurrentPage = page === currentPage;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`
                      min-w-[32px] h-8 text-xs font-semibold rounded-md border transition-all duration-200
                      focus:outline-none focus:ring-1 focus:ring-almet-sapphire/50
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${isCurrentPage
                        ? 'bg-almet-sapphire text-white border-almet-sapphire shadow-sm scale-105'
                        : `${borderColor} ${bgCard} ${textSecondary} ${bgHover} hover:border-almet-sapphire/50 hover:scale-105`
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button - Compact */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === actualTotalPages || loading}
              className={`
                flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md border ${borderColor}
                ${bgCard} ${textSecondary}
                ${bgHover}
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                hover:border-almet-sapphire/50
                focus:outline-none focus:ring-1 focus:ring-almet-sapphire/50
              `}
              title="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={12} />
            </button>

            {/* Last Page - Smaller */}
            {currentPage < actualTotalPages - 2 && actualTotalPages > 7 && (
              <button
                onClick={() => handlePageChange(actualTotalPages)}
                disabled={currentPage === actualTotalPages || loading}
                className={`
                  p-1.5 rounded-md border ${borderColor}
                  ${bgCard} ${textSecondary}
                  ${bgHover}
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  hover:border-almet-sapphire/50
                  focus:outline-none focus:ring-1 focus:ring-almet-sapphire/50
                `}
                title="Last page"
              >
                <ChevronsRight size={12} />
              </button>
            )}
          </div>
        )}

        {/* Loading Indicator - Compact */}
        {loading && (
          <div className="flex items-center gap-1.5 text-almet-sapphire">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;