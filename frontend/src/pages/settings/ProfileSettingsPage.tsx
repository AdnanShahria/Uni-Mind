import { useState, useEffect, useRef } from 'react';
import { Save, Plus, X, User as UserIcon, Link, Twitter, Github, Linkedin, BookOpen, Camera } from 'lucide-react';
import { turso } from '../../utils/tursoClient';
import { uploadImageToImgbb, fileToBase64 } from '../../utils/imgbbUpload';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { CustomSelect } from '../../components/CustomSelect';

const TagInput = ({
  label, tags, placeholder, color,
  onAdd, onRemove,
}: {
  label: string; tags: string[]; placeholder: string; color: string;
  onAdd: (v: string) => void; onRemove: (v: string) => void;
}) => {
  const [input, setInput] = useState('');
  const add = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onAdd(input.trim());
      setInput('');
    }
  };
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-poppins ${color}`}>
            {tag}
            <button onClick={() => onRemove(tag)} className="hover:opacity-70 transition-opacity"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} placeholder={placeholder}
          className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors" />
        <button onClick={add} className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary-glow rounded-xl transition-colors border border-primary/20">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ProfileSettingsPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [graduations, setGraduations] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState({ twitter: '', linkedin: '', github: '', researchgate: '' });
  
  // Registration / Academic Form State
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [regForm, setRegForm] = useState({
    institution: '',
    major: '',
    session: '',
    role: 'Undergraduate',
  });
  
  // Metadata options
  const [customUniversities, setCustomUniversities] = useState<{ value: string; isCustom: boolean }[]>([]);
  const [customMajors, setCustomMajors] = useState<{ value: string; isCustom: boolean }[]>([]);
  const [customSessions, setCustomSessions] = useState<{ value: string; isCustom: boolean }[]>([]);
  const [customRoles, setCustomRoles] = useState<{ value: string; isCustom: boolean }[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'academic' | 'social'>('basic');

  // Computed Dropdown Options
  const institutionOptions = customUniversities
    .map(item => {
      const uni = item.value;
      const hasLocation = uni.includes(' | Location: ');
      const labelName = hasLocation ? uni.split(' | Location: ')[0] : uni;
      const subtitleVal = hasLocation ? uni.split(' | Location: ')[1] : undefined;
      return { value: uni, label: labelName, subtitle: subtitleVal, isCustom: item.isCustom };
    })
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your institution? Add new", isAction: true } as any);

  const majorOptions = customMajors
    .map(item => ({ value: item.value, label: item.value, isCustom: item.isCustom }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Field/Major? Add custom", isAction: true } as any);

  const sessionOptions = customSessions
    .map(item => ({ value: item.value, label: item.value, isCustom: item.isCustom }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Session? Add custom", isAction: true } as any);

  const roleOptions = customRoles
    .map(item => {
      const rl = item.value;
      return { 
        value: rl, 
        label: rl === "Undergraduate" ? "Undergraduate Student" :
               rl === "Graduate / PhD" ? "Graduate / PhD Candidate" :
               rl === "Researcher" ? "Academic Researcher" :
               rl === "Professor" ? "Professor / Mentor" :
               rl === "Other" ? "Other Academic Expert" : rl, 
        isCustom: item.isCustom 
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Role? Add custom", isAction: true } as any);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await turso.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data } = await turso.from('users').select('*').eq('id', user.id).single();
        if (data) {
          setName(data.name || user.user_metadata?.name || '');
          setAvatarUrl(data.avatar_url || '');
          setBio(data.bio || '');
          setRelationshipStatus(data.relationship_status || '');
          const parseJSON = (str: any, fallback: any) => {
            if (!str) return fallback;
            if (typeof str === 'string') {
              try { return JSON.parse(str); } catch (e) { return fallback; }
            }
            return str;
          };

          setGraduations(parseJSON(data.graduations, []));
          setSkills(parseJSON(data.skills, []));
          setInterests(parseJSON(data.interests, []));
          setWebsiteUrl(data.website_url || '');
          setSocialLinks({ twitter: '', linkedin: '', github: '', researchgate: '', ...parseJSON(data.social_links, {}) });
          
          setRegForm({
            institution: data.institution || user.user_metadata?.institution || '',
            major: data.major || user.user_metadata?.major || '',
            session: data.session || user.user_metadata?.session || '',
            role: data.role || user.user_metadata?.role || 'Undergraduate',
          });
        }
      }
    };
    
    const fetchApprovedMetadata = async () => {
      try {
        const { data, error } = await turso.from('metadata_approved').select();
        if (!error && data) {
          setCustomUniversities(data.institutions || []);
          setCustomMajors(data.majors || []);
          setCustomSessions(data.sessions || []);
          setCustomRoles(data.roles || []);
        }
      } catch (err) {
        console.error("Error loading approved metadata:", err);
      }
    };

    fetchProfile();
    fetchApprovedMetadata();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    setIsSaving(true);
    setStatus({ type: 'success', msg: 'Uploading image to IMGBB...' });
    
    try {
      const imgName = `avatar-${currentUser.id}-${Date.now()}`;
      const result = await uploadImageToImgbb(file, imgName);

      if (result.success && result.url) {
        setAvatarUrl(result.url);
        setStatus({ type: 'success', msg: 'Avatar uploaded successfully!' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        // Fallback to base64 if IMGBB fails
        console.warn('IMGBB upload failed, using base64 fallback:', result.error);
        const base64 = await fileToBase64(file);
        setAvatarUrl(base64);
        setStatus(null);
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Failed to process image.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setStatus(null);

    const { error } = await turso.from('users').update({
      name, 
      avatar_url: avatarUrl,
      bio,
      relationship_status: relationshipStatus,
      institution: regForm.institution,
      major: regForm.major,
      session: regForm.session,
      role: regForm.role,
      graduations: JSON.stringify(graduations),
      skills: JSON.stringify(skills),
      interests: JSON.stringify(interests),
      website_url: websiteUrl,
      social_links: JSON.stringify(socialLinks),
    }).eq('id', currentUser.id);

    await turso.auth.updateUser({ data: { name } });

    setIsSaving(false);
    if (!error) {
      window.dispatchEvent(new Event('profile-updated'));
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus({ type: 'error', msg: error.message });
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'academic', label: 'Academic' },
    { id: 'social', label: 'Social Links' },
  ];

  return (
    <SettingsPageLayout title="Profile Information" icon={<UserIcon className="w-6 h-6 text-primary-glow" />}>
      <div className="max-w-2xl">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold font-poppins transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary-glow border border-primary/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass-card border border-white/[0.08] rounded-2xl p-6 md:p-8 bg-slate-900/30">
          <div className="space-y-6">

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <>
                <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
                  <div className="relative group shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-white/[0.06] flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-slate-500" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 w-full flex flex-col justify-center">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Profile Picture</label>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-sm font-semibold text-primary-glow transition-colors"
                      >
                        <Camera className="w-4 h-4" /> Upload Image
                      </button>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="px-5 py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-poppins mt-3">Upload a new avatar or remove the current one.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Bio / Research Focus</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors min-h-[100px] resize-none"
                    placeholder="Tell others about your research focus and goals..." />
                  <p className="text-[10px] text-slate-500 font-poppins mt-1">{bio.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins">Collaboration Status</label>
                  <select value={relationshipStatus} onChange={e => setRelationshipStatus(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors appearance-none">
                    <option value="" className="bg-slate-900">Select status...</option>
                    <option value="Seeking Collaborators" className="bg-slate-900">🤝 Seeking Collaborators</option>
                    <option value="Open to Projects" className="bg-slate-900">📂 Open to Projects</option>
                    <option value="Independent Research" className="bg-slate-900">🔬 Independent Research</option>
                    <option value="Mentoring" className="bg-slate-900">🎓 Mentoring</option>
                    <option value="In a Team" className="bg-slate-900">👥 In a Team</option>
                  </select>
                </div>
              </>
            )}

            {/* Academic Tab */}
            {activeTab === 'academic' && (
              <>
                <div className="mb-8 p-5 bg-black/20 border border-white/5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-glow" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
                        Core Academic Record
                      </h3>
                      <p className="text-[10px] text-slate-400 font-poppins mt-1">Your registered institutional details</p>
                    </div>
                    <button 
                      onClick={() => setIsEditingAcademic(!isEditingAcademic)}
                      className="text-[10px] px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary-glow rounded-lg transition-colors border border-primary/20 font-poppins font-medium"
                    >
                      {isEditingAcademic ? 'Cancel Edit' : 'Edit Info'}
                    </button>
                  </div>
                  
                  {isEditingAcademic ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-poppins">Institution</label>
                        <CustomSelect
                          value={regForm.institution}
                          onChange={(v) => setRegForm(p => ({ ...p, institution: v }))}
                          options={institutionOptions as any}
                          placeholder="Select Institution"
                        />
                        {regForm.institution === 'unlisted' && (
                          <input type="text" placeholder="Enter custom institution" 
                            onChange={(e) => setRegForm(p => ({ ...p, institution: e.target.value }))}
                            className="w-full mt-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white font-poppins outline-none focus:border-primary/50" />
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-poppins">Major / Field</label>
                        <CustomSelect
                          value={regForm.major}
                          onChange={(v) => setRegForm(p => ({ ...p, major: v }))}
                          options={majorOptions as any}
                          placeholder="Select Major"
                        />
                        {regForm.major === 'unlisted' && (
                          <input type="text" placeholder="Enter custom major" 
                            onChange={(e) => setRegForm(p => ({ ...p, major: e.target.value }))}
                            className="w-full mt-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white font-poppins outline-none focus:border-primary/50" />
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-poppins">Session</label>
                        <CustomSelect
                          value={regForm.session}
                          onChange={(v) => setRegForm(p => ({ ...p, session: v }))}
                          options={sessionOptions as any}
                          placeholder="Select Session"
                        />
                        {regForm.session === 'unlisted' && (
                          <input type="text" placeholder="Enter custom session" 
                            onChange={(e) => setRegForm(p => ({ ...p, session: e.target.value }))}
                            className="w-full mt-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white font-poppins outline-none focus:border-primary/50" />
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-poppins">Academic Role</label>
                        <CustomSelect
                          value={regForm.role}
                          onChange={(v) => setRegForm(p => ({ ...p, role: v }))}
                          options={roleOptions as any}
                          placeholder="Select Role"
                        />
                        {regForm.role === 'unlisted' && (
                          <input type="text" placeholder="Enter custom role" 
                            onChange={(e) => setRegForm(p => ({ ...p, role: e.target.value }))}
                            className="w-full mt-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white font-poppins outline-none focus:border-primary/50" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-poppins">Institution</span>
                        <span className="text-xs text-white font-poppins">{regForm.institution || 'Not set'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-poppins">Major</span>
                        <span className="text-xs text-white font-poppins">{regForm.major || 'Not set'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-poppins">Session</span>
                        <span className="text-xs text-white font-poppins">{regForm.session || 'Not set'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-poppins">Role</span>
                        <span className="text-xs text-white font-poppins">{regForm.role || 'Not set'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <TagInput
                  label="Education / Graduations"
                  tags={graduations}
                  placeholder="e.g. BSc Computer Science, MIT 2024"
                  color="bg-blue-400/10 text-blue-300 border border-blue-400/20"
                  onAdd={v => setGraduations(g => [...g, v])}
                  onRemove={v => setGraduations(g => g.filter(x => x !== v))}
                />
                <TagInput
                  label="Skills & Technologies"
                  tags={skills}
                  placeholder="e.g. Python, Machine Learning, NLP"
                  color="bg-purple-400/10 text-purple-300 border border-purple-400/20"
                  onAdd={v => setSkills(s => [...s, v])}
                  onRemove={v => setSkills(s => s.filter(x => x !== v))}
                />
                <TagInput
                  label="Research Interests"
                  tags={interests}
                  placeholder="e.g. AI Ethics, Quantum Computing"
                  color="bg-teal-400/10 text-teal-300 border border-teal-400/20"
                  onAdd={v => setInterests(i => [...i, v])}
                  onRemove={v => setInterests(i => i.filter(x => x !== v))}
                />
              </>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5" /> Personal Website
                  </label>
                  <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors" />
                </div>

                {([
                  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/username', color: 'text-sky-400' },
                  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username', color: 'text-primary-glow' },
                  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username', color: 'text-slate-300' },
                  { key: 'researchgate', label: 'ResearchGate', icon: BookOpen, placeholder: 'https://researchgate.net/profile/name', color: 'text-teal-400' },
                ] as const).map(link => (
                  <div key={link.key}>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-poppins flex items-center gap-1.5">
                      <link.icon className={`w-3.5 h-3.5 ${link.color}`} /> {link.label}
                    </label>
                    <input type="url"
                      value={socialLinks[link.key as keyof typeof socialLinks]}
                      onChange={e => setSocialLinks(s => ({ ...s, [link.key]: e.target.value }))}
                      placeholder={link.placeholder}
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins focus:border-primary/50 outline-none transition-colors" />
                  </div>
                ))}
              </>
            )}

            {/* Status */}
            {status && (
              <div className={`p-3 rounded-xl text-xs font-poppins ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {status.msg}
              </div>
            )}

            <div className="pt-4 border-t border-white/[0.06]">
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-glow hover:bg-primary text-white text-sm font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50">
                {isSaving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SettingsPageLayout>
  );
};
