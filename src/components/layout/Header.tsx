'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { User, Sun, Moon, Sparkles, Activity, ShieldCheck, X } from 'lucide-react';

export function Header() {
  const { lang, setLang, t } = useLanguage();
  const [currentDate, setCurrentDate] = useState<string>('12 Oct 2026');
  const [currentTime, setCurrentTime] = useState<string>('10:47:34');
  const [themeMode, setThemeMode] = useState<'dark' | 'white'>('dark');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem('police_dashboard_theme') as 'dark' | 'white';
    if (savedTheme) {
      setThemeMode(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const updateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      );
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'white' : 'dark';
    setThemeMode(next);
    localStorage.setItem('police_dashboard_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <header className="h-[74px] bg-gradient-to-r from-[#030D1E] via-[#06152F] to-[#040E20] border-b border-[#132B52] flex items-center justify-between px-3 sm:px-4 lg:px-6 relative shadow-xl z-30 select-none">
      {/* Background ambient red & blue subtle glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 10% 50%, rgba(245, 34, 53, 0.25) 0%, transparent 40%), radial-gradient(circle at 90% 50%, rgba(22, 119, 255, 0.25) 0%, transparent 40%)'
        }}
      />

      {/* Left: Perfectly Merged Pondicherry Police Emblem & Typography */}
      <div className="flex items-center gap-3.5 z-10">
        <div className="relative group flex items-center justify-center cursor-pointer shrink-0">
          {/* Subtle golden & sapphire aura glow behind emblem */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1677FF]/50 via-[#FFD700]/40 to-[#F52235]/40 blur-md transform scale-125 group-hover:scale-135 transition-transform" />
          
          {/* Polished Glass & Golden Bezel Emblem Frame */}
          <div className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full p-1 bg-gradient-to-b from-[#FFD700]/30 via-[#0A1B39]/80 to-[#030D1E] border-2 border-[#FFD700]/60 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center backdrop-blur-md overflow-hidden relative">
            <Image
              src="/emblem.png"
              alt="Pondicherry Police Official Crest"
              width={50}
              height={50}
              className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:scale-108 transition-all duration-300"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-full" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-black text-sm sm:text-base lg:text-lg tracking-wider leading-tight drop-shadow-sm font-sans">
              {t.common.appName}
            </h1>
            {/* Red & Blue Police Flasher dots with emergency beacon glow */}
            <div className="flex items-center gap-1.5 ml-1 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F52235] shadow-[0_0_10px_#F52235] animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#1677FF] shadow-[0_0_10px_#1677FF] animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[#38BDF8] text-[10px] sm:text-[11px] lg:text-xs font-black tracking-[0.22em] uppercase">
              {t.common.appSubtitle}
            </span>
            <span className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#1677FF]/20 text-[#38BDF8] border border-[#1677FF]/40 tracking-wider">
              HQ CONTROL
            </span>
          </div>
        </div>
      </div>

      {/* Center: Mottos */}
      <div className="hidden 2xl:flex items-center gap-4 text-xs font-bold text-white/90 z-10 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
        <span className="hover:text-[#38BDF8] transition-colors">{t.common.motto1}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#F52235]" />
        <span className="hover:text-[#38BDF8] transition-colors">{t.common.motto2}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="hover:text-[#38BDF8] transition-colors">{t.common.motto3}</span>
      </div>

      {/* Right: Live Status, Clock, Theme Switcher, Language Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-4 z-10 shrink-0">
        {/* Live System Indicator */}
        <button
          onClick={() => setShowSystemStatus(!showSystemStatus)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#0A1B39] border border-[#F52235]/40 shadow-[0_0_12px_rgba(245,34,53,0.25)] text-white hover:border-[#1677FF] transition-all cursor-pointer"
          title="Telemetry Connection: Active"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F52235] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F52235]" />
          </span>
          <span className="text-xs font-bold tracking-wide">
            {t.common.liveSystem}
          </span>
        </button>

        {/* Live Digital Clock */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono font-bold text-white bg-[#0A1B39]/90 px-3 py-1 rounded-md border border-[#1677FF]/40 shadow-xs">
          <span className="text-[#AFC4E8]">{currentDate}</span>
          <span className="text-[#F52235] font-extrabold">|</span>
          <span className="text-white tracking-wider font-extrabold">{currentTime}</span>
        </div>

        {/* Theme Mode Switcher (White & Red & Blue / Tactical Navy) */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
            themeMode === 'white'
              ? 'bg-white text-[#0A192F] border-white shadow-md'
              : 'bg-[#0A1B39] text-white border-white/20 hover:border-[#38BDF8]'
          }`}
          title="Toggle White Command / Tactical Navy theme"
        >
          {themeMode === 'white' ? (
            <>
              <Sun size={13} className="text-[#FFB800]" />
              <span className="hidden sm:inline">White Mode</span>
            </>
          ) : (
            <>
              <Moon size={13} className="text-[#38BDF8]" />
              <span className="hidden sm:inline">Navy Mode</span>
            </>
          )}
        </button>

        {/* Language Toggle Pill */}
        <div className="flex items-center p-0.5 rounded-full bg-[#0A1B39] border border-white/15 shadow-xs">
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-[#1677FF] text-white shadow-xs'
                : 'text-[#AFC4E8] hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('ta')}
            className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
              lang === 'ta'
                ? 'bg-[#F52235] text-white shadow-xs'
                : 'text-[#AFC4E8] hover:text-white'
            }`}
          >
            தமிழ்
          </button>
        </div>

        {/* Officer Profile */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2.5 pl-2 lg:pl-3 border-l border-white/15 text-left cursor-pointer hover:opacity-90"
        >
          <div className="w-8 h-8 rounded-full bg-[#002B67] border-2 border-[#38BDF8] flex items-center justify-center text-white shadow-sm shrink-0">
            <User size={15} />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-extrabold text-white leading-tight">
              {t.common.controlRoom}
            </span>
            <span className="text-[10px] text-[#AFC4E8] font-medium leading-tight">
              {t.common.deptName}
            </span>
          </div>
        </button>
      </div>

      {/* Signature Police Tri-Color (Red, White & Blue) Bottom Ribbon Line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[3.5px] z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, #F52235 0%, #F52235 32%, #FFFFFF 32%, #FFFFFF 68%, #1677FF 68%, #1677FF 100%)',
          boxShadow: '0 0 10px rgba(245, 34, 53, 0.4), 0 0 10px rgba(22, 119, 255, 0.4)'
        }}
      />

      {/* Officer Duty Profile Dialog */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#06152F] [data-theme='white']:bg-white border-2 border-[#1677FF] rounded-xl max-w-sm w-full p-4 shadow-2xl text-white [data-theme='white']:text-slate-900 relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-3 text-[#AFC4E8] [data-theme='white']:text-slate-500 hover:text-white [data-theme='white']:hover:text-black cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-[#132B52] [data-theme='white']:border-slate-200">
              <div className="w-12 h-12 rounded-full bg-[#002B67] border-2 border-[#38BDF8] flex items-center justify-center text-white text-lg font-bold shadow-md">
                KA
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white [data-theme='white']:text-slate-900">
                  Insp. K. Arumugam, PPS
                </h3>
                <span className="text-[11px] text-[#38BDF8] font-bold">
                  Duty Commander • Shift Alpha
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-3 text-xs">
              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 flex justify-between">
                <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600">Badge ID:</span>
                <span className="font-mono font-bold">PY-POL-4412</span>
              </div>
              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 flex justify-between">
                <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600">Jurisdiction:</span>
                <span className="font-bold">Beach Road & White Town</span>
              </div>
              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 flex justify-between">
                <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600">Command Post:</span>
                <span className="font-bold">Puducherry Central ICCC</span>
              </div>
              <div className="p-2 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 flex justify-between">
                <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600">Security Clearance:</span>
                <span className="font-bold text-[#00D68F] flex items-center gap-1">
                  <ShieldCheck size={12} /> Class 1 Operational
                </span>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-[#132B52] [data-theme='white']:border-slate-200 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-1.5 rounded bg-[#1677FF] hover:bg-[#0056cc] text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Status Popover */}
      {showSystemStatus && (
        <div className="absolute top-[78px] right-28 z-50 w-72 bg-[#06152F] [data-theme='white']:bg-white border-2 border-[#1677FF] rounded-xl p-3 shadow-2xl text-white [data-theme='white']:text-slate-900">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#132B52] [data-theme='white']:border-slate-200">
            <span className="text-xs font-black flex items-center gap-1.5 text-[#00D68F]">
              <Activity size={14} /> Telemetry Feeds Active
            </span>
            <button onClick={() => setShowSystemStatus(false)} className="text-[#AFC4E8] hover:text-white cursor-pointer">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-1.5 mt-2 text-xs">
            <div className="flex justify-between p-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100">
              <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600">ICCC Server Uptime:</span>
              <span className="font-bold text-[#00D68F]">99.98%</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100">
              <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600">CCTV Telemetry Feeds:</span>
              <span className="font-bold text-white [data-theme='white']:text-slate-900">4 / 4 Streams</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
