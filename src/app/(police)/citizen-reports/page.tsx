'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { citizenReportsService } from '@/lib/services/citizenReportsService';
import { CitizenReport } from '@/lib/types/dashboard';
import { Megaphone, Search, Filter, MapPin, Clock, Eye, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function CitizenReportsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);

  useEffect(() => {
    const update = () => {
      setReports(citizenReportsService.getReports());
    };
    update();
    const unsub = citizenReportsService.subscribe(update);
    return () => unsub();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (id: string, status: CitizenReport['status']) => {
    citizenReportsService.updateStatus(id, status);
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport({ ...selectedReport, status });
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 text-white overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#132B52] gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F52235]/20 border border-[#F52235]/40 flex items-center justify-center text-[#F52235]">
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">
              {t.nav.citizenReports} — Incident Management Portal
            </h1>
            <p className="text-xs text-[#AFC4E8]/70">
              Verified community reports for parking obstructions, civic hazards, and security alerts
            </p>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#AFC4E8]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0A1B39] border border-[#132B52] text-xs text-white placeholder-[#AFC4E8]/40 focus:outline-none focus:border-[#1677FF] w-48 sm:w-60"
            />
          </div>

          <div className="flex bg-[#0A1B39] p-0.5 rounded-lg border border-[#132B52]">
            {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  filterStatus === st ? 'bg-[#1677FF] text-white' : 'text-[#AFC4E8] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
        {filteredReports.map((report) => {
          const isPending = report.status === 'Pending';
          const isInProgress = report.status === 'In Progress';
          const badgeClass = isPending
            ? 'bg-[#F52235]/20 text-[#F52235] border-[#F52235]/40'
            : isInProgress
            ? 'bg-[#1677FF]/20 text-[#1677FF] border-[#1677FF]/40'
            : 'bg-[#00D68F]/20 text-[#00D68F] border-[#00D68F]/40';

          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="police-card rounded-xl p-3 flex flex-col justify-between border hover:border-[#1677FF] cursor-pointer group transition-all"
            >
              <div>
                {/* Photo */}
                <div className="relative w-full h-36 rounded-lg overflow-hidden border border-[#132B52] bg-black mb-2.5">
                  <Image src={report.imageUrl} alt={report.title} fill className="object-cover group-hover:scale-102 transition-transform" />
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                    {report.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">{report.title}</h3>
                  <span className="text-[10px] font-mono text-[#AFC4E8]">{report.id}</span>
                </div>
                <p className="text-xs text-[#AFC4E8]/80 line-clamp-2 mt-1 leading-snug">
                  {report.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#132B52]/60 mt-3 flex items-center justify-between text-xs text-[#AFC4E8]">
                <span className="flex items-center gap-1 text-[11px] truncate">
                  <MapPin size={12} className="text-[#F52235] shrink-0" /> {report.location}
                </span>
                <span className="text-[10px] text-[#AFC4E8]/60 font-mono shrink-0">
                  {report.reportedTime}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#06152F] border border-[#1677FF]/50 rounded-xl max-w-lg w-full p-5 shadow-2xl text-white relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-3.5 right-3.5 text-[#AFC4E8] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-base text-white mb-1">{selectedReport.title}</h3>
            <span className="text-xs font-mono text-[#AFC4E8] mb-3 block">{selectedReport.id} • {selectedReport.location}</span>

            <div className="relative w-full h-44 rounded-lg overflow-hidden border border-[#132B52] mb-3">
              <Image src={selectedReport.imageUrl} alt={selectedReport.title} fill className="object-cover" />
            </div>

            <div className="p-3 rounded-lg bg-[#0A1B39] border border-[#132B52] text-xs space-y-2 mb-3">
              <div>
                <span className="text-[#AFC4E8] font-bold">Description: </span>
                <span>{selectedReport.description}</span>
              </div>
              <div>
                <span className="text-[#AFC4E8] font-bold">Reporter: </span>
                <span>{selectedReport.reporterName} ({selectedReport.reporterContact})</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#132B52]">
              <span className="text-xs font-bold text-white">Change Status:</span>
              <div className="flex gap-1.5">
                {(['Pending', 'In Progress', 'Resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedReport.id, st)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                      selectedReport.status === st ? 'bg-[#1677FF] text-white' : 'bg-[#0A1B39] text-[#AFC4E8]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
