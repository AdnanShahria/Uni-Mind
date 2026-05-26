import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2, BookmarkPlus, MoreHorizontal, Send, Camera, X, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { ShareModal } from './ShareModal';

interface PostCardProps {
  post: any;
  index: number;
  currentUser?: any;
}

export const PostCard = ({ post, index, currentUser }: PostCardProps) => {
  const authorName = post.users?.name || 'Unknown Scholar';
  const authorRole = post.users?.role || 'Researcher';
  const initial = authorName[0] || 'U';

  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [sharesCount, setSharesCount] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [commentPhoto, setCommentPhoto] = useState<File | null>(null);
  const [commentPhotoPreview, setCommentPhotoPreview] = useState<string | null>(null);
  const commentPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInteractions();
  }, [post.id, currentUser]);

  const fetchInteractions = async () => {
    // Fetch likes
    const { count: likes } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
    setLikesCount(likes || 0);
    
    if (currentUser) {
      const { data: userLike } = await supabase.from('post_likes').select('*').eq('post_id', post.id).eq('user_id', currentUser.id).maybeSingle();
      setIsLiked(!!userLike);

      const { data: profile } = await supabase.from('users').select('avatar_url').eq('id', currentUser.id).maybeSingle();
      if (profile) {
        setCurrentUserAvatar(profile.avatar_url);
      }
    }

    // Fetch comments
    const { data: commentsData } = await supabase.from('post_comments').select('*, users(name, avatar_url)').eq('post_id', post.id).order('created_at', { ascending: true });
    setComments(commentsData || []);

    // Fetch shares
    const { count: shares } = await supabase.from('post_shares').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
    setSharesCount(shares || 0);
  };

  const handleLike = async () => {
    if (!currentUser) return;
    
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', currentUser.id);
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      await supabase.from('post_likes').insert([{ post_id: post.id, user_id: currentUser.id }]);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentPhoto(file);
      setCommentPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleComment = async () => {
    if (!currentUser) return;
    if (!newComment.trim() && !commentPhoto) return;

    let imageUrl = null;

    if (commentPhoto) {
      try {
        const fileExt = commentPhoto.name.split('.').pop();
        const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
        const filePath = `comments/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, commentPhoto);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          imageUrl = publicUrl;
        } else {
          // Fallback to base64
          imageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(commentPhoto);
          });
        }
      } catch (err) {
        console.error("Error uploading comment photo:", err);
      }
    }

    const { data, error } = await supabase.from('post_comments').insert([
      { 
        post_id: post.id, 
        author_id: currentUser.id, 
        content: newComment.trim() || null,
        image_url: imageUrl
      }
    ]).select('*, users(name, avatar_url)').single();
    
    if (!error && data) {
      setComments([...comments, data]);
      setNewComment('');
      setCommentPhoto(null);
      setCommentPhotoPreview(null);
    } else {
      console.error("Error submitting comment:", error);
    }
  };

  const handleShareClick = () => {
    if (!currentUser) return;
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = async (content: string) => {
    // 1. Add to post_shares for the counter
    const { error } = await supabase.from('post_shares').insert([{ post_id: post.id, user_id: currentUser.id }]);
    
    if (!error) {
      setSharesCount(prev => prev + 1);

      // 2. Actually share to the feed by creating a new post
      const shareContent = content.trim() 
        ? `Shared a post: "${post.content?.substring(0, 50)}..."\n\nThoughts: ${content.trim()}`
        : `Shared a post: "${post.content?.substring(0, 100)}..."`;

      const { error: postError } = await supabase.from('posts').insert([{
        author_id: currentUser.id,
        title: `Shared: ${post.title || 'A post from ' + (post.users?.name || 'Unknown Scholar')}`,
        content: shareContent,
        type: 'share'
      }]);

      if (!postError) {
        alert('Post successfully shared to your feed!');
        // Refresh to show the new post in the feed
        window.location.reload(); 
      } else {
        alert('Error sharing to feed.');
      }
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes || 1}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + (index * 0.05), duration: 0.4 }}
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
        post.type === 'announcement'
          ? 'border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.08)] bg-gradient-to-b from-[#0f172a]/80 via-[#0f172a]/60 to-[#0f172a]/40'
          : ''
      }`}
    >
      <div className="p-5">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to={`/app/profile/${post.author_id}`} className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity">
              {post.users?.avatar_url ? (
                <img src={post.users.avatar_url} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold font-poppins">
                  {initial}
                </div>
              )}
            </Link>
            <div>
              <Link to={`/app/profile/${post.author_id}`}>
                <p className="text-sm font-semibold text-white font-poppins hover:underline">{authorName}</p>
              </Link>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-[11px] text-slate-500 font-poppins">{authorRole} · {timeAgo(post.created_at)}</p>
                {post.type === 'announcement' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold font-poppins uppercase tracking-wider animate-pulse leading-none">
                    📢 Announcement
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all duration-200 border border-transparent hover:bg-white/[0.05] hover:border-white/[0.08]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Post Content */}
        {post.title && (
          <h3 className="text-sm font-bold text-white font-outfit mb-2">
            {post.title}
          </h3>
        )}
        <p className="text-[13px] text-slate-200 font-poppins leading-relaxed mb-3">
          {post.content}
        </p>

        {/* Post Media Attachments */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-4">
            {post.type === 'image' && (
              <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-lg group max-h-[450px] bg-slate-950 flex items-center justify-center">
                <img 
                  src={post.media_urls[0]} 
                  alt="Academic attachment" 
                  className="max-w-full max-h-[450px] object-contain group-hover:scale-[1.01] transition-transform duration-300 cursor-zoom-in" 
                  onClick={() => window.open(post.media_urls[0], '_blank')}
                />
              </div>
            )}
            {post.type === 'document' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center font-poppins">
                    <FileText className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-200 font-poppins">Academic Attachment</p>
                    <p className="text-[10px] text-amber-400/60 font-poppins uppercase tracking-wider mt-0.5">Scholar Note / Resource Document</p>
                  </div>
                </div>
                <a 
                  href={post.media_urls[0]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-colors font-poppins shrink-0"
                >
                  View Document
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] text-primary-glow bg-primary/10 px-2.5 py-1 rounded-lg font-medium font-poppins hover:bg-primary/20 cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-1">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-poppins group ${isLiked ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'}`}
            >
              <Heart className={`w-4 h-4 group-hover:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-all text-xs font-poppins"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length}</span>
            </button>
            <button 
              onClick={handleShareClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all text-xs font-poppins"
            >
              <Share2 className="w-4 h-4" />
              <span>{sharesCount}</span>
            </button>
          </div>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 transition-all duration-200 border border-transparent hover:bg-amber-500/[0.08] hover:text-amber-400 hover:border-amber-500/[0.15]">
            <BookmarkPlus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 pt-4 border-t border-white/[0.04]"
            >
              <div className="space-y-4 mb-4">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                      {comment.users?.avatar_url ? (
                        <img src={comment.users.avatar_url} alt={comment.users?.name || 'U'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold font-poppins">
                          {comment.users?.name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-white font-poppins">{comment.users?.name || 'Unknown Scholar'}</span>
                        <span className="text-[10px] text-slate-500 font-poppins">{timeAgo(comment.created_at)}</span>
                      </div>
                      {comment.content && (
                        <p className="text-[13px] text-slate-300 font-poppins leading-relaxed">{comment.content}</p>
                      )}
                      {comment.image_url && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-white/[0.06] max-w-sm">
                          <img src={comment.image_url} alt="Attached media" className="w-full h-auto object-cover max-h-60" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {currentUser && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center mt-1">
                    {currentUserAvatar ? (
                      <img src={currentUserAvatar} alt="Me" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold font-poppins">
                        {currentUser.user_metadata?.name?.[0] || currentUser.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/[0.06] rounded-xl p-2 focus-within:border-primary/50 transition-colors">
                    {commentPhotoPreview && (
                      <div className="relative inline-block self-start mb-2 group">
                        <img src={commentPhotoPreview} alt="upload preview" className="h-16 w-auto rounded-lg border border-white/10" />
                        <button 
                          type="button"
                          onClick={() => {
                            setCommentPhoto(null);
                            setCommentPhotoPreview(null);
                          }}
                          className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleComment();
                          }
                        }}
                        placeholder="Add a scholarly comment..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-300 font-poppins placeholder-slate-500"
                      />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={commentPhotoInputRef} 
                        onChange={handlePhotoSelect} 
                      />
                      <button 
                        type="button"
                        onClick={() => commentPhotoInputRef.current?.click()}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-white/[0.04]"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={handleComment}
                        disabled={!newComment.trim() && !commentPhoto}
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors disabled:opacity-50 disabled:hover:text-slate-400 rounded-lg hover:bg-white/[0.04]"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        post={post} 
        currentUser={currentUser} 
        onShareContent={handleShareSubmit} 
      />
    </motion.div>
  );
};
