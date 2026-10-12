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
  CheckCircle, 
  User, 
  Phone, 
  AlertCircle 
} from 'lucide-react';

export function CitizenReportsPanel() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);

  useEffect(() => {
    const update = () => {
      setReports(citizenReportsService.getReports());
    };
    update();
    const unsub = citizenReportsService.subscribe(update);
    return () => unsub();
  }, []);

  const handleStatusChange = (status: CitizenReport['status']) => {
    if (selectedReport) {
      citizenReportsService.updateStatus(selectedReport.id, status);
      setSelectedReport({ ...selectedReport, status });
    }
  };

  return (
    <div className="police-card rounded-xl p-3 flex flex-col justify-between h-[52%] relative border-t-4 border-t-[#F52235] shadow-lg select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F52235] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Megaphone size={15} />
          </div>
          <h2 className="text-xs font-black theme-title tracking-wide uppercase">
            {t.reports.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F52235] text-white text-[10px] font-extrabold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>{t.reports.liveUpdates}</span>
          </div>
          <Link
            href="/citizen-reports"
            className="text-[10px] font-bold text-white bg-[#1677FF] hover:bg-[#0056cc] px-2 py-0.5 rounded flex items-center gap-0.5 transition-colors shadow-xs"
          >
            <span>{t.common.viewAll}</span>
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-1.5 my-2 overflow-y-auto max-h-[220px] pr-1 flex-1">
        {reports.slice(0, 4).map((report) => {
          const isPending = report.status === 'Pending';
          const isInProgress = report.status === 'In Progress';

          const badgeClass = isPending
            ? 'bg-[#F52235] text-white font-extrabold shadow-xs'
            : isInProgress
            ? 'bg-[#1677FF] text-white font-extrabold shadow-xs'
            : 'bg-[#00D68F] text-[#051329] font-black shadow-xs';

          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="p-1.5 rounded-lg bg-[var(--card-inner)] border border-[var(--card-inner-border)] hover:border-[#F52235] transition-all flex items-center justify-between gap-2.5 cursor-pointer group shadow-sm hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 border border-black/10">
                <Image
                  src={report.imageUrl}
                  alt={report.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Center Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-black theme-title truncate">
                    {report.title}
                  </h3>
                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded shrink-0 uppercase tracking-wider ${badgeClass}`}>
                    {report.status}
                  </span>
                </div>
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
                className="px-2 py-1 rounded bg-[#1677FF] hover:bg-[#F52235] text-white text-[9.5px] font-black flex items-center gap-0.5 transition-colors shrink-0 shadow-xs"
              >
                <Eye size={10} />
                <span>View</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#06152F] border border-[#1677FF]/50 rounded-xl max-w-lg w-full p-5 shadow-2xl text-white relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-3.5 right-3.5 text-[#AFC4E8] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#132B52]">
              <Megaphone size={18} className="text-[#F52235]" />
              <div>
                <h3 className="font-bold text-sm text-white">
                  {selectedReport.title}
                </h3>
                <span className="text-[11px] text-[#AFC4E8] font-mono">
                  {selectedReport.id} • {selectedReport.reportedTime}
                </span>
              </div>
            </div>

            {/* Photo Preview */}
            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[#132B52] mb-3">
              <Image
                src={selectedReport.imageUrl}
                alt={selectedReport.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-[#0A1B39] border border-[#132B52]">
                <div className="text-[#AFC4E8] font-bold mb-0.5">{t.reports.description}</div>
                <p className="text-white leading-relaxed">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-[#0A1B39] border border-[#132B52]">
                  <div className="text-[#AFC4E8] font-bold mb-0.5 flex items-center gap-1">
                    <MapPin size={11} className="text-[#F52235]" /> {t.common.location}
                  </div>
                  <div className="text-white font-medium">{selectedReport.location}</div>
                  <div className="text-[10px] text-[#AFC4E8]/60 font-mono mt-0.5">
                    {selectedReport.coords.lat}° N, {selectedReport.coords.lng}° E
                  </div>
                </div>

                <div className="p-2 rounded bg-[#0A1B39] border border-[#132B52]">
                  <div className="text-[#AFC4E8] font-bold mb-0.5 flex items-center gap-1">
                    <User size={11} className="text-[#1677FF]" /> Citizen
                  </div>
                  <div className="text-white font-medium">{selectedReport.reporterName}</div>
                  <div className="text-[10px] text-[#AFC4E8]/60 font-mono mt-0.5">
                    {selectedReport.reporterContact}
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="p-2.5 rounded bg-[#0A1B39] border border-[#132B52] flex items-center justify-between">
                <span className="text-xs font-bold text-white">Status Action:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleStatusChange('Pending')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                      selectedReport.status === 'Pending' ? 'bg-[#F52235] text-white' : 'bg-[#06152F] text-[#AFC4E8]'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange('In Progress')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                      selectedReport.status === 'In Progress' ? 'bg-[#1677FF] text-white' : 'bg-[#06152F] text-[#AFC4E8]'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange('Resolved')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                      selectedReport.status === 'Resolved' ? 'bg-[#00D68F] text-black font-extrabold' : 'bg-[#06152F] text-[#AFC4E8]'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#132B52] flex justify-end gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 rounded bg-[#132B52] hover:bg-[#1677FF] text-xs font-bold text-white transition-colors"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
