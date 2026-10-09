'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MapPin, Plus, Search, Map as MapIcon, Edit2, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/maps/MapView'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-sandstone/10 animate-pulse flex items-center justify-center text-main-text/40 rounded-lg">Loading zone map...</div>
});

const mockZones = [
  { id: 'Z-101', name: 'White Town Core', type: 'No Parking', status: 'Active', creator: 'Selvam', time: 'Permanent' },
  { id: 'Z-102', name: 'Goubert Ave North', type: 'Allowed', status: 'Active', creator: 'System', time: 'Permanent' },
  { id: 'Z-103', name: 'Mission St Festival', type: 'No Parking', status: 'Temporary', creator: 'Admin', time: 'Ends in 2d' },
];

export default function ZonesPage() {
  const { t } = useLanguage();

  return (
    <div className="flex h-full gap-4">
      {/* Left panel - Zone List */}
      <div className="w-1/3 bg-white rounded-lg shadow-sm border border-subtle-border flex flex-col overflow-hidden min-w-[320px]">
        <div className="p-4 border-b border-subtle-border flex justify-between items-center bg-ivory/30">
          <h1 className="font-bold text-main-text">{t.dashboard.zones}</h1>
          <button className="p-1.5 bg-police text-white rounded-md hover:bg-police/90 transition-colors" title="Create New Zone">
            <Plus size={18} />
          </button>
        </div>
        
        <div className="p-3 border-b border-subtle-border">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search size={16} className="text-main-text/40" />
            </div>
            <input 
              type="text" 
              placeholder="Search zones..."
              className="block w-full pl-8 pr-3 py-1.5 border border-subtle-border rounded-md leading-5 bg-white placeholder-main-text/40 focus:outline-none focus:ring-1 focus:ring-police focus:border-police sm:text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {mockZones.map((zone) => (
            <div key={zone.id} className="p-3 border border-subtle-border rounded-md hover:border-police/50 hover:bg-ivory/20 cursor-pointer transition-all">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-main-text text-sm">{zone.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase 
                  ${zone.type === 'No Parking' ? 'bg-urgent/10 text-urgent' : 'bg-teal/10 text-teal'}`}>
                  {zone.type}
                </span>
              </div>
              <div className="flex items-center text-xs text-main-text/60 mb-2 gap-3">
                <span className="flex items-center gap-1"><MapPin size={12} /> {zone.id}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {zone.time}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-subtle-border/50">
                <span className="text-[10px] text-main-text/50 uppercase tracking-wider">By: {zone.creator}</span>
                <button className="text-police hover:text-police/80 p-1" title="Edit">
                  <Edit2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Zone Map */}
      <div className="flex-[2] bg-white rounded-lg shadow-sm border border-subtle-border flex flex-col overflow-hidden relative">
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm border border-subtle-border flex gap-2">
          <button className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-ivory rounded hover:bg-sandstone/30">
            <MapIcon size={14} /> Map View
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 text-main-text/60 rounded hover:bg-sandstone/30">
            Satellite
          </button>
        </div>
        <MapView />
        
        {/* Draw tools floating panel */}
        <div className="absolute right-4 top-4 z-[1000] bg-white p-2 rounded-md shadow-md border border-subtle-border flex flex-col gap-2">
          <button className="p-2 bg-ivory text-main-text rounded hover:bg-police hover:text-white transition-colors" title="Draw Polygon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22l10-4 10 4L12 2z"/></svg>
          </button>
          <button className="p-2 bg-ivory text-main-text rounded hover:bg-police hover:text-white transition-colors" title="Draw Line">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L2 22"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
