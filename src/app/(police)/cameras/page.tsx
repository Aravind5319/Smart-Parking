'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Video, Shield, Maximize2, X, Activity, Sliders, Radio } from 'lucide-react';

const CAMERAS = [
  {
    id: 'CAM-01',
    name: 'Beach Road - Promenade North',
    zone: 'Strict No Parking Clearway',
    status: 'ONLINE',
    fps: 30,
    vehiclesDetected: 14,
    violations: 2,
    img: '/beach_road_camera.jpg'
  },
  {
    id: 'CAM-02',
    name: 'Goubert Avenue - Gandhi Statue',
    zone: 'Pedestrian Only Heritage Sector',
    status: 'ONLINE',
    fps: 28,
    vehiclesDetected: 0,
    violations: 0,
    img: '/beach_road_camera.jpg'
  },
  {
    id: 'CAM-03',
    name: 'Old Bus Stand - Main Terminus',
    zone: 'Transit & Bus Bay Regulated',
    status: 'ONLINE',
    fps: 30,
    vehiclesDetected: 26,
    violations: 3,
    img: '/beach_road_camera.jpg'
  },
  {
    id: 'CAM-04',
    name: 'White Town - French Quarter Core',
    zone: 'Heritage Residential Slow Zone',
    status: 'ONLINE',
    fps: 25,
    vehiclesDetected: 8,
    violations: 1,
    img: '/beach_road_camera.jpg'
  }
];

export default function CamerasPage() {
  const { t } = useLanguage();
  const [selectedCam, setSelectedCam] = useState<typeof CAMERAS[0] | null>(null);

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F52235]/20 border border-[#F52235]/40 flex items-center justify-center text-[#F52235] shrink-0">
            <Video size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold theme-title tracking-wide">
              {t.nav.liveCameras} — CCTV Surveillance Matrix
            </h1>
            <p className="text-xs theme-sub font-medium">
              Real-time high-definition CCTV feeds with automatic plate recognition (ANPR)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/30 text-[#00D68F] text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" /> 4 Streams Online
          </span>
        </div>
      </div>

      {/* Grid of 4 Cameras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-[500px]">
        {CAMERAS.map((cam) => (
          <div
            key={cam.id}
            onClick={() => setSelectedCam(cam)}
            className="police-card rounded-xl p-3 flex flex-col justify-between border hover:border-[#1677FF] transition-all cursor-pointer group shadow-sm hover:shadow-md"
          >
            {/* Top Info */}
            <div className="flex items-center justify-between mb-2 text-xs">
              <div className="flex items-center gap-2 font-bold theme-title">
                <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse shrink-0" />
                <span className="truncate">{cam.name}</span>
                <span className="text-[10px] theme-sub font-mono shrink-0">({cam.id})</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] theme-sub shrink-0">
                <span>{cam.fps} FPS</span>
                {cam.violations > 0 ? (
                  <span className="bg-[#F52235]/20 text-[#F52235] px-1.5 py-0.5 rounded font-bold border border-[#F52235]/40">
                    {cam.violations} Violations
                  </span>
                ) : (
                  <span className="bg-[#00D68F]/20 text-[#00D68F] px-1.5 py-0.5 rounded font-bold">
                    Clear
                  </span>
                )}
              </div>
            </div>

            {/* Video Viewport */}
            <div className="relative rounded-lg overflow-hidden border border-[#132B52] bg-black aspect-video w-full shadow-inner">
              <Image src={cam.img} alt={cam.name} fill className="object-cover group-hover:scale-102 transition-transform" />
              
              <div className="absolute top-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[9.5px] font-mono text-white border border-white/10">
                ANPR TELEMETRY: ACTIVE
              </div>

              <div className="absolute bottom-2 right-2 bg-black/75 px-2 py-0.5 rounded text-[9.5px] font-mono text-[#00D68F] border border-white/10">
                Units Tracked: {cam.vehiclesDetected}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--card-inner-border)] text-[11px] theme-sub">
              <span className="truncate">Zone: <b className="theme-title">{cam.zone}</b></span>
              <span className="text-[#1677FF] font-semibold flex items-center gap-1 group-hover:underline shrink-0 ml-2">
                <Maximize2 size={12} /> Inspect Feed
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Feed Modal */}
      {selectedCam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--modal-bg)] border-2 border-[#1677FF] rounded-xl max-w-2xl w-full p-4 shadow-2xl text-[var(--text-main)] relative">
            <button
              onClick={() => setSelectedCam(null)}
              className="absolute top-3.5 right-3.5 theme-sub hover:opacity-80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--card-inner-border)]">
              <Video size={18} className="text-[#1677FF]" />
              <h3 className="font-extrabold text-sm theme-title">
                {selectedCam.name} ({selectedCam.id}) — Live Feed
              </h3>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-[var(--card-inner-border)] aspect-video w-full bg-black mb-3">
              <Image src={selectedCam.img} alt={selectedCam.name} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                1080p Full Matrix • 30 FPS • Sector Secure
              </div>
            </div>

            <div className="flex items-center justify-between text-xs theme-sub">
              <span>Sector: <b className="theme-title">{selectedCam.zone}</b></span>
              <button
                onClick={() => setSelectedCam(null)}
                className="px-4 py-1.5 rounded bg-[#1677FF] hover:bg-[#0056cc] text-xs font-bold text-white cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
