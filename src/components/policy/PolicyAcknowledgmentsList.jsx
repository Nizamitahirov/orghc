import { useState, useEffect } from "react";
import { CheckCircle, Clock, User, MessageSquare, Loader2 } from "lucide-react";
import { getPolicyAcknowledgments } from "@/services/policyService";

export default function PolicyAcknowledgmentsList({ policyId, darkMode }) {
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAcknowledgments();
  }, [policyId]);

  const loadAcknowledgments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPolicyAcknowledgments(policyId);
      setAcknowledgments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading acknowledgments:', err);
      setError(err.message || "Failed to load acknowledgments");
      setAcknowledgments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-red-900/20 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'
      }`}>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (acknowledgments.length === 0) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No acknowledgments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {acknowledgments.map((ack) => (
        <div
          key={ack.id}
          className={`rounded-lg border p-4 ${
            darkMode
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Avatar/Icon */}
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'
            }`}>
              <User className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* User Info */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {ack.employee_name || ack.acknowledged_by_name || "Unknown User"}
                  </h4>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    {ack.employee_position || ack.position || "No position"}
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'
                } px-2 py-1 rounded-full`}>
                  <CheckCircle className="w-3 h-3" />
                  <span>Acknowledged</span>
                </div>
              </div>

              {/* Timestamp */}
              <div className={`flex items-center gap-1 text-xs mb-2 ${
                darkMode ? "text-gray-500" : "text-gray-500"
              }`}>
                <Clock className="w-3 h-3" />
                <span>{formatDate(ack.acknowledged_at || ack.created_at)}</span>
              </div>

              {/* Notes */}
              {ack.notes && (
                <div className={`mt-3 p-3 rounded-lg ${
                  darkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {ack.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}