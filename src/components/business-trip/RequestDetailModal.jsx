// ============================================
// File: components/business-trip/RequestDetailModal.jsx
// ============================================
import { X, Calendar, MapPin, Hotel, User, DollarSign, CheckCircle, Clock, XCircle, FileText, Paperclip, ChevronRight, Building2, Phone, Mail, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BusinessTripService, BusinessTripHelpers } from '@/services/businessTripService';

export const RequestDetailModal = ({
  show,
  onClose,
  requestId,
  onOpenAttachments,
  darkMode
}) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && requestId) {
      loadDetail();
    }
  }, [show, requestId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await BusinessTripService.getTripRequestDetail(requestId);
      setDetail(data);
    } catch (error) {
      console.error('Error loading detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (status.includes('PENDING')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    if (status.includes('REJECTED')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getWorkflowStepIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    if (status === 'pending') return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full border border-almet-mystic/50 dark:border-almet-comet overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire/10 to-transparent dark:from-almet-sapphire/20 px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-almet-sapphire" />
              Trip Request Details
            </h2>
            {detail && (
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  {detail.request_id}
                </p>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(detail.status)}`}>
                  {detail.status_display}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-almet-sapphire border-t-transparent"></div>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Employee & Requester Info */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Employee Info */}
                <div className="bg-almet-mystic/10 dark:bg-gray-900/20 rounded-xl p-4 border border-almet-mystic/30 dark:border-almet-comet/30">
                  <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-almet-sapphire" />
                    Employee Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-almet-waterloo dark:text-almet-bali-hai" />
                      <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Name:</span>
                      <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.employee_info.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-almet-waterloo dark:text-almet-bali-hai" />
                      <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">ID:</span>
                      <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.employee_info.employee_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-almet-waterloo dark:text-almet-bali-hai" />
                      <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Department:</span>
                      <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.employee_info.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-almet-waterloo dark:text-almet-bali-hai" />
                      <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Phone:</span>
                      <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.employee_info.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Requester Info */}
                <div className="bg-almet-mystic/10 dark:bg-gray-900/20 rounded-xl p-4 border border-almet-mystic/30 dark:border-almet-comet/30">
                  <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-almet-sapphire" />
                    Requester Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Type:</span>
                      <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.requester_info.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Name:</span>
                      <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.requester_info.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Email:</span>
                      <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.requester_info.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 rounded-xl p-4 border border-blue-200/60 dark:border-blue-800/40">
                <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Trip Details
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Travel Type</label>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.travel_type_detail.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Transport Type</label>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.transport_type_detail.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Purpose</label>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.purpose_detail.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Start Date</label>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.start_date}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">End Date</label>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.end_date}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Duration</label>
                    <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{detail.number_of_days} days</p>
                  </div>
                </div>
                {detail.comment && (
                  <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-800/40">
                    <label className="block text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Comment</label>
                    <p className="text-xs text-almet-cloud-burst dark:text-white italic">{detail.comment}</p>
                  </div>
                )}
              </div>

              {/* Workflow Timeline */}
              <div className="bg-almet-mystic/10 dark:bg-gray-900/20 rounded-xl p-4 border border-almet-mystic/30 dark:border-almet-comet/30">
                <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-almet-sapphire" />
                  Approval Workflow
                </h3>
                <div className="space-y-4">
                  {detail.workflow.steps.map((step, index) => (
                    <div key={index} className="relative">
                      {index < detail.workflow.steps.length - 1 && (
                        <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-almet-mystic/50 dark:bg-almet-comet/50" />
                      )}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {getWorkflowStepIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-semibold text-almet-cloud-burst dark:text-white">{step.name}</h4>
                            {step.approved_at && (
                              <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                {new Date(step.approved_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">
                            Approver: <span className="font-medium">{step.approver}</span>
                          </p>
                          {step.amount && (
                            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">
                              Amount: <span className="font-medium text-green-600 dark:text-green-400">{step.amount} AZN</span>
                            </p>
                          )}
                          {step.comment && (
                            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai italic mt-1 bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                              "{step.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedules */}
              {detail.schedules.length > 0 && (
                <div className="bg-almet-mystic/10 dark:bg-gray-900/20 rounded-xl p-4 border border-almet-mystic/30 dark:border-almet-comet/30">
                  <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-almet-sapphire" />
                    Schedule ({detail.summary.total_schedules})
                  </h3>
                  <div className="space-y-2">
                    {detail.schedules.map((schedule, index) => (
                      <div key={schedule.id} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-almet-sapphire">{index + 1}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-almet-waterloo dark:text-almet-bali-hai">Date:</span>
                            <span className="font-medium text-almet-cloud-burst dark:text-white ml-1">{schedule.date}</span>
                          </div>
                          <div>
                            <span className="text-almet-waterloo dark:text-almet-bali-hai">From:</span>
                            <span className="font-medium text-almet-cloud-burst dark:text-white ml-1">{schedule.from_location}</span>
                          </div>
                          <div>
                            <span className="text-almet-waterloo dark:text-almet-bali-hai">To:</span>
                            <span className="font-medium text-almet-cloud-burst dark:text-white ml-1">{schedule.to_location}</span>
                          </div>
                        </div>
                        {schedule.notes && (
                          <ChevronRight className="w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels */}
              {detail.hotels.length > 0 && (
                <div className="bg-almet-mystic/10 dark:bg-gray-900/20 rounded-xl p-4 border border-almet-mystic/30 dark:border-almet-comet/30">
                  <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-almet-sapphire" />
                    Hotels ({detail.summary.total_hotels} • {detail.summary.total_nights} nights)
                  </h3>
                  <div className="space-y-2">
                    {detail.hotels.map((hotel) => (
                      <div key={hotel.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                        <h4 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-2">{hotel.hotel_name}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-almet-waterloo dark:text-almet-bali-hai">Check-in:</span>
                            <p className="font-medium text-almet-cloud-burst dark:text-white">{hotel.check_in_date}</p>
                          </div>
                          <div>
                            <span className="text-almet-waterloo dark:text-almet-bali-hai">Check-out:</span>
                            <p className="font-medium text-almet-cloud-burst dark:text-white">{hotel.check_out_date}</p>
                          </div>
                          <div>
                            <span className="text-almet-waterloo dark:text-almet-bali-hai">Location:</span>
                            <p className="font-medium text-almet-cloud-burst dark:text-white">{hotel.location}</p>
                          </div>
                          <div>
                            <span className="text-almet-waterloo dark:text-almet-bali-hai">Nights:</span>
                            <p className="font-medium text-almet-cloud-burst dark:text-white">{hotel.nights_count}</p>
                          </div>
                        </div>
                        {hotel.notes && (
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai italic mt-2 pt-2 border-t border-almet-mystic/20 dark:border-almet-comet/20">
                            {hotel.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments Summary */}
              <div className="bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/10 rounded-xl p-4 border border-purple-200/60 dark:border-purple-800/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white">
                      Attachments ({detail.summary.total_attachments})
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAttachments({ request_id: detail.request_id, ...detail });
                    }}
                    className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-1.5"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    View Files
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200/60 dark:border-blue-800/40">
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Duration</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{detail.number_of_days}</p>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">days</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200/60 dark:border-green-800/40">
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Schedules</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{detail.summary.total_schedules}</p>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">locations</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center border border-purple-200/60 dark:border-purple-800/40">
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Hotels</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{detail.summary.total_hotels}</p>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">bookings</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-200/60 dark:border-orange-800/40">
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Attachments</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{detail.summary.total_attachments}</p>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">files</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">No details available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 px-6 py-4 flex justify-end bg-almet-mystic/10 dark:bg-gray-900/20 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-medium border border-almet-mystic dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};