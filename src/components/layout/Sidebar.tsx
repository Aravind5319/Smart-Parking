'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LayoutDashboard, AlertTriangle, Map as MapIcon, ParkingSquare, BrainCircuit, Car, BarChart3, ShieldCheck, Settings } from 'lucide-react';

export function Sidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: t.dashboard.overview, icon: LayoutDashboard },
    { href: '/reports', label: t.dashboard.reports, icon: AlertTriangle },
    { href: '/map', label: t.dashboard.map, icon: MapIcon },
    { href: '/zones', label: t.dashboard.zones, icon: ParkingSquare },
    { href: '/predictions', label: t.dashboard.predictions, icon: BrainCircuit },
    { href: '/patrols', label: t.dashboard.patrols, icon: Car },
    { href: '/analytics', label: t.dashboard.analytics, icon: BarChart3 },
    { href: '/audit', label: t.dashboard.audit, icon: ShieldCheck },
    { href: '/settings', label: t.dashboard.settings, icon: Settings },
  ];

  return (
    <aside className="w-[240px] bg-navy text-ivory flex-shrink-0 flex flex-col min-h-screen">
      <div className="h-16 flex items-center justify-center border-b border-police/30 px-4">
        {/* Puducherry Police Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-sandstone/30 shadow-sm shrink-0">
            <Image src="/logo police dashboard.jpg" alt="Puducherry Police" width={40} height={40} className="object-contain w-full h-full p-0.5" />
          </div>
          <span className="font-bold text-lg tracking-wide">ParkPuduvai</span>
        </div>
      </div>
      
      <div className="py-2 px-4 text-xs font-semibold text-sandstone/80 uppercase tracking-wider mb-2 mt-4">
        {t.dashboard.title}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive 
                  ? 'bg-police text-white border-l-2 border-amber shadow-sm' 
                  : 'text-ivory/80 hover:bg-police/50 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-amber' : 'text-ivory/60'} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-police/30 text-xs text-ivory/50">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse"></div>
          <span>System Online</span>
        </div>
        <p>Govt of Puducherry</p>
      </div>
    </aside>
  );
}
