import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Globe, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../utils/supabaseClient';

export const CreateCommunityModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Study Group');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Community name is required');
      return;
    }

    setIsSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error('Please login first');
      setIsSubmitting(false);
      return;
    }

    // 1. Create Community
    const { data: communityData, error: commError } = await supabase.from('communities').insert({
      name,
      description,
      type,
      visibility,
      created_by: userData.user.id
    }).select().single();

    if (commError || !communityData) {
      toast.error('Failed to create community');
      setIsSubmitting(false);
      return;
    }

    // 2. Assign current user as Owner in community_members
    const { error: memberError } = await supabase.from('community_members').insert({
      community_id: communityData.id,
      user_id: userData.user.id,
      role: 'owner' // Assign Owner role
    });

    if (memberError) {
      console.error(memberError);
      toast.error('Community created but failed to assign owner role');
    } else {
      toast.success(`${name} created successfully!`);
    }

    setIsSubmitting(false);
    onClose();
    // In a real app, we'd fire an event to refresh the community list
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-glow" />
              Create Community
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., AI Research Group"
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-primary/50"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full h-11 bg-[#090d16] border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-primary/50"
              >
                <option value="Study Group">Study Group</option>
                <option value="Research Group">Research Group</option>
                <option value="Interest Group">Interest Group</option>
                <option value="Club">Club</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is this community about?"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-2 uppercase tracking-wide">Visibility</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${visibility === 'public' ? 'bg-primary/20 border-primary-glow text-white' : 'bg-white/5 border-white/10 text-slate-400'} transition-all`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-xs font-semibold">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${visibility === 'private' ? 'bg-primary/20 border-primary-glow text-white' : 'bg-white/5 border-white/10 text-slate-400'} transition-all`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="text-xs font-semibold">Private</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-primary hover:bg-primary-glow text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center mt-2"
            >
              {isSubmitting ? 'Creating...' : 'Create Community'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
