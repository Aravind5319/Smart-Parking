'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { trafficSignalService } from '@/lib/services/trafficSignalService';
import { TrafficSignal, TrafficEvent, AmbulanceState, GeofenceArea } from '@/lib/types/dashboard';
import { Network, CheckCircle2, Shield, Radio, Play, Pause, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

export default function TrafficControlPage() {
  const { t } = useLanguage();
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [ambulance, setAmbulance] = useState<AmbulanceState | null>(null);
  const [geofence, setGeofence] = useState<GeofenceArea | null>(null);
  const [events, setEvents] = useState<TrafficEvent[]>([]);

  useEffect(() => {
    const update = () => {
      setSignals(trafficSignalService.getSignals());
      setAmbulance(trafficSignalService.getAmbulance());
      setGeofence(trafficSignalService.getGeofence());
      setEvents(trafficSignalService.getEvents());
    };
    update();
    const unsub = trafficSignalService.subscribe(update);
    return () => unsub();
  }, []);

  return (
    <div className="h-full flex flex-col gap-3 text-white overflow-y-auto pr-1">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#132B52]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F52235]/20 border border-[#F52235]/40 flex items-center justify-center text-[#F52235]">
            <Network size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">
              {t.nav.trafficControl} — Central Intersection Matrix
            </h1>
            <p className="text-xs text-[#AFC4E8]/70">
              Live automated emergency corridor dispatch & signal preemption management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/30 text-[#00D68F] text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" /> SCATS / ITCS Controller Online
          </span>
        </div>
      </div>

      {/* 4 Signals Cards Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {signals.map((sig) => {
          const isSelected = sig.id === geofence?.targetSignalId;
          const isGreen = sig.state === 'GREEN';
          const isRed = sig.state === 'RED';

          return (
            <div
              key={sig.id}
              onClick={() => trafficSignalService.selectEmergencySignal(sig.id)}
              className={`police-card rounded-xl p-4 border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#00D68F] shadow-[0_0_15px_rgba(0,214,143,0.2)]'
                  : 'hover:border-[#1677FF]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-white">{sig.name}</span>
                <span className="text-[10px] font-mono text-[#AFC4E8]">{sig.id}</span>
              </div>

              {/* Traffic Light Display */}
              <div className="w-12 h-24 bg-black/95 rounded-lg p-1.5 mx-auto my-3 flex flex-col justify-between items-center border border-white/10 shadow-inner">
                <div className={`w-5 h-5 rounded-full ${isRed ? 'bg-[#F52235] traffic-light-red' : 'bg-[#3b080c]'}`} />
                <div className="w-5 h-5 rounded-full bg-[#3b2a08]" />
                <div className={`w-5 h-5 rounded-full ${isGreen ? 'bg-[#00D68F] traffic-light-green' : 'bg-[#083b23]'}`} />
              </div>

              <div className="text-center">
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  isGreen ? 'bg-[#00D68F]/20 text-[#00D68F]' : 'bg-[#F52235]/20 text-[#F52235]'
                }`}>
                  {sig.state} SIGNAL
                </span>
                {isSelected && (
                  <div className="text-[10px] text-[#00D68F] font-bold mt-1">
                    Emergency Target Active
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Geofence & Emergency Corridor Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1">
        {/* Left: Quick Actions */}
        <div className="police-card rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Radio size={16} className="text-[#1677FF]" /> Manual Emergency Corridor Actions
            </h2>
            <p className="text-xs text-[#AFC4E8]/80 mb-3 leading-relaxed">
              Manually trigger emergency corridor overrides, force traffic clearance for emergency vehicles, or restore the standard cyclic algorithm.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => trafficSignalService.triggerEnterGeofence()}
                className="w-full p-2.5 rounded-lg bg-[#00D68F]/15 hover:bg-[#00D68F]/25 border border-[#00D68F]/40 text-[#00D68F] font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Trigger Geofence Entry (Force GREEN Corridor)</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => trafficSignalService.triggerExitGeofence()}
                className="w-full p-2.5 rounded-lg bg-[#1677FF]/15 hover:bg-[#1677FF]/25 border border-[#1677FF]/40 text-[#1677FF] font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Trigger Geofence Exit (Restore Normal Cycle)</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => trafficSignalService.resetSimulation()}
                className="w-full p-2.5 rounded-lg bg-[#0A1B39] hover:bg-[#132B52] border border-[#132B52] text-white font-bold text-xs flex items-center justify-between transition-colors"
              >
                <span>Reset Ambulance Route to Start</span>
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {ambulance && (
            <div className="mt-4 p-2.5 rounded-lg bg-[#0A1B39] border border-[#132B52] text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Ambulance GPS:</span> {ambulance.lat}° N, {ambulance.lng}° E
              </div>
              <span className="text-[#00D68F] font-mono font-bold">{ambulance.speed} km/h</span>
            </div>
          )}
        </div>

        {/* Right: Live Event Log */}
        <div className="police-card rounded-xl p-4 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Shield size={16} className="text-[#F52235]" /> Real-time Transition Event Log
          </h2>

          <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
            {events.map((evt) => (
              <div key={evt.id} className="p-2 rounded-lg bg-[#06152F] border border-[#132B52] text-xs flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1677FF] shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="text-white leading-snug">{evt.title}</div>
                  <div className="text-[10px] text-[#AFC4E8]/60 font-mono mt-0.5">{evt.timestamp}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-[#AFC4E8]/60 pt-2 border-t border-[#132B52]/60 mt-2">
            Automated ITCS hardware synchronization active.
          </div>
        </div>
      </div>
    </div>
  );
}
