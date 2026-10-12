'use client';

import React from 'react';
import { AIParkingMonitor } from '@/components/dashboard/AIParkingMonitor';
import { LiveGPSTrafficControl } from '@/components/dashboard/LiveGPSTrafficControl';
import { CitizenReportsPanel } from '@/components/dashboard/CitizenReportsPanel';
import { LostFoundPanel } from '@/components/dashboard/LostFoundPanel';

export default function DashboardPage() {
  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
      {/* Column 1: AI Parking & Road Monitoring (4 cols) */}
      <div className="lg:col-span-4 h-full min-h-[520px] lg:min-h-0">
        <AIParkingMonitor />
      </div>

      {/* Column 2: Live GPS & Traffic Signal Control (5 cols) */}
      <div className="lg:col-span-5 h-full min-h-[520px] lg:min-h-0">
        <LiveGPSTrafficControl />
      </div>

      {/* Column 3: Citizen Reports & Lost and Found (3 cols) */}
      <div className="lg:col-span-3 h-full flex flex-col gap-2.5 min-h-[520px] lg:min-h-0">
        <CitizenReportsPanel />
        <LostFoundPanel />
      </div>
    </div>
  );
}
