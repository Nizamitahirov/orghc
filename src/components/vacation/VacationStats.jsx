import { Calendar, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-3 hover:border-almet-sapphire/50 dark:hover:border-almet-astral/50 transition-all duration-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">{title}</p>
        <p className={`text-xl font-semibold ${color}`}>{value || 0}</p>
        {subtitle && <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
  </div>
);

export default function VacationStats({ balances, allowNegativeBalance }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard 
          title="Total Balance" 
          value={balances.total_balance} 
          icon={Calendar} 
          color="text-almet-sapphire" 
        />
        <StatCard 
          title="Yearly Balance" 
          value={balances.yearly_balance} 
          icon={Calendar} 
          color="text-almet-astral" 
        />
        <StatCard 
          title="Used Days" 
          value={balances.used_days} 
          icon={CheckCircle} 
          color="text-orange-600" 
        />
        <StatCard 
          title="Remaining" 
          value={balances.remaining_balance} 
          icon={Clock} 
          color="text-green-600" 
          subtitle="Available now"
        />
        <StatCard 
          title="Scheduled" 
          value={balances.scheduled_days} 
          icon={Users} 
          color="text-almet-steel-blue" 
          subtitle="Future plans"
        />
        <StatCard 
          title="To Plan" 
          value={balances.should_be_planned} 
          icon={AlertCircle} 
          color="text-red-600" 
          subtitle="Must schedule"
        />
      </div>

      {!allowNegativeBalance && balances.remaining_balance < 5 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-600 rounded-r-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Low Balance Warning</h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                You have only <strong>{balances.remaining_balance} days</strong> remaining. 
                {balances.remaining_balance <= 0 && ' Negative balance is not allowed.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}