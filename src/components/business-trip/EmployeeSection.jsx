
// ============================================
// File: components/business-trip/EmployeeSection.jsx
// ============================================
import { Users } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import SearchableDropdown from '@/components/common/SearchableDropdown';

export const EmployeeSection = ({
  isExpanded,
  onToggle,
  requester,
  formData,
  setFormData,
  employeeSearchResults,
  darkMode
}) => {
  return (
    <div className="mb-6">
      <SectionHeader 
        title="Employee Information" 
        icon={Users} 
        isExpanded={isExpanded}
        onClick={onToggle}
      />
      
      {isExpanded && (
        <div className="mt-4 space-y-4 pl-4 border-l-2 border-almet-sapphire/20">
          {requester === 'for_my_employee' && (
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Search Employee</label>
              <SearchableDropdown
                options={employeeSearchResults.map(emp => ({ 
                  value: emp.id, 
                  label: `${emp.name} (${emp.employee_id})`, 
                  ...emp 
                }))}
                value={formData.employee_id}
                onChange={(value) => {
                  const selectedEmployee = employeeSearchResults.find(emp => emp.id === value);
                  if (value === null) {
                    setFormData(prev => ({
                      ...prev,
                      employee_id: null,
                      employeeName: '',
                      businessFunction: '',
                      department: '',
                      unit: '',
                      jobFunction: '',
                      phoneNumber: '',
                      lineManager: ''
                    }));
                  } else if (selectedEmployee) {
                    setFormData(prev => ({
                      ...prev,
                      employee_id: value,
                      employeeName: selectedEmployee.name,
                      businessFunction: selectedEmployee.business_function_name || '',
                      department: selectedEmployee.department_name || '',
                      unit: selectedEmployee.unit_name || '',
                      jobFunction: selectedEmployee.job_function_name || '',
                      phoneNumber: selectedEmployee.phone || '',
                      lineManager: selectedEmployee.line_manager_name || ''
                    }));
                  }
                }}
                placeholder="Select employee"
                allowUncheck={true}
                searchPlaceholder="Search..."
                darkMode={darkMode}
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Name</label>
              <input 
                type="text" 
                value={formData.employeeName} 
                onChange={(e) => setFormData(prev => ({...prev, employeeName: e.target.value}))} 
                disabled={requester === 'for_me'} 
                className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Phone</label>
              <input 
                type="tel" 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData(prev => ({...prev, phoneNumber: e.target.value}))} 
                disabled={requester === 'for_me'} 
                className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { field: 'businessFunction', label: 'Company' },
              { field: 'department', label: 'Department' },
              { field: 'unit', label: 'Unit' },
              { field: 'jobFunction', label: 'Job Function' }
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">{label}</label>
                <input 
                  type="text" 
                  value={formData[field]} 
                  onChange={(e) => setFormData(prev => ({...prev, [field]: e.target.value}))} 
                  disabled={requester === 'for_me'} 
                  className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Line Manager</label>
            <input 
              type="text" 
              value={formData.lineManager} 
              onChange={(e) => setFormData(prev => ({...prev, lineManager: e.target.value}))} 
              disabled={requester === 'for_me'} 
              className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
            />
          </div>
        </div>
      )}
    </div>
  );
};