import React, { useState, useEffect } from 'react';
import { 
  Compass, Upload, CheckCircle2, AlertTriangle, ArrowRight, Play, 
  ShieldCheck, Clock, BookOpen, LogOut, Sparkles, User, 
  ArrowLeft, Check, ChevronRight, X, ExternalLink, Settings, Key,
  Home, BarChart3, FileText, Award, TrendingUp, RefreshCw, Layers, CheckCircle,
  Menu
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? "http://127.0.0.1:8000/api"
    : "/api"
);

const formatRadarLines = (name) => {
  if (!name) return ['Competency', ''];
  const s = name.toLowerCase();
  if (s.includes('sampling')) return ['Sampling &', 'Listing'];
  if (s.includes('non-response') || s.includes('informant') || s.includes('reluctant')) return ['Non-Response', '& Revisits'];
  if (s.includes('capi') || s.includes('digital') || s.includes('entry')) return ['CAPI Tablet', 'Data Entry'];
  if (s.includes('consistency') || s.includes('cross-verification') || s.includes('scrutiny')) return ['Consistency', '& Scrutiny'];
  if (s.includes('confidentiality') || s.includes('ethics') || s.includes('immunity')) return ['Ethics &', 'Immunity'];
  if (s.includes('econometric') || s.includes('modeling')) return ['Econometric', 'Models'];
  if (s.includes('analytics') || s.includes('python') || s.includes(' r ')) return ['R & Python', 'Analytics'];
  if (s.includes('metadata') || s.includes('standards')) return ['Metadata &', 'NDSAP'];
  if (s.includes('classification') || s.includes('nic')) return ['NIC 2008', 'Classification'];
  if (s.includes('audit') || s.includes('supervisory')) return ['Supervisory', 'Audits'];
  const words = name.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
};

// 3 Official MoSPI Working Fields (Curriculum & Verified YouTube Training)
const OFFICIAL_MANUALS = [
  { id: "manual_cpi_rural", title: "Consumer Price Index (Rural) Field Manual", pages: 94, category: "Price Statistics" },
  { id: "manual_plfs_2026", title: "Periodic Labour Force Survey (PLFS) Manual", pages: 112, category: "Socio-Economic & Labour" },
  { id: "manual_asuse_2026", title: "Annual Survey of Unincorporated Enterprises (ASUSE)", pages: 88, category: "Enterprise Statistics" }
];

const STATISTICAL_FIELDS = [
  {
    id: "field_investigator_nsso",
    title: "Field Surveys & Household Data (NSSO / PLFS)",
    designation: "Field Investigator - NSSO",
    division: "National Sample Survey Office",
    badge: "Socio-Economic & Labour Statistics",
    summary: "Conducting large-scale household sample surveys, Periodic Labour Force Survey (PLFS), and Consumer Expenditure.",
    competencies: ["Multi-Stage Sampling & Listing", "Non-Response Revisit Protocols", "CAPI Tablet Software", "Data Scrutiny"],
    youtubeId: "gS8b2v8gq80",
    youtubeTitle: "MoSPI Large-Scale Sample Surveys & Field Methodologies",
    videoDescription: "Official MoSPI training on survey design, primary sampling units (PSU), and household enumeration rules."
  },
  {
    id: "junior_statistical_officer_cso",
    title: "National Accounts & Economic Statistics (CSO / Prices)",
    designation: "Junior Statistical Officer - CSO",
    division: "Central Statistics Office",
    badge: "Macroeconomic & Price Indices",
    summary: "Compilation of Gross Domestic Product (GDP), Consumer Price Index (CPI), and Index of Industrial Production (IIP).",
    competencies: ["Base Year Revisions", "Price Quotation Scrutiny", "NIC-2008 Classification", "Imputation Protocols"],
    youtubeId: "3nC4Vj_f460",
    youtubeTitle: "Economic Statistics & Price Indices Methodology",
    videoDescription: "Methodological framework for Laspeyres formula price indices and state-level price aggregation."
  },
  {
    id: "survey_supervisor_asuse",
    title: "Enterprise & Industry Statistics (ASUSE / ASI)",
    designation: "Survey Supervisor - Enterprise Statistics",
    division: "Economic Statistics & Business Register",
    badge: "Establishment & Industrial Surveys",
    summary: "Annual Survey of Unincorporated Sector Enterprises (ASUSE) and Annual Survey of Industries (ASI).",
    competencies: ["Enterprise Frame Verification", "GVA & Balance Sheet Audits", "Unit Non-Response Weights", "Coverage Checks"],
    youtubeId: "Yp9Hn1L7v78",
    youtubeTitle: "Annual Survey of Industries & Enterprise Frameworks",
    videoDescription: "Capacity building guide on balance sheet verification, capital formation, and enterprise frame auditing."
  }
];

export default function App() {
  const [googleClientId] = useState("422382282637-6i23lanvhcl8bko1m9d9lae16i4dtbrb.apps.googleusercontent.com");

  // Authenticated User State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sankhya_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sidebar Active Navigation Item: 'home', 'diagnostic', 'upload_quiz', or 'dashboard'
  const [activeTab, setActiveTab] = useState('home');

  // Selected Working Field
  const [selectedField, setSelectedField] = useState(() => {
    const saved = localStorage.getItem('sankhya_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.selectedField) return u.selectedField;
      } catch (e) {}
    }
    return 'field_investigator_nsso';
  });

  // Field Selection Modal (ONLY pops up on first login, otherwise opened manually)
  const [showFieldModal, setShowFieldModal] = useState(false);

  // MoSPI Data from backend
  const [roles, setRoles] = useState([]);
  const [manuals, setManuals] = useState(OFFICIAL_MANUALS);

  // Option 1: Diagnostic State
  const [diagnosticSessionId, setDiagnosticSessionId] = useState('');
  const [diagnosticQuestions, setDiagnosticQuestions] = useState([]);
  const [isGeneratingDiagnostic, setIsGeneratingDiagnostic] = useState(false);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState({});
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [videoTimestamp, setVideoTimestamp] = useState(0);

  // Option 2: Upload & AI Quiz State
  const [quizSessionId, setQuizSessionId] = useState('');
  const [selectedManual, setSelectedManual] = useState('manual_cpi_rural');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [customText, setCustomText] = useState('');
  const [difficulty, setDifficulty] = useState('scenario');
  const [quizCount, setQuizCount] = useState(5);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizEvaluation, setQuizEvaluation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Manual Auth Form States
  const [isSignUp, setIsSignUp] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Per-User Activity History & Improvement Tracking
  const [userHistory, setUserHistory] = useState([]);

  // Mobile sidebar drawer toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch initial roles & manuals
  useEffect(() => {
    fetch(`${API_BASE}/roles`)
      .then(res => res.json())
      .then(data => setRoles(data.roles || []))
      .catch(err => console.error("Error fetching roles:", err));

    fetch(`${API_BASE}/manuals`)
      .then(res => res.json())
      .then(data => setManuals(data.manuals || []))
      .catch(err => console.error("Error fetching manuals:", err));
  }, []);

  // Check onboarding on login
  useEffect(() => {
    if (user?.email) {
      const historyKey = `sankhya_history_${user.email.toLowerCase()}`;
      const savedHistory = localStorage.getItem(historyKey);
      if (savedHistory) {
        setUserHistory(JSON.parse(savedHistory));
      } else {
        const initialHistory = [
          {
            id: 'hist-1',
            type: 'diagnostic',
            title: 'Baseline Diagnostic Assessment',
            field: 'Field Surveys & Household Data (NSSO / PLFS)',
            score: 55,
            status: '2 Gaps Identified',
            date: 'Yesterday, 04:30 PM',
            improvementDelta: '+0%'
          },
          {
            id: 'hist-2',
            type: 'quiz',
            title: 'PLFS Manual Quiz (Field Dilemmas)',
            field: 'Field Sampling & Revisit Protocols',
            score: 75,
            status: 'Passed (3/4 Correct)',
            date: 'Today, 10:15 AM',
            improvementDelta: '+20%'
          }
        ];
        localStorage.setItem(historyKey, JSON.stringify(initialHistory));
        setUserHistory(initialHistory);
      }

      // ONLY show the popup if user has NEVER chosen a field yet (first login)
      if (!user.hasCompletedOnboarding) {
        setShowFieldModal(true);
      } else if (user.selectedField) {
        setSelectedField(user.selectedField);
      }
    }
  }, [user]);

  // Record an activity to user's history
  const recordActivity = (activity) => {
    if (!user?.email) return;
    const historyKey = `sankhya_history_${user.email.toLowerCase()}`;
    const updated = [activity, ...userHistory];
    setUserHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  };

  // Google OAuth Login
  const loginWithGoogle = () => {
    setAuthError('');
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleProfile = await res.json();
                const userEmail = (googleProfile.email || '').toLowerCase();
                const userName = googleProfile.name || userEmail.split('@')[0];

                try {
                  const stored = localStorage.getItem('sankhya_registered_accounts');
                  const registered = stored ? JSON.parse(stored) : {};
                  registered[userEmail] = "GOOGLE_OAUTH_VERIFIED";
                  localStorage.setItem('sankhya_registered_accounts', JSON.stringify(registered));
                } catch (e) {}

                // Check if user has previously logged in
                const existingUserStr = localStorage.getItem('sankhya_user');
                let existingHasOnboarded = false;
                let existingSavedField = 'field_investigator_nsso';
                if (existingUserStr) {
                  try {
                    const eu = JSON.parse(existingUserStr);
                    if (eu.email === userEmail && eu.hasCompletedOnboarding) {
                      existingHasOnboarded = true;
                      existingSavedField = eu.selectedField || existingSavedField;
                    }
                  } catch(e) {}
                }

                const userData = {
                  name: userName,
                  email: userEmail,
                  avatar: '',
                  sub: googleProfile.sub,
                  isGoogleVerified: true,
                  hasCompletedOnboarding: existingHasOnboarded,
                  selectedField: existingSavedField,
                  loginTime: new Date().toLocaleTimeString()
                };
                setUser(userData);
                localStorage.setItem('sankhya_user', JSON.stringify(userData));
                
                if (!existingHasOnboarded) {
                  setShowFieldModal(true);
                }
              } catch (fetchErr) {
                console.error("Error fetching Google profile:", fetchErr);
                setAuthError("Failed to fetch Google profile. Please try again.");
              }
            } else if (tokenResponse?.error) {
              if (tokenResponse.error === 'popup_closed_by_user' || tokenResponse.error === 'access_denied') {
                return;
              }
              setAuthError(`Google Sign-In error: ${tokenResponse.error}`);
            }
          },
          error_callback: (error) => {
            if (
              error?.type === 'popup_closed' || 
              error?.type === 'popup_failed_to_open' ||
              error?.message?.toLowerCase().includes('closed') ||
              error?.message?.toLowerCase().includes('cancel')
            ) {
              return;
            }
            console.warn("Google OAuth error:", error);
            if (error?.message) setAuthError(error.message);
          }
        });
        client.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        console.error("OAuth init error:", err);
        setAuthError("Could not launch Google Sign-In. Ensure http://localhost:5173 is in Authorized Origins.");
      }
    } else {
      setAuthError("Google Identity Services script is loading. Please wait a moment and try again.");
    }
  };

  // Direct Email / Password Authentication
  const handleDirectAuth = (e) => {
    e.preventDefault();
    setAuthError('');

    const trimmedEmail = directEmail.trim().toLowerCase();
    const trimmedPass = directPassword.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setAuthError('Please enter a valid email format (e.g. yourname@gmail.com).');
      return;
    }

    if (!trimmedPass || trimmedPass.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    let registered = {};
    try {
      const stored = localStorage.getItem('sankhya_registered_accounts');
      registered = stored ? JSON.parse(stored) : {
        "lakshayjit.singh2006@gmail.com": "password123",
        "officer.iss@nic.in": "admin123"
      };
    } catch {
      registered = {};
    }

    if (isSignUp) {
      if (registered[trimmedEmail]) {
        setAuthError('An account with this email is already registered. Please switch to Sign In.');
        return;
      }

      registered[trimmedEmail] = trimmedPass;
      localStorage.setItem('sankhya_registered_accounts', JSON.stringify(registered));

      const derivedName = trimmedEmail.split('@')[0].replace('.', ' ').toUpperCase();
      const userData = {
        name: derivedName,
        email: trimmedEmail,
        avatar: '',
        isGoogleVerified: false,
        hasCompletedOnboarding: false, // New user -> show popup once
        selectedField: 'field_investigator_nsso',
        loginTime: new Date().toLocaleTimeString()
      };
      setUser(userData);
      localStorage.setItem('sankhya_user', JSON.stringify(userData));
      setDirectPassword('');
      setDirectEmail('');
      setShowFieldModal(true);
    } else {
      if (!registered[trimmedEmail]) {
        setAuthError('No account found with this email. You must click "Sign up" below to register first.');
        return;
      }

      if (registered[trimmedEmail] !== trimmedPass && registered[trimmedEmail] !== "GOOGLE_OAUTH_VERIFIED") {
        setAuthError('Incorrect password. Please verify your credentials or sign up.');
        return;
      }

      const derivedName = trimmedEmail.split('@')[0].replace('.', ' ').toUpperCase();
      const userData = {
        name: derivedName,
        email: trimmedEmail,
        avatar: '',
        isGoogleVerified: false,
        hasCompletedOnboarding: true, // Existing user -> no popup
        selectedField: selectedField,
        loginTime: new Date().toLocaleTimeString()
      };
      setUser(userData);
      localStorage.setItem('sankhya_user', JSON.stringify(userData));
      setDirectPassword('');
      setDirectEmail('');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
    setDirectEmail('');
    setDirectPassword('');
    setAuthError('');
    localStorage.removeItem('sankhya_user');
  };

  // Confirm Field Selection from Onboarding Modal (Saves hasCompletedOnboarding)
  const confirmFieldSelection = (fieldId) => {
    setSelectedField(fieldId);
    setShowFieldModal(false);
    if (user) {
      const updated = { 
        ...user, 
        hasCompletedOnboarding: true, 
        selectedField: fieldId 
      };
      setUser(updated);
      localStorage.setItem('sankhya_user', JSON.stringify(updated));
    }
  };

  // Option 1: Diagnostic Logic
  const startDiagnostic = (fieldId) => {
    const roleToUse = fieldId || selectedField;
    setSelectedField(roleToUse);
    setDiagnosticResult(null);
    setDiagnosticAnswers({});
    setIsGeneratingDiagnostic(true);
    setActiveTab('diagnostic');
    fetch(`${API_BASE}/roles/${roleToUse}/diagnostic`)
      .then(res => res.json())
      .then(data => {
        setDiagnosticQuestions(data.questions || []);
        setDiagnosticSessionId(data.session_id || '');
        setIsGeneratingDiagnostic(false);
      })
      .catch(err => {
        console.error(err);
        setIsGeneratingDiagnostic(false);
      });
  };

  const handleDiagnosticAnswer = (qId, optionIdx) => {
    setDiagnosticAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const submitDiagnostic = () => {
    setLoadingDiagnostic(true);
    fetch(`${API_BASE}/diagnostic/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role_id: selectedField,
        session_id: diagnosticSessionId,
        answers: diagnosticAnswers
      })
    })
      .then(res => res.json())
      .then(data => {
        setDiagnosticResult(data);
        setLoadingDiagnostic(false);

        const activeF = STATISTICAL_FIELDS.find(f => f.id === selectedField) || STATISTICAL_FIELDS[0];
        recordActivity({
          id: 'diag-' + Date.now(),
          type: 'diagnostic',
          title: `${activeF.designation} Diagnostic`,
          shortTitle: `${activeF.designation.split('-')[0].trim()} Diag`,
          field: `${activeF.title} (10 Questions)`,
          score: data.overall_readiness,
          status: data.gaps_identified.length === 0 ? 'All Proficient (10/10)' : `${data.gaps_identified.length} Gaps Detected`,
          date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          improvementDelta: `+${Math.max(0, data.overall_readiness - 50)}%`
        });
      })
      .catch(err => {
        console.error(err);
        setLoadingDiagnostic(false);
      });
  };

  // Option 2: AI Quiz Logic
  const handleGenerateQuiz = () => {
    setIsGenerating(true);
    setQuizEvaluation(null);
    setQuizAnswers({});
    fetch(`${API_BASE}/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        manual_id: selectedManual,
        custom_text: customText,
        uploaded_filename: uploadedFileName,
        difficulty: difficulty,
        count: quizCount
      })
    })
      .then(res => res.json())
      .then(data => {
        setQuizQuestions(data.questions || []);
        setQuizSessionId(data.session_id || '');
        setIsGenerating(false);
      })
      .catch(err => {
        console.error(err);
        setIsGenerating(false);
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingManual(true);
    setUploadedFileName(file.name);
    setQuizQuestions([]);
    setQuizEvaluation(null);
    setQuizAnswers({});

    const formData = new FormData();
    formData.append('file', file);

    fetch(`${API_BASE}/manuals/upload`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setIsUploadingManual(false);
        if (data.success && data.text) {
          setCustomText(data.text);
          setSelectedManual('uploaded');
        } else {
          // Fallback text read
          const reader = new FileReader();
          reader.onload = (re) => {
            setCustomText(re.target.result || '');
            setSelectedManual('uploaded');
          };
          reader.readAsText(file);
        }
      })
      .catch(err => {
        console.error("Upload error, fallback to client read:", err);
        const reader = new FileReader();
        reader.onload = (re) => {
          setCustomText(re.target.result || '');
          setSelectedManual('uploaded');
          setIsUploadingManual(false);
        };
        reader.readAsText(file);
      });
  };

  const handleQuizAnswer = (qId, optionIdx) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const submitQuiz = () => {
    setIsSubmittingQuiz(true);
    fetch(`${API_BASE}/quiz/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: quizSessionId,
        manual_id: selectedManual,
        answers: quizAnswers
      })
    })
      .then(res => res.json())
      .then(data => {
        setQuizEvaluation(data);
        setIsSubmittingQuiz(false);

        const totalScore = typeof data.total_score !== 'undefined' ? data.total_score : (typeof data.score !== 'undefined' ? data.score : 0);
        const maxScore = typeof data.max_score !== 'undefined' ? data.max_score : (typeof data.total !== 'undefined' ? data.total : (quizQuestions.length || 1));
        const scorePercent = typeof data.percentage !== 'undefined' ? data.percentage : Math.round((totalScore / maxScore) * 100);
        const manualName = uploadedFileName || (selectedManual.replace('manual_', '').toUpperCase());
        
        recordActivity({
          id: 'quiz-' + Date.now(),
          type: 'quiz',
          title: `Quiz: ${manualName}`,
          shortTitle: manualName.length > 12 ? manualName.slice(0, 10) + '…' : manualName,
          field: `${difficulty.toUpperCase()} (${maxScore} Questions)`,
          score: scorePercent,
          status: scorePercent >= 70 ? `Passed (${totalScore}/${maxScore})` : `Review Needed (${totalScore}/${maxScore})`,
          date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          improvementDelta: `+${Math.min(30, scorePercent)}%`
        });
      })
      .catch(err => {
        console.error("Evaluation error:", err);
        setIsSubmittingQuiz(false);
      });
  };

  // Active field details
  const activeFieldDetails = STATISTICAL_FIELDS.find(f => f.id === selectedField) || STATISTICAL_FIELDS[0];

  // User initials
  const userInitials = user ? (user.name || 'Officer')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') : 'OF';

  // =========================================================================
  // 1. AUTHENTICATION SCREEN (IF NOT LOGGED IN)
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcfaf6] flex flex-col justify-between text-slate-900 font-sans">
        
        {/* Top Header - Karmayogi Bharat Branding (Aligned to Left Side) */}
        <header className="py-4 px-6 sm:px-10 bg-[#faf5ec] border-b border-[#ebdcc8]">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-xs p-1.5 border border-[#ebdcc8] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                  <circle cx="50" cy="50" r="44" stroke="#ea8b21" strokeWidth="2.5" strokeDasharray="4 2" />
                  <path d="M50 16 C40 32 30 45 50 68 C70 45 60 32 50 16 Z" fill="#ea8b21" opacity="0.9" />
                  <path d="M26 36 C38 42 46 54 50 68 C38 64 26 52 26 36 Z" fill="#0284c7" opacity="0.85" />
                  <path d="M74 36 C62 42 54 54 50 68 C62 64 74 52 74 36 Z" fill="#10b981" opacity="0.85" />
                  <circle cx="50" cy="68" r="6" fill="#1e293b" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-slate-900">
                    Sankhya<span className="text-[#ea8b21]">Setu</span> AI
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30 rounded">
                    MoSPI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Official Statistical Capacity Building Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 bg-white text-slate-700 border border-[#ebdcc8] rounded-full shadow-2xs">
                SIH Problem #SIH26101
              </span>
            </div>
          </div>
        </header>

        {/* Center Auth Card in Karmayogi Palette (No tick icon) */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white border border-[#ebdcc8] rounded-3xl p-8 sm:p-10 shadow-xl shadow-[#ea8b21]/5 max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {isSignUp ? "Create an Account" : "Sign In"}
              </h1>
              <p className="text-xs text-slate-500">
                {isSignUp 
                  ? "Register with your credentials to access your official MoSPI dashboard." 
                  : "Enter your credentials or use Google OAuth to access your account."}
              </p>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{authError}</span>
              </div>
            )}

            {/* Official Google OAuth Button */}
            <div className="space-y-4 pt-1">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full py-3 px-4 bg-white hover:bg-[#faf5ec] text-slate-800 border border-[#ebdcc8] hover:border-[#ea8b21]/60 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>

              {/* Centered 'or' Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full border-t border-[#ebdcc8]"></div>
                <span className="absolute bg-white px-3 text-xs text-slate-400 font-medium">
                  or
                </span>
              </div>

              {/* Email & Password Form in Karmayogi Palette */}
              <form onSubmit={handleDirectAuth} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="officer@mospi.gov.in"
                    value={directEmail}
                    onChange={(e) => {
                      setDirectEmail(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    className="w-full px-4 py-3 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isSignUp ? "Create password (min. 6 characters)" : "Password"}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={directPassword}
                    onChange={(e) => {
                      setDirectPassword(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    className="w-full px-4 py-3 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/25 hover:shadow-lg hover:shadow-[#ea8b21]/30 cursor-pointer mt-1"
                >
                  {isSignUp ? "Create Account & Continue" : "Sign In to Portal"}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                {isSignUp ? (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(false); setAuthError(''); }}
                      className="text-[#ea8b21] hover:text-[#d97d16] font-bold hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(true); setAuthError(''); }}
                      className="text-[#ea8b21] hover:text-[#d97d16] font-bold hover:underline cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-slate-400 border-t border-[#ebdcc8] bg-white">
          Ministry of Statistics and Programme Implementation • Smart India Hackathon 2026 • SIH26101
        </footer>
      </div>
    );
  }
  // =========================================================================
  // 2. AUTHENTICATED WORKSPACE (MODERN SAAS LEFT-SIDEBAR LAYOUT)
  // =========================================================================
  return (
    <div className="flex h-screen bg-[#fcfaf6] text-slate-900 font-sans overflow-hidden">
      
      {/* =====================================================================
          LEFT SIDEBAR NAVIGATION (Official Karmayogi Bharat Color Scheme)
          ===================================================================== */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#faf5ec] text-slate-800 border-r border-[#ebdcc8] flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Top of Sidebar: Karmayogi Emblem & Clean Nav */}
        <div className="p-4 space-y-5">
          
          {/* Karmayogi Bharat & MoSPI Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-1.5 border-b border-[#ebdcc8]/80 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs p-1.5 border border-[#ebdcc8] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                {/* Karmayogi Bharat Lotus Petals & Chakra Motif */}
                <circle cx="50" cy="50" r="44" stroke="#ea8b21" strokeWidth="2.5" strokeDasharray="4 2" />
                <path d="M50 16 C40 32 30 45 50 68 C70 45 60 32 50 16 Z" fill="#ea8b21" opacity="0.9" />
                <path d="M26 36 C38 42 46 54 50 68 C38 64 26 52 26 36 Z" fill="#0284c7" opacity="0.85" />
                <path d="M74 36 C62 42 54 54 50 68 C62 64 74 52 74 36 Z" fill="#10b981" opacity="0.85" />
                <circle cx="50" cy="68" r="6" fill="#1e293b" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900">
                  Sankhya<span className="text-[#ea8b21]">Setu</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30 rounded">
                  MoSPI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">Karmayogi Bharat Ecosystem</p>
            </div>
          </div>

          {/* Navigation Links (Bigger, Comfortable Text & Icons) */}
          <nav className="space-y-2 pt-1">
            
            {/* 1. Home */}
            <button
              onClick={() => { setActiveTab('home'); setMobileSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30 font-extrabold scale-[1.01]'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-[#eee3d3]/80'
              }`}
            >
              <Home className={`w-5 h-5 shrink-0 ${activeTab === 'home' ? 'text-white' : 'text-slate-600'}`} />
              <span className="tracking-tight">Home Hub</span>
            </button>

            {/* 2. Skill Gap Diagnostic */}
            <button
              onClick={() => { 
                if (!diagnosticQuestions.length) startDiagnostic(selectedField);
                else setActiveTab('diagnostic');
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === 'diagnostic'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30 font-extrabold scale-[1.01]'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-[#eee3d3]/80'
              }`}
            >
              <Compass className={`w-5 h-5 shrink-0 ${activeTab === 'diagnostic' ? 'text-white' : 'text-slate-600'}`} />
              <span className="tracking-tight">Skill Gap Diagnostic</span>
            </button>

            {/* 3. Upload Manual & Quiz */}
            <button
              onClick={() => { 
                setActiveTab('upload_quiz');
                if (!quizQuestions.length) handleGenerateQuiz();
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === 'upload_quiz'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30 font-extrabold scale-[1.01]'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-[#eee3d3]/80'
              }`}
            >
              <Upload className={`w-5 h-5 shrink-0 ${activeTab === 'upload_quiz' ? 'text-white' : 'text-slate-600'}`} />
              <span className="tracking-tight">Upload Manual & Quiz</span>
            </button>

            {/* 4. Officer Dashboard */}
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30 font-extrabold scale-[1.01]'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-[#eee3d3]/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BarChart3 className={`w-5 h-5 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-600'}`} />
                <span className="tracking-tight">Officer Dashboard</span>
              </div>
              {userHistory.length > 0 && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30'
                }`}>
                  {userHistory.length}
                </span>
              )}
            </button>

          </nav>

        </div>

        {/* Bottom of Sidebar: Officer Profile Card */}
        <div className="p-3.5 m-2.5 rounded-2xl bg-white/80 border border-[#ebdcc8] shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#ea8b21] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                {userInitials}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Officer
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        ></div>
      )}

      {/* =====================================================================
          MAIN WORKSPACE CONTENT AREA (Right Side)
          ===================================================================== */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
        
        {/* Top Minimal Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg md:hidden text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">MoSPI Platform</span>
              <span>/</span>
              <span className="capitalize font-bold text-[#ea8b21]">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-semibold px-3 py-1 bg-[#ea8b21]/10 text-[#ea8b21] border border-[#ea8b21]/30 rounded-full font-mono">
            SIH Problem #SIH26101
          </span>
        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8">

          {/* ===================================================================
              SECTION 1: HOME - ABOUT SANKHYASETU AI & HOW IT WORKS
              =================================================================== */}
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Refined, Light, Airy Hero Card (Clean Karmayogi Bharat Style) */}
              <div className="bg-white border border-[#ebdcc8] rounded-3xl p-7 sm:p-9 shadow-xs space-y-6 relative overflow-hidden">
                {/* Subtle warm accent ambient highlight */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#ea8b21]/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#ebdcc8]/60">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ea8b21]/10 border border-[#ea8b21]/20 text-[#ea8b21] rounded-full text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MoSPI Official Capacity Building • Karmayogi Bharat Ecosystem</span>
                  </div>

                  <button
                    onClick={() => setShowFieldModal(true)}
                    className="self-start sm:self-auto px-3.5 py-1.5 bg-[#faf5ec] hover:bg-[#eee3d3] text-slate-800 border border-[#ebdcc8] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-[#ea8b21]" />
                    <span>Change Working Field</span>
                  </button>
                </div>

                <div className="space-y-3 max-w-3xl relative z-10">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                    Empowering India's Official Statistical System with AI
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    <strong>SankhyaSetu AI</strong> is an intelligent learning and assessment platform engineered for the <strong>Ministry of Statistics and Programme Implementation (MoSPI)</strong>. Integrated with the <strong>iGOT Karmayogi</strong> framework, it diagnoses domain competency gaps, generates ground-truth validated survey quizzes, and delivers targeted micro-learning for statistical officers across India.
                  </p>
                </div>

                {/* Bottom Cadre & Action Bar */}
                <div className="pt-3 border-t border-[#ebdcc8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Working Domain</p>
                      <p className="text-xs sm:text-sm font-black text-slate-900">{activeFieldDetails.title}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-5 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/20 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>View Your Progress Record</span>
                  </button>
                </div>
              </div>

              {/* Platform Pillars / Core Capabilities (Elevated Executive Design - FULLY CLICKABLE) */}
              <div className="space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#ea8b21] uppercase tracking-wider block mb-1">
                      System Architecture
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      How SankhyaSetu AI Elevates Statistical Capacity
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Operationalizing the National Framework for Roles, Activities and Competencies (FRAC) for MoSPI.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Pillar 1 - Clickable */}
                  <div 
                    onClick={() => startDiagnostic(selectedField)}
                    className="bg-white border border-[#ebdcc8] rounded-3xl p-7 shadow-xs space-y-5 flex flex-col justify-between hover:shadow-lg hover:border-[#ea8b21] hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center shadow-xs group-hover:bg-[#ea8b21] group-hover:text-white transition-colors">
                        <Compass className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-[#ea8b21] transition-colors">
                          Role-Based Competency Diagnosis
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Evaluates field investigators, statistical officers, and supervisors through targeted 5-question scenario assessments. Pinpoints gaps in sampling design, CAPI software, and non-response protocols.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-700 border border-[#ebdcc8]">FRAC Level 1-4</span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-700 border border-[#ebdcc8]">Radar Analytics</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#ebdcc8]/60 flex items-center justify-between text-xs font-bold text-[#ea8b21] group-hover:text-[#d97d16]">
                      <span>Open Skill Gap Diagnostic</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>

                  {/* Pillar 2 - Clickable */}
                  <div 
                    onClick={() => {
                      setActiveTab('upload_quiz');
                    }}
                    className="bg-white border border-[#ebdcc8] rounded-3xl p-7 shadow-xs space-y-5 flex flex-col justify-between hover:shadow-lg hover:border-[#ea8b21] hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center shadow-xs group-hover:bg-[#ea8b21] group-hover:text-white transition-colors">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-[#ea8b21] transition-colors">
                          Ground-Truth Citations (No Hallucinations)
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Every generated question is backed by verbatim ground-truth source citations. Officers see the exact survey manual title, section clause, page number, and quote verifying each answer.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-700 border border-[#ebdcc8]">Page Cited</span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-700 border border-[#ebdcc8]">Verbatim Quotes</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#ebdcc8]/60 flex items-center justify-between text-xs font-bold text-[#ea8b21] group-hover:text-[#d97d16]">
                      <span>Open Upload & Quiz Generator</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>

                  {/* Pillar 3 - Clickable with Real Working YouTube Embed */}
                  <div 
                    onClick={() => {
                      setVideoTimestamp(0);
                      setActiveVideoModal({
                        youtubeId: "2e4QcK9ap2s",
                        title: "Mission Karmayogi: National Capacity Building Framework",
                        timestampLabel: "Official Government of India Orientation • Karmayogi Bharat",
                        provider: "Capacity Building Commission & MoSPI",
                        duration: "4:23 Mins",
                        currentChapter: 0,
                        timestamps: [
                          { seconds: 0, time: "00:00", label: "00:00 - Introduction to Mission Karmayogi", slide: "National Programme for Civil Services Capacity Building" },
                          { seconds: 65, time: "01:05", label: "01:05 - Shift from Rule to Role Governance", slide: "Empowering Statistical Cadres with Targeted Competencies" },
                          { seconds: 135, time: "02:15", label: "02:15 - iGOT Karmayogi Digital Platform", slide: "On-demand Learning Ecosystem for Civil Servants" },
                          { seconds: 200, time: "03:20", label: "03:20 - Future-Ready Civil Services Vision", slide: "Transforming Public Service Delivery for Viksit Bharat" }
                        ]
                      });
                    }}
                    className="bg-white border border-[#ebdcc8] rounded-3xl p-7 shadow-xs space-y-5 flex flex-col justify-between hover:shadow-lg hover:border-[#ea8b21] hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center shadow-xs group-hover:bg-[#ea8b21] group-hover:text-white transition-colors">
                        <Play className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-[#ea8b21] transition-colors">
                          iGOT Karmayogi Timestamped Learning
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Identified gaps are paired with tailored micro-learning video modules from the iGOT ecosystem that start at the exact minute and second where the concept is taught.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-700 border border-[#ebdcc8]">Timestamp Seeking</span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-700 border border-[#ebdcc8]">Micro-Modules</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#ebdcc8]/60 flex items-center justify-between text-xs font-bold text-[#ea8b21] group-hover:text-[#d97d16]">
                      <span>Watch Karmayogi Video Clip</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>

                </div>
              </div>

              {/* How To Navigate The Platform Guide (Interactive Stepper) */}
              <div className="bg-white border border-[#ebdcc8] rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#ebdcc8]/60 gap-2">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">How to Navigate SankhyaSetu AI</h3>
                    <p className="text-xs text-slate-500">Click any step below to launch that module directly:</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-[#faf5ec] text-slate-700 rounded-full border border-[#ebdcc8] self-start sm:self-auto">
                    Interactive 4-Step Guide
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* Step 1 - Interactive */}
                  <div 
                    onClick={() => setShowFieldModal(true)}
                    className="p-5 rounded-2xl bg-[#faf5ec]/70 border border-[#ebdcc8] space-y-3 relative group hover:border-[#ea8b21] hover:bg-white hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#ea8b21] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[#ea8b21]/30">
                        1
                      </div>
                      <span className="text-[10px] font-bold text-[#ea8b21] opacity-0 group-hover:opacity-100 transition-opacity">
                        Configure ➔
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#ea8b21] transition-colors">Set Working Field</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click to choose or switch your domain (NSSO, CSO, or ASUSE).
                    </p>
                  </div>

                  {/* Step 2 - Interactive */}
                  <div 
                    onClick={() => startDiagnostic(selectedField)}
                    className="p-5 rounded-2xl bg-[#faf5ec]/70 border border-[#ebdcc8] space-y-3 relative group hover:border-[#ea8b21] hover:bg-white hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#ea8b21] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[#ea8b21]/30">
                        2
                      </div>
                      <span className="text-[10px] font-bold text-[#ea8b21] opacity-0 group-hover:opacity-100 transition-opacity">
                        Start ➔
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#ea8b21] transition-colors">Run Skill Diagnostic</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click to take the 10-question AI test to detect weak areas & see your Radar.
                    </p>
                  </div>

                  {/* Step 3 - Interactive */}
                  <div 
                    onClick={() => {
                      setActiveTab('upload_quiz');
                    }}
                    className="p-5 rounded-2xl bg-[#faf5ec]/70 border border-[#ebdcc8] space-y-3 relative group hover:border-[#ea8b21] hover:bg-white hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#ea8b21] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[#ea8b21]/30">
                        3
                      </div>
                      <span className="text-[10px] font-bold text-[#ea8b21] opacity-0 group-hover:opacity-100 transition-opacity">
                        Generate ➔
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#ea8b21] transition-colors">Generate Quizzes</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click to upload survey manuals and test with Ground Truth citations.
                    </p>
                  </div>

                  {/* Step 4 - Interactive */}
                  <div 
                    onClick={() => setActiveTab('dashboard')}
                    className="p-5 rounded-2xl bg-[#faf5ec]/70 border border-[#ebdcc8] space-y-3 relative group hover:border-[#ea8b21] hover:bg-white hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#ea8b21] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[#ea8b21]/30">
                        4
                      </div>
                      <span className="text-[10px] font-bold text-[#ea8b21] opacity-0 group-hover:opacity-100 transition-opacity">
                        View ➔
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#ea8b21] transition-colors">Audit in Dashboard</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click to review previous test attempts and track competency growth.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              SECTION 2: SKILL GAP DIAGNOSTIC
              =================================================================== */}
          {activeTab === 'diagnostic' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#ea8b21] px-3 py-1 bg-[#ea8b21]/15 border border-[#ea8b21]/30 rounded-full">
                  Assessing Domain: {activeFieldDetails.designation}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  FRAC Competency Framework
                </span>
              </div>

              {isGeneratingDiagnostic && (
                <div className="p-12 text-center bg-white border border-[#ebdcc8] rounded-3xl space-y-4 shadow-sm animate-in fade-in duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center mx-auto shadow-xs">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#ea8b21]" />
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">Gemini AI Generating 10 Dynamic Diagnostic Scenarios...</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Synthesizing 2 real-world Indian field scenarios for each of the 5 official MoSPI competencies for <span className="font-bold text-slate-700">{activeFieldDetails.title}</span>.
                  </p>
                </div>
              )}

              {!diagnosticResult && !isGeneratingDiagnostic && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#ea8b21] uppercase tracking-wider">
                          FRAC Competency Assessment
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" /> 10 Questions • Powered by Gemini Flash
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                        Answer these {diagnosticQuestions.length || 10} questions to diagnose your weaker competencies
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Evaluating official MoSPI competencies for {activeFieldDetails.title}. Completely unique AI scenarios generated on every single attempt.
                      </p>
                    </div>

                    <button
                      onClick={() => startDiagnostic(selectedField)}
                      className="px-3.5 py-2 rounded-xl bg-[#faf5ec] hover:bg-[#ebdcc8]/50 border border-[#ebdcc8] text-xs font-bold text-[#ea8b21] flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-2xs shrink-0"
                      title="Generate brand new random questions"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate Scenarios</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {diagnosticQuestions.map((q, idx) => (
                      <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#ea8b21] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {q.question}
                          </h3>
                        </div>

                        <div className="space-y-2 pl-9">
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              onClick={() => handleDiagnosticAnswer(q.id, oIdx)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                diagnosticAnswers[q.id] === oIdx
                                  ? 'bg-[#ea8b21]/10 border-[#ea8b21] text-slate-900 font-bold shadow-2xs'
                                  : 'bg-white border-[#ebdcc8] text-slate-700 hover:bg-[#faf5ec]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={diagnosticAnswers[q.id] === oIdx}
                                onChange={() => handleDiagnosticAnswer(q.id, oIdx)}
                                className="text-[#ea8b21] focus:ring-[#ea8b21]"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {Object.keys(diagnosticAnswers).length} of {diagnosticQuestions.length} answered
                    </span>
                    <button
                      onClick={submitDiagnostic}
                      disabled={loadingDiagnostic || Object.keys(diagnosticAnswers).length < diagnosticQuestions.length}
                      className="px-6 py-3 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loadingDiagnostic ? "Calculating Gaps..." : "Submit & View My Gaps"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {diagnosticResult && !isGeneratingDiagnostic && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-[#ea8b21] uppercase tracking-wider">
                          Evaluation Results
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">
                          Identified Competency Gaps
                        </h2>
                        <p className="text-xs text-slate-500">
                          Mapped against National Framework for Roles, Activities and Competencies (FRAC).
                        </p>
                      </div>
                      <div className="text-left sm:text-right bg-[#ea8b21]/15 px-5 py-3 rounded-2xl border border-[#ea8b21]/30">
                        <span className="text-3xl font-black text-[#ea8b21]">
                          {diagnosticResult.overall_readiness}%
                        </span>
                        <p className="text-[10px] uppercase font-bold text-[#ea8b21]">Overall Readiness</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Radar Diagram Container with Generous Breathing Room */}
                      <div className="lg:col-span-7 bg-[#fcfaf6] border border-[#ebdcc8] rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc8]/80">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ea8b21]" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                FRAC Competency Radar Map
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Visual gap analysis against official MoSPI benchmark standards
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-3 py-1 bg-white border border-[#ebdcc8] rounded-full text-slate-700 shadow-2xs">
                            Cadre Benchmark: Level 3
                          </span>
                        </div>

                        {/* Radar Chart SVG with outerRadius 48% to guarantee 0% clipping */}
                        <div className="h-80 sm:h-96 w-full flex items-center justify-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart 
                              data={diagnosticResult.competency_scores.map(c => ({
                                ...c,
                                chart_score: Math.max(4, c.score) // Minimum 4% floor for crisp geometric visibility
                              }))}
                              cx="50%" 
                              cy="50%" 
                              outerRadius="48%"
                            >
                              <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                              <PolarAngleAxis 
                                dataKey="name" 
                                tick={({ x, y, payload }) => {
                                  const lines = formatRadarLines(payload.value);
                                  const compData = diagnosticResult.competency_scores.find(c => c.name === payload.value) || {};
                                  const scoreVal = compData.score ?? 0;
                                  const isGap = compData.is_gap ?? (scoreVal < 75);

                                  return (
                                    <g transform={`translate(${x},${y})`}>
                                      <text
                                        textAnchor="middle"
                                        fontSize={11}
                                        fontWeight={800}
                                        fill="#1e293b"
                                        className="select-none"
                                      >
                                        <tspan x={0} dy="-0.7em">{lines[0]}</tspan>
                                        <tspan x={0} dy="1.15em">{lines[1]}</tspan>
                                        <tspan 
                                          x={0} 
                                          dy="1.25em" 
                                          fontSize={10} 
                                          fontWeight={900} 
                                          fill={isGap ? "#ea8b21" : "#059669"}
                                        >
                                          ({scoreVal}%)
                                        </tspan>
                                      </text>
                                    </g>
                                  );
                                }}
                              />
                              <PolarRadiusAxis 
                                angle={90} 
                                domain={[0, 100]} 
                                stroke="#94a3b8" 
                                tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} 
                              />
                              {/* Baseline Benchmark Target Layer (Dashed Blue-Slate) */}
                              <Radar 
                                name="MoSPI Cadre Target" 
                                dataKey="required_level" 
                                stroke="#2563eb" 
                                strokeWidth={2}
                                strokeDasharray="5 4"
                                fill="#3b82f6" 
                                fillOpacity={0.08} 
                              />
                              {/* Officer Score Layer (Warm Karmayogi Saffron) */}
                              <Radar 
                                name="Your Competency Score" 
                                dataKey="chart_score" 
                                stroke="#ea8b21" 
                                strokeWidth={3}
                                fill="#ea8b21" 
                                fillOpacity={0.45}
                                dot={{ r: 5, fill: '#ea8b21', strokeWidth: 2, stroke: '#ffffff' }}
                                activeDot={{ r: 7, fill: '#d97d16', stroke: '#ffffff', strokeWidth: 2 }}
                              />
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-slate-900/95 backdrop-blur-xs text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-2 border border-slate-700 min-w-[210px]">
                                        <p className="font-extrabold text-amber-400 border-b border-slate-700/80 pb-1">{data.name}</p>
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="text-slate-300">Your Score:</span>
                                          <span className="font-black text-[#ea8b21]">{data.score}%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="text-slate-400">MoSPI Target Level:</span>
                                          <span className="font-bold text-blue-300">{data.required_level}%</span>
                                        </div>
                                        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
                                          <span className="text-slate-400">Status:</span>
                                          <span className={`font-bold px-2 py-0.5 rounded ${data.is_gap ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'}`}>
                                            {data.status}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Visual Legend */}
                        <div className="pt-3 border-t border-[#ebdcc8]/80 flex flex-wrap items-center justify-center gap-6 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-md bg-[#ea8b21] border border-[#ea8b21] shadow-2xs" />
                            <span className="font-bold text-slate-800">Your Competency Score</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-md bg-blue-50 border-2 border-dashed border-blue-500" />
                            <span className="font-semibold text-slate-600">MoSPI Benchmark Target</span>
                          </div>
                        </div>
                      </div>

                      {/* Scorecard Column with Dual-Track Target Needles */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center justify-between pb-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Competency Scorecard
                          </h4>
                          <span className="text-[11px] font-bold text-slate-500">
                            {diagnosticResult.competency_scores.filter(c => !c.is_gap).length} of {diagnosticResult.competency_scores.length} Proficient
                          </span>
                        </div>

                        <div className="space-y-3">
                          {diagnosticResult.competency_scores.map(comp => (
                            <div key={comp.id} className="p-4 rounded-2xl bg-white border border-[#ebdcc8] shadow-2xs space-y-2.5 hover:border-[#ea8b21] transition-all">
                              <div className="flex items-start justify-between gap-2 text-xs">
                                <div>
                                  <p className="font-extrabold text-slate-900 leading-snug">{comp.name}</p>
                                  <div className="flex items-center gap-3 mt-1 text-[11px]">
                                    <span className="text-slate-500">
                                      Target: <span className="font-bold text-blue-600">{comp.required_level}%</span>
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-500">
                                      You: <span className={`font-black ${comp.score >= comp.required_level ? 'text-emerald-700' : 'text-[#ea8b21]'}`}>{comp.score}%</span>
                                    </span>
                                  </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-xl font-bold text-[10px] flex items-center gap-1 shrink-0 ${
                                  comp.is_gap
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                                }`}>
                                  {comp.is_gap ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                  {comp.status}
                                </span>
                              </div>

                              {/* Dual-Track Benchmark Needle Bar */}
                              <div className="space-y-1">
                                <div className="w-full bg-[#faf5ec] h-2.5 rounded-full overflow-hidden border border-[#ebdcc8]/80 relative">
                                  {/* Target Threshold Needle Line */}
                                  <div 
                                    className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10" 
                                    style={{ left: `${comp.required_level}%` }}
                                    title={`Target Benchmark: ${comp.required_level}%`}
                                  />
                                  {/* Current Score Fill Bar */}
                                  <div 
                                    className={`h-full rounded-full transition-all duration-700 ${comp.is_gap ? 'bg-gradient-to-r from-amber-400 to-[#ea8b21]' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`} 
                                    style={{ width: `${Math.min(100, comp.score)}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 px-0.5">
                                  <span>0%</span>
                                  <span className="text-blue-600 font-semibold">Target {comp.required_level}%</span>
                                  <span>100%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
<div className="pt-6 border-t border-slate-100 space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#ea8b21] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Targeted iGOT Karmayogi Training to Fix These Weak Sections:
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {diagnosticResult.recommended_courses.map(c => (
                          <div key={c.id} className="p-5 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] hover:border-[#ea8b21] transition-all space-y-3 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[10px] px-2 py-0.5 bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30 rounded font-bold">
                                {c.duration} • {c.provider}
                              </span>
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{c.title}</h4>
                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{c.summary}</p>
                            </div>

                            <div className="pt-2 border-t border-indigo-100">
                              <button
                                onClick={() => {
                                  const ytId = c.id === 'igot_stat_103' ? 'bAjEFHdsTQ4' : (c.id === 'igot_stat_104' ? '10io3Qgmk6Y' : 'zvNc_prsHUM');
                                  setVideoTimestamp(c.recommended_timestamps[0].time_seconds || 0);
                                  setActiveVideoModal({
                                    youtubeId: ytId,
                                    title: c.title,
                                    timestampLabel: c.recommended_timestamps[0].label,
                                    provider: c.provider,
                                    duration: c.duration,
                                    currentChapter: 0,
                                    timestamps: c.recommended_timestamps.map(rt => ({
                                      seconds: rt.time_seconds,
                                      time: rt.label.split('-')[0].trim(),
                                      label: rt.label,
                                      slide: c.summary
                                    }))
                                  });
                                }}
                                className="w-full py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                              >
                                <Play className="w-3.5 h-3.5" />
                                Watch Relevant Clip ({c.recommended_timestamps[0].label.split('-')[0].trim()})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => startDiagnostic(selectedField)}
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer shadow-2xs"
                    >
                      Retake Diagnostic Test
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="px-5 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      View in Dashboard <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================================
              SECTION 3: UPLOAD MANUAL & AI QUIZ GENERATOR
              =================================================================== */}
          {activeTab === 'upload_quiz' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#ea8b21] px-3 py-1 bg-[#ea8b21]/15 border border-[#ea8b21]/30 rounded-full">
                  AI Question Engine & Ground Truth Citations
                </span>
                <span className="text-xs font-medium text-slate-500">
                  RAG Document Verification
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#ea8b21] uppercase tracking-wider">
                      Step 1: Document Upload & Setup
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> AI Scenario Engine Active
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Upload Survey Guidelines or Pick an Official Manual
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    The AI reads the guidelines and generates dynamic scenario-based test questions with page-by-page source citations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Select Official MoSPI Manual:</label>
                    <select
                      value={uploadedFileName ? 'uploaded' : selectedManual}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'uploaded') {
                          setSelectedManual('uploaded');
                        } else {
                          setSelectedManual(val);
                          setUploadedFileName('');
                          setCustomText('');
                        }
                        setQuizQuestions([]);
                        setQuizEvaluation(null);
                        setQuizAnswers({});
                      }}
                      className="w-full bg-[#faf5ec]/70 border border-[#ebdcc8] rounded-xl p-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-[#ea8b21] cursor-pointer shadow-2xs"
                    >
                      {uploadedFileName && (
                        <option value="uploaded">📄 Custom Upload: {uploadedFileName}</option>
                      )}
                      {manuals.map(m => (
                        <option key={m.id} value={m.id}>{m.title} ({m.pages} pgs)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Question Style (Bloom's Taxonomy):</label>
                    <select
                      value={difficulty}
                      onChange={(e) => {
                        setDifficulty(e.target.value);
                        setQuizQuestions([]);
                        setQuizEvaluation(null);
                        setQuizAnswers({});
                      }}
                      className="w-full bg-[#faf5ec]/50 border border-[#ebdcc8] rounded-xl p-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-[#ea8b21]"
                    >
                      <option value="recall">Bloom L1: Direct Guideline Recall</option>
                      <option value="scenario">Bloom L2: Field Dilemmas (Real Application)</option>
                      <option value="analytical">Bloom L3: Critical Verification & Imputation</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Assessment Length (Question Count):</label>
                    <select
                      value={quizCount}
                      onChange={(e) => {
                        setQuizCount(Number(e.target.value));
                        setQuizQuestions([]);
                        setQuizEvaluation(null);
                        setQuizAnswers({});
                      }}
                      className="w-full bg-[#faf5ec]/50 border border-[#ebdcc8] rounded-xl p-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-[#ea8b21]"
                    >
                      <option value={5}>5 Questions (Quick Check • ~5 mins)</option>
                      <option value={10}>10 Questions (Standard Quiz • ~10 mins)</option>
                      <option value={20}>20 Questions (Comprehensive Test • ~20 mins)</option>
                      <option value={30}>30 Questions (Full Mock Assessment • ~30 mins)</option>
                    </select>
                  </div>
                </div>

                {uploadedFileName && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-emerald-950">Active Manual: {uploadedFileName}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200/70 text-emerald-900 rounded-full">
                            Custom Upload Active
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          AI will generate all questions exclusively from this uploaded document.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFileName('');
                        setCustomText('');
                        setSelectedManual('manual_cpi_rural');
                        setQuizQuestions([]);
                        setQuizEvaluation(null);
                        setQuizAnswers({});
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-rose-600 font-bold hover:bg-rose-50 transition-all cursor-pointer text-xs shrink-0 shadow-2xs"
                    >
                      Clear & Reset
                    </button>
                  </div>
                )}

                <div className="border-2 border-dashed border-[#ebdcc8] hover:border-[#ea8b21] rounded-2xl p-6 text-center bg-white hover:bg-[#faf5ec]/60 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {isUploadingManual ? (
                    <div className="space-y-2">
                      <RefreshCw className="w-8 h-8 text-[#ea8b21] mx-auto animate-spin" />
                      <p className="text-xs font-bold text-slate-800">
                        Extracting Full Text from {uploadedFileName}...
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Using high-speed PyMuPDF PDF parser
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#ea8b21] mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">
                        {uploadedFileName ? `Re-upload or replace: ${uploadedFileName}` : "Click or Drag & Drop to Upload Custom Manual (PDF or TXT)"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Supports official PDF manuals, circulars, survey instruction booklets, and training notes
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                  className="w-full py-3.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                      <span>Gemini AI Synthesizing Questions...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Generate AI Quiz Questions</span>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </span>
                  )}
                </button>
              </div>

              {quizQuestions.length === 0 && !isGenerating && (
                <div className="p-8 text-center bg-white border border-[#ebdcc8] rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center mx-auto shadow-2xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">Ready to Generate Assessment</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Select your manual and desired Bloom's taxonomy level above, then click <span className="font-bold text-[#ea8b21]">"Generate AI Quiz Questions"</span> to dynamically synthesize questions.
                  </p>
                </div>
              )}

              {quizQuestions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#ea8b21] uppercase tracking-wider">
                        Step 2: Solve Assessment
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">
                        {quizQuestions.length} Questions Generated from {uploadedFileName ? uploadedFileName : selectedManual.replace('manual_', '').toUpperCase()}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Powered by Google Gemini Flash (Live LLM)
                    </span>
                  </div>

                  {/* Top Score Summary Banner if Evaluated */}
                  {quizEvaluation && (() => {
                    const totalScore = typeof quizEvaluation.total_score !== 'undefined' ? quizEvaluation.total_score : (typeof quizEvaluation.score !== 'undefined' ? quizEvaluation.score : 0);
                    const maxScore = typeof quizEvaluation.max_score !== 'undefined' ? quizEvaluation.max_score : (typeof quizEvaluation.total !== 'undefined' ? quizEvaluation.total : (quizQuestions.length || 1));
                    const scorePercent = typeof quizEvaluation.percentage !== 'undefined' ? quizEvaluation.percentage : Math.round((totalScore / maxScore) * 100);
                    const isPass = scorePercent >= 70;

                    return (
                      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200 ${
                        isPass ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}>
                        <div className="flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                            isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isPass ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-sm sm:text-base">
                                Assessment Score: {totalScore} / {maxScore} ({scorePercent}%)
                              </h4>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                isPass ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                              }`}>
                                {isPass ? 'Passed' : 'Needs Review'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              {isPass 
                                ? "Outstanding competency! You met the official MoSPI operational standard." 
                                : "Review the ground-truth citations below to master specific manual clauses."}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setQuizEvaluation(null);
                            setQuizAnswers({});
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all self-start sm:self-auto shadow-2xs shrink-0"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    );
                  })()}

                  <div className="space-y-6">
                    {quizQuestions.map((q, qIndex) => (
                      <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#ea8b21] text-white font-bold text-xs flex items-center justify-center">
                              {qIndex + 1}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                              {q.bloom_level}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">{q.source_manual}</span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {q.question}
                        </h4>

                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              onClick={() => handleQuizAnswer(q.id, oIdx)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                quizAnswers[q.id] === oIdx
                                  ? 'bg-[#ea8b21]/10 border-[#ea8b21] text-slate-950 font-bold shadow-2xs'
                                  : 'bg-white border-[#ebdcc8] text-slate-700 hover:bg-[#faf5ec]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`quiz_q_${q.id}`}
                                checked={quizAnswers[q.id] === oIdx}
                                onChange={() => handleQuizAnswer(q.id, oIdx)}
                                className="text-[#ea8b21] focus:ring-[#ea8b21]"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>

                        {quizEvaluation && (() => {
                          const resList = quizEvaluation.results || quizEvaluation.detailed_results || [];
                          const res = resList.find(r => r.id === q.id || r.question_id === q.id);
                          if (!res) return null;
                          const userIdx = typeof res.user_choice !== 'undefined' ? res.user_choice : (typeof res.user_answer !== 'undefined' ? res.user_answer : -1);
                          const correctIdx = typeof res.correct_choice !== 'undefined' ? res.correct_choice : (typeof res.correct_answer !== 'undefined' ? res.correct_answer : 0);
                          const isCorrect = res.is_correct ?? (userIdx === correctIdx);
                          const citation = res.citation || {};

                          return (
                            <div className="mt-4 pt-3 border-t border-slate-200 animate-in fade-in duration-200">
                              <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                  : 'bg-rose-50 border-rose-200 text-rose-950'
                              }`}>
                                <div className="flex items-center justify-between font-bold">
                                  <span className="flex items-center gap-1.5">
                                    {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                                    {isCorrect ? 'Correct Choice' : 'Incorrect Choice'}
                                  </span>
                                  <span className="text-[11px] font-mono">
                                    Your Choice: Opt {userIdx >= 0 ? userIdx + 1 : 'None'} • Correct: Opt {correctIdx + 1}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-700 leading-relaxed">
                                  {res.explanation || 'Verified with official guidelines.'}
                                </p>

                                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                                  <div className="flex items-center justify-between font-bold text-slate-900">
                                    <span className="flex items-center gap-1 text-[#ea8b21]">
                                      <BookOpen className="w-3.5 h-3.5" />
                                      Verified Ground Truth Source Citation:
                                    </span>
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-bold">
                                      {citation.page || 'Page Reference'}
                                    </span>
                                  </div>
                                  <p className="font-semibold text-slate-800">
                                    {citation.manual || q.source_manual || 'Official MoSPI Manual'} • {citation.section || 'Guideline Clause'}
                                  </p>
                                  <p className="italic text-slate-600 text-[10px] bg-slate-50 p-2 rounded border border-slate-100">
                                    "{citation.exact_quote || res.explanation || 'Guidelines prescribe this standard methodology.'}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {Object.keys(quizAnswers).length} of {quizQuestions.length} answered
                    </span>
                    <button
                      onClick={submitQuiz}
                      disabled={isSubmittingQuiz || Object.keys(quizAnswers).length < quizQuestions.length}
                      className="px-6 py-3 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingQuiz ? "Verifying Ground Truth..." : "Submit & Check Citations"}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              SECTION 4: OFFICER DASHBOARD
              =================================================================== */}
          {activeTab === 'dashboard' && (() => {
            const completedCount = userHistory.length;
            const avgScore = completedCount > 0
              ? Math.round(userHistory.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / completedCount)
              : 0;

            const latestAttempt = completedCount > 0 ? userHistory[0] : null;
            const oldestAttempt = completedCount > 0 ? userHistory[userHistory.length - 1] : null;
            const growthDelta = latestAttempt && oldestAttempt ? (latestAttempt.score - oldestAttempt.score) : 0;
            const passedCount = userHistory.filter(h => Number(h.score) >= 75).length;
            const passPercentage = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0;

            const dynamicChartData = completedCount > 0
              ? [...userHistory].reverse().slice(-8).map((item, idx) => ({
                  name: item.shortTitle || (item.title.length > 14 ? item.title.slice(0, 12) + '…' : item.title),
                  fullName: item.title,
                  score: Number(item.score) || 0,
                  target: 80,
                  date: item.date,
                  type: item.type === 'diagnostic' ? 'FRAC Diagnostic' : 'Manual Quiz'
                }))
              : [
                  { name: 'Target Benchmark', score: 0, target: 80, fullName: 'Take an assessment to record scores' }
                ];

            const clearHistory = () => {
              if (window.confirm("Are you sure you want to reset your local activity history?")) {
                const historyKey = `sankhya_history_${user.email.toLowerCase()}`;
                localStorage.removeItem(historyKey);
                setUserHistory([]);
              }
            };

            return (
              <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
                {/* Header with Title and Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#ea8b21] uppercase tracking-wider">
                        Capacity Building Record
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Live Tracking Active
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                      Officer Activity & Progress Dashboard
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real-time assessment history, competency scores, and gap resolution logs for <strong className="text-slate-800">{user.name}</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                      onClick={() => startDiagnostic(selectedField)}
                      className="px-4 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ea8b21]/20 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <Compass className="w-3.5 h-3.5" /> Take Skill Diagnostic
                    </button>
                    <button
                      onClick={() => {
                        setSelectedManual('manual_cpi_rural');
                        setActiveTab('upload_quiz');
                      }}
                      className="px-4 py-2.5 bg-white hover:bg-[#faf5ec] border border-[#ebdcc8] text-slate-800 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#ea8b21]" /> Take Manual Quiz
                    </button>
                  </div>
                </div>

                {/* 4 Executive KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Average Score */}
                  <div className="bg-white border border-[#ebdcc8] rounded-2xl p-5 shadow-2xs space-y-1 hover:border-[#ea8b21] transition-all">
                    <span className="text-xs font-bold text-slate-500">Average Competency Score</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">{avgScore}%</span>
                      {completedCount > 1 && (
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${growthDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          <TrendingUp className="w-3.5 h-3.5" />
                          {growthDelta >= 0 ? `+${growthDelta}%` : `${growthDelta}%`}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {avgScore >= 80 ? '✓ Exceeds MoSPI Benchmark (80%)' : 'MoSPI Target Level: 80% (FRAC L3)'}
                    </p>
                  </div>

                  {/* Card 2: Total Sessions */}
                  <div className="bg-white border border-[#ebdcc8] rounded-2xl p-5 shadow-2xs space-y-1 hover:border-[#ea8b21] transition-all">
                    <span className="text-xs font-bold text-slate-500">Assessments Completed</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#ea8b21]">{completedCount}</span>
                      <span className="text-xs font-bold text-slate-500">sessions recorded</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {userHistory.filter(h => h.type === 'diagnostic').length} Diagnostics • {userHistory.filter(h => h.type === 'quiz').length} Quizzes
                    </p>
                  </div>

                  {/* Card 3: Proficiency Rate */}
                  <div className="bg-white border border-[#ebdcc8] rounded-2xl p-5 shadow-2xs space-y-1 hover:border-[#ea8b21] transition-all">
                    <span className="text-xs font-bold text-slate-500">Karmayogi Proficiency Rate</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-700">{passPercentage}%</span>
                      <span className="text-xs font-bold text-slate-500">benchmark met</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {passedCount} of {completedCount} tests scored ≥ 75%
                    </p>
                  </div>

                  {/* Card 4: Assigned Working Domain */}
                  <div className="bg-white border border-[#ebdcc8] rounded-2xl p-5 shadow-2xs space-y-1 hover:border-[#ea8b21] transition-all">
                    <span className="text-xs font-bold text-slate-500">Current Cadre Domain</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900 truncate">
                        {activeFieldDetails.designation.split('-')[0].trim()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{activeFieldDetails.division}</p>
                  </div>
                </div>

                {/* Dynamic Competency Growth Chart */}
                <div className="bg-white border border-[#ebdcc8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ebdcc8]/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ea8b21]" />
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                          Competency Growth Trajectory (Actual Attempts)
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Chronological score evolution updated automatically upon completing any diagnostic or quiz
                      </p>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                      avgScore >= 80 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : (growthDelta > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200')
                    }`}>
                      {avgScore >= 80 ? '✨ Cadre Benchmark Achieved' : (growthDelta > 0 ? `📈 Positive Trajectory (+${growthDelta}%)` : '🎯 Baseline Learning Stage')}
                    </span>
                  </div>

                  {completedCount === 0 ? (
                    <div className="p-10 text-center space-y-3 bg-[#faf5ec]/50 rounded-2xl border border-dashed border-[#ebdcc8]">
                      <BarChart3 className="w-10 h-10 text-[#ea8b21] mx-auto opacity-70" />
                      <h4 className="font-extrabold text-sm text-slate-900">No Assessment Records Yet</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Complete your first 10-Question Skill Diagnostic or AI Document Quiz to start tracking your growth trajectory!
                      </p>
                    </div>
                  ) : (
                    <div className="h-72 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }} 
                            interval={0}
                            dy={8}
                          />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                                    <p className="font-bold text-amber-400">{data.fullName}</p>
                                    <div className="flex items-center justify-between gap-4 text-[11px]">
                                      <span className="text-slate-300">Category:</span>
                                      <span className="font-semibold text-slate-200">{data.type}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-[11px]">
                                      <span className="text-slate-300">Your Score:</span>
                                      <span className="font-extrabold text-[#ea8b21]">{data.score}%</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-[11px]">
                                      <span className="text-slate-400">Target Benchmark:</span>
                                      <span className="font-bold text-blue-300">{data.target}%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                                      Recorded: {data.date}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                          <Bar 
                            dataKey="score" 
                            name="Your Score achieved (%)" 
                            fill="#ea8b21" 
                            radius={[6, 6, 0, 0]} 
                          />
                          <Bar 
                            dataKey="target" 
                            name="MoSPI Cadre Target (80%)" 
                            fill="#cbd5e1" 
                            radius={[6, 6, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Detailed Activity History Feed */}
                <div className="bg-white border border-[#ebdcc8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc8]/80">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                        Official Assessment History & Audit Log
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        All completed diagnostic sessions and manual assessments saved to your officer profile
                      </p>
                    </div>
                    {completedCount > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Clear history"
                      >
                        Reset History
                      </button>
                    )}
                  </div>

                  {completedCount === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-6">
                      No activity logged yet. Your completed tests will appear here chronologically.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {userHistory.map((item, idx) => (
                        <div key={item.id || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf5ec]/40 transition-all rounded-xl px-2">
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              item.type === 'diagnostic' ? 'bg-[#ea8b21]/15 text-[#ea8b21]' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {item.type === 'diagnostic' ? <Compass className="w-4.5 h-4.5" /> : <FileText className="w-4.5 h-4.5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{item.title}</h4>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  item.type === 'diagnostic' ? 'bg-[#ea8b21]/15 text-[#ea8b21]' : 'bg-blue-50 text-blue-700'
                                }`}>
                                  {item.type === 'diagnostic' ? 'Diagnostic' : 'Manual Quiz'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                {item.field} • <span className="text-slate-400">{item.date}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <span className="text-[11px] font-bold text-slate-600">{item.status}</span>
                            <span className={`px-3 py-1 font-black text-xs rounded-xl font-mono border ${
                              item.score >= 75
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : (item.score >= 50 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200')
                            }`}>
                              {item.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })()}

          </main>

        {/* Clean Minimal Footer */}
        <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-400 mt-auto">
          Ministry of Statistics and Programme Implementation • Smart India Hackathon 2026 • SIH26101
        </footer>

      </div>

      {/* =====================================================================
          FIELD SELECTOR MODAL (Popup ONLY on first login, or clicked manually)
          ===================================================================== */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Officer Field Setup</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">Select Your Statistical Working Field</h3>
                <p className="text-xs text-slate-500">
                  Choose your working domain so we can calibrate your diagnostic tests and iGOT training modules.
                </p>
              </div>
              {user.hasCompletedOnboarding && (
                <button
                  onClick={() => setShowFieldModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* 3 Statistical Fields */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {STATISTICAL_FIELDS.map(f => {
                const isSelected = selectedField === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedField(f.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2.5 ${
                      isSelected
                        ? 'border-[#ea8b21] bg-[#ea8b21]/10 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {f.badge}
                          </span>
                          <span className="text-xs font-bold text-indigo-600">{f.division}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900">{f.title}</h4>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#ea8b21] bg-[#ea8b21] text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{f.summary}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Core Competencies: {f.competencies.join(' • ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">You can change this anytime from the Home page.</span>
              <button
                onClick={() => confirmFieldSelection(selectedField)}
                className="px-6 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ea8b21]/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                Confirm & Continue to Portal <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Official YouTube Video Training Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-[#ebdcc8] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc8]/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30 uppercase tracking-wider">
                    Official Video Training
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {activeVideoModal.provider || "Karmayogi Bharat & MoSPI"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {activeVideoModal.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-2 hover:bg-[#faf5ec] rounded-xl text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real Working YouTube Embed */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-200 relative">
              <iframe
                key={`${activeVideoModal.youtubeId}-${videoTimestamp}`}
                className="w-full h-full rounded-2xl"
                src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.youtubeId || "2e4QcK9ap2s"}?autoplay=1&start=${videoTimestamp}&rel=0&modestbranding=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>

            {/* Interactive Timestamp Jumper */}
            {activeVideoModal.timestamps && activeVideoModal.timestamps.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Click to Seek Video to Key Sections:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeVideoModal.timestamps.map((ts, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setVideoTimestamp(ts.seconds || 0);
                        setActiveVideoModal(prev => ({ ...prev, currentChapter: idx }));
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                        videoTimestamp === (ts.seconds || 0)
                          ? 'bg-[#ea8b21]/15 border-[#ea8b21] text-slate-900 font-bold shadow-2xs'
                          : 'bg-[#faf5ec]/60 border-[#ebdcc8] text-slate-700 hover:bg-[#faf5ec]'
                      }`}
                    >
                      <span className="font-bold truncate mr-2">{ts.label}</span>
                      <Play className={`w-3.5 h-3.5 shrink-0 ${
                        videoTimestamp === (ts.seconds || 0) ? 'text-[#ea8b21]' : 'text-slate-400'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Links & Close */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#ebdcc8]/80">
              <div className="flex items-center gap-4">
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideoModal.youtubeId || "2e4QcK9ap2s"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#ea8b21] hover:underline flex items-center gap-1.5 font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Watch on YouTube</span>
                </a>
                <a
                  href="https://igotkarmayogi.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-600 hover:underline flex items-center gap-1.5 font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>iGOT Karmayogi Portal</span>
                </a>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-6 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/20 cursor-pointer self-end sm:self-auto"
              >
                Close Video
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
