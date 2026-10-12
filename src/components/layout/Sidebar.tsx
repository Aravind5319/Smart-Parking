'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSidebar } from '@/lib/context/SidebarContext';
import { 
  Home, 
  Video, 
  Network, 
  Megaphone, 
  MapPin, 
  BarChart2, 
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function Sidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: Home, accent: '#F52235' },
    { href: '/cameras', label: t.nav.liveCameras, icon: Video, accent: '#1677FF' },
    { href: '/traffic', label: t.nav.trafficControl, icon: Network, accent: '#F52235' },
    { href: '/citizen-reports', label: t.nav.citizenReports, icon: Megaphone, accent: '#F52235' },
    { href: '/lost-found', label: t.nav.lostFound, icon: MapPin, accent: '#1677FF' },
    { href: '/reports', label: t.nav.reports, icon: BarChart2, accent: '#1677FF' },
    { href: '/settings', label: t.nav.settings, icon: Settings, accent: '#AFC4E8' },
  ];

  if (isCollapsed) {
    return (
      <div className="relative z-30 select-none">
        <button
          onClick={toggleSidebar}
          className="absolute top-3 left-2 z-40 p-2 rounded-r-xl bg-gradient-to-r from-[#0A1B39] to-[#0E2652] text-white hover:text-[#38BDF8] border border-l-0 border-[#1677FF]/50 shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center gap-1.5 transition-all hover:scale-105 group cursor-pointer"
          title="Show Command Modules Sidebar"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={16} className="text-[#1677FF] group-hover:translate-x-0.5 transition-transform" />
          <Shield size={14} className="text-[#38BDF8]" />
          <span className="text-[10px] font-black tracking-wider uppercase pr-1 hidden sm:inline text-white/90">
            {t.common.commandModules}
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside className="w-[185px] lg:w-[205px] bg-gradient-to-b from-[#030D1E] via-[#06152F] to-[#020914] border-r border-[#132B52] flex-shrink-0 flex flex-col justify-between h-full select-none z-20 transition-all duration-300 ease-in-out">
      {/* Navigation Buttons */}
      <nav className="p-3 space-y-2 mt-1">
        {/* Header with Title and Collapse Button */}
        <div className="px-1.5 pb-2 border-b border-white/10 flex items-center justify-between">
          <div className="text-[10px] font-black tracking-widest text-[#AFC4E8]/80 uppercase flex items-center gap-1.5">
            <Shield size={12} className="text-[#1677FF]" /> {t.common.commandModules}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md bg-white/5 hover:bg-[#F52235]/20 text-[#AFC4E8] hover:text-white border border-white/10 hover:border-[#F52235]/40 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        <div className="space-y-1.5 pt-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F52235] to-[#B01222] text-white shadow-[0_4px_16px_rgba(245,34,53,0.45)] border border-[#F52235]'
                    : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-[#AFC4E8]'} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Heritage Watermark & Department Label */}
      <div className="p-3 border-t border-white/10 flex flex-col items-center text-center relative overflow-hidden bg-black/20">
        <div className="w-14 h-11 opacity-25 mb-1 flex items-center justify-center text-[#1677FF] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M50 10 L55 25 L75 25 L75 85 L25 85 L25 25 L45 25 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="50" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <rect x="35" y="60" width="30" height="25" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <line x1="15" y1="85" x2="85" y2="85" stroke="currentColor" strokeWidth="3" />
            <path d="M50 5 L50 15 M45 10 L55 10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <span className="text-white font-black text-xs tracking-wider">
          Puducherry
        </span>
        <span className="text-[9.5px] text-[#AFC4E8] font-bold uppercase tracking-widest mt-0.5">
          Police Department
        </span>
      </div>
    </aside>
  );
}
