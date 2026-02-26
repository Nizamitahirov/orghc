// src/components/assets/ActionDropdown.jsx - UPDATED
"use client";
import { useState, useEffect, useRef } from "react";
import {
  Eye,
  Edit,
  Trash2,
  UserPlus,
  MoreVertical,
  LogOut,
  RotateCcw,
  Activity,
  Ban,
  Reply,
} from "lucide-react";

const ActionDropdown = ({ asset, onAction, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const textPrimary = darkMode ? "text-gray-200" : "text-gray-700";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action) => {
    onAction(action, asset.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg ${hoverBg} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/20`}
        title="Actions"
      >
        <MoreVertical size={14} className="text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className={`absolute right-0 top-full mt-1 w-48 ${bgCard} rounded-lg shadow-xl border ${borderColor} z-50 py-1`}>
            <button
              onClick={() => handleAction('view')}
              className={`w-full px-4 py-2 text-left text-xs ${hoverBg} ${textPrimary} transition-colors flex items-center gap-2`}
            >
              <Eye size={12} className="text-almet-sapphire" />
              View Details
            </button>

            <button
              onClick={() => handleAction('edit')}
              className={`w-full px-4 py-2 text-left text-xs ${hoverBg} ${textPrimary} transition-colors flex items-center gap-2`}
            >
              <Edit size={12} className="text-gray-500" />
              Edit Asset
            </button>

            {asset.can_be_assigned && (
              <button
                onClick={() => handleAction('assign')}
                className={`w-full px-4 py-2 text-left text-xs ${hoverBg} ${textPrimary} transition-colors flex items-center gap-2`}
              >
                <UserPlus size={12} className="text-gray-500" />
                Assign Asset
              </button>
            )}

            <button
              onClick={() => handleAction('activities')}
              className={`w-full px-4 py-2 text-left text-xs ${hoverBg} ${textPrimary} transition-colors flex items-center gap-2`}
            >
              <Activity size={12} className="text-blue-500" />
              View Activities
            </button>

            {asset.can_be_checked_in && (
              <button
                onClick={() => handleAction('checkin')}
                className={`w-full px-4 py-2 text-left text-xs ${hoverBg} ${textPrimary} transition-colors flex items-center gap-2`}
              >
                <LogOut size={12} className="text-emerald-500" />
                Check In
              </button>
            )}

            <button
              onClick={() => handleAction('changeStatus')}
              className={`w-full px-4 py-2 text-left text-xs ${hoverBg} ${textPrimary} transition-colors flex items-center gap-2`}
            >
              <RotateCcw size={12} className="text-amber-500" />
              Change Status
            </button>

            {asset.status === 'NEED_CLARIFICATION' && (
              <button
                onClick={() => handleAction('clarification')}
                className={`w-full px-4 py-2 text-left text-xs ${hoverBg} ${textPrimary} transition-colors flex items-center gap-2`}
              >
                <Reply size={12} className="text-purple-500" />
                Provide Clarification
              </button>
            )}

            {(asset.status === 'ASSIGNED' || asset.status === 'NEED_CLARIFICATION' || asset.status === 'IN_USE') && (
              <button
                onClick={() => handleAction('cancelAssignment')}
                className={`w-full px-4 py-2 text-left text-xs ${hoverBg} ${textPrimary} transition-colors flex items-center gap-2`}
              >
                <Ban size={12} className="text-red-500" />
                Cancel Assignment
              </button>
            )}

            <hr className={`my-1 ${borderColor}`} />

            <button
              onClick={() => handleAction('delete')}
              className={`w-full px-4 py-2 text-left text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-red-600`}
            >
              <Trash2 size={12} />
              Delete Asset
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ActionDropdown;