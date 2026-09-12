import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbClient } from '../lib/dbClient';
import { Comment } from '../types/schema';
import { X, Send, CornerDownRight, Trash2, ShieldAlert } from 'lucide-react';

interface CommentsProps {
  videoId: string;
  onClose: () => void;
}

export const Comments: React.FC<CommentsProps> = ({ videoId, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentBody, setNewCommentBody] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'top'>('newest');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await dbClient.getComments(videoId);
      
      // Perform Sorting
      let sorted = [...data];
      if (sortBy === 'newest') {
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        // Top comments: sorting by comment length (proxy for depth/detail) or replies count
        sorted.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
      }
      
      setComments(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId, sortBy]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please Sign In to write comments.');
    if (!newCommentBody.trim()) return;

    try {
      await dbClient.addComment(user.id, videoId, null, newCommentBody.trim());
      setNewCommentBody('');
      fetchComments();
      dbClient.logEvent(user.id, videoId, 'comment');
    } catch (err) {
      console.error(err);
      alert('Error posting comment.');
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!user) return alert('Please Sign In to reply.');
    if (!replyBody.trim()) return;

    try {
      await dbClient.addComment(user.id, videoId, parentId, replyBody.trim());
      setReplyBody('');
      setReplyToId(null);
      fetchComments();
      dbClient.logEvent(user.id, videoId, 'comment', { parent_id: parentId });
    } catch (err) {
      console.error(err);
      alert('Error posting reply.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await dbClient.deleteComment(commentId, user.id);
      fetchComments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment.');
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!user) return alert('Please Sign In to file a report.');
    const details = prompt('Enter a reason for reporting this comment (spam, harassment, inappropriate, other):');
    if (!details) return;
    try {
      await dbClient.submitReport(user.id, videoId, commentId, 'inappropriate', details);
      alert('Comment reported successfully.');
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to format timestamps relative to now
  const formatTimeAgo = (dateStr: string) => {
    const past = new Date(dateStr).getTime();
    const diffMs = Date.now() - past;
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 600);
    const days = Math.floor(hrs / 24);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  // Render single comment row (including recursive replies)
  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = user?.id === comment.user_id;
    const canDelete = isOwner || user?.is_admin;
    
    return (
      <div key={comment.id} className={`group ${isReply ? 'ml-8 mt-3 border-l-2 border-border-dark/60 pl-3.5' : 'border-b border-border-dark/30 py-4.5'}`}>
        <div className="flex items-start gap-2.5">
          <img
            src={comment.user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user_id}`}
            alt=""
            className="w-8 h-8 rounded-xl bg-bg-card border border-border-dark/50 p-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white leading-none">
                {comment.user?.display_name || comment.user?.username || 'User'}
              </span>
              <span className="text-[9px] text-text-muted">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            <p className="text-[11px] text-slate-200 mt-1 leading-relaxed whitespace-pre-wrap font-light">{comment.body}</p>
            
            {/* Comment footer controls */}
            <div className="flex items-center gap-3.5 mt-2 text-[10px] text-text-secondary">
              {!isReply && (
                <button
                  onClick={() => {
                    setReplyToId(replyToId === comment.id ? null : comment.id);
                    setReplyBody('');
                  }}
                  className="hover:text-accent-rose font-semibold transition-colors"
                >
                  Reply
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-text-muted hover:text-red-400 flex items-center gap-0.5 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              )}
              {!isOwner && (
                <button
                  onClick={() => handleReportComment(comment.id)}
                  className="text-text-muted hover:text-red-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Report comment"
                >
                  <CornerDownRight className="w-3 h-3 text-text-muted" />
                  <span>Report</span>
                </button>
              )}
            </div>

            {/* Inline reply edit box */}
            {replyToId === comment.id && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder={`Reply to @${comment.user?.username}...`}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-bg-card border border-border-dark text-[11px] text-white focus:outline-none focus:border-accent-rose"
                />
                <button
                  onClick={() => handlePostReply(comment.id)}
                  className="p-1.5 rounded-lg bg-accent-rose text-white hover:opacity-90"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recursive rendering of replies */}
        {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-bg-surface border-l border-border-dark shadow-2xl flex flex-col z-40 animate-slide-up">
      {/* Header */}
      <div className="p-4 border-b border-border-dark flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm">Comments</h3>
          {/* Sorting */}
          <div className="flex items-center gap-3 mt-1.5 text-[10px]">
            <button
              onClick={() => setSortBy('newest')}
              className={`font-semibold ${sortBy === 'newest' ? 'text-accent-rose' : 'text-text-muted hover:text-white'}`}
            >
              Newest
            </button>
            <span className="text-text-muted">|</span>
            <button
              onClick={() => setSortBy('top')}
              className={`font-semibold ${sortBy === 'top' ? 'text-accent-rose' : 'text-text-muted hover:text-white'}`}
            >
              Top Comments
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg bg-bg-card border border-border-dark hover:border-slate-500 text-text-secondary hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List content container */}
      <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
        {loading ? (
          <div className="py-12 text-center text-text-secondary text-xs">Loading comments...</div>
        ) : (
          comments.map(c => renderComment(c))
        )}
        {comments.length === 0 && !loading && (
          <div className="py-16 text-center text-text-secondary text-xs font-light">
            No comments yet. Be the first to express your thoughts!
          </div>
        )}
      </div>

      {/* Submit Input Bar (Sticky at Bottom) */}
      <form onSubmit={handlePostComment} className="p-4 border-t border-border-dark bg-bg-surface flex items-center gap-2">
        <input
          type="text"
          value={newCommentBody}
          onChange={(e) => setNewCommentBody(e.target.value)}
          placeholder={user ? "Add a comment..." : "Sign In to comment..."}
          disabled={!user}
          className="flex-1 px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white focus:outline-none focus:border-accent-rose placeholder-text-muted disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!user || !newCommentBody.trim()}
          className="p-2.5 rounded-xl bg-accent-rose text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
export default Comments;
