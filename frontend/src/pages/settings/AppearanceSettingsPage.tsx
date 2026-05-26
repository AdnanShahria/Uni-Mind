import { useState, useEffect } from 'react';
import { Palette, CheckCircle, Monitor } from 'lucide-react';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { useTheme, AppTheme, ScrollbarStyle } from '../../contexts/ThemeContext';

const THEMES = [
  {
    id: 'dark',
    name: 'Abyss Dark',
    desc: 'Default deep dark theme',
    preview: 'from-slate-900 to-slate-800',
    accent: 'bg-blue-500',
    tag: 'Default',
  },
  {
    id: 'midnight-ocean',
    name: 'Midnight Ocean',
    desc: 'Deep navy + electric cyan + gold',
    preview: 'from-[#060c1f] to-[#0d1f3c]',
    accent: 'bg-cyan-400',
    tag: 'Premium',
  },
  {
    id: 'nebula-purple',
    name: 'Nebula Purple',
    desc: 'Dark violet + neon indigo accents',
    preview: 'from-[#0e0618] to-[#1a0b35]',
    accent: 'bg-purple-400',
    tag: 'Vibrant',
  },
  {
    id: 'matrix-scholar',
    name: 'Matrix Scholar',
    desc: 'True black + lime green terminal feel',
    preview: 'from-[#000000] to-[#0a0f0a]',
    accent: 'bg-green-400',
    tag: 'Hacker',
  },
  {
    id: 'aurora-dark',
    name: 'Aurora Dark',
    desc: 'Charcoal + pink-to-purple gradient',
    preview: 'from-[#0d0d14] to-[#130a1e]',
    accent: 'bg-pink-400',
    tag: 'Elegant',
  },
  {
    id: 'solar-scholar',
    name: 'Solar Scholar',
    desc: 'Warm dark gray + amber + orange',
    preview: 'from-[#120c00] to-[#1e1500]',
    accent: 'bg-amber-400',
    tag: 'Warm',
  },
];

const ACCENT_COLORS = [
  { id: 'blue', label: 'Ocean Blue', cls: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'purple', label: 'Royal Purple', cls: 'bg-purple-500', ring: 'ring-purple-500' },
  { id: 'teal', label: 'Academic Teal', cls: 'bg-teal-500', ring: 'ring-teal-500' },
  { id: 'pink', label: 'Aurora Pink', cls: 'bg-pink-500', ring: 'ring-pink-500' },
  { id: 'amber', label: 'Scholar Amber', cls: 'bg-amber-500', ring: 'ring-amber-500' },
  { id: 'emerald', label: 'Forest Emerald', cls: 'bg-emerald-500', ring: 'ring-emerald-500' },
];

const FONT_SIZES = [
  { id: 'small', label: 'Small', example: 'text-xs' },
  { id: 'medium', label: 'Medium', example: 'text-sm' },
  { id: 'large', label: 'Large', example: 'text-base' },
];

const SCROLLBAR_STYLES = [
  { id: 'default', label: 'Standard', desc: 'Native browser feel' },
  { id: 'minimal', label: 'Minimal', desc: 'Thin and unobtrusive' },
  { id: 'green', label: 'Green Glow', desc: 'Distinct emerald scrollbar' },
  { id: 'hidden', label: 'Hidden', desc: 'No visible scrollbar' },
];

export const AppearanceSettingsPage = () => {
  const {
    theme: globalTheme, setTheme: setGlobalTheme,
    accentColor: globalAccent, setAccentColor: setGlobalAccent,
    fontSize: globalFont, setFontSize: setGlobalFont,
    scrollbarStyle: globalScrollbar, setScrollbarStyle: setGlobalScrollbar,
    compactMode: globalCompact, setCompactMode: setGlobalCompact
  } = useTheme();

  const [localTheme, setLocalTheme] = useState<AppTheme>(globalTheme);
  const [fontSize, setFontSizeLocal] = useState<any>(globalFont);
  const [accentColor, setAccentColorLocal] = useState<any>(globalAccent);
  const [scrollbarStyle, setScrollbarStyleLocal] = useState<ScrollbarStyle>(globalScrollbar);
  const [compactMode, setCompactModeLocal] = useState<boolean>(globalCompact);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animationIntensity, setAnimationIntensity] = useState('full');
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('user_preferences')
          .select('theme, font_size, accent_color, compact_mode, sidebar_collapsed')
          .eq('user_id', user.id)
          .single();
        if (data) {
          if (data.theme) {
            setLocalTheme(data.theme as AppTheme);
            setGlobalTheme(data.theme as AppTheme);
          }
          if (data.font_size) {
            setFontSizeLocal(data.font_size);
            setGlobalFont(data.font_size as any);
          }
          if (data.accent_color) {
            setAccentColorLocal(data.accent_color);
            setGlobalAccent(data.accent_color as any);
          }
          if (data.compact_mode !== null) {
            setCompactModeLocal(data.compact_mode);
            setGlobalCompact(data.compact_mode);
          }
          setSidebarCollapsed(data.sidebar_collapsed ?? false);
        }
      }
    };
    fetch();
  }, []);

  const handleSave = async (updates: Record<string, any>) => {
    if (!userId) return;
    // Optimistic state
    if (updates.theme !== undefined) {
      setLocalTheme(updates.theme);
      setGlobalTheme(updates.theme);
    }
    if (updates.font_size !== undefined) {
      setFontSizeLocal(updates.font_size);
      setGlobalFont(updates.font_size);
    }
    if (updates.accent_color !== undefined) {
      setAccentColorLocal(updates.accent_color);
      setGlobalAccent(updates.accent_color);
    }
    if (updates.scrollbar_style !== undefined) {
      setScrollbarStyleLocal(updates.scrollbar_style);
      setGlobalScrollbar(updates.scrollbar_style);
      delete updates.scrollbar_style; // don't send to DB as column doesn't exist yet
    }
    if (updates.compact_mode !== undefined) {
      setCompactModeLocal(updates.compact_mode);
      setGlobalCompact(updates.compact_mode);
    }
    if (updates.sidebar_collapsed !== undefined) setSidebarCollapsed(updates.sidebar_collapsed);

    await supabase.from('user_preferences').upsert(
      { user_id: userId, ...updates },
      { onConflict: 'user_id' }
    );
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2500);
  };

  const activeTheme = THEMES.find(t => t.id === localTheme) || THEMES[0];

  return (
    <SettingsPageLayout title="Appearance" icon={<Palette className="w-6 h-6 text-purple-400" />}>
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* Left Column */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Theme Selector */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30 relative">
            <h3 className="text-base font-bold text-white font-outfit mb-1 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-400" /> Theme
            </h3>
            <p className="text-xs text-slate-400 font-poppins mb-5">Choose the visual style of UniMind</p>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(t => (
                <motion.button key={t.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleSave({ theme: t.id })}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all text-left ${
                    localTheme === t.id ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/[0.06] hover:border-white/20'
                  }`}>
                  <div className={`h-10 bg-gradient-to-r ${t.preview} flex items-center px-3 gap-1.5`}>
                    <span className={`w-2 h-2 rounded-full ${t.accent}`} />
                    <span className="w-6 h-1 rounded-full bg-white/20" />
                    <span className="w-10 h-1 rounded-full bg-white/10" />
                  </div>
                  <div className="p-3 bg-slate-950/80">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[11px] font-semibold text-white font-poppins">{t.name}</p>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-poppins font-bold ${t.id === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-purple-500/20 text-purple-300'}`}>
                        {t.tag}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-poppins leading-snug">{t.desc}</p>
                  </div>
                  {localTheme === t.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Font Size</h3>
            <p className="text-xs text-slate-400 font-poppins mb-5">Adjust text size across the app</p>
            <div className="flex gap-3">
              {FONT_SIZES.map(f => (
                <button key={f.id} onClick={() => handleSave({ font_size: f.id })}
                  className={`flex-1 py-3 rounded-xl border-2 font-poppins transition-all ${
                    fontSize === f.id
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-white/[0.06] text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}>
                  <span className={`font-semibold ${f.example}`}>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Preferences */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Layout Preferences</h3>
            <p className="text-xs text-slate-400 font-poppins mb-5">Customize app layout and density</p>
            <div className="space-y-4">
              {[
                { label: 'Compact Mode', desc: 'Reduce padding and spacing for more content', value: compactMode, key: 'compact_mode' },
                { label: 'Collapsed Sidebar', desc: 'Start with sidebar collapsed by default', value: sidebarCollapsed, key: 'sidebar_collapsed' },
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-200 font-poppins">{opt.label}</p>
                    <p className="text-xs text-slate-500 font-poppins mt-0.5">{opt.desc}</p>
                  </div>
                  <button onClick={() => handleSave({ [opt.key]: !opt.value })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${opt.value ? 'bg-purple-500' : 'bg-white/10'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${opt.value ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Accent Color */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Accent Color</h3>
            <p className="text-xs text-slate-400 font-poppins mb-5">Personalizes buttons, links, and highlights</p>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map(c => (
                <button key={c.id} onClick={() => handleSave({ accent_color: c.id })}
                  className={`flex flex-col items-center gap-1.5 group`}>
                  <div className={`w-8 h-8 rounded-full ${c.cls} transition-all ${accentColor === c.id ? `ring-2 ring-offset-2 ring-offset-slate-900 ${c.ring} scale-110` : 'hover:scale-105'}`} />
                  <span className={`text-[9px] font-poppins ${accentColor === c.id ? 'text-white' : 'text-slate-500'}`}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Intensity */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Animation Intensity</h3>
            <p className="text-xs text-slate-400 font-poppins mb-5">Control the speed and scale of interface animations</p>
            <div className="flex gap-3">
              {[
                { id: 'full', label: 'Full', desc: 'Fluid & dynamic' },
                { id: 'reduced', label: 'Reduced', desc: 'Minimal motion' },
                { id: 'none', label: 'None', desc: 'Instant feedback' }
              ].map(anim => (
                <button key={anim.id} onClick={() => setAnimationIntensity(anim.id)}
                  className={`flex-1 p-2.5 rounded-xl border-2 font-poppins transition-all text-left ${
                    animationIntensity === anim.id
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-white/[0.06] text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}>
                  <span className="block font-semibold text-xs mb-0.5">{anim.label}</span>
                  <span className="block text-[9px] opacity-70 leading-tight">{anim.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrollbar Style */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Scrollbar Style</h3>
            <p className="text-xs text-slate-400 font-poppins mb-5">Customize how scrollbars appear in the app</p>
            <div className="flex gap-3">
              {SCROLLBAR_STYLES.map(s => (
                <button key={s.id} onClick={() => handleSave({ scrollbar_style: s.id })}
                  className={`flex-1 p-2.5 rounded-xl border-2 font-poppins transition-all text-left ${
                    scrollbarStyle === s.id
                      ? 'border-primary bg-primary/10 text-primary-glow'
                      : 'border-white/[0.06] text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}>
                  <span className="block font-semibold text-xs mb-0.5">{s.label}</span>
                  <span className="block text-[9px] opacity-70 leading-tight">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-3">Preview</h3>
            <div className={`rounded-xl bg-gradient-to-br ${activeTheme.preview} p-4 border border-white/5`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
                <div>
                  <div className="h-2.5 w-24 bg-white/30 rounded-full" />
                  <div className="h-2 w-16 bg-white/15 rounded-full mt-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-4/5 bg-white/10 rounded-full" />
                <div className="h-2 w-3/5 bg-white/10 rounded-full" />
              </div>
              <div className="flex gap-2 mt-3">
                <div className={`h-6 w-16 rounded-lg ${activeTheme.accent} opacity-80`} />
                <div className="h-6 w-16 rounded-lg bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Toast */}
      <AnimatePresence>
        {showSavedMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 right-8 z-50 bg-emerald-500/10 text-emerald-400 px-5 py-3 rounded-xl text-sm font-semibold font-poppins flex items-center gap-2 border border-emerald-500/20 shadow-lg">
            <CheckCircle className="w-4 h-4" /> Appearance saved!
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsPageLayout>
  );
};
