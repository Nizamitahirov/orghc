// src/app/(dashboard)/suggestions/page.jsx - COMPLETE WITH ALL FUNCTIONALITY

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, Mail, TrendingUp, ThumbsUp, ThumbsDown, MessageSquare,
  Search, Filter, Plus, Loader2, Eye, Calendar, User, UserX,
  Shield, Send, Clock, CheckCircle2, XCircle, Rocket, AlertCircle,
  Copy, Check, Key, RefreshCw, X, Paperclip, Download
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { suggestionService, boardLetterService, commentService } from '@/services/suggestionService';
import jobDescriptionService  from '@/services/jobDescriptionService';
import { useToast } from '@/components/common/Toast';
import MyVoiceModal from '@/components/suggestions/MyVoiceModal';
import BoardLetterModal from '@/components/suggestions/BoardLetterModal';
import { SuggestionCard, LetterCard, MyLetterCard } from '@/components/suggestions/SuggestionCard';

export default function SuggestionsPage() {
  // State
  const [activeTab, setActiveTab] = useState('my-voice');
  const [accessInfo, setAccessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsStats, setSuggestionsStats] = useState(null);
  
  // Board letters state
  const [boardLetters, setBoardLetters] = useState([]);
  const [boardStats, setBoardStats] = useState(null);
  
  // My letters state
  const [myLetters, setMyLetters] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderBy, setOrderBy] = useState('-trending_score');
  
  // Modals
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  
  // Selected items
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  
  // Comment state
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  
  // Response state
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchAccessInfo();
  }, []);

  useEffect(() => {
    if (accessInfo) {
      fetchData();
    }
  }, [activeTab, accessInfo, statusFilter, orderBy]);

  const fetchAccessInfo = async () => {
    try {
      const response = await jobDescriptionService.getMyAccessInfo();
      setAccessInfo(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching access info:', error);
      showError('Failed to load access information');
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'my-voice') {
        await fetchSuggestions();
      } else if (activeTab === 'board-letters' && canViewBoardLetters()) {
        await fetchBoardLetters();
      } else if (activeTab === 'my-letters') {
        await fetchMyLetters();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    const params = {
      search: searchQuery,
      ordering: orderBy
    };
    if (statusFilter !== 'all') params.status = statusFilter;
    
    const [suggestionsRes, statsRes] = await Promise.all([
      suggestionService.getSuggestions(params),
      canManageSuggestions() ? suggestionService.getStatistics() : Promise.resolve(null)
    ]);
    
    setSuggestions(suggestionsRes.results || suggestionsRes || []);
    setSuggestionsStats(statsRes);
  };

  const fetchBoardLetters = async () => {
    const params = {
      search: searchQuery
    };
    if (statusFilter !== 'all') params.status = statusFilter;
    
    const [lettersRes, statsRes] = await Promise.all([
      boardLetterService.getAllLetters(params),
      boardLetterService.getStatistics()
    ]);
    
    setBoardLetters(lettersRes.results || lettersRes || []);
    setBoardStats(statsRes);
  };

  const fetchMyLetters = async () => {
    const response = await boardLetterService.getAllLetters();
    setMyLetters(response.results || response || []);
  };

  // Access control helpers
  const canManageSuggestions = () => {
    return accessInfo?.is_admin || accessInfo?.roles?.some(role => 
      role.name?.includes('HR') || role.name?.includes('Admin')
    );
  };

  const canViewBoardLetters = () => {
    return accessInfo?.is_admin || accessInfo?.roles?.some(role => 
      role.name?.includes('Board') || role.name?.includes('Admin') || role.name?.includes('HR')
    );
  };

  const canRespondToLetters = () => {
    return accessInfo?.is_admin || accessInfo?.roles?.some(role => 
      role.name?.includes('Board') || role.name?.includes('Admin')
    );
  };

  // Vote handling
  const handleVote = async (suggestionId, voteType) => {
    try {
      await suggestionService.vote(suggestionId, voteType);
      showSuccess('Vote recorded');
      fetchSuggestions();
    } catch (error) {
      if (error.response?.status === 400) {
        showError(error.response.data.error);
      } else {
        showError('Failed to vote');
      }
    }
  };

  const handleRemoveVote = async (suggestionId) => {
    try {
      await suggestionService.removeVote(suggestionId);
      showSuccess('Vote removed');
      fetchSuggestions();
    } catch (error) {
      showError('Failed to remove vote');
    }
  };

  // Comment handling
  const toggleComments = async (suggestionId) => {
    if (showComments[suggestionId]) {
      setShowComments(prev => ({ ...prev, [suggestionId]: false }));
    } else {
      try {
        const response = await commentService.getComments(suggestionId);
        const commentsData = Array.isArray(response) 
          ? response 
          : (response.results || response.data || []);
        
        setComments(prev => ({ ...prev, [suggestionId]: commentsData }));
        setShowComments(prev => ({ ...prev, [suggestionId]: true }));
      } catch (error) {
        console.error('Failed to load comments:', error);
        showError('Failed to load comments');
      }
    }
  };

  const handleAddComment = async (suggestionId) => {
    if (!commentText.trim()) {
      showError('Please enter a comment');
      return;
    }

    try {
      await suggestionService.addComment(suggestionId, commentText);
      setCommentText('');
      showSuccess('Comment added');
      toggleComments(suggestionId);
    } catch (error) {
      showError('Failed to add comment');
    }
  };

  // Suggestion Management
  const handleSelectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setResponseText(suggestion.admin_response || '');
  };

  const handleRespondToSuggestion = async (newStatus) => {
    if (!responseText.trim()) {
      showError('Please enter a response');
      return;
    }

    try {
      setResponding(true);
      await suggestionService.respondToSuggestion(selectedSuggestion.id, {
        response: responseText,
        status: newStatus || selectedSuggestion.status
      });
      showSuccess('Response sent successfully');
      setResponseText('');
      setSelectedSuggestion(null);
      fetchSuggestions();
    } catch (error) {
      showError('Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  // Board Letter Management
  const handleSelectLetter = async (letter) => {
    setSelectedLetter(letter);
    setResponseText(letter.board_response || '');
    
    // Auto mark as read when viewing
    if (!letter.read_by_board && canRespondToLetters()) {
      try {
        await boardLetterService.markAsRead(letter.id);
        fetchBoardLetters();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleMarkLetterAsRead = async () => {
    if (!selectedLetter) return;
    
    try {
      await boardLetterService.markAsRead(selectedLetter.id);
      setSelectedLetter({ ...selectedLetter, read_by_board: true });
      showSuccess('Marked as read');
      fetchBoardLetters();
    } catch (error) {
      showError('Failed to mark as read');
    }
  };

  const handleUpdateLetterStatus = async (newStatus) => {
    if (!selectedLetter) return;
    
    try {
      await boardLetterService.updateStatus(selectedLetter.id, newStatus);
      setSelectedLetter({ ...selectedLetter, status: newStatus });
      showSuccess('Status updated');
      fetchBoardLetters();
    } catch (error) {
      showError('Failed to update status');
    }
  };

  const handleRespondToLetter = async () => {
  

    try {
      setResponding(true);
      await boardLetterService.respondToLetter(selectedLetter.id, responseText);
      showSuccess('Response sent successfully');
      setResponseText('');
      setSelectedLetter(null);
      fetchBoardLetters();
    } catch (error) {
      showError('Failed to send response');
    } finally {
      setResponding(false);
    }
  };



  // Status badge
  const StatusBadge = ({ status, type = 'suggestion' }) => {
    const configs = {
      suggestion: {
        'PENDING': { icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-700 dark:text-amber-400', label: 'Pending' },
        'IN_PROGRESS': { icon: Rocket, bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-700 dark:text-blue-400', label: 'In Progress' },
        'IMPLEMENTED': { icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-700 dark:text-emerald-400', label: 'Implemented' },
        'REJECTED': { icon: XCircle, bg: 'bg-rose-50 dark:bg-rose-900/10', text: 'text-rose-700 dark:text-rose-400', label: 'Rejected' },
      },
      letter: {
        'PENDING': { icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-700 dark:text-amber-400', label: 'Pending' },
        'UNDER_REVIEW': { icon: Eye, bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-700 dark:text-blue-400', label: 'Under Review' },
        'RESPONDED': { icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-700 dark:text-emerald-400', label: 'Responded' },
        'CLOSED': { icon: AlertCircle, bg: 'bg-slate-50 dark:bg-slate-900/10', text: 'text-slate-700 dark:text-slate-400', label: 'Closed' },
      }
    };

    const config = configs[type][status] || configs[type]['PENDING'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.bg} ${config.text}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  if (loading && !accessInfo) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire mx-auto mb-3" />
            <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl shadow-lg">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-almet-cloud-burst dark:text-white">
                My Voice & Communications
              </h1>
              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                Share ideas and communicate with leadership
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {activeTab === 'my-voice' && (
              <button
                onClick={() => setShowVoiceModal(true)}
                className="px-4 py-2.5 rounded-lg bg-almet-sapphire hover:bg-almet-mystic text-white text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Suggestion
              </button>
            )}
            {activeTab === 'my-letters' && (
              <button
                onClick={() => setShowLetterModal(true)}
                className="px-4 py-2.5 rounded-lg bg-almet-sapphire hover:bg-almet-mystic text-white text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Letter
              </button>
            )}
            <button
              onClick={fetchData}
              className="p-2.5 rounded-lg bg-almet-mystic/50 dark:bg-almet-san-juan/30 hover:bg-almet-mystic dark:hover:bg-almet-san-juan/50 text-almet-sapphire dark:text-almet-steel-blue transition-all"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-almet-mystic dark:border-almet-san-juan">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('my-voice')}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === 'my-voice'
                  ? 'bg-white dark:bg-almet-san-juan/20 text-almet-sapphire dark:text-almet-steel-blue border-b-2 border-almet-sapphire'
                  : 'text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-sapphire dark:hover:text-almet-steel-blue'
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              My Voice
            </button>

            {canViewBoardLetters() && (
              <button
                onClick={() => setActiveTab('board-letters')}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                  activeTab === 'board-letters'
                    ? 'bg-white dark:bg-almet-san-juan/20 text-almet-sapphire dark:text-almet-steel-blue border-b-2 border-almet-sapphire'
                    : 'text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-sapphire dark:hover:text-almet-steel-blue'
                }`}
              >
                <Shield className="h-4 w-4" />
                Board Letters
                {boardStats?.unread > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                    {boardStats.unread}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('my-letters')}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === 'my-letters'
                  ? 'bg-white dark:bg-almet-san-juan/20 text-almet-sapphire dark:text-almet-steel-blue border-b-2 border-almet-sapphire'
                  : 'text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-sapphire dark:hover:text-almet-steel-blue'
              }`}
            >
              <Mail className="h-4 w-4" />
              My Letters
            </button>
          </div>
        </div>

        {/* Statistics */}
        {canManageSuggestions() && activeTab === 'my-voice' && suggestionsStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <StatCard icon={TrendingUp} label="Total" value={suggestionsStats.total} color="blue" />
            <StatCard icon={Clock} label="Pending" value={suggestionsStats.pending} color="amber" />
            <StatCard icon={Rocket} label="In Progress" value={suggestionsStats.in_progress} color="blue" />
            <StatCard icon={CheckCircle2} label="Implemented" value={suggestionsStats.implemented} color="emerald" />
            <StatCard icon={XCircle} label="Rejected" value={suggestionsStats.rejected} color="rose" />
          </div>
        )}

        {canViewBoardLetters() && activeTab === 'board-letters' && boardStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <StatCard icon={Mail} label="Total" value={boardStats.total} color="blue" />
            <StatCard icon={Clock} label="Pending" value={boardStats.pending} color="amber" />
            <StatCard icon={Eye} label="Under Review" value={boardStats.under_review} color="blue" />
            <StatCard icon={CheckCircle2} label="Responded" value={boardStats.responded} color="emerald" />
            <StatCard icon={AlertCircle} label="Unread" value={boardStats.unread} color="rose" />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-almet-waterloo dark:text-almet-bali-hai" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 focus:ring-almet-sapphire shadow-sm"
            />
          </div>

          {activeTab === 'my-voice' && (
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="px-4 py-3 text-sm rounded-xl border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire shadow-sm"
            >
              <option value="-trending_score">Trending</option>
              <option value="-created_at">Newest</option>
              <option value="-upvotes">Most Upvoted</option>
              <option value="-comments_count">Most Discussed</option>
            </select>
          )}

          {(activeTab === 'my-voice' || activeTab === 'board-letters') && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 text-sm rounded-xl border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire shadow-sm"
            >
              <option value="all">All Status</option>
              {activeTab === 'my-voice' ? (
                <>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IMPLEMENTED">Implemented</option>
                  <option value="REJECTED">Rejected</option>
                </>
              ) : (
                <>
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="RESPONDED">Responded</option>
                  <option value="CLOSED">Closed</option>
                </>
              )}
            </select>
          )}
        </div>

        {/* Content */}
        {activeTab === 'my-voice' && (
          <SuggestionsTab
            suggestions={suggestions}
            loading={loading}
            onVote={handleVote}
            onRemoveVote={handleRemoveVote}
            onToggleComments={toggleComments}
            showComments={showComments}
            comments={comments}
            commentText={commentText}
            setCommentText={setCommentText}
            onAddComment={handleAddComment}
            onSelectSuggestion={handleSelectSuggestion}
            canManage={canManageSuggestions()}
            StatusBadge={StatusBadge}
          />
        )}

        {activeTab === 'board-letters' && canViewBoardLetters() && (
          <BoardLettersTab
            letters={boardLetters}
            loading={loading}
            onSelectLetter={handleSelectLetter}
            canRespond={canRespondToLetters()}
            StatusBadge={StatusBadge}
          />
        )}

        {activeTab === 'my-letters' && (
          <MyLettersTab
            letters={myLetters}
            loading={loading}
            onSelectLetter={handleSelectLetter}
         
            StatusBadge={StatusBadge}
          />
        )}

        {/* Modals */}
        <MyVoiceModal
          show={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onSuccess={fetchSuggestions}
        />

        <BoardLetterModal
          show={showLetterModal}
          onClose={() => setShowLetterModal(false)}
          onSuccess={fetchMyLetters}
        />

        {/* Suggestion Detail Modal */}
        {selectedSuggestion && canManageSuggestions() && (
          <SuggestionDetailModal
            suggestion={selectedSuggestion}
            onClose={() => {
              setSelectedSuggestion(null);
              setResponseText('');
            }}
            onRespond={handleRespondToSuggestion}
            responseText={responseText}
            setResponseText={setResponseText}
            responding={responding}
            StatusBadge={StatusBadge}
          />
        )}

        {/* Board Letter Detail Modal */}
        {selectedLetter && activeTab === 'board-letters' && (
          <BoardLetterDetailModal
            letter={selectedLetter}
            onClose={() => {
              setSelectedLetter(null);
              setResponseText('');
            }}
            onRespond={handleRespondToLetter}
            onMarkAsRead={handleMarkLetterAsRead}
            onUpdateStatus={handleUpdateLetterStatus}
            responseText={responseText}
            setResponseText={setResponseText}
            responding={responding}
            canRespond={canRespondToLetters()}
            StatusBadge={StatusBadge}
          />
        )}

        {/* My Letter Detail Modal */}
        {selectedLetter && activeTab === 'my-letters' && (
          <MyLetterDetailModal
            letter={selectedLetter}
            onClose={() => setSelectedLetter(null)}
       
            StatusBadge={StatusBadge}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Components below...
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400',
    rose: 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/30 text-rose-700 dark:text-rose-400',
  };

  return (
    <div className={`rounded-xl p-4 border shadow-sm ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-4 w-4" />
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="text-xs">{label}</div>
    </div>
  );
};

const SuggestionsTab = ({ 
  suggestions, loading, onVote, onRemoveVote, onToggleComments,
  showComments, comments, commentText, setCommentText, onAddComment,
  onSelectSuggestion, canManage, StatusBadge 
}) => {
  if (loading) {
    return <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin text-almet-sapphire mx-auto" /></div>;
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-20">
        <Lightbulb className="h-12 w-12 text-almet-waterloo dark:text-almet-bali-hai mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-2">No suggestions found</h3>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {suggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onVote={onVote}
          onRemoveVote={onRemoveVote}
          onToggleComments={onToggleComments}
          showComments={showComments}
          comments={comments}
          commentText={commentText}
          setCommentText={setCommentText}
          onAddComment={onAddComment}
          onSelect={onSelectSuggestion}
          canManage={canManage}
          StatusBadge={StatusBadge}
        />
      ))}
    </div>
  );
};

const BoardLettersTab = ({ letters, loading, onSelectLetter, canRespond, StatusBadge }) => {
  if (loading) {
    return <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin text-almet-sapphire mx-auto" /></div>;
  }

  if (letters.length === 0) {
    return (
      <div className="text-center py-20">
        <Mail className="h-12 w-12 text-almet-waterloo dark:text-almet-bali-hai mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-2">No letters found</h3>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {letters.map((letter) => (
        <LetterCard
          key={letter.id}
          letter={letter}
          onSelect={onSelectLetter}
          canRespond={canRespond}
          StatusBadge={StatusBadge}
        />
      ))}
    </div>
  );
};

const MyLettersTab = ({ letters, loading, onSelectLetter, onCopy, StatusBadge }) => {
  if (loading) {
    return <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin text-almet-sapphire mx-auto" /></div>;
  }

  if (letters.length === 0) {
    return (
      <div className="text-center py-20">
        <Mail className="h-12 w-12 text-almet-waterloo dark:text-almet-bali-hai mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-2">No letters yet</h3>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {letters.map((letter) => (
        <MyLetterCard
          key={letter.id}
          letter={letter}
          onSelect={onSelectLetter}
          onCopy={onCopy}
          StatusBadge={StatusBadge}
        />
      ))}
    </div>
  );
};

// Detail Modal Components
const SuggestionDetailModal = ({ 
  suggestion, onClose, onRespond, responseText, setResponseText, responding, StatusBadge 
}) => {
  if (!suggestion) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-almet-mystic dark:border-almet-san-juan">
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Suggestion Details</h2>
              <p className="text-xs text-white/80">Review and respond</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-almet-waterloo dark:text-almet-bali-hai">
              <div className="flex items-center gap-2">
                {suggestion.is_anonymous ? <><UserX className="h-4 w-4" /><span>Anonymous</span></> : <><User className="h-4 w-4" /><span>{suggestion.author_name}</span></>}
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <StatusBadge status={suggestion.status} type="suggestion" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-almet-cloud-burst dark:text-white mb-2">{suggestion.title}</h3>
            <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai whitespace-pre-wrap">{suggestion.description}</p>
          </div>

          <div className="flex items-center gap-4 p-4 bg-almet-mystic/20 dark:bg-almet-san-juan/20 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="text-2xl font-bold">{suggestion.upvotes}</span>
              <span className="text-xs">Upvotes</span>
            </div>
            <div className="h-8 w-px bg-almet-mystic dark:bg-almet-san-juan"></div>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <span className="text-2xl font-bold">{suggestion.downvotes}</span>
              <span className="text-xs">Downvotes</span>
            </div>
            <div className="h-8 w-px bg-almet-mystic dark:bg-almet-san-juan"></div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span className="text-2xl font-bold">{suggestion.comments_count}</span>
              <span className="text-xs">Comments</span>
            </div>
          </div>

          {suggestion.admin_response && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Current Response</span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap">{suggestion.admin_response}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-almet-cloud-burst dark:text-white mb-2">Update Status</label>
            <select
              value={suggestion.status}
              onChange={(e) => onRespond(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IMPLEMENTED">Implemented</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-almet-cloud-burst dark:text-white mb-2">Admin Response</label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Provide feedback or explanation..."
              rows={6}
              className="w-full px-4 py-3 text-sm rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 focus:ring-almet-sapphire resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-3 text-sm font-medium rounded-lg bg-almet-mystic/30 dark:bg-almet-san-juan/30 hover:bg-almet-mystic/50 dark:hover:bg-almet-san-juan/50 text-almet-cloud-burst dark:text-white transition-all">
              Cancel
            </button>
            <button
              onClick={() => onRespond(suggestion.status)}
              disabled={responding}
              className="flex-1 px-4 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-mystic hover:to-almet-san-juan text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {responding ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Send Response</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BoardLetterDetailModal = ({ 
  letter, onClose, onRespond, onMarkAsRead, onUpdateStatus, responseText, setResponseText, responding, canRespond, StatusBadge 
}) => {
  if (!letter) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-almet-mystic dark:border-almet-san-juan">
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Board Letter</h2>
              <p className="text-xs text-white/80 font-mono">{letter.tracking_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-sm text-almet-waterloo dark:text-almet-bali-hai">
              <div className="flex items-center gap-2">
                {letter.is_anonymous ? <><UserX className="h-4 w-4" /><span>Anonymous</span></> : <><User className="h-4 w-4" /><span>{letter.author_name}</span></>}
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(letter.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <StatusBadge status={letter.status} type="letter" />
          </div>

          {!letter.read_by_board && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-900 dark:text-amber-200">Unread - Mark as read to continue</span>
              <button onClick={onMarkAsRead} className="ml-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all">
                Mark as Read
              </button>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-almet-cloud-burst dark:text-white mb-3">{letter.subject}</h3>
          </div>

          <div className="p-4 bg-almet-mystic/20 dark:bg-almet-san-juan/20 rounded-lg">
            <p className="text-sm text-almet-cloud-burst dark:text-white whitespace-pre-wrap">{letter.content}</p>
          </div>

          {letter.attachment && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
              <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-900 dark:text-blue-200 flex-1">Attachment available</span>
              <a href={letter.attachment} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-2">
                <Download className="h-3.5 w-3.5" />Download
              </a>
            </div>
          )}

          {letter.board_response && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Board Response</span>
                {letter.responded_at && <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">{new Date(letter.responded_at).toLocaleDateString()}</span>}
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap">{letter.board_response}</p>
            </div>
          )}

          {canRespond && letter.read_by_board && (
            <>
              <div>
                <label className="block text-sm font-semibold text-almet-cloud-burst dark:text-white mb-2">Update Status</label>
                <select
                  value={letter.status}
                  onChange={(e) => onUpdateStatus(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                >
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="RESPONDED">Responded</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-almet-cloud-burst dark:text-white mb-2">Board Response <span className="text-rose-500">*</span></label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response to the author ..."
                  rows={6}
                
                  className="w-full px-4 py-3 text-sm rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 focus:ring-almet-sapphire resize-none"
                />
                
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 px-4 py-3 text-sm font-medium rounded-lg bg-almet-mystic/30 dark:bg-almet-san-juan/30 hover:bg-almet-mystic/50 dark:hover:bg-almet-san-juan/50 text-almet-cloud-burst dark:text-white transition-all">
                  Cancel
                </button>
                <button
                  onClick={onRespond}
                  disabled={responding }
                  className="flex-1 px-4 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-mystic hover:to-almet-san-juan text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {responding ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Send Response</>}
                </button>
              </div>
            </>
          )}

          {!canRespond && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/10 rounded-lg border border-slate-200 dark:border-slate-800/30">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">You don't have permission to respond to letters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyLetterDetailModal = ({ letter, onClose, onCopy, StatusBadge }) => {

  if (!letter) return null;



  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-almet-mystic dark:border-almet-san-juan">
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">My Letter</h2>
          
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-sm text-almet-waterloo dark:text-almet-bali-hai">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Sent {new Date(letter.created_at).toLocaleDateString()}</span>
              </div>
              {letter.is_anonymous && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Anonymous</span>
                  </div>
                </>
              )}
            </div>
            <StatusBadge status={letter.status} type="letter" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-almet-cloud-burst dark:text-white mb-3">{letter.subject}</h3>
          </div>

          <div className="p-4 bg-almet-mystic/20 dark:bg-almet-san-juan/20 rounded-lg">
            <p className="text-sm text-almet-cloud-burst dark:text-white whitespace-pre-wrap">{letter.content}</p>
          </div>

          {letter.attachment && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
              <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-900 dark:text-blue-200 flex-1">Attachment included</span>
            </div>
          )}

          {letter.board_response ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Board Response</span>
                {letter.responded_at && <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">{new Date(letter.responded_at).toLocaleDateString()}</span>}
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap">{letter.board_response}</p>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-900 dark:text-amber-200">Your letter is being reviewed by the Board. You will be notified when there is a response.</p>
              </div>
            </div>
          )}

          <button onClick={onClose} className="w-full px-4 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-mystic hover:to-almet-san-juan text-white transition-all shadow-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};