import React from 'react';
import { BookOpen, Clock, CheckCircle, FileText } from 'lucide-react';

const OnboardingTrainingCard = ({ assignment, darkMode, onClick }) => {
  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return 'text-green-600 dark:text-green-400';
    if (status === 'IN_PROGRESS') return 'text-yellow-600 dark:text-yellow-400';
    if (status === 'OVERDUE') return 'text-red-600 dark:text-red-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getDaysRemaining = () => {
    if (!assignment.due_date) return null;
    const today = new Date();
    const dueDate = new Date(assignment.due_date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days remaining`;
  };

  return (
    <div 
      onClick={() => onClick(assignment)}
      className={`bg-white dark:bg-almet-cloud-burst rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border ${
        assignment.status === 'COMPLETED'
          ? 'border-green-500 dark:border-green-400' 
          : 'border-almet-mystic dark:border-almet-san-juan'
      } overflow-hidden group cursor-pointer`}
    >
      <div className={`h-1.5 ${
        assignment.status === 'COMPLETED'
          ? 'bg-gradient-to-r from-green-500 to-green-600' 
          : 'bg-gradient-to-r from-almet-sapphire to-almet-astral'
      }`}></div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-xl ${
              assignment.status === 'COMPLETED'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                : 'bg-gradient-to-br from-almet-mystic to-white dark:from-almet-san-juan dark:to-almet-comet text-almet-sapphire dark:text-almet-steel-blue'
            }`}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm text-almet-cloud-burst dark:text-white group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
                  {assignment.training_title}
                </h3>
                {assignment.status === 'COMPLETED' && (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-almet-waterloo dark:text-almet-bali-hai mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getDaysRemaining()}
                </span>
              </div>
              
          
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(assignment);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <FileText className="h-3.5 w-3.5" />
          {assignment.status === 'COMPLETED' ? 'Review Training' : 'Continue Training'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingTrainingCard;