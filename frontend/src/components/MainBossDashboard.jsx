import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Award, TrendingUp, AlertTriangle, CheckCircle2, Clock, 
  Trash2, Eye, ArrowLeft, ArrowRight, RefreshCw, Check, 
  ChevronRight, X, ShieldCheck, LogOut, LayoutDashboard, UserCheck2,
  BarChart3, Database, Menu, ShieldAlert, Sparkles, Shield,
  Key, EyeOff
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? "http://127.0.0.1:8000/api"
    : (typeof window !== 'undefined' && window.location.hostname.endsWith('onrender.com') ? "/api" : "https://sankhyasetu-ai.onrender.com/api")
);

// Prototype Supervisors Data across the 3 Fields
const INITIAL_SUPERVISORS = [
  {
    squadId: 'squad_asuse_delhi',
    squadName: 'Delhi North Cadre Unit #04',
    fieldId: 'survey_supervisor_asuse',
    fieldName: 'ASUSE (Enterprise Statistics)',
    supervisorName: 'Rajesh Kumar',
    supervisorCadre: 'Senior Statistical Officer (SSO)',
    supervisorEmail: 'rajesh.supervisor@mospi.gov.in',
    supervisorBadge: 'SSO-DEL-101',
    submissionStatus: 'submitted',
    submittedAt: 'Today, 5:02 PM',
    officerCount: 3,
    activeCount: 2,
    deactivatedCount: 1,
    avgScore: 75.0,
    officers: [
      { id: 'FI-2024-102', name: 'Amit Sharma', cadre: 'Field Investigator', score: 88, status: 'active', email: 'amit.sharma@mospi.gov.in' },
      { id: 'JSO-2023-088', name: 'Priya Verma', cadre: 'Junior Statistical Officer', score: 62, status: 'low_score', email: 'priya.verma@mospi.gov.in' },
      { id: 'FI-2022-019', name: 'Rahul Deshmukh', cadre: 'Field Investigator', score: 0, status: 'deactivated', email: 'rahul.deshmukh@mospi.gov.in' }
    ]
  },
  {
    squadId: 'squad_plfs_varanasi',
    squadName: 'Varanasi Cantt Unit #08',
    fieldId: 'field_investigator_nsso',
    fieldName: 'PLFS (Labour Force Survey)',
    supervisorName: 'Sunita Devi',
    supervisorCadre: 'Senior Statistical Officer (SSO)',
    supervisorEmail: 'sunita.supervisor@mospi.gov.in',
    supervisorBadge: 'SSO-VNS-108',
    submissionStatus: 'submitted',
    submittedAt: 'Today, 4:45 PM',
    officerCount: 3,
    activeCount: 3,
    deactivatedCount: 0,
    avgScore: 82.0,
    officers: [
      { id: 'FI-2024-210', name: 'Vikram Malhotra', cadre: 'Field Investigator', score: 84, status: 'active', email: 'vikram.m@mospi.gov.in' },
      { id: 'JSO-2024-215', name: 'Pooja Nair', cadre: 'Junior Statistical Officer', score: 79, status: 'active', email: 'pooja.n@mospi.gov.in' },
      { id: 'FI-2023-198', name: 'Manoj Tiwari', cadre: 'Field Investigator', score: 83, status: 'active', email: 'manoj.t@mospi.gov.in' }
    ]
  },
  {
    squadId: 'squad_household_bengaluru',
    squadName: 'Bengaluru South Unit #12',
    fieldId: 'junior_statistical_officer_cso',
    fieldName: 'HCES / Economic Statistics (CSO)',
    supervisorName: 'Anil Mehta',
    supervisorCadre: 'Senior Statistical Officer (SSO)',
    supervisorEmail: 'anil.supervisor@mospi.gov.in',
    supervisorBadge: 'SSO-BLR-114',
    submissionStatus: 'pending',
    submittedAt: null,
    officerCount: 3,
    activeCount: 2,
    deactivatedCount: 0,
    avgScore: 62.3,
    officers: [
      { id: 'FI-2024-301', name: 'Suresh Patel', cadre: 'Field Investigator', score: 72, status: 'active', email: 'suresh.p@mospi.gov.in' },
      { id: 'JSO-2024-312', name: 'Neha Gupta', cadre: 'Junior Statistical Officer', score: 70, status: 'active', email: 'neha.g@mospi.gov.in' },
      { id: 'FI-2023-329', name: 'Deepak Rawat', cadre: 'Field Investigator', score: 45, status: 'low_score', email: 'deepak.r@mospi.gov.in' }
    ]
  }
];

export default function MainBossDashboard({ onLogout, activeBoss }) {
  const [supervisors, setSupervisors] = useState(INITIAL_SUPERVISORS);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [viewSquad, setViewSquad] = useState(null);
  const [purgeTarget, setPurgeTarget] = useState(null);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Live Directorate Cadre Approvals State
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
      const res = await fetch(`${API_BASE}/db/cadre/pending-approvals?role=all`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingApprovals(data.approvals || []);
      }
    } catch (e) {
      console.error("Error fetching boss pending approvals:", e);
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await fetch(`${API_BASE}/db/supervisors`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.supervisors)) {
        // Base prototype squads
        const baseSquads = INITIAL_SUPERVISORS.map(s => ({ ...s }));

        const prototypeEmails = new Set([
          'supervisor1@gmail.com', 'rajesh.supervisor@mospi.gov.in',
          'supervisor2@gmail.com', 'sunita.supervisor@mospi.gov.in',
          'supervisor3@gmail.com', 'anil.supervisor@mospi.gov.in'
        ]);

        const fieldNameMap = {
          survey_supervisor_asuse: 'ASUSE (Enterprise Statistics)',
          field_investigator_nsso: 'PLFS (Labour Force Survey)',
          junior_statistical_officer_cso: 'HCES / Economic Statistics (CSO)',
          statistical_officer_cso: 'HCES / Economic Statistics (CSO)'
        };

        const additionalSquads = [];
        const activeDbSupervisors = data.supervisors.filter(s => s.status === 'active');

        activeDbSupervisors.forEach(dbSup => {
          const emailLower = (dbSup.email || '').toLowerCase().trim();
          if (!prototypeEmails.has(emailLower)) {
            if (!additionalSquads.some(s => s.supervisorEmail.toLowerCase() === emailLower)) {
              const squadId = `squad_${dbSup.field_id || 'unit'}_${dbSup.id}`;
              const fieldName = fieldNameMap[dbSup.field_id] || 'ASUSE (Enterprise Statistics)';
              
              const defaultOfficers = [
                {
                  id: `FI-${dbSup.id}-01`,
                  name: 'Pawan Kumar',
                  cadre: 'Field Investigator',
                  score: 84,
                  status: 'active',
                  email: `pawan.${dbSup.id}@mospi.gov.in`
                },
                {
                  id: `JSO-${dbSup.id}-02`,
                  name: 'Meera Sen',
                  cadre: 'Junior Statistical Officer',
                  score: 79,
                  status: 'active',
                  email: `meera.${dbSup.id}@mospi.gov.in`
                },
                {
                  id: `FI-${dbSup.id}-03`,
                  name: 'Kunal Shah',
                  cadre: 'Field Investigator',
                  score: 75,
                  status: 'active',
                  email: `kunal.${dbSup.id}@mospi.gov.in`
                }
              ];

              const squadName = (dbSup.department && dbSup.department !== 'Field Operations Division')
                ? dbSup.department
                : `${dbSup.name}'s Field Cadre Unit #${String(dbSup.id).padStart(2, '0')}`;

              additionalSquads.push({
                squadId: squadId,
                squadName: squadName,
                fieldId: dbSup.field_id || 'survey_supervisor_asuse',
                fieldName: fieldName,
                supervisorName: dbSup.name,
                supervisorCadre: dbSup.cadre_title || 'Senior Statistical Officer (SSO)',
                supervisorEmail: dbSup.email,
                supervisorBadge: dbSup.badge || `SSO-CADRE-${dbSup.id}`,
                submissionStatus: 'submitted',
                submittedAt: 'Today, 4:15 PM',
                officerCount: defaultOfficers.length,
                activeCount: defaultOfficers.filter(o => o.status === 'active').length,
                deactivatedCount: 0,
                avgScore: Math.round(defaultOfficers.reduce((acc, o) => acc + o.score, 0) / defaultOfficers.length),
                officers: defaultOfficers
              });
            }
          }
        });

        const combined = [...baseSquads, ...additionalSquads];

        // Maintain local state modifications (such as purged officers)
        setSupervisors(prev => {
          return combined.map(squad => {
            const prevSquad = prev.find(p => p.squadId === squad.squadId);
            if (!prevSquad) return squad;
            return {
              ...squad,
              officerCount: prevSquad.officerCount,
              activeCount: prevSquad.activeCount,
              deactivatedCount: prevSquad.deactivatedCount,
              avgScore: prevSquad.avgScore,
              officers: prevSquad.officers
            };
          });
        });
      }
    } catch (e) {
      console.error("Error fetching live supervisors:", e);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    fetchSupervisors();
    const interval = setInterval(() => {
      fetchPendingApprovals();
      fetchSupervisors();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveCadre = async (cadreEmail, cadreName, targetRole, action = 'approve') => {
    setApprovalActionLoading(prev => ({ ...prev, [cadreEmail]: true }));
    try {
      const res = await fetch(`${API_BASE}/db/cadre/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cadreEmail,
          target_role: targetRole,
          reviewer: activeBoss?.email || 'boss@gmail.com',
          action: action
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(action === 'approve' 
          ? `Cadre ${cadreName} (${cadreEmail}) authorized and activated by Directorate General!` 
          : `Registration request for ${cadreEmail} declined.`
        );
        fetchPendingApprovals();
        fetchSupervisors();
      } else {
        triggerToast(data.error || 'Failed to update authorization status.');
      }
    } catch (err) {
      triggerToast('Network error while updating cadre authorization.');
    } finally {
      setApprovalActionLoading(prev => ({ ...prev, [cadreEmail]: false }));
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
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

    const bossEmail = (activeBoss?.email || 'boss@gmail.com').trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE}/db/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bossEmail,
          current_password: trimmedCurrent,
          new_password: trimmedNew,
          cadre: 'boss'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setChangePassError(data.error || 'Failed to update Directorate password.');
        setIsSubmittingChangePass(false);
        return;
      }

      setChangePassSuccess(data.message || 'Directorate password successfully updated! You can now use your new password.');
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

  // Master Permanent Purge (Hard Delete)
  const handleExecutePurge = () => {
    if (purgeConfirmText !== 'PURGE') {
      alert('Please type PURGE in capital letters to confirm permanent deletion.');
      return;
    }

    if (!purgeTarget) return;

    // Remove the purged officer from the squad
    setSupervisors(prev => prev.map(s => {
      if (s.squadId === purgeTarget.squadId) {
        const remainingOfficers = s.officers.filter(o => o.id !== purgeTarget.officer.id);
        const newActive = remainingOfficers.filter(o => o.status === 'active').length;
        const newDeactivated = remainingOfficers.filter(o => o.status === 'deactivated').length;
        const newAvg = remainingOfficers.length > 0
          ? Math.round(remainingOfficers.reduce((acc, o) => acc + o.score, 0) / remainingOfficers.length)
          : 0;

        return {
          ...s,
          officerCount: remainingOfficers.length,
          activeCount: newActive,
          deactivatedCount: newDeactivated,
          avgScore: newAvg,
          officers: remainingOfficers
        };
      }
      return s;
    }));

    // If currently viewing the same squad, update the modal
    if (viewSquad && viewSquad.squadId === purgeTarget.squadId) {
      setViewSquad(prev => ({
        ...prev,
        officers: prev.officers.filter(o => o.id !== purgeTarget.officer.id)
      }));
    }

    triggerToast(`Officer ${purgeTarget.officer.name} (${purgeTarget.officer.id}) permanently purged from MoSPI database.`);
    setPurgeTarget(null);
    setPurgeConfirmText('');
  };

  // Macro KPIs calculation
  const totalSquads = supervisors.length;
  const submittedCount = supervisors.filter(s => s.submissionStatus === 'submitted').length;
  const totalOfficers = supervisors.reduce((acc, s) => acc + s.officerCount, 0);
  const totalActive = supervisors.reduce((acc, s) => acc + s.activeCount, 0);
  const nationalAvg = (
    supervisors.reduce((acc, s) => acc + s.avgScore, 0) / Math.max(1, supervisors.length)
  ).toFixed(1);

  const bossDisplayName = activeBoss?.name || "Dr. S. K. Mukherjee";
  const bossInitials = bossDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'DG';

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
                <p className="text-xs text-slate-900 font-semibold truncate">Directorate General HQ</p>
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
            
            {/* 1. Command Overview */}
            <button
              onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 shrink-0 ${activeTab === 'overview' ? 'text-white' : 'text-slate-800'}`} />
              <span className="tracking-tight truncate whitespace-nowrap">Command Hub</span>
            </button>

            {/* 2. Cadre Authorizations (Fixed Height, No Text Wrapping) */}
            <button
              onClick={() => { setActiveTab('authorizations'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'authorizations'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <UserCheck2 className={`w-5 h-5 shrink-0 ${activeTab === 'authorizations' ? 'text-white' : 'text-slate-800'}`} />
                <span className="tracking-tight truncate whitespace-nowrap">Cadre Authorizations</span>
              </div>
              {pendingApprovals.length > 0 && (
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  activeTab === 'authorizations' 
                    ? 'bg-white/25 text-white' 
                    : 'bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30'
                }`}>
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            {/* 3. Regional Cadre Units (Fixed Height, No Text Wrapping) */}
            <button
              onClick={() => { setActiveTab('regional'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'regional'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Building2 className={`w-5 h-5 shrink-0 ${activeTab === 'regional' ? 'text-white' : 'text-slate-800'}`} />
                <span className="tracking-tight truncate whitespace-nowrap">Regional Cadre Units</span>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'regional' 
                  ? 'bg-white/25 text-white' 
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {supervisors.length}
              </span>
            </button>

            {/* 4. National Analytics */}
            <button
              onClick={() => { setActiveTab('analytics'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <BarChart3 className={`w-5 h-5 shrink-0 ${activeTab === 'analytics' ? 'text-white' : 'text-slate-800'}`} />
              <span className="tracking-tight truncate whitespace-nowrap">National Analytics</span>
            </button>

            {/* 5. Master Database Purge & Audit */}
            <button
              onClick={() => { setActiveTab('purge'); setMobileSidebarOpen(false); }}
              className={`w-full h-11 px-3.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'purge'
                  ? 'bg-[#ea8b21] text-white shadow-md shadow-[#ea8b21]/30'
                  : 'text-slate-900 hover:text-slate-950 hover:bg-[#eee3d3]/80'
              }`}
            >
              <Database className={`w-5 h-5 shrink-0 ${activeTab === 'purge' ? 'text-white' : 'text-slate-800'}`} />
              <span className="tracking-tight truncate whitespace-nowrap">Database Purge & Audit</span>
            </button>

          </nav>

        </div>

        {/* Bottom of Sidebar: Directorate General Profile Card & Change Password */}
        <div className="p-3.5 m-2.5 rounded-2xl bg-white/90 border border-[#ebdcc8] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#ea8b21] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                {bossInitials}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{bossDisplayName}</p>
                <p className="text-xs font-bold text-[#ea8b21] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Deputy Director General
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out of Main Boss Command Hub"
              className="p-2 text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="px-2.5 py-1 bg-[#faf5ec] border border-[#ebdcc8] rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-800 font-bold">Cadre Badge:</span>
            <span className="font-mono font-bold text-[#ea8b21]">DDG-HQ-001</span>
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
              <span className="font-bold text-slate-900">MoSPI Directorate General</span>
              <span>/</span>
              <span className="capitalize font-bold text-[#ea8b21]">
                {activeTab === 'overview' ? 'Command Hub' : (
                  activeTab === 'authorizations' ? 'Cadre Authorizations' : (
                    activeTab === 'regional' ? 'Regional Cadre Units' : (
                      activeTab === 'analytics' ? 'National Analytics' : 'Database Purge & Audit'
                    )
                  )
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Neon PostgreSQL Connected
            </span>
            <span className="text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 bg-amber-50 text-amber-950 border border-amber-300 rounded-full font-mono shrink-0">
              Tier-2 Directorate
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-amber-300 text-amber-950 p-4 rounded-2xl shadow-xl flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs font-bold">{toastMessage}</div>
            </div>
          )}

          {/* ===================================================================
              TAB 1: COMMAND OVERVIEW (HUB)
              =================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Executive Authority Banner */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-slate-800 font-semibold mb-1">
                    <span>Executive Authority: <strong className="text-slate-950 font-bold">{bossDisplayName}</strong></span>
                    <span>•</span>
                    <span>Designation: <span className="text-[#ea8b21] font-bold">Deputy Director General (DDG)</span></span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    All-India Statistical Cadre Command Hub
                  </h2>
                  <p className="text-xs text-slate-800 mt-1 max-w-2xl font-semibold leading-relaxed">
                    Central Ministry oversight across all 3 survey divisions (ASUSE Enterprise, PLFS Labour Force, and Household Consumer Expenditure). Real-time roll-call compliance tracking, supervisor accountability, and master purge rights.
                  </p>
                </div>

                <div className="shrink-0 bg-[#faf5ec] p-3.5 rounded-2xl border border-[#ebdcc8] flex items-center space-x-3 shadow-2xs">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                  <div className="text-xs">
                    <div className="font-black text-slate-950">Level 4 Audit Security Active</div>
                    <div className="text-slate-800 font-bold">Centralized Database Connection</div>
                  </div>
                </div>
              </div>

              {/* Pending Authorizations Banner (if any) */}
              {pendingApprovals.length > 0 && (
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold shrink-0">
                      <Clock className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-950">
                        {pendingApprovals.length} Directorate Cadre Authorization{pendingApprovals.length > 1 ? 's' : ''} Pending
                      </h4>
                      <p className="text-xs text-amber-900 font-semibold">
                        Newly registered supervisors and field investigators require executive credential review.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('authorizations')}
                    className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Review Authorizations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Ministry Macro KPI Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>Daily Squad Submissions</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {submittedCount} <span className="text-sm font-bold text-slate-800">/ {totalSquads} Submitted</span>
                  </div>
                  <div className="text-xs text-emerald-800 font-bold mt-2">
                    {submittedCount === totalSquads ? '100% On-Time Reporting' : `${totalSquads - submittedCount} Squad Awaiting Roll-Call`}
                  </div>
                </div>

                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>Active Field Force</span>
                    <Users className="w-4 h-4 text-[#ea8b21]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {totalActive} <span className="text-sm font-bold text-slate-800">/ {totalOfficers} Officers</span>
                  </div>
                  <div className="text-xs text-slate-800 font-bold mt-2">
                    Across 3 Regional Cadre Units
                  </div>
                </div>

                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>National Competency Index</span>
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {nationalAvg}% <span className="text-sm font-bold text-slate-800">Average</span>
                  </div>
                  <div className="text-xs text-slate-800 font-bold mt-2">
                    Ministry Benchmark: 70.0%
                  </div>
                </div>

                <div className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>Supervisors on Duty</span>
                    <Award className="w-4 h-4 text-[#ea8b21]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {totalSquads} <span className="text-sm font-bold text-slate-800">Senior Officers</span>
                  </div>
                  <div className="text-xs text-slate-800 font-bold mt-2">
                    ASUSE, PLFS, & Household
                  </div>
                </div>
              </div>

              {/* Division Overview Cards */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebdcc8] pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Survey Divisions Status Summary</h3>
                    <p className="text-xs text-slate-800 font-semibold">Real-time roll-call compliance across regional statistical squads.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('regional')}
                    className="self-start sm:self-auto text-xs font-bold text-[#ea8b21] hover:text-[#d97d16] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Regional Table</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {supervisors.map(sup => (
                    <div key={sup.squadId} className="p-4 rounded-xl bg-[#faf5ec]/50 border border-[#ebdcc8] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-950">{sup.squadName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sup.submissionStatus === 'submitted' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-950 border border-amber-300'
                        }`}>
                          {sup.submissionStatus === 'submitted' ? 'Submitted' : 'Pending Roll-Call'}
                        </span>
                      </div>
                      <div className="text-xs text-[#ea8b21] font-bold">{sup.fieldName}</div>
                      <div className="text-xs text-slate-800 font-bold">Supervisor: {sup.supervisorName}</div>
                      <div className="pt-2 border-t border-[#ebdcc8]/60 flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-semibold">{sup.activeCount}/{sup.officerCount} Active</span>
                        <span className="font-mono font-black text-slate-950">{sup.avgScore}% avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              TAB 2: CADRE AUTHORIZATIONS (SUPERVISORS & OFFICERS)
              =================================================================== */}
          {activeTab === 'authorizations' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#ebdcc8] shadow-2xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <UserCheck2 className="w-5 h-5 text-[#ea8b21]" />
                    <span>Directorate Cadre Authorizations</span>
                    {pendingApprovals.length > 0 && (
                      <span className="text-xs px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold">
                        {pendingApprovals.length} Pending
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-800 font-semibold mt-0.5">
                    High-level executive credential review. Authorize newly registered supervisors and field investigators to enable platform access.
                  </p>
                </div>

                <button
                  onClick={() => { fetchPendingApprovals(); fetchSupervisors(); }}
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
                  <h4 className="text-base font-black text-slate-900">All Cadre Registrations Authorized</h4>
                  <p className="text-xs text-slate-800 max-w-md mx-auto font-semibold">
                    There are no pending supervisor or officer registration requests in the central MoSPI queue.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingApprovals.map((req) => (
                    <div key={req.id || req.email} className="bg-white border border-amber-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-950">{req.name}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            req.target_role === 'supervisor' 
                              ? 'bg-purple-100 text-purple-950 border border-purple-300' 
                              : 'bg-amber-100 text-amber-950 border border-amber-300'
                          }`}>
                            {req.target_role === 'supervisor' ? 'Supervisor Cadre' : 'Field Officer'}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-[#ea8b21] font-bold">{req.email}</div>
                        <div className="text-xs text-slate-800 font-bold">
                          {req.role_name} • {req.department}
                        </div>
                        {req.requested_at && (
                          <div className="text-xs text-slate-700 font-medium">
                            Requested: {new Date(req.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(req.requested_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          disabled={approvalActionLoading[req.email]}
                          onClick={() => handleApproveCadre(req.email, req.name, req.target_role, 'approve')}
                          className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Authorize</span>
                        </button>
                        <button
                          type="button"
                          disabled={approvalActionLoading[req.email]}
                          onClick={() => handleApproveCadre(req.email, req.name, req.target_role, 'reject')}
                          className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-800 border border-slate-300 hover:border-rose-300 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
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
              TAB 3: REGIONAL CADRE UNITS (NO REMIND/EMAIL BUTTONS)
              =================================================================== */}
          {activeTab === 'regional' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ea8b21]" />
                    <span>Regional Field Supervisors & Cadre Status</span>
                  </h3>
                  <p className="text-xs text-slate-800 font-semibold">
                    Track daily roll-call compliance, inspect squads, and exercise master purge rights.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <button
                    onClick={fetchSupervisors}
                    className="text-xs font-bold px-3 py-1.5 bg-[#faf5ec] hover:bg-[#ebdcc8]/50 text-slate-900 border border-[#ebdcc8] rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Refresh Live Regional Squads"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#ea8b21]" />
                    <span>Refresh Squads</span>
                  </button>
                  <div className="text-xs font-bold text-amber-950 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-300">
                    MoSPI Directorate Executive Authority
                  </div>
                </div>
              </div>

              {/* Table (NO Remind / Email buttons) */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-900">
                    <thead className="bg-[#faf5ec] uppercase text-xs text-slate-900 font-bold tracking-wider border-b border-[#ebdcc8]">
                      <tr>
                        <th scope="col" className="py-3 px-4 font-black">Squad Unit & Survey Field</th>
                        <th scope="col" className="py-3 px-4 font-black">Supervisor in Charge</th>
                        <th scope="col" className="py-3 px-4 font-black">Daily Compliance Status</th>
                        <th scope="col" className="py-3 px-4 font-black">Officers Active / Total</th>
                        <th scope="col" className="py-3 px-4 font-black">Avg Score</th>
                        <th scope="col" className="py-3 px-4 font-black text-right">Director Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebdcc8]/70">
                      {supervisors.map((sup) => (
                        <tr key={sup.squadId} className="hover:bg-[#faf5ec]/50 transition">
                          {/* Squad Details */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-950 text-sm">
                              {sup.squadName}
                            </div>
                            <div className="text-[#ea8b21] font-bold text-xs mt-0.5">
                              {sup.fieldName}
                            </div>
                            <div className="text-slate-800 text-xs font-mono font-semibold mt-0.5">
                              ID: {sup.squadId}
                            </div>
                          </td>

                          {/* Supervisor */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-950">
                              {sup.supervisorName}
                            </div>
                            <div className="text-slate-800 text-xs font-semibold">
                              {sup.supervisorCadre}
                            </div>
                            <div className="text-slate-700 font-mono text-xs font-semibold mt-0.5 select-all">
                              {sup.supervisorEmail}
                            </div>
                          </td>

                          {/* Daily Compliance Status */}
                          <td className="py-4 px-4">
                            {sup.submissionStatus === 'submitted' ? (
                              <div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                                  Submitted Today
                                </span>
                                <div className="text-xs text-slate-800 font-bold mt-1">
                                  Logged at {sup.submittedAt}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 animate-pulse">
                                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-700" />
                                  Pending Submission
                                </span>
                                <div className="text-xs text-amber-900 font-black mt-1">
                                  Awaiting daily roll-call
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Officer Counts */}
                          <td className="py-4 px-4">
                            <div className="font-mono font-black text-slate-950">
                              {sup.activeCount} Active / {sup.officerCount} Total
                            </div>
                            {sup.deactivatedCount > 0 && (
                              <div className="text-xs text-rose-800 font-black mt-0.5">
                                {sup.deactivatedCount} Relieved / Deactivated
                              </div>
                            )}
                          </td>

                          {/* Average Score */}
                          <td className="py-4 px-4">
                            <span className={`text-base font-black font-mono ${
                              sup.avgScore >= 70 ? 'text-emerald-800' : 'text-amber-800'
                            }`}>
                              {sup.avgScore}%
                            </span>
                          </td>

                          {/* Action (View Squad only - NO Email/Remind button) */}
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => setViewSquad(sup)}
                              className="inline-flex items-center text-xs font-bold px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-[#ebdcc8] shadow-2xs transition cursor-pointer"
                              title="Inspect Squad Officers & Details"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5 text-[#ea8b21]" />
                              Inspect Squad
                            </button>
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
              TAB 4: NATIONAL ANALYTICS
              =================================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 sm:p-6 shadow-2xs space-y-2">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#ea8b21]" />
                  <span>National Statistical Competency Benchmarks</span>
                </h3>
                <p className="text-xs text-slate-800 font-semibold">
                  Aggregated readiness metrics across the 3 core survey divisions under the Ministry of Statistics and Programme Implementation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supervisors.map(sup => (
                  <div key={sup.squadId} className="bg-white border border-[#ebdcc8] p-5 rounded-2xl shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ea8b21]">{sup.fieldName.split('(')[0]}</span>
                      <span className="text-xs font-mono font-bold bg-slate-200 text-slate-900 px-2 py-0.5 rounded">{sup.squadId}</span>
                    </div>
                    <h4 className="text-base font-black text-slate-900">{sup.squadName}</h4>
                    
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-800 font-semibold">Competency Index:</span>
                        <span className="font-mono font-black text-slate-950">{sup.avgScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${sup.avgScore >= 70 ? 'bg-emerald-600' : 'bg-amber-600'}`}
                          style={{ width: `${sup.avgScore}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between pt-1">
                        <span className="text-slate-800 font-semibold">Active Deployment:</span>
                        <span className="font-bold text-slate-950">{sup.activeCount} of {sup.officerCount} Officers</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-800 font-semibold">Cadre Relieved:</span>
                        <span className={`font-black ${sup.deactivatedCount > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                          {sup.deactivatedCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ministry Standard Summary */}
              <div className="bg-[#faf5ec] rounded-2xl border border-[#ebdcc8] p-4 text-xs text-slate-900 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-[#ea8b21] shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-slate-950">National Statistical Benchmark Standards:</span>
                  <p className="mt-0.5 leading-relaxed font-semibold text-slate-800">
                    The Directorate General requires a minimum unit index of 70% before survey schedules are certified for National Accounts GDP compilation. Units falling below threshold receive targeted iGOT Karmayogi intervention.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              TAB 5: DATABASE PURGE & MASTER AUDIT
              =================================================================== */}
          {activeTab === 'purge' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 sm:p-6 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#ea8b21]" />
                    <span>Master Database Purge & Hard Deletion Tool</span>
                  </h3>
                  <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl">
                    DDG Level 4 Clearance Required
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-semibold">
                  Unlike field supervisor soft-deactivation, a Master Permanent Purge hard-deletes records from Neon Cloud PostgreSQL. All test records, historical audit logs, and digital IDs are irrecoverably removed.
                </p>
              </div>

              {/* Roster of Officers across all units eligible for review / purge */}
              <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 shadow-2xs space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Cadre Officers Eligible for Master Purge Review</span>
                </h4>

                <div className="divide-y divide-[#ebdcc8] border border-[#ebdcc8] rounded-xl overflow-hidden bg-[#faf5ec]/30 text-xs">
                  {supervisors.flatMap(s => s.officers.map(o => ({ ...o, squadId: s.squadId, squadName: s.squadName }))).map((officer) => (
                    <div key={officer.id} className="p-3.5 flex items-center justify-between hover:bg-white transition">
                      <div>
                        <div className="font-bold text-slate-950 flex items-center gap-2">
                          <span>{officer.name}</span>
                          <span className="font-mono text-slate-800 font-bold">({officer.id})</span>
                          {officer.status === 'deactivated' && (
                            <span className="text-[10px] bg-rose-100 text-rose-900 border border-rose-300 px-1.5 rounded font-bold">
                              Deactivated
                            </span>
                          )}
                        </div>
                        <div className="text-slate-800 text-xs font-semibold mt-0.5">
                          {officer.cadre} • {officer.squadName} • <span className="font-mono font-bold text-slate-900">{officer.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`font-mono font-black ${officer.score >= 70 ? 'text-emerald-800' : 'text-amber-800'}`}>
                            {officer.score}%
                          </span>
                        </div>
                        <button
                          onClick={() => setPurgeTarget({ squadId: officer.squadId, officer })}
                          className="p-2 text-rose-800 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl border border-rose-200 transition cursor-pointer shadow-2xs"
                          title="Purge permanently from database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                  <h3 className="text-base font-black text-slate-900">Change Directorate Password</h3>
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

      {/* Point 3: View Squad Modal Drawer (NO Email buttons) */}
      {viewSquad && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebdcc8] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#ebdcc8] pb-3">
              <div>
                <span className="text-xs font-bold text-[#ea8b21]">{viewSquad.fieldName}</span>
                <h3 className="font-black text-slate-900 text-lg">{viewSquad.squadName}</h3>
                <div className="text-xs text-slate-800 mt-0.5 font-bold">
                  Supervisor: <strong className="text-slate-950 font-bold">{viewSquad.supervisorName}</strong> ({viewSquad.supervisorCadre})
                </div>
              </div>
              <button 
                onClick={() => setViewSquad(null)}
                className="text-slate-700 hover:text-slate-950 text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                Squad Officers Roster ({viewSquad.officers.length})
              </div>

              <div className="divide-y divide-[#ebdcc8] border border-[#ebdcc8] rounded-2xl overflow-hidden bg-[#faf5ec]/40">
                {viewSquad.officers.map((officer) => (
                  <div key={officer.id} className="p-3.5 flex items-center justify-between hover:bg-white transition">
                    <div>
                      <div className="font-bold text-slate-950 flex items-center">
                        {officer.name}
                        {officer.status === 'deactivated' && (
                          <span className="ml-2 text-[10px] bg-rose-100 text-rose-900 border border-rose-300 px-1.5 rounded font-bold">
                            Deactivated
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-800 font-semibold">
                        {officer.id} • {officer.cadre} • <span className="font-mono text-xs text-slate-900 font-bold">{officer.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`font-mono font-black text-sm ${
                          officer.score >= 70 ? 'text-emerald-800' : (officer.score > 0 ? 'text-amber-800' : 'text-slate-600')
                        }`}>
                          {officer.score}%
                        </div>
                        <div className="text-xs text-slate-800 uppercase font-black">
                          {officer.status}
                        </div>
                      </div>

                      {/* Master Permanent Purge Button */}
                      <button
                        onClick={() => setPurgeTarget({ squadId: viewSquad.squadId, officer })}
                        className="p-2 text-rose-800 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl border border-rose-200 transition cursor-pointer shadow-2xs"
                        title="Master Permanent Purge from Database (Hard Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-900 bg-[#faf5ec] p-3.5 rounded-2xl border border-[#ebdcc8]">
              <span className="font-black text-slate-950">HQ Authority Note:</span>
              <p className="mt-0.5 leading-relaxed font-semibold text-slate-800">
                The trash icon triggers a <strong>Master Permanent Purge</strong>. Unlike lower-tier deactivation, this completely erases records from the central database. Use only for fraudulent or test entries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Point 5 Confirmation Modal: Master Permanent Purge */}
      {purgeTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-800 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-black text-slate-950 text-base">Authorize Master Purge</h3>
                <div className="text-xs text-rose-850 font-black">Permanent Database Deletion</div>
              </div>
            </div>

            <div className="text-xs text-slate-800 space-y-2">
              <p className="font-semibold text-slate-900">
                You are about to permanently delete officer <strong className="text-slate-950 font-black">{purgeTarget.officer.name}</strong> (<span className="font-mono font-black text-[#ea8b21]">{purgeTarget.officer.id}</span>) from the central MoSPI database.
              </p>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-300 text-rose-950 leading-relaxed font-bold">
                ⚠️ <strong>WARNING:</strong> This action cannot be undone. All test attempts, audit logs, and digital IDs associated with this account will be erased from Neon Cloud PostgreSQL.
              </div>
              <p className="text-slate-900 font-bold pt-1">
                Type <strong>PURGE</strong> in capital letters to confirm authorization:
              </p>
              <input
                type="text"
                value={purgeConfirmText}
                onChange={(e) => setPurgeConfirmText(e.target.value)}
                placeholder="Type PURGE"
                className="w-full bg-[#faf5ec] border border-[#ebdcc8] text-slate-950 font-mono px-3 py-2.5 rounded-xl text-sm focus:outline-rose-500 font-black"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setPurgeTarget(null);
                  setPurgeConfirmText('');
                }}
                className="text-xs font-bold text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePurge}
                disabled={purgeConfirmText !== 'PURGE'}
                className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition shadow-md shadow-rose-600/20 flex items-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Confirm Permanent Purge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
