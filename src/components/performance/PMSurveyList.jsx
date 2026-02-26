import { useState } from 'react';
import { FileText, CheckCircle, Clock, Search,  Eye } from 'lucide-react';

export default function PMSurveyList({ 
  surveys = [], 
  statistics,
  onViewSurvey,

  darkMode 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = 
      survey.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.employee_department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || survey.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }) => {
    const config = {
      'SUBMITTED': {
        icon: CheckCircle,
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        label: 'Submitted'
      },
      'DRAFT': {
        icon: Clock,
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800/30',
        text: 'text-amber-700 dark:text-amber-400',
        label: 'Draft'
      }
    };

    const { icon: Icon, bg, border, text, label } = config[status] || config['DRAFT'];

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${bg} ${border} ${text} border`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-almet-mystic'} rounded-xl border p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Total Employees</div>
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {statistics?.total_employees || 0}
              </div>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-almet-mystic'} rounded-xl border p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Submitted</div>
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {statistics?.surveys_submitted || 0}
              </div>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-almet-mystic'} rounded-xl border p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Draft</div>
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {statistics?.surveys_draft || 0}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-almet-mystic'} rounded-xl border p-4`}>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or department..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
                darkMode 
                  ? 'bg-almet-san-juan border-almet-comet text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              darkMode 
                ? 'bg-almet-san-juan border-almet-comet text-white' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
          >
            <option value="all">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="DRAFT">Draft</option>
          </select>

        </div>
      </div>

      {/* Survey List */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-almet-mystic'} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Position</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Progress</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Submitted</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500">No surveys found</p>
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((survey) => (
                  <tr 
                    key={survey.id}
                    className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <div className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {survey.employee_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-500">{survey.employee_id}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {survey.employee_department}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {survey.employee_position}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-almet-sapphire transition-all"
                            style={{ width: `${survey.completion_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{survey.completion_percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={survey.status} />
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {survey.submitted_at 
                        ? new Date(survey.submitted_at).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewSurvey(survey)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg text-xs font-medium transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}