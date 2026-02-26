// src/components/suggestions/SuggestionCards.jsx

import React from 'react';
import { 
  ThumbsUp, ThumbsDown, MessageSquare, Eye, User, UserX,
  Send, Calendar, Lightbulb, Shield, Mail, Copy, Check
} from 'lucide-react';

// Suggestion Card with Voting
export const SuggestionCard = ({
  suggestion,
  onVote,
  onRemoveVote,
  onToggleComments,
  showComments,
  comments,
  commentText,
  setCommentText,
  onAddComment,
  onSelect,
  canManage,
  StatusBadge
}) => {
  const hasVoted = suggestion.user_vote_type !== null;
  const userVoteType = suggestion.user_vote_type;

  return (
    <div className="bg-white dark:bg-almet-san-juan/20 rounded-xl border border-almet-mystic dark:border-almet-san-juan p-5 hover:border-almet-sapphire dark:hover:border-almet-steel-blue hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 bg-almet-sapphire/10 dark:bg-almet-steel-blue/20 rounded-lg">
              <Lightbulb className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-1">
                {suggestion.title}
              </h3>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai line-clamp-2">
                {suggestion.description}
              </p>
            </div>
          </div>
        </div>
        <StatusBadge status={suggestion.status} type="suggestion" />
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
        <div className="flex items-center gap-1.5">
          {suggestion.is_anonymous ? (
            <>
              <UserX className="h-3.5 w-3.5" />
              <span>Anonymous</span>
            </>
          ) : (
            <>
              <User className="h-3.5 w-3.5" />
              <span>{suggestion.author_name}</span>
            </>
          )}
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          <span>{suggestion.views_count}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-almet-mystic dark:border-almet-san-juan">
        {/* Upvote */}
        <button
          onClick={() => {
            if (userVoteType === 'UP') {
              onRemoveVote(suggestion.id);
            } else {
              onVote(suggestion.id, 'UP');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            userVoteType === 'UP'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
              : 'bg-almet-mystic/30 dark:bg-almet-san-juan/30 text-almet-waterloo dark:text-almet-bali-hai hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{suggestion.upvotes}</span>
        </button>

        {/* Downvote */}
        <button
          onClick={() => {
            if (userVoteType === 'DOWN') {
              onRemoveVote(suggestion.id);
            } else {
              onVote(suggestion.id, 'DOWN');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            userVoteType === 'DOWN'
              ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30'
              : 'bg-almet-mystic/30 dark:bg-almet-san-juan/30 text-almet-waterloo dark:text-almet-bali-hai hover:bg-rose-50 dark:hover:bg-rose-900/20'
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          <span>{suggestion.downvotes}</span>
        </button>

        {/* Comments */}
        <button
          onClick={() => onToggleComments(suggestion.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-almet-mystic/30 dark:bg-almet-san-juan/30 text-almet-waterloo dark:text-almet-bali-hai hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{suggestion.comments_count}</span>
        </button>

        {/* Admin View Details */}
        {canManage && (
          <button
            onClick={() => onSelect(suggestion)}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-almet-sapphire/10 text-almet-sapphire hover:bg-almet-sapphire/20 transition-all"
          >
            Manage
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments[suggestion.id] && (
        <div className="mt-4 pt-4 border-t border-almet-mystic dark:border-almet-san-juan space-y-3">
          {/* Comment List */}
          {Array.isArray(comments[suggestion.id]) && comments[suggestion.id].length > 0 ? (
            comments[suggestion.id].map((comment) => (
              <div key={comment.id} className="bg-almet-mystic/20 dark:bg-almet-san-juan/20 rounded-lg p-3">
                <div className="flex items-start gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center text-xs font-bold text-white">
                    {comment.author?.full_name?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">
                        {comment.author?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-center text-almet-waterloo dark:text-almet-bali-hai py-4">
              No comments yet. Be the first to comment!
            </p>
          )}

          {/* Add Comment */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-almet-mystic dark:border-almet-san-juan bg-white dark:bg-almet-san-juan/20 text-almet-cloud-burst dark:text-white placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
            />
            <button
              onClick={() => onAddComment(suggestion.id)}
              className="px-3 py-2 rounded-lg bg-almet-sapphire text-white hover:bg-almet-mystic transition-all"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Response */}
      {suggestion.admin_response && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              Admin Response
            </span>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            {suggestion.admin_response}
          </p>
        </div>
      )}
    </div>
  );
};

// Board Letter Card (Admin View)
export const LetterCard = ({ letter, onSelect, StatusBadge }) => {
  return (
    <div
      onClick={() => onSelect(letter)}
      className={`bg-white dark:bg-almet-san-juan/20 rounded-xl border p-5 hover:border-almet-sapphire dark:hover:border-almet-steel-blue hover:shadow-lg transition-all cursor-pointer ${
        !letter.read_by_board 
          ? 'border-almet-sapphire dark:border-almet-steel-blue shadow-md' 
          : 'border-almet-mystic dark:border-almet-san-juan'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            {!letter.read_by_board && (
              <span className="w-2 h-2 bg-almet-sapphire rounded-full animate-pulse"></span>
            )}
            <div className="p-2 bg-almet-mystic/50 dark:bg-almet-san-juan/30 rounded-lg">
              <Shield className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white truncate">
              {letter.subject}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-almet-waterloo dark:text-almet-bali-hai ml-2">
            <code className="font-mono bg-almet-mystic/50 dark:bg-almet-cloud-burst/30 px-2 py-0.5 rounded">
              {letter.tracking_number}
            </code>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              {letter.is_anonymous ? (
                <>
                  <UserX className="h-3.5 w-3.5" />
                  <span>Anonymous</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  <span>{letter.author_name}</span>
                </>
              )}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(letter.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={letter.status} type="letter" />
      </div>

      {letter.has_response && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="font-medium">Response sent</span>
        </div>
      )}
    </div>
  );
};

// My Letter Card (User View)
export const MyLetterCard = ({ letter, onSelect, StatusBadge }) => {



  return (
    <div
      onClick={() => onSelect(letter)}
      className="bg-white dark:bg-almet-san-juan/20 rounded-xl border border-almet-mystic dark:border-almet-san-juan p-5 hover:border-almet-sapphire dark:hover:border-almet-steel-blue hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 bg-almet-sapphire/10 dark:bg-almet-steel-blue/20 rounded-lg">
              <Mail className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
           
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-1 truncate">
                {letter.subject}
              </h3>
            
          
          </div>
        </div>
        <StatusBadge status={letter.status} type="letter" />
      </div>

      {letter.board_response && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              Board Response
            </p>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 line-clamp-2">
            {letter.board_response}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-almet-waterloo dark:text-almet-bali-hai">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Sent {new Date(letter.created_at).toLocaleDateString()}</span>
        </div>
        {letter.responded_at && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Responded {new Date(letter.responded_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};