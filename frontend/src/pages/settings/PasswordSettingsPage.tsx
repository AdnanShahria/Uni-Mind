import { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';

export const PasswordSettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters.' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus({ type: 'error', msg: error.message });
    } else {
      setPasswordStatus({ type: 'success', msg: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <SettingsPageLayout title="Password & Security" icon={<Lock className="w-6 h-6 text-emerald-400" />}>
      <div className="glass-card border border-white/[0.08] rounded-2xl p-6 md:p-8 bg-slate-900/30 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white font-outfit mb-1">Change Password</h3>
            <p className="text-xs text-slate-400 font-poppins">Ensure your account is using a long, random password to stay secure.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 font-poppins">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 font-poppins">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 font-poppins">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {passwordStatus && (
            <div className={`p-3 rounded-xl text-xs font-poppins flex items-center gap-2 ${passwordStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {passwordStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {passwordStatus.msg}
            </div>
          )}

          <button onClick={handleUpdatePassword} className="px-5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-xl transition-colors font-poppins">
            Update Password
          </button>
        </div>
      </div>
    </SettingsPageLayout>
  );
};
