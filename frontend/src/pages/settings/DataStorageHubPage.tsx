import { motion } from 'framer-motion';
import {
  Database, HardDrive, Shield, ChevronRight,
  Download, RefreshCw, Globe, Lock, Users, BarChart2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';

const dataGroups = [
  {
    label: 'Your Data',
    items: [
      {
        path: '/app/settings/data',
        icon: Database,
        accentColor: 'text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        glow: 'from-indigo-500/15 to-violet-500/15',
        label: 'Data Management',
        desc: 'Export your posts, notes, and profile data — or reset your content.',
        badges: ['Export', 'Reset Content'],
        subIcons: [Download, RefreshCw],
      },
    ],
  },
  {
    label: 'Storage',
    items: [
      {
        path: '/app/settings/storage',
        icon: HardDrive,
        accentColor: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        glow: 'from-cyan-500/15 to-teal-500/15',
        label: 'Storage Usage',
        desc: 'See what files are using space — images, documents, and notes.',
        badges: ['2.4 GB used', '10 GB total'],
        subIcons: [BarChart2, HardDrive],
        extra: (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-500 font-poppins mb-1">
              <span>2.4 GB used of 10 GB</span>
              <span>24%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex">
              <div className="h-full bg-cyan-400/80 rounded-l-full" style={{ width: '15%' }} />
              <div className="h-full bg-emerald-400/80" style={{ width: '7%' }} />
              <div className="h-full bg-purple-400/80" style={{ width: '2%' }} />
            </div>
          </div>
        ),
      },
    ],
  },
  {
    label: 'Privacy & Visibility',
    items: [
      {
        path: '/app/settings/privacy',
        icon: Shield,
        accentColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'from-emerald-500/15 to-green-500/15',
        label: 'Privacy',
        desc: 'Control who can view your profile, posts, and academic activity.',
        badges: ['Public', 'Network', 'Private'],
        subIcons: [Globe, Lock],
        visibilityIcons: [Globe, Users, Lock],
      },
    ],
  },
];

export const DataStorageHubPage = () => {
  return (
    <SettingsPageLayout
      title="Data & Storage"
      icon={<Database className="w-6 h-6 text-indigo-400" />}
    >
      <div className="max-w-2xl space-y-4">
        <p className="text-xs text-slate-400 font-poppins -mt-4 px-1">
          Manage your data, monitor storage, and control your privacy settings.
        </p>

        {dataGroups.map((group, gi) => (
          <motion.div
            key={gi}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1 }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-poppins font-bold mb-2 px-1">
              {group.label}
            </p>
            {group.items.map((item, ii) => {
              const Icon = item.icon;
              const [Sub1, Sub2] = item.subIcons;
              return (
                <Link
                  key={ii}
                  to={item.path}
                  className="group block rounded-2xl glass-card border border-white/[0.06] hover:border-white/[0.12] p-5 transition-all duration-200 hover:bg-white/[0.02] relative overflow-hidden"
                >
                  {/* Glow bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${item.bgColor} border ${item.border} flex items-center justify-center shrink-0 shadow-lg`}>
                        <Icon className={`w-6 h-6 ${item.accentColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-slate-100 font-poppins group-hover:text-white transition-colors">
                            {item.label}
                          </p>
                          <div className="flex items-center gap-1 ml-1">
                            <Sub1 className={`w-3.5 h-3.5 ${item.accentColor} opacity-40`} />
                            <Sub2 className={`w-3.5 h-3.5 ${item.accentColor} opacity-40`} />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-poppins leading-relaxed">{item.desc}</p>
                        <div className="flex gap-1.5 mt-2.5 flex-wrap">
                          {item.badges.map((b, bi) => (
                            <span
                              key={bi}
                              className={`text-[10px] font-medium font-poppins px-2 py-0.5 rounded-md ${item.bgColor} ${item.accentColor} border ${item.border}`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                        {/* Extra content like storage bar */}
                        {(item as any).extra && (item as any).extra}
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0 self-start mt-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        ))}

        {/* Reset zone shortcut */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-amber-500/[0.04] border border-amber-500/10 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-300 font-poppins">Reset Zone</p>
              <p className="text-[11px] text-slate-500 font-poppins mt-0.5">Clear your content — your account stays safe and signed in.</p>
            </div>
          </div>
          <Link
            to="/app/settings/data"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold font-poppins transition-colors"
          >
            Manage
          </Link>
        </motion.div>
      </div>
    </SettingsPageLayout>
  );
};
