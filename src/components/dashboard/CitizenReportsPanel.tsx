'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { citizenReportsService } from '@/lib/services/citizenReportsService';
import { CitizenReport } from '@/lib/types/dashboard';
import { 
  Megaphone, 
  MapPin, 
  Clock, 
  Eye, 
  ChevronRight, 
  X, 
  User,
  ShieldCheck,
  Truck,
  FileText,
  AlertTriangle,
  Radio,
  CheckCircle2
} from 'lucide-react';

export function CitizenReportsPanel() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [isAppwriteLive, setIsAppwriteLive] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Enforcement action dialog states
  const [showChallanDialog, setShowChallanDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [challanNotes, setChallanNotes] = useState('Obstruction of public traffic flow verified via citizen camera evidence.');
  const [rejectReason, setRejectReason] = useState('Insufficient visual evidence or vehicle within permissible dwell limit.');

  useEffect(() => {
    const update = () => {
      setReports(citizenReportsService.getReports());
      setIsAppwriteLive(citizenReportsService.isAppwriteLive());
    };
    update();
    const unsub = citizenReportsService.subscribe(update);
    return () => unsub();
  }, []);

  const handleIssueChallan = async () => {
    if (!selectedReport) return;
    const ref = await citizenReportsService.issueChallan(selectedReport.id, {
      mvaSection: selectedReport.mvaSection || 'Section 122 MVA (Obstruction)',
      penaltyAmount: selectedReport.penaltyAmount || 500,
      notes: challanNotes
    });
    setShowChallanDialog(false);
    setActionNotice(`E-Challan #${ref} issued successfully for ${selectedReport.registrationPlate || selectedReport.title}!`);
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
    await citizenReportsService.rejectReport(selectedReport.id, rejectReason);
    setShowRejectDialog(false);
    setActionNotice(`Report #${selectedReport.id} dismissed.`);
    setTimeout(() => setActionNotice(null), 4000);
    setSelectedReport(null);
  };

  return (
    <div className="police-card rounded-xl p-2.5 flex flex-col h-full min-h-0 relative border-t-4 border-t-[#F52235] shadow-lg select-none overflow-hidden">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="absolute top-2 left-3 right-3 z-30 bg-[#00D68F] text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black shadow-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="cursor-pointer">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)] shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F52235] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Megaphone size={15} />
          </div>
          <h2 className="text-xs font-black theme-title tracking-wide uppercase">
            {t.reports.title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Appwrite Cloud Realtime Indicator */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F52235]/15 border border-[#F52235]/40 text-[#F52235] text-[9.5px] font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F52235] animate-ping" />
            <Radio size={10} className="text-[#F52235]" />
            <span>Appwrite Cloud</span>
          </div>

          <Link
            href="/citizen-reports"
            className="text-[10px] font-bold text-white bg-[#1677FF] hover:bg-[#0056cc] px-2 py-0.5 rounded flex items-center gap-0.5 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <span>{t.common.viewAll}</span>
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Reports List: Fully Responsive Scroll Area with zero gaps */}
      <div className="space-y-2 my-2 overflow-y-auto pr-1 flex-1 min-h-0">
        {reports.map((report) => {
          const isPending = report.status === 'PENDING' || report.status === 'Pending';
          const isChallan = report.status === 'CHALLAN_ISSUED';
          const isTowed = report.status === 'ENFORCEMENT_COMPLETE';
          const isRejected = report.status === 'REJECTED';

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
              className="p-2 rounded-lg bg-[var(--card-inner)] border border-[var(--card-inner-border)] hover:border-[#F52235] transition-all flex items-center justify-between gap-2.5 cursor-pointer group shadow-sm hover:shadow-md"
            >
              {/* Evidence Thumbnail */}
              <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 border border-black/10 bg-black/40">
                <Image
                  src={report.imageUrl}
                  alt={report.title}
                  fill
                  unoptimized
                  sizes="48px"
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Center Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-black theme-title truncate">
                    {report.title}
                  </h3>
                  <span className={`text-[8px] px-1.5 py-0.2 rounded shrink-0 uppercase tracking-wider font-mono ${badgeClass}`}>
                    {report.status}
                  </span>
                </div>

                {/* Registration Plate Tag */}
                {report.registrationPlate && report.registrationPlate !== 'N/A' && (
                  <div className="inline-block mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-mono font-black text-[9px] border border-amber-600 shadow-xs tracking-wider">
                      {report.registrationPlate}
                    </span>
                  </div>
                )}

                <p className="text-[10px] theme-sub truncate leading-tight mt-0.5 font-medium">
                  {report.description}
                </p>

                <div className="flex items-center gap-2 text-[9px] theme-subtle mt-1 font-medium">
                  <span className="flex items-center gap-0.5 font-mono">
                    <Clock size={9} className="text-[#1677FF]" /> {report.reportedTime}
                  </span>
                  <span className="flex items-center gap-0.5 truncate theme-title font-semibold">
                    <MapPin size={9} className="text-[#F52235] shrink-0" /> {report.location}
                  </span>
                </div>
              </div>

              {/* View Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReport(report);
                }}
                className="px-2 py-1 rounded bg-[#1677FF] hover:bg-[#F52235] text-white text-[9.5px] font-black flex items-center gap-0.5 transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                <Eye size={10} />
                <span>Verify</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Real-time Police Verification Summary Footer */}
      <div className="pt-2 border-t border-[var(--card-inner-border)] shrink-0 flex items-center justify-between text-[10px] theme-sub">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F52235] animate-pulse" />
            <span className="text-[#F52235] font-black">
              {reports.filter(r => r.status === 'PENDING' || r.status === 'Pending').length}
            </span> Pending
          </span>
          <span>•</span>
          <span className="font-semibold">
            <span className="text-[#00D68F] font-bold">
              {reports.filter(r => r.status === 'CHALLAN_ISSUED').length}
            </span> Challans
          </span>
        </div>

        <Link
          href="/citizen-reports"
          className="text-[#1677FF] hover:underline font-bold flex items-center gap-0.5 text-[10px]"
        >
          <span>Enforcement Queue</span>
          <ChevronRight size={11} />
        </Link>
      </div>

      {/* Police Verification & Enforcement Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#06152F] [data-theme='white']:bg-white border-2 border-[#1677FF] rounded-xl max-w-lg w-full p-5 shadow-2xl text-white [data-theme='white']:text-slate-900 relative">
            <button
              onClick={() => {
                setSelectedReport(null);
                setShowChallanDialog(false);
                setShowRejectDialog(false);
              }}
              className="absolute top-3.5 right-3.5 text-[#AFC4E8] [data-theme='white']:text-slate-500 hover:opacity-80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#132B52] [data-theme='white']:border-slate-200">
              <Megaphone size={18} className="text-[#F52235]" />
              <div className="min-w-0">
                <h3 className="font-bold text-sm theme-title truncate">
                  {selectedReport.title}
                </h3>
                <span className="text-[11px] theme-sub font-mono">
                  Report ID: {selectedReport.id} • {selectedReport.reportedTime}
                </span>
              </div>
            </div>

            {/* Evidence Image */}
            <div className="relative w-full h-44 rounded-lg overflow-hidden border border-[#132B52] [data-theme='white']:border-slate-200 mb-3 bg-black">
              <Image
                src={selectedReport.imageUrl}
                alt={selectedReport.title}
                fill
                unoptimized
                sizes="(max-width: 600px) 100vw, 500px"
                className="object-cover"
              />
              {selectedReport.registrationPlate && selectedReport.registrationPlate !== 'N/A' && (
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-black text-xs font-mono border-2 border-black shadow-lg">
                  PLATE: {selectedReport.registrationPlate}
                </div>
              )}
            </div>

            {/* Report Details */}
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-200">
                <div className="theme-sub font-bold mb-0.5">Citizen Tamper-Proof Evidence Report:</div>
                <p className="theme-title leading-relaxed">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-200">
                  <div className="theme-sub font-bold mb-0.5 flex items-center gap-1">
                    <MapPin size={11} className="text-[#F52235]" /> Verified Location
                  </div>
                  <div className="theme-title font-medium truncate">{selectedReport.location}</div>
                  <div className="text-[10px] theme-subtle font-mono mt-0.5">
                    {selectedReport.coords.lat}° N, {selectedReport.coords.lng}° E
                  </div>
                </div>

                <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-200">
                  <div className="theme-sub font-bold mb-0.5 flex items-center gap-1">
                    <User size={11} className="text-[#1677FF]" /> Reporter Identity
                  </div>
                  <div className="theme-title font-medium truncate">{selectedReport.reporterName}</div>
                  <div className="text-[10px] theme-subtle font-mono mt-0.5">
                    {selectedReport.reporterContact}
                  </div>
                </div>
              </div>

              {/* Existing Challan Badge if issued */}
              {selectedReport.challanReference && (
                <div className="p-2.5 rounded bg-[#00D68F]/15 border border-[#00D68F]/40 text-[#00D68F]">
                  <div className="font-extrabold text-[11px] flex items-center gap-1.5">
                    <ShieldCheck size={14} /> E-CHALLAN GENERATED: {selectedReport.challanReference}
                  </div>
                  <div className="text-[10px] font-mono mt-0.5">
                    Fine: ₹{selectedReport.penaltyAmount || 500} • {selectedReport.mvaSection}
                  </div>
                  {selectedReport.challanNotes && (
                    <div className="text-[9.5px] mt-1 opacity-90">{selectedReport.challanNotes}</div>
                  )}
                </div>
              )}

              {/* Sub-dialog 1: Issue Challan Form */}
              {showChallanDialog && (
                <div className="p-2.5 rounded bg-[#0A1B39] [data-theme='white']:bg-blue-50 border border-[#1677FF] space-y-2">
                  <div className="font-extrabold text-xs text-[#38BDF8] [data-theme='white']:text-blue-700 flex items-center gap-1">
                    <FileText size={13} /> Issue Electronic Violation Challan (MVA Section 122)
                  </div>
                  <div>
                    <label className="text-[10px] theme-sub font-bold block mb-0.5">Officer Verification Notes:</label>
                    <input
                      type="text"
                      value={challanNotes}
                      onChange={(e) => setChallanNotes(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#030D1E] [data-theme='white']:bg-white border border-[#132B52] [data-theme='white']:border-slate-300 text-xs theme-title"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setShowChallanDialog(false)}
                      className="px-2.5 py-1 rounded bg-black/40 [data-theme='white']:bg-slate-200 text-xs theme-sub font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleIssueChallan}
                      className="px-3 py-1 rounded bg-[#00D68F] hover:bg-[#00ba7c] text-slate-950 font-black text-xs shadow-md cursor-pointer"
                    >
                      Confirm & Issue E-Challan (₹{selectedReport.penaltyAmount || 500})
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-dialog 2: Dismiss Report Form */}
              {showRejectDialog && (
                <div className="p-2.5 rounded bg-[#0A1B39] [data-theme='white']:bg-red-50 border border-[#EF4444] space-y-2">
                  <div className="font-extrabold text-xs text-[#EF4444] flex items-center gap-1">
                    <AlertTriangle size={13} /> Dismiss Citizen Report
                  </div>
                  <div>
                    <label className="text-[10px] theme-sub font-bold block mb-0.5">Dismissal Reason:</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#030D1E] [data-theme='white']:bg-white border border-[#132B52] [data-theme='white']:border-slate-300 text-xs theme-title"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setShowRejectDialog(false)}
                      className="px-2.5 py-1 rounded bg-black/40 [data-theme='white']:bg-slate-200 text-xs theme-sub font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDismissReport}
                      className="px-3 py-1 rounded bg-[#EF4444] hover:bg-red-700 text-white font-black text-xs shadow-md cursor-pointer"
                    >
                      Confirm Dismissal
                    </button>
                  </div>
                </div>
              )}

              {/* THREE CORE ENFORCEMENT ACTIONS (Requested in Task) */}
              {!showChallanDialog && !showRejectDialog && (
                <div className="pt-2 border-t border-[#132B52] [data-theme='white']:border-slate-200">
                  <div className="text-[10.5px] font-bold theme-sub mb-1.5">Police Verification Enforcement Actions:</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Action 1: Approve & Issue e-Challan */}
                    <button
                      onClick={() => setShowChallanDialog(true)}
                      className="p-2 rounded-lg bg-[#00D68F] hover:bg-[#00ba7c] text-slate-950 font-black text-[10px] flex flex-col items-center justify-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      <FileText size={14} />
                      <span className="text-center leading-tight">Approve & Issue e-Challan</span>
                    </button>

                    {/* Action 2: Dispatch Towing */}
                    <button
                      onClick={handleDispatchTowing}
                      className="p-2 rounded-lg bg-[#1677FF] hover:bg-[#0056cc] text-white font-extrabold text-[10px] flex flex-col items-center justify-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      <Truck size={14} />
                      <span className="text-center leading-tight">Dispatch Towing Unit</span>
                    </button>

                    {/* Action 3: Dismiss Report */}
                    <button
                      onClick={() => setShowRejectDialog(true)}
                      className="p-2 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 border border-[#EF4444]/40 text-[#EF4444] font-bold text-[10px] flex flex-col items-center justify-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      <AlertTriangle size={14} />
                      <span className="text-center leading-tight">Dismiss Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2.5 border-t border-[#132B52] [data-theme='white']:border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setShowChallanDialog(false);
                  setShowRejectDialog(false);
                }}
                className="px-4 py-1.5 rounded bg-[#132B52] [data-theme='white']:bg-slate-200 hover:bg-[#1677FF] text-xs font-bold text-white [data-theme='white']:text-slate-800 transition-colors cursor-pointer"
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
