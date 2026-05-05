// components/vacation/VacationRequestForm.jsx

import {
  Calendar, CheckCircle, Clock, Users, Upload,
  FileText, X, AlertCircle, User, Info, Paperclip
} from 'lucide-react';
import SearchableDropdown from "@/components/common/SearchableDropdown";
import { useState, useEffect } from 'react';

const MAX_FILE_SIZE    = 10 * 1024 * 1024;
const ALLOWED_TYPES    = ['application/pdf','image/jpeg','image/jpg','image/png',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

export default function VacationRequestForm({
  formData, setFormData, formErrors,
  requester, setRequester,
  employeeSearchResults, vacationTypes, isUKEmployee, hrRepresentatives,
  darkMode, handleStartDateChange, handleEndDateChange,
  selectedFiles, setSelectedFiles, fileErrors,
  handleSubmit, loading, activeSection
}) {
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [selectedType, setSelectedType]   = useState(null);

  useEffect(() => {
    const isUKByBF = formData.businessFunction?.toUpperCase().includes('UK');
    const isUK = isUKByBF || isUKEmployee;
    setFilteredTypes((vacationTypes || []).filter(t => !(t.is_uk_only && !isUK)));
  }, [vacationTypes, formData.businessFunction, isUKEmployee]);

  const handleTypeChange = (id) => {
    const t = filteredTypes.find(x => x.id === id);
    setSelectedType(t);
    setFormData(prev => ({
      ...prev,
      vacation_type_id: id,
      is_half_day: t?.requires_time_selection || false,
      half_day_start_time: t?.requires_time_selection ? '09:00' : '',
      half_day_end_time:   t?.requires_time_selection ? '13:00' : '',
      end_date: t?.requires_time_selection ? prev.start_date : prev.end_date
    }));
  };

  const handleFileSelect = (e) => {
    const valid = Array.from(e.target.files || []).filter(f =>
      f.size <= MAX_FILE_SIZE && ALLOWED_TYPES.includes(f.type)
    );
    setSelectedFiles([...selectedFiles, ...valid]);
    e.target.value = '';
  };

  const fmtSize = (b) => {
    const k = 1024;
    return b < k ? `${b} B` : b < k*k ? `${(b/k).toFixed(0)} KB` : `${(b/k/k).toFixed(1)} MB`;
  };

  const isUK = formData.businessFunction?.toUpperCase().includes('UK') || isUKEmployee;

  return (
    <div className="space-y-5">

    

      {isUK && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-xs font-medium text-red-800 dark:text-red-200">
            UK Employee — special leave rules and additional approval steps apply for 5+ days.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">

        {/* ══ LEFT: Who is this for? ══ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm ">
          <div className="px-5 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-almet-sapphire" /> Employee Details
            </h3>
          </div>
          <div className="p-5 space-y-4">

            {/* For me / For employee */}
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                Submitting for
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'for_me',          label: 'Myself',       icon: <User className="w-3.5 h-3.5" /> },
                  { value: 'for_my_employee', label: 'An Employee',  icon: <Users className="w-3.5 h-3.5" /> },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setRequester(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${
                      requester === opt.value
                        ? 'border-almet-sapphire bg-almet-sapphire/5 text-almet-sapphire dark:bg-almet-sapphire/10'
                        : 'border-almet-mystic/50 dark:border-almet-comet text-almet-waterloo dark:text-almet-bali-hai hover:border-almet-sapphire/40'
                    }`}
                  >
                    {opt.icon} {opt.label}
                    {requester === opt.value && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {requester === 'for_my_employee' && (
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Select Employee</label>
                <SearchableDropdown
                  options={employeeSearchResults.map(e => ({ value: e.id, label: `${e.name} (${e.employee_id})`, ...e }))}
                  value={formData.employee_id}
                  onChange={(val) => {
                    const emp = employeeSearchResults.find(e => e.id === val);
                    if (!val) {
                      setFormData(p => ({ ...p, employee_id: null, employeeName: '', businessFunction: '', department: '', unit: '', jobFunction: '', phoneNumber: '', line_manager: '' }));
                    } else if (emp) {
                      setFormData(p => ({ ...p, employee_id: val, employeeName: emp.name, businessFunction: emp.business_function_name || '', department: emp.department_name || '', unit: emp.unit_name || '', jobFunction: emp.job_function_name || '', phoneNumber: emp.phone || '', line_manager: emp.line_manager_name || '' }));
                    }
                  }}
                  placeholder="Search employee..." allowUncheck darkMode={darkMode}
                />
              </div>
            )}

            {/* Read-only employee fields */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'employeeName',    label: 'Full Name' },
                { key: 'phoneNumber',     label: 'Phone' },
                { key: 'businessFunction',label: 'Company' },
                { key: 'department',      label: 'Department' },
                { key: 'unit',            label: 'Unit' },
                { key: 'jobFunction',     label: 'Job Function' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">{f.label}</label>
                  <input
                    type="text" value={formData[f.key]}
                    onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                    disabled={requester === 'for_me'}
                    className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/20 dark:disabled:bg-gray-600 disabled:text-almet-waterloo"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">
                Note <span className="font-normal text-almet-waterloo">(optional)</span>
              </label>
              <textarea
                value={formData.comment}
                onChange={e => setFormData(p => ({ ...p, comment: e.target.value }))}
                rows={2} placeholder="Reason or notes for this request..."
                className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* ══ RIGHT: Leave dates ══ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-almet-mystic/50 dark:border-almet-comet shadow-sm ">
          <div className="px-5 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-almet-sapphire" /> Leave Details
            </h3>
          </div>
          <div className="p-5 space-y-4">

            {/* Leave type */}
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Leave Type</label>
              <SearchableDropdown
                options={filteredTypes.map(t => ({ value: t.id, label: t.name }))}
                value={formData.vacation_type_id}
                onChange={handleTypeChange}
                placeholder="Select leave type"
                darkMode={darkMode}
              />
            </div>

            {/* Half day */}
            {selectedType?.requires_time_selection && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Half Day Request
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'half_day_start_time', label: 'Start Time', ph: '09:00' },
                    { key: 'half_day_end_time',   label: 'End Time',   ph: '13:00' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-orange-900 dark:text-orange-200 mb-1">{f.label}</label>
                      <input
                        type="text" value={formData[f.key]} placeholder={f.ph} maxLength={5}
                        onChange={e => {
                          let v = e.target.value.replace(/[^0-9:]/g,'');
                          if (v.length === 2 && !v.includes(':')) v += ':';
                          if (v.length > 5) v = v.slice(0,5);
                          setFormData(p => ({ ...p, [f.key]: v, end_date: p.start_date }));
                        }}
                        className={`w-full px-3 py-2 text-xs border outline-0 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-orange-400 ${formErrors[f.key] ? 'border-red-500' : 'border-orange-300 dark:border-orange-700'}`}
                      />
                      {formErrors[f.key] && <p className="text-[10px] text-red-500 mt-0.5">{formErrors[f.key]}</p>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {[{ label:'Morning', s:'09:00', e:'13:00' }, { label:'Afternoon', s:'14:00', e:'18:00' }].map(p => (
                    <button key={p.label} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, half_day_start_time: p.s, half_day_end_time: p.e, end_date: prev.start_date }))}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors font-medium text-orange-800 dark:text-orange-200"
                    >
                      {p.label} ({p.s}–{p.e})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Start Date</label>
                <input type="date" value={formData.start_date} onChange={handleStartDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire rounded-lg dark:bg-gray-700 dark:text-white ${formErrors.start_date ? 'border-red-500' : 'border-almet-bali-hai/40 dark:border-almet-comet'}`}
                />
                {formErrors.start_date && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.start_date}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">
                  End Date {selectedType?.requires_time_selection && <span className="text-orange-500">(auto)</span>}
                </label>
                <input type="date" value={formData.end_date} onChange={handleEndDateChange}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  disabled={selectedType?.requires_time_selection}
                  className={`w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/20 dark:disabled:bg-gray-600 ${formErrors.end_date ? 'border-red-500' : 'border-almet-bali-hai/40 dark:border-almet-comet'}`}
                />
                {formErrors.end_date && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.end_date}</p>}
              </div>
            </div>

            {/* Calculated fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Return Date</label>
                <input type="date" value={formData.dateOfReturn} disabled
                  className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg bg-almet-mystic/20 dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Working Days</label>
                <div className="relative">
                  <input type="number" value={formData.numberOfDays} disabled step="0.5"
                    className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg bg-almet-mystic/20 dark:bg-gray-600 dark:text-white font-bold"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-almet-waterloo" />
                </div>
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                Supporting Documents <span className="font-normal text-almet-waterloo">(optional)</span>
              </label>
              <label htmlFor="vac-file-upload"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-almet-bali-hai/40 dark:border-almet-comet rounded-xl hover:border-almet-sapphire hover:bg-almet-mystic/10 dark:hover:bg-gray-700/30 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Click to attach files</span>
              </label>
              <input id="vac-file-upload" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={handleFileSelect} className="hidden" />
              <p className="text-[10px] text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">PDF, JPG, PNG, DOC, XLSX — max 10MB each</p>
              {fileErrors && <p className="text-xs text-red-500 mt-1">{fileErrors}</p>}
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-almet-mystic/20 dark:bg-gray-700/40 rounded-lg">
                      <Paperclip className="w-3.5 h-3.5 text-almet-sapphire flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-almet-cloud-burst dark:text-white truncate">{f.name}</p>
                        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">{fmtSize(f.size)}</p>
                      </div>
                      <button type="button" onClick={() => setSelectedFiles(selectedFiles.filter((_,j) => j !== i))}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approval chain */}
            <div className="pt-2 border-t border-almet-mystic/30 dark:border-almet-comet/30 space-y-3">
              <p className="text-xs font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-almet-sapphire" /> Approval Chain
              </p>
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">Line Manager</label>
                <input type="text" value={formData.line_manager}
                  onChange={e => setFormData(p => ({ ...p, line_manager: e.target.value }))}
                  disabled={requester === 'for_me'}
                  placeholder="Line Manager Name"
                  className="w-full px-3 py-2 text-xs border outline-0 focus:ring-1 focus:ring-almet-sapphire border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/20 dark:disabled:bg-gray-600"
                />
              </div>
              {hrRepresentatives && hrRepresentatives.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">HR Representative</label>
                <div className="w-full px-3 py-2 text-xs border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg bg-almet-mystic/20 dark:bg-gray-600 text-almet-cloud-burst dark:text-white cursor-default select-none">
                  {hrRepresentatives.find(h => h.id === formData.hr_representative_id)
                    ? `${hrRepresentatives.find(h => h.id === formData.hr_representative_id).name} (${hrRepresentatives.find(h => h.id === formData.hr_representative_id).department})`
                    : 'Auto-assigned'}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex justify-end gap-3">
        <button type="button"
          onClick={() => {
            setFormData(p => ({ ...p, start_date:'', end_date:'', dateOfReturn:'', numberOfDays:0, comment:'', is_half_day:false, half_day_start_time:'', half_day_end_time:'' }));
            setSelectedFiles([]);
          }}
          className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-xl text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
        >
          Clear Form
        </button>
        <button type="button" onClick={handleSubmit}
          disabled={loading || !formData.start_date || !formData.vacation_type_id}
          className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-xl hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
            : <><CheckCircle className="w-4 h-4" /> Submit Request</>
          }
        </button>
      </div>
    </div>
  );
}