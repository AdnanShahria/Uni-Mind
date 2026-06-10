import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Globe, Lock, Upload, Image as ImageIcon, School, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { turso } from '../../utils/tursoClient';
import { uploadImageToImgbb } from '../../utils/imgbbUpload';
import { CustomSelect } from '../../components/CustomSelect';

export const CreateCommunityModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Study Group');
  const [visibility, setVisibility] = useState('public');
  const [uniName, setUniName] = useState('');
  const [sessions, setSessions] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customUniversities, setCustomUniversities] = useState<{ value: string; isCustom: boolean }[]>([]);
  const [customSessions, setCustomSessions] = useState<{ value: string; isCustom: boolean }[]>([]);
  
  const [isCustomUni, setIsCustomUni] = useState(false);
  const [isCustomSession, setIsCustomSession] = useState(false);

  // Custom Institution Extra Fields
  const [abbreviation, setAbbreviation] = useState('');
  const [district, setDistrict] = useState('');
  const [country, setCountry] = useState('');
  const [isSavingUni, setIsSavingUni] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);

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

  const sessionOptions = [
    { value: "", label: "Whole University (Optional)" },
    ...customSessions
      .map(item => ({ 
        value: item.value, 
        label: item.value, 
        isCustom: item.isCustom 
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  ].concat({ value: "unlisted", label: "Can't find your Session? Add custom", isAction: true } as any);

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

  const saveCustomInstitution = async () => {
    const uni = uniName.trim();
    const abbrev = abbreviation.trim();
    if (!uni) { toast.error('Institution name cannot be empty'); return; }
    if (!district.trim() || !country.trim() || !abbrev) { toast.error('Abbreviation, District, and Country are required'); return; }

    const finalVal = `${uni} (${abbrev.toUpperCase()}) | Location: ${district.trim()}, ${country.trim()}`;

    setIsSavingUni(true);
    try {
      const { error } = await turso.from('metadata_requests').insert([
        { requester_email: 'community-creator@unimind.edu', request_type: 'institution', action_type: 'add', old_value: null, new_value: finalVal, status: 'pending' }
      ]);
      if (error) { toast.error(error.message || 'Failed to save institution'); return; }
      setCustomUniversities(prev => [...prev, { value: finalVal, isCustom: true }]);
      setIsCustomUni(false);
      setUniName(finalVal);
      toast.success(`University "${uni}" saved under registry!`);
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setIsSavingUni(false);
    }
  };

  const saveCustomSession = async () => {
    const session = sessions.trim();
    if (!session) { toast.error('Session cannot be empty'); return; }
    const activeUni = uniName.trim();
    const finalVal = activeUni ? `${session} | University: ${activeUni}` : session;

    setIsSavingSession(true);
    try {
      const { error } = await turso.from('metadata_requests').insert([
        { requester_email: 'community-creator@unimind.edu', request_type: 'session', action_type: 'add', old_value: null, new_value: finalVal, status: 'pending' }
      ]);
      if (error) { toast.error(error.message || 'Failed to save Session'); return; }
      setCustomSessions(prev => [...prev, { value: session, isCustom: true }]);
      setIsCustomSession(false);
      setSessions(session);
      toast.success(`Session "${session}" saved!`);
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setIsSavingSession(false);
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

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
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

            <form onSubmit={handleSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 pb-2">
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
                {isCustomUni ? (
                  <>
                    <div className="col-span-2 sm:col-span-1 group flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">University / Institution</label>
                      <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6]" />
                        <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-glow" />
                        <input
                          type="text"
                          value={uniName}
                          onChange={e => setUniName(e.target.value)}
                          placeholder="Enter Custom Institution Name"
                          className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <button 
                          type="button" 
                          onClick={() => { setIsCustomUni(false); setUniName(''); }} 
                          className="text-[10px] text-primary-glow hover:underline font-poppins font-medium mt-1.5"
                        >
                          ← Back to list
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 group flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Required Fields</label>
                      <div className="flex flex-col gap-2">
                        <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 overflow-hidden">
                          <input 
                            type="text" 
                            value={abbreviation} 
                            onChange={e => setAbbreviation(e.target.value)} 
                            placeholder="Abbrev (e.g. GAU)" 
                            className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none px-3 font-poppins" 
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="w-1/2 relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 overflow-hidden">
                            <input 
                              type="text" 
                              value={district} 
                              onChange={e => setDistrict(e.target.value)} 
                              placeholder="District" 
                              className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none px-3 font-poppins" 
                            />
                          </div>
                          <div className="w-1/2 relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 overflow-hidden">
                            <input 
                              type="text" 
                              value={country} 
                              onChange={e => setCountry(e.target.value)} 
                              placeholder="Country" 
                              className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none px-3 font-poppins" 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end items-center mt-1">
                        <button
                          type="button"
                          onClick={saveCustomInstitution}
                          disabled={isSavingUni}
                          className={`relative px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer overflow-hidden mt-1.5 ${
                            isSavingUni ? 'opacity-80 pointer-events-none' : 'animate-glow-pulse'
                          }`}
                        >
                          {isSavingUni && <span className="absolute inset-0 animate-shimmer rounded-xl" />}
                          {isSavingUni ? 'Saving…' : 'Save University'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 sm:col-span-1 group flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">University / Institution</label>
                    <CustomSelect
                      value={uniName}
                      onChange={handleInstitutionSelect}
                      options={institutionOptions}
                      placeholder="Select Institution"
                    />
                  </div>
                )}

                <div className="col-span-2 sm:col-span-1 group flex flex-col transition-all duration-500">
                  <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Session / Batch</label>
                  {!isCustomSession ? (
                    <CustomSelect
                      value={sessions}
                      onChange={handleSessionSelect}
                      options={sessionOptions}
                      placeholder="Whole University (Optional)"
                    />
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="relative flex flex-col gap-2"
                    >
                      <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6]" />
                        <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-glow" />
                        <input
                          type="text"
                          value={sessions}
                          onChange={e => setSessions(e.target.value)}
                          placeholder="Enter Custom Session"
                          className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <button 
                          type="button" 
                          onClick={() => { setIsCustomSession(false); setSessions(''); }} 
                          className="text-[10px] text-primary-glow hover:underline font-poppins font-medium"
                        >
                          ← Back to list
                        </button>
                        <button
                          type="button"
                          onClick={saveCustomSession}
                          disabled={isSavingSession}
                          className={`relative px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-[10px] transition-all shadow-[0_2px_10px_rgba(16,185,129,0.2)] hover:shadow-[0_2px_15px_rgba(16,185,129,0.4)] cursor-pointer overflow-hidden ${isSavingSession ? 'opacity-80 pointer-events-none' : ''}`}
                        >
                          {isSavingSession && <span className="absolute inset-0 animate-shimmer rounded-xl" />}
                          {isSavingSession ? 'Saving…' : 'Save Session'}
                        </button>
                      </div>
                    </motion.div>
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
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
