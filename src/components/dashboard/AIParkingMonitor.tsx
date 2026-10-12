'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { parkingService } from '@/lib/services/parkingService';
import { VehicleDetection, EChallanRecord } from '@/lib/types/dashboard';
import { 
  Video, 
  Lightbulb, 
  Sliders, 
  FastForward, 
  Plus, 
  RotateCcw, 
  X, 
  CheckCircle, 
  Info,
  Printer
} from 'lucide-react';

export function AIParkingMonitor() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<VehicleDetection[]>([]);
  const [challans, setChallans] = useState<EChallanRecord[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showSimControls, setShowSimControls] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetection | null>(null);
  const [selectedChallan, setSelectedChallan] = useState<EChallanRecord | null>(null);
  const [liveTimestamp, setLiveTimestamp] = useState('12-10-2026 10:47:34');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setVehicles(parkingService.getVehicles());
      setChallans(parkingService.getChallans());
      setSpeedMultiplier(parkingService.getSpeedMultiplier());
    };

    update();
    const unsub = parkingService.subscribe(update);

    const clockTimer = setInterval(() => {
      const now = new Date();
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const y = now.getFullYear();
      const time = now.toLocaleTimeString('en-GB', { hour12: false });
      setLiveTimestamp(`${d}-${m}-${y} ${time}`);
    }, 1000);

    return () => {
      unsub();
      clearInterval(clockTimer);
    };
  }, []);

  const triggerFastForward = () => {
    parkingService.fastForwardTenMinutes();
    setToastMessage(t.parking.fastForwardNotice);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleVehicleClick = (v: VehicleDetection) => {
    setSelectedVehicle(v);
    const ch = challans.find((c) => c.vehicleNo === v.vehicleNo);
    if (ch) {
      setSelectedChallan(ch);
    } else {
      setSelectedChallan(null);
    }
  };

  const violationCount = vehicles.filter(v => v.status === 'VIOLATION' || v.status === 'ECHALLAN_ISSUED').length;

  return (
    <div className="police-card rounded-xl p-2.5 flex flex-col h-full min-h-0 relative border-t-4 border-t-[#F52235] shadow-lg select-none overflow-hidden">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-2 left-3 right-3 z-40 bg-[#F52235] text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-1.5 truncate">
            <CheckCircle size={14} className="shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-80 cursor-pointer ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Card Header (Guaranteed clear layout without squishing) */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)] shrink-0 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F52235]/20 border border-[#F52235]/40 flex items-center justify-center text-[#F52235] shrink-0 shadow-sm">
            <Video size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold theme-title tracking-wide leading-tight">
              {t.parking.title}
            </h2>
            <p className="text-[11px] theme-sub leading-tight font-medium mt-0.5">
              {t.parking.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Fast-Forward Action Trigger */}
          <button
            onClick={triggerFastForward}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F52235] hover:bg-[#d8192b] text-white text-[10.5px] font-black transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            title="Fast forward 10 minutes to trigger E-Challan citations"
          >
            <FastForward size={12} className="shrink-0" />
            <span>{t.parking.fastForward}</span>
          </button>

          {/* How It Works Info Toggle */}
          <button
            onClick={() => setShowHowItWorksModal(true)}
            className="p-1.5 rounded theme-inner-card hover:bg-black/10 dark:hover:bg-white/10 theme-sub hover:text-[#1677FF] border border-[var(--card-inner-border)] transition-colors cursor-pointer shrink-0"
            title="How OpenCV AI Parking Detection Works"
          >
            <Info size={14} />
          </button>

          {/* Simulation Sliders Toggle */}
          <button
            onClick={() => setShowSimControls(!showSimControls)}
            className="p-1.5 rounded theme-inner-card hover:bg-black/10 dark:hover:bg-white/10 theme-sub hover:text-[#1677FF] border border-[var(--card-inner-border)] transition-colors cursor-pointer shrink-0"
            title="Configure OpenCV Simulation"
          >
            <Sliders size={14} />
          </button>

          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/40 text-[#00D68F] text-[10.5px] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            <span>{t.parking.liveCamera}</span>
          </div>
        </div>
      </div>

      {/* Camera Video Surveillance Area */}
      <div className="relative my-1.5 rounded-xl overflow-hidden border border-[#132B52] bg-[#020813] flex-1 min-h-0 w-full select-none shadow-inner flex flex-col justify-between">
        <Image
          src="/beach_road_camera.jpg"
          alt="Beach Road Surveillance Feed"
          fill
          className="object-cover"
          priority
        />

        {/* Top Overlay: Camera Selector, Resolution & Live Timestamp */}
        <div className="relative z-10 p-2.5 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/85 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="bg-[#0A1B39]/90 text-white px-2.5 py-0.5 rounded-md border border-white/20 text-[10px] font-mono font-black flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F52235] animate-ping" />
              Camera 01 - Beach Road
            </span>
            <span className="bg-black/75 text-[#38BDF8] px-2 py-0.5 rounded border border-white/10 text-[9.5px] font-mono font-bold hidden sm:inline">
              1080p • 30 FPS • AI ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-black/80 text-white px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono font-bold shadow-sm">
              {liveTimestamp}
            </span>
            <button 
              onClick={() => parkingService.addViolationVehicle()} 
              className="bg-[#F52235]/90 hover:bg-[#F52235] text-white p-1 rounded border border-white/20 text-[10px] transition-colors cursor-pointer"
              title="Add violation vehicle"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Demarcated Visual Lanes */}
        <div className="absolute inset-0 pointer-events-none flex">
          {/* Left Lane: Parking Area */}
          <div className="w-[46%] h-full border-r-2 border-dashed border-[#F52235]/70 bg-[#F52235]/5 flex flex-col justify-between p-2">
            <div className="w-fit bg-[#F52235]/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
              PARKING LANE
            </div>
            <div className="w-fit bg-[#F52235] text-white text-[11px] font-extrabold px-3 py-1 rounded shadow-md border border-white/20 tracking-wider">
              {t.parking.parkingArea}
            </div>
          </div>

          {/* Right Lane: Non-Parking / Active Traffic */}
          <div className="w-[54%] h-full border-l-2 border-dashed border-[#00D68F]/70 bg-[#00D68F]/5 flex flex-col justify-between p-2 items-end">
            <div className="w-fit bg-[#00D68F]/90 text-[#06152F] text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
              CLEARWAY / NO PARKING
            </div>
            <div className="w-fit bg-[#00D68F] text-[#06152F] text-[11px] font-extrabold px-3 py-1 rounded shadow-md border border-black/20 tracking-wider">
              {t.parking.nonParkingArea}
            </div>
          </div>
        </div>

        {/* Dynamic Vehicle Bounding Boxes Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {vehicles.map((v) => {
            const isEChallan = v.status === 'ECHALLAN_ISSUED';
            const isWarning = v.status === 'WARNING';
            const isAllowed = v.status === 'ALLOWED';

            const borderColor = isEChallan || v.status === 'VIOLATION' ? '#F52235' : isWarning ? '#FFB800' : '#00D68F';
            const labelBg = isEChallan ? 'bg-[#F52235]' : isWarning ? 'bg-[#FFB800] text-black' : isAllowed ? 'bg-[#00D68F] text-black' : 'bg-[#F52235] text-white';

            return (
              <div
                key={v.id}
                style={{
                  top: `${v.box.top}%`,
                  left: `${v.box.left}%`,
                  width: `${v.box.width}px`,
                  height: `${v.box.height}px`
                }}
                className="absolute pointer-events-auto border-2 rounded transition-all duration-300 z-10 cursor-pointer group"
                onClick={() => handleVehicleClick(v)}
                title={`Inspect vehicle ${v.vehicleNo}`}
              >
                <div 
                  className="w-full h-full border-2 rounded transition-all group-hover:scale-105"
                  style={{ 
                    borderColor: borderColor,
                    backgroundColor: `${borderColor}18`,
                    boxShadow: isEChallan ? `0 0 14px ${borderColor}` : undefined
                  }}
                >
                  {/* Floating Detection Badge */}
                  <div className={`absolute -top-5 left-0 px-2 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase font-mono ${labelBg} shadow-sm flex items-center gap-1 whitespace-nowrap`}>
                    {isEChallan && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    <span>{isAllowed ? 'ALLOWED' : 'PARKED'}</span>
                    <span className="opacity-80">| {v.vehicleNo}</span>
                  </div>

                  {/* Duration timer badge */}
                  {!isAllowed && (
                    <div className="absolute -bottom-4 right-0 px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-black/85 text-white border border-white/20 shadow-xs">
                      {Math.floor(v.durationSeconds / 60)}m {v.durationSeconds % 60}s
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Spacious Overlay: Active Telemetry & Compact Legend */}
        <div className="relative z-10 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-auto flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-[#1677FF]/85 text-white font-mono font-bold px-2 py-0.5 rounded text-[9.5px]">
              Active: {vehicles.length} Units
            </span>
            {violationCount > 0 ? (
              <span className="bg-[#F52235] text-white font-mono font-bold px-2 py-0.5 rounded text-[9.5px] animate-pulse">
                Violation: {violationCount} Active
              </span>
            ) : (
              <span className="bg-[#00D68F]/85 text-[#06152F] font-mono font-bold px-2 py-0.5 rounded text-[9.5px]">
                No Violations
              </span>
            )}
          </div>

          {/* Compact Legend Pills */}
          <div className="flex items-center gap-3 font-semibold text-white/95 shrink-0">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F52235] shrink-0" />
              <span className="text-[9.5px]">{t.parking.parkedViolation}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FFB800] shrink-0" />
              <span className="text-[9.5px]">{t.parking.eChallanThreshold}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00D68F] shrink-0" />
              <span className="text-[9.5px]">{t.parking.allowed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Simulation Controls Drawer */}
      {showSimControls && (
        <div className="absolute top-12 right-3 z-30 w-72 bg-[#06152F] [data-theme='white']:bg-white border-2 border-[#1677FF] rounded-xl p-3 shadow-2xl space-y-2.5 text-white [data-theme='white']:text-slate-900">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#132B52] [data-theme='white']:border-slate-200">
            <span className="text-xs font-bold flex items-center gap-1.5 text-white [data-theme='white']:text-slate-900">
              <Sliders size={13} className="text-[#1677FF]" /> {t.parking.simControls}
            </span>
            <button onClick={() => setShowSimControls(false)} className="text-[#AFC4E8] [data-theme='white']:text-slate-500 hover:opacity-80 cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => {
                parkingService.addViolationVehicle();
                setToastMessage("Added simulated vehicle in clearway.");
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 hover:bg-[#132B52] [data-theme='white']:hover:bg-slate-200 text-xs font-semibold text-white [data-theme='white']:text-slate-900 flex items-center justify-between border border-[#132B52] [data-theme='white']:border-slate-300 cursor-pointer"
            >
              <span className="flex items-center gap-1.5"><Plus size={12} className="text-[#F52235]" /> {t.parking.addViolation}</span>
            </button>

            <button
              onClick={triggerFastForward}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 hover:bg-[#132B52] [data-theme='white']:hover:bg-slate-200 text-xs font-semibold text-white [data-theme='white']:text-slate-900 flex items-center justify-between border border-[#132B52] [data-theme='white']:border-slate-300 cursor-pointer"
            >
              <span className="flex items-center gap-1.5"><FastForward size={12} className="text-[#FFB800]" /> {t.parking.fastForward}</span>
            </button>

            <button
              onClick={() => {
                parkingService.resetSimulation();
                setToastMessage("Simulation reset.");
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 hover:bg-[#132B52] [data-theme='white']:hover:bg-slate-200 text-xs font-semibold text-white [data-theme='white']:text-slate-900 flex items-center justify-between border border-[#132B52] [data-theme='white']:border-slate-300 cursor-pointer"
            >
              <span className="flex items-center gap-1.5"><RotateCcw size={12} className="text-[#1677FF]" /> {t.parking.resetSim}</span>
            </button>
          </div>

          <div className="pt-1.5 border-t border-[#132B52] [data-theme='white']:border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600">{t.parking.speedMultiplier}:</span>
            <div className="flex gap-1">
              {[1, 5, 10, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => parkingService.setSpeedMultiplier(m)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    speedMultiplier === m ? 'bg-[#1677FF] text-white' : 'bg-[#0A1B39] [data-theme="white"]:bg-slate-200 text-[#AFC4E8] [data-theme="white"]:text-slate-800'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* "How It Works" Popover Modal */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#06152F] [data-theme='white']:bg-white border-2 border-[#1677FF] rounded-xl max-w-md w-full p-5 shadow-2xl text-white [data-theme='white']:text-slate-900 relative">
            <button
              onClick={() => setShowHowItWorksModal(false)}
              className="absolute top-3.5 right-3.5 text-[#AFC4E8] [data-theme='white']:text-slate-500 hover:opacity-80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#132B52] [data-theme='white']:border-slate-200">
              <Lightbulb size={18} className="text-[#FFB800]" />
              <h3 className="font-extrabold text-sm theme-title">
                {t.parking.howItWorksTitle}
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300">
                <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                <p className="leading-relaxed theme-title">{t.parking.step1}</p>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300">
                <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                <p className="leading-relaxed theme-title">{t.parking.step2}</p>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300">
                <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                <p className="leading-relaxed theme-title">{t.parking.step3}</p>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#F52235]/40">
                <span className="w-5 h-5 rounded-full bg-[#F52235] text-white font-black text-xs flex items-center justify-center shrink-0">4</span>
                <p className="leading-relaxed theme-title font-semibold">{t.parking.step4}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#132B52] [data-theme='white']:border-slate-200 flex justify-end">
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="px-4 py-1.5 rounded bg-[#1677FF] hover:bg-[#0056cc] text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Live Inspector / Citation Dialog */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#06152F] [data-theme='white']:bg-white border-2 border-[#1677FF] rounded-xl max-w-md w-full p-5 shadow-2xl text-white [data-theme='white']:text-slate-900 relative">
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-3.5 right-3.5 text-[#AFC4E8] [data-theme='white']:text-slate-500 hover:opacity-80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#132B52] [data-theme='white']:border-slate-200">
              <Image src="/emblem.png" alt="Emblem" width={40} height={40} className="object-contain" />
              <div>
                <h3 className="font-extrabold text-sm theme-title tracking-wide">
                  PUDUCHERRY POLICE DEPARTMENT
                </h3>
                <span className="text-[11px] font-bold text-[#1677FF] tracking-wider uppercase">
                  Vehicle Enforcement Record
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300 flex justify-between items-center">
                <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600 font-semibold">{t.parking.vehicleNo}:</span>
                <span className="font-mono font-black text-sm text-[#F52235]">{selectedVehicle.vehicleNo}</span>
              </div>

              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300 flex justify-between">
                <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600 font-semibold">Model / Type:</span>
                <span className="font-bold theme-title">{selectedVehicle.model}</span>
              </div>

              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300 flex justify-between">
                <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600 font-semibold">Detected Zone:</span>
                <span className={`font-bold ${selectedVehicle.zone === 'PARKING_AREA' ? 'text-[#00D68F]' : 'text-[#F52235]'}`}>
                  {selectedVehicle.zone === 'PARKING_AREA' ? t.parking.parkingArea : t.parking.nonParkingArea}
                </span>
              </div>

              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 border border-[#132B52] [data-theme='white']:border-slate-300 flex justify-between">
                <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600 font-semibold">Dwell Duration:</span>
                <span className="font-mono font-bold text-[#FFB800]">
                  {Math.floor(selectedVehicle.durationSeconds / 60)} Mins {selectedVehicle.durationSeconds % 60} Secs
                </span>
              </div>

              {selectedChallan && (
                <div className="p-2.5 rounded bg-[#F52235]/10 border border-[#F52235]/30 space-y-1 mt-2">
                  <div className="flex justify-between text-[#F52235] font-black">
                    <span>{t.parking.challanId}:</span>
                    <span className="font-mono">{selectedChallan.id}</span>
                  </div>
                  <div className="flex justify-between theme-title font-semibold">
                    <span>{t.parking.penalty}:</span>
                    <span className="text-[#00D68F] font-bold text-sm">₹{selectedChallan.fineAmount}</span>
                  </div>
                  <p className="text-[10px] theme-sub">{selectedChallan.violationType}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#132B52] [data-theme='white']:border-slate-200 flex justify-end gap-2">
              {selectedChallan ? (
                <button
                  onClick={() => {
                    alert(`Printing Official Citation Receipt for ${selectedChallan.id}...`);
                  }}
                  className="px-3 py-1.5 rounded bg-[#1677FF] hover:bg-[#0056cc] text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={12} /> Print Citation
                </button>
              ) : selectedVehicle.status !== 'ALLOWED' ? (
                <button
                  onClick={() => {
                    triggerFastForward();
                    setSelectedVehicle(null);
                  }}
                  className="px-3 py-1.5 rounded bg-[#F52235] hover:bg-[#d8192b] text-xs font-bold text-white cursor-pointer"
                >
                  Issue E-Challan
                </button>
              ) : null}

              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-1.5 rounded bg-[#132B52] [data-theme='white']:bg-slate-200 hover:bg-[#1677FF] [data-theme='white']:hover:bg-slate-300 text-xs font-bold text-white [data-theme='white']:text-slate-800 transition-colors cursor-pointer"
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
