'use client';
import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, XCircle, User, Briefcase, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';
import { useToast } from '@/components/common/Toast';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import referenceDataAPI from '@/store/api/referenceDataAPI';

export default function ContractRenewalModal({ contract, onClose, onSuccess, userRole }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    decision: '',
    new_contract_type: '',
    salary_change: false,
    new_salary: '',
    position_change: false,
    new_position: '',
    comments: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [contractTypes, setContractTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const { showSuccess, showError } = useToast();

  // Load contract types from API
  useEffect(() => {
    const loadContractTypes = async () => {
      try {
        setLoadingTypes(true);
        const response = await referenceDataAPI.getContractConfigDropdown();
        
        // Filter only active contract types
        const activeTypes = response.data
          .filter(item => item.is_active)
          .map(item => ({
            value: item.contract_type,
            label: item.label
          }));
        
        setContractTypes(activeTypes);
        
        // Set default to first active type if available
        if (activeTypes.length > 0 && !formData.new_contract_type) {
          setFormData(prev => ({
            ...prev,
            new_contract_type: activeTypes[0].value
          }));
        }
      } catch (error) {
        console.error('Error loading contract types:', error);
        showError('Failed to load contract types');
        
        // Fallback to hardcoded options
        const fallbackTypes = [
          { value: 'PERMANENT', label: 'Permanent Contract' },
          { value: '3_MONTHS', label: '3 Months' },
          { value: '6_MONTHS', label: '6 Months' },
          { value: '1_YEAR', label: '1 Year' },
          { value: '2_YEARS', label: '2 Years' }
        ];
        setContractTypes(fallbackTypes);
        setFormData(prev => ({
          ...prev,
          new_contract_type: fallbackTypes[0].value
        }));
      } finally {
        setLoadingTypes(false);
      }
    };

    loadContractTypes();
  }, []);

  const canMakeDecision = () => {
    return userRole?.is_manager || userRole?.is_admin;
  };

  const handleContinue = () => {
    if (!formData.decision) {
      showError('Please select a decision');
      return;
    }

    if (formData.decision === 'RENEW') {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (formData.decision === 'RENEW') {
      if (!formData.new_contract_type) {
        showError('Please select new contract type');
        return;
      }
 
      if (formData.salary_change && !formData.new_salary) {
        showError('Please enter new salary amount');
        return;
      }
      if (formData.position_change && !formData.new_position.trim()) {
        showError('Please enter new position title');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      await resignationExitService.contractRenewal.managerDecision(
        contract.id,
        formData
      );

      showSuccess('Contract decision submitted successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('Error submitting decision:', err);
      showError('Failed to submit decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isViewMode = !canMakeDecision() || contract.status !== 'PENDING_MANAGER';

  if (isViewMode) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-almet-bali-hai/20">
          <div className="bg-gradient-to-r from-almet-sapphire to-almet-steel-blue p-4 text-white flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Contract Renewal Status</h2>
              <p className="text-white/90 text-xs mt-0.5">
                {contract.employee_name} - {contract.employee_id}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
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

            <div className="p-4 bg-almet-mystic dark:bg-almet-sapphire/20 border border-almet-sapphire/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-almet-sapphire dark:text-almet-steel-blue flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold mb-1.5 text-almet-cloud-burst dark:text-white">
                    Status: {resignationExitService.helpers.getStatusText(contract.status)}
                  </p>
                  <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
                    {contract.status === 'PENDING_MANAGER' && 'Waiting for manager decision...'}
                    {contract.status === 'PENDING_HR' && 'Manager has made a decision. Waiting for HR processing...'}
                    {contract.status === 'COMPLETED' && 'Contract renewal process completed.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-almet-mystic dark:bg-almet-cloud-burst/80 px-5 py-3 border-t border-almet-bali-hai/20">
            <button 
              onClick={onClose} 
              className="w-full px-4 py-2 text-xs bg-almet-bali-hai/20 dark:bg-almet-comet text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-bali-hai/30 dark:hover:bg-almet-comet/80 font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-almet-bali-hai/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-steel-blue p-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Contract Renewal Decision</h2>
            <p className="text-white/90 text-xs mt-0.5">
              {contract.employee_name} - {contract.employee_id}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 py-3 bg-almet-mystic dark:bg-almet-cloud-burst/80 border-b border-almet-bali-hai/20">
          <div className="flex items-center justify-center gap-3">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
              step >= 1 ? 'bg-almet-sapphire text-white shadow-md' : 'bg-almet-bali-hai/30 text-almet-waterloo'
            }`}>1</div>
            <div className={`h-0.5 w-16 transition-all ${step >= 2 ? 'bg-almet-sapphire' : 'bg-almet-bali-hai/30'}`}></div>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
              step >= 2 ? 'bg-almet-sapphire text-white shadow-md' : 'bg-almet-bali-hai/30 text-almet-waterloo'
            }`}>2</div>
            <div className={`h-0.5 w-16 transition-all ${step >= 3 ? 'bg-almet-sapphire' : 'bg-almet-bali-hai/30'}`}></div>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
              step >= 3 ? 'bg-almet-sapphire text-white shadow-md' : 'bg-almet-bali-hai/30 text-almet-waterloo'
            }`}>3</div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
            <span className={step === 1 ? 'text-almet-sapphire dark:text-almet-steel-blue font-semibold' : ''}>Decision</span>
            <span className={step === 2 ? 'text-almet-sapphire dark:text-almet-steel-blue font-semibold' : ''}>Terms</span>
            <span className={step === 3 ? 'text-almet-sapphire dark:text-almet-steel-blue font-semibold' : ''}>Confirm</span>
          </div>
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

          {/* Step 1: Decision */}
          {step === 1 && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3">
                Renewal Decision <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md border-almet-bali-hai/30 dark:border-almet-comet hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500">
                  <input 
                    type="radio" 
                    name="decision" 
                    value="RENEW"
                    checked={formData.decision === 'RENEW'}
                    onChange={(e) => setFormData({...formData, decision: e.target.value})}
                    className="w-4 h-4 text-emerald-600 mt-0.5"
                  />
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-600" />
                      Renew Contract
                    </p>
                    <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-1">
                      Continue employment with new contract terms
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md border-almet-bali-hai/30 dark:border-almet-comet hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-500">
                  <input 
                    type="radio" 
                    name="decision" 
                    value="NOT_RENEW"
                    checked={formData.decision === 'NOT_RENEW'}
                    onChange={(e) => setFormData({...formData, decision: e.target.value})}
                    className="w-4 h-4 text-rose-600 mt-0.5"
                  />
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                      <XCircle size={16} className="text-rose-600" />
                      Do Not Renew
                    </p>
                    <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mt-1">
                      Let the contract expire
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Renewal Terms */}
          {step === 2 && formData.decision === 'RENEW' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-2">
                  New Contract Type <span className="text-rose-500">*</span>
                </label>
                {loadingTypes ? (
                  <div className="flex items-center justify-center py-3">
                    <div className="w-5 h-5 border-2 border-almet-sapphire border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-xs text-almet-waterloo">Loading...</span>
                  </div>
                ) : (
                  <SearchableDropdown
                    options={contractTypes}
                    value={formData.new_contract_type}
                    onChange={(value) => setFormData({...formData, new_contract_type: value})}
                    placeholder="Select contract type"
                    searchPlaceholder="Search contract types..."
                    className="w-full"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={formData.salary_change}
                      onChange={(e) => setFormData({...formData, salary_change: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                      formData.salary_change 
                        ? 'bg-almet-sapphire border-almet-sapphire' 
                        : 'bg-white dark:bg-almet-cloud-burst/30 border-almet-bali-hai dark:border-almet-comet group-hover:border-almet-sapphire'
                    }`}>
                      {formData.salary_change && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                    Salary Adjustment
                  </span>
                </label>
              </div>

              {formData.salary_change && (
                <div>
                  <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-2">
                    New Salary Amount (AZN) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-almet-waterloo" />
                    <input 
                      type="number"
                      value={formData.new_salary}
                      onChange={(e) => setFormData({...formData, new_salary: e.target.value})}
                      placeholder="Enter new salary amount..."
                      className="w-full pl-9 pr-3 py-2 text-xs border focus:outline-none  border-almet-bali-hai dark:border-almet-comet bg-white dark:bg-almet-cloud-burst/30 text-almet-cloud-burst dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={formData.position_change}
                      onChange={(e) => setFormData({...formData, position_change: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                      formData.position_change 
                        ? 'bg-almet-sapphire border-almet-sapphire' 
                        : 'bg-white dark:bg-almet-cloud-burst/30 border-almet-bali-hai dark:border-almet-comet group-hover:border-almet-sapphire'
                    }`}>
                      {formData.position_change && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                    Position Change
                  </span>
                </label>
              </div>

              {formData.position_change && (
                <div>
                  <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-2">
                    New Position Title <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={formData.new_position}
                    onChange={(e) => setFormData({...formData, new_position: e.target.value})}
                    placeholder="Enter new position title..."
                    className="w-full px-3 py-2 text-xs border focus:outline-none  border-almet-bali-hai dark:border-almet-comet bg-white dark:bg-almet-cloud-burst/30 text-almet-cloud-burst dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-almet-cloud-burst dark:text-white mb-2">
                  Comments / Notes
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  rows={3}
                  placeholder="Add any additional notes..."
                  className="w-full px-3 py-2 text-xs border focus:outline-none  border-almet-bali-hai dark:border-almet-comet bg-white dark:bg-almet-cloud-burst/30 text-almet-cloud-burst dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="p-4 bg-almet-mystic dark:bg-almet-cloud-burst/50 rounded-lg border border-almet-bali-hai/30">
                <h3 className="text-xs font-semibold text-almet-cloud-burst dark:text-white mb-3">
                  Confirm Decision
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-almet-waterloo dark:text-almet-bali-hai">Decision:</span>
                    <span className={`font-semibold ${formData.decision === 'RENEW' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formData.decision === 'RENEW' ? '✓ Renew Contract' : '✗ Do Not Renew'}
                    </span>
                  </div>
                  {formData.decision === 'RENEW' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-almet-waterloo dark:text-almet-bali-hai">New Contract:</span>
                        <span className="font-medium text-almet-cloud-burst dark:text-white">
                          {contractTypes.find(o => o.value === formData.new_contract_type)?.label || formData.new_contract_type}
                        </span>
                      </div>
                      {formData.salary_change && (
                        <div className="flex justify-between items-center">
                          <span className="text-almet-waterloo dark:text-almet-bali-hai">New Salary:</span>
                          <span className="font-medium text-almet-cloud-burst dark:text-white">{formData.new_salary} AZN</span>
                        </div>
                      )}
                      {formData.position_change && (
                        <div className="flex justify-between items-center">
                          <span className="text-almet-waterloo dark:text-almet-bali-hai">New Position:</span>
                          <span className="font-medium text-almet-cloud-burst dark:text-white">{formData.new_position}</span>
                        </div>
                      )}
                      {formData.comments && (
                        <div className="pt-2 border-t border-almet-bali-hai/20">
                          <span className="text-almet-waterloo dark:text-almet-bali-hai block mb-1">Comments:</span>
                          <p className="text-almet-cloud-burst dark:text-white text-[10px] leading-relaxed">{formData.comments}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-almet-mystic dark:bg-almet-cloud-burst/80 px-5 py-3 flex justify-between border-t border-almet-bali-hai/20">
          {step === 1 && (
            <>
              <button onClick={onClose} className="px-4 py-2 text-xs bg-almet-bali-hai/20 dark:bg-almet-comet text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-bali-hai/30 dark:hover:bg-almet-comet/80 font-medium transition-all">
                Cancel
              </button>
              <button 
                onClick={handleContinue}
                disabled={!formData.decision}
                className="px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-steel-blue font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-xs bg-almet-bali-hai/20 dark:bg-almet-comet text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-bali-hai/30 dark:hover:bg-almet-comet/80 font-medium transition-all">
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-steel-blue font-medium flex items-center gap-2 transition-all"
              >
                Continue
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button onClick={() => setStep(formData.decision === 'RENEW' ? 2 : 1)} className="px-4 py-2 text-xs bg-almet-bali-hai/20 dark:bg-almet-comet text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-bali-hai/30 dark:hover:bg-almet-comet/80 font-medium transition-all">
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-steel-blue font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Submit Decision
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}