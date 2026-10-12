'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { parkingService } from '@/lib/services/parkingService';
import { trafficSignalService } from '@/lib/services/trafficSignalService';
import { citizenReportsService } from '@/lib/services/citizenReportsService';
import { BarChart2, Download, Search, FileText, CheckCircle2, Shield, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'challans' | 'traffic' | 'citizen'>('challans');
  const [searchTerm, setSearchTerm] = useState('');

  const challans = parkingService.getChallans();
  const trafficEvents = trafficSignalService.getEvents();
  const citizenReports = citizenReportsService.getReports();

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeCategory === 'challans') {
      csvContent += 'ID,Vehicle,Type,Location,Fine,Status,Time\n';
      challans.forEach((c) => {
        csvContent += `${c.id},"${c.vehicleNo}","${c.violationType}","${c.location}",${c.fineAmount},"${c.status}","${c.timestamp}"\n`;
      });
    } else if (activeCategory === 'traffic') {
      csvContent += 'ID,Event,Type,Time\n';
      trafficEvents.forEach((e) => {
        csvContent += `${e.id},"${e.title}","${e.type}","${e.timestamp}"\n`;
      });
    } else {
      csvContent += 'ID,Title,Location,Status,Reporter,Time\n';
      citizenReports.forEach((r) => {
        csvContent += `${r.id},"${r.title}","${r.location}","${r.status}","${r.reporterName}","${r.reportedTime}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pondicherry_Police_${activeCategory}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col gap-3 text-white overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#132B52] gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1677FF]/20 border border-[#1677FF]/40 flex items-center justify-center text-[#1677FF]">
            <BarChart2 size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">
              {t.nav.reports} — Enforcement Audit & Event Log
            </h1>
            <p className="text-xs text-[#AFC4E8]/70">
              Downloadable audit records for parking violations, automated e-challans, and emergency corridor transitions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-[#00D68F] hover:bg-[#00D68F]/80 text-[#06152F] font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-[#132B52] pb-2">
        <button
          onClick={() => setActiveCategory('challans')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeCategory === 'challans'
              ? 'bg-[#F52235] text-white shadow-xs'
              : 'bg-[#0A1B39] text-[#AFC4E8] hover:text-white'
          }`}
        >
          E-Challans & Violations ({challans.length})
        </button>
        <button
          onClick={() => setActiveCategory('traffic')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeCategory === 'traffic'
              ? 'bg-[#1677FF] text-white shadow-xs'
              : 'bg-[#0A1B39] text-[#AFC4E8] hover:text-white'
          }`}
        >
          Ambulance & Geofence Log ({trafficEvents.length})
        </button>
        <button
          onClick={() => setActiveCategory('citizen')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeCategory === 'citizen'
              ? 'bg-[#00D68F] text-black shadow-xs font-extrabold'
              : 'bg-[#0A1B39] text-[#AFC4E8] hover:text-white'
          }`}
        >
          Citizen Incidents ({citizenReports.length})
        </button>
      </div>

      {/* Main Table */}
      <div className="police-card rounded-xl p-3 flex-1 overflow-x-auto">
        {activeCategory === 'challans' && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#132B52] text-[#AFC4E8]">
                <th className="p-2">Challan ID</th>
                <th className="p-2">Vehicle No</th>
                <th className="p-2">Violation</th>
                <th className="p-2">Location</th>
                <th className="p-2">Duration</th>
                <th className="p-2">Penalty</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((c) => (
                <tr key={c.id} className="border-b border-[#132B52]/50 hover:bg-[#0A1B39]/50">
                  <td className="p-2 font-mono font-bold text-white">{c.id}</td>
                  <td className="p-2 font-mono font-bold text-[#F52235]">{c.vehicleNo}</td>
                  <td className="p-2 text-[#AFC4E8]">{c.violationType}</td>
                  <td className="p-2 text-[#AFC4E8]">{c.location}</td>
                  <td className="p-2 text-[#FFB800]">{c.durationMinutes} Mins</td>
                  <td className="p-2 font-bold text-[#00D68F]">₹{c.fineAmount}</td>
                  <td className="p-2">
                    <span className="px-2 py-0.5 rounded bg-[#F52235]/20 text-[#F52235] text-[10px] font-bold">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeCategory === 'traffic' && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#132B52] text-[#AFC4E8]">
                <th className="p-2">Event ID</th>
                <th className="p-2">Timestamp</th>
                <th className="p-2">Event Type</th>
                <th className="p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {trafficEvents.map((e) => (
                <tr key={e.id} className="border-b border-[#132B52]/50 hover:bg-[#0A1B39]/50">
                  <td className="p-2 font-mono font-bold text-white">{e.id}</td>
                  <td className="p-2 font-mono text-[#AFC4E8]">{e.timestamp}</td>
                  <td className="p-2 font-bold text-[#1677FF]">{e.type}</td>
                  <td className="p-2 text-white">{e.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeCategory === 'citizen' && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#132B52] text-[#AFC4E8]">
                <th className="p-2">Report ID</th>
                <th className="p-2">Title</th>
                <th className="p-2">Location</th>
                <th className="p-2">Reporter</th>
                <th className="p-2">Time</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {citizenReports.map((r) => (
                <tr key={r.id} className="border-b border-[#132B52]/50 hover:bg-[#0A1B39]/50">
                  <td className="p-2 font-mono font-bold text-white">{r.id}</td>
                  <td className="p-2 font-bold text-white">{r.title}</td>
                  <td className="p-2 text-[#AFC4E8]">{r.location}</td>
                  <td className="p-2 text-[#AFC4E8]">{r.reporterName}</td>
                  <td className="p-2 text-[#AFC4E8]/60 font-mono">{r.reportedTime}</td>
                  <td className="p-2">
                    <span className="px-2 py-0.5 rounded bg-[#1677FF]/20 text-[#1677FF] text-[10px] font-bold">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
