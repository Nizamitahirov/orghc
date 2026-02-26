// ============================================
// File: components/business-trip/SectionHeader.jsx
// ============================================
import { ChevronDown, ChevronUp } from 'lucide-react';

export const SectionHeader = ({ title, icon: Icon, isExpanded, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-almet-sapphire/5 to-transparent dark:from-almet-sapphire/10 rounded-lg hover:from-almet-sapphire/10 dark:hover:from-almet-sapphire/20 transition-all duration-200 border border-transparent hover:border-almet-sapphire/20"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-almet-sapphire/10 rounded-lg">
        <Icon className="w-4 h-4 text-almet-sapphire" />
      </div>
      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{title}</h3>
    </div>
    {isExpanded ? (
      <ChevronUp className="w-4 h-4 text-almet-waterloo transition-transform" />
    ) : (
      <ChevronDown className="w-4 h-4 text-almet-waterloo transition-transform" />
    )}
  </button>
);