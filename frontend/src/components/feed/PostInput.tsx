import { motion } from 'framer-motion';
import { Image as ImageIcon, FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';
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

  return (
    <>
      <motion.div
        variants={fadeIn}
        className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-white/[0.1] transition-all duration-300 shadow-sm cursor-text"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold font-poppins shrink-0 shadow-lg">
            {currentUser?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="w-full h-12 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 flex items-center text-sm text-slate-400 font-poppins hover:bg-white/[0.06] transition-colors cursor-pointer">
              What are you researching or thinking about?
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pl-[60px]">
          <div className="flex items-center gap-1.5">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-emerald-400 transition-colors text-xs font-poppins font-medium">
              <ImageIcon className="w-4 h-4 text-emerald-400/70" /> Image
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-amber-400 transition-colors text-xs font-poppins font-medium">
              <FileText className="w-4 h-4 text-amber-400/70" /> Document
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-purple-400 transition-colors text-xs font-poppins font-medium">
              <Sparkles className="w-4 h-4 text-purple-400/70" /> AI Draft
            </button>
          </div>
        </div>

        {!currentUser && (
          <p className="text-[10px] text-rose-400 mt-3 text-center font-poppins">You must be logged in to post.</p>
        )}
      </motion.div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        currentUser={currentUser} 
        onPostCreated={onPostCreated} 
      />
    </>
  );
};

