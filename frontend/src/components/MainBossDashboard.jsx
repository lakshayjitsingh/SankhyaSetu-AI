import React, { useState } from 'react';
import { 
  Building2, Users, Award, TrendingUp, AlertTriangle, CheckCircle2, Clock, 
  Send, Mail, Trash2, Eye, ArrowLeft, ArrowRight, RefreshCw, Check, 
  ChevronRight, X, ShieldCheck
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

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-slate-900 font-sans pb-16">
      
      {/* Top Directorate Header - Karmayogi Bharat Branding */}
      <header className="sticky top-0 z-40 bg-[#faf5ec] border-b border-[#ebdcc8] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
                  Sankhya<span className="text-[#ea8b21]">Setu</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#ea8b21]/15 text-[#ea8b21] border border-[#ea8b21]/30 rounded">
                  MoSPI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-full">
                  Director General HQ (Main Boss)
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-semibold">Central Directorate • All-India Statistical Cadre Command</p>
            </div>
          </div>

          {/* Quick Navigation Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBackToOfficer}
              className="inline-flex items-center text-xs font-bold px-3.5 py-2 rounded-xl bg-white hover:bg-[#faf5ec] text-slate-800 border border-[#ebdcc8] shadow-2xs transition cursor-pointer"
              title="Switch to Field Officer View"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Officer View
            </button>
            <button
              onClick={onSwitchToSupervisor}
              className="inline-flex items-center text-xs font-bold px-3.5 py-2 rounded-xl bg-[#faf5ec] hover:bg-white text-slate-800 border border-[#ebdcc8] shadow-2xs transition cursor-pointer"
              title="Switch to Field Supervisor View"
            >
              Supervisor Hub
            </button>
          </div>
        </div>
      </header>

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-amber-300 text-amber-950 p-4 rounded-2xl shadow-xl flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs font-bold">{toastMessage}</div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Main Boss Executive Banner */}
        <div className="bg-white rounded-2xl border border-[#ebdcc8] p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-600 mb-1">
              <span>Executive Authority: <strong className="text-slate-900 font-bold">Dr. S. K. Mukherjee</strong></span>
              <span>•</span>
              <span>Designation: <span className="text-[#ea8b21] font-bold">Deputy Director General (DDG)</span></span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              All-India Statistical Cadre Oversight
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
              Ministry HQ executive oversight across all 3 survey divisions (ASUSE, PLFS, and Household Consumer Expenditure).
              Real-time roll-call compliance tracking, supervisor accountability, and master purge authorization.
            </p>
          </div>

          <div className="shrink-0 bg-[#faf5ec] p-3.5 rounded-2xl border border-[#ebdcc8] flex items-center space-x-3 shadow-2xs">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
            <div className="text-xs">
              <div className="font-bold text-slate-900">Neon PostgreSQL Connected</div>
              <div className="text-slate-600 font-medium">Master Audit Security: Level 4 Active</div>
            </div>
          </div>
        </div>

        {/* Macro Ministry KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Option B Tracker */}
          <div className="bg-white border border-[#ebdcc8] p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Daily Squad Submissions</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {submittedCount} <span className="text-sm font-bold text-slate-500">/ {totalSquads} Submitted</span>
            </div>
            <div className="text-xs text-emerald-700 font-bold mt-1">
              {submittedCount === totalSquads ? '100% On-Time Reporting' : `${totalSquads - submittedCount} Squad Awaiting Roll-Call`}
            </div>
          </div>

          <div className="bg-white border border-[#ebdcc8] p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Active Field Force</span>
              <Users className="w-4 h-4 text-[#ea8b21]" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalActive} <span className="text-sm font-bold text-slate-500">/ {totalOfficers} Officers</span>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-1">
              Across 3 Regional Cadre Units
            </div>
          </div>

          <div className="bg-white border border-[#ebdcc8] p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>National Competency Index</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {nationalAvg}% <span className="text-sm font-bold text-slate-500">Average</span>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-1">
              Ministry Benchmark: 70.0%
            </div>
          </div>

          <div className="bg-white border border-[#ebdcc8] p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Supervisors on Duty</span>
              <Award className="w-4 h-4 text-[#ea8b21]" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalSquads} <span className="text-sm font-bold text-slate-500">Senior Officers</span>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-1">
              ASUSE, PLFS, & Household
            </div>
          </div>
        </div>

        {/* Point 1 & 2: Supervisors Master Table */}
        <div className="bg-white rounded-2xl border border-[#ebdcc8] overflow-hidden shadow-2xs">
          <div className="p-5 bg-[#faf5ec] border-b border-[#ebdcc8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-[#ea8b21]" />
                Regional Field Supervisors & Cadre Status
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Track Option B daily roll-call compliance, nudge pending supervisors, inspect squads, and exercise master purge rights.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              Direct MoSPI HQ Administrative Authority
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-[#faf5ec]/80 uppercase text-[11px] text-slate-600 font-bold tracking-wider border-b border-[#ebdcc8]">
                <tr>
                  <th scope="col" className="py-3 px-4 font-bold">Squad Unit & Survey Field</th>
                  <th scope="col" className="py-3 px-4 font-bold">Supervisor in Charge</th>
                  <th scope="col" className="py-3 px-4 font-bold">Daily Status (Point 1)</th>
                  <th scope="col" className="py-3 px-4 font-bold">Officers Active / Total</th>
                  <th scope="col" className="py-3 px-4 font-bold">Avg Score</th>
                  <th scope="col" className="py-3 px-4 font-bold text-right">Director Actions (Points 2 & 3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdcc8]/70">
                {supervisors.map((sup) => (
                  <tr key={sup.squadId} className="hover:bg-[#faf5ec]/50 transition">
                    {/* Squad Details */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {sup.squadName}
                      </div>
                      <div className="text-[#ea8b21] font-bold text-[11px] mt-0.5">
                        {sup.fieldName}
                      </div>
                      <div className="text-slate-500 text-[10px] font-mono mt-0.5">
                        ID: {sup.squadId}
                      </div>
                    </td>

                    {/* Supervisor */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">
                        {sup.supervisorName}
                      </div>
                      <div className="text-slate-600 text-[11px] font-medium">
                        {sup.supervisorCadre}
                      </div>
                      <div className="text-slate-500 font-mono text-[10px] mt-0.5 select-all">
                        {sup.supervisorEmail}
                      </div>
                    </td>

                    {/* Point 1: Daily Compliance Status (Option B Tracker) */}
                    <td className="py-4 px-4">
                      {sup.submissionStatus === 'submitted' ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Submitted Today
                          </span>
                          <div className="text-[11px] text-slate-500 font-medium mt-1">
                            Logged at {sup.submittedAt}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Pending Submission
                          </span>
                          <div className="text-[11px] text-amber-800 font-semibold mt-1">
                            Awaiting daily roll-call
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Officer Counts */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {sup.activeCount} Active / {sup.officerCount} Total
                      </div>
                      {sup.deactivatedCount > 0 && (
                        <div className="text-[11px] text-rose-700 font-bold mt-0.5">
                          {sup.deactivatedCount} Relieved / Deactivated
                        </div>
                      )}
                    </td>

                    {/* Average Score */}
                    <td className="py-4 px-4">
                      <span className={`text-base font-black font-mono ${
                        sup.avgScore >= 70 ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {sup.avgScore}%
                      </span>
                    </td>

                    {/* Director Actions (Points 2 & 3) */}
                    <td className="py-4 px-4 text-right space-x-2">
                      {/* Point 3: View Squad in 1-Click */}
                      <button
                        onClick={() => setViewSquad(sup)}
                        className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-[#ebdcc8] shadow-2xs transition cursor-pointer"
                        title="Inspect Squad Officers & Details"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-[#ea8b21]" />
                        View Squad
                      </button>

                      {/* Point 2: Remind / Nudge Supervisor */}
                      {sup.submissionStatus === 'pending' ? (
                        <button
                          onClick={() => handleRemindSupervisor(sup)}
                          className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-[#ea8b21] hover:bg-[#d97d16] text-white transition shadow-sm shadow-[#ea8b21]/20 cursor-pointer"
                          title="Send Urgent HQ Directive to Submit Roll-Call"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Remind
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemindSupervisor(sup)}
                          className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-[#faf5ec] hover:bg-white text-slate-700 border border-[#ebdcc8] transition cursor-pointer"
                          title="Send General Administrative Directive"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1" />
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

      {/* Point 3: View Squad Modal Drawer (Karmayogi Bharat Style) */}
      {viewSquad && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebdcc8] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#ebdcc8] pb-3">
              <div>
                <span className="text-xs font-bold text-[#ea8b21]">{viewSquad.fieldName}</span>
                <h3 className="font-black text-slate-900 text-lg">{viewSquad.squadName}</h3>
                <div className="text-xs text-slate-600 mt-0.5 font-medium">
                  Supervisor: <strong className="text-slate-900 font-bold">{viewSquad.supervisorName}</strong> ({viewSquad.supervisorCadre})
                </div>
              </div>
              <button 
                onClick={() => setViewSquad(null)}
                className="text-slate-500 hover:text-slate-900 text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-600">
                Squad Officers Roster ({viewSquad.officers.length})
              </div>

              <div className="divide-y divide-[#ebdcc8] border border-[#ebdcc8] rounded-2xl overflow-hidden bg-[#faf5ec]/40">
                {viewSquad.officers.map((officer) => (
                  <div key={officer.id} className="p-3.5 flex items-center justify-between hover:bg-white transition">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center">
                        {officer.name}
                        {officer.status === 'deactivated' && (
                          <span className="ml-2 text-[10px] bg-rose-100 text-rose-800 border border-rose-300 px-1.5 rounded font-bold">
                            Deactivated
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {officer.id} • {officer.cadre} • <span className="font-mono text-[11px] text-slate-500">{officer.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`font-mono font-black text-sm ${
                          officer.score >= 70 ? 'text-emerald-700' : (officer.score > 0 ? 'text-amber-700' : 'text-slate-400')
                        }`}>
                          {officer.score}%
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">
                          {officer.status}
                        </div>
                      </div>

                      {/* Point 5: Master Permanent Purge Button (Main Boss Only) */}
                      <button
                        onClick={() => setPurgeTarget({ squadId: viewSquad.squadId, officer })}
                        className="p-2 text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl border border-rose-200 transition cursor-pointer shadow-2xs"
                        title="Master Permanent Purge from Database (Hard Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-700 bg-[#faf5ec] p-3.5 rounded-2xl border border-[#ebdcc8]">
              <span className="font-bold text-slate-900">HQ Authority Note:</span>
              <p className="mt-0.5 leading-relaxed font-medium">
                The trash icon triggers a <strong>Master Permanent Purge</strong>. Unlike lower-tier deactivation, this completely erases records from the database. Use only for fraudulent or test entries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Point 5 Confirmation Modal: Master Permanent Purge */}
      {purgeTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-700 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Authorize Master Purge</h3>
                <div className="text-xs text-rose-700 font-bold">Permanent Database Deletion</div>
              </div>
            </div>

            <div className="text-xs text-slate-700 space-y-2">
              <p className="font-medium">
                You are about to permanently delete officer <strong className="text-slate-900">{purgeTarget.officer.name}</strong> (<span className="font-mono font-bold text-[#ea8b21]">{purgeTarget.officer.id}</span>) from the central MoSPI database.
              </p>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-900 leading-relaxed font-semibold">
                ⚠️ <strong>WARNING:</strong> This action cannot be undone. All test attempts, audit logs, and digital IDs associated with this account will be erased from Neon Cloud PostgreSQL.
              </div>
              <p className="text-slate-600 font-bold pt-1">
                Type <strong>PURGE</strong> in capital letters to confirm authorization:
              </p>
              <input
                type="text"
                value={purgeConfirmText}
                onChange={(e) => setPurgeConfirmText(e.target.value)}
                placeholder="Type PURGE"
                className="w-full bg-[#faf5ec] border border-[#ebdcc8] text-slate-900 font-mono px-3 py-2.5 rounded-xl text-sm focus:outline-rose-500 font-bold"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setPurgeTarget(null);
                  setPurgeConfirmText('');
                }}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition cursor-pointer"
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
