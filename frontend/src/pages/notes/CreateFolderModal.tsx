import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { turso } from '../../utils/tursoClient';
import { toast } from 'react-hot-toast';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  parentFolderId: string | null;
  communityId?: string;
}

export const CreateFolderModal = ({ isOpen, onClose, onCreated, parentFolderId, communityId }: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await turso.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await turso.from('folders').insert([{
        user_id: user.id,
        name: folderName.trim(),
        parent_id: parentFolderId || null,
        community_id: communityId || null
      }]);

      if (error) throw error;

      toast.success('Folder created!');
      setFolderName('');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create folder');
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
          className="w-full max-w-md bg-[#0d1526] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0A0D1A]">
            <h2 className="text-base font-semibold text-white font-outfit flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-primary" />
              Create New Folder
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-1.5 block">Folder Name</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g., Physics, Project Ideas"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-100 font-poppins placeholder-slate-600 outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !folderName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-sm font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
