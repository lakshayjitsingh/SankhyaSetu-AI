import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Upload, CheckCircle2, AlertTriangle, ArrowRight, Play, 
  ShieldCheck, ShieldAlert, Clock, BookOpen, LogOut, Sparkles, User, 
  ArrowLeft, Check, ChevronRight, X, ExternalLink, Settings, Key,
  Home, BarChart3, FileText, Award, TrendingUp, RefreshCw, Layers, CheckCircle,
  Menu, Eye, EyeOff, Users, Shield, Building2, Info
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import SupervisorDashboard from './components/SupervisorDashboard';
import MainBossDashboard from './components/MainBossDashboard';

const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? "http://127.0.0.1:8000/api"
    : (typeof window !== 'undefined' && window.location.hostname.endsWith('onrender.com') ? "/api" : "https://sankhyasetu-ai.onrender.com/api")
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
  const [currentPortal, setCurrentPortal] = useState(() => {
    try {
      const saved = localStorage.getItem('sankhya_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.portal === 'boss' || u.portal === 'supervisor') return u.portal;
      }
    } catch (e) {}
    return 'officer';
  });
  const [googleClientId] = useState("422382282637-ibgjnag16ogstaj2vevddvpcnipj4q9r.apps.googleusercontent.com");

  // Inactivity Security Timer: 2 minutes total (120s), warning at 90s (30s countdown)
  const INACTIVITY_LIMIT_MS = 120 * 1000;
  const WARNING_TRIGGER_MS = 90 * 1000;

  const [inactivityNotice, setInactivityNotice] = useState('');
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // Authenticated User State with Tab-Close / Reopen Expiry Check
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sankhya_user');
    const lastActive = localStorage.getItem('sankhya_last_activity');
    if (saved && lastActive) {
      const elapsed = Date.now() - parseInt(lastActive, 10);
      if (elapsed > 120 * 1000) {
        localStorage.removeItem('sankhya_user');
        localStorage.removeItem('sankhya_last_activity');
        return null;
      }
    }
    return saved ? JSON.parse(saved) : null;
  });

  const lastActiveRef = useRef(Date.now());

  // Listen to user activity & run cross-tab session expiration timer
  useEffect(() => {
    if (!user) {
      setShowInactivityWarning(false);
      return;
    }

    const nowInit = Date.now();
    lastActiveRef.current = nowInit;
    localStorage.setItem('sankhya_last_activity', nowInit.toString());

    let lastWrite = nowInit;
    const handleActivity = () => {
      const now = Date.now();
      lastActiveRef.current = now;
      if (now - lastWrite > 2000) {
        lastWrite = now;
        localStorage.setItem('sankhya_last_activity', now.toString());
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));

    // Listen for storage updates from other open tabs
    const handleStorage = (e) => {
      if (e.key === 'sankhya_last_activity' && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        lastActiveRef.current = Math.max(lastActiveRef.current, remoteTime);
        setShowInactivityWarning(false);
      } else if (e.key === 'sankhya_user' && !e.newValue) {
        // User logged out or auto-locked in another tab
        setUser(null);
        setShowInactivityWarning(false);
        setInactivityNotice('Session locked or logged out from another browser window for MoSPI data confidentiality.');
      }
    };
    window.addEventListener('storage', handleStorage);

    const interval = setInterval(() => {
      const now = Date.now();
      const storedUser = localStorage.getItem('sankhya_user');
      const storedActivity = localStorage.getItem('sankhya_last_activity');

      // If another tab cleared the session, sync immediately
      if (!storedUser) {
        setUser(null);
        setShowInactivityWarning(false);
        return;
      }

      // Check the latest activity across both THIS tab and OTHER tabs
      const latestActivity = storedActivity 
        ? Math.max(lastActiveRef.current, parseInt(storedActivity, 10)) 
        : lastActiveRef.current;
      lastActiveRef.current = latestActivity;
      const elapsed = now - latestActivity;

      if (elapsed >= INACTIVITY_LIMIT_MS) {
        setShowInactivityWarning(false);
        setUser(null);
        setActiveTab('home');
        setDirectEmail('');
        setDirectPassword('');
        setAuthError('');
        localStorage.removeItem('sankhya_user');
        localStorage.removeItem('sankhya_last_activity');
        setInactivityNotice('Session automatically locked after 2 minutes of inactivity for MoSPI data confidentiality (CERT-In / Collection of Statistics Act 2008).');
        setUploadedFileName('');
        setCustomText('');
        setSelectedManual('manual_cpi_rural');
        setQuizQuestions([]);
        setQuizAnswers({});
        setQuizEvaluation(null);
        setQuizLatency(null);
        setDiagnosticQuestions([]);
        setDiagnosticAnswers({});
        setDiagnosticResult(null);
        setDiagnosticLatency(null);
      } else if (elapsed >= WARNING_TRIGGER_MS) {
        const rem = Math.max(1, Math.ceil((INACTIVITY_LIMIT_MS - elapsed) / 1000));
        setSecondsRemaining(rem);
        setShowInactivityWarning(true);
      } else {
        setShowInactivityWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleActivity));
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [user]);

  const extendSession = () => {
    const now = Date.now();
    lastActiveRef.current = now;
    localStorage.setItem('sankhya_last_activity', now.toString());
    setShowInactivityWarning(false);
    setSecondsRemaining(30);
  };

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
  const [diagnosticLatency, setDiagnosticLatency] = useState(null);
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
  const [quizLatency, setQuizLatency] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Manual Auth Form States (Field Officer - Cadre 1)
  const [isSignUp, setIsSignUp] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Supervisory Cadre Form States (Cadre 2)
  const [isSupervisorSignUp, setIsSupervisorSignUp] = useState(false);
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [supervisorPassword, setSupervisorPassword] = useState('');
  const [supervisorAuthError, setSupervisorAuthError] = useState('');
  const [isSupervisorAuthenticating, setIsSupervisorAuthenticating] = useState(false);
  const [showSupervisorPassword, setShowSupervisorPassword] = useState(false);

  // Directorate General Form States (Cadre 3)
  const [bossEmail, setBossEmail] = useState('');
  const [bossPassword, setBossPassword] = useState('');
  const [bossAuthError, setBossAuthError] = useState('');
  const [isBossAuthenticating, setIsBossAuthenticating] = useState(false);
  const [showBossPassword, setShowBossPassword] = useState(false);

  // Change Password Modal States (for direct manual accounts)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');
  const [isSubmittingChangePass, setIsSubmittingChangePass] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Forgot Password Modal States (Option B - Smart OTP Account Recovery)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotCadre, setForgotCadre] = useState('officer'); // 'officer' | 'supervisor' | 'boss'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotStep, setForgotStep] = useState('enter_email'); // 'enter_email' | 'enter_otp' | 'success'
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);

  // Cadre Activation Pending Modal & Live Checker
  const [pendingActivationData, setPendingActivationData] = useState(null);
  const [activationCheckNotice, setActivationCheckNotice] = useState('');
  const [isCheckingActivation, setIsCheckingActivation] = useState(false);

  const handleCheckActivationStatus = async () => {
    if (!pendingActivationData?.email) return;
    setIsCheckingActivation(true);
    setActivationCheckNotice('');
    try {
      const res = await fetch(`${API_BASE}/db/cadre/check-status?email=${encodeURIComponent(pendingActivationData.email)}`);
      const data = await res.json();
      if (res.ok && data.success && data.status === 'active') {
        setActivationCheckNotice('✓ Account approved and activated! Please sign in with your credentials.');
        setTimeout(() => {
          setPendingActivationData(null);
          setActivationCheckNotice('');
        }, 2200);
      } else {
        setActivationCheckNotice('⏳ Still awaiting review. Notifications have been dispatched to your supervisors.');
      }
    } catch (err) {
      console.error("Error checking activation status:", err);
      setActivationCheckNotice('Network error connecting to security server. Please try again.');
    } finally {
      setIsCheckingActivation(false);
    }
  };

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


  // Synchronize officer profile to Neon Cloud PostgreSQL
  const syncOfficerProfileToCloud = async (u) => {
    if (!u?.email) return;
    try {
      const activeF = STATISTICAL_FIELDS.find(f => f.id === u.selectedField) || STATISTICAL_FIELDS[0];
      const res = await fetch(`${API_BASE}/db/sync-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: u.email.toLowerCase(),
          name: u.name || u.email.split('@')[0],
          role_id: activeF?.role_id || u.selectedField || 'field_investigator_nsso',
          role_name: activeF?.designation || 'Field Investigator (NSSO)',
          department: activeF?.title || 'Field Operations Division',
          auth_provider: u.isGoogle ? 'google' : 'manual'
        })
      });

      if (res.status === 404) {
        const data = await res.json().catch(() => ({}));
        if (data.not_found) {
          // Account was deleted from database; clear stale local session immediately
          console.warn("Officer account deleted from cloud database. Clearing local session.");
          localStorage.removeItem('sankhya_user');
          localStorage.removeItem('sankhya_last_activity');
          setUser(null);
        }
      }
    } catch (e) {
      console.warn("Neon cloud user sync offline fallback:", e);
    }
  };

  // Check onboarding on login & sync history with Neon Cloud DB
  useEffect(() => {
    if (user?.email) {
      const historyKey = `sankhya_history_${user.email.toLowerCase()}`;
      const savedHistory = localStorage.getItem(historyKey);
      
      // Step 1: Immediate local render (sub-5ms)
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          // Filter out legacy mock/dummy entries if present in local cache
          const cleanHistory = Array.isArray(parsed)
            ? parsed.filter(item => item && item.id !== 'hist-1' && item.id !== 'hist-2')
            : [];
          setUserHistory(cleanHistory);
          localStorage.setItem(historyKey, JSON.stringify(cleanHistory));
        } catch (e) {
          setUserHistory([]);
        }
      } else {
        // New user starts with clean empty slate (0 attempts)
        setUserHistory([]);
      }

      // Step 2: Background Cloud Fetch from Neon PostgreSQL
      fetch(`${API_BASE}/db/history?email=${encodeURIComponent(user.email.toLowerCase())}`)
        .then(res => res.json())
        .then(data => {
          if (data?.success && Array.isArray(data.history)) {
            const dbFormatted = data.history.map((h, idx) => ({
              id: `db-${h.id}`,
              type: h.role_id ? 'diagnostic' : 'quiz',
              title: h.role_id ? 'Adaptive Cadre Diagnostic' : 'MoSPI Manual Competency Quiz',
              field: 'Field Surveys & Official Statistics (MoSPI OSS)',
              score: Number(h.score_achieved ?? h.score ?? 75),
              status: (Number(h.score_achieved ?? h.score ?? 0) >= 70) ? 'Passed Cadre Benchmark' : 'Gaps Identified',
              date: h.date || 'Recent Attempt',
              improvementDelta: `+${Math.min(25, (idx + 1) * 5)}%`,
              radar_scores: h.radar_scores
            })).reverse();

            setUserHistory(prev => {
              // Combine DB history with local history, avoiding duplicate IDs and dummy items
              const existingIds = new Set(dbFormatted.map(item => item.id));
              const localUnsynced = (prev || []).filter(item => !existingIds.has(item.id) && item.id !== 'hist-1' && item.id !== 'hist-2');
              const merged = [...dbFormatted, ...localUnsynced];
              localStorage.setItem(historyKey, JSON.stringify(merged));
              return merged;
            });
          }
        })
        .catch(err => console.warn("Neon DB history fetch offline fallback:", err));

      // Step 3: Ensure officer profile is stored in Neon Cloud
      syncOfficerProfileToCloud(user);

      // ONLY show the popup if user has NEVER chosen a field yet (first login)
      if (!user.hasCompletedOnboarding) {
        setShowFieldModal(true);
      } else if (user.selectedField) {
        setSelectedField(user.selectedField);
      }
    }
  }, [user?.email]);

  // Record an activity to user's history (saved to LocalStorage + Neon Cloud PostgreSQL)
  const recordActivity = (activity) => {
    if (!user?.email) return;
    const historyKey = `sankhya_history_${user.email.toLowerCase()}`;
    const updated = [activity, ...userHistory];
    setUserHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));

    // Asynchronous background write to Neon Cloud DB
    try {
      const activeF = STATISTICAL_FIELDS.find(f => f.id === selectedField) || STATISTICAL_FIELDS[0];
      const scoresPayload = activity.radar_scores || (diagnosticResult?.competency_scores) || {};
      fetch(`${API_BASE}/db/save-attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email.toLowerCase(),
          role_id: activeF?.role_id || selectedField || 'field_investigator_nsso',
          score_achieved: activity.score || 0,
          passed: (activity.score || 0) >= 70,
          radar_scores: scoresPayload,
          detailed_answers: activity.detailed_results || []
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Neon attempt recorded:", data);
      })
      .catch(err => console.warn("Neon attempt sync offline fallback:", err));
    } catch (e) {
      console.warn("Neon attempt sync deferred:", e);
    }
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
                localStorage.setItem('sankhya_last_activity', Date.now().toString());
                setInactivityNotice('');

                // Sync Google officer credentials flag to Neon Cloud PostgreSQL
                try {
                  fetch(`${API_BASE}/db/sync-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: userEmail,
                      name: userName,
                      auth_provider: 'google',
                      password: 'GOOGLE_OAUTH_VERIFIED'
                    })
                  }).catch(() => {});
                } catch (e) {}
                
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

  // Direct Email / Password Authentication via Neon Cloud PostgreSQL
  const handleDirectAuth = async (e) => {
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

    setIsAuthenticating(true);

    try {
      if (isSignUp) {
        // Direct Neon Cloud Registration
        const derivedName = trimmedEmail.split('@')[0].replace('.', ' ').toUpperCase();
        const activeF = STATISTICAL_FIELDS.find(f => f.id === selectedField) || STATISTICAL_FIELDS[0];

        const response = await fetch(`${API_BASE}/db/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            password: trimmedPass,
            name: derivedName,
            role_id: activeF?.role_id || 'field_investigator_nsso',
            role_name: activeF?.designation || 'Field Investigator (NSSO)',
            department: activeF?.title || 'Field Operations Division'
          })
        });

        const data = await response.json();
        if (data.pending_approval) {
          setPendingActivationData({
            email: trimmedEmail,
            name: derivedName,
            cadreTitle: activeF?.designation || 'Field Investigator (NSSO)',
            department: activeF?.title || 'Field Operations Division',
            roleType: 'officer',
            message: data.message || 'Waiting for your supervisor or higher authorities to activate your email.'
          });
          setAuthError(data.message || 'Waiting for your supervisor or higher authorities to activate your email.');
          setDirectPassword('');
          setIsAuthenticating(false);
          return;
        }

        if (!response.ok || !data.success) {
          setAuthError(data.error || 'Registration failed. Please try again.');
          setIsAuthenticating(false);
          return;
        }

        const officer = data.officer;
        const userData = {
          name: officer?.name || derivedName,
          email: trimmedEmail,
          avatar: '',
          isGoogleVerified: false,
          hasCompletedOnboarding: false, // New user -> show popup once
          selectedField: officer?.role_id || selectedField || 'field_investigator_nsso',
          loginTime: new Date().toLocaleTimeString()
        };
        setUser(userData);
        localStorage.setItem('sankhya_user', JSON.stringify(userData));
        localStorage.setItem('sankhya_last_activity', Date.now().toString());
        setInactivityNotice('');
        setDirectPassword('');
        setDirectEmail('');
        setShowFieldModal(true);
      } else {
        // Direct Neon Cloud Login
        const response = await fetch(`${API_BASE}/db/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            password: trimmedPass
          })
        });

        const data = await response.json();
        if (data.pending_approval) {
          setPendingActivationData({
            email: trimmedEmail,
            name: data.officer?.name || trimmedEmail.split('@')[0],
            cadreTitle: data.officer?.role_name || 'Field Officer',
            department: data.officer?.department || 'Field Operations Division',
            roleType: data.officer?.portal || 'officer',
            message: data.error || 'Waiting for your supervisor or higher authorities to activate your email.'
          });
          setAuthError(data.error || 'Waiting for your supervisor or higher authorities to activate your email.');
          setIsAuthenticating(false);
          return;
        }

        if (!response.ok || !data.success) {
          setAuthError(data.error || 'Invalid credentials. Please check your email and password.');
          setIsAuthenticating(false);
          return;
        }

        const officer = data.officer;

        // Check if this is a Supervisory or Main Boss Account
        if (officer?.role === 'boss' || officer?.portal === 'boss' || trimmedEmail === 'boss@gmail.com') {
          setCurrentPortal('boss');
          const bossData = {
            name: officer?.name || 'Dr. S. K. Mukherjee',
            email: trimmedEmail,
            role: 'boss',
            portal: 'boss',
            badge: 'DDG-HQ-001',
            department: 'MoSPI Central Directorate, New Delhi',
            loginTime: new Date().toLocaleTimeString()
          };
          setUser(bossData);
          localStorage.setItem('sankhya_user', JSON.stringify(bossData));
          localStorage.setItem('sankhya_last_activity', Date.now().toString());
          setInactivityNotice('');
          setDirectPassword('');
          setDirectEmail('');
          setIsAuthenticating(false);
          return;
        }

        if (officer?.role === 'supervisor' || officer?.portal === 'supervisor' || trimmedEmail.startsWith('supervisor')) {
          setCurrentPortal('supervisor');
          const assignedField = officer?.role_id || (trimmedEmail === 'supervisor2@gmail.com' ? 'field_investigator_nsso' : (trimmedEmail === 'supervisor3@gmail.com' ? 'junior_statistical_officer_cso' : 'survey_supervisor_asuse'));
          const supervisorData = {
            name: officer?.name || (trimmedEmail === 'supervisor2@gmail.com' ? 'Sunita Devi' : (trimmedEmail === 'supervisor3@gmail.com' ? 'Anil Mehta' : 'Rajesh Kumar')),
            email: trimmedEmail,
            role: 'supervisor',
            portal: 'supervisor',
            assignedField: assignedField,
            badge: officer?.badge || (trimmedEmail === 'supervisor2@gmail.com' ? 'SSO-VNS-108' : (trimmedEmail === 'supervisor3@gmail.com' ? 'SSO-BLR-114' : 'SSO-DEL-101')),
            department: officer?.department || (trimmedEmail === 'supervisor2@gmail.com' ? 'Varanasi Cantt Unit #08' : (trimmedEmail === 'supervisor3@gmail.com' ? 'Bengaluru South Unit #12' : 'Delhi North Cadre Unit #04')),
            loginTime: new Date().toLocaleTimeString()
          };
          setUser(supervisorData);
          localStorage.setItem('sankhya_user', JSON.stringify(supervisorData));
          localStorage.setItem('sankhya_last_activity', Date.now().toString());
          setInactivityNotice('');
          setDirectPassword('');
          setDirectEmail('');
          setIsAuthenticating(false);
          return;
        }

        const matchedField = STATISTICAL_FIELDS.find(f => f.role_id === officer?.role_id) || STATISTICAL_FIELDS[0];
        const userData = {
          name: officer?.name || trimmedEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          email: trimmedEmail,
          avatar: '',
          isGoogleVerified: officer?.auth_provider === 'google',
          hasCompletedOnboarding: true, // Existing user -> no popup
          selectedField: matchedField?.id || selectedField,
          loginTime: new Date().toLocaleTimeString()
        };
        setUser(userData);
        if (matchedField?.id) {
          setSelectedField(matchedField.id);
        }
        localStorage.setItem('sankhya_user', JSON.stringify(userData));
        localStorage.setItem('sankhya_last_activity', Date.now().toString());
        setInactivityNotice('');
        setDirectPassword('');
        setDirectEmail('');
      }
    } catch (err) {
      console.error("Neon cloud authentication error:", err);
      setAuthError('Connection to authentication server failed. Please verify your connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Dedicated Supervisor Portal Login & Registration (Cadre 2)
  const loginSupervisorWithGoogle = () => {
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleProfile = await res.json();
                const userEmail = googleProfile.email.toLowerCase();
                const userName = googleProfile.name || userEmail.split('@')[0];

                const supervisorData = {
                  name: userName,
                  email: userEmail,
                  role: 'supervisor',
                  portal: 'supervisor',
                  assignedField: 'survey_supervisor_asuse',
                  badge: 'SSO-GOOGLE',
                  department: 'Field Operations Division',
                  loginTime: new Date().toLocaleTimeString()
                };

                setCurrentPortal('supervisor');
                setUser(supervisorData);
                localStorage.setItem('sankhya_user', JSON.stringify(supervisorData));
                localStorage.setItem('sankhya_last_activity', Date.now().toString());
                setInactivityNotice('');
                setSupervisorEmail('');
                setSupervisorPassword('');

                // Sync to Neon PostgreSQL dedicated supervisors table
                try {
                  fetch(`${API_BASE}/db/auth/supervisor/sync-google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail, name: userName })
                  }).catch(() => {});
                } catch (e) {}
              } catch (fetchErr) {
                console.error("Google supervisor error:", fetchErr);
                setSupervisorAuthError("Failed to fetch Google profile. Please try again.");
              }
            } else if (tokenResponse?.error) {
              if (tokenResponse.error === 'popup_closed_by_user' || tokenResponse.error === 'access_denied') return;
              setSupervisorAuthError(`Google Sign-In error: ${tokenResponse.error}`);
            }
          },
          error_callback: (error) => {
            if (error?.type === 'popup_closed' || error?.message?.toLowerCase().includes('cancel')) return;
            if (error?.message) setSupervisorAuthError(error.message);
          }
        });
        client.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        console.error("Supervisor OAuth init error:", err);
        setSupervisorAuthError("Could not launch Google Sign-In.");
      }
    } else {
      setSupervisorAuthError("Google Identity Services loading. Please wait a moment.");
    }
  };

  const handleSupervisorAuth = async (e) => {
    e.preventDefault();
    setSupervisorAuthError('');
    const trimmedEmail = supervisorEmail.trim().toLowerCase();
    const trimmedPass = supervisorPassword.trim();

    if (!trimmedEmail || !trimmedPass) {
      setSupervisorAuthError('Please enter both supervisor email and password.');
      return;
    }

    if (trimmedPass.length < 6) {
      setSupervisorAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsSupervisorAuthenticating(true);
    try {
      if (isSupervisorSignUp) {
        // Register directly into dedicated supervisors table
        const derivedName = trimmedEmail.split('@')[0].replace('.', ' ').toUpperCase();
        const response = await fetch(`${API_BASE}/db/auth/supervisor/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            password: trimmedPass,
            name: derivedName,
            field_id: 'survey_supervisor_asuse',
            department: 'Field Operations Division'
          })
        });

        const data = await response.json();
        if (data.pending_approval) {
          setPendingActivationData({
            email: trimmedEmail,
            name: derivedName,
            cadreTitle: 'Senior Statistical Officer (SSO)',
            department: 'Field Operations Division',
            roleType: 'supervisor',
            message: data.message || 'Waiting for the Directorate General or higher authorities to activate your email.'
          });
          setSupervisorAuthError(data.message || 'Waiting for the Directorate General or higher authorities to activate your email.');
          setSupervisorPassword('');
          setIsSupervisorAuthenticating(false);
          return;
        }

        if (!response.ok || !data.success) {
          setSupervisorAuthError(data.error || 'Supervisor registration failed. Please try again.');
          setIsSupervisorAuthenticating(false);
          return;
        }

        const supervisorData = {
          name: data.officer?.name || derivedName,
          email: trimmedEmail,
          role: 'supervisor',
          portal: 'supervisor',
          assignedField: data.officer?.role_id || 'survey_supervisor_asuse',
          badge: data.officer?.badge || 'SSO-CADRE',
          department: data.officer?.department || 'Field Operations Division',
          loginTime: new Date().toLocaleTimeString()
        };
        setCurrentPortal('supervisor');
        setUser(supervisorData);
        localStorage.setItem('sankhya_user', JSON.stringify(supervisorData));
        localStorage.setItem('sankhya_last_activity', Date.now().toString());
        setInactivityNotice('');
        setSupervisorPassword('');
        setSupervisorEmail('');
        setIsSupervisorAuthenticating(false);
      } else {
        // Direct Login against dedicated supervisors table
        const response = await fetch(`${API_BASE}/db/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password: trimmedPass })
        });

        const data = await response.json();
        if (data.pending_approval) {
          setPendingActivationData({
            email: trimmedEmail,
            name: data.officer?.name || 'Supervisor',
            cadreTitle: data.officer?.role_name || 'Senior Statistical Officer (SSO)',
            department: data.officer?.department || 'Field Operations Division',
            roleType: 'supervisor',
            message: data.error || 'Waiting for the Directorate General or higher authorities to activate your email.'
          });
          setSupervisorAuthError(data.error || 'Waiting for the Directorate General or higher authorities to activate your email.');
          setIsSupervisorAuthenticating(false);
          return;
        }

        if (!response.ok || !data.success) {
          setSupervisorAuthError(data.error || 'Invalid supervisor credentials.');
          setIsSupervisorAuthenticating(false);
          return;
        }

        const officer = data.officer;
        if (officer?.role !== 'supervisor' && officer?.portal !== 'supervisor' && !trimmedEmail.startsWith('supervisor')) {
          setSupervisorAuthError('Account is not authorized for Supervisory Cadre.');
          setIsSupervisorAuthenticating(false);
          return;
        }

        setCurrentPortal('supervisor');
        const assignedField = officer?.role_id || 'survey_supervisor_asuse';
        const supervisorData = {
          name: officer?.name || 'Field Squad Lead',
          email: trimmedEmail,
          role: 'supervisor',
          portal: 'supervisor',
          assignedField: assignedField,
          badge: officer?.badge || 'SSO-DEL-101',
          department: officer?.department || 'Field Operations Division',
          loginTime: new Date().toLocaleTimeString()
        };
        setUser(supervisorData);
        localStorage.setItem('sankhya_user', JSON.stringify(supervisorData));
        localStorage.setItem('sankhya_last_activity', Date.now().toString());
        setInactivityNotice('');
        setSupervisorPassword('');
        setSupervisorEmail('');
        setIsSupervisorAuthenticating(false);
      }
    } catch (err) {
      console.error("Supervisor auth error:", err);
      setSupervisorAuthError('Network error connecting to authentication server.');
      setIsSupervisorAuthenticating(false);
    }
  };

  // Dedicated Boss / Directorate General Login (Cadre 3)
  const handleBossAuth = async (e) => {
    e.preventDefault();
    setBossAuthError('');
    const trimmedEmail = bossEmail.trim().toLowerCase();
    const trimmedPass = bossPassword.trim();

    if (!trimmedEmail || !trimmedPass) {
      setBossAuthError('Please enter both Directorate email and password.');
      return;
    }

    if (trimmedPass.length < 6) {
      setBossAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsBossAuthenticating(true);

    try {
      const response = await fetch(`${API_BASE}/db/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPass })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setBossAuthError(data.error || 'Invalid Directorate credentials.');
        setIsBossAuthenticating(false);
        return;
      }

      const officer = data.officer;
      setCurrentPortal('boss');
      const bossData = {
        name: officer?.name || 'Dr. S. K. Mukherjee',
        email: trimmedEmail,
        role: 'boss',
        portal: 'boss',
        badge: officer?.badge || 'DDG-HQ-001',
        department: officer?.department || 'MoSPI Central Directorate, New Delhi',
        loginTime: new Date().toLocaleTimeString()
      };
      setUser(bossData);
      localStorage.setItem('sankhya_user', JSON.stringify(bossData));
      localStorage.setItem('sankhya_last_activity', Date.now().toString());
      setInactivityNotice('');
      setBossPassword('');
      setBossEmail('');
      setIsBossAuthenticating(false);
    } catch (err) {
      console.error("Boss auth error:", err);
      setBossAuthError('Network error connecting to authentication server.');
      setIsBossAuthenticating(false);
    }
  };

  // Change Password for Direct Email / Password Accounts
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePassError('');
    setChangePassSuccess('');

    const trimmedCurrent = currentPassInput.trim();
    const trimmedNew = newPassInput.trim();
    const trimmedConfirm = confirmPassInput.trim();

    if (!trimmedCurrent) {
      setChangePassError('Please enter your current password.');
      return;
    }

    if (!trimmedNew || trimmedNew.length < 6) {
      setChangePassError('New password must be at least 6 characters.');
      return;
    }

    if (trimmedNew === trimmedCurrent) {
      setChangePassError('New password must be different from current password.');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setChangePassError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmittingChangePass(true);

    try {
      const res = await fetch(`${API_BASE}/db/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email.toLowerCase(),
          current_password: trimmedCurrent,
          new_password: trimmedNew
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setChangePassError(data.error || 'Failed to update password.');
        setIsSubmittingChangePass(false);
        return;
      }

      setChangePassSuccess(data.message || 'Password successfully updated! You can now use your new password.');
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
    } catch (err) {
      console.error("Change password error:", err);
      setChangePassError('Connection to authentication server failed. Please try again.');
    } finally {
      setIsSubmittingChangePass(false);
    }
  };

  // Handler 1: Send OTP for Forgot Password (Option B)
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    const trimmed = forgotEmail.trim().toLowerCase();
    if (!trimmed) {
      setForgotError(
        forgotCadre === 'supervisor'
          ? 'Please enter your registered MoSPI supervisor email.'
          : (forgotCadre === 'boss'
              ? 'Please enter your registered Directorate General email.'
              : 'Please enter your registered MoSPI officer email.')
      );
      return;
    }

    // Client-side instant check for Google OAuth accounts
    try {
      const stored = localStorage.getItem('sankhya_registered_accounts');
      if (stored) {
        const reg = JSON.parse(stored);
        if (reg[trimmed] === 'GOOGLE_OAUTH_VERIFIED') {
          setForgotError("This account is authenticated via Google Sign-In. Password reset is not applicable. Please click 'Sign in with Google' on the login screen.");
          return;
        }
      }
    } catch (e) {}

    setIsSendingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/db/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, cadre: forgotCadre })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setForgotError(data.error || 'Failed to dispatch OTP. Please check your email address.');
        return;
      }

      setDispatchedOtp(data.demo_otp || '');
      setForgotStep('enter_otp');
      setForgotSuccess(`6-digit verification code generated for ${trimmed}. (Valid for 10 minutes)`);
    } catch (err) {
      console.error("Forgot password OTP dispatch error:", err);
      setForgotError('Network error connecting to security server. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handler 2: Verify OTP & Reset Password in Neon PostgreSQL
  const handleVerifyForgotReset = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const trimmedEmail = forgotEmail.trim().toLowerCase();
    const trimmedOtp = forgotOtp.trim();
    const trimmedNew = forgotNewPass.trim();
    const trimmedConfirm = forgotConfirmPass.trim();

    if (!trimmedOtp || trimmedOtp.length < 6) {
      setForgotError('Please enter the complete 6-digit verification code.');
      return;
    }
    if (!trimmedNew || trimmedNew.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      setForgotError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsResettingPass(true);
    try {
      const res = await fetch(`${API_BASE}/db/auth/forgot-password/verify-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          otp: trimmedOtp,
          new_password: trimmedNew,
          cadre: forgotCadre
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setForgotError(data.error || 'Password reset failed. Please check the OTP.');
        return;
      }

      setForgotStep('success');
      setForgotSuccess(data.message || 'Password successfully updated in MoSPI Secure Cloud Database!');
    } catch (err) {
      console.error("Forgot password verify reset error:", err);
      setForgotError('Network error connecting to security server. Please try again.');
    } finally {
      setIsResettingPass(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotStep('enter_email');
    setForgotEmail('');
    setForgotOtp('');
    setForgotNewPass('');
    setForgotConfirmPass('');
    setForgotError('');
    setForgotSuccess('');
    setDispatchedOtp('');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPortal('officer');
    setActiveTab('home');
    setDirectEmail('');
    setDirectPassword('');
    setAuthError('');
    setSupervisorEmail('');
    setSupervisorPassword('');
    setSupervisorAuthError('');
    setBossEmail('');
    setBossPassword('');
    setBossAuthError('');
    setShowInactivityWarning(false);
    localStorage.removeItem('sankhya_user');
    localStorage.removeItem('sankhya_last_activity');
    setUploadedFileName('');
    setCustomText('');
    setSelectedManual('manual_cpi_rural');
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizEvaluation(null);
    setQuizLatency(null);
    setDiagnosticQuestions([]);
    setDiagnosticAnswers({});
    setDiagnosticResult(null);
    setDiagnosticLatency(null);
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
  const startDiagnostic = (fieldId, forceFresh = false) => {
    const roleToUse = fieldId || selectedField;
    setSelectedField(roleToUse);
    setDiagnosticResult(null);
    setDiagnosticAnswers({});
    setIsGeneratingDiagnostic(true);
    setActiveTab('diagnostic');
    const freshQuery = forceFresh ? `?fresh=true&t=${Date.now()}` : `?t=${Date.now()}`;
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    fetch(`${API_BASE}/roles/${roleToUse}/diagnostic${freshQuery}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setDiagnosticQuestions(data.questions || []);
        setDiagnosticSessionId(data.session_id || '');
        setDiagnosticLatency(((Date.now() - startTime) / 1000).toFixed(2));
        setIsGeneratingDiagnostic(false);
      })
      .catch(err => {
        console.error("Diagnostic fetch error:", err);
        setIsGeneratingDiagnostic(false);
      })
      .finally(() => clearTimeout(timeoutId));
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
          radar_scores: data.competency_scores || [],
          detailed_results: data.gaps_identified || [],
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
  const handleGenerateQuiz = (forceFresh = true) => {
    setIsGenerating(true);
    setQuizEvaluation(null);
    setQuizAnswers({});
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    const isForceFresh = typeof forceFresh === 'boolean' ? forceFresh : true;

    try {
      fetch(`${API_BASE}/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          manual_id: selectedManual,
          custom_text: typeof customText === 'string' ? customText : '',
          uploaded_filename: uploadedFileName || '',
          difficulty: difficulty,
          count: quizCount,
          force_fresh: isForceFresh,
          t: Date.now()
        })
      })
        .then(res => res.json())
        .then(data => {
          setQuizQuestions(data.questions || []);
          setQuizSessionId(data.session_id || '');
          setQuizLatency(((Date.now() - startTime) / 1000).toFixed(2));
          setIsGenerating(false);
        })
        .catch(err => {
          console.error("Quiz generation error:", err);
          setIsGenerating(false);
        })
        .finally(() => clearTimeout(timeoutId));
    } catch (err) {
      console.error("Synchronous error during quiz generate:", err);
      clearTimeout(timeoutId);
      setIsGenerating(false);
    }
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
    if (isSubmittingQuiz || quizEvaluation) return;
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
          radar_scores: {},
          detailed_results: data.evaluations || [],
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
  // 0. SUPERVISORY COMMAND HUBS (TIER 1 & TIER 2 DASHBOARDS)
  // =========================================================================
  if (currentPortal === 'supervisor') {
    return (
      <SupervisorDashboard 
        onLogout={handleLogout}
        initialFieldId={user?.assignedField || 'survey_supervisor_asuse'}
        activeSupervisor={user}
      />
    );
  }

  if (currentPortal === 'boss') {
    return (
      <MainBossDashboard 
        onLogout={handleLogout}
        activeBoss={user}
      />
    );
  }

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
                  {/* Karmayogi Bharat Lotus Petals & Chakra Motif */}
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
                <p className="text-[11px] text-slate-900 font-semibold">Official Statistical Capacity Building Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 bg-white text-slate-900 border border-[#ebdcc8] rounded-full shadow-2xs">
                SIH Problem #SIH26101
              </span>
            </div>
          </div>
        </header>

        {/* Unified Multi-Cadre Gateway (CUIMS-Inspired 3-Card Architecture) */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
          
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30 rounded-full">
              Unified Multi-Cadre Gateway
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Official MoSPI Statistical & Directorate Gateway
            </h1>
          </div>

          {inactivityNotice && (
            <div className="max-w-2xl mx-auto mb-6 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left">
                <span className="font-bold text-amber-800 block">Security Auto-Lock Triggered</span>
                <p className="text-[11px] text-amber-700 leading-relaxed">{inactivityNotice}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* ========================================================================= */}
            {/* CARD 1 (LEFT): FIELD OFFICER PORTAL */}
            {/* ========================================================================= */}
            <div className="bg-white border border-[#ebdcc8] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#ea8b21]/5 flex flex-col justify-between space-y-5 animate-in fade-in duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#ea8b21]/10 border border-[#ea8b21]/30 flex items-center justify-center text-[#ea8b21] shadow-2xs">
                    <User className="w-6 h-6" />
                  </div>
                </div>

                <div className="min-h-[2rem] flex items-center">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Field Officer Login
                  </h2>
                </div>

                {authError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-medium">{authError}</span>
                  </div>
                )}

                <form onSubmit={handleDirectAuth} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-900 block mb-1">Officer Email</label>
                    <input
                      type="email"
                      required
                      placeholder="officer@mospi.gov.in"
                      value={directEmail}
                      onChange={(e) => {
                        setDirectEmail(e.target.value);
                        if (authError) setAuthError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-500 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-900 block">
                        {isSignUp ? "Password (min. 6 chars)" : "Password"}
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setForgotCadre('officer');
                            setForgotEmail(directEmail);
                            setForgotStep('enter_email');
                            setForgotError('');
                            setForgotSuccess('');
                            setShowForgotPasswordModal(true);
                          }}
                          className="text-[10px] font-bold text-[#ea8b21] hover:text-[#d97d16] hover:underline cursor-pointer"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={directPassword}
                        onChange={(e) => {
                          setDirectPassword(e.target.value);
                          if (authError) setAuthError('');
                        }}
                        className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-500 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className={`w-full py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#ea8b21]/25 hover:shadow-md cursor-pointer flex items-center justify-center gap-2 ${isAuthenticating ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isAuthenticating && (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isAuthenticating 
                      ? (isSignUp ? "Creating..." : "Signing In...")
                      : (isSignUp ? "Create Account & Continue" : "Sign In to Officer Portal")
                    }
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-2 flex items-center justify-center">
                  <div className="w-full border-t border-[#ebdcc8]"></div>
                  <span className="absolute bg-white px-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    or
                  </span>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="w-full py-2 px-3 bg-white hover:bg-[#faf5ec] text-slate-900 border border-[#ebdcc8] hover:border-[#ea8b21]/60 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <div className="text-center text-[11px] text-slate-900 font-medium pt-0.5">
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

              <div className="pt-3 border-t border-[#ebdcc8]/70 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>MoSPI Cloud DB Connected</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CARD 2 (CENTER): SUPERVISORY CONSOLE */}
            {/* ========================================================================= */}
            <div className="bg-white border border-[#ebdcc8] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#ea8b21]/5 flex flex-col justify-between space-y-5 animate-in fade-in duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#ea8b21]/10 border border-[#ea8b21]/30 flex items-center justify-center text-[#ea8b21] shadow-2xs">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="min-h-[2rem] flex items-center">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Supervisory Console
                  </h2>
                </div>

                {supervisorAuthError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-medium">{supervisorAuthError}</span>
                  </div>
                )}

                <form onSubmit={handleSupervisorAuth} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-900 block mb-1">Supervisor Email</label>
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      placeholder="supervisor@mospi.gov.in"
                      value={supervisorEmail}
                      onChange={(e) => {
                        setSupervisorEmail(e.target.value);
                        if (supervisorAuthError) setSupervisorAuthError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-500 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-900 block">
                        {isSupervisorSignUp ? "Password (min. 6 chars)" : "Password"}
                      </label>
                      {!isSupervisorSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setForgotCadre('supervisor');
                            setForgotEmail(supervisorEmail || 'supervisor1@gmail.com');
                            setForgotStep('enter_email');
                            setForgotError('');
                            setForgotSuccess('');
                            setShowForgotPasswordModal(true);
                          }}
                          className="text-[10px] font-bold text-[#ea8b21] hover:text-[#d97d16] hover:underline cursor-pointer"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showSupervisorPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={supervisorPassword}
                        onChange={(e) => {
                          setSupervisorPassword(e.target.value);
                          if (supervisorAuthError) setSupervisorAuthError('');
                        }}
                        className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-500 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSupervisorPassword(!showSupervisorPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        {showSupervisorPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSupervisorAuthenticating}
                    className={`w-full py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#ea8b21]/25 hover:shadow-md cursor-pointer flex items-center justify-center gap-2 ${isSupervisorAuthenticating ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isSupervisorAuthenticating && (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isSupervisorAuthenticating 
                      ? (isSupervisorSignUp ? "Creating..." : "Verifying Cadre...")
                      : (isSupervisorSignUp ? "Create Account & Continue" : "Sign In to Supervisory Console")
                    }
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-2 flex items-center justify-center">
                  <div className="w-full border-t border-[#ebdcc8]"></div>
                  <span className="absolute bg-white px-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    or
                  </span>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={loginSupervisorWithGoogle}
                  className="w-full py-2 px-3 bg-white hover:bg-[#faf5ec] text-slate-900 border border-[#ebdcc8] hover:border-[#ea8b21]/60 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <div className="text-center text-[11px] text-slate-900 font-medium pt-0.5">
                  {isSupervisorSignUp ? (
                    <p>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => { setIsSupervisorSignUp(false); setSupervisorAuthError(''); }}
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
                        onClick={() => { setIsSupervisorSignUp(true); setSupervisorAuthError(''); }}
                        className="text-[#ea8b21] hover:text-[#d97d16] font-bold hover:underline cursor-pointer"
                      >
                        Sign up
                      </button>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#ebdcc8]/70 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <Shield className="w-3 h-3 text-[#ea8b21]" />
                <span>Cadre-Protected Access Control</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CARD 3 (RIGHT): DIRECTORATE GENERAL (DG) */}
            {/* ========================================================================= */}
            <div className="bg-white border border-[#ebdcc8] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#ea8b21]/5 flex flex-col justify-between space-y-5 animate-in fade-in duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#ea8b21]/10 border border-[#ea8b21]/30 flex items-center justify-center text-[#ea8b21] shadow-2xs">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                <div className="min-h-[2rem] flex items-center">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Directorate General (DG)
                  </h2>
                </div>

                {bossAuthError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-medium">{bossAuthError}</span>
                  </div>
                )}

                <form onSubmit={handleBossAuth} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-900 block mb-1">Directorate Email</label>
                    <input
                      type="email"
                      required
                      placeholder="directorate@mospi.gov.in"
                      value={bossEmail}
                      onChange={(e) => {
                        setBossEmail(e.target.value);
                        if (bossAuthError) setBossAuthError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-500 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-900 block">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotCadre('boss');
                          setForgotEmail(bossEmail || 'boss@gmail.com');
                          setForgotStep('enter_email');
                          setForgotError('');
                          setForgotSuccess('');
                          setShowForgotPasswordModal(true);
                        }}
                        className="text-[10px] font-bold text-[#ea8b21] hover:text-[#d97d16] hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showBossPassword ? "text" : "password"}
                        required
                        placeholder="••••••"
                        value={bossPassword}
                        onChange={(e) => {
                          setBossPassword(e.target.value);
                          if (bossAuthError) setBossAuthError('');
                        }}
                        className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-500 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBossPassword(!showBossPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        {showBossPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBossAuthenticating}
                    className={`w-full py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#ea8b21]/25 hover:shadow-md cursor-pointer flex items-center justify-center gap-2 ${isBossAuthenticating ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isBossAuthenticating && (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isBossAuthenticating ? "Accessing Directorate HQ..." : "Sign In to Directorate HQ"}
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-[#ebdcc8]/70 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Confidential • Collection of Statistics Act</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-slate-900 font-bold border-t border-[#ebdcc8] bg-white">
          Ministry of Statistics and Programme Implementation • Smart India Hackathon 2026 • SIH26101
        </footer>

        {/* MoSPI Officer Account Recovery (Forgot Password with OTP) Modal */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white border border-[#ebdcc8] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#ebdcc8] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#ea8b21]/10 border border-[#ea8b21]/30 flex items-center justify-center text-[#ea8b21]">
                      <Key className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900">
                      {forgotCadre === 'supervisor'
                        ? "Supervisor Account Recovery"
                        : (forgotCadre === 'boss'
                            ? "Directorate General Account Recovery"
                            : "Field Officer Account Recovery")}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-900 font-medium">
                    {forgotStep === 'enter_email' && "Verify your registered email to receive an OTP."}
                    {forgotStep === 'enter_otp' && "Enter the 6-digit OTP to set a new secure password."}
                    {forgotStep === 'success' && "Your password has been successfully reset."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForgotPasswordModal}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Message */}
              {forgotError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{forgotError}</span>
                </div>
              )}

              {/* STEP 1: Enter Registered Email */}
              {forgotStep === 'enter_email' && (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <div className="p-3.5 bg-[#faf5ec] border border-[#ebdcc8] rounded-2xl text-xs text-slate-900 leading-relaxed">
                    <span className="font-bold block mb-1">
                      {forgotCadre === 'supervisor'
                        ? "MoSPI Supervisory Cadre Verification"
                        : (forgotCadre === 'boss'
                            ? "Directorate General Executive Verification"
                            : "Field Officer Identity Verification")}
                    </span>
                    {forgotCadre === 'supervisor'
                      ? "Enter your registered supervisory email address (e.g. supervisor1@gmail.com). A 6-digit verification code will be dispatched to authenticate your supervisory access."
                      : (forgotCadre === 'boss'
                          ? "Enter your registered Directorate General email address (e.g. boss@gmail.com). A 6-digit verification code will be dispatched to authenticate executive access."
                          : "Enter the email address associated with your Field Officer account. A 6-digit verification code will be generated to authenticate your recovery request."
                        )
                    }
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-900 block mb-1">
                      {forgotCadre === 'supervisor'
                        ? "Registered Supervisor Email"
                        : (forgotCadre === 'boss'
                            ? "Registered Directorate Email"
                            : "Registered Field Officer Email")}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={forgotCadre === 'supervisor' ? "supervisor1@gmail.com" : (forgotCadre === 'boss' ? "boss@gmail.com" : "officer@mospi.gov.in")}
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotError) setForgotError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className={`px-5 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/20 cursor-pointer flex items-center gap-1.5 ${isSendingOtp ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSendingOtp ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Dispatching OTP...</span>
                        </>
                      ) : (
                        <span>Send Verification OTP</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Enter OTP & Set New Password */}
              {forgotStep === 'enter_otp' && (
                <form onSubmit={handleVerifyForgotReset} className="space-y-4">
                  {/* Government Dispatch Simulation Banner */}
                  {dispatchedOtp && (
                    <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Official Dispatch Simulation
                        </span>
                        <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          Valid 10m
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        OTP generated for <strong className="font-bold text-amber-950">{forgotEmail}</strong>:
                      </p>
                      <div className="flex items-center justify-between bg-white border border-amber-200 rounded-xl px-3 py-2">
                        <span className="text-base font-mono font-black text-amber-950 tracking-widest">{dispatchedOtp}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotOtp(dispatchedOtp);
                            if (forgotError) setForgotError('');
                          }}
                          className="text-xs font-bold text-[#ea8b21] hover:text-[#d97d16] hover:underline cursor-pointer"
                        >
                          Autofill OTP Code
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-900 block mb-1">6-Digit Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={forgotOtp}
                      onChange={(e) => {
                        setForgotOtp(e.target.value.trim());
                        if (forgotError) setForgotError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-900 block mb-1">New Password (min. 6 characters)</label>
                    <div className="relative">
                      <input
                        type={showForgotNewPass ? "text" : "password"}
                        required
                        placeholder="Enter new password"
                        value={forgotNewPass}
                        onChange={(e) => {
                          setForgotNewPass(e.target.value);
                          if (forgotError) setForgotError('');
                        }}
                        className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showForgotNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-900 block mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showForgotConfirmPass ? "text" : "password"}
                        required
                        placeholder="Re-enter new password"
                        value={forgotConfirmPass}
                        onChange={(e) => {
                          setForgotConfirmPass(e.target.value);
                          if (forgotError) setForgotError('');
                        }}
                        className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showForgotConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('enter_email');
                        setForgotError('');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                    >
                      ← Change Email
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={closeForgotPasswordModal}
                        className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isResettingPass}
                        className={`px-5 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/20 cursor-pointer flex items-center gap-1.5 ${isResettingPass ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isResettingPass ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Resetting Password...</span>
                          </>
                        ) : (
                          <span>Verify OTP & Update Password</span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* STEP 3: Success Confirmation */}
              {forgotStep === 'success' && (
                <div className="space-y-5 text-center py-2 animate-in fade-in zoom-in-95">
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-black text-slate-900">Password Reset Successfully</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Your password has been securely updated in the MoSPI Secure Cloud Database with salted <span className="font-mono text-slate-800 font-bold">scrypt</span> hashing. You can now sign in using your new credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const emailToKeep = forgotEmail;
                      closeForgotPasswordModal();
                      if (forgotCadre === 'supervisor') {
                        setSupervisorEmail(emailToKeep);
                        setSupervisorPassword('');
                        setIsSupervisorSignUp(false);
                      } else if (forgotCadre === 'boss') {
                        setBossEmail(emailToKeep);
                        setBossPassword('');
                      } else {
                        setDirectEmail(emailToKeep);
                        setDirectPassword('');
                        setIsSignUp(false);
                      }
                    }}
                    className="w-full py-3 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/20 cursor-pointer"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Cadre Activation Pending Modal */}
        {pendingActivationData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white border border-[#ebdcc8] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#ebdcc8] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full inline-block">
                        Awaiting Cadre Activation
                      </span>
                      <h2 className="text-lg font-black text-slate-900">
                        {pendingActivationData.roleType === 'supervisor' 
                          ? "Supervisory Cadre Approval" 
                          : "Field Officer Cadre Approval"}
                      </h2>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPendingActivationData(null);
                    setActivationCheckNotice('');
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Waiting for the supervisor or higher authorities to activate your email</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your registration has been recorded in the central MoSPI database. An official authorization request has been dispatched to all active Supervisors and the Directorate General. You will gain access once your cadre identity is approved.
                </p>
              </div>

              {/* Account Details Box */}
              <div className="bg-[#faf5ec]/60 border border-[#ebdcc8] rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#ebdcc8]/60">
                  <span className="text-slate-600 font-medium">Registered Name:</span>
                  <span className="font-bold text-slate-900">{pendingActivationData.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#ebdcc8]/60">
                  <span className="text-slate-600 font-medium">Official Email:</span>
                  <span className="font-mono font-bold text-[#ea8b21]">{pendingActivationData.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#ebdcc8]/60">
                  <span className="text-slate-600 font-medium">Requested Cadre:</span>
                  <span className="font-bold text-slate-900">{pendingActivationData.cadreTitle}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-medium">Department:</span>
                  <span className="font-bold text-slate-800">{pendingActivationData.department}</span>
                </div>
              </div>

              {/* Live Status Notice */}
              {activationCheckNotice && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                  activationCheckNotice.includes('✓') 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{activationCheckNotice}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingActivationData(null);
                    setActivationCheckNotice('');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Back to Sign In
                </button>
                <button
                  type="button"
                  disabled={isCheckingActivation}
                  onClick={handleCheckActivationStatus}
                  className={`w-full sm:w-auto px-5 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/20 cursor-pointer flex items-center justify-center gap-2 ${isCheckingActivation ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingActivation ? 'animate-spin' : ''}`} />
                  <span>{isCheckingActivation ? "Checking Status..." : "Check Activation Status"}</span>
                </button>
              </div>

            </div>
          </div>
        )}
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
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#ebdcc8]/80 pb-4">
            <div className="flex items-center gap-3 overflow-hidden">
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
                <p className="text-xs text-slate-900 font-semibold truncate">Karmayogi Bharat Ecosystem</p>
              </div>
            </div>

            {/* Dedicated Mobile Drawer Close (X) Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-[#eee3d3] rounded-xl transition-all md:hidden cursor-pointer shrink-0"
              title="Close Menu"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links (Bigger, Comfortable Text & Icons) */}
          <nav className="space-y-2 pt-1">
            
            {/* 1. Home */}
            <button
              onClick={() => { setActiveTab('home'); setMobileSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30 font-extrabold scale-[1.01]'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <Home className={`w-5 h-5 shrink-0 ${activeTab === 'home' ? 'text-white' : 'text-slate-800'}`} />
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
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <Compass className={`w-5 h-5 shrink-0 ${activeTab === 'diagnostic' ? 'text-white' : 'text-slate-800'}`} />
              <span className="tracking-tight">Skill Gap Diagnostic</span>
            </button>

            {/* 3. Upload Manual & Quiz */}
            <button
              onClick={() => { 
                setActiveTab('upload_quiz');
                if (!quizQuestions.length) handleGenerateQuiz(false);
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === 'upload_quiz'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30 font-extrabold scale-[1.01]'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <Upload className={`w-5 h-5 shrink-0 ${activeTab === 'upload_quiz' ? 'text-white' : 'text-slate-800'}`} />
              <span className="tracking-tight">Upload Manual & Quiz</span>
            </button>

            {/* 4. Officer Dashboard */}
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30 font-extrabold scale-[1.01]'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BarChart3 className={`w-5 h-5 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-800'}`} />
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
        <div className="p-3.5 m-2.5 rounded-2xl bg-white/80 border border-[#ebdcc8] shadow-2xs space-y-2.5">
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
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Dedicated "Change Password" Button (Option A: strictly for non-Google users) */}
          {!user?.isGoogleVerified && (
            <button
              onClick={() => {
                setShowChangePasswordModal(true);
                setChangePassError('');
                setChangePassSuccess('');
                setCurrentPassInput('');
                setNewPassInput('');
                setConfirmPassInput('');
              }}
              className="w-full py-2 px-3 bg-[#faf5ec] hover:bg-[#eee3d3] border border-[#ebdcc8] rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Key className="w-3.5 h-3.5 text-[#ea8b21]" />
              <span>Change Password</span>
            </button>
          )}
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
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg md:hidden text-slate-800 cursor-pointer"
              title="Open Menu"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-900 font-bold">
              <span className="font-bold text-slate-900">MoSPI Platform</span>
              <span>/</span>
              <span className="capitalize font-bold text-[#ea8b21]">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Session Security: 2m Auto-Lock
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#ea8b21]/10 text-[#ea8b21] border border-[#ea8b21]/30 rounded-full font-mono shrink-0">
              SIH Problem #SIH26101
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-8">

          {/* ===================================================================
              SECTION 1: HOME - ABOUT SANKHYASETU AI & HOW IT WORKS
              =================================================================== */}
          {activeTab === 'home' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
              
              {/* Refined, Light, Airy Hero Card (Clean Karmayogi Bharat Style) */}
              <div className="bg-white border border-[#ebdcc8] rounded-3xl p-5 sm:p-9 shadow-xs space-y-5 sm:space-y-6 relative overflow-hidden">
                {/* Subtle warm accent ambient highlight */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#ea8b21]/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#ebdcc8]/60">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ea8b21]/10 border border-[#ea8b21]/20 text-[#ea8b21] rounded-full text-xs font-bold self-start">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MoSPI Official Capacity Building • Karmayogi Bharat Ecosystem</span>
                  </div>

                  <button
                    onClick={() => setShowFieldModal(true)}
                    className="w-full sm:w-auto px-3.5 py-2 bg-[#faf5ec] hover:bg-[#eee3d3] text-slate-800 border border-[#ebdcc8] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-[#ea8b21]" />
                    <span>Change Working Field</span>
                  </button>
                </div>

                <div className="space-y-3 max-w-3xl relative z-10">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                    Empowering India's Official Statistical System with AI
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-medium">
                    <strong>SankhyaSetu AI</strong> is an intelligent learning and assessment platform engineered for the <strong>Ministry of Statistics and Programme Implementation (MoSPI)</strong>. Integrated with the <strong>iGOT Karmayogi</strong> framework, it diagnoses domain competency gaps, generates ground-truth validated survey quizzes, and delivers targeted micro-learning for statistical officers across India.
                  </p>
                </div>

                {/* Bottom Cadre & Action Bar */}
                <div className="pt-3 border-t border-[#ebdcc8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Your Working Domain</p>
                      <p className="text-xs sm:text-sm font-black text-slate-900">{activeFieldDetails.title}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/20 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
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
                    <p className="text-xs sm:text-sm text-slate-900 font-medium mt-1">
                      Operationalizing the National Framework for Roles, Activities and Competencies (FRAC) for MoSPI.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Pillar 1 - Clickable */}
                  <div 
                    onClick={() => startDiagnostic(selectedField)}
                    className="bg-white border border-[#ebdcc8] rounded-3xl p-7 shadow-xs flex flex-col justify-between hover:shadow-lg hover:border-[#ea8b21] hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center shadow-xs group-hover:bg-[#ea8b21] group-hover:text-white transition-colors mb-4">
                        <Compass className="w-6 h-6" />
                      </div>
                      <div className="space-y-2 mb-4">
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-[#ea8b21] transition-colors min-h-[44px] flex items-start">
                          Role-Based Competency Diagnosis
                        </h3>
                        <p className="text-xs text-slate-900 font-medium leading-relaxed">
                          Evaluates field investigators, statistical officers, and supervisors through targeted 5-question scenario assessments. Pinpoints gaps in sampling design, CAPI software, and non-response protocols.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-900 border border-[#ebdcc8]">FRAC Level 1-4</span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-900 border border-[#ebdcc8]">Radar Analytics</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-5 border-t border-[#ebdcc8]/60 flex items-center justify-between text-xs font-bold text-[#ea8b21] group-hover:text-[#d97d16]">
                      <span>Open Skill Gap Diagnostic</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>

                  {/* Pillar 2 - Clickable */}
                  <div 
                    onClick={() => {
                      setActiveTab('upload_quiz');
                      if (!quizQuestions.length) handleGenerateQuiz(false);
                    }}
                    className="bg-white border border-[#ebdcc8] rounded-3xl p-7 shadow-xs flex flex-col justify-between hover:shadow-lg hover:border-[#ea8b21] hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center shadow-xs group-hover:bg-[#ea8b21] group-hover:text-white transition-colors mb-4">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="space-y-2 mb-4">
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-[#ea8b21] transition-colors min-h-[44px] flex items-start">
                          Ground-Truth Citations (No Hallucinations)
                        </h3>
                        <p className="text-xs text-slate-900 font-medium leading-relaxed">
                          Every generated question is backed by verbatim ground-truth source citations. Officers see the exact survey manual title, section clause, page number, and quote verifying each answer.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-900 border border-[#ebdcc8]">Page Cited</span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-900 border border-[#ebdcc8]">Verbatim Quotes</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-5 border-t border-[#ebdcc8]/60 flex items-center justify-between text-xs font-bold text-[#ea8b21] group-hover:text-[#d97d16]">
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
                    className="bg-white border border-[#ebdcc8] rounded-3xl p-7 shadow-xs flex flex-col justify-between hover:shadow-lg hover:border-[#ea8b21] hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center shadow-xs group-hover:bg-[#ea8b21] group-hover:text-white transition-colors mb-4">
                        <Play className="w-6 h-6" />
                      </div>
                      <div className="space-y-2 mb-4">
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-[#ea8b21] transition-colors min-h-[44px] flex items-start">
                          iGOT Karmayogi Timestamped Learning
                        </h3>
                        <p className="text-xs text-slate-900 font-medium leading-relaxed">
                          Identified gaps are paired with tailored micro-learning video modules from the iGOT ecosystem that start at the exact minute and second where the concept is taught.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-900 border border-[#ebdcc8]">Timestamp Seeking</span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ec] text-slate-900 border border-[#ebdcc8]">Micro-Modules</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-5 border-t border-[#ebdcc8]/60 flex items-center justify-between text-xs font-bold text-[#ea8b21] group-hover:text-[#d97d16]">
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
                    <p className="text-xs text-slate-900 font-medium">Click any step below to launch that module directly:</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-[#faf5ec] text-slate-900 rounded-full border border-[#ebdcc8] self-start sm:self-auto">
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
                    <p className="text-xs text-slate-900 font-medium leading-relaxed">
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
                    <p className="text-xs text-slate-900 font-medium leading-relaxed">
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
                    <p className="text-xs text-slate-900 font-medium leading-relaxed">
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
                    <p className="text-xs text-slate-900 font-medium leading-relaxed">
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
                <span className="text-xs font-bold text-slate-900">
                  FRAC Competency Framework
                </span>
              </div>

              {isGeneratingDiagnostic && (
                <div className="p-12 text-center bg-white border border-[#ebdcc8] rounded-3xl space-y-4 shadow-sm animate-in fade-in duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center mx-auto shadow-xs">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#ea8b21]" />
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">Gemini AI Generating 10 Dynamic Diagnostic Scenarios...</h3>
                  <p className="text-xs text-slate-900 font-medium max-w-md mx-auto leading-relaxed">
                    Synthesizing 2 real-world Indian field scenarios for each of the 5 official MoSPI competencies for <span className="font-bold text-slate-900">{activeFieldDetails.title}</span>.
                  </p>
                </div>
              )}

              {!diagnosticResult && !isGeneratingDiagnostic && (
                <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
                  <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#ea8b21] uppercase tracking-wider">
                          FRAC Competency Assessment
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" /> 10 Questions • Powered by Gemini Flash
                        </span>
                        {diagnosticLatency && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                            ⚡ Ready in {diagnosticLatency}s
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                        Answer these {diagnosticQuestions.length || 10} questions to diagnose your weaker competencies
                      </h2>
                      <p className="text-xs text-slate-900 font-medium mt-1">
                        Evaluating official MoSPI competencies for {activeFieldDetails.title}. Completely unique AI scenarios generated on every single attempt.
                      </p>
                    </div>

                    <button
                      onClick={() => startDiagnostic(selectedField, true)}
                      disabled={isGeneratingDiagnostic}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#faf5ec] hover:bg-[#ebdcc8]/50 border border-[#ebdcc8] text-xs font-bold text-[#ea8b21] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
                      title="Generate brand new random questions"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDiagnostic ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingDiagnostic ? "Synthesizing New Questions..." : "Regenerate Scenarios"}</span>
                    </button>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {diagnosticQuestions.map((q, idx) => (
                      <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#ea8b21] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {q.question}
                          </h3>
                        </div>

                        <div className="space-y-2 pl-0 sm:pl-9">
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              onClick={() => handleDiagnosticAnswer(q.id, oIdx)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                diagnosticAnswers[q.id] === oIdx
                                  ? 'bg-[#ea8b21]/10 border-[#ea8b21] text-slate-900 font-bold shadow-2xs'
                                  : 'bg-white border-[#ebdcc8] text-slate-900 font-medium hover:bg-[#faf5ec]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={diagnosticAnswers[q.id] === oIdx}
                                onChange={() => handleDiagnosticAnswer(q.id, oIdx)}
                                className="text-[#ea8b21] focus:ring-[#ea8b21]"
                              />
                              <span className="flex-1">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-900">
                      {Object.keys(diagnosticAnswers).length} of {diagnosticQuestions.length} answered
                    </span>
                    <button
                      onClick={submitDiagnostic}
                      disabled={loadingDiagnostic || Object.keys(diagnosticAnswers).length < diagnosticQuestions.length}
                      className="w-full sm:w-auto px-6 py-3 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loadingDiagnostic ? "Calculating Gaps..." : "Submit & View My Gaps"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {diagnosticResult && !isGeneratingDiagnostic && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-[#ea8b21] uppercase tracking-wider">
                          Evaluation Results
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">
                          Identified Competency Gaps
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
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
                      <div className="lg:col-span-7 bg-[#fcfaf6] border border-[#ebdcc8] rounded-3xl p-4 sm:p-7 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc8]/80">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ea8b21]" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                FRAC Competency Radar Map
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-900 font-medium">
                              Visual gap analysis against official MoSPI benchmark standards
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-3 py-1 bg-white border border-[#ebdcc8] rounded-full text-slate-900 shadow-2xs">
                            Cadre Benchmark: Level 3
                          </span>
                        </div>

                        {/* Radar Chart SVG with outerRadius 42% on mobile to guarantee zero clipping */}
                        <div className="h-80 sm:h-96 w-full flex items-center justify-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart 
                              data={diagnosticResult.competency_scores.map(c => ({
                                ...c,
                                chart_score: Math.max(4, c.score) // Minimum 4% floor for crisp geometric visibility
                              }))}
                              cx="50%" 
                              cy="50%" 
                              outerRadius="42%"
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
                            <span className="font-bold text-slate-900">Your Competency Score</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-md bg-blue-50 border-2 border-dashed border-blue-500" />
                            <span className="font-bold text-slate-900">MoSPI Benchmark Target</span>
                          </div>
                        </div>
                      </div>

                      {/* Scorecard Column with Dual-Track Target Needles */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center justify-between pb-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Competency Scorecard
                          </h4>
                          <span className="text-[11px] font-bold text-slate-900">
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
                                    <span className="text-slate-900 font-medium">
                                      Target: <span className="font-bold text-blue-600">{comp.required_level}%</span>
                                    </span>
                                    <span className="text-slate-400 font-bold">•</span>
                                    <span className="text-slate-900 font-medium">
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
                                <div className="flex items-center justify-between text-[9px] font-bold text-slate-900 px-0.5">
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
                              <p className="text-xs text-slate-900 font-medium leading-relaxed line-clamp-2">{c.summary}</p>
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
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-bold cursor-pointer shadow-2xs"
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
                <span className="text-xs font-bold text-slate-900">
                  RAG Document Verification
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-sm space-y-6">
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
                  <p className="text-xs text-slate-900 font-medium mt-1">
                    The AI reads the guidelines and generates dynamic scenario-based test questions with page-by-page source citations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-900">Select Official MoSPI Manual:</label>
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
                    <label className="text-xs font-bold text-slate-900">Question Style (Bloom's Taxonomy):</label>
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
                    <label className="text-xs font-bold text-slate-900">Assessment Length (Question Count):</label>
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
                      <p className="text-xs font-bold text-slate-900">
                        Extracting Full Text from {uploadedFileName}...
                      </p>
                      <p className="text-[11px] text-slate-900 font-medium">
                        Using high-speed PyMuPDF PDF parser
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#ea8b21] mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-900">
                        {uploadedFileName ? `Re-upload or replace: ${uploadedFileName}` : "Click or Drag & Drop to Upload Custom Manual (PDF or TXT)"}
                      </p>
                      <p className="text-[11px] text-slate-900 font-medium mt-1">
                        Supports official PDF manuals, circulars, survey instruction booklets, and training notes
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleGenerateQuiz(true)}
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
                {quizLatency && (
                  <div className="text-center pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      ⚡ Synthesized in {quizLatency}s • Ground-Truth Verified
                    </span>
                  </div>
                )}
              </div>

              {quizQuestions.length === 0 && !isGenerating && (
                <div className="p-8 text-center bg-white border border-[#ebdcc8] rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] border border-[#ebdcc8] text-[#ea8b21] flex items-center justify-center mx-auto shadow-2xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">Ready to Generate Assessment</h3>
                  <p className="text-xs text-slate-900 font-medium max-w-md mx-auto leading-relaxed">
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
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <button
                        onClick={() => handleGenerateQuiz(true)}
                        disabled={isGenerating}
                        className="px-3 py-1.5 rounded-xl bg-[#faf5ec] hover:bg-[#ebdcc8]/50 border border-[#ebdcc8] text-xs font-bold text-[#ea8b21] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
                        title="Synthesize brand new questions"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>{isGenerating ? "Synthesizing..." : "Regenerate Questions"}</span>
                      </button>
                      <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Powered by Google Gemini Flash (Live LLM)
                      </span>
                    </div>
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
                            <p className="text-xs text-slate-900 font-medium mt-1">
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
                          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-xs font-bold cursor-pointer transition-all self-start sm:self-auto shadow-2xs shrink-0"
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
                          <span className="text-[11px] text-slate-900 font-bold">{q.source_manual}</span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {q.question}
                        </h4>

                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isEvaluated = !!quizEvaluation;
                            const resList = quizEvaluation?.results || quizEvaluation?.detailed_results || [];
                            const res = isEvaluated ? resList.find(r => r.id === q.id || r.question_id === q.id) : null;
                            const correctIdx = res ? (typeof res.correct_choice !== 'undefined' ? res.correct_choice : (typeof res.correct_answer !== 'undefined' ? res.correct_answer : -1)) : -1;
                            const isUserChoice = quizAnswers[q.id] === oIdx;
                            const isCorrectChoice = isEvaluated && oIdx === correctIdx;
                            const isWrongChoice = isEvaluated && isUserChoice && oIdx !== correctIdx;

                            let optionClasses = 'bg-white border-[#ebdcc8] text-slate-900 font-medium hover:bg-[#faf5ec]';
                            let cursorClass = 'cursor-pointer';

                            if (isEvaluated) {
                              cursorClass = 'cursor-default';
                              if (isCorrectChoice) {
                                optionClasses = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-400';
                              } else if (isWrongChoice) {
                                optionClasses = 'bg-rose-50 border-rose-400 text-rose-950 font-medium opacity-85';
                              } else {
                                optionClasses = 'bg-slate-50 border-slate-200 text-slate-500 opacity-60';
                              }
                            } else if (isUserChoice) {
                              optionClasses = 'bg-[#ea8b21]/10 border-[#ea8b21] text-slate-950 font-bold shadow-2xs';
                            }

                            return (
                              <label
                                key={oIdx}
                                onClick={() => {
                                  if (!isEvaluated) handleQuizAnswer(q.id, oIdx);
                                }}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${cursorClass} ${optionClasses}`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz_q_${q.id}`}
                                  checked={isUserChoice}
                                  disabled={isEvaluated}
                                  onChange={() => {
                                    if (!isEvaluated) handleQuizAnswer(q.id, oIdx);
                                  }}
                                  className="text-[#ea8b21] focus:ring-[#ea8b21] disabled:opacity-80"
                                />
                                <span className="flex-1">{opt}</span>
                                {isCorrectChoice && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Correct Key
                                  </span>
                                )}
                                {isWrongChoice && (
                                  <span className="text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" /> Your Selection
                                  </span>
                                )}
                              </label>
                            );
                          })}
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

                                <p className="text-[11px] text-slate-900 font-medium leading-relaxed">
                                  {res.explanation || 'Verified with official guidelines.'}
                                </p>

                                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                                  <div className="flex items-center justify-between font-bold text-slate-900">
                                    <span className="flex items-center gap-1 text-[#ea8b21]">
                                      <BookOpen className="w-3.5 h-3.5" />
                                      Verified Ground Truth Source Citation:
                                    </span>
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-900 border border-slate-300 font-bold">
                                      {citation.page || 'Page Reference'}
                                    </span>
                                  </div>
                                  <p className="font-bold text-slate-900">
                                    {citation.manual || q.source_manual || 'Official MoSPI Manual'} • {citation.section || 'Guideline Clause'}
                                  </p>
                                  <p className="italic text-slate-900 font-medium text-[10px] bg-slate-50 p-2 rounded border border-slate-200">
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

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-900">
                      {quizEvaluation ? (
                        <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Evaluation Complete & Citations Verified
                        </span>
                      ) : (
                        `${Object.keys(quizAnswers).length} of ${quizQuestions.length} answered`
                      )}
                    </span>

                    {quizEvaluation ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizEvaluation(null);
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-700" />
                          <span>Retake Test</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('dashboard');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/25 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Go to Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={submitQuiz}
                        disabled={isSubmittingQuiz || Object.keys(quizAnswers).length < quizQuestions.length}
                        className="w-full sm:w-auto px-6 py-3 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingQuiz ? "Verifying Ground Truth..." : "Submit & Check Citations"}
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
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
                    <p className="text-xs text-slate-900 font-medium">
                      Real-time assessment history, competency scores, and gap resolution logs for <strong className="text-slate-950">{user.name}</strong>.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={() => startDiagnostic(selectedField)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ea8b21]/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Compass className="w-3.5 h-3.5" /> Take Skill Diagnostic
                    </button>
                    <button
                      onClick={() => {
                        setSelectedManual('manual_cpi_rural');
                        setActiveTab('upload_quiz');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#faf5ec] border border-[#ebdcc8] text-slate-900 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#ea8b21]" /> Take Manual Quiz
                    </button>
                  </div>
                </div>

                {/* 4 Executive KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Average Score */}
                  <div className="bg-white border border-[#ebdcc8] rounded-2xl p-5 shadow-2xs space-y-1 hover:border-[#ea8b21] transition-all">
                    <span className="text-xs font-bold text-slate-900">Average Competency Score</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">{avgScore}%</span>
                      {completedCount > 1 && (
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${growthDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          <TrendingUp className="w-3.5 h-3.5" />
                          {growthDelta >= 0 ? `+${growthDelta}%` : `${growthDelta}%`}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-900 font-bold">
                      {avgScore >= 80 ? '✓ Exceeds MoSPI Benchmark (80%)' : 'MoSPI Target Level: 80% (FRAC L3)'}
                    </p>
                  </div>

                  {/* Card 2: Total Sessions */}
                  <div className="bg-white border border-[#ebdcc8] rounded-2xl p-5 shadow-2xs space-y-1 hover:border-[#ea8b21] transition-all">
                    <span className="text-xs font-bold text-slate-900">Assessments Completed</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#ea8b21]">{completedCount}</span>
                      <span className="text-xs font-bold text-slate-900">sessions recorded</span>
                    </div>
                    <p className="text-[11px] text-slate-900 font-bold">
                      {userHistory.filter(h => h.type === 'diagnostic').length} Diagnostics • {userHistory.filter(h => h.type === 'quiz').length} Quizzes
                    </p>
                  </div>

                  {/* Card 3: Proficiency Rate */}
                  <div className="bg-white border border-[#ebdcc8] rounded-2xl p-5 shadow-2xs space-y-1 hover:border-[#ea8b21] transition-all">
                    <span className="text-xs font-bold text-slate-900">Karmayogi Proficiency Rate</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-700">{passPercentage}%</span>
                      <span className="text-xs font-bold text-slate-900">benchmark met</span>
                    </div>
                    <p className="text-[11px] text-slate-900 font-bold">
                      {passedCount} of {completedCount} tests scored ≥ 75%
                    </p>
                  </div>

                  {/* Card 4: Assigned Working Domain */}
                  <div className="bg-white border border-[#ebdcc8] rounded-2xl p-5 shadow-2xs space-y-1 hover:border-[#ea8b21] transition-all">
                    <span className="text-xs font-bold text-slate-900">Current Cadre Domain</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900 truncate">
                        {activeFieldDetails.designation.split('-')[0].trim()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-900 font-bold truncate">{activeFieldDetails.division}</p>
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
                      <p className="text-xs text-slate-900 font-medium mt-0.5">
                        Chronological score evolution updated automatically upon completing any diagnostic or quiz
                      </p>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                      avgScore >= 80 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : (growthDelta > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-900 border-slate-300')
                    }`}>
                      {avgScore >= 80 ? '✨ Cadre Benchmark Achieved' : (growthDelta > 0 ? `📈 Positive Trajectory (+${growthDelta}%)` : '🎯 Baseline Learning Stage')}
                    </span>
                  </div>

                  {completedCount === 0 ? (
                    <div className="p-10 text-center space-y-3 bg-[#faf5ec]/50 rounded-2xl border border-dashed border-[#ebdcc8]">
                      <BarChart3 className="w-10 h-10 text-[#ea8b21] mx-auto opacity-70" />
                      <h4 className="font-extrabold text-sm text-slate-900">No Assessment Records Yet</h4>
                      <p className="text-xs text-slate-900 font-medium max-w-sm mx-auto">
                        Complete your first 10-Question Skill Diagnostic or AI Document Quiz to start tracking your growth trajectory!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="h-72 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }} 
                              interval="preserveStartEnd"
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
                            <ReferenceLine 
                              y={80} 
                              stroke="#2563eb" 
                              strokeDasharray="5 4" 
                              strokeWidth={2}
                              label={{ 
                                value: 'MoSPI Benchmark Target (80%)', 
                                position: 'top', 
                                fill: '#2563eb', 
                                fontSize: 11, 
                                fontWeight: 700 
                              }} 
                            />
                            <Bar 
                              dataKey="score" 
                              name="Your Assessment Score per Attempt" 
                              fill="#ea8b21" 
                              radius={[6, 6, 0, 0]} 
                              maxBarSize={48}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Clean Visual Legend */}
                      <div className="pt-3 border-t border-[#ebdcc8]/80 flex flex-wrap items-center justify-center gap-6 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-md bg-[#ea8b21] shadow-2xs" />
                          <span className="font-bold text-slate-900">Your Assessment Score per Attempt</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-0 border-t-2 border-dashed border-blue-600" />
                          <span className="font-bold text-blue-600">MoSPI Cadre Benchmark Target (80%)</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Detailed Activity History Feed */}
                <div className="bg-white border border-[#ebdcc8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc8]/80">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                        Official Assessment History & Audit Log
                      </h3>
                      <p className="text-xs text-slate-900 font-medium mt-0.5">
                        All completed diagnostic sessions and manual assessments saved to your officer profile
                      </p>
                    </div>
                  </div>

                  {completedCount === 0 ? (
                    <p className="text-xs text-slate-900 font-medium italic text-center py-6">
                      No activity logged yet. Your completed tests will appear here chronologically.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[390px] overflow-y-auto pr-2 custom-scrollbar">
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
                              <p className="text-[11px] text-slate-900 mt-0.5 font-medium">
                                {item.field} • <span className="text-slate-900 font-bold">{item.date}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <span className="text-[11px] font-bold text-slate-900">{item.status}</span>
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
        <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-900 font-bold mt-auto">
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
                <p className="text-xs text-slate-900 font-medium">
                  Choose your working domain so we can calibrate your diagnostic tests and iGOT training modules.
                </p>
              </div>
              {user.hasCompletedOnboarding && (
                <button
                  onClick={() => setShowFieldModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-800 hover:text-slate-950 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* 3 Statistical Fields (Streamlined & Compact) */}
            <div className="space-y-3">
              {STATISTICAL_FIELDS.map(f => {
                const isSelected = selectedField === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedField(f.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-[#ea8b21] bg-[#ea8b21]/10 shadow-xs ring-2 ring-[#ea8b21]/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-[#faf5ec]/40 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-300">
                          {f.badge}
                        </span>
                        <span className="text-xs font-bold text-[#ea8b21]">{f.division}</span>
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{f.title}</h4>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#ea8b21] bg-[#ea8b21] text-white shadow-xs' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-900 font-bold text-center sm:text-left">You can change this anytime from the Home page.</span>
              <button
                onClick={() => confirmFieldSelection(selectedField)}
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ea8b21]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Confirm & Continue to Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
                  <span className="text-xs font-bold text-slate-900">
                    {activeVideoModal.provider || "Karmayogi Bharat & MoSPI"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {activeVideoModal.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-2 hover:bg-[#faf5ec] rounded-xl text-slate-700 hover:text-slate-950 cursor-pointer transition-colors"
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
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
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
                          : 'bg-[#faf5ec]/60 border-[#ebdcc8] text-slate-900 font-medium hover:bg-[#faf5ec]'
                      }`}
                    >
                      <span className="font-bold truncate mr-2">{ts.label}</span>
                      <Play className={`w-3.5 h-3.5 shrink-0 ${
                        videoTimestamp === (ts.seconds || 0) ? 'text-[#ea8b21]' : 'text-slate-600'
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
                  className="text-xs text-slate-900 hover:underline flex items-center gap-1.5 font-bold"
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

      {/* MoSPI & Mission Karmayogi Statutory Inactivity Warning Modal */}
      {showInactivityWarning && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#ebdcc8] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30"></span>
              <ShieldAlert className="w-8 h-8 relative z-10" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                Statutory Security Compliance
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Session Inactivity Warning
              </h3>
              <p className="text-xs text-slate-900 font-medium leading-relaxed">
                Under Mission Karmayogi (DoPT) & Collection of Statistics Act 2008 standards, unattended sessions on statistical terminals are automatically locked to safeguard census micro-data.
              </p>
            </div>
            <div className="p-4 bg-[#faf5ec] border border-[#ebdcc8] rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Locking out in</span>
              <span className="text-3xl font-black text-[#ea8b21] font-mono mt-1">
                {secondsRemaining}s
              </span>
              <span className="text-[11px] text-slate-900 font-bold mt-1">Move your cursor or click below to stay signed in</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Sign Out Now
              </button>
              <button
                type="button"
                onClick={extendSession}
                className="flex-1 py-2.5 px-4 bg-[#ea8b21] hover:bg-[#d97d19] text-white rounded-xl font-bold text-xs shadow-md shadow-[#ea8b21]/20 transition cursor-pointer"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal (Strictly for non-Google email/password accounts) */}
      {showChangePasswordModal && !user?.isGoogleVerified && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#ebdcc8] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc8]/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ea8b21]/10 text-[#ea8b21] flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Change Password</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Encrypted Password Update</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePassError('');
                  setChangePassSuccess('');
                }}
                className="p-1.5 hover:bg-[#faf5ec] rounded-xl text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {changePassError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{changePassError}</span>
              </div>
            )}

            {changePassSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{changePassSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={currentPassInput}
                    onChange={(e) => {
                      setCurrentPassInput(e.target.value);
                      if (changePassError) setChangePassError('');
                    }}
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">New Password (min. 6 characters)</label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    placeholder="Enter new password"
                    value={newPassInput}
                    onChange={(e) => {
                      setNewPassInput(e.target.value);
                      if (changePassError) setChangePassError('');
                    }}
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassInput}
                    onChange={(e) => {
                      setConfirmPassInput(e.target.value);
                      if (changePassError) setChangePassError('');
                    }}
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setChangePassError('');
                    setChangePassSuccess('');
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChangePass}
                  className={`px-5 py-2.5 bg-[#ea8b21] hover:bg-[#d97d16] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ea8b21]/20 cursor-pointer flex items-center gap-1.5 ${isSubmittingChangePass ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmittingChangePass ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Save New Password</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
