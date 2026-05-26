import { useState, useEffect } from 'react';
import { Globe, CheckCircle } from 'lucide-react';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'bn-BD', name: 'Bengali (Bangladesh)', flag: '🇧🇩' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
  { code: 'ur-PK', name: 'Urdu', flag: '🇵🇰' },
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Shanghai',
  'Asia/Tokyo', 'Asia/Seoul', 'Australia/Sydney', 'Pacific/Auckland',
];

const DATE_FORMATS = [
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '05/26/2026' },
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '26/05/2026' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-05-26' },
  { id: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '26 May 2026' },
];

const NUMBER_FORMATS = [
  { id: 'en-US', label: 'US Standard', example: '1,234.56' },
  { id: 'en-IN', label: 'Indian', example: '1,234.56' },
  { id: 'de-DE', label: 'European', example: '1.234,56' },
];

export const LanguageSettingsPage = () => {
  const [language, setLanguage] = useState('en-US');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [numberFormat, setNumberFormat] = useState('en-US');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Monday');
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
          .select('language, timezone, date_format, number_format')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setLanguage(data.language || 'en-US');
          setTimezone(data.timezone || 'UTC');
          setDateFormat(data.date_format || 'MM/DD/YYYY');
          setNumberFormat(data.number_format || 'en-US');
        }
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    await supabase.from('user_preferences').upsert(
      { user_id: userId, language, timezone, date_format: dateFormat, number_format: numberFormat },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const currentLang = LANGUAGES.find(l => l.code === language);

  return (
    <SettingsPageLayout 
      title="Language & Region" 
      icon={<Globe className="w-6 h-6 text-teal-400" />}
      headerAction={
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold font-poppins transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
          {saving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Language Settings'}
        </button>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Left Column */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Language */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Display Language</h3>
            <p className="text-xs text-slate-400 font-poppins mb-4">Choose the language for UniMind's interface</p>
            {/* Current Language Badge */}
            {currentLang && (
              <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 w-fit">
                <span className="text-xl">{currentLang.flag}</span>
                <span className="text-sm font-semibold text-teal-300 font-poppins">{currentLang.name}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                    language === lang.code
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                      : 'border-white/[0.04] text-slate-400 hover:bg-white/[0.03] hover:border-white/10 hover:text-slate-200'
                  }`}>
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-xs font-poppins font-medium">{lang.name}</span>
                  {language === lang.code && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* First Day of Week */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">First Day of Week</h3>
            <p className="text-xs text-slate-400 font-poppins mb-4">Choose which day your calendar starts on</p>
            <div className="flex gap-3">
              {['Sunday', 'Monday', 'Saturday'].map(day => (
                <button key={day} onClick={() => setFirstDayOfWeek(day)}
                  className={`flex-1 py-3 px-3 rounded-xl border-2 text-center transition-all ${
                    firstDayOfWeek === day
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-white/[0.06] hover:border-white/20'
                  }`}>
                  <p className="text-xs font-semibold text-white font-poppins">{day}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Timezone */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Timezone</h3>
            <p className="text-xs text-slate-400 font-poppins mb-4">Used for scheduling and activity timestamps</p>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins outline-none focus:border-teal-500/40 appearance-none cursor-pointer">
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz} className="bg-slate-900">{tz}</option>
              ))}
            </select>
          </div>

          {/* Date Format */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Date Format</h3>
            <p className="text-xs text-slate-400 font-poppins mb-4">How dates are displayed throughout the app</p>
            <div className="grid grid-cols-2 gap-3">
              {DATE_FORMATS.map(f => (
                <button key={f.id} onClick={() => setDateFormat(f.id)}
                  className={`py-3 px-4 rounded-xl border-2 text-left transition-all ${
                    dateFormat === f.id
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-white/[0.06] hover:border-white/20'
                  }`}>
                  <p className="text-xs font-semibold text-white font-poppins">{f.label}</p>
                  <p className="text-[10px] text-slate-400 font-poppins mt-0.5">e.g. {f.example}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Number Format */}
          <div className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
            <h3 className="text-base font-bold text-white font-outfit mb-1">Number Format</h3>
            <p className="text-xs text-slate-400 font-poppins mb-4">How numbers and decimals are displayed</p>
            <div className="flex gap-3">
              {NUMBER_FORMATS.map(f => (
                <button key={f.id} onClick={() => setNumberFormat(f.id)}
                  className={`flex-1 py-3 px-3 rounded-xl border-2 text-center transition-all ${
                    numberFormat === f.id
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-white/[0.06] hover:border-white/20'
                  }`}>
                  <p className="text-xs font-semibold text-white font-poppins">{f.label}</p>
                  <p className="text-[10px] text-teal-400 font-poppins mt-0.5 font-mono">{f.example}</p>
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
            <CheckCircle className="w-4 h-4" /> Language settings saved!
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsPageLayout>
  );
};
