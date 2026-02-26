// ============================================
// File: components/business-trip/TravelSection.jsx
// ============================================
import { Plane } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import SearchableDropdown from '@/components/common/SearchableDropdown';

// components/business-trip/TravelSection.jsx

export const TravelSection = ({
  isExpanded,
  onToggle,
  formData,
  setFormData,
  travelTypes,
  transportTypes,
  tripPurposes,
  darkMode
}) => {
  return (
    <div className="mb-6">
      <SectionHeader 
        title="Travel Information" 
        icon={Plane} 
        isExpanded={isExpanded}
        onClick={onToggle}
      />
      
      {isExpanded && (
        <div className="mt-4 space-y-4 pl-4 border-l-2 border-almet-sapphire/20">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Travel Type</label>
              <SearchableDropdown 
                options={travelTypes.map(type => ({ value: type.id, label: type.name }))} 
                value={formData.travel_type_id} 
                onChange={(value) => setFormData(prev => ({...prev, travel_type_id: value}))} 
                placeholder="Select travel type" 
                darkMode={darkMode} 
                allowUncheck={true}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Transport Type</label>
              <SearchableDropdown 
                options={transportTypes.map(type => ({ value: type.id, label: type.name }))} 
                value={formData.transport_type_id} 
                onChange={(value) => setFormData(prev => ({...prev, transport_type_id: value}))} 
                placeholder="Select transport type" 
                darkMode={darkMode} 
                allowUncheck={true}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Purpose</label>
            <SearchableDropdown 
              options={tripPurposes.map(purpose => ({ value: purpose.id, label: purpose.name }))} 
              value={formData.purpose_id} 
              onChange={(value) => setFormData(prev => ({...prev, purpose_id: value}))} 
              placeholder="Select purpose" 
              darkMode={darkMode} 
              allowUncheck={true}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Start Date</label>
              <input 
                type="date" 
                value={formData.start_date} 
                onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:outline-none focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire dark:bg-gray-700 dark:text-white"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">End Date</label>
              <input 
                type="date" 
                value={formData.end_date} 
                onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:outline-none focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire dark:bg-gray-700 dark:text-white"
                required 
              />
            </div>
          </div>

          {/* ✅ NEW: Initial Finance Amount (Optional) */}
          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
              Estimated Amount (Optional)
              <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai ml-2">Final amount will be confirmed by Finance</span>
            </label>
            <input 
              type="number"
              step="0.01"
              min="0"
              value={formData.initial_finance_amount || ''} 
              onChange={(e) => setFormData(prev => ({...prev, initial_finance_amount: e.target.value}))} 
              placeholder="Enter estimated amount (AZN)"
              className="w-full px-3 py-2.5 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:outline-none focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire dark:bg-gray-700 dark:text-white" 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Comment (Optional)</label>
            <textarea 
              value={formData.comment} 
              onChange={(e) => setFormData(prev => ({...prev, comment: e.target.value}))} 
              rows={3} 
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2.5 text-xs border outline-0 focus:outline-none focus:ring-1 focus:ring-almet-sapphire border-almet-mystic dark:border-almet-comet rounded-lg  focus:border-almet-sapphire dark:bg-gray-700 dark:text-white resize-none" 
            />
          </div>
        </div>
      )}
    </div>
  );
};