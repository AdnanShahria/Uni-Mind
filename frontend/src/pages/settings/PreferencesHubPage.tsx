import { motion } from 'framer-motion';
import {
  Palette, Bell, Globe, Monitor, ChevronRight,
  Sun, Moon, Type, Vibrate, Mail, Clock, Accessibility,
  Volume2, Eye, Languages
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';

const preferenceGroups = [
  {
    label: 'Display',
    color: 'from-purple-500/20 to-violet-500/20',
    border: 'border-purple-500/20',
    items: [
      {
        path: '/app/settings/appearance',
        icon: Palette,
        accentColor: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        label: 'Appearance',
        desc: 'Theme, font size, and display preferences',
        badges: ['Dark Mode', 'Font Size'],
        subIcon1: Moon,
        subIcon2: Type,
      },
    ],
  },
  {
    label: 'Alerts & Communication',
    color: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/20',
    items: [
      {
        path: '/app/settings/notifications',
        icon: Bell,
        accentColor: 'text-rose-400',
        bgColor: 'bg-rose-500/10',
        label: 'Notifications',
        desc: 'Push alerts, email digests, and sound settings',
        badges: ['Push', 'Email', 'Sound'],
        subIcon1: Vibrate,
        subIcon2: Mail,
      },
    ],
  },
  {
    label: 'Localization',
    color: 'from-teal-500/20 to-cyan-500/20',
    border: 'border-teal-500/20',
    items: [
      {
        path: '/app/settings/language',
        icon: Globe,
        accentColor: 'text-teal-400',
        bgColor: 'bg-teal-500/10',
        label: 'Language & Region',
        desc: 'Display language, timezone, and date format',
        badges: ['Language', 'Timezone'],
        subIcon1: Languages,
        subIcon2: Clock,
      },
    ],
  },
  {
    label: 'Accessibility',
    color: 'from-orange-500/20 to-amber-500/20',
    border: 'border-orange-500/20',
    items: [
      {
        path: '/app/settings/accessibility',
        icon: Monitor,
        accentColor: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'Accessibility',
        desc: 'Screen reader support, motion, and contrast settings',
        badges: ['Motion', 'Contrast', 'Reader'],
        subIcon1: Eye,
        subIcon2: Volume2,
      },
    ],
  },
];

export const PreferencesHubPage = () => {
  return (
    <SettingsPageLayout
      title="Preferences"
      icon={<Sun className="w-6 h-6 text-amber-400" />}
    >
      <div className="max-w-2xl space-y-4">
        <p className="text-xs text-slate-400 font-poppins -mt-4 px-1">
          Customize how UniMind looks, sounds, and behaves for you.
        </p>

        {preferenceGroups.map((group, gi) => (
          <motion.div
            key={gi}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.08 }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-poppins font-bold mb-2 px-1">
              {group.label}
            </p>
            {group.items.map((item, ii) => {
              const Icon = item.icon;
              const Sub1 = item.subIcon1;
              const Sub2 = item.subIcon2;
              return (
                <Link
                  key={ii}
                  to={item.path}
                  className="group block rounded-2xl glass-card border border-white/[0.06] hover:border-white/[0.12] p-5 transition-all duration-200 hover:bg-white/[0.02] relative overflow-hidden"
                >
                  {/* Glow bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${group.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  <div className="relative flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.bgColor} border ${group.border} flex items-center justify-center shrink-0 shadow-lg`}>
                      <Icon className={`w-6 h-6 ${item.accentColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-100 font-poppins group-hover:text-white transition-colors">
                          {item.label}
                        </p>
                        <div className="flex items-center gap-1 ml-1">
                          <Sub1 className={`w-3.5 h-3.5 ${item.accentColor} opacity-50`} />
                          <Sub2 className={`w-3.5 h-3.5 ${item.accentColor} opacity-50`} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-poppins">{item.desc}</p>
                      <div className="flex gap-1.5 mt-2.5 flex-wrap">
                        {item.badges.map((b, bi) => (
                          <span
                            key={bi}
                            className={`text-[10px] font-medium font-poppins px-2 py-0.5 rounded-md ${item.bgColor} ${item.accentColor} border ${group.border}`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              );
            })}
          </motion.div>
        ))}

        {/* Quick tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 flex items-start gap-3"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
            <Accessibility className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300 font-poppins">Accessibility First</p>
            <p className="text-[11px] text-slate-500 font-poppins mt-0.5 leading-relaxed">
              UniMind is designed to work seamlessly with screen readers and keyboard-only navigation. Visit Accessibility to fine-tune your experience.
            </p>
          </div>
        </motion.div>
      </div>
    </SettingsPageLayout>
  );
};
