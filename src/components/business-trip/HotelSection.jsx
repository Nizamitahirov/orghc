// ============================================
// File: components/business-trip/HotelSection.jsx
// ============================================
import { Hotel, Plus, Trash2 } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

export const HotelSection = ({
  isExpanded,
  onToggle,
  hotels,
  onAdd,
  onRemove,
  onChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader 
          title="Hotel Details " 
          icon={Hotel} 
          isExpanded={isExpanded}
          onClick={onToggle}
        />
        {isExpanded && (
          <button
            type="button"
            onClick={onAdd}
            className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-3 pl-4 border-l-2 border-almet-sapphire/20">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg p-4 border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Hotel Name</label>
                  <input
                    type="text"
                    value={hotel.hotel_name}
                    onChange={(e) => onChange(hotel.id, 'hotel_name', e.target.value)}
                    placeholder="Hotel name"
                    className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Check-in</label>
                  <input
                    type="date"
                    value={hotel.check_in_date}
                    onChange={(e) => onChange(hotel.id, 'check_in_date', e.target.value)}
                    className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Check-out</label>
                  <input
                    type="date"
                    value={hotel.check_out_date}
                    onChange={(e) => onChange(hotel.id, 'check_out_date', e.target.value)}
                    className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Location</label>
                  <input
                    type="text"
                    value={hotel.location}
                    onChange={(e) => onChange(hotel.id, 'location', e.target.value)}
                    placeholder="City/Area"
                    className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Notes</label>
                  <input
                    type="text"
                    value={hotel.notes}
                    onChange={(e) => onChange(hotel.id, 'notes', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 text-xs border outline-0 border-almet-mystic dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              {hotels.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(hotel.id)}
                  className="px-3 py-1.5 text-xs text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white border border-red-200 dark:border-red-700 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};