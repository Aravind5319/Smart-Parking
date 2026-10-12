'use client';

import React from 'react';
import { AIParkingMonitor } from '@/components/dashboard/AIParkingMonitor';
import { LiveGPSTrafficControl } from '@/components/dashboard/LiveGPSTrafficControl';
import { CitizenReportsPanel } from '@/components/dashboard/CitizenReportsPanel';

export default function DashboardPage() {
  return (
    <div className="h-full min-h-0 w-full grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
      {/* Column 1: ANPR Traffic & Parking Monitor (4 cols) */}
      <div className="lg:col-span-4 h-full min-h-0 flex flex-col overflow-hidden">
        <AIParkingMonitor />
      </div>

      {/* Column 2: Live GPS & Traffic Signal Corridor Control (5 cols) */}
      <div className="lg:col-span-5 h-full min-h-0 flex flex-col overflow-hidden">
        <LiveGPSTrafficControl />
      </div>

      {/* Column 3: Citizen Reports Feed (3 cols) */}
      <div className="lg:col-span-3 h-full min-h-0 flex flex-col overflow-hidden">
        <CitizenReportsPanel />
      </div>
    </div>
  );
}
