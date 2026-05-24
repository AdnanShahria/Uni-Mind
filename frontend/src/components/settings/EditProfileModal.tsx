import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onProfileUpdated: () => void;
}

export const EditProfileModal = ({ isOpen, onClose, currentUser, onProfileUpdated }: EditProfileModalProps) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [graduations, setGraduations] = useState<string[]>([]);
  const [gradInput, setGradInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      // Initialize with existing data from auth metadata or fetch from public.users
      setName(currentUser.user_metadata?.name || '');
      // Assuming we fetch full profile from public.users here, but for simplicity we'll mock it if not available
      const fetchProfile = async () => {
        const { data } = await supabase.from('users').select('*').eq('id', currentUser.id).single();
        if (data) {
          setName(data.name || currentUser.user_metadata?.name || '');
          setBio(data.bio || '');
          setRelationshipStatus(data.relationship_status || '');
          setGraduations(data.graduations || []);
        }
      };
      fetchProfile();
    }
  }, [isOpen, currentUser]);

  const handleAddGraduation = () => {
    if (gradInput.trim() && !graduations.includes(gradInput.trim())) {
      setGraduations([...graduations, gradInput.trim()]);
      setGradInput('');
    }
  };

  const removeGraduation = (grad: string) => {
    setGraduations(graduations.filter(g => g !== grad));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    
    // Update public.users
    const { error } = await supabase.from('users').update({
      name,
      bio,
      relationship_status: relationshipStatus,
      graduations
    }).eq('id', currentUser.id);

    // Optionally update auth metadata
    await supabase.auth.updateUser({
      data: { name }
    });

    setIsSaving(false);
    if (!error) {
      onProfileUpdated();
      onClose();
    } else {
      alert("Error updating profile: " + error.message);
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
          className="w-full max-w-lg bg-[#0f172a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white font-outfit">Edit Profile</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Bio / Research Focus</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors min-h-[100px] resize-none"
                placeholder="Tell us about your research..."
              />
            </div>

            {/* Relationship Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Collaboration Status</label>
              <select
                value={relationshipStatus}
                onChange={(e) => setRelationshipStatus(e.target.value)}
                className="w-full bg-[#1e293b] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors appearance-none"
              >
                <option value="">Select status...</option>
                <option value="Seeking Collaborators">Seeking Collaborators</option>
                <option value="Open to Projects">Open to Projects</option>
                <option value="Independent Research">Independent Research</option>
                <option value="Mentoring">Mentoring</option>
              </select>
            </div>

            {/* Graduations */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Education / Graduations</label>
              <div className="space-y-3">
                {graduations.map((grad, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] px-4 py-2.5 rounded-xl">
                    <span className="text-sm text-slate-200 font-poppins">{grad}</span>
                    <button onClick={() => removeGraduation(grad)} className="text-slate-500 hover:text-rose-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={gradInput}
                    onChange={(e) => setGradInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddGraduation()}
                    placeholder="e.g. BSc Computer Science, MIT 2024"
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors"
                  />
                  <button onClick={handleAddGraduation} className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary-glow rounded-xl transition-colors border border-primary/20">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-sm font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
