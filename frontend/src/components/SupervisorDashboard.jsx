import React, { useState, useEffect } from 'react';
import { 
  Users, UserX, UserCheck, Send, CheckCircle2, Clock, 
  AlertTriangle, Shield, ArrowRight, ArrowLeft, RefreshCw, Check,
  ChevronDown, Award, TrendingUp, Info, ShieldCheck, LogOut,
  LayoutDashboard, UserCheck2, Compass, FileCheck2, Menu, X, BookOpen, Layers,
  Key, Eye, EyeOff
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? "http://127.0.0.1:8000/api"
    : (typeof window !== 'undefined' && window.location.hostname.endsWith('onrender.com') ? "/api" : "https://sankhyasetu-ai.onrender.com/api")
);

// Prototype Squad Data across the 3 Official MoSPI Fields
const INITIAL_SQUADS = {
  survey_supervisor_asuse: {
    fieldId: 'survey_supervisor_asuse',
    fieldName: 'ASUSE (Annual Survey of Unincorporated Enterprises)',
    squadName: 'Delhi North Cadre Unit #04',
    supervisor: 'Rajesh Kumar (Senior Statistical Officer)',
    supervisorEmail: 'supervisor1@gmail.com',
    supervisorBadge: 'SSO-DEL-101',
    submittedAt: 'Today, 5:02 PM',
    status: 'submitted',
    officers: [
      {
        id: 'FI-2024-102',
        name: 'Amit Sharma',
        cadre: 'Field Investigator (FI)',
        domain: 'ASUSE Enterprise Accounting',
        email: 'amit.sharma@mospi.gov.in',
        phone: '+91 98111-23041',
        status: 'active',
        score: 88,
        modulesCompleted: '5/5',
        weakTopic: 'None (Passing Benchmark)',
        lastActive: 'Active Now (Field App)',
        verificationNote: 'Verified: On Active Field Duty (Census Block 14)',
        isDeactivated: false
      },
      {
        id: 'JSO-2023-088',
        name: 'Priya Verma',
        cadre: 'Junior Statistical Officer (JSO)',
        domain: 'ASUSE Sampling & Listing',
        email: 'priya.verma@mospi.gov.in',
        phone: '+91 98222-77192',
        status: 'low_score',
        score: 62,
        modulesCompleted: '3/5',
        weakTopic: 'Block 3: Enterprise Annual Turnover',
        lastActive: 'Active 20 mins ago',
        verificationNote: 'Auto-Flag: Scored 62% on Enterprise Turnover (Benchmark 70%)',
        isDeactivated: false
      },
      {
        id: 'FI-2022-019',
        name: 'Rahul Deshmukh',
        cadre: 'Field Investigator (FI)',
        domain: 'ASUSE Establishment Frames',
        email: 'rahul.deshmukh@mospi.gov.in',
        phone: '+91 98333-88410',
        status: 'inactive',
        score: 0,
        modulesCompleted: '0/5',
        weakTopic: 'Schedule 1.0 Data Entry',
        lastActive: '5 days ago (Unreported)',
        verificationNote: 'Auto-Flag: No login activity recorded for 5 consecutive days',
        isDeactivated: false
      }
    ]
  },
  field_investigator_nsso: {
    fieldId: 'field_investigator_nsso',
    fieldName: 'PLFS (Periodic Labour Force Survey)',
    squadName: 'Varanasi Cantt Unit #08',
    supervisor: 'Sunita Devi (Senior Statistical Officer)',
    supervisorEmail: 'supervisor2@gmail.com',
    supervisorBadge: 'SSO-VNS-108',
    submittedAt: 'Today, 4:45 PM',
    status: 'submitted',
    officers: [
      {
        id: 'FI-2024-210',
        name: 'Vikram Malhotra',
        cadre: 'Field Investigator (FI)',
        domain: 'PLFS Household Rosters',
        email: 'vikram.m@mospi.gov.in',
        phone: '+91 98444-11029',
        status: 'active',
        score: 84,
        modulesCompleted: '4/5',
        weakTopic: 'Usual Principal Activity Status',
        lastActive: 'Active 10 mins ago',
        verificationNote: 'Verified: On Active Field Duty (Rural Ward 3)',
        isDeactivated: false
      },
      {
        id: 'JSO-2024-215',
        name: 'Pooja Nair',
        cadre: 'Junior Statistical Officer (JSO)',
        domain: 'PLFS Activity Codes (NIC/NCO)',
        email: 'pooja.n@mospi.gov.in',
        phone: '+91 98555-66120',
        status: 'active',
        score: 79,
        modulesCompleted: '5/5',
        weakTopic: 'None (Passing Benchmark)',
        lastActive: 'Active 1 hr ago',
        verificationNote: 'Verified: Field Schedule 10.2 Audit Completed',
        isDeactivated: false
      },
      {
        id: 'FI-2023-198',
        name: 'Manoj Tiwari',
        cadre: 'Field Investigator (FI)',
        domain: 'PLFS Current Weekly Status',
        email: 'manoj.t@mospi.gov.in',
        phone: '+91 98666-33918',
        status: 'active',
        score: 83,
        modulesCompleted: '5/5',
        weakTopic: 'Informant Non-Response Protocols',
        lastActive: 'Active Today',
        verificationNote: 'Verified: Field Scrutiny Passed',
        isDeactivated: false
      }
    ]
  },
  junior_statistical_officer_cso: {
    fieldId: 'junior_statistical_officer_cso',
    fieldName: 'HCES / Economic Statistics (CSO & Household)',
    squadName: 'Bengaluru South Unit #12',
    supervisor: 'Anil Mehta (Senior Statistical Officer)',
    supervisorEmail: 'supervisor3@gmail.com',
    supervisorBadge: 'SSO-BLR-114',
    submittedAt: null,
    status: 'pending',
    officers: [
      {
        id: 'FI-2024-301',
        name: 'Suresh Patel',
        cadre: 'Field Investigator (FI)',
        domain: 'Consumer Expenditure Items',
        email: 'suresh.p@mospi.gov.in',
        phone: '+91 98777-55019',
        status: 'active',
        score: 72,
        modulesCompleted: '3/5',
        weakTopic: 'Durable Goods Imputation',
        lastActive: 'Active 3 hrs ago',
        verificationNote: 'Verified: On Duty',
        isDeactivated: false
      },
      {
        id: 'JSO-2024-312',
        name: 'Neha Gupta',
        cadre: 'Junior Statistical Officer (JSO)',
        domain: 'CPI Price Quotation Scrutiny',
        email: 'neha.g@mospi.gov.in',
        phone: '+91 98888-22941',
        status: 'active',
        score: 70,
        modulesCompleted: '4/5',
        weakTopic: 'Laspeyres Index Aggregation',
        lastActive: 'Active Yesterday',
        verificationNote: 'Verified: On Duty',
        isDeactivated: false
      },
      {
        id: 'FI-2023-329',
        name: 'Deepak Rawat',
        cadre: 'Field Investigator (FI)',
        domain: 'Urban Frame Survey (UFS) Maps',
        email: 'deepak.r@mospi.gov.in',
        phone: '+91 98999-11488',
        status: 'low_score',
        score: 45,
        modulesCompleted: '1/5',
        weakTopic: 'Block Boundary Identification',
        lastActive: 'Active 2 days ago',
        verificationNote: 'Auto-Flag: Low Accuracy on UFS Block Mapping (45%)',
        isDeactivated: false
      }
    ]
  }
};

export default function SupervisorDashboard({ onLogout, initialFieldId, activeSupervisor }) {
  const [squads, setSquads] = useState(INITIAL_SQUADS);
  const [selectedFieldId, setSelectedFieldId] = useState(initialFieldId || 'survey_supervisor_asuse');
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [squadFilter, setSquadFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Cadre Registration Approvals State
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [approvalActionLoading, setApprovalActionLoading] = useState({});

  // Change Password Modal States
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

  const fetchPendingApprovals = async () => {
    setIsLoadingApprovals(true);
    try {
      const res = await fetch(`${API_BASE}/db/cadre/pending-approvals?role=officer`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingApprovals(data.approvals || []);
      }
    } catch (e) {
      console.error("Error fetching pending approvals:", e);
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    const interval = setInterval(fetchPendingApprovals, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveOfficer = async (officerEmail, officerName, action = 'approve') => {
    setApprovalActionLoading(prev => ({ ...prev, [officerEmail]: true }));
    try {
      const res = await fetch(`${API_BASE}/db/cadre/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: officerEmail,
          target_role: 'officer',
          reviewer: activeSupervisor?.email || 'supervisor@mospi.gov.in',
          action: action
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(action === 'approve' 
          ? `Officer ${officerName} (${officerEmail}) approved and activated into Field Cadre!` 
          : `Registration request for ${officerEmail} declined.`
        );
        fetchPendingApprovals();
      } else {
        triggerToast(data.error || 'Failed to update approval status.');
      }
    } catch (err) {
      triggerToast('Network error while updating cadre approval.');
    } finally {
      setApprovalActionLoading(prev => ({ ...prev, [officerEmail]: false }));
    }
  };

  const currentSquad = squads[selectedFieldId] || squads.survey_supervisor_asuse;

  // Show auto-fading toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Direct Instant Deactivate / Reactivate
  const handleToggleDeactivate = (officerId) => {
    setSquads(prev => {
      const updatedOfficers = prev[selectedFieldId].officers.map(off => {
        if (off.id === officerId) {
          const nextDeactivated = !off.isDeactivated;
          return {
            ...off,
            isDeactivated: nextDeactivated,
            status: nextDeactivated ? 'deactivated' : (off.score < 70 && off.score > 0 ? 'low_score' : (off.score === 0 ? 'inactive' : 'active'))
          };
        }
        return off;
      });

      return {
        ...prev,
        [selectedFieldId]: {
          ...prev[selectedFieldId],
          officers: updatedOfficers
        }
      };
    });

    const target = currentSquad.officers.find(o => o.id === officerId);
    if (target && !target.isDeactivated) {
      triggerToast(`Officer ${target.name} (${target.id}) has been relieved and deactivated. Field login suspended.`);
    } else if (target) {
      triggerToast(`Officer ${target.name} (${target.id}) account restored to active status.`);
    }
  };

  // Submit Squad Status to HQ
  const handleSubmitSquadStatus = () => {
    setIsSubmitting(true);
    const now = new Date();
    const timeStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setTimeout(() => {
      setSquads(prev => ({
        ...prev,
        [selectedFieldId]: {
          ...prev[selectedFieldId],
          status: 'submitted',
          submittedAt: timeStr
        }
      }));
      setIsSubmitting(false);
      triggerToast(`✅ Squad roll-call and readiness status successfully submitted to Ministry HQ at ${timeStr}`);
    }, 400);
  };

  // Change Password Handler
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

    const supervisorEmail = (activeSupervisor?.email || currentSquad.supervisorEmail || 'supervisor1@gmail.com').trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE}/db/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: supervisorEmail,
          current_password: trimmedCurrent,
          new_password: trimmedNew,
          cadre: 'supervisor'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setChangePassError(data.error || 'Failed to update supervisor password.');
        setIsSubmittingChangePass(false);
        return;
      }

      setChangePassSuccess(data.message || 'Supervisor password successfully updated! You can now use your new password.');
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
    } catch (err) {
      console.error("Change password error:", err);
      setChangePassError('Connection to security server failed. Please try again.');
    } finally {
      setIsSubmittingChangePass(false);
    }
  };

  // Calculate high-level squad metrics
  const activeCount = currentSquad.officers.filter(o => !o.isDeactivated && o.status === 'active').length;
  const flaggedCount = currentSquad.officers.filter(o => !o.isDeactivated && (o.status === 'low_score' || o.status === 'inactive')).length;
  const deactivatedCount = currentSquad.officers.filter(o => o.isDeactivated).length;
  const avgScore = Math.round(
    currentSquad.officers
      .filter(o => !o.isDeactivated)
      .reduce((acc, o) => acc + o.score, 0) / Math.max(1, currentSquad.officers.filter(o => !o.isDeactivated).length)
  );

  // Filter officers for squad table
  const filteredOfficers = currentSquad.officers.filter(officer => {
    if (squadFilter === 'active') return !officer.isDeactivated && officer.status === 'active';
    if (squadFilter === 'flagged') return !officer.isDeactivated && (officer.status === 'low_score' || officer.status === 'inactive');
    if (squadFilter === 'deactivated') return officer.isDeactivated;
    return true;
  });

  const supervisorDisplayName = activeSupervisor?.name || currentSquad.supervisor;
  const supervisorInitials = supervisorDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'SS';

  return (
    <div className="flex h-screen bg-[#fcfaf6] text-slate-900 font-sans overflow-hidden">
      
      {/* =====================================================================
          LEFT SIDEBAR NAVIGATION (Official Karmayogi Bharat Color Scheme)
          ===================================================================== */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#faf5ec] text-slate-800 border-r border-[#ebdcc8] flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Top of Sidebar: Brand & Navigation */}
        <div className="p-4 space-y-5">
          
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#ebdcc8]/80 pb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-xs p-1.5 border border-[#ebdcc8] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
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
                <p className="text-xs text-slate-900 font-semibold truncate">Tier-1 Supervisor Console</p>
              </div>
            </div>

            {/* Mobile Drawer Close (X) Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-[#eee3d3] rounded-xl transition-all md:hidden cursor-pointer shrink-0"
              title="Close Menu"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links - Standardized Heights (h-11) & No Size Warping */}
          <nav className="space-y-1.5 pt-1">
            
            {/* 1. Squad Overview */}
            <button
              onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 shrink-0 ${activeTab === 'overview' ? 'text-white' : 'text-slate-800'}`} />
              <span className="tracking-tight truncate whitespace-nowrap">Squad Hub</span>
            </button>

            {/* 2. Cadre Approvals */}
            <button
              onClick={() => { setActiveTab('approvals'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'approvals'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <UserCheck2 className={`w-5 h-5 shrink-0 ${activeTab === 'approvals' ? 'text-white' : 'text-slate-800'}`} />
                <span className="tracking-tight truncate whitespace-nowrap">Cadre Approvals</span>
              </div>
              {pendingApprovals.length > 0 && (
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  activeTab === 'approvals' 
                    ? 'bg-white/25 text-white' 
                    : 'bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30'
                }`}>
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            {/* 3. Field Squad Scrutiny */}
            <button
              onClick={() => { setActiveTab('squad'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'squad'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Users className={`w-5 h-5 shrink-0 ${activeTab === 'squad' ? 'text-white' : 'text-slate-800'}`} />
                <span className="tracking-tight truncate whitespace-nowrap">Field Squad Scrutiny</span>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'squad' 
                  ? 'bg-white/25 text-white' 
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {currentSquad.officers.length}
              </span>
            </button>

            {/* 4. Diagnostic Analytics */}
            <button
              onClick={() => { setActiveTab('competency'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'competency'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <Compass className={`w-5 h-5 shrink-0 ${activeTab === 'competency' ? 'text-white' : 'text-slate-800'}`} />
              <span className="tracking-tight truncate whitespace-nowrap">Diagnostic Analytics</span>
            </button>

            {/* 5. Scrutiny Directives & Logs */}
            <button
              onClick={() => { setActiveTab('compliance'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'compliance'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <FileCheck2 className={`w-5 h-5 shrink-0 ${activeTab === 'compliance' ? 'text-white' : 'text-slate-800'}`} />
              <span className="tracking-tight truncate whitespace-nowrap">Scrutiny Directives</span>
            </button>

          </nav>

        </div>

        {/* Bottom of Sidebar: Supervisor Profile Card & Change Password */}
        <div className="p-3.5 m-2.5 rounded-2xl bg-white/90 border border-[#ebdcc8] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#ea8b21] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                {supervisorInitials}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{supervisorDisplayName.split('(')[0]}</p>
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Supervisor Cadre
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out of Supervisor Console"
              className="p-2 text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="px-2.5 py-1 bg-[#faf5ec] border border-[#ebdcc8] rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-800 font-bold">Badge ID:</span>
            <span className="font-mono font-bold text-[#ea8b21]">{currentSquad.supervisorBadge}</span>
          </div>

          {/* Change Password Option (works same as field officer) */}
          <button
            onClick={() => {
              setShowChangePasswordModal(true);
              setChangePassError('');
              setChangePassSuccess('');
              setCurrentPassInput('');
              setNewPassInput('');
              setConfirmPassInput('');
            }}
            className="w-full py-2 px-3 bg-[#faf5ec] hover:bg-[#eee3d3] border border-[#ebdcc8] rounded-xl text-xs font-bold text-slate-900 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Key className="w-3.5 h-3.5 text-[#ea8b21]" />
            <span>Change Password</span>
          </button>
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
        
        {/* Top Minimal Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
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
              <span className="font-bold text-slate-900">MoSPI Supervisor Console</span>
              <span>/</span>
              <span className="capitalize font-bold text-[#ea8b21]">
                {activeTab === 'overview' ? 'Squad Hub' : (
                  activeTab === 'approvals' ? 'Cadre Approvals' : (
                    activeTab === 'squad' ? 'Squad Scrutiny' : (
                      activeTab === 'competency' ? 'Diagnostic Analytics' : 'Scrutiny Directives'
                    )
                  )
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Field Switcher dropdown right in the top bar */}
            <div className="relative inline-block">
              <select
                value={selectedFieldId}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="appearance-none bg-[#faf5ec] hover:bg-white text-slate-900 text-xs font-bold py-1.5 pl-3 pr-8 rounded-xl border border-[#ebdcc8] cursor-pointer focus:outline-[#ea8b21] transition shadow-2xs"
              >
                <option value="survey_supervisor_asuse">ASUSE Enterprise</option>
                <option value="field_investigator_nsso">PLFS Labour Force</option>
                <option value="junior_statistical_officer_cso">HCES Household Survey</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-800 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              Supervisory Authority
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-emerald-300 text-emerald-950 p-4 rounded-2xl shadow-xl flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs font-bold">{toastMessage}</div>
            </div>
          )}

          {/* ===================================================================
              TAB 1: SQUAD OVERVIEW (HUB)
              =================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Squad Identity Banner & Submission Status */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-slate-800 font-semibold mb-1">
                    <span>Cadre Supervisor: <strong className="text-slate-950 font-bold">{currentSquad.supervisor}</strong></span>
                    <span>•</span>
                    <span>Badge: <span className="font-mono font-bold text-[#ea8b21]">{currentSquad.supervisorBadge}</span></span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {currentSquad.squadName}
                  </h2>
                  <p className="text-xs text-slate-800 mt-1 max-w-2xl font-semibold leading-relaxed">
                    {currentSquad.fieldName}. Official supervisory authority over field officers, daily survey attendance, accuracy scrutiny, and direct administrative offboarding.
                  </p>
                </div>

                {/* Submit Squad Status Button */}
                <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">HQ Submission Status</div>
                    <div className="text-xs font-bold mt-0.5">
                      {currentSquad.status === 'submitted' ? (
                        <span className="text-emerald-800 flex items-center justify-end font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Submitted ({currentSquad.submittedAt})
                        </span>
                      ) : (
                        <span className="text-amber-800 flex items-center justify-end font-bold">
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-700" /> Pending Daily Roll-Call
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitSquadStatus}
                    disabled={isSubmitting}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition shadow-md cursor-pointer ${
                      currentSquad.status === 'submitted'
                        ? 'bg-[#faf5ec] hover:bg-white text-slate-900 border border-[#ebdcc8]'
                        : 'bg-[#ea8b21] hover:bg-[#d97d16] text-white shadow-[#ea8b21]/20'
                    }`}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Syncing...' : (currentSquad.status === 'submitted' ? 'Re-Submit Squad Status to HQ' : 'Submit Squad Status to HQ')}
                  </button>
                </div>
              </div>

              {/* Pending Approvals Alert Banner (if any) */}
              {pendingApprovals.length > 0 && (
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold shrink-0">
                      <Clock className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-950">
                        {pendingApprovals.length} Field Officer Registration{pendingApprovals.length > 1 ? 's' : ''} Awaiting Activation
                      </h4>
                      <p className="text-xs text-amber-900 font-semibold">
                        Newly registered officers need your authorization to access the field deployment console.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Review Approvals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Squad Health KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>Squad Attendance (3 Officers)</span>
                    <Users className="w-4 h-4 text-[#ea8b21]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {activeCount} <span className="text-sm font-bold text-slate-800">/ 3 On Active Duty</span>
                  </div>
                  <div className="text-xs text-emerald-800 font-bold mt-2 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block mr-1.5 animate-pulse"></span>
                    Real-time MoSPI field telemetry
                  </div>
                </div>

                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>Squad Competency Average</span>
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {avgScore}% <span className="text-sm font-bold text-slate-800">Readiness</span>
                  </div>
                  <div className="text-xs text-slate-800 mt-2 font-semibold">
                    Ministry Passing Threshold: <strong className="text-slate-950 font-bold">70.0%</strong>
                  </div>
                </div>

                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>Attention Required</span>
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="text-2xl font-black text-amber-800">
                    {flaggedCount} <span className="text-sm font-bold text-slate-800">{flaggedCount === 1 ? 'Officer Flagged' : 'Officers Flagged'}</span>
                  </div>
                  <div className="text-xs text-amber-900 font-bold mt-2">
                    Automated low-score & inactivity checks
                  </div>
                </div>
              </div>

              {/* Quick Squad Scrutiny Preview */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebdcc8] pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Assigned Cadre Roster ({currentSquad.officers.length})</h3>
                    <p className="text-xs text-slate-800 font-semibold">Inspect active status and performance for the {currentSquad.fieldName.split('(')[0]} unit.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('squad')}
                    className="self-start sm:self-auto text-xs font-bold text-[#ea8b21] hover:text-[#d97d16] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Scrutiny Table</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentSquad.officers.map(off => (
                    <div key={off.id} className={`p-4 rounded-xl border ${off.isDeactivated ? 'bg-slate-100 border-slate-300' : 'bg-[#faf5ec]/50 border-[#ebdcc8]'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-950">{off.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          off.isDeactivated 
                            ? 'bg-rose-100 text-rose-900 border border-rose-200' 
                            : (off.status === 'active' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200')
                        }`}>
                          {off.isDeactivated ? 'Relieved' : (off.status === 'active' ? 'Active' : 'Needs Review')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 font-mono font-semibold mt-1">{off.id} • {off.cadre}</div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-bold">Readiness Score:</span>
                        <span className="font-mono font-black text-slate-950">{off.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisory Guidelines */}
              <div className="bg-[#faf5ec] rounded-2xl border border-[#ebdcc8] p-4 text-xs text-slate-900 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-[#ea8b21] shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-slate-950">MoSPI Field Supervisory Guidelines (Collection of Statistics Act):</span>
                  <p className="mt-0.5 leading-relaxed font-semibold text-slate-800">
                    Supervisors must scrutinize at least 10% of field schedules. Officers with scores under 70% must be coached before survey deployment. Deactivation revokes digital tablet keys while preserving historical survey audit logs.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              TAB 2: CADRE REGISTRATION APPROVALS
              =================================================================== */}
          {activeTab === 'approvals' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#ebdcc8] shadow-2xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <UserCheck2 className="w-5 h-5 text-[#ea8b21]" />
                    <span>Cadre Officer Registration Approvals</span>
                    {pendingApprovals.length > 0 && (
                      <span className="text-xs px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold">
                        {pendingApprovals.length} Pending
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-800 font-semibold mt-0.5">
                    Newly registered officers must be approved by a Supervisor before they can access the field deployment workspace.
                  </p>
                </div>

                <button
                  onClick={fetchPendingApprovals}
                  disabled={isLoadingApprovals}
                  className="self-start sm:self-auto text-xs font-bold px-3.5 py-2 bg-[#faf5ec] hover:bg-[#ebdcc8]/50 text-slate-900 border border-[#ebdcc8] rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApprovals ? 'animate-spin' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="bg-white border border-[#ebdcc8] rounded-2xl p-10 text-center shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">No Pending Approvals</h4>
                  <p className="text-xs text-slate-800 max-w-md mx-auto font-semibold">
                    All submitted field officer registrations have been reviewed. New registration requests will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingApprovals.map((req) => (
                    <div key={req.id || req.email} className="bg-white border border-amber-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-950">{req.name}</span>
                          <span className="text-[10px] font-mono bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">
                            Pending Activation
                          </span>
                        </div>
                        <div className="text-xs font-mono text-[#ea8b21] font-bold">{req.email}</div>
                        <div className="text-xs text-slate-800 font-bold">
                          {req.role_name} • {req.department}
                        </div>
                        {req.requested_at && (
                          <div className="text-xs text-slate-700 font-medium">
                            Registered: {new Date(req.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(req.requested_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          disabled={approvalActionLoading[req.email]}
                          onClick={() => handleApproveOfficer(req.email, req.name, 'approve')}
                          className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Activate</span>
                        </button>
                        <button
                          type="button"
                          disabled={approvalActionLoading[req.email]}
                          onClick={() => handleApproveOfficer(req.email, req.name, 'reject')}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-800 border border-slate-300 hover:border-rose-300 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 3: FIELD SQUAD SCRUTINY (ROSTER TABLE - NO MAIL BUTTONS)
              =================================================================== */}
          {activeTab === 'squad' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Filter Ribbon */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#ea8b21]" />
                    <span>Assigned Squad Cadre Officers ({currentSquad.officers.length})</span>
                  </h3>
                  <p className="text-xs text-slate-800 font-semibold">
                    Inspect competencies, review automated checks, and manage cadre authorization status.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-[#faf5ec] p-1 rounded-xl border border-[#ebdcc8] text-xs font-bold self-start sm:self-auto">
                  <button
                    onClick={() => setSquadFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      squadFilter === 'all' ? 'bg-[#ea8b21] text-white shadow-xs' : 'text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    All ({currentSquad.officers.length})
                  </button>
                  <button
                    onClick={() => setSquadFilter('active')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      squadFilter === 'active' ? 'bg-[#ea8b21] text-white shadow-xs' : 'text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    onClick={() => setSquadFilter('flagged')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      squadFilter === 'flagged' ? 'bg-[#ea8b21] text-white shadow-xs' : 'text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    Flagged ({flaggedCount})
                  </button>
                  {deactivatedCount > 0 && (
                    <button
                      onClick={() => setSquadFilter('deactivated')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        squadFilter === 'deactivated' ? 'bg-[#ea8b21] text-white shadow-xs' : 'text-slate-800 hover:text-slate-950'
                      }`}
                    >
                      Relieved ({deactivatedCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Roster Table (NO Mail buttons, NO email modals) */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-900">
                    <thead className="bg-[#faf5ec] uppercase text-xs text-slate-900 font-bold tracking-wider border-b border-[#ebdcc8]">
                      <tr>
                        <th scope="col" className="py-3 px-4 font-black">Officer & Cadre</th>
                        <th scope="col" className="py-3 px-4 font-black">Attendance & Activity</th>
                        <th scope="col" className="py-3 px-4 font-black">Score & Progress</th>
                        <th scope="col" className="py-3 px-4 font-black">Automated Verification</th>
                        <th scope="col" className="py-3 px-4 font-black text-right">Account Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebdcc8]/70">
                      {filteredOfficers.map((officer) => (
                        <tr 
                          key={officer.id}
                          className={`transition ${officer.isDeactivated ? 'bg-slate-100/70 opacity-70' : 'hover:bg-[#faf5ec]/50'}`}
                        >
                          {/* Officer Identity */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-950 text-sm flex items-center">
                              {officer.name}
                              {officer.isDeactivated && (
                                <span className="ml-2 text-[10px] bg-rose-100 text-rose-900 border border-rose-300 px-1.5 py-0.2 rounded font-bold">
                                  Deactivated
                                </span>
                              )}
                            </div>
                            <div className="text-slate-800 text-xs font-semibold mt-0.5">
                              ID: <span className="font-mono font-bold text-slate-900">{officer.id}</span> • {officer.cadre}
                            </div>
                            <div className="text-slate-800 text-xs font-bold mt-0.5">
                              {officer.domain}
                            </div>
                            <div className="text-slate-700 font-mono text-xs font-semibold mt-0.5">
                              {officer.email}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            {officer.isDeactivated ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
                                ⚪ Relieved / Inactive
                              </span>
                            ) : officer.status === 'active' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse"></span>
                                Active Today
                              </span>
                            ) : officer.status === 'low_score' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                                <AlertTriangle className="w-3 h-3 mr-1 text-amber-700" />
                                Needs Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                <Clock className="w-3 h-3 mr-1 text-rose-700" />
                                Inactive (5+ d)
                              </span>
                            )}
                            <div className="text-xs text-slate-800 font-bold mt-1">
                              {officer.lastActive}
                            </div>
                          </td>

                          {/* Score & Progress */}
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`text-base font-black font-mono ${
                                officer.score >= 70 ? 'text-emerald-800' : (officer.score > 0 ? 'text-amber-800' : 'text-slate-600')
                              }`}>
                                {officer.score}%
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                ({officer.modulesCompleted} Modules)
                              </span>
                            </div>
                            <div className="w-28 bg-[#ebdcc8] rounded-full h-2 mt-1 overflow-hidden">
                              <div 
                                className={`h-2 rounded-full ${
                                  officer.score >= 70 ? 'bg-emerald-600' : (officer.score > 0 ? 'bg-[#ea8b21]' : 'bg-slate-400')
                                }`}
                                style={{ width: `${Math.max(4, officer.score)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-slate-800 font-bold mt-1 truncate max-w-[180px]">
                              Focus: {officer.weakTopic}
                            </div>
                          </td>

                          {/* Automated Verification */}
                          <td className="py-4 px-4">
                            <div className="text-xs leading-relaxed text-slate-900 font-medium max-w-xs bg-[#faf5ec] p-2.5 rounded-xl border border-[#ebdcc8]">
                              <Info className="w-3 h-3 inline mr-1 text-[#ea8b21]" />
                              {officer.verificationNote}
                            </div>
                          </td>

                          {/* Instant Relieve / Reactivate Button */}
                          <td className="py-4 px-4 text-right">
                            {officer.isDeactivated ? (
                              <button
                                onClick={() => handleToggleDeactivate(officer.id)}
                                className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                Reactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleDeactivate(officer.id)}
                                className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 transition shadow-2xs cursor-pointer"
                              >
                                <UserX className="w-3.5 h-3.5 mr-1" />
                                Relieve / Deactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              TAB 4: DIAGNOSTIC ANALYTICS & REMEDIAL COACHING
              =================================================================== */}
          {activeTab === 'competency' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 sm:p-6 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#ea8b21]" />
                    <span>Squad Diagnostic Analytics & Competency Radar</span>
                  </h3>
                  <span className="text-xs font-bold px-3 py-1 bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30 rounded-xl">
                    {currentSquad.fieldName.split('(')[0]}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-semibold">
                  Continuous skill gap telemetry derived from daily CAPI checks, survey schedules, and diagnostic tests.
                </p>
              </div>

              {/* Weak Topic Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Competency Flag</span>
                  <h4 className="text-base font-black text-slate-900">Enterprise Accounting & Turnover</h4>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    Flagged in 33% of field schedules. Officers demonstrate inconsistency in deducting intermediate consumption from gross output.
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                      Coaching Prescribed
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Secondary Competency Flag</span>
                  <h4 className="text-base font-black text-slate-900">Urban Frame Survey (UFS) Maps</h4>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    Flagged in rural/urban periphery wards. Difficulty matching satellite enumeration maps to on-ground hamlet structures.
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                      Field Re-demonstration Needed
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Compliance Benchmark</span>
                  <h4 className="text-base font-black text-slate-900">Passing Threshold: 70.0%</h4>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    Current Squad Competency Index stands at <strong className="text-slate-950 font-black">{avgScore}%</strong>. Field deployment permitted for officers meeting or exceeding 70%.
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                      {avgScore >= 70 ? 'Benchmark Satisfied' : 'Remediation Required'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended iGOT Karmayogi Modules */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 shadow-2xs space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#ea8b21]" />
                  <span>Assigned iGOT Karmayogi Coaching Directives for Squad</span>
                </h4>

                <div className="space-y-3">
                  <div className="p-3.5 bg-[#faf5ec] border border-[#ebdcc8] rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-950">ASUSE 2026: Enterprise Balance Sheet Verification</div>
                      <div className="text-xs text-slate-800 font-semibold">Covers GVA calculations, gross receipts, and intermediate input reconciliations.</div>
                    </div>
                    <span className="text-xs font-bold text-[#ea8b21] bg-white px-2.5 py-1 rounded-lg border border-[#ebdcc8]">
                      iGOT-ASUSE-04
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#faf5ec] border border-[#ebdcc8] rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-950">NSSO Sampling & Non-Response Protocols (PLFS 2026)</div>
                      <div className="text-xs text-slate-800 font-semibold">Standard procedures for household substitution, lockouts, and reluctant informants.</div>
                    </div>
                    <span className="text-xs font-bold text-[#ea8b21] bg-white px-2.5 py-1 rounded-lg border border-[#ebdcc8]">
                      iGOT-PLFS-02
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              TAB 5: SCRUTINY DIRECTIVES & COMPLIANCE AUDIT
              =================================================================== */}
          {activeTab === 'compliance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 sm:p-6 shadow-2xs space-y-2">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#ea8b21]" />
                  <span>MoSPI Statutory Scrutiny & Operational Directives</span>
                </h3>
                <p className="text-xs text-slate-800 font-semibold">
                  Collection of Statistics Act statutory duties for Senior Statistical Officers and Field Cadre Supervisors.
                </p>
              </div>

              {/* Statutory Checklist Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Mandatory 10% Scrutiny Audit</span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    Supervisors are statutorily required to spot-verify at least 10% of total schedules completed by each Field Investigator before final submission to NSSO Data Processing Division (DPD).
                  </p>
                  <div className="text-xs font-mono font-bold text-slate-800 bg-[#faf5ec] p-2.5 rounded-xl border border-[#ebdcc8]">
                    Status: Verified for Current Survey Cycle
                  </div>
                </div>

                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Data Confidentiality & Legal Immunity</span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    Under Section 9 of the Collection of Statistics Act, individual informant records are strictly confidential and inadmissible as evidence in court or taxation proceedings.
                  </p>
                  <div className="text-xs font-mono font-bold text-slate-800 bg-[#faf5ec] p-2.5 rounded-xl border border-[#ebdcc8]">
                    Protocol: MoSPI Encryption Key Enforced
                  </div>
                </div>
              </div>

              {/* Roll-Call Audit Log */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 shadow-2xs space-y-3">
                <h4 className="text-sm font-black text-slate-900">Daily Supervisory Roll-Call Audit Trail</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 bg-[#faf5ec] rounded-xl border border-[#ebdcc8] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-950">{currentSquad.squadName}</span>
                      <span className="text-slate-700 font-bold ml-2">({currentSquad.supervisorBadge})</span>
                    </div>
                    <span className="font-bold text-emerald-800">
                      {currentSquad.submittedAt || 'Pending Today'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* Change Password Modal (Identical to User Workspace) */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebdcc8] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc8]/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ea8b21]/10 text-[#ea8b21] flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Change Supervisor Password</h3>
                  <p className="text-xs text-slate-700 font-semibold">Encrypted Credential Update in Neon</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePassError('');
                  setChangePassSuccess('');
                }}
                className="p-1.5 hover:bg-[#faf5ec] rounded-xl text-slate-700 hover:text-slate-950 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {changePassError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-bold">{changePassError}</span>
              </div>
            )}

            {changePassSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{changePassSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-950 block mb-1">Current Password</label>
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
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-950 placeholder:text-slate-500 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-950 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-950 block mb-1">New Password (min. 6 characters)</label>
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
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-950 placeholder:text-slate-500 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-950 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-950 block mb-1">Confirm New Password</label>
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
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#faf5ec]/40 border border-[#ebdcc8] rounded-xl text-xs text-slate-950 placeholder:text-slate-500 focus:outline-[#ea8b21] focus:border-[#ea8b21] focus:bg-white transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-950 cursor-pointer"
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
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
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
                    <span>Update Password</span>
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
