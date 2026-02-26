import React, { useState } from 'react';
import { X, FileText, Eye, Download, CheckCircle, Clock, Award, PlayCircle } from 'lucide-react';

const AssignmentDetailModal = ({
  show,
  assignment,
  onClose,
  trainingService,
  toast,
  onUpdate,
  darkMode,
  bgCard,
  bgCardHover,
  textPrimary,
  textSecondary,
  textMuted,
  borderColor
}) => {
  const [completingMaterialId, setCompletingMaterialId] = useState(null);
  const [localAssignment, setLocalAssignment] = useState(assignment);
  const [viewingPdf, setViewingPdf] = useState(null);

  // Update local state when assignment prop changes
  React.useEffect(() => {
    if (assignment) {
      console.log('Assignment received in modal:', assignment);
      console.log('Materials in assignment:', assignment.materials);
      console.log('Training materials:', assignment.training_materials);
      setLocalAssignment(assignment);
    }
  }, [assignment]);

  if (!show || !localAssignment) return null;

  const getStatusColor = (status) => {
    const colors = {
      'ASSIGNED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'OVERDUE': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleCompleteMaterial = async (materialId) => {
    setCompletingMaterialId(materialId);
    try {
      const response = await trainingService.assignments.completeMaterial(localAssignment.id, materialId);
      console.log('Complete material response:', response);
      
      // Refresh assignment details to get updated data
      const updatedAssignment = await trainingService.assignments.getById(localAssignment.id);
      
      // Fetch training details to get materials again
      if (updatedAssignment.training) {
        const trainingDetails = await trainingService.trainings.getById(updatedAssignment.training);
        updatedAssignment.materials = trainingDetails.materials || [];
      }
      
      setLocalAssignment(updatedAssignment);
      toast.showSuccess('Material completed successfully!');
      
      // Notify parent component to refresh data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error completing material:', error);
      toast.showError('Failed to complete material: ' + (error.response?.data?.error || error.message));
    } finally {
      setCompletingMaterialId(null);
    }
  };

  const handleViewMaterial = (materialUrl) => {
    setViewingPdf(materialUrl);
  };

  const completedMaterials = localAssignment.materials_completed_count || localAssignment.materials?.filter(m => m.completed).length || 0;
  const totalMaterials = localAssignment.total_materials || localAssignment.materials?.length || 0;
  
  // Check alternative field names for materials
  const materials = localAssignment.materials || localAssignment.training_materials || localAssignment.training?.materials || [];
  
  // Get completed material IDs from assignment
  const completedMaterialIds = localAssignment.completed_materials || [];
  
  // Mark materials as completed based on assignment data
  const materialsWithStatus = materials.map(material => ({
    ...material,
    completed: completedMaterialIds.includes(material.id),
    completed_date: material.completed_date || null
  }));

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 overflow-y-auto">
        <div className={`${bgCard} rounded-xl shadow-2xl max-w-4xl w-full my-6 border ${borderColor}`}>
          <div className={`flex items-center justify-between px-5 py-3 border-b ${borderColor} sticky top-0 ${bgCard} z-10`}>
            <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
              <Award size={20} className="text-almet-sapphire" />
              Training Progress
            </h3>
            <button
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-1.5 hover:${bgCardHover} rounded-lg`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Header Info Card */}
            <div className={`p-4 rounded-lg border ${borderColor} ${darkMode ? 'bg-almet-san-juan' : 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-almet-san-juan dark:to-almet-cloud-burst'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg text-xs font-semibold">
                      {localAssignment.training_id}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(localAssignment.status)}`}>
                      {localAssignment.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className={`text-base font-bold ${textPrimary} mb-1`}>{localAssignment.training_title}</h4>
                  <p className={`text-xs ${textSecondary}`}>Employee: {localAssignment.employee_name} ({localAssignment.employee_id})</p>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${textMuted}`}>Overall Progress</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-almet-sapphire to-almet-astral bg-clip-text text-transparent">
                    {localAssignment.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-almet-sapphire to-almet-astral transition-all duration-500"
                    style={{ width: `${localAssignment.progress_percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-xs ${textMuted}`}>
                    {totalMaterials > 0 
                      ? `${completedMaterials} of ${totalMaterials} materials completed`
                      : 'No materials assigned yet'
                    }
                  </span>
                  {localAssignment.due_date && (
                    <span className={`text-xs ${localAssignment.is_overdue ? 'text-red-600 font-semibold' : textMuted}`}>
                      {localAssignment.is_overdue ? '⚠️ Overdue: ' : 'Due: '}
                      {new Date(localAssignment.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Training Materials Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                  <FileText size={18} />
                  Training Materials
                </h5>
                {materials && materials.length > 0 && (
                  <span className={`text-xs ${textMuted}`}>
                    Complete all materials to finish the training
                  </span>
                )}
              </div>

              {materials && materials.length > 0 ? (
                <div className="space-y-3">
                  {materials.map((material, index) => (
                    <div 
                      key={material.id} 
                      className={`p-4 rounded-lg border transition-all ${
                        material.completed 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                          : darkMode ? 'bg-almet-san-juan border-almet-comet' : 'bg-white border-gray-200 hover:border-almet-sapphire'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Material Number & Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          material.completed 
                            ? 'bg-green-500' 
                            : 'bg-gradient-to-br from-almet-sapphire to-almet-astral'
                        }`}>
                          {material.completed ? (
                            <CheckCircle size={20} className="text-white" />
                          ) : (
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          )}
                        </div>

                        {/* Material Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h6 className={`text-sm font-semibold ${textPrimary} mb-1`}>
                                {material.title || material.file_url?.split('/').pop() || `Material ${index + 1}`}
                              </h6>
                              {material.description && (
                                <p className={`text-xs ${textSecondary} mb-2`}>
                                  {material.description}
                                </p>
                              )}
                              {material.completed && material.completed_date && (
                                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                  <CheckCircle size={12} />
                                  <span className="text-xs font-medium">
                                    Completed on {new Date(material.completed_date).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-3">
                            {material.file_url && (
                              <>
                                <button
                                  onClick={() => handleViewMaterial(material.file_url)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-xs font-medium border border-blue-200 dark:border-blue-800"
                                >
                                  <Eye size={14} />
                                  View
                                </button>
                                <a
                                  href={material.file_url}
                                  download
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-xs font-medium border border-green-200 dark:border-green-800"
                                >
                                  <Download size={14} />
                                  Download
                                </a>
                              </>
                            )}
                            
                            {!material.completed && (
                              <button
                                onClick={() => handleCompleteMaterial(material.id)}
                                disabled={completingMaterialId === material.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white rounded-lg transition-all text-xs font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                              >
                                {completingMaterialId === material.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                    Marking...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={14} />
                                    Mark Complete
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-10 text-center ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-3">
                    <FileText className={`${textMuted}`} size={32} />
                  </div>
                  <p className={`text-sm font-semibold ${textPrimary} mb-1`}>No materials available</p>
                  <p className={`text-xs ${textMuted}`}>This training doesn't have any materials yet</p>
                </div>
              )}
            </div>

         

            {/* Mandatory Badge */}
            {localAssignment.is_mandatory && (
              <div className={`p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800`}>
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                  ⚠️ Mandatory Training - Completion Required
                </span>
              </div>
            )}

            {/* Notes */}
            {localAssignment.notes && (
              <div>
                <label className={`text-xs ${textMuted} font-medium mb-1.5 block`}>Assignment Notes</label>
                <div className={`p-3 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg ${textSecondary} text-xs border ${borderColor}`}>
                  {localAssignment.notes}
                </div>
              </div>
            )}

            {/* Completion Message */}
            {localAssignment.status === 'COMPLETED' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 text-center">
                <CheckCircle className="text-green-600 dark:text-green-400 mx-auto mb-2" size={32} />
                <p className="text-sm font-bold text-green-800 dark:text-green-300 mb-1">
                  🎉 Training Completed!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Great job! You've successfully completed all materials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-3">
          <div className={`${bgCard} rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border ${borderColor}`}>
            <div className={`flex items-center justify-between p-3 border-b ${borderColor}`}>
              <h3 className={`text-base font-bold ${textPrimary}`}>Material Viewer</h3>
              <div className="flex items-center gap-1.5">
                <a
                  href={viewingPdf}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs font-medium"
                >
                  <Download size={14} />
                  Download
                </a>
                <button
                  onClick={() => setViewingPdf(null)}
                  className={`${textMuted} hover:${textPrimary} transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
              <div className="absolute inset-0 flex items-center justify-center" id="pdf-loader-inner">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-almet-sapphire border-t-transparent mb-3"></div>
                  <p className={`${textSecondary} text-sm`}>Loading material...</p>
                </div>
              </div>

              <iframe
                src={`${viewingPdf}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                className="w-full h-full"
                title="Material Viewer"
                onLoad={() => {
                  const loader = document.getElementById('pdf-loader-inner');
                  if (loader) loader.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignmentDetailModal;