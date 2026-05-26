import { useState } from 'react';
import { Key, Copy, Trash2 } from 'lucide-react';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { supabase } from '../../utils/supabaseClient';
import { useEffect } from 'react';

export const ApiKeysPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<{id: string, name: string, key_value: string, created_at: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('api_keys').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) {
          setApiKeys(data);
        }
      }
    };
    fetchKeys();
  }, []);

  const generateApiKey = async () => {
    if (!userId || isGenerating) return;
    setIsGenerating(true);
    
    const newKeyValue = 'unm_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const { data, error } = await supabase.from('api_keys').insert({
      user_id: userId,
      name: 'New API Key',
      key_value: newKeyValue
    }).select().single();

    if (data && !error) {
      setApiKeys([data, ...apiKeys]);
    }
    setIsGenerating(false);
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? Any applications using it will lose access.')) return;
    
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (!error) {
      setApiKeys(apiKeys.filter(k => k.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  return (
    <SettingsPageLayout title="API Keys" icon={<Key className="w-6 h-6 text-amber-400" />}>
      <div className="glass-card border border-white/[0.08] rounded-2xl p-6 md:p-8 bg-slate-900/30 max-w-2xl">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-outfit mb-1">Developer API Keys</h3>
              <p className="text-xs text-slate-400 font-poppins leading-relaxed">
                Use these keys to access the UniMind API. Do not share your keys with anyone.
              </p>
            </div>
            <button onClick={generateApiKey} disabled={isGenerating} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold rounded-xl transition-colors font-poppins whitespace-nowrap disabled:opacity-50">
              {isGenerating ? 'Generating...' : 'Generate New Key'}
            </button>
          </div>
          
          <div className="space-y-3">
            {apiKeys.length === 0 && (
              <p className="text-sm text-slate-500 font-poppins py-4 text-center">No API keys generated yet.</p>
            )}
            {apiKeys.map((k) => (
              <div key={k.id} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between gap-4 group hover:bg-white/[0.04] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 font-poppins">{k.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded truncate max-w-[200px] sm:max-w-xs">{k.key_value}</code>
                    <span className="text-[10px] text-slate-500 font-poppins">Created {new Date(k.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => copyToClipboard(k.key_value)} className="p-2 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white transition-colors" title="Copy to clipboard">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteApiKey(k.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Delete key">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsPageLayout>
  );
};
