import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Image as ImageIcon, FileText, Sparkles, Hash } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { turso } from '../../utils/tursoClient';
import { uploadImageToImgbb, fileToBase64 } from '../../utils/imgbbUpload';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onPostCreated: () => void;
  initialPhoto?: File | null;
  initialNote?: File | null;
  initialAIAssist?: boolean;
}

export const CreatePostModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  onPostCreated,
  initialPhoto = null,
  initialNote = null,
  initialAIAssist = false
}: CreatePostModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isAIAssistActive, setIsAIAssistActive] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedNote, setSelectedNote] = useState<File | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setSelectedPhoto(initialPhoto || null);
      setSelectedNote(initialNote || null);
      setIsAIAssistActive(!!initialAIAssist);
      setIsAnnouncement(false);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
      setSelectedPhoto(null);
      setSelectedNote(null);
      setIsAIAssistActive(false);
      setIsAnnouncement(false);
      setAiPrompt('');
    }
  }, [isOpen, initialPhoto, initialNote, initialAIAssist]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handlePost = async () => {
    if (!content.trim() || !currentUser) return;
    
    setIsPosting(true);
    const mediaUrls: string[] = [];
    let postType = 'text';

    if (isAnnouncement) {
      postType = 'announcement';
    } else if (selectedPhoto) {
      postType = 'image';
      try {
        const imgName = `post-${currentUser.id}-${Date.now()}`;
        const result = await uploadImageToImgbb(selectedPhoto, imgName);
        if (result.success && result.url) {
          mediaUrls.push(result.url);
        } else {
          console.warn("IMGBB upload failed, using base64 fallback:", result.error);
          const base64 = await fileToBase64(selectedPhoto);
          mediaUrls.push(base64);
        }
      } catch (err) {
        console.error("Error uploading photo:", err);
      }
    }

    if (selectedNote && !isAnnouncement) {
      postType = 'document';
      try {
        // Documents (PDFs, docs) are stored as base64 in Turso
        const base64 = await fileToBase64(selectedNote);
        mediaUrls.push(base64);
      } catch (err) {
        console.error("Error processing note document:", err);
      }
    }

    const { error } = await turso.from('posts').insert([
      {
        author_id: currentUser.id,
        title: title.trim() || null,
        content: content.trim(),
        type: postType,
        tags: tags.map(t => `#${t}`), // Format tags nicely
        media_urls: mediaUrls,
      }
    ]);

    setIsPosting(false);
    if (!error) {
      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
      setSelectedPhoto(null);
      setSelectedNote(null);
      setIsAIAssistActive(false);
      onPostCreated();
      onClose();
    } else {
      console.error("Error creating post:", error);
      toast.error("Error creating post: " + (error?.message || JSON.stringify(error)));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-2xl bg-[#0f172a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white font-outfit">Create Academic Post</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
            {/* User Info Row */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold font-poppins shadow-lg overflow-hidden">
                {currentUser?.user_metadata?.avatar_url ? (
                  <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.user_metadata?.name?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 font-poppins">{currentUser?.user_metadata?.name || 'Scholar'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary-glow text-[10px] font-semibold font-poppins tracking-wide">
                    {currentUser?.user_metadata?.role || 'Academic'}
                  </span>
                </div>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Post Title</label>
              <input
                type="text"
                placeholder="e.g. A New Approach to Quantum Mechanics..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-semibold text-white font-outfit placeholder-slate-500 focus:border-primary/50 outline-none transition-colors"
              />
            </div>

            {/* Description/Main Post */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Description</label>
              <textarea
                placeholder={isAIAssistActive ? "AI is ready to draft..." : "What are you researching or thinking about?"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[150px] bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-300 font-poppins placeholder-slate-600 resize-none focus:border-primary/50 outline-none transition-colors"
              />
            </div>

            {/* AI Assist Box */}
            <AnimatePresence>
              {isAIAssistActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 bg-purple-500/[0.04] border border-purple-500/20 rounded-xl p-3 mt-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Tell AI what to write about..."
                      className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 font-poppins placeholder-slate-500"
                    />
                    <button 
                      onClick={() => {
                        if(aiPrompt.trim()) setContent("AI Draft: " + aiPrompt);
                        setIsAIAssistActive(false);
                        setAiPrompt('');
                      }}
                      className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Generate
                    </button>
                    <button onClick={() => setIsAIAssistActive(false)} className="p-1 hover:bg-white/10 rounded-md">
                      <X className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hashtags / Metadata Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Hashtags</label>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 focus-within:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-400 font-poppins font-medium">Add Hashtags (Press Enter)</span>
                </div>
              <div className="flex flex-wrap gap-2 items-center">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg text-xs font-poppins">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-emerald-300 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "e.g. MachineLearning, Research" : "Add more..."}
                  className="bg-transparent border-none outline-none text-xs text-slate-300 font-poppins placeholder-slate-600 min-w-[120px]"
                />
              </div>
            </div>
          </div>

            {/* Attachment Previews */}
            <AnimatePresence>
              {(selectedPhoto || selectedNote) && (
                <div className="flex flex-wrap gap-4 pt-2">
                  {selectedPhoto && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="relative rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-lg group"
                    >
                      <img src={URL.createObjectURL(selectedPhoto)} alt="preview" className="h-24 w-auto object-cover max-w-[200px]" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <button onClick={() => setSelectedPhoto(null)} className="p-2 bg-black/60 hover:bg-rose-500/80 rounded-full text-white transition-colors shadow-xl">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                  {selectedNote && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-[250px]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-200 font-poppins truncate">{selectedNote.name}</p>
                        <p className="text-[10px] text-amber-400/60 font-poppins uppercase tracking-wider mt-0.5">{(selectedNote.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button onClick={() => setSelectedNote(null)} className="p-1.5 hover:bg-amber-500/20 rounded-md transition-colors shrink-0">
                        <X className="w-4 h-4 text-amber-400" />
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" className="hidden" ref={photoInputRef} onChange={(e) => e.target.files && setSelectedPhoto(e.target.files[0])} />
              <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" ref={noteInputRef} onChange={(e) => e.target.files && setSelectedNote(e.target.files[0])} />

              <button 
                onClick={() => photoInputRef.current?.click()}
                className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-emerald-400 transition-colors tooltip-trigger relative group"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Add Image</span>
              </button>
              <button 
                onClick={() => noteInputRef.current?.click()}
                className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-amber-400 transition-colors tooltip-trigger relative group"
              >
                <FileText className="w-5 h-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Attach Document</span>
              </button>
              <div className="w-px h-6 bg-white/[0.1] mx-1"></div>
              <button 
                type="button"
                onClick={() => setIsAIAssistActive(!isAIAssistActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors text-xs font-poppins font-medium ${
                  isAIAssistActive ? 'bg-purple-500/20 text-purple-300' : 'hover:bg-white/[0.06] text-purple-400/70 hover:text-purple-400'
                }`}
              >
                <Sparkles className="w-4 h-4" /> AI Enhance
              </button>

              <button 
                type="button"
                onClick={() => setIsAnnouncement(!isAnnouncement)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-poppins font-medium ${
                  isAnnouncement 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'hover:bg-white/[0.06] text-amber-500/70 hover:text-amber-400'
                }`}
              >
                📢 Announcement
              </button>
            </div>
            
            <button
              onClick={handlePost}
              disabled={isPosting || !content.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-sm font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
