import React, { useState } from 'react';
import { 
  Shield, Users, Award, TrendingUp, AlertTriangle, CheckCircle2, Clock, 
  Send, Mail, Trash2, Eye, ArrowLeft, ArrowRight, RefreshCw, Check, 
  ExternalLink, Building2, ChevronRight, X, Sparkles
} from 'lucide-react';

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

export default function MainBossDashboard({ onBackToOfficer, onSwitchToSupervisor }) {
  const [supervisors, setSupervisors] = useState(INITIAL_SUPERVISORS);
  const [viewSquad, setViewSquad] = useState(null);
  const [purgeTarget, setPurgeTarget] = useState(null);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Point 2: Nudge / Remind Supervisor
  const handleRemindSupervisor = (sup) => {
    const subject = encodeURIComponent(`[MoSPI HQ Directive] Urgent: Pending Daily Squad Roll-Call for ${sup.squadName}`);
    const body = encodeURIComponent(`Dear ${sup.supervisorName},\n\nThis is an official directive from Dr. S. K. Mukherjee, Deputy Director General (MoSPI HQ).\n\nYour daily squad attendance and survey readiness submission for ${sup.squadName} is currently pending.\nPlease submit your squad status via the Supervisory Console immediately.\n\nBest regards,\nMoSPI Central Directorate`);
    window.open(`mailto:${sup.supervisorEmail}?subject=${subject}&body=${body}`, '_blank');
    triggerToast(`Official HQ reminder dispatched to Supervisor ${sup.supervisorName} (${sup.supervisorEmail}).`);
  };

  // Point 5: Master Permanent Purge (Hard Delete)
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

    // If currently viewing the same squad, update the drawer
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Directorate Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shadow-md border border-amber-500/30">
              <Building2 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  MoSPI Central Directorate
                </span>
                <span className="text-xs text-slate-400">Tier-2 Directorate Console</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                National Cadre Executive Command (Main Boss)
              </h1>
            </div>
          </div>

          {/* Quick Demo Navigation Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onBackToOfficer}
              className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Switch to Field Officer View"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Officer View
            </button>
            <button
              onClick={onSwitchToSupervisor}
              className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Switch to Field Supervisor View"
            >
              Supervisor Hub
            </button>
          </div>
        </div>
      </header>

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-amber-500/40 text-amber-300 p-4 rounded-xl shadow-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-medium">{toastMessage}</div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Main Boss Executive Banner */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <span>Executive Authority: <strong className="text-amber-300">Dr. S. K. Mukherjee</strong></span>
              <span>•</span>
              <span>Designation: <span className="text-slate-200">Deputy Director General (DDG)</span></span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              All-India Statistical Cadre Oversight
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Ministry HQ executive oversight across all 3 survey divisions (ASUSE, PLFS, and Household Consumer Expenditure).
              Real-time roll-call compliance tracking, supervisor accountability, and master purge authorization.
            </p>
          </div>

          <div className="shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
            <div className="text-xs">
              <div className="font-semibold text-white">Neon PostgreSQL Connected</div>
              <div className="text-slate-400">Master Audit Security: Level 4 Active</div>
            </div>
          </div>
        </div>

        {/* Macro Ministry KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Option B Tracker */}
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Daily Squad Submissions</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {submittedCount} <span className="text-sm font-normal text-slate-400">/ {totalSquads} Submitted</span>
            </div>
            <div className="text-xs text-emerald-400 mt-1">
              {submittedCount === totalSquads ? '100% On-Time Reporting' : `${totalSquads - submittedCount} Squad Awaiting Roll-Call`}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Active Field Force</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {totalActive} <span className="text-sm font-normal text-slate-400">/ {totalOfficers} Officers</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Across 3 Regional Cadre Units
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>National Competency Index</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {nationalAvg}% <span className="text-sm font-normal text-slate-400">Average</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Ministry Benchmark: 70.0%
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Supervisors on Duty</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {totalSquads} <span className="text-sm font-normal text-slate-400">Senior Officers</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              ASUSE, PLFS, & Household
            </div>
          </div>
        </div>

        {/* Point 1 & 2: Supervisors Master Table */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-amber-400" />
                Regional Field Supervisors & Cadre Status
              </h3>
              <p className="text-xs text-slate-400">
                Track Option B daily roll-call compliance, nudge pending supervisors, inspect squads, and exercise master purge rights.
              </p>
            </div>
            <div className="text-xs text-amber-400/90 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800/60">
              Direct MoSPI HQ Administrative Authority
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[11px] text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th scope="col" className="py-3 px-4 font-semibold">Squad Unit & Survey Field</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Supervisor in Charge</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Daily Status (Point 1)</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Officers Active / Total</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Avg Score</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">Director Actions (Points 2 & 3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {supervisors.map((sup) => (
                  <tr key={sup.squadId} className="hover:bg-slate-800/40 transition">
                    {/* Squad Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 text-sm">
                        {sup.squadName}
                      </div>
                      <div className="text-amber-300/80 text-[11px] mt-0.5">
                        {sup.fieldName}
                      </div>
                      <div className="text-slate-400 text-[10px] font-mono mt-0.5">
                        ID: {sup.squadId}
                      </div>
                    </td>

                    {/* Supervisor */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {sup.supervisorName}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {sup.supervisorCadre}
                      </div>
                      <div className="text-slate-400 font-mono text-[10px] mt-0.5 select-all">
                        {sup.supervisorEmail}
                      </div>
                    </td>

                    {/* Point 1: Daily Compliance Status (Option B Tracker) */}
                    <td className="py-3.5 px-4">
                      {sup.submissionStatus === 'submitted' ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                            Submitted Today
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Logged at {sup.submittedAt}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60 animate-pulse">
                            <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                            Pending Submission
                          </span>
                          <div className="text-[11px] text-amber-400/80 mt-1">
                            Awaiting daily roll-call
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Officer Counts */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-white">
                        {sup.activeCount} Active / {sup.officerCount} Total
                      </div>
                      {sup.deactivatedCount > 0 && (
                        <div className="text-[11px] text-rose-400 mt-0.5">
                          {sup.deactivatedCount} Relieved / Deactivated
                        </div>
                      )}
                    </td>

                    {/* Average Score */}
                    <td className="py-3.5 px-4">
                      <span className={`text-base font-bold font-mono ${
                        sup.avgScore >= 70 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {sup.avgScore}%
                      </span>
                    </td>

                    {/* Director Actions (Points 2 & 3) */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Point 3: View Squad in 1-Click */}
                      <button
                        onClick={() => setViewSquad(sup)}
                        className="inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                        title="Inspect Squad Officers & Details"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                        View Squad
                      </button>

                      {/* Point 2: Remind / Nudge Supervisor */}
                      {sup.submissionStatus === 'pending' ? (
                        <button
                          onClick={() => handleRemindSupervisor(sup)}
                          className="inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/70 transition shadow-sm"
                          title="Send Urgent HQ Directive to Submit Roll-Call"
                        >
                          <Send className="w-3.5 h-3.5 mr-1 text-amber-300" />
                          Remind
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemindSupervisor(sup)}
                          className="inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                          title="Send General Administrative Directive"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Email
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Point 3: View Squad Modal Drawer */}
      {viewSquad && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400">{viewSquad.fieldName}</span>
                <h3 className="font-bold text-white text-lg">{viewSquad.squadName}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Supervisor: <strong>{viewSquad.supervisorName}</strong> ({viewSquad.supervisorCadre})
                </div>
              </div>
              <button 
                onClick={() => setViewSquad(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Squad Officers Roster ({viewSquad.officers.length})
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                {viewSquad.officers.map((officer) => (
                  <div key={officer.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition">
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center">
                        {officer.name}
                        {officer.status === 'deactivated' && (
                          <span className="ml-2 text-[10px] bg-red-950 text-red-400 border border-red-800/60 px-1.5 rounded">
                            Deactivated
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {officer.id} • {officer.cadre} • <span className="font-mono text-[11px] text-slate-400">{officer.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`font-mono font-bold text-sm ${
                          officer.score >= 70 ? 'text-emerald-400' : (officer.score > 0 ? 'text-amber-400' : 'text-slate-400')
                        }`}>
                          {officer.score}%
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          {officer.status}
                        </div>
                      </div>

                      {/* Point 5: Master Permanent Purge Button (Main Boss Only) */}
                      <button
                        onClick={() => setPurgeTarget({ squadId: viewSquad.squadId, officer })}
                        className="p-1.5 text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900/80 rounded-lg border border-rose-800/50 transition"
                        title="Master Permanent Purge from Database (Hard Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-slate-300">HQ Authority Note:</span>
              <p className="mt-0.5">
                The trash icon triggers a <strong>Master Permanent Purge</strong>. Unlike lower-tier deactivation, this completely erases records from the database. Use only for fraudulent or test entries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Point 5 Confirmation Modal: Master Permanent Purge */}
      {purgeTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-400 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800/80 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Authorize Master Purge</h3>
                <div className="text-xs text-rose-400">Permanent Database Deletion</div>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                You are about to permanently delete officer <strong className="text-white">{purgeTarget.officer.name}</strong> (<span className="font-mono text-indigo-300">{purgeTarget.officer.id}</span>) from the central MoSPI database.
              </p>
              <div className="bg-rose-950/40 p-3 rounded-lg border border-rose-900 text-rose-300 leading-relaxed">
                ⚠️ <strong>WARNING:</strong> This action cannot be undone. All test attempts, audit logs, and digital IDs associated with this account will be erased from Neon Cloud PostgreSQL.
              </div>
              <p className="text-slate-400 pt-1">
                Type <strong>PURGE</strong> in capital letters to confirm authorization:
              </p>
              <input
                type="text"
                value={purgeConfirmText}
                onChange={(e) => setPurgeConfirmText(e.target.value)}
                placeholder="Type PURGE"
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setPurgeTarget(null);
                  setPurgeConfirmText('');
                }}
                className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePurge}
                disabled={purgeConfirmText !== 'PURGE'}
                className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition shadow-md flex items-center"
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
