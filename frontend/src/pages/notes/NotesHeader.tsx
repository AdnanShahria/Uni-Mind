import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { StickyNote, Plus, Download } from 'lucide-react';
import { fadeIn } from './data';
import { ActionModal } from '../../components/ActionModal';

export const NotesHeader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast.success(`Importing ${e.target.files[0].name}...`);
    }
  };

  return (
    <>
      <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
            <StickyNote className="w-6 h-6 text-amber-400" />
            Smart Notes
          </h1>
          <p className="text-sm text-slate-400 font-poppins mt-1">
            Organize, share, and enhance your notes with AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx,.txt" 
          />
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-xs text-slate-300 font-poppins transition-colors hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Import
          </button>
        </div>
      </motion.div>

      <ActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Note" 
        placeholder="Start typing your note here..." 
        actionText="Create Note"
      />
    </>
  );
};
