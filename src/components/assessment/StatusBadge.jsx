


const StatusBadge = ({ status }) => {
  const statusConfig = {
    'DRAFT': { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Draft' },
    'COMPLETED': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' }
  };

  const config = statusConfig[status] || statusConfig['DRAFT'];
  
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}; 

export default StatusBadge