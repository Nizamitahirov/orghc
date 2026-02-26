// components/vacation/PlanningStatisticsModal.jsx

import { useState, useEffect } from 'react';
import { 
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
  BarChart3
} from 'lucide-react';
import { VacationService } from '@/services/vacationService';
import Pagination from '@/components/common/Pagination';

export default function PlanningStatisticsModal({
  show,
  onClose,
  darkMode,
  userAccess,
  showSuccess,
  showError
}) {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (show) {
      fetchStatistics();
    }
  }, [show]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // ✅ Get both balances and schedules
      const [balanceResponse, scheduleResponse] = await Promise.all([
        VacationService.getAllBalances({ year: new Date().getFullYear() }),
        VacationService.getScheduleTabs()
      ]);
      
      if (balanceResponse?.balances) {
        // ✅ Get all schedules (upcoming includes PENDING + SCHEDULED)
        const allSchedules = scheduleResponse?.upcoming || [];
        
        // ✅ Calculate statistics with pending schedules included
        const stats = balanceResponse.balances.map(balance => {
          // Find this employee's schedules
          const employeeSchedules = allSchedules.filter(
            s => s.employee_name === balance.employee_name
          );
          
          // ✅ Calculate pending days
          const pendingDays = employeeSchedules
            .filter(s => s.status === 'PENDING_MANAGER')
            .reduce((sum, s) => sum + (parseFloat(s.number_of_days) || 0), 0);
          
          // ✅ Total planned = used + scheduled + pending
          const totalPlanned = parseFloat(balance.used_days) + 
                              parseFloat(balance.scheduled_days) + 
                              pendingDays;

          // ✅ Should plan = total_balance - total planned
          const shouldPlan = Math.max(0, parseFloat(balance.total_balance) - totalPlanned);
          
          const planningRate = balance.total_balance > 0 
            ? ((totalPlanned / balance.total_balance) * 100).toFixed(1)
            : 0;
          
          return {
            ...balance,
            pending_days: pendingDays,
            total_planned: totalPlanned,
            should_plan: shouldPlan,
            planning_rate: parseFloat(planningRate),
            is_fully_planned: shouldPlan === 0,
            is_under_planned: shouldPlan > 0,
            has_schedules: employeeSchedules.length > 0
          };
        });
        
        // ✅ Filter: Only show employees with schedules
        const filteredStats = stats.filter(s => s.has_schedules);
        
        // Sort by should_plan DESC (most urgent first)
        filteredStats.sort((a, b) => b.should_plan - a.should_plan);
        
        setStatistics(filteredStats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showError?.('Failed to load planning statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await VacationService.exportBalances({
        year: new Date().getFullYear()
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planning_statistics_${new Date().getFullYear()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSuccess?.('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError?.('Export failed');
    }
  };

  // Filter by search
  const filteredStats = statistics.filter(stat => 
    stat.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredStats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStats = filteredStats.slice(startIndex, endIndex);

  // Summary calculations
  const totalEmployees = statistics.length;
  const fullyPlanned = statistics.filter(s => s.is_fully_planned).length;
  const underPlanned = statistics.filter(s => s.is_under_planned).length;


  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-almet-mystic/50 dark:border-almet-comet">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-almet-sapphire/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-almet-sapphire" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                Planning Statistics
              </h2>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                Employee vacation planning overview for {new Date().getFullYear()}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-almet-mystic/30 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-almet-waterloo dark:text-almet-bali-hai" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-almet-mystic/30 dark:border-almet-comet/30">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-almet-sapphire" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Total Employees</span>
              </div>
              <p className="text-xl font-bold text-almet-cloud-burst dark:text-white">{totalEmployees}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Fully Planned</span>
              </div>
              <p className="text-xl font-bold text-green-600">{fullyPlanned}</p>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                {totalEmployees > 0 ? ((fullyPlanned / totalEmployees) * 100).toFixed(0) : 0}%
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Under Planned</span>
              </div>
              <p className="text-xl font-bold text-amber-600">{underPlanned}</p>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                {totalEmployees > 0 ? ((underPlanned / totalEmployees) * 100).toFixed(0) : 0}%
              </p>
            </div>

       

          </div>
        </div>

        {/* Search & Actions */}
        <div className="px-6 py-3 border-b border-almet-mystic/30 dark:border-almet-comet/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, ID, or department..."
                className="w-full pl-10 pr-4 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-almet-sapphire border-t-transparent"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
              <thead className="bg-almet-mystic/50 dark:bg-gray-700/50 sticky top-0">
                <tr>
                  {['Employee', 'Department', 'Used', 'Scheduled', 'Pending', 'Total Planned', 'Must Plan',  'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                {paginatedStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                          {stat.employee_name}
                        </p>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {stat.employee_id}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-almet-waterloo dark:text-almet-bali-hai">
                      {stat.department_name}
                    </td>
                    
                    {/* ✅ Used Days */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {parseFloat(stat.used_days).toFixed(1)}
                      </span>
                    </td>
                    
                    {/* ✅ Scheduled Days */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {parseFloat(stat.scheduled_days).toFixed(1)}
                      </span>
                    </td>
                    
                    {/* ✅ Pending Days */}
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${
                        stat.pending_days > 0 
                          ? 'text-amber-600 dark:text-amber-400' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {stat.pending_days.toFixed(1)}
                      </span>
                    </td>
                    
                    {/* ✅ Total Planned */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-almet-cloud-burst dark:text-white">
                          {stat.total_planned.toFixed(1)}
                        </span>
                        <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          / {parseFloat(stat.total_balance).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    {/* ✅ Must Plan */}
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${
                        stat.should_plan > 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {stat.should_plan.toFixed(1)}
                      </span>
                    </td>
                    
               
                    <td className="px-4 py-3">
                      <span >
                        {stat.is_fully_planned ? (
                          <span className="flex items-center gap-1">
                            <div>

                            <CheckCircle className="w-3 h-3" />
                            </div>
                            Complete
                          </span>
                        ) : stat.should_plan > 5 ? (
                          <span className="flex items-center gap-1">
                            <div>

                            <AlertCircle className="w-3 h-3" />
                            </div>
                            Urgent
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <div>

                            <TrendingDown className="w-3 h-3" />
                            </div>
                            Needs Planning
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedStats.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <Users className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                      <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                        {searchTerm ? 'No employees match your search' : 'No statistics available'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredStats.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-almet-mystic/30 dark:border-almet-comet/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredStats.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}