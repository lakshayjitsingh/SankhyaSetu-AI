import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, UserX, UserCheck, Send, CheckCircle2, Clock, 
  AlertTriangle, Shield, ArrowRight, ArrowLeft, RefreshCw, Copy, Check,
  ChevronDown, Award, TrendingUp, Info, ShieldCheck, LogOut
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
    supervisorEmail: 'rajesh.supervisor@mospi.gov.in',
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
    supervisorEmail: 'sunita.supervisor@mospi.gov.in',
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
    supervisorEmail: 'anil.supervisor@mospi.gov.in',
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
  const [emailModalOfficer, setEmailModalOfficer] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Cadre Registration Approvals State
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [approvalActionLoading, setApprovalActionLoading] = useState({});

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

  // Point 7: Direct Instant Deactivate on the row
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
      triggerToast(`Officer ${target.name} (${target.id}) has been relieved and deactivated. Login access suspended.`);
    } else if (target) {
      triggerToast(`Officer ${target.name} (${target.id}) account restored to active status.`);
    }
  };

  // Point 8 (Option B): Submit Squad Status to HQ
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

  // Calculate high-level squad metrics
  const activeCount = currentSquad.officers.filter(o => !o.isDeactivated && o.status === 'active').length;
  const flaggedCount = currentSquad.officers.filter(o => !o.isDeactivated && (o.status === 'low_score' || o.status === 'inactive')).length;
  const avgScore = Math.round(
    currentSquad.officers
      .filter(o => !o.isDeactivated)
      .reduce((acc, o) => acc + o.score, 0) / Math.max(1, currentSquad.officers.filter(o => !o.isDeactivated).length)
  );

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-slate-900 font-sans pb-16">
      
      {/* Top Header - Karmayogi Bharat Branding (Matching Main Website) */}
      <header className="sticky top-0 z-40 bg-[#faf5ec] border-b border-[#ebdcc8] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Karmayogi Emblem Chakra Motif */}
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
                  Sankhya<span className="text-[#ea8b21]">Setu</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30 rounded">
                  MoSPI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                  Tier-1 Supervisor Console
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-semibold">Field Operations Division • Cadre Management</p>
            </div>
          </div>

          {/* Navigation Switchers in Main Site Button Style */}
          {/* Supervisor Identity & Sign Out Button */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">{currentSquad.supervisor}</div>
              <div className="text-[10px] font-mono text-[#ea8b21] font-bold">{currentSquad.supervisorBadge}</div>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center text-xs font-bold px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-[#ebdcc8] hover:border-rose-200 shadow-2xs transition cursor-pointer"
              title="Sign Out of Supervisor Console"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-emerald-300 text-emerald-900 p-4 rounded-2xl shadow-xl flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs font-bold">{toastMessage}</div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Pending Officer Registration Approvals Alert */}
        {pendingApprovals.length > 0 && (
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                    <span>Field Officer Registrations Awaiting Your Activation</span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full font-bold">
                      {pendingApprovals.length} Pending
                    </span>
                  </h3>
                  <p className="text-xs text-amber-800">
                    New officers who have registered must be approved by a Supervisor before they can access the field deployment console.
                  </p>
                </div>
              </div>
              <button
                onClick={fetchPendingApprovals}
                disabled={isLoadingApprovals}
                className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApprovals ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {pendingApprovals.map((req) => (
                <div key={req.id || req.email} className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{req.name}</span>
                      <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold uppercase">
                        Pending Activation
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#ea8b21] font-bold">{req.email}</div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {req.role_name} • {req.department}
                    </div>
                    {req.requested_at && (
                      <div className="text-[10px] text-slate-500 font-medium">
                        Registered: {new Date(req.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(req.requested_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={approvalActionLoading[req.email]}
                      onClick={() => handleApproveOfficer(req.email, req.name, 'approve')}
                      className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Activate</span>
                    </button>
                    <button
                      type="button"
                      disabled={approvalActionLoading[req.email]}
                      onClick={() => handleApproveOfficer(req.email, req.name, 'reject')}
                      className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supervisor Identity Banner & Option B Submission */}
        <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-600 mb-1">
              <span>Cadre Supervisor: <strong className="text-slate-900 font-bold">{currentSquad.supervisor}</strong></span>
              <span>•</span>
              <span>Badge: <span className="font-mono font-bold text-[#ea8b21]">{currentSquad.supervisorBadge}</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentSquad.squadName}
              </h2>
              {/* Field Switcher Dropdown (ASUSE, PLFS, Household) */}
              <div className="relative inline-block">
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="appearance-none bg-[#faf5ec] hover:bg-white text-slate-900 text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-[#ebdcc8] cursor-pointer focus:outline-[#ea8b21] transition shadow-2xs"
                >
                  <option value="survey_supervisor_asuse">Field: ASUSE Enterprise</option>
                  <option value="field_investigator_nsso">Field: PLFS Labour Force</option>
                  <option value="junior_statistical_officer_cso">Field: HCES Household Survey</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
              Official supervisory authority over field officers, daily survey attendance, accuracy scrutiny, and direct administrative offboarding.
            </p>
          </div>

          {/* Point 8 (Option B): Submit Squad Status Button */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">HQ Submission Status</div>
              <div className="text-xs font-bold mt-0.5">
                {currentSquad.status === 'submitted' ? (
                  <span className="text-emerald-700 flex items-center justify-end font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Submitted ({currentSquad.submittedAt})
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center justify-end font-bold">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" /> Pending Daily Roll-Call
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmitSquadStatus}
              disabled={isSubmitting}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition shadow-md cursor-pointer ${
                currentSquad.status === 'submitted'
                  ? 'bg-[#faf5ec] hover:bg-white text-slate-800 border border-[#ebdcc8]'
                  : 'bg-[#ea8b21] hover:bg-[#d97d16] text-white shadow-[#ea8b21]/20'
              }`}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Syncing...' : (currentSquad.status === 'submitted' ? 'Re-Submit Squad Status to HQ' : 'Submit Squad Status to HQ')}
            </button>
          </div>
        </div>

        {/* Squad Health KPI Cards in Warm Karmayogi Style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#ebdcc8] p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Squad Attendance (3 Officers)</span>
              <Users className="w-4 h-4 text-[#ea8b21]" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {activeCount} <span className="text-sm font-bold text-slate-500">/ 3 On Active Duty</span>
            </div>
            <div className="text-xs text-emerald-700 font-bold mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
              Real-time MoSPI field telemetry
            </div>
          </div>

          <div className="bg-white border border-[#ebdcc8] p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Squad Competency Average</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {avgScore}% <span className="text-sm font-bold text-slate-500">Readiness</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">
              Ministry Passing Threshold: <strong className="text-slate-900 font-bold">70.0%</strong>
            </div>
          </div>

          <div className="bg-white border border-[#ebdcc8] p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Attention Required</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700">
              {flaggedCount} <span className="text-sm font-bold text-slate-500">{flaggedCount === 1 ? 'Officer Flagged' : 'Officers Flagged'}</span>
            </div>
            <div className="text-xs text-amber-800 font-medium mt-1">
              Automated low-score & inactivity checks
            </div>
          </div>
        </div>

        {/* The 3 Officers Squad Monitoring Table */}
        <div className="bg-white rounded-2xl border border-[#ebdcc8] overflow-hidden shadow-2xs">
          <div className="p-5 bg-[#faf5ec] border-b border-[#ebdcc8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center">
                <Users className="w-4 h-4 mr-2 text-[#ea8b21]" />
                Assigned Squad Cadre Officers ({currentSquad.officers.length})
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Inspect scores, view automated status checks, email directly, or deactivate accounts.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-[#ebdcc8] self-start sm:self-auto shadow-2xs">
              Survey Domain: <strong className="text-[#ea8b21]">{currentSquad.fieldName.split('(')[0]}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-[#faf5ec]/80 uppercase text-[11px] text-slate-600 font-bold tracking-wider border-b border-[#ebdcc8]">
                <tr>
                  <th scope="col" className="py-3 px-4 font-bold">Officer & Cadre</th>
                  <th scope="col" className="py-3 px-4 font-bold">Status (Point 1)</th>
                  <th scope="col" className="py-3 px-4 font-bold">Score & Progress (Point 2)</th>
                  <th scope="col" className="py-3 px-4 font-bold">Automated Verification (Point 3)</th>
                  <th scope="col" className="py-3 px-4 font-bold">Direct Email (Point 5)</th>
                  <th scope="col" className="py-3 px-4 font-bold text-right">Account Control (Point 7)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdcc8]/70">
                {currentSquad.officers.map((officer) => (
                  <tr 
                    key={officer.id}
                    className={`transition ${officer.isDeactivated ? 'bg-slate-50 opacity-60' : 'hover:bg-[#faf5ec]/50'}`}
                  >
                    {/* Officer Identity */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center">
                        {officer.name}
                        {officer.isDeactivated && (
                          <span className="ml-2 text-[10px] bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.2 rounded font-bold">
                            Deactivated
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px] font-medium mt-0.5">
                        ID: <span className="font-mono font-bold text-slate-700">{officer.id}</span> • {officer.cadre}
                      </div>
                      <div className="text-slate-600 text-[11px] font-semibold mt-0.5">
                        {officer.domain}
                      </div>
                    </td>

                    {/* Point 1: Status Badges */}
                    <td className="py-4 px-4">
                      {officer.isDeactivated ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
                          ⚪ Relieved / Inactive
                        </span>
                      ) : officer.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                          Active Today
                        </span>
                      ) : officer.status === 'low_score' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                          Needs Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <Clock className="w-3 h-3 mr-1 text-rose-600" />
                          Inactive (5+ d)
                        </span>
                      )}
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        {officer.lastActive}
                      </div>
                    </td>

                    {/* Point 2: Performance & Module Scores */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-base font-black font-mono ${
                          officer.score >= 70 ? 'text-emerald-700' : (officer.score > 0 ? 'text-amber-700' : 'text-slate-400')
                        }`}>
                          {officer.score}%
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          ({officer.modulesCompleted} Modules)
                        </span>
                      </div>
                      <div className="w-28 bg-[#ebdcc8]/50 rounded-full h-2 mt-1 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${
                            officer.score >= 70 ? 'bg-emerald-500' : (officer.score > 0 ? 'bg-[#ea8b21]' : 'bg-slate-300')
                          }`}
                          style={{ width: `${Math.max(4, officer.score)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-1 truncate max-w-[160px]">
                        Focus: {officer.weakTopic}
                      </div>
                    </td>

                    {/* Point 3: Automated Verification */}
                    <td className="py-4 px-4">
                      <div className="text-[11px] leading-relaxed text-slate-700 font-medium max-w-xs bg-[#faf5ec] p-2 rounded-xl border border-[#ebdcc8]">
                        <Info className="w-3 h-3 inline mr-1 text-[#ea8b21]" />
                        {officer.verificationNote}
                      </div>
                    </td>

                    {/* Point 5: Direct Email (Main Site Style) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1.5">
                        <a
                          href={`mailto:${officer.email}?subject=${encodeURIComponent(`[MoSPI Field Notice] Attention: ${currentSquad.squadName}`)}&body=${encodeURIComponent(`Dear ${officer.name},\n\nThis is an official communication from Supervisor ${currentSquad.supervisor} regarding your field activity.\n\nBest regards,\nMoSPI Field Operations`)}`}
                          className="inline-flex items-center text-xs font-bold text-[#ea8b21] hover:text-[#d97d16] bg-[#ea8b21]/10 hover:bg-[#ea8b21]/20 px-2.5 py-1 rounded-xl border border-[#ea8b21]/30 transition"
                          title="Open in Email Client (Outlook / Webmail)"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Mail
                        </a>
                        <button
                          onClick={() => setEmailModalOfficer(officer)}
                          className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-1 rounded-xl border border-[#ebdcc8] transition shadow-2xs cursor-pointer"
                          title="View Details & Copy Contact"
                        >
                          Details
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 font-medium mt-1 select-all">
                        {officer.email}
                      </div>
                    </td>

                    {/* Point 7: Instant Deactivate Button Right on the Row */}
                    <td className="py-4 px-4 text-right">
                      {officer.isDeactivated ? (
                        <button
                          onClick={() => handleToggleDeactivate(officer.id)}
                          className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleDeactivate(officer.id)}
                          className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-2xs cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" />
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supervisor Standard Operating Procedure Note */}
        <div className="bg-[#faf5ec] rounded-2xl border border-[#ebdcc8] p-4 text-xs text-slate-700 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#ea8b21] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">MoSPI Field Supervisory Guidelines (Collection of Statistics Act):</span>
            <p className="mt-0.5 leading-relaxed font-medium">
              Supervisors must scrutinize at least 10% of field schedules. Officers with scores under 70% must be coached before survey deployment. Deactivation revokes digital tablet keys while preserving historical survey audit logs.
            </p>
          </div>
        </div>

      </main>

      {/* Point 5 Modal: Direct Email Outreach Details (Karmayogi Bharat Modal) */}
      {emailModalOfficer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebdcc8] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#ebdcc8] pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-[#ea8b21]" />
                <h3 className="font-black text-slate-900 text-base">Direct Official Contact</h3>
              </div>
              <button 
                onClick={() => setEmailModalOfficer(null)}
                className="text-slate-500 hover:text-slate-900 text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#faf5ec] p-3.5 rounded-2xl border border-[#ebdcc8]">
                <div className="text-slate-500 font-bold">Recipient Officer:</div>
                <div className="text-slate-900 font-black text-sm mt-0.5">
                  {emailModalOfficer.name} ({emailModalOfficer.cadre})
                </div>
                <div className="text-slate-600 font-mono mt-1 select-all text-xs font-semibold">
                  {emailModalOfficer.email}
                </div>
                <div className="text-slate-600 font-mono mt-0.5 select-all text-xs font-semibold">
                  Phone: {emailModalOfficer.phone}
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Pre-Composed Subject:</label>
                <input 
                  type="text" 
                  readOnly 
                  value={`[MoSPI Field Notice] Inquiry from Supervisor ${currentSquad.supervisor} - ${currentSquad.squadName}`}
                  className="w-full bg-[#faf5ec]/50 border border-[#ebdcc8] text-slate-800 px-3 py-2 rounded-xl text-xs font-mono select-all"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Recommended Notice Body:</label>
                <textarea 
                  readOnly 
                  rows={4}
                  value={`Dear ${emailModalOfficer.name},\n\nThis is an official administrative communication regarding your field survey activity in ${currentSquad.fieldName}.\n\nCurrent Status: ${emailModalOfficer.verificationNote}\nPlease respond or report to your squad supervisor.\n\nBest regards,\n${currentSquad.supervisor}`}
                  className="w-full bg-[#faf5ec]/50 border border-[#ebdcc8] text-slate-800 p-3 rounded-xl text-xs font-mono select-all leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#ebdcc8]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${emailModalOfficer.email}\nSubject: [MoSPI Field Notice] Inquiry from Supervisor ${currentSquad.supervisor}\n\nDear ${emailModalOfficer.name},\nPlease report regarding your field activity.`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-[#faf5ec] hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-[#ebdcc8] transition flex items-center cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Template'}
              </button>

              <a
                href={`mailto:${emailModalOfficer.email}?subject=${encodeURIComponent(`[MoSPI Notice] Inquiry: ${currentSquad.squadName}`)}`}
                className="text-xs font-bold text-white bg-[#ea8b21] hover:bg-[#d97d16] px-4 py-2 rounded-xl transition shadow-md shadow-[#ea8b21]/20 flex items-center cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Launch Webmail
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
