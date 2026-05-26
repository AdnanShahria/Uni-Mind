import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { 
  ShieldAlert, CheckCircle2, XCircle, Clock, 
  Mail, Calendar, ArrowRight, Check, X,
  Filter, Search, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = profile?.role || user.user_metadata?.role || '';
        setUserRole(role);

        if (role.toLowerCase() === 'admin') {
          setIsAdmin(true);
          await fetchRequests();
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Admin verification error:", err);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('metadata_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const originalRequests = [...requests];
    
    // Optimistic UI Update
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    
    try {
      const { error } = await supabase
        .from('metadata_requests')
        .update({ status: action })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Request marked as ${action}`);
    } catch (err: any) {
      // Revert optimistic change
      setRequests(originalRequests);
      toast.error(err.message || `Failed to update request to ${action}`);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesTab = req.status === filterTab;
    const matchesSearch = 
      req.requester_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.new_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.old_value && req.old_value.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  if (isAdmin === null || (isLoading && requests.length === 0)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 rounded-full border border-white/5 bg-[#050810]/50 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary-glow animate-spin" />
          <Award className="w-6 h-6 text-primary-glow animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 font-poppins uppercase tracking-widest animate-pulse">
          Authenticating Admin Vault...
        </p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 relative">
          <div className="absolute -inset-1 rounded-2xl bg-red-500/5 blur-md pointer-events-none" />
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white font-outfit mb-2">Restricted Access Area</h2>
        <p className="text-xs text-slate-400 font-poppins leading-relaxed mb-6">
          Your current profile role is <span className="text-red-400 font-semibold">{userRole || 'Guest'}</span>. Only verified administrators with the 'admin' security credential are permitted to enter this neural registry console.
        </p>
        <a 
          href="/app"
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all hover:border-white/20"
        >
          Return to Dashboard
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 font-poppins"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-primary-glow font-semibold uppercase tracking-wider mb-1">
            <Award className="w-4.5 h-4.5" />
            <span>Academic Registry Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-outfit">Admin Panel</h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Review and validate dynamic rename or addition requests submitted by registering peers.
          </p>
        </div>

        <button 
          onClick={fetchRequests}
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all shadow-md self-start md:self-auto cursor-pointer"
        >
          Reload Registry Logs
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Tabs */}
        <div className="md:col-span-6 flex p-1 bg-white/5 rounded-xl border border-white/5 max-w-md w-full">
          {(['pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                filterTab === tab 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'pending' && <Clock className="w-3.5 h-3.5" />}
              {tab === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {tab === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="md:col-span-6 relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email, typos or suggestions..."
            className="w-full h-11 bg-white/5 border border-white/10 focus:border-primary-glow/50 rounded-xl px-4 pl-10 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
          />
        </div>
      </div>

      {/* Requests Display */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center text-slate-500 text-xs animate-pulse uppercase tracking-wider"
          >
            Fetching registry record items...
          </motion.div>
        ) : filteredRequests.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-white/5 bg-slate-900/10 p-12 text-center max-w-md mx-auto"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No requests found</h3>
            <p className="text-[11px] text-slate-500 font-light mt-1.5 leading-relaxed">
              There are no {filterTab} metadata suggestion records matching your search queries at the moment.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filteredRequests.map((req) => (
              <motion.div
                key={req.id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -2 }}
                className="relative overflow-hidden glass-panel border border-white/10 rounded-2xl bg-slate-950/40 backdrop-blur-xl p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header: Category & Type */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border font-mono uppercase ${
                      req.request_type === 'institution' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                      req.request_type === 'major' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                      'text-purple-400 bg-purple-500/10 border-purple-500/20'
                    }`}>
                      {req.request_type}
                    </span>

                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg font-mono uppercase ${
                      req.action_type === 'add' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                      'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                    }`}>
                      {req.action_type === 'add' ? 'Add New Option' : 'Rename Option'}
                    </span>
                  </div>

                  {/* Card Main: Content Values */}
                  <div className="space-y-2.5">
                    {req.action_type === 'rename' ? (
                      <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-3">
                        <div className="min-w-0">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wide">Current listed name</span>
                          <span className="text-xs text-red-400/80 font-medium line-through truncate block mt-0.5">{req.old_value}</span>
                        </div>
                        <ArrowRight className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wide">Proposed Correction</span>
                          <span className="text-xs text-emerald-400 font-semibold truncate block mt-0.5">{req.new_value}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wide">Proposed Entry to add</span>
                        <span className="text-xs text-slate-200 font-semibold block mt-0.5">{req.new_value}</span>
                      </div>
                    )}
                  </div>

                  {/* Requester Info & Date */}
                  <div className="pt-3.5 border-t border-white/5 flex flex-col gap-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-slate-300">{req.requester_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Submitted on: {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Pending Actions */}
                {req.status === 'pending' && (
                  <div className="flex gap-2.5 mt-5 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleAction(req.id, 'approved')}
                      className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="flex-1 h-9 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-slate-300 hover:text-red-400 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
