import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users, Trash2, MessageSquare, Send, ChevronDown, ChevronUp, PenLine, Image as ImageIcon, Link, Calendar, X, Plus, FileText } from 'lucide-react';
import { turso } from '../../../../utils/tursoClient';
import { uploadImageToImgbb } from '../../../../utils/imgbbUpload';

interface FeedTabProps {
  posts: any[];
  userRole: string | null;
  userId: string | null;
  newPostTitle: string;
  setNewPostTitle: (t: string) => void;
  newPostContent: string;
  setNewPostContent: (c: string) => void;
  isPosting: boolean;
  handleCreatePost: (attachments?: any[], eventId?: string | null, resourceId?: string | null) => Promise<void> | void;
  handleJoinCommunity: () => void;
  handleDeletePost: (id: string) => void;
  activeCommentsPostId: string | null;
  handleToggleComments: (id: string) => void;
  postComments: Record<string, any[]>;
  commentInputs: Record<string, string>;
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSubmitComment: (id: string) => void;
  setActiveTab: (tab: any) => void;
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
  handleSubmitComment,
  setActiveTab
}: FeedTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [showResourceDropdown, setShowResourceDropdown] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  // Close modal when posting finishes successfully (content is cleared)
  useEffect(() => {
    if (!isPosting && newPostContent === '') {
      setIsModalOpen(false);
    }
  }, [isPosting, newPostContent]);

  useEffect(() => {
    turso.from('events').select().then((res: any) => {
       if (res.data) setEvents(res.data);
    });
    turso.from('notes').select().then((res: any) => {
       if (res.data) setNotes(res.data);
    });
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedPhoto(null);
      setSelectedEventId(null);
      setSelectedResourceId(null);
      setShowEventDropdown(false);
      setShowResourceDropdown(false);
    }
  }, [isModalOpen]);

  const onPublish = async () => {
    let attachments: any[] = [];
    if (selectedPhoto) {
      const imgName = `post-${userId}-${Date.now()}`;
      const result = await uploadImageToImgbb(selectedPhoto, imgName);
      if (result.success && result.url) {
        attachments.push({ url: result.url, name: selectedPhoto.name, size: selectedPhoto.size, type: 'image' });
      }
    }
    await handleCreatePost(attachments, selectedEventId, selectedResourceId);
  };

  return (
    <motion.div
      key="feed-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 md:space-y-5"
    >
      {/* ── Create Post Button ── */}
      {userRole ? (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-white font-outfit">Community Feed</h2>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-glow text-white text-[11px] font-bold font-poppins rounded-xl transition-all shadow-[0_0_14px_rgba(59,130,246,0.3)]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Post
          </motion.button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-[#090d16] p-8 text-center space-y-3 mb-4">
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

      {/* ── Create Post Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-[#0f172a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
               {/* Modal Header */}
               <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                 <h2 className="text-[15px] font-semibold text-white font-outfit flex items-center gap-2">
                   <PenLine className="w-4 h-4 text-primary-glow" />
                   Create Post
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-white">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               
               {/* Modal Body */}
               <div className="p-5 flex flex-col gap-4">
                 <div>
                   <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-poppins">Title (Optional)</label>
                   <input
                      type="text"
                      placeholder="e.g. Interesting finding..."
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-primary/50 rounded-xl px-4 py-3 text-[13px] font-semibold text-white placeholder-slate-500 outline-none font-poppins transition-colors"
                    />
                 </div>
                 <div>
                   <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-poppins">Post Details</label>
                   <textarea
                      placeholder="Share your thoughts, research findings, or ask for guidance..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={5}
                      className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-primary/50 rounded-xl px-4 py-3 text-[13px] text-slate-300 placeholder-slate-500 outline-none font-poppins resize-none leading-relaxed custom-scrollbar transition-colors"
                    />
                 </div>

                 {/* Previews */}
                 {(selectedPhoto || selectedEventId || selectedResourceId) && (
                   <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.04]">
                     {selectedPhoto && (
                       <div className="relative rounded-lg overflow-hidden border border-white/10 shrink-0 group">
                         <img src={URL.createObjectURL(selectedPhoto)} alt="preview" className="h-16 w-auto object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={() => setSelectedPhoto(null)} className="p-1 bg-black/60 hover:bg-rose-500/80 rounded-full text-white">
                             <X className="w-3 h-3" />
                           </button>
                         </div>
                       </div>
                     )}
                     {selectedEventId && (
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-primary-glow text-xs font-poppins">
                         <Calendar className="w-3.5 h-3.5" />
                         <span className="truncate max-w-[150px]">{events.find(e => e.id === selectedEventId)?.title || 'Linked Event'}</span>
                         <button onClick={() => setSelectedEventId(null)} className="hover:text-rose-400 ml-1"><X className="w-3.5 h-3.5" /></button>
                       </div>
                     )}
                     {selectedResourceId && (
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-poppins">
                         <Link className="w-3.5 h-3.5" />
                         <span className="truncate max-w-[150px]">{notes.find(n => n.id === selectedResourceId)?.title || 'Linked Resource'}</span>
                         <button onClick={() => setSelectedResourceId(null)} className="hover:text-rose-400 ml-1"><X className="w-3.5 h-3.5" /></button>
                       </div>
                     )}
                   </div>
                 )}
               </div>

               {/* Modal Footer */}
               <div className="px-5 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between relative">
                  <div className="flex items-center gap-1.5 relative">
                    <input type="file" accept="image/*" className="hidden" ref={photoInputRef} onChange={(e) => e.target.files && setSelectedPhoto(e.target.files[0])} />
                    
                    <button onClick={() => photoInputRef.current?.click()} className="p-2 text-slate-400 hover:text-primary-glow hover:bg-primary/10 rounded-xl transition-all flex items-center justify-center" title="Upload Image">
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    
                    <div className="relative">
                      <button onClick={() => { setShowResourceDropdown(!showResourceDropdown); setShowEventDropdown(false); }} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all flex items-center justify-center" title="Link Resource">
                        <Link className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {showResourceDropdown && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                            <div className="p-2 border-b border-white/10 text-[10px] font-semibold text-slate-400 uppercase">My Notes</div>
                            <div className="max-h-40 overflow-y-auto custom-scrollbar">
                              {notes.length === 0 ? <div className="p-3 text-xs text-slate-500 text-center">No notes found</div> : notes.map(n => (
                                <button key={n.id} onClick={() => { setSelectedResourceId(n.id); setShowResourceDropdown(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 truncate transition-colors">
                                  {n.title}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative">
                      <button onClick={() => { setShowEventDropdown(!showEventDropdown); setShowResourceDropdown(false); }} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all flex items-center justify-center" title="Link Event">
                        <Calendar className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {showEventDropdown && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                            <div className="p-2 border-b border-white/10 text-[10px] font-semibold text-slate-400 uppercase">Events</div>
                            <div className="max-h-40 overflow-y-auto custom-scrollbar">
                              {events.length === 0 ? <div className="p-3 text-xs text-slate-500 text-center">No events found</div> : events.map(e => (
                                <button key={e.id} onClick={() => { setSelectedEventId(e.id); setShowEventDropdown(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 truncate transition-colors">
                                  {e.title}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <motion.button
                    onClick={onPublish}
                    disabled={isPosting || !newPostContent.trim()}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-glow text-white text-[11px] font-bold font-poppins transition-all shadow-[0_0_14px_rgba(59,130,246,0.3)] disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    {isPosting ? 'Posting...' : 'Publish Post'}
                  </motion.button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

                  {/* Attachments rendering */}
                  {(() => {
                    let attachments: any[] = [];
                    try { 
                      if (post.attachments) {
                        attachments = typeof post.attachments === 'string' ? JSON.parse(post.attachments) : post.attachments;
                      } else if (post.media_urls) {
                        const parsed = typeof post.media_urls === 'string' ? JSON.parse(post.media_urls) : post.media_urls;
                        attachments = Array.isArray(parsed) ? parsed.map(url => ({ url, type: 'image' })) : [];
                      }
                    } catch (e) {}
                    
                    const images = attachments.filter(a => a.type === 'image');
                    const documents = attachments.filter(a => a.type === 'document');

                    return (
                      <div className="mt-3 flex flex-col gap-2">
                        {images.length > 0 && (
                          <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {images.map((img: any, idx: number) => (
                              <div key={idx} className="rounded-xl overflow-hidden border border-white/10 bg-slate-900/50 max-h-[350px] flex items-center justify-center group cursor-zoom-in" onClick={() => window.open(img.url, '_blank')}>
                                <img src={img.url} alt="attached" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                              </div>
                            ))}
                          </div>
                        )}
                        {documents.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {documents.map((doc: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5 text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-amber-200 font-poppins truncate">{doc.name || 'Document'}</p>
                                  {doc.size && <p className="text-[10px] text-amber-400/60 font-poppins uppercase tracking-wider mt-0.5">{(doc.size / 1024).toFixed(1)} KB</p>}
                                </div>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-colors shrink-0">
                                  View
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                        {(post.linked_event_id || post.linked_resource_id) && (
                          <div className="flex flex-col md:flex-row flex-wrap gap-2">
                            {post.linked_event_id && (() => {
                              const event = events.find(e => e.id === post.linked_event_id);
                              return (
                                <button
                                  onClick={() => setActiveTab('events')}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 rounded-xl text-primary-glow text-xs font-poppins self-start"
                                >
                                  {event?.image_url ? (
                                    <img src={event.image_url} alt="event logo" className="w-4 h-4 rounded object-cover" />
                                  ) : (
                                    <Calendar className="w-4 h-4" />
                                  )}
                                  <span className="font-semibold">{event?.title || 'Linked Event'}</span>
                                </button>
                              );
                            })()}
                            {post.linked_resource_id && (() => {
                              const note = notes.find(n => n.id === post.linked_resource_id);
                              return (
                                <button
                                  onClick={() => setActiveTab('resources')}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-poppins self-start"
                                >
                                  {note?.color ? (
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: note.color }} />
                                  ) : (
                                    <Link className="w-4 h-4" />
                                  )}
                                  <span className="font-semibold">{note?.title || 'Attached Resource'}</span>
                                </button>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })()}

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
