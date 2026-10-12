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
  AlertTriangle, 
  Plus, 
  RotateCcw, 
  FileText, 
  X, 
  CheckCircle, 
  Shield,
  HelpCircle,
  Camera,
  Maximize2,
  Info
} from 'lucide-react';

export function AIParkingMonitor() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<VehicleDetection[]>([]);
  const [challans, setChallans] = useState<EChallanRecord[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isCameraOnline, setIsCameraOnline] = useState(true);
  const [showSimControls, setShowSimControls] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<EChallanRecord | null>(null);
  const [liveTimestamp, setLiveTimestamp] = useState('12-10-2026 08:52:26');
  const [activeCameraId, setActiveCameraId] = useState('CAM-01');

  useEffect(() => {
    const update = () => {
      setVehicles(parkingService.getVehicles());
      setChallans(parkingService.getChallans());
      setSpeedMultiplier(parkingService.getSpeedMultiplier());
      setIsCameraOnline(parkingService.getIsCameraConnected());
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

  const violationCount = vehicles.filter(v => v.status === 'VIOLATION' || v.status === 'ECHALLAN_ISSUED').length;

  return (
    <div className="police-card rounded-xl p-3 flex flex-col justify-between h-full relative border-t-4 border-t-[#F52235] shadow-lg select-none">

      {/* Card Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F52235]/20 border border-[#F52235]/40 flex items-center justify-center text-[#F52235] shrink-0 shadow-sm">
            <Video size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold theme-title tracking-wide leading-tight">
              {t.parking.title}
            </h2>
            <p className="text-[11px] theme-sub leading-tight font-medium mt-0.5">
              OpenCV AI Detection • Beach Road Sector
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Fast-Forward Action Trigger in Header */}
          <button
            onClick={() => parkingService.fastForwardTenMinutes()}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F52235] hover:bg-[#d8192b] text-white text-[10.5px] font-black transition-all shadow-sm active:scale-95"
            title="Fast forward 10 minutes to trigger E-Challan"
          >
            <FastForward size={12} />
            <span className="hidden sm:inline">Fast-Forward (10m)</span>
          </button>

          {/* How It Works Info Modal Toggle */}
          <button
            onClick={() => setShowHowItWorksModal(true)}
            className="p-1.5 rounded theme-inner-card hover:bg-white/10 theme-sub hover:text-[#1677FF] border border-[var(--card-inner-border)] transition-colors"
            title="How OpenCV AI Parking Detection Works"
          >
            <Info size={14} />
          </button>

          {/* Simulation Sliders Toggle */}
          <button
            onClick={() => setShowSimControls(!showSimControls)}
            className="p-1.5 rounded theme-inner-card hover:bg-white/10 theme-sub hover:text-[#1677FF] border border-[var(--card-inner-border)] transition-colors"
            title="Configure OpenCV Simulation"
          >
            <Sliders size={14} />
          </button>

          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/40 text-[#00D68F] text-[10.5px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            <span className="hidden md:inline">{t.parking.liveCamera}</span>
          </div>
        </div>
      </div>

      {/* Spacious Full-Height Camera Video Surveillance Area (Spacious Live Feed) */}
      <div className="relative my-2 rounded-xl overflow-hidden border border-[#132B52] bg-[#020813] flex-1 min-h-[340px] lg:min-h-0 w-full select-none shadow-inner flex flex-col justify-between">
        {/* Real Beach Road Surveillance Feed Image */}
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
            <span className="bg-black/80 backdrop-blur-xs text-white px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono font-bold shadow-sm">
              {liveTimestamp}
            </span>
            <button 
              onClick={() => parkingService.addViolationVehicle()} 
              className="bg-[#F52235]/90 hover:bg-[#F52235] text-white p-1 rounded border border-white/20 text-[10px] transition-colors"
              title="Add violation vehicle"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Demarcated Visual Lanes (Left: Parking Area / Right: Non-Parking Area) */}
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
                onClick={() => {
                  const ch = challans.find((c) => c.vehicleNo === v.vehicleNo);
                  if (ch) setSelectedChallan(ch);
                }}
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
                  <div className={`absolute -top-5 left-0 px-2 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase font-mono ${labelBg} shadow-sm flex items-center gap-1`}>
                    {isEChallan && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    <span>{isAllowed ? 'ALLOWED' : 'PARKED'}</span>
                    <span className="opacity-75">| {v.vehicleNo}</span>
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
          <div className="flex items-center gap-2">
            <span className="bg-[#1677FF]/80 text-white font-mono font-bold px-2 py-0.5 rounded text-[9.5px]">
              Active: {vehicles.length} Units
            </span>
            {violationCount > 0 ? (
              <span className="bg-[#F52235] text-white font-mono font-bold px-2 py-0.5 rounded text-[9.5px] animate-pulse">
                Violation: {violationCount} Active
              </span>
            ) : (
              <span className="bg-[#00D68F]/80 text-[#06152F] font-mono font-bold px-2 py-0.5 rounded text-[9.5px]">
                No Violations
              </span>
            )}
          </div>

          {/* Compact Legend Pills */}
          <div className="flex items-center gap-3 font-semibold text-white/90">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F52235]" />
              <span className="text-[9.5px]">Parked (Violation)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FFB800]" />
              <span className="text-[9.5px]">&gt; 10 min (E-Challan)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00D68F]" />
              <span className="text-[9.5px]">Allowed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Simulation Controls Drawer */}
      {showSimControls && (
        <div className="absolute top-12 right-3 z-30 w-72 bg-[#06152F] border border-[#1677FF]/50 rounded-xl p-3 shadow-2xl space-y-2.5 text-white">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#132B52]">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders size={13} className="text-[#1677FF]" /> {t.parking.simControls}
            </span>
            <button onClick={() => setShowSimControls(false)} className="text-[#AFC4E8] hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => parkingService.addViolationVehicle()}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] hover:bg-[#132B52] text-xs font-semibold text-white flex items-center justify-between border border-[#132B52]"
            >
              <span className="flex items-center gap-1.5"><Plus size={12} className="text-[#F52235]" /> {t.parking.addViolation}</span>
            </button>

            <button
              onClick={() => parkingService.fastForwardTenMinutes()}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] hover:bg-[#132B52] text-xs font-semibold text-white flex items-center justify-between border border-[#132B52]"
            >
              <span className="flex items-center gap-1.5"><FastForward size={12} className="text-[#FFB800]" /> {t.parking.fastForward}</span>
            </button>

            <button
              onClick={() => parkingService.resetSimulation()}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] hover:bg-[#132B52] text-xs font-semibold text-white flex items-center justify-between border border-[#132B52]"
            >
              <span className="flex items-center gap-1.5"><RotateCcw size={12} className="text-[#1677FF]" /> {t.parking.resetSim}</span>
            </button>
          </div>

          <div className="pt-1.5 border-t border-[#132B52] flex items-center justify-between text-xs">
            <span className="text-[#AFC4E8]">{t.parking.speedMultiplier}:</span>
            <div className="flex gap-1">
              {[1, 5, 10, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => parkingService.setSpeedMultiplier(m)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    speedMultiplier === m ? 'bg-[#1677FF] text-white' : 'bg-[#0A1B39] text-[#AFC4E8]'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* "How It Works" Popover Modal (Now accessible cleanly without taking up screen space) */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#06152F] border-2 border-[#1677FF] rounded-xl max-w-md w-full p-5 shadow-2xl text-white relative">
            <button
              onClick={() => setShowHowItWorksModal(false)}
              className="absolute top-3.5 right-3.5 text-[#AFC4E8] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#132B52]">
              <Lightbulb size={18} className="text-[#FFB800]" />
              <h3 className="font-extrabold text-sm text-white">
                OpenCV AI Parking Detection: How It Works
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#0A1B39] border border-[#132B52]">
                <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                <p className="leading-relaxed text-white/95">{t.parking.step1}</p>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#0A1B39] border border-[#132B52]">
                <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                <p className="leading-relaxed text-white/95">{t.parking.step2}</p>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#0A1B39] border border-[#132B52]">
                <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                <p className="leading-relaxed text-white/95">{t.parking.step3}</p>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded bg-[#0A1B39] border border-[#F52235]/40">
                <span className="w-5 h-5 rounded-full bg-[#F52235] text-white font-black text-xs flex items-center justify-center shrink-0">4</span>
                <p className="leading-relaxed text-white font-semibold">{t.parking.step4}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#132B52] flex justify-end">
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="px-4 py-1.5 rounded bg-[#1677FF] hover:bg-[#0056cc] text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-Challan Inspection Modal */}
      {selectedChallan && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#06152F] border-2 border-[#F52235] rounded-xl max-w-md w-full p-5 shadow-2xl text-white relative">
            <button
              onClick={() => setSelectedChallan(null)}
              className="absolute top-3 right-3 text-[#AFC4E8] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#132B52]">
              <Image src="/emblem.png" alt="Emblem" width={44} height={44} className="object-contain" />
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-wide">
                  PUDUCHERRY POLICE DEPARTMENT
                </h3>
                <span className="text-[11px] text-[#F52235] font-bold tracking-wider">
                  ELECTRONIC TRAFFIC VIOLATION CHALLAN
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-[#0A1B39] border border-[#132B52] flex justify-between">
                <span className="text-[#AFC4E8]">{t.parking.challanId}:</span>
                <span className="font-mono font-bold text-white">{selectedChallan.id}</span>
              </div>
              <div className="p-2 rounded bg-[#0A1B39] border border-[#132B52] flex justify-between">
                <span className="text-[#AFC4E8]">{t.parking.vehicleNo}:</span>
                <span className="font-mono font-bold text-[#F52235]">{selectedChallan.vehicleNo}</span>
              </div>
              <div className="p-2 rounded bg-[#0A1B39] border border-[#132B52] flex justify-between">
                <span className="text-[#AFC4E8]">Violation:</span>
                <span className="text-white text-right">{selectedChallan.violationType}</span>
              </div>
              <div className="p-2 rounded bg-[#0A1B39] border border-[#132B52] flex justify-between">
                <span className="text-[#AFC4E8]">Duration Exceeded:</span>
                <span className="text-[#FFB800] font-bold">{selectedChallan.durationMinutes} Minutes</span>
              </div>
              <div className="p-2 rounded bg-[#0A1B39] border border-[#132B52] flex justify-between">
                <span className="text-[#AFC4E8]">{t.parking.penalty}:</span>
                <span className="font-bold text-[#00D68F] text-sm">₹{selectedChallan.fineAmount}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#132B52] flex justify-end gap-2">
              <button
                onClick={() => setSelectedChallan(null)}
                className="px-4 py-1.5 rounded bg-[#1677FF] hover:bg-[#1677FF]/80 text-xs font-bold transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
