'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { citizenReportsService } from '@/lib/services/citizenReportsService';
import { CitizenReport } from '@/lib/types/dashboard';
import { 
  Megaphone, 
  Search, 
  MapPin, 
  Clock, 
  Eye, 
  CheckCircle2, 
  X, 
  FileText, 
  Truck, 
  AlertTriangle, 
  Radio, 
  ShieldCheck,
  User,
  ExternalLink
} from 'lucide-react';

export default function CitizenReportsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<'All' | 'PENDING' | 'CHALLAN_ISSUED' | 'ENFORCEMENT_COMPLETE' | 'REJECTED'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Enforcement dialog states
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [challanNotes, setChallanNotes] = useState('Obstruction of public carriageway verified via camera evidence.');
  const [rejectionReason, setRejectionReason] = useState('Insufficient visual evidence to substantiate violation.');

  useEffect(() => {
    const update = () => {
      setReports(citizenReportsService.getReports());
    };
    update();
    const unsub = citizenReportsService.subscribe(update);
    return () => unsub();
  }, []);

  const filteredReports = reports.filter((r) => {
    const s = String(r.status).toUpperCase();
    const matchesStatus = 
      filterStatus === 'All' 
        ? true 
        : filterStatus === 'PENDING'
        ? s === 'PENDING' || s === 'PENDING REVIEW'
        : s === filterStatus;

    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.registrationPlate && r.registrationPlate.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleIssueChallan = async () => {
    if (!selectedReport) return;
    const challanRef = await citizenReportsService.issueChallan(selectedReport.id, {
      mvaSection: selectedReport.mvaSection || 'Section 122 MVA (Obstruction of Flow)',
      penaltyAmount: selectedReport.penaltyAmount || 500,
      notes: challanNotes
    });
    setShowChallanModal(false);
    setActionNotice(`E-Challan #${challanRef} successfully generated for vehicle ${selectedReport.registrationPlate || selectedReport.title}!`);
    setTimeout(() => setActionNotice(null), 4000);
    setSelectedReport(null);
  };

  const handleDispatchTowing = async () => {
    if (!selectedReport) return;
    await citizenReportsService.dispatchTowing(selectedReport.id);
    setActionNotice(`Towing unit dispatched for vehicle ${selectedReport.registrationPlate || selectedReport.title}!`);
    setTimeout(() => setActionNotice(null), 4000);
    setSelectedReport(null);
  };

  const handleDismissReport = async () => {
    if (!selectedReport) return;
    await citizenReportsService.rejectReport(selectedReport.id, rejectionReason);
    setShowRejectModal(false);
    setActionNotice(`Report #${selectedReport.id} dismissed with recorded justification.`);
    setTimeout(() => setActionNotice(null), 4000);
    setSelectedReport(null);
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto pr-1">
      {/* Toast Alert */}
      {actionNotice && (
        <div className="bg-[#00D68F] text-slate-950 px-3 py-2 rounded-lg text-xs font-black shadow-lg flex items-center justify-between animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[var(--card-inner-border)] gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F52235]/20 border border-[#F52235]/40 flex items-center justify-center text-[#F52235] shrink-0">
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold theme-title tracking-wide flex items-center gap-2">
              <span>{t.nav.citizenReports} — Police Enforcement Verification Queue</span>
              <span className="px-2 py-0.5 rounded-full bg-[#F52235]/15 border border-[#F52235]/40 text-[#F52235] text-[10px] font-black flex items-center gap-1">
                <Radio size={10} className="animate-pulse" /> Appwrite Cloud Live Feed
              </span>
            </h1>
            <p className="text-xs theme-sub font-medium">
              GPS-verified tamper-proof traffic violation reports submitted by citizens for officer review & e-Challan generation
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 theme-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plate, report ID, location..."
              className="pl-8 pr-3 py-1.5 rounded-lg theme-inner-card border border-[var(--card-inner-border)] text-xs theme-title placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[#1677FF] w-52 sm:w-60"
            />
          </div>

          <div className="flex theme-inner-card p-0.5 rounded-lg border border-[var(--card-inner-border)] shrink-0 overflow-x-auto">
            {(['All', 'PENDING', 'CHALLAN_ISSUED', 'ENFORCEMENT_COMPLETE', 'REJECTED'] as const).map((st) => {
              const label = 
                st === 'All' ? 'All' :
                st === 'PENDING' ? 'Pending' :
                st === 'CHALLAN_ISSUED' ? 'Challan Issued' :
                st === 'ENFORCEMENT_COMPLETE' ? 'Towed' : 'Dismissed';

              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterStatus === st ? 'bg-[#1677FF] text-white shadow-xs' : 'theme-sub hover:text-[#1677FF]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
        {filteredReports.map((report) => {
          const s = String(report.status).toUpperCase();
          const isPending = s === 'PENDING' || s === 'PENDING REVIEW';
          const isChallan = s === 'CHALLAN_ISSUED';
          const isTowed = s === 'ENFORCEMENT_COMPLETE';
          const isRejected = s === 'REJECTED';

          const badgeClass = isChallan
            ? 'bg-[#00D68F] text-slate-950 font-black shadow-xs'
            : isTowed
            ? 'bg-[#38BDF8] text-slate-950 font-black shadow-xs'
            : isRejected
            ? 'bg-slate-500 text-white font-bold'
            : isPending
            ? 'bg-[#F52235] text-white font-extrabold shadow-xs animate-pulse'
            : 'bg-[#1677FF] text-white font-extrabold';

          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="police-card rounded-xl p-3 flex flex-col justify-between border hover:border-[#1677FF] cursor-pointer group transition-all shadow-sm hover:shadow-md"
            >
              <div>
                {/* Photo with Plate Badge */}
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[var(--card-inner-border)] bg-black mb-2.5">
                  <Image 
                    src={report.imageUrl} 
                    alt={report.title} 
                    fill 
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-102 transition-transform" 
                  />
                  
                  <span className={`absolute top-2 right-2 text-[9px] font-mono px-2 py-0.5 rounded border shadow-xs uppercase tracking-wider ${badgeClass}`}>
                    {report.status}
                  </span>

                  {report.registrationPlate && report.registrationPlate !== 'N/A' && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px] border border-amber-600 shadow-md">
                      {report.registrationPlate}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm theme-title truncate">{report.title}</h3>
                  <span className="text-[10px] font-mono theme-sub shrink-0 ml-1">{report.id}</span>
                </div>

                <p className="text-xs theme-sub line-clamp-2 leading-snug font-medium">
                  {report.description}
                </p>

                {report.challanReference && (
                  <div className="mt-2 p-1.5 rounded bg-[#00D68F]/15 border border-[#00D68F]/40 text-[#00D68F] text-[10px] font-mono font-bold flex items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>CHALLAN #{report.challanReference} (₹{report.penaltyAmount || 500})</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--card-inner-border)] mt-3 flex items-center justify-between text-xs theme-sub">
                <span className="flex items-center gap-1 text-[11px] truncate">
                  <MapPin size={12} className="text-[#F52235] shrink-0" /> {report.location}
                </span>
                <span className="text-[10px] theme-subtle font-mono shrink-0">
                  {report.reportedTime}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Police Verification & Enforcement Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--modal-bg)] border-2 border-[#1677FF] rounded-xl max-w-lg w-full p-4 sm:p-5 shadow-2xl text-[var(--text-main)] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedReport(null);
                setShowChallanModal(false);
                setShowRejectModal(false);
              }}
              className="absolute top-3.5 right-3.5 theme-sub hover:opacity-80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--card-inner-border)]">
              <Megaphone size={18} className="text-[#F52235]" />
              <div className="min-w-0">
                <h3 className="font-bold text-base theme-title truncate">{selectedReport.title}</h3>
                <span className="text-xs font-mono theme-sub">Report ID: {selectedReport.id} • {selectedReport.reportedTime}</span>
              </div>
            </div>

            {/* Evidence Image */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[var(--card-inner-border)] mb-3 bg-black">
              <Image 
                src={selectedReport.imageUrl} 
                alt={selectedReport.title} 
                fill 
                unoptimized
                sizes="(max-width: 600px) 100vw, 500px"
                className="object-cover" 
              />
              {selectedReport.registrationPlate && selectedReport.registrationPlate !== 'N/A' && (
                <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded bg-amber-400 text-slate-950 font-black text-sm font-mono border-2 border-black shadow-xl tracking-wider">
                  REGISTRATION: {selectedReport.registrationPlate}
                </div>
              )}
            </div>

            {/* Details Box */}
            <div className="space-y-2 text-xs mb-3">
              <div className="p-2.5 rounded-lg theme-inner-card border border-[var(--card-inner-border)]">
                <div className="theme-sub font-bold mb-0.5">Citizen Tamper-Proof Evidence Report:</div>
                <div className="theme-title leading-relaxed">{selectedReport.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg theme-inner-card border border-[var(--card-inner-border)]">
                  <div className="theme-sub font-bold mb-0.5 flex items-center gap-1">
                    <MapPin size={12} className="text-[#F52235]" /> GPS Location
                  </div>
                  <div className="theme-title font-medium truncate">{selectedReport.location}</div>
                  <div className="text-[10px] theme-subtle font-mono mt-0.5">
                    {selectedReport.coords.lat}° N, {selectedReport.coords.lng}° E
                  </div>
                </div>

                <div className="p-2.5 rounded-lg theme-inner-card border border-[var(--card-inner-border)]">
                  <div className="theme-sub font-bold mb-0.5 flex items-center gap-1">
                    <User size={12} className="text-[#1677FF]" /> Reporter Identity
                  </div>
                  <div className="theme-title font-medium truncate">{selectedReport.reporterName}</div>
                  <div className="text-[10px] theme-subtle font-mono mt-0.5">
                    {selectedReport.reporterContact}
                  </div>
                </div>
              </div>

              {selectedReport.challanReference && (
                <div className="p-3 rounded-lg bg-[#00D68F]/15 border border-[#00D68F]/40 text-[#00D68F] space-y-1">
                  <div className="font-extrabold text-xs flex items-center gap-1.5">
                    <ShieldCheck size={16} /> E-CHALLAN GENERATED: {selectedReport.challanReference}
                  </div>
                  <div className="text-[11px] font-mono">
                    Fine: ₹{selectedReport.penaltyAmount || 500} • {selectedReport.mvaSection}
                  </div>
                  {selectedReport.challanNotes && (
                    <div className="text-[10px] opacity-90">{selectedReport.challanNotes}</div>
                  )}
                </div>
              )}

              {/* Sub-dialog: Issue Challan */}
              {showChallanModal && (
                <div className="p-3 rounded-lg theme-inner-card border-2 border-[#1677FF] space-y-2">
                  <div className="font-extrabold text-xs text-[#1677FF] flex items-center gap-1.5">
                    <FileText size={14} /> Issue e-Challan under Motor Vehicles Act (Section 122)
                  </div>
                  <div>
                    <label className="text-[10px] theme-sub font-bold block mb-1">Enforcement Notes / Violation Specifics:</label>
                    <input
                      type="text"
                      value={challanNotes}
                      onChange={(e) => setChallanNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded theme-inner-card border border-[var(--card-inner-border)] text-xs theme-title"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowChallanModal(false)}
                      className="px-3 py-1 rounded theme-inner-card text-xs theme-sub font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleIssueChallan}
                      className="px-3.5 py-1.5 rounded bg-[#00D68F] hover:bg-[#00ba7c] text-slate-950 font-black text-xs shadow-md cursor-pointer"
                    >
                      Confirm & Issue E-Challan (₹{selectedReport.penaltyAmount || 500})
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-dialog: Dismiss Report */}
              {showRejectModal && (
                <div className="p-3 rounded-lg theme-inner-card border-2 border-[#EF4444] space-y-2">
                  <div className="font-extrabold text-xs text-[#EF4444] flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Dismiss Report
                  </div>
                  <div>
                    <label className="text-[10px] theme-sub font-bold block mb-1">Dismissal Reason / Justification:</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded theme-inner-card border border-[var(--card-inner-border)] text-xs theme-title"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowRejectModal(false)}
                      className="px-3 py-1 rounded theme-inner-card text-xs theme-sub font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDismissReport}
                      className="px-3.5 py-1.5 rounded bg-[#EF4444] hover:bg-red-700 text-white font-black text-xs shadow-md cursor-pointer"
                    >
                      Confirm Dismissal
                    </button>
                  </div>
                </div>
              )}

              {/* Three Enforcement Action Buttons */}
              {!showChallanModal && !showRejectModal && (
                <div className="pt-2 border-t border-[var(--card-inner-border)]">
                  <div className="text-xs font-bold theme-sub mb-2">Officer Verification & Enforcement Actions:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setShowChallanModal(true)}
                      className="p-2.5 rounded-lg bg-[#00D68F] hover:bg-[#00ba7c] text-slate-950 font-black text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <FileText size={16} />
                      <span className="text-center leading-tight">Approve & Issue e-Challan</span>
                    </button>

                    <button
                      onClick={handleDispatchTowing}
                      className="p-2.5 rounded-lg bg-[#1677FF] hover:bg-[#0056cc] text-white font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <Truck size={16} />
                      <span className="text-center leading-tight">Dispatch Towing Unit</span>
                    </button>

                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="p-2.5 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 border border-[#EF4444]/40 text-[#EF4444] font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <AlertTriangle size={16} />
                      <span className="text-center leading-tight">Dismiss Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-[var(--card-inner-border)] flex justify-end">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setShowChallanModal(false);
                  setShowRejectModal(false);
                }}
                className="px-4 py-1.5 rounded theme-inner-card border border-[var(--card-inner-border)] text-xs font-bold theme-title transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
