'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { trafficSignalService } from '@/lib/services/trafficSignalService';
import { TrafficSignal, TrafficEvent, AmbulanceState, GeofenceArea } from '@/lib/types/dashboard';
import { Network, Shield, Radio, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TrafficControlPage() {
  const { t } = useLanguage();
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [ambulance, setAmbulance] = useState<AmbulanceState | null>(null);
  const [geofence, setGeofence] = useState<GeofenceArea | null>(null);
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

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

  const triggerAction = (action: () => void, message: string) => {
    action();
    setActionAlert(message);
    setTimeout(() => setActionAlert(null), 3000);
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto pr-1">
      {/* Toast Alert */}
      {actionAlert && (
        <div className="bg-[#1677FF] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 size={14} />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F52235]/20 border border-[#F52235]/40 flex items-center justify-center text-[#F52235] shrink-0">
            <Network size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold theme-title tracking-wide">
              {t.nav.trafficControl} — Central Intersection Matrix
            </h1>
            <p className="text-xs theme-sub font-medium">
              Live automated emergency corridor dispatch & signal preemption management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/30 text-[#00D68F] text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" /> SCATS ITCS Controller Active
          </span>
        </div>
      </div>

      {/* 4 Signals Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {signals.map((sig) => {
          const isSelected = sig.id === geofence?.targetSignalId;
          const isGreen = sig.state === 'GREEN';
          const isRed = sig.state === 'RED';

          return (
            <div
              key={sig.id}
              onClick={() => {
                triggerAction(
                  () => trafficSignalService.selectEmergencySignal(sig.id),
                  `Set priority green corridor at ${sig.name}`
                );
              }}
              className={`police-card rounded-xl p-3 sm:p-4 border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-[#00D68F] shadow-[0_0_15px_rgba(0,214,143,0.25)]'
                  : 'hover:border-[#1677FF]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold theme-title truncate">{sig.name}</span>
                <span className="text-[10px] font-mono theme-sub shrink-0">{sig.id}</span>
              </div>
              <div className="text-[10px] theme-sub truncate mb-1">
                {sig.locationLabel}
              </div>

              {/* Traffic Light Display */}
              <div className="w-11 h-24 bg-black/95 rounded-lg p-1.5 mx-auto my-2 flex flex-col justify-between items-center border border-white/10 shadow-inner">
                <div className={`w-5 h-5 rounded-full ${isRed ? 'bg-[#F52235] traffic-light-red' : 'bg-[#3b080c]'}`} />
                <div className="w-5 h-5 rounded-full bg-[#3b2a08]" />
                <div className={`w-5 h-5 rounded-full ${isGreen ? 'bg-[#00D68F] traffic-light-green' : 'bg-[#083b23]'}`} />
              </div>

              <div className="text-center space-y-1">
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  isGreen ? 'bg-[#00D68F]/20 text-[#00D68F]' : 'bg-[#F52235]/20 text-[#F52235]'
                }`}>
                  {sig.state} SIGNAL
                </span>
                <div className="text-[9px] font-mono theme-sub">
                  {sig.isInsideGeofence ? (
                    <span className="text-[#00D68F] font-bold">INSIDE GEOFENCE</span>
                  ) : (
                    <span>Distance: {sig.distanceToAmbulance || 0}m</span>
                  )}
                </div>
                {isSelected && (
                  <div className="text-[10px] text-[#00D68F] font-bold">
                    Emergency Priority Active
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Geofence & Emergency Corridor Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-[300px]">
        {/* Left: Quick Actions */}
        <div className="police-card rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-sm font-bold theme-title mb-1.5 flex items-center gap-2">
              <Radio size={16} className="text-[#1677FF]" /> Manual Emergency Corridor Actions
            </h2>
            <p className="text-xs theme-sub mb-3 leading-relaxed">
              Manually trigger emergency corridor overrides for Puducherry arterial junctions, force directional clearance, or restore cyclic schedule.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  triggerAction(
                    () => trafficSignalService.triggerEnterGeofence('SIG-MURUGA'),
                    "Emergency Green corridor forced at Muruga Theatre (5-Way Junction)!"
                  );
                }}
                className="w-full p-2.5 rounded-lg bg-[#00D68F]/15 hover:bg-[#00D68F]/25 border border-[#00D68F]/40 text-[#00D68F] font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Trigger Geofence: Muruga Theatre (5-Way Signal)</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => {
                  triggerAction(
                    () => trafficSignalService.triggerEnterGeofence('SIG-IG'),
                    "Emergency Green corridor forced at Indira Gandhi Sq (IG)!"
                  );
                }}
                className="w-full p-2.5 rounded-lg bg-[#1677FF]/15 hover:bg-[#1677FF]/25 border border-[#1677FF]/40 text-[#1677FF] font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Trigger Geofence: Indira Gandhi Sq Rotary</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => {
                  triggerAction(
                    () => trafficSignalService.triggerExitGeofence(),
                    "Normal cyclic traffic signal schedule restored."
                  );
                }}
                className="w-full p-2.5 rounded-lg bg-[#1677FF]/15 hover:bg-[#1677FF]/25 border border-[#1677FF]/40 text-[#1677FF] font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Trigger Geofence Exit (Restore Normal Cycle)</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => {
                  triggerAction(
                    () => trafficSignalService.resetSimulation(),
                    "Ambulance GPS route reset to start."
                  );
                }}
                className="w-full p-2.5 rounded-lg theme-inner-card hover:border-[#1677FF] border border-[var(--card-inner-border)] theme-title font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Reset Ambulance Route to Start</span>
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {ambulance && (
            <div className="mt-4 p-2.5 rounded-lg theme-inner-card border border-[var(--card-inner-border)] text-xs flex items-center justify-between">
              <div>
                <span className="font-bold theme-title">Ambulance GPS:</span> <span className="font-mono">{ambulance.lat.toFixed(4)}° N, {ambulance.lng.toFixed(4)}° E</span>
              </div>
              <span className="text-[#00D68F] font-mono font-bold">{ambulance.speed} km/h</span>
            </div>
          )}
        </div>

        {/* Right: Live Event Log */}
        <div className="police-card rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <h2 className="text-sm font-bold theme-title mb-2 flex items-center gap-2">
            <Shield size={16} className="text-[#F52235]" /> Real-time Transition Event Log
          </h2>

          <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1 flex-1">
            {events.map((evt) => (
              <div key={evt.id} className="p-2 rounded-lg theme-inner-card border border-[var(--card-inner-border)] text-xs flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1677FF] shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="theme-title leading-snug font-medium">{evt.title}</div>
                  <div className="text-[10px] theme-subtle font-mono mt-0.5">{evt.timestamp}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] theme-subtle pt-2 border-t border-[var(--card-inner-border)] mt-2">
            Automated SCATS/ITCS hardware synchronization active.
          </div>
        </div>
      </div>
    </div>
  );
}
