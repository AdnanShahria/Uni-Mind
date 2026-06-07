import { motion } from 'framer-motion';
import { Image as ImageIcon, FileText, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';
import { CreatePostModal } from './CreatePostModal';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface PostInputProps {
  currentUser: any;
  onPostCreated: () => void;
}

export const PostInput = ({ currentUser, onPostCreated }: PostInputProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedNote, setSelectedNote] = useState<File | null>(null);
  const [isAIAssistActive, setIsAIAssistActive] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
    setSelectedNote(null);
    setIsAIAssistActive(false);
  };

  return (
    <>
      <motion.div
        variants={fadeIn}
        className="glass-card rounded-2xl p-3 shadow-sm cursor-text"
        onClick={() => setIsModalOpen(true)}
      >
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={photoInputRef} 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedPhoto(e.target.files[0]);
              setIsModalOpen(true);
            }
          }} 
        />
        <input 
          type="file" 
          accept=".pdf,.doc,.docx,.txt" 
          className="hidden" 
          ref={noteInputRef} 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedNote(e.target.files[0]);
              setIsModalOpen(true);
            }
          }} 
        />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold font-poppins shrink-0 shadow-lg overflow-hidden">
            {currentUser?.user_metadata?.avatar_url ? (
              <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              currentUser?.user_metadata?.name?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1">
            <div className="w-full h-10 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 flex items-center text-sm text-slate-400 font-poppins hover:bg-white/[0.06] hover:border-white/[0.1] transition-colors duration-200 cursor-pointer">
              What are you researching or thinking about?
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pl-[48px]">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                photoInputRef.current?.click();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-emerald-400 transition-colors text-[11px] sm:text-xs font-poppins font-medium"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400/70" /> Image
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                noteInputRef.current?.click();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-amber-400 transition-colors text-[11px] sm:text-xs font-poppins font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400/70" /> Document
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsAIAssistActive(true);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-purple-400 transition-colors text-[11px] sm:text-xs font-poppins font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400/70" /> AI Draft
            </button>
          </div>
        </div>

        {!currentUser && (
          <p className="text-[10px] text-rose-400 mt-3 text-center font-poppins">You must be logged in to post.</p>
        )}
      </motion.div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={handleClose} 
        currentUser={currentUser} 
        onPostCreated={onPostCreated} 
        initialPhoto={selectedPhoto}
        initialNote={selectedNote}
        initialAIAssist={isAIAssistActive}
      />
    </>
  );
};

