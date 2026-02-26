import React from 'react';
import { BookOpen, Clock, CheckCircle, AlertCircle, Award, FileText, Calendar } from 'lucide-react';

const MyTrainingsTab = ({
  myTrainings,
  handleViewAssignmentDetails,
  darkMode,
  bgCard,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  const getStatusColor = (status) => {
    const colors = {
      'ASSIGNED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'OVERDUE': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (!myTrainings) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-almet-sapphire border-t-transparent"></div>
        <p className={`${textMuted} mt-3 text-sm`}>Loading trainings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: myTrainings.summary.total, icon: BookOpen, gradient: 'from-almet-sapphire to-almet-astral' },
          { label: 'In Progress', value: myTrainings.summary.in_progress, icon: Clock, gradient: 'from-yellow-500 to-orange-500' },
          { label: 'Completed', value: myTrainings.summary.completed, icon: CheckCircle, gradient: 'from-green-500 to-emerald-500' },
          { label: 'Overdue', value: myTrainings.summary.overdue, icon: AlertCircle, gradient: 'from-red-500 to-pink-500' }
        ].map((stat, idx) => (
          <div key={idx} className={`${bgCard} rounded-lg shadow-lg p-4 border ${borderColor} hover:shadow-xl transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${textSecondary} mb-1 font-medium`}>{stat.label}</p>
                <p className={`text-xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-lg`}>
                <stat.icon className="text-white" size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Assignments */}
      {myTrainings.assignments.length === 0 ? (
        <div className={`${bgCard} rounded-lg shadow-lg p-10 text-center border ${borderColor}`}>
          <Award className={`${textMuted} mx-auto mb-3`} size={44} />
          <h3 className={`text-base font-semibold ${textPrimary} mb-2`}>No trainings assigned</h3>
          <p className={`${textSecondary} text-xs`}>You don't have any trainings assigned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {myTrainings.assignments.map(assignment => (
            <div key={assignment.id} className={`${bgCard} rounded-lg shadow-lg p-4 border ${borderColor} hover:shadow-xl transition-all`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="px-2 py-0.5 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded text-xs font-semibold">
                      {assignment.training_id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className={`text-sm font-bold ${textPrimary} mb-1`}>{assignment.training_title}</h3>
                </div>
              </div>

              <div className="space-y-2.5 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={textMuted}>Progress:</span>
                  <span className="font-bold bg-gradient-to-r from-almet-sapphire to-almet-astral bg-clip-text text-transparent">
                    {assignment.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-almet-sapphire to-almet-astral transition-all"
                    style={{ width: `${assignment.progress_percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5">
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className={textMuted} />
                    <span className={textSecondary}>
                      {assignment.materials_completed_count}/{assignment.total_materials} materials
                    </span>
                  </div>
                  {assignment.due_date && (
                    <div className={`flex items-center gap-1 ${assignment.is_overdue ? 'text-red-600' : textMuted}`}>
                      <Calendar size={12} />
                      <span className="text-xs font-medium">
                        {assignment.is_overdue ? 'Overdue' : new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleViewAssignmentDetails(assignment.id)}
                className="w-full px-3 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white rounded-lg transition-all shadow-md hover:shadow-lg text-xs font-medium"
              >
                Continue Training
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrainingsTab;