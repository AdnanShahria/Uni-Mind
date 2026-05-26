import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { StickyNote, Plus, Upload } from 'lucide-react';
import { fadeIn } from './data';
import { CreateNoteModal } from './CreateNoteModal';

interface NotesHeaderProps {
  onNoteCreated: () => void;
}

export const NotesHeader = ({ onNoteCreated }: NotesHeaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importedContent, setImportedContent] = useState('');
  const [importedTitle, setImportedTitle] = useState('');

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportedTitle(file.name.replace(/\.[^/.]+$/, '')); // filename without extension
      setImportedContent(text);
      setIsModalOpen(true);
      toast.success(`"${file.name}" ready to save as note`);
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsText(file);

    // Reset input so same file can be picked again
    e.target.value = '';
  };

  const handleOpen = () => {
    setImportedContent('');
    setImportedTitle('');
    setIsModalOpen(true);
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
            onClick={handleOpen}
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
            accept=".txt,.md,.pdf,.doc,.docx"
          />
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-xs text-slate-300 font-poppins transition-colors hover:scale-105 active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
        </div>
      </motion.div>

      <CreateNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={onNoteCreated}
        initialContent={importedContent}
        initialTitle={importedTitle}
      />
    </>
  );
};
