// src/components/assets/EnhancedModals.jsx - CLEAN VERSION (Small Fonts)
"use client";
import { useState, useEffect } from "react";
import { 
  XCircle, UserPlus, Loader, Package, Users, TrendingUp,
  DollarSign, BarChart3, PieChart, Activity, Plus,
  CheckCircle, Clock, Archive, Wrench, AlertCircle, X
} from "lucide-react";
import { assetService, employeeService } from "@/services/assetService";
import SearchableDropdown from "../common/SearchableDropdown";

// Asset Statistics Modal
export const AssetStatsModal = ({ onClose, darkMode, assetStats }) => {
  // Theme
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AZN"
    }).format(amount);
  };

  const getStatusPercentage = (count) => {
    return assetStats.total > 0 ? Math.round((count / assetStats.total) * 100) : 0;
  };

  // Stats Card Component
  const StatsCard = ({ icon, title, value, subtitle, color, percentage }) => (
    <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        {percentage !== undefined && (
          <span className={`text-xs ${textMuted} font-medium`}>{percentage}%</span>
        )}
      </div>
      <h3 className={`${textPrimary} text-base font-semibold mb-0.5`}>{value}</h3>
      <p className={`${textSecondary} text-xs font-medium`}>{title}</p>
      {subtitle && <p className={`${textMuted} text-xs mt-0.5`}>{subtitle}</p>}
    </div>
  );

  // Status Item Component
  const StatusItem = ({ label, value, icon: Icon, color, barColor }) => (
    <div className="flex items-center justify-between p-2.5 bg-white/30 dark:bg-gray-900/30 rounded-lg">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 ${color} rounded flex items-center justify-center`}>
          <Icon size={12} className="text-white" />
        </div>
        <span className={`${textSecondary} text-xs font-medium`}>{label}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className={`${textPrimary} text-sm font-semibold min-w-[1.5rem] text-right`}>{value}</span>
        <div className="w-14 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${barColor}`}
            style={{ width: `${getStatusPercentage(value)}%` }}
          />
        </div>
        <span className={`${textMuted} text-xs font-medium w-8 text-right`}>
          {getStatusPercentage(value)}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border ${borderColor}`}>
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <h2 className={`${textPrimary} text-lg font-semibold flex items-center gap-2`}>
                <BarChart3 size={18} className="text-almet-sapphire" />
                Asset Statistics
              </h2>
              <p className={`${textMuted} text-xs mt-0.5`}>
                Overview of your asset portfolio
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={18} />
            </button>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatsCard
              icon={<Package className="text-white" size={14} />}
              title="Total Assets"
              value={assetStats.total.toLocaleString()}
              subtitle="All assets"
              color="bg-almet-sapphire"
            />
            <StatsCard
              icon={<DollarSign className="text-white" size={14} />}
              title="Total Value"
              value={formatCurrency(assetStats.totalValue)}
              subtitle="Combined value"
              color="bg-emerald-500"
            />
            <StatsCard
              icon={<Users className="text-white" size={14} />}
              title="In Use"
              value={assetStats.inUse.toLocaleString()}
              subtitle="Currently deployed"
              color="bg-green-500"
              percentage={getStatusPercentage(assetStats.inUse)}
            />
            <StatsCard
              icon={<TrendingUp className="text-white" size={14} />}
              title="Utilization"
              value={`${getStatusPercentage(assetStats.inUse + assetStats.assigned)}%`}
              subtitle="In use + assigned"
              color="bg-blue-500"
            />
          </div>

          {/* Status Distribution */}
          <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
            <h3 className={`${textPrimary} font-semibold mb-3 text-sm flex items-center gap-2`}>
              <PieChart size={14} className="text-almet-sapphire" />
              Status Distribution
            </h3>
            <div className="space-y-2">
              <StatusItem
                label="In Stock"
                value={assetStats.inStock}
                icon={Package}
                color="bg-almet-sapphire"
                barColor="bg-almet-sapphire"
              />
              <StatusItem
                label="In Use"
                value={assetStats.inUse}
                icon={CheckCircle}
                color="bg-emerald-500"
                barColor="bg-emerald-500"
              />
              <StatusItem
                label="Assigned"
                value={assetStats.assigned}
                icon={Clock}
                color="bg-amber-500"
                barColor="bg-amber-500"
              />
              <StatusItem
                label="Need Clarification"
                value={assetStats.needClarification}
                icon={AlertCircle}
                color="bg-purple-500"
                barColor="bg-purple-500"
              />
              <StatusItem
                label="In Repair"
                value={assetStats.inRepair}
                icon={Wrench}
                color="bg-orange-500"
                barColor="bg-orange-500"
              />
              <StatusItem
                label="Archived"
                value={assetStats.archived}
                icon={Archive}
                color="bg-gray-500"
                barColor="bg-gray-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assign Asset Modal
export const AssignAssetModal = ({ asset, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    employee: '',
    check_out_date: new Date().toISOString().split('T')[0],
    check_out_notes: '',
    condition_on_checkout: 'EXCELLENT'
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState('');

  // Theme
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  const conditionOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' }
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeeService.getEmployees({ page_size: 100 });
        setEmployees(response.results || []);
      } catch (error) {
        setError('Failed to load employees');
      } finally {
        setEmployeesLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const employeeOptions = employees.map(employee => ({
    value: employee.id,
    label: `${employee.name || employee.full_name} (${employee.employee_id})`
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const assignmentData = {
        asset: asset.id,
        employee: parseInt(formData.employee),
        check_out_date: formData.check_out_date,
        check_out_notes: formData.check_out_notes,
        condition_on_checkout: formData.condition_on_checkout
      };
      
      const result = await assetService.assignToEmployee(assignmentData);
      onSuccess(result);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          'Failed to assign asset';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-md shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className={`${textPrimary} text-lg font-semibold`}>Assign Asset</h2>
            <button
              type="button"
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={18} />
            </button>
          </div>

          {/* Asset Info */}
          <div className={`${bgAccent} rounded-lg p-3 mb-4 border ${borderColor}`}>
            <p className={`${textPrimary} text-sm font-medium mb-0.5`}>{asset.asset_name}</p>
            <p className={`${textMuted} text-xs`}>Serial: {asset.serial_number}</p>
            <p className={`${textMuted} text-xs`}>Category: {asset.category?.name || asset.category_name}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex gap-2">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Assignment Failed</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Employee *
              </label>
              {employeesLoading ? (
                <div className="flex items-center justify-center p-3 border border-gray-300 rounded-lg">
                  <Loader size={14} className="animate-spin mr-2" />
                  <span className={`${textMuted} text-xs`}>Loading...</span>
                </div>
              ) : (
                <SearchableDropdown
                  options={employeeOptions}
                  value={formData.employee}
                  onChange={(value) => setFormData(prev => ({ ...prev, employee: value }))}
                  placeholder="Select employee"
                  searchPlaceholder="Search employees..."
                  darkMode={darkMode}
                  allowUncheck={true}
                />
              )}
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Assignment Date *
              </label>
              <input
                type="date"
                name="check_out_date"
                value={formData.check_out_date}
                onChange={(e) => setFormData(prev => ({ ...prev, check_out_date: e.target.value }))}
                required
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Condition *
              </label>
              <SearchableDropdown
                options={conditionOptions}
                value={formData.condition_on_checkout}
                onChange={(value) => setFormData(prev => ({ ...prev, condition_on_checkout: value }))}
                placeholder="Select condition"
                darkMode={darkMode}
                allowUncheck={true}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium ${textPrimary} mb-1.5`}>
                Notes (Optional)
              </label>
              <textarea
                name="check_out_notes"
                value={formData.check_out_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, check_out_notes: e.target.value }))}
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire ${bgCard} ${textPrimary} text-xs`}
                rows="2"
                placeholder="Add notes..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.employee || employeesLoading}
              className="px-4 py-2 rounded-lg text-xs bg-almet-sapphire hover:bg-almet-astral text-white disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus size={12} />
                  Assign Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Asset Activities Modal
export const AssetActivitiesModal = ({ asset, onClose, darkMode }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await assetService.getAssetActivities(asset.id);
        setActivities(response.activities || []);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [asset.id]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const getActivityIcon = (activityType) => {
    const props = { size: 12 };
    switch (activityType) {
      case 'CREATED': return <Plus {...props} className="text-almet-sapphire" />;
      case 'ASSIGNED': return <UserPlus {...props} className="text-green-500" />;
      case 'CHECKED_IN': return <CheckCircle {...props} className="text-emerald-500" />;
      case 'STATUS_CHANGED': return <Activity {...props} className="text-amber-500" />;
      case 'ASSIGNMENT_CANCELLED': return <X {...props} className="text-red-500" />;
      default: return <Activity {...props} className="text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (activityType) => {
    const labels = {
      'ASSIGNMENT_CANCELLED': 'Assignment Cancelled',
      'ASSIGNED': 'Assigned',
      'CREATED': 'Created',
      'CHECKED_IN': 'Checked In',
      'STATUS_CHANGED': 'Status Changed'
    };
    return labels[activityType] || activityType.replace('_', ' ');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border ${borderColor} flex flex-col`}>
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`${textPrimary} text-lg font-semibold mb-0.5`}>Activity History</h2>
              <p className={`${textMuted} text-xs`}>
                {asset.asset_name} - {asset.serial_number}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader className="w-5 h-5 animate-spin text-almet-sapphire mr-2" />
              <span className={`${textMuted} text-xs`}>Loading activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className={`${textMuted} text-sm font-medium`}>No activities found</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activities.map((activity) => (
                <div key={activity.id} className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
                  <div className="flex gap-2.5">
                    <div className="flex-shrink-0 w-6 h-6 bg-white/20 dark:bg-black/20 rounded flex items-center justify-center mt-0.5">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className={`${textPrimary} font-medium text-sm`}>
                          {getActivityTypeLabel(activity.activity_type)}
                        </h4>
                        <span className={`${textMuted} text-xs flex-shrink-0 ml-2`}>
                          {formatDateTime(activity.performed_at)}
                        </span>
                      </div>
                      
                      <p className={`${textSecondary} text-xs mb-2`}>
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`${textMuted} text-xs`}>
                          By {activity.performed_by_detail?.first_name} {activity.performed_by_detail?.last_name}
                        </span>
                      </div>
                      
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between py-1 px-2 bg-white/30 dark:bg-black/20 rounded text-xs">
                              <span className={`${textMuted} font-medium capitalize`}>
                                {key.replace('_', ' ')}:
                              </span>
                              <span className={`${textSecondary} ml-2`}>
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};