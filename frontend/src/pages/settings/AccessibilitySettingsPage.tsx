import { useState, useEffect } from 'react';
import { Monitor, CheckCircle, Eye, Zap, Keyboard } from 'lucide-react';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';

const Toggle = ({ value, onChange, color = 'bg-orange-500' }: { value: boolean; onChange: () => void; color?: string }) => (
  <button onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors ${value ? color : 'bg-white/10'}`}>
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
  </button>
);

interface A11yPrefs {
  reduce_motion: boolean;
  high_contrast: boolean;
  screen_reader_hints: boolean;
}

export const AccessibilitySettingsPage = () => {
  const [prefs, setPrefs] = useState<A11yPrefs>({
    reduce_motion: false,
    high_contrast: false,
    screen_reader_hints: false,
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
          .select('reduce_motion, high_contrast, screen_reader_hints')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setPrefs({ reduce_motion: data.reduce_motion ?? false, high_contrast: data.high_contrast ?? false, screen_reader_hints: data.screen_reader_hints ?? false });
        }
      }
    };
    fetch();
  }, []);

  const toggle = (key: keyof A11yPrefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    await supabase.from('user_preferences').upsert({ user_id: userId, ...prefs }, { onConflict: 'user_id' });
    setSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const settings = [
    {
      key: 'reduce_motion' as keyof A11yPrefs,
      label: 'Reduce Motion',
      desc: 'Minimize animations and transitions throughout the app. Helpful for motion sensitivity or low-power devices.',
      icon: Zap,
      color: 'bg-orange-500',
      iconColor: 'text-orange-400',
    },
    {
      key: 'high_contrast' as keyof A11yPrefs,
      label: 'High Contrast Mode',
      desc: 'Increase color contrast between text and backgrounds for better readability.',
      icon: Eye,
      color: 'bg-yellow-500',
      iconColor: 'text-yellow-400',
    },
    {
      key: 'screen_reader_hints' as keyof A11yPrefs,
      label: 'Screen Reader Hints',
      desc: 'Add descriptive ARIA labels and enhanced focus indicators to assist screen reader users.',
      icon: Monitor,
      color: 'bg-blue-500',
      iconColor: 'text-blue-400',
    },
  ];

  return (
    <SettingsPageLayout title="Accessibility" icon={<Monitor className="w-6 h-6 text-orange-400" />}>
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Left Column */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Main Toggles */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Display & Motion</h3>
            <p className="text-xs text-slate-400 font-poppins mb-5">Adjust visual and motion settings for a comfortable experience</p>
            <div className="space-y-5">
              {settings.map(s => (
                <div key={s.key} className="flex items-start gap-4 py-3 border-b border-white/[0.04] last:border-0">
                  <div className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0`}>
                    <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 font-poppins">{s.label}</p>
                    <p className="text-xs text-slate-500 font-poppins mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                  <Toggle value={prefs[s.key]} onChange={() => toggle(s.key)} color={s.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Dyslexia-friendly tip */}
          <div className="rounded-2xl bg-orange-500/[0.05] border border-orange-500/10 p-4">
            <p className="text-xs text-orange-300 font-poppins leading-relaxed">
              <span className="font-semibold">Tip:</span> If you use a system-level accessibility tool (Windows Narrator, macOS VoiceOver), enabling "Screen Reader Hints" above will improve compatibility.
            </p>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold font-poppins transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(234,88,12,0.2)] w-fit">
            {saving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Accessibility Settings'}
          </button>
        </div>

        {/* Right Column */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Keyboard Shortcuts Info */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-orange-400" /> Keyboard Shortcuts
            </h3>
            <p className="text-xs text-slate-400 font-poppins mb-4">Quick-access shortcuts available throughout UniMind</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { keys: ['Ctrl', 'K'], action: 'Open command palette' },
                { keys: ['Ctrl', '/'], action: 'Toggle sidebar' },
                { keys: ['Ctrl', 'N'], action: 'New note' },
                { keys: ['Escape'], action: 'Close modal / panel' },
                { keys: ['?'], action: 'Show keyboard shortcuts' },
                { keys: ['G', 'H'], action: 'Go to Dashboard' },
              ].map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-xs text-slate-400 font-poppins">{shortcut.action}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((k, ki) => (
                      <span key={ki} className="px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded text-[10px] text-slate-300 font-mono font-semibold">{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Blindness Filters */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1 flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-400" /> Color Blindness Filters
            </h3>
            <p className="text-xs text-slate-400 font-poppins mb-4">Apply color correction for visual accessibility</p>
            <div className="space-y-2">
              {[
                { id: 'none', label: 'Default', desc: 'No color filter' },
                { id: 'protanopia', label: 'Protanopia', desc: 'Red-blind correction' },
                { id: 'deuteranopia', label: 'Deuteranopia', desc: 'Green-blind correction' },
                { id: 'tritanopia', label: 'Tritanopia', desc: 'Blue-blind correction' }
              ].map((filter) => (
                <button key={filter.id} onClick={() => {}}
                  className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all text-left ${
                    filter.id === 'none' ? 'border-orange-500 bg-orange-500/10' : 'border-white/[0.06] hover:border-white/20'
                  }`}>
                  <div>
                    <span className={`block font-semibold text-sm ${filter.id === 'none' ? 'text-orange-400' : 'text-slate-300'}`}>{filter.label}</span>
                    <span className="block text-[10px] text-slate-500 font-poppins mt-0.5">{filter.desc}</span>
                  </div>
                  {filter.id === 'none' && <CheckCircle className="w-4 h-4 text-orange-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSaved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 right-8 z-50 bg-emerald-500/10 text-emerald-400 px-5 py-3 rounded-xl text-sm font-semibold font-poppins flex items-center gap-2 border border-emerald-500/20 shadow-lg">
            <CheckCircle className="w-4 h-4" /> Accessibility settings saved!
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsPageLayout>
  );
};
