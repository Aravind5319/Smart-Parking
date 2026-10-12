'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { parkingService } from '@/lib/services/parkingService';
import { 
  Settings, 
  Key, 
  Sliders, 
  Radio, 
  Check, 
  ShieldCheck, 
  Clock, 
  Database, 
  ExternalLink 
} from 'lucide-react';

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const [apiKey, setApiKey] = useState('');
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
    setApiKey(currentKey);
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
    setApiKey(cleanKey);
    parkingService.setSpeedMultiplier(speedMultiplier);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-4 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#132B52]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1677FF]/20 border border-[#1677FF]/40 flex items-center justify-center text-[#1677FF]">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">
              {t.nav.settings} — Command Center Configuration
            </h1>
            <p className="text-xs text-[#AFC4E8]/70">
              Manage live simulations, violation thresholds, GIS coordinates, and external integrations
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/30 text-[#00D68F] text-xs font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" /> System Config Active
        </span>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-4">
        {/* Simulation Configuration Card */}
        <div className="police-card rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#132B52]">
            <Sliders size={16} className="text-[#1677FF]" /> Parking & Traffic Simulation Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#06152F] border border-[#132B52]">
              <label className="text-xs font-bold text-[#AFC4E8] block mb-1">
                Violation Threshold
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={thresholdMins}
                  onChange={(e) => setThresholdMins(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-[#0A1B39] border border-[#132B52] text-xs font-bold font-mono text-white text-center"
                />
                <span className="text-xs text-white">Minutes (Default: 10)</span>
              </div>
              <p className="text-[10px] text-[#AFC4E8]/60 mt-1">
                Vehicle exceeding this generates E-Challan.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#06152F] border border-[#132B52]">
              <label className="text-xs font-bold text-[#AFC4E8] block mb-1">
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
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      speedMultiplier === m ? 'bg-[#1677FF] text-white' : 'bg-[#0A1B39] text-[#AFC4E8]'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#AFC4E8]/60 mt-1">
                Accelerate demo speed for presentation.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#06152F] border border-[#132B52]">
              <label className="text-xs font-bold text-[#AFC4E8] block mb-1">
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
                  className="w-24 px-2 py-1 rounded bg-[#0A1B39] border border-[#132B52] text-xs font-bold font-mono text-white text-center"
                />
                <span className="text-xs text-white">Meters</span>
              </div>
              <p className="text-[10px] text-[#AFC4E8]/60 mt-1">
                Preemption trigger distance around hospital.
              </p>
            </div>
          </div>
        </div>

        {/* GIS & Google Maps Credentials */}
        <div className="police-card rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#132B52]">
            <Key size={16} className="text-[#F52235]" /> Google Maps JavaScript API Credentials
          </h2>

          <div>
            <label className="block text-xs font-bold text-[#AFC4E8] mb-1">
              API Key (Optional for Embed Mode)
            </label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#06152F] border border-[#132B52] text-xs font-mono text-white focus:outline-none focus:border-[#1677FF]"
            />
            <p className="text-[10px] text-[#AFC4E8]/60 mt-1">
              Supports Maps JavaScript API, Places, and Real-time Traffic feeds. Stored in local storage.
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
            className="px-5 py-2 rounded-lg bg-[#1677FF] hover:bg-[#1677FF]/80 text-white font-extrabold text-xs shadow-md transition-colors"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
