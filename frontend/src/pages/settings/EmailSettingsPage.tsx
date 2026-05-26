import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';

export const EmailSettingsPage = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newEmail, setNewEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const handleUpdateEmail = async () => {
    if (!newEmail.includes('@')) {
      setEmailStatus({ type: 'error', msg: 'Please enter a valid email address.' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      setEmailStatus({ type: 'error', msg: error.message });
    } else {
      setEmailStatus({ type: 'success', msg: 'Verification link sent to both old and new email addresses.' });
      setNewEmail('');
    }
  };

  return (
    <SettingsPageLayout title="Email Settings" icon={<Mail className="w-6 h-6 text-cyan-400" />}>
      <div className="glass-card border border-white/[0.08] rounded-2xl p-6 md:p-8 bg-slate-900/30 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white font-outfit mb-1">Email Address</h3>
            <p className="text-xs text-slate-400 font-poppins">Manage the email address associated with your account.</p>
          </div>
          
          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <p className="text-xs text-slate-400 font-poppins mb-1">Current Email</p>
            <p className="text-sm text-slate-200 font-poppins font-medium">{currentUser?.email || 'N/A'}</p>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 font-poppins">New Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email"
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
          
          {emailStatus && (
            <div className={`p-3 rounded-xl text-xs font-poppins flex items-center gap-2 ${emailStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {emailStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {emailStatus.msg}
            </div>
          )}
          
          <button onClick={handleUpdateEmail} className="px-5 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm font-semibold rounded-xl transition-colors font-poppins">
            Update Email
          </button>
        </div>
      </div>
    </SettingsPageLayout>
  );
};
