// ============================================
// File: components/business-trip/StatCard.jsx
// ============================================
export const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className={`${bgColor} rounded-xl p-4 border border-${color.replace('text-', '')}/20 hover:border-${color.replace('text-', '')}/40 transition-all duration-300 shadow-sm hover:shadow-md`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-almet-waterloo dark:text-almet-bali-hai mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value || 0}</p>
      </div>
      <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);
