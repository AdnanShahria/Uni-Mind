import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users, Trash2, MessageSquare, Send, ChevronDown, ChevronUp, PenLine } from 'lucide-react';

interface FeedTabProps {
  posts: any[];
  userRole: string | null;
  userId: string | null;
  newPostTitle: string;
  setNewPostTitle: (t: string) => void;
  newPostContent: string;
  setNewPostContent: (c: string) => void;
  isPosting: boolean;
  handleCreatePost: () => void;
  handleJoinCommunity: () => void;
  handleDeletePost: (id: string) => void;
  activeCommentsPostId: string | null;
  handleToggleComments: (id: string) => void;
  postComments: Record<string, any[]>;
  commentInputs: Record<string, string>;
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSubmitComment: (id: string) => void;
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

const Avatar = ({ url, name, size = 'md' }: { url?: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[9px]' : size === 'lg' ? 'w-11 h-11 text-sm' : 'w-9 h-9 text-xs';
  return (
    <div className={`${sizeClass} rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center font-bold text-white uppercase overflow-hidden shrink-0 border border-white/[0.07]`}>
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : name.substring(0, 2)}
    </div>
  );
};

export const FeedTab = ({
  posts,
  userRole,
  userId,
  newPostTitle,
  setNewPostTitle,
  newPostContent,
  setNewPostContent,
  isPosting,
  handleCreatePost,
  handleJoinCommunity,
  handleDeletePost,
  activeCommentsPostId,
  handleToggleComments,
  postComments,
  commentInputs,
  setCommentInputs,
  handleSubmitComment
}: FeedTabProps) => {

  return (
    <motion.div
      key="feed-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 md:space-y-5"
    >
      {/* ── Create Post Composer ── */}
      {userRole ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#090d16]/90 backdrop-blur-xl p-4 md:p-5 shadow-xl space-y-3">
          {/* Composer Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <PenLine className="w-4 h-4 text-primary-glow" />
            </div>
            <input
              type="text"
              placeholder="Post title (optional)..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 outline-none font-poppins font-semibold"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.04]" />

          {/* Textarea */}
          <textarea
            placeholder="Share your thoughts, research findings, or ask for guidance..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
            className="w-full bg-black/20 border border-white/[0.05] focus:border-primary/25 rounded-xl p-3.5 text-[13px] text-slate-300 placeholder-slate-500 outline-none transition-all font-poppins resize-none leading-relaxed"
          />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-poppins">
              {newPostContent.length > 0 ? `${newPostContent.length} chars` : 'Markdown supported'}
            </span>
            <motion.button
              onClick={handleCreatePost}
              disabled={isPosting || !newPostContent.trim()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-glow text-white text-xs font-bold font-poppins transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)] disabled:opacity-40 disabled:pointer-events-none"
            >
              {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {isPosting ? 'Publishing...' : '✦ Publish'}
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-[#090d16] p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/[0.06] flex items-center justify-center mx-auto">
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm font-poppins">Join to post and participate in discussions.</p>
          <button
            onClick={handleJoinCommunity}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-glow text-white rounded-xl text-xs font-bold font-poppins transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            Join Community
          </button>
        </div>
      )}

      {/* ── Posts Feed ── */}
      <div className="space-y-3 md:space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#090d16] p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-white/[0.05] flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-500 font-poppins text-sm">No posts yet. Be the first to spark a conversation!</p>
          </div>
        ) : (
          posts.map((post, i) => {
            const isCommentsOpen = activeCommentsPostId === post.id;
            const comments = postComments[post.id] || [];
            const canDelete = userId === post.author_id || userRole === 'owner' || userRole === 'moderator';

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group rounded-2xl border border-white/[0.06] hover:border-white/[0.10] bg-[#090d16]/95 backdrop-blur-xl overflow-hidden transition-all shadow-md hover:shadow-xl"
              >
                {/* Post Body */}
                <div className="p-4 md:p-5">
                  {/* Author row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar url={post.author_avatar} name={post.author_name || 'Scholar'} size="md" />
                      <div>
                        <p className="text-[13px] font-semibold text-slate-200 font-poppins leading-none">{post.author_name || 'Scholar'}</p>
                        <p className="text-[10px] text-slate-500 font-poppins mt-0.5">{timeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title + Content */}
                  <div className="mt-3.5 space-y-1.5">
                    {post.title && (
                      <h4 className="text-[14px] md:text-[15px] font-bold text-white font-poppins leading-snug">{post.title}</h4>
                    )}
                    <p className="text-[12.5px] md:text-[13px] text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-3.5 border-t border-white/[0.04]">
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold font-poppins transition-colors ${isCommentsOpen ? 'text-primary-glow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {isCommentsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'Reply' : 'Replies'}` : 'Reply'}
                    </button>
                  </div>
                </div>

                {/* ── Inline Comments Section ── */}
                <AnimatePresence>
                  {isCommentsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden border-t border-white/[0.04]"
                    >
                      <div className="px-4 md:px-5 py-4 space-y-3 bg-black/20">
                        {/* Comments list */}
                        {comments.length === 0 ? (
                          <p className="text-[11px] text-slate-500 font-poppins text-center py-2">No replies yet. Start the conversation!</p>
                        ) : (
                          <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                            {comments.map((comment) => (
                              <div key={comment.id} className="flex gap-2.5">
                                <Avatar url={comment.author_avatar} name={comment.author_name || 'Scholar'} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2">
                                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                      <span className="text-[11px] font-semibold text-slate-300 font-poppins">{comment.author_name || 'Scholar'}</span>
                                      <span className="text-[9px] text-slate-600 font-poppins">{timeAgo(comment.created_at)}</span>
                                    </div>
                                    <p className="text-[12px] text-slate-300 font-poppins leading-relaxed break-words">{comment.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
                        {userRole && (
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                              className="flex-1 bg-black/30 border border-white/[0.08] focus:border-primary/30 rounded-xl px-3.5 py-2.5 text-[12px] text-slate-200 placeholder-slate-600 outline-none transition-all font-poppins"
                            />
                            <button
                              onClick={() => handleSubmitComment(post.id)}
                              className="px-3.5 bg-primary/20 hover:bg-primary/30 text-primary-glow border border-primary/25 rounded-xl transition-all flex items-center justify-center shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
