import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, FolderOpen, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';

const NOTE_COLORS = [
  { label: 'Blue', value: 'text-blue-400' },
  { label: 'Emerald', value: 'text-emerald-400' },
  { label: 'Purple', value: 'text-purple-400' },
  { label: 'Amber', value: 'text-amber-400' },
  { label: 'Rose', value: 'text-rose-400' },
  { label: 'Cyan', value: 'text-cyan-400' },
];

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialContent?: string;
  initialTitle?: string;
}

export const CreateNoteModal = ({
  isOpen,
  onClose,
  onCreated,
  initialContent = '',
  initialTitle = '',
}: CreateNoteModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [color, setColor] = useState('text-blue-400');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
      fetchFolders();
    }
  }, [isOpen, initialTitle, initialContent]);

  const fetchFolders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('folders').select('id, name').eq('user_id', user.id);
    if (data) setFolders(data);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a note title');
      return;
    }
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Please sign in first'); return; }

      let folderId: string | null = null;

      // Create new folder if typed
      if (newFolder.trim()) {
        const { data: createdFolder } = await supabase
          .from('folders')
          .insert([{ user_id: user.id, name: newFolder.trim() }])
          .select()
          .single();
        folderId = createdFolder?.id || null;
      } else if (selectedFolder) {
        folderId = selectedFolder;
      }

      const { error } = await supabase.from('notes').insert([{
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        folder_id: folderId,
        is_starred: false,
        is_ai_summarized: false,
      }]);

      if (error) throw error;

      toast.success('Note created!');
      setTitle('');
      setContent('');
      setSelectedFolder('');
      setNewFolder('');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl bg-[#0d1526] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-base font-semibold text-white font-outfit flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Create New Note
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Title */}
            <div>
              <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-1.5 block">Title *</label>
              <input
                type="text"
                placeholder="e.g. Quantum Mechanics Chapter 5"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoFocus
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-100 font-poppins placeholder-slate-600 outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-1.5 block">Content</label>
              <textarea
                placeholder="Start writing your note..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-300 font-poppins placeholder-slate-600 resize-none outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Folder */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-1.5 block flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" /> Folder
                </label>
                <select
                  value={selectedFolder}
                  onChange={e => setSelectedFolder(e.target.value)}
                  disabled={!!newFolder.trim()}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 font-poppins outline-none focus:border-primary/40 transition-colors disabled:opacity-40"
                >
                  <option value="">No folder</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-1.5 block">New Folder</label>
                <input
                  type="text"
                  placeholder="Create new..."
                  value={newFolder}
                  onChange={e => setNewFolder(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 font-poppins placeholder-slate-600 outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            {/* Color tag */}
            <div>
              <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-2 block">Color Tag</label>
              <div className="flex gap-2">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${c.value.replace('text-', 'bg-').replace('-400', '-500/60')} ${
                      color === c.value ? 'border-white scale-110' : 'border-transparent opacity-60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-poppins">
              {content.length > 0 ? `${content.length} characters` : 'No content yet'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-sm font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSubmitting ? 'Saving...' : 'Create Note'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
