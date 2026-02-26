import { useState } from 'react';
import { MessageSquare, AlertCircle, ChevronDown, ChevronRight, User, Calendar } from 'lucide-react';

export default function ClarificationComments({ comments, darkMode }) {
  
  
  // ✅ Early return with logging
  if (!comments || comments.length === 0) {
    console.log('⚠️ ClarificationComments: No comments to display');
    return null;
  }
  
  const [isExpanded, setIsExpanded] = useState(true);

  const getCommentTypeLabel = (type) => {
    const types = {
      'OBJECTIVE_CLARIFICATION': { label: 'Objectives', color: 'blue' },
      'OBJECTIVES': { label: 'Objectives', color: 'blue' },
      'COMPETENCIES': { label: 'Competencies', color: 'purple' },
      'MID_YEAR': { label: 'Mid-Year Review', color: 'orange' },
      'END_YEAR': { label: 'End-Year Review', color: 'green' },
      'FINAL_CLARIFICATION': { label: 'Final Review', color: 'red' },
      'DEVELOPMENT': { label: 'Development Needs', color: 'indigo' },
      'GENERAL': { label: 'General', color: 'gray' },
      'GENERAL_NOTE': { label: 'General Note', color: 'gray' }
    };
    return types[type] || types['GENERAL'];
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30',
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30',
      red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30',
      gray: 'bg-almet-waterloo/10 text-almet-waterloo border-almet-waterloo/20'
    };
    return colors[color] || colors['gray'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // ✅ Parse comment text from content field
  const getCommentText = (comment) => {
    // Priority: comment > content (parsed) > content (raw)
    if (comment.comment) {
      return comment.comment;
    }
    
    // Try to parse content if it's a JSON string
    if (typeof comment.content === 'string') {
      // Check if it looks like a dict/JSON string
      if (comment.content.includes('{') && comment.content.includes('comment')) {
        try {
          // Replace single quotes with double quotes for JSON
          const jsonString = comment.content.replace(/'/g, '"');
          const parsed = JSON.parse(jsonString);
          return parsed.comment || comment.content;
        } catch (e) {
          console.warn('Failed to parse comment content:', e);
        }
      }
      // Return raw content if not JSON
      return comment.content;
    }
    
    return 'No comment text';
  };



  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst/60 border-almet-comet/30' : 'bg-white border-almet-mystic'} rounded-xl border shadow-sm overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-5 flex items-center justify-between ${darkMode ? 'hover:bg-almet-san-juan/20' : 'hover:bg-almet-mystic/30'} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-600/10 dark:bg-red-600/20">
            <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-left">
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              Clarification Requests
            </h3>
            <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mt-0.5`}>
              {comments.length} clarification{comments.length !== 1 ? 's' : ''} requested
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/30 text-xs font-semibold">
            {comments.length}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-almet-waterloo" />
          ) : (
            <ChevronRight className="w-5 h-5 text-almet-waterloo" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className={`border-t ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
          <div className="p-5 space-y-4">
            {comments.map((comment, index) => {
              const typeInfo = getCommentTypeLabel(comment.comment_type);
              const colorClasses = getColorClasses(typeInfo.color);
              const commentText = getCommentText(comment);
              
         
              
              return (
                <div 
                  key={comment.id || index}
                  className={`${darkMode ? 'bg-almet-san-juan/30 border-almet-comet/30' : 'bg-almet-mystic/50 border-almet-bali-hai/10'} rounded-xl p-4 border`}
                >
                  {/* Type Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${colorClasses}`}>
                      {typeInfo.label}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <div className={`${darkMode ? 'bg-almet-cloud-burst/60 border-almet-comet/30' : 'bg-white border-almet-bali-hai/10'} rounded-xl p-4 mb-3 border`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} leading-relaxed whitespace-pre-wrap`}>
                        {commentText}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className={`flex items-center gap-3 text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                    {comment.created_by_name && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>By: <span className="font-medium">{comment.created_by_name}</span></span>
                      </div>
                    )}
                    {comment.created_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}