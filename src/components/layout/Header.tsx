'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Search, Bell, User, Clock, Globe } from 'lucide-react';

export function Header() {
  const { lang, setLang, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-subtle-border flex items-center justify-between px-6 shadow-sm flex-shrink-0 z-10">
      
      {/* Left section - Search */}
      <div className="flex items-center flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-main-text/40" />
        </div>
        <input 
          type="text" 
          placeholder={t.dashboard.search}
          className="block w-full pl-10 pr-3 py-2 border border-subtle-border rounded-md leading-5 bg-ivory/30 placeholder-main-text/40 focus:outline-none focus:ring-1 focus:ring-police focus:border-police sm:text-sm transition-colors"
        />
      </div>

      {/* Right section - Controls */}
      <div className="flex items-center gap-6 ml-4">
        
        {/* Time Display */}
        <div className="hidden md:flex items-center text-sm text-main-text/70 gap-2">
          <Clock size={16} />
          <span>
            {currentTime ? currentTime.toLocaleDateString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: 'numeric', month: 'short', year: 'numeric'
            }) : ''}
            {' | '}
            {currentTime ? currentTime.toLocaleTimeString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit', minute: '2-digit'
            }) : ''}
          </span>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center bg-ivory/50 rounded-md p-1 border border-subtle-border">
          <Globe size={14} className="mx-2 text-main-text/50" />
          <button 
            onClick={() => setLang('ta')}
            className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors ${lang === 'ta' ? 'bg-white shadow-sm text-police' : 'text-main-text/60 hover:text-main-text'}`}
          >
            தமிழ்
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors ${lang === 'en' ? 'bg-white shadow-sm text-police' : 'text-main-text/60 hover:text-main-text'}`}
          >
            ENG
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-main-text/70 hover:text-police transition-colors rounded-full hover:bg-ivory">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-urgent border-2 border-white"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-subtle-border">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-main-text">Officer Selvam</span>
            <span className="text-xs text-main-text/60">Traffic Supervisor</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-police flex items-center justify-center text-white cursor-pointer shadow-sm">
            <User size={18} />
          </div>
        </div>
        
      </div>
    </header>
  );
}
