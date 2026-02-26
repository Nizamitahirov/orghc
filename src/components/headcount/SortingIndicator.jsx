// src/components/headcount/SortingIndicator.jsx - Column sorting indicator
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";


const SortingIndicator = ({
  direction = null, // 'asc', 'desc', or null
  sortIndex = null, // Number for multi-sort order
  size = 14,
  className = ""
}) => {
  // No sorting applied
  if (!direction) {
    return (
      <ChevronsUpDown 
        size={size} 
        className={`text-gray-400 ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Sort direction indicator */}
      {direction === 'asc' ? (
        <ChevronUp size={size} className="text-almet-sapphire" />
      ) : (
        <ChevronDown size={size} className="text-almet-sapphire" />
      )}
      
      {/* Multi-sort index */}
      {sortIndex && (
        <span className="text-xs text-almet-sapphire ml-1 font-medium">
          {sortIndex}
        </span>
      )}
    </div>
  );
};

export default SortingIndicator;