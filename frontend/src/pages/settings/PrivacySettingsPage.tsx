import { useState, useEffect } from 'react';
import { Shield, CheckCircle, Eye, MessageSquare, Search, Share2 } from 'lucide-react';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-white/10'}`}>
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
  </button>
);

interface PrivacyPrefs {
  profile_visibility: string;
  show_online_status: boolean;
  allow_dms: string;
  search_indexing: boolean;
  data_sharing_research: boolean;
}

export const PrivacySettingsPage = () => {
  const [prefs, setPrefs] = useState<PrivacyPrefs>({
    profile_visibility: 'public',
    show_online_status: true,
    allow_dms: 'everyone',
    search_indexing: true,
    data_sharing_research: false,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('user_preferences')
          .select('profile_visibility, show_online_status, allow_dms, search_indexing, data_sharing_research')
          .eq('user_id', user.id)
          .single();
        if (data) setPrefs({ ...prefs, ...data });
      }
    };
    fetch();
  }, []);

  const update = (key: keyof PrivacyPrefs, val: any) => {
    setPrefs(p => ({ ...p, [key]: val }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    await supabase.from('user_preferences').upsert({ user_id: userId, ...prefs }, { onConflict: 'user_id' });
    setSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const visibilityOptions = [
    { id: 'public', label: 'Public', desc: 'Anyone on UniMind can view your profile', icon: '🌐' },
    { id: 'connections', label: 'Connections Only', desc: 'Only people you follow can see your profile', icon: '👥' },
    { id: 'private', label: 'Private', desc: 'Only you can see your profile', icon: '🔒' },
  ];

  const dmOptions = [
    { id: 'everyone', label: 'Everyone' },
    { id: 'connections', label: 'Connections Only' },
    { id: 'nobody', label: 'Nobody' },
  ];

  return (
    <SettingsPageLayout title="Privacy & Security" icon={<Shield className="w-6 h-6 text-emerald-400" />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">

        {/* Profile Visibility */}
        <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
          <h3 className="text-base font-bold text-white font-outfit mb-1 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" /> Profile Visibility
          </h3>
          <p className="text-xs text-slate-400 font-poppins mb-4">Control who can see your profile, posts, and academic data</p>
          <div className="space-y-2">
            {visibilityOptions.map(opt => (
              <button key={opt.id} onClick={() => update('profile_visibility', opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  prefs.profile_visibility === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]'
                }`}>
                <span className="text-lg">{opt.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white font-poppins">{opt.label}</p>
                  <p className="text-xs text-slate-400 font-poppins">{opt.desc}</p>
                </div>
                {prefs.profile_visibility === opt.id && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* DM Settings */}
        <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
          <h3 className="text-base font-bold text-white font-outfit mb-1 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Direct Messages
          </h3>
          <p className="text-xs text-slate-400 font-poppins mb-4">Who can send you direct messages</p>
          <div className="flex gap-3">
            {dmOptions.map(opt => (
              <button key={opt.id} onClick={() => update('allow_dms', opt.id)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-center text-xs font-semibold font-poppins transition-all ${
                  prefs.allow_dms === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/[0.06] text-slate-400 hover:border-white/15'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Online Status & Discovery */}
        <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
          <h3 className="text-base font-bold text-white font-outfit mb-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" /> Discovery & Presence
          </h3>
          <p className="text-xs text-slate-400 font-poppins mb-5">Control how others discover you and see your activity</p>
          <div className="space-y-4">
            {[
              { key: 'show_online_status' as keyof PrivacyPrefs, label: 'Show Online Status', desc: 'Let others see when you\'re active on UniMind' },
              { key: 'search_indexing' as keyof PrivacyPrefs, label: 'Search & Discovery', desc: 'Allow your profile to appear in search results' },
            ].map(opt => (
              <div key={opt.key} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-200 font-poppins">{opt.label}</p>
                  <p className="text-xs text-slate-500 font-poppins mt-0.5">{opt.desc}</p>
                </div>
                <Toggle value={prefs[opt.key] as boolean} onChange={() => update(opt.key, !prefs[opt.key])} />
              </div>
            ))}
          </div>
        </div>

        {/* Research Data Sharing */}
        <div className="rounded-2xl bg-primary/[0.05] border-primary/10 p-5">
          <div className="flex items-start gap-3">
            <Share2 className="w-5 h-5 text-primary-glow mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white font-poppins mb-0.5">Academic Research Contribution</p>
              <p className="text-xs text-slate-400 font-poppins leading-relaxed mb-3">
                Opt in to share anonymized usage patterns to help improve UniMind and contribute to academic research on student collaboration tools.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-glow font-poppins font-medium">Anonymous & voluntary — withdraw anytime</span>
                <Toggle value={prefs.data_sharing_research} onChange={() => update('data_sharing_research', !prefs.data_sharing_research)} />
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold font-poppins transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          {saving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </button>
      </div>

      <AnimatePresence>
        {showSaved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 right-8 z-50 bg-emerald-500/10 text-emerald-400 px-5 py-3 rounded-xl text-sm font-semibold font-poppins flex items-center gap-2 border border-emerald-500/20 shadow-lg">
            <CheckCircle className="w-4 h-4" /> Privacy settings saved!
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsPageLayout>
  );
};
