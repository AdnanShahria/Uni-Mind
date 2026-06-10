import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Globe, Lock, Upload, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { turso } from '../../utils/tursoClient';
import { uploadImageToImgbb } from '../../utils/imgbbUpload';
import { CustomSelect } from '../../components/CustomSelect';

export const CreateCommunityModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Study Group');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [uniName, setUniName] = useState('');
  const [sessions, setSessions] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customUniversities, setCustomUniversities] = useState<{ value: string; isCustom: boolean }[]>([]);
  const [customSessions, setCustomSessions] = useState<{ value: string; isCustom: boolean }[]>([]);
  
  const [isCustomUni, setIsCustomUni] = useState(false);
  const [isCustomSession, setIsCustomSession] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchApprovedMetadata = async () => {
      try {
        const { data, error } = await turso.from('metadata_approved').select();
        if (!error && data) {
          setCustomUniversities(data.institutions || []);
          setCustomSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Error loading approved metadata:", err);
      }
    };
    if (isOpen) {
      fetchApprovedMetadata();
    }
  }, [isOpen]);

  const institutionOptions = customUniversities
    .map(item => {
      const uni = item.value;
      const hasLocation = uni.includes(' | Location: ');
      const labelName = hasLocation ? uni.split(' | Location: ')[0] : uni;
      const subtitleVal = hasLocation ? uni.split(' | Location: ')[1] : undefined;
      return { 
        value: uni, 
        label: labelName, 
        subtitle: subtitleVal,
        isCustom: item.isCustom
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your institution? Add new", isAction: true } as any);

  const sessionOptions = customSessions
    .map(item => ({ 
      value: item.value, 
      label: item.value, 
      isCustom: item.isCustom 
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Session? Add custom", isAction: true } as any);

  const handleInstitutionSelect = (value: string) => {
    if (value === "unlisted") {
      setIsCustomUni(true);
      setUniName('');
    } else {
      setIsCustomUni(false);
      setUniName(value);
    }
  };

  const handleSessionSelect = (value: string) => {
    if (value === "unlisted") {
      setIsCustomSession(true);
      setSessions('');
    } else {
      setIsCustomSession(false);
      setSessions(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Community name is required');
      return;
    }

    setIsSubmitting(true);
    const { data: userData } = await turso.auth.getUser();
    if (!userData.user) {
      toast.error('Please login first');
      setIsSubmitting(false);
      return;
    }

    let logo_url = null;
    if (logoFile) {
      toast.loading('Uploading logo...', { id: 'upload' });
      const uploadResult = await uploadImageToImgbb(logoFile, `${name}-logo`);
      if (uploadResult.success) {
        logo_url = uploadResult.url;
        toast.success('Logo uploaded!', { id: 'upload' });
      } else {
        toast.error(`Logo upload failed: ${uploadResult.error}`, { id: 'upload' });
        // We continue creating the community even if logo fails
      }
    }

    // 1. Create Community
    const { data: communityData, error: commError } = await turso.from('communities').insert({
      name,
      description,
      type,
      visibility,
      uni_name: uniName || null,
      sessions: sessions || null,
      logo_url,
      created_by: userData.user.id
    }).select().single();

    if (commError || !communityData) {
      toast.error('Failed to create community');
      setIsSubmitting(false);
      return;
    }

    // 2. Assign current user as Owner in community_members
    const { error: memberError } = await turso.from('community_members').insert({
      community_id: communityData.id,
      user_id: userData.user.id,
      role: 'owner' // Assign Owner role
    });

    if (memberError) {
      console.error(memberError);
      toast.error('Community created but failed to assign owner role');
    } else {
      toast.success(`${name} created successfully!`);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
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

          <form onSubmit={handleSubmit} className="space-y-3 max-h-[85vh] overflow-y-auto custom-scrollbar pr-2 pb-2">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">University Name</label>
                {!isCustomUni ? (
                  <CustomSelect
                    value={uniName}
                    onChange={handleInstitutionSelect}
                    options={institutionOptions}
                    placeholder="Select Institution"
                  />
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={uniName}
                      onChange={e => setUniName(e.target.value)}
                      placeholder="Enter Custom Institution Name"
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-primary/50"
                    />
                    <button 
                      type="button" 
                      onClick={() => { setIsCustomUni(false); setUniName(''); }} 
                      className="text-[10px] text-primary-glow hover:underline font-poppins self-start"
                    >
                      ← Back to list
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Session(s)</label>
                {!isCustomSession ? (
                  <CustomSelect
                    value={sessions}
                    onChange={handleSessionSelect}
                    options={sessionOptions}
                    placeholder="Select Session"
                  />
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={sessions}
                      onChange={e => setSessions(e.target.value)}
                      placeholder="e.g., 2023-2024"
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-primary/50"
                    />
                    <button 
                      type="button" 
                      onClick={() => { setIsCustomSession(false); setSessions(''); }} 
                      className="text-[10px] text-primary-glow hover:underline font-poppins self-start"
                    >
                      ← Back to list
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Community Logo</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-16 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group relative overflow-hidden bg-white/5"
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white px-3 py-1 bg-black/50 rounded-lg backdrop-blur-sm flex items-center gap-2">
                        <Upload className="w-3 h-3" /> Change Logo
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-slate-300 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Click to upload logo</span>
                  </div>
                )}
              </div>
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
                rows={2}
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
