import { useState } from 'react';
import { Database, Download, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { supabase } from '../../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export const DataManagementPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 2000);
  };

  const handleReset = async () => {
    if (confirmText !== 'RESET') {
      setResetError('Please type RESET to confirm.');
      return;
    }
    setIsResetting(true);
    setResetError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setResetError('Could not identify user. Please refresh and try again.');
      setIsResetting(false);
      return;
    }

    // Delete the user's content only — account stays intact
    const [postsRes, notesRes, commentsRes] = await Promise.all([
      supabase.from('posts').delete().eq('author_id', user.id),
      supabase.from('notes').delete().eq('user_id', user.id),
      supabase.from('post_comments').delete().eq('user_id', user.id),
    ]);

    const err = postsRes.error || notesRes.error || commentsRes.error;
    if (err) {
      setResetError(err.message);
      setIsResetting(false);
      return;
    }

    setIsResetting(false);
    setConfirmText('');
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 5000);
  };

  return (
    <SettingsPageLayout title="Data Management" icon={<Database className="w-6 h-6 text-indigo-400" />}>
      <div className="glass-card border border-white/[0.08] rounded-2xl p-6 md:p-8 bg-slate-900/30 max-w-2xl">
        <div className="space-y-8">

          {/* Export */}
          <div>
            <h3 className="text-lg font-bold text-white font-outfit mb-1">Export Academic Data</h3>
            <p className="text-xs text-slate-400 font-poppins mb-4 leading-relaxed">
              Download a copy of your posts, comments, notes, and profile data in JSON format. This process may take a few minutes.
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting || exportSuccess}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-sm font-semibold rounded-xl transition-all font-poppins disabled:opacity-50"
            >
              {isExporting ? (
                <span className="w-4 h-4 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
              ) : exportSuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? 'Preparing Download...' : exportSuccess ? 'Export Sent to Email' : 'Request Data Export'}
            </button>
          </div>

          {/* Reset Zone */}
          <div className="pt-8 border-t border-white/[0.06]">
            <h3 className="text-lg font-bold text-amber-400 font-outfit flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              Reset Account
            </h3>
            <p className="text-xs text-slate-400 font-poppins mb-1 leading-relaxed">
              This will permanently erase all your <span className="text-slate-200 font-medium">posts, notes, and comments</span> — but your account, profile, and login will remain untouched.
            </p>
            <p className="text-xs text-amber-400/70 font-poppins mb-4">You will not be signed out and no data will be sent to us.</p>

            <div className="p-5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 max-w-sm">
              <p className="text-xs text-amber-200 font-poppins mb-2 font-medium">
                To confirm, type <span className="font-bold text-amber-400">RESET</span> below:
              </p>
              <input
                type="text"
                value={confirmText}
                autoComplete="new-password"
                onChange={(e) => { setConfirmText(e.target.value); setResetError(''); }}
                placeholder="RESET"
                className="w-full bg-slate-950/50 border border-amber-500/30 rounded-lg px-4 py-2.5 text-amber-100 font-mono text-center tracking-widest outline-none focus:border-amber-500 transition-colors mb-4"
              />
              {resetError && (
                <p className="text-xs text-red-400 mb-3 font-poppins text-center">{resetError}</p>
              )}

              <button
                onClick={handleReset}
                disabled={confirmText !== 'RESET' || isResetting}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 text-sm font-semibold font-poppins transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Reset My Content
                  </>
                )}
              </button>
            </div>

            {/* Success toast */}
            <AnimatePresence>
              {resetSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold font-poppins max-w-sm"
                >
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Account content reset successfully. Your profile is safe.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </SettingsPageLayout>
  );
};
