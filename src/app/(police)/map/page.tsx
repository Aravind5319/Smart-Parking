'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Filter, Layers } from 'lucide-react';

const MapView = dynamic(() => import('@/components/maps/MapView'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-sandstone/10 animate-pulse flex items-center justify-center text-main-text/40 rounded-lg border border-subtle-border">Loading Live Map...</div>
});

export default function MapPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-subtle-border overflow-hidden relative">
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-md shadow-md border border-subtle-border w-64">
          <h1 className="font-bold text-main-text text-lg mb-2">{t.dashboard.map}</h1>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-main-text/70 uppercase tracking-wider mb-1 block">Quick Filters</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm text-main-text cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-police focus:ring-police border-subtle-border" />
                  Violation Reports
                </label>
                <label className="flex items-center gap-2 text-sm text-main-text cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-police focus:ring-police border-subtle-border" />
                  Parking Zones
                </label>
                <label className="flex items-center gap-2 text-sm text-main-text cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-police focus:ring-police border-subtle-border" />
                  Patrol Units
                </label>
              </div>
            </div>
            <hr className="border-subtle-border" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-main-text/60">Live Updates: On</span>
              <div className="w-2 h-2 rounded-full bg-teal animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <button className="bg-white p-2 rounded-md shadow-sm border border-subtle-border text-main-text/70 hover:text-police hover:bg-ivory transition-colors" title="Filter Options">
          <Filter size={20} />
        </button>
        <button className="bg-white p-2 rounded-md shadow-sm border border-subtle-border text-main-text/70 hover:text-police hover:bg-ivory transition-colors" title="Map Layers">
          <Layers size={20} />
        </button>
      </div>

      <MapView />
    </div>
  );
}
