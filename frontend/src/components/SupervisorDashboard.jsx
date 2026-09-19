import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, UserX, UserCheck, Send, CheckCircle2, Clock, 
  AlertTriangle, Shield, ArrowRight, ArrowLeft, RefreshCw, Copy, Check,
  FileSpreadsheet, ExternalLink, Filter, ChevronDown, Award, TrendingUp, Info
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

export default function SupervisorDashboard({ onBackToOfficer, onSwitchToBoss }) {
  const [squads, setSquads] = useState(INITIAL_SQUADS);
  const [selectedFieldId, setSelectedFieldId] = useState('survey_supervisor_asuse');
  const [emailModalOfficer, setEmailModalOfficer] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Government Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-700 to-blue-900 flex items-center justify-center shadow-md border border-indigo-500/30">
              <Shield className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  MoSPI Field Operations
                </span>
                <span className="text-xs text-slate-400">Tier-1 Supervisory Cadre</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                SankhyaSetu Field Supervisory Console
              </h1>
            </div>
          </div>

          {/* Quick Demo Navigation Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onBackToOfficer}
              className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Return to Officer Training & Quiz Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Officer View
            </button>
            <button
              onClick={onSwitchToBoss}
              className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-indigo-500 transition"
              title="Switch to Ministry HQ Director General View"
            >
              Main Boss HQ
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </header>

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl shadow-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs font-medium">{toastMessage}</div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Supervisor Identity Banner & Option B Submission */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <span>Cadre Supervisor: <strong className="text-slate-200">{currentSquad.supervisor}</strong></span>
              <span>•</span>
              <span>Badge: <span className="font-mono text-indigo-300">{currentSquad.supervisorBadge}</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentSquad.squadName}
              </h2>
              {/* Field Switcher Dropdown (ASUSE, PLFS, Household) */}
              <div className="relative inline-block">
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="appearance-none bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="survey_supervisor_asuse">Field: ASUSE Enterprise</option>
                  <option value="field_investigator_nsso">Field: PLFS Labour Force</option>
                  <option value="junior_statistical_officer_cso">Field: HCES Household Survey</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Official supervisory authority over field officers, daily survey attendance, accuracy scrutiny, and direct administrative offboarding.
            </p>
          </div>

          {/* Point 8 (Option B): Submit Squad Status Button */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">HQ Submission Status</div>
              <div className="text-xs font-semibold">
                {currentSquad.status === 'submitted' ? (
                  <span className="text-emerald-400 flex items-center justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Submitted ({currentSquad.submittedAt})
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center justify-end">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Pending Daily Roll-Call
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmitSquadStatus}
              disabled={isSubmitting}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center transition shadow-lg ${
                currentSquad.status === 'submitted'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
              }`}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Syncing...' : (currentSquad.status === 'submitted' ? 'Re-Submit Squad Status to HQ' : 'Submit Squad Status to HQ')}
            </button>
          </div>
        </div>

        {/* Squad Health KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Squad Attendance (3 Officers)</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {activeCount} <span className="text-sm font-normal text-slate-400">/ 3 On Active Duty</span>
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
              Real-time MoSPI field telemetry
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Squad Competency Average</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {avgScore}% <span className="text-sm font-normal text-slate-400">Readiness</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Ministry Passing Threshold: <strong className="text-slate-300">70.0%</strong>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Attention Required</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {flaggedCount} <span className="text-sm font-normal text-slate-400">{flaggedCount === 1 ? 'Officer Flagged' : 'Officers Flagged'}</span>
            </div>
            <div className="text-xs text-amber-400/80 mt-1">
              Automated low-score & inactivity checks
            </div>
          </div>
        </div>

        {/* The 3 Officers Squad Monitoring Table */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <Users className="w-4 h-4 mr-2 text-indigo-400" />
                Assigned Squad Cadre Officers ({currentSquad.officers.length})
              </h3>
              <p className="text-xs text-slate-400">
                Inspect scores, view automated status checks, email directly, or deactivate accounts.
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 self-start sm:self-auto">
              Survey Domain: <strong className="text-slate-200">{currentSquad.fieldName.split('(')[0]}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[11px] text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th scope="col" className="py-3 px-4 font-semibold">Officer & Cadre</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Status (Point 1)</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Score & Progress (Point 2)</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Automated Verification (Point 3)</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Direct Email (Point 5)</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">Account Control (Point 7)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentSquad.officers.map((officer) => (
                  <tr 
                    key={officer.id}
                    className={`transition ${officer.isDeactivated ? 'bg-slate-950/60 opacity-60' : 'hover:bg-slate-800/40'}`}
                  >
                    {/* Officer Identity */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 text-sm flex items-center">
                        {officer.name}
                        {officer.isDeactivated && (
                          <span className="ml-2 text-[10px] bg-red-950/80 text-red-400 border border-red-800/60 px-1.5 py-0.2 rounded font-normal">
                            Deactivated
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        ID: <span className="font-mono text-slate-300">{officer.id}</span> • {officer.cadre}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {officer.domain}
                      </div>
                    </td>

                    {/* Point 1: Status Badges */}
                    <td className="py-3.5 px-4">
                      {officer.isDeactivated ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          ⚪ Relieved / Inactive
                        </span>
                      ) : officer.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                          Active Today
                        </span>
                      ) : officer.status === 'low_score' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60">
                          <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
                          Needs Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/70 text-rose-300 border border-rose-800/60">
                          <Clock className="w-3 h-3 mr-1 text-rose-400" />
                          Inactive (5+ d)
                        </span>
                      )}
                      <div className="text-[11px] text-slate-400 mt-1">
                        {officer.lastActive}
                      </div>
                    </td>

                    {/* Point 2: Performance & Module Scores */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-base font-bold font-mono ${
                          officer.score >= 70 ? 'text-emerald-400' : (officer.score > 0 ? 'text-amber-400' : 'text-slate-400')
                        }`}>
                          {officer.score}%
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({officer.modulesCompleted} Modules)
                        </span>
                      </div>
                      <div className="w-28 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${
                            officer.score >= 70 ? 'bg-emerald-500' : (officer.score > 0 ? 'bg-amber-500' : 'bg-slate-700')
                          }`}
                          style={{ width: `${Math.max(4, officer.score)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[160px]">
                        Focus: {officer.weakTopic}
                      </div>
                    </td>

                    {/* Point 3: Automated Verification (Handled automatically) */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] leading-relaxed text-slate-300 max-w-xs bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                        <Info className="w-3 h-3 inline mr-1 text-indigo-400" />
                        {officer.verificationNote}
                      </div>
                    </td>

                    {/* Point 5: Direct Email (Show email with click-to-email & copy) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <a
                          href={`mailto:${officer.email}?subject=${encodeURIComponent(`[MoSPI Field Notice] Attention: ${currentSquad.squadName}`)}&body=${encodeURIComponent(`Dear ${officer.name},\n\nThis is an official communication from Supervisor ${currentSquad.supervisor} regarding your field activity.\n\nBest regards,\nMoSPI Field Operations`)}`}
                          className="inline-flex items-center text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/60 px-2.5 py-1 rounded-md border border-indigo-800/50 transition"
                          title="Open in Email Client (Outlook / Webmail)"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Mail
                        </a>
                        <button
                          onClick={() => setEmailModalOfficer(officer)}
                          className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-md border border-slate-700 transition"
                          title="View Details & Copy Contact"
                        >
                          Details
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 mt-1 select-all">
                        {officer.email}
                      </div>
                    </td>

                    {/* Point 7: Instant Deactivate Button Right on the Row */}
                    <td className="py-3.5 px-4 text-right">
                      {officer.isDeactivated ? (
                        <button
                          onClick={() => handleToggleDeactivate(officer.id)}
                          className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleDeactivate(officer.id)}
                          className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/70 transition shadow-sm"
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
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-4 text-xs text-slate-400 flex items-start space-x-3">
          <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">MoSPI Field Supervisory Guidelines (Collection of Statistics Act):</span>
            <p className="mt-0.5">
              Supervisors must scrutinize at least 10% of field schedules. Officers with scores under 70% must be coached before survey deployment. Deactivation revokes digital tablet keys while preserving historical survey audit logs.
            </p>
          </div>
        </div>

      </main>

      {/* Point 5 Modal: Direct Email Outreach Details */}
      {emailModalOfficer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Direct Official Contact</h3>
              </div>
              <button 
                onClick={() => setEmailModalOfficer(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400">Recipient Officer:</div>
                <div className="text-slate-100 font-semibold text-sm mt-0.5">
                  {emailModalOfficer.name} ({emailModalOfficer.cadre})
                </div>
                <div className="text-slate-400 font-mono mt-1 select-all text-xs">
                  {emailModalOfficer.email}
                </div>
                <div className="text-slate-400 font-mono mt-0.5 select-all text-xs">
                  Phone: {emailModalOfficer.phone}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Pre-Composed Subject:</label>
                <input 
                  type="text" 
                  readOnly 
                  value={`[MoSPI Field Notice] Inquiry from Supervisor ${currentSquad.supervisor} - ${currentSquad.squadName}`}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg text-xs font-mono select-all"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Recommended Notice Body:</label>
                <textarea 
                  readOnly 
                  rows={4}
                  value={`Dear ${emailModalOfficer.name},\n\nThis is an official administrative communication regarding your field survey activity in ${currentSquad.fieldName}.\n\nCurrent Status: ${emailModalOfficer.verificationNote}\nPlease respond or report to your squad supervisor.\n\nBest regards,\n${currentSquad.supervisor}`}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-3 rounded-lg text-xs font-mono select-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${emailModalOfficer.email}\nSubject: [MoSPI Field Notice] Inquiry from Supervisor ${currentSquad.supervisor}\n\nDear ${emailModalOfficer.name},\nPlease report regarding your field activity.`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition flex items-center"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Template'}
              </button>

              <a
                href={`mailto:${emailModalOfficer.email}?subject=${encodeURIComponent(`[MoSPI Notice] Inquiry: ${currentSquad.squadName}`)}`}
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition shadow-md flex items-center"
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
