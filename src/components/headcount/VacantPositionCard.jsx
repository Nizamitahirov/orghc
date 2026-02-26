// src/components/headcount/VacantPositionCard.jsx - IMPROVED USER-FRIENDLY DESIGN
import { useState } from 'react';
import { 
  MoreVertical, 
  Briefcase, 
  Users, 
  Building, 
  Calendar,
  Edit,
  Trash2,
  UserPlus,
  MapPin,
  Star,
  Eye,
  Hash
} from 'lucide-react';

const VacantPositionCard = ({ 
  position, 
  onEdit, 
  onDelete, 
  onConvert, 
  darkMode = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Improved theme styles with better contrast and readability
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-800";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgSecondary = darkMode ? "bg-gray-700/50" : "bg-gray-50";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  const handleEdit = () => {
    setIsDropdownOpen(false);
    onEdit(position);
  };

  const handleDelete = () => {
    setIsDropdownOpen(false);
    onDelete(position.id);
  };

  const handleConvert = () => {
    setIsDropdownOpen(false);
    onConvert(position);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradingLevelDisplay = (level) => {
    if (!level) return 'N/A';
    return level.replace('_', '-');
  };

  return (
    <div className={`group ${bgCard} rounded-lg border ${borderColor} shadow-sm hover:shadow-md hover:border-almet-sapphire/40 transition-all duration-300 relative overflow-hidden`}>
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-almet-sapphire to-almet-steel-blue"></div>
      
      {/* Header with better spacing */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Refined icon design */}
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-almet-sapphire/10 to-almet-steel-blue/10 rounded-lg border border-almet-sapphire/20">
              <Briefcase className="w-5 h-5 text-almet-sapphire" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-base font-semibold ${textPrimary} truncate mb-1 group-hover:text-almet-sapphire transition-colors leading-tight`}>
                {position.job_title || 'Untitled Position'}
              </h3>
              <div className="flex items-center space-x-1.5 text-xs">
                <Hash className="w-3 h-3 text-almet-comet" />
                <span className={`${textMuted} font-mono`}>
                  {position.position_id || position.employee_id}
                </span>
              </div>
            </div>
          </div>

          {/* Improved actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`p-1.5 rounded-md ${hoverBg} transition-colors opacity-0 group-hover:opacity-100`}
            >
              <MoreVertical size={14} className={textMuted} />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={handleConvert}
                      className="w-full px-3 py-2 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center text-xs"
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-md mr-2">
                        <UserPlus size={10} className="text-green-600" />
                      </div>
                      <div>
                        <span className={`${textPrimary} font-medium`}>Convert to Employee</span>
  
                      </div>
                    </button>
                    
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center text-xs"
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-md mr-2">
                        <Edit size={10} className="text-blue-600" />
                      </div>
                      <div>
                        <span className={`${textPrimary} font-medium`}>Edit Position</span>
                    
                      </div>
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center text-xs"
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-md mr-2">
                        <Trash2 size={10} className="text-red-600" />
                      </div>
                      <div>
                        <span className="text-red-600 dark:text-red-400 font-medium">Delete Position</span>
         
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Compact organizational information */}
        <div className="space-y-2.5 mb-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center text-xs font-medium text-almet-comet mb-1">
                <Building size={10} className="mr-1" />
                Company
              </div>
              <p className={`text-sm ${textSecondary} font-medium truncate`}>
                {position.business_function_name}
              </p>
           
            </div>

            <div>
              <div className="flex items-center text-xs font-medium text-almet-comet mb-1">
                <MapPin size={10} className="mr-1" />
                Department
              </div>
              <p className={`text-sm ${textSecondary} font-medium truncate`}>
                {position.department_name || 'N/A'}
              </p>
            </div>
          </div>

          {/* Position details in compact layout */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex items-center text-xs font-medium text-almet-comet mb-1">
                  <Star size={10} className="mr-1" />
                Position  Group
                </div>
                <p className={`text-sm ${textSecondary} font-medium truncate`}>
                  {position.position_group_name || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center text-xs font-medium text-almet-comet mb-1">
                <Briefcase size={10} className="mr-1" />
                Grade
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                position.grading_level 
                  ? 'bg-almet-sapphire text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {getGradingLevelDisplay(position.grading_level)}
              </span>
            </div>
          </div>
        </div>
<div className="grid grid-cols-2 gap-3">{/* Job function - if different from position group */}
        {position.job_function_name && (
          <div className="mb-3">
            <div className="flex items-center text-xs font-medium text-almet-comet mb-1">
              <Briefcase size={10} className="mr-1" />
              Job Function
            </div>
            <p className={`text-sm ${textSecondary} font-medium`}>
              {position.job_function_name}
            </p>
          </div>
        )}
        {/* Reporting relationship - if exists */}
        {position.reporting_to_name && (
          <div className={`mb-3 rounded-md`}>
            <div className="flex items-center text-xs font-medium text-almet-comet mb-1">
              <Users size={10} className="mr-1" />
              Reports To
            </div>
            <div className="flex items-center space-x-2">
            
              <div>
                <p className={`text-sm ${textPrimary} font-medium`}>
                  {position.reporting_to_name} <span className={`text-xs ${textMuted}`}> (#{position.reporting_to_hc_number})</span>
                </p>
               
              </div>
            </div>
          </div>
        )}</div>
        


        {/* Notes - if exists */}
        {position.notes && (
          <div className="mb-3 p-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-md">
            <div className="flex items-center text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
              <Eye size={10} className="mr-1" />
              Notes
            </div>
            <p className={`text-sm ${darkMode ? 'text-amber-200' : 'text-amber-800'} italic`}>
              {position.notes}
            </p>
          </div>
        )}
      </div>

      {/* Cleaner footer */}
      <div className={`px-4 py-2.5 border-t ${borderColor} ${bgSecondary}`}>
        <div className="flex items-center justify-between">
          {/* Creation date */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={10} className="mr-1" />
            <span>Created {formatDate(position.created_at)}</span>
          </div>

          {/* Status indicators - more compact */}
          <div className="flex items-center space-x-1.5">
            {position.is_visible_in_org_chart && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300">
                <Eye size={8} className="mr-0.5" />
                Org Chart
              </span>
            )}
            {position.include_in_headcount && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300">
                <Hash size={8} className="mr-0.5" />
                Headcount
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacantPositionCard;