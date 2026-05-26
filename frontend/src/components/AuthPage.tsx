import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, School, Mail, Lock, User, 
  GraduationCap, CheckCircle2, Sparkles, 
  Brain, Database, Layout, Eye, EyeOff, 
  Activity, ArrowRight, Check, X, AlertCircle, 
  HelpCircle, PlusCircle
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface AuthPageProps {
  initialTab?: 'login' | 'register';
  onBackToHome: () => void;
  onEnterWorkspace?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  initialTab = 'register', 
  onBackToHome,
  onEnterWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    institution: '',
    district: '',
    country: '',
    isUnlistedInstitution: false,
    major: '',
    session: '',
    role: 'Undergraduate',
    password: '',
    agree: false
  });

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Flow State
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [loadingStep, setLoadingStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Metadata Request Form State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestType, setRequestType] = useState<'institution' | 'major' | 'session'>('institution');
  const [actionType, setActionType] = useState<'add' | 'rename'>('add');
  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [requestError, setRequestError] = useState('');

  const loadingSteps = [
    'Verifying Academic Credentials...',
    'Synthesizing Neural Graph...',
    'Deploying Personal AI Workspace...',
    'Synchronizing Cognitive Databases...'
  ];

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    let interval: any;
    if (status === 'loading') {
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setStatus('success');
            return prev;
          }
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "institutionSelect") {
      if (value === "unlisted") {
         setRegForm(prev => ({ ...prev, isUnlistedInstitution: true, institution: '', district: '', country: '' }));
      } else {
         setRegForm(prev => ({ ...prev, isUnlistedInstitution: false, institution: value, district: '', country: '' }));
      }
      if (errors.institution) setErrors(prev => { const copy = { ...prev }; delete copy.institution; return copy; });
      return;
    }

    setRegForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleRegCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegForm(prev => ({ ...prev, agree: e.target.checked }));
    if (errors.agree) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.agree;
        return copy;
      });
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateReg = () => {
    const tempErrors: Record<string, string> = {};
    if (!regForm.name.trim()) tempErrors.name = 'Full name is required';
    if (!regForm.email.trim()) {
      tempErrors.email = 'Academic email is required';
    } else if (!/\S+@\S+\.\S+/.test(regForm.email)) {
      tempErrors.email = 'Please provide a valid email';
    }
    if (!regForm.institution.trim()) tempErrors.institution = 'Institution is required';
    if (regForm.isUnlistedInstitution && (!regForm.district.trim() || !regForm.country.trim())) {
      tempErrors.institution = 'District and Country are required for unlisted institutions';
    }
    if (!regForm.major.trim()) tempErrors.major = 'Field of study is required';
    if (regForm.password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    if (!regForm.agree) tempErrors.agree = 'You must agree to the Beta Access Terms';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateLogin = () => {
    const tempErrors: Record<string, string> = {};
    if (!loginForm.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      tempErrors.email = 'Please provide a valid email';
    }
    if (!loginForm.password) tempErrors.password = 'Password is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReg()) return;

    setLoadingStep(0);
    setStatus('loading');
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email: regForm.email,
        password: regForm.password,
        options: {
          data: {
            name: regForm.name,
            institution: regForm.institution,
            district: regForm.district,
            country: regForm.country,
            major: regForm.major,
            session: regForm.session,
            role: regForm.role,
          }
        }
      });

      if (error) {
        setStatus('idle');
        setErrors({ general: error.message || 'Registration failed' });
        return;
      }

      if (data.user) {
        // Build a mock user object based on metadata since the trigger will populate public.users in DB
        setDbUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || regForm.name,
          institution: data.user.user_metadata?.institution || regForm.institution,
          major: data.user.user_metadata?.major || regForm.major,
          role: data.user.user_metadata?.role || regForm.role,
        });
        // We let the useEffect loading animation finish, which then sets status='success'
      }
    } catch (err: any) {
      console.warn("Auth error:", err.message || err);
      setStatus('idle');
      setErrors({ general: err.message || 'An unexpected error occurred' });
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail.trim()) {
      setRequestError('Email is required');
      return;
    }
    if (!newValue.trim()) {
      setRequestError('Value is required');
      return;
    }
    if (actionType === 'rename' && !oldValue.trim()) {
      setRequestError('Existing name is required');
      return;
    }

    setRequestStatus('submitting');
    setRequestError('');

    try {
      const { error } = await supabase.from('metadata_requests').insert([
        {
          requester_email: requestEmail,
          request_type: requestType,
          action_type: actionType,
          old_value: actionType === 'rename' ? oldValue : null,
          new_value: newValue,
          status: 'pending'
        }
      ]);

      if (error) {
        setRequestStatus('error');
        setRequestError(error.message || 'Failed to submit request');
      } else {
        setRequestStatus('success');
        setOldValue('');
        setNewValue('');
      }
    } catch (err: any) {
      setRequestStatus('error');
      setRequestError(err.message || 'An unexpected error occurred');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoadingStep(0);
    setStatus('loading');
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        setStatus('idle');
        setErrors({ general: error.message || 'Invalid credentials' });
        return;
      }

      if (data.user) {
        setDbUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'Scholar',
          institution: data.user.user_metadata?.institution || 'UniMind Cloud',
          major: data.user.user_metadata?.major || 'Deep Work',
          role: data.user.user_metadata?.role || 'Researcher',
        });
      }
    } catch (err: any) {
      console.warn("Login error:", err.message || err);
      setStatus('idle');
      setErrors({ general: err.message || 'An unexpected error occurred' });
    }
  };

  // Features list shown on the left panel
  const brandingFeatures = [
    {
      icon: <Brain className="w-5 h-5 text-primary-glow" />,
      title: "AI-Powered Notes Synthesis",
      desc: "Connect papers, lectures, and datasets. Watch AI generate real-time multi-dimensional knowledge maps."
    },
    {
      icon: <Database className="w-5 h-5 text-secondary-glow" />,
      title: "Semantic Database Sync",
      desc: "Instant search across all your uploaded publications, files, and annotations with vector precision."
    },
    {
      icon: <Layout className="w-5 h-5 text-accent-glow" />,
      title: "Clutter-Free Workspace",
      desc: "A premium environment focused entirely on deep research, peer editing, and layout synthesis."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden font-poppins selection:bg-primary/30 selection:text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-secondary/10 blur-[150px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[35%] h-[35%] rounded-full bg-accent/5 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />

      {/* Sleek Floating Navigation Bar */}
      <div className="absolute top-6 left-6 z-40">
        <button 
          onClick={onBackToHome}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
      </div>

      <div className="relative z-10 w-full max-w-6xl rounded-[32px] overflow-hidden glass-panel border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-12 bg-slate-950/40 backdrop-blur-xl">
        
        {/* LEFT PANEL: BRANDING & BENEFITS SHOWCASE */}
        <div className="lg:col-span-5 relative p-8 sm:p-10 md:p-12 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#040813] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 blur-3xl rounded-full pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10 flex items-center gap-3 mb-10 lg:mb-0">
            <div className="w-10 h-10 rounded-xl border border-primary/30 flex items-center justify-center bg-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.1)] overflow-hidden">
              <img src="/logo.png" className="w-full h-full object-cover" alt="UniMind" />
            </div>
            <div>
              <span className="text-2xl font-bold font-poppins tracking-wider text-slate-100">
                Uni<span className="text-gradient">Mind</span>
              </span>
              <p className="text-[9px] text-primary-glow font-semibold uppercase tracking-widest font-poppins leading-none mt-0.5">Academic OS</p>
            </div>
          </div>

          {/* Benefits Bullet points */}
          <div className="relative z-10 my-8 lg:my-auto space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight font-outfit">
                Unlock Your <br />
                <span className="text-gradient font-bold">Infinite Workspace</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-light font-poppins leading-relaxed">
                Join a selected group of pioneering academics and research groups building the future of educational collaboration.
              </p>
            </div>

            <div className="space-y-5">
              {brandingFeatures.map((item, index) => (
                <div key={index} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:bg-white/10 group-hover:border-white/20 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-primary-glow transition-colors font-poppins">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-light leading-relaxed mt-0.5 font-poppins">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Beta Member Counter */}
          <div className="relative z-10 mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <Activity className="w-3.5 h-3.5 text-primary-glow animate-pulse" />
              <span className="text-[10px] text-slate-300 font-poppins font-medium">UniMind Beta Node v2.1</span>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase font-semibold font-poppins tracking-wider">Active Cohorts</p>
              <p className="text-xs font-bold text-emerald-400 font-poppins flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                1,482 Pioneers
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTIVE LOGIN/REGISTER FORMS OR LOADING/SUCCESS */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center min-h-[550px] relative">
          <AnimatePresence mode="wait">
            
            {/* IDLE FORM VIEW */}
            {status === 'idle' && (
              <motion.div
                key="idle-form-state"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
              >
                {/* Form Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 max-w-sm mb-8 relative z-10">
                  <button
                    onClick={() => { setActiveTab('register'); setErrors({}); }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${
                      activeTab === 'register' 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Join Beta
                  </button>
                  <button
                    onClick={() => { setActiveTab('login'); setErrors({}); }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${
                      activeTab === 'login' 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Login
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold font-outfit text-white">
                    {activeTab === 'register' ? 'Join Academic Registry' : 'Welcome Back, Scholar'}
                  </h3>
                  <p className="text-xs text-slate-400 font-poppins font-light mt-1">
                    {activeTab === 'register' 
                      ? 'Secure your early slot in the ultimate academic ecosystem.' 
                      : 'Sign in to access your synthesized neural workspace.'}
                  </p>
                  
                  {errors.general && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-poppins text-center font-medium mt-4 flex items-center justify-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      {errors.general}
                    </motion.div>
                  )}
                </div>

                {/* REGISTER FORM */}
                {activeTab === 'register' && (
                  <form onSubmit={handleRegSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            name="name"
                            value={regForm.name}
                            onChange={handleRegChange}
                            placeholder="Adnan Shahria"
                            className={`w-full h-11 bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-primary-glow/50'} rounded-xl px-3 pl-10 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
                          />
                        </div>
                        {errors.name && <p className="text-[10px] text-red-400 mt-1 font-poppins font-medium">{errors.name}</p>}
                      </div>

                      {/* Academic Email */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Academic Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="email"
                            name="email"
                            value={regForm.email}
                            onChange={handleRegChange}
                            placeholder="adnan@university.edu"
                            className={`w-full h-11 bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-primary-glow/50'} rounded-xl px-3 pl-10 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
                          />
                        </div>
                        {errors.email && <p className="text-[10px] text-red-400 mt-1 font-poppins font-medium">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Institution */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">University / Institution</label>
                        {!regForm.isUnlistedInstitution ? (
                          <div className="relative">
                            <select
                              name="institutionSelect"
                              onChange={handleRegChange}
                              value={regForm.institution || ""}
                              className={`w-full h-11 bg-[#090d16] border ${errors.institution ? 'border-red-500/50' : 'border-white/10 focus:border-primary-glow/50'} rounded-xl px-3 text-xs sm:text-sm text-slate-200 outline-none cursor-pointer appearance-none transition-all`}
                            >
                              <option value="" disabled>Select Institution</option>
                              <option value="Bangladesh University of Engineering and Technology">Bangladesh University of Engineering and Technology</option>
                              <option value="University of Dhaka">University of Dhaka</option>
                              <option value="Shahjalal University of Science & Technology">Shahjalal University of Science & Technology</option>
                              <option value="Stanford University">Stanford University</option>
                              <option value="unlisted" className="text-primary-glow font-bold">Can't find your institution? Add new</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs font-bold font-poppins">▼</div>
                          </div>
                        ) : (
                          <div className="relative flex flex-col gap-3">
                            <div className="relative">
                              <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input
                                type="text"
                                name="institution"
                                value={regForm.institution}
                                onChange={handleRegChange}
                                placeholder="Enter Custom Institution Name"
                                className={`w-full h-11 bg-white/5 border ${errors.institution ? 'border-red-500/50' : 'border-white/10 focus:border-primary-glow/50'} rounded-xl px-3 pl-10 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
                              />
                            </div>
                            <div className="flex gap-2">
                              <input type="text" name="district" value={regForm.district} onChange={handleRegChange} placeholder="District" className="w-1/2 h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-primary-glow/50" />
                              <input type="text" name="country" value={regForm.country} onChange={handleRegChange} placeholder="Country" className="w-1/2 h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-primary-glow/50" />
                            </div>
                            <button type="button" onClick={() => setRegForm(prev => ({...prev, isUnlistedInstitution: false, institution: ''}))} className="text-[10px] text-primary-glow text-left hover:underline">← Back to list</button>
                          </div>
                        )}
                        {errors.institution && <p className="text-[10px] text-red-400 mt-1 font-poppins font-medium">{errors.institution}</p>}
                      </div>

                      {/* Major */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Field of Study / Major</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            name="major"
                            list="majors"
                            value={regForm.major}
                            onChange={handleRegChange}
                            placeholder="e.g. Computer Science"
                            className={`w-full h-11 bg-white/5 border ${errors.major ? 'border-red-500/50' : 'border-white/10 focus:border-primary-glow/50'} rounded-xl px-3 pl-10 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
                          />
                          <datalist id="majors">
                            <option value="Computer Science & Engineering" />
                            <option value="Electrical & Electronic Engineering" />
                            <option value="Mechanical Engineering" />
                            <option value="Civil Engineering" />
                            <option value="Business Administration" />
                            <option value="Economics" />
                            <option value="Physics" />
                            <option value="Mathematics" />
                            <option value="Medicine" />
                            <option value="Law" />
                          </datalist>
                        </div>
                        {errors.major && <p className="text-[10px] text-red-400 mt-1 font-poppins font-medium">{errors.major}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Session / Batch */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Session / Batch</label>
                        <div className="relative">
                          <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            name="session"
                            list="sessions"
                            value={regForm.session}
                            onChange={handleRegChange}
                            placeholder="e.g. 2021-2022"
                            className={`w-full h-11 bg-white/5 border border-white/10 focus:border-primary-glow/50 rounded-xl px-3 pl-10 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
                          />
                          <datalist id="sessions">
                            <option value="2019-2020" />
                            <option value="2020-2021" />
                            <option value="2021-2022" />
                            <option value="2022-2023" />
                            <option value="2023-2024" />
                            <option value="2024-2025" />
                          </datalist>
                        </div>
                      </div>

                      {/* Academic Role */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Academic Role</label>
                        <div className="relative">
                          <select
                            name="role"
                            value={regForm.role}
                            onChange={handleRegChange}
                            className="w-full h-11 bg-[#090d16] border border-white/10 focus:border-primary-glow/50 rounded-xl px-3 text-xs sm:text-sm text-slate-200 outline-none cursor-pointer appearance-none transition-all"
                          >
                            <option value="Undergraduate">Undergraduate Student</option>
                            <option value="Graduate / PhD">Graduate / PhD Candidate</option>
                            <option value="Researcher">Academic Researcher</option>
                            <option value="Professor">Professor / Mentor</option>
                            <option value="Other">Other Academic Expert</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs font-bold font-poppins">▼</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Password */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Secure Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={regForm.password}
                            onChange={handleRegChange}
                            placeholder="••••••••"
                            className={`w-full h-11 bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-primary-glow/50'} rounded-xl px-3 pl-10 pr-10 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[10px] text-red-400 mt-1 font-poppins font-medium">{errors.password}</p>}
                      </div>
                    </div>

                    {/* Agree checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          checked={regForm.agree}
                          onChange={handleRegCheckbox}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          regForm.agree 
                            ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                            : 'border-white/20 bg-white/5 group-hover:border-white/40'
                        }`}>
                          {regForm.agree && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors font-poppins font-light leading-relaxed">
                          I agree to the <span className="text-primary-glow hover:underline font-normal">UniMind Beta Onboarding Terms</span> and data isolation protocol.
                        </span>
                      </label>
                      {errors.agree && <p className="text-[10px] text-red-400 mt-1 font-poppins font-medium">{errors.agree}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary-glow text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-6 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
                      Request Beta Access
                    </button>

                    {/* Metadata Suggestion / Request Link */}
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setRequestEmail(regForm.email || '');
                          setShowRequestModal(true);
                          setRequestStatus('idle');
                          setRequestError('');
                        }}
                        className="text-[11px] text-slate-400 hover:text-primary-glow transition-colors font-poppins underline bg-transparent border-none cursor-pointer"
                      >
                        Missing your university, major, or session? Suggest a change
                      </button>
                    </div>
                  </form>
                )}

                {/* LOGIN FORM */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Academic Email */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">Academic Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          name="email"
                          value={loginForm.email}
                          onChange={handleLoginChange}
                          placeholder="adnan@university.edu"
                          className={`w-full h-11 bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-primary-glow/50'} rounded-xl px-3 pl-10 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
                        />
                      </div>
                      {errors.email && <p className="text-[10px] text-red-400 mt-1 font-poppins font-medium">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[11px] font-semibold text-slate-300 font-poppins uppercase tracking-wide">Password</label>
                        <a href="#" className="text-[10px] text-primary-glow hover:underline font-poppins">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={loginForm.password}
                          onChange={handleLoginChange}
                          placeholder="••••••••"
                          className={`w-full h-11 bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-primary-glow/50'} rounded-xl px-3 pl-10 pr-10 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-[10px] text-red-400 mt-1 font-poppins font-medium">{errors.password}</p>}
                    </div>

                    {/* Keep Signed In */}
                    <div className="pt-2 flex justify-between items-center select-none">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="sr-only" defaultChecked />
                        <div className="w-5 h-5 rounded-md border border-white/20 bg-white/5 flex items-center justify-center transition-all group-hover:border-white/40">
                          <Check className="w-3.5 h-3.5 stroke-[3] text-primary-glow" />
                        </div>
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors font-poppins font-light">
                          Keep academic node authorized
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary-glow text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-8 cursor-pointer"
                    >
                      <Brain className="w-4 h-4 text-blue-200" />
                      Authorize & Enter
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* DYNAMIC PROGRESS / LOADING STATE */}
            {status === 'loading' && (
              <motion.div
                key="loading-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center text-center py-10"
              >
                {/* Immersive circular loading animation */}
                <div className="w-20 h-20 rounded-full border border-white/5 bg-[#050810]/50 relative flex items-center justify-center mb-8">
                  {/* Glowing spinning indicator */}
                  <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary-glow animate-spin" />
                  <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-secondary-glow animate-spin-reverse" />
                  <Brain className="w-8 h-8 text-primary-glow animate-pulse" />
                </div>

                <div className="h-14 overflow-hidden relative w-full max-w-sm mb-4">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingStep}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-base sm:text-lg font-semibold text-slate-100 font-poppins"
                    >
                      {loadingSteps[loadingStep]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Progress bar percentage indicator */}
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                  />
                </div>
                
                <p className="text-[10px] text-slate-500 font-poppins font-light mt-3 tracking-wider uppercase">
                  Secure Academic Encryption Active
                </p>
              </motion.div>
            )}

            {/* REGISTER SUCCESS / WORKSPACE CONGRATULATIONS FLOW */}
            {status === 'success' && (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="w-full flex flex-col items-center justify-center text-center py-4"
              >
                {/* Glowing Success Badge */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6 relative">
                  <div className="absolute -inset-1 rounded-2xl bg-emerald-500/10 blur-md animate-pulse pointer-events-none" />
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-outfit text-white tracking-tight leading-tight">
                  Academic Node Authorized!
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-poppins font-light max-w-sm mt-2 leading-relaxed">
                  Congratulations <span className="text-white font-medium">{dbUser?.name || 'Scholar'}</span>, your profile at <span className="text-primary-glow font-medium">{dbUser?.institution || 'UniMind Cloud'}</span> is now fully provisioned.
                </p>

                {/* Simulated Workspace Specifications Card */}
                <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 p-5 mt-6 mb-8 text-left relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent blur-xl pointer-events-none" />
                  
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins border-b border-white/5 pb-2 mb-3 flex items-center justify-between">
                    <span>Provisioning Record</span>
                    <span className="text-emerald-400 lowercase">online</span>
                  </h4>

                  <div className="space-y-2.5 font-poppins text-xs font-light text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Security Identity:</span>
                      <span className="font-medium text-slate-200">{dbUser?.id || 'unimind-node-local'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Academic Major:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[180px]">{dbUser?.major || 'Deep Work'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Academic Role:</span>
                      <span className="font-medium text-slate-200">{dbUser?.role || 'Researcher'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Database Space:</span>
                      <span className="font-medium text-slate-200">10 GB isolated vault</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
                  <button
                    onClick={onEnterWorkspace || onBackToHome}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-primary hover:from-emerald-500 hover:to-primary-glow text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Suggestion / Rename Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg overflow-hidden glass-panel border border-white/10 rounded-3xl bg-slate-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-6 sm:p-8"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer animate-duration-150"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center text-primary-glow">
                  <HelpCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-outfit">Suggest Metadata Change</h3>
                  <p className="text-xs text-slate-400 font-poppins font-light leading-relaxed">
                    Request new university additions or report typos in majors and sessions.
                  </p>
                </div>
              </div>

              {requestStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-base font-bold text-white font-poppins">Request Submitted!</h4>
                  <p className="text-xs text-slate-400 font-poppins font-light max-w-xs mt-2 leading-relaxed">
                    Thank you! The UniMind Academic Registry board will review your request shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestStatus('idle');
                      setShowRequestModal(false);
                    }}
                    className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close Window
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4 font-poppins">
                  {requestError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{requestError}</span>
                    </div>
                  )}

                  {/* Requester Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Requester Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                        placeholder="your.email@university.edu"
                        className="w-full h-11 bg-white/5 border border-white/10 focus:border-primary-glow/50 rounded-xl px-3 pl-10 text-xs sm:text-sm text-slate-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Request Type */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Change Category</label>
                      <div className="relative">
                        <select
                          value={requestType}
                          onChange={(e) => setRequestType(e.target.value as any)}
                          className="w-full h-11 bg-[#090d16] border border-white/10 focus:border-primary-glow/50 rounded-xl px-3 text-xs text-slate-200 outline-none appearance-none transition-all cursor-pointer"
                        >
                          <option value="institution">University / Inst.</option>
                          <option value="major">Field / Major</option>
                          <option value="session">Session / Batch</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
                      </div>
                    </div>

                    {/* Action Type */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Action Requested</label>
                      <div className="relative">
                        <select
                          value={actionType}
                          onChange={(e) => setActionType(e.target.value as any)}
                          className="w-full h-11 bg-[#090d16] border border-white/10 focus:border-primary-glow/50 rounded-xl px-3 text-xs text-slate-200 outline-none appearance-none transition-all cursor-pointer"
                        >
                          <option value="add">Add Unlisted</option>
                          <option value="rename">Rename / Fix Typo</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
                      </div>
                    </div>
                  </div>

                  {/* Existing name (typo) field if rename selected */}
                  {actionType === 'rename' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Current Listed Name (with typo)</label>
                      <input
                        type="text"
                        required
                        value={oldValue}
                        onChange={(e) => setOldValue(e.target.value)}
                        placeholder="e.g. Dhaka Univarsity"
                        className="w-full h-11 bg-white/5 border border-white/10 focus:border-primary-glow/50 rounded-xl px-3 text-xs sm:text-sm text-slate-200 outline-none transition-all"
                      />
                    </motion.div>
                  )}

                  {/* New value field */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                      {actionType === 'add' ? 'Proposed New Entry Name' : 'Corrected Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder={
                        requestType === 'institution' ? 'e.g. University of Dhaka' :
                        requestType === 'major' ? 'e.g. Software Engineering' : 'e.g. 2025-2026'
                      }
                      className="w-full h-11 bg-white/5 border border-white/10 focus:border-primary-glow/50 rounded-xl px-3 text-xs sm:text-sm text-slate-200 outline-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={requestStatus === 'submitting'}
                    className="w-full h-12 bg-primary hover:bg-primary-glow text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-6 cursor-pointer disabled:opacity-50"
                  >
                    {requestStatus === 'submitting' ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <PlusCircle className="w-4 h-4" />
                    )}
                    <span>Submit Suggestion</span>
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
