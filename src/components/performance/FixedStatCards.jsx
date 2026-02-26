import { Users, Target, FileText, Award, TrendingUp } from 'lucide-react';

export default function FixedStatCards({ employees, darkMode }) {
  // ✅ Calculate statistics based on actual data
  const getCompletedCount = () => {
    if (!employees || employees.length === 0) return 0;

    let completedCount = 0;

    employees.forEach(emp => {
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);

      // ✅ COMPLETED = both percentages exist and > 0
      const isCompleted = !isNaN(objPct) && objPct > 0 && 
                         !isNaN(compPct) && compPct > 0;

      if (isCompleted) {
        completedCount++;
      }
    });

    return completedCount;
  };

  const getObjectivesSetCount = () => {
    if (!employees || employees.length === 0) return 0;

    let count = 0;

    employees.forEach(emp => {
      // Count if objectives_manager_approved is true
      if (emp.objectives_employee_approved === true) {
        count++;
      }
    });

    return count;
  };

  const getMidYearCompletedCount = () => {
    if (!employees || employees.length === 0) return 0;

    let count = 0;

    employees.forEach(emp => {
      if (emp.mid_year_completed === true) {
        count++;
      }
    });

    return count;
  };



  const totalEmployees = employees?.length || 0;
  const completedCount = getCompletedCount();
  const objectivesSetCount = getObjectivesSetCount();
  const midYearCount = getMidYearCompletedCount();

  const StatCard = ({ icon: Icon, title, value, total, subtitle, color }) => {

    
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-4 hover:shadow-lg transition-all`}>
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-xl ${
            color === 'blue' ? 'bg-almet-sapphire/10 dark:bg-almet-sapphire/20' : 
            color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' : 
            color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
            'bg-emerald-100 dark:bg-emerald-900/30'
          }`}>
            <Icon className={`w-5 h-5 ${
              color === 'blue' ? 'text-almet-sapphire' : 
              color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 
              color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
              'text-emerald-600 dark:text-emerald-400'
            }`} />
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              {value}
              {total && <span className="text-base text-almet-waterloo dark:text-almet-bali-hai">/{total}</span>}
            </div>
          </div>
        </div>
        
        <h3 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
            {subtitle}
          </p>
        )}
        
    
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Users}
        title="Total Employees"
        value={totalEmployees}
        subtitle="Total employees in system"
        color="blue"
      />
      <StatCard
        icon={Target}
        title="Objectives Set"
        value={objectivesSetCount}
        total={totalEmployees}
        subtitle="Employees with approved objectives"
        color="blue"
      />
      <StatCard
        icon={FileText}
        title="Mid-Year Reviews"
        value={midYearCount}
        total={totalEmployees}
        subtitle="Completed mid-year reviews"
        color="orange"
      />
      <StatCard
        icon={Award}
        title="Fully Completed"
        value={completedCount}
        total={totalEmployees}
        subtitle="Both objectives & competencies rated"
        color="green"
      />
    </div>
  );
}