// components/vacation/ApprovalSection.jsx

import { useState } from 'react';
import {
  CheckCircle, XCircle, Eye, Clock, History,
  User, Calendar, AlertCircle, Info, FileText
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';

export default function ApprovalSection({
  userAccess,
  pendingRequests,
  approvalHistory,
  handleOpenApprovalModal,
  handleOpenRejectionModal,
  handleViewDetails,
}) {
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const lineManagerRequests = pendingRequests?.line_manager_requests || [];
  const hrRequests          = pendingRequests?.hr_requests || [];
  const allPending          = [...lineManagerRequests, ...hrRequests];
  const history             = approvalHistory || [];

  const displayList   = activeTab === 'pending' ? allPending : history;
  const totalPages    = Math.ceil(displayList.length / itemsPerPage);
  const paginated     = displayList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = tab => { setActiveTab(tab); setCurrentPage(1); };

  const getStatusStyle = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('approved')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (s.includes('pending'))  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    if (s.includes('rejected')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  };

  const isPending = r =>
    r.status === 'PENDING_LINE_MANAGER' ||
    r.status === 'PENDING_HR' ||
    r.status === 'PENDING_UK_ADDITIONAL';

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <h2 className="text-lg font-bold text-almet-cloud-burst dark:text-white">Approval Queue</h2>
        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">
          Review and approve or reject vacation requests from your team
        </p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Awaiting Your Action',
            value: allPending.length,
            icon: <Clock className="w-4 h-4" />,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
            urgent: allPending.length > 0,
          },
          {
            label: 'From Line Manager Queue',
            value: lineManagerRequests.length,
            icon: <User className="w-4 h-4" />,
            color: 'text-almet-sapphire',
            bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          },
          {
            label: 'Total Reviewed',
            value: history.length,
            icon: <History className="w-4 h-4" />,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border  p-4 ${s.bg} ${s.urgent ? 'ring-2 ring-amber-400 dark:ring-amber-600' : ''}`}>
            
            <div className='flex gap-4 items-center '><div className={` ${s.color}`}>{s.icon}</div>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{s.label}</p>
              </div>
              
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            {s.urgent && s.value > 0 && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1">Needs your attention</p>
            )}
          </div>
        ))}
      </div>

     
      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-almet-mystic/30 dark:bg-gray-700/50 rounded-xl p-1 w-fit">
        {[
          { key: 'pending', label: 'Pending Approval', count: allPending.length },
          { key: 'history', label: 'Approval History', count: history.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === t.key
                ? 'bg-white dark:bg-gray-800 text-almet-sapphire shadow-sm'
                : 'text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-cloud-burst dark:hover:text-white'
            }`}
          >
            {t.key === 'pending' ? <Clock className="w-3.5 h-3.5" /> : <History className="w-3.5 h-3.5" />}
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === t.key
                ? 'bg-almet-sapphire/10 text-almet-sapphire'
                : 'bg-almet-bali-hai/20 text-almet-waterloo dark:text-almet-bali-hai'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-14 h-14 bg-almet-mystic/30 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <FileText className="w-7 h-7 text-almet-waterloo/40 dark:text-almet-bali-hai/40" />
            </div>
            <p className="text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">
              {activeTab === 'pending' ? 'No requests pending approval' : 'No approval history yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Request ID', 'Employee', 'Leave Type', 'Period', 'Days', 'Status',
                      ...(activeTab === 'pending' ? ['Actions'] : ['Reviewed On'])
                    ].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                  {paginated.map(req => (
                    <tr key={req.id} className="hover:bg-almet-mystic/10 dark:hover:bg-gray-700/30 transition-colors">

                      {/* Request ID */}
                      <td className="px-4 py-3 text-xs font-mono font-medium text-almet-sapphire whitespace-nowrap">
                        {req.request_id}
                      </td>

                      {/* Employee */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-almet-cloud-burst dark:text-white">{req.employee_name}</p>
                        {req.department && (
                          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-0.5">{req.department}</p>
                        )}
                      </td>

                      {/* Leave Type */}
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                        {req.vacation_type}
                        {req.is_half_day && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300 rounded text-[10px]">
                            Half Day
                          </span>
                        )}
                      </td>

                      {/* Period */}
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          {req.start_date}
                          {req.start_date !== req.end_date && <> → {req.end_date}</>}
                        </div>
                      </td>

                      {/* Days */}
                      <td className="px-4 py-3 text-xs font-bold text-almet-cloud-burst dark:text-white">
                        {req.days || req.number_of_days}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusStyle(req.status_display || req.status)}`}>
                          {req.status_display || req.status}
                        </span>
                      </td>

                      {/* Pending: actions | History: reviewed date */}
                      {activeTab === 'pending' ? (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleViewDetails(req.id)}
                              title="View details"
                              className="p-1.5 rounded-lg text-almet-sapphire hover:bg-almet-sapphire/10 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {isPending(req) && (
                              <>
                                <button
                                  onClick={() => handleOpenApprovalModal(req)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                                >
                                  <CheckCircle className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  onClick={() => handleOpenRejectionModal(req)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                >
                                  <XCircle className="w-3 h-3" /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      ) : (
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {req.reviewed_at
                            ? new Date(req.reviewed_at).toLocaleDateString()
                            : req.updated_at
                            ? new Date(req.updated_at).toLocaleDateString()
                            : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {displayList.length > itemsPerPage && (
              <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={displayList.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}