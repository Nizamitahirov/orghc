import { memo, useMemo } from 'react';
import { Users, Target, FileText, Award, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const ProgressBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor = {
    blue:   'bg-almet-sapphire',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    green:  'bg-emerald-500',
    amber:  'bg-amber-500',
  }[color] || 'bg-almet-sapphire';

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">Progress</span>
        <span className={`text-xs font-bold ${
          color === 'green' ? 'text-emerald-600 dark:text-emerald-400' :
          color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
          'text-almet-sapphire'
        }`}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const StatCard = memo(({ icon: Icon, title, value, total, subtitle, color, trend, darkMode }) => {
  const iconBg = {
    blue:   'bg-almet-sapphire/10 dark:bg-almet-sapphire/20',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    green:  'bg-emerald-100 dark:bg-emerald-900/30',
    amber:  'bg-amber-100 dark:bg-amber-900/30',
  }[color] || 'bg-gray-100';

  const iconColor = {
    blue:   'text-almet-sapphire',
    orange: 'text-orange-500 dark:text-orange-400',
    purple: 'text-purple-500 dark:text-purple-400',
    green:  'text-emerald-500 dark:text-emerald-400',
    amber:  'text-amber-500 dark:text-amber-400',
  }[color] || 'text-gray-500';

  const borderAccent = {
    blue:   'border-t-almet-sapphire',
    orange: 'border-t-orange-500',
    purple: 'border-t-purple-500',
    green:  'border-t-emerald-500',
    amber:  'border-t-amber-500',
  }[color] || 'border-t-gray-400';

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border-t-2 ${borderAccent} border-x border-b rounded-xl p-4 hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold leading-none ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
            {value}
            {total != null && (
              <span className={`text-sm font-medium ml-0.5 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`}>/{total}</span>
            )}
          </div>
          {trend != null && (
            <div className={`text-xs mt-0.5 flex items-center justify-end gap-0.5 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>

      <h3 className={`text-sm font-bold mb-0.5 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>{title}</h3>
      <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`}>{subtitle}</p>

      {total != null && total > 0 && <ProgressBar value={value} max={total} color={color} />}
    </div>
  );
});
StatCard.displayName = 'StatCard';

export default memo(function FixedStatCards({ employees, darkMode }) {
  const stats = useMemo(() => {
    if (!employees || employees.length === 0) {
      return { total: 0, objSet: 0, midYear: 0, endYear: 0, needAction: 0 };
    }
    let objSet = 0, midYear = 0, endYear = 0, needAction = 0;
    employees.forEach(emp => {
      if (emp.objectives_employee_approved === true) objSet++;
      if (emp.mid_year_completed === true) midYear++;
      if (emp.end_year_completed === true || emp.approval_status === 'COMPLETED') endYear++;
      if (['PENDING_EMPLOYEE_APPROVAL', 'NEED_CLARIFICATION'].includes(emp.approval_status)) needAction++;
    });
    return { total: employees.length, objSet, midYear, endYear, needAction };
  }, [employees]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Users}
        title="Total Employees"
        value={stats.total}
        subtitle="In performance cycle"
        color="blue"
        darkMode={darkMode}
      />
      <StatCard
        icon={Target}
        title="Goals Approved"
        value={stats.objSet}
        total={stats.total}
        subtitle="Objectives approved"
        color="purple"
        darkMode={darkMode}
      />
      <StatCard
        icon={FileText}
        title="Mid-Year Done"
        value={stats.midYear}
        total={stats.total}
        subtitle="Reviews completed"
        color="orange"
        darkMode={darkMode}
      />
      <StatCard
        icon={Award}
        title="Fully Completed"
        value={stats.endYear}
        total={stats.total}
        subtitle="End-year finalized"
        color="green"
        darkMode={darkMode}
      />
    </div>
  );
});
