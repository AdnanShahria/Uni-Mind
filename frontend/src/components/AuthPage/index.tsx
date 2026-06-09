import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { turso } from '../../utils/tursoClient';
import toast from 'react-hot-toast';

import { BrandingPanel } from './BrandingPanel';
import { RequestMetadataModal } from './RequestMetadataModal';
import { LoadingSuccessStates } from './LoadingSuccessStates';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

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
  const [dbUser, setDbUser] = useState<any>(null);
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    institution: '',
    abbreviation: '',
    district: '',
    country: '',
    isUnlistedInstitution: false,
    major: '',
    isCustomMajor: false,
    session: '',
    isCustomSession: false,
    role: 'Undergraduate',
    isCustomRole: false,
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

  // Dynamic Custom State Lists
  const [customUniversities, setCustomUniversities] = useState<{ value: string; isCustom: boolean }[]>([]);
  const [customMajors, setCustomMajors] = useState<{ value: string; isCustom: boolean }[]>([]);
  const [customSessions, setCustomSessions] = useState<{ value: string; isCustom: boolean }[]>([]);
  const [customRoles, setCustomRoles] = useState<{ value: string; isCustom: boolean }[]>([]);

  // Metadata Request Form State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestType, setRequestType] = useState<'institution' | 'major' | 'session' | 'role'>('institution');
  const [associatedUni, setAssociatedUni] = useState('');
  const [actionType, setActionType] = useState<'add' | 'rename'>('add');
  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [requestError, setRequestError] = useState('');

  // Saving animation states
  const [isSavingUni, setIsSavingUni] = useState(false);
  const [isSavingMajor, setIsSavingMajor] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [isSavingRole, setIsSavingRole] = useState(false);

  const loadingSteps = [
    'Verifying Academic Credentials...',
    'Synthesizing Neural Graph...',
    'Deploying Personal AI Workspace...',
    'Synchronizing Cognitive Databases...'
  ];

  // Custom Dropdown Option Lists
  const institutionOptions = customUniversities
    .map(item => {
      const uni = item.value;
      const hasLocation = uni.includes(' | Location: ');
      const labelName = hasLocation ? uni.split(' | Location: ')[0] : uni;
      const subtitleVal = hasLocation ? uni.split(' | Location: ')[1] : undefined;
      return { 
        value: uni, 
        label: labelName, 
        subtitle: subtitleVal,
        isCustom: item.isCustom
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your institution? Add new", isAction: true } as any);

  const majorOptions = customMajors
    .map(item => ({ 
      value: item.value, 
      label: item.value, 
      isCustom: item.isCustom 
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Field/Major? Add custom", isAction: true } as any);

  const sessionOptions = customSessions
    .map(item => ({ 
      value: item.value, 
      label: item.value, 
      isCustom: item.isCustom 
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Session? Add custom", isAction: true } as any);

  const roleOptions = customRoles
    .map(item => {
      const rl = item.value;
      return { 
        value: rl, 
        label: rl === "Undergraduate" ? "Undergraduate Student" :
               rl === "Graduate / PhD" ? "Graduate / PhD Candidate" :
               rl === "Researcher" ? "Academic Researcher" :
               rl === "Professor" ? "Professor / Mentor" :
               rl === "Other" ? "Other Academic Expert" : rl, 
        isCustom: item.isCustom 
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Role? Add custom", isAction: true } as any);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      document.documentElement.classList.add('scrollbar-hidden');
    }

    const fetchApprovedMetadata = async () => {
      try {
        const { data, error } = await turso.from('metadata_approved').select();
        if (error) {
          console.error("Failed to fetch custom metadata:", error);
          return;
        }
        if (data) {
          setCustomUniversities(data.institutions || []);
          setCustomMajors(data.majors || []);
          setCustomSessions(data.sessions || []);
          setCustomRoles(data.roles || []);
        }
      } catch (err) {
        console.error("Error loading approved metadata:", err);
      }
    };
    fetchApprovedMetadata();

    return () => {
      document.documentElement.classList.remove('scrollbar-hidden');
    };
  }, []);

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
  }, [status, loadingSteps.length]);

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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

  const handleInstitutionSelect = (value: string) => {
    if (value === "unlisted") {
      setRegForm(prev => ({ ...prev, isUnlistedInstitution: true, institution: '', district: '', country: '' }));
    } else {
      setRegForm(prev => ({ ...prev, isUnlistedInstitution: false, institution: value, district: '', country: '' }));
    }
    if (errors.institution) setErrors(prev => { const copy = { ...prev }; delete copy.institution; return copy; });
  };

  const handleMajorSelect = (value: string) => {
    if (value === "unlisted") {
      setRegForm(prev => ({ ...prev, isCustomMajor: true, major: '' }));
    } else {
      setRegForm(prev => ({ ...prev, isCustomMajor: false, major: value }));
    }
    if (errors.major) setErrors(prev => { const copy = { ...prev }; delete copy.major; return copy; });
  };

  const handleSessionSelect = (value: string) => {
    if (value === "unlisted") {
      setRegForm(prev => ({ ...prev, isCustomSession: true, session: '' }));
    } else {
      setRegForm(prev => ({ ...prev, isCustomSession: false, session: value }));
    }
    if (errors.session) setErrors(prev => { const copy = { ...prev }; delete copy.session; return copy; });
  };

  const handleRoleSelect = (value: string) => {
    if (value === "unlisted") {
      setRegForm(prev => ({ ...prev, isCustomRole: true, role: '' }));
    } else {
      setRegForm(prev => ({ ...prev, isCustomRole: false, role: value }));
    }
    if (errors.role) setErrors(prev => { const copy = { ...prev }; delete copy.role; return copy; });
  };

  const saveCustomInstitution = async () => {
    const uni = regForm.institution.trim();
    const abbrev = regForm.abbreviation.trim();
    if (!uni) {
      setErrors(prev => ({ ...prev, institution: 'Institution name cannot be empty' }));
      return;
    }
    if (regForm.isUnlistedInstitution && (!regForm.district.trim() || !regForm.country.trim() || !abbrev)) {
      setErrors(prev => ({ ...prev, institution: 'Abbreviation, District, and Country are required' }));
      return;
    }

    const finalVal = `${uni} (${abbrev.toUpperCase()}) | Location: ${regForm.district.trim()}, ${regForm.country.trim()}`;

    setIsSavingUni(true);
    try {
      const requesterEmail = regForm.email.trim() || 'beta-registration@unimind.edu';
      const { error } = await turso.from('metadata_requests').insert([
        {
          requester_email: requesterEmail,
          request_type: 'institution',
          action_type: 'add',
          old_value: null,
          new_value: finalVal,
          status: 'pending'
        }
      ]);

      if (error) {
        setErrors(prev => ({ ...prev, institution: error.message || 'Failed to save institution' }));
        return;
      }

      setCustomUniversities(prev => [...prev, { value: finalVal, isCustom: true }]);
      setRegForm(prev => ({
        ...prev,
        isUnlistedInstitution: false,
        institution: finalVal
      }));
      
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.institution;
        return copy;
      });

      toast.success(`University "${uni}" saved under registry!`);
    } catch (e: any) {
      setErrors(prev => ({ ...prev, institution: e.message || 'An error occurred' }));
    } finally {
      setIsSavingUni(false);
    }
  };

  const saveCustomMajor = async () => {
    const major = regForm.major.trim();
    if (!major) {
      setErrors(prev => ({ ...prev, major: 'Major name cannot be empty' }));
      return;
    }

    const activeUni = regForm.institution.trim();
    const requesterEmail = regForm.email.trim() || 'beta-registration@unimind.edu';
    const finalVal = activeUni ? `${major} | University: ${activeUni}` : major;

    setIsSavingMajor(true);
    try {
      const { error } = await turso.from('metadata_requests').insert([
        {
          requester_email: requesterEmail,
          request_type: 'major',
          action_type: 'add',
          old_value: null,
          new_value: finalVal,
          status: 'pending'
        }
      ]);

      if (error) {
        setErrors(prev => ({ ...prev, major: error.message || 'Failed to save Major' }));
        return;
      }

      setCustomMajors(prev => [...prev, { value: major, isCustom: true }]);
      setRegForm(prev => ({
        ...prev,
        isCustomMajor: false,
        major: major
      }));

      setErrors(prev => {
        const copy = { ...prev };
        delete copy.major;
        return copy;
      });

      toast.success(`Major "${major}" saved under ${activeUni || 'Registry'}!`);
    } catch (e: any) {
      setErrors(prev => ({ ...prev, major: e.message || 'An error occurred' }));
    } finally {
      setIsSavingMajor(false);
    }
  };

  const saveCustomSession = async () => {
    const session = regForm.session.trim();
    if (!session) {
      toast.error('Session cannot be empty');
      return;
    }

    const activeUni = regForm.institution.trim();
    const requesterEmail = regForm.email.trim() || 'beta-registration@unimind.edu';
    const finalVal = activeUni ? `${session} | University: ${activeUni}` : session;

    setIsSavingSession(true);
    try {
      const { error } = await turso.from('metadata_requests').insert([
        {
          requester_email: requesterEmail,
          request_type: 'session',
          action_type: 'add',
          old_value: null,
          new_value: finalVal,
          status: 'pending'
        }
      ]);

      if (error) {
        toast.error(error.message || 'Failed to save Session');
        return;
      }

      setCustomSessions(prev => [...prev, { value: session, isCustom: true }]);
      setRegForm(prev => ({
        ...prev,
        isCustomSession: false,
        session: session
      }));

      toast.success(`Session "${session}" saved under ${activeUni || 'Registry'}!`);
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setIsSavingSession(false);
    }
  };

  const saveCustomRole = async () => {
    const role = regForm.role.trim();
    if (!role) {
      toast.error('Academic Role cannot be empty');
      return;
    }

    const activeUni = regForm.institution.trim();
    const requesterEmail = regForm.email.trim() || 'beta-registration@unimind.edu';
    const finalVal = activeUni ? `${role} | University: ${activeUni}` : role;

    setIsSavingRole(true);
    try {
      const { error } = await turso.from('metadata_requests').insert([
        {
          requester_email: requesterEmail,
          request_type: 'role',
          action_type: 'add',
          old_value: null,
          new_value: finalVal,
          status: 'pending'
        }
      ]);

      if (error) {
        toast.error(error.message || 'Failed to save Role');
        return;
      }

      setCustomRoles(prev => [...prev, { value: role, isCustom: true }]);
      setRegForm(prev => ({
        ...prev,
        isCustomRole: false,
        role: role
      }));

      toast.success(`Academic Role "${role}" saved under ${activeUni || 'Registry'}!`);
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setIsSavingRole(false);
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
    if (regForm.isUnlistedInstitution && (!regForm.district.trim() || !regForm.country.trim() || !regForm.abbreviation.trim())) {
      tempErrors.institution = 'Abbreviation, District, and Country are required for unlisted institutions';
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
      const { data, error } = await turso.auth.signUp({
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
        setDbUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || regForm.name,
          institution: data.user.user_metadata?.institution || regForm.institution,
          major: data.user.user_metadata?.major || regForm.major,
          session: data.user.user_metadata?.session || regForm.session,
          role: data.user.user_metadata?.role || regForm.role,
        });

        const activeUni = regForm.institution.trim();
        const requesterEmail = regForm.email.trim();

        if (regForm.isUnlistedInstitution && activeUni) {
          try {
            await turso.from('metadata_requests').insert([{ requester_email: requesterEmail, request_type: 'institution', action_type: 'add', old_value: null, new_value: activeUni, status: 'pending' }]);
          } catch (e) {
            // ignore error
          }
        }
        if (regForm.isCustomMajor && regForm.major.trim()) {
          try {
            const finalVal = activeUni ? `${regForm.major.trim()} | University: ${activeUni}` : regForm.major.trim();
            await turso.from('metadata_requests').insert([{ requester_email: requesterEmail, request_type: 'major', action_type: 'add', old_value: null, new_value: finalVal, status: 'pending' }]);
          } catch (e) {
            // ignore error
          }
        }
        if (regForm.isCustomSession && regForm.session.trim()) {
          try {
            const finalVal = activeUni ? `${regForm.session.trim()} | University: ${activeUni}` : regForm.session.trim();
            await turso.from('metadata_requests').insert([{ requester_email: requesterEmail, request_type: 'session', action_type: 'add', old_value: null, new_value: finalVal, status: 'pending' }]);
          } catch (e) {
            // ignore error
          }
        }
        if (regForm.isCustomRole && regForm.role.trim()) {
          try {
            const finalVal = activeUni ? `${regForm.role.trim()} | University: ${activeUni}` : regForm.role.trim();
            await turso.from('metadata_requests').insert([{ requester_email: requesterEmail, request_type: 'role', action_type: 'add', old_value: null, new_value: finalVal, status: 'pending' }]);
          } catch (e) {
            // ignore error
          }
        }
      }
    } catch (err: any) {
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
      const finalNewValue = requestType !== 'institution' && associatedUni.trim()
        ? `${newValue} | University: ${associatedUni.trim()}`
        : newValue;

      const { error } = await turso.from('metadata_requests').insert([
        {
          requester_email: requestEmail,
          request_type: requestType,
          action_type: actionType,
          old_value: actionType === 'rename' ? oldValue : null,
          new_value: finalNewValue,
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
      const { data, error } = await turso.auth.signInWithPassword({
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
          session: data.user.user_metadata?.session || 'N/A',
          role: data.user.user_metadata?.role || 'Researcher',
        });
      }
    } catch (err: any) {
      setStatus('idle');
      setErrors({ general: err.message || 'An unexpected error occurred' });
    }
  };

  const openMetadataModal = (type: 'institution' | 'major' | 'session' | 'role', action: 'add' | 'rename', oldVal?: string) => {
    setRequestEmail(regForm.email || '');
    setRequestType(type);
    setActionType(action);
    setAssociatedUni(regForm.institution || '');
    setOldValue(oldVal || '');
    setNewValue('');
    setShowRequestModal(true);
    setRequestStatus('idle');
    setRequestError('');
  };

  return (
    <div className="h-[100dvh] bg-[#030712] relative overflow-hidden font-poppins selection:bg-primary/30 selection:text-white flex items-center justify-center p-4 pt-24 sm:p-6 lg:p-8">
      {/* Background radial glows - Optimized for Performance */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[35%] h-[35%] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
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

      <motion.div 
        id="auth-container"
        layout 
        transition={{ type: "spring", stiffness: 180, damping: 25 }}
        className="relative z-10 w-full max-w-6xl max-h-full rounded-[32px] overflow-hidden glass-panel border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col lg:grid lg:grid-cols-12 bg-slate-950/40 backdrop-blur-xl"
      >
        <BrandingPanel />

        {/* RIGHT PANEL: INTERACTIVE LOGIN/REGISTER FORMS OR LOADING/SUCCESS */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center h-full min-h-[400px] lg:min-h-[550px] relative overflow-hidden">
          {/* Subtle Right Panel Ambient Glows */}
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-[120px] pointer-events-none z-0" />
          
          <AnimatePresence mode="wait">
            {/* IDLE FORM VIEW */}
            {status === 'idle' && (
              <motion.div
                key="idle-form-state"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full relative z-10 flex-1 flex flex-col max-h-[450px] sm:max-h-[480px]"
              >
                {/* Form Tabs */}
                <div className="flex p-1 bg-slate-950/60 backdrop-blur-md rounded-xl border border-white/5 max-w-sm mb-8 relative z-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                  {/* Single background sliding indicator */}
                  <motion.div
                    className="absolute top-1 bottom-1 bg-gradient-to-r from-[#2563eb]/90 to-[#8b5cf6]/90 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.45)]"
                    animate={{
                      left: activeTab === 'register' ? '4px' : '50%',
                      right: activeTab === 'register' ? '50%' : '4px',
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  />

                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setErrors({}); }}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 relative z-10 ${
                      activeTab === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Join Beta
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setErrors({}); }}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 relative z-10 ${
                      activeTab === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
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

                {activeTab === 'register' ? (
                  <RegisterForm
                    regForm={regForm}
                    errors={errors}
                    handleRegChange={handleRegChange}
                    handleRegCheckbox={handleRegCheckbox}
                    handleRegSubmit={handleRegSubmit}
                    institutionOptions={institutionOptions as any}
                    majorOptions={majorOptions as any}
                    sessionOptions={sessionOptions as any}
                    roleOptions={roleOptions as any}
                    handleInstitutionSelect={handleInstitutionSelect}
                    handleMajorSelect={handleMajorSelect}
                    handleSessionSelect={handleSessionSelect}
                    handleRoleSelect={handleRoleSelect}
                    saveCustomInstitution={saveCustomInstitution}
                    saveCustomMajor={saveCustomMajor}
                    saveCustomSession={saveCustomSession}
                    saveCustomRole={saveCustomRole}
                    isSavingUni={isSavingUni}
                    isSavingMajor={isSavingMajor}
                    isSavingSession={isSavingSession}
                    isSavingRole={isSavingRole}
                    setRegForm={setRegForm}
                    openMetadataModal={openMetadataModal}
                  />
                ) : (
                  <LoginForm
                    loginForm={loginForm}
                    errors={errors}
                    handleLoginChange={handleLoginChange}
                    handleLoginSubmit={handleLoginSubmit}
                  />
                )}
              </motion.div>
            )}

            {(status === 'loading' || status === 'success') && (
              <LoadingSuccessStates
                status={status}
                loadingStep={loadingStep}
                loadingSteps={loadingSteps}
                dbUser={dbUser}
                onEnterWorkspace={onEnterWorkspace}
                onBackToHome={onBackToHome}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <RequestMetadataModal
        showRequestModal={showRequestModal}
        setShowRequestModal={setShowRequestModal}
        requestStatus={requestStatus}
        setRequestStatus={setRequestStatus}
        requestError={requestError}
        requestEmail={requestEmail}
        setRequestEmail={setRequestEmail}
        requestType={requestType}
        setRequestType={setRequestType}
        actionType={actionType}
        setActionType={setActionType}
        associatedUni={associatedUni}
        setAssociatedUni={setAssociatedUni}
        oldValue={oldValue}
        setOldValue={setOldValue}
        newValue={newValue}
        setNewValue={setNewValue}
        handleRequestSubmit={handleRequestSubmit}
      />
    </div>
  );
};

export default AuthPage;
