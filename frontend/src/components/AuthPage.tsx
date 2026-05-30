import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, School, Mail, Lock, User, 
  GraduationCap, CheckCircle2, Sparkles, 
  Brain, Database, Layout, Eye, EyeOff, 
  Activity, ArrowRight, Check, X, AlertCircle, 
  HelpCircle, PlusCircle
} from 'lucide-react';
import { turso } from '../utils/tursoClient';
import toast from 'react-hot-toast';
import { CustomSelect, Option } from './CustomSelect';

// Metadata constants moved dynamically to Turso Edge Database

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

  // Custom Dropdown Option Lists
  const institutionOptions: Option[] = (customUniversities
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
    }) as Option[])
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your institution? Add new", isAction: true });

  const majorOptions: Option[] = (customMajors
    .map(item => ({ 
      value: item.value, 
      label: item.value, 
      isCustom: item.isCustom 
    })) as Option[])
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Field/Major? Add custom", isAction: true });

  const sessionOptions: Option[] = (customSessions
    .map(item => ({ 
      value: item.value, 
      label: item.value, 
      isCustom: item.isCustom 
    })) as Option[])
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Session? Add custom", isAction: true });

  const roleOptions: Option[] = (customRoles
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
    }) as Option[])
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat({ value: "unlisted", label: "Can't find your Role? Add custom", isAction: true });

  // Custom Dropdown Selection Handlers
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

  // Saving animation states
  const [isSavingUni, setIsSavingUni] = useState(false);
  const [isSavingMajor, setIsSavingMajor] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [isSavingRole, setIsSavingRole] = useState(false);

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
    // Hide scrollbar globally on desktop/laptop screens when onboarding page is mounted
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
      // Restore scrollbar when leaving onboarding
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

    if (name === "majorSelect") {
      if (value === "unlisted") {
        setRegForm(prev => ({ ...prev, isCustomMajor: true, major: '' }));
      } else {
        setRegForm(prev => ({ ...prev, isCustomMajor: false, major: value }));
      }
      if (errors.major) setErrors(prev => { const copy = { ...prev }; delete copy.major; return copy; });
      return;
    }

    if (name === "sessionSelect") {
      if (value === "unlisted") {
        setRegForm(prev => ({ ...prev, isCustomSession: true, session: '' }));
      } else {
        setRegForm(prev => ({ ...prev, isCustomSession: false, session: value }));
      }
      if (errors.session) setErrors(prev => { const copy = { ...prev }; delete copy.session; return copy; });
      return;
    }

    if (name === "roleSelect") {
      if (value === "unlisted") {
        setRegForm(prev => ({ ...prev, isCustomRole: true, role: '' }));
      } else {
        setRegForm(prev => ({ ...prev, isCustomRole: false, role: value }));
      }
      if (errors.role) setErrors(prev => { const copy = { ...prev }; delete copy.role; return copy; });
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

    console.log("Submitting Registration Payload:", {
      email: regForm.email,
      name: regForm.name,
      institution: regForm.institution,
      major: regForm.major,
      session: regForm.session,
      role: regForm.role
    });

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
        // Build a mock user object based on metadata since the trigger will populate public.users in DB
        setDbUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || regForm.name,
          institution: data.user.user_metadata?.institution || regForm.institution,
          major: data.user.user_metadata?.major || regForm.major,
          session: data.user.user_metadata?.session || regForm.session,
          role: data.user.user_metadata?.role || regForm.role,
        });

        // Submit custom metadata suggestions in the background associated under the university
        const activeUni = regForm.institution.trim();
        const requesterEmail = regForm.email.trim();

        if (regForm.isUnlistedInstitution && activeUni) {
          try {
            await turso.from('metadata_requests').insert([
              {
                requester_email: requesterEmail,
                request_type: 'institution',
                action_type: 'add',
                old_value: null,
                new_value: activeUni,
                status: 'pending'
              }
            ]);
          } catch (e) {
            console.error("Auto university suggest failed:", e);
          }
        }

        if (regForm.isCustomMajor && regForm.major.trim()) {
          try {
            const finalVal = activeUni ? `${regForm.major.trim()} | University: ${activeUni}` : regForm.major.trim();
            await turso.from('metadata_requests').insert([
              {
                requester_email: requesterEmail,
                request_type: 'major',
                action_type: 'add',
                old_value: null,
                new_value: finalVal,
                status: 'pending'
              }
            ]);
          } catch (e) {
            console.error("Auto major suggest failed:", e);
          }
        }

        if (regForm.isCustomSession && regForm.session.trim()) {
          try {
            const finalVal = activeUni ? `${regForm.session.trim()} | University: ${activeUni}` : regForm.session.trim();
            await turso.from('metadata_requests').insert([
              {
                requester_email: requesterEmail,
                request_type: 'session',
                action_type: 'add',
                old_value: null,
                new_value: finalVal,
                status: 'pending'
              }
            ]);
          } catch (e) {
            console.error("Auto session suggest failed:", e);
          }
        }

        if (regForm.isCustomRole && regForm.role.trim()) {
          try {
            const finalVal = activeUni ? `${regForm.role.trim()} | University: ${activeUni}` : regForm.role.trim();
            await turso.from('metadata_requests').insert([
              {
                requester_email: requesterEmail,
                request_type: 'role',
                action_type: 'add',
                old_value: null,
                new_value: finalVal,
                status: 'pending'
              }
            ]);
          } catch (e) {
            console.error("Auto role suggest failed:", e);
          }
        }
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
    <div className="h-[100dvh] bg-[#030712] relative overflow-hidden font-poppins selection:bg-primary/30 selection:text-white flex items-center justify-center p-4 pt-24 sm:p-6 lg:p-8">
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

      <motion.div 
        id="auth-container"
        layout 
        transition={{ type: "spring", stiffness: 180, damping: 25 }}
        className="relative z-10 w-full max-w-6xl max-h-full rounded-[32px] overflow-hidden glass-panel border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col lg:grid lg:grid-cols-12 bg-slate-950/40 backdrop-blur-xl"
      >
        
        {/* LEFT PANEL: BRANDING & BENEFITS SHOWCASE */}
        <div className="hidden lg:flex lg:col-span-5 relative p-8 sm:p-10 md:p-12 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#040813] border-b lg:border-b-0 lg:border-r border-white/10 flex-col justify-between overflow-hidden">
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

                {/* REGISTER FORM */}
                {activeTab === 'register' && (
                  <form onSubmit={handleRegSubmit} className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Name */}
                      <div className="group flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Full Name</label>
                        <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-glow transition-colors duration-300" />
                          <input
                            type="text"
                            name="name"
                            value={regForm.name}
                            onChange={handleRegChange}
                            placeholder="Adnan Shahria"
                            className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                          />
                        </div>
                        {errors.name && <p className="text-[10px] text-red-400 mt-1.5 font-poppins font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.name}</p>}
                      </div>

                      {/* Academic Email */}
                      <div className="group flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Academic Email</label>
                        <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-glow transition-colors duration-300" />
                          <input
                            type="email"
                            name="email"
                            value={regForm.email}
                            onChange={handleRegChange}
                            placeholder="adnan@university.edu"
                            className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                          />
                        </div>
                        {errors.email && <p className="text-[10px] text-red-400 mt-1.5 font-poppins font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Institution & Major / Custom Uni Fields Layout */}
                      {regForm.isUnlistedInstitution ? (
                        <>
                          {/* Custom Institution Column 1 (Left) */}
                          <div className="group flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">University / Institution</label>
                            <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6]" />
                              <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-glow" />
                              <input
                                type="text"
                                name="institution"
                                value={regForm.institution}
                                onChange={handleRegChange}
                                placeholder="Enter Custom Institution Name"
                                className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                              />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <button 
                                type="button" 
                                onClick={() => setRegForm(prev => ({...prev, isUnlistedInstitution: false, institution: ''}))} 
                                className="text-[10px] text-primary-glow hover:underline font-poppins font-medium mt-1.5"
                              >
                                ← Back to list
                              </button>
                            </div>
                            {errors.institution && <p className="text-[10px] text-red-400 mt-1.5 font-poppins font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.institution}</p>}
                          </div>

                          {/* Custom Institution Column 2 (Right - Required Fields) */}
                          <div className="group flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Required Fields</label>
                            <div className="flex flex-col gap-2">
                              {/* Row 1: Abbrev */}
                              <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 overflow-hidden">
                                <input 
                                  type="text" 
                                  name="abbreviation" 
                                  value={regForm.abbreviation} 
                                  onChange={handleRegChange} 
                                  placeholder="Abbrev (e.g. GAU)" 
                                  className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none px-3 font-poppins" 
                                />
                              </div>
                              {/* Row 2: District & Country */}
                              <div className="flex gap-2">
                                <div className="w-1/2 relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 overflow-hidden">
                                  <input 
                                    type="text" 
                                    name="district" 
                                    value={regForm.district} 
                                    onChange={handleRegChange} 
                                    placeholder="District" 
                                    className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none px-3 font-poppins" 
                                  />
                                </div>
                                <div className="w-1/2 relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 overflow-hidden">
                                  <input 
                                    type="text" 
                                    name="country" 
                                    value={regForm.country} 
                                    onChange={handleRegChange} 
                                    placeholder="Country" 
                                    className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none px-3 font-poppins" 
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end items-center mt-1">
                              <button
                                type="button"
                                onClick={saveCustomInstitution}
                                disabled={isSavingUni}
                                className={`relative px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer overflow-hidden mt-1.5 ${
                                  isSavingUni ? 'opacity-80 pointer-events-none' : 'animate-glow-pulse'
                                }`}
                              >
                                {isSavingUni && <span className="absolute inset-0 animate-shimmer rounded-xl" />}
                                {isSavingUni ? 'Saving…' : 'Save University'}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Standard Institution Column 1 (Left) */}
                          <div className="group flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">University / Institution</label>
                            <div className="relative">
                              <CustomSelect
                                value={regForm.institution}
                                onChange={handleInstitutionSelect}
                                options={institutionOptions}
                                placeholder="Select Institution"
                              />
                              {regForm.institution && (
                                <div className="flex justify-end mt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const rawVal = regForm.institution;
                                      const cleanName = rawVal.includes(' | Location: ') ? rawVal.split(' | Location: ')[0] : rawVal;
                                      setRequestEmail(regForm.email || '');
                                      setRequestType('institution');
                                      setActionType('rename');
                                      setOldValue(cleanName);
                                      setNewValue('');
                                      setShowRequestModal(true);
                                      setRequestStatus('idle');
                                      setRequestError('');
                                    }}
                                    className="text-[10px] text-slate-400 hover:text-primary-glow hover:underline transition-colors font-poppins cursor-pointer bg-transparent border-none outline-none"
                                  >
                                    Report spelling typo in this name
                                  </button>
                                </div>
                              )}
                            </div>
                            {errors.institution && <p className="text-[10px] text-red-400 mt-1.5 font-poppins font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.institution}</p>}
                          </div>

                          {/* Standard Major Column 2 (Right) */}
                          <div className="group flex flex-col transition-all duration-500">
                            <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Field of Study / Major</label>
                            {!regForm.isCustomMajor ? (
                              <CustomSelect
                                value={regForm.major}
                                onChange={handleMajorSelect}
                                options={majorOptions}
                                placeholder="Select Field / Major"
                                disabled={!regForm.institution.trim() || regForm.isUnlistedInstitution}
                              />
                            ) : (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="relative flex flex-col gap-2"
                              >
                                <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6]" />
                                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-glow" />
                                  <input
                                    type="text"
                                    name="major"
                                    value={regForm.major}
                                    onChange={handleRegChange}
                                    placeholder="Enter Custom Field / Major"
                                    className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                                  />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <button 
                                    type="button" 
                                    onClick={() => setRegForm(prev => ({...prev, isCustomMajor: false, major: ''}))} 
                                    className="text-[10px] text-primary-glow hover:underline font-poppins font-medium"
                                  >
                                    ← Back to list
                                  </button>
                                  <button
                                    type="button"
                                    onClick={saveCustomMajor}
                                    disabled={isSavingMajor}
                                    className={`relative px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-[10px] transition-all shadow-[0_2px_10px_rgba(16,185,129,0.2)] hover:shadow-[0_2px_15px_rgba(16,185,129,0.4)] cursor-pointer overflow-hidden ${isSavingMajor ? 'opacity-80 pointer-events-none' : ''}`}
                                  >
                                    {isSavingMajor && <span className="absolute inset-0 animate-shimmer rounded-xl" />}
                                    {isSavingMajor ? 'Saving…' : 'Save Major'}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                            {errors.major && <p className="text-[10px] text-red-400 mt-1.5 font-poppins font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.major}</p>}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Session / Batch */}
                      <div className="group flex flex-col transition-all duration-500">
                        <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Session / Batch</label>
                        {!regForm.isCustomSession ? (
                          <CustomSelect
                            value={regForm.session}
                            onChange={handleSessionSelect}
                            options={sessionOptions}
                            placeholder="Select Session / Batch"
                            disabled={!regForm.institution.trim() || regForm.isUnlistedInstitution}
                          />
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="relative flex flex-col gap-2"
                          >
                            <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6]" />
                              <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-glow" />
                              <input
                                type="text"
                                name="session"
                                value={regForm.session}
                                onChange={handleRegChange}
                                placeholder="Enter Custom Session (e.g. 2025-2026)"
                                className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                              />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <button 
                                type="button" 
                                onClick={() => setRegForm(prev => ({...prev, isCustomSession: false, session: ''}))} 
                                className="text-[10px] text-primary-glow hover:underline font-poppins font-medium"
                              >
                                ← Back to list
                              </button>
                              <button
                                type="button"
                                onClick={saveCustomSession}
                                disabled={isSavingSession}
                                className={`relative px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-[10px] transition-all shadow-[0_2px_10px_rgba(16,185,129,0.2)] hover:shadow-[0_2px_15px_rgba(16,185,129,0.4)] cursor-pointer overflow-hidden ${isSavingSession ? 'opacity-80 pointer-events-none' : ''}`}
                              >
                                {isSavingSession && <span className="absolute inset-0 animate-shimmer rounded-xl" />}
                                {isSavingSession ? 'Saving…' : 'Save Session'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Academic Role */}
                      <div className="group flex flex-col transition-all duration-500">
                        <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Academic Role</label>
                        {!regForm.isCustomRole ? (
                          <CustomSelect
                            value={regForm.role}
                            onChange={handleRoleSelect}
                            options={roleOptions}
                            placeholder="Select Academic Role"
                            disabled={!regForm.institution.trim() || regForm.isUnlistedInstitution}
                          />
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="relative flex flex-col gap-2"
                          >
                            <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 focus-within:border-primary-glow/30 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6]" />
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-glow" />
                              <input
                                type="text"
                                name="role"
                                value={regForm.role}
                                onChange={handleRegChange}
                                placeholder="Enter Custom Academic Role"
                                className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                              />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <button 
                                type="button" 
                                onClick={() => setRegForm(prev => ({...prev, isCustomRole: false, role: 'Undergraduate'}))} 
                                className="text-[10px] text-primary-glow hover:underline font-poppins font-medium"
                              >
                                ← Back to list
                              </button>
                              <button
                                type="button"
                                onClick={saveCustomRole}
                                disabled={isSavingRole}
                                className={`relative px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-[10px] transition-all shadow-[0_2px_10px_rgba(16,185,129,0.2)] hover:shadow-[0_2px_15px_rgba(16,185,129,0.4)] cursor-pointer overflow-hidden ${isSavingRole ? 'opacity-80 pointer-events-none' : ''}`}
                              >
                                {isSavingRole && <span className="absolute inset-0 animate-shimmer rounded-xl" />}
                                {isSavingRole ? 'Saving…' : 'Save Role'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {/* Password */}
                      <div className="group flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Secure Password</label>
                        <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-glow transition-colors duration-300" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={regForm.password}
                            onChange={handleRegChange}
                            placeholder="••••••••"
                            className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-10 font-poppins"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[10px] text-red-400 mt-1.5 font-poppins font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.password}</p>}
                      </div>
                    </div>

                    {/* Agree checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-3.5 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          checked={regForm.agree}
                          onChange={handleRegCheckbox}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                          regForm.agree 
                            ? 'bg-gradient-to-r from-[#2563eb] to-[#8b5cf6] border-transparent text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]' 
                            : 'border-white/10 bg-slate-950/50 group-hover:border-white/20'
                        }`}>
                          {regForm.agree && <Check className="w-3.5 h-3.5 stroke-[3.5] text-white" />}
                        </div>
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors font-poppins font-light leading-relaxed">
                          I agree to the <span className="text-primary-glow hover:underline font-normal">UniMind Beta Onboarding Terms</span> and data isolation protocol.
                        </span>
                      </label>
                      {errors.agree && <p className="text-[10px] text-red-400 mt-1.5 font-poppins font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.agree}</p>}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.015, translateY: -2 }}
                      whileTap={{ scale: 0.985 }}
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-[#2563eb] via-[#8b5cf6] to-[#06b6d4] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-[0_4px_20px_rgba(59,130,246,0.35)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 mt-4 cursor-pointer relative overflow-hidden group/btn"
                    >
                      <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover/btn:animate-marquee pointer-events-none" style={{ animationDuration: '1.5s' }} />
                      <Sparkles className="w-4 h-4 text-blue-100 animate-pulse" />
                      <span>Request Beta Access</span>
                    </motion.button>

                    {/* Metadata Suggestion / Request Link */}
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setRequestEmail(regForm.email || '');
                          setAssociatedUni(regForm.institution || '');
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
                  <form onSubmit={handleLoginSubmit} className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-2">
                    {/* Academic Email */}
                    <div className="group flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Academic Email</label>
                      <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-glow transition-colors duration-300" />
                        <input
                          type="email"
                          name="email"
                          value={loginForm.email}
                          onChange={handleLoginChange}
                          placeholder="adnan@university.edu"
                          className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                        />
                      </div>
                      {errors.email && <p className="text-[10px] text-red-400 mt-1.5 font-poppins font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="group flex flex-col">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-slate-400 font-poppins uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Password</label>
                        <a href="#" className="text-[10px] text-primary-glow hover:underline font-poppins font-semibold">Forgot password?</a>
                      </div>
                      <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-glow transition-colors duration-300" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={loginForm.password}
                          onChange={handleLoginChange}
                          placeholder="••••••••"
                          className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-10 font-poppins"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-[10px] text-red-400 mt-1.5 font-poppins font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{errors.password}</p>}
                    </div>

                    {/* Keep Signed In */}
                    <div className="pt-2 flex justify-between items-center select-none">
                      <label className="flex items-center gap-3.5 cursor-pointer group">
                        <input type="checkbox" className="sr-only" defaultChecked />
                        <div className="w-5 h-5 rounded-lg border border-white/10 bg-slate-950/50 flex items-center justify-center transition-all group-hover:border-white/20 group-has-[:checked]:bg-gradient-to-r group-has-[:checked]:from-[#2563eb] group-has-[:checked]:to-[#8b5cf6] group-has-[:checked]:border-transparent group-has-[:checked]:shadow-[0_0_12px_rgba(59,130,246,0.4)] shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3.5] text-white" />
                        </div>
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors font-poppins font-light">
                          Keep academic node authorized
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.015, translateY: -2 }}
                      whileTap={{ scale: 0.985 }}
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-[#2563eb] via-[#8b5cf6] to-[#06b6d4] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-[0_4px_20px_rgba(59,130,246,0.35)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 mt-8 cursor-pointer relative overflow-hidden group/btn"
                    >
                      <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover/btn:animate-marquee pointer-events-none" style={{ animationDuration: '1.5s' }} />
                      <Brain className="w-4 h-4 text-blue-100" />
                      <span>Authorize & Enter</span>
                    </motion.button>
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
                      <span className="text-slate-500">Academic Email:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[180px]">{dbUser?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Academic Major:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[180px]">{dbUser?.major || 'Deep Work'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Academic Role:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[180px]">{dbUser?.role || 'Researcher'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Session / Batch:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[180px]">{dbUser?.session || 'N/A'}</span>
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

      </motion.div>

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
                  <div className="group flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Requester Email</label>
                    <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary to-secondary opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-glow transition-colors duration-300" />
                      <input
                        type="email"
                        required
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                        placeholder="your.email@university.edu"
                        className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Request Type */}
                    <div className="group flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Change Category</label>
                      <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                        <select
                          value={requestType}
                          onChange={(e) => setRequestType(e.target.value as any)}
                          className="w-full h-11 bg-transparent text-xs text-slate-200 outline-none pl-4 pr-10 cursor-pointer appearance-none font-poppins"
                        >
                          <option value="institution" className="bg-[#0b1121] text-slate-200">University / Inst.</option>
                          <option value="major" className="bg-[#0b1121] text-slate-200">Field / Major (Subject)</option>
                          <option value="session" className="bg-[#0b1121] text-slate-200">Session / Batch</option>
                          <option value="role" className="bg-[#0b1121] text-slate-200">Academic Role</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
                      </div>
                    </div>

                    {/* Action Type */}
                    <div className="group flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Action Requested</label>
                      <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                        <select
                          value={actionType}
                          onChange={(e) => setActionType(e.target.value as any)}
                          className="w-full h-11 bg-transparent text-xs text-slate-200 outline-none pl-4 pr-10 cursor-pointer appearance-none font-poppins"
                        >
                          <option value="add" className="bg-[#0b1121] text-slate-200">Add Unlisted</option>
                          <option value="rename" className="bg-[#0b1121] text-slate-200">Rename / Fix Typo</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
                      </div>
                    </div>
                  </div>

                  {/* Associated University linkage (Only show for major, session, or role suggestions) */}
                  {requestType !== 'institution' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex flex-col"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-slate-400 font-poppins uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">
                          Associate Under University
                        </label>
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-medium uppercase font-poppins">Required Linkage</span>
                      </div>
                      <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                        <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-glow transition-colors duration-300" />
                        <input
                          type="text"
                          required
                          value={associatedUni}
                          onChange={(e) => setAssociatedUni(e.target.value)}
                          placeholder="e.g. Example University"
                          className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none pl-11 pr-4 font-poppins"
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 font-light mt-1 font-poppins">This subject, session or role will be uniquely associated under this university.</p>
                    </motion.div>
                  )}

                  {/* Existing name (typo) field if rename selected */}
                  {actionType === 'rename' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex flex-col"
                    >
                      <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">Current Listed Name (with typo)</label>
                      <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                        <input
                          type="text"
                          required
                          value={oldValue}
                          onChange={(e) => setOldValue(e.target.value)}
                          placeholder="e.g. Exampel University"
                          className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none px-4 font-poppins"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* New value field */}
                  <div className="group flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 font-poppins mb-1.5 uppercase tracking-widest block transition-colors group-focus-within:text-primary-glow">
                      {actionType === 'add' ? 'Proposed New Entry Name' : 'Corrected Name'}
                    </label>
                    <div className="relative rounded-xl transition-all duration-300 bg-slate-950/40 border border-white/5 group-focus-within:border-primary-glow/30 group-focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2563eb] to-[#8b5cf6] opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                      <input
                        type="text"
                        required
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={
                          requestType === 'institution' ? 'e.g. Example University' :
                          requestType === 'major' ? 'e.g. Software Engineering' :
                          requestType === 'session' ? 'e.g. 2025-2026' : 'e.g. Professor / Mentor'
                        }
                        className="w-full h-11 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none px-4 font-poppins"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.015, translateY: -2 }}
                    whileTap={{ scale: 0.985 }}
                    type="submit"
                    disabled={requestStatus === 'submitting'}
                    className="w-full h-12 bg-gradient-to-r from-[#2563eb] via-[#8b5cf6] to-[#06b6d4] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-[0_4px_20px_rgba(59,130,246,0.35)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 mt-6 cursor-pointer relative overflow-hidden group/btn disabled:opacity-50"
                  >
                    <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover/btn:animate-marquee pointer-events-none" style={{ animationDuration: '1.5s' }} />
                    {requestStatus === 'submitting' ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <PlusCircle className="w-4 h-4" />
                    )}
                    <span>Submit Suggestion</span>
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
