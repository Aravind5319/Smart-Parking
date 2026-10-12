'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { parkingService } from '@/lib/services/parkingService';
import { 
  Settings, 
  Key, 
  Sliders, 
  Check, 
  ShieldCheck 
} from 'lucide-react';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [tempApiKey, setTempApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Simulation parameters
  const [thresholdMins, setThresholdMins] = useState(10);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [geofenceRadius, setGeofenceRadius] = useState(380);

  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('google_maps_api_key') || '' : '';
    const currentKey = storedKey || envKey;
    setTempApiKey(currentKey);
    setSpeedMultiplier(parkingService.getSpeedMultiplier());
  }, []);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempApiKey.trim();
    if (typeof window !== 'undefined') {
      if (cleanKey) {
        localStorage.setItem('google_maps_api_key', cleanKey);
      } else {
        localStorage.removeItem('google_maps_api_key');
      }
    }
    parkingService.setSpeedMultiplier(speedMultiplier);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1677FF]/20 border border-[#1677FF]/40 flex items-center justify-center text-[#1677FF] shrink-0">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold theme-title tracking-wide">
              {t.nav.settings} — Command Center Configuration
            </h1>
            <p className="text-xs theme-sub font-medium">
              Manage live simulations, violation thresholds, GIS coordinates, and telemetry parameters
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/30 text-[#00D68F] text-xs font-bold flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" /> System Active
        </span>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-4">
        {/* Simulation Configuration Card */}
        <div className="police-card rounded-xl p-4 space-y-3 shadow-sm">
          <h2 className="text-sm font-bold theme-title flex items-center gap-2 pb-2 border-b border-[var(--card-inner-border)]">
            <Sliders size={16} className="text-[#1677FF]" /> Parking & Traffic Enforcement Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg theme-inner-card border border-[var(--card-inner-border)]">
              <label className="text-xs font-bold theme-sub block mb-1">
                Violation Dwell Threshold
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={thresholdMins}
                  onChange={(e) => setThresholdMins(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded theme-inner-card border border-[var(--card-inner-border)] text-xs font-bold font-mono theme-title text-center focus:outline-none focus:border-[#1677FF]"
                />
                <span className="text-xs theme-title font-semibold">Minutes (Default: 10)</span>
              </div>
              <p className="text-[10px] theme-subtle mt-1 font-medium">
                Vehicle exceeding this dwell period generates automated citation.
              </p>
            </div>

            <div className="p-3 rounded-lg theme-inner-card border border-[var(--card-inner-border)]">
              <label className="text-xs font-bold theme-sub block mb-1">
                Simulation Clock Multiplier
              </label>
              <div className="flex gap-1.5 mt-1">
                {[1, 5, 10, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSpeedMultiplier(m);
                      parkingService.setSpeedMultiplier(m);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                      speedMultiplier === m ? 'bg-[#1677FF] text-white shadow-xs' : 'theme-inner-card theme-sub border border-[var(--card-inner-border)]'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
              <p className="text-[10px] theme-subtle mt-1 font-medium">
                Accelerate demonstration speed for presentation.
              </p>
            </div>

            <div className="p-3 rounded-lg theme-inner-card border border-[var(--card-inner-border)]">
              <label className="text-xs font-bold theme-sub block mb-1">
                Ambulance Geofence Radius
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={100}
                  max={1000}
                  step={20}
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                  className="w-24 px-2 py-1 rounded theme-inner-card border border-[var(--card-inner-border)] text-xs font-bold font-mono theme-title text-center focus:outline-none focus:border-[#1677FF]"
                />
                <span className="text-xs theme-title font-semibold">Meters</span>
              </div>
              <p className="text-[10px] theme-subtle mt-1 font-medium">
                Preemption trigger distance around hospital intersection.
              </p>
            </div>
          </div>
        </div>

        {/* GIS & Google Maps Credentials */}
        <div className="police-card rounded-xl p-4 space-y-3 shadow-sm">
          <h2 className="text-sm font-bold theme-title flex items-center gap-2 pb-2 border-b border-[var(--card-inner-border)]">
            <Key size={16} className="text-[#F52235]" /> Google Maps GIS API Integration
          </h2>

          <div>
            <label className="block text-xs font-bold theme-sub mb-1">
              Google Maps API Key (Optional)
            </label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2 rounded-lg theme-inner-card border border-[var(--card-inner-border)] text-xs font-mono theme-title focus:outline-none focus:border-[#1677FF]"
            />
            <p className="text-[10px] theme-subtle mt-1">
              Supports Maps JavaScript API, Places, and Real-time Traffic layers. Stored securely in local storage.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-lg bg-[#00D68F]/20 border border-[#00D68F]/40 text-[#00D68F] text-xs font-bold flex items-center gap-2">
            <Check size={16} /> Configuration updated and applied successfully!
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[#1677FF] hover:bg-[#0056cc] text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
