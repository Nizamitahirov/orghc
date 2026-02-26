'use client';
import React, { useState } from 'react';
import { X, Send, CheckCircle, XCircle, User, Briefcase, Calendar, DollarSign } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ContractRenewalModal({ contract, onClose, onSuccess, userRole }) {
  const [step, setStep] = useState(1); // 1: Decision, 2: Terms (if renewing), 3: Confirm
  const [formData, setFormData] = useState({
    decision: '',
    new_contract_type: 'PERMANENT',
    new_contract_duration_months: 12,
    salary_change: false,
    new_salary: '',
    position_change: false,
    new_position: '',
    comments: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const canMakeDecision = () => {
    return userRole === 'manager' || userRole === 'admin';
  };

  const handleContinue = () => {
    if (!formData.decision) {
      alert('Please select a decision');
      return;
    }

    if (formData.decision === 'RENEW') {
      setStep(2); // Go to renewal terms
    } else {
      setStep(3); // Go to confirm
    }
  };

  const handleSubmit = async () => {
    if (formData.decision === 'RENEW') {
      if (!formData.new_contract_type) {
        alert('Please select new contract type');
        return;
      }
      if (formData.new_contract_type !== 'PERMANENT' && !formData.new_contract_duration_months) {
        alert('Please specify contract duration');
        return;
      }
      if (formData.salary_change && !formData.new_salary) {
        alert('Please enter new salary amount');
        return;
      }
      if (formData.position_change && !formData.new_position.trim()) {
        alert('Please enter new position title');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      await resignationExitService.contractRenewal.managerDecision(
        contract.id,
        formData
      );

      alert('Contract decision submitted successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('Error submitting decision:', err);
      alert('Failed to submit decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 text-white flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">Contract Renewal Decision</h2>
            <p className="text-emerald-100 text-[10px]">
              {contract.employee_name} - {contract.employee_id}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
              step >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>1</div>
            <div className={`h-0.5 w-12 ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
              step >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>2</div>
            <div className={`h-0.5 w-12 ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
              step >= 3 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>3</div>
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-gray-600 dark:text-gray-400">
            <span className={step === 1 ? 'text-emerald-600 font-medium' : ''}>Decision</span>
            <span className={step === 2 ? 'text-emerald-600 font-medium' : ''}>Terms</span>
            <span className={step === 3 ? 'text-emerald-600 font-medium' : ''}>Confirm</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Employee Info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px]">
              <div className="flex items-center gap-1">
                <User size={10} className="text-gray-500" />
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{contract.employee_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase size={10} className="text-gray-500" />
                <div>
                  <p className="text-gray-500">Position</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{contract.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={10} className="text-gray-500" />
                <div>
                  <p className="text-gray-500">Expires</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {resignationExitService.helpers.formatDate(contract.current_contract_end_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Decision */}
          {step === 1 && canMakeDecision() && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Renewal Decision <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-start p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 transition-all">
                  <input 
                    type="radio" 
                    name="decision" 
                    value="RENEW"
                    checked={formData.decision === 'RENEW'}
                    onChange={(e) => setFormData({...formData, decision: e.target.value})}
                    className="w-4 h-4 text-emerald-600 mt-0.5"
                  />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <CheckCircle size={14} className="text-emerald-600" />
                      Renew Contract
                    </p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                      Continue employment with new terms
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-500 transition-all">
                  <input 
                    type="radio" 
                    name="decision" 
                    value="NOT_RENEW"
                    checked={formData.decision === 'NOT_RENEW'}
                    onChange={(e) => setFormData({...formData, decision: e.target.value})}
                    className="w-4 h-4 text-rose-600 mt-0.5"
                  />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <XCircle size={14} className="text-rose-600" />
                      Do Not Renew
                    </p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                      Let contract expire
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Renewal Terms */}
          {step === 2 && formData.decision === 'RENEW' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Contract Type <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={formData.new_contract_type}
                  onChange={(e) => setFormData({...formData, new_contract_type: e.target.value})}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PERMANENT">Permanent Contract</option>
                  <option value="3_MONTHS">3 Months</option>
                  <option value="6_MONTHS">6 Months</option>
                  <option value="1_YEAR">1 Year</option>
                  <option value="2_YEARS">2 Years</option>
                </select>
              </div>

              {formData.new_contract_type !== 'PERMANENT' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contract Duration (months) <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={formData.new_contract_duration_months}
                    onChange={(e) => setFormData({...formData, new_contract_duration_months: parseInt(e.target.value)})}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.salary_change}
                    onChange={(e) => setFormData({...formData, salary_change: e.target.checked})}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Salary Adjustment
                  </span>
                </label>
              </div>

              {formData.salary_change && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Salary Amount (AZN) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number"
                      value={formData.new_salary}
                      onChange={(e) => setFormData({...formData, new_salary: e.target.value})}
                      placeholder="Enter new salary..."
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.position_change}
                    onChange={(e) => setFormData({...formData, position_change: e.target.checked})}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Position Change
                  </span>
                </label>
              </div>

              {formData.position_change && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Position Title <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={formData.new_position}
                    onChange={(e) => setFormData({...formData, new_position: e.target.value})}
                    placeholder="Enter new position..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comments / Notes
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  rows={3}
                  placeholder="Add any additional notes..."
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Confirm Decision
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Decision:</span>
                    <span className={`font-medium ${formData.decision === 'RENEW' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formData.decision === 'RENEW' ? '✓ Renew Contract' : '✗ Do Not Renew'}
                    </span>
                  </div>
                  {formData.decision === 'RENEW' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">New Contract:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.new_contract_type.replace('_', ' ')}</span>
                      </div>
                      {formData.salary_change && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">New Salary:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formData.new_salary} AZN</span>
                        </div>
                      )}
                      {formData.position_change && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">New Position:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formData.new_position}</span>
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
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 flex justify-between border-t border-gray-200 dark:border-gray-700">
          {step === 1 && (
            <>
              <button onClick={onClose} className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 font-medium">
                Cancel
              </button>
              <button 
                onClick={handleContinue}
                disabled={!formData.decision}
                className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center gap-1"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 font-medium">
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-1"
              >
                Continue
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button onClick={() => setStep(formData.decision === 'RENEW' ? 2 : 1)} className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 font-medium">
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center gap-1"
              >
                {submitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={12} />
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