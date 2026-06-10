import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Users, Trash2, MessageSquare, Send } from 'lucide-react';

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 md:space-y-6"
    >
      {/* Create Community Post Form */}
      {userRole ? (
        <div className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16]/80 backdrop-blur-xl space-y-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
              <span className="text-primary font-bold text-sm">Me</span>
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                placeholder="Post Title (Optional)..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full bg-transparent border-none text-[13px] md:text-[14px] text-white placeholder-slate-500 outline-none font-poppins font-semibold"
              />
            </div>
          </div>
          
          <div className="pl-[52px]">
            <textarea
              placeholder="What's on your mind? Share articles, research findings, or ask for guidance..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
              className="w-full bg-black/20 border border-white/[0.05] rounded-xl p-3 text-[13px] text-slate-300 outline-none focus:border-primary/30 transition-all font-poppins resize-none"
            />
            <div className="flex items-center justify-end mt-3">
              <button
                onClick={handleCreatePost}
                disabled={isPosting || !newPostContent.trim()}
                className="flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-primary hover:bg-primary-glow text-white text-[11px] md:text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
              >
                {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Publish
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl glass-card p-6 border border-white/[0.06] bg-[#090d16] text-center space-y-3">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-slate-400 text-sm font-poppins">You must be a member of this community to create posts.</p>
          <button
            onClick={handleJoinCommunity}
            className="px-4 py-2 bg-primary hover:bg-primary-glow text-white rounded-xl text-xs font-semibold font-poppins transition-all"
          >
            Join Community Now
          </button>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl glass-card p-8 md:p-12 border border-white/[0.06] bg-[#090d16] text-center text-slate-500 font-poppins text-sm">
            No posts published yet. Be the first to start the conversation!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16] relative overflow-hidden">
              {/* Left accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent" />

              {/* Author info & Header */}
              <div className="flex items-start justify-between pl-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase overflow-hidden shrink-0">
                    {post.author_avatar ? (
                      <img src={post.author_avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      (post.author_name || 'Scholar').substring(0, 2)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12.5px] font-semibold text-slate-200 font-poppins">{post.author_name || 'Scholar'}</span>
                      <span className="text-[9px] text-slate-500 font-poppins shrink-0">• {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-poppins truncate">Researcher · UniMind Scholar</p>
                  </div>
                </div>

                {(userId === post.author_id || userRole === 'owner' || userRole === 'moderator') && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Title & Content */}
              <div className="space-y-1.5 mt-3 pl-2">
                {post.title && (
                  <h4 className="text-[14px] font-bold text-white font-poppins leading-tight">{post.title}</h4>
                )}
                <p className="text-[12px] md:text-[13px] text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Liking / Comments counts footer */}
              <div className="flex items-center gap-4 pt-3 mt-3 border-t border-white/[0.04] pl-2">
                <button
                  onClick={() => handleToggleComments(post.id)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-[11px] md:text-xs font-semibold font-poppins transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {activeCommentsPostId === post.id ? 'Hide Replies' : 'Show Replies'}
                  {postComments[post.id] && postComments[post.id].length > 0 && (
                    <span className="bg-white/10 px-1.5 rounded-md ml-1">{postComments[post.id].length}</span>
                  )}
                </button>
              </div>

              {/* Inline Comments Section */}
              <AnimatePresence>
                {activeCommentsPostId === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-3 space-y-3 pl-2"
                  >
                    {/* Comments List */}
                    <div className="space-y-2.5 bg-black/15 p-3 rounded-xl border border-white/[0.04] max-h-60 overflow-y-auto scrollbar-thin">
                      {!postComments[post.id] || postComments[post.id].length === 0 ? (
                        <p className="text-[11px] text-slate-500 font-poppins py-1 text-center">No comments on this post yet. Share your thoughts!</p>
                      ) : (
                        postComments[post.id].map((comment) => (
                          <div key={comment.id} className="flex gap-2.5 py-1">
                            <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[9px] text-white uppercase shrink-0 overflow-hidden">
                              {comment.author_avatar ? (
                                <img src={comment.author_avatar} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                (comment.author_name || 'Scholar').substring(0, 2)
                              )}
                            </div>
                            <div className="flex-1 bg-white/[0.02] border border-white/[0.03] rounded-lg px-2.5 py-1.5 md:rounded-xl md:px-3 md:py-2">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <span className="text-[11px] font-semibold text-slate-300 font-poppins">{comment.author_name || 'Scholar'}</span>
                                <span className="text-[8.5px] md:text-[9px] text-slate-500 font-poppins">{new Date(comment.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[11px] md:text-[12px] text-slate-300 font-poppins mt-0.5 leading-relaxed break-words">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment Input Form */}
                    {userRole ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a supportive reply..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                          className="flex-1 bg-black/25 border border-white/[0.08] rounded-full md:rounded-xl px-3.5 py-2 text-[12px] text-slate-200 outline-none focus:border-primary/30 transition-all font-poppins"
                        />
                        <button
                          onClick={() => handleSubmitComment(post.id)}
                          className="px-3 bg-primary/20 hover:bg-primary/30 text-primary-glow border border-primary/20 rounded-full md:rounded-xl transition-all flex items-center justify-center shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
