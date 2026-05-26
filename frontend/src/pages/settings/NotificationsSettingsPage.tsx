import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Moon, Volume2, VolumeX } from 'lucide-react';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';

interface Prefs {
  push_notifs: boolean;
  email_notifs: boolean;
  notif_sound: boolean;
  notif_likes: boolean;
  notif_comments: boolean;
  notif_messages: boolean;
  notif_community: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const defaultPrefs: Prefs = {
  push_notifs: true,
  email_notifs: true,
  notif_sound: true,
  notif_likes: true,
  notif_comments: true,
  notif_messages: true,
  notif_community: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
};

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-white/10'}`}>
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
  </button>
);

export const NotificationsSettingsPage = () => {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
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
          .select('push_notifs, email_notifs, notif_sound, notif_likes, notif_comments, notif_messages, notif_community, quiet_hours_start, quiet_hours_end')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setPrefs({ ...defaultPrefs, ...data });
        }
      }
    };
    fetch();
  }, []);

  const update = (key: keyof Prefs, val: any) => {
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

  const notifCategories = [
    { key: 'notif_likes' as keyof Prefs, label: 'Likes', desc: 'When someone likes your posts', color: 'text-rose-400' },
    { key: 'notif_comments' as keyof Prefs, label: 'Comments', desc: 'When someone comments on your posts', color: 'text-cyan-400' },
    { key: 'notif_messages' as keyof Prefs, label: 'Direct Messages', desc: 'When you receive a new message', color: 'text-primary-glow' },
    { key: 'notif_community' as keyof Prefs, label: 'Community Updates', desc: 'Activity in your communities', color: 'text-emerald-400' },
  ];

  return (
    <SettingsPageLayout 
      title="Notifications" 
      icon={<Bell className="w-6 h-6 text-rose-400" />}
      headerAction={
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold font-poppins transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
          {saving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Left Column */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Global Toggles */}
        <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
          <h3 className="text-base font-bold text-white font-outfit mb-1">Global Notifications</h3>
          <p className="text-xs text-slate-400 font-poppins mb-5">Master switches for all notification types</p>
          <div className="space-y-4">
            {[
              { key: 'push_notifs' as keyof Prefs, label: 'Push Notifications', desc: 'In-app and browser push alerts', icon: Bell },
              { key: 'email_notifs' as keyof Prefs, label: 'Email Digests', desc: 'Daily summary emails to your inbox', icon: Bell },
              { key: 'notif_sound' as keyof Prefs, label: 'Notification Sound', desc: 'Play a sound for new notifications', icon: prefs.notif_sound ? Volume2 : VolumeX },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-200 font-poppins">{item.label}</p>
                    <p className="text-xs text-slate-500 font-poppins">{item.desc}</p>
                  </div>
                </div>
                <Toggle value={prefs[item.key] as boolean} onChange={() => update(item.key, !prefs[item.key])} />
              </div>
            ))}
          </div>
        </div>

          {/* Quiet Hours */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" /> Quiet Hours
            </h3>
            <p className="text-xs text-slate-400 font-poppins mb-5">Pause all notifications during these hours</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-poppins font-semibold block mb-1.5">From</label>
                <input type="time" value={prefs.quiet_hours_start}
                  onChange={e => update('quiet_hours_start', e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-indigo-500/40 transition-colors" />
              </div>
              <div className="text-slate-500 mt-5 font-poppins">to</div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-poppins font-semibold block mb-1.5">Until</label>
                <input type="time" value={prefs.quiet_hours_end}
                  onChange={e => update('quiet_hours_end', e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-indigo-500/40 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Per-Category */}
        <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
          <h3 className="text-base font-bold text-white font-outfit mb-1">Notification Categories</h3>
          <p className="text-xs text-slate-400 font-poppins mb-5">Control which activities notify you</p>
          <div className="space-y-4">
            {notifCategories.map(cat => (
              <div key={cat.key} className={`flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0 ${!prefs.push_notifs ? 'opacity-40 pointer-events-none' : ''}`}>
                <div>
                  <p className={`text-sm font-medium font-poppins ${cat.color}`}>{cat.label}</p>
                  <p className="text-xs text-slate-500 font-poppins">{cat.desc}</p>
                </div>
                <Toggle value={prefs[cat.key] as boolean} onChange={() => update(cat.key, !prefs[cat.key])} />
              </div>
            ))}
          </div>
        </div>

        </div>
      </div>

      <AnimatePresence>
        {showSaved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 right-8 z-50 bg-emerald-500/10 text-emerald-400 px-5 py-3 rounded-xl text-sm font-semibold font-poppins flex items-center gap-2 border border-emerald-500/20 shadow-lg">
            <CheckCircle className="w-4 h-4" /> Notification preferences saved!
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsPageLayout>
  );
};
