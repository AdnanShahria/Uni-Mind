import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw, BrainCircuit, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { turso } from '../../utils/tursoClient';
import { toast } from 'react-hot-toast';
import { FlashcardType } from './types';

interface FlashcardsStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string | number;
}

export const FlashcardsStudyModal = ({ isOpen, onClose, noteId }: FlashcardsStudyModalProps) => {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionState, setSessionState] = useState<'studying' | 'complete'>('studying');
  const [sessionResults, setSessionResults] = useState({ mastered: 0, learning: 0 });

  useEffect(() => {
    if (isOpen) {
      loadFlashcards();
    } else {
      setFlashcards([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionState('studying');
      setSessionResults({ mastered: 0, learning: 0 });
    }
  }, [isOpen, noteId]);

  const loadFlashcards = async (onlyDifficult = false) => {
    setIsLoading(true);
    let query = turso
      .from('flashcards')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: true });
      
    if (onlyDifficult) {
      query = query.in('status', ['new', 'learning']);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load flashcards');
    } else if (data) {
      if (data.length === 0 && onlyDifficult) {
        toast.success("You've mastered all cards!");
        onClose();
        return;
      }
      setFlashcards(data as FlashcardType[]);
    }
    setIsLoading(false);
  };

  const handleRestartDifficult = () => {
    setSessionState('studying');
    setSessionResults({ mastered: 0, learning: 0 });
    setCurrentIndex(0);
    setIsFlipped(false);
    loadFlashcards(true);
  };

  const handleUpdateStatus = async (status: 'learning' | 'mastered') => {
    const card = flashcards[currentIndex];
    if (!card) return;

    // Optimistic update
    const newCards = [...flashcards];
    newCards[currentIndex].status = status;
    setFlashcards(newCards);

    setSessionResults(prev => ({
      ...prev,
      [status]: prev[status] + 1
    }));

    // Update DB
    await turso.from('flashcards').update({ status }).eq('id', card.id);

    // Next card
    handleNext();
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        setSessionState('complete');
      }
    }, 150); // small delay for flip animation to reset
  };

  if (!isOpen) return null;

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;
  const masteredCount = flashcards.filter(c => c.status === 'mastered').length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-3xl flex flex-col items-center"
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <BrainCircuit className="w-5 h-5 text-primary-glow" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-outfit">Study Mode</h2>
                <p className="text-sm text-slate-400 font-poppins">
                  {masteredCount} of {flashcards.length} mastered
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden mb-8">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Card Area */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <RotateCcw className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : flashcards.length === 0 ? (
            <div className="bg-[#0a0f1c] border border-white/[0.08] rounded-2xl w-full h-64 flex flex-col items-center justify-center text-slate-400">
              <BrainCircuit className="w-12 h-12 mb-4 opacity-50" />
              <p>No flashcards generated yet.</p>
              <p className="text-sm">Click "Generate Flashcards" on the note.</p>
            </div>
          ) : sessionState === 'complete' ? (
            <div className="bg-gradient-to-br from-[#121b2d] to-[#0a0f1c] border border-primary/30 rounded-3xl w-full max-w-2xl p-12 flex flex-col items-center text-center shadow-[0_0_40px_rgba(59,130,246,0.1)]">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 border-4 border-primary/30">
                <BrainCircuit className="w-10 h-10 text-primary-glow" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 font-outfit">Session Complete!</h2>
              <p className="text-slate-400 mb-8 font-poppins">Great job reviewing your deck.</p>
              
              <div className="flex gap-6 mb-8 w-full justify-center">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 min-w-[120px]">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{sessionResults.mastered}</div>
                  <div className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Mastered</div>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 min-w-[120px]">
                  <div className="text-3xl font-bold text-rose-400 mb-1">{sessionResults.learning}</div>
                  <div className="text-xs uppercase tracking-widest text-rose-500 font-bold">To Review</div>
                </div>
              </div>
              
              <div className="flex gap-4 w-full justify-center mt-4">
                <button 
                  onClick={handleRestartDifficult}
                  disabled={sessionResults.learning === 0}
                  className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-30 flex items-center gap-2 border border-white/10"
                >
                  <RotateCcw className="w-5 h-5" />
                  Review Difficult Cards
                </button>
                <button 
                  onClick={onClose}
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-[3/2] sm:aspect-[2/1] max-w-2xl" style={{ perspective: 1000 }}>
              <motion.div
                className="w-full h-full relative cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateX: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front (Question) */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-[#121b2d] to-[#0a0f1c] border border-white/[0.08] rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 sm:p-12 text-center group hover:border-primary/30 transition-colors"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute top-6 left-6 text-[11px] uppercase tracking-widest text-slate-500 font-bold font-poppins">Question</div>
                  <div className="absolute top-6 right-6 text-[11px] text-slate-500 font-poppins">Card {currentIndex + 1} / {flashcards.length}</div>
                  
                  <h3 className="text-2xl sm:text-3xl font-medium text-white font-outfit leading-relaxed">
                    {currentCard?.question}
                  </h3>
                  
                  <div className="absolute bottom-6 text-[12px] text-primary/60 font-poppins opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to flip
                  </div>
                </div>

                {/* Back (Answer) */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-[#0d1526] to-[#050810] border border-primary/30 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col items-center justify-center p-8 sm:p-12 text-center [transform:rotateX(180deg)]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute top-6 left-6 text-[11px] uppercase tracking-widest text-primary font-bold font-poppins">Answer</div>
                  
                  <h3 className="text-xl sm:text-2xl font-medium text-slate-200 font-outfit leading-relaxed overflow-y-auto custom-scrollbar">
                    {currentCard?.answer}
                  </h3>
                </div>
              </motion.div>
            </div>
          )}

          {/* Controls */}
          {flashcards.length > 0 && sessionState === 'studying' && (
            <div className={`mt-8 flex gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button
                onClick={() => handleUpdateStatus('learning')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Need Review
              </button>
              <button
                onClick={() => handleUpdateStatus('mastered')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-semibold transition-colors"
              >
                <Check className="w-5 h-5" />
                Got it
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
