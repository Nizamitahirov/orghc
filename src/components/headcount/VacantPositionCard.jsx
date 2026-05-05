// src/components/headcount/VacantPositionCard.jsx
import { useState } from 'react';
import {
  MoreVertical, Briefcase, Users, Building, Calendar,
  Edit, Trash2, UserPlus, MapPin, Star, Eye, Hash, ChevronRight
} from 'lucide-react';

const VacantPositionCard = ({
  position,
  onEdit,
  onDelete,
  onConvert,
  darkMode = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const textPrimary    = darkMode ? "text-gray-100"    : "text-gray-800";
  const textSecondary  = darkMode ? "text-gray-300"    : "text-gray-600";
  const textMuted      = darkMode ? "text-gray-400"    : "text-gray-500";
  const bgCard         = darkMode ? "bg-gray-800"      : "bg-white";
  const bgMeta         = darkMode ? "bg-gray-700/40"   : "bg-gray-50";
  const borderColor    = darkMode ? "border-gray-600"  : "border-gray-200";
  const hoverBg        = darkMode ? "hover:bg-gray-700": "hover:bg-gray-50";

  const handleEdit    = () => { setIsDropdownOpen(false); onEdit(position); };
  const handleDelete  = () => { setIsDropdownOpen(false); onDelete(position.id); };
  const handleConvert = () => { setIsDropdownOpen(false); onConvert(position); };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const gradingDisplay = (level) => level ? level.replace('_', '-') : 'N/A';

  return (
    <div className={`group ${bgCard} rounded-xl border ${borderColor} shadow-sm hover:shadow-md hover:border-almet-sapphire/40 transition-all duration-200 relative overflow-hidden flex flex-col`}>

      {/* Top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-almet-sapphire to-almet-steel-blue flex-shrink-0" />

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">

        {/* Header: icon + title + actions */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-almet-sapphire/10 border border-almet-sapphire/20 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4 text-almet-sapphire" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${textPrimary} truncate group-hover:text-almet-sapphire transition-colors`}>
              {position.job_title || 'Untitled Position'}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Hash className="w-3 h-3 text-almet-comet flex-shrink-0" />
              <span className={`text-xs font-mono ${textMuted}`}>
                {position.position_id || position.employee_id || '—'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`p-1.5 rounded-md ${hoverBg} transition-colors`}
              title="More actions"
            >
              <MoreVertical size={14} className={textMuted} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className={`absolute right-0 top-full mt-1 w-44 ${bgCard} border ${borderColor} rounded-xl shadow-xl z-20 overflow-hidden`}>
                  <div className="py-1">
                    <button onClick={handleConvert} className="w-full px-3 py-2 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <UserPlus size={10} className="text-green-600" />
                      </div>
                      <span className={`${textPrimary} font-medium`}>Convert to Employee</span>
                    </button>
                    <button onClick={handleEdit} className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Edit size={10} className="text-blue-600" />
                      </div>
                      <span className={`${textPrimary} font-medium`}>Edit Position</span>
                    </button>
                    <div className={`border-t ${borderColor} my-1`} />
                    <button onClick={handleDelete} className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <Trash2 size={10} className="text-red-600" />
                      </div>
                      <span className="text-red-600 dark:text-red-400 font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Org info grid */}
        <div className={`${bgMeta} rounded-lg p-3 grid grid-cols-2 gap-x-4 gap-y-2.5`}>
          <div>
            <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${textMuted} mb-1`}>
              <Building size={9} /> Company
            </div>
            <p className={`text-xs font-medium ${textSecondary} truncate`} title={position.business_function_name}>
              {position.business_function_name || '—'}
            </p>
          </div>

          <div>
            <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${textMuted} mb-1`}>
              <MapPin size={9} /> Department
            </div>
            <p className={`text-xs font-medium ${textSecondary} truncate`} title={position.department_name}>
              {position.department_name || '—'}
            </p>
          </div>

          <div>
            <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${textMuted} mb-1`}>
              <Star size={9} /> Position Group
            </div>
            <p className={`text-xs font-medium ${textSecondary} truncate`} title={position.position_group_name}>
              {position.position_group_name || '—'}
            </p>
          </div>

          <div>
            <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${textMuted} mb-1`}>
              <Briefcase size={9} /> Grade
            </div>
            {position.grading_level ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-almet-sapphire text-white">
                {gradingDisplay(position.grading_level)}
              </span>
            ) : (
              <span className={`text-xs ${textMuted}`}>—</span>
            )}
          </div>

          {position.job_function_name && (
            <div className="col-span-2">
              <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${textMuted} mb-1`}>
                <Briefcase size={9} /> Job Function
              </div>
              <p className={`text-xs font-medium ${textSecondary}`}>
                {position.job_function_name}
              </p>
            </div>
          )}

          {position.reporting_to_name && (
            <div className="col-span-2">
              <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${textMuted} mb-1`}>
                <Users size={9} /> Reports To
              </div>
              <p className={`text-xs font-medium ${textPrimary}`}>
                {position.reporting_to_name}
                {position.reporting_to_hc_number && (
                  <span className={`ml-1.5 ${textMuted} font-mono`}>#{position.reporting_to_hc_number}</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {position.notes && (
          <div className="px-3 py-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-lg">
            <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1`}>
              <Eye size={9} /> Notes
            </div>
            <p className={`text-xs italic ${darkMode ? 'text-amber-200' : 'text-amber-800'} line-clamp-2`}>
              {position.notes}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`px-4 py-2.5 border-t ${borderColor} ${bgMeta} flex items-center justify-between`}>
        <div className={`flex items-center gap-1 text-xs ${textMuted}`}>
          <Calendar size={10} />
          <span>{formatDate(position.created_at)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {position.is_visible_in_org_chart && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300">
              <Eye size={8} /> Org
            </span>
          )}
          {position.include_in_headcount && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300">
              <Hash size={8} /> HC
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VacantPositionCard;
 