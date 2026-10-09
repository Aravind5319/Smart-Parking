'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AlertCircle, AlertTriangle, CheckCircle, ParkingSquare, Car } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/maps/MapView'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-sandstone/10 animate-pulse flex items-center justify-center text-main-text/40 rounded-lg border border-subtle-border">Loading map data...</div>
});

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  statusText: string;
}

const KPICard = ({ title, value, icon: Icon, colorClass, statusText }: KPICardProps) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-subtle-border flex items-start justify-between flex-1 min-w-[200px]">
    <div>
      <h3 className="text-sm font-medium text-main-text/70 mb-1">{title}</h3>
      <div className="text-2xl font-bold text-main-text mb-1">{value}</div>
      <div className="text-xs text-main-text/50 font-medium flex items-center gap-1">
        {statusText}
      </div>
    </div>
    <div className={`p-2 rounded-md ${colorClass} bg-opacity-10`}>
      <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
    </div>
  </div>
);

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-[calc(100vh-64px-32px)] min-h-[600px] gap-4">
      {/* KPI Strip */}
      <div className="flex flex-wrap gap-4 flex-shrink-0">
        <KPICard title={t.dashboard.pendingReports} value="24" icon={AlertCircle} colorClass="bg-amber text-amber" statusText="+3 in last hour" />
        <KPICard title={t.dashboard.highPriority} value="7" icon={AlertTriangle} colorClass="bg-urgent text-urgent" statusText="Immediate action required" />
        <KPICard title={t.dashboard.verifiedToday} value="142" icon={CheckCircle} colorClass="bg-teal text-teal" statusText="Updated 5m ago" />
        <KPICard title={t.dashboard.availableParking} value="84%" icon={ParkingSquare} colorClass="bg-police text-police" statusText="White Town: 92%" />
        <KPICard title={t.dashboard.activeAlerts} value="2" icon={Car} colorClass="bg-amber text-amber" statusText="Goubert Ave blocked" />
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Central Map */}
        <div className="flex-[3] bg-white rounded-lg shadow-sm border border-subtle-border flex flex-col overflow-hidden relative">
          <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm border border-subtle-border">
            LIVE: Puducherry Command Sector
          </div>
          <MapView />
        </div>

        {/* Right Complaint Queue */}
        <div className="flex-[1] min-w-[300px] bg-white rounded-lg shadow-sm border border-subtle-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-subtle-border flex items-center justify-between flex-shrink-0 bg-ivory/30">
            <h2 className="font-semibold text-main-text text-sm">{t.dashboard.reviewQueue}</h2>
            <span className="text-xs font-semibold bg-urgent text-white px-2 py-0.5 rounded-full">5 Urgent</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 border border-subtle-border rounded-md hover:border-police hover:bg-ivory/20 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold font-mono text-police">REP-24-{9823 + i}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${i < 3 ? 'bg-urgent/10 text-urgent' : 'bg-amber/10 text-amber'}`}>
                    {i < 3 ? 'High' : 'Medium'}
                  </span>
                </div>
                <div className="font-medium text-sm text-main-text mb-1">Illegal Parking</div>
                <div className="text-xs text-main-text/70 mb-2 flex flex-col gap-0.5">
                  <span>TN-32-AB-1234</span>
                  <span>Mission Street • 12m ago</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-subtle-border flex-shrink-0">
            <button className="w-full py-2 bg-ivory text-police font-medium text-sm rounded-md hover:bg-ivory/80 transition-colors border border-subtle-border">
              {t.dashboard.viewAll}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Operations Strip */}
      <div className="h-16 flex-shrink-0 bg-white rounded-lg shadow-sm border border-subtle-border flex items-center px-4 gap-6 divide-x divide-subtle-border text-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-urgent animate-pulse"></div>
          <span className="font-semibold text-main-text">Latest Alert:</span>
          <span className="text-main-text/80">Congestion predicted at JN Street in 15 mins</span>
        </div>
        <div className="pl-6 flex items-center gap-3">
          <span className="font-semibold text-main-text">Restrictions:</span>
          <span className="text-amber">2 Active (Beach Road, Dumas St)</span>
        </div>
        <div className="pl-6 flex items-center gap-3">
          <span className="font-semibold text-main-text">Patrols:</span>
          <span className="text-teal">12/15 Available</span>
        </div>
        <div className="pl-6 flex-1 flex justify-end items-center gap-2 text-xs text-main-text/50">
          <span className="text-teal font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-teal/10 rounded-sm">Connected</span>
          <span>Last sync: Just now</span>
        </div>
      </div>
    </div>
  );
}
