// components/jobDescription/SubmissionModal.jsx - COMPLETE: Enhanced for Multiple Jobs
import React from 'react';
import { 
  X, 
  Send, 
  Save, 
  FileText, 
  Users, 
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Building
} from 'lucide-react';

const SubmissionModal = ({
  createdJobsData,
  isExistingJobSubmission = false,
  submissionComments,
  submissionLoading = false,
  onCommentsChange,
  onSubmitForApproval,
  onKeepAsDraft,
  onClose,
  darkMode = false
}) => {
  const bgModal = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-400";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // Extract job creation information
  const isMultipleJobs = createdJobsData?.summary?.total_job_descriptions_created > 1;
  const jobCount = createdJobsData?.summary?.total_job_descriptions_created || 1;
  const createdJobs = createdJobsData?.created_job_descriptions || [];
  
  // Get modal title and description based on creation type
  const getModalInfo = () => {
    if (isExistingJobSubmission) {
      return {
        title: 'Submit Job Description for Approval',
        description: 'Submit this job description to start the approval workflow.',
        icon: Send,
        iconColor: 'text-sky-600',
        iconBgColor: 'bg-sky-50 dark:bg-sky-900/30'
      };
    }
    
    if (isMultipleJobs) {
      return {
        title: `${jobCount} Job Descriptions Created Successfully`,
        description: `Job descriptions have been created for ${jobCount} employees. Choose your next action.`,
        icon: Users,
        iconColor: 'text-green-600',
        iconBgColor: 'bg-green-50 dark:bg-green-900/30'
      };
    }
    
    return {
      title: 'Job Description Created Successfully',
     
      icon: FileText,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-50 dark:bg-green-900/30'
    };
  };

  const modalInfo = getModalInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgModal} rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-xl`}>
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${modalInfo.iconBgColor}`}>
                <modalInfo.icon size={16} className={modalInfo.iconColor} />
              </div>
              <div>
                <h2 className={`text-base font-bold ${textPrimary}`}>
                  {modalInfo.title}
                </h2>
               
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submissionLoading}
              className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg disabled:opacity-50`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Job Details Display for Multiple Jobs */}
          {/* {isMultipleJobs && createdJobs.length > 0 && (
            <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
              <h3 className={`text-sm font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                <Users size={16} />
                Created Job Descriptions ({createdJobs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {createdJobs.slice(0, 20).map((job, index) => (
                  <div key={job.id || index} className={`p-3 ${bgModal} rounded-lg border ${borderColor} hover:shadow-sm transition-shadow`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-semibold ${textPrimary} text-sm mb-2`}>
                          {job.job_title}
                        </p>
                        <div className={`${textSecondary} text-xs space-y-1`}>
                          <div className="flex items-center gap-1">
                            <User size={10} />
                            <span className="font-medium">{job.employee_name}</span>
                            <span className={textMuted}>({job.employee_id})</span>
                          </div>
                          {job.manager_name && (
                            <div className="flex items-center gap-1">
                              <Building size={10} />
                              <span>Manager: {job.manager_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs ml-2">
                        <CheckCircle size={12} className="text-green-600" />
                        <span className="text-green-600 font-medium">Created</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {createdJobs.length > 20 && (
                  <div className={`col-span-1 md:col-span-2 text-center py-3 ${textMuted} text-xs`}>
                    ... and {createdJobs.length - 20} more job descriptions
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Single Job Display */}
          {!isMultipleJobs && !isExistingJobSubmission && createdJobsData && (
            <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
              <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                <FileText size={14} />
                Job Description Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${textMuted}`}>Job Title:</span>
                  <span className={`${textPrimary} ml-2`}>{createdJobsData.job_title || 'N/A'}</span>
                </div>
                <div>
                  <span className={`font-medium ${textMuted}`}>Status:</span>
                  <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">
                    Draft
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Comments (Optional)
            </label>
            <textarea
              value={submissionComments}
              onChange={(e) => onCommentsChange(e.target.value)}
              disabled={submissionLoading}
              rows="3"
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgModal} ${textPrimary} 
                focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm 
                disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Add any comments about the job description(s) (optional)..."
            />
           
          </div>

          {/* Action Information */}
          <div className={`p-4 border ${borderColor} rounded-lg ${bgAccent}`}>
            <h4 className={`text-sm font-semibold ${textPrimary} mb-4`}>
              What happens next?
            </h4>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                </div>
                <div>
                  <p className={`font-medium ${textPrimary} mb-1 flex items-center gap-2`}>
                    <Send size={12} />
                    Submit for Approval
                  </p>
                  <p className={`${textSecondary} text-xs`}>
                    {isMultipleJobs 
                      ? `All ${jobCount} job descriptions will be sent to their respective line managers for approval. Each manager will review their employee's job description separately.`
                      : 'The job description will be sent to the line manager for approval, then to the employee for final confirmation.'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                </div>
                <div>
                  <p className={`font-medium ${textPrimary} mb-1 flex items-center gap-2`}>
                    <Save size={12} />
                    Keep as Draft
                  </p>
                  <p className={`${textSecondary} text-xs`}>
                    {isMultipleJobs 
                      ? `Save all ${jobCount} job descriptions as drafts. You can submit them for approval later individually or view them in the job descriptions list.`
                      : 'Save the job description as a draft. You can submit it for approval later from the job descriptions list.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

         

          {/* Workflow Preview */}
          <div className={`p-4 border ${borderColor} rounded-lg ${bgAccent}`}>
            <h4 className={`text-sm font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
              <Clock size={14} />
              Approval Workflow Process
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className={`font-medium ${textPrimary}`}>Line Manager Review & Approval</p>
                  <p className={`${textSecondary} mt-1`}>
                    {isMultipleJobs 
                      ? 'Each job description will be sent to the respective employee\'s line manager for review and approval.'
                      : 'Job description will be sent to the assigned employee\'s line manager for review and approval.'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                <div className="flex-shrink-0 w-6 h-6 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className={`font-medium ${textPrimary}`}>Employee Acknowledgment</p>
                  <p className={`${textSecondary} mt-1`}>
                    {isMultipleJobs 
                      ? 'After line manager approval, each employee will review and acknowledge their job description.'
                      : 'After line manager approval, the employee will review and acknowledge the job description.'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className={`font-medium ${textPrimary}`}>Final Activation</p>
                  <p className={`${textSecondary} mt-1`}>
                    {isMultipleJobs 
                      ? 'Once both approvals are complete, job descriptions become active and official.'
                      : 'Once both approvals are complete, the job description becomes active and official.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

      
        </div>

        {/* Footer Actions */}
        <div className={`p-6 border-t ${borderColor} ${bgAccent}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          

            <div className="flex items-center gap-3">
              {!isExistingJobSubmission && (
                <button
                  onClick={onKeepAsDraft}
                  disabled={submissionLoading}
                  className={`px-4 py-2 border ${borderColor} rounded-lg ${textSecondary} hover:${textPrimary} 
                    transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2`}
                >
                  <div><Save size={14} /></div>
                  Keep as Draft{isMultipleJobs ? 's' : ''}
                </button>
              )}
              
              <button
                onClick={onClose}
                disabled={submissionLoading}
                className={`px-4 py-2 border ${borderColor} rounded-lg ${textSecondary} hover:${textPrimary} 
                  transition-colors disabled:opacity-50 text-sm font-medium`}
              >
                Cancel
              </button>
              
              <button
                onClick={onSubmitForApproval}
                disabled={submissionLoading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                  transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                {submissionLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <Send size={14} />
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;