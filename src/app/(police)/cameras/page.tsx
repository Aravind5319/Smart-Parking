'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Video, Shield, Maximize2, RefreshCw, AlertTriangle, Eye, Sliders } from 'lucide-react';

const CAMERAS = [
  {
    id: 'CAM-01',
    name: 'Beach Road - Promenade North',
    zone: 'Strict No Parking Zone',
    status: 'ONLINE',
    fps: 30,
    vehiclesDetected: 14,
    violations: 2,
    img: '/beach_road_camera.jpg'
  },
  {
    id: 'CAM-02',
    name: 'Goubert Avenue - Gandhi Statue',
    zone: 'Pedestrian Only Corridor',
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
  const [selectedCam, setSelectedCam] = useState(CAMERAS[0]);

  return (
    <div className="h-full flex flex-col gap-3 text-white overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#132B52]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F52235]/20 border border-[#F52235]/40 flex items-center justify-center text-[#F52235]">
            <Video size={20} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">
              {t.nav.liveCameras} — Puducherry Surveillance Matrix
            </h1>
            <p className="text-xs text-[#AFC4E8]/70">
              OpenCV integrated CCTV grid with real-time AI vehicle bounding boxes & plate recognition
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
            className="police-card rounded-xl p-3 flex flex-col justify-between border hover:border-[#1677FF] transition-all cursor-pointer group"
          >
            {/* Top Info */}
            <div className="flex items-center justify-between mb-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
                <span>{cam.name}</span>
                <span className="text-[10px] text-[#AFC4E8] font-mono">({cam.id})</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#AFC4E8]">
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
            <div className="relative rounded-lg overflow-hidden border border-[#132B52] bg-black aspect-video w-full">
              <Image src={cam.img} alt={cam.name} fill className="object-cover group-hover:scale-102 transition-transform" />
              
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-white border border-white/10">
                AI DETECTION: ACTIVE
              </div>

              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-[#00D68F] border border-white/10">
                Vehicles: {cam.vehiclesDetected}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#132B52]/60 text-[11px] text-[#AFC4E8]">
              <span>Zone: <b>{cam.zone}</b></span>
              <span className="text-[#1677FF] font-semibold flex items-center gap-1 group-hover:underline">
                <Maximize2 size={12} /> Full Feed
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
