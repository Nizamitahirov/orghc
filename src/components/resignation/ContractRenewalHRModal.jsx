'use client';
import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, User, Briefcase, Calendar, DollarSign } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';
import { useToast } from '@/components/common/Toast';
import referenceDataAPI from '@/store/api/referenceDataAPI';

export default function ContractRenewalHRModal({ contract, onClose, onSuccess }) {
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [contractTypes, setContractTypes] = useState([]);
  const { showSuccess, showError } = useToast();

  // Load contract types for display
  useEffect(() => {
    const loadContractTypes = async () => {
      try {
        const response = await referenceDataAPI.getContractConfigDropdown();
        setContractTypes(response.data);
      } catch (error) {
        console.error('Error loading contract types:', error);
      }
    };

    loadContractTypes();
  }, []);

  const handleProcess = async () => {
    try {
      setSubmitting(true);
      
      await resignationExitService.contractRenewal.hrProcess(
        contract.id,
        comments
      );

      showSuccess('Contract renewal processed successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('Error processing renewal:', err);
      showError('Failed to process renewal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isRenewal = contract.manager_decision === 'RENEW';

  // Get contract type display name
  const getContractTypeLabel = (typeValue) => {
    const found = contractTypes.find(ct => ct.contract_type === typeValue || ct.value === typeValue);
    return found?.label || typeValue?.replace('_', ' ') || 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-almet-bali-hai/20">
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          isRenewal 
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' 
            : 'bg-gradient-to-r from-rose-600 to-rose-700'
        }`}>
          <div>
            <h2 className="text-base font-bold">
              {isRenewal ? 'Process Contract Renewal' : 'Process Contract Expiry'}
            </h2>
            <p className="text-white/90 text-xs mt-0.5">
              {contract.employee_name} - {contract.employee_id}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Employee Info */}
          <div className="mb-4 p-4 bg-almet-mystic dark:bg-almet-cloud-burst/50 rounded-lg border border-almet-bali-hai/30">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <User size={14} className="text-almet-waterloo mt-0.5" />
                <div>
                  <p className="text-almet-waterloo dark:text-almet-bali-hai text-[10px]">Employee</p>
                  <p className="font-medium text-almet-cloud-burst dark:text-white">{contract.employee_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Briefcase size={14} className="text-almet-waterloo mt-0.5" />
                <div>
                  <p className="text-almet-waterloo dark:text-almet-bali-hai text-[10px]">Position</p>
                  <p className="font-medium text-almet-cloud-burst dark:text-white">{contract.position}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-almet-waterloo mt-0.5" />
                <div>
                  <p className="text-almet-waterloo dark:text-almet-bali-hai text-[10px]">Expiry Date</p>
                  <p className="font-medium text-almet-cloud-burst dark:text-white">
                    {resignationExitService.helpers.formatDate(contract.current_contract_end_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Manager Decision Summary */}
          <div className={`p-4 rounded-lg border mb-4 ${
            isRenewal 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
              : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
          }`}>
            <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
              {isRenewal ? (
                <><CheckCircle size={16} className="text-emerald-600" /> Manager Decision: Renew Contract</>
              ) : (
                <><X size={16} className="text-rose-600" /> Manager Decision: Do Not Renew</>
              )}
            </h3>
            <div className="space-y-2 text-xs">
              {isRenewal && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-almet-waterloo dark:text-almet-bali-hai">New Contract Type:</span>
                    <span className="font-medium text-almet-cloud-burst dark:text-white">
                      {getContractTypeLabel(contract.new_contract_type)}
                    </span>
                  </div>
                  {contract.salary_change && (
                    <div className="flex justify-between items-center">
                      <span className="text-almet-waterloo dark:text-almet-bali-hai">New Salary:</span>
                      <span className="font-medium text-almet-cloud-burst dark:text-white">{contract.new_salary} AZN</span>
                    </div>
                  )}
                  {contract.position_change && (
                    <div className="flex justify-between items-center">
                      <span className="text-almet-waterloo dark:text-almet-bali-hai">New Position:</span>
                      <span className="font-medium text-almet-cloud-burst dark:text-white">{contract.new_position}</span>
                    </div>
                  )}
                </>
              )}
              {contract.manager_comments && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-almet-waterloo dark:text-almet-bali-hai mb-1.5">Manager Comments:</p>
                  <p className="text-almet-cloud-burst dark:text-white text-[10px] leading-relaxed bg-white dark:bg-almet-cloud-burst/30 p-2.5 rounded border border-almet-bali-hai/20">
                    {contract.manager_comments}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* HR Process Info */}
          <div className="p-4 bg-almet-mystic dark:bg-almet-sapphire/20 border border-almet-sapphire/30 rounded-lg mb-4">
            <h3 className="text-xs font-semibold text-almet-sapphire dark:text-almet-steel-blue mb-2">HR Action Required</h3>
            <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai leading-relaxed">
              {isRenewal 
                ? 'Please verify the renewal details and process the contract update in the system. Employee records will be automatically updated upon confirmation.'
                : 'Please confirm the contract expiry. Employee status will be automatically updated to inactive.'}
            </p>
          </div>

          {/* HR Comments */}
          <div>
            <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-2">
              HR Comments / Notes
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Add any HR processing notes..."
              className="w-full px-3 py-2 text-xs border focus:outline-none  border-almet-bali-hai dark:border-almet-comet bg-white dark:bg-almet-cloud-burst/30 text-almet-cloud-burst dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-almet-mystic dark:bg-almet-cloud-burst/80 px-5 py-3 flex justify-between border-t border-almet-bali-hai/20">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs bg-almet-bali-hai/20 dark:bg-almet-comet text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-bali-hai/30 dark:hover:bg-almet-comet/80 font-medium transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleProcess}
            disabled={submitting}
            className={`px-4 py-2 text-xs text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all ${
              isRenewal ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Send size={14} />
                {isRenewal ? 'Process Renewal' : 'Process Expiry'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}