import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Eye,
  Download,
  CheckCircle,
  X,
  Loader2,
  User,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/components/common/Toast";
import {
  trackPolicyDownload,
  acknowledgePolicy,
  getPoliciesByFolder,
  getPolicyAcknowledgments,
} from "@/services/policyService";

// PolicyAcknowledgmentsList Component
function PolicyAcknowledgmentsList({ policyId, darkMode }) {
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
      const results = data?.results || [];
      setAcknowledgments(Array.isArray(results) ? results : []);
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
        <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
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
                    {ack.employee_name || "Unknown User"}
                  </h4>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    {ack.employee_id || "N/A"} • {ack.employee_email || "No email"}
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
                <span>{formatDate(ack.acknowledged_at)}</span>
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

// Main PDFViewer Component
export default function PDFViewer({
  selectedPolicy,
  selectedFolder,
  selectedCompany,
  darkMode,
  onBack,
}) {
  const { showSuccess, showError } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState("document");
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgeNotes, setAcknowledgeNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [policy, setPolicy] = useState(selectedPolicy);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [checkingAcknowledgment, setCheckingAcknowledgment] = useState(false);
  const [pdfScrollProgress, setPdfScrollProgress] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [showReadCompletePrompt, setShowReadCompletePrompt] = useState(false);

  // Refresh policy data when component mounts to get updated stats
  useEffect(() => {
    const refreshPolicyData = async () => {
      try {
        const data = await getPoliciesByFolder(selectedFolder.id);
        const updatedPolicy = data.find(p => p.id === selectedPolicy.id);
        if (updatedPolicy) {
          setPolicy(updatedPolicy);
        }
      } catch (err) {
        console.error('Error refreshing policy data:', err);
      }
    };
    
    refreshPolicyData();
  }, [selectedPolicy.id, selectedFolder.id]);

  // Check if current user has acknowledged this policy
  useEffect(() => {
    const checkUserAcknowledgment = async () => {
      if (!policy.requires_acknowledgment) return;
      
      setCheckingAcknowledgment(true);
      try {
        const currentUserEmail = localStorage.getItem('user_email');
        if (!currentUserEmail) {
          setCheckingAcknowledgment(false);
          return;
        }

        const data = await getPolicyAcknowledgments(policy.id);
        const acknowledgments = Array.isArray(data?.results) ? data.results : [];
        
        // Check if current user has acknowledged
        const userAcknowledged = acknowledgments.some(
          ack => ack.employee_email === currentUserEmail
        );
        
        setHasAcknowledged(userAcknowledged);
      } catch (err) {
        console.error('Error checking acknowledgment:', err);
      } finally {
        setCheckingAcknowledgment(false);
      }
    };

    checkUserAcknowledgment();
  }, [policy.id, policy.requires_acknowledgment]);

  // Track PDF reading progress
  useEffect(() => {
    if (!policy.requires_acknowledgment || hasAcknowledged) return;

    const iframe = document.querySelector('iframe');
    if (!iframe) return;

    let readingTimer;
    let readingStartTime = Date.now();

    // Start a timer to track reading time (assume user read the PDF after 30 seconds)
    readingTimer = setTimeout(() => {
      if (!hasReachedEnd && !hasAcknowledged) {
        setHasReachedEnd(true);
        setShowReadCompletePrompt(true);
      }
    }, 30000); // 30 seconds

    return () => {
      if (readingTimer) clearTimeout(readingTimer);
    };
  }, [policy.requires_acknowledgment, hasAcknowledged, hasReachedEnd]);

  // Get PDF URL for iframe
  const getPDFUrl = () => {
    const url = policy.policy_url || policy.policy_file;
    if (!url) return null;
    
    // Handle Google Drive URLs
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      return url.includes('?') ? `${url}&output=embed` : `${url}?output=embed`;
    }
    
    return url;
  };

  // Download PDF handler
  const handleDownloadPDF = async () => {
    try {
      await trackPolicyDownload(policy.id);
      
      const link = document.createElement("a");
      link.href = policy.policy_url || policy.policy_file;
      link.download = `${policy.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess("Download started!");
      
      // Refresh policy data after download
      const data = await getPoliciesByFolder(selectedFolder.id);
      const updatedPolicy = data.find(p => p.id === policy.id);
      if (updatedPolicy) {
        setPolicy(updatedPolicy);
      }
    } catch (err) {
      console.error('Error downloading:', err);
      showError("Failed to download policy");
    }
  };

  // Acknowledge policy handler
  const handleAcknowledge = async () => {
    setSubmitting(true);
    try {
      await acknowledgePolicy(policy.id, acknowledgeNotes);
      showSuccess("Policy acknowledged successfully!");
      setAcknowledgeNotes("");
      setShowAcknowledgeModal(false);
      setHasAcknowledged(true); // Update local state
      
      // Refresh policy data after acknowledgment
      const data = await getPoliciesByFolder(selectedFolder.id);
      const updatedPolicy = data.find(p => p.id === policy.id);
      if (updatedPolicy) {
        setPolicy(updatedPolicy);
      }
    } catch (err) {
      showError(err.message || "Failed to acknowledge policy");
    } finally {
      setSubmitting(false);
    }
  };

  const pdfUrl = getPDFUrl();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}>
        {/* Left Section - Back Button and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${
              darkMode
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-all`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {policy.title}
              </h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {selectedCompany.name} • {selectedFolder.name}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Tabs and Actions */}
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className={`flex border-b ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => setActiveTab("document")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "document"
                  ? darkMode
                    ? 'border-blue-500 text-white'
                    : 'border-blue-600 text-blue-600'
                  : darkMode
                    ? 'border-transparent text-gray-400 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Document
            </button>
            
            {policy.requires_acknowledgment && (
              <button
                onClick={() => setActiveTab("acknowledgments")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "acknowledgments"
                    ? darkMode
                      ? 'border-blue-500 text-white'
                      : 'border-blue-600 text-blue-600'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Acknowledgments
              </button>
            )}
          </div>
          
          {/* Stats Badge */}
          <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
          }`}>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{policy.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{policy.download_count || 0}</span>
            </div>
          </div>

          {/* Acknowledge Button */}
          {policy.requires_acknowledgment && (
            <button
              onClick={() => setShowAcknowledgeModal(true)}
              disabled={hasAcknowledged || checkingAcknowledgment}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                hasAcknowledged
                  ? darkMode 
                    ? 'bg-green-900/30 text-green-400 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title={hasAcknowledged ? "You have already acknowledged this policy" : "Acknowledge this policy"}
            >
              <CheckCircle className="w-4 h-4" />
              {checkingAcknowledgment ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking...
                </span>
              ) : hasAcknowledged ? (
                "Already Acknowledged"
              ) : (
                "Acknowledge"
              )}
            </button>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Content Area - PDF Viewer OR Acknowledgments List */}
      <div className={`flex-1 overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {activeTab === "document" ? (
          // PDF Document Tab
          <div className="relative w-full h-full">
            {pdfUrl ? (
              <>
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title={policy.title}
                  style={{ border: 'none' }}
                  loading="lazy"
                />
                
                {/* Read Complete Prompt - Floating notification */}
                {showReadCompletePrompt && !hasAcknowledged && policy.requires_acknowledgment && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
                    <div className={`rounded-lg shadow-xl p-4 border-2 max-w-md ${
                      darkMode 
                        ? 'bg-gray-800 border-green-600 text-white' 
                        : 'bg-white border-green-500 text-gray-900'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-green-500 text-white flex-shrink-0">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Ready to Acknowledge?</h4>
                          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            You've spent enough time reviewing this policy. Please acknowledge that you've read and understood it.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setShowReadCompletePrompt(false);
                                setShowAcknowledgeModal(true);
                              }}
                              className="flex-1 px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                            >
                              Acknowledge Now
                            </button>
                            <button
                              onClick={() => setShowReadCompletePrompt(false)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                darkMode 
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Later
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowReadCompletePrompt(false)}
                          className={`p-1 rounded-lg flex-shrink-0 ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // No PDF Available
              <div className={`flex items-center justify-center h-full ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">PDF file not available</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Acknowledgments Tab
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Policy Acknowledgments
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  List of employees who have acknowledged this policy
                </p>
              </div>
              <PolicyAcknowledgmentsList policyId={policy.id} darkMode={darkMode} />
            </div>
          </div>
        )}
      </div>

      {/* Acknowledge Modal */}
      {showAcknowledgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Acknowledge Policy
              </h3>
              <button
                onClick={() => {
                  setShowAcknowledgeModal(false);
                  setAcknowledgeNotes("");
                }}
                className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mb-4">
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                By acknowledging this policy, you confirm that you have read and understood its contents.
              </p>

              {/* Policy Title Badge */}
              <div className={`p-3 rounded-lg mb-4 ${
                darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                  {policy.title}
                </p>
              </div>

              {/* Notes Textarea */}
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes (Optional)
              </label>
              <textarea
                placeholder="Add any comments or questions..."
                value={acknowledgeNotes}
                onChange={(e) => setAcknowledgeNotes(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAcknowledgeModal(false);
                  setAcknowledgeNotes("");
                }}
                disabled={submitting}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } disabled:opacity-50 transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <CheckCircle className="w-4 h-4" />
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}